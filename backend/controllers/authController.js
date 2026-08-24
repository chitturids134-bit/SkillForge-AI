import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Company from '../models/Company.js';
import { createNotification } from '../services/notificationService.js';

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// Helper to get recruiter verification status
const getRecruiterVerificationStatus = async (userId) => {
  const company = await Company.findOne({ owner: userId }).select('verification').lean();
  const raw = company?.verification?.status || 'pending';
  if (raw === 'verified') return 'verified';
  if (raw === 'rejected') return 'rejected';
  return 'pending';
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide name, email, and password',
      });
    }

    const normalizedEmail = (email || '').trim().toLowerCase();

    if (role === 'Admin') {
      return res.status(400).json({
        status: 'error',
        message: 'Registration for Admin role is not allowed.',
      });
    }

    if (role && !['Developer', 'Recruiter'].includes(role)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid role. Role must be Developer or Recruiter',
      });
    }

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({
        status: 'error',
        message: 'User already exists with this email',
      });
    }

    const userRole = role || 'Developer';

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: userRole,
    });

    let verifStatus = null;

    if (userRole === 'Recruiter') {
      // Auto-create Company with default 'pending' verification status
      await Company.create({
        owner: user._id,
        companyName: name + "'s Organization",
        email: normalizedEmail,
        website: 'https://company.org',
        industry: 'Technology',
        verification: {
          status: 'pending',
          submittedAt: new Date(),
        },
      });
      verifStatus = 'pending';
    }

    if (user) {
      createNotification({
        userId: user._id,
        type: 'WELCOME',
        title: 'Welcome to SkillForge AI! 🎉',
        message: 'Your personalized career journey starts here. Complete your profile to get the most out of SkillForge AI.',
        link: '/profile',
      }).catch(err => console.error('Error creating welcome notification:', err));

      res.status(201).json({
        status: 'success',
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          verificationStatus: verifStatus,
        },
      });
    } else {
      res.status(400).json({
        status: 'error',
        message: 'Invalid user data received',
      });
    }
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email and password',
      });
    }

    const normalizedEmail = (email || '').trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password',
      });
    }

    if (user.isActive === false) {
      return res.status(401).json({
        status: 'error',
        message: 'Your account has been suspended or deactivated.',
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password',
      });
    }

    let verifStatus = null;
    if (user.role === 'Recruiter') {
      verifStatus = await getRecruiterVerificationStatus(user._id);
    }

    res.status(200).json({
      status: 'success',
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verificationStatus: verifStatus,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server authentication error',
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    let verifStatus = null;
    if (req.user.role === 'Recruiter') {
      verifStatus = await getRecruiterVerificationStatus(req.user._id);
    }

    res.status(200).json({
      status: 'success',
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        verificationStatus: verifStatus,
      },
    });
  } catch (error) {
    console.error('GetMe Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};
