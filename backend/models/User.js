const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: { type: String, required: true, unique: true },

  password: { type: String, required: true },

  role: {
    type: String,
    enum: ["Candidate", "Recruiter", "Admin"],
    default: "Candidate",
  },

  refreshToken: String,

  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);