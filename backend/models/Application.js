import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job reference is required'],
      index: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Candidate reference is required'],
      index: true,
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recruiter reference is required'],
      index: true,
    },
    candidateName: {
      type: String,
      trim: true,
      default: '',
    },
    candidateEmail: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['applied', 'screened', 'shortlisted', 'interview', 'offer', 'hired', 'rejected'],
      default: 'applied',
    },
    matchScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    resumeSnapshot: {
      skills: [{ type: String }],
      headline: { type: String, default: '' },
      experience: { type: String, default: '' },
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    screenedAt: {
      type: Date,
      default: null,
    },
    hiredAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Compound indexes for recruiter dashboard queries
applicationSchema.index({ recruiter: 1, status: 1 });
applicationSchema.index({ recruiter: 1, createdAt: -1 });

const Application = mongoose.model('Application', applicationSchema);
export default Application;
