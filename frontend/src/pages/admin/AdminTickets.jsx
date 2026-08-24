import React, { useState, useEffect, useCallback } from 'react';
import { getSupportTickets, replySupportTicket } from '../../services/adminService';

function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getSupportTickets();
      if (res?.success) setTickets(res.tickets || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;
    try {
      await replySupportTicket(selectedTicket._id, replyText, 'resolved');
      setReplyText('');
      setSelectedTicket(null);
      fetchTickets();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send reply');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 'none', width: '100%', boxSizing: 'border-box' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
        Support Ticket Center
      </h1>

      <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '18px', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>Loading support tickets...</div>
        ) : tickets.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No support tickets filed yet.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Subject</th>
                  <th style={{ padding: '0.75rem 1rem' }}>User</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>🎫 {t.subject}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{t.user?.name}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{t.category}</td>
                    <td style={{ padding: '1rem' }}><span className="badge badge-secondary">{t.status}</span></td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedTicket(t)}
                        style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', background: '#8B5CF6', color: '#FFF', border: 'none', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}
                      >
                        Reply
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedTicket && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-panel" style={{ padding: '2rem', borderRadius: '18px', background: 'var(--bg-card)', maxWidth: '500px', width: '100%' }}>
            <h3 style={{ marginTop: 0, color: 'var(--text-primary)' }}>Reply to Ticket: {selectedTicket.subject}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{selectedTicket.description}</p>
            <form onSubmit={handleReply}>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type resolution reply..."
                rows={4}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', marginBottom: '1rem' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" onClick={() => setSelectedTicket(null)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: '#8B5CF6', color: '#FFF', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Send Reply</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminTickets;
