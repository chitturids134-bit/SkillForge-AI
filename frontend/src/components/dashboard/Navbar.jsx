import { getAvatarUrl } from '../../utils/avatarUtils';
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import StatusBadge from '../common/StatusBadge';
import logoImg from '../../assets/logo.png';

const formatRelativeTime = (dateStr) => {
  if (!dateStr) return 'Just now';
  try {
    const now = new Date();
    const past = new Date(dateStr);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) {
      const mins = Math.floor(diffInSeconds / 60);
      return `${mins} ${mins === 1 ? 'min' : 'mins'} ago`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }
    const days = Math.floor(diffInSeconds / 86400);
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days} days ago`;
    return past.toLocaleDateString();
  } catch (e) {
    return 'Recently';
  }
};

const getNotifIconConfig = (type) => {
  switch (type) {
    case 'WELCOME':
      return { icon: '🎉', bg: 'rgba(236, 72, 153, 0.15)', color: '#EC4899' };
    case 'PROFILE_UPDATE':
      return { icon: '👤', bg: 'rgba(108, 99, 255, 0.15)', color: '#6C63FF' };
    case 'RESUME_ANALYSIS':
    case 'ATS_SCORE':
      return { icon: '📄', bg: 'rgba(0, 212, 255, 0.15)', color: '#00D4FF' };
    case 'INTERVIEW':
      return { icon: '🎤', bg: 'rgba(34, 197, 94, 0.15)', color: '#22C55E' };
    case 'ROADMAP':
      return { icon: '🛣️', bg: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' };
    case 'AI_MENTOR':
      return { icon: '🤖', bg: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6' };
    case 'SKILL_RECOMMENDATION':
      return { icon: '⚡', bg: 'rgba(234, 179, 8, 0.15)', color: '#EAB308' };
    case 'JOB_MATCH':
      return { icon: '💼', bg: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6' };
    default:
      return { icon: '🔔', bg: 'rgba(108, 99, 255, 0.15)', color: '#6C63FF' };
  }
};

function Navbar({ toggleSidebar }) {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
    } catch (e) {}
    return !document.documentElement.classList.contains('light-mode') && !document.body.classList.contains('light-mode');
  });

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  const avatarLetter = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  const resolvedUserAvatar = getAvatarUrl(user?.profilePhoto || user?.avatar);

  // Sync DOM classes and state on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'light') {
        document.documentElement.classList.add('light-mode');
        document.body.classList.add('light-mode');
        setIsDarkMode(false);
      } else if (savedTheme === 'dark') {
        document.documentElement.classList.remove('light-mode');
        document.body.classList.remove('light-mode');
        setIsDarkMode(true);
      }
    } catch (e) {}
  }, []);

  // Close dropdowns on click outside or ESC key press
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifDropdownOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
        setNotifDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Theme toggle logic with localStorage persistence
  const toggleTheme = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    try {
      if (nextMode) {
        document.documentElement.classList.remove('light-mode');
        document.body.classList.remove('light-mode');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.add('light-mode');
        document.body.classList.add('light-mode');
        localStorage.setItem('theme', 'light');
      }
    } catch (e) {}
  };

  const getPageTitle = (path) => {
    if (path.includes('/developer/dashboard')) return 'Developer Dashboard';
    if (path.includes('/recruiter/dashboard')) return 'Recruiter Workspace';
    if (path.includes('/admin/dashboard')) return 'Admin Overview';
    if (path.includes('/profile')) return 'My Profile';
    if (path.includes('/resume')) return 'Resume Builder & ATS Studio';
    if (path.includes('/interview')) return 'AI Interview Prep';
    if (path.includes('/roadmap')) return 'Career Roadmap Generator';
    if (path.includes('/assessments')) return 'Skill Assessments';
    if (path.includes('/analytics')) return 'Career Growth & Skill Analytics';
    if (path.includes('/mentor')) return 'AI Mentorship Assistant';
    if (path.includes('/messages')) return 'Messages & Chat';
    if (path.includes('/notifications')) return 'Notifications Center';
    if (path.includes('/achievements')) return 'Achievements & Badges';
    if (path.includes('/settings')) return 'Platform Settings';
    if (path.includes('/recruiter/jobs')) return 'Job Management';
    if (path.includes('/recruiter/candidates')) return 'Candidate Search & Talent';
    if (path.includes('/recruiter/applications')) return 'Applications Pipeline';
    if (path.includes('/admin/users')) return 'User Management';
    if (path.includes('/admin/verifications')) return 'Verification Queue';
    return 'SkillForge AI Workspace';
  };

  return (
    <nav className="navbar-container">
      <div className="navbar-left-section">
        <button className="menu-toggle" onClick={toggleSidebar} aria-label="Toggle Navigation">
          ☰
        </button>
        <div className="navbar-brand-mobile">
          <img src={logoImg} alt="SkillForge AI Logo" className="navbar-logo-img" />
        </div>
        <div className="navbar-title-wrapper">
          <h1 className="navbar-title">{getPageTitle(location.pathname)}</h1>
        </div>
      </div>

      <div className="navbar-right-section">
        {/* Notification Bell with Floating Popover Dropdown (Desktop/Tablet) & Bottom Sheet (Mobile) */}
        <div className="navbar-notif-wrapper" ref={notifRef}>
          <motion.button
            whileHover={{ y: -2, scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            className={`navbar-notification-btn ${notifDropdownOpen ? 'active' : ''}`}
            onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
            title="Notifications"
            aria-label="Notifications"
            type="button"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="notification-bell-icon">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="notification-badge-count">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </motion.button>

          <AnimatePresence>
            {notifDropdownOpen && (
              <>
                {/* Translucent Backdrop Overlay for Mobile Bottom Sheet */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="notif-mobile-backdrop"
                  onClick={() => setNotifDropdownOpen(false)}
                />

                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.96 }}
                  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                  className="notification-popover-dropdown glass-panel"
                >
                  {/* Drag Handle Bar for Mobile Bottom Sheet */}
                  <div className="notif-drag-handle" onClick={() => setNotifDropdownOpen(false)} />

                  {/* Header */}
                  <div className="notif-dropdown-header">
                    <div className="notif-header-title-row">
                      <span className="notif-header-title">🔔 Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          className="notif-mark-read-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAllAsRead();
                          }}
                          title="Mark all notifications as read"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="notif-header-sub">
                      {unreadCount > 0
                        ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}.`
                        : 'You have no unread notifications.'}
                    </div>
                  </div>

                  {/* Notifications Cards List */}
                  <div className="notif-cards-list">
                    {notifications.length === 0 ? (
                      <div className="notif-empty-state" style={{ padding: '2rem 1rem', textAlign: 'center' }}>
                        <span style={{ fontSize: '2rem' }}>🔔</span>
                        <p style={{ fontWeight: 700, margin: '0.5rem 0 0.2rem 0', color: 'var(--text-primary)' }}>You're all caught up!</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>You don't have any notifications right now.</p>
                      </div>
                    ) : (
                      notifications.slice(0, 15).map((n) => {
                        const notifId = n._id || n.id;
                        const iconCfg = getNotifIconConfig(n.type);
                        const isUnread = !n.isRead;

                        return (
                          <motion.div
                            key={notifId}
                            whileTap={{ opacity: 0.7 }}
                            className={`notif-card-item ${isUnread ? 'unread' : ''}`}
                            onClick={() => {
                              if (isUnread) markAsRead(notifId);
                              setNotifDropdownOpen(false);
                              if (n.link) navigate(n.link);
                            }}
                          >
                            <div className="notif-card-icon-box" style={{ backgroundColor: iconCfg.bg, color: iconCfg.color }}>
                              {iconCfg.icon}
                            </div>
                            <div className="notif-card-content">
                              <div className="notif-card-title">{n.title}</div>
                              <div className="notif-card-desc">{n.message || n.desc}</div>
                              <div className="notif-card-time">{formatRelativeTime(n.createdAt || n.time)}</div>
                            </div>
                            {isUnread && <div className="notif-unread-dot" title="Unread" />}
                          </motion.div>
                        );
                      })
                    )}
                  </div>

                  {/* Footer Button */}
                  <div className="notif-dropdown-footer">
                    <button
                      type="button"
                      className="notif-view-all-btn"
                      onClick={() => {
                        setNotifDropdownOpen(false);
                        navigate('/notifications');
                      }}
                    >
                      View All Notifications →
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Dark / Light Theme Toggle Button (Line Art Crescent Moon / Sun) */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="navbar-action-btn"
          onClick={toggleTheme}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Theme"
          style={{ cursor: 'pointer' }}
        >
          {isDarkMode ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          )}
        </motion.button>

        {/* Profile Avatar & Interactive Dropdown */}
        <div className="navbar-profile-wrapper" ref={dropdownRef} style={{ position: 'relative' }}>
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="navbar-profile"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{ cursor: 'pointer' }}
          >
            <div className="navbar-info">
              <span className="navbar-name">{user?.name || 'User'}</span>
              <span className="navbar-role">{user?.role || 'Developer'}</span>
            </div>
            <div className="navbar-avatar">
              {resolvedUserAvatar ? (
                <img src={resolvedUserAvatar} alt={user?.name || 'User'} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                avatarLetter
              )}
            </div>
          </motion.div>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="navbar-dropdown glass-panel"
                style={{
                  position: 'absolute',
                  top: '120%',
                  right: 0,
                  width: '240px',
                  padding: '1rem',
                  zIndex: 200,
                  boxShadow: '0 15px 35px rgba(0, 0, 0, 0.4)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}
              >
                {/* User Card Header */}
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    {user?.name || 'Developer'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    {user?.email || 'user@skillforge.ai'}
                  </div>
                  <div style={{ marginTop: '0.5rem' }}>
                    <StatusBadge type={user?.role || 'Developer'} />
                  </div>
                </div>

                {/* Dropdown Links */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div
                    className="dropdown-item"
                    onClick={() => { navigate('/profile'); setDropdownOpen(false); }}
                  >
                    <span>👤</span> My Profile
                  </div>
                  <div
                    className="dropdown-item"
                    onClick={() => { navigate('/settings'); setDropdownOpen(false); }}
                  >
                    <span>⚙️</span> Settings
                  </div>
                </div>

                {/* Logout Button */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                  <div
                    className="dropdown-item danger"
                    onClick={() => { logout(); setDropdownOpen(false); }}
                  >
                    <span>🚪</span> Logout
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
