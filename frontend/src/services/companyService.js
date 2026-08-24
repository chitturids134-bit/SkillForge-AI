import axios from 'axios';

const API_URL = '/api/recruiter/company';

/**
 * Fetch authenticated recruiter's company profile
 */
export const getCompanyProfile = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

/**
 * Update authenticated recruiter's company profile
 * @param {object} companyData
 */
export const updateCompanyProfile = async (companyData) => {
  const response = await axios.put(API_URL, companyData);
  return response.data;
};

/**
 * Fetch public company profile by ID
 * @param {string} id
 */
export const getPublicCompanyProfile = async (id) => {
  const response = await axios.get(`${API_URL}/public/${id}`);
  return response.data;
};
