import User from '../models/User.js';
import Company from '../models/Company.js';

const sanitizeArray = (arr) => {
  if (!Array.isArray(arr)) return [];
  return [...new Set(arr.map((item) => (typeof item === 'string' ? item.trim() : '')).filter(Boolean))];
};

const DEFAULT_RECRUITER_SETTINGS = {
  recruiterTitle: 'Technical Recruiter',
  phone: '',
  hiringTypes: ['Full-time', 'Contract'],
  workModes: ['Remote', 'Hybrid'],
  experienceLevels: ['Mid', 'Senior'],
  hiringCategories: ['Software Engineering', 'AI & Machine Learning'],
  preferredSkills: ['React', 'Node.js', 'Python', 'MongoDB'],
  minimumMatchScore: 70,
  candidateDiscovery: {
    highlightHighMatch: true,
    prioritizeVerifiedSkills: true,
    prioritizeCompletedAssessments: true,
    prioritizeInterviewReadiness: true,
    showRecentlyActive: true,
    defaultSort: 'AI Match Score',
  },
  notifications: {
    newApplication: true,
    highMatchCandidate: true,
    interviewReminder: true,
    candidateStatusUpdate: true,
    candidateMessage: true,
    jobPerformance: true,
    weeklyHiringSummary: true,
    applicationDigest: false,
  },
  privacy: {
    profileVisibility: 'public',
    candidateContactVisibility: 'after-application',
    showInCandidateSearch: true,
    allowCandidateContact: true,
    showCompanyHiringActivity: true,
    showOnlineStatus: true,
  },
};

/**
 * Fetch recruiter settings combining user preferences & company snapshot
 */
