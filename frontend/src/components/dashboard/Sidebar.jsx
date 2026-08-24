import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { getUnreadMessageCount } from '../../services/messageService';
import { motion } from 'framer-motion';
import logoImg from '../../assets/logo.png';

function Sidebar({ isOpen, toggleSidebar }) {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      getUnreadMessageCount()
        .then(res => {
          if (res && res.success) {
            setUnreadMsgCount(res.count || 0);
          }
        })
        .catch(() => {});
    }
  }, [user, location.pathname]);

  const handleMenuClick = (path) => {
    navigate(path);
    if (isOpen && toggleSidebar) {
      toggleSidebar();
    }
  };

  const userRole = user?.role || 'Developer';
  const isVerifiedRecruiter = userRole === 'Recruiter' ? user?.verificationStatus === 'verified' : true;

  const developerMenu = [
    { label: 'Dashboard', path: '/developer/dashboard', icon: '🏠' },
    { label: 'My Profile', path: '/profile', icon: '👤' },
    { label: 'Resume Studio', path: '/resume', icon: '📄' },
    { label: 'Resume Templates', path: '/resume/templates', icon: '📑' },
    { label: 'Resume History', path: '/resume/history', icon: '🕒' },
    { label: 'AI Interview', path: '/interview', icon: '🎤' },
    { label: 'Interviews', path: '/developer/interviews', icon: '📅' },
    { label: 'Interview History', path: '/interview/history', icon: '📊' },
    { label: 'Career Roadmap', path: '/roadmap', icon: '🛣' },
    { label: 'Skill Assessment', path: '/assessments', icon: '🧠' },
    { label: 'AI Mentor', path: '/mentor', icon: '🤖' },
    { label: 'Career Analytics', path: '/analytics', icon: '📈' },
    { label: 'Messages', path: '/messages', icon: '💬', badge: unreadMsgCount > 0 ? unreadMsgCount : null },
    { label: 'Notifications', path: '/notifications', icon: '🔔', badge: unreadCount > 0 ? unreadCount : null },
    { label: 'Achievements', path: '/achievements', icon: '🏆' },
    { label: 'Settings', path: '/settings', icon: '⚙' }
  ];

  const fullRecruiterMenu = [
    { label: 'Dashboard', path: '/recruiter/dashboard', icon: '📊' },
    { label: 'Verification', path: '/recruiter/verification', icon: '🛡️' },
    { label: 'Company Profile', path: '/recruiter/company', icon: '🏢' },
    { label: 'Job Management', path: '/recruiter/jobs', icon: '💼' },
    { label: 'Applications', path: '/recruiter/applications', icon: '📋' },
    { label: 'Candidate Search', path: '/recruiter/candidates', icon: '🔍' },
    { label: 'Interview Schedule', path: '/recruiter/interviews', icon: '📅' },
    { label: 'Analytics', path: '/recruiter/analytics', icon: '📈' },
    { label: 'Messages', path: '/recruiter/messages', icon: '💬', badge: unreadMsgCount > 0 ? unreadMsgCount : null },
    { label: 'Settings', path: '/recruiter/settings', icon: '⚙' }
  ];

  const unverifiedRecruiterMenu = [
    { label: 'Verification', path: '/recruiter/verification', icon: '🛡️' }
  ];

  const currentMenu = userRole === 'Admin'
    ? [
        { label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
        { label: 'Users', path: '/admin/users', icon: '👥' },
        { label: 'Recruiter Verification', path: '/admin/verifications', icon: '✅' },
        { label: 'Jobs', path: '/admin/jobs', icon: '💼' },
        { label: 'Platform Analytics', path: '/admin/analytics', icon: '📈' },
        { label: 'Activity Logs', path: '/admin/logs', icon: '📄' },
        { label: 'Support Tickets', path: '/admin/tickets', icon: '🎫' },
        { label: 'Settings', path: '/admin/settings', icon: '⚙' }
      ]
    : userRole === 'Recruiter'
    ? (isVerifiedRecruiter ? fullRecruiterMenu : unverifiedRecruiterMenu)
    : developerMenu;

  return (
    <aside className={`sidebar-container ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img src={logoImg} alt="SkillForge AI Logo" className="sidebar-logo-img" />
          <div className="sidebar-brand-text">
            <span className="gradient-text sidebar-brand-title">SkillForge AI</span>
            <span className="sidebar-brand-subtitle">AI Career Platform</span>
          </div>
        </div>
      </div>

      <ul className="sidebar-menu">
        {currentMenu.map((item, idx) => {
          const isActive = location.pathname === item.path;
          return (
            <li key={idx}>
              <motion.div
                whileHover={{ x: 4 }}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => handleMenuClick(item.path)}
              >
                <span className="sidebar-link-icon">{item.icon}</span>
                <span className="sidebar-link-label">{item.label}</span>
                {item.badge && (
                  <span className="sidebar-badge-count">{item.badge}</span>
                )}
              </motion.div>
            </li>
          );
        })}
      </ul>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-logout-button" onClick={logout}>
          <span>🚪</span>
          <span>Logout</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
