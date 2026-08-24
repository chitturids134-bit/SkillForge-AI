import Profile from '../models/Profile.js';
import User from '../models/User.js';

const ALLOWED_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

const normalizeSkillItem = (item) => {
  if (!item) return null;
  if (typeof item === 'string') {
    const name = item.trim();
    return name ? { name, level: 'Intermediate', category: 'Technical', yearsExperience: 1 } : null;
  }
  if (typeof item === 'object') {
    const rawName = item.name ?? item.skill ?? item.skillName ?? item.title ?? item.label;
    if (typeof rawName !== 'string') return null;
    const name = rawName.trim();
    if (!name) return null;
    const level = ALLOWED_LEVELS.includes(item.level) ? item.level : 'Intermediate';
    const category = item.category || 'Technical';
    const yearsExperience = typeof item.yearsExperience === 'number' ? item.yearsExperience : 1;
    return { ...item, name, level, category, yearsExperience };
  }
  return null;
};

export const normalizeSkillsArray = (skillsArray) => {
  if (!Array.isArray(skillsArray)) return [];
  return skillsArray.map(normalizeSkillItem).filter(Boolean);
};

export const calculateProfileCompletion = (profile) => {
  if (!profile) return 0;
  let score = 0;
  const weights = {
    fullName: 10,
    headline: 10,
    bio: 15,
    location: 10,
    phone: 5,
    college: 10,
    skills: 20,
    education: 5,
    experience: 5,
    projects: 10
  };

  if (profile.fullName && profile.fullName.trim()) score += weights.fullName;
  if (profile.headline && profile.headline.trim()) score += weights.headline;
  if (profile.bio && profile.bio.trim()) score += weights.bio;
  if (profile.location && profile.location.trim()) score += weights.location;
  if (profile.phone && profile.phone.trim()) score += weights.phone;
  if (profile.college && profile.college.trim()) score += weights.college;
  if (profile.skills && profile.skills.length > 0) score += weights.skills;
  if (profile.education && profile.education.length > 0) score += weights.education;
  if (profile.experience && profile.experience.length > 0) score += weights.experience;
  if (profile.projects && profile.projects.length > 0) score += weights.projects;

  return Math.min(100, score);
};

export const getProfileByUserId = async (userId) => {
  console.log(`[PROFILE SERVICE] Fetching profile for user: ${userId}`);
  let profile = await Profile.findOne({ user: userId }).populate('user', 'name email role');
  if (!profile) {
    console.log(`[PROFILE SERVICE] No profile found for ${userId}, creating new profile document.`);
    const user = await User.findById(userId);
    profile = await Profile.create({
      user: userId,
      fullName: user ? user.name : '',
      headline: '',
      bio: '',
      location: '',
      phone: '',
      college: '',
      degree: '',
      branch: '',
      skills: [],
      projects: [],
      certifications: [],
      education: [],
      experience: []
    });
    profile = await Profile.findById(profile._id).populate('user', 'name email role');
  }

  if (profile && profile.skills && profile.skills.length > 0) {
    const hasInvalid = profile.skills.some(s => !s.name || typeof s.name !== 'string' || !s.name.trim());
    if (hasInvalid) {
      profile.skills = normalizeSkillsArray(profile.skills);
      await profile.save();
    }
  }

  profile.profileCompletion = calculateProfileCompletion(profile);
  await profile.save();
  return profile;
};

