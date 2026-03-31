require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

// Routes
const authRoutes = require("./routes/auth");
const jobRoutes = require("./routes/jobs");
const resumeRoutes = require("./routes/resumes");

// Middleware
const { apiLimiter } = require("./middleware/rateLimit");
const { initLoginLimiter } = require("./middleware/loginLimiter");

const app = express();

// -----------------------------
// 🔧 GLOBAL MIDDLEWARE
// -----------------------------
app.set("trust proxy", 1);

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// Rate limit all API routes
app.use("/api", apiLimiter);

// -----------------------------
// 📦 ROUTES
// -----------------------------
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/resumes", resumeRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("🚀 TalentVision Backend Running");
});

// -----------------------------
// 🗄️ DATABASE CONNECTION
// -----------------------------
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("✅ MongoDB Connected");

  // 🔥 IMPORTANT: Initialize login limiter AFTER DB connect
  initLoginLimiter();

  // -----------------------------
  // 🚀 START SERVER
  // -----------------------------
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
})
.catch((err) => {
  console.error("❌ MongoDB connection error:", err.message);
  process.exit(1);
});