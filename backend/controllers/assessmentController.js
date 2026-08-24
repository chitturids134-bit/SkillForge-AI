import {
  getAvailableAssessmentsService,
  startAssessmentAttemptService,
  getActiveAssessmentAttemptService,
  getAssessmentAttemptService,
  submitQuestionAnswerService,
  completeAssessmentAttemptService,
  getUserAssessmentHistoryService,
  getAttemptReportService,
  deleteAttemptService,
} from '../services/assessmentService.js';

// @desc    Get available skill assessments & user stats
// @route   GET /api/assessments
// @access  Private
export const getAssessments = async (req, res) => {
  try {
    const data = await getAvailableAssessmentsService(req.user.id);
    res.status(200).json({
      status: 'success',
      assessments: data.assessments,
      stats: data.stats,
    });
  } catch (error) {
    console.error('GetAssessments Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch assessments',
    });
  }
};

// @desc    Get active assessment attempt for refresh recovery
// @route   GET /api/assessments/active
// @access  Private
export const getActiveAssessment = async (req, res) => {
  try {
    const activeAttempt = await getActiveAssessmentAttemptService(req.user.id);
    res.status(200).json({
      status: 'success',
      attempt: activeAttempt || null,
    });
  } catch (error) {
    console.error('GetActiveAssessment Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch active assessment',
    });
  }
};

// @desc    Start an assessment attempt
// @route   POST /api/assessments/:id/start
// @access  Private
export const startAssessment = async (req, res) => {
  try {
    const sessionData = await startAssessmentAttemptService(req.user.id, req.params.id);
    res.status(201).json({
      status: 'success',
      attempt: sessionData,
    });
  } catch (error) {
    console.error('StartAssessment Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to start assessment',
    });
  }
};

// @desc    Get specific assessment attempt
// @route   GET /api/assessments/attempt/:attemptId
// @access  Private
export const getAttempt = async (req, res) => {
  try {
    const attempt = await getAssessmentAttemptService(req.user.id, req.params.attemptId);
    res.status(200).json({
      status: 'success',
      attempt,
    });
  } catch (error) {
    console.error('GetAttempt Error:', error);
    res.status(404).json({
      status: 'error',
      message: error.message || 'Assessment attempt not found',
    });
  }
};

// @desc    Submit answer to a question in an active assessment attempt
// @route   POST /api/assessments/attempt/:attemptId/answer
// @access  Private
export const submitAnswer = async (req, res) => {
  try {
    const { questionIndex, selectedOptionIndex } = req.body;
    const result = await submitQuestionAnswerService(
      req.user.id,
      req.params.attemptId,
      questionIndex,
      selectedOptionIndex
    );
    res.status(200).json({
      status: 'success',
      result,
    });
  } catch (error) {
    console.error('SubmitAnswer Error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Failed to submit answer',
    });
  }
};

// @desc    Complete assessment attempt and generate result
// @route   POST /api/assessments/attempt/:attemptId/complete
// @access  Private
export const completeAssessment = async (req, res) => {
  try {
    const { timeTakenSeconds } = req.body;
    const attempt = await completeAssessmentAttemptService(
      req.user.id,
      req.params.attemptId,
      timeTakenSeconds
    );
    res.status(200).json({
      status: 'success',
      attempt,
    });
  } catch (error) {
    console.error('CompleteAssessment Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to complete assessment',
    });
  }
};

// @desc    Get user assessment history
// @route   GET /api/assessments/history
// @access  Private
export const getHistory = async (req, res) => {
  try {
    const history = await getUserAssessmentHistoryService(req.user.id);
    res.status(200).json({
      status: 'success',
      history,
    });
  } catch (error) {
    console.error('GetHistory Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch assessment history',
    });
  }
};

// @desc    Get detailed report for a completed attempt
// @route   GET /api/assessments/history/:attemptId
// @access  Private
export const getReport = async (req, res) => {
  try {
    const report = await getAttemptReportService(req.user.id, req.params.attemptId);
    res.status(200).json({
      status: 'success',
      report,
    });
  } catch (error) {
    console.error('GetReport Error:', error);
    res.status(404).json({
      status: 'error',
      message: error.message || 'Assessment report not found',
    });
  }
};

// @desc    Delete assessment attempt history record
// @route   DELETE /api/assessments/history/:attemptId
// @access  Private
export const deleteAttempt = async (req, res) => {
  try {
    const result = await deleteAttemptService(req.user.id, req.params.attemptId);
    res.status(200).json({
      status: 'success',
      message: result.message,
    });
  } catch (error) {
    console.error('DeleteAttempt Error:', error);
    res.status(404).json({
      status: 'error',
      message: error.message || 'Failed to delete assessment attempt',
    });
  }
};
