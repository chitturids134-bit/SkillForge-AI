import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RESUME_TEMPLATES, SAMPLE_PREVIEW_DATA } from '../../data/resumeTemplates';
import ResumePreview from '../../components/resume/ResumePreview';
import '../../styles/resume.css';

function ResumeTemplates() {
  const navigate = useNavigate();

  // Selected template for Modal Preview
  const [previewTemplate, setPreviewTemplate] = useState(null);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setPreviewTemplate(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleUseTemplate = (templateId) => {
    navigate(`/resume?template=${templateId}`);
  };

  return (
    <div style={{ padding: '2rem', width: '100%', boxSizing: 'border-box' }}>
      {/* HEADER */}
      <div style={{ marginBottom: '2.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-primary" style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            ✨ ATS-OPTIMIZED DESIGN STUDIO
          </span>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1.25 }}>
            AI Resume Templates Studio
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.35rem', fontSize: '0.925rem' }}>
            Select an ATS-optimized professional template tailored for your software engineering career.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/resume')}
          className="btn-form-cancel"
          style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}
        >
          <span>📄</span> Open Resume Studio
        </button>
      </div>

      {/* TEMPLATE CARDS GRID */}
      <div className="template-cards-grid">
        {RESUME_TEMPLATES.map((tpl) => (
          <motion.div
            key={tpl.id}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
            className="template-card-panel"
          >
            {/* Top Content Block */}
            <div className="template-card-top-content">
              {/* Badge & Rating Row */}
              <div className="template-card-header-row">
                <span className="badge badge-primary template-tag-badge">
                  {tpl.tag}
                </span>
                <div className="template-card-metrics">
                  <span className="template-ats-badge">
                    {tpl.atsScore} ATS
                  </span>
                  <span className="template-rating-text">
                    ★ {tpl.rating}
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="template-card-title">
                {tpl.title}
              </h3>
              <p className="template-card-desc">
                {tpl.desc}
              </p>

              {/* Recommended Roles Pills */}
              <div className="template-roles-list">
                {tpl.recommendedFor.map((role, idx) => (
                  <span key={idx} className="template-role-pill">
                    {role}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions Row - Aligned at Bottom */}
            <div className="template-card-actions-row">
              <button
                type="button"
                onClick={() => setPreviewTemplate(tpl)}
                className="template-btn-secondary"
              >
                <span>👁️</span> Preview
              </button>

              <button
                type="button"
                onClick={() => handleUseTemplate(tpl.id)}
                className="template-btn-primary"
              >
                <span>✨</span> Use Template
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* FOOTER FEATURE CARDS */}
      <div className="template-footer-feature-panel">
        <h3 className="template-footer-title">
          Choose the right template for your career goal
        </h3>
        <div className="template-footer-grid">
          <div className="template-feature-item">
            <span className="template-feature-icon">🎯</span>
            <strong className="template-feature-heading">ATS-Friendly Layouts</strong>
            <p className="template-feature-desc">
              Structured typography optimized to pass Workday, Greenhouse, and Lever resume parsers.
            </p>
          </div>

          <div className="template-feature-item">
            <span className="template-feature-icon">💻</span>
            <strong className="template-feature-heading">Engineering-Focused</strong>
            <p className="template-feature-desc">
              Dedicated sections for GitHub repositories, technical skills, and production metrics.
            </p>
          </div>

          <div className="template-feature-item">
            <span className="template-feature-icon">⚡</span>
            <strong className="template-feature-heading">Instant Pre-Fill</strong>
            <p className="template-feature-desc">
              Seamlessly imports your SkillForge AI developer profile details into your chosen template.
            </p>
          </div>
        </div>
      </div>

      {/* PREVIEW MODAL */}
      <AnimatePresence>
        {previewTemplate && (
          <div className="profile-modal-overlay">
            <motion.div
              className="profile-modal-container"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              style={{ maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto' }}
            >
              {/* Modal Header */}
              <div className="modal-header-bar">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{previewTemplate.tag}</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>• Sample Preview Data</span>
                  </div>
                  <h2 className="modal-title-text">{previewTemplate.title}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewTemplate(null)}
                  className="modal-close-btn"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body: Live Visual Preview */}
              <div style={{ padding: '1.5rem', background: 'var(--bg-secondary, rgba(0,0,0,0.2))' }}>
                <ResumePreview
                  personalInfo={SAMPLE_PREVIEW_DATA.personalInfo}
                  education={SAMPLE_PREVIEW_DATA.education}
                  skills={SAMPLE_PREVIEW_DATA.skills}
                  projects={SAMPLE_PREVIEW_DATA.projects}
                  experience={SAMPLE_PREVIEW_DATA.experience}
                  certifications={SAMPLE_PREVIEW_DATA.certifications}
                  templateId={previewTemplate.id}
                  isPreviewOnly={true}
                />
              </div>

              {/* Modal Footer Actions */}
              <div className="modal-footer-row" style={{ padding: '1.25rem 1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setPreviewTemplate(null)}
                  className="btn-cancel-modal"
                >
                  Close Preview
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const id = previewTemplate.id;
                    setPreviewTemplate(null);
                    handleUseTemplate(id);
                  }}
                  className="template-btn-primary"
                  style={{ padding: '0.65rem 1.5rem' }}
                >
                  <span>✨</span> Use Template
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ResumeTemplates;
