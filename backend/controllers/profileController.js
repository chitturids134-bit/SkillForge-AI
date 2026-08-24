import path from 'path';
import {
  getProfileByUserId,
  updateProfileByUserId,
  uploadUserAvatar,
  deleteUserAvatar,
  addProjectService,
  updateProjectService,
  deleteProjectService,
  addCertificationService,
  updateCertificationService,
  deleteCertificationService,
  addEducationService,
  updateEducationService,
  deleteEducationService,
  addExperienceService,
  updateExperienceService,
  deleteExperienceService,
  addSkillService,
  updateSkillService,
  deleteSkillService,
} from '../services/profileService.js';
import Profile from '../models/Profile.js';
import User from '../models/User.js';
import { createNotification } from '../services/notificationService.js';

// @desc    Get current user's profile
// @route   GET /api/profile/me
// @access  Private
export const getProfileMe = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
        const profile = await getProfileByUserId(userId);
    res.status(200).json({
      success: true,
      status: 'success',
      profile,
    });
  } catch (error) {
    console.error('GetProfileMe Error:', error);
    res.status(500).json({
      success: false,
      status: 'error',
      message: error.message || 'Failed to fetch user profile',
    });
  }
};

// @desc    Create or initialize profile
// @route   POST /api/profile
// @access  Private
export const createProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const profile = await updateProfileByUserId(userId, req.body);
    res.status(201).json({
      success: true,
      status: 'success',
      message: 'Profile created successfully!',
      profile,
    });
  } catch (error) {
    console.error('CreateProfile Error:', error);
    res.status(400).json({
      success: false,
      status: 'error',
      message: error.message || 'Failed to create profile',
    });
  }
};

// @desc    Update authenticated user profile
// @route   PUT /api/profile/me
// @access  Private
export const updateProfileMe = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        status: 'error',
        message: 'Unauthenticated user.',
      });
    }

    const profile = await updateProfileByUserId(userId, req.body);

    createNotification({
      userId,
      type: 'PROFILE_UPDATE',
      title: 'Profile Updated',
      message: 'Your profile details have been saved successfully.',
      link: '/profile',
    }).catch(err => console.error('Error creating profile notification:', err));

    res.status(200).json({
      success: true,
      status: 'success',
      message: 'Profile updated successfully!',
      profile,
    });
  } catch (error) {
    console.error('UpdateProfileMe Error:', error);
    res.status(400).json({
      success: false,
      status: 'error',
      message: error.message || 'Failed to update profile',
    });
  }
};

// @desc    Upload user avatar (Multipart file or Base64 Image)
// @route   POST /api/profile/avatar
// @access  Private
export const uploadAvatar = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    let photoUrl = '';

    if (req.file) {
      photoUrl = `/uploads/avatars/${req.file.filename}`;
    } else {
      const rawData = (req.body && (req.body.photoUrl || req.body.avatar || req.body.image)) ? (req.body.photoUrl || req.body.avatar || req.body.image) : '';
      
      if (!rawData) {
        return res.status(400).json({
          success: false,
          status: 'error',
          message: 'No image file uploaded or base64/photoUrl provided',
        });
      }

      if (rawData.startsWith('data:image/')) {
        // Base64 Data URI upload -> Save to disk as real physical file
        const matches = rawData.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
        if (!matches) {
          return res.status(400).json({
            success: false,
            status: 'error',
            message: 'Invalid base64 image data URI format',
          });
        }

        const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
        const allowedExts = ['png', 'jpg', 'jpeg', 'webp'];
        if (!allowedExts.includes(ext.toLowerCase())) {
          return res.status(400).json({
            success: false,
            status: 'error',
            message: 'Invalid image format. Allowed formats: PNG, JPG, JPEG, WEBP.',
          });
        }

        const imageBuffer = Buffer.from(matches[2], 'base64');
        if (imageBuffer.length > 5 * 1024 * 1024) {
          return res.status(400).json({
            success: false,
            status: 'error',
            message: 'Maximum image size allowed is 5 MB.',
          });
        }

        const filename = `avatar-${userId}-${Date.now()}.${ext}`;
        const uploadsDir = path.join(process.cwd(), 'uploads', 'avatars');
        
        const fsModule = await import('fs');
        if (!fsModule.existsSync(uploadsDir)) {
          fsModule.mkdirSync(uploadsDir, { recursive: true });
        }

        const filePath = path.join(uploadsDir, filename);
        fsModule.writeFileSync(filePath, imageBuffer);
        photoUrl = `/uploads/avatars/${filename}`;
      } else if (rawData.startsWith('/uploads/avatars/')) {
        photoUrl = rawData;
      } else {
        return res.status(400).json({
          success: false,
          status: 'error',
          message: 'Invalid avatar input format',
        });
      }
    }

    const profile = await uploadUserAvatar(userId, photoUrl);

    res.status(200).json({
      success: true,
      status: 'success',
      message: 'Avatar uploaded successfully!',
      profilePhoto: photoUrl,
      profile,
    });
  } catch (error) {
    console.error('UploadAvatar Error:', error);
    res.status(400).json({
      success: false,
      status: 'error',
      message: error.message || 'Failed to upload avatar',
    });
  }
};

// @desc    Delete user avatar
// @route   DELETE /api/profile/avatar
// @access  Private
export const deleteAvatar = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const profile = await deleteUserAvatar(userId);
    res.status(200).json({
      success: true,
      status: 'success',
      message: 'Avatar deleted successfully.',
      profile,
    });
  } catch (error) {
    console.error('DeleteAvatar Error:', error);
    res.status(500).json({
      success: false,
      status: 'error',
      message: error.message || 'Failed to delete avatar',
    });
  }
};

// CRUD for Projects, Certifications, Education, Experience, Skills
export const addProject = async (req, res) => {
  try {
    const profile = await addProjectService(req.user.id || req.user._id, req.body);
    res.status(201).json({ success: true, status: 'success', profile });
  } catch (error) {
    res.status(400).json({ success: false, status: 'error', message: error.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const profile = await updateProjectService(req.user.id || req.user._id, req.params.id, req.body);
    res.status(200).json({ success: true, status: 'success', profile });
  } catch (error) {
    res.status(400).json({ success: false, status: 'error', message: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const profile = await deleteProjectService(req.user.id || req.user._id, req.params.id);
    res.status(200).json({ success: true, status: 'success', profile });
  } catch (error) {
    res.status(400).json({ success: false, status: 'error', message: error.message });
  }
};

export const addCertification = async (req, res) => {
  try {
    const profile = await addCertificationService(req.user.id || req.user._id, req.body);
    res.status(201).json({ success: true, status: 'success', profile });
  } catch (error) {
    res.status(400).json({ success: false, status: 'error', message: error.message });
  }
};

export const updateCertification = async (req, res) => {
  try {
    const profile = await updateCertificationService(req.user.id || req.user._id, req.params.id, req.body);
    res.status(200).json({ success: true, status: 'success', profile });
  } catch (error) {
    res.status(400).json({ success: false, status: 'error', message: error.message });
  }
};

export const deleteCertification = async (req, res) => {
  try {
    const profile = await deleteCertificationService(req.user.id || req.user._id, req.params.id);
    res.status(200).json({ success: true, status: 'success', profile });
  } catch (error) {
    res.status(400).json({ success: false, status: 'error', message: error.message });
  }
};

export const addEducation = async (req, res) => {
  try {
    const profile = await addEducationService(req.user.id || req.user._id, req.body);
    res.status(201).json({ success: true, status: 'success', profile });
  } catch (error) {
    res.status(400).json({ success: false, status: 'error', message: error.message });
  }
};

export const updateEducation = async (req, res) => {
  try {
    const profile = await updateEducationService(req.user.id || req.user._id, req.params.id, req.body);
    res.status(200).json({ success: true, status: 'success', profile });
  } catch (error) {
    res.status(400).json({ success: false, status: 'error', message: error.message });
  }
};

export const deleteEducation = async (req, res) => {
  try {
    const profile = await deleteEducationService(req.user.id || req.user._id, req.params.id);
    res.status(200).json({ success: true, status: 'success', profile });
  } catch (error) {
    res.status(400).json({ success: false, status: 'error', message: error.message });
  }
};

export const addExperience = async (req, res) => {
  try {
    const profile = await addExperienceService(req.user.id || req.user._id, req.body);
    res.status(201).json({ success: true, status: 'success', profile });
  } catch (error) {
    res.status(400).json({ success: false, status: 'error', message: error.message });
  }
};

export const updateExperience = async (req, res) => {
  try {
    const profile = await updateExperienceService(req.user.id || req.user._id, req.params.id, req.body);
    res.status(200).json({ success: true, status: 'success', profile });
  } catch (error) {
    res.status(400).json({ success: false, status: 'error', message: error.message });
  }
};

export const deleteExperience = async (req, res) => {
  try {
    const profile = await deleteExperienceService(req.user.id || req.user._id, req.params.id);
    res.status(200).json({ success: true, status: 'success', profile });
  } catch (error) {
    res.status(400).json({ success: false, status: 'error', message: error.message });
  }
};

export const addSkill = async (req, res) => {
  try {
    const profile = await addSkillService(req.user.id || req.user._id, req.body);
    res.status(201).json({ success: true, status: 'success', profile });
  } catch (error) {
    res.status(400).json({ success: false, status: 'error', message: error.message });
  }
};

export const updateSkill = async (req, res) => {
  try {
    const profile = await updateSkillService(req.user.id || req.user._id, req.params.id, req.body);
    res.status(200).json({ success: true, status: 'success', profile });
  } catch (error) {
    res.status(400).json({ success: false, status: 'error', message: error.message });
  }
};

export const deleteSkill = async (req, res) => {
  try {
    const profile = await deleteSkillService(req.user.id || req.user._id, req.params.id);
    res.status(200).json({ success: true, status: 'success', profile });
  } catch (error) {
    res.status(400).json({ success: false, status: 'error', message: error.message });
  }
};
