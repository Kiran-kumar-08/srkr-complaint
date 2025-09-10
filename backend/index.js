require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const complaintRoutes = require('./routes/complaintRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// --- Start: Final CORS Configuration ---
// This list includes every possible Vercel URL for your project.
const allowedOrigins = [
  'https://srkr-complaint.vercel.app',
  'https://srkr-complaint-git-main-kirans-projects-8f6d027e9.vercel.app',
  'https://srkr-complaint-2jeyte0o5-kirans-projects-8f6d027e9.vercel.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    // The 'origin' is the URL of the device making the request.
    // We check if that origin is in our trusted list.
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
// --- End: Final CORS Configuration ---


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