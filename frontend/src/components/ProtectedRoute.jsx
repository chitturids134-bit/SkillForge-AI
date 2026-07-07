import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        color: 'var(--text-secondary)',
        backgroundColor: 'var(--bg-primary)'
      }}>
        Loading session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect role to its own dashboard
    if (user.role === 'Developer') {
      return <Navigate to="/developer/dashboard" replace />;
    } else if (user.role === 'Recruiter') {
      return <Navigate to="/recruiter/dashboard" replace />;
    } else if (user.role === 'Admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
