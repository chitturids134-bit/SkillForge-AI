import React from 'react';

function RecommendationCard({ recommendation }) {
  const { title, description, type, priority } = recommendation;

  return (
    <div className="recommendation-card">
      <div className="rec-header">
        <span className="rec-type">{type}</span>
        <span className={`rec-badge ${priority.toLowerCase()}`}>
          {priority} Priority
        </span>
      </div>
      <h4 className="rec-title">{title}</h4>
      <p className="rec-desc">{description}</p>
    </div>
  );
}

export default RecommendationCard;
