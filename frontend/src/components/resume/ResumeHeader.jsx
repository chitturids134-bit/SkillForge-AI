import React from 'react';

function ResumeHeader({ personalInfo }) {
  if (!personalInfo) return null;

  const { fullName, email, phone, githubUrl, linkedinUrl, portfolioUrl, address } = personalInfo;

  // Header requires at least a name to display
  if (!fullName || fullName.trim() === '') return null;

  return (
    <div className="preview-header-block" style={{ textAlign: 'center', marginBottom: '1.5rem', borderBottom: '2px solid #3182ce', paddingBottom: '1rem' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#2d3748', margin: '0 0 0.5rem 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {fullName}
      </h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem', fontSize: '0.85rem', color: '#4a5568', fontWeight: '500' }}>
        {address && <span>📍 {address}</span>}
        {phone && <span>📞 {phone}</span>}
        {email && <span>✉️ {email}</span>}
      </div>
      {(githubUrl || linkedinUrl || portfolioUrl) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem', fontSize: '0.85rem', color: '#3182ce', fontWeight: '600', marginTop: '0.5rem' }}>
          {githubUrl && <a href={githubUrl} target="_blank" rel="noopener noreferrer">🌐 GitHub</a>}
          {linkedinUrl && <a href={linkedinUrl} target="_blank" rel="noopener noreferrer">💼 LinkedIn</a>}
          {portfolioUrl && <a href={portfolioUrl} target="_blank" rel="noopener noreferrer">🔗 Portfolio</a>}
        </div>
      )}
    </div>
  );
}

export default ResumeHeader;
