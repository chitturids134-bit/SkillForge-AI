import {
  getCompanyProfile,
  createOrUpdateCompanyProfile,
  getPublicCompanyProfile,
} from '../services/companyService.js';

/**
 * @desc    Get authenticated recruiter's company profile
 * @route   GET /api/recruiter/company
 * @access  Private (Recruiter)
 */
export const getCompanyProfileController = async (req, res) => {
  try {
    const userId = req.user._id;
    const company = await getCompanyProfile(userId);

    return res.status(200).json({
      success: true,
      data: company,
    });
  } catch (error) {
    console.error('Get Company Profile Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve company profile.',
    });
  }
};

/**
 * @desc    Create or update authenticated recruiter's company profile
 * @route   PUT /api/recruiter/company
 * @access  Private (Recruiter)
 */
export const updateCompanyProfileController = async (req, res) => {
  try {
    const userId = req.user._id;
    const company = await createOrUpdateCompanyProfile(userId, req.body);

    return res.status(200).json({
      success: true,
      message: 'Company profile updated successfully.',
      data: company,
    });
  } catch (error) {
    console.error('Update Company Profile Error:', error.message);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to update company profile.',
    });
  }
};

/**
 * @desc    Get public company profile
 * @route   GET /api/recruiter/company/public/:id
 * @access  Public / Authenticated
 */
export const getPublicCompanyProfileController = async (req, res) => {
  try {
    const { id } = req.params;
    const publicProfile = await getPublicCompanyProfile(id);

    return res.status(200).json({
      success: true,
      data: publicProfile,
    });
  } catch (error) {
    console.error('Get Public Company Error:', error.message);
    const status = error.message.includes('not found') ? 404 : 400;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to fetch public company profile.',
    });
  }
};
