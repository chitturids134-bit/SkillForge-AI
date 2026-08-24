import axios from 'axios';

const API_URL = '/api/mentor';

export const getPromptTemplates = async () => {
  const response = await axios.get(`${API_URL}/templates`);
  return response.data;
};

export const getChatSessions = async () => {
  const response = await axios.get(`${API_URL}/sessions`);
  return response.data;
};

export const sendMessage = async (sessionId, message) => {
  const response = await axios.post(`${API_URL}/message`, { sessionId, message });
  return response.data;
};

export const clearSession = async (sessionId) => {
  const response = await axios.post(`${API_URL}/clear`, { sessionId });
  return response.data;
};
