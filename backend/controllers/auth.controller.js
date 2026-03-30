const bcrypt = require("bcryptjs");
const User = require("../models/User");
const loginLimiter = require("../middleware/loginLimiter");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/token");

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ msg: "User exists" });

  const hashed = await bcrypt.hash(password, 10);

  await User.create({ name, email, password: hashed, role });

  res.json({ msg: "Registered successfully" });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const key = `${email}_${req.ip}`;

  try {
    await loginLimiter.consume(key);

    const user = await User.findOne({ email });
    if (!user) throw new Error();

    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(423).json({ msg: "Account locked" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      user.loginAttempts += 1;

      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 15 * 60 * 1000;
      }

      await user.save();
      throw new Error();
    }

    user.loginAttempts = 0;
    user.lockUntil = null;

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    await loginLimiter.delete(key);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "Strict",
      secure: false,
    });

    res.json({ accessToken, role: user.role });

  } catch (err) {
    return res.status(429).json({
      msg: "Too many attempts or invalid credentials",
    });
  }
};

exports.refresh = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.sendStatus(401);

  const jwt = require("jsonwebtoken");
  const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

  const user = await User.findById(decoded.id);
  if (!user || user.refreshToken !== token)
    return res.sendStatus(403);

  const accessToken = generateAccessToken(user);
  res.json({ accessToken });
};

exports.logout = async (req, res) => {
  const token = req.cookies.refreshToken;

  const user = await User.findOne({ refreshToken: token });
  if (user) {
    user.refreshToken = null;
    await user.save();
  }

  res.clearCookie("refreshToken");
  res.json({ msg: "Logged out" });
};