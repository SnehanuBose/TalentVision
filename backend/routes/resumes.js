
const express = require('express');
const multer = require('multer');
const axios = require('axios');
const Resume = require('../models/Resume');
const Job = require('../models/Job');
const { pdfParser } = require('../utils/pdfParser');
const { contactScraper } = require('../utils/contactScraper');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

/* ---------------------------------------
   🔹 SINGLE UPLOAD (OPTIONAL)
--------------------------------------- */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const role = req.body.role;

    if (!role) {
      return res.status(400).json({ error: "Role is required" });
    }

    const text = await pdfParser(req.file.path);
    const contact = contactScraper(text);

    const job = await Job.findOne({
      title: new RegExp('^' + role + '$', 'i')
    });

    if (!job) {
      return res.status(404).json({ error: "No job found" });
    }

    const response = await axios.post(
      "http://127.0.0.1:8000/rank_candidates_for_job",
      {
        job: {
          id: job._id.toString(),
          title: job.title,
          description: job.description,
          skills: job.skills || []
        },
        candidates: [
          {
            id: req.file.originalname,
            resume: text
          }
        ]
      }
    );

    const result = response.data.rankedCandidates[0];

    const resume = new Resume({
      filename: req.file.originalname,
      fileUrl: req.file.path,
      extractedText: text,
      contact,
      role,
      score: result?.score || 0
    });

    await resume.save();

    res.json({
      resume,
      rankedJobs: [{
        finalScore: result.score,
        matchedSkills: result.matchedSkills,
        explanation: result.explanation,
        reason: result.reason
      }]
    });

  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


/* ---------------------------------------
   🔥 BATCH UPLOAD (MAIN FEATURE)
--------------------------------------- */
router.post('/batchUpload', upload.array('files'), async (req, res) => {
  try {
    const role = req.body.role;

    if (!role) {
      return res.status(400).json({ error: "Role is required" });
    }

    const job = await Job.findOne({
      title: new RegExp('^' + role + '$', 'i')
    });

    if (!job) {
      return res.status(404).json({ error: "No job found for role" });
    }

    const resumes = [];

    for (let file of req.files) {
      try {
        console.log("Processing:", file.originalname);

        const text = await pdfParser(file.path);

        const contact = contactScraper(text);

        resumes.push({
          id: file.originalname,
          filename: file.originalname,
          fileUrl: file.path,
          contact,
          extractedText: text
        });

      } catch (err) {
        console.error("Skipping file:", file.originalname, err.message);
      }
    }

    // 🔥 HANDLE NO VALID FILES
    if (resumes.length === 0) {
      return res.json({
        batchResults: [],
        message: "No valid resumes could be processed"
      });
    }

    /* ---------------------------------------
       🔥 CALL ML API
    --------------------------------------- */
    const response = await axios.post(
      "http://127.0.0.1:8000/rank_candidates_for_job",
      {
        job: {
          id: job._id.toString(),
          title: job.title,
          description: job.description,
          skills: job.skills || []
        },
        candidates: resumes.map(r => ({
          id: r.id,
          resume: r.extractedText
        }))
      }
    );

    const mlResults = response.data.rankedCandidates;

    /* ---------------------------------------
       🔥 MAP RESULTS
    --------------------------------------- */
    const results = resumes.map(meta => {
      const match = mlResults.find(r => r.candidateId === meta.id);

      return {
        candidate: {
          filename: meta.filename,
          fileUrl: meta.fileUrl,
          contact: meta.contact
        },
        rankedJobs: match ? [{
          finalScore: match.score,
          matchedSkills: match.matchedSkills,
          explanation: match.explanation,
          reason: match.reason
        }] : []
      };
    });

    /* ---------------------------------------
       🔥 SORT BY SCORE
    --------------------------------------- */
    results.sort((a, b) =>
      (b.rankedJobs[0]?.finalScore || 0) -
      (a.rankedJobs[0]?.finalScore || 0)
    );

    res.json({
      batchResults: results
    });

  } catch (err) {
    console.error("FULL ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
