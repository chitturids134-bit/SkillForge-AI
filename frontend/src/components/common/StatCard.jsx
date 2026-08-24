import React from 'react';
import { motion } from 'framer-motion';

function StatCard({ title, value, icon, trend, description, color = 'primary', sparklineData = [10, 25, 18, 32, 28, 45, 40] }) {
  const getAccentDetails = () => {
    switch (color) {
      case 'purple':
        return { stroke: '#6C63FF', fill: 'rgba(108, 99, 255, 0.15)', glow: 'rgba(108, 99, 255, 0.2)', bg: 'rgba(108, 99, 255, 0.12)' };
      case 'blue':
      case 'secondary':
        return { stroke: '#00D4FF', fill: 'rgba(0, 212, 255, 0.15)', glow: 'rgba(0, 212, 255, 0.2)', bg: 'rgba(0, 212, 255, 0.12)' };
      case 'green':
      case 'success':
        return { stroke: '#22C55E', fill: 'rgba(34, 197, 94, 0.15)', glow: 'rgba(34, 197, 94, 0.2)', bg: 'rgba(34, 197, 94, 0.12)' };
      case 'orange':
      case 'warning':
        return { stroke: '#F59E0B', fill: 'rgba(245, 158, 11, 0.15)', glow: 'rgba(245, 158, 11, 0.2)', bg: 'rgba(245, 158, 11, 0.12)' };
      case 'pink':
        return { stroke: '#EC4899', fill: 'rgba(236, 72, 153, 0.15)', glow: 'rgba(236, 72, 153, 0.2)', bg: 'rgba(236, 72, 153, 0.12)' };
      case 'teal':
        return { stroke: '#14B8A6', fill: 'rgba(20, 184, 166, 0.15)', glow: 'rgba(20, 184, 166, 0.2)', bg: 'rgba(20, 184, 166, 0.12)' };
      default:
        return { stroke: '#6C63FF', fill: 'rgba(108, 99, 255, 0.15)', glow: 'rgba(108, 99, 255, 0.2)', bg: 'rgba(108, 99, 255, 0.12)' };
    }
  };

  const accent = getAccentDetails();

  // Convert sparkline numbers to SVG path
  const min = Math.min(...sparklineData);
  const max = Math.max(...sparklineData);
  const width = 120;
  const height = 30;
  const points = sparklineData.map((val, i) => {
    const x = (i / (sparklineData.length - 1)) * width;
    const y = height - ((val - min) / (max - min || 1)) * (height - 6) - 3;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="glass-panel stat-card-panel"
      style={{
        padding: '1.15rem 1.25rem',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        boxShadow: `0 10px 25px -10px ${accent.glow}`,
        borderTop: `3px solid ${accent.stroke}`,
        transition: 'var(--transition-smooth)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{title}</span>
        <span style={{
          fontSize: '1.1rem',
          padding: '0.4rem',
          borderRadius: '8px',
          backgroundColor: accent.bg,
          border: `1px solid ${accent.stroke}40`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: accent.stroke
        }}>
          {icon}
        </span>
      </div>

      <div style={{ zIndex: 2, marginTop: '0.4rem', marginBottom: '0.2rem' }}>
        <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          {value}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 2 }}>
        {trend ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem' }}>
            <span className={`badge ${trend.up ? 'badge-success' : 'badge-primary'}`} style={{ padding: '0.15rem 0.4rem', fontSize: '0.68rem' }}>
              {trend.up ? '▲' : '●'} {trend.text}
            </span>
          </div>
        ) : description ? (
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{description}</span>
        ) : <div />}

        {/* Mini SVG Sparkline Graph */}
        <div style={{ opacity: 0.9 }}>
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none">
            <polygon points={areaPoints} fill={accent.fill} />
            <polyline points={points} fill="none" stroke={accent.stroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </motion.div>
  );
}

export default StatCard;
