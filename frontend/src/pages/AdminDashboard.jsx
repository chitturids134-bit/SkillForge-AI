import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  getAdminDashboard,
  approveRecruiterVerification,
  rejectRecruiterVerification,
  requestVerificationInfo,
} from '../services/adminService';
import KPICard from '../components/dashboard/KPICard';

function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Core State
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review Modal State
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [actionReason, setActionReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (text, isError = false) => {
    setToastMsg({ text, isError });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAdminDashboard();
      if (res?.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Fetch admin dashboard error:', err);
      setError(err.response?.data?.message || 'Unable to load dashboard metrics. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Verification Handlers
  const handleApprove = async (id) => {
    try {
      setSubmittingAction(true);
      const res = await approveRecruiterVerification(id);
      if (res?.success) {
        showToast(res.message || 'Verification approved');
        setSelectedVerification(null);
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Approve error:', err);
      showToast(err.response?.data?.message || 'Failed to approve verification', true);
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleReject = async (id) => {
    try {
      setSubmittingAction(true);
      const res = await rejectRecruiterVerification(id, actionReason);
      if (res?.success) {
        showToast(res.message || 'Verification rejected');
        setSelectedVerification(null);
        setActionReason('');
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Reject error:', err);
      showToast(err.response?.data?.message || 'Failed to reject verification', true);
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleRequestInfo = async (id) => {
    try {
      setSubmittingAction(true);
      const res = await requestVerificationInfo(id, actionReason);
      if (res?.success) {
        showToast(res.message || 'Information requested');
        setSelectedVerification(null);
        setActionReason('');
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Request info error:', err);
      showToast(err.response?.data?.message || 'Failed to request info', true);
    } finally {
      setSubmittingAction(false);
    }
  };

  const metrics = data?.metrics || {};
  const overview = data?.platformOverview || {};
  const userGrowth = data?.userGrowth || [];
  const verifications = data?.pendingVerifications || [];
  const recentActivity = data?.recentActivity || [];
  const attention = data?.attention || {};

  const totalAttentionCount = (attention.pendingVerifications || 0) + (attention.openSupportTickets || 0) + (attention.jobsRequiringReview || 0);

  return (
    <div className="admin-dashboard-page" style={{ width: '100%', maxWidth: 'none', minHeight: 'calc(100vh - 70px)', padding: '1.75rem 2rem', boxSizing: 'border-box' }}>
      {/* Toast Feedback */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              zIndex: 9999,
              background: toastMsg.isError ? '#EF4444' : '#10B981',
              color: '#FFFFFF',
              padding: '0.85rem 1.5rem',
              borderRadius: '10px',
              fontWeight: 700,
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            }}
          >
            {toastMsg.isError ? '⚠️ ' : '✅ '}
            {toastMsg.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER BAR */}
      <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', width: '100%' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8B5CF6', fontWeight: 800, fontSize: '0.88rem', marginBottom: '0.2rem' }}>
            <span>🛡️</span> SYSTEM ADMINISTRATOR CONTROL CENTER
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            Admin Overview
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', margin: '0.2rem 0 0 0' }}>
            Welcome back, <strong>{user?.name || 'SkillForge Admin'}</strong>. Real-time platform overview and management insights.
          </p>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={fetchDashboardData}
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: '12px',
            background: 'var(--hover-bg)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease',
          }}
        >
          {loading ? '⏳ Refreshing...' : '🔄 Refresh Metrics'}
        </button>
      </div>

      {/* LOADING & ERROR STATES */}
      {loading && !data ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem', width: '100%' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-panel" style={{ height: '120px', borderRadius: '16px', background: 'var(--bg-card)', opacity: 0.6 }} />
          ))}
        </div>
      ) : error ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '18px', marginBottom: '1.75rem', width: '100%' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h3 style={{ color: '#EF4444', fontSize: '1.25rem', fontWeight: 800 }}>Unable to load dashboard metrics</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{error}</p>
          <button
            type="button"
            onClick={fetchDashboardData}
            style={{ marginTop: '1rem', padding: '0.65rem 1.5rem', borderRadius: '10px', background: '#8B5CF6', color: '#FFF', border: 'none', fontWeight: 700, cursor: 'pointer' }}
          >
            Retry Loading
          </button>
        </div>
      ) : (
        <>
          {/* TOP KPI METRICS GRID - FULL FLUID WIDTH */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.25rem',
              marginBottom: '1.75rem',
              width: '100%',
            }}
          >
            <KPICard
              title="Total Developers"
              value={(metrics.totalDevelopers || 0).toLocaleString()}
              icon="👥"
              trend="Engineers & Talent"
              trendUp={true}
            />
            <KPICard
              title="Corporate Recruiters"
              value={(metrics.totalRecruiters || 0).toLocaleString()}
              icon="🏢"
              trend="Employers & Hiring"
              trendUp={true}
            />
            <KPICard
              title="Pending Verifications"
              value={(metrics.pendingVerifications || 0).toString()}
              icon="⏳"
              trend={metrics.pendingVerifications > 0 ? 'Requires Attention' : 'All Clear'}
              trendUp={metrics.pendingVerifications === 0}
            />
            <KPICard
              title="Total Active Users"
              value={(metrics.activeUsers || 0).toLocaleString()}
              icon="⚡"
              trend={`Out of ${(metrics.totalUsers || 0).toLocaleString()} accounts`}
              trendUp={true}
            />
          </div>

          {/* MAIN CONTENT GRID (FLUID RESPONSIVE COLUMNS) */}
          <div
            className="admin-dashboard-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.7fr) minmax(340px, 0.9fr)',
              gap: '1.5rem',
              width: '100%',
              alignItems: 'start',
            }}
          >
            {/* LEFT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
              
              {/* PLATFORM OVERVIEW & USER GROWTH ROW */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', width: '100%' }}>
                
                {/* Platform Overview */}
                <div className="glass-panel" style={{ padding: '1.35rem 1.5rem', borderRadius: '18px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', width: '100%', boxSizing: 'border-box' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem', margin: 0 }}>
                    Platform Overview
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', fontWeight: 600 }}>💻 Developers:</span>
                      <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.05rem' }}>{(overview.developers || 0).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', fontWeight: 600 }}>🏢 Recruiters:</span>
                      <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.05rem' }}>{(overview.recruiters || 0).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', fontWeight: 600 }}>💼 Active Jobs:</span>
                      <span style={{ fontWeight: 800, color: '#8B5CF6', fontSize: '1.05rem' }}>{(overview.totalJobs || 0).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', fontWeight: 600 }}>📋 Applications:</span>
                      <span style={{ fontWeight: 800, color: '#10B981', fontSize: '1.05rem' }}>{(overview.totalApplications || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* User Growth Insight */}
                <div className="glass-panel" style={{ padding: '1.35rem 1.5rem', borderRadius: '18px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', width: '100%', boxSizing: 'border-box' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem', margin: 0 }}>
                    User Growth (Recent)
                  </h3>
                  {userGrowth.length === 0 ? (
                    <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      Not enough registration data yet
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.85rem', maxHeight: '160px', overflowY: 'auto' }}>
                      {userGrowth.slice(-5).map((g) => (
                        <div key={g.date} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', padding: '0.4rem 0.6rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                          <span style={{ color: 'var(--text-muted)' }}>{g.date}</span>
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                            +{g.developers} Devs, +{g.recruiters} Rec
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* PENDING VERIFICATION QUEUE */}
              <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '18px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', width: '100%', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                      Pending Recruiter Verification Queue
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                      Review corporate details and issue verification badges.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/admin/verifications')}
                    style={{ background: 'none', border: 'none', color: '#8B5CF6', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                  >
                    View All ({(metrics.pendingVerifications || 0)}) →
                  </button>
                </div>

                {verifications.length === 0 ? (
                  <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                      No pending recruiter verifications
                    </h4>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                      All corporate registration requests have been reviewed.
                    </p>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto', width: '100%' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          <th style={{ padding: '0.75rem 0.85rem' }}>Organization</th>
                          <th style={{ padding: '0.75rem 0.85rem' }}>Recruiter</th>
                          <th style={{ padding: '0.75rem 0.85rem' }}>Email</th>
                          <th style={{ padding: '0.75rem 0.85rem' }}>Domain</th>
                          <th style={{ padding: '0.75rem 0.85rem' }}>Submitted</th>
                          <th style={{ padding: '0.75rem 0.85rem', textAlign: 'right' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {verifications.map((item) => (
                          <tr key={item._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                              🏢 {item.organization}
                            </td>
                            <td style={{ padding: '0.85rem', color: 'var(--text-secondary)' }}>
                              {item.contact}
                            </td>
                            <td style={{ padding: '0.85rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                              {item.email}
                            </td>
                            <td style={{ padding: '0.85rem', color: '#8B5CF6', fontWeight: 600 }}>
                              {item.domain}
                            </td>
                            <td style={{ padding: '0.85rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                              {new Date(item.submittedAt).toLocaleDateString()}
                            </td>
                            <td style={{ padding: '0.85rem', textAlign: 'right' }}>
                              <button
                                type="button"
                                onClick={() => setSelectedVerification(item)}
                                style={{
                                  padding: '0.4rem 0.85rem',
                                  borderRadius: '8px',
                                  background: 'linear-gradient(135deg, #8B5CF6, #6C63FF)',
                                  color: '#FFFFFF',
                                  border: 'none',
                                  fontWeight: 700,
                                  fontSize: '0.78rem',
                                  cursor: 'pointer',
                                }}
                              >
                                Review Request
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

            {/* RIGHT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
              
              {/* REQUIRES YOUR ATTENTION CARD */}
              <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '18px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', width: '100%', boxSizing: 'border-box' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem', margin: 0 }}>
                  Requires Your Attention
                </h3>

                {totalAttentionCount === 0 ? (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '12px', marginTop: '1rem' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>✨</div>
                    <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>Everything is up to date</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No pending moderation or open support issues.</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                    <div
                      onClick={() => navigate('/admin/verifications')}
                      style={{
                        padding: '0.85rem 1rem',
                        borderRadius: '12px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        justify: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                      }}
                    >
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.88rem' }}>🏢 Recruiter Verifications</span>
                      <span style={{ background: (attention.pendingVerifications || 0) > 0 ? 'rgba(239, 68, 68, 0.2)' : 'var(--hover-bg)', color: (attention.pendingVerifications || 0) > 0 ? '#EF4444' : 'var(--text-muted)', padding: '0.25rem 0.65rem', borderRadius: '8px', fontWeight: 800, fontSize: '0.82rem' }}>
                        {attention.pendingVerifications || 0} pending
                      </span>
                    </div>

                    <div
                      onClick={() => navigate('/admin/tickets')}
                      style={{
                        padding: '0.85rem 1rem',
                        borderRadius: '12px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        justify: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                      }}
                    >
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.88rem' }}>🎫 Support Tickets</span>
                      <span style={{ background: (attention.openSupportTickets || 0) > 0 ? 'rgba(234, 179, 8, 0.2)' : 'var(--hover-bg)', color: (attention.openSupportTickets || 0) > 0 ? '#EAB308' : 'var(--text-muted)', padding: '0.25rem 0.65rem', borderRadius: '8px', fontWeight: 800, fontSize: '0.82rem' }}>
                        {attention.openSupportTickets || 0} open
                      </span>
                    </div>

                    <div
                      onClick={() => navigate('/admin/jobs')}
                      style={{
                        padding: '0.85rem 1rem',
                        borderRadius: '12px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        justify: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                      }}
                    >
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.88rem' }}>💼 Jobs Requiring Review</span>
                      <span style={{ background: 'var(--hover-bg)', color: 'var(--text-secondary)', padding: '0.25rem 0.65rem', borderRadius: '8px', fontWeight: 800, fontSize: '0.82rem' }}>
                        {attention.jobsRequiringReview || 0}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* RECENT PLATFORM ACTIVITY */}
              <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '18px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', width: '100%', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Recent Platform Activity
                  </h3>
                  <button
                    type="button"
                    onClick={() => navigate('/admin/logs')}
                    style={{ background: 'none', border: 'none', color: '#8B5CF6', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                  >
                    View Logs →
                  </button>
                </div>

                {recentActivity.length === 0 ? (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No recent platform activity
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {recentActivity.map((act) => (
                      <div key={act.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0.75rem 0.85rem', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                            👤 {act.actor} ({act.actorRole})
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          {act.description}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        </>
      )}

      {/* REVIEW VERIFICATION MODAL */}
      <AnimatePresence>
        {selectedVerification && (
          <div
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              zIndex: 99999,
              background: 'rgba(0,0,0,0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel"
              style={{
                padding: '2rem',
                borderRadius: '18px',
                background: 'var(--bg-card)',
                maxWidth: '520px',
                width: '100%',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Review Recruiter Verification
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedVerification(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '1.2rem', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '12px', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
                <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.05rem', marginBottom: '0.25rem' }}>
                  🏢 {selectedVerification.organization}
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>Contact: <strong>{selectedVerification.contact}</strong></div>
                <div style={{ color: 'var(--text-secondary)' }}>Email: {selectedVerification.email}</div>
                <div style={{ color: '#8B5CF6', fontWeight: 600 }}>Website: {selectedVerification.domain}</div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Admin Notes / Rejection Reason (Optional):
                </label>
                <textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Enter details if rejecting or requesting information..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    background: 'var(--input-bg)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.65rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  disabled={submittingAction}
                  onClick={() => handleRequestInfo(selectedVerification._id)}
                  style={{
                    padding: '0.65rem 1rem',
                    borderRadius: '10px',
                    background: 'rgba(234, 179, 8, 0.2)',
                    color: '#EAB308',
                    border: '1px solid #EAB308',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                  }}
                >
                  Request Info
                </button>

                <button
                  type="button"
                  disabled={submittingAction}
                  onClick={() => handleReject(selectedVerification._id)}
                  style={{
                    padding: '0.65rem 1rem',
                    borderRadius: '10px',
                    background: 'rgba(239, 68, 68, 0.2)',
                    color: '#EF4444',
                    border: '1px solid #EF4444',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                  }}
                >
                  Reject
                </button>

                <button
                  type="button"
                  disabled={submittingAction}
                  onClick={() => handleApprove(selectedVerification._id)}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '10px',
                    background: '#10B981',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                  }}
                >
                  {submittingAction ? 'Processing...' : 'Approve & Verify'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminDashboard;
