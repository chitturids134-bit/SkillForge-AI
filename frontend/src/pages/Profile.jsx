import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';
import '../styles/profile.css';

const API_URL = 'http://localhost:5002/api/profile';

function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form Fields State
  const [formData, setFormData] = useState({
    fullName: '',
    college: '',
    degree: '',
    branch: '',
    currentYear: '',
    cgpa: '',
    skills: '',
    interestedRole: '',
    experienceLevel: 'Beginner',
    githubUrl: '',
    linkedinUrl: '',
    portfolioUrl: '',
    location: '',
    phone: '',
    bio: '',
    profilePhoto: '',
    resumeUrl: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Go back to the dashboard based on role
  const handleCancel = () => {
    if (user) {
      if (user.role === 'Developer') navigate('/developer/dashboard');
      else if (user.role === 'Recruiter') navigate('/recruiter/dashboard');
      else if (user.role === 'Admin') navigate('/admin/dashboard');
    } else {
      navigate('/');
    }
  };

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/me`);
        if (res.data && res.data.profile) {
          const prof = res.data.profile;
          setFormData({
            fullName: prof.fullName || '',
            college: prof.college || '',
            degree: prof.degree || '',
            branch: prof.branch || '',
            currentYear: prof.currentYear || '',
            cgpa: prof.cgpa !== undefined ? prof.cgpa.toString() : '',
            skills: Array.isArray(prof.skills) ? prof.skills.join(', ') : '',
            interestedRole: prof.interestedRole || '',
            experienceLevel: prof.experienceLevel || 'Beginner',
            githubUrl: prof.githubUrl || '',
            linkedinUrl: prof.linkedinUrl || '',
            portfolioUrl: prof.portfolioUrl || '',
            location: prof.location || '',
            phone: prof.phone || '',
            bio: prof.bio || '',
            profilePhoto: prof.profilePhoto || '',
            resumeUrl: prof.resumeUrl || '',
          });
          setIsEditing(true);
        }
      } catch (err) {
        // If 404, profile does not exist yet. This is expected for new users.
        if (err.response && err.response.status === 404) {
          setIsEditing(false);
          // Pre-fill user name from auth context
          if (user) {
            setFormData((prev) => ({
              ...prev,
              fullName: user.name || '',
            }));
          }
        } else {
          setErrorMsg(err.response?.data?.message || 'Error fetching profile data');
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const {
      fullName,
      college,
      degree,
      branch,
      currentYear,
      cgpa,
      skills,
      interestedRole,
      experienceLevel,
    } = formData;

    // Front-end validations
    if (
      !fullName ||
      !college ||
      !degree ||
      !branch ||
      !currentYear ||
      cgpa === '' ||
      !skills ||
      !interestedRole ||
      !experienceLevel
    ) {
      setErrorMsg('Please fill in all required fields');
      window.scrollTo(0, 0);
      return;
    }

    const parsedCgpa = parseFloat(cgpa);
    if (isNaN(parsedCgpa) || parsedCgpa < 0 || parsedCgpa > 10) {
      setErrorMsg('CGPA must be a number between 0 and 10');
      window.scrollTo(0, 0);
      return;
    }

    // Convert skills string to array
    const skillsArray = skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (skillsArray.length === 0) {
      setErrorMsg('At least one skill is required');
      window.scrollTo(0, 0);
      return;
    }

    const payload = {
      ...formData,
      cgpa: parsedCgpa,
      skills: skillsArray,
    };

    setSaving(true);
    try {
      if (isEditing) {
        // PUT update
        await axios.put(`${API_URL}/me`, payload);
        setSuccessMsg('Profile updated successfully!');
      } else {
        // POST create
        await axios.post(API_URL, payload);
        setSuccessMsg('Profile created successfully!');
        setIsEditing(true);
      }
      window.scrollTo(0, 0);
      // Auto dismiss success toast after 3 seconds
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error saving profile');
      window.scrollTo(0, 0);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          color: 'var(--text-secondary)',
          backgroundColor: 'var(--bg-primary)',
        }}
      >
        Loading profile details...
      </div>
    );
  }

  return (
    <div className="profile-container">
      <motion.div
        className="profile-card glass-panel"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="profile-header">
          <h1 className="profile-title">{isEditing ? 'Edit Profile' : 'Create Profile'}</h1>
          <p className="profile-subtitle">
            Provide details about your academic and professional path
          </p>
        </div>

        {successMsg && <div className="toast toast-success">{successMsg}</div>}
        {errorMsg && <div className="toast toast-error">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="profile-grid">
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="fullName">
                Full Name *
              </label>
              <input
                className="form-input"
                type="text"
                id="fullName"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            {/* Phone */}
            <div className="form-group">
              <label className="form-label" htmlFor="phone">
                Phone Number
              </label>
              <input
                className="form-input"
                type="tel"
                id="phone"
                placeholder="+1 (555) 019-2834"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            {/* College */}
            <div className="form-group">
              <label className="form-label" htmlFor="college">
                College/University *
              </label>
              <input
                className="form-input"
                type="text"
                id="college"
                placeholder="Massachusetts Institute of Technology"
                value={formData.college}
                onChange={handleChange}
                required
              />
            </div>

            {/* Degree */}
            <div className="form-group">
              <label className="form-label" htmlFor="degree">
                Degree *
              </label>
              <input
                className="form-input"
                type="text"
                id="degree"
                placeholder="Bachelor of Science"
                value={formData.degree}
                onChange={handleChange}
                required
              />
            </div>

            {/* Branch */}
            <div className="form-group">
              <label className="form-label" htmlFor="branch">
                Branch/Major *
              </label>
              <input
                className="form-input"
                type="text"
                id="branch"
                placeholder="Computer Science"
                value={formData.branch}
                onChange={handleChange}
                required
              />
            </div>

            {/* Current Year */}
            <div className="form-group">
              <label className="form-label" htmlFor="currentYear">
                Current Year *
              </label>
              <input
                className="form-input"
                type="text"
                id="currentYear"
                placeholder="3rd Year (or Senior)"
                value={formData.currentYear}
                onChange={handleChange}
                required
              />
            </div>

            {/* CGPA */}
            <div className="form-group">
              <label className="form-label" htmlFor="cgpa">
                CGPA * (Scale 0-10)
              </label>
              <input
                className="form-input"
                type="number"
                step="0.01"
                id="cgpa"
                placeholder="9.15"
                value={formData.cgpa}
                onChange={handleChange}
                required
              />
            </div>

            {/* Location */}
            <div className="form-group">
              <label className="form-label" htmlFor="location">
                Location
              </label>
              <input
                className="form-input"
                type="text"
                id="location"
                placeholder="Boston, MA"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            {/* Interested Role */}
            <div className="form-group">
              <label className="form-label" htmlFor="interestedRole">
                Interested Role *
              </label>
              <input
                className="form-input"
                type="text"
                id="interestedRole"
                placeholder="Full Stack Engineer"
                value={formData.interestedRole}
                onChange={handleChange}
                required
              />
            </div>

            {/* Experience Level */}
            <div className="form-group">
              <label className="form-label" htmlFor="experienceLevel">
                Experience Level *
              </label>
              <select
                className="form-select"
                id="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleChange}
                required
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            {/* Skills */}
            <div className="form-group form-full-width">
              <label className="form-label" htmlFor="skills">
                Skills * (comma separated)
              </label>
              <input
                className="form-input"
                type="text"
                id="skills"
                placeholder="React, Node.js, Express, MongoDB, Python"
                value={formData.skills}
                onChange={handleChange}
                required
              />
            </div>

            {/* GitHub URL */}
            <div className="form-group">
              <label className="form-label" htmlFor="githubUrl">
                GitHub URL
              </label>
              <input
                className="form-input"
                type="url"
                id="githubUrl"
                placeholder="https://github.com/username"
                value={formData.githubUrl}
                onChange={handleChange}
              />
            </div>

            {/* LinkedIn URL */}
            <div className="form-group">
              <label className="form-label" htmlFor="linkedinUrl">
                LinkedIn URL
              </label>
              <input
                className="form-input"
                type="url"
                id="linkedinUrl"
                placeholder="https://linkedin.com/in/username"
                value={formData.linkedinUrl}
                onChange={handleChange}
              />
            </div>

            {/* Portfolio URL */}
            <div className="form-group">
              <label className="form-label" htmlFor="portfolioUrl">
                Portfolio URL
              </label>
              <input
                className="form-input"
                type="url"
                id="portfolioUrl"
                placeholder="https://myportfolio.dev"
                value={formData.portfolioUrl}
                onChange={handleChange}
              />
            </div>

            {/* Resume URL */}
            <div className="form-group">
              <label className="form-label" htmlFor="resumeUrl">
                Resume URL
              </label>
              <input
                className="form-input"
                type="url"
                id="resumeUrl"
                placeholder="https://drive.google.com/..."
                value={formData.resumeUrl}
                onChange={handleChange}
              />
            </div>

            {/* Profile Photo URL */}
            <div className="form-group form-full-width">
              <label className="form-label" htmlFor="profilePhoto">
                Profile Photo URL
              </label>
              <input
                className="form-input"
                type="url"
                id="profilePhoto"
                placeholder="https://images.unsplash.com/..."
                value={formData.profilePhoto}
                onChange={handleChange}
              />
            </div>

            {/* Bio */}
            <div className="form-group form-full-width">
              <label className="form-label" htmlFor="bio">
                Short Bio
              </label>
              <textarea
                className="form-input"
                id="bio"
                rows="4"
                placeholder="Tell us about yourself and your career goals..."
                value={formData.bio}
                onChange={handleChange}
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="logout-btn"
              style={{ padding: '0.75rem 1.5rem' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="auth-btn"
              disabled={saving}
              style={{ margin: 0, padding: '0.75rem 1.75rem' }}
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default Profile;
