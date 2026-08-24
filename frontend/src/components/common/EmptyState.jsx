import React from 'react';
import GradientButton from './GradientButton';

function EmptyState({ icon = '✨', title = 'No Data Found', description = 'Get started by creating a new entry.', actionLabel, onAction }) {
  return (
    <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <div style={{ fontSize: '3rem', padding: '1rem', borderRadius: '50%', backgroundColor: 'rgba(108, 99, 255, 0.1)', border: '1px solid rgba(108, 99, 255, 0.2)' }}>
        {icon}
      </div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h3>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '400px', lineHeight: 1.5 }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <div style={{ marginTop: '0.5rem' }}>
          <GradientButton onClick={onAction}>{actionLabel}</GradientButton>
        </div>
      )}
    </div>
  );
}

export default EmptyState;
