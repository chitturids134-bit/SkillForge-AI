import React from 'react';

function ResumeEducation({ education }) {
  if (!education || !Array.isArray(education) || education.length === 0) return null;

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#2b6cb0', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.25rem', marginBottom: '0.75rem', letterSpacing: '0.5px' }}>
        Education
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {education.map((item, index) => {
          // Skip incomplete entries
          if (!item.school || !item.degree) return null;
          
          return (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.825rem', color: '#4a5568' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontWeight: '700', fontSize: '0.9rem', color: '#2d3748' }}>
                <span>{item.school}</span>
                <span style={{ fontSize: '0.8rem', color: '#718096', fontWeight: '500' }}>
                  {item.startYear} – {item.endYear}
                </span>
              </div>
              <div style={{ fontWeight: '600', color: '#2d3748', fontSize: '0.85rem' }}>
                {item.degree}
              </div>
              {item.fieldOfStudy && (
                <div>
                  <span style={{ fontWeight: '600', color: '#4a5568' }}>Field of Study:</span> {item.fieldOfStudy}
                </div>
              )}
              {item.gpa && (
                <div>
                  <span style={{ fontWeight: '600', color: '#4a5568' }}>CGPA:</span> {item.gpa}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ResumeEducation;
