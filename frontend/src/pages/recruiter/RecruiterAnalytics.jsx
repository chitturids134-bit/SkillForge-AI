import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecruiterAnalytics } from '../../services/recruiterService';
import StatusBadge from '../../components/common/StatusBadge';
import GradientButton from '../../components/common/GradientButton';

function RecruiterAnalytics() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getRecruiterAnalytics();
      if (res && res.success && res.data) {
        setData(res.data);
      } else {
        throw new Error(res?.message || 'Failed to load recruitment analytics');
      }
    } catch (err) {
      console.error('Fetch Recruiter Analytics Error:', err);
      setError(err.message || 'Unable to connect to analytics service.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return diffDays + ' days ago';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', width: '100%' }}>
        <div className="glass-panel" style={{ padding: '3rem', borderRadius: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem', animation: 'spin 1s infinite linear' }}>⚙️</div>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Calculating recruitment analytics from database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', width: '100%' }}>
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: '0 0 0.4rem 0', color: '#EF4444', fontWeight: 800 }}>⚠️ Unable to Load Recruitment Analytics</h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{error}</p>
          </div>
          <GradientButton onClick={fetchAnalytics} style={{ background: '#EF4444' }}>🔄 Retry</GradientButton>
        </div>
      </div>
    );
  }

  const { metrics, pipeline, funnel, jobPerformance, interviews, recentActivity, insights } = data || {};
  const totalApps = metrics?.totalApplications || 0;

  return (
    <div style={{ padding: '2rem', width: '100%' }}>
      
      {/* 1. Page Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.4rem 0' }}>
            📊 Recruitment Metrics & Analytics
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>
            Performance indicators for candidate sourcing, pipeline throughput, and hiring conversion rates.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAnalytics}
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
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <span>🔄</span> Refresh Analytics
        </button>
      </div>

      {/* 2. Top Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '14px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            Active Requisitions
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {metrics?.activeRequisitions || 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#22C55E', marginTop: '0.4rem', fontWeight: 600 }}>
            Open Job Listings
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '14px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            Total Applications
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#3B82F6' }}>
            {metrics?.totalApplications || 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            Across all postings
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '14px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            Candidates Screened
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#8B5CF6' }}>
            {metrics?.totalCandidatesScreened || 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#8B5CF6', marginTop: '0.4rem', fontWeight: 600 }}>
            Passed initial review
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '14px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            Interviews Scheduled
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#F59E0B' }}>
            {metrics?.interviewsScheduled || 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#F59E0B', marginTop: '0.4rem', fontWeight: 600 }}>
            Active interview pipeline
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '14px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            Offer Acceptance Rate
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10B981' }}>
            {metrics?.offerAcceptanceRate || 'N/A'}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            Offer-to-hire ratio
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '14px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            Candidates Hired
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#22C55E' }}>
            {metrics?.candidatesHired || 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#22C55E', marginTop: '0.4rem', fontWeight: 600 }}>
            Successful placements
          </div>
        </div>
      </div>

      {/* 3. Pipeline Distribution & Hiring Funnel Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Pipeline Bar Distribution */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 1.25rem 0' }}>
            📊 Candidate Pipeline Stage Distribution
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { label: 'Applied (New)', count: pipeline?.applied || 0, color: '#3B82F6' },
              { label: 'Screened', count: pipeline?.screened || 0, color: '#6366F1' },
              { label: 'Shortlisted', count: pipeline?.shortlisted || 0, color: '#8B5CF6' },
              { label: 'Interview Stage', count: pipeline?.interview || 0, color: '#F59E0B' },
              { label: 'Offer Extended', count: pipeline?.offer || 0, color: '#10B981' },
              { label: 'Hired Candidates', count: pipeline?.hired || 0, color: '#22C55E' },
              { label: 'Rejected', count: pipeline?.rejected || 0, color: '#EF4444' },
            ].map((item, idx) => {
              const pct = totalApps > 0 ? Math.round((item.count / totalApps) * 100) : 0;
              return (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem', fontWeight: 700 }}>
                    <span style={{ color: 'var(--text-primary)' }}>{item.label}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{item.count} ({pct}%)</span>
                  </div>
                  <div style={{ height: '8px', borderRadius: '4px', background: 'var(--bg-secondary)', overflow: 'hidden' }}>
                    <div style={{ width: pct + '%', height: '100%', background: item.color, borderRadius: '4px', transition: 'width 0.5s ease-in-out' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hiring Funnel Efficiency */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 1.25rem 0' }}>
            🎯 Hiring Funnel Conversion Efficiency
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { stage: 'Applications → Screened', pct: funnel?.appliedToScreened || 0, icon: '📥' },
              { stage: 'Screened → Shortlisted', pct: funnel?.screenedToShortlisted || 0, icon: '⭐' },
              { stage: 'Shortlisted → Interview', pct: funnel?.shortlistedToInterview || 0, icon: '📅' },
              { stage: 'Interview → Offer', pct: funnel?.interviewToOffer || 0, icon: '💼' },
              { stage: 'Offer → Hired', pct: funnel?.offerToHired || 0, icon: '🎉' },
            ].map((step, idx) => (
              <div key={idx} style={{ padding: '0.85rem 1rem', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span>{step.icon}</span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>{step.stage}</span>
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, padding: '0.25rem 0.65rem', borderRadius: '20px', background: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                  {step.pct}% Conversion
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 4. Job Requisition Performance Table & Interview Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Job Performance Table */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              💼 Requisition Performance Breakdown
            </h3>
            <button onClick={() => navigate('/recruiter/jobs')} style={{ background: 'none', border: 'none', color: '#8B5CF6', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
              Manage Jobs →
            </button>
          </div>

          {jobPerformance && jobPerformance.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.6rem' }}>Job Title</th>
                    <th style={{ padding: '0.6rem' }}>Status</th>
                    <th style={{ padding: '0.6rem' }}>Applicants</th>
                    <th style={{ padding: '0.6rem' }}>Shortlisted</th>
                    <th style={{ padding: '0.6rem' }}>Hired</th>
                  </tr>
                </thead>
                <tbody>
                  {jobPerformance.map((job) => (
                    <tr key={job.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.75rem 0.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {job.title}
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>📍 {job.location} ({job.workMode})</div>
                      </td>
                      <td style={{ padding: '0.75rem 0.6rem' }}>
                        <StatusBadge status={job.status === 'active' ? 'Active' : 'Closed'} />
                      </td>
                      <td style={{ padding: '0.75rem 0.6rem', fontWeight: 800, color: '#3B82F6' }}>
                        {job.applications}
                      </td>
                      <td style={{ padding: '0.75rem 0.6rem', fontWeight: 800, color: '#8B5CF6' }}>
                        {job.shortlisted}
                      </td>
                      <td style={{ padding: '0.75rem 0.6rem', fontWeight: 800, color: '#22C55E' }}>
                        {job.hired}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💼</div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>No recruitment activity yet</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>Post a job requisition to start tracking candidate performance.</p>
              <button
                type="button"
                className="recruiter-dashboard-cta-btn"
                onClick={() => navigate('/recruiter/jobs')}
              >
                <span>➕</span> Post New Job
              </button>
            </div>
          )}
        </div>

        {/* Interview Analytics Card */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 1.25rem 0' }}>
            📅 Interview Analytics
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Total Technical Interviews</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>{interviews?.total || 0}</span>
            </div>

            <div style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Upcoming Active Interviews</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#F59E0B' }}>{interviews?.upcoming || 0}</span>
            </div>

            <div style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Completed / Concluded</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#22C55E' }}>{interviews?.completed || 0}</span>
            </div>

            <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.12)', border: '1px solid rgba(139, 92, 246, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.88rem', color: '#8B5CF6', fontWeight: 700 }}>Interview-to-Offer Conversion</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#8B5CF6' }}>{interviews?.conversionRate || 'N/A'}</span>
            </div>
          </div>
        </div>

      </div>

      {/* 5. Dynamic Insights & Recent Activity Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        
        {/* Dynamic Data-Driven Insights */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 1.25rem 0' }}>
            💡 Recruitment Intelligence Insights
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {insights && insights.length > 0 ? (
              insights.map((text, idx) => (
                <div key={idx} style={{ padding: '0.85rem 1rem', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>✨</span>
                  <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>{text}</span>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No recruitment insights calculated yet.</p>
            )}
          </div>
        </div>

        {/* Recent Hiring Activity Feed */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 1.25rem 0' }}>
            ⚡ Recent Recruitment Activity
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentActivity && recentActivity.length > 0 ? (
              recentActivity.map((item) => (
                <div key={item.id} style={{ padding: '0.75rem 1rem', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {item.candidateName}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Applied for {item.jobTitle}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <StatusBadge status={item.stage} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {formatDate(item.timestamp)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No recent recruitment activity.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

export default RecruiterAnalytics;
