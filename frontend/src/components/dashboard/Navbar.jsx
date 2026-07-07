import React from 'react';

function Navbar({ user, toggleSidebar }) {
  // Get first letter of user name for avatar fallback
  const avatarLetter = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <nav className="navbar-container">
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button className="menu-toggle" onClick={toggleSidebar}>
          ☰
        </button>
        <h1 className="navbar-title">Developer Dashboard</h1>
      </div>
      
      <div className="navbar-profile">
        <div className="navbar-info" style={{ textAlign: 'right' }}>
          <span className="navbar-name">{user?.name || 'User'}</span>
          <span className="navbar-role">{user?.role || 'Developer'}</span>
        </div>
        <div className="navbar-avatar">
          {avatarLetter}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
