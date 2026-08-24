import {
  getConversationsService,
  getOrCreateConversationService,
  getMessagesService,
  sendMessageService,
  editMessageService,
  deleteMessageService,
  markMessageAsReadService,
  markConversationReadService,
  getUnreadMessageCountService,
  searchUsersService,
} from '../services/messageService.js';

/**
 * @desc    Get user conversations
 * @route   GET /api/messages/conversations
 * @access  Private
 */
export const getConversationsController = async (req, res) => {
  try {
    const userId = req.user._id;
    const conversations = await getConversationsService(userId);
    return res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error('Get Conversations Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch conversations',
    });
  }
};

/**
 * @desc    Get single conversation details
 * @route   GET /api/messages/conversations/:conversationId
 * @access  Private
 */
export const getConversationController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;
    const conversations = await getConversationsService(userId);
    const conversation = conversations.find((c) => c.id.toString() === conversationId.toString());

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found or unauthorized',
      });
    }

    return res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error('Get Conversation Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch conversation',
    });
  }
};

/**
 * @desc    Get or create conversation with another user
 * @route   POST /api/messages/conversations
 * @access  Private
 */
export const createConversationController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { participantId, jobId } = req.body;

    if (!participantId) {
      return res.status(400).json({
        success: false,
        message: 'Participant ID is required',
      });
    }

    const conversation = await getOrCreateConversationService(userId, participantId, jobId);
    return res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error('Create Conversation Error:', error.message);
    const status = error.message.includes('cannot start a conversation') ? 400 : 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to create conversation',
    });
  }
};

/**
 * @desc    Get paginated messages for a conversation
 * @route   GET /api/messages/conversations/:conversationId/messages
 * @access  Private
 */
export const getMessagesController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;
    const { page, limit } = req.query;

    const data = await getMessagesService(userId, conversationId, { page, limit });
    return res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error('Get Messages Error:', error.message);
    const status = error.message.includes('Unauthorized') ? 403 : error.message.includes('not found') ? 404 : 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to fetch messages',
    });
  }
};

/**
 * @desc    Send a message in a conversation
 * @route   POST /api/messages/conversations/:conversationId/messages
 * @access  Private
 */
export const sendMessageController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;
    const { text } = req.body;

    const message = await sendMessageService(userId, conversationId, text);

    // Emit Socket.IO real-time event
    const io = req.app.get('io');
    if (io) {
      if (message.receiverId) io.to(`user:${message.receiverId}`).emit('message:new', message);
      if (message.senderId) io.to(`user:${message.senderId}`).emit('message:new', message);
    }

    return res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error('Send Message Error:', error.message);
    const status = error.message.includes('Unauthorized') ? 403 : error.message.includes('empty') || error.message.includes('exceed') ? 400 : 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to send message',
    });
  }
};

/**
 * @desc    Edit a message (Original sender only)
 * @route   PATCH /api/messages/:messageId
 * @access  Private
 */
export const editMessageController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { messageId } = req.params;
    const { text } = req.body;

    const updated = await editMessageService(userId, messageId, text);

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${userId}`).emit('message:updated', updated);
    }

    return res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('Edit Message Error:', error.message);
    const status = error.message.includes('Only the original sender') ? 403 : error.message.includes('not found') ? 404 : 400;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to edit message',
    });
  }
};

/**
 * @desc    Soft delete a message (Original sender only)
 * @route   DELETE /api/messages/:messageId
 * @access  Private
 */
export const deleteMessageController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { messageId } = req.params;

    const result = await deleteMessageService(userId, messageId);

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${userId}`).emit('message:deleted', { messageId });
    }

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Delete Message Error:', error.message);
    const status = error.message.includes('Only the original sender') ? 403 : error.message.includes('not found') ? 404 : 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to delete message',
    });
  }
};

/**
 * @desc    Mark single message as read
 * @route   PATCH /api/messages/:messageId/read
 * @access  Private
 */
export const markMessageReadController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { messageId } = req.params;

    const result = await markMessageAsReadService(userId, messageId);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Mark Message Read Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to mark message read',
    });
  }
};

/**
 * @desc    Mark conversation as read
 * @route   PATCH /api/messages/conversations/:conversationId/read
 * @access  Private
 */
export const markConversationReadController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;

    const result = await markConversationReadService(userId, conversationId);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Mark Read Error:', error.message);
    const status = error.message.includes('Unauthorized') ? 403 : 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to mark conversation read',
    });
  }
};

/**
 * @desc    Get total unread message count
 * @route   GET /api/messages/unread-count
 * @access  Private
 */
export const getUnreadCountController = async (req, res) => {
  try {
    const userId = req.user._id;
    const result = await getUnreadMessageCountService(userId);
    return res.status(200).json({
      success: true,
      unreadCount: result.unreadCount,
    });
  } catch (error) {
    console.error('Get Unread Count Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch unread count',
    });
  }
};

/**
 * @desc    Search users for starting new messages
 * @route   GET /api/messages/users/search
 * @access  Private
 */
export const searchUsersController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { q, role } = req.query;

    const users = await searchUsersService(userId, q, role);
    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error('Search Users Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to search users',
    });
  }
};

// Legacy exports
export const getMessages = getConversationsController;
export const getUnreadCount = getUnreadCountController;
export const getMessage = getMessagesController;
export const markRead = markConversationReadController;
export const markAllRead = markConversationReadController;
export const removeMessage = deleteMessageController;
