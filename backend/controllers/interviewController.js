import mongoose from 'mongoose';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import Interview from '../models/Interview.js';
import { generateInterviewQuestions } from '../services/interviewGeneratorService.js';
import { evaluateAnswerService } from '../services/interviewEvaluationService.js';
import { analyzeInterview } from '../services/interviewAnalysisService.js';
import { createNotification } from '../services/notificationService.js';

// @desc    Start a new AI Interview Session
// @route   POST /api/interview/start
// @access  Private
export const startInterview = async (req, res) => {
  try {
    const { type, category, difficulty = 'Intermediate', questionCount = 5 } = req.body;
    const selectedCategory = type || category || 'Technical';

    // Validate Category
    if (!['Technical', 'HR', 'Behavioral'].includes(selectedCategory)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid interview category. Must be Technical, HR, or Behavioral.',
      });
    }

    // Validate Difficulty
    if (!['Beginner', 'Intermediate', 'Advanced'].includes(difficulty)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid difficulty level. Must be Beginner, Intermediate, or Advanced.',
      });
    }

    // Validate Question Count
    const parsedCount = parseInt(questionCount, 10);
    if (isNaN(parsedCount) || parsedCount < 1 || parsedCount > 20) {
      return res.status(400).json({
        status: 'error',
        message: 'Question count must be a number between 1 and 20.',
      });
    }

    // Mark previous active session as abandoned so only one active session exists
    await Interview.updateMany(
      { user: req.user.id, status: 'in-progress' },
      { $set: { status: 'abandoned' } }
    );

    // Generate Profile-aware Questions
    const questions = await generateInterviewQuestions(
      req.user.id,
      selectedCategory,
      difficulty,
      parsedCount
    );

    const newInterview = await Interview.create({
      user: req.user.id,
      category: selectedCategory,
      difficulty,
      questionCount: parsedCount,
      currentQuestionIndex: 0,
      status: 'in-progress',
      questions,
      completed: false,
      startedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      status: 'success',
      interviewId: newInterview._id,
      questionNumber: 1,
      totalQuestions: parsedCount,
      question: newInterview.questions[0]?.question || '',
      session: newInterview,
    });
  } catch (error) {
    console.error('StartInterview Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to start interview session',
    });
  }
};

// @desc    Get active in-progress interview session for refresh recovery
// @route   GET /api/interview/active
// @access  Private
export const getActiveInterview = async (req, res) => {
  try {
    const activeSession = await Interview.findOne({
      user: req.user.id,
      status: 'in-progress',
    });

    res.status(200).json({
      success: true,
      status: 'success',
      session: activeSession || null,
    });
  } catch (error) {
    console.error('GetActiveInterview Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to retrieve active session',
    });
  }
};

// @desc    Get specific interview session by ID (with ownership check)
// @route   GET /api/interview/:id
// @access  Private
// @desc    Get specific interview session by ID (with ownership check)
// @route   GET /api/interview/:id
// @access  Private
export const getInterviewById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        status: 'error',
        message: 'Interview session not found',
      });
    }

    const interview = await Interview.findById(id);

    if (!interview) {
      return res.status(404).json({
        status: 'error',
        message: 'Interview session not found',
      });
    }

    // Authorization check: User must be candidate or recruiter assigned to interview
    const userId = (req.user.id || req.user._id).toString();
    const candidateId = interview.user ? interview.user.toString() : '';
    const recruiterId = interview.recruiter ? interview.recruiter.toString() : '';

    if (userId !== candidateId && userId !== recruiterId && req.user.role !== 'Admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized. Access denied to this interview record.',
      });
    }

    res.status(200).json({
      success: true,
      status: 'success',
      interview,
    });
  } catch (error) {
    console.error('GetInterviewById Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to retrieve interview session',
    });
  }
};


