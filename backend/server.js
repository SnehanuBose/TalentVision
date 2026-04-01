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
const recruiterRoutes = require("./routes/recruiter");
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

// Apply API rate limiting
app.use("/api", apiLimiter);

// -----------------------------
// 📦 ROUTES
// -----------------------------
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/recruiter", recruiterRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("🚀 TalentVision Backend Running");
});

// -----------------------------
// 🗄️ DATABASE CONNECTION
// -----------------------------
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");

    // 🔥 Initialize limiter AFTER DB connection
    initLoginLimiter();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Error:", err.message);
    process.exit(1);
  });