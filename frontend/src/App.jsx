import DeveloperInterviewDetail from './pages/interview/DeveloperInterviewDetail';
import DeveloperInterviews from './pages/interview/DeveloperInterviews';
import RecruiterInterviewDetail from './pages/recruiter/RecruiterInterviewDetail';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/dashboard/DashboardLayout';

// Public Pages
import Landing from './pages/Landing';
import Blog from './pages/Blog';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Core Developer Pages
import Profile from './pages/Profile';
import Dashboard from './pages/dashboard/Dashboard';
import ResumeBuilder from './pages/resume/ResumeBuilder';
import ResumeTemplates from './pages/resume/ResumeTemplates';
import ResumeHistory from './pages/resume/ResumeHistory';
import InterviewPrep from './pages/interview/InterviewPrep';
import InterviewHistory from './pages/interview/InterviewHistory';
import InterviewReport from './pages/interview/InterviewReport';
import CareerRoadmap from './pages/roadmap/CareerRoadmap';
import SkillAssessment from './pages/assessments/SkillAssessment';
import AssessmentHistory from './pages/assessments/AssessmentHistory';
import AssessmentReport from './pages/assessments/AssessmentReport';
import MentorChat from './pages/mentor/MentorChat';
import CareerAnalytics from './pages/analytics/CareerAnalytics';
import Messages from './pages/messages/Messages';
import Notifications from './pages/notifications/Notifications';
import Achievements from './pages/achievements/Achievements';
import Settings from './pages/settings/Settings';

// Recruiter Suite
import RecruiterDashboard from './pages/RecruiterDashboard';
import CompanyProfile from './pages/recruiter/CompanyProfile';
import RecruiterVerification from './pages/recruiter/RecruiterVerification';
import RecruiterJobs from './pages/recruiter/RecruiterJobs';
import RecruiterApplications from './pages/recruiter/RecruiterApplications';
import CandidateSearch from './pages/recruiter/CandidateSearch';
import InterviewSchedule from './pages/recruiter/InterviewSchedule';
import RecruiterAnalytics from './pages/recruiter/RecruiterAnalytics';
import RecruiterSettings from './pages/recruiter/RecruiterSettings';

// Admin Suite
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminVerifications from './pages/admin/AdminVerifications';
import AdminJobs from './pages/admin/AdminJobs';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminLogs from './pages/admin/AdminLogs';
import AdminTickets from './pages/admin/AdminTickets';
import AdminSettings from './pages/admin/AdminSettings';

function DashboardDispatcher() {
  const { user } = useAuth();
  if (user?.role === 'Recruiter') {
    const isVerified = user?.verificationStatus === 'verified';
    if (!isVerified) return <Navigate to="/recruiter/verification" replace />;
    return <RecruiterDashboard />;
  } else if (user?.role === 'Admin') {
    return <AdminDashboard />;
  }
  return <Dashboard />;
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <NotificationProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Shared Protected Routes inside DashboardLayout */}
              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<DashboardDispatcher />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/resume" element={<ResumeBuilder />} />
                <Route path="/resume/templates" element={<ResumeTemplates />} />
                <Route path="/resume/history" element={<ResumeHistory />} />
                <Route path="/interview" element={<InterviewPrep />} />
                <Route path="/interview/history" element={<InterviewHistory />} />
                <Route path="/developer/interviews" element={<DeveloperInterviews />} />
                <Route path="/developer/interviews/:id" element={<DeveloperInterviewDetail />} />
                <Route path="/interview/report/:id" element={<InterviewReport />} />
                <Route path="/roadmap" element={<CareerRoadmap />} />
                <Route path="/assessments" element={<SkillAssessment />} />
                <Route path="/assessments/history" element={<AssessmentHistory />} />
                <Route path="/assessments/report/:attemptId" element={<AssessmentReport />} />
                <Route path="/assessment/history" element={<AssessmentHistory />} />
                <Route path="/assessment/report/:attemptId" element={<AssessmentReport />} />
                <Route path="/mentor" element={<MentorChat />} />
                <Route path="/analytics" element={<CareerAnalytics />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/achievements" element={<Achievements />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              {/* Developer Specific Dashboard Route */}
              <Route
                element={
                  <ProtectedRoute allowedRoles={['Developer']}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/developer/dashboard" element={<Dashboard />} />
              </Route>

              {/* Recruiter Verification Center (Accessible by Unverified Recruiters) */}
              <Route
                element={
                  <ProtectedRoute allowedRoles={['Recruiter']}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/recruiter/verification" element={<RecruiterVerification />} />
              </Route>

              {/* Recruiter Workspace Routes (Requires Admin-Verified Status) */}
              <Route
                element={
                  <ProtectedRoute allowedRoles={['Recruiter']} requireVerified={true}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
                <Route path="/recruiter/company" element={<CompanyProfile />} />
                <Route path="/recruiter/jobs" element={<RecruiterJobs />} />
                <Route path="/recruiter/applications" element={<RecruiterApplications />} />
                <Route path="/recruiter/candidates" element={<CandidateSearch />} />
                <Route path="/recruiter/interviews" element={<InterviewSchedule />} />
                <Route path="/recruiter/interviews/:id" element={<RecruiterInterviewDetail />} />
                <Route path="/recruiter/analytics" element={<RecruiterAnalytics />} />
                <Route path="/recruiter/messages" element={<Messages />} />
                <Route path="/recruiter/settings" element={<RecruiterSettings />} />
              </Route>

              {/* Admin Specific Routes */}
              <Route
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/verifications" element={<AdminVerifications />} />
                <Route path="/admin/jobs" element={<AdminJobs />} />
                <Route path="/admin/analytics" element={<AdminAnalytics />} />
                <Route path="/admin/logs" element={<AdminLogs />} />
                <Route path="/admin/tickets" element={<AdminTickets />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
              </Route>

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </NotificationProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
