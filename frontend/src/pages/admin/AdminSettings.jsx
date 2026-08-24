import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  getAdminSettings,
  updateAdminSettings,
} from '../../services/adminService';

function AdminSettings() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Settings State
  const [initialData, setInitialData] = useState(null);
  const [account, setAccount] = useState({});
  const [activity, setActivity] = useState({});
  const [notifications, setNotifications] = useState({
    inApp: true,
    recruiterVerification: true,
    supportTickets: true,
    platformActivity: true,
    securityAlerts: true,
    systemIssues: true,
  });
  const [platform, setPlatform] = useState({
    registrationEnabled: true,
    recruiterVerificationMode: 'manual',
    jobReviewMode: 'review',
    maintenanceMode: false,
  });

  // UI State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (text, isError = false) => {
    setToastMsg({ text, isError });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAdminSettings();
      if (res?.success) {
        setAccount(res.account || {});
        setActivity(res.activity || {});
        setNotifications(res.notifications || {});
        setPlatform(res.platform || {});
        setInitialData({
          notifications: res.notifications,
          platform: res.platform,
        });
      }
    } catch (err) {
      console.error('Fetch admin settings error:', err);
      setError(err.response?.data?.message || 'Failed to load settings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Check if form has unsaved changes
  const hasChanges =
    initialData &&
    (JSON.stringify(notifications) !== JSON.stringify(initialData.notifications) ||
      JSON.stringify(platform) !== JSON.stringify(initialData.platform));

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const res = await updateAdminSettings({ notifications, platform });
      if (res?.success) {
        showToast('Admin settings saved successfully!');
        setInitialData({ notifications: res.notifications, platform: res.platform });
      }
    } catch (err) {
      console.error('Save settings error:', err);
      showToast(err.response?.data?.message || 'Failed to save settings', true);
    } finally {
      setSaving(false);
    }
  };

  const handleResetSettings = () => {
    if (initialData) {
      setNotifications(initialData.notifications);
      setPlatform(initialData.platform);
    }
  };

  return (
    <div className="admin-settings-page" style={{ width: '100%', maxWidth: 'none', minHeight: 'calc(100vh - 70px)', padding: '1.75rem 2rem', boxSizing: 'border-box' }}>
      
      {/* Toast Feedback */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              zIndex: 9999,
              background: toastMsg.isError ? '#EF4444' : '#10B981',
              color: '#FFFFFF',
              padding: '0.85rem 1.5rem',
              borderRadius: '10px',
              fontWeight: 700,
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            }}
          >
            {toastMsg.isError ? '⚠️ ' : '✅ '}
            {toastMsg.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER BAR */}
      <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', width: '100%' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8B5CF6', fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.2rem' }}>
            <span>⚙️</span> CONTROL CENTER PREFERENCES
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            Admin Settings
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', margin: '0.2rem 0 0 0' }}>
            Manage your administrator account, appearance, notifications, and platform preferences.
          </p>
        </div>

        {hasChanges && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={handleResetSettings}
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: '10px',
                background: 'none',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              Reset Changes
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleSaveSettings}
              style={{
                padding: '0.6rem 1.5rem',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #8B5CF6, #6C63FF)',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 700,
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '0.85rem',
                boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)',
              }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* LOADING & ERROR STATES */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-panel" style={{ height: '140px', borderRadius: '18px', background: 'var(--bg-card)', opacity: 0.6 }} />
          ))}
        </div>
      ) : error ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '18px', width: '100%' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h3 style={{ color: '#EF4444', fontSize: '1.25rem', fontWeight: 800 }}>Unable to load admin settings</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{error}</p>
          <button
            type="button"
            onClick={fetchSettings}
            style={{ marginTop: '1rem', padding: '0.65rem 1.5rem', borderRadius: '10px', background: '#8B5CF6', color: '#FFF', border: 'none', fontWeight: 700, cursor: 'pointer' }}
          >
            Retry Loading
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', width: '100%', alignItems: 'start' }}>
          
          {/* COLUMN 1 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
            
            {/* SECTION 1: ADMIN ACCOUNT */}
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '18px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', width: '100%', boxSizing: 'border-box' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 1rem 0' }}>👤 Admin Account</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Full Name</label>
                  <div style={{ padding: '0.65rem 0.85rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.9rem' }}>
                    {account.name || user?.name || 'SkillForge Admin'}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Email Address (Read-only)</label>
                  <div style={{ padding: '0.65rem 0.85rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {account.email || user?.email || 'admin@skillforge.ai'}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Role</div>
                    <span className="badge badge-primary" style={{ marginTop: '0.25rem', display: 'inline-block' }}>{account.role || 'Administrator'}</span>
                  </div>

                  <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Status</div>
                    <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: 800, fontSize: '0.75rem', marginTop: '0.25rem', display: 'inline-block' }}>
                      ● Active
                    </span>
                  </div>

                  <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Member Since</div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                      {account.createdAt ? new Date(account.createdAt).toLocaleDateString([], { month: 'short', year: 'numeric' }) : 'Aug 2026'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: APPEARANCE & THEME */}
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '18px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', width: '100%', boxSizing: 'border-box' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>🎨 Appearance & Theme</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 1rem 0' }}>Customize the control center appearance.</p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                    {theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Currently using {theme} theme throughout SkillForge AI.</div>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  style={{
                    padding: '0.55rem 1.25rem',
                    borderRadius: '10px',
                    background: theme === 'dark' ? '#3B82F6' : '#8B5CF6',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                  }}
                >
                  Switch to {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>
              </div>
            </div>

            {/* SECTION 3: ADMINISTRATOR ACTIVITY */}
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '18px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', width: '100%', boxSizing: 'border-box' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.85rem 0' }}>📋 Administrator Activity</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Last Login:</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{activity.lastLogin ? new Date(activity.lastLogin).toLocaleString() : 'Just now'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Account Created:</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{activity.createdAt ? new Date(activity.createdAt).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Admin Actions Logged:</span>
                  <span style={{ fontWeight: 800, color: '#8B5CF6' }}>{activity.actionCount || 0} recorded</span>
                </div>
              </div>
            </div>

          </div>

          {/* COLUMN 2 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
            
            {/* SECTION 4: ADMIN NOTIFICATIONS */}
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '18px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', width: '100%', boxSizing: 'border-box' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>🔔 Admin Notifications</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 1rem 0' }}>Receive alerts relevant to platform administration.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { key: 'inApp', label: 'In-App Admin Notifications', desc: 'Receive important platform alerts inside SkillForge AI.' },
                  { key: 'recruiterVerification', label: 'Recruiter Verification Alerts', desc: 'Notify when a recruiter verification request requires review.' },
                  { key: 'supportTickets', label: 'Support Ticket Alerts', desc: 'Notify when new support tickets require administrator attention.' },
                  { key: 'platformActivity', label: 'Platform Activity Alerts', desc: 'Notify about important administrative activity.' },
                  { key: 'securityAlerts', label: 'Security Alerts', desc: 'Notify about important account/security events.' },
                  { key: 'systemIssues', label: 'System Issue Alerts', desc: 'Notify when platform-level problems require attention.' },
                ].map((item) => (
                  <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.85rem' }}>{item.label}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.desc}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={!!notifications[item.key]}
                      onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 5: PLATFORM PREFERENCES */}
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '18px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', width: '100%', boxSizing: 'border-box' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>⚙️ Platform Preferences</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 1rem 0' }}>System-wide operational behavior controls.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                {/* Registration Enabled */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.85rem' }}>Default User Registration Status</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Allow new developers and recruiters to sign up.</div>
                  </div>
                  <select
                    value={platform.registrationEnabled ? 'enabled' : 'disabled'}
                    onChange={(e) => setPlatform({ ...platform, registrationEnabled: e.target.value === 'enabled' })}
                    style={{ padding: '0.35rem 0.65rem', borderRadius: '6px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.82rem', fontWeight: 700 }}
                  >
                    <option value="enabled">Enabled</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>

                {/* Verification Mode */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.85rem' }}>Recruiter Verification Mode</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Require manual admin review for recruiter badges.</div>
                  </div>
                  <select
                    value={platform.recruiterVerificationMode || 'manual'}
                    onChange={(e) => setPlatform({ ...platform, recruiterVerificationMode: e.target.value })}
                    style={{ padding: '0.35rem 0.65rem', borderRadius: '6px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.82rem', fontWeight: 700 }}
                  >
                    <option value="manual">Manual Review</option>
                    <option value="automatic">Automatic Approval</option>
                  </select>
                </div>

                {/* Job Review Mode */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.85rem' }}>New Job Posting Review</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Moderation before publishing job requisitions.</div>
                  </div>
                  <select
                    value={platform.jobReviewMode || 'review'}
                    onChange={(e) => setPlatform({ ...platform, jobReviewMode: e.target.value })}
                    style={{ padding: '0.35rem 0.65rem', borderRadius: '6px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.82rem', fontWeight: 700 }}
                  >
                    <option value="review">Review Required</option>
                    <option value="immediate">Publish Immediately</option>
                  </select>
                </div>

                {/* Maintenance Mode */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.85rem' }}>Platform Maintenance Mode</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Restrict non-admin access during upgrades.</div>
                  </div>
                  <select
                    value={platform.maintenanceMode ? 'on' : 'off'}
                    onChange={(e) => setPlatform({ ...platform, maintenanceMode: e.target.value === 'on' })}
                    style={{ padding: '0.35rem 0.65rem', borderRadius: '6px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: platform.maintenanceMode ? '#EF4444' : 'var(--text-primary)', fontSize: '0.82rem', fontWeight: 700 }}
                  >
                    <option value="off">OFF (Normal)</option>
                    <option value="on">ON (Maintenance)</option>
                  </select>
                </div>

              </div>
            </div>

          </div>

        </div>
      )}

      {/* UNSAVED CHANGES FLOATING ACTION BAR */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            style={{
              position: 'fixed',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'var(--bg-card)',
              border: '1px solid #8B5CF6',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              borderRadius: '14px',
              padding: '0.85rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              zIndex: 9999,
            }}
          >
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              ⚠️ You have unsaved changes
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={handleResetSettings}
                style={{ padding: '0.45rem 0.95rem', borderRadius: '8px', background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
              >
                Reset
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSaveSettings}
                style={{ padding: '0.45rem 1.25rem', borderRadius: '8px', background: '#8B5CF6', color: '#FFF', border: 'none', fontWeight: 700, fontSize: '0.82rem', cursor: saving ? 'not-allowed' : 'pointer' }}
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminSettings;
