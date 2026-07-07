import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    college: {
      type: String,
      required: [true, 'College name is required'],
      trim: true,
    },
    degree: {
      type: String,
      required: [true, 'Degree is required'],
      trim: true,
    },
    branch: {
      type: String,
      required: [true, 'Branch is required'],
      trim: true,
    },
    currentYear: {
      type: String,
      required: [true, 'Current year is required'],
      trim: true,
    },
    cgpa: {
      type: Number,
      required: [true, 'CGPA is required'],
      min: [0, 'CGPA must be at least 0'],
      max: [10, 'CGPA cannot exceed 10'],
    },
    skills: {
      type: [String],
      required: [true, 'At least one skill is required'],
    },
    interestedRole: {
      type: String,
      required: [true, 'Interested role is required'],
      trim: true,
    },
    experienceLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      required: [true, 'Experience level is required'],
    },
    githubUrl: {
      type: String,
      trim: true,
    },
    linkedinUrl: {
      type: String,
      trim: true,
    },
    portfolioUrl: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    profilePhoto: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    resumeUrl: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const Profile = mongoose.model('Profile', profileSchema);
export default Profile;
