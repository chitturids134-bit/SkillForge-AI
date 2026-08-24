import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import logoImg from '../assets/logo.png';
import '../styles/auth.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

    const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await login(email, password);
      if (res && res.success) {
        const role = res.user?.role;
        if (role === 'Recruiter') {
          navigate('/recruiter/dashboard');
        } else if (role === 'Admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        setErrorMsg(res?.message || 'Invalid email or password.');
      }
    } catch (err) {
      if (!err.response || err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED') {
        setErrorMsg('Unable to connect to server. Please make sure the backend is running.');
      } else {
        setErrorMsg(err.response?.data?.message || 'Invalid email or password.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="full-viewport-auth-root">
      <div className="full-viewport-auth-grid">
        
        {/* LEFT COLUMN: FORM */}
        <div className="auth-form-column">
          <div className="auth-form-container">
            
            {/* Logo & Header */}
            <div style={{ marginBottom: '2rem' }}>
              <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', marginBottom: '1.25rem' }}>
                <img src={logoImg} alt="SkillForge AI" style={{ height: '36px', width: 'auto' }} />
                <span style={{ fontSize: '1.35rem', fontWeight: 900, background: 'linear-gradient(135deg, #8B5CF6, #6C63FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  SkillForge AI
                </span>
              </Link>

              <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 0.35rem 0', letterSpacing: '-0.02em' }}>
                Welcome Back
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', margin: 0, lineHeight: '1.4' }}>
                Log in to access your SkillForge AI workspace.
              </p>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ padding: '0.85rem 1rem', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#EF4444', fontSize: '0.88rem', fontWeight: 600, marginBottom: '1.5rem' }}
              >
                ⚠️ {errorMsg}
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.92rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Password
                </label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ width: '100%', padding: '0.75rem 2.8rem 0.75rem 1rem', borderRadius: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.92rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem' }}
                  >
                    {showPassword ? '👁️' : '🙈'}
                  </button>
                </div>
              </div>

              {/* Remember & Forgot */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  Remember me
                </label>

                <Link to="/forgot-password" style={{ color: '#8B5CF6', textDecoration: 'none', fontWeight: 700 }}>
                  Forgot Password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  marginTop: '0.5rem',
                  width: '100%',
                  padding: '0.85rem',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #8B5CF6, #6C63FF)',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 20px rgba(139, 92, 246, 0.35)',
                  transition: 'all 0.2s ease',
                }}
              >
                {submitting ? 'Authenticating...' : 'Log In →'}
              </button>
            </form>

            {/* Footer Navigation */}
            <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Don't have an account?{' '}
              <Link to="/signup" style={{ color: '#8B5CF6', textDecoration: 'none', fontWeight: 800 }}>
                Sign Up
              </Link>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: BRANDING */}
        <div className="auth-hero-column">
          <div className="auth-hero-container">
            
            <div style={{ marginBottom: '2.5rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.85rem', borderRadius: '20px', background: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6', fontSize: '0.8rem', fontWeight: 800, marginBottom: '1.25rem' }}>
                ✨ AI-POWERED CAREER PLATFORM
              </span>

              <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 0.85rem 0', lineHeight: 1.25, letterSpacing: '-0.02em' }}>
                Accelerate Your Career with <span style={{ background: 'linear-gradient(135deg, #8B5CF6, #6C63FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SkillForge AI</span>
              </h2>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                Empowering developers and recruiters with real-time technical skill matching, resume engineering, and 24/7 AI mentorship.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', borderRadius: '14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '1.5rem' }}>📈</span>
                <div>
                  <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.9rem' }}>Track Career Growth</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Monitor skill progression and interview readiness.</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', borderRadius: '14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '1.5rem' }}>🤖</span>
                <div>
                  <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.9rem' }}>AI Mentorship & Practice</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>24/7 AI guidance tailored to your technical stack.</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', borderRadius: '14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '1.5rem' }}>💼</span>
                <div>
                  <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.9rem' }}>Matched Opportunities</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Direct candidate-to-recruiter connections.</div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;
