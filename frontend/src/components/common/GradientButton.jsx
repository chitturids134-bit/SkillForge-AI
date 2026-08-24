import React from 'react';
import { motion } from 'framer-motion';

function GradientButton({ children, onClick, variant = 'primary', icon, style, type = 'button', disabled = false }) {
  const className = variant === 'secondary'
    ? 'btn-gradient-secondary'
    : variant === 'outline'
    ? 'btn-outline'
    : 'btn-gradient-primary';

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...style
      }}
    >
      {icon && <span>{icon}</span>}
      {children}
    </motion.button>
  );
}

export default GradientButton;
