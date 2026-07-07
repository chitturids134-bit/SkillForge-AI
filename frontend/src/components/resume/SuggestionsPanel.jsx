import React from 'react';

function SuggestionsPanel({ suggestions }) {
  const hasSuggestions = suggestions && suggestions.length > 0;

  return (
    <div className="ats-card ats-suggestions-card">
      <h4 className="ats-card-title">Improvement Suggestions</h4>
      {hasSuggestions ? (
        <div className="ats-suggestions-list">
          {suggestions.map((sug, idx) => (
            <div key={idx} className="ats-suggestion-item">
              <span className="ats-suggestion-bullet">💡</span>
              <p className="ats-suggestion-text">{sug}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="ats-all-complete" style={{ padding: '2rem 1.5rem' }}>
          <span style={{ fontSize: '2rem' }}>🎉</span>
          <p style={{ margin: '0.5rem 0 0 0', fontWeight: '600', color: 'var(--accent-success)' }}>
            Outstanding! Your resume meets all standard ATS rules.
          </p>
        </div>
      )}
    </div>
  );
}

export default SuggestionsPanel;
