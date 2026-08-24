import {
  getPortfolioByUserId,
  updatePortfolioByUserId,
  getPortfolioByPublicSlug,
  syncPortfolioFromResumeService,
} from '../services/portfolioService.js';

// @desc    Get user portfolio
// @route   GET /api/portfolio/me
// @access  Private
export const getPortfolioMe = async (req, res) => {
  try {
    const portfolio = await getPortfolioByUserId(req.user.id);
    res.status(200).json({
      status: 'success',
      portfolio,
    });
  } catch (error) {
    console.error('GetPortfolio Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch portfolio',
    });
  }
};

// @desc    Update user portfolio
// @route   PUT /api/portfolio/me
// @access  Private
export const updatePortfolioMe = async (req, res) => {
  try {
    const portfolio = await updatePortfolioByUserId(req.user.id, req.body);
    res.status(200).json({
      status: 'success',
      portfolio,
    });
  } catch (error) {
    console.error('UpdatePortfolio Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to update portfolio',
    });
  }
};

// @desc    Sync portfolio from resume
// @route   POST /api/portfolio/sync-resume
// @access  Private
export const syncPortfolioFromResume = async (req, res) => {
  try {
    const portfolio = await syncPortfolioFromResumeService(req.user.id);
    res.status(200).json({
      status: 'success',
      portfolio,
    });
  } catch (error) {
    console.error('SyncPortfolio Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to sync portfolio',
    });
  }
};

// @desc    Get public portfolio by slug
// @route   GET /api/portfolio/public/:username
// @access  Public
export const getPublicPortfolio = async (req, res) => {
  try {
    const portfolio = await getPortfolioByPublicSlug(req.params.username);
    res.status(200).json({
      status: 'success',
      portfolio,
    });
  } catch (error) {
    console.error('PublicPortfolio Error:', error);
    res.status(404).json({
      status: 'error',
      message: error.message || 'Public portfolio not found',
    });
  }
};
