import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  getSettings,
  updateSettings,
  changePassword,
  deleteAccount
} from '../../services/settingsService';
import '../../styles/auth.css';
import '../../styles/profile.css';

const DEFAULT_SETTINGS = {
  theme: 'dark',
  notifications: {
    inApp: true,
    email: true,
    careerRecommendations: true,
    aiMentor: true,
    jobAlerts: true,
  },
  privacy: {
    profileVisibility: 'public',
  },
};

function Settings() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  // Settings State
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);

  // Toast State
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });

  // Delete Account Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast Helper
  const showToast = (msg, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 4000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(''), 3500);
    }
  };

  // Fetch settings from MongoDB
  const fetchSettingsData = async () => {
    try {
      setLoading(true);
      const res = await getSettings();
      if (res && res.settings) {
        setSettings({
          ...res.settings,
          theme: theme || res.settings.theme || 'dark',
        });
      }
    } catch (err) {
      console.error('Error loading settings:', err);
      showToast(err.response?.data?.message || 'Unable to load saved settings.', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSettingsData();
    }
  }, [user]);

  // Handle Theme Change
  const handleThemeChange = async (newTheme) => {
    const validTheme = newTheme === 'light' ? 'light' : 'dark';
    setTheme(validTheme);
    setSettings(prev => ({ ...prev, theme: validTheme }));
    setSavingKey('theme');

    try {
      await updateSettings({ theme: validTheme });
      showToast('Theme preference saved');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to persist theme setting.', true);
    } finally {
      setSavingKey(null);
    }
  };

  // Handle Notification Toggle Change
  const handleNotificationToggle = async (key) => {
    const updatedVal = !settings.notifications[key];
    const updatedNotifications = {
      ...settings.notifications,
      [key]: updatedVal,
    };

    setSettings(prev => ({
      ...prev,
      notifications: updatedNotifications,
    }));
    setSavingKey(`notif-${key}`);

    try {
      await updateSettings({
        notifications: { [key]: updatedVal },
      });
      showToast('Notification preference updated');
    } catch (err) {
      // Revert on error
      setSettings(prev => ({
        ...prev,
        notifications: { ...prev.notifications, [key]: !updatedVal },
      }));
      showToast(err.response?.data?.message || 'Failed to update notification setting.', true);
    } finally {
      setSavingKey(null);
    }
  };

  // Handle Privacy Change
  const handlePrivacyChange = async (newVisibility) => {
    setSettings(prev => ({
      ...prev,
      privacy: { ...prev.privacy, profileVisibility: newVisibility },
    }));
    setSavingKey('privacy');

    try {
      await updateSettings({
        privacy: { profileVisibility: newVisibility },
      });
      showToast('Privacy preference updated');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update privacy setting.', true);
    } finally {
      setSavingKey(null);
    }
  };

  // Handle Change Password Submit
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!passwordForm.currentPassword) {
      setPasswordError('Current password is required.');
      return;
    }
    if (!passwordForm.newPassword) {
      setPasswordError('New password is required.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    try {
      setPasswordSaving(true);
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      showToast('Password changed successfully!');
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  // Handle Delete Account Submit
  const handleDeleteAccountSubmit = async (e) => {
    e.preventDefault();
    setDeleteError('');

    if (!deletePassword) {
      setDeleteError('Password is required to confirm account deletion.');
      return;
    }

    try {
      setIsDeleting(true);
      await deleteAccount({ password: deletePassword });
      showToast('Account deleted successfully. Logging out...');
      setTimeout(() => {
        logout();
      }, 1500);
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Incorrect password. Account deletion canceled.');
      setIsDeleting(false);
    }
  };

  // Helper date formatter
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Joined 2026';
    try {
      const date = new Date(dateStr);
      return `Joined ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
    } catch (e) {
      return 'Joined 2026';
    }
  };

  return (
    <div className="profile-page-container">

      {/* Toast Notification */}
      <AnimatePresence>
        {(successMsg || errorMsg) && (
          <motion.div
            className={`profile-toast ${errorMsg ? 'toast-error' : 'toast-success'}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <span>{errorMsg ? '⚠️' : '✅'}</span>
            <span>{errorMsg || successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="profile-loading-wrapper">
          <div className="profile-skeleton-card" />
          <div className="profile-skeleton-card" />
          <div className="profile-skeleton-card" />
        </div>
      ) : (
        <div className="profile-main-content">

          {/* PAGE HEADER */}
          <div className="profile-page-header">
            <div className="header-text-group">
              <h1 className="profile-page-title">Settings</h1>
              <p className="profile-page-subtitle">
                Manage your account, preferences and privacy.
              </p>
            </div>
          </div>

          {/* 1. ACCOUNT CARD */}
          <div className="profile-card">
            <div className="card-header-row">
              <div className="card-title-group">
                <span className="card-title-icon icon-purple">👤</span>
                <h3 className="card-title-text">Account Information</h3>
              </div>
            </div>

            <div className="info-fields-grid-3">
              <div className="field-item-box">
                <span className="field-label">Email Address</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="field-value">{user?.email || 'user@skillforge.ai'}</span>
                  <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.45rem', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>🔒 Read-only</span>
                </div>
              </div>

              <div className="field-item-box">
                <span className="field-label">Full Name</span>
                <span className="field-value">{user?.name || 'Developer User'}</span>
              </div>

              <div className="field-item-box">
                <span className="field-label">Account Role</span>
                <span className="field-value highlight-purple">{user?.role || 'Developer'}</span>
              </div>

              <div className="field-item-box">
                <span className="field-label">Member Since</span>
                <span className="field-value">{formatDate(user?.createdAt)}</span>
              </div>

              <div className="field-item-box field-span-2">
                <span className="field-label">Security Credentials</span>
                <button
                  type="button"
                  onClick={() => {
                    setPasswordError('');
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setShowPasswordModal(true);
                  }}
                  className="btn-add-skill-row"
                  style={{ marginTop: '0.25rem' }}
                >
                  🔑 Change Password
                </button>
              </div>
            </div>
          </div>

          {/* 2. APPEARANCE CARD */}
          <div className="profile-card">
            <div className="card-header-row">
              <div className="card-title-group">
                <span className="card-title-icon icon-pink">🎨</span>
                <h3 className="card-title-text">Appearance & Theme</h3>
              </div>
            </div>

            <div className="skills-edit-section">
              <p className="skills-edit-subtext">Choose how SkillForge AI looks to you. Select a theme mode preference.</p>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => handleThemeChange('dark')}
                  className={`skill-pill-badge ${theme === 'dark' ? 'active-theme-btn' : ''}`}
                  style={{
                    padding: '0.75rem 1.5rem',
                    cursor: 'pointer',
                    background: theme === 'dark' ? 'rgba(139, 92, 246, 0.25)' : 'var(--bg-secondary)',
                    border: theme === 'dark' ? '1.5px solid #8B5CF6' : '1px solid var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <span>🌙 Dark Mode</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleThemeChange('light')}
                  className={`skill-pill-badge ${theme === 'light' ? 'active-theme-btn' : ''}`}
                  style={{
                    padding: '0.75rem 1.5rem',
                    cursor: 'pointer',
                    background: theme === 'light' ? 'rgba(139, 92, 246, 0.25)' : 'var(--bg-secondary)',
                    border: theme === 'light' ? '1.5px solid #8B5CF6' : '1px solid var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <span>☀️ Light Mode</span>
                </button>
              </div>
            </div>
          </div>

          {/* 3. NOTIFICATIONS CARD */}
          <div className="profile-card">
            <div className="card-header-row">
              <div className="card-title-group">
                <span className="card-title-icon icon-cyan">🔔</span>
                <h3 className="card-title-text">Notification Preferences</h3>
              </div>
            </div>

            <div className="skills-edit-section">
              <p className="skills-edit-subtext">Manage which triggers and alerts send notifications to your account.</p>

              <div className="skills-edit-list">
                
                {/* In-App Notifications */}
                <div className="skill-edit-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <label className="custom-label" style={{ marginBottom: '0.2rem', display: 'block' }}>In-App Notifications</label>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Show notifications banner in the application dashboard.</span>
                  </div>
                  <label className="settings-switch">
                    <input
                      type="checkbox"
                      checked={settings.notifications?.inApp ?? true}
                      onChange={() => handleNotificationToggle('inApp')}
                    />
                    <span className="settings-slider round" />
                  </label>
                </div>

                {/* Email Notifications */}
                <div className="skill-edit-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <label className="custom-label" style={{ marginBottom: '0.2rem', display: 'block' }}>Email Notifications</label>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Receive important alerts and updates via email.</span>
                  </div>
                  <label className="settings-switch">
                    <input
                      type="checkbox"
                      checked={settings.notifications?.email ?? true}
                      onChange={() => handleNotificationToggle('email')}
                    />
                    <span className="settings-slider round" />
                  </label>
                </div>

                {/* Career Recommendations */}
                <div className="skill-edit-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <label className="custom-label" style={{ marginBottom: '0.2rem', display: 'block' }}>Career Recommendations</label>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Personalized learning paths and skill gap suggestions.</span>
                  </div>
                  <label className="settings-switch">
                    <input
                      type="checkbox"
                      checked={settings.notifications?.careerRecommendations ?? true}
                      onChange={() => handleNotificationToggle('careerRecommendations')}
                    />
                    <span className="settings-slider round" />
                  </label>
                </div>

                {/* AI Mentor Updates */}
                <div className="skill-edit-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <label className="custom-label" style={{ marginBottom: '0.2rem', display: 'block' }}>AI Mentor Updates</label>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Nudges and study milestones from your AI mentor.</span>
                  </div>
                  <label className="settings-switch">
                    <input
                      type="checkbox"
                      checked={settings.notifications?.aiMentor ?? true}
                      onChange={() => handleNotificationToggle('aiMentor')}
                    />
                    <span className="settings-slider round" />
                  </label>
                </div>

                {/* Job Alerts */}
                <div className="skill-edit-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <label className="custom-label" style={{ marginBottom: '0.2rem', display: 'block' }}>Job & Assessment Opportunities</label>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Notifications when recruiters view your verified skills.</span>
                  </div>
                  <label className="settings-switch">
                    <input
                      type="checkbox"
                      checked={settings.notifications?.jobAlerts ?? true}
                      onChange={() => handleNotificationToggle('jobAlerts')}
                    />
                    <span className="settings-slider round" />
                  </label>
                </div>

              </div>
            </div>
          </div>

          {/* 4. PRIVACY CARD */}
          <div className="profile-card">
            <div className="card-header-row">
              <div className="card-title-group">
                <span className="card-title-icon icon-blue">🌐</span>
                <h3 className="card-title-text">Privacy & Visibility</h3>
              </div>
            </div>

            <div className="skills-edit-section">
              <p className="skills-edit-subtext">Control who can discover and view your verified developer profile.</p>

              <div className="form-group-custom" style={{ maxWidth: '400px', marginTop: '0.5rem' }}>
                <label className="custom-label">Profile Visibility Mode</label>
                <select
                  className="custom-select"
                  value={settings.privacy?.profileVisibility || 'public'}
                  onChange={(e) => handlePrivacyChange(e.target.value)}
                >
                  <option value="public">Public (Discoverable by verified recruiters & public searches)</option>
                  <option value="private">Private (Visible only to you and authorized workspace admins)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 5. DANGER ZONE CARD */}
          <div className="profile-card" style={{ borderColor: 'rgba(239, 68, 68, 0.25)', background: 'rgba(239, 68, 68, 0.02)' }}>
            <div className="card-header-row">
              <div className="card-title-group">
                <span className="card-title-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' }}>⚠️</span>
                <h3 className="card-title-text" style={{ color: '#EF4444' }}>Danger Zone</h3>
              </div>
            </div>

            <div className="skills-edit-section">
              <p className="skills-edit-subtext">Actions in this section are permanent and affect your account access.</p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Delete Account</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Permanently remove your account, profile badges, and all associated data.</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setDeleteError('');
                    setDeletePassword('');
                    setShowDeleteModal(true);
                  }}
                  className="btn-remove-skill-row"
                  style={{ padding: '0.75rem 1.5rem', fontWeight: 700 }}
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="profile-modal-overlay">
            <motion.div
              className="profile-modal-container"
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
            >
              <div className="modal-header-bar">
                <div>
                  <h2 className="modal-title-text">Change Password</h2>
                  <p className="modal-subtitle-text">Update your security credentials for SkillForge AI.</p>
                </div>
                <button type="button" onClick={() => setShowPasswordModal(false)} className="modal-close-btn">
                  ✕
                </button>
              </div>

              {passwordError && (
                <div style={{ padding: '0.85rem 1.25rem', borderRadius: '10px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', fontSize: '0.88rem', fontWeight: 600, margin: '1rem 1.5rem 0 1.5rem' }}>
                  ⚠️ {passwordError}
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="modal-form-body">
                
                {/* Current Password */}
                <div className="form-group-custom">
                  <label className="custom-label">Current Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPass.current ? 'text' : 'password'}
                      className="custom-input"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      placeholder="Enter your current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(prev => ({ ...prev, current: !prev.current }))}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'var(--text-secondary)' }}
                    >
                      {showPass.current ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="form-group-custom">
                  <label className="custom-label">New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPass.new ? 'text' : 'password'}
                      className="custom-input"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="At least 6 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(prev => ({ ...prev, new: !prev.new }))}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'var(--text-secondary)' }}
                    >
                      {showPass.new ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="form-group-custom">
                  <label className="custom-label">Confirm New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPass.confirm ? 'text' : 'password'}
                      className="custom-input"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      placeholder="Re-enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(prev => ({ ...prev, confirm: !prev.confirm }))}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'var(--text-secondary)' }}
                    >
                      {showPass.confirm ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <div className="modal-footer-row">
                  <button type="button" onClick={() => setShowPasswordModal(false)} className="btn-cancel-modal">
                    Cancel
                  </button>
                  <button type="submit" disabled={passwordSaving} className="btn-gradient-primary btn-save-modal">
                    {passwordSaving ? 'Updating...' : 'Save New Password'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE ACCOUNT CONFIRMATION MODAL */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="profile-modal-overlay">
            <motion.div
              className="profile-modal-container"
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
            >
              <div className="modal-header-bar">
                <div>
                  <h2 className="modal-title-text" style={{ color: '#EF4444' }}>Delete Account</h2>
                  <p className="modal-subtitle-text">This action permanently deletes your account and all associated data.</p>
                </div>
                <button type="button" onClick={() => setShowDeleteModal(false)} className="modal-close-btn">
                  ✕
                </button>
              </div>

              {deleteError && (
                <div style={{ padding: '0.85rem 1.25rem', borderRadius: '10px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', fontSize: '0.88rem', fontWeight: 600, margin: '1rem 1.5rem 0 1.5rem' }}>
                  ⚠️ {deleteError}
                </div>
              )}

              <form onSubmit={handleDeleteAccountSubmit} className="modal-form-body">
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Are you sure you want to permanently delete your <strong>SkillForge AI</strong> account? To confirm deletion, please enter your password below:
                </p>

                <div className="form-group-custom">
                  <label className="custom-label">Account Password</label>
                  <input
                    type="password"
                    className="custom-input"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Enter your password to confirm"
                  />
                </div>

                <div className="modal-footer-row">
                  <button type="button" onClick={() => setShowDeleteModal(false)} className="btn-cancel-modal">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isDeleting}
                    style={{
                      background: 'rgba(239, 68, 68, 0.9)',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {isDeleting ? 'Deleting Account...' : 'Permanently Delete Account'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default Settings;
