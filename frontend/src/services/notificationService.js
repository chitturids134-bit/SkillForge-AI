import axios from 'axios';

const API_URL = '/api/notifications';

export const getNotifications = async ({ limit = 20, page = 1, filter = 'all' } = {}) => {
  const response = await axios.get(API_URL, {
    params: { limit, page, filter },
  });
  return response.data;
};

export const getUnreadCount = async () => {
  const response = await axios.get(`${API_URL}/unread-count`);
  return response.data;
};

export const markAsRead = async (id) => {
  const response = await axios.patch(`${API_URL}/${id}/read`);
  return response.data;
};

export const markAllAsRead = async () => {
  const response = await axios.patch(`${API_URL}/read-all`);
  return response.data;
};

export const deleteNotification = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};
