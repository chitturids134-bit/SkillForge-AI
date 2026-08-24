import React from 'react';
import { motion } from 'framer-motion';

function Achievements() {
  const badges = [
    { title: 'ATS Master 90+', icon: '🏆', desc: 'Achieved 90%+ ATS resume evaluation score.' },
    { title: 'Interview Mastermind', icon: '🎯', desc: 'Completed 5+ AI practice mock sessions.' },
    { title: 'Full Stack Architect', icon: '⚡', desc: 'Cataloged 5+ core full stack engineering skills.' },
    { title: 'AI Pioneer', icon: '🤖', desc: 'Interacted with AI Mentor & Project Generator.' }
  ];

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>Achievements & Certificates</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Showcase verified achievements and credentials on your profile.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        {badges.map((b, idx) => (
          <motion.div key={idx} whileHover={{ y: -5 }} className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>{b.icon}</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{b.title}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{b.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default Achievements;
