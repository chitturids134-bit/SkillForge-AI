import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, error, setError, user } = useAuth();
  const navigate = useNavigate();

  // Clear global error on mount
  useEffect(() => {
    setError(null);
    setLocalError('');
    
    // Redirect if already logged in
    if (user) {
      redirectUser(user.role);
    }
  }, [user]);

  const redirectUser = (role) => {
    if (role === 'Developer') {
      navigate('/developer/dashboard');
    } else if (role === 'Recruiter') {
      navigate('/recruiter/dashboard');
    } else if (role === 'Admin') {
      navigate('/admin/dashboard');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    
    if (!email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      const loggedUser = await login(email, password);
      redirectUser(loggedUser.role);
    } catch (err) {
      // Error is stored in AuthContext and synced
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <motion.div
        className="auth-card glass-panel"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="auth-title">Sign In</h2>
        <p className="auth-subtitle">Access your SkillForge AI workspace</p>

        {(localError || error) && (
          <div className="auth-error">
            {localError || error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              className="form-input"
              type="email"
              id="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              className="form-input"
              type="password"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="auth-btn"
            disabled={submitting}
          >
            {submitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/signup" className="auth-link">
            Create account
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;
