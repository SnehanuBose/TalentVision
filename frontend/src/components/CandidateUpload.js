import React, { useState } from "react";
import axios from "axios";
import {
  Box, Typography, Button, List, ListItem, ListItemText,
  ListItemAvatar, Avatar, Card, CardContent, LinearProgress,
  Chip, Divider, Collapse, IconButton
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

function CandidateUpload({ jobRole }) {
  const [analysis, setAnalysis] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [openIndex, setOpenIndex] = useState(null);

  const handleFiles = (e) => {
    setUploading(true);
    const files = Array.from(e.target.files);
    setTimeout(() => {
      const analyzed = files.map((f, index) => ({
        // Instead of file name, mock an extracted candidate name:
        candidateName: `Candidate ${index + 1} Name`,
        size: f.size,
        fitScore: Math.floor(Math.random() * 30) + 70,
        extracted: {
          Name: `Candidate ${index + 1} Name`,
          Email: `candidate${index + 1}@email.com`,
          "Phone Number": "+1 555-010" + (index + 1),
          "Address": "123 Main St, Anytown",
          "LinkedIn": `linkedin.com/in/candidate${index + 1}`
        },
        skills: ['Python', 'Machine Learning', 'React', 'Node.js'].slice(0, Math.floor(Math.random() * 3) + 2)
      }));
      setAnalysis(analyzed);
      setUploading(false);
    }, 1500);
  };

  const getScoreColor = (score) => {
    if (score >= 90) return '#4caf50';
    if (score >= 80) return '#ff9800';
    return '#f44336';
  };

  return (
    <Card elevation={2} sx={{ mt: 4 }}>
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
            Upload & Analyze Candidates for "{jobRole}"
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Upload multiple candidate resumes and analyze fit. Click dropdown for extracted contact info.
          </Typography>
        </Box>
        <Box sx={{
          border: '2px dashed #ddd', borderRadius: 2, p: 4, textAlign: 'center', mb: 3,
          background: '#fafafa', '&:hover': { borderColor: '#242582', backgroundColor: '#f8f9ff' }
        }}>
          <input
            accept=".pdf,.doc,.docx"
            style={{ display: 'none' }}
            id="file-upload"
            multiple
            type="file"
            onChange={handleFiles}
            disabled={uploading}
          />
          <label htmlFor="file-upload">
            <CloudUploadIcon sx={{ fontSize: 48, color: '#242582', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              {uploading ? 'Analyzing Files...' : 'Drop files here or click to upload'}
            </Typography>
            <Button
              variant="contained"
              component="span"
              disabled={uploading}
              sx={{ background: 'linear-gradient(135deg, #242582 0%, #553c9a 100%)', fontWeight: 600 }}
            >
              {uploading ? 'Processing...' : 'Select Files'}
            </Button>
          </label>
        </Box>

        {uploading && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Analyzing candidates with AI...
            </Typography>
            <LinearProgress />
          </Box>
        )}

        {analysis.length > 0 && (
          <List sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
            {analysis.sort((a, b) => b.fitScore - a.fitScore).map((candidate, idx) =>
              <React.Fragment key={idx}>
                <ListItem
                  sx={{
                    py: 2, alignItems: 'flex-start',
                    '&:hover': { backgroundColor: '#f8f9ff' }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{
                      background: getScoreColor(candidate.fitScore),
                      fontWeight: 700
                    }}>{idx + 1}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {candidate.candidateName}
                        </Typography>
                        <Chip
                          label={`${candidate.fitScore}% Fit`}
                          size="small"
                          sx={{
                            backgroundColor: getScoreColor(candidate.fitScore),
                            color: 'white',
                            fontWeight: 600
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                        >
                          {openIndex === idx ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <LinearProgress
                          variant="determinate"
                          value={candidate.fitScore}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: '#f5f5f5',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: getScoreColor(candidate.fitScore)
                            }
                          }}
                        />
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                          {candidate.skills.map((skill, skillIndex) =>
                            <Chip key={skillIndex} label={skill} size="small" variant="outlined" color="primary" />
                          )}
                        </Box>
                        <Collapse in={openIndex === idx}>
                          <Box sx={{ mt: 2, p: 2, bgcolor: "#f1f2f8", borderRadius: 2 }}>
                            <Typography variant="subtitle2">Extracted Info:</Typography>
                            {Object.entries(candidate.extracted).map(([key, value]) =>
                              <Typography key={key} variant="body2"><b>{key}:</b> {value}</Typography>
                            )}
                          </Box>
                        </Collapse>
                      </Box>
                    }
                  />
                </ListItem>
                {idx < analysis.length - 1 && <Divider />}
              </React.Fragment>
            )}
          </List>
        )}
      </CardContent>
    </Card>
  );
}

export default CandidateUpload;
