import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import StatusBadge from '../../components/common/StatusBadge';
import GradientButton from '../../components/common/GradientButton';
import '../../styles/profile.css';
import '../../styles/resume.css';

function CareerRoadmap() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get('/api/career-roadmap');
      if (res.data && res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Fetch roadmap error:', err);
      setError(err.response?.data?.message || 'Unable to load your career roadmap.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const handleSelectPath = async (pathId) => {
    if (!data || data.selectedPath === pathId || updating) return;
    try {
      setUpdating(true);
      const res = await axios.put('/api/career-roadmap/select', { careerPath: pathId });
      if (res.data && res.data.success) {
        setData(res.data);
        setToastMsg('Switched career path successfully!');
        setTimeout(() => setToastMsg(''), 3000);
      }
    } catch (err) {
      console.error('Select path error:', err);
      setError(err.response?.data?.message || 'Failed to switch career path.');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateMilestone = async (milestoneId, currentStatus) => {
    if (!data || updating) return;
    const nextStatus = currentStatus === 'Completed' ? 'Not Started' : 'Completed';
    try {
      setUpdating(true);
      const res = await axios.put('/api/career-roadmap/milestone', {
        careerPath: data.selectedPath,
        milestoneId,
        status: nextStatus
      });
      if (res.data && res.data.success) {
        setData(res.data);
        setToastMsg(nextStatus === 'Completed' ? `Milestone ${milestoneId} marked as Completed!` : `Milestone ${milestoneId} reopened.`);
        setTimeout(() => setToastMsg(''), 3000);
      }
    } catch (err) {
      console.error('Update milestone error:', err);
      setError(err.response?.data?.message || 'Failed to update milestone status.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', color: 'var(--text-secondary)' }}>
        Loading your career roadmap...
      </div>
    );
  }

  if (error && !data) {
    return (
      <div style={{ padding: '3rem 2rem', textAlign: 'center', width: '100%', boxSizing: 'border-box' }}>
        <div className="glass-panel" style={{ padding: '3rem 2rem', borderRadius: '16px', maxWidth: '500px', margin: '0 auto', background: 'var(--bg-card)' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>⚠️</div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Unable to Load Career Roadmap
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            {error}
          </p>
          <GradientButton onClick={fetchRoadmap}>
            🔄 Retry Loading
          </GradientButton>
        </div>
      </div>
    );
  }

  const { pathDetails, milestones, overallProgress, completedMilestonesCount, totalMilestonesCount, availablePaths } = data;

  return (
    <div style={{ padding: '2rem', width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              zIndex: 9999,
              background: '#10B981',
              color: '#FFFFFF',
              padding: '0.85rem 1.5rem',
              borderRadius: '10px',
              fontWeight: 700,
              boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            }}
          >
            ✅ {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem' }}>
        <div>
          <span className="badge badge-primary" style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            ✨ CAREER ARCHITECTURE & GOALS
          </span>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1.25 }}>
            AI Career Roadmap & Milestones
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.35rem', fontSize: '0.925rem' }}>
            Curated step-by-step career progression tracks, weekly learning goals, required skills, and recommended projects.
          </p>
        </div>

        {/* OVERALL PROGRESS BADGE PANEL */}
        <div className="glass-panel" style={{ padding: '1rem 1.5rem', borderRadius: '14px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Selected Track
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.1rem' }}>
              {pathDetails.title}
            </div>
          </div>

          <div style={{ height: '32px', width: '1px', background: 'var(--border-color)' }} />

          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Overall Progress
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: overallProgress === 100 ? '#10B981' : '#8B5CF6', marginTop: '0.1rem' }}>
              {overallProgress}% <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>({completedMilestonesCount}/{totalMilestonesCount} done)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 1. CAREER PATH SELECTION CARDS */}
      <div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          Select Your Career Track
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
          {availablePaths.map((pathItem) => {
            const isSelected = pathItem.id === data.selectedPath;
            return (
              <motion.button
                key={pathItem.id}
                whileHover={{ y: -3 }}
                type="button"
                onClick={() => handleSelectPath(pathItem.id)}
                disabled={updating}
                style={{
                  padding: '1.25rem',
                  borderRadius: '14px',
                  textAlign: 'left',
                  background: isSelected ? 'rgba(139, 92, 246, 0.12)' : 'var(--bg-card, #151A2E)',
                  border: isSelected ? '2px solid #8B5CF6' : '1px solid var(--border-color)',
                  boxShadow: isSelected ? '0 8px 25px rgba(139, 92, 246, 0.25)' : '0 4px 15px rgba(0,0,0,0.15)',
                  cursor: updating ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  gap: '0.75rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span className="badge badge-primary" style={{ fontSize: '0.7rem', fontWeight: 700 }}>
                      {pathItem.badge}
                    </span>
                    {isSelected && (
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#8B5CF6', background: 'rgba(139, 92, 246, 0.2)', padding: '0.15rem 0.5rem', borderRadius: '12px' }}>
                        ✓ ACTIVE
                      </span>
                    )}
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    {pathItem.title}
                  </h4>
                </div>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                  {pathItem.description}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* 2. DYNAMIC ROADMAP MILESTONES */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              {pathDetails.title} Roadmap & Milestones
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Complete milestones step-by-step to progress towards career mastery.
            </p>
          </div>
          <StatusBadge status={`${overallProgress}% Track Progress`} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
          {milestones.map((m, idx) => {
            const isCompleted = m.status === 'Completed';

            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="glass-panel"
                style={{
                  padding: '1.5rem 1.75rem',
                  borderRadius: '16px',
                  background: 'var(--bg-card)',
                  border: isCompleted ? '1.5px solid #10B981' : '1px solid var(--border-color)',
                  borderLeft: isCompleted ? '5px solid #10B981' : m.status === 'In Progress' ? '5px solid #8B5CF6' : '5px solid var(--border-color)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.2)'
                }}
              >
                {/* Milestone Top Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: isCompleted ? 'rgba(16, 185, 129, 0.15)' : 'rgba(139, 92, 246, 0.15)',
                        color: isCompleted ? '#10B981' : '#8B5CF6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: '1rem',
                        border: isCompleted ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(139, 92, 246, 0.3)'
                      }}
                    >
                      {m.id}
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        {m.phase} • {m.duration}
                      </span>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                        {m.title}
                      </h4>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <span
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        padding: '0.3rem 0.75rem',
                        borderRadius: '20px',
                        background: isCompleted ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                        color: isCompleted ? '#34D399' : 'var(--text-secondary)',
                        border: isCompleted ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-color)'
                      }}
                    >
                      {isCompleted ? '✓ Completed' : m.status}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleUpdateMilestone(m.id, m.status)}
                      disabled={updating}
                      style={{
                        padding: '0.45rem 1rem',
                        borderRadius: '8px',
                        background: isCompleted ? 'rgba(255, 255, 255, 0.05)' : 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                        border: isCompleted ? '1px solid var(--border-color)' : 'none',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '0.825rem',
                        cursor: updating ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: isCompleted ? 'none' : '0 4px 12px rgba(139, 92, 246, 0.3)'
                      }}
                    >
                      {isCompleted ? '🔄 Mark Incomplete' : '✓ Mark Complete'}
                    </button>
                  </div>
                </div>

                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  {m.description}
                </p>

                {/* Progress Bar */}
                <div style={{ width: '100%', height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: '1.25rem' }}>
                  <div
                    style={{
                      width: `${m.progress}%`,
                      height: '100%',
                      background: isCompleted ? '#10B981' : '#8B5CF6',
                      transition: 'width 0.3 ease'
                    }}
                  />
                </div>

                {/* Skills & Recommended Project Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.45rem' }}>
                      🧠 Key Skills Covered:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {m.skills.map((s, sIdx) => (
                        <span key={sIdx} className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.45rem' }}>
                      🚀 Recommended Milestone Project:
                    </span>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                      • {m.project}
                    </div>
                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 3. SKILLS & PROJECT RECOMMENDATIONS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
        {/* SKILLS PANEL */}
        <div className="glass-panel" style={{ padding: '1.5rem 1.75rem', borderRadius: '16px', background: 'var(--bg-card)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            🧠 Required Skills Competency
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {pathDetails.skills.map((sk, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
                <div>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block' }}>{sk.name}</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sk.category}</span>
                </div>
                <span className="badge badge-primary" style={{ fontSize: '0.725rem', textTransform: 'uppercase' }}>
                  {sk.level}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* PROJECTS RECOMMENDATION PANEL */}
        <div className="glass-panel" style={{ padding: '1.5rem 1.75rem', borderRadius: '16px', background: 'var(--bg-card)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            🚀 Recommended Career Portfolio Projects
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {pathDetails.projects.map((proj, idx) => (
              <div key={idx} style={{ padding: '0.85rem 1rem', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                  <strong style={{ fontSize: '0.925rem', color: 'var(--text-primary)' }}>{proj.title}</strong>
                  <span style={{ fontSize: '0.725rem', padding: '0.15rem 0.5rem', borderRadius: '6px', background: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6', fontWeight: 700 }}>
                    {proj.difficulty}
                  </span>
                </div>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                  {proj.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}

export default CareerRoadmap;
