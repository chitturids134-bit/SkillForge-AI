import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import logoImg from '../assets/logo.png';
import '../styles/auth.css';

const BLOG_POSTS = [
  {
    id: 1,
    category: 'Resume Strategy',
    title: 'How to Build an ATS-Friendly Resume That Gets Selected',
    description: 'Learn the exact formatting techniques, keyword placement strategies, and quantifiable metrics to bypass Applicant Tracking Systems.',
    date: 'Aug 14, 2026',
    readTime: '5 min read',
    icon: '📄',
    accent: 'purple',
  },
  {
    id: 2,
    category: 'Interview Prep',
    title: 'How AI Can Help You Master Technical & HR Interviews',
    description: 'Discover how practicing with AI mock interview coaches gives you real-time STAR framework feedback and boosts candidate confidence.',
    date: 'Aug 12, 2026',
    readTime: '6 min read',
    icon: '🎤',
    accent: 'pink',
  },
  {
    id: 3,
    category: 'Skill Development',
    title: 'Top High-Demand Skills to Learn for a High-Paying Tech Career',
    description: 'An in-depth guide to modern web frameworks, AI integration, system design principles, and cloud infrastructure required in 2026.',
    date: 'Aug 10, 2026',
    readTime: '8 min read',
    icon: '⚡',
    accent: 'cyan',
  },
  {
    id: 4,
    category: 'Portfolio',
    title: 'How to Build Real-World Engineering Projects That Stand Out',
    description: 'Stop building generic clone apps. Build scalable full-stack applications with AI features, clean architecture, and verified metrics.',
    date: 'Aug 08, 2026',
    readTime: '7 min read',
    icon: '🏆',
    accent: 'amber',
  },
  {
    id: 5,
    category: 'Career Growth',
    title: 'How to Identify & Fill Your Skill Gaps with Data-Driven Roadmaps',
    description: 'Use automated skill gap analytics to pinpoint weak topics and execute milestone-based learning paths tailored to senior roles.',
    date: 'Aug 05, 2026',
    readTime: '4 min read',
    icon: '🧠',
    accent: 'green',
  },
  {
    id: 6,
    category: 'Strategy',
    title: 'How to Create a 90-Day Career Roadmap to Land Your Dream Job',
    description: 'A step-by-step blueprint combining portfolio building, continuous practice, ATS optimization, and targeted networking.',
    date: 'Aug 01, 2026',
    readTime: '6 min read',
    icon: '🛣️',
    accent: 'blue',
  },
];