export const getRecruiterSettingsService = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Ensure recruiter settings sub-objects are initialized
  if (!user.settings) user.settings = {};
  if (!user.settings.recruiterPreferences) {
    user.settings.recruiterPreferences = { ...DEFAULT_RECRUITER_SETTINGS };
    await user.save();
  }

  const rp = user.settings.recruiterPreferences || {};
  const company = await Company.findOne({ owner: userId }).select('companyName logoUrl website verification');

  return {
    account: {
      name: user.name,
      email: user.email,
      role: user.role,
      recruiterTitle: rp.recruiterTitle || DEFAULT_RECRUITER_SETTINGS.recruiterTitle,
      phone: rp.phone || '',
      createdAt: user.createdAt,
    },
    preferences: {
      hiringTypes: rp.hiringTypes && rp.hiringTypes.length > 0 ? rp.hiringTypes : DEFAULT_RECRUITER_SETTINGS.hiringTypes,
      workModes: rp.workModes && rp.workModes.length > 0 ? rp.workModes : DEFAULT_RECRUITER_SETTINGS.workModes,
      experienceLevels: rp.experienceLevels && rp.experienceLevels.length > 0 ? rp.experienceLevels : DEFAULT_RECRUITER_SETTINGS.experienceLevels,
      hiringCategories: rp.hiringCategories && rp.hiringCategories.length > 0 ? rp.hiringCategories : DEFAULT_RECRUITER_SETTINGS.hiringCategories,
      preferredSkills: rp.preferredSkills && rp.preferredSkills.length > 0 ? rp.preferredSkills : DEFAULT_RECRUITER_SETTINGS.preferredSkills,
      minimumMatchScore: rp.minimumMatchScore ?? DEFAULT_RECRUITER_SETTINGS.minimumMatchScore,
    },
    candidateDiscovery: {
      highlightHighMatch: rp.candidateDiscovery?.highlightHighMatch ?? DEFAULT_RECRUITER_SETTINGS.candidateDiscovery.highlightHighMatch,
      prioritizeVerifiedSkills: rp.candidateDiscovery?.prioritizeVerifiedSkills ?? DEFAULT_RECRUITER_SETTINGS.candidateDiscovery.prioritizeVerifiedSkills,
      prioritizeCompletedAssessments: rp.candidateDiscovery?.prioritizeCompletedAssessments ?? DEFAULT_RECRUITER_SETTINGS.candidateDiscovery.prioritizeCompletedAssessments,
      prioritizeInterviewReadiness: rp.candidateDiscovery?.prioritizeInterviewReadiness ?? DEFAULT_RECRUITER_SETTINGS.candidateDiscovery.prioritizeInterviewReadiness,
      showRecentlyActive: rp.candidateDiscovery?.showRecentlyActive ?? DEFAULT_RECRUITER_SETTINGS.candidateDiscovery.showRecentlyActive,
      defaultSort: rp.candidateDiscovery?.defaultSort || DEFAULT_RECRUITER_SETTINGS.candidateDiscovery.defaultSort,
    },
    notifications: {
      inApp: user.settings.notifications?.inApp ?? true,
      email: user.settings.notifications?.email ?? true,
      browser: true,
      newApplication: user.settings.notifications?.recruiter?.newApplication ?? DEFAULT_RECRUITER_SETTINGS.notifications.newApplication,
      highMatchCandidate: user.settings.notifications?.recruiter?.highMatchCandidate ?? DEFAULT_RECRUITER_SETTINGS.notifications.highMatchCandidate,
      interviewReminder: user.settings.notifications?.recruiter?.interviewReminder ?? DEFAULT_RECRUITER_SETTINGS.notifications.interviewReminder,
      candidateStatusUpdate: user.settings.notifications?.recruiter?.candidateStatusUpdate ?? DEFAULT_RECRUITER_SETTINGS.notifications.candidateStatusUpdate,
      candidateMessage: user.settings.notifications?.recruiter?.candidateMessage ?? DEFAULT_RECRUITER_SETTINGS.notifications.candidateMessage,
      jobPerformance: user.settings.notifications?.recruiter?.jobPerformance ?? DEFAULT_RECRUITER_SETTINGS.notifications.jobPerformance,
      weeklyHiringSummary: user.settings.notifications?.recruiter?.weeklyHiringSummary ?? DEFAULT_RECRUITER_SETTINGS.notifications.weeklyHiringSummary,
      applicationDigest: user.settings.notifications?.recruiter?.applicationDigest ?? DEFAULT_RECRUITER_SETTINGS.notifications.applicationDigest,
    },
    privacy: {
      profileVisibility: rp.privacy?.profileVisibility || DEFAULT_RECRUITER_SETTINGS.privacy.profileVisibility,
      candidateContactVisibility: rp.privacy?.candidateContactVisibility || DEFAULT_RECRUITER_SETTINGS.privacy.candidateContactVisibility,
      showInCandidateSearch: rp.privacy?.showInCandidateSearch ?? DEFAULT_RECRUITER_SETTINGS.privacy.showInCandidateSearch,
      allowCandidateContact: rp.privacy?.allowCandidateContact ?? DEFAULT_RECRUITER_SETTINGS.privacy.allowCandidateContact,
      showCompanyHiringActivity: rp.privacy?.showCompanyHiringActivity ?? DEFAULT_RECRUITER_SETTINGS.privacy.showCompanyHiringActivity,
      showOnlineStatus: rp.privacy?.showOnlineStatus ?? DEFAULT_RECRUITER_SETTINGS.privacy.showOnlineStatus,
    },
    company: {
      companyName: company?.companyName || 'My Company',
      website: company?.website || '',
      verificationStatus: company?.verification?.status || 'unverified',
    },
    theme: ['light', 'dark'].includes(user.settings?.theme) ? user.settings.theme : 'dark',
  };
};

/**
 * Update recruiter settings with strict field validation
 */
