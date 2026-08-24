import Portfolio from '../models/Portfolio.js';
import Profile from '../models/Profile.js';
import Resume from '../models/Resume.js';
import User from '../models/User.js';

export const getPortfolioByUserId = async (userId) => {
  let portfolio = await Portfolio.findOne({ user: userId });
  if (!portfolio) {
    const user = await User.findById(userId);
    const slug = user ? user.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + userId.toString().slice(-4) : 'dev-' + userId.toString().slice(-4);
    portfolio = await Portfolio.create({
      user: userId,
      publicSlug: slug,
      hero: { name: user?.name || 'Developer', title: 'Software Engineer' },
      projects: [],
      skills: []
    });
  }
  return portfolio;
};

export const updatePortfolioByUserId = async (userId, data) => {
  let portfolio = await Portfolio.findOne({ user: userId });
  if (!portfolio) {
    portfolio = new Portfolio({ user: userId });
  }

  Object.assign(portfolio, data);
  await portfolio.save();
  return portfolio;
};

export const getPortfolioByPublicSlug = async (slug) => {
  const portfolio = await Portfolio.findOne({ publicSlug: slug, isPublic: true }).populate('user', 'name email');
  if (!portfolio) {
    throw new Error('Public portfolio not found');
  }
  return portfolio;
};

export const syncPortfolioFromResumeService = async (userId) => {
  const resume = await Resume.findOne({ user: userId });
  const profile = await Profile.findOne({ user: userId });
  const user = await User.findById(userId);

  let portfolio = await Portfolio.findOne({ user: userId });
  if (!portfolio) {
    const slug = user ? user.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + userId.toString().slice(-4) : 'dev-' + userId.toString().slice(-4);
    portfolio = new Portfolio({ user: userId, publicSlug: slug });
  }

  portfolio.hero.name = resume?.personalInfo?.fullName || profile?.fullName || user?.name || 'Developer';
  portfolio.hero.title = profile?.headline || 'Software Engineer';
  portfolio.hero.bio = profile?.bio || resume?.personalInfo?.summary || '';
  portfolio.hero.avatarUrl = profile?.profilePhoto || '';
  portfolio.contact.email = resume?.personalInfo?.email || user?.email || '';
  portfolio.contact.phone = resume?.personalInfo?.phone || profile?.phone || '';
  portfolio.contact.githubUrl = resume?.personalInfo?.githubUrl || profile?.githubUrl || '';
  portfolio.contact.linkedinUrl = resume?.personalInfo?.linkedinUrl || profile?.linkedinUrl || '';

  if (resume?.skills && resume.skills.length > 0) {
    portfolio.skills = resume.skills.map(s => ({ name: s, category: 'Technical', proficiency: 85 }));
  }

  if (resume?.projects && resume.projects.length > 0) {
    portfolio.projects = resume.projects.map(p => ({
      title: p.title,
      description: p.description,
      liveUrl: p.liveUrl || '',
      githubUrl: p.githubUrl || '',
      tags: p.technologies || []
    }));
  }

  await portfolio.save();
  return portfolio;
};
