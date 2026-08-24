import {
  getAdminDashboardMetrics,
  getAdminSettingsService,
  updateAdminSettingsService,
  changeAdminPasswordService,
  getRecruiterVerificationsService,
  approveRecruiterVerificationService,
  rejectRecruiterVerificationService,
  requestVerificationInfoService,
  getAdminUsersService,
  updateUserStatusService,
  getAdminJobsService,
  getAdminAnalyticsService,
  getActivityLogsService,
  getSupportTicketsService,
  replySupportTicketService,
} from '../services/adminService.js';

export const getAdminDashboard = async (req, res) => {
  try {
    const adminId = req.user._id;
    const data = await getAdminDashboardMetrics(adminId);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Get Admin Dashboard Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch admin dashboard',
    });
  }
};

export const getRecruiterVerifications = async (req, res) => {
  try {
    const { search, status, page, limit } = req.query;
    const data = await getRecruiterVerificationsService({ search, status, page, limit });
    return res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error('Get Recruiter Verifications Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch recruiter verifications',
    });
  }
};

export const approveRecruiterVerification = async (req, res) => {
  try {
    const adminId = req.user._id;
    const { id } = req.params;
    const result = await approveRecruiterVerificationService(adminId, id);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Approve Verification Error:', error.message);
    const status = error.message.includes('not found') ? 404 : 400;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to approve verification',
    });
  }
};

export const rejectRecruiterVerification = async (req, res) => {
  try {
    const adminId = req.user._id;
    const { id } = req.params;
    const { reason } = req.body;
    const result = await rejectRecruiterVerificationService(adminId, id, reason);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Reject Verification Error:', error.message);
    const status = error.message.includes('not found') ? 404 : 400;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to reject verification',
    });
  }
};

export const requestVerificationInfo = async (req, res) => {
  try {
    const adminId = req.user._id;
    const { id } = req.params;
    const { reason } = req.body;
    const result = await requestVerificationInfoService(adminId, id, reason);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Request Verification Info Error:', error.message);
    const status = error.message.includes('not found') ? 404 : 400;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to request verification info',
    });
  }
};

export const getAdminUsers = async (req, res) => {
  try {
    const { search, role, page, limit } = req.query;
    const data = await getAdminUsersService({ search, role, page, limit });
    return res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error('Get Admin Users Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch admin users',
    });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const adminId = req.user._id;
    const { id } = req.params;
    const { role, isActive } = req.body;
    const result = await updateUserStatusService(adminId, id, { role, isActive });
    return res.status(200).json(result);
  } catch (error) {
    console.error('Update User Status Error:', error.message);
    const status = error.message.includes('not found') ? 404 : 400;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to update user status',
    });
  }
};

export const getAdminJobs = async (req, res) => {
  try {
    const { search, status, page, limit } = req.query;
    const data = await getAdminJobsService({ search, status, page, limit });
    return res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error('Get Admin Jobs Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch admin jobs',
    });
  }
};

export const getAdminAnalytics = async (req, res) => {
  try {
    const { range } = req.query;
    const data = await getAdminAnalyticsService({ range });
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Get Admin Analytics Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch admin analytics',
    });
  }
};

export const getActivityLogs = async (req, res) => {
  try {
    const { search, action, page, limit } = req.query;
    const data = await getActivityLogsService({ search, action, page, limit });
    return res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error('Get Activity Logs Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch activity logs',
    });
  }
};

export const getSupportTickets = async (req, res) => {
  try {
    const { status, category, page, limit } = req.query;
    const data = await getSupportTicketsService({ status, category, page, limit });
    return res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error('Get Support Tickets Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch support tickets',
    });
  }
};

export const replySupportTicket = async (req, res) => {
  try {
    const adminId = req.user._id;
    const { id } = req.params;
    const { text, status } = req.body;
    const ticket = await replySupportTicketService(adminId, id, text, status);
    return res.status(200).json({
      success: true,
      ticket,
    });
  } catch (error) {
    console.error('Reply Support Ticket Error:', error.message);
    const statusCode = error.message.includes('not found') ? 404 : 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to reply to support ticket',
    });
  }
};

export const getAdminSettings = async (req, res) => {
  try {
    const adminId = req.user._id;
    const data = await getAdminSettingsService(adminId);
    return res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error('Get Admin Settings Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch admin settings',
    });
  }
};

export const updateAdminSettings = async (req, res) => {
  try {
    const adminId = req.user._id;
    const { notifications, platform } = req.body;
    const result = await updateAdminSettingsService(adminId, { notifications, platform });
    return res.status(200).json(result);
  } catch (error) {
    console.error('Update Admin Settings Error:', error.message);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to update admin settings',
    });
  }
};

export const changeAdminPassword = async (req, res) => {
  try {
    const adminId = req.user._id;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required.',
      });
    }
    const result = await changeAdminPasswordService(adminId, { currentPassword, newPassword });
    return res.status(200).json(result);
  } catch (error) {
    console.error('Change Admin Password Error:', error.message);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to change password',
    });
  }
};
