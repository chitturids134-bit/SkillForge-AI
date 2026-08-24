import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAssessmentReport } from '../../services/assessmentService';
import StatusBadge from '../../components/common/StatusBadge';
import GradientButton from '../../components/common/GradientButton';
import '../../styles/auth.css';
import '../../styles/interview.css';
import '../../styles/profile.css';
import '../../styles/assessment.css';

function AssessmentReport() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const res = await getAssessmentReport(attemptId);
        if (res && res.report) {
          setReport(res.report);
        } else {
          setErrorMsg('Assessment report record not found.');
        }
      } catch (err) {
        setErrorMsg(err.response?.data?.message || 'Failed to load assessment report.');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [attemptId]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-secondary)' }}>
        Loading Assessment Report...
      </div>
    );
  }

  if (errorMsg || !report) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', maxWidth: '500px', margin: '0 auto' }}>
        <div className="toast toast-error" style={{ marginBottom: '1.5rem' }}>
          {errorMsg || 'Report not found'}
        </div>
        <GradientButton onClick={() => navigate('/assessments/history')}>
          Back to Assessment History
        </GradientButton>
      </div>
    );
  }

  const result = report.result || {};
  const assessment = report.assessment || {};
  const dateStr = report.completedAt || report.startedAt
    ? new Date(report.completedAt || report.startedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'Recent';

  return (
    <div style={{ padding: '2rem', maxWidth: '1050px', margin: '0 auto' }}>
      {/* HEADER */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '1.5rem' }}>{assessment.icon || '⚡'}</span>
            <span className="badge badge-primary">{assessment.skill || 'Skill'}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>• {assessment.difficulty} Level</span>
          </div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {assessment.title} — Report
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Completed on {dateStr} • Attempt ID: <span style={{ fontFamily: 'monospace' }}>{report.attemptId}</span>
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
          <GradientButton onClick={() => navigate('/assessments/history')} style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}>
            Back to History
          </GradientButton>
        </div>
      </div>

      {/* OVERALL SCORE SUMMARY */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Final Assessment Score
          </span>
          <div style={{ fontSize: '3.5rem', fontWeight: 900, color: report.passed ? '#10B981' : '#F59E0B' }}>
            {report.percentage}%
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ padding: '0.3rem 0.8rem', borderRadius: '8px', background: report.passed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: report.passed ? '#10B981' : '#F87171', fontWeight: 800, fontSize: '0.85rem' }}>
              {report.passed ? '✓ PASSED' : '✕ FAILED'}
            </span>
            <StatusBadge status={result.readinessLevel || 'Evaluated'} />
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Score: {report.score} / {report.totalQuestions} Correct (Passing threshold: {assessment.passingPercentage}%)
          </span>
        </div>

        {/* TOPIC BREAKDOWN */}
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.85rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            Topic Mastery Breakdown
          </h3>

          {(result.topicBreakdown || []).map((tb, idx) => (
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

      {/* QUESTION BY QUESTION DETAIL */}
      <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
        Detailed Question Breakdown
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {(report.questions || []).map((q, idx) => (
          <div
            key={idx}
            className="glass-panel"
            style={{
              padding: '1.75rem',
              borderRadius: '16px',
              border: q.isCorrect ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                  Question {idx + 1} of {report.questions.length}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)' }}>
                  Topic: {q.topic}
                </span>
              </div>

              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: q.isCorrect ? '#10B981' : '#F87171', padding: '0.2rem 0.6rem', borderRadius: '6px', background: q.isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)' }}>
                {q.isCorrect ? '✓ Correct' : '✕ Incorrect'}
              </span>
            </div>

            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', lineHeight: 1.4 }}>
              {q.questionText}
            </h4>

            {/* Options List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              {q.options.map((opt, optIdx) => {
                const isSelected = q.selectedOptionIndex === optIdx;
                const isCorrectOpt = q.correctOptionIndex === optIdx;

                let optStyle = {
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  background: 'rgba(255,255,255,0.03)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                };

                if (isCorrectOpt) {
                  optStyle.border = '1px solid #10B981';
                  optStyle.background = 'rgba(16, 185, 129, 0.12)';
                  optStyle.fontWeight = 700;
                } else if (isSelected && !isCorrectOpt) {
                  optStyle.border = '1px solid #EF4444';
                  optStyle.background = 'rgba(239, 68, 68, 0.12)';
                }

                return (
                  <div key={optIdx} style={optStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                      {isCorrectOpt && <span style={{ color: '#10B981', fontSize: '0.8rem', fontWeight: 800 }}>✓ Correct Answer</span>}
                      {isSelected && !isCorrectOpt && <span style={{ color: '#F87171', fontSize: '0.8rem', fontWeight: 800 }}>Your Choice</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Explanation */}
            {q.explanation && (
              <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.06)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                <strong style={{ color: '#A78BFA', fontSize: '0.85rem', display: 'block', marginBottom: '0.3rem' }}>
                  💡 Technical Explanation:
                </strong>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                  {q.explanation}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default AssessmentReport;