export const updateProfileByUserId = async (userId, updateData) => {
  console.log(`[PROFILE SERVICE] Updating profile for user: ${userId}`);
  let profile = await Profile.findOne({ user: userId });
  if (!profile) {
    console.log(`[PROFILE SERVICE] Creating new profile document for update.`);
    profile = new Profile({ user: userId });
  }

  // Prevent protected / immutable system fields from being overwritten
  const { _id, user, role, password, verificationStatus, accountStatus, adminPrivileges, createdAt, updatedAt, __v, ...allowedData } = updateData || {};

  // Keep targetRole & interestedRole in sync
  if (allowedData.interestedRole && !allowedData.targetRole) {
    allowedData.targetRole = allowedData.interestedRole;
  } else if (allowedData.targetRole && !allowedData.interestedRole) {
    allowedData.interestedRole = allowedData.targetRole;
  }

  if ('skills' in allowedData) {
    allowedData.skills = normalizeSkillsArray(allowedData.skills);
  }

  // Safeguard profilePhoto against unintended erasure during text profile updates
  if ('profilePhoto' in allowedData && !allowedData.profilePhoto && profile.profilePhoto) {
    delete allowedData.profilePhoto;
  }
  console.log('[PROFILE SERVICE] Allowed Update Payload Keys:', Object.keys(allowedData));
  Object.assign(profile, allowedData);
  profile.profileCompletion = calculateProfileCompletion(profile);

  if (!profile.analytics) {
    profile.analytics = { views: 42, resumeDownloads: 18, searchAppearances: 85, lastUpdated: new Date() };
  } else {
    profile.analytics.lastUpdated = new Date();
  }

  const savedProfile = await profile.save();
  console.log(`[PROFILE SERVICE] UPDATE profile saved document ID: ${savedProfile._id}, name: '${savedProfile.fullName}', skills count: ${savedProfile.skills?.length}`);

  // Sync User.name if fullName is updated
  if (allowedData.fullName && allowedData.fullName.trim()) {
    await User.findByIdAndUpdate(userId, { name: allowedData.fullName.trim() }, { new: true });
  }

  return Profile.findById(savedProfile._id).populate('user', 'name email role');
};

export const uploadUserAvatar = async (userId, photoUrl) => {
  const profile = await getProfileByUserId(userId);
  
  // Cleanup old file if stored locally in uploads/avatars/
  if (profile.profilePhoto && profile.profilePhoto.startsWith('/uploads/avatars/')) {
    try {
      const fsModule = await import('fs');
      const pathModule = await import('path');
      const oldPath = pathModule.join(process.cwd(), profile.profilePhoto);
      if (fsModule.existsSync(oldPath)) {
        fsModule.unlinkSync(oldPath);
      }
    } catch (e) {
      console.warn('Could not remove old avatar file:', e.message);
    }
  }

  profile.profilePhoto = photoUrl;
  profile.profileCompletion = calculateProfileCompletion(profile);
  await profile.save();

  // Sync to User model document
  await User.findByIdAndUpdate(userId, { avatar: photoUrl, profilePhoto: photoUrl });

  return Profile.findById(profile._id).populate('user', 'name email role avatar profilePhoto');
};

export const deleteUserAvatar = async (userId) => {
  const profile = await getProfileByUserId(userId);

  if (profile.profilePhoto && profile.profilePhoto.startsWith('/uploads/avatars/')) {
    try {
      const fsModule = await import('fs');
      const pathModule = await import('path');
      const oldPath = pathModule.join(process.cwd(), profile.profilePhoto);
      if (fsModule.existsSync(oldPath)) {
        fsModule.unlinkSync(oldPath);
      }
    } catch (e) {
      console.warn('Could not remove avatar file on delete:', e.message);
    }
  }

  profile.profilePhoto = '';
  profile.profileCompletion = calculateProfileCompletion(profile);
  await profile.save();

  await User.findByIdAndUpdate(userId, { avatar: '', profilePhoto: '' });

  return Profile.findById(profile._id).populate('user', 'name email role avatar profilePhoto');
};

export const addProjectService = async (userId, projectData) => {
  const profile = await getProfileByUserId(userId);
  profile.projects.push(projectData);
  profile.profileCompletion = calculateProfileCompletion(profile);
  await profile.save();
  return profile;
};

