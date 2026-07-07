import React from 'react';
import { useNavigate } from 'react-router-dom';

function QuickAction({ label, path, disabled }) {
  const navigate = useNavigate();

  const handleActionClick = () => {
    if (!disabled && path) {
      navigate(path);
    }
  };

  return (
    <button 
      className="quick-action-btn" 
      onClick={handleActionClick}
      disabled={disabled}
      style={disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
    >
      <span>{label}</span>
      <span className="action-arrow">➔</span>
    </button>
  );
}

export default QuickAction;
