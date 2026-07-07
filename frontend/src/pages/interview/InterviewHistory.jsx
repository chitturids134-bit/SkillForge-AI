import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/auth.css';
import '../../styles/interview.css';

const API_URL = 'http://localhost:5004/api/interview';

function InterviewHistory() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Detailed view modal state
  const [activeSession, setActiveSession] = useState(null);

  // Fetch all sessions
  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/me`);
      setSessions(res.data.interviews || []);
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
      await axios.delete(`${API_URL}/${id}`);
      setSuccessMsg('Record deleted successfully');
      setSessions(prev => prev.filter(s => s._id !== id));
      if (activeSession?._id === id) {
        setActiveSession(null);
      }
      setTimeout(() => setSuccessMsg(''), 2000);
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
          questionCount: session.questions?.length || 5
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
    <div className="interview-container">
      {successMsg && <div className="toast toast-success">{successMsg}</div>}
      {errorMsg && <div className="toast toast-error">{errorMsg}</div>}

      <div className="interview-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="interview-title">Interview History</h1>
          <p className="interview-subtitle">Review your past practice sessions and feedback.</p>
        </div>
        <button
          type="button"
          className="auth-btn"
          style={{ margin: 0 }}
          onClick={() => navigate('/interview')}
        >
          New Interview
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          Loading records...
        </div>
      ) : sessions.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            No interview sessions recorded yet. Start practicing to see history!
          </p>
          <button
            type="button"
            className="auth-btn"
            onClick={() => navigate('/interview')}
          >
            Practice Now
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {sessions.map((session) => (
            <div key={session._id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span className={`session-badge ${getBadgeClass(session.category)}`} style={{ margin: 0 }}>
                    {session.category}
                  </span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Difficulty: <strong>{session.difficulty}</strong>
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {new Date(session.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Score</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '700', color: session.overallScore >= 70 ? 'var(--accent-success)' : 'var(--accent-primary)' }}>
                      {session.overallScore}/100
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className="wizard-nav-btn btn-secondary"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                      onClick={() => navigate(`/interview/report/${session._id}`)}
                    >
                      View Report
                    </button>
                    <button
                      type="button"
                      className="wizard-nav-btn btn-primary"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                      onClick={() => handleRetake(session)}
                    >
                      Retake
                    </button>
                    <button
                      type="button"
                      className="wizard-nav-btn btn-secondary"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', color: '#ef4444', borderColor: '#ef4444' }}
                      onClick={() => handleDelete(session._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details View Block */}
      <AnimatePresence>
        {activeSession && (
          <motion.div
            className="glass-panel"
            style={{ marginTop: '2rem', padding: '2rem', border: '1px solid var(--accent-primary)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                Session Details: {activeSession.category} ({activeSession.difficulty})
              </h3>
              <button
                type="button"
                className="logout-btn"
                style={{ padding: '0.25rem 0.75rem', margin: 0 }}
                onClick={() => setActiveSession(null)}
              >
                Close Details
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {activeSession.questions?.map((q, idx) => (
                <div key={q._id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                  <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    Q{idx + 1}: {q.question}
                  </div>
                  <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.9rem', whiteSpace: 'pre-wrap', marginBottom: '0.5rem' }}>
                    {q.answer || <em>No answer provided.</em>}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '1rem' }}>
                    <span>Rating: <strong>{q.score}/100</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button
          type="button"
          className="logout-btn"
          onClick={() => navigate('/developer/dashboard')}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default InterviewHistory;
