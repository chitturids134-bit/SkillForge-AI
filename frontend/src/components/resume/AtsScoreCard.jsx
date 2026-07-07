import React from 'react';

function AtsScoreCard({ score, grade }) {
  // Determine color based on grade/score
  let color = '#ef4444'; // Red
  if (score >= 90) color = '#10b981'; // Green
  else if (score >= 75) color = '#3b82f6'; // Blue
  else if (score >= 60) color = '#f59e0b'; // Amber

  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

  return (
    <div className="ats-card ats-score-card">
      <h4 className="ats-card-title">ATS Score</h4>
      <div className="ats-circular-progress">
        <svg width="120" height="120" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="var(--bg-tertiary)"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
          />
          {/* Text */}
          <text
            x="50"
            y="56"
            textAnchor="middle"
            fill="var(--text-primary)"
            fontSize="18"
            fontWeight="bold"
          >
            {score}
          </text>
        </svg>
      </div>
      <div className="ats-grade-text" style={{ color }}>
        {grade}
      </div>
    </div>
  );
}

export default AtsScoreCard;
