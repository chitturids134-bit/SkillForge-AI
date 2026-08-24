import axios from 'axios';

const API_URL = '/api/assessments';

export const getAssessments = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const getActiveAssessment = async () => {
  const response = await axios.get(`${API_URL}/active`);
  return response.data;
};

export const startAssessment = async (id) => {
  const response = await axios.post(`${API_URL}/${id}/start`);
  return response.data;
};

export const getAssessmentAttempt = async (attemptId) => {
  const response = await axios.get(`${API_URL}/attempt/${attemptId}`);
  return response.data;
};

export const submitAnswer = async (attemptId, data) => {
  const response = await axios.post(`${API_URL}/attempt/${attemptId}/answer`, data);
  return response.data;
};

export const completeAssessment = async (attemptId, data = {}) => {
  const response = await axios.post(`${API_URL}/attempt/${attemptId}/complete`, data);
  return response.data;
};

export const getAssessmentHistory = async () => {
  const response = await axios.get(`${API_URL}/history`);
  return response.data;
};

export const getAssessmentReport = async (attemptId) => {
  const response = await axios.get(`${API_URL}/history/${attemptId}`);
  return response.data;
};

export const deleteAssessmentAttempt = async (attemptId) => {
  const response = await axios.delete(`${API_URL}/history/${attemptId}`);
  return response.data;
};
