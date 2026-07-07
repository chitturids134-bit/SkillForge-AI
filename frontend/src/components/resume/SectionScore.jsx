import React from 'react';

function SectionScore({ sectionScores }) {
  if (!sectionScores) return null;

  const sections = [
    { key: 'personalInfo', label: 'Personal Info', max: 15 },
    { key: 'summary', label: 'Summary', max: 10 },
    { key: 'skills', label: 'Skills', max: 15 },
    { key: 'education', label: 'Education', max: 10 },
    { key: 'projects', label: 'Projects', max: 20 },
    { key: 'experience', label: 'Experience', max: 15 },
    { key: 'certifications', label: 'Certifications', max: 10 },
    { key: 'links', label: 'Professional Links', max: 5 },
  ];

  return (
    <div className="ats-card ats-breakdown-card">
      <h4 className="ats-card-title">Score Breakdown</h4>
      <div className="ats-breakdown-list">
        {sections.map((sec) => {
          const score = sectionScores[sec.key] || 0;
          const percentage = (score / sec.max) * 100;
          
          return (
            <div key={sec.key} className="ats-breakdown-item">
              <div className="ats-breakdown-info">
                <span className="ats-breakdown-label">{sec.label}</span>
                <span className="ats-breakdown-score">{score}/{sec.max}</span>
              </div>
              <div className="ats-progress-bg">
                <div 
                  className="ats-progress-bar" 
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: percentage >= 80 ? '#10b981' : percentage >= 50 ? '#3b82f6' : '#f59e0b' 
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SectionScore;
