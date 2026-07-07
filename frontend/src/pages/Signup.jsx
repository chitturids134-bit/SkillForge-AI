import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Developer');
  const [localError, setLocalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register, error, setError, user } = useAuth();
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
    
    if (!name || !email || !password || !role) {
      setLocalError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);
    try {
      const loggedUser = await register(name, email, password, role);
      redirectUser(loggedUser.role);
    } catch (err) {
      // Error is handled in context
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
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Get started with SkillForge AI</p>

        {(localError || error) && (
          <div className="auth-error">
            {localError || error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input
              className="form-input"
              type="text"
              id="name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="role">Select Workspace Role</label>
            <select
              className="form-select"
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="Developer">Developer</option>
              <option value="Recruiter">Recruiter</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="auth-btn"
            disabled={submitting}
          >
            {submitting ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default Signup;
