import {
  getUserSettings,
  updateUserSettings,
  changeUserPassword,
  deleteUserAccount
} from '../services/settingsService.js';

// @desc    Get current user settings
// @route   GET /api/settings
// @access  Private
export const getSettings = async (req, res) => {
  try {
    const settings = await getUserSettings(req.user.id);
    res.status(200).json({
      status: 'success',
      settings
    });
  } catch (error) {
    console.error('GetSettings Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch settings'
    });
  }
};

// @desc    Update current user settings
// @route   PATCH /api/settings
// @access  Private
export const updateSettings = async (req, res) => {
  try {
    const settings = await updateUserSettings(req.user.id, req.body);
    res.status(200).json({
      status: 'success',
      settings
    });
  } catch (error) {
    console.error('UpdateSettings Error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Failed to update settings'
    });
  }
};

// @desc    Change user password
// @route   PATCH /api/settings/password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await changeUserPassword(req.user.id, currentPassword, newPassword);
    res.status(200).json({
      status: 'success',
      message: result.message
    });
  } catch (error) {
    console.error('ChangePassword Error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Failed to change password'
    });
  }
};

// @desc    Delete user account
// @route   DELETE /api/settings/account
// @access  Private
export const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    const result = await deleteUserAccount(req.user.id, password);
    res.status(200).json({
      status: 'success',
      message: result.message
    });
  } catch (error) {
    console.error('DeleteAccount Error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Failed to delete account'
    });
  }
};
