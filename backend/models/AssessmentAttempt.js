import mongoose from 'mongoose';

const answerSubSchema = new mongoose.Schema({
  questionIndex: { type: Number, required: true },
  selectedOptionIndex: { type: Number, default: -1 },
  isCorrect: { type: Boolean, default: false },
  answeredAt: { type: Date, default: Date.now },
});

const topicBreakdownSubSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  correct: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
});

const assessmentAttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['in-progress', 'completed', 'abandoned'],
      default: 'in-progress',
      index: true,
    },
    currentQuestionIndex: {
      type: Number,
      default: 0,
    },
    answers: [answerSubSchema],
    score: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    correctAnswersCount: {
      type: Number,
      default: 0,
    },
    totalQuestions: {
      type: Number,
      default: 0,
    },
    passed: {
      type: Boolean,
      default: false,
    },
    timeTakenSeconds: {
      type: Number,
      default: 0,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    result: {
      overallScore: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 },
      readinessLevel: { type: String, default: 'Developing' },
      strengths: [{ type: String }],
      weaknesses: [{ type: String }],
      recommendations: [{ type: String }],
      topicBreakdown: [topicBreakdownSubSchema],
    },
  },
  { timestamps: true }
);

assessmentAttemptSchema.index({ user: 1, createdAt: -1 });
assessmentAttemptSchema.index({ user: 1, status: 1 });

const AssessmentAttempt = mongoose.model('AssessmentAttempt', assessmentAttemptSchema);
export default AssessmentAttempt;
