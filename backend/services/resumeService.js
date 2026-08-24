import Resume from '../models/Resume.js';
import { calculateATSScore } from './atsService.js';

/**
 * Deterministically generate human-readable change summary by comparing two versions
 */
export const generateChangeSummary = (previous, current) => {
  if (!previous || !previous.personalInfo) {
    return 'Initial resume version';
  }

  const changes = [];

  if (previous.templateId !== current.templateId) {
    changes.push('template style');
  }

  if (
    (previous.personalInfo?.summary || '') !== (current.personalInfo?.summary || '') ||
    (previous.personalInfo?.headline || '') !== (current.personalInfo?.headline || '') ||
    (previous.personalInfo?.fullName || '') !== (current.personalInfo?.fullName || '')
  ) {
    changes.push('personal info & summary');
  }

  const prevSkillsCount = (previous.skills || []).length;
  const currSkillsCount = (current.skills || []).length;
  if (prevSkillsCount !== currSkillsCount || JSON.stringify(previous.skills) !== JSON.stringify(current.skills)) {
    changes.push('skills');
  }

  const prevExpCount = (previous.experience || []).length;
  const currExpCount = (current.experience || []).length;
  if (prevExpCount !== currExpCount || JSON.stringify(previous.experience) !== JSON.stringify(current.experience)) {
    changes.push('work experience');
  }

  const prevEduCount = (previous.education || []).length;
  const currEduCount = (current.education || []).length;
  if (prevEduCount !== currEduCount || JSON.stringify(previous.education) !== JSON.stringify(current.education)) {
    changes.push('education');
  }

  const prevProjCount = (previous.projects || []).length;
  const currProjCount = (current.projects || []).length;
  if (prevProjCount !== currProjCount || JSON.stringify(previous.projects) !== JSON.stringify(current.projects)) {
    changes.push('projects');
  }

  const prevCertCount = (previous.certifications || []).length;
  const currCertCount = (current.certifications || []).length;
  if (prevCertCount !== currCertCount || JSON.stringify(previous.certifications) !== JSON.stringify(current.certifications)) {
    changes.push('certifications');
  }

  if (changes.length === 0) {
    return 'Saved resume updates';
  }

  if (changes.length === 1) {
    return `Updated ${changes[0]}`;
  }

  if (changes.length === 2) {
    return `Updated ${changes[0]} and ${changes[1]}`;
  }

  return `Updated ${changes.slice(0, -1).join(', ')} and ${changes[changes.length - 1]}`;
};

export const getResumeByUserId = async (userId) => {
  let resume = await Resume.findOne({ user: userId });
  if (!resume) {
    resume = await Resume.create({
      user: userId,
      personalInfo: { fullName: '', email: '', phone: '' },
      skills: ['JavaScript', 'React'],
      education: [],
      experience: [],
      projects: [],
      templateId: 'modern',
      atsScore: 78
    });
  }

  // Legacy Migration Check: Ensure versionHistory is initialized with V1 if empty
  if (!resume.versionHistory || resume.versionHistory.length === 0) {
    const atsResult = calculateATSScore(resume);
    resume.versionHistory = [{
      versionNumber: 1,
      title: 'Initial Resume Draft',
      template: resume.templateId || 'modern',
      savedAt: resume.createdAt || new Date(),
      atsScore: atsResult.score || resume.atsScore || 78,
      atsKeywords: resume.skills || [],
      changeSummary: 'Initial resume version',
      source: 'manual-save',
      resumeData: resume.toObject()
    }];
    await resume.save();
  }

  return resume;
};

export const updateResumeByUserId = async (userId, resumeData, options = {}) => {
  let resume = await Resume.findOne({ user: userId });
  const previousState = resume ? resume.toObject() : null;

  if (!resume) {
    resume = new Resume({ user: userId });
  }

  // Preserve existing versionHistory and document metadata
  const { versionHistory: _vh, _id: _docId, user: _uId, __v: _v, createdAt: _ca, updatedAt: _ua, ...cleanData } = resumeData || {};
  Object.assign(resume, cleanData);

  // Compute ATS score dynamically using atsService
  const atsResult = calculateATSScore(resume);
  resume.atsScore = atsResult.score;
  resume.atsFeedback = {
    overallScore: atsResult.score,
    formattingScore: atsResult.categories?.formatting || 85,
    keywordScore: atsResult.categories?.keywords || 80,
    contentScore: atsResult.categories?.content || 85,
    suggestions: atsResult.suggestions || []
  };

  // Generate deterministic change summary
  const summary = options.changeSummary || generateChangeSummary(previousState, resume.toObject());
  const source = options.source || 'manual-save';
  const title = options.title || (source === 'restored' ? options.changeSummary : `Version ${(resume.versionHistory.length || 0) + 1}`);

  // Calculate next version number
  const nextVersion = (resume.versionHistory.length || 0) + 1;

  // Add snapshot to versionHistory
  resume.versionHistory.push({
    versionNumber: nextVersion,
    title,
    template: resume.templateId || 'modern',
    savedAt: new Date(),
    atsScore: atsResult.score,
    atsKeywords: resume.skills || [],
    changeSummary: summary,
    source,
    resumeData: resume.toObject()
  });

  await resume.save();
  return resume;
};