// @desc    Submit answer to a question and get evaluation
// @route   POST /api/interview/:id/answer
// @access  Private
export const submitAnswer = async (req, res) => {
  try {
    const { questionIndex, answer } = req.body;

    const interview = await Interview.findById(req.params.id);
    if (!interview || interview.user.toString() !== req.user.id) {
      return res.status(404).json({
        status: 'error',
        message: 'Interview session not found',
      });
    }

    if (interview.status !== 'in-progress') {
      return res.status(400).json({
        status: 'error',
        message: 'This interview session is already finalized or abandoned.',
      });
    }

    const idx = parseInt(questionIndex, 10);
    if (isNaN(idx) || idx < 0 || idx >= interview.questions.length) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid question index.',
      });
    }

    const trimmedAnswer = (answer || '').trim();
    if (!trimmedAnswer) {
      return res.status(400).json({
        status: 'error',
        message: 'Please enter a valid response before submitting.',
      });
    }

    const questionObj = interview.questions[idx];

    // Evaluate answer
    const evaluation = await evaluateAnswerService(
      interview.category,
      interview.difficulty,
      questionObj,
      trimmedAnswer
    );

    // Save answer and evaluation details
    questionObj.answer = trimmedAnswer;
    questionObj.score = evaluation.score;
    questionObj.feedback = evaluation.feedback;
    questionObj.strengths = evaluation.strengths;
    questionObj.improvements = evaluation.improvements;
    questionObj.answeredAt = new Date();

    // Advance current question index
    if (idx === interview.currentQuestionIndex && idx < interview.questions.length - 1) {
      interview.currentQuestionIndex = idx + 1;
    }

    await interview.save();

    const isLastQuestion = idx >= interview.questions.length - 1;

    res.status(200).json({
      success: true,
      status: 'success',
      evaluation,
      questionIndex: idx,
      currentQuestionIndex: interview.currentQuestionIndex,
      isLastQuestion,
      session: interview,
    });
  } catch (error) {
    console.error('SubmitAnswer Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to evaluate answer',
    });
  }
};

// @desc    Complete interview session and generate final performance report
// @route   POST /api/interview/:id/complete
// @access  Private
export const completeInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview || interview.user.toString() !== req.user.id) {
      return res.status(404).json({
        status: 'error',
        message: 'Interview session not found',
      });
    }

    // Run complete session analysis
    const analysis = analyzeInterview(interview.category, interview.difficulty, interview.questions);

    interview.overallScore = analysis.overallScore;
    interview.analysis = analysis;
    interview.completed = true;
    interview.status = 'completed';
    interview.completedAt = new Date();

    await interview.save();

    // Create background notification
    createNotification({
      userId: req.user.id,
      type: 'INTERVIEW',
      title: 'AI Practice Interview Completed',
      message: `You completed a ${interview.category} Practice Interview with a score of ${analysis.overallScore}%. View your full feedback report!`,
      link: `/interview/report/${interview._id}`,
    }).catch((err) => console.error('Notification error:', err));

    res.status(200).json({
      success: true,
      status: 'success',
      interview,
    });
  } catch (error) {
    console.error('CompleteInterview Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to finalize interview session',
    });
  }
};

// @desc    Get all interviews for the logged-in user
// @route   GET /api/interview/me
// @access  Private
export const getInterviews = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const interviews = await Interview.find({
      $or: [
        { user: userId },
        { recruiter: userId }
      ]
    }).sort({ createdAt: -1 }).lean();

    return res.status(200).json({
      success: true,
      status: 'success',
      count: interviews.length,
      interviews,
      data: interviews
    });
  } catch (error) {
    console.error('GetInterviews Error:', error);
    return res.status(500).json({
      success: false,
      status: 'error',
      message: error.message || 'Failed to fetch interview history',
    });
  }
};

// @desc    Create a raw interview session (backward compatibility)
// @route   POST /api/interview
// @access  Private
export const createInterview = async (req, res) => {
  try {
    const {
      candidateId,
      candidateName,
      type,
      jobId,
      jobTitle,
      scheduledAt,
      format,
      notes,
      category = 'Technical',
      difficulty = 'Intermediate',
      questions,
      completed
    } = req.body;

    // Recruiter Technical Interview Invitation Flow
    if (candidateId || candidateName) {
      const targetUserId = candidateId || req.user.id;
      // Safely map and normalize interview type and format enums
      let typeEnum = type || 'ai_technical';
      let formatEnum = format || 'AI';

      if (format === 'AI Technical Screen' || format === 'AI Screening') {
        typeEnum = 'ai_technical';
        formatEnum = 'AI';
      } else if (format === 'Recruiter Interview') {
        typeEnum = 'recruiter_interview';
        formatEnum = 'Video';
      }

      if (!['ai_screening', 'ai_technical', 'recruiter_interview'].includes(typeEnum)) {
        typeEnum = 'ai_technical';
      }
      if (!['AI', 'Video', 'Phone'].includes(formatEnum)) {
        formatEnum = 'AI';
      }

      const interview = await Interview.create({
        user: targetUserId,
        candidate: targetUserId,
        recruiter: req.user.id || req.user._id,
        job: jobId && jobId !== 'general' ? jobId : undefined,
        type: typeEnum,
        format: formatEnum,
        category: 'Technical',
        difficulty: 'Intermediate',
        status: 'scheduled',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
        notes: notes || '',
        questions: questions && Array.isArray(questions) ? questions : []
      });

      return res.status(201).json({
        success: true,
        status: 'success',
        interview: {
          id: interview._id,
          _id: interview._id,
          candidateName: candidateName || 'Candidate',
          jobTitle: jobTitle || 'Technical Role',
          scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
          format: format || 'AI Technical Screen',
          status: 'in-progress'
        }
      });
    }

    // Standard AI Mock Interview Creation
    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({
        status: 'error',
        message: 'Questions array is required for mock interview sessions',
      });
    }

    const analysis = analyzeInterview(category, difficulty, questions);

    const interview = await Interview.create({
      user: req.user.id,
      category,
      difficulty,
      questionCount: questions.length,
      questions,
      overallScore: analysis.overallScore,
      completed: completed || false,
      status: completed ? 'completed' : 'in-progress',
      analysis,
    });

    return res.status(201).json({
      success: true,
      status: 'success',
      interview,
    });
  } catch (error) {
    console.error('CreateInterview Error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to create interview session',
    });
  }
};

// @desc    Update interview session (backward compatibility)
// @route   PUT /api/interview/:id
// @access  Private
export const updateInterview = async (req, res) => {
  try {
    const { questions, completed } = req.body;

    let interview = await Interview.findById(req.params.id);

    if (!interview || interview.user.toString() !== req.user.id) {
      return res.status(404).json({
        status: 'error',
        message: 'Interview session not found',
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
      interview.status = completed ? 'completed' : 'in-progress';
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
      message: error.message || 'Failed to update interview session',
    });
  }
};

// @desc    Delete an interview session
// @route   DELETE /api/interview/:id
// @access  Private
export const deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview || interview.user.toString() !== req.user.id) {
      return res.status(404).json({
        status: 'error',
        message: 'Interview session not found',
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
      message: error.message || 'Failed to delete interview session',
    });
  }
};



// @desc Developer Responds to Interview Invitation (Accept / Decline / Reschedule)
// @route PATCH /api/interviews/:id/respond
// @access Private — Candidate Developer Only
export const respondToInterviewController = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, preferredDate, preferredTime, reason } = req.body;
    const userId = req.user.id || req.user._id;

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview invitation not found.' });
    }

    if (interview.user.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized. You can only respond to your own interview invitations.' });
    }

    if (action === 'accept') {
      interview.status = 'accepted';
      await interview.save();

      if (interview.recruiter) {
        await createNotification({
          user: interview.recruiter,
          type: 'INTERVIEW',
          title: 'Interview Invitation Accepted ✓',
          message: `Candidate accepted interview for job requisiton.`,
          link: '/recruiter/interviews'
        });
      }
      return res.json({ success: true, message: 'Interview invitation accepted successfully!', interview });
    }

    if (action === 'decline') {
      interview.status = 'declined';
      await interview.save();

      if (interview.recruiter) {
        await createNotification({
          user: interview.recruiter,
          type: 'INTERVIEW',
          title: 'Interview Invitation Declined',
          message: `Candidate declined interview invitation.`,
          link: '/recruiter/interviews'
        });
      }
      return res.json({ success: true, message: 'Interview invitation declined.', interview });
    }

    if (action === 'reschedule') {
      interview.status = 'reschedule_requested';
      interview.rescheduleRequest = {
        preferredDate: preferredDate ? new Date(preferredDate) : null,
        preferredTime: preferredTime || '',
        reason: reason || '',
        requestedAt: new Date()
      };
      await interview.save();

      if (interview.recruiter) {
        await createNotification({
          user: interview.recruiter,
          type: 'INTERVIEW',
          title: 'Interview Reschedule Requested 📅',
          message: `Candidate requested interview reschedule: ${reason || 'Date conflict'}`,
          link: '/recruiter/interviews'
        });
      }
      return res.json({ success: true, message: 'Reschedule request submitted to recruiter.', interview });
    }

    return res.status(400).json({ success: false, message: 'Invalid response action.' });
  } catch (err) {
    console.error('Respond To Interview Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update interview response.' });
  }
};

