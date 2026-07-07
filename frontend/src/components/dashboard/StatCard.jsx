import React from 'react';

function StatCard({ title, value, icon, trend }) {
  return (
    <div className="stat-card glass-panel">
      <div className="stat-header">
        <span>{title}</span>
        <span className="stat-icon">{icon}</span>
      </div>
      <div className="stat-value">{value}</div>
      {trend && (
        <div className={`stat-trend ${trend.up ? 'trend-up' : 'trend-neutral'}`}>
          {trend.up ? '▲' : '•'} {trend.text}
        </div>
      )}
    </div>
  );
}

export default StatCard;
