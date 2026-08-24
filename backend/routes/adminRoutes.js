import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  getAdminDashboard,
  getAdminSettings,
  updateAdminSettings,
  changeAdminPassword,
  getRecruiterVerifications,
  approveRecruiterVerification,
  rejectRecruiterVerification,
  requestVerificationInfo,
  getAdminUsers,
  updateUserStatus,
  getAdminJobs,
  getAdminAnalytics,
  getActivityLogs,
  getSupportTickets,
  replySupportTicket,
} from '../controllers/adminController.js';

const router = express.Router();

// Enforce authentication & strict Admin role authorization
router.use(protect);
router.use(authorize('Admin'));

// Admin Dashboard & Metrics
router.get('/dashboard', getAdminDashboard);

// Recruiter Verification Queue & Actions
router.get('/recruiter-verifications', getRecruiterVerifications);
router.post('/recruiter-verifications/:id/approve', approveRecruiterVerification);
router.post('/recruiter-verifications/:id/reject', rejectRecruiterVerification);
router.post('/recruiter-verifications/:id/request-info', requestVerificationInfo);

// User Management
router.get('/users', getAdminUsers);
router.patch('/users/:id/status', updateUserStatus);

// Job Management
router.get('/jobs', getAdminJobs);

// Platform Analytics
router.get('/analytics', getAdminAnalytics);

// Activity Logs
router.get('/activity-logs', getActivityLogs);

// Support Tickets
router.get('/support', getSupportTickets);
router.post('/support/:id/reply', replySupportTicket);

export default router;

// Admin Settings Routes
router.get('/settings', getAdminSettings);
router.put('/settings', updateAdminSettings);
router.post('/settings/password', changeAdminPassword);
