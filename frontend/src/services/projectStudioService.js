import axios from 'axios';

const API_URL = '/api/projects';

export const getProjectIdeas = async (category, difficulty) => {
  const response = await axios.get(`${API_URL}/ideas`, { params: { category, difficulty } });
  return response.data;
};

export const getUserProjects = async () => {
  const response = await axios.get(`${API_URL}/me`);
  return response.data;
};

export const saveProject = async (projectData) => {
  const response = await axios.post(API_URL, projectData);
  return response.data;
};

export const updateProjectProgress = async (id, progressPercentage, status, githubUrl) => {
  const response = await axios.put(`${API_URL}/${id}/progress`, { progressPercentage, status, githubUrl });
  return response.data;
};

export const addProjectNote = async (id, text) => {
  const response = await axios.post(`${API_URL}/${id}/notes`, { text });
  return response.data;
};

export const toggleProjectBookmark = async (id) => {
  const response = await axios.post(`${API_URL}/${id}/bookmark`);
  return response.data;
};