// @desc Recruiter Responds to Reschedule Request
// @route POST /api/interviews/:id/reschedule-response
// @access Private — Recruiter Only
export const respondToRescheduleController = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, newScheduledAt } = req.body;
    const recruiterId = req.user.id || req.user._id;

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview record not found.' });
    }

    if (interview.recruiter && interview.recruiter.toString() !== recruiterId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized. You can only manage your own interviews.' });
    }

    if (action === 'approve') {
      if (newScheduledAt) {
        interview.scheduledAt = new Date(newScheduledAt);
      } else if (interview.rescheduleRequest?.preferredDate) {
        interview.scheduledAt = interview.rescheduleRequest.preferredDate;
      }
      interview.status = 'accepted';
      interview.rescheduleRequest = undefined;
      await interview.save();

      await createNotification({
        user: interview.user,
        type: 'INTERVIEW',
        title: 'Reschedule Request Approved 🎉',
        message: `Your interview has been rescheduled to ${new Date(interview.scheduledAt).toLocaleString()}.`,
        link: `/developer/interviews/${interview._id}`
      });

      return res.json({ success: true, message: 'Reschedule request approved.', interview });
    }

    if (action === 'reject') {
      interview.status = 'accepted';
      interview.rescheduleRequest = undefined;
      await interview.save();

      await createNotification({
        user: interview.user,
        type: 'INTERVIEW',
        title: 'Reschedule Request Declined',
        message: `Recruiter kept original schedule: ${new Date(interview.scheduledAt).toLocaleString()}.`,
        link: `/developer/interviews/${interview._id}`
      });

      return res.json({ success: true, message: 'Reschedule request declined.', interview });
    }

    return res.status(400).json({ success: false, message: 'Invalid reschedule response action.' });
  } catch (err) {
    console.error('Respond to Reschedule Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to process reschedule response.' });
  }
};

// @desc Recruiter Submits Hiring Decision (Shortlist / Reject / Offer)
// @route POST /api/recruiter/interviews/:id/decision
// @access Private — Recruiter Only
export const recruiterDecisionController = async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, notes } = req.body;
    const recruiterId = req.user.id || req.user._id;

    if (!['shortlisted', 'rejected', 'offer'].includes(decision)) {
      return res.status(400).json({ success: false, message: 'Invalid decision. Must be shortlisted, rejected, or offer.' });
    }

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview record not found.' });
    }

    if (interview.recruiter && interview.recruiter.toString() !== recruiterId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized. You can only decide on your own candidate interviews.' });
    }

    interview.hiringDecision = {
      decision,
      notes: notes || '',
      decidedAt: new Date()
    };
    await interview.save();

    // Update Application pipeline stage in MongoDB if matching Application exists
    if (interview.application || (interview.job && interview.user)) {
      const appQuery = interview.application ? { _id: interview.application } : { job: interview.job, candidate: interview.user };
      const appStage = decision === 'shortlisted' ? 'shortlisted' : decision === 'rejected' ? 'rejected' : 'offer';
      
      await Application.findOneAndUpdate(appQuery, { status: appStage }, { new: true });
    }

    // Send notification to Candidate Developer
    await createNotification({
      user: interview.user,
      type: 'INTERVIEW',
      title: `Interview Feedback: ${decision.toUpperCase()}`,
      message: `Recruiter updated your application status to ${decision}.`,
      link: '/applications'
    });

    return res.json({ success: true, message: `Hiring decision (${decision}) saved successfully!`, interview });
  } catch (err) {
    console.error('Recruiter Decision Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to record hiring decision.' });
  }
};



