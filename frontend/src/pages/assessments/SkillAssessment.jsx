import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getAssessments,
  getActiveAssessment,
  startAssessment,
  getAssessmentAttempt,
  submitAnswer,
  completeAssessment,
} from '../../services/assessmentService';
import GradientButton from '../../components/common/GradientButton';
import StatusBadge from '../../components/common/StatusBadge';
import '../../styles/auth.css';
import '../../styles/interview.css';
import '../../styles/profile.css';
import '../../styles/resume.css';
import '../../styles/assessment.css';

function SkillAssessment() {
  const navigate = useNavigate();
  const location = useLocation();

  // Wizard Steps: 'catalog' | 'session' | 'results'
  const [viewStep, setViewStep] = useState('catalog');

  // Catalog data & stats from backend
  const [catalog, setCatalog] = useState([]);
  const [stats, setStats] = useState({ completed: 0, avgScore: 0, bestScore: 0, badgesEarned: 0 });
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  // Config modal state
  const [selectedAssessment, setSelectedAssessment] = useState(null);

  // Active Session state
  const [attempt, setAttempt] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [qIdx]: selOptIdx }
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const timerRef = useRef(null);

  // Modals
  const [showExitModal, setShowExitModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Toast messages
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1. Fetch Catalog & Check Active Attempt on Mount
  const initAssessmentPage = async () => {
    try {
      setLoadingCatalog(true);
      const catData = await getAssessments();
      if (catData) {
        setCatalog(catData.assessments || []);
        if (catData.stats) setStats(catData.stats);
      }

      // Check active attempt for refresh recovery
      const activeRes = await getActiveAssessment();
      if (activeRes && activeRes.attempt) {
        restoreAttemptSession(activeRes.attempt);
      }
    } catch (err) {
      console.error('Init SkillAssessment page error:', err);
    } finally {
      setLoadingCatalog(false);
    }
  };

  useEffect(() => {
    initAssessmentPage();
  }, []);

  // Handle Retake trigger from route state or autoStartId
  useEffect(() => {
    if (location.state?.autoStartId && catalog.length > 0 && viewStep === 'catalog') {
      const target = catalog.find(a => a._id === location.state.autoStartId);
      if (target) setSelectedAssessment(target);
    }
  }, [location.state, catalog, viewStep]);

  // Helper to restore or initialize active attempt session
  const restoreAttemptSession = (attemptData) => {
    setAttempt(attemptData);
    setCurrentQuestionIndex(attemptData.currentQuestionIndex || 0);

    // Map saved answers
    const ansMap = {};
    if (attemptData.savedAnswers && Array.isArray(attemptData.savedAnswers)) {
      attemptData.savedAnswers.forEach(a => {
        ansMap[a.questionIndex] = a.selectedOptionIndex;
      });
    }
    setSelectedAnswers(ansMap);

    // Calculate time left from startedAt and duration
    const durationSec = attemptData.assessment?.durationSeconds || 1800;
    const startedAtTime = new Date(attemptData.startedAt).getTime();
    const elapsedSec = Math.floor((Date.now() - startedAtTime) / 1000);
    const remaining = Math.max(0, durationSec - elapsedSec);
    setTimeLeft(remaining);

    setViewStep('session');
  };

  // Timer Countdown Effect
  useEffect(() => {
    if (viewStep === 'session' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleAutoSubmitOnTimeExpiry();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [viewStep, timeLeft > 0]);

  // Auto-submit when time expires
  const handleAutoSubmitOnTimeExpiry = async () => {
    if (!attempt) return;
    setErrorMsg('Time expired! Your assessment is being submitted automatically.');
    await handleFinalComplete();
  };

  // 2. Start Assessment
  const handleStartAssessment = async () => {
    if (!selectedAssessment) return;

    try {
      setIsStarting(true);
      setErrorMsg('');
      const res = await startAssessment(selectedAssessment._id);

      if (res && res.attempt) {
        setSelectedAssessment(null);
        restoreAttemptSession(res.attempt);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Unable to start assessment. Please try again.');
    } finally {
      setIsStarting(false);
    }
  };

  // 3. Option Select Handler (Saves answer on backend)
  const handleSelectOption = async (optionIndex) => {
    if (!attempt) return;

    const qIdx = currentQuestionIndex;
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: optionIndex }));

    try {
      setIsSubmittingAnswer(true);
      await submitAnswer(attempt.attemptId, {
        questionIndex: qIdx,
        selectedOptionIndex: optionIndex,
      });
    } catch (err) {
      console.error('Answer submission error:', err);
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  // 4. Final Complete Assessment
  const handleFinalComplete = async () => {
    if (!attempt) return;

    try {
      setIsCompleting(true);
      setShowSubmitModal(false);
      setErrorMsg('');

      const durationSec = attempt.assessment?.durationSeconds || 1800;
      const timeTaken = Math.max(1, durationSec - timeLeft);

      const res = await completeAssessment(attempt.attemptId, { timeTakenSeconds: timeTaken });
      if (res && res.attempt) {
        setAttempt(res.attempt);
        setViewStep('results');
        initAssessmentPage(); // refresh stats
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to complete assessment. Please try again.');
    } finally {
      setIsCompleting(false);
    }
  };

  // Format time (e.g. 28:45)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const totalQuestions = attempt?.questions?.length || 0;
  const currentQuestion = attempt?.questions?.[currentQuestionIndex];

  return (
    <div style={{ padding: '2rem', width: '100%' }}>
      {errorMsg && <div className="toast toast-error" style={{ marginBottom: '1.5rem' }}>{errorMsg}</div>}
      {successMsg && <div className="toast toast-success" style={{ marginBottom: '1.5rem' }}>{successMsg}</div>}

      {/* ========================================================= */}
      {/* STEP 1: CATALOG PAGE */}
      {/* ========================================================= */}
      {viewStep === 'catalog' && (
        <div>
          {/* HEADER */}
          <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="badge badge-primary" style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                TECHNICAL SKILL CERTIFICATION
              </span>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                AI Skill Assessments
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Validate your technical mastery and earn verified skill badges for your developer profile.
              </p>
            </div>

            <button
            type="button"
            className="assessment-btn-secondary"
            onClick={() => navigate('/assessments/history')}
          >
            <span>📜</span> View Assessment History
          </button>
          </div>

          {/* TOP STATS CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
            <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Completed Assessments</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                {stats.completed}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Average Score</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-primary, #8B5CF6)', marginTop: '0.25rem' }}>
                {stats.avgScore}%
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Highest Score</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-success, #10B981)', marginTop: '0.25rem' }}>
                {stats.bestScore}%
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Verified Badges Earned</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#3B82F6', marginTop: '0.25rem' }}>
                🏅 {stats.badgesEarned}
              </div>
            </div>
          </div>

          {/* ASSESSMENT CATALOG CARDS */}
          {loadingCatalog ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
              Loading Skill Assessments Catalog...
            </div>
          ) : (
            <div className="assessment-card-grid">
              {catalog.map((item) => (
                <motion.div
                  key={item._id}
                  whileHover={{ y: -6 }}
                  className="glass-panel"
                  style={{
                    padding: '1.75rem',
                    borderRadius: '16px',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    justify: 'space-between',
                    gap: '1.25rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <div style={{ fontSize: '2.5rem' }}>{item.icon || '⚡'}</div>
                      <span className="badge badge-primary" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                        {item.difficulty}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                      {item.title}
                    </h3>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                      {item.description}
                    </p>

                    {/* Topics pills */}
                    <div style={{ marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
                        Evaluated Topics:
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {(item.topics || []).slice(0, 4).map((t, idx) => (
                          <span key={idx} style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span>⏱️ {item.durationMinutes} Mins</span>
                      <span>❓ {item.questionCount} Questions</span>
                      <span>🎯 {item.passingPercentage}% Pass Threshold</span>
                    </div>

                    <button
                      type="button"
                      className="assessment-btn-primary"
                      onClick={() => setSelectedAssessment(item)}
                    >
                      <span>✨</span> Start Assessment
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* START ASSESSMENT MODAL */}
          <AnimatePresence>
            {selectedAssessment && (
              <div className="profile-modal-overlay">
                <motion.div
                  className="profile-modal-container"
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  style={{ maxWidth: '520px' }}
                >
                  <div className="modal-header-bar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '2rem' }}>{selectedAssessment.icon || '⚡'}</span>
                      <div>
                        <h2 className="modal-title-text">{selectedAssessment.title}</h2>
                        <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: 0 }}>
                          {selectedAssessment.difficulty} Level • {selectedAssessment.durationMinutes} Minutes
                        </p>
                      </div>
                    </div>
                    <button type="button" onClick={() => setSelectedAssessment(null)} className="modal-close-btn">✕</button>
                  </div>

                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }}>
                      {selectedAssessment.description}
                    </p>

                    <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                      <strong style={{ color: '#A78BFA', fontSize: '0.88rem', display: 'block', marginBottom: '0.4rem' }}>
                        📋 Assessment Guidelines:
                      </strong>
                      <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                        <li>Contains {selectedAssessment.questionCount} multiple-choice technical questions.</li>
                        <li>Passing score requirement is <strong>{selectedAssessment.passingPercentage}%</strong>.</li>
                        <li>The countdown timer starts immediately once launched.</li>
                        <li>Passing awards a verified skill badge to your profile.</li>
                      </ul>
                    </div>
                  </div>

                  <div className="modal-footer-row" style={{ padding: '1.25rem 1.5rem' }}>
                    <button type="button" onClick={() => setSelectedAssessment(null)} className="btn-cancel-modal">
                      Cancel
                    </button>

                    <button
                      type="button"
                      className="assessment-btn-launch"
                      onClick={handleStartAssessment}
                      disabled={isStarting}
                    >
                      {isStarting ? 'Starting Session...' : '🚀 Launch Assessment'}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ========================================================= */}
      {/* STEP 2: LIVE ACTIVE ASSESSMENT SCREEN */}
      {/* ========================================================= */}
      {viewStep === 'session' && attempt && (
        <div>
          {/* TOP SESSION HEADER BAR */}
          <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', borderRadius: '16px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
                <span style={{ fontSize: '1.25rem' }}>{attempt.assessment?.icon || '⚡'}</span>
                <strong style={{ color: 'var(--text-primary)', fontSize: '1.1rem' }}>{attempt.assessment?.title}</strong>
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {/* Countdown Timer */}
              <div className={`timer-pill ${timeLeft < 180 ? 'warning' : ''}`}>
                <span>⏱️ Time Remaining:</span>
                <strong>{formatTime(timeLeft)}</strong>
              </div>

              <button
                type="button"
                onClick={() => setShowExitModal(true)}
                style={{
                  padding: '0.45rem 0.9rem',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#F87171',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                🚪 Exit
              </button>
            </div>
          </div>

          {/* PROGRESS BAR */}
          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden', marginBottom: '2rem' }}>
            <div
              style={{
                height: '100%',
                width: `${Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}%`,
                background: 'linear-gradient(90deg, #8B5CF6, #EC4899)',
                transition: 'width 0.4s ease'
              }}
            />
          </div>

          {/* QUESTION CARD */}
          {currentQuestion && (
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                  Topic: {currentQuestion.topic || 'General'}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Difficulty: {currentQuestion.difficulty || 'Medium'}
                </span>
              </div>

              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: '1.75rem' }}>
                {currentQuestion.questionText}
              </h2>

              {/* Options list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2rem' }}>
                {(currentQuestion.options || []).map((optText, optIdx) => {
                  const isSelected = selectedAnswers[currentQuestionIndex] === optIdx;

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(optIdx)}
                      className={`option-card ${isSelected ? 'selected' : ''}`}
                    >
                      <div className="option-indicator">
                        {String.fromCharCode(65 + optIdx)}
                      </div>
                      <span style={{ flex: 1 }}>{optText}</span>
                    </button>
                  );
                })}
              </div>

              {/* NAVIGATION BUTTONS */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <button
                  type="button"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                  style={{
                    padding: '0.7rem 1.4rem',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
                    opacity: currentQuestionIndex === 0 ? 0.5 : 1
                  }}
                >
                  ⬅ Previous
                </button>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {currentQuestionIndex < totalQuestions - 1 ? (
                    <button
                      type="button"
                      className="assessment-btn-launch"
                      onClick={() => setCurrentQuestionIndex(prev => Math.min(totalQuestions - 1, prev + 1))}
                    >
                      Next Question ➔
                    </button>
                  ) : null}

                  <button
                    type="button"
                    className="assessment-btn-launch"
                    onClick={() => setShowSubmitModal(true)}
                  >
                    🏁 Submit Assessment
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* EXIT CONFIRMATION MODAL */}
          <AnimatePresence>
            {showExitModal && (
              <div className="profile-modal-overlay">
                <motion.div
                  className="profile-modal-container"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  style={{ maxWidth: '420px', textAlign: 'center' }}
                >
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚠️</div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    Exit Assessment Session?
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                    Are you sure you want to leave? Your timer will continue running and you can resume anytime before time expires.
                  </p>
                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                    <button type="button" onClick={() => setShowExitModal(false)} className="btn-cancel-modal">
                      Continue Assessment
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowExitModal(false);
                        setViewStep('catalog');
                      }}
                      style={{ padding: '0.65rem 1.25rem', borderRadius: '10px', background: '#EF4444', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Yes, Exit
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* FINAL SUBMIT CONFIRMATION MODAL */}
          <AnimatePresence>
            {showSubmitModal && (
              <div className="profile-modal-overlay">
                <motion.div
                  className="profile-modal-container"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  style={{ maxWidth: '450px' }}
                >
                  <div className="modal-header-bar">
                    <h2 className="modal-title-text">Confirm Final Submission</h2>
                    <button type="button" onClick={() => setShowSubmitModal(false)} className="modal-close-btn">✕</button>
                  </div>

                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', textAlign: 'center' }}>
                      <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Answered</span>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10B981' }}>{answeredCount} / {totalQuestions}</div>
                      </div>
                      <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Unanswered</span>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FBBF24' }}>{totalQuestions - answeredCount}</div>
                      </div>
                    </div>

                    {totalQuestions - answeredCount > 0 && (
                      <p style={{ color: '#F87171', fontSize: '0.85rem', margin: 0, textAlign: 'center' }}>
                        ⚠️ You have {totalQuestions - answeredCount} unanswered questions. Unanswered questions will be scored as zero.
                      </p>
                    )}
                  </div>

                  <div className="modal-footer-row" style={{ padding: '1.25rem 1.5rem' }}>
                    <button type="button" onClick={() => setShowSubmitModal(false)} className="btn-cancel-modal">
                      Continue Assessment
                    </button>
                    <button
                      type="button"
                      className="assessment-btn-launch"
                      onClick={handleFinalComplete}
                      disabled={isCompleting}
                    >
                      {isCompleting ? 'Evaluating Results...' : 'Submit Assessment'}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ========================================================= */}
      {/* STEP 3: RESULTS SUMMARY SCREEN */}
      {/* ========================================================= */}
      {viewStep === 'results' && attempt && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="badge badge-primary" style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              ASSESSMENT COMPLETE 🎉
            </span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {attempt.assessment?.title} Results
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Here is your technical score, topic breakdown, and readiness level evaluation.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.75rem', marginBottom: '2.5rem' }}>
            {/* OVERALL SCORE CARD */}
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Overall Score Percentage
              </span>
              <div style={{ fontSize: '3.5rem', fontWeight: 900, color: attempt.passed ? '#10B981' : '#F59E0B', lineHeight: 1 }}>
                {attempt.percentage || 0}%
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <span style={{ padding: '0.35rem 0.9rem', borderRadius: '8px', background: attempt.passed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: attempt.passed ? '#10B981' : '#F87171', fontWeight: 800, fontSize: '0.9rem' }}>
                  {attempt.passed ? '✓ PASSED' : '✕ FAILED'}
                </span>
                <StatusBadge status={attempt.result?.readinessLevel || 'Evaluated'} />
              </div>
              <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
                Correct: {attempt.correctAnswersCount || 0} / {attempt.totalQuestions || 10} Questions
              </span>
            </div>

            {/* TOPIC MASTERY BREAKDOWN */}
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.85rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Topic Mastery Breakdown
              </h3>

              {(attempt.result?.topicBreakdown || []).map((tb, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.2rem' }}>
                    <span>{tb.topic} ({tb.correct}/{tb.total})</span>
                    <strong style={{ color: tb.percentage >= 70 ? '#10B981' : '#F59E0B' }}>{tb.percentage}%</strong>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${tb.percentage}%`, height: '100%', background: tb.percentage >= 70 ? '#10B981' : '#F59E0B', borderRadius: '3px' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* STRENGTHS & RECOMMENDATIONS */}
          <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
              Strengths & Actionable Guidance
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              <div style={{ padding: '1.25rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <strong style={{ color: '#34D399', fontSize: '0.95rem', display: 'block', marginBottom: '0.5rem' }}>
                  🌟 Strengths Identified:
                </strong>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                  {(attempt.result?.strengths || ['Completed assessment successfully.']).map((str, idx) => (
                    <li key={idx}>{str}</li>
                  ))}
                </ul>
              </div>

              <div style={{ padding: '1.25rem', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                <strong style={{ color: '#FBBF24', fontSize: '0.95rem', display: 'block', marginBottom: '0.5rem' }}>
                  💡 Recommendations & Next Steps:
                </strong>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                  {(attempt.result?.recommendations || ['Review weak topic areas.']).map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* BOTTOM ACTIONS */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => navigate('/assessments/history')}
              style={{ padding: '0.75rem 1.75rem', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}
            >
              📜 View in History
            </button>

            <button
              type="button"
              className="assessment-btn-launch"
              onClick={() => {
                setAttempt(null);
                setViewStep('catalog');
              }}
            >
              🔄 Take Another Assessment
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default SkillAssessment;
