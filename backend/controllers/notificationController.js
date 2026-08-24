import {
  getUserNotifications as fetchUserNotifs,
  getUnreadCount as fetchUnreadCount,
  markAsRead as updateMarkAsRead,
  markAllAsRead as updateMarkAllAsRead,
  deleteNotification as removeNotification,
} from '../services/notificationService.js';

// @desc    Get user notifications with pagination & filter
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit, page, filter } = req.query;

    const data = await fetchUserNotifs(userId, { limit, page, filter });

    res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error('GetNotifications Error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to load notifications.',
    });
  }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const unreadCount = await fetchUnreadCount(userId);

    res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error('GetUnreadCount Error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch unread count.',
    });
  }
};

// @desc    Mark single notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const notification = await updateMarkAsRead(userId, id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found or access denied.',
      });
    }

    res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error('MarkAsRead Error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to mark notification as read.',
    });
  }
};

// @desc    Mark all user notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await updateMarkAllAsRead(userId);

    res.status(200).json({
      success: true,
      modifiedCount: result.modifiedCount,
      unreadCount: result.unreadCount,
    });
  } catch (error) {
    console.error('MarkAllAsRead Error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to mark all notifications as read.',
    });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const deleted = await removeNotification(userId, id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found or access denied.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully.',
    });
  } catch (error) {
    console.error('DeleteNotification Error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to delete notification.',
    });
  }
};
