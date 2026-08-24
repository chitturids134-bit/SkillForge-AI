import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  techStack: [{ type: String }],
  githubUrl: { type: String, default: '' },
  liveUrl: { type: String, default: '' },
  status: { type: String, enum: ['In Progress', 'Completed', 'Featured'], default: 'Completed' },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  image: { type: String, default: '' }
});

const certificationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  issuingOrganization: { type: String, required: true },
  issueDate: { type: String, default: '' },
  credentialId: { type: String, default: '' },
  credentialUrl: { type: String, default: '' },
  image: { type: String, default: '' }
});

const educationSchema = new mongoose.Schema({
  college: { type: String, required: true },
  degree: { type: String, required: true },
  branch: { type: String, default: '' },
  cgpa: { type: String, default: '' },
  startYear: { type: String, default: '' },
  endYear: { type: String, default: '' },
  description: { type: String, default: '' }
});

const experienceSchema = new mongoose.Schema({
  company: { type: String, required: true },
  role: { type: String, required: true },
  location: { type: String, default: '' },
  duration: { type: String, default: '' },
  current: { type: Boolean, default: false },
  description: { type: String, default: '' }
});

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, default: 'Frontend' },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], default: 'Intermediate' },
  yearsExperience: { type: Number, default: 1 }
});

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    fullName: { type: String, trim: true, default: '' },
    headline: { type: String, trim: true, default: '' },
    bio: { type: String, trim: true, default: '' },
    location: { type: String, trim: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    college: { type: String, trim: true, default: '' },
    degree: { type: String, trim: true, default: '' },
    branch: { type: String, trim: true, default: '' },
    currentYear: { type: String, trim: true, default: '' },
    cgpa: { type: String, trim: true, default: '' },
    interestedRole: { type: String, trim: true, default: '' },
    targetRole: { type: String, trim: true, default: '' },
    experienceLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], default: 'Intermediate' },
    githubUrl: { type: String, trim: true, default: '' },
    linkedinUrl: { type: String, trim: true, default: '' },
    portfolioUrl: { type: String, trim: true, default: '' },
    twitterUrl: { type: String, trim: true, default: '' },
    profilePhoto: { type: String, trim: true, default: '' },
    resumeUrl: { type: String, trim: true, default: '' },
    tagline: { type: String, default: '' },
    expectedSalary: { type: String, default: '' },
    preferredLocation: { type: String, default: '' },
    workPreference: { type: String, default: '' },
    preferredIndustry: { type: String, default: '' },
    careerObjective: { type: String, default: '' },

    projects: [projectSchema],
    certifications: [certificationSchema],
    education: [educationSchema],
    experience: [experienceSchema],
    skills: [skillSchema],

    profileCompletion: { type: Number, default: 0 },
    analytics: {
      views: { type: Number, default: 42 },
      resumeDownloads: { type: Number, default: 18 },
      searchAppearances: { type: Number, default: 85 },
      lastUpdated: { type: Date, default: Date.now },
    }
  },
  { timestamps: true }
);

const Profile = mongoose.model('Profile', profileSchema);
export default Profile;
