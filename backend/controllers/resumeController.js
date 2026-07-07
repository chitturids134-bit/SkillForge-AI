import Resume from '../models/Resume.js';
import { analyzeResume } from '../services/atsService.js';

// @desc    Get current user resume
// @route   GET /api/resume/me
// @access  Private
export const getResumeMe = async (req, res) => {
  try {
    const resume = await Resume.findOne({ user: req.user.id });

    if (!resume) {
      return res.status(404).json({
        status: 'error',
        message: 'Resume not found',
      });
    }

    res.status(200).json({
      status: 'success',
      resume,
      atsAnalysis: analyzeResume(resume),
    });
  } catch (error) {
    console.error('GetResume Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Create resume
// @route   POST /api/resume
// @access  Private
export const createResume = async (req, res) => {
  try {
    // Check if resume already exists
    const resumeExists = await Resume.findOne({ user: req.user.id });
    if (resumeExists) {
      return res.status(400).json({
        status: 'error',
        message: 'Resume already exists for this user. Use PUT to update.',
      });
    }

    const { personalInfo, education, skills, projects, experience, certifications } = req.body;

    // Basic required validations
    if (!personalInfo || !personalInfo.fullName || !personalInfo.email || !personalInfo.phone) {
      return res.status(400).json({
        status: 'error',
        message: 'Personal info containing fullName, email, and phone is required',
      });
    }

    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'At least one skill is required',
      });
    }

    const resume = await Resume.create({
      user: req.user.id,
      personalInfo,
      education: education || [],
      skills,
      projects: projects || [],
      experience: experience || [],
      certifications: certifications || [],
    });

    res.status(201).json({
      status: 'success',
      resume,
      atsAnalysis: analyzeResume(resume),
    });
  } catch (error) {
    console.error('CreateResume Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Update current user resume
// @route   PUT /api/resume/me
// @access  Private
export const updateResumeMe = async (req, res) => {
  try {
    let resume = await Resume.findOne({ user: req.user.id });

    if (!resume) {
      return res.status(404).json({
        status: 'error',
        message: 'Resume not found to update. Use POST to create one first.',
      });
    }

    const { personalInfo, education, skills, projects, experience, certifications } = req.body;

    // Validate required fields
    if (!personalInfo || !personalInfo.fullName || !personalInfo.email || !personalInfo.phone) {
      return res.status(400).json({
        status: 'error',
        message: 'Personal info containing fullName, email, and phone is required',
      });
    }

    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'At least one skill is required',
      });
    }

    // Update fields
    resume.personalInfo = personalInfo;
    resume.education = education || [];
    resume.skills = skills;
    resume.projects = projects || [];
    resume.experience = experience || [];
    resume.certifications = certifications || [];

    const updatedResume = await resume.save();

    res.status(200).json({
      status: 'success',
      resume: updatedResume,
      atsAnalysis: analyzeResume(updatedResume),
    });
  } catch (error) {
    console.error('UpdateResume Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Delete current user resume
// @route   DELETE /api/resume/me
// @access  Private
export const deleteResumeMe = async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({ user: req.user.id });

    if (!resume) {
      return res.status(404).json({
        status: 'error',
        message: 'Resume not found to delete',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Resume deleted successfully',
    });
  } catch (error) {
    console.error('DeleteResume Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};
