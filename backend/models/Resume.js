const mongoose = require('mongoose');
const ResumeSchema = new mongoose.Schema({
  filename: String,
  fileUrl: String,
  extractedText: String,
  contact: {
    name: String,
    email: String,
    phone: String
  },
  starred: {
  type: Boolean,
  default: false
},
uploadedBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User"
},
  matchedJobs: [
    {
      jobId: mongoose.Schema.Types.ObjectId,
      score: Number
    }
  ],
  role: String,
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Resume', ResumeSchema);
