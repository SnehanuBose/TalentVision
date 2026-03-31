import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Avatar,
  Chip,
} from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import BusinessIcon from "@mui/icons-material/Business";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";

import "./App.css";
import PostJobForm from "./components/PostJobForm";
import JobPostings from "./components/JobPostings";
import CandidateUpload from "./components/CandidateUpload";
import Login from "./pages/Login";
import Register from "./pages/Register";

function Dashboard({ onLogout }) {
  return (
    <div className="App">
      <AppBar position="static" color="primary" elevation={2}>
        <Toolbar>
          <Avatar sx={{ bgcolor: "secondary.main", mr: 2 }}>
            <BusinessIcon />
          </Avatar>
          <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 700 }}>
            TalentVision Recruiter Dashboard
          </Typography>
          <Chip
            icon={<PersonIcon />}
            label="Recruiter"
            color="secondary"
            sx={{ mr: 2, fontWeight: 600 }}
          />
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={onLogout}
            sx={{ fontWeight: 600 }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" color="primary" gutterBottom sx={{ fontWeight: 700 }}>
            Welcome to TalentVision
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            AI-powered recruitment and candidate matching platform.
          </Typography>
        </Box>

        <Box sx={{ display: "grid", gap: 4 }}>
          <PostJobForm />
          <JobPostings />
          <CandidateUpload />
        </Box>
      </Container>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />

        <Route
          path="/register"
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <Register />
          }
        />

        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Dashboard onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;