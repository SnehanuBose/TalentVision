
const axios = require('axios');

async function matchResumeWithJobs(resumeText, jobs, role) {
  try {
    if (!jobs || jobs.length === 0) return [];

    const job = jobs[0]; // since you pass one job

    const payload = {
      job: {
        id: job._id?.toString() || job.id,
        title: job.title,
        description: job.description,
        skills: job.skills || []
      },
      candidates: [
        {
          id: "resume-1",
          resume: resumeText
        }
      ]
    };

    const response = await axios.post(
      "http://127.0.0.1:8000/rank_candidates_for_job",
      payload
    );

    // Convert ML response → your expected format
    const ranked = response.data.rankedCandidates;

    return ranked.map(r => ({
      jobId: job._id,
      finalScore: r.score,
      matchedSkills: r.matchedSkills,
      reason: r.reason,
      strengths: r.strengths,
      weaknesses: r.weaknesses
    }));

  } catch (err) {
    console.error("ML API error:", err.message);
    return [];
  }
}

module.exports = { matchResumeWithJobs };
