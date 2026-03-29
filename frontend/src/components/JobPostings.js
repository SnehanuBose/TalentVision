import React from "react";
import { 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Typography, 
  Grid, 
  Box, 
  Chip
} from "@mui/material";

function JobPostings({ jobs, onUploadResume, selectedJob }) {
  return (
    <Grid container spacing={3}>
      {jobs.map(job => (
        <Grid item xs={12} md={6} key={job.id}>
          <Card 
            elevation={selectedJob === job.title ? 8 : 2}
            sx={{ position: 'relative', overflow: 'visible', border: selectedJob === job.title ? '2px solid #242582' : 'none' }}
          >
            {selectedJob === job.title && (
              <Box
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: 16,
                  background: 'linear-gradient(135deg, #242582 0%, #553c9a 100%)',
                  color: 'white',
                  px: 2,
                  py: 0.5,
                  borderRadius: 2,
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}
              >
                Selected
              </Box>
            )}

            <CardContent sx={{ pb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h6" fontWeight={700} sx={{ flex: 1 }}>
                  {job.title}
                </Typography>
                <Chip 
                  label={job.status}
                  color="success"
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Box>
              {/* Removed matches and progress bar */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                <Chip 
                  label={job.department}
                  variant="outlined"
                  size="small"
                  color="primary"
                />
                <Typography variant="caption" color="text.secondary">
                  Posted {job.posted}
                </Typography>
              </Box>
            </CardContent>

            <CardActions sx={{ px: 2, pb: 2 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => onUploadResume(job.title)}
                sx={{ background: 'linear-gradient(135deg, #242582 0%, #553c9a 100%)', fontWeight: 600, py: 1.5 }}
              >
                Upload Resume
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export default JobPostings;
