import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Avatar,
  Chip
} from "@mui/material";
import HomeIcon from '@mui/icons-material/Home';
import WorkIcon from "@mui/icons-material/Work";
import BusinessIcon from "@mui/icons-material/Business";
import PersonIcon from "@mui/icons-material/Person";
import PostJobForm from "./components/PostJobForm";
import JobPostings from "./components/JobPostings";
import CandidateUpload from "./components/CandidateUpload";

const initialJobs = [
  {
    id: 1,
    title: "Senior AI Engineer",
    matches: 54,
    department: "Engineering",
    posted: "3 days ago",
    status: "Active",
    description: ""
  },
  {
    id: 2,
    title: "Lead DevOps Specialist",
    matches: 32,
    department: "Operations",
    posted: "1 week ago",
    status: "Active",
    description: ""
  },
];

function App() {
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/jobs');
        setJobs(response.data.map(job => ({
          id: job._id,
          title: job.title,
          matches: 0, // Calculate or fetch matches if available
          department: "Engineering", // Default or from job data
          posted: "recently", // Format date if available
          status: "Active",
          description: job.description
        })));
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
    };
    fetchJobs();
  }, []);

  const handleAddJob = (job) => {
    setJobs([job, ...jobs]);
    setActiveSection("home");
    setSelectedJob(job.title);
  };

  return (
    <Box bgcolor="background.default" minHeight="100vh">
      <AppBar position="static" elevation={0} sx={{ 
        background: 'linear-gradient(135deg, #242582 0%, #553c9a 100%)',
        backdropFilter: 'blur(10px)'
      }}>
        <Toolbar sx={{ py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
            <Avatar 
              src="/logo.png" 
              alt="Logo" 
              sx={{ width: 40, height: 40, mr: 2, background: 'white' }} 
            />
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
              TalentHub
            </Typography>
          </Box>
          
          <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
            <Button 
              color="inherit" 
              startIcon={<HomeIcon />}
              sx={{ 
                background: activeSection === "home" ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.1)',
                borderRadius: 2
              }}
              onClick={() => { setActiveSection("home"); setSelectedJob(null); }}
            >
              Home
            </Button>
            <Button 
              color="inherit" 
              startIcon={<WorkIcon />}
              sx={{
                background: activeSection === "postjob" ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.1)',
                borderRadius: 2
              }}
              onClick={() => { setActiveSection("postjob"); setSelectedJob(null); }}
            >
              Post a Job
            </Button>
            <Button color="inherit" startIcon={<BusinessIcon />}>
              Company Profile
            </Button>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip 
              icon={<PersonIcon />} 
              label="Sarah Johnson" 
              variant="outlined" 
              sx={{ 
                color: 'white', 
                borderColor: 'rgba(255,255,255,0.3)',
                '& .MuiChip-icon': { color: 'white' }
              }} 
            />
          </Box>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {activeSection === "home" && (
          <>
            <Box sx={{ mb: 4 }}>
              <Typography 
                variant="h4" 
                gutterBottom 
                sx={{ 
                  background: 'linear-gradient(135deg, #242582 0%, #553c9a 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 800,
                  mb: 1
                }}
              >
                Home
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                Your Active Job Postings
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Manage and review your current job openings and analyze candidates.
              </Typography>
            </Box>
            <JobPostings 
              jobs={jobs} 
              onUploadResume={setSelectedJob}
              selectedJob={selectedJob} />

            {selectedJob && (
              <Box sx={{ mt: 6 }}>
                <CandidateUpload jobRole={selectedJob} />
              </Box>
            )}
          </>
        )}

        {activeSection === "postjob" && (
          <PostJobForm onAddJob={handleAddJob} />
        )}
      </Container>
    </Box>
  );
}

export default App;
