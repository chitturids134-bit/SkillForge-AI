import React, { useState, useEffect } from 'react';
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
  MOCK_WEEKLY_DATA,
  MOCK_SKILLS_DATA,
  MOCK_AI_RECOMMENDATIONS,
  DEFAULT_STATS,
} from '../../components/dashboard/dashboardConstants';

import '../../styles/dashboard.css';

const PROFILE_API_URL = 'http://localhost:5002/api/profile/me';

function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Stats State
  const [stats, setStats] = useState(DEFAULT_STATS);
  // Skill Chart Data State
  const [skillChartData, setSkillChartData] = useState(MOCK_SKILLS_DATA);

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
          setStats({
            ...DEFAULT_STATS,
            skillsCount: prof.skills ? prof.skills.length : 0,
          });

          // Build dynamic skill levels based on profile skills if present
          if (prof.skills && prof.skills.length > 0) {
            const dynamicSkills = prof.skills.map((skill, index) => {
              // Map some varied mock proficiencies so chart looks interesting
              const proficiencies = [85, 75, 90, 65, 80];
              return {
                skill: skill.trim(),
                level: proficiencies[index % proficiencies.length],
              };
            });
            // Show up to top 5 skills in the chart
            setSkillChartData(dynamicSkills.slice(0, 5));
          }
        }
      } catch (err) {
        console.log('Profile API fell back to defaults:', err.message);
        // If profile doesn't exist, we fall back to defaults
        setStats({
          ...DEFAULT_STATS,
          skillsCount: 0,
        });
      } finally {
        setProfileLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

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
          <StatCard
            title="Resume Match Score"
            value={`${stats.resumeScore}%`}
            icon="📄"
            trend={{ text: 'Review suggestions', up: false }}
          />
          <StatCard
            title="Interview Readiness"
            value={`${stats.interviewReadiness}%`}
            icon="🎯"
            trend={{ text: '+3% improvement', up: true }}
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
            {/* Quick Actions Panel */}
            <div className="panel-card glass-panel">
              <h3 className="panel-title">Quick Actions</h3>
              <div className="quick-actions-list">
                <QuickAction label="View & Edit Profile" path="/profile" />
                <QuickAction label="Take Skills Assessment" disabled={true} />
                <QuickAction label="Upload Practice Resume" disabled={true} />
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
      </div>
    </div>
  );
}

export default Dashboard;
