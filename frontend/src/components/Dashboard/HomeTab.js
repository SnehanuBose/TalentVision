import React, { useEffect, useState } from "react";
import { getDashboard } from "../../services/recruiterApi";
import ResumeList from "./ResumeList";
import StarredCandidates from "./StarredCandidates";
import JobList from "./JobList";

const HomeTab = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    getDashboard().then((res) => setData(res.data));
  }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <h2>Latest Resumes</h2>
      <ResumeList resumes={data.latestResumes} />

      <h2>Starred Candidates</h2>
      <StarredCandidates candidates={data.starred} />

      <h2>Job Postings</h2>
      <JobList jobs={data.jobs} />
    </div>
  );
};

export default HomeTab;