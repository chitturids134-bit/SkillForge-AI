import {
  getRecruiterSettingsService,
  updateRecruiterSettingsService,
} from '../services/recruiterSettingsService.js';

/**
 * @desc    Get recruiter settings
 * @route   GET /api/recruiter/settings
 * @access  Private (Recruiter)
 */
export const getRecruiterSettingsController = async (req, res) => {
  try {
    const settings = await getRecruiterSettingsService(req.user._id);
    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Get Recruiter Settings Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve recruiter settings',
    });
  }
};

/**
 * @desc    Update overall recruiter settings
 * @route   PATCH /api/recruiter/settings
 * @access  Private (Recruiter)
 */
export const updateRecruiterSettingsController = async (req, res) => {
  try {
    const settings = await updateRecruiterSettingsService(req.user._id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Recruiter settings updated successfully',
      data: settings,
    });
  } catch (error) {
    console.error('Update Recruiter Settings Error:', error.message);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to update recruiter settings',
    });
  }
};

/**
 * @desc    Update recruiter hiring preferences
 * @route   PATCH /api/recruiter/settings/preferences
 * @access  Private (Recruiter)
 */
export const updateRecruiterPreferencesController = async (req, res) => {
  try {
    const settings = await updateRecruiterSettingsService(req.user._id, {
      preferences: req.body.preferences || req.body,
    });
    return res.status(200).json({
      success: true,
      message: 'Hiring preferences updated successfully',
      data: settings,
    });
  } catch (error) {
    console.error('Update Preferences Error:', error.message);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to update hiring preferences',
    });
  }
};

/**
 * @desc    Update recruiter notification preferences
 * @route   PATCH /api/recruiter/settings/notifications
 * @access  Private (Recruiter)
 */
export const updateRecruiterNotificationsController = async (req, res) => {
  try {
    const settings = await updateRecruiterSettingsService(req.user._id, {
      notifications: req.body.notifications || req.body,
    });
    return res.status(200).json({
      success: true,
      message: 'Notification settings updated successfully',
      data: settings,
    });
  } catch (error) {
    console.error('Update Notifications Error:', error.message);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to update recruitment notifications',
    });
  }
};

/**
 * @desc    Update recruiter privacy settings
 * @route   PATCH /api/recruiter/settings/privacy
 * @access  Private (Recruiter)
 */
export const updateRecruiterPrivacyController = async (req, res) => {
  try {
    const settings = await updateRecruiterSettingsService(req.user._id, {
      privacy: req.body.privacy || req.body,
    });
    return res.status(200).json({
      success: true,
      message: 'Privacy settings updated successfully',
      data: settings,
    });
  } catch (error) {
    console.error('Update Privacy Error:', error.message);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to update privacy settings',
    });
  }
};
