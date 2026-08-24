import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import StatusBadge from '../../components/common/StatusBadge';
import '../../styles/resume.css';

function RecruiterInterviewDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Human Recruiter Evaluation Form State
  const [technicalScore, setTechnicalScore] = useState(80);
  const [communicationScore, setCommunicationScore] = useState(80);
  const [problemSolvingScore, setProblemSolvingScore] = useState(80);
  const [cultureFitScore, setCultureFitScore] = useState(80);
  const [strengths, setStrengths] = useState('');
  const [weaknesses, setWeaknesses] = useState('');
  const [notes, setNotes] = useState('');
  const [recommendation, setRecommendation] = useState('shortlisted');

  const [submittingEval, setSubmittingEval] = useState(false);
  const [submittingDecision, setSubmittingDecision] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/interviews/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && (res.data.interview || res.data.data)) {
        const doc = res.data.interview || res.data.data;
        setInterview(doc);
        
        // Populate existing evaluation if already present
        if (doc.recruiterEvaluation) {
          setTechnicalScore(doc.recruiterEvaluation.technicalScore || 80);
          setCommunicationScore(doc.recruiterEvaluation.communicationScore || 80);
          setProblemSolvingScore(doc.recruiterEvaluation.problemSolvingScore || 80);
          setCultureFitScore(doc.recruiterEvaluation.cultureFitScore || 80);
          setStrengths(doc.recruiterEvaluation.strengths || '');
          setWeaknesses(doc.recruiterEvaluation.weaknesses || '');
          setNotes(doc.recruiterEvaluation.notes || doc.notes || '');
          setRecommendation(doc.recruiterEvaluation.recommendation || 'shortlisted');
        } else {
          setNotes(doc.notes || '');
        }
      } else {
        setError('Interview record not found.');
      }
    } catch (err) {
      console.error('Fetch Recruiter Interview Detail Error:', err);
      setError(err.response?.data?.message || err.message || 'Unable to fetch interview review details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  // Submit Recruiter Evaluation (Manual Human Interview Scoring)
  const handleEvalSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmittingEval(true);
      setFeedbackMsg(null);
      const token = localStorage.getItem('token');

      const res = await axios.post(`/api/interviews/${id}/recruiter-evaluation`, {
        technicalScore,
        communicationScore,
        problemSolvingScore,
        cultureFitScore,
        strengths,
        weaknesses,
        notes,
        recommendation
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data && res.data.success) {
        setFeedbackMsg({ type: 'success', text: 'Recruiter evaluation submitted successfully!' });
        fetchDetail();
      }
    } catch (err) {
      console.error('Submit Evaluation Error:', err);
      setFeedbackMsg({ type: 'error', text: err.response?.data?.message || 'Failed to submit evaluation.' });
    } finally {
      setSubmittingEval(false);
    }
  };

  // Submit Final Hiring Decision
  const handleDecision = async (decisionType) => {
    try {
      setSubmittingDecision(true);
      setFeedbackMsg(null);
      const token = localStorage.getItem('token');
      const res = await axios.post(`/api/recruiter/interviews/${id}/decision`, {
        decision: decisionType,
        notes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data && res.data.success) {
        setFeedbackMsg({ type: 'success', text: `Hiring decision updated to ${decisionType.toUpperCase()}! ✓` });
        fetchDetail();
      }
    } catch (err) {
      console.error('Recruiter Decision Error:', err);
      setFeedbackMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update decision.' });
    } finally {
      setSubmittingDecision(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading Recruiter Interview workspace...
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div style={{ padding: '2rem', width: '100%' }}>
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', textAlign: 'center' }}>
          <h3 style={{ color: '#EF4444', margin: '0 0 0.5rem 0' }}>⚠️ Interview Record Unavailable</h3>
          <p style={{ color: 'var(--text-secondary)', margin: '0 0 1.5rem 0' }}>{error || 'Unable to load interview details.'}</p>
          <button type="button" className="recruiter-dashboard-cta-btn" onClick={() => navigate('/recruiter/dashboard')}>
            ← Return to Recruiter Dashboard
          </button>
        </div>
      </div>
    );
  }

  const candidateName = interview.user?.name || interview.candidateName || 'Candidate Developer';
  const candidateEmail = interview.user?.email || '';
  const jobTitle = interview.jobTitle || interview.job?.title || 'Technical Role Requisition';
  const scheduledTimeStr = new Date(interview.scheduledAt || interview.createdAt).toLocaleString();
  const isCompleted = interview.status === 'completed';

  return (
    <div style={{ padding: '2rem', width: '100%', maxWidth: '1100px', margin: '0 auto', boxSizing: 'border-box' }}>
      
      {/* NAVIGATION HEADER */}
      <button
        type="button"
        onClick={() => navigate('/recruiter/dashboard')}
        style={{ background: 'none', border: 'none', color: '#8B5CF6', fontWeight: 700, cursor: 'pointer', padding: 0, marginBottom: '1.25rem' }}
      >
        ← Back to Recruiter Dashboard
      </button>

      {/* RECRUITER INTERVIEW HEADER CARD */}
      <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              👤 HUMAN RECRUITER INTERVIEW
            </span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.25rem 0 0.5rem 0' }}>
              {candidateName}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <span>💼 {jobTitle}</span>
              {candidateEmail && <span>✉️ {candidateEmail}</span>}
              <span>📅 {scheduledTimeStr}</span>
            </div>
          </div>

          <StatusBadge status={interview.status} />
        </div>
      </div>

      {feedbackMsg && (
        <div style={{ padding: '1rem 1.25rem', borderRadius: '12px', marginBottom: '1.5rem', background: feedbackMsg.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)', border: feedbackMsg.type === 'success' ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)', color: feedbackMsg.type === 'success' ? '#22C55E' : '#EF4444', fontWeight: 700, fontSize: '0.9rem' }}>
          {feedbackMsg.text}
        </div>
      )}

      {/* SUBMITTED REPOSITORY LINK */}
      {interview.repositoryUrl && (
        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', borderRadius: '16px', background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#8B5CF6' }}>📦 SUBMITTED CANDIDATE REPOSITORY</span>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
              {interview.repositoryUrl}
            </div>
          </div>
          <a href={interview.repositoryUrl} target="_blank" rel="noopener noreferrer" style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', background: '#8B5CF6', color: '#FFFFFF', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none' }}>
            Open Repository ↗
          </a>
        </div>
      )}

      {/* MAIN TWO-COLUMN CONTENT */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* LEFT: MANUAL RECRUITER EVALUATION FORM */}
        <form onSubmit={handleEvalSubmit} className="glass-panel" style={{ padding: '1.75rem', borderRadius: '18px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              📝 Human Interview Evaluation
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
              Conduct the interview with candidate and record technical, communication, and culture fit scores.
            </p>
          </div>

          {/* SCORE INPUTS GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Technical Competency (0 - 100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={technicalScore}
                onChange={(e) => setTechnicalScore(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.92rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Communication Clarity (0 - 100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={communicationScore}
                onChange={(e) => setCommunicationScore(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.92rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Problem Solving (0 - 100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={problemSolvingScore}
                onChange={(e) => setProblemSolvingScore(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.92rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Culture & Team Fit (0 - 100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={cultureFitScore}
                onChange={(e) => setCultureFitScore(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.92rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
              Key Candidate Strengths
            </label>
            <input
              type="text"
              placeholder="e.g. Excellent system design trade-offs, solid backend knowledge..."
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.9rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
              Areas for Improvement
            </label>
            <input
              type="text"
              placeholder="e.g. Could improve on complex SQL query optimization..."
              value={weaknesses}
              onChange={(e) => setWeaknesses(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.9rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
              Detailed Recruiter Interview Notes
            </label>
            <textarea
              rows={4}
              placeholder="Record candidate interview answers, technical discussion notes, and recruiter feedback..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.5, boxSizing: 'border-box' }}
            />
          </div>

          <button
            type="submit"
            disabled={submittingEval}
            className="recruiter-dashboard-cta-btn"
            style={{ padding: '0.8rem 1.5rem', fontSize: '0.95rem' }}
          >
            {submittingEval ? 'Submitting Evaluation...' : 'Save Recruiter Evaluation ✓'}
          </button>
        </form>

        {/* RIGHT: HIRING DECISION SIDEBAR */}
        <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '18px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 0.35rem 0', color: 'var(--text-primary)' }}>
              ⚡ Application Stage & Hiring Decision
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
              Current Decision: <strong style={{ color: '#8B5CF6' }}>{(interview.hiringDecision?.decision || 'Pending').toUpperCase()}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              type="button"
              disabled={submittingDecision}
              className="recruiter-dashboard-cta-btn"
              onClick={() => handleDecision('shortlisted')}
              style={{ background: '#10B981', width: '100%' }}
            >
              ✓ Shortlist Candidate
            </button>

            <button
              type="button"
              disabled={submittingDecision}
              className="recruiter-dashboard-cta-btn"
              onClick={() => handleDecision('offer')}
              style={{ background: '#8B5CF6', width: '100%' }}
            >
              💼 Move to Job Offer
            </button>

            <button
              type="button"
              disabled={submittingDecision}
              onClick={() => handleDecision('rejected')}
              style={{
                height: '42px', padding: '0 1rem', borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#EF4444', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', width: '100%'
              }}
            >
              ✕ Reject Application
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}

export default RecruiterInterviewDetail;
