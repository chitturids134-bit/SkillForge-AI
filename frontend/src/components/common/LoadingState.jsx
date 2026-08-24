import React from 'react';

export function LoadingState({ message = 'Loading workspace data...' }) {
  return (
    <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-secondary, #94A3B8)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
      <div style={{ width: '32px', height: '32px', border: '3px solid rgba(139, 92, 246, 0.2)', borderTopColor: '#8B5CF6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{message}</span>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default LoadingState;
