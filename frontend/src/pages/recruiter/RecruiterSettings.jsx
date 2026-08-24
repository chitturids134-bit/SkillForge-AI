import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  getRecruiterSettings,
  updateRecruiterSettings,
  changePassword,
} from '../../services/recruiterSettingsService';
import GradientButton from '../../components/common/GradientButton';

/* Helper to render Skeleton Loader */
function SkeletonLoader() {
  return (
    <div style={{ padding: '2rem', width: '100%' }}>
      <div style={{ width: '30%', height: '32px', borderRadius: '8px', background: 'var(--hover-bg)', marginBottom: '0.5rem' }} />
      <div style={{ width: '50%', height: '18px', borderRadius: '6px', background: 'var(--hover-bg)', marginBottom: '2rem' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem' }}>
        <div style={{ height: '300px', borderRadius: '14px', background: 'var(--hover-bg)' }} />
        <div style={{ height: '500px', borderRadius: '16px', background: 'var(--hover-bg)' }} />
      </div>
    </div>
  );
}

/* Tag Input Component for Preferred Skills */
function TagInput({ label, tags, onAddTag, onRemoveTag, placeholder }) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (inputValue.trim()) {
        onAddTag(inputValue.trim());
        setInputValue('');
      }
    }
  };

  const handleAddClick = () => {
    if (inputValue.trim()) {
      onAddTag(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.45rem' }}>
        {label}
      </label>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.65rem' }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={{
            flex: 1,
            padding: '0.65rem 0.9rem',
            borderRadius: '8px',
            background: 'var(--input-bg)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            fontSize: '0.88rem',
          }}
        />
        <button
          type="button"
          onClick={handleAddClick}
          style={{
            padding: '0.65rem 1rem',
            borderRadius: '8px',
            background: 'var(--hover-bg)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.85rem',
          }}
        >
          Add
        </button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {tags && tags.length > 0 ? (
          tags.map((tag, idx) => (
            <span
              key={idx}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '20px',
                background: 'rgba(139, 92, 246, 0.15)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                color: 'var(--text-primary)',
                fontSize: '0.82rem',
                fontWeight: 600,
              }}
            >
              {tag}
              <button
                type="button"
                onClick={() => onRemoveTag(tag)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  lineHeight: 1,
                  padding: 0,
                }}
              >
                ×
              </button>
            </span>
          ))
        ) : (
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            No skills added yet.
          </span>
        )}
      </div>
    </div>
  );
}

/* Multi-Select Chip Component */
function ChipGroup({ options, selected, onToggle }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
      {options.map((opt) => {
        const isSelected = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            style={{
              padding: '0.5rem 0.9rem',
              borderRadius: '20px',
              border: isSelected ? '1.5px solid #8B5CF6' : '1px solid var(--border-color)',
              background: isSelected ? 'rgba(139, 92, 246, 0.15)' : 'var(--input-bg)',
              color: 'var(--text-primary)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {isSelected ? '✓ ' : '+ '}
            {opt}
          </button>
        );
      })}
    </div>
  );
}

/* Toggle Switch Component */
function ToggleSwitch({ checked, onChange, label, description }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '0.75rem 0' }}>
      <div>
        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
        {description && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{description}</div>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        style={{
          width: '46px',
          height: '26px',
          borderRadius: '13px',
          background: checked ? '#8B5CF6' : 'var(--hover-bg)',
          border: '1px solid var(--border-color)',
          position: 'relative',
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'background 0.2s ease',
        }}
      >
        <span
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: '#FFFFFF',
            position: 'absolute',
            top: '2px',
            left: checked ? '22px' : '2px',
            transition: 'left 0.2s ease',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
        />
      </button>
    </div>
  );
}

