import axios from 'axios';

const API_URL = '/api/recruiter';

/**
 * Fetch recruiter dashboard data (metrics, funnel, recent applicants).
 */
export const getRecruiterDashboard = async () => {
  const response = await axios.get(`${API_URL}/dashboard`);
  return response.data;
};

/**
 * Fetch recruiter verification status & company details.
 */
export const getRecruiterVerification = async () => {
  const response = await axios.get(`${API_URL}/verification`);
  return response.data;
};

/**
 * Submit or resubmit recruiter verification request for Admin review.
 */
export const submitRecruiterVerification = async (payload) => {
  const response = await axios.post(`${API_URL}/verification/submit`, payload);
  return response.data;
};

/**
 * Fetch all jobs owned by authenticated recruiter.
 */
export const getRecruiterJobs = async (params = {}) => {
  const response = await axios.get(`${API_URL}/jobs`, { params });
  return response.data;
};

/**
 * Create a new job requisition.
 */
export const createRecruiterJob = async (payload) => {
  const response = await axios.post(`${API_URL}/jobs`, payload);
  return response.data;
};

/**
 * Get job details by ID.
 */
export const getRecruiterJobById = async (id) => {
  const response = await axios.get(`${API_URL}/jobs/${id}`);
  return response.data;
};

/**
 * Update an existing job requisition.
 */
export const updateRecruiterJob = async (id, payload) => {
  const response = await axios.put(`${API_URL}/jobs/${id}`, payload);
  return response.data;
};

/**
 * Change job status (active / closed / paused).
 */
export const changeRecruiterJobStatus = async (id, status) => {
  const response = await axios.patch(`${API_URL}/jobs/${id}/status`, { status });
  return response.data;
};

/**
 * Delete a job requisition.
 */
export const deleteRecruiterJob = async (id) => {
  const response = await axios.delete(`${API_URL}/jobs/${id}`);
  return response.data;
};

/**
 * Fetch candidate applications for recruiter jobs with filters.
 */
export const getRecruiterApplications = async (params = {}) => {
  const response = await axios.get(`${API_URL}/applications`, { params });
  return response.data;
};

/**
 * Get single application detail by ID.
 */
export const getRecruiterApplicationById = async (id) => {
  const response = await axios.get(`${API_URL}/applications/${id}`);
  return response.data;
};

/**
 * Update application pipeline stage (applied, screened, shortlisted, interview, offer, hired, rejected).
 */
export const updateApplicationStage = async (id, payload) => {
  const response = await axios.patch(`${API_URL}/applications/${id}/stage`, payload);
  return response.data;
};

/**
 * Save internal recruiter notes for an application.
 */
export const updateApplicationNotes = async (id, notes) => {
  const response = await axios.patch(`${API_URL}/applications/${id}/notes`, { notes });
  return response.data;
};


/**
 * Fetch recruitment metrics & analytics from backend.
 */
export const getRecruiterAnalytics = async () => {
  const response = await axios.get(`${API_URL}/analytics`);
  return response.data;
};
