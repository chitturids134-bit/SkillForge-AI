import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { getRecruiterDashboard } from '../services/recruiterService';
import StatusBadge from '../components/common/StatusBadge';
import DataTable from '../components/common/DataTable';
import '../styles/resume.css';

/* ─────────── Helpers ─────────── */

function formatRelativeTime(dateStr) {
  if (!dateStr) return 'Recently';
  try {
    const now = new Date();
    const past = new Date(dateStr);
    const diffSec = Math.floor((now - past) / 1000);
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) { const m = Math.floor(diffSec / 60); return `${m} min${m > 1 ? 's' : ''} ago`; }
    if (diffSec < 86400) { const h = Math.floor(diffSec / 3600); return `${h} hour${h > 1 ? 's' : ''} ago`; }
    const d = Math.floor(diffSec / 86400);
    if (d < 30) return `${d} day${d > 1 ? 's' : ''} ago`;
    return new Date(dateStr).toLocaleDateString();
  } catch { return 'Recently'; }
}

function getInitials(name) {
  if (!name) return 'C';
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

/* ─────────── Skeleton Shimmer Loader ─────────── */

function SkeletonBox({ height = '120px', className = '' }) {
  return (
    <div
      className={`glass-panel ${className}`}
      style={{
        padding: '1.25rem',
        borderRadius: '16px',
        height,
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)'
      }}
    >
      <div style={{ width: '45%', height: '14px', borderRadius: '6px', background: 'var(--hover-bg)', marginBottom: '0.85rem' }} />
      <div style={{ width: '30%', height: '28px', borderRadius: '8px', background: 'var(--hover-bg)', marginBottom: '0.65rem' }} />
      <div style={{ width: '55%', height: '10px', borderRadius: '6px', background: 'var(--hover-bg)' }} />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      <SkeletonBox height="100px" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <SkeletonBox height="110px" />
        <SkeletonBox height="110px" />
        <SkeletonBox height="110px" />
        <SkeletonBox height="110px" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        <SkeletonBox height="300px" />
        <SkeletonBox height="300px" />
      </div>
      <SkeletonBox height="250px" />
    </div>
  );
}

/* ─────────── Hiring Funnel Component ─────────── */

const FUNNEL_STAGES = [
  { key: 'applied', label: 'Applied', color: '#3B82F6' },
  { key: 'screened', label: 'Screened', color: '#06B6D4' },
  { key: 'shortlisted', label: 'Shortlisted', color: '#8B5CF6' },
  { key: 'interview', label: 'Interview', color: '#F59E0B' },
  { key: 'offer', label: 'Offer', color: '#10B981' },
  { key: 'hired', label: 'Hired', color: '#22C55E' },
  { key: 'rejected', label: 'Rejected', color: '#EF4444' },
];

