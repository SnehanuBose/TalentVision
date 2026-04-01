import { useNavigate } from "react-router-dom";

const JobList = ({ jobs }) => {
  const navigate = useNavigate();

  return (
    <div>
      {jobs.map((job) => (
        <div
          key={job._id}
          onClick={() => navigate(`/job/${job._id}`)}
          style={{ cursor: "pointer", border: "1px solid white", margin: 10 }}
        >
          <h3>{job.title}</h3>
        </div>
      ))}
    </div>
  );
};

export default JobList;