import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  structuredContent: {
    codeSnippets: [{ language: String, code: String }],
    suggestedActions: [{ label: String, action: String }],
    references: [{ title: String, url: String }]
  }
});

const mentorChatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    title: { type: String, default: 'AI Mentor Chat' },
    messages: [messageSchema],
    contextMemory: {
      userRole: { type: String, default: 'Full Stack Engineer' },
      targetSkills: [{ type: String }],
      lastTopic: { type: String, default: 'Career Development' },
    },
    isArchived: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const MentorChat = mongoose.model('MentorChat', mentorChatSchema);
export default MentorChat;
