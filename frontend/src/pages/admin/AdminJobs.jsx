import React, { useState, useEffect, useCallback } from 'react';
import { getAdminJobs } from '../../services/adminService';

function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAdminJobs({ search });
      if (res?.success) setJobs(res.jobs || []);
    } catch (err) {
      console.error('Fetch jobs error:', err);
      setError(err.response?.data?.message || 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return (
    <div style={{ padding: '2rem', maxWidth: 'none', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
            Job Requisitions Audit
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.2rem 0 0 0' }}>
            Monitor corporate job postings and applicant counts across the platform.
          </p>
        </div>

        <input
          type="text"
          placeholder="🔍 Search title or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '0.55rem 0.85rem', borderRadius: '8px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.88rem' }}
        />
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '18px', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading job requisitions...</div>
        ) : error ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#EF4444' }}>{error}</div>
        ) : jobs.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No job postings found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Job Title</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Company</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Location</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Applicants</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Posted Date</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((j) => (
                  <tr key={j._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>💼 {j.title}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{j.company}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{j.location}</td>
                    <td style={{ padding: '1rem', fontWeight: 700, color: '#8B5CF6' }}>{j.applicantCount || 0}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      {new Date(j.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminJobs;
