import mongoose from 'mongoose';

const interviewQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    default: 'General',
  },
  expectedTopics: [{ type: String }],
  answer: {
    type: String,
    default: '',
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  feedback: {
    type: String,
    default: '',
  },
  strengths: [{ type: String }],
  improvements: [{ type: String }],
  answeredAt: {
    type: Date,
  },
});

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
    },
    type: {
      type: String,
      enum: ['recruiter_interview', 'ai_technical', 'ai_screening'],
      default: 'recruiter_interview',
    },
    format: {
      type: String,
      enum: ['AI', 'Video', 'Phone'],
      default: 'Video',
    },
    status: {
      type: String,
      enum: ['scheduled', 'accepted', 'declined', 'reschedule_requested', 'in-progress', 'in_progress', 'completed', 'cancelled', 'abandoned'],
      default: 'scheduled',
    },
    scheduledAt: {
      type: Date,
      default: Date.now,
    },
    duration: {
      type: Number,
      default: 45, // minutes
    },
    notes: {
      type: String,
      default: '',
    },
    repositoryUrl: {
      type: String,
      default: '',
      trim: true
    },
    repositorySubmittedAt: {
      type: Date
    },
    repositorySubmittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rescheduleRequest: {
      preferredDate: Date,
      preferredTime: String,
      reason: String,
      requestedAt: Date,
    },
    recruiterEvaluation: {
      technicalScore: { type: Number, min: 0, max: 100, default: 0 },
      communicationScore: { type: Number, min: 0, max: 100, default: 0 },
      problemSolvingScore: { type: Number, min: 0, max: 100, default: 0 },
      cultureFitScore: { type: Number, min: 0, max: 100, default: 0 },
      overallScore: { type: Number, min: 0, max: 100, default: 0 },
      strengths: { type: String, default: '' },
      weaknesses: { type: String, default: '' },
      notes: { type: String, default: '' },
      recommendation: { type: String, enum: ['shortlisted', 'rejected', 'offer', 'pending'], default: 'pending' },
      submittedAt: Date,
    },
    transcript: [
      {
        speaker: { type: String, required: true },
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
      }
    ],
    hiringDecision: {
      decision: { type: String, enum: ['shortlisted', 'rejected', 'offer', 'pending'], default: 'pending' },
      notes: { type: String, default: '' },
      decidedAt: Date,
    },
    category: {
      type: String,
      enum: ['Technical', 'HR', 'Behavioral'],
      default: 'Technical',
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Intermediate',
    },
    questionCount: {
      type: Number,
      default: 5,
    },
    currentQuestionIndex: {
      type: Number,
      default: 0,
    },
    questions: [interviewQuestionSchema],
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    analysis: {
      technicalScore: { type: Number, default: 0 },
      communicationScore: { type: Number, default: 0 },
      confidenceScore: { type: Number, default: 0 },
      problemSolvingScore: { type: Number, default: 0 },
      readinessLevel: { type: String, default: 'Needs Improvement' },
      recommendation: { type: String, default: 'Needs Review' },
      strengths: [{ type: String }],
      weaknesses: [{ type: String }],
      suggestions: [{ type: String }],
    },
  },
  {
    timestamps: true,
  }
);

interviewSchema.index({ user: 1, status: 1 });
interviewSchema.index({ recruiter: 1, status: 1 });
interviewSchema.index({ scheduledAt: 1 });

const Interview = mongoose.models.Interview || mongoose.model('Interview', interviewSchema);
export default Interview;
