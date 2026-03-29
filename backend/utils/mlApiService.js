const axios = require('axios');

async function matchResumeWithJobs(resumeText, jobs,role) {
  try {
    // The ML API expects { resume: resumeText, jobs: jobsArray }
    const payload = {
      resume: resumeText,
      role: role,
      jobs: jobs.map(job => ({
        id: job._id,
        title: job.title,
        description: job.description,
        skills: job.skills
      }))
    };
    const response = await axios.post('http://127.0.0.1:5000/match_resume_jobs', payload);
    // Example response format from ML API:
    // { rankedJobs: [{ jobId, score, matchedSkills }] }
    return response.data.rankedJobs;
  } catch (err) {
    console.error("ML API error:", err.message);
    return [];
  }
}

module.exports = { matchResumeWithJobs };
