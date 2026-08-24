import axios from 'axios';

const API_URL = '/api/admin';

/**
 * Fetch Admin Dashboard Metrics & Real MongoDB Overview
 */
export const getAdminDashboard = async () => {
  const response = await axios.get(`${API_URL}/dashboard`);
  return response.data;
};

/**
 * Fetch Recruiter Verification Queue
 */
export const getRecruiterVerifications = async (params = {}) => {
  const response = await axios.get(`${API_URL}/recruiter-verifications`, { params });
  return response.data;
};

/**
 * Approve Recruiter Verification
 */
export const approveRecruiterVerification = async (id) => {
  const response = await axios.post(`${API_URL}/recruiter-verifications/${id}/approve`);
  return response.data;
};

/**
 * Reject Recruiter Verification
 */
export const rejectRecruiterVerification = async (id, reason = '') => {
  const response = await axios.post(`${API_URL}/recruiter-verifications/${id}/reject`, { reason });
  return response.data;
};

/**
 * Request Information for Verification
 */
export const requestVerificationInfo = async (id, reason = '') => {
  const response = await axios.post(`${API_URL}/recruiter-verifications/${id}/request-info`, { reason });
  return response.data;
};

/**
 * Get Admin Users List (Paginated, Searchable)
 */
export const getAdminUsers = async (params = {}) => {
  const response = await axios.get(`${API_URL}/users`, { params });
  return response.data;
};

/**
 * Update User Role or Active Status
 */
export const updateUserStatus = async (id, data) => {
  const response = await axios.patch(`${API_URL}/users/${id}/status`, data);
  return response.data;
};

/**
 * Get Admin Jobs List (Paginated, Searchable)
 */
export const getAdminJobs = async (params = {}) => {
  const response = await axios.get(`${API_URL}/jobs`, { params });
  return response.data;
};

/**
 * Get Platform Analytics
 */
export const getAdminAnalytics = async (params = {}) => {
  const response = await axios.get(`${API_URL}/analytics`, { params });
  return response.data;
};

/**
 * Get Activity Logs
 */
export const getActivityLogs = async (params = {}) => {
  const response = await axios.get(`${API_URL}/activity-logs`, { params });
  return response.data;
};

/**
 * Get Support Tickets
 */
export const getSupportTickets = async (params = {}) => {
  const response = await axios.get(`${API_URL}/support`, { params });
  return response.data;
};

/**
 * Reply to Support Ticket
 */
export const replySupportTicket = async (id, text, status = null) => {
  const response = await axios.post(`${API_URL}/support/${id}/reply`, { text, status });
  return response.data;
};

/**
 * Get Admin Settings
 */
export const getAdminSettings = async () => {
  const response = await axios.get(`${API_URL}/settings`);
  return response.data;
};

/**
 * Update Admin Settings (Notifications & Platform Preferences)
 */
export const updateAdminSettings = async (data) => {
  const response = await axios.put(`${API_URL}/settings`, data);
  return response.data;
};

/**
 * Change Admin Password
 */
export const changeAdminPassword = async (data) => {
  const response = await axios.post(`${API_URL}/settings/password`, data);
  return response.data;
};
