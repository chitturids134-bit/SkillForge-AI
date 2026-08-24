import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const projectStudioSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
    techStack: [{ type: String }],
    estimatedDuration: { type: String, default: '2 Weeks' },
    learningOutcomes: [{ type: String }],
    githubUrl: { type: String, default: '' },
    liveDemoUrl: { type: String, default: '' },
    progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
    notes: [noteSchema],
    bookmarked: { type: Boolean, default: false },
    status: { type: String, enum: ['Idea', 'In Progress', 'Completed'], default: 'In Progress' }
  },
  { timestamps: true }
);

const ProjectStudio = mongoose.model('ProjectStudio', projectStudioSchema);
export default ProjectStudio;
