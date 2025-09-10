import React, { useState, useEffect } from 'react';
import api from '../api';
import { FaStar } from 'react-icons/fa';

function AdminDashboard() {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchComplaints = async () => {
            try {
                const response = await api.get('/complaints');
                setComplaints(response.data);
            } catch (err) {
                setError('Failed to fetch complaints.');
            } finally {
                setLoading(false);
            }
        };
        fetchComplaints();
    }, []);

    const handleStatusChange = async (id, newStatus) => {
        try {
            await api.put(`/complaints/${id}`, { status: newStatus });
            setComplaints(prev => prev.map(c => c._id === id ? { ...c, status: newStatus } : c));
        } catch (err) {
            alert('Failed to update status.');
        }
    };
    
    // Component to render star ratings
    const Rating = ({ count }) => (
        <div className="flex items-center">
            {[...Array(count)].map((_, i) => <FaStar key={i} color="#ffc107" />)}
            <span className="ml-2 text-sm text-gray-600">({count}/5)</span>
        </div>
    );

    const StatusSelector = ({ complaint }) => (
        <select value={complaint.status} onChange={(e) => handleStatusChange(complaint._id, e.target.value)} className="p-2 border rounded-md w-full">
            <option>Submitted</option>
            <option>In Progress</option>
            <option>Resolved</option>
            <option>Rejected</option>
        </select>
    );

    const EvidenceLinks = ({ filePaths }) => {
        if (!filePaths || filePaths.length === 0) return <span className="text-gray-400">N/A</span>;
        return (
            <div className="flex flex-col items-start">
                {filePaths.map((path, i) => <a key={i} href={`http://localhost:5000/${path}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">File {i + 1}</a>)}
            </div>
        );
    };

    if (loading) return <p className="text-center">Loading...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    return (
        <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 px-4 md:px-0">Admin Dashboard</h2>

            {/* --- Mobile View --- */}
            <div className="md:hidden px-4 space-y-4">
                {complaints.map((c) => (
                    <div key={c._id} className="bg-white p-4 rounded-lg shadow">
                        <h3 className="font-bold">{c.title}</h3>
                        <p className="text-sm text-gray-500">{c.category}</p>
                        <div className="mt-2 space-y-2 text-sm">
                            <div className="flex justify-between"><span>Date:</span> <span>{new Date(c.createdAt).toLocaleDateString()}</span></div>
                            <div className="flex justify-between"><span>Evidence:</span> <EvidenceLinks filePaths={c.filePaths} /></div>
                             {c.feedback && (
                                <div className="pt-2 border-t">
                                    <div className="flex justify-between"><span>Rating:</span> <Rating count={c.rating} /></div>
                                    <p className="text-gray-600 mt-1"><em>"{c.feedback}"</em></p>
                                </div>
                            )}
                            <div className="pt-2 border-t"><StatusSelector complaint={c} /></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* --- Desktop View --- */}
            <div className="hidden md:block bg-white p-6 rounded-lg shadow-md">
                <table className="min-w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="py-3 px-4 text-left text-sm font-semibold">Title</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold">Feedback</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold">Date</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold">Evidence</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold">Status</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {complaints.map((c) => (
                            <tr key={c._id} className="border-b">
                                <td className="py-3 px-4">
                                    <p className="font-medium">{c.title}</p>
                                    <p className="text-sm text-gray-500">{c.category}</p>
                                </td>
                                <td className="py-3 px-4">
                                    {c.feedback ? (
                                        <div>
                                            <Rating count={c.rating} />
                                            <p className="text-sm text-gray-600 mt-1">"{c.feedback}"</p>
                                        </div>
                                    ) : <span className="text-gray-400">N/A</span>}
                                </td>
                                <td className="py-3 px-4">{new Date(c.createdAt).toLocaleDateString()}</td>
                                <td className="py-3 px-4"><EvidenceLinks filePaths={c.filePaths} /></td>
                                <td className="py-3 px-4"><StatusSelector complaint={c} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminDashboard;