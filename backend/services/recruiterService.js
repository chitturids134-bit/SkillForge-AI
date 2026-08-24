import mongoose from 'mongoose';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Company from '../models/Company.js';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';

export const calculateMatchScore = (candidateSkills = [], jobRequiredSkills = []) => {
  const normalize = (arr) => [...new Set(arr.map(s => (s || '').toLowerCase().trim()).filter(Boolean))];

  const setA = normalize(candidateSkills);
  const setB = normalize(jobRequiredSkills);

  if (setB.length === 0 || setA.length === 0) return 0;

  const union = new Set([...setA, ...setB]);
  const intersection = setA.filter(skill => setB.includes(skill));

  if (union.size === 0) return 0;
  return Math.round((intersection.length / union.size) * 100);
};

export const getDashboardMetrics = async (recruiterId) => {
  const [activeRequisitions, totalCandidatesScreened, scheduledInterviews, hiredApps] = await Promise.all([
    Job.countDocuments({ recruiter: recruiterId, status: 'active' }),
    Application.countDocuments({ recruiter: recruiterId, status: { $ne: 'applied' } }),
    Application.countDocuments({ recruiter: recruiterId, status: 'interview' }),
    Application.find({
      recruiter: recruiterId,
      status: 'hired',
      hiredAt: { $ne: null },
      appliedAt: { $ne: null },
    }).select('appliedAt hiredAt').lean(),
  ]);

  let averageTimeToHire = { days: 0, label: 'N/A' };

  if (hiredApps.length > 0) {
    const totalDays = hiredApps.reduce((sum, app) => {
      const diffMs = new Date(app.hiredAt) - new Date(app.appliedAt);
      return sum + Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    }, 0);

    const avgDays = Math.round(totalDays / hiredApps.length);
    averageTimeToHire = {
      days: avgDays,
      label: avgDays + ' Day' + (avgDays !== 1 ? 's' : ''),
    };
  }

  return {
    activeRequisitions,
    totalCandidatesScreened,
    scheduledInterviews,
    averageTimeToHire,
  };
};

export const getHiringFunnel = async (recruiterId) => {
  const pipeline = [
    { $match: { recruiter: recruiterId } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ];

  const results = await Application.aggregate(pipeline);

  const funnel = {
    applied: 0,
    screened: 0,
    shortlisted: 0,
    interview: 0,
    offer: 0,
    hired: 0,
    rejected: 0,
  };

  results.forEach((r) => {
    if (funnel.hasOwnProperty(r._id)) {
      funnel[r._id] = r.count;
    }
  });

  return funnel;
};

export const getRecentApplicants = async (recruiterId, limit = 5) => {
  const applications = await Application.find({ recruiter: recruiterId })
    .sort({ matchScore: -1, createdAt: -1 })
    .limit(limit)
    .populate('job', 'title')
    .lean();

  return applications.map((app) => ({
    id: app._id,
    candidateName: app.candidateName || 'Candidate',
    candidateEmail: app.candidateEmail || '',
    jobTitle: app.job?.title || 'Position',
    matchScore: app.matchScore !== null && app.matchScore !== undefined ? app.matchScore : 75,
    appliedAt: app.appliedAt || app.createdAt,
    status: app.status,
    skills: app.resumeSnapshot?.skills || [],
  }));
};

export const getUpcomingInterviews = async (recruiterId, limit = 5) => {
  const interviews = await Application.find({
    recruiter: recruiterId,
    status: 'interview',
  })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .populate('job', 'title')
    .lean();

  return interviews.map((item) => ({
    id: item._id,
    candidateName: item.candidateName || 'Candidate',
    jobTitle: item.job?.title || 'Technical Role',
    date: item.updatedAt || item.createdAt,
    type: 'Technical Screening',
    status: 'Scheduled',
  }));
};

export const getRecruiterDashboard = async (recruiterId) => {
  const [recruiterUser, company, metrics, funnel, recentApplicants, upcomingInterviews] = await Promise.all([
    User.findById(recruiterId).select('name email role').lean(),
    Company.findOne({ owner: recruiterId }).select('companyName verification').lean(),
    getDashboardMetrics(recruiterId),
    getHiringFunnel(recruiterId),
    getRecentApplicants(recruiterId, 5),
    getUpcomingInterviews(recruiterId, 5),
  ]);

  const verificationStatus = company?.verification?.status === 'verified'
    ? 'Verified Organization'
    : 'Verification Pending';

  return {
    recruiter: {
      name: recruiterUser?.name || 'Recruiter',
      email: recruiterUser?.email || '',
      companyName: company?.companyName || 'Organization',
      verificationStatus,
    },
    metrics,
    funnel,
    recentApplicants,
    upcomingInterviews,
  };
};

export const getRecruiterVerificationStatus = async (recruiterId) => {
  const [recruiterUser, company] = await Promise.all([
    User.findById(recruiterId).select('name email role createdAt').lean(),
    Company.findOne({ owner: recruiterId }).lean(),
  ]);

  const rawStatus = company?.verification?.status || 'unverified';
  let status = 'NOT_STARTED';
  if (rawStatus === 'pending') status = 'PENDING';
  else if (rawStatus === 'verified') status = 'APPROVED';
  else if (rawStatus === 'rejected') status = 'REJECTED';

  const companyInfo = {
    companyName: company?.companyName || '',
    email: company?.email || recruiterUser?.email || '',
    website: company?.website || '',
    industry: company?.industry || '',
    companySize: company?.companySize || '',
    headquarters: company?.headquarters || '',
    tagline: company?.tagline || '',
    description: company?.description || '',
    recruiterName: recruiterUser?.name || '',
    recruiterEmail: recruiterUser?.email || '',
  };

  const isProfileComplete = Boolean(
    companyInfo.companyName && companyInfo.email && companyInfo.website && companyInfo.industry
  );

  const defaultDocuments = [
    { key: 'business_registration', name: 'Business Registration / Certificate of Incorporation', required: true, status: company?.verification?.documents?.find(d => d.key === 'business_registration')?.status || (status === 'APPROVED' ? 'Approved' : (status === 'PENDING' ? 'Under Review' : 'Not Uploaded')), filename: company?.verification?.documents?.find(d => d.key === 'business_registration')?.filename || '' },
    { key: 'tax_id', name: 'Corporate Tax Identification (EIN / GSTIN / VAT)', required: true, status: company?.verification?.documents?.find(d => d.key === 'tax_id')?.status || (status === 'APPROVED' ? 'Approved' : (status === 'PENDING' ? 'Under Review' : 'Not Uploaded')), filename: company?.verification?.documents?.find(d => d.key === 'tax_id')?.filename || '' },
    { key: 'identity_proof', name: 'Recruiter Authorization / Official ID Proof', required: false, status: company?.verification?.documents?.find(d => d.key === 'identity_proof')?.status || (status === 'APPROVED' ? 'Approved' : (status === 'PENDING' ? 'Under Review' : 'Not Uploaded')), filename: company?.verification?.documents?.find(d => d.key === 'identity_proof')?.filename || '' },
  ];

  const timeline = [
    { stage: 'Company Profile', completed: isProfileComplete, date: company?.createdAt },
    { stage: 'Documents Submitted', completed: ['PENDING', 'APPROVED', 'REJECTED'].includes(status), date: company?.verification?.submittedAt || company?.updatedAt },
    { stage: 'Admin Review', completed: ['APPROVED', 'REJECTED'].includes(status), inProgress: status === 'PENDING', date: company?.verification?.reviewedAt || company?.verification?.verifiedAt },
    { stage: 'Verification Result', completed: status === 'APPROVED', rejected: status === 'REJECTED', date: company?.verification?.verifiedAt || company?.verification?.rejectedAt },
  ];

  const unlockedFeatures = [
    { key: 'post_jobs', label: 'Post Job Openings', enabled: true },
    { key: 'view_applications', label: 'Review Applications & Resumes', enabled: true },
    { key: 'candidate_search', label: 'Search Candidate Talent Pool', enabled: true },
    { key: 'schedule_interviews', label: 'Schedule AI Technical Screenings', enabled: true },
    { key: 'candidate_messaging', label: 'Direct Candidate Messaging', enabled: true },
  ];

  return {
    status,
    rawStatus,
    companyId: company?._id || null,
    company: companyInfo,
    isProfileComplete,
    documents: defaultDocuments,
    timeline,
    unlockedFeatures,
    rejectionReason: company?.verification?.rejectionReason || company?.rejectionReason || '',
    submittedAt: company?.verification?.submittedAt || company?.updatedAt || null,
    verifiedAt: company?.verification?.verifiedAt || null,
    rejectedAt: company?.verification?.rejectedAt || null,
  };
};

export const submitRecruiterVerification = async (recruiterId, payload = {}) => {
  const { companyName, email, website, industry, companySize, headquarters, documents = [] } = payload;

  if (!companyName || !email || !website) {
    throw new Error('Company Name, Email, and Website URL are required.');
  }

  let company = await Company.findOne({ owner: recruiterId });

  if (!company) {
    company = new Company({
      owner: recruiterId,
      companyName,
      email,
      website,
      industry: industry || 'Technology',
      companySize: companySize || '11-50',
      headquarters: headquarters || '',
    });
  } else {
    if (company.verification?.status === 'verified') {
      throw new Error('Your organization is already verified by Admin.');
    }

    company.companyName = companyName;
    company.email = email;
    company.website = website;
    if (industry) company.industry = industry;
    if (companySize) company.companySize = companySize;
    if (headquarters) company.headquarters = headquarters;
  }

  company.verification = {
    status: 'pending',
    submittedAt: new Date(),
    documents: documents.map(d => ({
      key: d.key,
      name: d.name,
      filename: d.filename || (d.key + '_doc.pdf'),
      status: 'Uploaded',
      uploadedAt: new Date(),
    })),
    rejectionReason: '',
  };

  await company.save();

  await ActivityLog.create({
    actor: recruiterId,
    actorRole: 'Recruiter',
    action: 'VERIFICATION_SUBMITTED',
    resourceType: 'Company',
    resourceId: company._id,
    description: 'Submitted recruiter verification for ' + company.companyName,
  });

  return getRecruiterVerificationStatus(recruiterId);
};


/**
 * Get all jobs owned by authenticated recruiter with real applicant counts.
 */
export const getRecruiterJobs = async (recruiterId, query = {}) => {
  const { search = '', status = '' } = query;

  const filter = { recruiter: recruiterId };

  if (status && status !== 'all') {
    filter.status = status;
  }

  if (search && search.trim() !== '') {
    const q = search.trim();
    filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { location: { $regex: q, $options: 'i' } },
      { requiredSkills: { $regex: q, $options: 'i' } },
    ];
  }

  const jobs = await Job.find(filter).sort({ createdAt: -1 }).lean();

  // Populate real dynamic applicant count for each job
  const jobsWithCount = await Promise.all(
    jobs.map(async (j) => {
      const realAppCount = await Application.countDocuments({ job: j._id });
      return {
        ...j,
        applicantCount: realAppCount,
      };
    })
  );

  const total = await Job.countDocuments({ recruiter: recruiterId });
  const activeCount = await Job.countDocuments({ recruiter: recruiterId, status: 'active' });
  const closedCount = await Job.countDocuments({ recruiter: recruiterId, status: 'closed' });

  return {
    jobs: jobsWithCount,
    metrics: {
      total,
      activeCount,
      closedCount,
    },
  };
};

/**
 * Create a new job requisition owned by authenticated recruiter.
 */
export const createRecruiterJob = async (recruiterId, data) => {
  const { title, description, location, workMode, type, experienceLevel, requiredSkills, salaryMin, salaryMax, requirements, responsibilities } = data;

  if (!title || !description || !location) {
    throw new Error('Job Title, Description, and Location are required.');
  }

  const skillsArr = Array.isArray(requiredSkills)
    ? requiredSkills
    : (requiredSkills || '').split(',').map((s) => s.trim()).filter(Boolean);

  if (skillsArr.length === 0) {
    throw new Error('At least one required skill must be provided.');
  }

  const minSal = Number(salaryMin) || 0;
  const maxSal = Number(salaryMax) || 0;

  if (minSal > 0 && maxSal > 0 && minSal > maxSal) {
    throw new Error('Minimum salary cannot exceed maximum salary.');
  }

  // Get recruiter's company name from profile or User
  const [recruiterUser, company] = await Promise.all([
    User.findById(recruiterId).select('name').lean(),
    Company.findOne({ owner: recruiterId }).select('companyName').lean(),
  ]);

  const companyName = company?.companyName || (recruiterUser?.name ? `${recruiterUser.name}'s Company` : 'Organization');

  const reqsArr = Array.isArray(requirements)
    ? requirements
    : (requirements || '').split('\n').map((r) => r.trim()).filter(Boolean);

  const newJob = await Job.create({
    recruiter: recruiterId,
    title: title.trim(),
    company: companyName,
    location: location.trim(),
    workMode: workMode || 'Remote',
    type: type || 'Full-time',
    experienceLevel: experienceLevel || 'Mid',
    description: description.trim(),
    requiredSkills: skillsArr,
    requirements: reqsArr,
    salaryRange: {
      min: minSal,
      max: maxSal,
      currency: 'INR',
    },
    status: 'active',
    applicantCount: 0,
  });

  await ActivityLog.create({
    actor: recruiterId,
    actorRole: 'Recruiter',
    action: 'JOB_CREATED',
    resourceType: 'Job',
    resourceId: newJob._id,
    description: `Created job posting: ${newJob.title}`,
  });

  return newJob;
};

/**
 * Get a specific job owned by authenticated recruiter.
 */
export const getRecruiterJobById = async (recruiterId, jobId) => {
  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new Error('Invalid Job ID format.');
  }

  const job = await Job.findOne({ _id: jobId, recruiter: recruiterId }).lean();
  if (!job) {
    throw new Error('Job requisition not found or unauthorized.');
  }

  const realAppCount = await Application.countDocuments({ job: jobId });
  return {
    ...job,
    applicantCount: realAppCount,
  };
};

/**
 * Update an existing job owned by authenticated recruiter.
 */
export const updateRecruiterJob = async (recruiterId, jobId, data) => {
  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new Error('Invalid Job ID format.');
  }

  const job = await Job.findOne({ _id: jobId, recruiter: recruiterId });
  if (!job) {
    throw new Error('Job requisition not found or unauthorized.');
  }

  const { title, description, location, workMode, type, experienceLevel, requiredSkills, salaryMin, salaryMax, requirements } = data;

  if (title) job.title = title.trim();
  if (description) job.description = description.trim();
  if (location) job.location = location.trim();
  if (workMode) job.workMode = workMode;
  if (type) job.type = type;
  if (experienceLevel) job.experienceLevel = experienceLevel;

  if (requiredSkills !== undefined) {
    const skillsArr = Array.isArray(requiredSkills)
      ? requiredSkills
      : (requiredSkills || '').split(',').map((s) => s.trim()).filter(Boolean);
    job.requiredSkills = skillsArr;
  }

  if (requirements !== undefined) {
    const reqsArr = Array.isArray(requirements)
      ? requirements
      : (requirements || '').split('\n').map((r) => r.trim()).filter(Boolean);
    job.requirements = reqsArr;
  }

  if (salaryMin !== undefined || salaryMax !== undefined) {
    const minSal = salaryMin !== undefined ? Number(salaryMin) : job.salaryRange.min;
    const maxSal = salaryMax !== undefined ? Number(salaryMax) : job.salaryRange.max;
    if (minSal > 0 && maxSal > 0 && minSal > maxSal) {
      throw new Error('Minimum salary cannot exceed maximum salary.');
    }
    job.salaryRange.min = minSal;
    job.salaryRange.max = maxSal;
  }

  await job.save();

  await ActivityLog.create({
    actor: recruiterId,
    actorRole: 'Recruiter',
    action: 'JOB_UPDATED',
    resourceType: 'Job',
    resourceId: job._id,
    description: `Updated job posting: ${job.title}`,
  });

  return job;
};

/**
 * Change status of a job owned by authenticated recruiter (active / closed / paused).
 */
export const changeRecruiterJobStatus = async (recruiterId, jobId, status) => {
  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new Error('Invalid Job ID format.');
  }

  if (!['active', 'closed', 'paused'].includes(status)) {
    throw new Error('Invalid job status. Supported values: active, closed, paused.');
  }

  const job = await Job.findOne({ _id: jobId, recruiter: recruiterId });
  if (!job) {
    throw new Error('Job requisition not found or unauthorized.');
  }

  job.status = status;
  await job.save();

  await ActivityLog.create({
    actor: recruiterId,
    actorRole: 'Recruiter',
    action: `JOB_${status.toUpperCase()}`,
    resourceType: 'Job',
    resourceId: job._id,
    description: `Changed job status to ${status} for ${job.title}`,
  });

  return job;
};

/**
 * Delete a job owned by authenticated recruiter (only if 0 applications exist).
 */
export const deleteRecruiterJob = async (recruiterId, jobId) => {
  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new Error('Invalid Job ID format.');
  }

  const job = await Job.findOne({ _id: jobId, recruiter: recruiterId });
  if (!job) {
    throw new Error('Job requisition not found or unauthorized.');
  }

  const appCount = await Application.countDocuments({ job: jobId });
  if (appCount > 0) {
    throw new Error(`Cannot delete job with ${appCount} candidate application(s). Please close the job instead to preserve hiring history.`);
  }

  await Job.deleteOne({ _id: jobId });

  await ActivityLog.create({
    actor: recruiterId,
    actorRole: 'Recruiter',
    action: 'JOB_DELETED',
    resourceType: 'Job',
    resourceId: jobId,
    description: `Deleted job posting: ${job.title}`,
  });

  return { success: true, message: 'Job posting deleted successfully.' };
};


/**
 * Get all applications for jobs owned by authenticated recruiter.
 */
export const getRecruiterApplications = async (recruiterId, query = {}) => {
  const { stage = '', search = '', jobId = '' } = query;

  const filter = { recruiter: recruiterId };

  if (stage && stage !== 'all') {
    filter.status = stage.toLowerCase();
  }

  if (jobId && mongoose.Types.ObjectId.isValid(jobId)) {
    filter.job = jobId;
  }

  let applications = await Application.find(filter)
    .sort({ createdAt: -1 })
    .populate('job', 'title location type workMode')
    .populate('candidate', 'name email profile photo')
    .lean();

  if (search && search.trim() !== '') {
    const q = search.trim().toLowerCase();
    applications = applications.filter((app) => {
      const candName = (app.candidateName || app.candidate?.name || '').toLowerCase();
      const candEmail = (app.candidateEmail || app.candidate?.email || '').toLowerCase();
      const jobTitle = (app.job?.title || '').toLowerCase();
      return candName.includes(q) || candEmail.includes(q) || jobTitle.includes(q);
    });
  }

  // Calculate metrics across all recruiter applications
  const allApps = await Application.find({ recruiter: recruiterId }).select('status').lean();

  const metrics = {
    total: allApps.length,
    applied: allApps.filter(a => a.status === 'applied').length,
    screened: allApps.filter(a => a.status === 'screened').length,
    shortlisted: allApps.filter(a => a.status === 'shortlisted').length,
    interview: allApps.filter(a => a.status === 'interview').length,
    offer: allApps.filter(a => a.status === 'offer').length,
    hired: allApps.filter(a => a.status === 'hired').length,
    rejected: allApps.filter(a => a.status === 'rejected').length,
  };

  return {
    applications,
    metrics,
  };
};

/**
 * Get specific application by ID owned by authenticated recruiter.
 */
export const getRecruiterApplicationById = async (recruiterId, appId) => {
  if (!mongoose.Types.ObjectId.isValid(appId)) {
    throw new Error('Invalid Application ID format.');
  }

  const app = await Application.findOne({ _id: appId, recruiter: recruiterId })
    .populate('job', 'title location type workMode company description requirements requiredSkills')
    .populate('candidate', 'name email profile photo')
    .lean();

  if (!app) {
    throw new Error('Candidate application not found or unauthorized.');
  }

  return app;
};

/**
 * Update application pipeline stage (applied, screened, shortlisted, interview, offer, hired, rejected).
 */
export const updateApplicationStage = async (recruiterId, appId, data = {}) => {
  const { stage, notes, rejectionReason } = data;

  if (!mongoose.Types.ObjectId.isValid(appId)) {
    throw new Error('Invalid Application ID format.');
  }

  const validStages = ['applied', 'screened', 'shortlisted', 'interview', 'offer', 'hired', 'rejected'];
  const normalizedStage = (stage || '').toLowerCase().trim();

  if (!validStages.includes(normalizedStage)) {
    throw new Error('Invalid pipeline stage. Supported values: Applied, Screened, Shortlisted, Interview, Offer, Hired, Rejected.');
  }

  const app = await Application.findOne({ _id: appId, recruiter: recruiterId });
  if (!app) {
    throw new Error('Candidate application not found or unauthorized.');
  }

  app.status = normalizedStage;

  if (normalizedStage === 'screened' && !app.screenedAt) {
    app.screenedAt = new Date();
  } else if (normalizedStage === 'hired' && !app.hiredAt) {
    app.hiredAt = new Date();
  }

  if (notes !== undefined) {
    app.notes = notes.trim();
  }

  await app.save();

  await ActivityLog.create({
    actor: recruiterId,
    actorRole: 'Recruiter',
    action: `APPLICATION_STAGE_${normalizedStage.toUpperCase()}`,
    resourceType: 'Application',
    resourceId: app._id,
    description: `Moved candidate ${app.candidateName || 'Applicant'} to ${normalizedStage}`,
  });

  return getRecruiterApplicationById(recruiterId, appId);
};

/**
 * Update recruiter private notes on an application.
 */
export const updateApplicationNotes = async (recruiterId, appId, notes = '') => {
  if (!mongoose.Types.ObjectId.isValid(appId)) {
    throw new Error('Invalid Application ID format.');
  }

  const app = await Application.findOne({ _id: appId, recruiter: recruiterId });
  if (!app) {
    throw new Error('Candidate application not found or unauthorized.');
  }

  app.notes = (notes || '').trim();
  await app.save();

  return getRecruiterApplicationById(recruiterId, appId);
};


/**
 * Fetch end-to-end recruitment analytics for authenticated recruiter.
 */
