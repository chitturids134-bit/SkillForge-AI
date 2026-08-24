import React from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';

function CareerAnalytics() {
  const overallMetrics = [
    { title: 'Career Goal Alignment', value: '88%', icon: '🎯', trend: { text: '+8% this month', up: true } },
    { title: 'ATS Resume Rating', value: '92/100', icon: '📄', color: 'success', trend: { text: 'Top 10% candidate', up: true } },
    { title: 'Interview Readiness', value: '85%', icon: '🎤', color: 'secondary', trend: { text: 'Strong performance', up: true } },
    { title: 'Skills Mastery Rate', value: '14 Skills', icon: '🧠', color: 'purple', trend: { text: '+3 newly verified', up: true } }
  ];

  const skillProficiencyData = [
    { skill: 'React 19 & Next.js', level: 92 },
    { skill: 'Node.js & Express', level: 88 },
    { skill: 'System Design', level: 78 },
    { skill: 'AI & Vector DBs', level: 85 },
    { skill: 'TypeScript & Testing', level: 80 }
  ];

  const monthlyProgressData = [
    { month: 'Mar', ats: 65, interview: 60, skills: 70 },
    { month: 'Apr', ats: 72, interview: 68, skills: 75 },
    { month: 'May', ats: 80, interview: 75, skills: 82 },
    { month: 'Jun', ats: 88, interview: 80, skills: 88 },
    { month: 'Jul', ats: 92, interview: 85, skills: 94 }
  ];

  const radarCompetencyData = [
    { subject: 'Frontend Architecture', A: 92 },
    { subject: 'Backend & APIs', A: 88 },
    { subject: 'System Design', A: 78 },
    { subject: 'AI Integration', A: 85 },
    { subject: 'Code Quality', A: 90 },
    { subject: 'Problem Solving', A: 82 }
  ];

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          📈 Career Growth & Skill Analytics
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Comprehensive diagnostic metrics tracking your ATS resume scores, mock interview readiness, and technical skill growth.
        </p>
      </div>

      {/* Top Metric Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {overallMetrics.map((m, idx) => (
          <StatCard key={idx} title={m.title} value={m.value} icon={m.icon} color={m.color} trend={m.trend} />
        ))}
      </div>

      {/* Main Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        
        {/* Monthly Career Velocity Area Chart */}
        <div className="panel-card glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              🚀 Career Velocity Trend (Last 5 Months)
            </h3>
            <StatusBadge status="Active" />
          </div>
          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyProgressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="var(--text-secondary)" fontSize={11} />
                <YAxis stroke="var(--text-secondary)" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', fontSize: '0.8rem' }} />
                <Area type="monotone" dataKey="ats" stroke="#00D4FF" fill="rgba(0, 212, 255, 0.2)" strokeWidth={2} name="ATS Score" />
                <Area type="monotone" dataKey="interview" stroke="#6C63FF" fill="rgba(108, 99, 255, 0.2)" strokeWidth={2} name="Interview Readiness" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Competency Radar Chart */}
        <div className="panel-card glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              🎯 Engineering Competency Radar
            </h3>
            <span className="badge badge-primary">6 Domains</span>
          </div>
          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarCompetencyData}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="subject" stroke="var(--text-secondary)" fontSize={10} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="transparent" />
                <Radar name="Competency" dataKey="A" stroke="#7C3AED" fill="#6C63FF" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Technical Skill Breakdown Bar Chart */}
      <div className="panel-card glass-panel">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          🧠 Technical Mastery Level Breakdown (%)
        </h3>
        <div style={{ height: '220px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={skillProficiencyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="skill" stroke="var(--text-secondary)" fontSize={11} />
              <YAxis stroke="var(--text-secondary)" fontSize={11} domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', fontSize: '0.8rem' }} />
              <Bar dataKey="level" fill="var(--accent-secondary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}

export default CareerAnalytics;
