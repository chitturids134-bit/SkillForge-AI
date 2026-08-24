import {
  getResumeByUserId,
  updateResumeByUserId,
  deleteResumeByUserId,
  computeAtsScoreService,
  getResumeHistory as getResumeHistoryService,
  getResumeVersionById,
  restoreResumeVersion as restoreResumeVersionService,
  deleteResumeVersion as deleteResumeVersionService,
  compareResumeVersions as compareResumeVersionsService,
} from '../services/resumeService.js';
import { createNotification } from '../services/notificationService.js';

// @desc    Get user resume
// @route   GET /api/resume/me
// @access  Private
export const getResumeMe = async (req, res) => {
  try {
    const resume = await getResumeByUserId(req.user.id);
    res.status(200).json({
      status: 'success',
      resume,
    });
  } catch (error) {
    console.error('GetResume Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch resume',
    });
  }
};

// @desc    Create user resume
// @route   POST /api/resume
// @access  Private
export const createResume = async (req, res) => {
  try {
    const resume = await updateResumeByUserId(req.user.id, req.body, { source: 'manual-save' });
    res.status(201).json({
      status: 'success',
      message: 'Resume created successfully',
      resume,
    });
  } catch (error) {
    console.error('CreateResume Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to create resume',
    });
  }
};

// @desc    Update user resume
// @route   PUT /api/resume/me
// @access  Private
export const updateResumeMe = async (req, res) => {
  try {
    const resume = await updateResumeByUserId(req.user.id, req.body, { source: 'manual-save' });
    res.status(200).json({
      status: 'success',
      message: 'Resume saved and new version recorded',
      resume,
    });
  } catch (error) {
    console.error('UpdateResume Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to update resume',
    });
  }
};

// @desc    Delete user resume
// @route   DELETE /api/resume/me
// @access  Private
export const deleteResumeMe = async (req, res) => {
  try {
    await deleteResumeByUserId(req.user.id);
    res.status(200).json({
      status: 'success',
      message: 'Resume deleted successfully',
    });
  } catch (error) {
    console.error('DeleteResume Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to delete resume',
    });
  }
};

// @desc    Calculate ATS Score
// @route   POST /api/resume/ats-score
// @access  Private
export const calculateAtsScore = async (req, res) => {
  try {
    const atsResult = await computeAtsScoreService(req.body);

    createNotification({
      userId: req.user.id,
      type: 'RESUME_ANALYSIS',
      title: 'Resume Analysis Complete',
      message: 'Your resume analysis is ready. Check your ATS score and recommendations.',
      link: '/resume',
    }).catch(err => console.error('Error creating resume notification:', err));

    res.status(200).json({
      status: 'success',
      atsResult,
    });
  } catch (error) {
    console.error('ATS Score Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to calculate ATS score',
    });
  }
};

// @desc    Get Resume History
// @route   GET /api/resume/history
// @access  Private
export const getResumeHistory = async (req, res) => {
  try {
    const result = await getResumeHistoryService(req.user.id);
    res.status(200).json({
      status: 'success',
      success: true,
      history: result.versions,
      versions: result.versions,
      stats: result.stats,
    });
  } catch (error) {
    console.error('Resume History Error:', error);
    res.status(500).json({
      status: 'error',
      success: false,
      message: error.message || 'Failed to fetch resume history',
    });
  }
};

// @desc    Get Specific Resume Version
// @route   GET /api/resume/history/:versionId
// @access  Private
export const getResumeVersion = async (req, res) => {
  try {
    const version = await getResumeVersionById(req.user.id, req.params.versionId);
    res.status(200).json({
      status: 'success',
      success: true,
      version,
    });
  } catch (error) {
    console.error('Get Resume Version Error:', error);
    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({
      status: 'error',
      success: false,
      message: error.message || 'Failed to fetch version',
    });
  }
};

// @desc    Restore Specific Resume Version
// @route   POST /api/resume/history/:versionId/restore
// @access  Private
export const restoreResumeVersion = async (req, res) => {
  try {
    const updatedResume = await restoreResumeVersionService(req.user.id, req.params.versionId);
    res.status(200).json({
      status: 'success',
      success: true,
      message: 'Resume restored successfully and new restore snapshot recorded',
      resume: updatedResume,
    });
  } catch (error) {
    console.error('Restore Version Error:', error);
    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({
      status: 'error',
      success: false,
      message: error.message || 'Failed to restore version',
    });
  }
};

// @desc    Delete Specific Resume Version Snapshot
// @route   DELETE /api/resume/history/:versionId
// @access  Private
export const deleteResumeVersion = async (req, res) => {
  try {
    const result = await deleteResumeVersionService(req.user.id, req.params.versionId);
    res.status(200).json({
      status: 'success',
      success: true,
      message: 'Version snapshot deleted successfully',
      history: result.versions,
      stats: result.stats,
    });
  } catch (error) {
    console.error('Delete Version Error:', error);
    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({
      status: 'error',
      success: false,
      message: error.message || 'Failed to delete version',
    });
  }
};

// @desc    Compare Two Resume Versions
// @route   POST /api/resume/history/compare
// @access  Private
export const compareResumeVersions = async (req, res) => {
  try {
    const { versionAId, versionBId } = req.body;
    if (!versionAId || !versionBId) {
      return res.status(400).json({
        status: 'error',
        success: false,
        message: 'Please provide versionAId and versionBId to compare',
      });
    }

    const comparison = await compareResumeVersionsService(req.user.id, versionAId, versionBId);
    res.status(200).json({
      status: 'success',
      success: true,
      comparison,
    });
  } catch (error) {
    console.error('Compare Versions Error:', error);
    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({
      status: 'error',
      success: false,
      message: error.message || 'Failed to compare versions',
    });
  }
};

// @desc    Download Historical Resume Version JSON / Document
// @route   GET /api/resume/history/:versionId/download
// @access  Private
export const downloadResumeVersion = async (req, res) => {
  try {
    const version = await getResumeVersionById(req.user.id, req.params.versionId);
    const fileName = `SkillForge_Resume_V${version.versionNumber}_${Date.now()}.json`;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.status(200).send(JSON.stringify(version.resumeData || {}, null, 2));
  } catch (error) {
    console.error('Download Version Error:', error);
    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({
      status: 'error',
      success: false,
      message: error.message || 'Failed to download version',
    });
  }
};
