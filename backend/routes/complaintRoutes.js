const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { 
    createComplaint, 
    getAllComplaints, 
    getComplaintById, 
    updateComplaintStatus,
    submitFeedback // Import the new function
} = require('../controllers/complaintController');
const { protect } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type.'), false);
    }
};

const upload = multer({ storage, fileFilter });

// Existing routes
router.post('/', upload.array('evidenceFiles', 5), createComplaint);
router.get('/', protect, getAllComplaints);
router.get('/:id', getComplaintById);
router.put('/:id', protect, updateComplaintStatus);

// --- New route for submitting feedback ---
// This route uses the original MongoDB _id
router.post('/:id/feedback', submitFeedback);

module.exports = router;