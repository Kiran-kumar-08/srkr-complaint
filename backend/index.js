require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const complaintRoutes = require('./routes/complaintRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// --- Start: Corrected CORS Configuration ---
// This list includes all possible frontend URLs that are allowed to access your backend.
const allowedOrigins = [
  'https://srkr-complaint.vercel.app',
  'https://srkr-complaint-git-main-kirans-projects-8f6d027e9.vercel.app',
  'https://srkr-complaint-2jeyte0o5-kirans-projects-8f6d027e9.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests that don't have an origin (like mobile apps or direct API calls)
    if (!origin) return callback(null, true);
    
    // Check if the incoming origin is in our list of allowed sites
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// --- End: Corrected CORS Configuration ---


app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/complaints', complaintRoutes);
app.use('/api/auth', authRoutes);

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB connected successfully');
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    })
    .catch(err => console.error('❌ MongoDB connection error:', err));