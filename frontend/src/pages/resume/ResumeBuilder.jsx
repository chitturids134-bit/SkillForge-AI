import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { RESUME_TEMPLATES } from '../../data/resumeTemplates';
import PersonalInfoForm from '../../components/resume/PersonalInfoForm';
import EducationForm from '../../components/resume/EducationForm';
import SkillsForm from '../../components/resume/SkillsForm';
import ProjectsForm from '../../components/resume/ProjectsForm';
import ExperienceForm from '../../components/resume/ExperienceForm';
import CertificationsForm from '../../components/resume/CertificationsForm';
import ResumePreview from '../../components/resume/ResumePreview';
import AtsScoreCard from '../../components/resume/AtsScoreCard';
import SectionScore from '../../components/resume/SectionScore';
import MissingSections from '../../components/resume/MissingSections';
import SuggestionsPanel from '../../components/resume/SuggestionsPanel';

import '../../styles/auth.css';
import '../../styles/resume.css';

const API_URL = '/api/resume';

function ResumeBuilder() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const queryTemplate = searchParams.get('template');
  const [selectedTemplate, setSelectedTemplate] = useState(queryTemplate || 'silicon-valley-ai');

  // Active Tab: 'personal' | 'education' | 'skills' | 'projects' | 'experience' | 'certifications'
  const [activeTab, setActiveTab] = useState('personal');

  // Form States
  const [personalInfo, setPersonalInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    githubUrl: '',
    linkedinUrl: '',
    portfolioUrl: '',
    address: '',
    summary: '',
  });
  const [education, setEducation] = useState([]);
  const [skills, setSkills] = useState('');
  const [projects, setProjects] = useState([]);
  const [experience, setExperience] = useState([]);
  const [certifications, setCertifications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [atsAnalysis, setAtsAnalysis] = useState(null);

  // Synchronize URL template query parameter
  useEffect(() => {
    if (queryTemplate) {
      setSelectedTemplate(queryTemplate);
    }
  }, [queryTemplate]);

  // Navigate back to dashboard based on role
  const handleResetForm = () => {
    if (window.confirm('Are you sure you want to reset all form fields?')) {
      setPersonalInfo({
        fullName: user?.name || '',
        email: user?.email || '',
        phone: '',
        githubUrl: '',
        linkedinUrl: '',
        portfolioUrl: '',
        address: '',
        summary: '',
      });
      setEducation([]);
      setSkills('');
      setProjects([]);
      setExperience([]);
      setCertifications([]);
    }
  };

  const handleCancel = () => {
    if (user) {
      if (user.role === 'Developer') navigate('/developer/dashboard');
      else if (user.role === 'Recruiter') navigate('/recruiter/dashboard');
      else if (user.role === 'Admin') navigate('/admin/dashboard');
    } else {
      navigate('/');
    }
  };

  // Helper to pre-fill from user profile
  const prefillFromProfile = async () => {
    try {
      const res = await axios.get('/api/profile/me');
      if (res.data && res.data.profile) {
        const prof = res.data.profile;
        setPersonalInfo(prev => ({
          fullName: prof.user?.name || user?.name || prev.fullName,
          email: prof.user?.email || user?.email || prev.email,
          phone: prof.phone || prev.phone,
          address: prof.location || prev.address,
          summary: prof.bio || prev.summary,
          githubUrl: prof.socialLinks?.github || prev.githubUrl,
          linkedinUrl: prof.socialLinks?.linkedin || prev.linkedinUrl,
          portfolioUrl: prof.socialLinks?.website || prev.portfolioUrl,
        }));

        if (prof.skills && prof.skills.length > 0) {
          const formattedSkills = prof.skills
            .map(s => (typeof s === 'string' ? s : s.name))
            .filter(Boolean)
            .join(', ');
          setSkills(formattedSkills);
        }
      }
    } catch (e) {
      // Non-critical background pre-fill
    }
  };

  // Fetch resume on mount
  useEffect(() => {
    const fetchResume = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/me`);
        if (res.data && res.data.resume) {
          const resData = res.data.resume;
          if (resData.templateId && !queryTemplate) {
            setSelectedTemplate(resData.templateId);
          }

          setPersonalInfo(resData.personalInfo || {
            fullName: user?.name || '',
            email: user?.email || '',
            phone: '',
            githubUrl: '',
            linkedinUrl: '',
            portfolioUrl: '',
            address: '',
            summary: '',
          });
          setEducation(resData.education || []);
          setSkills(Array.isArray(resData.skills) ? resData.skills.join(', ') : '');

          const mappedProjects = (resData.projects || []).map((p) => ({
            ...p,
            technologies: Array.isArray(p.technologies) ? p.technologies.join(', ') : p.technologies || '',
          }));
          setProjects(mappedProjects);
          setExperience(resData.experience || []);
          setCertifications(resData.certifications || []);
          setIsEditing(true);
          if (res.data.atsAnalysis) {
            setAtsAnalysis(res.data.atsAnalysis);
          }

          // If personal info is mostly empty, attempt profile pre-fill
          if (!resData.personalInfo?.fullName) {
            await prefillFromProfile();
          }
        }
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setIsEditing(false);
          await prefillFromProfile();
        } else {
          setErrorMsg(err.response?.data?.message || 'Error fetching resume details');
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchResume();
    }
  }, [user]);

  // Handle Save (Create or Update)
  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Validations
    if (!personalInfo.fullName || !personalInfo.email || !personalInfo.phone) {
      setErrorMsg('Please complete all required fields inside Personal Information tab');
      setActiveTab('personal');
      return;
    }

    if (!skills || skills.trim() === '') {
      setErrorMsg('Skills section requires at least one entry');
      setActiveTab('skills');
      return;
    }

    // Convert skills string to array
    const skillsArray = skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    // Validate dynamic education fields
    for (let i = 0; i < education.length; i++) {
      const ed = education[i];
      if (!ed.school || !ed.degree || !ed.fieldOfStudy || !ed.startYear || !ed.endYear) {
        setErrorMsg(`Please fill in all required fields in Education Entry #${i + 1}`);
        setActiveTab('education');
        return;
      }
    }

    // Validate and parse projects technologies list
    const parsedProjects = [];
    for (let i = 0; i < projects.length; i++) {
      const p = projects[i];
      if (!p.title || !p.technologies || !p.description) {
        setErrorMsg(`Please fill in all required fields in Project Entry #${i + 1}`);
        setActiveTab('projects');
        return;
      }

      const techArray = typeof p.technologies === 'string'
        ? p.technologies.split(',').map((t) => t.trim()).filter(Boolean)
        : p.technologies;

      parsedProjects.push({
        ...p,
        technologies: techArray,
      });
    }

    // Validate experience fields
    for (let i = 0; i < experience.length; i++) {
      const ex = experience[i];
      if (!ex.company || !ex.role || !ex.startMonthYear || (!ex.current && !ex.endMonthYear) || !ex.description) {
        setErrorMsg(`Please fill in all required fields in Work Experience Entry #${i + 1}`);
        setActiveTab('experience');
        return;
      }
    }

    // Validate certs
    for (let i = 0; i < certifications.length; i++) {
      const c = certifications[i];
      if (!c.name || !c.issuingOrganization) {
        setErrorMsg(`Please fill in all required fields in Certification Entry #${i + 1}`);
        setActiveTab('certifications');
        return;
      }
    }

    const payload = {
      personalInfo,
      education,
      skills: skillsArray,
      projects: parsedProjects,
      experience,
      certifications,
      templateId: selectedTemplate,
    };

    setSaving(true);
    try {
      if (isEditing) {
        // PUT update
        const res = await axios.put(`${API_URL}/me`, payload);
        setSuccessMsg('Resume updated successfully!');
        if (res.data.atsAnalysis) {
          setAtsAnalysis(res.data.atsAnalysis);
        }
      } else {
        // POST create
        const res = await axios.post(API_URL, payload);
        setSuccessMsg('Resume created successfully!');
        setIsEditing(true);
        if (res.data.atsAnalysis) {
          setAtsAnalysis(res.data.atsAnalysis);
        }
      }
      // Re-map projects technologies string to keep form edits running
      if (payload.projects) {
        setProjects(payload.projects.map((p) => ({
          ...p,
          technologies: Array.isArray(p.technologies) ? p.technologies.join(', ') : p.technologies,
        })));
      }
      window.scrollTo(0, 0);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error saving resume details');
      window.scrollTo(0, 0);
    } finally {
      setSaving(false);
    }
  };

  // Handle Delete
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your resume? This cannot be undone.')) {
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setDeleting(true);
    try {
      await axios.delete(`${API_URL}/me`);
      setSuccessMsg('Resume deleted successfully.');

      // Reset State
      setPersonalInfo({
        fullName: user?.name || '',
        email: user?.email || '',
        phone: '',
        githubUrl: '',
        linkedinUrl: '',
        portfolioUrl: '',
        address: '',
        summary: '',
      });
      setEducation([]);
      setSkills('');
      setProjects([]);
      setExperience([]);
      setCertifications([]);
      setIsEditing(false);
      setAtsAnalysis(null);
      setActiveTab('personal');
      window.scrollTo(0, 0);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error deleting resume');
      window.scrollTo(0, 0);
    } finally {
      setDeleting(false);
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
        Loading Resume Studio...
      </div>
    );
  }

  return (
    <div className="resume-builder-workspace">
      {/* Left Panel: Form Editor */}
      <div className="resume-editor-pane">
        <motion.div
          className="resume-card glass-panel"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ padding: '2rem' }}
        >
          <div className="resume-header">
            <div className="resume-header-title-wrapper">
              <div className="resume-header-icon-badge">📄</div>
              <div>
                <h1 className="resume-title">Resume Studio</h1>
                <p className="resume-subtitle">Build and manage your professional resume profile</p>
              </div>
            </div>
            {isEditing && (
              <button
                type="button"
                className="delete-resume-btn-outline"
                onClick={handleDelete}
                disabled={deleting}
              >
                <span>🗑️</span> {deleting ? 'Deleting...' : 'Delete Resume'}
              </button>
            )}
          </div>

          {/* TEMPLATE SWITCHER BAR */}
          <div className="template-switcher-bar">
            <div className="template-switcher-info">
              <span className="template-switcher-icon">✨</span>
              <div>
                <div className="template-switcher-title">Active Template</div>
                <div className="template-switcher-subtitle">Choose your preferred template layout</div>
              </div>
            </div>
            <select
              className="template-switcher-select"
              value={selectedTemplate}
              onChange={(e) => {
                setSelectedTemplate(e.target.value);
                setSearchParams({ template: e.target.value });
              }}
            >
              {RESUME_TEMPLATES.map(t => (
                <option key={t.id} value={t.id}>{t.title} ({t.tag})</option>
              ))}
            </select>
          </div>

          {successMsg && <div className="toast toast-success">{successMsg}</div>}
          {errorMsg && <div className="toast toast-error">{errorMsg}</div>}

          {/* Tab Controls */}
          <div className="resume-tabs">
            <button
              type="button"
              className={`resume-tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
              onClick={() => setActiveTab('personal')}
            >
              <span>👤</span> Personal Info
            </button>
            <button
              type="button"
              className={`resume-tab-btn ${activeTab === 'education' ? 'active' : ''}`}
              onClick={() => setActiveTab('education')}
            >
              <span>🎓</span> Education
            </button>
            <button
              type="button"
              className={`resume-tab-btn ${activeTab === 'experience' ? 'active' : ''}`}
              onClick={() => setActiveTab('experience')}
            >
              <span>💼</span> Experience
            </button>
            <button
              type="button"
              className={`resume-tab-btn ${activeTab === 'skills' ? 'active' : ''}`}
              onClick={() => setActiveTab('skills')}
            >
              <span>🛠️</span> Skills
            </button>
            <button
              type="button"
              className={`resume-tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
              onClick={() => setActiveTab('projects')}
            >
              <span>💻</span> Projects
            </button>
            <button
              type="button"
              className={`resume-tab-btn ${activeTab === 'certifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('certifications')}
            >
              <span>📜</span> Certifications
            </button>
          </div>

          {/* Active Tab Form */}
          <form onSubmit={handleSave}>
            <div style={{ minHeight: '300px', marginBottom: '2rem' }}>
              {activeTab === 'personal' && (
                <PersonalInfoForm data={personalInfo} onChange={setPersonalInfo} />
              )}
              {activeTab === 'education' && (
                <EducationForm data={education} onChange={setEducation} />
              )}
              {activeTab === 'skills' && (
                <SkillsForm data={skills} onChange={setSkills} />
              )}
              {activeTab === 'projects' && (
                <ProjectsForm data={projects} onChange={setProjects} />
              )}
              {activeTab === 'experience' && (
                <ExperienceForm data={experience} onChange={setExperience} />
              )}
              {activeTab === 'certifications' && (
                <CertificationsForm data={certifications} onChange={setCertifications} />
              )}
            </div>

            <div className="form-actions-redesigned">
              <button
                type="button"
                onClick={handleResetForm}
                className="btn-form-reset"
              >
                <span>🔄</span> Reset
              </button>

              <div className="form-actions-right">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-form-cancel"
                >
                  <span>✕</span> Cancel
                </button>
                <button
                  type="submit"
                  className="btn-form-save-primary"
                  disabled={saving}
                >
                  <span>✓</span> {saving ? 'Saving...' : 'Save Resume'}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Column 2: Live Preview */}
      <div className="resume-preview-pane">
        <ResumePreview
          personalInfo={personalInfo}
          education={education}
          skills={skills}
          projects={projects}
          experience={experience}
          certifications={certifications}
          templateId={selectedTemplate}
        />
      </div>

      {/* Column 3: ATS Dashboard */}
      <div className="resume-ats-pane">
        {atsAnalysis && (
          <div className="ats-dashboard">
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 1rem 0', textAlign: 'left' }}>
              ATS Analysis Dashboard
            </h3>
            <div className="ats-dashboard-grid">
              <AtsScoreCard score={atsAnalysis.score} grade={atsAnalysis.grade} />
              <SectionScore sectionScores={atsAnalysis.sectionScores} />
              <MissingSections missingSections={atsAnalysis.missingSections} />
              <SuggestionsPanel suggestions={atsAnalysis.suggestions} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResumeBuilder;
