import React from 'react';

function ResumeSummary({ summary }) {
  if (!summary || summary.trim() === '') return null;

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#2b6cb0', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.25rem', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>
        Professional Summary
      </h3>
      <p style={{ fontSize: '0.85rem', color: '#4a5568', lineHeight: '1.5', textAlign: 'justify', margin: 0 }}>
        {summary}
      </p>
    </div>
  );
}

export default ResumeSummary;
