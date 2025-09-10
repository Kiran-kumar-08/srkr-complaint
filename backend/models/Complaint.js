const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Sanitation', 'Infrastructure', 'Ragging / Bullying', 'Security', 'Faculty', 'Other'],
    required: true
  },
  status: {
    type: String,
    enum: ['Submitted', 'In Progress', 'Resolved', 'Rejected'],
    default: 'Submitted'
  },
  filePaths: {
    type: [String]
  },
  // --- New fields for feedback ---
  feedback: {
    type: String,
    trim: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  }
}, {
  timestamps: true
});

const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint;