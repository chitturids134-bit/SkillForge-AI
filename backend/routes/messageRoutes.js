import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getConversationsController,
  getConversationController,
  createConversationController,
  getMessagesController,
  sendMessageController,
  editMessageController,
  deleteMessageController,
  markMessageReadController,
  markConversationReadController,
  getUnreadCountController,
  searchUsersController,
} from '../controllers/messageController.js';

const router = express.Router();

// All message routes require JWT protection
router.use(protect);

// User search for conversation discovery
router.get('/users/search', searchUsersController);

// Unread count
router.get('/unread-count', getUnreadCountController);

// Conversations CRUD
router.get('/conversations', getConversationsController);
router.post('/conversations', createConversationController);
router.get('/conversations/:conversationId', getConversationController);

// Conversation Messages CRUD
router.get('/conversations/:conversationId/messages', getMessagesController);
router.post('/conversations/:conversationId/messages', sendMessageController);
router.patch('/conversations/:conversationId/read', markConversationReadController);

// Message item CRUD
router.patch('/:messageId', editMessageController);
router.delete('/:messageId', deleteMessageController);
router.patch('/:messageId/read', markMessageReadController);

// Root fallback (GET /api/messages)
router.get('/', getConversationsController);

export default router;
