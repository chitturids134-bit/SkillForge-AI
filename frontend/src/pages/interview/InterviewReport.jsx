import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import '../../styles/auth.css';
import '../../styles/interview.css';
import '../../styles/resume.css'; // Reuse common glassmorphism definitions

const API_URL = 'http://localhost:5004/api/interview';

function InterviewReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [downloading, setDownloading] = useState(false);

  // Fetch session analysis
  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/me`);
        const found = res.data.interviews?.find(item => item._id === id);
        if (found) {
          setSession(found);
        } else {
          setErrorMsg('Interview session report not found.');
        }
      } catch (err) {
        setErrorMsg(err.response?.data?.message || 'Failed to retrieve report data.');
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [id]);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      alert('PDF Report compilation mock active. Ready for API download integration!');
      setDownloading(false);
    }, 1500);
  };

  const getReadinessColor = (level) => {
    switch (level) {
      case 'Excellent': return '#10b981';
      case 'Very Good': return '#34d399';
      case 'Good': return '#3b82f6';
      case 'Needs Improvement': return '#f59e0b';
      case 'Beginner':
      default: return '#ef4444';
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-secondary)' }}>
        Loading Feedback Report...
      </div>
    );
  }

  if (errorMsg || !session) {
    return (
      <div className="interview-container" style={{ textAlign: 'center', padding: '3rem' }}>
        <div className="toast toast-error" style={{ position: 'static', margin: '0 auto 1.5rem auto', maxWidth: '500px' }}>
          {errorMsg || 'Report not found'}
        </div>
        <button type="button" className="auth-btn" onClick={() => navigate('/interview/history')}>
          Back to History
        </button>
      </div>
    );
  }

  const analysis = session.analysis || {
    technicalScore: 0,
    communicationScore: 0,
    confidenceScore: 0,
    problemSolvingScore: 0,
    readinessLevel: 'Beginner',
    strengths: ['Practice completed.'],
    weaknesses: ['Elaboration depth.'],
    suggestions: ['Structure responses using STAR method.']
  };

  const radius = 60;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (session.overallScore / 100) * circumference;

  const sectionScores = [
    { label: 'Technical depth', value: analysis.technicalScore, color: '#3b82f6' },
    { label: 'Elaboration & Communication', value: analysis.communicationScore, color: '#10b981' },
    { label: 'Confidence & Completion', value: analysis.confidenceScore, color: '#f59e0b' },
    { label: 'Problem Solving Structuring', value: analysis.problemSolvingScore, color: '#8b5cf6' }
  ];

  return (
    <div className="interview-container" style={{ maxWidth: '900px' }}>
      <div className="interview-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="interview-title">AI Feedback Report</h1>
          <p className="interview-subtitle">
            Practice session analysis completed on {new Date(session.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="button" className="logout-btn" style={{ margin: 0 }} onClick={() => navigate('/interview/history')}>
            Back to History
          </button>
          <button type="button" className="auth-btn" style={{ margin: 0 }} onClick={handleDownload} disabled={downloading}>
            {downloading ? 'Downloading...' : 'Download Report'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Overall Circular Score Card */}
        <motion.div 
          className="glass-panel" 
          style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-primary)', fontSize: '1.2rem' }}>Overall Interview Rating</h3>
          
          <div style={{ position: 'relative', width: '140px', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg style={{ transform: 'rotate(-90deg)', width: '140px', height: '140px' }}>
              <circle cx="70" cy="70" r={radius} fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} />
              <motion.circle 
                cx="70" 
                cy="70" 
                r={radius} 
                fill="transparent" 
                stroke={getReadinessColor(analysis.readinessLevel)} 
                strokeWidth={strokeWidth} 
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
            </svg>
            <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)' }}>{session.overallScore}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>score</span>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Interview Readiness Level</span>
            <span 
              className="session-badge" 
              style={{ 
                margin: 0, 
                fontSize: '1rem', 
                padding: '0.4rem 1.2rem',
                backgroundColor: `${getReadinessColor(analysis.readinessLevel)}20`,
                borderColor: getReadinessColor(analysis.readinessLevel),
                color: getReadinessColor(analysis.readinessLevel)
              }}
            >
              {analysis.readinessLevel}
            </span>
          </div>
        </motion.div>

        {/* Section Metrics Progress Bars */}
        <motion.div 
          className="glass-panel" 
          style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '1.2rem' }}>Evaluation Breakdown</h3>
          
          {sectionScores.map((sec, idx) => (
            <div key={idx} className="interview-progress-container" style={{ margin: 0 }}>
              <div className="progress-labels">
                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{sec.label}</span>
                <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{sec.value}/100</span>
              </div>
              <div className="progress-bg" style={{ height: '10px' }}>
                <motion.div 
                  className="progress-bar" 
                  style={{ height: '100%', backgroundColor: sec.color, backgroundImage: 'none' }} 
                  initial={{ width: 0 }}
                  animate={{ width: `${sec.value}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.2 + idx * 0.1 }}
                />
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Strengths, Weaknesses, Suggestions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <motion.div 
          className="glass-panel" 
          style={{ padding: '1.5rem', borderLeft: '4px solid #10b981' }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h4 style={{ color: '#10b981', margin: '0 0 1rem 0', fontSize: '1.05rem', fontWeight: '700' }}>👍 Strengths</h4>
          <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {analysis.strengths.map((str, idx) => <li key={idx}>{str}</li>)}
          </ul>
        </motion.div>

        <motion.div 
          className="glass-panel" 
          style={{ padding: '1.5rem', borderLeft: '4px solid #ef4444' }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <h4 style={{ color: '#ef4444', margin: '0 0 1rem 0', fontSize: '1.05rem', fontWeight: '700' }}>👎 Weaknesses</h4>
          <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {analysis.weaknesses.map((wk, idx) => <li key={idx}>{wk}</li>)}
          </ul>
        </motion.div>

        <motion.div 
          className="glass-panel" 
          style={{ padding: '1.5rem', borderLeft: '4px solid #f59e0b' }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <h4 style={{ color: '#f59e0b', margin: '0 0 1rem 0', fontSize: '1.05rem', fontWeight: '700' }}>💡 Suggestions</h4>
          <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {analysis.suggestions.map((sug, idx) => <li key={idx}>{sug}</li>)}
          </ul>
        </motion.div>
      </div>

      {/* Answer Responses History details */}
      <motion.div 
        className="glass-panel" 
        style={{ padding: '2rem' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-primary)', fontSize: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          Response Log & Question Transcript
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {session.questions?.map((q, idx) => (
            <div key={q._id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
              <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Q{idx + 1}: {q.question}
              </div>
              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
                {q.answer || <em>No answer provided.</em>}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default InterviewReport;
