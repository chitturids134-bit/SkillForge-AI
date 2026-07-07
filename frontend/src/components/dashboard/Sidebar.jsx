import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Sidebar({ isOpen, toggleSidebar }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleMenuClick = (path) => {
    navigate(path);
    if (isOpen && toggleSidebar) {
      toggleSidebar();
    }
  };

  return (
    <aside className={`sidebar-container ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">SkillForge AI</div>
      </div>
      <ul className="sidebar-menu">
        <li>
          <div className="sidebar-link active" onClick={() => handleMenuClick('/developer/dashboard')}>
            <span>📊</span> Dashboard
          </div>
        </li>
        <li>
          <div className="sidebar-link" onClick={() => handleMenuClick('/profile')}>
            <span>👤</span> My Profile
          </div>
        </li>
        <li>
          <div className="sidebar-link" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
            <span>📝</span> Assessments
          </div>
        </li>
        <li>
          <div className="sidebar-link" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
            <span>⚙️</span> Settings
          </div>
        </li>
      </ul>
      <div className="sidebar-footer">
        <div className="sidebar-link" onClick={logout} style={{ color: 'var(--accent-error)' }}>
          <span>🚪</span> Logout
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
