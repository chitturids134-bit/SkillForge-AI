import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import '../styles/auth.css';

function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="dashboard-logo">SkillForge AI</div>
        <button onClick={logout} className="logout-btn">Logout</button>
      </nav>
      <main className="dashboard-main">
        <motion.div 
          className="dashboard-card glass-panel"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="success-badge">Authentication Successful</span>
          <h2 className="auth-title" style={{ marginBottom: '1.5rem' }}>Admin Workspace</h2>
          
          <div className="dashboard-detail">
            <div className="dashboard-detail-item">
              <span className="detail-label">Name:</span>
              <span className="detail-val">{user?.name}</span>
            </div>
            <div className="dashboard-detail-item">
              <span className="detail-label">Email:</span>
              <span className="detail-val">{user?.email}</span>
            </div>
            <div className="dashboard-detail-item">
              <span className="detail-label">Role:</span>
              <span className="detail-val">{user?.role}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'center' }}>
            <button onClick={() => navigate('/profile')} className="action-btn" style={{ flex: 1 }}>View Profile</button>
            <button onClick={() => navigate('/profile')} className="logout-btn" style={{ flex: 1, padding: '0.75rem' }}>Edit Profile</button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default AdminDashboard;
