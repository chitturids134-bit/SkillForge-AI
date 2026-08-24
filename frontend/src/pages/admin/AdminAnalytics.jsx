import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { getAdminAnalytics } from '../../services/adminService';
import KPICard from '../../components/dashboard/KPICard';

function AdminAnalytics() {
  const navigate = useNavigate();

  // State
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [range, setRange] = useState('30d');
  const [lastUpdated, setLastUpdated] = useState('');

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAdminAnalytics({ range });
      if (res?.success) {
        setData(res.data);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error('Fetch analytics error:', err);
      setError(err.response?.data?.message || 'Unable to load analytics data.');
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const overview = data?.overview || {};
  const userGrowth = data?.userGrowth || [];
  const userDistribution = data?.userDistribution || [];
  const recruitmentFunnel = data?.recruitmentFunnel || [];
  const jobAnalytics = data?.jobAnalytics || {};
  const resumeAnalytics = data?.resumeAnalytics || {};
  const assessmentAnalytics = data?.assessmentAnalytics || {};
  const topSkills = data?.topSkills || [];
  const attention = data?.attention || {};
  const recentActivity = data?.recentActivity || [];

  return (
    <div className="admin-analytics-page" style={{ width: '100%', maxWidth: 'none', minHeight: 'calc(100vh - 70px)', padding: '1.75rem 2rem', boxSizing: 'border-box' }}>
      
      {/* HEADER SECTION */}
      <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', width: '100%' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8B5CF6', fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.2rem' }}>
            <span>📈</span> CAREER GROWTH & SKILL ANALYTICS
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            Platform Analytics
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', margin: '0.2rem 0 0 0' }}>
            Real-time statistical overview of platform utilization, engagement, hiring activity, and career growth.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Date Range Selector */}
          <div style={{ display: 'flex', background: 'var(--bg-card)', padding: '3px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            {['7d', '30d', '90d'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '8px',
                  background: range === r ? '#8B5CF6' : 'transparent',
                  color: range === r ? '#FFFFFF' : 'var(--text-secondary)',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={fetchAnalytics}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '10px',
              background: 'var(--hover-bg)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            {loading ? '⏳ Refreshing...' : '🔄 Refresh Analytics'}
          </button>

          {lastUpdated && (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Updated: {lastUpdated}
            </span>
          )}
        </div>
      </div>

      {/* LOADING & ERROR STATES */}
      {loading && !data ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="glass-panel" style={{ height: '110px', borderRadius: '16px', background: 'var(--bg-card)', opacity: 0.6 }} />
          ))}
        </div>
      ) : error ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '18px', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h3 style={{ color: '#EF4444', fontSize: '1.25rem', fontWeight: 800 }}>Unable to load analytics</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{error}</p>
          <button
            type="button"
            onClick={fetchAnalytics}
            style={{ marginTop: '1rem', padding: '0.65rem 1.5rem', borderRadius: '10px', background: '#8B5CF6', color: '#FFF', border: 'none', fontWeight: 700, cursor: 'pointer' }}
          >
            Retry Loading
          </button>
        </div>
      ) : (
        <>
          {/* TOP 8 KPI CARDS GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem', width: '100%' }}>
            <KPICard title="Total Accounts" value={(overview.totalUsers || 0).toLocaleString()} icon="👥" trend="Platform Members" />
            <KPICard title="Developers" value={(overview.totalDevelopers || 0).toLocaleString()} icon="💻" trend="Talent Pool" />
            <KPICard title="Recruiters" value={(overview.totalRecruiters || 0).toLocaleString()} icon="🏢" trend="Employers" />
            <KPICard title="Active Job Postings" value={(overview.activeJobs || 0).toLocaleString()} icon="💼" trend="Open Roles" />
            <KPICard title="Applications" value={(overview.totalApplications || 0).toLocaleString()} icon="📋" trend="Submissions" />
            <KPICard title="Resumes Generated" value={(overview.totalResumes || 0).toLocaleString()} icon="📄" trend="Saved Profiles" />
            <KPICard title="Assessments Done" value={(overview.totalAssessments || 0).toLocaleString()} icon="🧠" trend="Tests Completed" />
            <KPICard title="Active Admins" value={(overview.totalAdmins || 1).toString()} icon="🛡️" trend="System Controls" />
          </div>

          {/* SECTION 1: USER GROWTH & USER ROLE DISTRIBUTION */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(300px, 1fr)', gap: '1.5rem', marginBottom: '1.75rem', width: '100%', alignItems: 'start' }}>
            
            {/* User Growth Chart */}
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '18px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', width: '100%', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>User Registration Growth</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>Daily account registrations over the selected range ({range.toUpperCase()})</p>
                </div>
              </div>

              {userGrowth.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Not enough registration data yet</div>
              ) : (
                <div style={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={userGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="devColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="recColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.5} />
                      <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={12} />
                      <YAxis stroke="var(--text-secondary)" fontSize={12} />
                      <Tooltip contentStyle={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '10px', color: 'var(--text-primary)' }} />
                      <Area type="monotone" dataKey="developers" name="Developers" stroke="#8B5CF6" fillOpacity={1} fill="url(#devColor)" />
                      <Area type="monotone" dataKey="recruiters" name="Recruiters" stroke="#10B981" fillOpacity={1} fill="url(#recColor)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* User Role Distribution */}
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '18px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', width: '100%', boxSizing: 'border-box' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>Platform Users Breakdown</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 1.25rem 0' }}>User role proportion</p>

              <div style={{ width: '100%', height: 220, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={userDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4}>
                      {userDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill || '#8B5CF6'} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '10px', color: 'var(--text-primary)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                {userDistribution.map((item) => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.fill }} />
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{item.name}:</span>
                    <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* SECTION 2: RECRUITMENT FUNNEL & RESUME PERFORMANCE */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(300px, 1fr)', gap: '1.5rem', marginBottom: '1.75rem', width: '100%', alignItems: 'start' }}>
            
            {/* Recruitment Pipeline Funnel */}
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '18px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', width: '100%', boxSizing: 'border-box' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Recruitment Pipeline Overview</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.2rem 0 1.25rem 0' }}>Candidate applications volume across hiring stages</p>

              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={recruitmentFunnel} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.5} />
                    <XAxis dataKey="stage" stroke="var(--text-secondary)" fontSize={12} />
                    <YAxis stroke="var(--text-secondary)" fontSize={12} />
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '10px', color: 'var(--text-primary)' }} />
                    <Bar dataKey="count" name="Candidates" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Resume ATS & Assessment Performance Insights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
              
              {/* ATS Performance */}
              <div className="glass-panel" style={{ padding: '1.35rem 1.5rem', borderRadius: '18px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', width: '100%', boxSizing: 'border-box' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.85rem 0' }}>📄 Resume & ATS Performance</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Avg ATS Score</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10B981' }}>{resumeAnalytics.averageATS !== undefined && resumeAnalytics.averageATS !== null ? `${resumeAnalytics.averageATS}%` : 'N/A'}</div>
                  </div>
                  <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Best ATS Score</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#8B5CF6' }}>{resumeAnalytics.bestATS !== undefined && resumeAnalytics.bestATS !== null ? `${resumeAnalytics.bestATS}%` : 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Assessment Stats */}
              <div className="glass-panel" style={{ padding: '1.35rem 1.5rem', borderRadius: '18px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', width: '100%', boxSizing: 'border-box' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.85rem 0' }}>🧠 Assessment Performance</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Avg Test Score</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#F59E0B' }}>{assessmentAnalytics.averageScore !== undefined && assessmentAnalytics.averageScore !== null ? `${assessmentAnalytics.averageScore}%` : 'N/A'}</div>
                  </div>
                  <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Highest Score</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10B981' }}>{assessmentAnalytics.highestScore !== undefined && assessmentAnalytics.highestScore !== null ? `${assessmentAnalytics.highestScore}%` : 'N/A'}</div>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* SECTION 3: TOP SKILLS & ATTENTION PANEL */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(300px, 1fr)', gap: '1.5rem', width: '100%', alignItems: 'start' }}>
            
            {/* Top Skills on Platform */}
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '18px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', width: '100%', boxSizing: 'border-box' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Top Developer Skills on Platform</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.2rem 0 1.25rem 0' }}>Most requested and declared developer technologies</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {topSkills.map((skill) => (
                  <div key={skill.name} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      <span>{skill.name}</span>
                      <span style={{ color: '#8B5CF6' }}>{skill.count} developers</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: 'var(--bg-secondary)', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(100, skill.count * 10)}%`, height: '100%', background: 'linear-gradient(90deg, #8B5CF6, #6C63FF)', borderRadius: '4px' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin Attention & Recent Activity */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
              
              {/* Requires Attention */}
              <div className="glass-panel" style={{ padding: '1.35rem 1.5rem', borderRadius: '18px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', width: '100%', boxSizing: 'border-box' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.85rem 0' }}>Requires Action</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <div
                    onClick={() => navigate('/admin/verifications')}
                    style={{ padding: '0.75rem 0.85rem', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                  >
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>🏢 Verifications Pending</span>
                    <span style={{ background: (attention.pendingVerifications || 0) > 0 ? 'rgba(239, 68, 68, 0.2)' : 'var(--hover-bg)', color: (attention.pendingVerifications || 0) > 0 ? '#EF4444' : 'var(--text-muted)', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 800, fontSize: '0.8rem' }}>
                      {attention.pendingVerifications || 0}
                    </span>
                  </div>

                  <div
                    onClick={() => navigate('/admin/tickets')}
                    style={{ padding: '0.75rem 0.85rem', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                  >
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>🎫 Support Tickets Open</span>
                    <span style={{ background: (attention.openSupportTickets || 0) > 0 ? 'rgba(234, 179, 8, 0.2)' : 'var(--hover-bg)', color: (attention.openSupportTickets || 0) > 0 ? '#EAB308' : 'var(--text-muted)', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 800, fontSize: '0.8rem' }}>
                      {attention.openSupportTickets || 0}
                    </span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </>
      )}

    </div>
  );
}

export default AdminAnalytics;