function Blog() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const handleGetStarted = () => {
    if (user) {
      if (user.role === 'Recruiter') navigate('/recruiter/dashboard');
      else if (user.role === 'Admin') navigate('/admin/dashboard');
      else navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  const filteredPosts = BLOG_POSTS.filter((post) => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ['All', 'Resume Strategy', 'Interview Prep', 'Skill Development', 'Portfolio', 'Career Growth', 'Strategy'];

  return (
    <div className={`landing-root ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      {/* STICKY NAVBAR */}
      <header className="landing-header">
        <div className="landing-header-container">
          <div className="landing-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <img src={logoImg} alt="SkillForge AI Logo" className="landing-logo-img" />
            <span className="landing-brand-title">SkillForge AI</span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="landing-nav-links desktop-only">
            <button onClick={() => navigate('/')} className={`nav-link-btn ${location.pathname === '/' ? 'active' : ''}`}>
              Home
            </button>
            <button onClick={() => navigate('/#features')} className="nav-link-btn">
              Features
            </button>
            <button onClick={() => navigate('/#how-it-works')} className="nav-link-btn">
              Roadmap
            </button>
            <button onClick={() => navigate('/#pricing')} className="nav-link-btn">
              Pricing
            </button>
            <button onClick={() => navigate('/#testimonials')} className="nav-link-btn">
              Testimonials
            </button>
            <button onClick={() => navigate('/blog')} className={`nav-link-btn ${location.pathname === '/blog' ? 'active' : ''}`}>
              Blog
            </button>
          </nav>

          {/* Desktop Actions & Theme Toggle */}
          <div className="landing-auth-actions desktop-only">
            <button
              onClick={toggleTheme}
              className="theme-toggle-circular-btn"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                /* Screen in DARK MODE -> Show LIGHT MODE ICON (8-ray Sun SVG) */
                <svg className="theme-svg-icon sun-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2" />
                  <path d="M12 20v2" />
                  <path d="m4.93 4.93 1.41 1.41" />
                  <path d="m17.66 17.66 1.41 1.41" />
                  <path d="M2 12h2" />
                  <path d="M20 12h2" />
                  <path d="m6.34 17.66-1.41 1.41" />
                  <path d="m19.07 4.93-1.41 1.41" />
                </svg>
              ) : (
                /* Screen in LIGHT MODE -> Show DARK MODE ICON (Crescent Moon SVG) */
                <svg className="theme-svg-icon moon-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>

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

          {/* Mobile & Tablet Header Controls (Theme Toggle + Hamburger) */}
          <div className="landing-mobile-controls mobile-only">
            <button
              onClick={toggleTheme}
              className="theme-toggle-circular-btn"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                /* Screen in DARK MODE -> Show LIGHT MODE ICON (8-ray Sun SVG) */
                <svg className="theme-svg-icon sun-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2" />
                  <path d="M12 20v2" />
                  <path d="m4.93 4.93 1.41 1.41" />
                  <path d="m17.66 17.66 1.41 1.41" />
                  <path d="M2 12h2" />
                  <path d="M20 12h2" />
                  <path d="m6.34 17.66-1.41 1.41" />
                  <path d="m19.07 4.93-1.41 1.41" />
                </svg>
              ) : (
                /* Screen in LIGHT MODE -> Show DARK MODE ICON (Crescent Moon SVG) */
                <svg className="theme-svg-icon moon-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>

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
                <button onClick={() => { setMobileMenuOpen(false); navigate('/'); }} className="mobile-drawer-btn">
                  Home
                </button>
                <button onClick={() => { setMobileMenuOpen(false); navigate('/#features'); }} className="mobile-drawer-btn">
                  Features
                </button>
                <button onClick={() => { setMobileMenuOpen(false); navigate('/#how-it-works'); }} className="mobile-drawer-btn">
                  Roadmap
                </button>
                <button onClick={() => { setMobileMenuOpen(false); navigate('/#pricing'); }} className="mobile-drawer-btn">
                  Pricing
                </button>
                <button onClick={() => { setMobileMenuOpen(false); navigate('/#testimonials'); }} className="mobile-drawer-btn">
                  Testimonials
                </button>
                <button onClick={() => { setMobileMenuOpen(false); navigate('/blog'); }} className="mobile-drawer-btn active">
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

      {/* HERO SECTION */}
      <section className="blog-hero-section">
        <div className="hero-glow-blob purple glow-left" />
        <div className="hero-glow-blob pink glow-center" />
        <div className="hero-glow-blob cyan glow-right" />

        <div className="blog-hero-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="blog-hero-header"
          >
            <span className="hero-badge">
              <span className="badge-icon">📚</span>
              <span>SKILLFORGE AI KNOWLEDGE HUB</span>
            </span>

            <h1 className="blog-main-title">
              SkillForge AI <span className="hero-gradient-text">Blog</span>
            </h1>

            <p className="blog-hero-subtitle">
              Insights, guides and strategies to build skills, optimize resumes, master interviews, and accelerate your tech career.
            </p>

            {/* Search Input */}
            <div className="blog-search-bar glass-panel">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search career guides, ATS tips, interview prep..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="blog-search-input"
              />
            </div>
          </motion.div>

          {/* Category Filter Pills */}
          <div className="blog-categories-wrapper">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`category-pill-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* BLOG ARTICLES GRID */}
      <section className="blog-grid-section">
        <div className="blog-grid-container">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post, idx) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className={`blog-card glass-panel-interactive feature-accent-${post.accent}`}
              >
                <div className="blog-card-top">
                  <span className={`blog-category-badge badge-${post.accent}`}>
                    {post.category}
                  </span>
                  <span className="blog-read-time">{post.readTime}</span>
                </div>

                <div className="blog-card-body">
                  <span className="blog-card-icon">{post.icon}</span>
                  <h3 className="blog-card-title">{post.title}</h3>
                  <p className="blog-card-desc">{post.description}</p>
                </div>

                <div className="blog-card-footer">
                  <span className="blog-card-date">{post.date}</span>
                  <button onClick={() => handleGetStarted()} className="blog-read-more-btn">
                    Read Article →
                  </button>
                </div>
              </motion.article>
            ))
          ) : (
            <div className="no-posts-found glass-panel">
              <span className="no-posts-icon">🔍</span>
              <h3>No articles found for "{searchQuery}"</h3>
              <p>Try searching for resume, interview, roadmap, or portfolio topics.</p>
              <button onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }} className="btn-gradient-primary">
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
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

export default Blog;