export const updateProjectService = async (userId, projectId, projectData) => {
  const profile = await getProfileByUserId(userId);
  const project = profile.projects.id(projectId);
  if (!project) throw new Error('Project not found');

  Object.assign(project, projectData);
  await profile.save();
  return profile;
};

export const deleteProjectService = async (userId, projectId) => {
  const profile = await getProfileByUserId(userId);
  profile.projects.pull(projectId);
  profile.profileCompletion = calculateProfileCompletion(profile);
  await profile.save();
  return profile;
};

// ==================== CERTIFICATIONS CRUD ====================
export const addCertificationService = async (userId, certData) => {
  const profile = await getProfileByUserId(userId);
  profile.certifications.push(certData);
  await profile.save();
  return profile;
};

export const updateCertificationService = async (userId, certId, certData) => {
  const profile = await getProfileByUserId(userId);
  const cert = profile.certifications.id(certId);
  if (!cert) throw new Error('Certification not found');

  Object.assign(cert, certData);
  await profile.save();
  return profile;
};

export const deleteCertificationService = async (userId, certId) => {
  const profile = await getProfileByUserId(userId);
  profile.certifications.pull(certId);
  await profile.save();
  return profile;
};

// ==================== EDUCATION CRUD ====================
export const addEducationService = async (userId, eduData) => {
  const profile = await getProfileByUserId(userId);
  profile.education.push(eduData);
  profile.profileCompletion = calculateProfileCompletion(profile);
  await profile.save();
  return profile;
};

export const updateEducationService = async (userId, eduId, eduData) => {
  const profile = await getProfileByUserId(userId);
  const edu = profile.education.id(eduId);
  if (!edu) throw new Error('Education record not found');

  Object.assign(edu, eduData);
  await profile.save();
  return profile;
};

export const deleteEducationService = async (userId, eduId) => {
  const profile = await getProfileByUserId(userId);
  profile.education.pull(eduId);
  profile.profileCompletion = calculateProfileCompletion(profile);
  await profile.save();
  return profile;
};

// ==================== EXPERIENCE CRUD ====================
export const addExperienceService = async (userId, expData) => {
  const profile = await getProfileByUserId(userId);
  profile.experience.push(expData);
  profile.profileCompletion = calculateProfileCompletion(profile);
  await profile.save();
  return profile;
};

export const updateExperienceService = async (userId, expId, expData) => {
  const profile = await getProfileByUserId(userId);
  const exp = profile.experience.id(expId);
  if (!exp) throw new Error('Experience record not found');

  Object.assign(exp, expData);
  await profile.save();
  return profile;
};

export const deleteExperienceService = async (userId, expId) => {
  const profile = await getProfileByUserId(userId);
  profile.experience.pull(expId);
  profile.profileCompletion = calculateProfileCompletion(profile);
  await profile.save();
  return profile;
};

// ==================== SKILLS CRUD ====================
export const addSkillService = async (userId, skillData) => {
  const normalized = normalizeSkillItem(skillData);
  if (!normalized || !normalized.name) {
    throw new Error('Path `name` is required for skill.');
  }
  const profile = await getProfileByUserId(userId);
  profile.skills.push(normalized);
  profile.profileCompletion = calculateProfileCompletion(profile);
  await profile.save();
  return profile;
};

export const updateSkillService = async (userId, skillId, skillData) => {
  const normalized = normalizeSkillItem(skillData);
  if (!normalized || !normalized.name) {
    throw new Error('Path `name` is required for skill.');
  }
  const profile = await getProfileByUserId(userId);
  const skill = profile.skills.id(skillId);
  if (!skill) throw new Error('Skill not found');

  Object.assign(skill, normalized);
  await profile.save();
  return profile;
};

export const deleteSkillService = async (userId, skillId) => {
  const profile = await getProfileByUserId(userId);
  profile.skills.pull(skillId);
  profile.profileCompletion = calculateProfileCompletion(profile);
  await profile.save();
  return profile;
};
