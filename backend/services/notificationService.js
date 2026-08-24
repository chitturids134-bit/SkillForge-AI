import Notification from '../models/Notification.js';

/**
 * Create a new notification for a specific user.
 * Includes duplicate prevention logic for idempotent events.
 */
export const createNotification = async ({ userId, user, type, title, message, link = '', metadata = {} }) => {
  const targetUser = userId || user;
  if (!targetUser) return null;

  // Prevent duplicate WELCOME notifications for the same user
  if (type === 'WELCOME') {
    const existingWelcome = await Notification.findOne({ user: targetUser, type: 'WELCOME' });
    if (existingWelcome) {
      return existingWelcome;
    }
  }

  // Prevent duplicate notifications triggered within 10 seconds with identical title & user
  const tenSecondsAgo = new Date(Date.now() - 10000);
  const recentDuplicate = await Notification.findOne({
    user: targetUser,
    type,
    title,
    createdAt: { $gte: tenSecondsAgo }
  });

  if (recentDuplicate) {
    return recentDuplicate;
  }

  const notification = await Notification.create({
    user: targetUser,
    type: type || 'SYSTEM',
    title,
    message,
    link,
    metadata,
    isRead: false
  });

  return notification;
};

/**
 * Retrieve notifications for an authenticated user with pagination and optional unread filter.
 */
export const getUserNotifications = async (userId, { limit = 20, page = 1, filter = 'all' } = {}) => {
  const query = { user: userId };
  if (filter === 'unread') {
    query.isRead = false;
  }

  const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
  const skip = (parsedPage - 1) * parsedLimit;

  const [notifications, totalCount, unreadCount] = await Promise.all([
    Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit)
      .lean(),
    Notification.countDocuments(query),
    Notification.countDocuments({ user: userId, isRead: false })
  ]);

  return {
    notifications,
    totalCount,
    unreadCount,
    page: parsedPage,
    pages: Math.ceil(totalCount / parsedLimit) || 1
  };
};

/**
 * Get unread notification count for an authenticated user.
 */
export const getUnreadCount = async (userId) => {
  const unreadCount = await Notification.countDocuments({ user: userId, isRead: false });
  return unreadCount;
};

/**
 * Mark a single notification as read (strictly ensuring ownership).
 */
export const markAsRead = async (userId, notificationId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { $set: { isRead: true } },
    { new: true }
  );

  return notification;
};

/**
 * Mark all notifications as read for an authenticated user.
 */
export const markAllAsRead = async (userId) => {
  const result = await Notification.updateMany(
    { user: userId, isRead: false },
    { $set: { isRead: true } }
  );

  const unreadCount = await getUnreadCount(userId);
  return { modifiedCount: result.modifiedCount || 0, unreadCount };
};

/**
 * Delete a single notification (strictly ensuring ownership).
 */
export const deleteNotification = async (userId, notificationId) => {
  const result = await Notification.deleteOne({ _id: notificationId, user: userId });
  return result.deletedCount > 0;
};