export const updateRecruiterSettingsService = async (userId, data = {}) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  if (!user.settings) user.settings = {};
  if (!user.settings.recruiterPreferences) user.settings.recruiterPreferences = {};
  if (!user.settings.notifications) user.settings.notifications = {};
  if (!user.settings.notifications.recruiter) user.settings.notifications.recruiter = {};

  const { account, preferences, candidateDiscovery, notifications, privacy, theme } = data;

  // 1. Account Updates (name, recruiterTitle, phone)
  if (account && typeof account === 'object') {
    if (account.name !== undefined) {
      if (!account.name || typeof account.name !== 'string' || account.name.trim().length < 2) {
        throw new Error('Name must be at least 2 characters long.');
      }
      user.name = account.name.trim();
    }
    if (account.recruiterTitle !== undefined) {
      user.settings.recruiterPreferences.recruiterTitle = String(account.recruiterTitle).trim();
    }
    if (account.phone !== undefined) {
      user.settings.recruiterPreferences.phone = String(account.phone).trim();
    }
  }

  // 2. Theme Update
  if (theme !== undefined) {
    if (!['light', 'dark'].includes(theme)) {
      throw new Error('Invalid theme option. Allowed values: light, dark');
    }
    user.settings.theme = theme;
  }

  // 3. Preferences Validation & Updates
  if (preferences && typeof preferences === 'object') {
    if (preferences.minimumMatchScore !== undefined) {
      const score = Number(preferences.minimumMatchScore);
      if (isNaN(score) || score < 50 || score > 90) {
        throw new Error('Minimum match score must be a number between 50 and 90.');
      }
      user.settings.recruiterPreferences.minimumMatchScore = score;
    }

    if (preferences.hiringTypes !== undefined) {
      const validHiringTypes = ['Full-time', 'Part-time', 'Contract', 'Internship'];
      const filtered = sanitizeArray(preferences.hiringTypes).filter((t) => validHiringTypes.includes(t));
      user.settings.recruiterPreferences.hiringTypes = filtered;
    }

    if (preferences.workModes !== undefined) {
      const validWorkModes = ['Remote', 'Hybrid', 'Onsite'];
      const filtered = sanitizeArray(preferences.workModes).filter((m) => validWorkModes.includes(m));
      user.settings.recruiterPreferences.workModes = filtered;
    }

    if (preferences.experienceLevels !== undefined) {
      const validExpLevels = ['Entry', 'Mid', 'Senior', 'Lead'];
      const filtered = sanitizeArray(preferences.experienceLevels).filter((l) => validExpLevels.includes(l));
      user.settings.recruiterPreferences.experienceLevels = filtered;
    }

    if (preferences.hiringCategories !== undefined) {
      user.settings.recruiterPreferences.hiringCategories = sanitizeArray(preferences.hiringCategories);
    }

    if (preferences.preferredSkills !== undefined) {
      user.settings.recruiterPreferences.preferredSkills = sanitizeArray(preferences.preferredSkills);
    }
  }

  // 4. Candidate Discovery Updates
  if (candidateDiscovery && typeof candidateDiscovery === 'object') {
    const cdKeys = ['highlightHighMatch', 'prioritizeVerifiedSkills', 'prioritizeCompletedAssessments', 'prioritizeInterviewReadiness', 'showRecentlyActive'];
    if (!user.settings.recruiterPreferences.candidateDiscovery) {
      user.settings.recruiterPreferences.candidateDiscovery = {};
    }
    for (const key of cdKeys) {
      if (candidateDiscovery[key] !== undefined) {
        user.settings.recruiterPreferences.candidateDiscovery[key] = Boolean(candidateDiscovery[key]);
      }
    }
    if (candidateDiscovery.defaultSort !== undefined) {
      const validSorts = ['AI Match Score', 'Most Recent', 'Experience', 'Assessment Score'];
      if (validSorts.includes(candidateDiscovery.defaultSort)) {
        user.settings.recruiterPreferences.candidateDiscovery.defaultSort = candidateDiscovery.defaultSort;
      }
    }
  }

  // 5. Notifications Updates
  if (notifications && typeof notifications === 'object') {
    if (notifications.inApp !== undefined) user.settings.notifications.inApp = Boolean(notifications.inApp);
    if (notifications.email !== undefined) user.settings.notifications.email = Boolean(notifications.email);

    const recKeys = ['newApplication', 'highMatchCandidate', 'interviewReminder', 'candidateStatusUpdate', 'candidateMessage', 'jobPerformance', 'weeklyHiringSummary', 'applicationDigest'];
    for (const key of recKeys) {
      if (notifications[key] !== undefined) {
        user.settings.notifications.recruiter[key] = Boolean(notifications[key]);
      }
    }
  }

  // 6. Privacy Updates
  if (privacy && typeof privacy === 'object') {
    if (!user.settings.recruiterPreferences.privacy) {
      user.settings.recruiterPreferences.privacy = {};
    }
    if (privacy.profileVisibility !== undefined) {
      if (!['public', 'limited', 'private'].includes(privacy.profileVisibility)) {
        throw new Error('Invalid profileVisibility. Allowed values: public, limited, private');
      }
      user.settings.recruiterPreferences.privacy.profileVisibility = privacy.profileVisibility;
    }
    if (privacy.candidateContactVisibility !== undefined) {
      if (!['full', 'after-application', 'after-shortlist'].includes(privacy.candidateContactVisibility)) {
        throw new Error('Invalid candidateContactVisibility. Allowed values: full, after-application, after-shortlist');
      }
      user.settings.recruiterPreferences.privacy.candidateContactVisibility = privacy.candidateContactVisibility;
    }
    const boolPrivacyKeys = ['showInCandidateSearch', 'allowCandidateContact', 'showCompanyHiringActivity', 'showOnlineStatus'];
    for (const key of boolPrivacyKeys) {
      if (privacy[key] !== undefined) {
        user.settings.recruiterPreferences.privacy[key] = Boolean(privacy[key]);
      }
    }
  }

  await user.save();
  return getRecruiterSettingsService(userId);
};
