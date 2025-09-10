import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate } from 'react-router-dom';

import ComplaintForm from './components/ComplaintForm';
import AdminDashboard from './components/AdminDashboard';
import StatusTracker from './components/StatusTracker';
import Footer from './components/Footer';
import LoginPage from './components/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';

function Navigation() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const linkStyles = "text-slate-300 hover:bg-slate-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition";
  const activeLinkStyles = "bg-slate-800 text-white";

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
    window.location.reload();
  };

  return (
    <nav className="bg-slate-900 shadow-lg">
      {/* Main container for the navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* This div stacks items vertically on mobile, and horizontally on larger screens */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3">

          {/* 1. The Brand/Heading Section */}
          <div className="flex items-center justify-center">
            <NavLink to="/" className="flex items-center gap-3 flex-shrink-0">
              <img 
                src="/logo.png" 
                alt="College Logo" 
                className="h-9 w-auto rounded-full"
              />
              <span className="text-xl font-bold text-white">
                Complaint System
              </span>
            </NavLink>
          </div>

          {/* 2. The Links Section (appears below the heading on mobile) */}
          <div className="w-full sm:w-auto mt-4 sm:mt-0 flex items-center justify-around sm:justify-end sm:gap-x-4">
            <NavLink to="/" className={({ isActive }) => `${linkStyles} ${isActive ? activeLinkStyles : ''}`}>
              Submit
            </NavLink>
            <NavLink to="/track" className={({ isActive }) => `${linkStyles} ${isActive ? activeLinkStyles : ''}`}>
              Track
            </NavLink>
            {token ? (
              <>
                <NavLink to="/admin" className={({ isActive }) => `${linkStyles} ${isActive ? activeLinkStyles : ''}`}>
                  Admin
                </NavLink>
                <button onClick={handleLogout} className="text-slate-300 hover:bg-red-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition">
                  Logout
                </button>
              </>
            ) : (
              <NavLink to="/login" className={({ isActive }) => `${linkStyles} ${isActive ? activeLinkStyles : ''}`}>
                Admin Login
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen flex flex-col">
        <Navigation />
        
        <main className="py-6 sm:py-10 flex-grow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<ComplaintForm />} />
              <Route path="/track" element={<StatusTracker />} />
              <Route path="/login" element={<LoginPage />} />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </div>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;