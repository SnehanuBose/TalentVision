  const express = require('express');
  const Job = require('../models/Job');
  const router = express.Router();

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

  module.exports = router;
