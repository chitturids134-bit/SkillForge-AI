import express from 'express';
import { protect, authorize, requireVerifiedRecruiter } from '../middleware/authMiddleware.js';
import {
  getRecruiterDashboard,
  getRecruiterVerificationController,
  submitRecruiterVerificationController,
  getRecruiterJobsController,
  createRecruiterJobController,
  getRecruiterJobByIdController,
  updateRecruiterJobController,
  changeRecruiterJobStatusController,
  deleteRecruiterJobController,
  getRecruiterApplicationsController,
  getRecruiterApplicationByIdController,
  updateApplicationStageController,
  updateApplicationNotesController,
  getRecruiterAnalyticsController,
  searchCandidatesController,
  getSavedCandidatesController,
  saveCandidateController,
  unsaveCandidateController,
  getCandidateProfileController,
} from '../controllers/recruiterController.js';
import { recruiterDecisionController } from '../controllers/interviewController.js';
import {
  getCompanyProfileController,
  updateCompanyProfileController,
  getPublicCompanyProfileController,
} from '../controllers/companyController.js';
import {
  getRecruiterSettingsController,
  updateRecruiterSettingsController,
  updateRecruiterPreferencesController,
  updateRecruiterNotificationsController,
  updateRecruiterPrivacyController,
} from '../controllers/recruiterSettingsController.js';

const router = express.Router();

// Enforce base Recruiter authentication
router.use(protect);
router.use(authorize('Recruiter'));

// --- UNVERIFIED ACCESSIBLE ENDPOINTS ---
router.get('/verification', getRecruiterVerificationController);
router.post('/verification/submit', submitRecruiterVerificationController);
router.put('/verification/documents', submitRecruiterVerificationController);

// --- VERIFIED RECRUITER ONLY WORKSPACE ENDPOINTS ---
router.get('/dashboard', requireVerifiedRecruiter, getRecruiterDashboard);

// Analytics Studio API
router.get('/analytics', requireVerifiedRecruiter, getRecruiterAnalyticsController);

// Candidate Search API
router.get('/candidates', requireVerifiedRecruiter, searchCandidatesController);

// Saved Talent APIs
router.get('/saved-candidates', requireVerifiedRecruiter, getSavedCandidatesController);
router.post('/saved-candidates/:candidateId', requireVerifiedRecruiter, saveCandidateController);
router.delete('/saved-candidates/:candidateId', requireVerifiedRecruiter, unsaveCandidateController);
router.get('/candidates/:candidateId/profile', requireVerifiedRecruiter, getCandidateProfileController);


// Job Management Studio APIs
router.get('/jobs', requireVerifiedRecruiter, getRecruiterJobsController);
router.post('/jobs', requireVerifiedRecruiter, createRecruiterJobController);
router.get('/jobs/:id', requireVerifiedRecruiter, getRecruiterJobByIdController);
router.put('/jobs/:id', requireVerifiedRecruiter, updateRecruiterJobController);
router.patch('/jobs/:id/status', requireVerifiedRecruiter, changeRecruiterJobStatusController);
router.delete('/jobs/:id', requireVerifiedRecruiter, deleteRecruiterJobController);

// Candidate Applications Pipeline APIs
router.get('/applications', requireVerifiedRecruiter, getRecruiterApplicationsController);
router.get('/applications/:id', requireVerifiedRecruiter, getRecruiterApplicationByIdController);
router.patch('/applications/:id/stage', requireVerifiedRecruiter, updateApplicationStageController);
router.patch('/applications/:id/notes', requireVerifiedRecruiter, updateApplicationNotesController);

// Company Profile Workspace Management
router.get('/company', requireVerifiedRecruiter, getCompanyProfileController);
router.put('/company', requireVerifiedRecruiter, updateCompanyProfileController);
router.get('/company/public/:id', getPublicCompanyProfileController);

// Recruiter Settings
router.get('/settings', requireVerifiedRecruiter, getRecruiterSettingsController);
router.patch('/settings', requireVerifiedRecruiter, updateRecruiterSettingsController);
router.patch('/settings/preferences', requireVerifiedRecruiter, updateRecruiterPreferencesController);
router.patch('/settings/notifications', requireVerifiedRecruiter, updateRecruiterNotificationsController);
router.patch('/settings/privacy', requireVerifiedRecruiter, updateRecruiterPrivacyController);

export default router;

// Recruiter Hiring Decision Route
router.post('/interviews/:id/decision', requireVerifiedRecruiter, recruiterDecisionController);
