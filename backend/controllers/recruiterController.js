import SavedTalent from '../models/SavedTalent.js';
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import {
  getRecruiterDashboard as getDashboardData,
  getRecruiterVerificationStatus,
  submitRecruiterVerification,
} from '../services/recruiterService.js';

/**
 * @desc    Get recruiter dashboard data (metrics, funnel, recent applicants)
 * @route   GET /api/recruiter/dashboard
 * @access  Private — Recruiter only
 */
export const getRecruiterDashboard = async (req, res) => {
  try {
    const recruiterId = req.user._id;
    const data = await getDashboardData(recruiterId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Recruiter Dashboard Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to load recruiter dashboard',
    });
  }
};

/**
 * @desc    Get recruiter verification status & company details
 * @route   GET /api/recruiter/verification
 * @access  Private — Recruiter only
 */
export const getRecruiterVerificationController = async (req, res) => {
  try {
    const recruiterId = req.user._id;
    const data = await getRecruiterVerificationStatus(recruiterId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Get Recruiter Verification Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve recruiter verification status.',
    });
  }
};

/**
 * @desc    Submit or resubmit recruiter verification request for Admin review
 * @route   POST /api/recruiter/verification/submit
 * @access  Private — Recruiter only
 */
export const submitRecruiterVerificationController = async (req, res) => {
  try {
    const recruiterId = req.user._id;
    const data = await submitRecruiterVerification(recruiterId, req.body);

    return res.status(200).json({
      success: true,
      message: 'Verification request submitted successfully for Admin review.',
      data,
    });
  } catch (error) {
    console.error('Submit Recruiter Verification Error:', error.message);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to submit verification request.',
    });
  }
};


import {
  getRecruiterJobs as getJobsService,
  createRecruiterJob as createJobService,
  getRecruiterJobById as getJobByIdService,
  updateRecruiterJob as updateJobService,
  changeRecruiterJobStatus as changeJobStatusService,
  deleteRecruiterJob as deleteJobService,
} from '../services/recruiterService.js';

export const getRecruiterJobsController = async (req, res) => {
  try {
    const recruiterId = req.user._id;
    const data = await getJobsService(recruiterId, req.query);

    return res.status(200).json({
      success: true,
      data: data.jobs,
      metrics: data.metrics,
    });
  } catch (error) {
    console.error('Get Recruiter Jobs Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch job requisitions.',
    });
  }
};

export const createRecruiterJobController = async (req, res) => {
  try {
    const recruiterId = req.user._id;
    const job = await createJobService(recruiterId, req.body);

    return res.status(201).json({
      success: true,
      message: 'Job posting created successfully.',
      data: job,
    });
  } catch (error) {
    console.error('Create Recruiter Job Error:', error.message);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to create job posting.',
    });
  }
};

export const getRecruiterJobByIdController = async (req, res) => {
  try {
    const recruiterId = req.user._id;
    const { id } = req.params;
    const job = await getJobByIdService(recruiterId, id);

    return res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error('Get Job By Id Error:', error.message);
    const status = error.message.includes('not found') ? 404 : 400;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to fetch job details.',
    });
  }
};

export const updateRecruiterJobController = async (req, res) => {
  try {
    const recruiterId = req.user._id;
    const { id } = req.params;
    const job = await updateJobService(recruiterId, id, req.body);

    return res.status(200).json({
      success: true,
      message: 'Job posting updated successfully.',
      data: job,
    });
  } catch (error) {
    console.error('Update Recruiter Job Error:', error.message);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to update job posting.',
    });
  }
};

export const changeRecruiterJobStatusController = async (req, res) => {
  try {
    const recruiterId = req.user._id;
    const { id } = req.params;
    const { status } = req.body;
    const job = await changeJobStatusService(recruiterId, id, status);

    return res.status(200).json({
      success: true,
      message: `Job status updated to ${status} successfully.`,
      data: job,
    });
  } catch (error) {
    console.error('Change Job Status Error:', error.message);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to change job status.',
    });
  }
};

export const deleteRecruiterJobController = async (req, res) => {
  try {
    const recruiterId = req.user._id;
    const { id } = req.params;
    const result = await deleteJobService(recruiterId, id);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('Delete Recruiter Job Error:', error.message);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete job posting.',
    });
  }
};


import {
  getRecruiterApplications as getApplicationsService,
  getRecruiterApplicationById as getApplicationByIdService,
  updateApplicationStage as updateStageService,
  updateApplicationNotes as updateNotesService,
} from '../services/recruiterService.js';

export const getRecruiterApplicationsController = async (req, res) => {
  try {
    const recruiterId = req.user._id;
    const data = await getApplicationsService(recruiterId, req.query);

    return res.status(200).json({
      success: true,
      data: data.applications,
      metrics: data.metrics,
    });
  } catch (error) {
    console.error('Get Recruiter Applications Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch candidate applications.',
    });
  }
};

export const getRecruiterApplicationByIdController = async (req, res) => {
  try {
    const recruiterId = req.user._id;
    const { id } = req.params;
    const app = await getApplicationByIdService(recruiterId, id);

    return res.status(200).json({
      success: true,
      data: app,
    });
  } catch (error) {
    console.error('Get Application By Id Error:', error.message);
    const status = error.message.includes('not found') ? 404 : 400;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to fetch candidate application details.',
    });
  }
};

export const updateApplicationStageController = async (req, res) => {
  try {
    const recruiterId = req.user._id;
    const { id } = req.params;
    const updated = await updateStageService(recruiterId, id, req.body);

    return res.status(200).json({
      success: true,
      message: 'Candidate application stage updated successfully.',
      data: updated,
    });
  } catch (error) {
    console.error('Update Application Stage Error:', error.message);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to update application stage.',
    });
  }
};

export const updateApplicationNotesController = async (req, res) => {
  try {
    const recruiterId = req.user._id;
    const { id } = req.params;
    const { notes } = req.body;
    const updated = await updateNotesService(recruiterId, id, notes);

    return res.status(200).json({
      success: true,
      message: 'Application recruiter notes saved successfully.',
      data: updated,
    });
  } catch (error) {
    console.error('Update Application Notes Error:', error.message);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to save application notes.',
    });
  }
};


import {
  getRecruiterAnalytics as getAnalyticsService,
} from '../services/recruiterService.js';

export const getRecruiterAnalyticsController = async (req, res) => {
  try {
    const recruiterId = req.user._id;
    const analytics = await getAnalyticsService(recruiterId);

    return res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error('Get Recruiter Analytics Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to calculate recruitment analytics.',
    });
  }
};


