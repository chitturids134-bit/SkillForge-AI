import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import logoImg from '../assets/logo.png';
import '../styles/auth.css';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Developer');
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { theme } = useTheme();

  const { register, error, setError, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setError(null);
    setLocalError('');
    if (user) {
      if (user.role === 'Recruiter') { if (user.verificationStatus === 'verified') navigate('/recruiter/dashboard'); else navigate('/recruiter/verification'); }
      else if (user.role === 'Admin') navigate('/admin/dashboard');
      else navigate('/developer/dashboard');
    }
  }, [user, navigate, setError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!name || !email || !password || !confirmPassword || !role) {
      setLocalError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match. Please verify your password.');
      return;
    }

    if (!agreeTerms) {
      setLocalError('You must agree to the Terms of Service and Privacy Policy to create an account.');
      return;
    }

    setSubmitting(true);
    try {
      const userData = await register(name, email, password, role);
      if (userData?.role === 'Recruiter') { if (userData?.verificationStatus === 'verified') navigate('/recruiter/dashboard'); else navigate('/recruiter/verification'); }
      else if (userData?.role === 'Admin') navigate('/admin/dashboard');
      else navigate('/developer/dashboard');
    } catch (err) {
      setSubmitting(false);
    }
  };

  const displayError = localError || error;

  return (
    <div className="full-viewport-auth-root">
      <div className="full-viewport-auth-grid">
        
        {/* LEFT COLUMN: SIGNUP FORM */}
        <div className="auth-form-column">
          <div className="auth-form-container">
            
            {/* Logo & Header */}
            <div style={{ marginBottom: '1.5rem' }}>
              <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', marginBottom: '1rem' }}>
                <img src={logoImg} alt="SkillForge AI" style={{ height: '34px', width: 'auto' }} />
                <span style={{ fontSize: '1.3rem', fontWeight: 900, background: 'linear-gradient(135deg, #8B5CF6, #6C63FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  SkillForge AI
                </span>
              </Link>

              <h1 style={{ fontSize: '1.95rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 0.3rem 0', letterSpacing: '-0.02em' }}>
                Create Your Account
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                Join SkillForge AI to unlock personalized career growth and AI mentorship.
              </p>
            </div>

            {/* Error Banner */}
            {displayError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ padding: '0.75rem 1rem', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#EF4444', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.25rem' }}
              >
                ⚠️ {displayError}
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Two-column: Full Name & Role */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    style={{ width: '100%', padding: '0.68rem 0.85rem', borderRadius: '9px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Workspace Role *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={{ width: '100%', padding: '0.68rem 0.85rem', borderRadius: '9px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box', fontWeight: 700 }}
                  >
                    <option value="Developer">💻 Developer</option>
                    <option value="Recruiter">🏢 Corporate Recruiter</option>
                  </select>
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  style={{ width: '100%', padding: '0.68rem 0.85rem', borderRadius: '9px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* Two-column: Password & Confirm Password */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Password *
                  </label>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      style={{ width: '100%', padding: '0.68rem 2.4rem 0.68rem 0.85rem', borderRadius: '9px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      {showPassword ? '👁️' : '🙈'}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Confirm Password *
                  </label>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      style={{ width: '100%', padding: '0.68rem 2.4rem 0.68rem 0.85rem', borderRadius: '9px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      {showConfirmPassword ? '👁️' : '🙈'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Terms & Privacy */}
              <div style={{ margin: '0.2rem 0' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none', lineHeight: '1.35' }}>
                  <input
                    type="checkbox"
                    required
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    style={{ width: '16px', height: '16px', marginTop: '2px', cursor: 'pointer' }}
                  />
                  <span>
                    I agree to the <span style={{ color: '#8B5CF6', fontWeight: 700 }}>Terms of Service</span> and <span style={{ color: '#8B5CF6', fontWeight: 700 }}>Privacy Policy</span>.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  borderRadius: '11px',
                  background: 'linear-gradient(135deg, #8B5CF6, #6C63FF)',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 18px rgba(139, 92, 246, 0.35)',
                  transition: 'all 0.2s ease',
                }}
              >
                {submitting ? 'Creating Account...' : 'Create Account →'}
              </button>
            </form>

            {/* Footer Navigation */}
            <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#8B5CF6', textDecoration: 'none', fontWeight: 800 }}>
                Log in
              </Link>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: BRANDING */}
        <div className="auth-hero-column">
          <div className="auth-hero-container">
            
            <div style={{ marginBottom: '2rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.85rem', borderRadius: '20px', background: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6', fontSize: '0.8rem', fontWeight: 800, marginBottom: '1.25rem' }}>
                ✨ SKILLFORGE AI CAREER PLATFORM
              </span>

              <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 0.85rem 0', lineHeight: 1.25, letterSpacing: '-0.02em' }}>
                Build Your Career <br />
                <span style={{ background: 'linear-gradient(135deg, #8B5CF6, #6C63FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>With AI</span>
              </h2>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6', margin: 0 }}>
                Learn smarter, build stronger skills, prepare for technical interviews, and discover opportunities tailored to your career goals.
              </p>
            </div>

            {/* Single Cohesive Career Progress Overview Card */}
            <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', borderRadius: '16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', marginBottom: '1.75rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                🎯 Platform Milestones
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', textAlign: 'center' }}>
                <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem 0.5rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#10B981' }}>78%</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Career Progress</div>
                </div>

                <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem 0.5rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#8B5CF6' }}>12</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Skills Improved</div>
                </div>

                <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem 0.5rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#F59E0B' }}>85%</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Readiness</div>
                </div>
              </div>
            </div>

            {/* 3 Concise Feature Highlights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.75rem 1rem', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '1.25rem' }}>🤖</span>
                <div>
                  <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.85rem' }}>AI Career Guidance</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>24/7 technical milestone roadmap.</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.75rem 1rem', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '1.25rem' }}>🎤</span>
                <div>
                  <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.85rem' }}>Interview Preparation</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Realistic AI mock technical interviews.</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.75rem 1rem', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '1.25rem' }}>💼</span>
                <div>
                  <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.85rem' }}>Job Opportunities</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Direct connections with verified recruiters.</div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Signup;
