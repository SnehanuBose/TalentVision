const express = require('express');
const multer = require('multer');
const axios = require('axios');
const Resume = require('../models/Resume');
const Job = require('../models/Job');
const { pdfParser } = require('../utils/pdfParser');
const { contactScraper } = require('../utils/contactScraper');
const { matchResumeWithJobs } = require('../utils/mlApiService');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });



router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    // Parse PDF and extract text
    const text = await pdfParser(req.file.path);

    //get the role
    const role = req.body.role;

    // Scrape info
    const contact = contactScraper(text);

    const job = await Job.findOne({ title: new RegExp('^' + role + '$', 'i') }).lean();
    if (!job) {
        return res.status(404).json({ error: 'No job found for role: ' + role });
    }

    // Map to strict ML API schema
    const mlJob = {
      id: job._id?.toString() || job.id,
      title: job.title,
      description: job.description,
      skills: job.skills
    };

    // Call ML service to get ranked jobs; pass array of jobs
    const matchedJobs = await matchResumeWithJobs(text, [mlJob], role);

    // Save resume in DB
    const resume = new Resume({
      filename: req.file.originalname,
      fileUrl: req.file.path,
      extractedText: text,
      contact,
      matchedJobs,
      role
    });
    await resume.save();

    res.json({ resume, rankedJobs: matchedJobs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post('/batchUpload', upload.array('files'), async (req, res) => {
    try {
        const role = req.body.role;
        if (!role) return res.status(400).json({ error: "Role is required" });

        // Fetch job from the DB where title or role matches input (case-insensitive)
        const job = await Job.findOne({ title: new RegExp('^' + role + '$', 'i') });
        
        if (!job) {
            return res.status(404).json({ error: 'No job found for role: ' + role });
        }

        const files = req.files;
        const { pdfParser } = require('../utils/pdfParser');
        const { contactScraper } = require('../utils/contactScraper');
        const resumes = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileUrl = file.path;
            const filename = file.originalname;
            const text = await pdfParser(file.path);
            const contact = contactScraper(text);

            resumes.push({ id: filename, filename, fileUrl, contact, extractedText: text });
        }

        // Use found job
        const mlJob = {
          id: job._id?.toString() || job.id,
          title: job.title,
          description: job.description,
          skills: job.skills
        };

        const mlPayload = {
          resumes: resumes.map(r => ({ id: r.id, text: r.extractedText })),
          jobs: [mlJob]
        };
        const axios = require('axios');
        const response = await axios.post('http://127.0.0.1:5000/batch_match', mlPayload);

        // Match results to full candidate details
        const mlResults = response.data.batchResults;
        let results = [];
        for (let i = 0; i < resumes.length; i++) {
            const meta = resumes[i];
            const resultObj = mlResults.find(r => r.resumeId === meta.id);
            results.push({
                candidate: {
                    filename: meta.filename,
                    fileUrl: meta.fileUrl,
                    contact: meta.contact
                },
                rankedJobs: resultObj ? resultObj.results : []
            });
        }
        // Sort by best match
        results.sort((a, b) => (b.rankedJobs[0]?.finalScore || 0) - (a.rankedJobs[0]?.finalScore || 0));
        res.json({ batchResults: results });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
