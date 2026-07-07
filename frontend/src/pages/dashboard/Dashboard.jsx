import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/dashboard/Sidebar';
import Navbar from '../../components/dashboard/Navbar';
import StatCard from '../../components/dashboard/StatCard';
import WeeklyChart from '../../components/dashboard/WeeklyChart';
import SkillChart from '../../components/dashboard/SkillChart';
import RecommendationCard from '../../components/dashboard/RecommendationCard';
import QuickAction from '../../components/dashboard/QuickAction';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  AreaChart,
  Area
} from 'recharts';

import {
  MOCK_WEEKLY_DATA,
  MOCK_SKILLS_DATA,
  MOCK_AI_RECOMMENDATIONS,
  DEFAULT_STATS,
} from '../../components/dashboard/dashboardConstants';

import '../../styles/dashboard.css';

const PROFILE_API_URL = 'http://localhost:5004/api/profile/me';
const RESUME_API_URL = 'http://localhost:5004/api/resume/me';
const INTERVIEW_API_URL = 'http://localhost:5004/api/interview/me';

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Resume states
  const [resume, setResume] = useState(null);
  const [resumeLoading, setResumeLoading] = useState(true);
  const [atsAnalysis, setAtsAnalysis] = useState(null);

  // Stats State
  const [stats, setStats] = useState(DEFAULT_STATS);
  // Skill Chart Data State
  const [skillChartData, setSkillChartData] = useState(MOCK_SKILLS_DATA);

  // Interview states
  const [interviews, setInterviews] = useState([]);
  const [interviewsLoading, setInterviewsLoading] = useState(true);

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setProfileLoading(true);
        const res = await axios.get(PROFILE_API_URL);
        if (res.data && res.data.profile) {
          const prof = res.data.profile;
          setProfile(prof);
          
          // Update stats dynamically based on profile details
          setStats(prev => ({
            ...prev,
            skillsCount: prof.skills ? prof.skills.length : 0,
          }));

          // Build dynamic skill levels based on profile skills if present
          if (prof.skills && prof.skills.length > 0) {
            const dynamicSkills = prof.skills.map((skill, index) => {
              const proficiencies = [85, 75, 90, 65, 80];
              return {
                skill: skill.trim(),
                level: proficiencies[index % proficiencies.length],
              };
            });
            setSkillChartData(dynamicSkills.slice(0, 5));
          }
        }
      } catch (err) {
        console.log('Profile API fell back to defaults:', err.message);
        setStats(prev => ({
          ...prev,
          skillsCount: 0,
        }));
      } finally {
        setProfileLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  // Fetch resume on mount
  useEffect(() => {
    const fetchResume = async () => {
      try {
        setResumeLoading(true);
        const res = await axios.get(RESUME_API_URL);
        if (res.data && res.data.resume) {
          setResume(res.data.resume);
          if (res.data.atsAnalysis) {
            setAtsAnalysis(res.data.atsAnalysis);
          }
        }
      } catch (err) {
        console.log('Resume fetch failed, using fallback:', err.message);
        setResume(null);
        setAtsAnalysis(null);
      } finally {
        setResumeLoading(false);
      }
    };

    if (user) {
      fetchResume();
    }
  }, [user]);

  // Fetch interviews on mount
  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setInterviewsLoading(true);
        const res = await axios.get(INTERVIEW_API_URL);
        if (res.data && res.data.interviews) {
          setInterviews(res.data.interviews);
        }
      } catch (err) {
        console.log('Failed to fetch interviews on dashboard:', err.message);
      } finally {
        setInterviewsLoading(false);
      }
    };

    if (user) {
      fetchInterviews();
    }
  }, [user]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Calculations for dynamic interview statistics
  const completedInterviews = interviews.filter(i => i.completed);
  const totalInterviews = completedInterviews.length;

  const avgScore = totalInterviews > 0
    ? Math.round(completedInterviews.reduce((sum, item) => sum + item.overallScore, 0) / totalInterviews)
    : 0;

  const bestScore = totalInterviews > 0
    ? Math.max(...completedInterviews.map(item => item.overallScore))
    : 0;

  const lastInterviewDate = totalInterviews > 0
    ? new Date(completedInterviews[0].createdAt).toLocaleDateString()
    : 'No sessions';

  let readinessLevel = 'Beginner';
  if (avgScore >= 90) readinessLevel = 'Excellent';
  else if (avgScore >= 75) readinessLevel = 'Very Good';
  else if (avgScore >= 60) readinessLevel = 'Good';
  else if (avgScore >= 40) readinessLevel = 'Needs Improvement';

  const getReadinessColor = (level) => {
    switch (level) {
      case 'Excellent': return '#10b981';
      case 'Very Good': return '#34d399';
      case 'Good': return '#3b82f6';
      case 'Needs Improvement': return '#f59e0b';
      case 'Beginner':
      default: return '#ef4444';
    }
  };

  // Dynamic Recharts Data Setup (with Fallbacks if no sessions exist)
  const weeklyScoresChartData = totalInterviews > 0
    ? [...completedInterviews].reverse().slice(-7).map((item, idx) => ({
        name: `Sess ${idx + 1}`,
        score: item.overallScore,
      }))
    : [
        { name: 'Sess 1', score: 65 },
        { name: 'Sess 2', score: 70 },
        { name: 'Sess 3', score: 78 },
        { name: 'Sess 4', score: 82 },
        { name: 'Sess 5', score: 85 }
      ];

  const categories = ['Technical', 'HR', 'Behavioral'];
  const categoryPerformanceChartData = totalInterviews > 0
    ? categories.map(cat => {
        const catSessions = completedInterviews.filter(i => i.category === cat);
        const catAvg = catSessions.length > 0
          ? Math.round(catSessions.reduce((sum, item) => sum + item.overallScore, 0) / catSessions.length)
          : 0;
        return {
          category: cat,
          avgScore: catAvg,
        };
      })
    : [
        { category: 'Technical', avgScore: 75 },
        { category: 'HR', avgScore: 80 },
        { category: 'Behavioral', avgScore: 70 }
      ];

  let runningSum = 0;
  const trendChartData = totalInterviews > 0
    ? [...completedInterviews].reverse().map((item, idx) => {
        runningSum += item.overallScore;
        return {
          name: `Sess ${idx + 1}`,
          rollingAvg: Math.round(runningSum / (idx + 1)),
        };
      })
    : [
        { name: 'Sess 1', rollingAvg: 65 },
        { name: 'Sess 2', rollingAvg: 67 },
        { name: 'Sess 3', rollingAvg: 71 },
        { name: 'Sess 4', rollingAvg: 74 },
        { name: 'Sess 5', rollingAvg: 76 }
      ];

  // Welcome user name fallback
  const displayName = profile?.fullName || user?.name || 'Developer';

  return (
    <div className="dashboard-root">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Workspace */}
      <div className="main-workspace">
        {/* Top Navbar */}
        <Navbar user={user} toggleSidebar={toggleSidebar} />

        {/* Welcome Section */}
        <div className="welcome-container">
          <h2 className="welcome-title">Welcome back, {displayName}!</h2>
          <p className="welcome-subtitle">Here is an overview of your SkillForge metrics and progress.</p>
        </div>

        {/* Metric Cards Grid */}
        <div className="stats-grid">
          <StatCard
            title="Skills Cataloged"
            value={profileLoading ? '...' : stats.skillsCount}
            icon="🛠️"
            trend={{ text: 'Syncs with profile', up: true }}
          />
          <StatCard
            title="Projects Built"
            value={stats.projectsCount}
            icon="💻"
            trend={{ text: '+1 this month', up: true }}
          />
          {resumeLoading ? (
            <StatCard
              title="ATS Resume Score"
              value="..."
              icon="📄"
              trend={{ text: 'Loading data...', up: true }}
            />
          ) : !resume ? (
            <div className="stat-card glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '140px' }}>
              <div className="stat-header">
                <span>ATS Resume Score</span>
                <span className="stat-icon">📄</span>
              </div>
              <div style={{ marginTop: '0.25rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem', textAlign: 'left' }}>
                  No resume found
                </span>
                <button 
                  onClick={() => navigate('/resume')}
                  className="action-btn"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', width: '100%', marginTop: '0.25rem' }}
                >
                  Create Resume
                </button>
              </div>
            </div>
          ) : (
            <StatCard
              title="ATS Resume Score"
              value={atsAnalysis ? `${atsAnalysis.score}%` : '0%'}
              icon="📄"
              trend={{ 
                text: atsAnalysis ? `${atsAnalysis.grade} (${atsAnalysis.score}/100)` : 'Review suggestions', 
                up: atsAnalysis ? atsAnalysis.score >= 75 : false 
              }}
            />
          )}
          <StatCard
            title="Interview Readiness"
            value={interviewsLoading ? '...' : readinessLevel}
            icon="🎯"
            trend={{ 
              text: interviewsLoading ? 'Loading...' : `Avg: ${avgScore}% (${totalInterviews} Practice sessions)`, 
              up: avgScore >= 60 
            }}
          />
        </div>

        {/* Layout Grid Panels */}
        <div className="dashboard-layout-grid">
          {/* Charts Column */}
          <div className="charts-column">
            <WeeklyChart data={MOCK_WEEKLY_DATA} />
            <SkillChart data={skillChartData} />
          </div>

          {/* Actions & Recommendations Column */}
          <div className="actions-column">
            <div className="panel-card glass-panel">
              <h3 className="panel-title">Quick Actions</h3>
              <div className="quick-actions-list">
                <QuickAction label="View & Edit Profile" path="/profile" />
                <QuickAction label="AI Resume Studio" path="/resume" />
                <QuickAction label="AI Interview Prep" path="/interview" />
                <QuickAction label="Interview History" path="/interview/history" />
                <QuickAction label="Take Skills Assessment" disabled={true} />
              </div>
            </div>

            {/* AI Recommendations Panel */}
            <div className="panel-card glass-panel">
              <h3 className="panel-title">AI Mentorship Tasks</h3>
              <div className="recommendations-list">
                {MOCK_AI_RECOMMENDATIONS.map((rec) => (
                  <RecommendationCard key={rec.id} recommendation={rec} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Interview Feedback & Analytics Section */}
        <div style={{ padding: '0 2rem 2.5rem 2rem' }}>
          <div className="panel-card glass-panel">
            <h3 className="panel-title" style={{ fontSize: '1.25rem', marginBottom: '1.5rem', textAlign: 'left' }}>
              Practice Interview Performance Analytics
            </h3>
            
            {/* Dynamic statistics metrics */}
            <div className="interview-analytics-grid">
              <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px', textAlign: 'left' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Total Practices</span>
                <span style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)' }}>{totalInterviews}</span>
              </div>
              <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px', textAlign: 'left' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Average Score</span>
                <span style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)' }}>{avgScore}%</span>
              </div>
              <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px', textAlign: 'left' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Highest Rating</span>
                <span style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--accent-success)' }}>{bestScore}%</span>
              </div>
              <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px', textAlign: 'left' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Last Active Practice</span>
                <span style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '0.5rem' }}>{lastInterviewDate}</span>
              </div>
            </div>

            {/* Dynamic responsive charts */}
            <div className="interview-charts-grid">
              <div className="glass-panel" style={{ padding: '1.25rem', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--text-primary)', textAlign: 'left', fontWeight: '600' }}>Weekly Scores Progress</h4>
                <div style={{ width: '100%', height: '220px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyScoresChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={9} />
                      <YAxis stroke="var(--text-secondary)" domain={[0, 100]} fontSize={9} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', fontSize: '0.8rem' }} />
                      <Line type="monotone" dataKey="score" stroke="var(--accent-primary)" strokeWidth={2} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '1.25rem', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--text-primary)', textAlign: 'left', fontWeight: '600' }}>Category Breakdown</h4>
                <div style={{ width: '100%', height: '220px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryPerformanceChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="category" stroke="var(--text-secondary)" fontSize={9} />
                      <YAxis stroke="var(--text-secondary)" domain={[0, 100]} fontSize={9} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', fontSize: '0.8rem' }} />
                      <Bar dataKey="avgScore" fill="var(--accent-secondary)" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '1.25rem', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--text-primary)', textAlign: 'left', fontWeight: '600' }}>Rolling Average Trend</h4>
                <div style={{ width: '100%', height: '220px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={9} />
                      <YAxis stroke="var(--text-secondary)" domain={[0, 100]} fontSize={9} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', fontSize: '0.8rem' }} />
                      <Area type="monotone" dataKey="rollingAvg" stroke="#10b981" fill="rgba(16, 185, 129, 0.08)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
