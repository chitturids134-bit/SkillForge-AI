import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

function Landing() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Automatic redirect if a valid JWT already exists
  useEffect(() => {
    if (!loading && user) {
      const role = user.role;
      if (role === 'Developer') navigate('/developer/dashboard');
      else if (role === 'Recruiter') navigate('/recruiter/dashboard');
      else if (role === 'Admin') navigate('/admin/dashboard');
    }
  }, [user, loading, navigate]);

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

  const handleGetStarted = () => {
    if (user) {
      // Redirect to correct dashboard if already logged in
      const role = user.role;
      if (role === 'Developer') navigate('/developer/dashboard');
      else if (role === 'Recruiter') navigate('/recruiter/dashboard');
      else if (role === 'Admin') navigate('/admin/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="auth-container">
      <motion.div 
        className="auth-card glass-panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', maxWidth: '500px' }}
      >
        <span className="success-badge">Phase 2: Authentication Active</span>
        
        <h1 className="auth-title" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
          SkillForge AI
        </h1>
        
        <p className="auth-subtitle" style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>
          Welcome to SkillForge AI. Empowering developers, recruiters, and admins through intelligent skill assessments and platform integrations.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
          <button onClick={handleGetStarted} className="auth-btn" style={{ padding: '0.85rem' }}>
            {user ? 'Go to Dashboard' : 'Get Started'}
          </button>
          
          {!user && (
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '0.5rem' }}>
              <button 
                onClick={() => navigate('/login')} 
                className="logout-btn" 
                style={{ flex: 1, padding: '0.75rem' }}
              >
                Sign In
              </button>
              <button 
                onClick={() => navigate('/signup')} 
                className="logout-btn" 
                style={{ flex: 1, padding: '0.75rem' }}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default Landing;
