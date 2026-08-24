import React, { useState, useEffect, useCallback } from 'react';
import {
  getRecruiterVerifications,
  approveRecruiterVerification,
  rejectRecruiterVerification,
  requestVerificationInfo,
} from '../../services/adminService';

function AdminVerifications() {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [actionId, setActionId] = useState(null);

  const fetchVerifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getRecruiterVerifications({ status: statusFilter, search });
      if (res?.success) {
        setVerifications(res.verifications || []);
      }
    } catch (err) {
      console.error('Fetch verifications error:', err);
      setError(err.response?.data?.message || 'Failed to fetch verifications');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchVerifications();
  }, [fetchVerifications]);

  const handleApprove = async (id) => {
    try {
      setActionId(id);
      await approveRecruiterVerification(id);
      fetchVerifications();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve');
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Enter rejection reason:');
    if (reason === null) return;
    try {
      setActionId(id);
      await rejectRecruiterVerification(id, reason);
      fetchVerifications();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 'none', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
            Recruiter Verifications
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.2rem 0 0 0' }}>
            Review corporate organization details and manage verification statuses.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            type="text"
            placeholder="🔍 Search organization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '0.55rem 0.85rem', borderRadius: '8px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.88rem' }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '0.55rem 0.85rem', borderRadius: '8px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.88rem' }}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '18px', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading verification requests...</div>
        ) : error ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#EF4444' }}>{error}</div>
        ) : verifications.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No verification records found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Organization</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Contact</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Domain</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {verifications.map((v) => (
                  <tr key={v._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>🏢 {v.organization}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{v.contact}</td>
                    <td style={{ padding: '1rem', color: '#8B5CF6' }}>{v.domain}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge ${v.status === 'verified' ? 'badge-primary' : v.status === 'rejected' ? 'badge-error' : 'badge-secondary'}`}>
                        {v.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      {v.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            disabled={actionId === v._id}
                            onClick={() => handleApprove(v._id)}
                            style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', background: '#10B981', color: '#FFF', border: 'none', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={actionId === v._id}
                            onClick={() => handleReject(v._id)}
                            style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', background: '#EF4444', color: '#FFF', border: 'none', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}
                          >
                            Reject
                          </button>
                        </div>
                      )}
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

export default AdminVerifications;
