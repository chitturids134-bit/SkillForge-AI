import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DeveloperDashboard from './pages/DeveloperDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import Dashboard from './pages/dashboard/Dashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected General Route */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Protected Role-Based Routes */}
          <Route
            path="/developer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['Developer']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/dashboard"
            element={
              <ProtectedRoute allowedRoles={['Recruiter']}>
                <RecruiterDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback Catch-All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
