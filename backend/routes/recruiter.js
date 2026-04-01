const express = require("express");
const router = express.Router();
const Resume = require("../models/Resume");
const Job = require("../models/Job");
const  auth  = require("../middleware/auth");

// Get Dashboard Data
router.get("/dashboard", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const latestResumes = await Resume.find({ uploadedBy: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    const starred = await Resume.find({
      uploadedBy: userId,
      starred: true,
    });

    const jobs = await Job.find({ createdBy: userId });

    res.json({ latestResumes, starred, jobs });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Get applicants for job
router.get("/job/:id/applicants", auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate("applicants.resume")
      .populate("applicants.user");

    res.json(job.applicants);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching applicants" });
  }
});

module.exports = router;