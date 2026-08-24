import axios from 'axios';

const API_URL = '/api/profile';

export const getProfile = async () => {
  const response = await axios.get(`${API_URL}/me`);
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await axios.put(`${API_URL}/me`, profileData);
  return response.data;
};

export const uploadAvatar = async (fileOrUrl) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  if (fileOrUrl instanceof File) {
    const formData = new FormData();
    formData.append('avatar', fileOrUrl);
    const response = await api.post('/profile/avatar', formData, {
      headers: {
        ...headers,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  const response = await api.post('/profile/avatar', { photoUrl: fileOrUrl }, { headers });
  return response.data;
};

export const deleteAvatar = async () => {
  const response = await axios.delete(`${API_URL}/avatar`);
  return response.data;
};

// Projects CRUD
export const addProject = async (data) => {
  const response = await axios.post(`${API_URL}/projects`, data);
  return response.data;
};

export const updateProject = async (id, data) => {
  const response = await axios.put(`${API_URL}/projects/${id}`, data);
  return response.data;
};

export const deleteProject = async (id) => {
  const response = await axios.delete(`${API_URL}/projects/${id}`);
  return response.data;
};

// Certifications CRUD
export const addCertification = async (data) => {
  const response = await axios.post(`${API_URL}/certifications`, data);
  return response.data;
};

export const updateCertification = async (id, data) => {
  const response = await axios.put(`${API_URL}/certifications/${id}`, data);
  return response.data;
};

export const deleteCertification = async (id) => {
  const response = await axios.delete(`${API_URL}/certifications/${id}`);
  return response.data;
};

// Education CRUD
export const addEducation = async (data) => {
  const response = await axios.post(`${API_URL}/education`, data);
  return response.data;
};

export const updateEducation = async (id, data) => {
  const response = await axios.put(`${API_URL}/education/${id}`, data);
  return response.data;
};

export const deleteEducation = async (id) => {
  const response = await axios.delete(`${API_URL}/education/${id}`);
  return response.data;
};

// Experience CRUD
export const addExperience = async (data) => {
  const response = await axios.post(`${API_URL}/experience`, data);
  return response.data;
};

export const updateExperience = async (id, data) => {
  const response = await axios.put(`${API_URL}/experience/${id}`, data);
  return response.data;
};

export const deleteExperience = async (id) => {
  const response = await axios.delete(`${API_URL}/experience/${id}`);
  return response.data;
};

// Skills CRUD
export const addSkill = async (data) => {
  const response = await axios.post(`${API_URL}/skills`, data);
  return response.data;
};

export const updateSkill = async (id, data) => {
  const response = await axios.put(`${API_URL}/skills/${id}`, data);
  return response.data;
};

export const deleteSkill = async (id) => {
  const response = await axios.delete(`${API_URL}/skills/${id}`);
  return response.data;
};
