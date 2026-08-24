import React from 'react';

function KPICard({ title, value, icon, trend, trendUp = true }) {
  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.25rem 1.5rem',
        borderRadius: '16px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
          {title}
        </span>
        <span
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'rgba(139, 92, 246, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.1rem',
          }}
        >
          {icon || '📊'}
        </span>
      </div>

      <div>
        <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.1, marginBottom: '0.35rem' }}>
          {value}
        </div>

        {trend && (
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: trendUp ? '#10B981' : '#EF4444', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span>{trendUp ? '↗' : '↘'}</span>
            <span>{trend}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default KPICard;
