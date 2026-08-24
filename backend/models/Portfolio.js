import mongoose from 'mongoose';

const projectShowcaseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, default: 'Web App' },
  image: { type: String, default: '' },
  liveUrl: { type: String, default: '' },
  githubUrl: { type: String, default: '' },
  featured: { type: Boolean, default: false },
  tags: [{ type: String }],
});

const portfolioSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    publicSlug: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    theme: {
      type: String,
      default: 'dark',
    },
    hero: {
      name: { type: String, default: '' },
      title: { type: String, default: 'Full Stack AI Engineer' },
      bio: { type: String, default: '' },
      tagline: { type: String, default: 'Building scalable applications and AI models.' },
      location: { type: String, default: '' },
      availability: { type: String, default: 'Available for Hire' },
      avatarUrl: { type: String, default: '' },
    },
    about: {
      description: { type: String, default: '' },
      yearsExperience: { type: String, default: '2+ Years' },
      completedProjects: { type: Number, default: 12 },
    },
    skills: [
      {
        name: { type: String, required: true },
        category: { type: String, default: 'Frontend' },
        proficiency: { type: Number, default: 90 },
      }
    ],
    projects: [projectShowcaseSchema],
    experience: [
      {
        company: { type: String, required: true },
        role: { type: String, required: true },
        duration: { type: String, default: '' },
        description: { type: String, default: '' },
      }
    ],
    education: [
      {
        institution: { type: String, required: true },
        degree: { type: String, required: true },
        year: { type: String, default: '' },
      }
    ],
    certifications: [
      {
        name: { type: String, required: true },
        issuer: { type: String, required: true },
        year: { type: String, default: '' },
        link: { type: String, default: '' },
      }
    ],
    contact: {
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      location: { type: String, default: '' },
      githubUrl: { type: String, default: '' },
      linkedinUrl: { type: String, default: '' },
      twitterUrl: { type: String, default: '' },
      websiteUrl: { type: String, default: '' },
    }
  },
  { timestamps: true }
);

const Portfolio = mongoose.model('Portfolio', portfolioSchema);
export default Portfolio;
