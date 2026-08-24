import axios from 'axios';

const API_URL = '/api/settings';

export const getSettings = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const updateSettings = async (settingsData) => {
  const response = await axios.patch(API_URL, settingsData);
  return response.data;
};

export const changePassword = async (passwordData) => {
  const response = await axios.patch(`${API_URL}/password`, passwordData);
  return response.data;
};

export const deleteAccount = async (accountData) => {
  const response = await axios.delete(`${API_URL}/account`, { data: accountData });
  return response.data;
};
