import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { interviewQuestions } from '../../data/interviewQuestions';
import '../../styles/auth.css';
import '../../styles/interview.css';

const API_URL = 'http://localhost:5004/api/interview';

function InterviewPrep() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Wizard Steps: 'category' | 'config' | 'session' | 'summary'
  const [step, setStep] = useState('category');
  
  // Selection states
  const [category, setCategory] = useState('Technical');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [questionCount, setQuestionCount] = useState(5);

  // Check for retake states
  useEffect(() => {
    if (location.state?.retake) {
      const { category: rCat, difficulty: rDiff, questionCount: rCount } = location.state.retake;
      setCategory(rCat);
      setDifficulty(rDiff);
      setQuestionCount(rCount);
      setStep('config');
    }
  }, [location.state]);

  // Active session states
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Status states
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Categories config
  const categoriesList = [
    { key: 'Technical', label: 'Technical Interview', desc: 'Practice technical coding concepts, systems architectures, web hooks, and databases.', icon: '💻', badgeClass: 'badge-tech' },
    { key: 'HR', label: 'HR Interview', desc: 'Refine your behavioral communication, values alignment, goals, and culture questions.', icon: '🤝', badgeClass: 'badge-hr' },
    { key: 'Behavioral', label: 'Behavioral Interview', desc: 'Structure your answers using STAR methodology to showcase teamwork and conflict resolution.', icon: '🎯', badgeClass: 'badge-behavioral' },
  ];

  // Shuffles and selects questions based on selections
  const handleStartSetup = () => {
    const pool = interviewQuestions[category][difficulty];
    // Shuffle pool
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    
    let selected = [];
    if (questionCount <= shuffled.length) {
      selected = shuffled.slice(0, questionCount);
    } else {
      selected = [...shuffled];
      while (selected.length < questionCount) {
        const randomItem = shuffled[Math.floor(Math.random() * shuffled.length)];
        selected.push(randomItem);
      }
    }

    // Map to db format questions
    const sessionQuestions = selected.map(q => ({
      question: q.question,
      answer: '',
      score: 0
    }));

    setActiveQuestions(sessionQuestions);
    setAnswers(new Array(questionCount).fill(''));
    setCurrentIndex(0);
    setStep('session');
    setErrorMsg('');
    setSuccessMsg('');
  };

  // Navigations
  const handleNext = () => {
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleAnswerChange = (val) => {
    const updated = [...answers];
    updated[currentIndex] = val;
    setAnswers(updated);
  };

  const handleFinish = () => {
    setStep('summary');
  };

  // Calculations for summary
  const answeredCount = answers.filter(a => a && a.trim() !== '').length;
  const completionPercentage = Math.round((answeredCount / questionCount) * 100);

  // Save Session to MongoDB
  const handleSaveSession = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setSaving(true);

    // Merge answers into the active questions structure
    const finalizedQuestions = activeQuestions.map((q, idx) => ({
      ...q,
      answer: answers[idx] || '',
      // Mock score based on length of response to look realistic
      score: answers[idx] && answers[idx].trim().length > 20 ? Math.min(100, Math.floor(Math.random() * 20) + 80) : 0
    }));

    // Mock overall score based on average score of answered questions
    const overallScore = finalizedQuestions.filter(q => q.score > 0).length > 0
      ? Math.round(finalizedQuestions.reduce((acc, q) => acc + q.score, 0) / finalizedQuestions.length)
      : 0;

    const payload = {
      category,
      difficulty,
      questions: finalizedQuestions,
      overallScore,
      completed: true
    };

    try {
      await axios.post(API_URL, payload);
      setSuccessMsg('Interview session saved successfully!');
      setTimeout(() => {
        setSuccessMsg('');
        setStep('category');
      }, 2500);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error saving interview session');
    } finally {
      setSaving(false);
    }
  };

  const handleStartNew = () => {
    setStep('category');
    setErrorMsg('');
    setSuccessMsg('');
  };

  const activeCategoryObj = categoriesList.find(c => c.key === category);
  const currentPercentage = activeQuestions.length > 0 
    ? Math.round((currentIndex / activeQuestions.length) * 100) 
    : 0;

  return (
    <div className="interview-container">
      {successMsg && <div className="toast toast-success">{successMsg}</div>}
      {errorMsg && <div className="toast toast-error">{errorMsg}</div>}

      {/* STEP 1: CATEGORY SELECTION */}
      {step === 'category' && (
        <div>
          <div className="interview-header">
            <h1 className="interview-title">AI Interview Preparation</h1>
            <p className="interview-subtitle">Practice interviews and improve your confidence.</p>
          </div>

          <div className="interview-cards-grid">
            {categoriesList.map(cat => (
              <div key={cat.key} className="interview-card">
                <div>
                  <div className="interview-card-icon">{cat.icon}</div>
                  <h3 className="interview-card-title">{cat.label}</h3>
                  <p className="interview-card-desc">{cat.desc}</p>
                </div>
                <button
                  type="button"
                  className="auth-btn"
                  style={{ margin: 0, width: '100%' }}
                  onClick={() => {
                    setCategory(cat.key);
                    setStep('config');
                  }}
                >
                  Start {cat.key}
                </button>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              className="logout-btn"
              onClick={() => navigate('/developer/dashboard')}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: CONFIGURATION */}
      {step === 'config' && (
        <motion.div
          className="interview-wizard-card glass-panel"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="auth-title" style={{ textAlign: 'left', marginBottom: '0.5rem' }}>
            Configure {category} Interview
          </h2>
          <p className="auth-subtitle" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
            Set difficulty and quantity parameters to generate questions.
          </p>

          <div className="wizard-form">
            <div className="form-group">
              <label className="form-label" htmlFor="difficulty">Difficulty Level</label>
              <select
                id="difficulty"
                className="form-select"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="questionCount">Number of Questions</label>
              <select
                id="questionCount"
                className="form-select"
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value))}
              >
                <option value="5">5 Questions</option>
                <option value="10">10 Questions</option>
                <option value="15">15 Questions</option>
              </select>
            </div>

            <div className="wizard-actions">
              <button
                type="button"
                className="wizard-nav-btn btn-secondary"
                onClick={() => setStep('category')}
              >
                Back
              </button>
              <button
                type="button"
                className="wizard-nav-btn btn-primary"
                onClick={handleStartSetup}
              >
                Start Interview
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* STEP 3: SESSION VIEW */}
      {step === 'session' && activeQuestions.length > 0 && (
        <motion.div
          className="interview-session-card glass-panel"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="session-header">
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>
              Session in Progress
            </h3>
            <span className={`session-badge ${activeCategoryObj?.badgeClass}`}>
              {category} • {difficulty}
            </span>
          </div>

          {/* Progress Indicator */}
          <div className="interview-progress-container">
            <div className="progress-labels">
              <span>Question {currentIndex + 1} of {activeQuestions.length}</span>
              <span>{currentPercentage}% Completed</span>
            </div>
            <div className="progress-bg">
              <div className="progress-bar" style={{ width: `${currentPercentage}%` }} />
            </div>
          </div>

          {/* Question Text & Answer Area */}
          <div className="question-block">
            <div className="question-text">
              Q{currentIndex + 1}: {activeQuestions[currentIndex].question}
            </div>
            <textarea
              className="answer-input-area"
              rows="8"
              placeholder="Type your detailed answer here..."
              value={answers[currentIndex] || ''}
              onChange={(e) => handleAnswerChange(e.target.value)}
            />
          </div>

          {/* Nav buttons */}
          <div className="wizard-actions">
            <button
              type="button"
              className="wizard-nav-btn btn-secondary"
              onClick={handlePrev}
              disabled={currentIndex === 0}
            >
              ◀ Previous
            </button>

            {currentIndex === activeQuestions.length - 1 ? (
              <button
                type="button"
                className="wizard-nav-btn btn-success"
                onClick={handleFinish}
              >
                Finish Interview Check ✓
              </button>
            ) : (
              <button
                type="button"
                className="wizard-nav-btn btn-primary"
                onClick={handleNext}
              >
                Next ▶
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* STEP 4: SUMMARY */}
      {step === 'summary' && (
        <motion.div
          className="interview-wizard-card glass-panel"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ maxWidth: '700px' }}
        >
          <h2 className="auth-title" style={{ textAlign: 'left', marginBottom: '0.5rem' }}>
            Interview Completed!
          </h2>
          <p className="auth-subtitle" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
            Review your session details below before saving.
          </p>

          <div className="summary-stats-grid">
            <div className="summary-stat-box">
              <span className="summary-stat-label">Category</span>
              <span className="summary-stat-value" style={{ color: activeCategoryObj?.badgeClass ? 'var(--accent-primary)' : 'inherit' }}>
                {category}
              </span>
            </div>
            <div className="summary-stat-box">
              <span className="summary-stat-label">Difficulty</span>
              <span className="summary-stat-value">{difficulty}</span>
            </div>
            <div className="summary-stat-box">
              <span className="summary-stat-label">Questions Answered</span>
              <span className="summary-stat-value">{answeredCount} / {questionCount}</span>
            </div>
            <div className="summary-stat-box">
              <span className="summary-stat-label">Completion %</span>
              <span className="summary-stat-value">{completionPercentage}%</span>
            </div>
          </div>

          <div className="wizard-actions">
            <button
              type="button"
              className="wizard-nav-btn btn-secondary"
              onClick={handleStartNew}
              disabled={saving}
            >
              Start New Interview
            </button>
            <button
              type="button"
              className="wizard-nav-btn btn-success"
              onClick={handleSaveSession}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Interview'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default InterviewPrep;
