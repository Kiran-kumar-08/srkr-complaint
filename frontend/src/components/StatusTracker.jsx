import React, { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import api from '../api'; // Import the custom api instance

const FeedbackForm = ({ complaintId, onFeedbackSubmitted }) => {
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0 || !feedback) return alert('Please provide a rating and feedback.');
        try {
            // Use the 'api' instance here
            const response = await api.post(`/complaints/${complaintId}/feedback`, { rating, feedback });
            setMessage(response.data.message);
            onFeedbackSubmitted();
        } catch (error) {
            alert('Failed to submit feedback.');
        }
    };

    if (message) return <p className="text-center text-green-600 p-4 bg-green-50 rounded-lg">{message}</p>;
    
    return (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 p-4 border rounded-lg bg-gray-50">
            <h4 className="font-semibold text-center">How was your experience?</h4>
            <div className="flex justify-center gap-2">
                {[...Array(5)].map((_, index) => (
                    <FaStar
                        key={index + 1}
                        className="cursor-pointer"
                        color={(index + 1) <= rating ? "#ffc107" : "#e4e5e9"}
                        size={30}
                        onClick={() => setRating(index + 1)}
                    />
                ))}
            </div>
            <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your feedback..."
                className="w-full p-2 border rounded-md"
                rows="3"
                required
            />
            <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg">Submit Feedback</button>
        </form>
    );
};

function StatusTracker() {
    const [complaintId, setComplaintId] = useState('');
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [recentComplaints, setRecentComplaints] = useState([]);

    useEffect(() => {
        setRecentComplaints(JSON.parse(localStorage.getItem('recentComplaints')) || []);
    }, []);

    const handleTrack = async (idToTrack = complaintId) => {
        if (!idToTrack) return setError('Please enter a Complaint ID.');
        setLoading(true);
        setError('');
        setComplaint(null);
        try {
            // Use the 'api' instance here
            const response = await api.get(`/complaints/${idToTrack}`);
            setComplaint(response.data);
        } catch (err) {
            setError('Complaint not found.');
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        handleTrack();
    };

    const getStatusColor = (status) => (status === 'Resolved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800');

    return (
        <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center">Track Your Complaint</h2>
            <form onSubmit={handleFormSubmit} className="flex flex-col sm:flex-row gap-2 mb-6">
                <input
                    type="text"
                    value={complaintId}
                    onChange={(e) => setComplaintId(e.target.value)}
                    placeholder="Enter Complaint ID"
                    className="flex-grow px-3 py-2 border rounded-lg"
                />
                <button type="submit" className="bg-indigo-600 text-white py-2 px-6 rounded-lg" disabled={loading}>
                    {loading ? 'Tracking...' : 'Track'}
                </button>
            </form>

            {error && <p className="text-center text-red-500">{error}</p>}
            
            {complaint && (
                <div className="mt-6 border-t pt-6">
                    <div className="space-y-3">
                        <div className="flex justify-between"><strong>ID:</strong> <span>{complaint._id}</span></div>
                        <div className="flex justify-between"><strong>Title:</strong> <span>{complaint.title}</span></div>
                        <div className="flex justify-between items-center">
                            <strong>Status:</strong>
                            <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(complaint.status)}`}>{complaint.status}</span>
                        </div>
                    </div>
                    {complaint.status === 'Resolved' && !complaint.feedback && (
                        <FeedbackForm 
                            complaintId={complaint._id} 
                            onFeedbackSubmitted={() => handleTrack(complaint._id)}
                        />
                    )}
                    {complaint.feedback && (
                        <div className="mt-4 p-4 bg-green-50 rounded-lg">
                            <h4 className="font-semibold">Your Feedback:</h4>
                            <div className="flex items-center gap-1 mt-1">
                                {[...Array(complaint.rating)].map((_, i) => <FaStar key={i} color="#ffc107" />)}
                            </div>
                            <p className="text-gray-700 mt-2">"{complaint.feedback}"</p>
                        </div>
                    )}
                </div>
            )}
            
            {recentComplaints.length > 0 && !complaint && (
                 <div className="mt-8 border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Your Recent Complaints</h3>
                    <ul className="space-y-3">
                        {recentComplaints.map((item) => (
                            <li key={item.id} className="p-3 bg-gray-50 rounded-lg">
                                <div className="flex justify-between items-center mb-1">
                                    <p className="font-semibold">{item.category}</p>
                                    <p className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString()}</p>
                                </div>
                                <button onClick={() => { setComplaintId(item.id); handleTrack(item.id); }} className="text-indigo-600 hover:underline text-sm font-mono">
                                    {item.id}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default StatusTracker;