// @desc Submit GitHub Repository URL for Interview Session
// @route POST /api/interviews/:id/repository
// @access Private — Candidate Developer Only
export const submitRepositoryController = async (req, res) => {
  try {
    const { id } = req.params;
    const { repositoryUrl } = req.body;
    const userId = req.user.id || req.user._id;

    if (!repositoryUrl || typeof repositoryUrl !== 'string' || !repositoryUrl.trim()) {
      return res.status(400).json({ success: false, message: 'Valid repository URL is required.' });
    }

    const trimmedUrl = repositoryUrl.trim();
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      return res.status(400).json({ success: false, message: 'Repository URL must start with http:// or https://' });
    }

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview session not found.' });
    }

    if (interview.user.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized. You can only submit repository links to your own interviews.' });
    }

    interview.repositoryUrl = trimmedUrl;
    interview.repositorySubmittedAt = new Date();
    interview.repositorySubmittedBy = userId;
    await interview.save();

    return res.json({
      success: true,
      message: 'Project repository URL submitted successfully! ✓',
      repositoryUrl: trimmedUrl,
      interview
    });
  } catch (err) {
    console.error('Submit Repository Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to submit repository link.' });
  }
};

// @desc Recruiter Submits Manual Human Interview Evaluation
// @route POST /api/interviews/:id/recruiter-evaluation
// @access Private — Recruiter Only
export const submitRecruiterEvaluationController = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      technicalScore = 0,
      communicationScore = 0,
      problemSolvingScore = 0,
      cultureFitScore = 0,
      strengths = '',
      weaknesses = '',
      notes = '',
      recommendation = 'pending'
    } = req.body;

    const recruiterId = req.user.id || req.user._id;

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview session not found.' });
    }

    if (interview.recruiter && interview.recruiter.toString() !== recruiterId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized. You can only evaluate your own scheduled interviews.' });
    }

    const tScore = Math.min(100, Math.max(0, Number(technicalScore) || 0));
    const cScore = Math.min(100, Math.max(0, Number(communicationScore) || 0));
    const pScore = Math.min(100, Math.max(0, Number(problemSolvingScore) || 0));
    const cfScore = Math.min(100, Math.max(0, Number(cultureFitScore) || 0));

    const computedOverall = Math.round((tScore + cScore + pScore + cfScore) / 4);

    interview.recruiterEvaluation = {
      technicalScore: tScore,
      communicationScore: cScore,
      problemSolvingScore: pScore,
      cultureFitScore: cfScore,
      overallScore: computedOverall,
      strengths: strengths || '',
      weaknesses: weaknesses || '',
      notes: notes || '',
      recommendation: ['shortlisted', 'rejected', 'offer', 'pending'].includes(recommendation) ? recommendation : 'pending',
      submittedAt: new Date()
    };

    interview.overallScore = computedOverall;
    interview.status = 'completed';
    interview.completed = true;
    interview.completedAt = new Date();

    if (notes) {
      interview.notes = notes;
    }

    await interview.save();

    // If recommendation is shortlisted/rejected/offer, update Application stage too
    if (['shortlisted', 'rejected', 'offer'].includes(recommendation) && (interview.application || (interview.job && interview.user))) {
      const appQuery = interview.application ? { _id: interview.application } : { job: interview.job, candidate: interview.user };
      await Application.findOneAndUpdate(appQuery, { status: recommendation }, { new: true });
    }

    // Send real MongoDB notification to Developer
    await createNotification({
      user: interview.user,
      type: 'INTERVIEW',
      title: 'Recruiter Interview Evaluation Submitted 📋',
      message: `Recruiter submitted interview evaluation. Overall Score: ${computedOverall}%`,
      link: `/developer/interviews/${interview._id}`
    });

    return res.json({
      success: true,
      message: 'Recruiter interview evaluation submitted successfully! ✓',
      interview
    });
  } catch (err) {
    console.error('Submit Recruiter Evaluation Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to submit recruiter interview evaluation.' });
  }
};
