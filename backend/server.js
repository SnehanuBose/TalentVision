require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');

const resumesRoutes = require('./routes/resumes');
const jobsRoutes = require('./routes/jobs');

const app = express();
app.use(express.json());
app.use(morgan('dev'));

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=>console.log('MongoDB Connected'))
  .catch(err=>console.error(err));

app.use('/api/resumes', resumesRoutes);
app.use('/api/jobs', jobsRoutes);

app.get('/', (req, res) => res.send("Resume Matcher API running!"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