const SECTIONS = [
  { id: 'account', label: 'Account', icon: '👤' },
  { id: 'preferences', label: 'Hiring Preferences', icon: '🎯' },
  { id: 'discovery', label: 'Candidate Discovery', icon: '🔍' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
  { id: 'privacy', label: 'Privacy & Visibility', icon: '🔒' },
  { id: 'company', label: 'Company Workspace', icon: '🏢' },
  { id: 'appearance', label: 'Appearance', icon: '🎨' },
  { id: 'security', label: 'Security', icon: '🛡️' },
  { id: 'danger', label: 'Danger Zone', icon: '⚠️' },
];

function RecruiterSettings() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  // Active section tab
  const [activeSection, setActiveSection] = useState('account');

  // Server & Form State
  const [initialSettings, setInitialSettings] = useState(null);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState(''); // active saving section
  const [saveStatus, setSaveStatus] = useState({}); // { sectionId: 'saved' | 'idle' }
  const [toast, setToast] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Password state
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Show Toast
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch Settings
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await getRecruiterSettings();
      if (res?.success && res.data) {
        setInitialSettings(res.data);
        setFormData(res.data);
      }
    } catch (err) {
      console.error('Fetch recruiter settings error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to load recruiter settings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Compute dirty state
  const isDirty = useMemo(() => {
    if (!initialSettings || !formData) return false;
    return JSON.stringify(formData) !== JSON.stringify(initialSettings);
  }, [formData, initialSettings]);

  // Generic Field Updater
  const updateNestedState = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const toggleArrayItem = (section, field, item) => {
    setFormData((prev) => {
      const currentList = prev[section][field] || [];
      const updated = currentList.includes(item)
        ? currentList.filter((i) => i !== item)
        : [...currentList, item];
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: updated,
        },
      };
    });
  };

  // Reset to last saved state
  const handleCancelSection = () => {
    if (initialSettings) {
      setFormData(initialSettings);
      showToast('Restored last saved preferences', 'success');
    }
  };

  // Save specific section to MongoDB
  const handleSaveSection = async (sectionId) => {
    try {
      setSavingSection(sectionId);
      const res = await updateRecruiterSettings(formData);
      if (res?.success && res.data) {
        setInitialSettings(res.data);
        setFormData(res.data);
        setSaveStatus((prev) => ({ ...prev, [sectionId]: 'saved' }));
        showToast('Recruiter settings updated successfully!');

        setTimeout(() => {
          setSaveStatus((prev) => ({ ...prev, [sectionId]: 'idle' }));
        }, 2500);
      }
    } catch (err) {
      console.error('Save recruiter settings error:', err);
      showToast(err.response?.data?.message || 'Failed to save settings', 'error');
    } finally {
      setSavingSection('');
    }
  };

  // Handle Password Change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      showToast('Please enter current and new passwords', 'error');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showToast('New password must be at least 6 characters long', 'error');
      return;
    }

    try {
      setPasswordSaving(true);
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      showToast('Password updated successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error('Password change error:', err);
      showToast(err.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setPasswordSaving(false);
    }
  };

  // Render Theme Switcher Option
  const handleThemeChange = async (targetTheme) => {
    setTheme(targetTheme);
    setFormData((prev) => ({ ...prev, theme: targetTheme }));
    try {
      await updateRecruiterSettings({ theme: targetTheme });
      showToast(`Theme switched to ${targetTheme} mode`);
    } catch (err) {
      console.error('Theme sync error:', err);
    }
  };

  if (loading) return <SkeletonLoader />;

  if (errorMsg && !formData) {
    return (
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center', borderRadius: '16px', background: 'var(--bg-card)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Unable to Load Recruiter Settings
          </h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 1.5rem auto', fontSize: '0.92rem' }}>
            {errorMsg}
          </p>
          <GradientButton onClick={fetchSettings}>🔄 Retry</GradientButton>
        </div>
      </div>
    );
  }

  const account = formData?.account || {};
  const preferences = formData?.preferences || {};
  const candidateDiscovery = formData?.candidateDiscovery || {};
  const notifications = formData?.notifications || {};
  const privacy = formData?.privacy || {};
  const company = formData?.company || {};

  return (
    <div style={{ padding: '2rem', width: '100%' }}>
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              zIndex: 9999,
              background: toast.type === 'error' ? '#EF4444' : '#10B981',
              color: '#FFFFFF',
              padding: '0.85rem 1.5rem',
              borderRadius: '10px',
              fontWeight: 600,
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            }}
          >
            {toast.type === 'error' ? '⚠️ ' : '✅ '}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Settings
            </h2>
            <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
              Recruiter Workspace
            </span>
            {isDirty && (
              <span className="badge badge-warning" style={{ fontSize: '0.75rem' }}>
                Unsaved Changes
              </span>
            )}
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.35rem', fontSize: '0.95rem' }}>
            Manage your recruiter workspace, hiring preferences, notifications, privacy and account security.
          </p>
        </div>
      </div>

      {/* Main Settings Layout (Sidebar Nav + Section Panels) */}
      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem' }}>
        {/* Navigation Sidebar */}
        <div className="glass-panel" style={{ padding: '0.75rem', borderRadius: '16px', background: 'var(--bg-card)', height: 'fit-content' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {SECTIONS.map((sec) => {
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveSection(sec.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: 'none',
                    background: isActive ? 'rgba(139, 92, 246, 0.18)' : 'transparent',
                    color: isActive ? '#8B5CF6' : 'var(--text-primary)',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: '1.1rem' }}>{sec.icon}</span>
                  {sec.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section Content Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* SECTION 1: ACCOUNT */}
          {activeSection === 'account' && (
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', background: 'var(--bg-card)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
                👤 Recruiter Account Profile
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={account.name || ''}
                    onChange={(e) => updateNestedState('account', 'name', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.9rem',
                      borderRadius: '8px',
                      background: 'var(--input-bg)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    Email Address (Read-Only)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={account.email || ''}
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.9rem',
                      borderRadius: '8px',
                      background: 'var(--hover-bg)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-muted)',
                      fontSize: '0.9rem',
                      cursor: 'not-allowed',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    Recruiter Title
                  </label>
                  <select
                    value={account.recruiterTitle || ''}
                    onChange={(e) => updateNestedState('account', 'recruiterTitle', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.9rem',
                      borderRadius: '8px',
                      background: 'var(--input-bg)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                    }}
                  >
                    <option value="Talent Acquisition Specialist">Talent Acquisition Specialist</option>
                    <option value="Technical Recruiter">Technical Recruiter</option>
                    <option value="Hiring Manager">Hiring Manager</option>
                    <option value="HR Manager">HR Manager</option>
                    <option value="Recruitment Lead">Recruitment Lead</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={account.phone || ''}
                    onChange={(e) => updateNestedState('account', 'phone', e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.9rem',
                      borderRadius: '8px',
                      background: 'var(--input-bg)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="recruiter-dashboard-cta-btn" onClick={() => handleSaveSection('account')} disabled={savingSection === 'account'}>
    {savingSection === 'account' ? 'Saving...' : saveStatus.account === 'saved' ? 'Saved ✓' : 'Save Account Changes'}
  </button>
              </div>
            </div>
          )}

          {/* SECTION 2: HIRING PREFERENCES */}
          {activeSection === 'preferences' && (
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', background: 'var(--bg-card)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                🎯 Hiring Preferences
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
                Configure how you discover, evaluate, and communicate with candidates.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    Preferred Hiring Types
                  </label>
                  <ChipGroup
                    options={['Full-time', 'Part-time', 'Contract', 'Internship']}
                    selected={preferences.hiringTypes || []}
                    onToggle={(item) => toggleArrayItem('preferences', 'hiringTypes', item)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    Preferred Work Modes
                  </label>
                  <ChipGroup
                    options={['Remote', 'Hybrid', 'Onsite']}
                    selected={preferences.workModes || []}
                    onToggle={(item) => toggleArrayItem('preferences', 'workModes', item)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    Experience Levels
                  </label>
                  <ChipGroup
                    options={['Entry', 'Mid', 'Senior', 'Lead']}
                    selected={preferences.experienceLevels || []}
                    onToggle={(item) => toggleArrayItem('preferences', 'experienceLevels', item)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    Hiring Categories
                  </label>
                  <ChipGroup
                    options={['Software Engineering', 'Data Science', 'AI / ML', 'Product', 'Design', 'Marketing', 'Sales', 'Operations', 'Finance', 'HR']}
                    selected={preferences.hiringCategories || []}
                    onToggle={(item) => toggleArrayItem('preferences', 'hiringCategories', item)}
                  />
                </div>

                <TagInput
                  label="Preferred Required Skills"
                  tags={preferences.preferredSkills || []}
                  onAddTag={(skill) => toggleArrayItem('preferences', 'preferredSkills', skill)}
                  onRemoveTag={(skill) => toggleArrayItem('preferences', 'preferredSkills', skill)}
                  placeholder="e.g. React, Node.js, Python"
                />

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Minimum AI Match Score Filter
                    </label>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#8B5CF6' }}>
                      {preferences.minimumMatchScore || 70}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="90"
                    step="5"
                    value={preferences.minimumMatchScore || 70}
                    onChange={(e) => updateNestedState('preferences', 'minimumMatchScore', Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#8B5CF6', cursor: 'pointer' }}
                  />
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    Only highlight candidates above this AI match score in discovery and pipeline views.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="recruiter-dashboard-cta-btn" onClick={() => handleSaveSection('preferences')} disabled={savingSection === 'preferences'}>
    {savingSection === 'preferences' ? 'Saving...' : saveStatus.preferences === 'saved' ? 'Saved ✓' : 'Save Hiring Preferences'}
  </button>
              </div>
            </div>
          )}

          {/* SECTION 3: CANDIDATE DISCOVERY */}
          {activeSection === 'discovery' && (
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', background: 'var(--bg-card)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
                🔍 Candidate Discovery Rules
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <ToggleSwitch
                  label="Automatically highlight high-match candidates"
                  description="Emphasize candidate cards exceeding your threshold"
                  checked={candidateDiscovery.highlightHighMatch ?? true}
                  onChange={(val) => updateNestedState('candidateDiscovery', 'highlightHighMatch', val)}
                />
                <ToggleSwitch
                  label="Prioritize verified skills"
                  description="Give higher weighting to candidates with verified skill badges"
                  checked={candidateDiscovery.prioritizeVerifiedSkills ?? true}
                  onChange={(val) => updateNestedState('candidateDiscovery', 'prioritizeVerifiedSkills', val)}
                />
                <ToggleSwitch
                  label="Prioritize candidates with completed assessments"
                  description="Filter for candidates who completed technical benchmark tests"
                  checked={candidateDiscovery.prioritizeCompletedAssessments ?? true}
                  onChange={(val) => updateNestedState('candidateDiscovery', 'prioritizeCompletedAssessments', val)}
                />
                <ToggleSwitch
                  label="Prioritize interview readiness score"
                  description="Show candidate readiness scores calculated by AI interview simulator"
                  checked={candidateDiscovery.prioritizeInterviewReadiness ?? true}
                  onChange={(val) => updateNestedState('candidateDiscovery', 'prioritizeInterviewReadiness', val)}
                />
                <ToggleSwitch
                  label="Show recently active candidates"
                  description="Highlight candidate profiles active within the last 14 days"
                  checked={candidateDiscovery.showRecentlyActive ?? true}
                  onChange={(val) => updateNestedState('candidateDiscovery', 'showRecentlyActive', val)}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Default Candidate Pipeline Sorting
                </label>
                <select
                  value={candidateDiscovery.defaultSort || 'AI Match Score'}
                  onChange={(e) => updateNestedState('candidateDiscovery', 'defaultSort', e.target.value)}
                  style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: '0.75rem 0.9rem',
                    borderRadius: '8px',
                    background: 'var(--input-bg)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                  }}
                >
                  <option value="AI Match Score">AI Match Score</option>
                  <option value="Most Recent">Most Recent</option>
                  <option value="Experience">Years of Experience</option>
                  <option value="Assessment Score">Assessment Score</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="recruiter-dashboard-cta-btn" onClick={() => handleSaveSection('discovery')} disabled={savingSection === 'discovery'}>
    {savingSection === 'discovery' ? 'Saving...' : saveStatus.discovery === 'saved' ? 'Saved ✓' : 'Save Discovery Preferences'}
  </button>
              </div>
            </div>
          )}

          {/* SECTION 4: RECRUITMENT NOTIFICATIONS */}
          {activeSection === 'notifications' && (
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', background: 'var(--bg-card)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
                🔔 Recruitment Notifications
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
                <ToggleSwitch
                  label="New Application Alerts"
                  description="Notify me when a candidate applies to my job postings"
                  checked={notifications.newApplication ?? true}
                  onChange={(val) => updateNestedState('notifications', 'newApplication', val)}
                />
                <ToggleSwitch
                  label="High Match Candidate Alerts"
                  description="Notify me when a candidate exceeds my match score threshold"
                  checked={notifications.highMatchCandidate ?? true}
                  onChange={(val) => updateNestedState('notifications', 'highMatchCandidate', val)}
                />
                <ToggleSwitch
                  label="Interview Schedule Reminders"
                  description="Send reminders before scheduled candidate technical screenings"
                  checked={notifications.interviewReminder ?? true}
                  onChange={(val) => updateNestedState('notifications', 'interviewReminder', val)}
                />
                <ToggleSwitch
                  label="Candidate Status Updates"
                  description="Notify me when a candidate accepts an offer or changes status"
                  checked={notifications.candidateStatusUpdate ?? true}
                  onChange={(val) => updateNestedState('notifications', 'candidateStatusUpdate', val)}
                />
                <ToggleSwitch
                  label="Candidate Messages"
                  description="Notify me when candidates send direct messages"
                  checked={notifications.candidateMessage ?? true}
                  onChange={(val) => updateNestedState('notifications', 'candidateMessage', val)}
                />
                <ToggleSwitch
                  label="Job Performance Trends"
                  description="Notify me about important application volume trends"
                  checked={notifications.jobPerformance ?? true}
                  onChange={(val) => updateNestedState('notifications', 'jobPerformance', val)}
                />
                <ToggleSwitch
                  label="Weekly Hiring Digest"
                  description="Receive a consolidated weekly summary of recruitment metrics"
                  checked={notifications.weeklyHiringSummary ?? true}
                  onChange={(val) => updateNestedState('notifications', 'weeklyHiringSummary', val)}
                />
              </div>

              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                Notification Channels
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <ToggleSwitch
                  label="Email Notifications"
                  checked={notifications.email ?? true}
                  onChange={(val) => updateNestedState('notifications', 'email', val)}
                />
                <ToggleSwitch
                  label="In-App Notifications"
                  checked={notifications.inApp ?? true}
                  onChange={(val) => updateNestedState('notifications', 'inApp', val)}
                />
                <ToggleSwitch
                  label="Browser Push Notifications"
                  checked={notifications.browser ?? true}
                  onChange={(val) => updateNestedState('notifications', 'browser', val)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="recruiter-dashboard-cta-btn" onClick={() => handleSaveSection('notifications')} disabled={savingSection === 'notifications'}>
    {savingSection === 'notifications' ? 'Saving...' : saveStatus.notifications === 'saved' ? 'Saved ✓' : 'Save Notification Settings'}
  </button>
              </div>
            </div>
          )}

          {/* SECTION 5: PRIVACY & VISIBILITY */}
          {activeSection === 'privacy' && (
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', background: 'var(--bg-card)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
                🔒 Recruiter Privacy & Visibility
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    Recruiter Profile Visibility
                  </label>
                  <select
                    value={privacy.profileVisibility || 'public'}
                    onChange={(e) => updateNestedState('privacy', 'profileVisibility', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.9rem',
                      borderRadius: '8px',
                      background: 'var(--input-bg)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                    }}
                  >
                    <option value="public">Public (Visible to all candidates)</option>
                    <option value="limited">Limited (Only candidates who applied)</option>
                    <option value="private">Private (Hidden from candidate directory)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    Candidate Contact Visibility
                  </label>
                  <select
                    value={privacy.candidateContactVisibility || 'after-application'}
                    onChange={(e) => updateNestedState('privacy', 'candidateContactVisibility', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.9rem',
                      borderRadius: '8px',
                      background: 'var(--input-bg)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                    }}
                  >
                    <option value="full">Full (Visible to all registered users)</option>
                    <option value="after-application">After Candidate Applies</option>
                    <option value="after-shortlist">Only After Shortlisting</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <ToggleSwitch
                  label="Show Recruiter Profile in Candidate Search"
                  checked={privacy.showInCandidateSearch ?? true}
                  onChange={(val) => updateNestedState('privacy', 'showInCandidateSearch', val)}
                />
                <ToggleSwitch
                  label="Allow Candidates to Contact Me Directly"
                  checked={privacy.allowCandidateContact ?? true}
                  onChange={(val) => updateNestedState('privacy', 'allowCandidateContact', val)}
                />
                <ToggleSwitch
                  label="Show Company Hiring Activity on Profile"
                  checked={privacy.showCompanyHiringActivity ?? true}
                  onChange={(val) => updateNestedState('privacy', 'showCompanyHiringActivity', val)}
                />
                <ToggleSwitch
                  label="Show Recruiter Online Status"
                  checked={privacy.showOnlineStatus ?? true}
                  onChange={(val) => updateNestedState('privacy', 'showOnlineStatus', val)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="recruiter-dashboard-cta-btn" onClick={() => handleSaveSection('privacy')} disabled={savingSection === 'privacy'}>
    {savingSection === 'privacy' ? 'Saving...' : saveStatus.privacy === 'saved' ? 'Saved ✓' : 'Save Privacy Settings'}
  </button>
              </div>
            </div>
          )}

          {/* SECTION 6: COMPANY WORKSPACE */}
          {activeSection === 'company' && (
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', background: 'var(--bg-card)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
                🏢 Company Workspace Information
              </h3>

              <div style={{ padding: '1.25rem', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                      {company.companyName || 'My Organization'}
                    </h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.25rem' }}>
                      {company.website || 'No website configured'}
                    </p>
                  </div>
                  {company.verificationStatus === 'verified' ? (
                    <span className="badge badge-success">✓ Verified Organization</span>
                  ) : company.verificationStatus === 'pending' ? (
                    <span className="badge badge-warning">Verification Pending</span>
                  ) : (
                    <span className="badge badge-secondary">Not Verified</span>
                  )}
                </div>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Company identity, branding logo, website, and verification are managed directly in your Company Profile center.
              </p>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button type="button" className="recruiter-dashboard-cta-btn" onClick={() => navigate('/recruiter/company')}>
    🏢 Manage Company Profile
  </button>
              </div>
            </div>
          )}

          {/* SECTION 7: APPEARANCE */}
          {activeSection === 'appearance' && (
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', background: 'var(--bg-card)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                🎨 Workspace Appearance
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Select your preferred theme. SkillForge AI supports Dark and Light themes.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                {/* Dark Mode Card */}
                <div
                  onClick={() => handleThemeChange('dark')}
                  style={{
                    padding: '1.25rem',
                    borderRadius: '14px',
                    border: theme === 'dark' ? '2px solid #8B5CF6' : '1px solid var(--border-color)',
                    background: '#0F172A',
                    color: '#F8FAFC',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: theme === 'dark' ? '0 0 20px rgba(139, 92, 246, 0.25)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>🌙 Dark Mode</span>
                    {theme === 'dark' && <span className="badge badge-primary">Active</span>}
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#94A3B8' }}>
                    Sleek dark theme optimized for low-light environments and long recruitment sessions.
                  </p>
                </div>

                {/* Light Mode Card */}
                <div
                  onClick={() => handleThemeChange('light')}
                  style={{
                    padding: '1.25rem',
                    borderRadius: '14px',
                    border: theme === 'light' ? '2px solid #8B5CF6' : '1px solid var(--border-color)',
                    background: '#FFFFFF',
                    color: '#0F172A',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: theme === 'light' ? '0 0 20px rgba(139, 92, 246, 0.25)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>☀️ Light Mode</span>
                    {theme === 'light' && <span className="badge badge-primary">Active</span>}
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#64748B' }}>
                    High-contrast clean light theme for daytime productivity.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 8: SECURITY */}
          {activeSection === 'security' && (
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', background: 'var(--bg-card)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
                🛡️ Account Security & Password
              </h3>

              <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '450px', marginBottom: '2rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.9rem',
                      borderRadius: '8px',
                      background: 'var(--input-bg)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.9rem',
                      borderRadius: '8px',
                      background: 'var(--input-bg)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.9rem',
                      borderRadius: '8px',
                      background: 'var(--input-bg)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>

                <button type="submit" className="recruiter-dashboard-cta-btn" disabled={passwordSaving}>
    {passwordSaving ? 'Updating Password...' : 'Update Password'}
  </button>
              </form>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={logout}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '10px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#EF4444',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  🚪 Log Out of Session
                </button>
              </div>
            </div>
          )}

          {/* SECTION 9: DANGER ZONE */}
          {activeSection === 'danger' && (
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', background: 'var(--bg-card)', border: '1.5px solid rgba(239, 68, 68, 0.4)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#EF4444', marginBottom: '0.5rem' }}>
                ⚠️ Danger Zone
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Irreversible account actions. Please proceed with caution.
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Delete Recruiter Account
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Permanently remove your recruiter account profile and notification preferences.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '10px',
                    background: '#EF4444',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              zIndex: 99999,
              background: 'rgba(0,0,0,0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel"
              style={{
                padding: '2rem',
                borderRadius: '16px',
                background: 'var(--bg-card)',
                maxWidth: '480px',
                width: '100%',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚠️</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Delete Recruiter Account?
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                This action is permanent and destructive. Your recruiter account settings, hiring preferences, and notification configurations will be deleted.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '10px',
                    background: 'var(--hover-bg)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    showToast('Account deletion request acknowledged', 'error');
                  }}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '10px',
                    background: '#EF4444',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default RecruiterSettings;
