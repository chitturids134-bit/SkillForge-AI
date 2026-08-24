import axios from 'axios';

const API_URL = '/api/portfolio';

export const getPortfolio = async () => {
  const response = await axios.get(`${API_URL}/me`);
  return response.data;
};

export const updatePortfolio = async (portfolioData) => {
  const response = await axios.put(`${API_URL}/me`, portfolioData);
  return response.data;
};

export const syncPortfolioFromResume = async () => {
  const response = await axios.post(`${API_URL}/sync-resume`);
  return response.data;
};

export const getPublicPortfolio = async (username) => {
  const response = await axios.get(`${API_URL}/public/${username}`);
  return response.data;
};
