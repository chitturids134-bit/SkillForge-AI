import React, { useState, useEffect, useCallback } from 'react';
import { getActivityLogs } from '../../services/adminService';

function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getActivityLogs({ search });
      if (res?.success) setLogs(res.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div style={{ padding: '2rem', maxWidth: 'none', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)' }}>System Security & Activity Logs</h1>
        <input
          type="text"
          placeholder="🔍 Search log action..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '0.55rem 0.85rem', borderRadius: '8px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
        />
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '18px', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>Loading activity logs...</div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No activity logs recorded yet.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Timestamp</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Actor</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Action</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Description</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(l.createdAt).toLocaleString()}</td>
                    <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{l.actor?.name || 'System'} ({l.actorRole})</td>
                    <td style={{ padding: '1rem' }}><span className="badge badge-primary">{l.action}</span></td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{l.description}</td>
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

export default AdminLogs;
