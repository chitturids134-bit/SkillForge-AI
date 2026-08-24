import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import StatusBadge from '../../components/common/StatusBadge';
import '../../styles/interview.css';

function DeveloperInterviewDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Reschedule & Repository state
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [repoInput, setRepoInput] = useState('');
  const [submittingRepo, setSubmittingRepo] = useState(false);
  
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);

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
        setRepoInput(doc.repositoryUrl || '');
      } else {
        setError('Interview record not found.');
      }
    } catch (err) {
      console.error('Fetch Developer Interview Detail Error:', err);
      setError(err.response?.data?.message || err.message || 'Unable to fetch interview session.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  // Candidate Actions (Accept / Decline / Reschedule)
  const handleResponseAction = async (actionType) => {
    try {
      setActionLoading(true);
      setFeedback(null);
      const token = localStorage.getItem('token');

      const payload = { action: actionType };
      if (actionType === 'reschedule') {
        payload.reason = rescheduleReason || 'Schedule conflict';
      }

      const res = await axios.post(`/api/interviews/${id}/respond`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data && res.data.success) {
        setFeedback({ type: 'success', text: res.data.message || `Interview invitation ${actionType}ed successfully!` });
        setShowRescheduleModal(false);
        fetchDetail();
      }
    } catch (err) {
      console.error('Response Action Error:', err);
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Failed to update interview invitation status.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Project Repository Link
  const handleRepoSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmittingRepo(true);
      setFeedback(null);
      const token = localStorage.getItem('token');

      const res = await axios.post(`/api/interviews/${id}/repository`, {
        repositoryUrl: repoInput
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data && res.data.success) {
        setFeedback({ type: 'success', text: 'Project repository URL submitted to recruiter! ✓' });
        fetchDetail();
      }
    } catch (err) {
      console.error('Submit Repo Error:', err);
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Failed to submit repository link.' });
    } finally {
      setSubmittingRepo(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading Interview Workspace...
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div style={{ padding: '2rem', width: '100%' }}>
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', textAlign: 'center' }}>
          <h3 style={{ color: '#EF4444', margin: '0 0 0.5rem 0' }}>⚠️ Interview Record Unavailable</h3>
          <p style={{ color: 'var(--text-secondary)', margin: '0 0 1.5rem 0' }}>{error || 'Record not found.'}</p>
          <button type="button" className="recruiter-dashboard-cta-btn" onClick={() => navigate('/developer/interviews')}>
            ← Return to Interviews
          </button>
        </div>
      </div>
    );
  }

  const isRecruiterInterview = interview.type === 'recruiter_interview';
  const recruiterName = interview.recruiter?.name || 'Assigned Recruiter';
  const jobTitle = interview.jobTitle || interview.job?.title || 'Technical Role Requisition';
  const scheduledTimeStr = new Date(interview.scheduledAt || interview.createdAt).toLocaleString();
  const evalData = interview.recruiterEvaluation;

  return (
    <div style={{ padding: '2rem', width: '100%', maxWidth: '900px', margin: '0 auto', boxSizing: 'border-box' }}>
      
      {/* NAVIGATION HEADER */}
      <button
        type="button"
        onClick={() => navigate('/developer/interviews')}
        style={{ background: 'none', border: 'none', color: '#8B5CF6', fontWeight: 700, cursor: 'pointer', padding: 0, marginBottom: '1.25rem' }}
      >
        ← Back to Interviews
      </button>

      {/* HEADER CARD */}
      <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: isRecruiterInterview ? '#8B5CF6' : '#00D4FF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {isRecruiterInterview ? '👤 HUMAN RECRUITER INTERVIEW' : '🤖 AI TECHNICAL SCREENING'}
            </span>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.25rem 0 0.5rem 0' }}>
              {jobTitle}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {isRecruiterInterview && <span>👤 Recruiter: {recruiterName}</span>}
              <span>📅 {scheduledTimeStr}</span>
            </div>
          </div>

          <StatusBadge status={interview.status} />
        </div>
      </div>

      {feedback && (
        <div style={{ padding: '1rem 1.25rem', borderRadius: '12px', marginBottom: '1.5rem', background: feedback.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)', border: feedback.type === 'success' ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)', color: feedback.type === 'success' ? '#22C55E' : '#EF4444', fontWeight: 700, fontSize: '0.9rem' }}>
          {feedback.text}
        </div>
      )}

      {/* INVITATION RESPONSE PANEL (IF SCHEDULED / RESCHEDULE REQUESTED) */}
      {(interview.status === 'scheduled' || interview.status === 'reschedule_requested') && (
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '18px', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)', border: '1px solid rgba(139, 92, 246, 0.3)', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>
            📅 Recruiter Interview Invitation
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '0 0 1.25rem 0' }}>
            Please confirm your availability for the scheduled recruiter interview session.
          </p>

          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => handleResponseAction('accept')}
              className="recruiter-dashboard-cta-btn"
              style={{ background: '#22C55E' }}
            >
              ✓ Accept Invitation
            </button>

            <button
              type="button"
              disabled={actionLoading}
              onClick={() => setShowRescheduleModal(true)}
              style={{ padding: '0.65rem 1.25rem', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.4)', color: '#60A5FA', fontWeight: 700, cursor: 'pointer' }}
            >
              📅 Request Reschedule
            </button>

            <button
              type="button"
              disabled={actionLoading}
              onClick={() => handleResponseAction('decline')}
              style={{ padding: '0.65rem 1.25rem', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#EF4444', fontWeight: 700, cursor: 'pointer' }}
            >
              ✕ Decline
            </button>
          </div>
        </div>
      )}

      {/* RESCHEDULE MODAL */}
      {showRescheduleModal && (
        <div style={{ padding: '1.25rem', borderRadius: '14px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>Request Reschedule Reason</h4>
          <input
            type="text"
            placeholder="Explain schedule conflict or preferred availability..."
            value={rescheduleReason}
            onChange={(e) => setRescheduleReason(e.target.value)}
            style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', marginBottom: '0.85rem' }}
          />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" onClick={() => handleResponseAction('reschedule')} className="recruiter-dashboard-cta-btn">
              Submit Request
            </button>
            <button type="button" onClick={() => setShowRescheduleModal(false)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* SUBMIT PROJECT REPOSITORY */}
      <form onSubmit={handleRepoSubmit} className="glass-panel" style={{ padding: '1.5rem', borderRadius: '18px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          📦 Project Repository Submission
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
          Share your GitHub repository URL for the recruiter to inspect prior to or during the interview session.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            type="url"
            required
            placeholder="https://github.com/username/repository"
            value={repoInput}
            onChange={(e) => setRepoInput(e.target.value)}
            style={{ flex: 1, padding: '0.65rem 0.85rem', borderRadius: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.9rem' }}
          />
          <button type="submit" disabled={submittingRepo} className="recruiter-dashboard-cta-btn" style={{ padding: '0.65rem 1.25rem' }}>
            {submittingRepo ? 'Submitting...' : 'Save Link ✓'}
          </button>
        </div>
      </form>

      {/* RECRUITER EVALUATION SUMMARY (IF COMPLETED) */}
      {evalData && (
        <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 1rem 0' }}>
            📋 Recruiter Interview Evaluation Results
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#A78BFA', fontWeight: 700 }}>TECHNICAL</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#A78BFA' }}>{evalData.technicalScore}%</div>
            </div>

            <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#60A5FA', fontWeight: 700 }}>COMMUNICATION</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#60A5FA' }}>{evalData.communicationScore}%</div>
            </div>

            <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#4ADE80', fontWeight: 700 }}>PROBLEM SOLVING</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#4ADE80' }}>{evalData.problemSolvingScore}%</div>
            </div>

            <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(236, 72, 153, 0.1)', border: '1px solid rgba(236, 72, 153, 0.3)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#F472B6', fontWeight: 700 }}>CULTURE FIT</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#F472B6' }}>{evalData.cultureFitScore}%</div>
            </div>
          </div>

          {evalData.strengths && (
            <div style={{ marginBottom: '0.85rem' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#22C55E', margin: '0 0 0.25rem 0' }}>✅ Demonstrated Strengths</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>{evalData.strengths}</p>
            </div>
          )}

          {evalData.weaknesses && (
            <div style={{ marginBottom: '0.85rem' }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#EF4444', margin: '0 0 0.25rem 0' }}>⚠️ Areas for Growth</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>{evalData.weaknesses}</p>
            </div>
          )}

          {evalData.notes && (
            <div>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>💬 Recruiter Feedback Notes</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>{evalData.notes}</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

export default DeveloperInterviewDetail;
