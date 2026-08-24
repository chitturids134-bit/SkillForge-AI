import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  startInterview,
  getActiveInterview,
  submitAnswer,
  completeInterview,
  getUserInterviews,
} from '../../services/interviewService';
import GradientButton from '../../components/common/GradientButton';
import StatusBadge from '../../components/common/StatusBadge';
import '../../styles/auth.css';
import '../../styles/interview.css';
import '../../styles/profile.css';

function InterviewPrep() {
  const navigate = useNavigate();
  const location = useLocation();

  // Wizard Steps: 'landing' | 'session' | 'results'
  const [viewStep, setViewStep] = useState('landing');

  // Stats from backend history
  const [stats, setStats] = useState({ completed: 0, avgScore: 0, bestScore: 0 });

  // Config modal state
  const [configModal, setConfigModal] = useState(null); // { type: 'Technical' | 'HR' | 'Behavioral' }
  const [selectedDifficulty, setSelectedDifficulty] = useState('Intermediate');
  const [selectedQuestionCount, setSelectedQuestionCount] = useState(5);

  // Active Session state
  const [session, setSession] = useState(null); // MongoDB interview object
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [lastEvaluation, setLastEvaluation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // Confirmation modal for Exit Interview
  const [showExitModal, setShowExitModal] = useState(false);

  // Messages
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1. Check for Active Session on Mount (Refresh Recovery) & Load Stats
  useEffect(() => {
    const initPage = async () => {
      try {
        // Load stats from user history
        const userHist = await getUserInterviews();
        if (userHist && userHist.interviews && userHist.interviews.length > 0) {
          const completedList = userHist.interviews.filter(i => i.completed);
          const completedCount = completedList.length;
          const scores = completedList.map(i => i.overallScore || 0);
          const avg = completedCount > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / completedCount) : 0;
          const max = completedCount > 0 ? Math.max(...scores) : 0;
          setStats({ completed: completedCount, avgScore: avg, bestScore: max });
        }

        // Check active in-progress session
        const activeRes = await getActiveInterview();
        if (activeRes && activeRes.session) {
          setSession(activeRes.session);
          setViewStep('session');
          // Restore answer if already answered current question
          const idx = activeRes.session.currentQuestionIndex || 0;
          const currentQ = activeRes.session.questions[idx];
          if (currentQ && currentQ.answer) {
            setCurrentAnswer(currentQ.answer);
            if (currentQ.score > 0 || currentQ.feedback) {
              setLastEvaluation({
                score: currentQ.score,
                feedback: currentQ.feedback,
                strengths: currentQ.strengths || [],
                improvements: currentQ.improvements || [],
              });
            }
          }
        }
      } catch (err) {
        console.error('Init InterviewPrep error:', err);
      }
    };

    initPage();
  }, []);

  // Handle Retake trigger from route state
  useEffect(() => {
    if (location.state?.retake && viewStep === 'landing') {
      const { category, difficulty, questionCount } = location.state.retake;
      setConfigModal({ type: category || 'Technical' });
      if (difficulty) setSelectedDifficulty(difficulty);
      if (questionCount) setSelectedQuestionCount(questionCount);
    }
  }, [location.state, viewStep]);

  // 2. Start Interview Session
  const handleLaunchInterview = async () => {
    if (!configModal?.type) return;

    try {
      setIsStarting(true);
      setErrorMsg('');
      const res = await startInterview({
        type: configModal.type,
        difficulty: selectedDifficulty,
        questionCount: selectedQuestionCount,
      });

      if (res && res.session) {
        setSession(res.session);
        setConfigModal(null);
        setCurrentAnswer('');
        setLastEvaluation(null);
        setViewStep('session');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Unable to start the interview. Please try again.');
    } finally {
      setIsStarting(false);
    }
  };

  // 3. Submit Current Question Answer
  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!session || !currentAnswer.trim()) {
      setErrorMsg('Please enter an answer before continuing.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');

      const idx = session.currentQuestionIndex || 0;
      const res = await submitAnswer(session._id, {
        questionIndex: idx,
        answer: currentAnswer.trim(),
      });

      if (res && res.evaluation) {
        setLastEvaluation(res.evaluation);
        if (res.session) {
          setSession(res.session);
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Your answer could not be evaluated. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Proceed to Next Question
  const handleNextQuestion = () => {
    setLastEvaluation(null);
    setCurrentAnswer('');
    setErrorMsg('');
  };

  // 5. Complete Interview Session
  const handleCompleteInterview = async () => {
    if (!session) return;

    try {
      setIsCompleting(true);
      setErrorMsg('');

      const res = await completeInterview(session._id);
      if (res && res.interview) {
        setSession(res.interview);
        setViewStep('results');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to complete the interview session.');
    } finally {
      setIsCompleting(false);
    }
  };

  // Category Config Items
  const categories = [
    {
      key: 'Technical',
      title: 'Technical Interview',
      desc: 'Practice technical coding concepts, web architectures, backend security, and role-tailored system engineering.',
      icon: '💻',
      badge: 'PROFILE TAILORED',
      badgeClass: 'badge-tech',
      duration: '15 - 20 mins',
      focus: ['Technical Depth', 'Architecture', 'Problem Solving']
    },
    {
      key: 'HR',
      title: 'HR & Cultural Interview',
      desc: 'Refine your personal introduction, career motivations, strengths, conflict resolution, and teamwork values.',
      icon: '🤝',
      badge: 'CULTURE FIT',
      badgeClass: 'badge-hr',
      duration: '10 - 15 mins',
      focus: ['Communication', 'Career Goals', 'Self-Awareness']
    },
    {
      key: 'Behavioral',
      title: 'Behavioral Interview',
      desc: 'Structure real-world past project experiences using the STAR (Situation, Task, Action, Result) methodology.',
      icon: '🎯',
      badge: 'STAR METHODOLOGY',
      badgeClass: 'badge-behavioral',
      duration: '15 mins',
      focus: ['Ownership', 'Leadership', 'Measurable Impact']
    }
  ];

  return (
    <div style={{ padding: '2rem', width: '100%' }}>
      {errorMsg && <div className="toast toast-error" style={{ marginBottom: '1.5rem' }}>{errorMsg}</div>}
      {successMsg && <div className="toast toast-success" style={{ marginBottom: '1.5rem' }}>{successMsg}</div>}

      {/* ========================================================= */}
      {/* STEP 1: LANDING / CATEGORY SELECTION PAGE */}
      {/* ========================================================= */}
      {viewStep === 'landing' && (
        <div>
          {/* HEADER */}
          <div style={{ marginBottom: '2.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="interview-eyebrow-badge">
                ✨ AI-POWERED INTERVIEW PRACTICE
              </span>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1.25 }}>
                AI Interview Preparation
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.35rem', fontSize: '0.925rem' }}>
                Practice mock interviews, receive instant AI evaluation feedback, and improve your confidence.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/interview/history')}
              className="interview-btn-history"
            >
              <span>📜</span> View Past History
            </button>
          </div>

          {/* TOP KPI STATS CARDS */}
          <div className="interview-kpi-grid">
            <div className="interview-kpi-card">
              <div className="interview-kpi-icon-box purple-blue">
                <span>📊</span>
              </div>
              <div>
                <span className="interview-kpi-label">Completed Practice Sessions</span>
                <div className="interview-kpi-value text-purple-blue">
                  {stats.completed}
                </div>
              </div>
            </div>

            <div className="interview-kpi-card">
              <div className="interview-kpi-icon-box purple">
                <span>🎯</span>
              </div>
              <div>
                <span className="interview-kpi-label">Average Interview Score</span>
                <div className="interview-kpi-value text-purple">
                  {stats.avgScore}%
                </div>
              </div>
            </div>

            <div className="interview-kpi-card">
              <div className="interview-kpi-icon-box green">
                <span>🏆</span>
              </div>
              <div>
                <span className="interview-kpi-label">Highest Score Achieved</span>
                <div className="interview-kpi-value text-green">
                  {stats.bestScore}%
                </div>
              </div>
            </div>
          </div>

          {/* THREE MAIN INTERVIEW CARDS */}
          <div className="interview-cards-grid-redesigned">
            {categories.map((cat) => (
              <motion.div
                key={cat.key}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
                className="interview-category-card"
              >
                {/* Top Content Block */}
                <div className="interview-category-top-content">
                  {/* Header Icon Container & Category Badge */}
                  <div className="interview-category-header-row">
                    <div className={`interview-icon-container ${cat.key.toLowerCase()}`}>
                      {cat.icon}
                    </div>
                    <span className={`badge ${cat.badgeClass} interview-category-badge`}>
                      {cat.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="interview-category-title">
                    {cat.title}
                  </h3>
                  <p className="interview-category-desc">
                    {cat.desc}
                  </p>

                  {/* Key Focus Areas */}
                  <div className="interview-focus-section">
                    <span className="interview-focus-label">
                      KEY FOCUS AREAS:
                    </span>
                    <div className="interview-focus-tags">
                      {cat.focus.map((item, idx) => (
                        <span key={idx} className="interview-focus-tag-pill">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Footer & CTA Button */}
                <div className="interview-category-footer">
                  <div className="interview-duration-row">
                    <span>⏱️ Est. Duration:</span>
                    <strong>{cat.duration}</strong>
                  </div>

                  <button
                    type="button"
                    onClick={() => setConfigModal({ type: cat.key })}
                    className="interview-start-cta-btn"
                  >
                    <span>✨</span> Start {cat.key} Interview
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CONFIGURATION MODAL */}
          <AnimatePresence>
            {configModal && (
              <div className="profile-modal-overlay">
                <motion.div
                  className="profile-modal-container"
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  style={{ maxWidth: '520px' }}
                >
                  <div className="modal-header-bar">
                    <div>
                      <h2 className="modal-title-text">Configure {configModal.type} Interview</h2>
                      <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: 0 }}>
                        Select your preferred difficulty level and question length.
                      </p>
                    </div>
                    <button type="button" onClick={() => setConfigModal(null)} className="modal-close-btn">✕</button>
                  </div>

                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Question Count Select */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                        Number of Questions
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                        {[5, 10, 15].map((cnt) => (
                          <button
                            key={cnt}
                            type="button"
                            onClick={() => setSelectedQuestionCount(cnt)}
                            style={{
                              padding: '0.65rem',
                              borderRadius: '8px',
                              border: selectedQuestionCount === cnt ? '2px solid var(--accent-primary, #8B5CF6)' : '1px solid var(--border-color)',
                              background: selectedQuestionCount === cnt ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255,255,255,0.03)',
                              color: 'var(--text-primary)',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            {cnt} Questions
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Difficulty Select */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                        Target Difficulty
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                        {['Beginner', 'Intermediate', 'Advanced'].map((diff) => (
                          <button
                            key={diff}
                            type="button"
                            onClick={() => setSelectedDifficulty(diff)}
                            style={{
                              padding: '0.65rem',
                              borderRadius: '8px',
                              border: selectedDifficulty === diff ? '2px solid var(--accent-primary, #8B5CF6)' : '1px solid var(--border-color)',
                              background: selectedDifficulty === diff ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255,255,255,0.03)',
                              color: 'var(--text-primary)',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            {diff}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer-row" style={{ padding: '1.25rem 1.5rem' }}>
                    <button type="button" onClick={() => setConfigModal(null)} className="btn-cancel-modal">
                      Cancel
                    </button>

                    <button
                      type="button"
                      className="interview-start-cta-btn"
                      onClick={handleLaunchInterview}
                      disabled={isStarting}
                      style={{ padding: '0 1.5rem', width: 'auto' }}
                    >
                      {isStarting ? 'Generating Interview...' : '🚀 Launch Practice Session'}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ========================================================= */}
      {/* STEP 2: LIVE ACTIVE INTERVIEW SESSION */}
      {/* ========================================================= */}
      {viewStep === 'session' && session && (
        <div>
          {/* SESSION TOP BAR */}
          <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', borderRadius: '16px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
                <span className="badge badge-primary">{session.category} Interview</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>• {session.difficulty} Level</span>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Question {(session.currentQuestionIndex || 0) + 1} of {session.questionCount || session.questions.length}
              </h3>
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
              🚪 Exit Interview
            </button>
          </div>

          {/* PROGRESS BAR */}
          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden', marginBottom: '2rem' }}>
            <div
              style={{
                height: '100%',
                width: `${Math.round((((session.currentQuestionIndex || 0) + 1) / (session.questionCount || session.questions.length)) * 100)}%`,
                background: 'linear-gradient(90deg, #8B5CF6, #EC4899)',
                transition: 'width 0.4s ease'
              }}
            />
          </div>

          {/* QUESTION CARD & ANSWER FORM */}
          <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', marginBottom: '2rem' }}>
            <div style={{ fontSize: '0.825rem', color: 'var(--accent-primary, #8B5CF6)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Question Prompt
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              {session.questions[session.currentQuestionIndex || 0]?.question}
            </h2>

            {/* Answer Input */}
            <form onSubmit={handleSubmitAnswer}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Your Response (Use detailed technical explanation or STAR framework):
                </label>
                <textarea
                  rows={6}
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Type your response here..."
                  disabled={Boolean(lastEvaluation)}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: '12px',
                    background: 'var(--bg-secondary, rgba(0,0,0,0.3))',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem',
                    lineHeight: 1.5,
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {!lastEvaluation ? (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    className="interview-start-cta-btn"
                    disabled={isSubmitting || !currentAnswer.trim()}
                    style={{ padding: '0 1.75rem', width: 'auto' }}
                  >
                    {isSubmitting ? 'Evaluating Response...' : 'Submit Answer'}
                  </button>
                </div>
              ) : null}
            </form>
          </div>

          {/* EVALUATION FEEDBACK CARD */}
          {lastEvaluation && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel"
              style={{
                padding: '2rem',
                borderRadius: '16px',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                background: 'rgba(139, 92, 246, 0.05)',
                marginBottom: '2rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  🎯 AI Answer Evaluation
                </h3>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-success, #10B981)', padding: '0.3rem 0.8rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)' }}>
                  Score: {lastEvaluation.score} / 100
                </span>
              </div>

              <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                {lastEvaluation.feedback}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                {/* Strengths */}
                {lastEvaluation.strengths && lastEvaluation.strengths.length > 0 && (
                  <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <strong style={{ color: '#34D399', fontSize: '0.88rem', display: 'block', marginBottom: '0.5rem' }}>
                      ✓ Strengths Identified:
                    </strong>
                    <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {lastEvaluation.strengths.map((s, i) => (
                        <li key={i} style={{ marginBottom: '0.25rem' }}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Areas for Improvement */}
                {lastEvaluation.improvements && lastEvaluation.improvements.length > 0 && (
                  <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                    <strong style={{ color: '#FBBF24', fontSize: '0.88rem', display: 'block', marginBottom: '0.5rem' }}>
                      💡 Areas for Improvement:
                    </strong>
                    <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {lastEvaluation.improvements.map((imp, i) => (
                        <li key={i} style={{ marginBottom: '0.25rem' }}>{imp}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                {(session.currentQuestionIndex || 0) < (session.questionCount || session.questions.length) - 1 ? (
                  <GradientButton onClick={handleNextQuestion} style={{ padding: '0.75rem 1.75rem' }}>
                    Next Question ➔
                  </GradientButton>
                ) : (
                  <GradientButton onClick={handleCompleteInterview} disabled={isCompleting} style={{ padding: '0.75rem 1.75rem' }}>
                    {isCompleting ? 'Calculating Final Results...' : '🏁 Complete Interview'}
                  </GradientButton>
                )}
              </div>
            </motion.div>
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
                    Exit Interview Session?
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                    Are you sure you want to leave? Your active progress will be saved so you can resume anytime.
                  </p>
                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setShowExitModal(false)}
                      className="btn-cancel-modal"
                    >
                      Continue Interview
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowExitModal(false);
                        setViewStep('landing');
                      }}
                      style={{
                        padding: '0.65rem 1.25rem',
                        borderRadius: '10px',
                        background: '#EF4444',
                        color: 'white',
                        border: 'none',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Yes, Exit
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ========================================================= */}
      {/* STEP 3: FINAL RESULTS SUMMARY PAGE */}
      {/* ========================================================= */}
      {viewStep === 'results' && session && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="badge badge-primary" style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              PRACTICE SESSION COMPLETE
            </span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Interview Results & Feedback
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Here is your overall performance breakdown and personalized career feedback.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.75rem', marginBottom: '2.5rem' }}>
            {/* OVERALL SCORE CARD */}
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Overall Performance Score
              </span>
              <div style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--accent-primary, #8B5CF6)', lineHeight: 1 }}>
                {session.overallScore || 80} <span style={{ fontSize: '1.5rem', color: 'var(--text-secondary)' }}>/ 100</span>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <StatusBadge status={session.analysis?.readinessLevel || 'Strong Performance'} />
              </div>
            </div>

            {/* PERFORMANCE METRICS BREAKDOWN */}
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Category Breakdown Metrics
              </h3>

              {[
                { label: 'Technical Understanding', val: session.analysis?.technicalScore || 82, color: '#8B5CF6' },
                { label: 'Elaboration & Communication', val: session.analysis?.communicationScore || 78, color: '#3B82F6' },
                { label: 'Problem Solving Structuring', val: session.analysis?.problemSolvingScore || 85, color: '#10B981' },
                { label: 'Confidence & Completion', val: session.analysis?.confidenceScore || 90, color: '#F59E0B' },
              ].map((metric, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.25rem' }}>
                    <span>{metric.label}</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{metric.val}%</strong>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${metric.val}%`, height: '100%', background: metric.color, borderRadius: '3px' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SUMMARY FEEDBACK & RECOMMENDATIONS */}
          <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
              Performance Summary & Guidance
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              <div style={{ padding: '1.25rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <strong style={{ color: '#34D399', fontSize: '0.95rem', display: 'block', marginBottom: '0.5rem' }}>
                  🌟 What You Did Well:
                </strong>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                  {(session.analysis?.strengths || ['Completed practice session successfully.']).map((str, idx) => (
                    <li key={idx}>{str}</li>
                  ))}
                </ul>
              </div>

              <div style={{ padding: '1.25rem', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                <strong style={{ color: '#FBBF24', fontSize: '0.95rem', display: 'block', marginBottom: '0.5rem' }}>
                  🎯 Recommended Practice Areas:
                </strong>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                  {(session.analysis?.suggestions || ['Utilize the STAR framework for behavioral responses.']).map((sug, idx) => (
                    <li key={idx}>{sug}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* BOTTOM ACTIONS */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => navigate('/interview/history')}
              style={{
                padding: '0.75rem 1.75rem',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              📜 View in History
            </button>

            <button
              type="button"
              className="interview-start-cta-btn"
              onClick={() => {
                setSession(null);
                setLastEvaluation(null);
                setCurrentAnswer('');
                setViewStep('landing');
              }}
              style={{ padding: '0 2rem', width: 'auto' }}
            >
              🔄 Practice Another Interview
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default InterviewPrep;
