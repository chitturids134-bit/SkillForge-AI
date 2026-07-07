import Interview from '../models/Interview.js';
import { analyzeInterview } from '../services/interviewAnalysisService.js';

// @desc    Get all interviews for the logged-in user
// @route   GET /api/interview/me
// @access  Private
export const getInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ user: req.user.id }).sort({ createdAt: -1 });
    
    res.status(200).json({
      status: 'success',
      count: interviews.length,
      interviews,
    });
  } catch (error) {
    console.error('GetInterviews Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Create a new interview session
// @route   POST /api/interview
// @access  Private
export const createInterview = async (req, res) => {
  try {
    const { category, difficulty, questions, completed } = req.body;

    if (!category || !difficulty || !questions || !Array.isArray(questions)) {
      return res.status(400).json({
        status: 'error',
        message: 'Category, difficulty, and questions (array) are required',
      });
    }

    const analysis = analyzeInterview(category, difficulty, questions);

    const interview = await Interview.create({
      user: req.user.id,
      category,
      difficulty,
      questions,
      overallScore: analysis.overallScore,
      completed: completed || false,
      analysis,
    });

    res.status(201).json({
      status: 'success',
      interview,
    });
  } catch (error) {
    console.error('CreateInterview Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Update answers and score for an interview session
// @route   PUT /api/interview/:id
// @access  Private
export const updateInterview = async (req, res) => {
  try {
    const { questions, completed } = req.body;

    let interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        status: 'error',
        message: 'Interview session not found',
      });
    }

    // Check ownership
    if (interview.user.toString() !== req.user.id) {
      return res.status(401).json({
        status: 'error',
        message: 'User not authorized to update this session',
      });
    }

    if (questions && Array.isArray(questions)) {
      interview.questions = questions;
      const analysis = analyzeInterview(interview.category, interview.difficulty, questions);
      interview.analysis = analysis;
      interview.overallScore = analysis.overallScore;
    }

    if (typeof completed === 'boolean') {
      interview.completed = completed;
    }

    const updatedInterview = await interview.save();

    res.status(200).json({
      status: 'success',
      interview: updatedInterview,
    });
  } catch (error) {
    console.error('UpdateInterview Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// @desc    Delete an interview session
// @route   DELETE /api/interview/:id
// @access  Private
export const deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        status: 'error',
        message: 'Interview session not found',
      });
    }

    // Check ownership
    if (interview.user.toString() !== req.user.id) {
      return res.status(401).json({
        status: 'error',
        message: 'User not authorized to delete this session',
      });
    }

    await Interview.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Interview session deleted successfully',
    });
  } catch (error) {
    console.error('DeleteInterview Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};
