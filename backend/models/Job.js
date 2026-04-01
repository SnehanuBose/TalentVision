const mongoose = require('mongoose');
const JobSchema = new mongoose.Schema({
  title: String,
  description: String,
  skills: [String],
  createdAt: { type: Date, default: Date.now },
  applicants: [
  {
    resume: { type: mongoose.Schema.Types.ObjectId, ref: "Resume" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  }
],
createdBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User"
}
});
module.exports = mongoose.model('Job', JobSchema);
