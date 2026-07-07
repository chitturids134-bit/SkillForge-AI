import React from 'react';

function ResumeSkills({ skills }) {
  if (!skills || typeof skills !== 'string' || skills.trim() === '') return null;

  // Split skill items dynamically
  const skillsArray = skills
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (skillsArray.length === 0) return null;

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#2b6cb0', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.25rem', marginBottom: '0.6rem', letterSpacing: '0.5px' }}>
        Skills
      </h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {skillsArray.map((skill, index) => (
          <span
            key={index}
            style={{
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              backgroundColor: '#edf2f7',
              color: '#2d3748',
              fontSize: '0.75rem',
              fontWeight: '600',
              border: '1px solid #cbd5e0',
            }}
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}

export default ResumeSkills;