export const getRecruiterAnalytics = async (recruiterId) => {
  // Fetch recruiter's jobs
  const jobs = await Job.find({ recruiter: recruiterId }).lean();
  const jobIds = jobs.map((j) => j._id);

  // Fetch recruiter's candidate applications
  const applications = await Application.find({ recruiter: recruiterId })
    .populate('job', 'title location workMode')
    .sort({ createdAt: -1 })
    .lean();

  // Calculate top KPI metrics
  const activeJobs = jobs.filter((j) => j.status === 'active');
  const totalApps = applications.length;

  const pipeline = {
    applied: applications.filter((a) => a.status === 'applied').length,
    screened: applications.filter((a) => a.status === 'screened').length,
    shortlisted: applications.filter((a) => a.status === 'shortlisted').length,
    interview: applications.filter((a) => a.status === 'interview').length,
    offer: applications.filter((a) => a.status === 'offer').length,
    hired: applications.filter((a) => a.status === 'hired').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  };

  const screenedCount = totalApps - pipeline.applied;
  const offerCount = pipeline.offer + pipeline.hired;
  const offerAcceptanceRate = offerCount > 0 ? `${Math.round((pipeline.hired / offerCount) * 100)}%` : 'N/A';

  // Funnel Conversions
  const funnel = {
    appliedToScreened: totalApps > 0 ? Math.round((screenedCount / totalApps) * 100) : 0,
    screenedToShortlisted: screenedCount > 0 ? Math.round((pipeline.shortlisted / screenedCount) * 100) : 0,
    shortlistedToInterview: pipeline.shortlisted > 0 ? Math.round((pipeline.interview / pipeline.shortlisted) * 100) : 0,
    interviewToOffer: pipeline.interview > 0 ? Math.round((offerCount / pipeline.interview) * 100) : 0,
    offerToHired: offerCount > 0 ? Math.round((pipeline.hired / offerCount) * 100) : 0,
  };

  // Job Performance Breakdown
  const jobPerformance = jobs.map((job) => {
    const jobApps = applications.filter((a) => a.job && a.job._id.toString() === job._id.toString());
    return {
      id: job._id,
      title: job.title,
      location: job.location,
      workMode: job.workMode,
      status: job.status,
      applications: jobApps.length,
      shortlisted: jobApps.filter((a) => a.status === 'shortlisted').length,
      interview: jobApps.filter((a) => a.status === 'interview').length,
      hired: jobApps.filter((a) => a.status === 'hired').length,
    };
  }).sort((a, b) => b.applications - a.applications);

  // Interview Analytics
  const interviews = {
    total: pipeline.interview,
    upcoming: pipeline.interview,
    completed: pipeline.offer + pipeline.hired,
    cancelled: 0,
    conversionRate: pipeline.interview > 0 ? `${Math.round((offerCount / pipeline.interview) * 100)}%` : 'N/A',
  };

  // Recent Activity Feed
  const recentActivity = applications.slice(0, 6).map((app) => ({
    id: app._id,
    candidateName: app.candidateName || 'Candidate',
    jobTitle: app.job?.title || 'Position',
    stage: app.status || 'applied',
    timestamp: app.updatedAt || app.createdAt,
  }));

  // Dynamic Data-Driven Insights
  const insights = [];
  if (jobPerformance.length > 0 && jobPerformance[0].applications > 0) {
    insights.push(`Your "${jobPerformance[0].title}" job requisition has the highest candidate application volume (${jobPerformance[0].applications} applicants).`);
  }

  if (pipeline.applied > 0) {
    insights.push(`You have ${pipeline.applied} new candidate application(s) awaiting initial screening.`);
  }

  if (pipeline.interview > 0) {
    insights.push(`${pipeline.interview} candidate(s) are currently in the active technical interview stage.`);
  }

  if (pipeline.hired > 0) {
    insights.push(`Congratulations! You have successfully hired ${pipeline.hired} engineer(s) through SkillForge AI.`);
  }

  if (insights.length === 0) {
    insights.push('Post job requisitions and review incoming candidates to start generating real-time hiring insights.');
  }

  return {
    metrics: {
      activeRequisitions: activeJobs.length,
      totalApplications: totalApps,
      totalCandidatesScreened: screenedCount,
      interviewsScheduled: pipeline.interview,
      offerAcceptanceRate,
      candidatesHired: pipeline.hired,
    },
    pipeline,
    funnel,
    jobPerformance,
    interviews,
    recentActivity,
    insights,
  };
};
