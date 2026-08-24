import axios from 'axios';

const RECRUITER_SETTINGS_URL = '/api/recruiter/settings';
const BASE_SETTINGS_URL = '/api/settings';

/**
 * Fetch recruiter settings combining account details, preferences, notifications, & company workspace info
 */
export const getRecruiterSettings = async () => {
  const response = await axios.get(RECRUITER_SETTINGS_URL);
  return response.data;
};

/**
 * Update general recruiter settings
 * @param {object} settingsData
 */
export const updateRecruiterSettings = async (settingsData) => {
  const response = await axios.patch(RECRUITER_SETTINGS_URL, settingsData);
  return response.data;
};

/**
 * Update recruiter hiring preferences
 * @param {object} preferencesData
 */
export const updateRecruiterPreferences = async (preferencesData) => {
  const response = await axios.patch(`${RECRUITER_SETTINGS_URL}/preferences`, preferencesData);
  return response.data;
};

/**
 * Update recruiter notification preferences
 * @param {object} notificationsData
 */
export const updateRecruiterNotifications = async (notificationsData) => {
  const response = await axios.patch(`${RECRUITER_SETTINGS_URL}/notifications`, notificationsData);
  return response.data;
};

/**
 * Update recruiter privacy settings
 * @param {object} privacyData
 */
export const updateRecruiterPrivacy = async (privacyData) => {
  const response = await axios.patch(`${RECRUITER_SETTINGS_URL}/privacy`, privacyData);
  return response.data;
};

/**
 * Change recruiter password (reuses existing auth/settings password API)
 * @param {object} passwordData
 */
export const changePassword = async (passwordData) => {
  const response = await axios.patch(`${BASE_SETTINGS_URL}/password`, passwordData);
  return response.data;
};
