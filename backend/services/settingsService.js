import User from '../models/User.js';
import Profile from '../models/Profile.js';
import Notification from '../models/Notification.js';
import { createNotification } from './notificationService.js';

const DEFAULT_SETTINGS = {
  theme: 'dark',
  notifications: {
    inApp: true,
    email: true,
    careerRecommendations: true,
    aiMentor: true,
    jobAlerts: true
  },
  privacy: {
    profileVisibility: 'public'
  }
};

export const normalizeTheme = (theme) => {
  if (theme === 'light') return 'light';
  return 'dark';
};

const sanitizeUserDocSettings = (user) => {
  if (!user) return;
  if (!user.settings) {
    user.settings = { ...DEFAULT_SETTINGS };
  } else {
    user.settings.theme = normalizeTheme(user.settings.theme);
  }
};

export const getUserSettings = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // If user has legacy 'system' theme or invalid theme, sanitize and persist 'dark'
  if (user.settings && user.settings.theme && !['light', 'dark'].includes(user.settings.theme)) {
    sanitizeUserDocSettings(user);
    await user.save();
  } else {
    sanitizeUserDocSettings(user);
  }

  const currentSettings = user.settings || {};

  return {
    theme: currentSettings.theme,
    notifications: {
      inApp: currentSettings.notifications?.inApp ?? DEFAULT_SETTINGS.notifications.inApp,
      email: currentSettings.notifications?.email ?? DEFAULT_SETTINGS.notifications.email,
      careerRecommendations: currentSettings.notifications?.careerRecommendations ?? DEFAULT_SETTINGS.notifications.careerRecommendations,
      aiMentor: currentSettings.notifications?.aiMentor ?? DEFAULT_SETTINGS.notifications.aiMentor,
      jobAlerts: currentSettings.notifications?.jobAlerts ?? DEFAULT_SETTINGS.notifications.jobAlerts,
    },
    privacy: {
      profileVisibility: currentSettings.privacy?.profileVisibility || DEFAULT_SETTINGS.privacy.profileVisibility,
    }
  };
};

export const updateUserSettings = async (userId, settingsData) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  sanitizeUserDocSettings(user);

  const { theme, notifications, privacy } = settingsData || {};

  // Theme update with normalization (accepts light or dark; normalizes system/invalid to dark)
  if (theme !== undefined) {
    user.settings.theme = normalizeTheme(theme);
  }

  // Notifications merge update
  if (notifications && typeof notifications === 'object') {
    const keys = ['inApp', 'email', 'careerRecommendations', 'aiMentor', 'jobAlerts'];
    for (const key of keys) {
      if (notifications[key] !== undefined) {
        if (typeof notifications[key] !== 'boolean') {
          throw new Error(`Notification setting '${key}' must be a boolean`);
        }
        user.settings.notifications[key] = notifications[key];
      }
    }
  }

  // Privacy validation
  if (privacy && typeof privacy === 'object') {
    if (privacy.profileVisibility !== undefined) {
      if (!['public', 'private'].includes(privacy.profileVisibility)) {
        throw new Error('Invalid profileVisibility. Allowed values: public, private');
      }
      user.settings.privacy.profileVisibility = privacy.profileVisibility;
    }
  }

  await user.save();
  return getUserSettings(userId);
};

export const changeUserPassword = async (userId, currentPassword, newPassword) => {
  if (!currentPassword || !newPassword) {
    throw new Error('Please provide current password and new password');
  }

  if (newPassword.length < 6) {
    throw new Error('New password must be at least 6 characters long');
  }

  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new Error('User not found');
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new Error('Current password is incorrect');
  }

  sanitizeUserDocSettings(user);
  user.password = newPassword;
  await user.save();

  // Create notification for password change
  createNotification({
    userId: user._id,
    type: 'SYSTEM',
    title: 'Password Changed 🔒',
    message: 'Your account password was updated successfully. If you did not make this change, please contact support.',
    link: '/settings'
  }).catch(err => console.error('Error creating password change notification:', err));

  return { message: 'Password changed successfully' };
};

export const deleteUserAccount = async (userId, password) => {
  if (!password) {
    throw new Error('Please enter your password to confirm account deletion');
  }

  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new Error('User not found');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('Incorrect password. Account deletion canceled.');
  }

  // Perform cascading deletion of user-owned records
  await Profile.deleteOne({ user: userId });
  await Notification.deleteMany({ user: userId });
  await User.deleteOne({ _id: userId });

  return { message: 'Account deleted successfully' };
};
