import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/dashboard.css';

function DashboardLayout({ children }) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="dashboard-root">
      {/* Fixed Sidebar - desktop always visible, mobile toggled */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Mobile backdrop overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>

      {/* Main workspace: takes remaining width */}
      <div className="main-workspace">
        {/* Fixed Navbar at top */}
        <Navbar user={user} toggleSidebar={toggleSidebar} />

        {/* Scrollable content area */}
        <div className="content-area">
          <motion.main
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column' }}
          >
            {children ? children : <Outlet />}
          </motion.main>
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
