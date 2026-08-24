import mongoose from 'mongoose';

const savedTalentSchema = new mongoose.Schema(
  {
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    savedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound unique index prevents duplicate saves per recruiter
savedTalentSchema.index({ recruiter: 1, candidate: 1 }, { unique: true });

const SavedTalent = mongoose.models.SavedTalent || mongoose.model('SavedTalent', savedTalentSchema);
export default SavedTalent;
