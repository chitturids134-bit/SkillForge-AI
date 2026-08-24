import React from 'react';
import ResumeHeader from './ResumeHeader';
import ResumeSummary from './ResumeSummary';
import ResumeEducation from './ResumeEducation';
import ResumeSkills from './ResumeSkills';
import ResumeProjects from './ResumeProjects';
import ResumeExperience from './ResumeExperience';
import ResumeCertifications from './ResumeCertifications';

function ResumePreview({
  personalInfo,
  education,
  skills,
  projects,
  experience,
  certifications,
  templateId = 'silicon-valley-ai',
  isPreviewOnly = false
}) {
  const hasContent =
    isPreviewOnly ||
    (personalInfo && personalInfo.fullName && personalInfo.fullName.trim() !== '') ||
    (education && education.length > 0) ||
    (skills && (Array.isArray(skills) ? skills.length > 0 : skills.trim() !== '')) ||
    (projects && projects.length > 0) ||
    (experience && experience.length > 0) ||
    (certifications && certifications.length > 0);

  if (!hasContent) {
    return (
      <div className="resume-preview-sheet" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#a0aec0', padding: '3rem', textAlign: 'center', minHeight: '400px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
        <h3 style={{ color: 'var(--text-primary, #ffffff)', marginBottom: '0.5rem' }}>Live Resume Preview</h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary, #9ca3af)', maxWidth: '320px', margin: 0 }}>
          Your ATS-optimized resume will display here in real-time as you enter your details.
        </p>
      </div>
    );
  }

  // Get template specific class wrapper
  const getTemplateClass = () => {
    switch (templateId) {
      case 'executive-lead':
        return 'template-executive';
      case 'modern-creative':
        return 'template-creative';
      case 'faang-standard':
        return 'template-faang';
      case 'silicon-valley-ai':
      default:
        return 'template-modern-tech';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {!isPreviewOnly && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
          <button
            type="button"
            onClick={handlePrint}
            className="btn-add-skill-row"
            style={{ padding: '0.4rem 0.9rem', fontSize: '0.82rem', marginTop: 0 }}
          >
            🖨️ Export PDF / Print
          </button>
        </div>
      )}

      <div className={`resume-preview-sheet ${getTemplateClass()}`}>
        <ResumeHeader personalInfo={personalInfo} />
        <ResumeSummary summary={personalInfo?.summary} />
        <ResumeSkills skills={skills} />
        <ResumeExperience experience={experience} />
        <ResumeProjects projects={projects} />
        <ResumeEducation education={education} />
        <ResumeCertifications certifications={certifications} />
      </div>
    </div>
  );
}

export default ResumePreview;
