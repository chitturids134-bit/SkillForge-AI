import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Company from '../models/Company.js';

// Protect routes — Verify JWT in Authorization header
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'User no longer exists.',
        });
      }

      if (req.user.isActive === false) {
        return res.status(401).json({
          status: 'error',
          message: 'Account has been deactivated.',
        });
      }

      next();
    } catch (error) {
      console.error('Protect Middleware Error:', error.message);
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized, token failed',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Not authorized, no token provided',
    });
  }
};

// Grant access to specific roles (e.g. authorize('Admin', 'Recruiter'))
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

// Middleware: Require Recruiter Verification for workspace access
export const requireVerifiedRecruiter = async (req, res, next) => {
  try {
    if (req.user.role !== 'Recruiter') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Recruiter role required.',
      });
    }

    const company = await Company.findOne({ owner: req.user._id }).select('verification').lean();
    const verifStatus = company?.verification?.status || 'pending';

    if (verifStatus !== 'verified') {
      return res.status(403).json({
        status: 'error',
        message: 'Recruiter verification is required before accessing this workspace resource.',
        verificationStatus: verifStatus === 'rejected' ? 'rejected' : 'pending',
      });
    }

    next();
  } catch (error) {
    console.error('requireVerifiedRecruiter Error:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to verify recruiter authorization.',
    });
  }
};
