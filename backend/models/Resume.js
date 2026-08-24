import mongoose from 'mongoose';

const educationSchema = new mongoose.Schema({
  school: { type: String, required: true },
  degree: { type: String, required: true },
  fieldOfStudy: { type: String, default: '' },
  startYear: { type: String, default: '' },
  endYear: { type: String, default: '' },
  gpa: { type: String, default: '' },
});

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  technologies: [{ type: String }],
  githubUrl: { type: String, default: '' },
  liveUrl: { type: String, default: '' },
});

const experienceSchema = new mongoose.Schema({
  company: { type: String, required: true },
  role: { type: String, required: true },
  location: { type: String, default: '' },
  startMonthYear: { type: String, default: '' },
  endMonthYear: { type: String, default: '' },
  current: { type: Boolean, default: false },
  description: { type: String, default: '' },
});

const certificationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  issuingOrganization: { type: String, required: true },
  issueDate: { type: String, default: '' },
  credentialUrl: { type: String, default: '' },
});

const achievementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  issuer: { type: String, default: '' },
  date: { type: String, default: '' },
  description: { type: String, default: '' }
});

const languageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  proficiency: { type: String, default: 'Fluent' }
});

const versionHistorySchema = new mongoose.Schema({
  versionNumber: { type: Number, required: true },
  title: { type: String, default: 'Saved Resume Draft' },
  template: { type: String, default: 'modern' },
  savedAt: { type: Date, default: Date.now },
  atsScore: { type: Number, default: 78 },
  atsKeywords: [{ type: String }],
  changeSummary: { type: String, default: 'Saved resume updates' },
  source: {
    type: String,
    enum: ['manual-save', 'autosave', 'restored'],
    default: 'manual-save',
  },
  resumeData: { type: Object }
});

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    personalInfo: {
      fullName: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      githubUrl: { type: String, trim: true, default: '' },
      linkedinUrl: { type: String, trim: true, default: '' },
      portfolioUrl: { type: String, trim: true, default: '' },
      address: { type: String, default: '' },
      summary: { type: String, default: '' },
      headline: { type: String, default: '' }
    },
    education: [educationSchema],
    skills: [{ type: String }],
    projects: [projectSchema],
    experience: [experienceSchema],
    certifications: [certificationSchema],
    achievements: [achievementSchema],
    languages: [languageSchema],
    interests: [{ type: String }],
    templateId: { type: String, default: 'modern' },
    atsScore: { type: Number, default: 85 },
    atsFeedback: {
      overallScore: { type: Number, default: 85 },
      formattingScore: { type: Number, default: 90 },
      keywordScore: { type: Number, default: 80 },
      contentScore: { type: Number, default: 85 },
      suggestions: [{ type: String }]
    },
    versionHistory: [versionHistorySchema]
  },
  { timestamps: true }
);

const Resume = mongoose.model('Resume', resumeSchema);
export default Resume;
