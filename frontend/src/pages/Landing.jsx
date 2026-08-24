import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import logoImg from '../assets/logo.png';
import '../styles/auth.css';

function Landing() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          color: 'var(--text-secondary)',
          backgroundColor: 'var(--bg-primary)',
        }}
      >
        Loading SkillForge AI...
      </div>
    );
  }

  const handleGetStarted = () => {
    if (user) {
      if (user.role === 'Recruiter') navigate('/recruiter/dashboard');
      else if (user.role === 'Admin') navigate('/admin/dashboard');
      else navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`landing-root ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      {/* 1. STICKY TOP NAVIGATION NAVBAR */}
      <header className="landing-header">
        <div className="landing-header-container">
          <div className="landing-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <img src={logoImg} alt="SkillForge AI Logo" className="landing-logo-img" />
            <span className="landing-brand-title">SkillForge AI</span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="landing-nav-links desktop-only">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className={`nav-link-btn ${location.pathname === '/' ? 'active' : ''}`}
            >
              Home
            </button>
            <button onClick={() => scrollToSection('features')} className="nav-link-btn">
              Features
            </button>
            <button onClick={() => scrollToSection('how-it-works')} className="nav-link-btn">
              Roadmap
            </button>
            <button onClick={() => scrollToSection('pricing')} className="nav-link-btn">
              Pricing
            </button>
            <button onClick={() => scrollToSection('testimonials')} className="nav-link-btn">
              Testimonials
            </button>
            <button
              onClick={() => navigate('/blog')}
              className={`nav-link-btn ${location.pathname === '/blog' ? 'active' : ''}`}
            >
              Blog
            </button>
          </nav>

          {/* Desktop Actions */}
          <div className="landing-auth-actions desktop-only">
            {!user ? (
              <>
                <button onClick={() => navigate('/login')} className="landing-btn-login">
                  Login
                </button>
                <button onClick={() => navigate('/signup')} className="btn-gradient-primary landing-btn-signup">
                  Sign Up
                </button>
              </>
            ) : (
              <button onClick={handleGetStarted} className="btn-gradient-primary landing-btn-signup">
                Workspace →
              </button>
            )}
          </div>

          {/* Mobile & Tablet Header Controls (Hamburger Only) */}
          <div className="landing-mobile-controls mobile-only">
            <button
              className="mobile-hamburger-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="mobile-nav-drawer mobile-only"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
            >
              <nav className="mobile-drawer-links">
                <button onClick={() => { setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="mobile-drawer-btn">
                  Home
                </button>
                <button onClick={() => scrollToSection('features')} className="mobile-drawer-btn">
                  Features
                </button>
                <button onClick={() => scrollToSection('how-it-works')} className="mobile-drawer-btn">
                  Roadmap
                </button>
                <button onClick={() => scrollToSection('pricing')} className="mobile-drawer-btn">
                  Pricing
                </button>
                <button onClick={() => scrollToSection('testimonials')} className="mobile-drawer-btn">
                  Testimonials
                </button>
                <button onClick={() => { setMobileMenuOpen(false); navigate('/blog'); }} className="mobile-drawer-btn">
                  Blog
                </button>
              </nav>

              <div className="mobile-drawer-actions">
                {!user ? (
                  <>
                    <button onClick={() => { setMobileMenuOpen(false); navigate('/login'); }} className="landing-btn-login w-full">
                      Login
                    </button>
                    <button onClick={() => { setMobileMenuOpen(false); navigate('/signup'); }} className="btn-gradient-primary w-full">
                      Get Started For Free →
                    </button>
                  </>
                ) : (
                  <button onClick={() => { setMobileMenuOpen(false); handleGetStarted(); }} className="btn-gradient-primary w-full">
                    Open Workspace →
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 2. HERO SECTION */}
      <section className="landing-hero-section">
        {/* Soft Radial Glow Areas */}
        <div className="hero-glow-blob purple glow-left" />
        <div className="hero-glow-blob pink glow-center" />
        <div className="hero-glow-blob cyan glow-right" />

        <div className="landing-hero-container">
          {/* Left Column Text & CTAs */}
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="hero-badge">
              <span className="badge-icon">⚡</span>
              <span>AI-Powered Career Acceleration Platform</span>
            </div>

            <h1 className="hero-main-title">
              Learn. Build. <br />
              <span className="hero-gradient-text">Get Hired.</span>
            </h1>

            <p className="hero-description">
              All-in-one platform to help you build skills, create a standout resume, ace interviews, and land your dream job.
            </p>

            <div className="hero-action-buttons">
              <button onClick={handleGetStarted} className="btn-gradient-primary hero-primary-cta">
                {user ? 'Open Workspace →' : 'Get Started For Free →'}
              </button>
              <button onClick={() => scrollToSection('features')} className="btn-outline hero-secondary-cta">
                Explore Features
              </button>
            </div>

            {/* Social Proof Strip */}
            <div className="hero-social-proof">
              <div className="avatar-group">
                <div className="avatar avatar-1">👩‍💻</div>
                <div className="avatar avatar-2">👨‍💻</div>
                <div className="avatar avatar-3">👩‍🔬</div>
                <div className="avatar avatar-4">👨‍💼</div>
              </div>
              <span className="social-proof-text">Join 10,000+ learners growing their careers</span>
            </div>
          </motion.div>

          {/* Right Column: Futuristic AI Career Workstation & 4 Floating Cards */}
          <motion.div
            className="hero-visual-wrapper"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            {/* Floating Card 1: AI Resume Score (Top Left) */}
            <motion.div
              className="floating-card float-card-top-left glass-panel"
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="float-card-header">
                <span className="float-icon icon-emerald">📄</span>
                <span className="float-card-title">AI Resume Score</span>
              </div>
              <div className="float-card-val val-emerald">92/100</div>
              <span className="float-status-pill pill-emerald">Excellent</span>
            </motion.div>

            {/* Floating Card 2: Interview Ready (Top Right) */}
            <motion.div
              className="floating-card float-card-top-right glass-panel"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
            >
              <div className="float-card-header">
                <span className="float-icon icon-violet">🎤</span>
                <span className="float-card-title">Interview Ready</span>
              </div>
              <div className="float-card-val val-white">85%</div>
              <span className="float-status-pill pill-violet">Keep Practicing!</span>
            </motion.div>

            {/* Floating Card 3: Skills Matched (Middle Left) */}
            <motion.div
              className="floating-card float-card-mid-left glass-panel"
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
            >
              <div className="float-card-header">
                <span className="float-icon icon-cyan">⚡</span>
                <span className="float-card-title">Skills Matched</span>
              </div>
              <div className="float-card-val val-cyan">24</div>
              <span className="float-status-pill pill-cyan">In Demand</span>
            </motion.div>

            {/* Floating Card 4: Career Match (Lower Right) */}
            <motion.div
              className="floating-card float-card-bottom-right glass-panel"
              animate={{ y: [0, 7, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
            >
              <div className="float-card-header">
                <span className="float-icon icon-pink">🎯</span>
                <span className="float-card-title">Career Match</span>
              </div>
              <div className="float-card-val val-pink">95%</div>
              <span className="float-status-pill pill-pink">Great Fit!</span>
            </motion.div>

            {/* Central Holographic Workstation Monitor Frame */}
            <div className="visual-workstation-card glass-panel">
              <div className="workstation-header">
                <div className="preview-dots">
                  <span className="dot red" />
                  <span className="dot yellow" />
                  <span className="dot green" />
                </div>
                <span className="workstation-title">Your Career Dashboard</span>
                <div className="workstation-pulse">
                  <span className="pulse-dot" /> AI Active
                </div>
              </div>

              <div className="workstation-body">
                {/* Central Radial Progress Gauge */}
                <div className="central-gauge-container">
                  <svg viewBox="0 0 160 160" className="gauge-svg">
                    <circle cx="80" cy="80" r="62" className="gauge-bg-circle" />
                    <circle cx="80" cy="80" r="62" className="gauge-fill-circle" strokeDasharray="390" strokeDashoffset="58" />
                  </svg>
                  <div className="gauge-center-text">
                    <span className="gauge-number">85%</span>
                    <span className="gauge-label">Profile Strength</span>
                  </div>
                </div>

                {/* Graph Analytics Lines */}
                <div className="workstation-graph-box">
                  <svg viewBox="0 0 200 45" className="workstation-chart">
                    <defs>
                      <linearGradient id="workGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#6C63FF" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path d="M 0,35 Q 40,15 80,28 T 160,10 T 200,5 L 200,45 L 0,45 Z" fill="url(#workGrad)" />
                    <path d="M 0,35 Q 40,15 80,28 T 160,10 T 200,5" fill="none" stroke="#00D4FF" strokeWidth="2.5" />
                  </svg>
                </div>
              </div>

              {/* Holographic 3D Base & Floating Cubes */}
              <div className="workstation-3d-base">
                <div className="holographic-pedestal" />
                <div className="floating-ai-cube cube-left">
                  <span>AI</span>
                </div>
                <div className="floating-ai-cube cube-right">
                  <span>AI</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. FEATURES SECTION (8-CARD GRID) */}
      <section className="landing-features-section" id="features">
        <div className="landing-section-header">
          <h2 className="section-title">
            Everything You Need to <span className="hero-gradient-text">Accelerate Your Career</span>
          </h2>
          <p className="section-subtitle">
            Powerful tools and AI to guide you every step of the way
          </p>
        </div>

        <div className="features-grid-8">
          {/* Card 1 */}
          <div
            className="feature-card-8 glass-panel-interactive feature-accent-purple"
            onClick={() => navigate(user ? '/resume' : '/login')}
          >
            <div className="feature-icon-box box-purple">📄</div>
            <h3 className="feature-card-title">AI Resume Builder</h3>
            <p className="feature-card-desc">Create ATS-friendly resumes that get noticed by top tech recruiters.</p>
          </div>

          {/* Card 2 */}
          <div
            className="feature-card-8 glass-panel-interactive feature-accent-orange"
            onClick={() => navigate(user ? '/resume' : '/login')}
          >
            <div className="feature-icon-box box-orange">🔍</div>
            <h3 className="feature-card-title">ATS Resume Scanner</h3>
            <p className="feature-card-desc">Get instant AI scores and recommendations to improve your resume score.</p>
          </div>

          {/* Card 3 */}
          <div
            className="feature-card-8 glass-panel-interactive feature-accent-pink"
            onClick={() => navigate(user ? '/interview' : '/login')}
          >
            <div className="feature-icon-box box-pink">🎤</div>
            <h3 className="feature-card-title">AI Mock Interviews</h3>
            <p className="feature-card-desc">Practice technical & HR questions with AI feedback to boost your confidence.</p>
          </div>

          {/* Card 4 */}
          <div
            className="feature-card-8 glass-panel-interactive feature-accent-amber"
            onClick={() => navigate(user ? '/roadmap' : '/login')}
          >
            <div className="feature-icon-box box-amber">🛣️</div>
            <h3 className="feature-card-title">Career Roadmap</h3>
            <p className="feature-card-desc">Follow a personalized milestone-based learning path to achieve your dream role.</p>
          </div>

          {/* Card 5 */}
          <div
            className="feature-card-8 glass-panel-interactive feature-accent-green"
            onClick={() => navigate(user ? '/assessments' : '/login')}
          >
            <div className="feature-icon-box box-green">🧠</div>
            <h3 className="feature-card-title">Skill Gap Analysis</h3>
            <p className="feature-card-desc">Find skill gaps through interactive quizzes and get smart AI recommendations.</p>
          </div>

          {/* Card 6 */}
          <div
            className="feature-card-8 glass-panel-interactive feature-accent-cyan"
            onClick={() => navigate(user ? '/mentor' : '/login')}
          >
            <div className="feature-icon-box box-cyan">🤖</div>
            <h3 className="feature-card-title">AI Mentor</h3>
            <p className="feature-card-desc">Get personalized career guidance, code reviews, and interview advice 24/7.</p>
          </div>

          {/* Card 7 */}
          <div
            className="feature-card-8 glass-panel-interactive feature-accent-red"
            onClick={() => navigate(user ? '/profile' : '/login')}
          >
            <div className="feature-icon-box box-red">🏆</div>
            <h3 className="feature-card-title">Projects & Certifications</h3>
            <p className="feature-card-desc">Build real-world portfolio projects and showcase your verified skill badges.</p>
          </div>

          {/* Card 8 */}
          <div
            className="feature-card-8 glass-panel-interactive feature-accent-blue"
            onClick={() => navigate(user ? '/recruiter/dashboard' : '/login')}
          >
            <div className="feature-icon-box box-blue">💼</div>
            <h3 className="feature-card-title">Job Recommendations</h3>
            <p className="feature-card-desc">AI-powered job matches matched specifically to your skill vector and experience.</p>
          </div>
        </div>
      </section>

      {/* 4. STATS SECTION (4 COLUMNS) */}
      <section className="landing-stats-bar" id="pricing">
        <div className="landing-stats-container-4">
          <div className="stat-card-box">
            <div className="stat-icon-wrapper icon-purple-glow">👥</div>
            <div className="stat-info">
              <span className="stat-number-text gradient-text-purple">10K+</span>
              <span className="stat-label-text">Active Learners</span>
            </div>
          </div>

          <div className="stat-card-box">
            <div className="stat-icon-wrapper icon-pink-glow">🏢</div>
            <div className="stat-info">
              <span className="stat-number-text gradient-text-pink">500+</span>
              <span className="stat-label-text">Companies Hired</span>
            </div>
          </div>

          <div className="stat-card-box">
            <div className="stat-icon-wrapper icon-amber-glow">🎓</div>
            <div className="stat-info">
              <span className="stat-number-text gradient-text-gold">100+</span>
              <span className="stat-label-text">Expert Mentors</span>
            </div>
          </div>

          <div className="stat-card-box">
            <div className="stat-icon-wrapper icon-emerald-glow">⭐</div>
            <div className="stat-info">
              <span className="stat-number-text gradient-text-emerald">95%</span>
              <span className="stat-label-text">Satisfaction Rate</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIAL & FINAL CTA DUAL SECTION */}
      <section className="landing-dual-section" id="testimonials">
        <div className="landing-dual-container">
          {/* Testimonial Card */}
          <div className="testimonial-card-wrapper glass-panel">
            <h3 className="dual-card-title">Loved by Learners</h3>
            <p className="testimonial-quote">
              "SkillForge AI helped me build my resume, practice interviews and land my dream job. Highly recommended!"
            </p>
            <div className="testimonial-author-row">
              <div className="author-avatar">👩‍💼</div>
              <div className="author-details">
                <div className="author-name">Priya Sharma</div>
                <div className="author-role">Software Engineer @ Microsoft</div>
                <div className="star-rating">★★★★★</div>
              </div>
            </div>
          </div>

          {/* Final CTA Card */}
          <div className="final-cta-card-wrapper glass-panel">
            <h3 className="dual-card-title">Ready to Transform Your Career?</h3>
            <p className="cta-card-desc">
              Join thousands of learners who are already building better careers with SkillForge AI.
            </p>
            <button onClick={handleGetStarted} className="btn-gradient-primary final-cta-btn">
              {user ? 'Open Workspace →' : 'Start Your Journey Now →'}
            </button>
            <div className="futuristic-trajectory-bg" />
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="landing-footer" id="how-it-works">
        <div className="landing-footer-container">
          <div className="footer-brand-col">
            <div className="landing-brand">
              <img src={logoImg} alt="SkillForge AI Logo" className="landing-logo-img" />
              <span className="landing-brand-title">SkillForge AI</span>
            </div>
            <p className="footer-brand-desc">
              Empowering tech professionals through AI-driven skill assessments, mock interviews, ATS resume optimization, and career roadmaps.
            </p>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-col-title">Product</h4>
            <ul>
              <li><button onClick={() => navigate(user ? '/resume' : '/login')} className="footer-link">Resume Builder</button></li>
              <li><button onClick={() => navigate(user ? '/resume' : '/login')} className="footer-link">ATS Scanner</button></li>
              <li><button onClick={() => navigate(user ? '/interview' : '/login')} className="footer-link">AI Mock Interviews</button></li>
              <li><button onClick={() => navigate(user ? '/roadmap' : '/login')} className="footer-link">Career Roadmap</button></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-col-title">Platform</h4>
            <ul>
              <li><button onClick={() => navigate(user ? '/assessments' : '/login')} className="footer-link">Skill Gap Analysis</button></li>
              <li><button onClick={() => navigate(user ? '/mentor' : '/login')} className="footer-link">AI Mentor</button></li>
              <li><button onClick={() => navigate(user ? '/profile' : '/login')} className="footer-link">Projects & Certs</button></li>
              <li><button onClick={() => navigate(user ? '/dashboard' : '/login')} className="footer-link">Job Matches</button></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-col-title">Company</h4>
            <ul>
              <li><button onClick={() => navigate('/')} className="footer-link">Home</button></li>
              <li><button onClick={() => navigate('/blog')} className="footer-link">Blog</button></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <p>© 2026 SkillForge AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
