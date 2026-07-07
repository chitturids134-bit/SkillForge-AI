import React from 'react';
import ResumeHeader from './ResumeHeader';
import ResumeSummary from './ResumeSummary';
import ResumeEducation from './ResumeEducation';
import ResumeSkills from './ResumeSkills';
import ResumeProjects from './ResumeProjects';
import ResumeExperience from './ResumeExperience';
import ResumeCertifications from './ResumeCertifications';

function ResumePreview({ personalInfo, education, skills, projects, experience, certifications }) {
  // If no details are entered yet, render a helpful placeholder screen
  const hasContent = 
    (personalInfo && personalInfo.fullName && personalInfo.fullName.trim() !== '') ||
    (education && education.length > 0) ||
    (skills && skills.trim() !== '') ||
    (projects && projects.length > 0) ||
    (experience && experience.length > 0) ||
    (certifications && certifications.length > 0);

  if (!hasContent) {
    return (
      <div className="resume-preview-sheet" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#a0aec0', padding: '3rem', textAlign: 'center', minHeight: '400px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
        <h3 style={{ color: '#4a5568', marginBottom: '0.5rem' }}>Live Resume Preview</h3>
        <p style={{ fontSize: '0.875rem', maxWidth: '300px', margin: 0 }}>
          Your professional A4 resume page will display here in real-time as you start filling out details.
        </p>
      </div>
    );
  }

  return (
    <div className="resume-preview-sheet">
      <ResumeHeader personalInfo={personalInfo} />
      <ResumeSummary summary={personalInfo?.summary} />
      <ResumeSkills skills={skills} />
      <ResumeExperience experience={experience} />
      <ResumeProjects projects={projects} />
      <ResumeEducation education={education} />
      <ResumeCertifications certifications={certifications} />
    </div>
  );
}

export default ResumePreview;
