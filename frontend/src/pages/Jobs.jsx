
import { useEffect, useState } from "react";
import api from "../utils/api";
import { Grid, Button } from "@mui/material";
import Navbar from "../components/Navbar";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    api.get("/jobs").then(res => setJobs(res.data));
  }, []);

  return (
    <>
      <Navbar />

      <div style={{
        minHeight: "100vh",
        background: "#020617",
        padding: "40px"
      }}>
        <h1 style={{ color: "white", marginBottom: 30 }}>
          Available Jobs
        </h1>

        <Grid container spacing={3}>
          {jobs.map(job => (
            <Grid item xs={12} md={4} key={job._id}>
              <div style={{
                background: "rgba(30,41,59,0.7)",
                backdropFilter: "blur(10px)",
                padding: 20,
                borderRadius: 16,
                color: "white",
                transition: "0.3s",
                cursor: "pointer"
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
              >
                <h3>{job.title}</h3>
                <p style={{ opacity: 0.7 }}>{job.description}</p>

                <Button
                  fullWidth
                  variant="contained"
                  sx={{
                    mt: 2,
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)"
                  }}
                  onClick={() => {
                    localStorage.setItem("selectedRole", job.title);
                    window.location.href = "/upload";
                  }}
                >
                  Upload Resume
                </Button>
              </div>
            </Grid>
          ))}
        </Grid>
      </div>
    </>
  );
}
