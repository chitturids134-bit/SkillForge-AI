import mongoose from 'mongoose';

const educationSchema = new mongoose.Schema({
  school: { type: String, required: true },
  degree: { type: String, required: true },
  fieldOfStudy: { type: String, required: true },
  startYear: { type: String, required: true },
  endYear: { type: String, required: true },
  gpa: { type: Number },
});

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  technologies: { type: [String], required: true },
  githubUrl: { type: String },
  liveUrl: { type: String },
});

const experienceSchema = new mongoose.Schema({
  company: { type: String, required: true },
  role: { type: String, required: true },
  location: { type: String },
  startMonthYear: { type: String, required: true },
  endMonthYear: { type: String },
  current: { type: Boolean, default: false },
  description: { type: String, required: true },
});

const certificationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  issuingOrganization: { type: String, required: true },
  issueDate: { type: String },
  credentialUrl: { type: String },
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
      fullName: { type: String, required: [true, 'Full name is required'] },
      email: { type: String, required: [true, 'Email is required'] },
      phone: { type: String, required: [true, 'Phone is required'] },
      githubUrl: { type: String, trim: true },
      linkedinUrl: { type: String, trim: true },
      portfolioUrl: { type: String, trim: true },
      address: { type: String },
      summary: { type: String },
    },
    education: [educationSchema],
    skills: {
      type: [String],
      required: [true, 'At least one skill is required'],
    },
    projects: [projectSchema],
    experience: [experienceSchema],
    certifications: [certificationSchema],
  },
  { timestamps: true }
);

const Resume = mongoose.model('Resume', resumeSchema);
export default Resume;
