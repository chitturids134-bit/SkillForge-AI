import axios from 'axios';

const API_URL = '/api/resume';

export const getResume = async () => {
  const response = await axios.get(`${API_URL}/me`);
  return response.data;
};

export const saveResume = async (resumeData) => {
  const response = await axios.put(`${API_URL}/me`, resumeData);
  return response.data;
};

export const deleteResume = async () => {
  const response = await axios.delete(`${API_URL}/me`);
  return response.data;
};

export const calculateAtsScore = async (resumeData) => {
  const response = await axios.post(`${API_URL}/ats-score`, resumeData);
  return response.data;
};

export const getResumeHistory = async () => {
  const response = await axios.get(`${API_URL}/history`);
  return response.data;
};

export const getResumeVersion = async (versionId) => {
  const response = await axios.get(`${API_URL}/history/${versionId}`);
  return response.data;
};

export const restoreResumeVersion = async (versionId) => {
  const response = await axios.post(`${API_URL}/history/${versionId}/restore`);
  return response.data;
};

export const deleteResumeVersion = async (versionId) => {
  const response = await axios.delete(`${API_URL}/history/${versionId}`);
  return response.data;
};

export const compareResumeVersions = async (versionAId, versionBId) => {
  const response = await axios.post(`${API_URL}/history/compare`, { versionAId, versionBId });
  return response.data;
};

export const downloadResumeVersion = async (versionId) => {
  const response = await axios.get(`${API_URL}/history/${versionId}/download`, {
    responseType: 'blob',
  });

  // Create a download link for the blob
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `SkillForge_Resume_${versionId}.json`);
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
};
