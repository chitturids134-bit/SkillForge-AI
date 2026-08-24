import axios from 'axios';

const API_URL = '/api/messages';

/**
 * Fetch all conversations for the logged in user
 */
export const getConversations = async () => {
  const response = await axios.get(`${API_URL}/conversations`);
  return response.data;
};

/**
 * Fetch single conversation by ID
 * @param {string} conversationId
 */
export const getConversation = async (conversationId) => {
  const response = await axios.get(`${API_URL}/conversations/${conversationId}`);
  return response.data;
};

/**
 * Get or create a conversation with a target user (and optional job context)
 * @param {string} participantId
 * @param {string} [jobId]
 */
export const createConversation = async (participantId, jobId = null) => {
  const response = await axios.post(`${API_URL}/conversations`, { participantId, jobId });
  return response.data;
};

/**
 * Get paginated messages for a specific conversation
 * @param {string} conversationId
 * @param {number} [page=1]
 * @param {number} [limit=30]
 */
export const getMessages = async (conversationId, page = 1, limit = 30) => {
  if (typeof conversationId === 'object' && conversationId !== null) {
    const params = conversationId;
    const response = await axios.get(API_URL, { params });
    return response.data;
  }
  const response = await axios.get(`${API_URL}/conversations/${conversationId}/messages`, {
    params: { page, limit },
  });
  return response.data;
};

/**
 * Send a text message in a conversation
 * @param {string} conversationId
 * @param {string} text
 */
export const sendMessage = async (conversationId, text) => {
  const response = await axios.post(`${API_URL}/conversations/${conversationId}/messages`, { text });
  return response.data;
};

/**
 * Edit an existing message (Sender only)
 * @param {string} messageId
 * @param {string} text
 */
export const editMessage = async (messageId, text) => {
  const response = await axios.patch(`${API_URL}/${messageId}`, { text });
  return response.data;
};

/**
 * Soft delete a message (Sender only)
 * @param {string} messageId
 */
export const deleteMessage = async (messageId) => {
  const response = await axios.delete(`${API_URL}/${messageId}`);
  return response.data;
};

/**
 * Mark a single message as read
 * @param {string} messageId
 */
export const markMessageAsRead = async (messageId) => {
  const response = await axios.patch(`${API_URL}/${messageId}/read`);
  return response.data;
};

/**
 * Mark all messages in a conversation as read
 * @param {string} conversationId
 */
export const markConversationRead = async (conversationId) => {
  const response = await axios.patch(`${API_URL}/conversations/${conversationId}/read`);
  return response.data;
};

/**
 * Fetch unread messages count
 */
export const getUnreadCount = async () => {
  const response = await axios.get(`${API_URL}/unread-count`);
  return response.data;
};

export const getUnreadMessageCount = async () => {
  try {
    const res = await getUnreadCount();
    return { success: true, count: res?.unreadCount || 0 };
  } catch (e) {
    return { success: false, count: 0 };
  }
};

/**
 * Search users to discover candidates or recruiters to message
 * @param {string} query
 * @param {string} [role]
 */
export const searchUsers = async (query = '', role = '') => {
  const response = await axios.get(`${API_URL}/users/search`, {
    params: { q: query, role },
  });
  return response.data;
};

// Legacy exports compatibility
export const markAllMessagesAsRead = async () => ({ success: true });