export const deleteResumeByUserId = async (userId) => {
  return await Resume.findOneAndDelete({ user: userId });
};

export const computeAtsScoreService = async (resumeData) => {
  return calculateATSScore(resumeData);
};

export const getResumeHistory = async (userId) => {
  const resume = await getResumeByUserId(userId);
  const rawVersions = resume.versionHistory || [];

  // Sort newest first
  const versions = [...rawVersions].sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));

  const totalVersions = versions.length;
  const latestVersion = totalVersions > 0 ? `V${versions[0].versionNumber}` : 'N/A';
  const bestAtsScore = totalVersions > 0 ? Math.max(...versions.map(v => v.atsScore || 0)) : 0;
  const lastUpdated = totalVersions > 0 ? versions[0].savedAt : null;

  return {
    versions,
    stats: {
      totalVersions,
      latestVersion,
      bestAtsScore,
      lastUpdated,
    }
  };
};

export const getResumeVersionById = async (userId, versionId) => {
  const resume = await Resume.findOne({ user: userId });
  if (!resume) {
    throw new Error('Resume not found');
  }

  const version = resume.versionHistory.id(versionId);
  if (!version) {
    throw new Error('Resume version not found');
  }

  return version;
};

export const restoreResumeVersion = async (userId, versionId) => {
  const resume = await Resume.findOne({ user: userId });
  if (!resume) {
    throw new Error('Resume not found');
  }

  const targetVersion = resume.versionHistory.id(versionId);
  if (!targetVersion) {
    throw new Error('Resume version not found');
  }

  const restoredData = targetVersion.resumeData;
  if (!restoredData) {
    throw new Error('Invalid resume version data');
  }

  const restoreSummary = `Restored from V${targetVersion.versionNumber}`;

  return await updateResumeByUserId(userId, restoredData, {
    source: 'restored',
    changeSummary: restoreSummary,
    title: restoreSummary
  });
};

export const deleteResumeVersion = async (userId, versionId) => {
  const resume = await Resume.findOne({ user: userId });
  if (!resume) {
    throw new Error('Resume not found');
  }

  const version = resume.versionHistory.id(versionId);
  if (!version) {
    throw new Error('Resume version not found');
  }

  version.deleteOne();
  await resume.save();

  return await getResumeHistory(userId);
};

export const compareResumeVersions = async (userId, versionAId, versionBId) => {
  const versionA = await getResumeVersionById(userId, versionAId);
  const versionB = await getResumeVersionById(userId, versionBId);

  const dataA = versionA.resumeData || {};
  const dataB = versionB.resumeData || {};

  const changes = {
    personalInfo: [],
    summary: [],
    skills: { added: [], removed: [], unchanged: [] },
    experience: { added: [], removed: [], changed: [] },
    education: { added: [], removed: [], changed: [] },
    projects: { added: [], removed: [], changed: [] },
    certifications: { added: [], removed: [], changed: [] },
  };

  // Compare Headline & Summary
  if ((dataA.personalInfo?.headline || '') !== (dataB.personalInfo?.headline || '')) {
    changes.personalInfo.push({
      field: 'Headline',
      from: dataA.personalInfo?.headline || 'None',
      to: dataB.personalInfo?.headline || 'None'
    });
  }

  if ((dataA.personalInfo?.summary || '') !== (dataB.personalInfo?.summary || '')) {
    changes.summary.push({
      from: dataA.personalInfo?.summary || 'None',
      to: dataB.personalInfo?.summary || 'None'
    });
  }

  // Compare Skills
  const skillsA = new Set(dataA.skills || []);
  const skillsB = new Set(dataB.skills || []);

  skillsB.forEach(skill => {
    if (!skillsA.has(skill)) changes.skills.added.push(skill);
    else changes.skills.unchanged.push(skill);
  });

  skillsA.forEach(skill => {
    if (!skillsB.has(skill)) changes.skills.removed.push(skill);
  });

  // Compare Experience
  const expA = dataA.experience || [];
  const expB = dataB.experience || [];
  changes.experience = {
    countFrom: expA.length,
    countTo: expB.length,
    rolesA: expA.map(e => `${e.role} at ${e.company}`),
    rolesB: expB.map(e => `${e.role} at ${e.company}`)
  };

  // Compare Education
  const eduA = dataA.education || [];
  const eduB = dataB.education || [];
  changes.education = {
    countFrom: eduA.length,
    countTo: eduB.length,
    schoolsA: eduA.map(e => `${e.degree} - ${e.school}`),
    schoolsB: eduB.map(e => `${e.degree} - ${e.school}`)
  };

  // Compare Projects
  const projA = dataA.projects || [];
  const projB = dataB.projects || [];
  changes.projects = {
    countFrom: projA.length,
    countTo: projB.length,
    titlesA: projA.map(p => p.title),
    titlesB: projB.map(p => p.title)
  };

  return {
    versionA: {
      id: versionA._id,
      versionNumber: versionA.versionNumber,
      title: versionA.title,
      savedAt: versionA.savedAt,
      atsScore: versionA.atsScore
    },
    versionB: {
      id: versionB._id,
      versionNumber: versionB.versionNumber,
      title: versionB.title,
      savedAt: versionB.savedAt,
      atsScore: versionB.atsScore
    },
    changes
  };
};
