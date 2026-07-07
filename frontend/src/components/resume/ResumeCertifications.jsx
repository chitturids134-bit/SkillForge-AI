import React from 'react';

function ResumeCertifications({ certifications }) {
  if (!certifications || !Array.isArray(certifications) || certifications.length === 0) return null;

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#2b6cb0', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.25rem', marginBottom: '0.75rem', letterSpacing: '0.5px' }}>
        Certifications
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {certifications.map((item, index) => {
          // Skip incomplete entries
          if (!item.name || !item.issuingOrganization) return null;

          return (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: '0.85rem' }}>
              <div style={{ color: '#2d3748', fontWeight: '500' }}>
                <span style={{ fontWeight: '700' }}>{item.name}</span> – {item.issuingOrganization}
                {item.credentialUrl && (
                  <a
                    href={item.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ marginLeft: '0.5rem', color: '#3182ce', fontSize: '0.75rem', fontWeight: '600' }}
                  >
                    verify 🔗
                  </a>
                )}
              </div>
              {item.issueDate && (
                <span style={{ fontSize: '0.8rem', color: '#718096', fontWeight: '500' }}>
                  {item.issueDate}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ResumeCertifications;
