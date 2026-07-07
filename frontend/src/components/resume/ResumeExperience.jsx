import React from 'react';

function ResumeExperience({ experience }) {
  if (!experience || !Array.isArray(experience) || experience.length === 0) return null;

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#2b6cb0', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.25rem', marginBottom: '0.75rem', letterSpacing: '0.5px' }}>
        Work Experience
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {experience.map((item, index) => {
          // Skip incomplete entries
          if (!item.company || !item.role) return null;

          return (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontWeight: '700', fontSize: '0.9rem', color: '#2d3748' }}>
                <span>{item.role}</span>
                <span style={{ fontSize: '0.8rem', color: '#718096', fontWeight: '500' }}>
                  {item.startMonthYear} – {item.current ? 'Present' : item.endMonthYear}
                </span>
              </div>
              <div style={{ fontSize: '0.825rem', color: '#4a5568', fontWeight: '600', display: 'flex', justifyContent: 'space-between' }}>
                <span>{item.company}</span>
                {item.location && <span style={{ fontWeight: '500', color: '#718096', fontSize: '0.8rem' }}>{item.location}</span>}
              </div>
              <p style={{ fontSize: '0.825rem', color: '#4a5568', lineHeight: '1.45', margin: '0.15rem 0 0 0', textAlign: 'justify', whiteSpace: 'pre-line' }}>
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ResumeExperience;
