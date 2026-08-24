import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
    avatar: { type: String, default: '' },
    profilePhoto: { type: String, default: '' },
    role: {
      type: String,
      enum: ['Developer', 'Recruiter', 'Admin'],
      default: 'Developer',
    },
    settings: {
      theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'dark',
      },
      notifications: {
        inApp: { type: Boolean, default: true },
        email: { type: Boolean, default: true },
        careerRecommendations: { type: Boolean, default: true },
        aiMentor: { type: Boolean, default: true },
        jobAlerts: { type: Boolean, default: true },
        recruiter: {
          newApplication: { type: Boolean, default: true },
          highMatchCandidate: { type: Boolean, default: true },
          interviewReminder: { type: Boolean, default: true },
          candidateStatusUpdate: { type: Boolean, default: true },
          candidateMessage: { type: Boolean, default: true },
          jobPerformance: { type: Boolean, default: true },
          weeklyHiringSummary: { type: Boolean, default: true },
          applicationDigest: { type: Boolean, default: false },
        },
      },
      privacy: {
        profileVisibility: {
          type: String,
          enum: ['public', 'private', 'limited'],
          default: 'public',
        },
      },
      recruiterPreferences: {
        recruiterTitle: { type: String, default: 'Technical Recruiter' },
        phone: { type: String, default: '' },
        hiringTypes: [{ type: String }],
        workModes: [{ type: String }],
        experienceLevels: [{ type: String }],
        hiringCategories: [{ type: String }],
        preferredSkills: [{ type: String }],
        minimumMatchScore: { type: Number, min: 50, max: 90, default: 70 },
        candidateDiscovery: {
          highlightHighMatch: { type: Boolean, default: true },
          prioritizeVerifiedSkills: { type: Boolean, default: true },
          prioritizeCompletedAssessments: { type: Boolean, default: true },
          prioritizeInterviewReadiness: { type: Boolean, default: true },
          showRecentlyActive: { type: Boolean, default: true },
          defaultSort: { type: String, default: 'AI Match Score' },
        },
        privacy: {
          profileVisibility: { type: String, enum: ['public', 'limited', 'private'], default: 'public' },
          candidateContactVisibility: { type: String, enum: ['full', 'after-application', 'after-shortlist'], default: 'after-application' },
          showInCandidateSearch: { type: Boolean, default: true },
          allowCandidateContact: { type: Boolean, default: true },
          showCompanyHiringActivity: { type: Boolean, default: true },
          showOnlineStatus: { type: Boolean, default: true },
        },
      },
    },
  },
  { timestamps: true }
);

// Encrypt password using bcrypt before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Match user entered password to hashed password in database
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
