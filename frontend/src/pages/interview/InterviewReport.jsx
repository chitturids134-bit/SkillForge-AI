import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInterview } from '../../services/interviewService';
import StatusBadge from '../../components/common/StatusBadge';
import GradientButton from '../../components/common/GradientButton';
import '../../styles/auth.css';
import '../../styles/interview.css';
import '../../styles/profile.css';

function InterviewReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        const res = await getInterview(id);
        if (res && res.interview) {
          setSession(res.interview);
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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-secondary)' }}>
        Loading Feedback Report...
      </div>
    );
  }

  if (errorMsg || !session) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', maxWidth: '500px', margin: '0 auto' }}>
        <div className="toast toast-error" style={{ marginBottom: '1.5rem' }}>
          {errorMsg || 'Report not found'}
        </div>
        <GradientButton onClick={() => navigate('/interview/history')}>
          Back to History
        </GradientButton>
      </div>
    );
  }

  const analysis = session.analysis || {
    technicalScore: 0,
    communicationScore: 0,
    confidenceScore: 0,
    problemSolvingScore: 0,
    readinessLevel: 'Needs Improvement',
    strengths: ['Practice completed.'],
    weaknesses: ['Elaboration depth.'],
    suggestions: ['Structure responses using STAR method.']
  };

  const dateStr = session.createdAt ? new Date(session.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent';

  return (
    <div style={{ padding: '2rem', maxWidth: '1050px', margin: '0 auto' }}>
      {/* HEADER */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <span className="badge badge-primary">{session.category} Interview</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>• {session.difficulty} Level</span>
          </div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Interview Feedback Report
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Completed on {dateStr} • ID: <span style={{ fontFamily: 'monospace' }}>{session._id}</span>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={() => window.print()}
            style={{
              padding: '0.65rem 1.2rem',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            🖨️ Export PDF / Print
          </button>
          <GradientButton onClick={() => navigate('/interview/history')} style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}>
            Back to History
          </GradientButton>
        </div>
      </div>

      {/* OVERALL SCORE SUMMARY */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Overall Score
          </span>
          <div style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--accent-primary, #8B5CF6)' }}>
            {session.overallScore || 0}%
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <StatusBadge status={analysis.readinessLevel || 'Completed'} />
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.85rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            Category Performance Metrics
          </h3>

          {[
            { label: 'Technical Depth', val: analysis.technicalScore || 80, color: '#8B5CF6' },
            { label: 'Communication & Elaboration', val: analysis.communicationScore || 75, color: '#3B82F6' },
            { label: 'Problem Solving Structuring', val: analysis.problemSolvingScore || 85, color: '#10B981' },
            { label: 'Confidence & Completion', val: analysis.confidenceScore || 90, color: '#F59E0B' },
          ].map((item, idx) => (
            <div key={idx}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.2rem' }}>
                <span>{item.label}</span>
                <strong style={{ color: 'var(--text-primary)' }}>{item.val}%</strong>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${item.val}%`, height: '100%', background: item.color, borderRadius: '3px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QUESTION BY QUESTION DETAIL */}
      <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
        Detailed Question Breakdown
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {(session.questions || []).map((q, idx) => (
          <div
            key={idx}
            className="glass-panel"
            style={{
              padding: '1.75rem',
              borderRadius: '16px',
              border: '1px solid var(--border-color)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                Question {idx + 1} of {session.questions.length}
              </span>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent-success, #10B981)', padding: '0.2rem 0.6rem', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.15)' }}>
                {q.score || 0} / 100
              </span>
            </div>

            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', lineHeight: 1.4 }}>
              {q.question}
            </h4>

            {/* Candidate Answer */}
            <div style={{ padding: '1rem', borderRadius: '10px', background: 'var(--bg-secondary, rgba(0,0,0,0.3))', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.3rem' }}>
                Submitted Response:
              </span>
              <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.925rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                {q.answer ? q.answer : <em style={{ color: 'var(--text-secondary)' }}>(No answer provided)</em>}
              </p>
            </div>

            {/* AI Feedback */}
            {q.feedback && (
              <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.06)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                <strong style={{ color: '#A78BFA', fontSize: '0.85rem', display: 'block', marginBottom: '0.3rem' }}>
                  💡 Evaluation Feedback:
                </strong>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                  {q.feedback}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default InterviewReport;
