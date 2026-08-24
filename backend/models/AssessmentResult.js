import mongoose from 'mongoose';

const assessmentResultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
      required: true,
    },
    category: { type: String, required: true },
    difficulty: { type: String, default: 'Medium' },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    correctAnswersCount: { type: Number, required: true },
    percentage: { type: Number, required: true },
    passed: { type: Boolean, required: true },
    timeTakenSeconds: { type: Number, default: 0 },
    userAnswers: [
      {
        questionIndex: Number,
        selectedOptionIndex: Number,
        isCorrect: Boolean,
      }
    ]
  },
  { timestamps: true }
);

const AssessmentResult = mongoose.model('AssessmentResult', assessmentResultSchema);
export default AssessmentResult;
