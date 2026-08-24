import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOptionIndex: { type: Number, required: true },
  explanation: { type: String, default: '' },
  difficulty: { type: String, default: 'Medium' },
  topic: { type: String, default: 'General' },
});

const assessmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    skill: { type: String, required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard', 'Advanced', 'Senior', 'Expert', 'Specialist'], default: 'Medium' },
    durationSeconds: { type: Number, default: 900 },
    passingPercentage: { type: Number, default: 70 },
    icon: { type: String, default: '⚡' },
    description: { type: String, default: '' },
    topics: [{ type: String }],
    questions: [questionSchema],
  },
  { timestamps: true }
);

const Assessment = mongoose.model('Assessment', assessmentSchema);
export default Assessment;
