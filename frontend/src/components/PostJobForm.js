import React, { useState } from "react";
import axios from "axios";
import { Box, TextField, Button, Typography, MenuItem, Paper } from "@mui/material";

const departments = [
  "Engineering", "Operations", "Product", "Sales", "Marketing"
];

function PostJobForm({ onAddJob }) {
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState(departments[0]);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:4000/api/jobs/create', {
        title,
        description,
        skills: [] // Add skills if needed, for now empty
      });
      onAddJob({
        id: response.data._id,
        title: response.data.title,
        matches: 0,
        department,
        posted: "just now",
        status: "Active",
        description: response.data.description
      });
      setTitle("");
      setDepartment(departments[0]);
      setDescription("");
    } catch (error) {
      console.error('Error posting job:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" fontWeight={700} gutterBottom>
        Post a New Job
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
      >
        <TextField
          label="Job Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          fullWidth
        />
        <TextField
          label="Department"
          select
          value={department}
          onChange={e => setDepartment(e.target.value)}
          required
          fullWidth
        >
          {departments.map((dept, idx) => (
            <MenuItem key={idx} value={dept}>{dept}</MenuItem>
          ))}
        </TextField>
        <TextField
          label="Job Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
          multiline
          minRows={3}
          fullWidth
        />
        <Button
          type="submit"
          variant="contained"
          sx={{ mt: 2, width: "fit-content", px: 4 }}
          disabled={loading}
        >
          {loading ? "Posting..." : "Post Job"}
        </Button>
      </Box>
    </Paper>
  );
}

export default PostJobForm;