export const searchCandidatesController = async (req, res) => {
  try {
    const recruiterId = req.user._id;
    const { q, skill, page = 1, limit = 20 } = req.query;

    const query = { role: { $regex: /^developer$/i } };
    if (q) {
      const sanitizedQ = String(q).trim();
      query.$or = [
        { name: { $regex: sanitizedQ, $options: 'i' } },
        { email: { $regex: sanitizedQ, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [devs, total] = await Promise.all([
      User.find(query).select('name email avatar createdAt').skip(skip).limit(parseInt(limit)).lean(),
      User.countDocuments(query)
    ]);

    const devIds = devs.map(d => d._id);
    const [profiles, savedTalents, allProfiles] = await Promise.all([
      Profile.find({ user: { $in: devIds } }).lean(),
      SavedTalent.find({ recruiter: recruiterId, candidate: { $in: devIds } }).lean(),
      Profile.find().select('skills').lean()
    ]);

    // Extract dynamic skills from all candidate profiles
    const skillSet = new Set();
    allProfiles.forEach(p => {
      if (Array.isArray(p.skills)) {
        p.skills.forEach(s => {
          const sName = typeof s === 'string' ? s : s?.name;
          if (sName && typeof sName === 'string') skillSet.add(sName.trim());
        });
      }
    });

    const savedMap = {};
    savedTalents.forEach(st => {
      savedMap[st.candidate.toString()] = true;
    });

    const profileMap = {};
    profiles.forEach(p => {
      profileMap[p.user.toString()] = p;
    });

    let candidates = devs.map(d => {
      const p = profileMap[d._id.toString()] || {};
      const skills = (p.skills || ['React', 'Node.js', 'JavaScript']).map(s => typeof s === 'string' ? s : s.name);
      return {
        id: d._id,
        _id: d._id,
        name: d.name,
        email: d.email,
        title: p.targetRole || p.title || 'Software Developer',
        location: p.location || 'Remote',
        skills: skills,
        bio: p.bio || '',
        experience: p.experience || [],
        education: p.education || [],
        isSaved: Boolean(savedMap[d._id.toString()]),
        createdAt: d.createdAt
      };
    });

    if (skill) {
      candidates = candidates.filter(c => c.skills.some(s => s.toLowerCase().includes(String(skill).toLowerCase())));
    }

    return res.json({
      success: true,
      data: candidates,
      availableSkills: Array.from(skillSet).sort(),
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Search Candidates Controller Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to search candidate database.' });
  }
};

export const getSavedCandidatesController = async (req, res) => {
  try {
    const recruiterId = req.user._id;
    const saved = await SavedTalent.find({ recruiter: recruiterId }).select('candidate savedAt').lean();
    return res.json({
      success: true,
      data: saved.map(s => s.candidate.toString())
    });
  } catch (err) {
    console.error('Get Saved Candidates Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch saved candidates.' });
  }
};

export const saveCandidateController = async (req, res) => {
  try {
    const recruiterId = req.user._id;
    const { candidateId } = req.params;

    if (!candidateId) {
      return res.status(400).json({ success: false, message: 'Candidate ID is required.' });
    }

    const candidateExists = await User.exists({ _id: candidateId, role: { $regex: /^developer$/i } });
    if (!candidateExists) {
      return res.status(404).json({ success: false, message: 'Developer candidate profile not found.' });
    }

    await SavedTalent.findOneAndUpdate(
      { recruiter: recruiterId, candidate: candidateId },
      { recruiter: recruiterId, candidate: candidateId, savedAt: new Date() },
      { upsert: true, new: true }
    );

    return res.json({ success: true, message: 'Candidate saved to talent bookmarks.', candidateId });
  } catch (err) {
    console.error('Save Candidate Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to save candidate.' });
  }
};

export const unsaveCandidateController = async (req, res) => {
  try {
    const recruiterId = req.user._id;
    const { candidateId } = req.params;

    if (!candidateId) {
      return res.status(400).json({ success: false, message: 'Candidate ID is required.' });
    }

    await SavedTalent.deleteOne({ recruiter: recruiterId, candidate: candidateId });
    return res.json({ success: true, message: 'Candidate removed from saved talent.', candidateId });
  } catch (err) {
    console.error('Unsave Candidate Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to remove candidate.' });
  }
};

export const getCandidateProfileController = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const userDoc = await User.findById(candidateId).select('name email avatar createdAt role').lean();
    if (!userDoc) {
      return res.status(404).json({ success: false, message: 'Candidate not found.' });
    }

    const profileDoc = await Profile.findOne({ user: candidateId }).lean();
    return res.json({
      success: true,
      data: {
        id: userDoc._id,
        _id: userDoc._id,
        name: userDoc.name,
        email: userDoc.email,
        title: profileDoc?.targetRole || profileDoc?.title || 'Software Developer',
        location: profileDoc?.location || 'Remote',
        bio: profileDoc?.bio || 'No bio provided.',
        skills: (profileDoc?.skills || []).map(s => typeof s === 'string' ? s : s.name),
        experience: profileDoc?.experience || [],
        education: profileDoc?.education || [],
        createdAt: userDoc.createdAt
      }
    });
  } catch (err) {
    console.error('Get Candidate Profile Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch candidate profile.' });
  }
};
