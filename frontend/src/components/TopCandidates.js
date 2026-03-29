import React from "react";
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Button,
  Box,
  Avatar,
  Chip,
  LinearProgress,
  Divider
} from "@mui/material";
import { 
  Visibility as VisibilityIcon,
  Star as StarIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon
} from "@mui/icons-material";

const candidates = [
  { 
    name: "Jane Doe", 
    score: 97, 
    summary: "8 Years in ML. Projects include graph neural networks.",
    location: "San Francisco, CA",
    experience: "8 years",
    avatar: "/api/placeholder/40/40"
  },
  { 
    name: "John Smith", 
    score: 94, 
    summary: "Skills: all-MiniLM-L6-v2, Vector Databases, FAISS.",
    location: "New York, NY",
    experience: "6 years",
    avatar: "/api/placeholder/40/40"
  },
  { 
    name: "Emily Jones", 
    score: 91, 
    summary: "Led a team developing a semantic search engine.",
    location: "Austin, TX",
    experience: "7 years",
    avatar: "/api/placeholder/40/40"
  }
];

function TopCandidates({ job }) {
  const getScoreColor = (score) => {
    if (score >= 95) return '#4caf50';
    if (score >= 90) return '#ff9800';
    return '#2196f3';
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h5" 
          fontWeight={700} 
          sx={{ 
            background: 'linear-gradient(135deg, #242582 0%, #553c9a 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}
        >
          Top Candidates for "{job}"
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Showing the re-ranked and scored list of the top 50 candidates.
        </Typography>
        <Divider />
      </Box>
      
      <Grid container spacing={3}>
        {candidates.map((candidate, idx) => (
          <Grid item xs={12} md={4} key={idx}>
            <Card 
              elevation={4} 
              sx={{ 
                position: 'relative',
                borderTop: `4px solid ${getScoreColor(candidate.score)}`,
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  background: getScoreColor(candidate.score),
                  color: 'white',
                  borderRadius: '50%',
                  width: 24,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}
              >
                {idx + 1}
              </Box>
              
              <CardContent sx={{ flexGrow: 1, pt: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    src={candidate.avatar}
                    sx={{ 
                      width: 48, 
                      height: 48, 
                      mr: 2,
                      background: 'linear-gradient(135deg, #242582 0%, #553c9a 100%)'
                    }}
                  >
                    {candidate.name.split(' ').map(n => n[0]).join('')}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {candidate.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <StarIcon sx={{ color: getScoreColor(candidate.score), fontSize: 16 }} />
                      <Typography 
                        variant="body2" 
                        fontWeight={600}
                        sx={{ color: getScoreColor(candidate.score) }}
                      >
                        {candidate.score}% Match
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={candidate.score} 
                    sx={{ 
                      height: 6, 
                      borderRadius: 3,
                      backgroundColor: '#f5f5f5',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getScoreColor(candidate.score)
                      }
                    }} 
                  />
                </Box>
                
                <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6 }}>
                  {candidate.summary}
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationIcon fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      {candidate.location}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <WorkIcon fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      {candidate.experience} experience
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
              
              <Box sx={{ p: 2, pt: 0 }}>
                <Button 
                  variant="outlined" 
                  fullWidth
                  startIcon={<VisibilityIcon />}
                  sx={{ 
                    fontWeight: 600,
                    borderColor: getScoreColor(candidate.score),
                    color: getScoreColor(candidate.score),
                    '&:hover': {
                      backgroundColor: `${getScoreColor(candidate.score)}10`,
                      borderColor: getScoreColor(candidate.score)
                    }
                  }}
                >
                  View Profile
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default TopCandidates;
