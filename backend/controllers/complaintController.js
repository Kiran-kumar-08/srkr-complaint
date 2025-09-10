const Complaint = require('../models/Complaint');
const Admin = require('../models/Admin'); // Import the Admin model
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.createComplaint = async (req, res) => {
    try {
        const { title, description, category } = req.body;
        const newComplaint = new Complaint({
            title, description, category,
            filePaths: req.files ? req.files.map(file => file.path) : []
        });
        const savedComplaint = await newComplaint.save();
        
        // --- Start of Updated Email Logic ---
        // 1. Fetch all admin emails from the database
        const allAdmins = await Admin.find({}, 'email'); // Get only the email field
        const recipientEmails = allAdmins.map(admin => admin.email);

        if (recipientEmails.length > 0) {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: recipientEmails.join(', '), // Send to a comma-separated list of emails
                subject: `New Complaint Submitted: ${savedComplaint.title}`,
                html: `
                    <h1>New Complaint Received</h1>
                    <p>A new complaint has been submitted through the portal.</p>
                    <ul>
                        <li><strong>Complaint ID:</strong> ${savedComplaint._id}</li>
                        <li><strong>Title:</strong> ${savedComplaint.title}</li>
                        <li><strong>Category:</strong> ${savedComplaint.category}</li>
                        <li><strong>Description:</strong> ${savedComplaint.description}</li>
                    </ul>
                `,
                attachments: req.files ? req.files.map(file => ({ path: file.path })) : []
            };

            try {
                await transporter.sendMail(mailOptions);
                console.log(`✅ Notification email sent to: ${recipientEmails.join(', ')}`);
            } catch (emailError) {
                console.error('❌ Error sending notification email:', emailError);
            }
        }
        // --- End of Updated Email Logic ---
        
        res.status(201).json({ 
            message: 'Complaint submitted successfully!', 
            complaintId: savedComplaint._id 
        });

    } catch (error) {
        res.status(500).json({ message: 'Error submitting complaint', error: error.message });
    }
};

exports.submitFeedback = async (req, res) => {
    try {
        const { feedback, rating } = req.body;
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        complaint.feedback = feedback;
        complaint.rating = rating;
        await complaint.save();

        // Also send feedback emails to all admins
        const allAdmins = await Admin.find({}, 'email');
        const recipientEmails = allAdmins.map(admin => admin.email);

        if (recipientEmails.length > 0) {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: recipientEmails.join(', '),
                subject: `Feedback Received for Complaint: ${complaint.title}`,
                html: `
                    <h1>Feedback Received</h1>
                    <p>Feedback has been submitted for a resolved complaint.</p>
                    <ul>
                        <li><strong>Complaint ID:</strong> ${complaint._id}</li>
                        <li><strong>Title:</strong> ${complaint.title}</li>
                        <li><strong>Rating:</strong> ${rating}/5</li>
                    </ul>
                    <hr>
                    <p><strong>Feedback:</strong></p>
                    <p><em>"${feedback}"</em></p>
                `
            };
            await transporter.sendMail(mailOptions);
        }

        res.status(200).json({ message: 'Thank you for your feedback!' });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting feedback', error: error.message });
    }
};

exports.getComplaintById = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);
        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
        res.status(200).json(complaint);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching complaint' });
    }
};

exports.getAllComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find().sort({ createdAt: -1 });
        res.status(200).json(complaints);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching complaints' });
    }
};

exports.updateComplaintStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const updatedComplaint = await Complaint.findByIdAndUpdate(
            req.params.id, { status }, { new: true }
        );
        if (!updatedComplaint) return res.status(404).json({ message: 'Complaint not found' });
        res.status(200).json(updatedComplaint);
    } catch (error) {
        res.status(500).json({ message: 'Error updating status' });
    }
};