function HiringFunnel({ funnel }) {
  const totalCount = Object.values(funnel || {}).reduce((a, b) => a + b, 0);
  const maxCount = Math.max(1, ...Object.values(funnel || {}));

  return (
    <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            📊 Hiring Pipeline
          </h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Real-time candidate progression across all stages
          </span>
        </div>
        <span
          style={{
            fontSize: '0.82rem',
            fontWeight: 800,
            color: '#8B5CF6',
            background: 'rgba(139, 92, 246, 0.15)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            padding: '0.35rem 0.85rem',
            borderRadius: '20px'
          }}
        >
          Total Candidates: {totalCount}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {FUNNEL_STAGES.map(({ key, label, color }) => {
          const count = funnel?.[key] || 0;
          const pct = totalCount > 0 ? Math.round((count / maxCount) * 100) : 0;

          return (
            <div key={key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{label}</span>
                <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>
                  {count} candidate{count !== 1 ? 's' : ''}
                </span>
              </div>

              <div style={{ width: '100%', height: '10px', background: 'var(--hover-bg)', borderRadius: '6px', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  style={{ height: '100%', background: color, borderRadius: '6px' }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────── Main Recruiter Dashboard ─────────── */

function RecruiterDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recruiterInfo, setRecruiterInfo] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [funnel, setFunnel] = useState(null);
  const [recentApplicants, setRecentApplicants] = useState([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getRecruiterDashboard();
      if (response && response.success && response.data) {
        const d = response.data;
        setRecruiterInfo(d.recruiter || null);
        setMetrics(d.metrics || null);
        setFunnel(d.funnel || null);
        setRecentApplicants(d.recentApplicants || []);
        setUpcomingInterviews(d.upcomingInterviews || []);
      } else {
        throw new Error(response?.message || 'Failed to fetch recruiter dashboard data');
      }
    } catch (err) {
      console.error('Recruiter Dashboard fetch error:', err);
      setError(err.message || 'Unable to load recruiter dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const displayName = recruiterInfo?.name || user?.name || 'Recruiter';
  const companyName = recruiterInfo?.companyName || 'SkillForge AI Workspace';
  const isVerified = recruiterInfo?.verificationStatus === 'verified';

  // Applicant columns for DataTable
  const applicantColumns = [
    {
      header: 'Candidate',
      accessor: 'candidateName',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #8B5CF6, #00D4FF)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '0.85rem'
            }}
          >
            {getInitials(row.candidateName)}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
              {row.candidateName}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {row.candidateEmail}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Applied Position',
      accessor: 'jobTitle',
      render: (row) => (
        <span style={{ fontWeight: 600, color: '#8B5CF6', fontSize: '0.88rem' }}>
          {row.jobTitle}
        </span>
      ),
    },
    {
      header: 'Match Score',
      render: (row) => (
        row.matchScore !== null && row.matchScore !== undefined ? (
          <span
            style={{
              fontSize: '0.82rem',
              fontWeight: 800,
              padding: '0.25rem 0.65rem',
              borderRadius: '20px',
              background: 'rgba(34, 197, 94, 0.18)',
              color: '#22C55E',
              border: '1px solid rgba(34, 197, 94, 0.3)'
            }}
          >
            🔥 {row.matchScore}% Match
          </span>
        ) : (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>N/A</span>
        )
      ),
    },
    {
      header: 'Stage',
      render: (row) => <StatusBadge status={row.stage || 'applied'} />,
    },
    {
      header: 'Applied Date',
      render: (row) => (
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          {formatRelativeTime(row.appliedAt)}
        </span>
      ),
    },
    {
      header: 'Action',
      render: (row) => (
        <button
          type="button"
          onClick={() => navigate('/recruiter/applications')}
          style={{
            padding: '0.35rem 0.8rem',
            borderRadius: '8px',
            background: 'rgba(139, 92, 246, 0.15)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            color: '#8B5CF6',
            fontWeight: 700,
            fontSize: '0.78rem',
            cursor: 'pointer'
          }}
        >
          View Application →
        </button>
      ),
    },
  ];

  const quickActionsList = [
    {
      icon: '🏢',
      title: 'Manage Company Profile',
      desc: 'Update your recruiter workspace',
      path: '/recruiter/company'
    },
    {
      icon: '📋',
      title: 'Review Applications',
      desc: 'Screen candidates in pipeline',
      path: '/recruiter/applications'
    },
    {
      icon: '📅',
      title: 'Schedule Technical Screening',
      desc: 'Organize interview sessions',
      path: '/recruiter/interviews'
    },
    {
      icon: '➕',
      title: 'Post New Job',
      desc: 'Create a new hiring requisition',
      path: '/recruiter/jobs'
    },
    {
      icon: '🔍',
      title: 'Search Talent',
      desc: 'Find candidates matching requirements',
      path: '/recruiter/candidates'
    }
  ];

  return (
    <div style={{ padding: '2rem', width: '100%', minHeight: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* ERROR STATE */}
      {error ? (
        <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: '16px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚠️</div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#EF4444', margin: '0 0 0.5rem 0' }}>
            Unable to Load Recruiter Command Center
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            {error}
          </p>
          <button
            type="button"
            className="recruiter-dashboard-cta-btn"
            onClick={fetchDashboard}
            style={{ background: '#EF4444' }}
          >
            ↻ Retry Loading
          </button>
        </div>
      ) : loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          {/* 1. HERO / WELCOME HEADER */}
          <div
            className="glass-panel"
            style={{
              padding: '2rem',
              borderRadius: '20px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.5rem'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Welcome back, {displayName} 👋
                </h1>

                {isVerified && (
                  <span
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      padding: '0.3rem 0.8rem',
                      borderRadius: '20px',
                      background: 'rgba(34, 197, 94, 0.18)',
                      color: '#22C55E',
                      border: '1px solid rgba(34, 197, 94, 0.4)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    ✓ Verified Organization
                  </span>
                )}
              </div>

              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>
                Here's what's happening with your hiring pipeline today at <strong style={{ color: 'var(--text-primary)' }}>{companyName}</strong>.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="recruiter-dashboard-cta-btn"
                onClick={() => navigate('/recruiter/jobs')}
              >
                <span>➕</span> Post New Job
              </button>

              <button
                type="button"
                onClick={() => navigate('/recruiter/candidates')}
                style={{
                  height: '42px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0 1.35rem',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(139, 92, 246, 0.4)',
                  color: 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                <span>🔍</span> Search Talent
              </button>
            </div>
          </div>

          {/* 2. KPI ANALYTICS GRID (4 COLUMNS DESKTOP) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            
            {/* KPI 1 */}
            <div
              className="glass-panel"
              onClick={() => navigate('/recruiter/jobs')}
              style={{
                padding: '1.35rem',
                borderRadius: '16px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Active Requisitions
                </span>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                  💼
                </div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                {metrics?.activeRequisitions ?? 0}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#22C55E', marginTop: '0.6rem', fontWeight: 600 }}>
                Currently open positions
              </div>
            </div>

            {/* KPI 2 */}
            <div
              className="glass-panel"
              style={{
                padding: '1.35rem',
                borderRadius: '16px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Candidates Screened
                </span>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                  👥
                </div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#8B5CF6', lineHeight: 1 }}>
                {metrics?.totalCandidatesScreened ?? 0}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.6rem' }}>
                Across active requisitions
              </div>
            </div>

            {/* KPI 3 */}
            <div
              className="glass-panel"
              onClick={() => navigate('/recruiter/interviews')}
              style={{
                padding: '1.35rem',
                borderRadius: '16px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Scheduled Interviews
                </span>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                  📅
                </div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#F59E0B', lineHeight: 1 }}>
                {metrics?.scheduledInterviews ?? 0}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#F59E0B', marginTop: '0.6rem', fontWeight: 600 }}>
                Upcoming technical screens
              </div>
            </div>

            {/* KPI 4 */}
            <div
              className="glass-panel"
              style={{
                padding: '1.35rem',
                borderRadius: '16px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Avg Time to Hire
                </span>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                  ⏱️
                </div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10B981', lineHeight: 1 }}>
                {metrics?.averageTimeToHire?.label || 'N/A'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.6rem' }}>
                {metrics?.averageTimeToHire?.label === 'N/A' ? 'No hires completed yet' : 'Based on completed hires'}
              </div>
            </div>

          </div>

          {/* 3. PIPELINE FUNNEL + QUICK ACTIONS (2 COLUMNS DESKTOP) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
            
            {/* Left Column: Hiring Pipeline Funnel */}
            <HiringFunnel funnel={funnel} />

            {/* Right Column: Quick Recruiter Actions */}
            <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.25rem 0', color: 'var(--text-primary)' }}>
                  ⚡ Quick Actions
                </h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Frequently used recruiter workspace shortcuts
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {quickActionsList.map((act, idx) => (
                  <div
                    key={idx}
                    onClick={() => navigate(act.path)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'space-between',
                      padding: '0.85rem 1.1rem',
                      borderRadius: '12px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div style={{ fontSize: '1.3rem' }}>{act.icon}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                          {act.title}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {act.desc}
                        </div>
                      </div>
                    </div>
                    <span style={{ fontSize: '1rem', color: '#8B5CF6', fontWeight: 800 }}>→</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* 4. RECENT HIGH-MATCH APPLICANTS (FULL WIDTH) */}
          <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.25rem 0', color: 'var(--text-primary)' }}>
                  🎯 Recent High-Match Applicants
                </h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Candidates who recently applied to your open positions
                </span>
              </div>

              {recentApplicants.length > 0 && (
                <button
                  type="button"
                  onClick={() => navigate('/recruiter/applications')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#8B5CF6',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    cursor: 'pointer'
                  }}
                >
                  View All Applications →
                </button>
              )}
            </div>

            {recentApplicants.length > 0 ? (
              <DataTable
                columns={applicantColumns}
                data={recentApplicants}
                emptyMessage="No applicants found"
              />
            ) : (
              <div style={{ padding: '3.5rem 1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.85rem' }}>📭</div>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.4rem 0' }}>
                  No Applicants Yet
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '460px', margin: '0 auto 1.5rem auto' }}>
                  Applicants will appear here once candidates apply to your active job requisitions.
                </p>
                <button
                  type="button"
                  className="recruiter-dashboard-cta-btn"
                  onClick={() => navigate('/recruiter/jobs')}
                >
                  <span>➕</span> Post Your First Job
                </button>
              </div>
            )}
          </div>

          {/* 5. UPCOMING INTERVIEWS (FULL WIDTH) */}
          <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.25rem 0', color: 'var(--text-primary)' }}>
                  📅 Upcoming Interviews
                </h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Scheduled technical screens and candidate evaluations
                </span>
              </div>

              {upcomingInterviews.length > 0 && (
                <button
                  type="button"
                  onClick={() => navigate('/recruiter/interviews')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#8B5CF6',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    cursor: 'pointer'
                  }}
                >
                  Manage Schedule →
                </button>
              )}
            </div>

            {upcomingInterviews.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {upcomingInterviews.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      justify: 'space-between',
                      alignItems: 'center',
                      padding: '1rem 1.25rem',
                      borderRadius: '12px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      flexWrap: 'wrap',
                      gap: '0.75rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ fontSize: '1.5rem' }}>🎤</div>
                      <div>
                        <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                          {item.candidateName}
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          Applying for <strong style={{ color: '#8B5CF6' }}>{item.jobTitle}</strong> • {item.type}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <StatusBadge status={item.status} />
                      <button
                        type="button"
                        onClick={() => navigate('/recruiter/interviews')}
                        style={{
                          padding: '0.35rem 0.85rem',
                          borderRadius: '8px',
                          background: 'rgba(139, 92, 246, 0.15)',
                          border: '1px solid rgba(139, 92, 246, 0.3)',
                          color: '#8B5CF6',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          cursor: 'pointer'
                        }}
                      >
                        View Interview →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📅</div>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.4rem 0' }}>
                  No Upcoming Interviews
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '440px', margin: '0 auto 1.5rem auto' }}>
                  Scheduled interviews will appear here when candidate screenings are arranged.
                </p>
                <button
                  type="button"
                  className="recruiter-dashboard-cta-btn"
                  onClick={() => navigate('/recruiter/interviews')}
                >
                  <span>📅</span> Schedule Interview
                </button>
              </div>
            )}
          </div>

        </>
      )}

    </div>
  );
}

export default RecruiterDashboard;
