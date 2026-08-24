import { getAvatarUrl } from '../utils/avatarUtils';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
} from '../services/profileService';
import '../styles/auth.css';
import '../styles/profile.css';

const ALLOWED_SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

const normalizeFrontendSkill = (item) => {
  if (!item) return null;
  if (typeof item === 'string') {
    const name = item.trim();
    return name ? { name, level: 'Intermediate' } : null;
  }
  if (typeof item === 'object') {
    const rawName = item.name ?? item.skill ?? item.skillName ?? item.title ?? item.label;
    if (typeof rawName !== 'string') return null;
    const name = rawName.trim();
    if (!name) return null;
    const level = ALLOWED_SKILL_LEVELS.includes(item.level) ? item.level : 'Intermediate';
    return { ...item, name, level };
  }
  return null;
};

const normalizeFrontendSkillsArray = (arr) => {
  if (!Array.isArray(arr)) return [];
  return arr.map(normalizeFrontendSkill).filter(Boolean);
};

function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Loading & Action States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Main Profile State
  const [profileData, setProfileData] = useState({
    fullName: '',
    headline: '',
    bio: '',
    location: '',
    phone: '',
    college: '',
    degree: '',
    branch: '',
    currentYear: '',
    cgpa: '',
    interestedRole: '',
    targetRole: '',
    experienceLevel: 'Intermediate',
    githubUrl: '',
    linkedinUrl: '',
    portfolioUrl: '',
    twitterUrl: '',
    profilePhoto: '',
    resumeUrl: '',
    tagline: '',
    expectedSalary: '',
    preferredLocation: '',
    workPreference: '',
    preferredIndustry: '',
    careerObjective: '',
    skills: [],
    profileCompletion: 0,
    createdAt: ''
  });

  // Avatar File Input Ref
  const fileInputRef = useRef(null);

  // Edit Profile Drawer/Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTab, setEditTab] = useState('personal'); // 'personal' | 'academic' | 'career' | 'about_social' | 'skills'
  const [editForm, setEditForm] = useState({
    fullName: '',
    phone: '',
    location: '',
    headline: '',
    college: '',
    degree: '',
    branch: '',
    currentYear: '',
    cgpa: '',
    experienceLevel: 'Intermediate',
    interestedRole: '',
    workPreference: '',
    preferredLocation: '',
    expectedSalary: '',
    preferredIndustry: '',
    careerObjective: '',
    bio: '',
    githubUrl: '',
    linkedinUrl: '',
    portfolioUrl: '',
    twitterUrl: '',
    skills: []
  });

  // Fetch Profile Data directly from MongoDB API
  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await getProfile();

      if (res && (res.profile || res.data)) {
        const prof = res.profile || res.data;
        const initialFullName = prof.fullName && prof.fullName.trim() !== '' 
          ? prof.fullName 
          : (user?.name || '');

        const normalizedSkills = normalizeFrontendSkillsArray(prof.skills);

        setProfileData({
          fullName: initialFullName,
          headline: prof.headline ?? '',
          bio: prof.bio ?? '',
          location: prof.location ?? '',
          phone: prof.phone ?? '',
          college: prof.college ?? '',
          degree: prof.degree ?? '',
          branch: prof.branch ?? '',
          currentYear: prof.currentYear ?? '',
          cgpa: prof.cgpa !== undefined && prof.cgpa !== null ? prof.cgpa.toString() : '',
          interestedRole: prof.interestedRole || prof.targetRole || '',
          targetRole: prof.targetRole || prof.interestedRole || '',
          experienceLevel: prof.experienceLevel || 'Intermediate',
          githubUrl: prof.githubUrl ?? '',
          linkedinUrl: prof.linkedinUrl ?? '',
          portfolioUrl: prof.portfolioUrl ?? '',
          twitterUrl: prof.twitterUrl ?? '',
          profilePhoto: prof.profilePhoto ?? '',
          resumeUrl: prof.resumeUrl ?? '',
          tagline: prof.tagline ?? '',
          expectedSalary: prof.expectedSalary ?? '',
          preferredLocation: prof.preferredLocation ?? '',
          workPreference: prof.workPreference ?? '',
          preferredIndustry: prof.preferredIndustry ?? '',
          careerObjective: prof.careerObjective ?? '',
          skills: normalizedSkills,
          profileCompletion: prof.profileCompletion || 0,
          createdAt: prof.createdAt || user?.createdAt || ''
        });
      }
    } catch (err) {
      console.error('Error fetching profile from MongoDB:', err);
      if (err.response?.status !== 404) {
        setErrorMsg(err.response?.data?.message || 'Unable to load your profile.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const showToast = (msg, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 4000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(''), 3500);
    }
  };

    // Avatar Select Handler (Multipart File Upload to MongoDB Storage)
  const handleAvatarSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showToast('Please select a valid image file (PNG, JPG, JPEG, or WEBP).', true);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Maximum image size allowed is 5 MB.', true);
      return;
    }

    // Instant local preview while upload is in progress
    const localPreviewUrl = URL.createObjectURL(file);
    setProfileData(prev => ({ ...prev, profilePhoto: localPreviewUrl }));

    try {
      setSaving(true);
      const res = await uploadAvatar(file);
      if (res && (res.profilePhoto || res.profile)) {
        const finalUrl = res.profilePhoto || res.profile?.profilePhoto;
        setProfileData(prev => ({ ...prev, profilePhoto: finalUrl }));
        showToast('Profile photo uploaded and saved successfully!');
        await fetchProfileData();
      }
    } catch (err) {
      console.error('Avatar upload failed:', err);
      showToast(err.response?.data?.message || err.message || 'Failed to upload profile photo.', true);
      await fetchProfileData();
    } finally {
      setSaving(false);
    }
  };

  // Avatar Delete Handler
  const handleDeleteAvatar = async () => {
    try {
      setSaving(true);
      const res = await deleteAvatar();
      if (res && res.profile) {
        setProfileData(prev => ({ ...prev, profilePhoto: '' }));
        showToast('Profile photo removed.');
      }
    } catch (err) {
      showToast('Failed to remove profile photo.', true);
    } finally {
      setSaving(false);
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = () => {
    setEditForm({
      fullName: profileData.fullName || user?.name || '',
      phone: profileData.phone || '',
      location: profileData.location || '',
      headline: profileData.headline || '',
      college: profileData.college || '',
      degree: profileData.degree || '',
      branch: profileData.branch || '',
      currentYear: profileData.currentYear || '',
      cgpa: profileData.cgpa || '',
      experienceLevel: profileData.experienceLevel || 'Intermediate',
      interestedRole: profileData.interestedRole || profileData.targetRole || '',
      workPreference: profileData.workPreference || '',
      preferredLocation: profileData.preferredLocation || '',
      expectedSalary: profileData.expectedSalary || '',
      preferredIndustry: profileData.preferredIndustry || '',
      careerObjective: profileData.careerObjective || '',
      bio: profileData.bio || '',
      githubUrl: profileData.githubUrl || '',
      linkedinUrl: profileData.linkedinUrl || '',
      portfolioUrl: profileData.portfolioUrl || '',
      twitterUrl: profileData.twitterUrl || '',
      skills: (profileData.skills || []).map(s => ({ ...s }))
    });
    setEditTab('personal');
    setIsEditModalOpen(true);
  };

  // Save Edit Profile (End-to-End MongoDB Persistence)
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const sanitizedSkills = (editForm.skills || [])
        .map(normalizeFrontendSkill)
        .filter(Boolean);

      const payload = {
        fullName: editForm.fullName,
        phone: editForm.phone,
        location: editForm.location,
        headline: editForm.headline,
        college: editForm.college,
        degree: editForm.degree,
        branch: editForm.branch,
        currentYear: editForm.currentYear,
        cgpa: editForm.cgpa,
        experienceLevel: editForm.experienceLevel,
        interestedRole: editForm.interestedRole,
        targetRole: editForm.interestedRole,
        workPreference: editForm.workPreference,
        preferredLocation: editForm.preferredLocation,
        expectedSalary: editForm.expectedSalary,
        preferredIndustry: editForm.preferredIndustry,
        careerObjective: editForm.careerObjective,
        bio: editForm.bio,
        githubUrl: editForm.githubUrl,
        linkedinUrl: editForm.linkedinUrl,
        portfolioUrl: editForm.portfolioUrl,
        twitterUrl: editForm.twitterUrl,
        profilePhoto: profileData.profilePhoto,
        skills: sanitizedSkills
      };

      const res = await updateProfile(payload);

      if (res && (res.profile || res.data || res.success)) {
        const prof = res.profile || res.data;
        showToast('Profile updated and saved to database successfully!');
        setIsEditModalOpen(false);
        // Re-fetch profile data directly from MongoDB to verify persistence
        await fetchProfileData();
      }
    } catch (err) {
      console.error('Save Profile Error:', err);
      showToast(err.response?.data?.message || err.message || 'Failed to update profile.', true);
    } finally {
      setSaving(false);
    }
  };

  // Helpers
  const getInitials = (nameStr) => {
    if (!nameStr) return 'SF';
    const parts = nameStr.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Joined 2026';
    try {
      const date = new Date(dateStr);
      return `Joined ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
    } catch (e) {
      return 'Joined 2026';
    }
  };

  // Display Variables
  const displayName = profileData.fullName || user?.name || 'Developer';
  const displayEmail = user?.email || 'user@skillforge.ai';
  const displayBio = profileData.headline || profileData.bio || profileData.careerObjective || 'Building skills and accelerating career growth with SkillForge AI.';

  return (
    <div className="profile-page-container">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="toast-success"
            style={{ position: 'fixed', top: '80px', right: '24px', zIndex: 9999 }}
          >
            ✅ {successMsg}
          </motion.div>
        )}

        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="toast-error"
            style={{ position: 'fixed', top: '80px', right: '24px', zIndex: 9999 }}
          >
            ⚠️ {errorMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER HERO CARD */}
      <div className="glass-panel profile-hero-card">
        <div className="profile-hero-content">
          
          {/* Avatar Section */}
          <div className="profile-avatar-wrapper">
            {getAvatarUrl(profileData.profilePhoto) ? (
              <img src={getAvatarUrl(profileData.profilePhoto)} alt={displayName} className="profile-avatar-img" />
            ) : (
              <div className="profile-avatar-placeholder">
                {getInitials(displayName)}
              </div>
            )}
            
            <button
              type="button"
              className="avatar-upload-badge"
              onClick={() => fileInputRef.current?.click()}
              title="Upload new avatar photo"
            >
              📷
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarSelect}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>

          {/* User Info Details */}
          <div className="profile-info-details">
            <div className="profile-name-row">
              <h1 className="profile-display-name">{displayName}</h1>
              <span className="profile-role-badge">{user?.role || 'Developer'}</span>
            </div>

            <p className="profile-headline-text">{displayBio}</p>

            <div className="profile-meta-chips">
              {profileData.location && (
                <span className="meta-chip">📍 {profileData.location}</span>
              )}
              {profileData.interestedRole && (
                <span className="meta-chip">🎯 {profileData.interestedRole}</span>
              )}
              {profileData.college && (
                <span className="meta-chip">🎓 {profileData.college}</span>
              )}
              <span className="meta-chip">✉️ {displayEmail}</span>
              <span className="meta-chip">📅 {formatDate(profileData.createdAt)}</span>
            </div>
          </div>

          {/* Top Actions */}
          <div className="profile-top-actions">
            <button
              type="button"
              onClick={handleOpenEditModal}
              className="btn-gradient-primary btn-edit-profile"
            >
              ✏️ Edit Profile
            </button>
          </div>

        </div>
      </div>

      {/* MAIN TWO-COLUMN GRID */}
      <div className="profile-main-grid">
        
        {/* LEFT COLUMN */}
        <div className="profile-left-col">
          
          {/* Profile Completion Card */}
          <div className="glass-panel profile-section-card">
            <div className="section-card-header">
              <h3>⚡ Profile Strength & Completion</h3>
              <span className="completion-pct-text">{profileData.profileCompletion}%</span>
            </div>

            <div className="completion-bar-track">
              <div
                className="completion-bar-fill"
                style={{ width: `${profileData.profileCompletion}%` }}
              />
            </div>
          </div>

          {/* Career Objectives & Bio */}
          <div className="glass-panel profile-section-card">
            <div className="section-card-header">
              <h3>📝 About & Career Objective</h3>
            </div>
            <p className="section-body-text">
              {profileData.bio || profileData.careerObjective || 'No detailed objective added yet. Click Edit Profile to share your background.'}
            </p>
          </div>

          {/* Skills Section */}
          <div className="glass-panel profile-section-card">
            <div className="section-card-header">
              <h3>💻 Verified Technical Skills</h3>
              <span className="count-badge">{(profileData.skills || []).length} Skills</span>
            </div>

            {(!profileData.skills || profileData.skills.length === 0) ? (
              <div className="empty-section-placeholder">
                <p>No skills added yet. Add your core programming languages and frameworks in Edit Profile.</p>
              </div>
            ) : (
              <div className="skills-badge-grid">
                {profileData.skills.map((skill, i) => (
                  <div key={i} className="skill-item-badge">
                    <span className="skill-name">{skill.name}</span>
                    <span className="skill-level">{skill.level || 'Intermediate'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="profile-right-col">
          
          {/* Academic & Experience Overview */}
          <div className="glass-panel profile-section-card">
            <div className="section-card-header">
              <h3>🎓 Academic Background</h3>
            </div>

            <div className="info-keyValue-list">
              <div className="info-kv-item">
                <span className="kv-label">University / College</span>
                <span className="kv-value">{profileData.college || 'Not specified'}</span>
              </div>
              <div className="info-kv-item">
                <span className="kv-label">Degree & Branch</span>
                <span className="kv-value">
                  {profileData.degree ? `${profileData.degree} ${profileData.branch ? `(${profileData.branch})` : ''}` : 'Not specified'}
                </span>
              </div>
              <div className="info-kv-item">
                <span className="kv-label">Academic Year / CGPA</span>
                <span className="kv-value">
                  {profileData.currentYear ? `Year ${profileData.currentYear}` : ''} {profileData.cgpa ? `• CGPA: ${profileData.cgpa}` : ''} {(!profileData.currentYear && !profileData.cgpa) ? 'Not specified' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Social & Portfolio Links */}
          <div className="glass-panel profile-section-card">
            <div className="section-card-header">
              <h3>🌐 Portfolio & Social Profiles</h3>
            </div>

            <div className="social-links-list">
              {profileData.githubUrl && (
                <a href={profileData.githubUrl} target="_blank" rel="noopener noreferrer" className="social-link-item">
                  <span>📦 GitHub Profile</span>
                  <span className="link-arrow">↗</span>
                </a>
              )}
              {profileData.linkedinUrl && (
                <a href={profileData.linkedinUrl} target="_blank" rel="noopener noreferrer" className="social-link-item">
                  <span>💼 LinkedIn Profile</span>
                  <span className="link-arrow">↗</span>
                </a>
              )}
              {profileData.portfolioUrl && (
                <a href={profileData.portfolioUrl} target="_blank" rel="noopener noreferrer" className="social-link-item">
                  <span>🚀 Personal Portfolio</span>
                  <span className="link-arrow">↗</span>
                </a>
              )}
              {profileData.twitterUrl && (
                <a href={profileData.twitterUrl} target="_blank" rel="noopener noreferrer" className="social-link-item">
                  <span>🐦 Twitter Profile</span>
                  <span className="link-arrow">↗</span>
                </a>
              )}
              {(!profileData.githubUrl && !profileData.linkedinUrl && !profileData.portfolioUrl && !profileData.twitterUrl) && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                  No portfolio links connected. Click Edit Profile to attach your GitHub or LinkedIn.
                </p>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* EDIT PROFILE MODAL / DRAWER */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="modal-backdrop-overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel edit-profile-modal-card"
            >
              {/* Modal Header */}
              <div className="modal-header-row">
                <h2>✏️ Edit Profile Details</h2>
                <button
                  type="button"
                  className="btn-close-modal"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  ✕
                </button>
              </div>

              {/* Tab Navigation */}
              <div className="modal-tabs-nav">
                <button
                  type="button"
                  className={`modal-tab-btn ${editTab === 'personal' ? 'active' : ''}`}
                  onClick={() => setEditTab('personal')}
                >
                  👤 Personal
                </button>
                <button
                  type="button"
                  className={`modal-tab-btn ${editTab === 'academic' ? 'active' : ''}`}
                  onClick={() => setEditTab('academic')}
                >
                  🎓 Academic
                </button>
                <button
                  type="button"
                  className={`modal-tab-btn ${editTab === 'career' ? 'active' : ''}`}
                  onClick={() => setEditTab('career')}
                >
                  🎯 Career
                </button>
                <button
                  type="button"
                  className={`modal-tab-btn ${editTab === 'about_social' ? 'active' : ''}`}
                  onClick={() => setEditTab('about_social')}
                >
                  📝 Bio & Links
                </button>
                <button
                  type="button"
                  className={`modal-tab-btn ${editTab === 'skills' ? 'active' : ''}`}
                  onClick={() => setEditTab('skills')}
                >
                  💻 Skills
                </button>
              </div>

              {/* Edit Form */}
              <form onSubmit={handleSaveProfile} className="edit-profile-form-body">
                
                {/* TAB 1: PERSONAL DETAILS */}
                {editTab === 'personal' && (
                  <div className="modal-tab-content">
                    <div className="form-grid-2">
                      <div className="form-group-custom">
                        <label className="custom-label">Full Name</label>
                        <input
                          type="text"
                          required
                          className="custom-input"
                          value={editForm.fullName}
                          onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                          placeholder="Your Full Name"
                        />
                      </div>

                      <div className="form-group-custom">
                        <label className="custom-label">Phone Number</label>
                        <input
                          type="tel"
                          className="custom-input"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>

                      <div className="form-group-custom">
                        <label className="custom-label">Current Location / City</label>
                        <input
                          type="text"
                          className="custom-input"
                          value={editForm.location}
                          onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                          placeholder="e.g. San Francisco, CA or Remote"
                        />
                      </div>

                      <div className="form-group-custom">
                        <label className="custom-label">Professional Headline</label>
                        <input
                          type="text"
                          className="custom-input"
                          value={editForm.headline}
                          onChange={(e) => setEditForm({ ...editForm, headline: e.target.value })}
                          placeholder="e.g. Full Stack Engineer | React & Node Specialist"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: ACADEMIC INFO */}
                {editTab === 'academic' && (
                  <div className="modal-tab-content">
                    <div className="form-grid-2">
                      <div className="form-group-custom">
                        <label className="custom-label">University / College</label>
                        <input
                          type="text"
                          className="custom-input"
                          value={editForm.college}
                          onChange={(e) => setEditForm({ ...editForm, college: e.target.value })}
                          placeholder="e.g. Stanford University"
                        />
                      </div>

                      <div className="form-group-custom">
                        <label className="custom-label">Degree</label>
                        <input
                          type="text"
                          className="custom-input"
                          value={editForm.degree}
                          onChange={(e) => setEditForm({ ...editForm, degree: e.target.value })}
                          placeholder="e.g. B.S. Computer Science"
                        />
                      </div>

                      <div className="form-group-custom">
                        <label className="custom-label">Branch / Major</label>
                        <input
                          type="text"
                          className="custom-input"
                          value={editForm.branch}
                          onChange={(e) => setEditForm({ ...editForm, branch: e.target.value })}
                          placeholder="e.g. Software Engineering"
                        />
                      </div>

                      <div className="form-group-custom">
                        <label className="custom-label">Current Academic Year</label>
                        <select
                          className="custom-select"
                          value={editForm.currentYear}
                          onChange={(e) => setEditForm({ ...editForm, currentYear: e.target.value })}
                        >
                          <option value="">Select Year</option>
                          <option value="1">1st Year</option>
                          <option value="2">2nd Year</option>
                          <option value="3">3rd Year</option>
                          <option value="4">4th Year / Senior</option>
                          <option value="Graduated">Graduated / Alumni</option>
                        </select>
                      </div>

                      <div className="form-group-custom">
                        <label className="custom-label">CGPA / GPA</label>
                        <input
                          type="text"
                          className="custom-input"
                          value={editForm.cgpa}
                          onChange={(e) => setEditForm({ ...editForm, cgpa: e.target.value })}
                          placeholder="e.g. 3.8 / 4.0 or 9.2"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: CAREER PREFERENCES */}
                {editTab === 'career' && (
                  <div className="modal-tab-content">
                    <div className="form-grid-2">
                      <div className="form-group-custom">
                        <label className="custom-label">Target Role / Designation</label>
                        <input
                          type="text"
                          className="custom-input"
                          value={editForm.interestedRole}
                          onChange={(e) => setEditForm({ ...editForm, interestedRole: e.target.value })}
                          placeholder="e.g. Full Stack Developer, AI Engineer"
                        />
                      </div>

                      <div className="form-group-custom">
                        <label className="custom-label">Experience Level</label>
                        <select
                          className="custom-select"
                          value={editForm.experienceLevel}
                          onChange={(e) => setEditForm({ ...editForm, experienceLevel: e.target.value })}
                        >
                          <option value="Beginner">Beginner (0-1 yrs)</option>
                          <option value="Intermediate">Intermediate (1-3 yrs)</option>
                          <option value="Advanced">Advanced (3-5 yrs)</option>
                          <option value="Expert">Expert (5+ yrs)</option>
                        </select>
                      </div>

                      <div className="form-group-custom">
                        <label className="custom-label">Work Mode Preference</label>
                        <select
                          className="custom-select"
                          value={editForm.workPreference}
                          onChange={(e) => setEditForm({ ...editForm, workPreference: e.target.value })}
                        >
                          <option value="">Select Preference</option>
                          <option value="Remote">Remote Only</option>
                          <option value="Hybrid">Hybrid</option>
                          <option value="On-site">On-site</option>
                        </select>
                      </div>

                      <div className="form-group-custom">
                        <label className="custom-label">Preferred Work Location</label>
                        <input
                          type="text"
                          className="custom-input"
                          value={editForm.preferredLocation}
                          onChange={(e) => setEditForm({ ...editForm, preferredLocation: e.target.value })}
                          placeholder="e.g. New York, London, or Worldwide"
                        />
                      </div>

                      <div className="form-group-custom span-2-cols">
                        <label className="custom-label">Career Objective</label>
                        <textarea
                          rows={3}
                          className="custom-textarea"
                          value={editForm.careerObjective}
                          onChange={(e) => setEditForm({ ...editForm, careerObjective: e.target.value })}
                          placeholder="Short summary of your career objective..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: BIO & SOCIAL LINKS */}
                {editTab === 'about_social' && (
                  <div className="modal-tab-content">
                    <div className="form-group-custom">
                      <label className="custom-label">About Me / Bio</label>
                      <textarea
                        rows={4}
                        className="custom-textarea"
                        value={editForm.bio}
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        placeholder="Write a brief overview of your background, technical interests, and goals..."
                      />
                    </div>

                    <div className="form-grid-2" style={{ marginTop: '1rem' }}>
                      <div className="form-group-custom">
                        <label className="custom-label">GitHub Profile URL</label>
                        <input
                          type="url"
                          className="custom-input"
                          value={editForm.githubUrl}
                          onChange={(e) => setEditForm({ ...editForm, githubUrl: e.target.value })}
                          placeholder="https://github.com/username"
                        />
                      </div>

                      <div className="form-group-custom">
                        <label className="custom-label">LinkedIn Profile URL</label>
                        <input
                          type="url"
                          className="custom-input"
                          value={editForm.linkedinUrl}
                          onChange={(e) => setEditForm({ ...editForm, linkedinUrl: e.target.value })}
                          placeholder="https://linkedin.com/in/username"
                        />
                      </div>

                      <div className="form-group-custom">
                        <label className="custom-label">Portfolio / Website URL</label>
                        <input
                          type="url"
                          className="custom-input"
                          value={editForm.portfolioUrl}
                          onChange={(e) => setEditForm({ ...editForm, portfolioUrl: e.target.value })}
                          placeholder="https://yourportfolio.com"
                        />
                      </div>

                      <div className="form-group-custom">
                        <label className="custom-label">Twitter Profile URL</label>
                        <input
                          type="url"
                          className="custom-input"
                          value={editForm.twitterUrl}
                          onChange={(e) => setEditForm({ ...editForm, twitterUrl: e.target.value })}
                          placeholder="https://twitter.com/username"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 5: SKILLS */}
                {editTab === 'skills' && (
                  <div className="modal-tab-content">
                    <div className="skills-edit-section">
                      <div className="skills-edit-header">
                        <label className="custom-label">Technical & Professional Skills</label>
                        <p className="skills-edit-subtext">Add your core technical skills and select your proficiency level.</p>
                      </div>

                      {(!editForm.skills || editForm.skills.length === 0) ? (
                        <div className="empty-skills-edit-box">
                          <p className="empty-skills-edit-text">No skills added yet. Click "+ Add Skill" below to get started.</p>
                        </div>
                      ) : (
                        <div className="skills-edit-list">
                          {editForm.skills.map((skill, index) => (
                            <div key={index} className="skill-edit-row">
                              <div className="form-group-custom skill-name-field">
                                <label className="custom-label">Skill Name</label>
                                <input
                                  type="text"
                                  className="custom-input"
                                  value={skill.name || ''}
                                  onChange={(e) => {
                                    const updated = [...editForm.skills];
                                    updated[index] = { ...updated[index], name: e.target.value };
                                    setEditForm({ ...editForm, skills: updated });
                                  }}
                                  placeholder="e.g. JavaScript, React, Node.js"
                                />
                              </div>

                              <div className="form-group-custom skill-level-field">
                                <label className="custom-label">Proficiency Level</label>
                                <select
                                  className="custom-select"
                                  value={skill.level || 'Intermediate'}
                                  onChange={(e) => {
                                    const updated = [...editForm.skills];
                                    updated[index] = { ...updated[index], level: e.target.value };
                                    setEditForm({ ...editForm, skills: updated });
                                  }}
                                >
                                  <option value="Beginner">Beginner</option>
                                  <option value="Intermediate">Intermediate</option>
                                  <option value="Advanced">Advanced</option>
                                  <option value="Expert">Expert</option>
                                </select>
                              </div>

                              <button
                                type="button"
                                className="btn-remove-skill-row"
                                onClick={() => {
                                  const updated = editForm.skills.filter((_, i) => i !== index);
                                  setEditForm({ ...editForm, skills: updated });
                                }}
                                title="Remove skill"
                              >
                                🗑️
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <button
                        type="button"
                        className="btn-add-skill-row"
                        onClick={() => {
                          setEditForm({
                            ...editForm,
                            skills: [...(editForm.skills || []), { name: '', level: 'Intermediate' }]
                          });
                        }}
                      >
                        + Add Skill
                      </button>
                    </div>
                  </div>
                )}

                {/* Modal Footer Buttons */}
                <div className="modal-footer-row">
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn-cancel-modal">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="btn-gradient-primary btn-save-modal">
                    {saving ? 'Saving Changes...' : 'Save Profile Changes'}
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

export default Profile;
