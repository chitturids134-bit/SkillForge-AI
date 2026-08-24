import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAssessmentHistory, deleteAssessmentAttempt } from '../../services/assessmentService';
import StatusBadge from '../../components/common/StatusBadge';
import GradientButton from '../../components/common/GradientButton';
import '../../styles/auth.css';
import '../../styles/interview.css';
import '../../styles/profile.css';
import '../../styles/resume.css';
import '../../styles/assessment.css';

function AssessmentHistory() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Stats
  const [stats, setStats] = useState({ completed: 0, avgScore: 0, bestScore: 0, passed: 0 });

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await getAssessmentHistory();
      const list = res.history || [];
      setHistory(list);

      const completedList = list.filter(item => item.status === 'completed');
      const completedCount = completedList.length;
      const scores = completedList.map(i => i.percentage || 0);
      const avg = completedCount > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / completedCount) : 0;
      const max = completedCount > 0 ? Math.max(...scores) : 0;
      const passedCount = completedList.filter(i => i.passed).length;

      setStats({ completed: completedCount, avgScore: avg, bestScore: max, passed: passedCount });
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to fetch assessment history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (attemptId) => {
    if (!window.confirm('Are you sure you want to delete this assessment attempt record?')) return;

    try {
      await deleteAssessmentAttempt(attemptId);
      setSuccessMsg('Assessment record deleted successfully');
      setHistory(prev => prev.filter(item => item._id !== attemptId));
      setTimeout(() => setSuccessMsg(''), 2500);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete record');
      setTimeout(() => setErrorMsg(''), 2500);
    }
  };

  const handleRetake = (assessmentId) => {
    navigate('/assessments', { state: { autoStartId: assessmentId } });
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1150px', margin: '0 auto' }}>
      {successMsg && <div className="toast toast-success" style={{ marginBottom: '1.5rem' }}>{successMsg}</div>}
      {errorMsg && <div className="toast toast-error" style={{ marginBottom: '1.5rem' }}>{errorMsg}</div>}

      {/* HEADER */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            AI Assessment History
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Review, audit, compare, and retake your past technical skill assessments.
          </p>
        </div>

        <button
          type="button"
          className="assessment-btn-primary"
          onClick={() => navigate('/assessments')}
        >
          <span>✨</span> Browse Assessments
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

        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '14px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Assessments Passed</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#3B82F6', marginTop: '0.25rem' }}>
            {stats.passed}
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          Loading assessment history records...
        </div>
      ) : history.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3.5rem', borderRadius: '16px' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🧠</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            No Assessment History Found
          </h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 1.5rem auto', fontSize: '0.9rem' }}>
            You haven't completed any technical skill assessments yet. Validate your skills to earn profile badges!
          </p>
          <button
            type="button"
            className="assessment-btn-primary"
            onClick={() => navigate('/assessments')}
          >
            <span>✨</span> Take Your First Assessment
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {history.map((item) => {
            const dateStr = item.completedAt || item.createdAt
              ? new Date(item.completedAt || item.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
              : 'Recent';

            const assessmentTitle = item.assessment?.title || 'Skill Assessment';
            const icon = item.assessment?.icon || '⚡';
            const difficulty = item.assessment?.difficulty || 'Medium';

            return (
              <motion.div
                key={item._id}
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
                  <div style={{ fontSize: '2rem' }}>{icon}</div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                        {assessmentTitle}
                      </strong>
                      <span className="badge badge-primary" style={{ fontSize: '0.725rem' }}>
                        {difficulty}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                      Date: {dateStr} • Questions: {item.totalQuestions || 10} • Status:{' '}
                      <strong style={{ color: item.passed ? '#10B981' : '#EF4444' }}>
                        {item.passed ? 'PASSED' : item.status === 'completed' ? 'FAILED' : 'IN-PROGRESS'}
                      </strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: item.passed ? '#10B981' : '#F59E0B', display: 'block' }}>
                      {item.percentage || 0}% Score
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {item.score || 0} / {item.totalQuestions || 10} Correct
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => navigate(`/assessments/report/${item._id}`)}
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
                      onClick={() => handleRetake(item.assessment?._id || item.assessment)}
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
                      🔄 Retake
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item._id)}
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

export default AssessmentHistory;
