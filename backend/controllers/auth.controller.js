const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/token");

const { getLoginLimiter } = require("../middleware/loginLimiter");

// -----------------------------
// 📝 REGISTER
// -----------------------------
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashed,
      role,
    });

    return res.json({ msg: "Registered successfully" });

  } catch (err) {
    console.error("Register Error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
};

// -----------------------------
// 🔐 LOGIN
// -----------------------------
exports.login = async (req, res) => {
  const loginLimiter = getLoginLimiter();

  // Limiter not ready
  if (!loginLimiter) {
    return res.status(503).json({
      msg: "Server initializing, try again shortly",
    });
  }

  const { email, password } = req.body;
  const key = `${email}_${req.ip}`;

  // 🔥 Rate limit check
  try {
    await loginLimiter.consume(key);
  } catch (err) {
    return res.status(429).json({
      msg: "Too many login attempts. Try again later.",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid email or password" });
    }

    // Account lock check
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(423).json({
        msg: "Account temporarily locked. Try later.",
      });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      user.loginAttempts += 1;

      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 15 * 60 * 1000;
      }

      await user.save();

      return res.status(400).json({
        msg: "Invalid email or password",
      });
    }

    // ✅ SUCCESS
    user.loginAttempts = 0;
    user.lockUntil = null;

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    // Reset limiter on success
    await loginLimiter.delete(key);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "Strict",
      secure: false,
    });

    return res.json({
      accessToken,
      role: user.role,
    });

  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
};

// -----------------------------
// 🔁 REFRESH TOKEN
// -----------------------------
exports.refresh = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.sendStatus(401);

    const decoded = jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== token) {
      return res.sendStatus(403);
    }

    const accessToken = generateAccessToken(user);
    return res.json({ accessToken });

  } catch (err) {
    console.error("Refresh Error:", err);
    return res.sendStatus(403);
  }
};

// -----------------------------
// 🚪 LOGOUT
// -----------------------------
exports.logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) return res.sendStatus(204);

    const user = await User.findOne({ refreshToken: token });

    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    res.clearCookie("refreshToken");

    return res.json({ msg: "Logged out" });

  } catch (err) {
    console.error("Logout Error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
};