import {
  getPromptTemplatesService,
  getChatSessionsService,
  sendMessageToMentorService,
  clearChatSessionService,
} from '../services/mentorService.js';

// @desc    Get mentor prompt templates
// @route   GET /api/mentor/templates
// @access  Private
export const getTemplates = async (req, res) => {
  try {
    const templates = getPromptTemplatesService();
    res.status(200).json({
      status: 'success',
      templates,
    });
  } catch (error) {
    console.error('GetTemplates Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch prompt templates',
    });
  }
};

// @desc    Get chat sessions
// @route   GET /api/mentor/sessions
// @access  Private
export const getSessions = async (req, res) => {
  try {
    const sessions = await getChatSessionsService(req.user.id);
    res.status(200).json({
      status: 'success',
      sessions,
    });
  } catch (error) {
    console.error('GetSessions Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch chat sessions',
    });
  }
};

// @desc    Send message to mentor
// @route   POST /api/mentor/message
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    if (!message) {
      return res.status(400).json({ status: 'error', message: 'Message text is required' });
    }
    const session = await sendMessageToMentorService(req.user.id, sessionId, message);
    res.status(200).json({
      status: 'success',
      session,
    });
  } catch (error) {
    console.error('SendMessage Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to send message to mentor',
    });
  }
};

// @desc    Clear chat session
// @route   POST /api/mentor/clear
// @access  Private
export const clearSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await clearChatSessionService(req.user.id, sessionId);
    res.status(200).json({
      status: 'success',
      session,
    });
  } catch (error) {
    console.error('ClearSession Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to clear session',
    });
  }
};
