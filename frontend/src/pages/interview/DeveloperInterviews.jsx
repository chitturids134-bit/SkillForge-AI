import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StatusBadge from '../../components/common/StatusBadge';
import '../../styles/interview.css';

function DeveloperInterviews() {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchInterviews = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/interviews', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && (res.data.interviews || res.data.data)) {
        setInterviews(res.data.interviews || res.data.data || []);
      }
    } catch (err) {
      console.error('Fetch Developer Interviews Error:', err);
      setError(err.response?.data?.message || err.message || 'Unable to fetch interviews.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  return (
    <div style={{ padding: '2rem', width: '100%', maxWidth: '1100px', margin: '0 auto', boxSizing: 'border-box' }}>
      
      {/* HEADER */}
      <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              🎤 Technical & Recruiter Interviews
            </h1>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '0.35rem 0 0 0' }}>
              View incoming recruiter interview invitations, respond to schedules, and track technical screening results.
            </p>
          </div>

          <button
            type="button"
            className="recruiter-dashboard-cta-btn"
            onClick={() => navigate('/interview/prep')}
          >
            🤖 Take AI Technical Screening
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading interviews...
        </div>
      ) : error ? (
        <div style={{ padding: '1.5rem', borderRadius: '12px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', fontWeight: 700 }}>
          {error}
        </div>
      ) : interviews.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem 1.5rem', textAlign: 'center', borderRadius: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem' }}>📅</span>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.35rem 0' }}>
            No Scheduled Interviews Yet
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '0 0 1.25rem 0' }}>
            Recruiter invitations and practice AI sessions will appear here.
          </p>
          <button type="button" className="recruiter-dashboard-cta-btn" onClick={() => navigate('/interview/prep')}>
            Start AI Technical Screening
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {interviews.map(inv => {
            const isRecruiter = inv.type === 'recruiter_interview';
            const dateStr = new Date(inv.scheduledAt || inv.createdAt).toLocaleString();
            return (
              <div
                key={inv._id || inv.id}
                className="glass-panel"
                onClick={() => navigate(`/developer/interviews/${inv._id || inv.id}`)}
                style={{
                  padding: '1.35rem',
                  borderRadius: '16px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  minHeight: '180px',
                  transition: 'transform 0.2s ease, border-color 0.2s ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: isRecruiter ? '#8B5CF6' : '#00D4FF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {isRecruiter ? '👤 RECRUITER INTERVIEW' : '🤖 AI TECHNICAL'}
                    </span>
                    <StatusBadge status={inv.status} />
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.35rem 0' }}>
                    {inv.jobTitle || inv.job?.title || 'Technical Session'}
                  </h3>

                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    📅 {dateStr}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#8B5CF6' }}>
                    {inv.status === 'scheduled' ? 'Action Required →' : 'View Details →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

export default DeveloperInterviews;
