import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getUserInterviews, deleteInterview } from '../../services/interviewService';
import StatusBadge from '../../components/common/StatusBadge';
import GradientButton from '../../components/common/GradientButton';
import '../../styles/auth.css';
import '../../styles/interview.css';
import '../../styles/profile.css';

function InterviewHistory() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Stats
  const [stats, setStats] = useState({ completed: 0, avgScore: 0, bestScore: 0 });

  // Fetch all sessions
  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await getUserInterviews();
      const list = res.interviews || [];
      setSessions(list);

      // Compute Stats
      const completedList = list.filter(i => i.completed);
      const completedCount = completedList.length;
      const scores = completedList.map(i => i.overallScore || 0);
      const avg = completedCount > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / completedCount) : 0;
      const max = completedCount > 0 ? Math.max(...scores) : 0;
      setStats({ completed: completedCount, avgScore: avg, bestScore: max });
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to fetch interview history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Delete session
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this interview record?')) return;

    try {
      await deleteInterview(id);
      setSuccessMsg('Record deleted successfully');
      setSessions(prev => prev.filter(s => s._id !== id));
      setTimeout(() => setSuccessMsg(''), 2500);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete record');
      setTimeout(() => setErrorMsg(''), 2500);
    }
  };

  // Retake triggers navigation with configuration states
  const handleRetake = (session) => {
    navigate('/interview', {
      state: {
        retake: {
          category: session.category,
          difficulty: session.difficulty,
          questionCount: session.questionCount || session.questions?.length || 5
        }
      }
    });
  };

  const getBadgeClass = (category) => {
    if (category === 'Technical') return 'badge-tech';
    if (category === 'HR') return 'badge-hr';
    return 'badge-behavioral';
  };

  return (
    <div style={{ padding: '2rem', width: '100%' }}>
      {successMsg && <div className="toast toast-success" style={{ marginBottom: '1.5rem' }}>{successMsg}</div>}
      {errorMsg && <div className="toast toast-error" style={{ marginBottom: '1.5rem' }}>{errorMsg}</div>}

      {/* HEADER */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Interview History
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Review, audit, compare, and retake your past practice interview sessions.
          </p>
        </div>

        <button
          type="button"
          className="interview-history-start-btn"
          onClick={() => navigate('/interview')}
        >
          <span>✨</span> Start New Interview
        </button>
      </div>

      {/* STATS HEADER */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '14px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Completed</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
            {stats.completed}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '14px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Average Score</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-primary, #8B5CF6)', marginTop: '0.25rem' }}>
            {stats.avgScore}%
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '14px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Highest Score</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-success, #10B981)', marginTop: '0.25rem' }}>
            {stats.bestScore}%
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          Loading saved interview records...
        </div>
      ) : sessions.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3.5rem', borderRadius: '16px' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎤</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            No Interview History Found
          </h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 1.5rem auto', fontSize: '0.9rem' }}>
            Your completed practice interview sessions will automatically appear here with score breakdowns and detailed feedback.
          </p>
          <button
            type="button"
            className="interview-history-start-btn"
            onClick={() => navigate('/interview')}
          >
            <span>✨</span> Start Your First Interview
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {sessions.map((sess) => {
            const dateStr = sess.createdAt ? new Date(sess.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recent';

            return (
              <motion.div
                key={sess._id}
                whileHover={{ scale: 1.005 }}
                className="glass-panel"
                style={{
                  padding: '1.25rem 1.5rem',
                  borderRadius: '14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ fontSize: '2rem' }}>
                    {sess.category === 'Technical' ? '💻' : sess.category === 'HR' ? '🤝' : '🎯'}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                        {sess.category} Practice Interview
                      </strong>
                      <span className={`badge ${getBadgeClass(sess.category)}`} style={{ fontSize: '0.725rem' }}>
                        {sess.difficulty}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                      Date: {dateStr} • Questions: {sess.questions?.length || sess.questionCount || 5} • Status:{' '}
                      <strong style={{ color: sess.completed ? '#10B981' : '#F59E0B' }}>
                        {sess.completed ? 'Completed' : 'In-Progress'}
                      </strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-success, #10B981)', display: 'block' }}>
                      {sess.overallScore || 0}% Score
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => navigate(`/interview/report/${sess._id}`)}
                      style={{
                        padding: '0.45rem 0.85rem',
                        borderRadius: '8px',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      📜 View Report
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRetake(sess)}
                      style={{
                        padding: '0.45rem 0.85rem',
                        borderRadius: '8px',
                        background: 'rgba(139, 92, 246, 0.15)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        color: '#A78BFA',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      🔄 Practice Again
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(sess._id)}
                      style={{
                        padding: '0.45rem 0.75rem',
                        borderRadius: '8px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#F87171',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default InterviewHistory;
