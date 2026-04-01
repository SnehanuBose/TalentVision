import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getApplicants } from "../services/recruiterApi";

const JobApplicants = () => {
  const { id } = useParams();
  const [apps, setApps] = useState([]);

  useEffect(() => {
    getApplicants(id).then((res) => setApps(res.data));
  }, [id]);

  return (
    <div>
      <h2>Applicants</h2>
      {apps.map((a, i) => (
        <div key={i}>
          <p>{a.user?.name}</p>
          <a href={a.resume?.fileUrl} target="_blank">View Resume</a>
        </div>
      ))}
    </div>
  );
};

export default JobApplicants;