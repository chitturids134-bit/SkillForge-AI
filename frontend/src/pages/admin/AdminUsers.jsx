import React, { useState, useEffect, useCallback } from 'react';
import { getAdminUsers, updateUserStatus } from '../../services/adminService';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [actionUserId, setActionUserId] = useState(null);

  const fetchUsers = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAdminUsers({ page: pageNum, limit: 20, search, role: roleFilter });
      if (res?.success) {
        setUsers(res.users || []);
        if (res.pagination) setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Fetch users error:', err);
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  const handleToggleActive = async (userId, currentActive) => {
    try {
      setActionUserId(userId);
      await updateUserStatus(userId, { isActive: !currentActive });
      fetchUsers(pagination.page);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status');
    } finally {
      setActionUserId(null);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 'none', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
            User Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.2rem 0 0 0' }}>
            View system user accounts, roles, and administrative access statuses.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="🔍 Search name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '0.55rem 0.85rem', borderRadius: '8px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.88rem', minWidth: '240px' }}
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ padding: '0.55rem 0.85rem', borderRadius: '8px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.88rem' }}
          >
            <option value="">All Roles</option>
            <option value="Developer">Developer</option>
            <option value="Recruiter">Recruiter</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '18px', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading user accounts...</div>
        ) : error ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#EF4444' }}>{error}</div>
        ) : users.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No users found matching search criteria.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>User</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Email</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Role (Read-only)</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Registered</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Account Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      👤 {u.name}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge ${u.role === 'Admin' ? 'badge-primary' : u.role === 'Recruiter' ? 'badge-secondary' : 'badge-neutral'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button
                        type="button"
                        disabled={actionUserId === u._id || u.role === 'Admin'}
                        onClick={() => handleToggleActive(u._id, u.isActive !== false)}
                        style={{
                          padding: '0.35rem 0.75rem',
                          borderRadius: '6px',
                          border: 'none',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          cursor: u.role === 'Admin' ? 'not-allowed' : 'pointer',
                          background: u.isActive !== false ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: u.isActive !== false ? '#10B981' : '#EF4444',
                        }}
                      >
                        {u.isActive !== false ? '● Active' : '○ Suspended'}
                      </button>
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

export default AdminUsers;
