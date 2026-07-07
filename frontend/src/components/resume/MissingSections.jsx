import React from 'react';

function MissingSections({ missingSections }) {
  const hasMissing = missingSections && missingSections.length > 0;

  return (
    <div className="ats-card ats-missing-card">
      <h4 className="ats-card-title">Missing Sections</h4>
      {hasMissing ? (
        <ul className="ats-missing-list">
          {missingSections.map((sec, idx) => (
            <li key={idx} className="ats-missing-item">
              <span className="ats-missing-icon">⚠️</span>
              <span className="ats-missing-text">{sec}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="ats-all-complete">
          <span style={{ fontSize: '2rem', color: '#10b981' }}>✓</span>
          <p style={{ margin: '0.5rem 0 0 0', fontWeight: '600', color: 'var(--accent-success)' }}>
            All essential sections present!
          </p>
        </div>
      )}
    </div>
  );
}

export default MissingSections;
