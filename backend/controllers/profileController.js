import Profile from '../models/Profile.js';

// @desc    Get current user profile
// @route   GET /api/profile/me
// @access  Private
export const getProfileMe = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate('user', 'name email');

    if (!profile) {
      return res.status(404).json({
        status: 'error',
        message: 'Profile not found',
      });
    }

    res.status(200).json({
      status: 'success',
      profile,
    });
  } catch (error) {
    console.error('GetProfile Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Create user profile
// @route   POST /api/profile
// @access  Private
export const createProfile = async (req, res) => {
  try {
    // Check if profile already exists
    const profileExists = await Profile.findOne({ user: req.user.id });
    if (profileExists) {
      return res.status(400).json({
        status: 'error',
        message: 'Profile already exists for this user. Use PUT to update.',
      });
    }

    const {
      fullName,
      college,
      degree,
      branch,
      currentYear,
      cgpa,
      skills,
      interestedRole,
      experienceLevel,
      githubUrl,
      linkedinUrl,
      portfolioUrl,
      bio,
      profilePhoto,
      location,
      phone,
      resumeUrl,
    } = req.body;

    // Validate required fields
    if (
      !fullName ||
      !college ||
      !degree ||
      !branch ||
      !currentYear ||
      cgpa === undefined ||
      !skills ||
      !interestedRole ||
      !experienceLevel
    ) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide all required fields',
      });
    }

    const profile = await Profile.create({
      user: req.user.id,
      fullName,
      college,
      degree,
      branch,
      currentYear,
      cgpa,
      skills,
      interestedRole,
      experienceLevel,
      githubUrl,
      linkedinUrl,
      portfolioUrl,
      bio,
      profilePhoto,
      location,
      phone,
      resumeUrl,
    });

    res.status(201).json({
      status: 'success',
      profile,
    });
  } catch (error) {
    console.error('CreateProfile Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/profile/me
// @access  Private
export const updateProfileMe = async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({
        status: 'error',
        message: 'Profile not found to update. Use POST to create one first.',
      });
    }

    const {
      fullName,
      college,
      degree,
      branch,
      currentYear,
      cgpa,
      skills,
      interestedRole,
      experienceLevel,
      githubUrl,
      linkedinUrl,
      portfolioUrl,
      bio,
      profilePhoto,
      location,
      phone,
      resumeUrl,
    } = req.body;

    // Validate required fields
    if (
      !fullName ||
      !college ||
      !degree ||
      !branch ||
      !currentYear ||
      cgpa === undefined ||
      !skills ||
      !interestedRole ||
      !experienceLevel
    ) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide all required fields',
      });
    }

    // Set fields
    profile.fullName = fullName;
    profile.college = college;
    profile.degree = degree;
    profile.branch = branch;
    profile.currentYear = currentYear;
    profile.cgpa = cgpa;
    profile.skills = skills;
    profile.interestedRole = interestedRole;
    profile.experienceLevel = experienceLevel;
    profile.githubUrl = githubUrl;
    profile.linkedinUrl = linkedinUrl;
    profile.portfolioUrl = portfolioUrl;
    profile.bio = bio;
    profile.profilePhoto = profilePhoto;
    profile.location = location;
    profile.phone = phone;
    profile.resumeUrl = resumeUrl;

    const updatedProfile = await profile.save();

    res.status(200).json({
      status: 'success',
      profile: updatedProfile,
    });
  } catch (error) {
    console.error('UpdateProfile Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};
