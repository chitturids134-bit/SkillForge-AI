import mongoose from 'mongoose';
import Company from '../models/Company.js';
import User from '../models/User.js';

const sanitizeArray = (arr) => {
  if (!Array.isArray(arr)) return [];
  return [...new Set(arr.map((item) => (typeof item === 'string' ? item.trim() : '')).filter(Boolean))];
};

const isValidUrl = (urlStr) => {
  if (!urlStr || typeof urlStr !== 'string') return false;
  try {
    const parsed = new URL(urlStr);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const isValidEmail = (emailStr) => {
  if (!emailStr || typeof emailStr !== 'string') return false;
  const re = /^w+([.-]?w+)*@w+([.-]?w+)*(.w{2,3})+$/;
  return re.test(emailStr.trim());
};

export const getCompanyProfile = async (userId) => {
  let company = await Company.findOne({ owner: userId });

  if (!company) {
    const user = await User.findById(userId).select('name email');
    const initialName = user?.name ? `${user.name}'s Organization` : 'My Organization';

    company = await Company.create({
      owner: userId,
      companyName: initialName,
      email: user?.email || '',
      tagline: 'Innovative Tech & AI Solutions',
      description: 'Building next-generation platforms and engineering solutions.',
      hiringStatus: 'actively-hiring',
      hiringCategories: ['Software Engineering', 'AI & Machine Learning'],
      specialties: ['Cloud Computing', 'AI Platforms'],
      technologies: ['React', 'Node.js', 'MongoDB', 'Python'],
      verification: {
        status: 'pending',
        submittedAt: new Date(),
      },
    });
  }

  return company;
};

export const createOrUpdateCompanyProfile = async (userId, data = {}) => {
  const {
    companyName,
    logoUrl,
    tagline,
    description,
    website,
    email,
    phone,
    industry,
    companySize,
    foundedYear,
    headquarters,
    hiringStatus,
    hiringCategories,
    specialties,
    technologies,
  } = data;

  let company = await Company.findOne({ owner: userId });
  const isVerified = company?.verification?.status === 'verified';

  // SECURITY ENFORCEMENT: If company is already verified, block modification of corporate identity fields
  if (isVerified) {
    const attemptedIdentityMutation =
      (companyName && companyName.trim() !== company.companyName) ||
      (website && website.trim() !== company.website) ||
      (email && email.trim().toLowerCase() !== company.email) ||
      (industry && industry.trim() !== company.industry) ||
      (companySize && companySize !== company.companySize) ||
      (headquarters && headquarters.trim() !== company.headquarters);

    if (attemptedIdentityMutation) {
      throw new Error('Verified corporate information (Name, Website, Email, Industry, Size, Headquarters) is locked. Contact SkillForge AI Admin to request identity updates.');
    }
  }

  if (!isVerified) {
    if (!companyName || typeof companyName !== 'string' || companyName.trim().length < 2) {
      throw new Error('Company name must be at least 2 characters long.');
    }
    if (companyName.trim().length > 120) {
      throw new Error('Company name cannot exceed 120 characters.');
    }
    if (website && website.trim() !== '' && !isValidUrl(website.trim())) {
      throw new Error('Please provide a valid website URL (must start with http:// or https://).');
    }
    if (email && email.trim() !== '' && !isValidEmail(email.trim())) {
      throw new Error('Please provide a valid company email address.');
    }
  }

  if (tagline && tagline.trim().length > 160) {
    throw new Error('Tagline cannot exceed 160 characters.');
  }

  if (description && description.trim().length > 2000) {
    throw new Error('Description cannot exceed 2000 characters.');
  }

  if (logoUrl && logoUrl.trim() !== '' && !isValidUrl(logoUrl.trim())) {
    throw new Error('Please provide a valid image URL for the company logo.');
  }

  if (foundedYear !== undefined && foundedYear !== null && foundedYear !== '') {
    const yearNum = Number(foundedYear);
    const currentYear = new Date().getFullYear();
    if (isNaN(yearNum) || yearNum < 1800 || yearNum > currentYear) {
      throw new Error(`Founded year must be a valid year between 1800 and ${currentYear}.`);
    }
  }

  const validSizes = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5001+', ''];
  if (companySize !== undefined && !validSizes.includes(companySize)) {
    throw new Error('Invalid company size selected.');
  }

  const validHiringStatuses = ['actively-hiring', 'selective', 'not-hiring'];
  if (hiringStatus !== undefined && !validHiringStatuses.includes(hiringStatus)) {
    throw new Error('Invalid hiring status selected.');
  }

  const payload = {
    owner: userId,
    companyName: isVerified ? company.companyName : (companyName ? companyName.trim() : company?.companyName || ''),
    website: isVerified ? company.website : (website ? website.trim() : company?.website || ''),
    email: isVerified ? company.email : (email ? email.trim().toLowerCase() : company?.email || ''),
    industry: isVerified ? company.industry : (industry ? industry.trim() : company?.industry || ''),
    companySize: isVerified ? company.companySize : (companySize !== undefined ? companySize : company?.companySize || ''),
    headquarters: isVerified ? company.headquarters : (headquarters ? headquarters.trim() : company?.headquarters || ''),
    logoUrl: logoUrl ? logoUrl.trim() : '',
    tagline: tagline ? tagline.trim() : '',
    description: description ? description.trim() : '',
    phone: phone ? phone.trim() : '',
    foundedYear: foundedYear ? Number(foundedYear) : null,
    hiringStatus: hiringStatus || 'actively-hiring',
    hiringCategories: sanitizeArray(hiringCategories),
    specialties: sanitizeArray(specialties),
    technologies: sanitizeArray(technologies),
  };

  if (company) {
    Object.assign(company, payload);
    await company.save();
  } else {
    company = await Company.create(payload);
  }

  return company;
};

export const getPublicCompanyProfile = async (companyIdOrOwnerId) => {
  if (!mongoose.Types.ObjectId.isValid(companyIdOrOwnerId)) {
    throw new Error('Invalid company ID format.');
  }

  let company = await Company.findById(companyIdOrOwnerId);
  if (!company) {
    company = await Company.findOne({ owner: companyIdOrOwnerId });
  }

  if (!company) {
    throw new Error('Company profile not found.');
  }

  return {
    id: company._id,
    companyName: company.companyName,
    logoUrl: company.logoUrl,
    tagline: company.tagline,
    description: company.description,
    website: company.website,
    industry: company.industry,
    companySize: company.companySize,
    foundedYear: company.foundedYear,
    headquarters: company.headquarters,
    hiringStatus: company.hiringStatus,
    hiringCategories: company.hiringCategories,
    specialties: company.specialties,
    technologies: company.technologies,
    verification: company.verification,
  };
};
