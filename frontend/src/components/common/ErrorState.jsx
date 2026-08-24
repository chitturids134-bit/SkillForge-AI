import React from 'react';

export function ErrorState({ title = 'Something went wrong', message = 'Unable to load resources.', onRetry }) {
  return (
    <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', textAlign: 'center', maxWidth: '500px', margin: '2rem auto' }}>
      <h3 style={{ color: '#EF4444', margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 800 }}>⚠️ {title}</h3>
      <p style={{ color: 'var(--text-secondary)', margin: '0 0 1.25rem 0', fontSize: '0.88rem' }}>{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          style={{ padding: '0.55rem 1.25rem', borderRadius: '8px', background: '#EF4444', color: '#FFFFFF', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
        >
          🔄 Try Again
        </button>
      )}
    </div>
  );
}

export default ErrorState;
