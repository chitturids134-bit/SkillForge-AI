import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getRecruiterApplications,
  getRecruiterJobs,
  updateApplicationStage,
  updateApplicationNotes,
} from '../../services/recruiterService';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import GradientButton from '../../components/common/GradientButton';

function RecruiterApplications() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applications, setApplications] = useState([]);
  const [metrics, setMetrics] = useState({
    total: 0, applied: 0, screened: 0, shortlisted: 0, interview: 0, offer: 0, hired: 0, rejected: 0,
  });

  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [recruiterJobList, setRecruiterJobList] = useState([]);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [noteSuccess, setNoteSuccess] = useState('');
  const [updatingStage, setUpdatingStage] = useState(false);

  const fetchJobsList = useCallback(async () => {
    try {
      const res = await getRecruiterJobs();
      if (res && res.success && Array.isArray(res.data)) {
        setRecruiterJobList(res.data);
      }
    } catch (err) {
      console.error('Fetch Jobs List Error:', err);
    }
  }, []);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getRecruiterApplications({
        search,
        stage: stageFilter,
        jobId: selectedJobId,
      });

      if (res && res.success) {
        setApplications(res.data || []);
        setMetrics(res.metrics || { total: 0, applied: 0, screened: 0, shortlisted: 0, interview: 0, offer: 0, hired: 0, rejected: 0 });
      } else {
        throw new Error(res?.message || 'Failed to load candidate applications');
      }
    } catch (err) {
      console.error('Fetch Recruiter Applications Error:', err);
      setError(err.message || 'Unable to connect to applications service');
    } finally {
      setLoading(false);
    }
  }, [search, stageFilter, selectedJobId]);

  useEffect(() => {
    fetchJobsList();
  }, [fetchJobsList]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleStageChange = async (appId, newStage) => {
    try {
      setUpdatingStage(true);
      const res = await updateApplicationStage(appId, { stage: newStage });
      if (res && res.success) {
        fetchApplications();
        if (selectedApp && selectedApp._id === appId) {
          setSelectedApp(res.data);
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to update application stage');
    } finally {
      setUpdatingStage(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedApp) return;
    setSavingNotes(true);
    setNoteSuccess('');
    try {
      const res = await updateApplicationNotes(selectedApp._id, notes);
      if (res && res.success) {
        setNoteSuccess('Recruiter notes saved!');
        setTimeout(() => setNoteSuccess(''), 2500);
        fetchApplications();
      }
    } catch (err) {
      alert(err.message || 'Failed to save recruiter notes');
    } finally {
      setSavingNotes(false);
    }
  };

  const openReviewPanel = (app) => {
    setSelectedApp(app);
    setNotes(app.notes || '');
    setNoteSuccess('');
    setShowReviewModal(true);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return diffDays + ' days ago';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const columns = [
    {
      header: 'Candidate',
      accessor: 'candidateName',
      render: (row) => {
        const name = row.candidateName || row.candidate?.name || 'Applicant Candidate';
        const email = row.candidateEmail || row.candidate?.email || 'N/A';
        const initial = name.slice(0, 1).toUpperCase();

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #8B5CF6, #6C63FF)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                color: '#FFFFFF',
                fontSize: '0.9rem',
                flexShrink: 0,
              }}
            >
              {initial}
            </div>
            <div>
              <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                {name}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {email}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Job Requisition',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.88rem' }}>
            {row.job?.title || 'Job Position'}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            📍 {row.job?.location || 'Remote'}
          </div>
        </div>
      ),
    },
    {
      header: 'ATS Match',
      render: (row) => {
        const score = row.matchScore;
        if (score === null || score === undefined) {
          return <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>N/A</span>;
        }

        const color = score >= 85 ? '#22C55E' : score >= 70 ? '#8B5CF6' : '#F59E0B';
        const bg = score >= 85 ? 'rgba(34, 197, 94, 0.15)' : score >= 70 ? 'rgba(139, 92, 246, 0.15)' : 'rgba(245, 158, 11, 0.15)';

        return (
          <span
            style={{
              fontSize: '0.82rem',
              fontWeight: 800,
              padding: '0.25rem 0.65rem',
              borderRadius: '20px',
              background: bg,
              color: color,
              border: '1px solid ' + color + '40',
            }}
          >
            🔥 {score}% Match
          </span>
        );
      },
    },
    {
      header: 'Pipeline Stage',
      render: (row) => (
        <select
          value={row.status || 'applied'}
          onChange={(e) => handleStageChange(row._id, e.target.value)}
          style={{
            padding: '0.35rem 0.65rem',
            borderRadius: '8px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <option value="applied">Applied</option>
          <option value="screened">Screened</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="interview">Interview</option>
          <option value="offer">Offer Extended</option>
          <option value="hired">Hired</option>
          <option value="rejected">Rejected</option>
        </select>
      ),
    },
    {
      header: 'Applied Date',
      render: (row) => (
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {formatDate(row.appliedAt || row.createdAt)}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <button
          onClick={() => openReviewPanel(row)}
          style={{
            padding: '0.4rem 0.85rem',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #8B5CF6, #6C63FF)',
            border: 'none',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '0.78rem',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)',
          }}
        >
          👁️ Review Candidate
        </button>
      ),
    },
  ];

  return (
    <div style={{ padding: '2rem', width: '100%' }}>
      
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.4rem 0' }}>
            📋 Candidate Applications Pipeline
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>
            Review, shortlist, interview, and manage candidates across your active hiring pipeline.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchApplications}
          style={{
            height: '42px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0 1.25rem',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(139, 92, 246, 0.4)',
            color: 'var(--text-primary)',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <span>🔄</span> Refresh Pipeline
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.1rem 1.25rem', borderRadius: '14px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
            Total Applications
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {metrics.total || 0}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.1rem 1.25rem', borderRadius: '14px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
            New (Applied)
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#3B82F6' }}>
            {metrics.applied || 0}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.1rem 1.25rem', borderRadius: '14px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
            Shortlisted
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#8B5CF6' }}>
            {metrics.shortlisted || 0}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.1rem 1.25rem', borderRadius: '14px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
            Interviews Scheduled
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#F59E0B' }}>
            {metrics.interview || 0}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.1rem 1.25rem', borderRadius: '14px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
            Offers Extended
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#10B981' }}>
            {metrics.offer || 0}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.1rem 1.25rem', borderRadius: '14px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
            Hired Candidates
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#22C55E' }}>
            {metrics.hired || 0}
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1rem 1.25rem', borderRadius: '14px', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          
          <div style={{ flex: 1, minWidth: '260px' }}>
            <input
              type="text"
              placeholder="🔍 Search candidate name, email, or position..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '9px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ minWidth: '220px' }}>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '9px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none', cursor: 'pointer' }}
            >
              <option value="">All Job Requisitions</option>
              {recruiterJobList.map((j) => (
                <option key={j._id} value={j._id}>
                  {j.title}
                </option>
              ))}
            </select>
          </div>

        </div>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: 'All Candidates' },
            { key: 'applied', label: 'Applied' },
            { key: 'screened', label: 'Screened' },
            { key: 'shortlisted', label: 'Shortlisted' },
            { key: 'interview', label: 'Interview' },
            { key: 'offer', label: 'Offer' },
            { key: 'hired', label: 'Hired' },
            { key: 'rejected', label: 'Rejected' },
          ].map((st) => (
            <button
              key={st.key}
              onClick={() => setStageFilter(st.key)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: stageFilter === st.key ? '1px solid #8B5CF6' : '1px solid var(--border-color)',
                background: stageFilter === st.key ? 'rgba(139, 92, 246, 0.2)' : 'var(--bg-secondary)',
                color: stageFilter === st.key ? '#8B5CF6' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', borderRadius: '14px', marginBottom: '2rem', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, color: '#EF4444', marginBottom: '0.2rem' }}>⚠️ Unable to Load Candidate Applications</div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{error}</div>
          </div>
          <GradientButton onClick={fetchApplications} style={{ background: '#EF4444' }}>🔄 Retry</GradientButton>
        </div>
      )}

      {loading ? (
        <div className="glass-panel" style={{ padding: '3rem', borderRadius: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem', animation: 'spin 1s infinite linear' }}>⚙️</div>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Loading candidate applications pipeline from database...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem 2rem', borderRadius: '16px', textAlign: 'center', background: 'var(--bg-card)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>
            No Applications Yet
          </h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 1.5rem auto', fontSize: '0.92rem' }}>
            Applications from software developers will appear here when candidates apply to your active job requisitions.
          </p>
          <button
            type="button"
            className="recruiter-dashboard-cta-btn"
            onClick={() => navigate('/recruiter/jobs')}
          >
            <span>💼</span> View Job Postings
          </button>
        </div>
      ) : (
        <DataTable columns={columns} data={applications} />
      )}

      <AnimatePresence>
        {showReviewModal && selectedApp && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel"
              style={{ width: '100%', maxWidth: '750px', borderRadius: '20px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border-color)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.3rem 0' }}>
                    👤 {selectedApp.candidateName || selectedApp.candidate?.name || 'Candidate Details'}
                  </h2>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    Applying for <strong style={{ color: '#8B5CF6' }}>{selectedApp.job?.title || 'Position'}</strong> • ✉️ {selectedApp.candidateEmail || selectedApp.candidate?.email}
                  </div>
                </div>
                <button onClick={() => setShowReviewModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.5rem' }}>
                <StatusBadge status={selectedApp.status || 'applied'} />
                {selectedApp.matchScore !== null && selectedApp.matchScore !== undefined && (
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, padding: '0.3rem 0.8rem', borderRadius: '20px', background: 'rgba(34, 197, 94, 0.18)', color: '#22C55E', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                    🔥 {selectedApp.matchScore}% AI Match Score
                  </span>
                )}
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Applied {formatDate(selectedApp.appliedAt || selectedApp.createdAt)}
                </span>
              </div>

              {selectedApp.resumeSnapshot?.skills?.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    Candidate Tech Stack & Verified Skills
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {selectedApp.resumeSnapshot.skills.map((sk, idx) => (
                      <span key={idx} style={{ fontSize: '0.8rem', fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: '6px', background: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '1.5rem', background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                  ⚡ Move Candidate in Pipeline:
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleStageChange(selectedApp._id, 'screened')}
                    style={{ padding: '0.45rem 0.85rem', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#3B82F6', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    🔍 Move to Screened
                  </button>

                  <button
                    onClick={() => handleStageChange(selectedApp._id, 'shortlisted')}
                    style={{ padding: '0.45rem 0.85rem', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.3)', color: '#8B5CF6', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    ⭐ Shortlist Candidate
                  </button>

                  <button
                    onClick={() => {
                      handleStageChange(selectedApp._id, 'interview');
                      navigate('/recruiter/interviews');
                    }}
                    style={{ padding: '0.45rem 0.85rem', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#F59E0B', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    📅 Schedule Interview
                  </button>

                  <button
                    onClick={() => handleStageChange(selectedApp._id, 'offer')}
                    style={{ padding: '0.45rem 0.85rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10B981', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    💼 Extend Offer
                  </button>

                  <button
                    onClick={() => handleStageChange(selectedApp._id, 'hired')}
                    style={{ padding: '0.45rem 0.85rem', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#22C55E', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    🎉 Mark Hired
                  </button>

                  <button
                    onClick={() => handleStageChange(selectedApp._id, 'rejected')}
                    style={{ padding: '0.45rem 0.85rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#EF4444', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    ❌ Reject Candidate
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Private Recruiter Evaluation Notes
                  </label>
                  {noteSuccess && (
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#22C55E' }}>
                      ✅ {noteSuccess}
                    </span>
                  )}
                </div>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record internal technical feedback, interview performance, or salary expectations..."
                  style={{ width: '100%', padding: '0.75rem 0.85rem', borderRadius: '10px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                    style={{ padding: '0.4rem 0.85rem', borderRadius: '8px', background: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    {savingNotes ? 'Saving Notes...' : '💾 Save Notes'}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  style={{
                    height: '42px',
                    padding: '0 1.25rem',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default RecruiterApplications;
