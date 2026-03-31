  const express = require('express');
  const Job = require('../models/Job');
  const router = express.Router();
  const { rankCandidates } = require("../utils/mlApiService");
const Resume = require("../models/Resume");

  router.post('/create', async (req, res) => {
    const { title, description, skills } = req.body;
    const job = new Job({ title, description, skills });
    await job.save();
    res.json(job);
  });

  router.get('/', async (req, res) => {
    const jobs = await Job.find();
    res.json(jobs);
  });

  router.get("/:jobId/rank-candidates", async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);

    const resumes = await Resume.find();

    const candidates = resumes.map(r => ({
      id: r._id,
      resume: r.parsedText || ""
    }));

    const ranked = await rankCandidates(job, candidates);

    res.json(ranked);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

  module.exports = router;
