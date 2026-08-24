import mongoose from 'mongoose';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import Company from '../models/Company.js';
import Job from '../models/Job.js';

/**
 * Get all conversations for a user
 */
export const getConversationsService = async (userId) => {
  const conversations = await Conversation.find({ participants: userId })
    .sort({ lastMessageAt: -1 })
    .populate('participants', 'name email role')
    .populate('job', 'title company')
    .lean();

  const formatted = await Promise.all(
    conversations.map(async (conv) => {
      const otherUser = conv.participants.find(
        (p) => p._id.toString() !== userId.toString()
      ) || conv.participants[0] || {};

      let companyName = '';
      if (otherUser?.role === 'Recruiter') {
        const company = await Company.findOne({ owner: otherUser._id }).select('companyName');
        if (company) companyName = company.companyName;
      }

      const unreadCount = await Message.countDocuments({
        conversation: conv._id,
        receiver: userId,
        read: false,
      });

      return {
        id: conv._id,
        participant: {
          _id: otherUser._id,
          name: otherUser.name || 'User',
          email: otherUser.email || '',
          role: otherUser.role || 'Developer',
          companyName,
        },
        job: conv.job
          ? {
              id: conv.job._id,
              title: conv.job.title,
              company: conv.job.company,
            }
          : null,
        lastMessageText: conv.lastMessageText || '',
        lastMessageAt: conv.lastMessageAt || conv.updatedAt,
        unreadCount,
      };
    })
  );

  return formatted;
};

/**
 * Find existing conversation or create a new one between Developer ↔ Recruiter
 */
export const getOrCreateConversationService = async (userId, participantId, jobId = null) => {
  if (!mongoose.Types.ObjectId.isValid(participantId)) {
    throw new Error('Invalid participant ID format.');
  }

  if (userId.toString() === participantId.toString()) {
    throw new Error('You cannot start a conversation with yourself.');
  }

  const currentUser = await User.findById(userId);
  const participantUser = await User.findById(participantId);

  if (!currentUser || !participantUser) {
    throw new Error('Target user not found.');
  }

  // Developer ↔ Recruiter check
  const roles = [currentUser.role, participantUser.role];
  const isDevRecruiterPair =
    (roles.includes('Developer') && roles.includes('Recruiter')) ||
    roles.includes('Admin');

  if (!isDevRecruiterPair) {
    console.warn(`Messaging pair role info: ${currentUser.role} and ${participantUser.role}`);
  }

  let conversation = await Conversation.findOne({
    participants: { $all: [userId, participantId] },
  });

  if (conversation) {
    if (jobId && mongoose.Types.ObjectId.isValid(jobId) && !conversation.job) {
      conversation.job = jobId;
      await conversation.save();
    }
  } else {
    conversation = await Conversation.create({
      participants: [userId, participantId],
      job: jobId && mongoose.Types.ObjectId.isValid(jobId) ? jobId : null,
    });
  }

  return conversation;
};

/**
 * Get paginated messages for a conversation
 */
export const getMessagesService = async (userId, conversationId, { page = 1, limit = 30 } = {}) => {
  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    throw new Error('Invalid conversation ID format.');
  }

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new Error('Conversation not found.');
  }

  const isParticipant = conversation.participants.some(
    (p) => p.toString() === userId.toString()
  );
  if (!isParticipant) {
    throw new Error('Unauthorized to view this conversation.');
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 30));
  const skip = (pageNum - 1) * limitNum;

  const total = await Message.countDocuments({ conversation: conversationId });

  const rawMessages = await Message.find({ conversation: conversationId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .populate('sender', 'name role')
    .populate('receiver', 'name role')
    .lean();

  const messages = rawMessages.reverse().map((msg) => ({
    id: msg._id,
    conversationId: msg.conversation,
    senderId: msg.sender?._id || msg.sender,
    senderName: msg.sender?.name || 'User',
    senderRole: msg.sender?.role || 'Developer',
    receiverId: msg.receiver?._id || msg.receiver,
    text: msg.deleted ? 'This message was deleted' : (msg.text || msg.content || ''),
    edited: msg.edited || false,
    editedAt: msg.editedAt,
    deleted: msg.deleted || false,
    deletedAt: msg.deletedAt,
    messageType: msg.messageType || 'text',
    read: msg.read || msg.isRead || false,
    readAt: msg.readAt,
    createdAt: msg.createdAt,
  }));

  return {
    messages,
    page: pageNum,
    limit: limitNum,
    total,
    hasMore: skip + rawMessages.length < total,
  };
};

/**
 * Send a message in a conversation
 */
export const sendMessageService = async (userId, conversationId, text) => {
  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    throw new Error('Invalid conversation ID format.');
  }

  if (!text || typeof text !== 'string' || text.trim() === '') {
    throw new Error('Message text cannot be empty.');
  }

  const trimmedText = text.trim();
  if (trimmedText.length > 5000) {
    throw new Error('Message text cannot exceed 5000 characters.');
  }

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new Error('Conversation not found.');
  }

  const isParticipant = conversation.participants.some(
    (p) => p.toString() === userId.toString()
  );
  if (!isParticipant) {
    throw new Error('Unauthorized to send messages in this conversation.');
  }

  const receiverId = conversation.participants.find(
    (p) => p.toString() !== userId.toString()
  );

  if (!receiverId) {
    throw new Error('Recipient not found in conversation.');
  }

  const message = await Message.create({
    conversation: conversationId,
    sender: userId,
    receiver: receiverId,
    text: trimmedText,
    read: false,
  });

  conversation.lastMessage = message._id;
  conversation.lastMessageText = trimmedText;
  conversation.lastMessageAt = message.createdAt;
  await conversation.save();

  const populated = await Message.findById(message._id)
    .populate('sender', 'name role')
    .populate('receiver', 'name role')
    .lean();

  return {
    id: populated._id,
    conversationId: populated.conversation,
    senderId: populated.sender?._id || populated.sender,
    senderName: populated.sender?.name || 'User',
    senderRole: populated.sender?.role || 'Developer',
    receiverId: populated.receiver?._id || populated.receiver,
    text: populated.text,
    edited: false,
    deleted: false,
    messageType: populated.messageType || 'text',
    read: populated.read,
    readAt: populated.readAt,
    createdAt: populated.createdAt,
  };
};

