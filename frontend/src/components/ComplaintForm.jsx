import React, { useState, useRef } from 'react';
import axios from 'axios';
import { FaFileUpload, FaCamera, FaTimesCircle } from 'react-icons/fa';

function ComplaintForm() {
    const [formData, setFormData] = useState({ title: '', description: '', category: 'Sanitation' });
    const [files, setFiles] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const handleTextChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);
        setFiles(prevFiles => [...prevFiles, ...newFiles].slice(0, 5));
    };
    
    const removeFile = (fileName) => {
        setFiles(files.filter(file => file.name !== fileName));
    };

    const handleUploadClick = () => {
        fileInputRef.current.setAttribute('accept', 'image/*,application/pdf');
        fileInputRef.current.removeAttribute('capture');
        fileInputRef.current.click();
    };

    const handleCameraClick = () => {
        fileInputRef.current.setAttribute('accept', 'image/*');
        fileInputRef.current.setAttribute('capture', 'environment');
        fileInputRef.current.click();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        const submissionData = new FormData();
        submissionData.append('title', formData.title);
        submissionData.append('description', formData.description);
        submissionData.append('category', formData.category);
        
        files.forEach(file => {
            submissionData.append('evidenceFiles', file);
        });

        try {
            const response = await axios.post('http://localhost:5000/api/complaints', submissionData);
            const newComplaintId = response.data.complaintId;

            const recentComplaints = JSON.parse(localStorage.getItem('recentComplaints')) || [];
            
            const newComplaint = {
                id: newComplaintId,
                category: formData.category,
                date: new Date().toISOString()
            };

            recentComplaints.unshift(newComplaint);
            const updatedComplaints = recentComplaints.slice(0, 5);
            localStorage.setItem('recentComplaints', JSON.stringify(updatedComplaints));

            setMessage(`Complaint submitted! ID: ${newComplaintId}`);
            setFormData({ title: '', description: '', category: 'Sanitation' });
            setFiles([]);
            e.target.reset();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to submit complaint.');
        }
    };

    return (
        // Added responsive padding and margins
        <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Submit a Complaint</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                    <input type="text" name="title" value={formData.title} onChange={handleTextChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea name="description" rows="5" value={formData.description} onChange={handleTextChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required></textarea>
                </div>
                <div>
                    <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                    <select name="category" value={formData.category} onChange={handleTextChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white">
                        <option>Sanitation</option>
                        <option>Infrastructure</option>
                        <option>Ragging / Bullying</option>
                        <option>Security</option>
                        <option>Faculty</option>
                        <option>Other</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Evidence (up to 5 files)</label>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
                    {/* Responsive button layout */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button type="button" onClick={handleUploadClick} className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-700 font-semibold py-2 px-4 rounded-lg hover:bg-slate-200">
                            <FaFileUpload /> Upload Files
                        </button>
                        <button type="button" onClick={handleCameraClick} className="flex-1 flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 font-semibold py-2 px-4 rounded-lg hover:bg-indigo-100">
                            <FaCamera /> Use Camera
                        </button>
                    </div>
                    {files.length > 0 && (
                        <div className="mt-3 space-y-2">
                            {files.map((file, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
                                    <p className="text-sm text-gray-600 truncate">{file.name}</p>
                                    <button onClick={() => removeFile(file.name)} className="text-red-500 hover:text-red-700">
                                        <FaTimesCircle />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                {message && <div className="p-4 text-center bg-green-100 text-green-800 rounded-lg">{message}</div>}
                {error && <div className="p-4 text-center bg-red-100 text-red-800 rounded-lg">{error}</div>}

                <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700">
                    Submit
                </button>
            </form>
        </div>
    );
}

export default ComplaintForm;