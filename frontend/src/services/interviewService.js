import axios from 'axios';

const API_URL = '/api/interview';

export const startInterview = async (data) => {
  const response = await axios.post(`${API_URL}/start`, data);
  return response.data;
};

export const getActiveInterview = async () => {
  const response = await axios.get(`${API_URL}/active`);
  return response.data;
};

export const getInterview = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const submitAnswer = async (id, data) => {
  const response = await axios.post(`${API_URL}/${id}/answer`, data);
  return response.data;
};

export const completeInterview = async (id) => {
  const response = await axios.post(`${API_URL}/${id}/complete`);
  return response.data;
};

export const getUserInterviews = async () => {
  const response = await axios.get(`${API_URL}/me`);
  return response.data;
};

export const deleteInterview = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};