/**
 * Edit an existing message (Sender only)
 */
export const editMessageService = async (userId, messageId, newText) => {
  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    throw new Error('Invalid message ID format.');
  }

  if (!newText || typeof newText !== 'string' || newText.trim() === '') {
    throw new Error('Message text cannot be empty.');
  }

  const trimmedText = newText.trim();
  if (trimmedText.length > 5000) {
    throw new Error('Message text cannot exceed 5000 characters.');
  }

  const message = await Message.findById(messageId);
  if (!message) {
    throw new Error('Message not found.');
  }

  if (message.sender.toString() !== userId.toString()) {
    throw new Error('Only the original sender can edit this message.');
  }

  if (message.deleted) {
    throw new Error('Cannot edit a deleted message.');
  }

  message.text = trimmedText;
  message.edited = true;
  message.editedAt = new Date();
  await message.save();

  // Update conversation lastMessageText if this was the last message
  const conversation = await Conversation.findById(message.conversation);
  if (conversation && conversation.lastMessage?.toString() === messageId.toString()) {
    conversation.lastMessageText = trimmedText;
    await conversation.save();
  }

  return {
    id: message._id,
    conversationId: message.conversation,
    senderId: message.sender,
    text: message.text,
    edited: true,
    editedAt: message.editedAt,
    createdAt: message.createdAt,
  };
};

/**
 * Soft delete a message (Sender only)
 */
export const deleteMessageService = async (userId, messageId) => {
  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    throw new Error('Invalid message ID format.');
  }

  const message = await Message.findById(messageId);
  if (!message) {
    throw new Error('Message not found.');
  }

  if (message.sender.toString() !== userId.toString()) {
    throw new Error('Only the original sender can delete this message.');
  }

  message.deleted = true;
  message.deletedAt = new Date();
  message.text = 'This message was deleted';
  await message.save();

  const conversation = await Conversation.findById(message.conversation);
  if (conversation && conversation.lastMessage?.toString() === messageId.toString()) {
    conversation.lastMessageText = 'This message was deleted';
    await conversation.save();
  }

  return {
    success: true,
    messageId: message._id,
    conversationId: message.conversation,
    text: 'This message was deleted',
  };
};

/**
 * Mark a single message as read
 */
export const markMessageAsReadService = async (userId, messageId) => {
  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    throw new Error('Invalid message ID format.');
  }

  const message = await Message.findById(messageId);
  if (!message) {
    throw new Error('Message not found.');
  }

  if (message.receiver.toString() === userId.toString()) {
    message.read = true;
    message.readAt = new Date();
    message.isRead = true;
    await message.save();
  }

  return { success: true };
};

/**
 * Mark all messages in a conversation as read for the user
 */
export const markConversationReadService = async (userId, conversationId) => {
  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    throw new Error('Invalid conversation ID format.');
  }

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new Error('Conversation not found.');
  }

  const isParticipant = conversation.participants.some(
    (p) => p.toString() === userId.toString()
  );
  if (!isParticipant) {
    throw new Error('Unauthorized to access this conversation.');
  }

  await Message.updateMany(
    { conversation: conversationId, receiver: userId, read: false },
    { $set: { read: true, readAt: new Date(), isRead: true } }
  );

  return { success: true, unreadCount: 0 };
};

/**
 * Get total unread message count for a user
 */
export const getUnreadMessageCountService = async (userId) => {
  const unreadCount = await Message.countDocuments({
    receiver: userId,
    read: false,
  });

  return { unreadCount };
};

/**
 * Search users for starting new conversations
 */
export const searchUsersService = async (userId, query = '', roleFilter = '') => {
  const currentUser = await User.findById(userId);
  const filter = {
    _id: { $ne: userId },
  };

  if (query && query.trim() !== '') {
    const q = query.trim();
    filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
    ];
  }

  // Developer searches Recruiters, Recruiter searches Developers
  if (roleFilter && ['Developer', 'Recruiter', 'Admin'].includes(roleFilter)) {
    filter.role = roleFilter;
  } else if (currentUser?.role === 'Developer') {
    filter.role = 'Recruiter';
  } else if (currentUser?.role === 'Recruiter') {
    filter.role = 'Developer';
  }

  const users = await User.find(filter)
    .select('name email role')
    .limit(20)
    .lean();

  const formatted = await Promise.all(
    users.map(async (u) => {
      let companyName = '';
      if (u.role === 'Recruiter') {
        const company = await Company.findOne({ owner: u._id }).select('companyName');
        if (company) companyName = company.companyName;
      }
      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        companyName,
      };
    })
  );

  return formatted;
};
