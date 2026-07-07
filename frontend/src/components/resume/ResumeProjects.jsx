import React from 'react';

function ResumeProjects({ projects }) {
  if (!projects || !Array.isArray(projects) || projects.length === 0) return null;

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#2b6cb0', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.25rem', marginBottom: '0.75rem', letterSpacing: '0.5px' }}>
        Projects
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {projects.map((item, index) => {
          // Skip incomplete entries
          if (!item.title || !item.description) return null;

          // Parse technologies string into array dynamically if it's a string
          const techArray = typeof item.technologies === 'string'
            ? item.technologies.split(',').map((t) => t.trim()).filter(Boolean)
            : item.technologies || [];

          return (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontWeight: '700', fontSize: '0.9rem', color: '#2d3748' }}>
                <span>{item.title}</span>
                <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', fontWeight: '600' }}>
                  {item.githubUrl && (
                    <a href={item.githubUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#3182ce' }}>
                      Code
                    </a>
                  )}
                  {item.liveUrl && (
                    <a href={item.liveUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#3182ce' }}>
                      Demo
                    </a>
                  )}
                </div>
              </div>
              
              {techArray.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', margin: '0.15rem 0' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#718096', marginRight: '0.25rem' }}>Tech:</span>
                  {techArray.map((tech, tIdx) => (
                    <span key={tIdx} style={{ fontSize: '0.75rem', color: '#4a5568', backgroundColor: '#f7fafc', padding: '0.05rem 0.35rem', borderRadius: '3px', border: '1px solid #e2e8f0' }}>
                      {tech}
                    </span>
                  ))}
                </div>
              )}

              <p style={{ fontSize: '0.825rem', color: '#4a5568', lineHeight: '1.45', margin: 0, textAlign: 'justify' }}>
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ResumeProjects;
