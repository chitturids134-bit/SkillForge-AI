import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import '../../styles/resume.css';

function InterviewSchedule() {
  const [sessions, setSessions] = useState([]);
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

      if (res.data && (res.data.success || Array.isArray(res.data))) {
        const rawList = res.data.interviews || res.data.data || (Array.isArray(res.data) ? res.data : []);
        const formatted = rawList.map(item => ({
          id: item._id || item.id,
          candidate: item.candidateName || item.user?.name || item.candidate?.name || 'Candidate',
          role: item.jobTitle || item.job?.title || item.title || 'Technical Role',
          date: item.scheduledAt ? new Date(item.scheduledAt).toLocaleString() : new Date(item.createdAt || Date.now()).toLocaleDateString(),
          format: item.format || item.type || 'AI Technical Screen',
          status: item.status === 'completed' ? 'Completed' : item.status === 'confirmed' ? 'Confirmed' : 'Scheduled'
        }));
        setSessions(formatted);
      } else {
        setSessions([]);
      }
    } catch (err) {
      console.error('Fetch Interview Schedule Error:', err);
      setError(err.response?.data?.message || err.message || 'Unable to fetch interview schedule.');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  const columns = [
    { header: 'Candidate', accessor: 'candidate', render: (row) => <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>👤 {row.candidate}</span> },
    { header: 'Requisition', accessor: 'role', render: (row) => <span style={{ color: '#8B5CF6', fontWeight: 600 }}>{row.role}</span> },
    { header: 'Date & Time', accessor: 'date', render: (row) => <span style={{ color: 'var(--text-secondary)' }}>📅 {row.date}</span> },
    { header: 'Format', accessor: 'format', render: (row) => <span style={{ fontSize: '0.82rem', padding: '0.2rem 0.6rem', borderRadius: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>{row.format}</span> },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} /> }
  ];

  return (
    <div style={{ padding: '2rem', width: '100%' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.4rem 0' }}>
            📅 Interview Schedule & Results
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>
            Automated calendar sync and AI technical interview evaluation records.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchInterviews}
          style={{
            height: '42px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0 1.25rem',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(139, 92, 246, 0.4)',
            color: 'var(--text-primary)',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer'
          }}
        >
          <span>🔄</span> Refresh Schedule
        </button>
      </div>

      {error && (
        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', borderRadius: '14px', marginBottom: '2rem', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, color: '#EF4444', marginBottom: '0.2rem' }}>⚠️ Unable to Load Interview Schedule</div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{error}</div>
          </div>
          <button type="button" className="recruiter-dashboard-cta-btn" onClick={fetchInterviews} style={{ background: '#EF4444' }}>🔄 Retry</button>
        </div>
      )}

      {loading ? (
        <div className="glass-panel" style={{ padding: '3rem', borderRadius: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem', animation: 'spin 1s infinite linear' }}>⚙️</div>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Loading interview schedule from database...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem 2rem', borderRadius: '16px', textAlign: 'center', background: 'var(--bg-card)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>
            No Interviews Scheduled Yet
          </h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 1.5rem auto', fontSize: '0.92rem' }}>
            Technical interview invitations will appear here once candidates reach the interview stage in your hiring pipeline.
          </p>
        </div>
      ) : (
        <DataTable columns={columns} data={sessions} />
      )}
    </div>
  );
}

export default InterviewSchedule;
