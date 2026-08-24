import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import '../../styles/resume.css';

/* ─────────── Helpers ─────────── */

function getInitials(name) {
  if (!name) return 'C';
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

/* ─────────── Skeleton Loader ─────────── */

function CandidateCardSkeleton() {
  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.5rem',
        borderRadius: '16px',
        height: '240px',
        display: 'flex',
        flexDirection: 'column',
        justify: 'space-between',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        boxSizing: 'border-box'
      }}
    >
      <div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--hover-bg)' }} />
          <div style={{ flex: 1 }}>
            <div style={{ width: '60%', height: '14px', borderRadius: '6px', background: 'var(--hover-bg)', marginBottom: '0.4rem' }} />
            <div style={{ width: '40%', height: '10px', borderRadius: '4px', background: 'var(--hover-bg)' }} />
          </div>
        </div>
        <div style={{ width: '100%', height: '12px', borderRadius: '6px', background: 'var(--hover-bg)', marginBottom: '0.75rem' }} />
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <div style={{ width: '50px', height: '20px', borderRadius: '6px', background: 'var(--hover-bg)' }} />
          <div style={{ width: '60px', height: '20px', borderRadius: '6px', background: 'var(--hover-bg)' }} />
          <div style={{ width: '45px', height: '20px', borderRadius: '6px', background: 'var(--hover-bg)' }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <div style={{ flex: 1, height: '40px', borderRadius: '10px', background: 'var(--hover-bg)' }} />
        <div style={{ flex: 1, height: '40px', borderRadius: '10px', background: 'var(--hover-bg)' }} />
      </div>
    </div>
  );
}

/* ─────────── CandidateSearch Component ─────────── */

function CandidateSearch() {
  const [candidates, setCandidates] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [savedState, setSavedState] = useState({});
  const [saving, setSaving] = useState({});

  // Modals state
  const [selectedCandidateForProfile, setSelectedCandidateForProfile] = useState(null);
  const [selectedCandidateForInvite, setSelectedCandidateForInvite] = useState(null);
  
  // Invite modal form
  const [recruiterJobs, setRecruiterJobs] = useState([]);
  const [inviteJobId, setInviteJobId] = useState('');
  const [inviteDate, setInviteDate] = useState('');
  const [inviteFormat, setInviteFormat] = useState('AI Technical Screen');
  const [inviteNotes, setInviteNotes] = useState('');
  const [submittingInvite, setSubmittingInvite] = useState(false);
  const [inviteFeedback, setInviteFeedback] = useState(null);

  const fetchCandidates = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/recruiter/candidates', {
        headers: { Authorization: `Bearer ${token}` },
        params: { q: search, skill: selectedSkill }
      });

      if (res.data && res.data.success) {
        const list = res.data.data || [];
        setCandidates(list);
        if (res.data.availableSkills) {
          setAvailableSkills(res.data.availableSkills);
        }

        const initialSaved = {};
        list.forEach(c => {
          if (c.isSaved) initialSaved[c.id || c._id] = true;
        });
        setSavedState(prev => ({ ...prev, ...initialSaved }));
      } else {
        throw new Error(res.data?.message || 'Failed to query candidate database.');
      }
    } catch (err) {
      console.error('Fetch Candidates Error:', err);
      setError(err.response?.data?.message || err.message || 'Unable to load developer candidates.');
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  }, [search, selectedSkill]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCandidates();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchCandidates]);

  // Handle Save Talent MongoDB persistence
  const handleToggleSave = async (candidateId) => {
    if (!candidateId) return;
    const isCurrentlySaved = Boolean(savedState[candidateId]);
    
    // Optimistic UI toggle
    setSavedState(prev => ({ ...prev, [candidateId]: !isCurrentlySaved }));
    setSaving(prev => ({ ...prev, [candidateId]: true }));

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (isCurrentlySaved) {
        await axios.delete(`/api/recruiter/saved-candidates/${candidateId}`, { headers });
      } else {
        await axios.post(`/api/recruiter/saved-candidates/${candidateId}`, {}, { headers });
      }
    } catch (err) {
      console.error('Save Candidate Error:', err);
      // Rollback on error
      setSavedState(prev => ({ ...prev, [candidateId]: isCurrentlySaved }));
    } finally {
      setSaving(prev => ({ ...prev, [candidateId]: false }));
    }
  };

  // Handle opening Interview Invitation Modal
    // Handle opening Interview Invitation Modal
  const handleOpenInvite = async (candidate) => {
    setSelectedCandidateForInvite(candidate);
    setInviteJobId('');
    setInviteDate('');
    setInviteNotes('');
    setInviteFeedback(null);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/recruiter/jobs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        setRecruiterJobs(res.data.data);
        if (res.data.data.length > 0) {
          setInviteJobId(res.data.data[0]._id || res.data.data[0].id);
        } else {
          setInviteJobId('general');
        }
      } else {
        setInviteJobId('general');
      }
    } catch (err) {
      console.error('Fetch Recruiter Jobs Error:', err);
      setInviteJobId('general');
    }
  };

  // Submit real interview invitation
    // Submit real interview invitation
  const handleSubmitInvite = async (e) => {
    e.preventDefault();
    if (!selectedCandidateForInvite || !inviteDate) {
      setInviteFeedback({ type: 'error', message: 'Please select an interview date and time.' });
      return;
    }

    try {
      setSubmittingInvite(true);
      setInviteFeedback(null);
      const token = localStorage.getItem('token');
      const targetJob = recruiterJobs.find(j => (j._id || j.id) === inviteJobId);
      const finalJobId = inviteJobId || 'general';
      const finalJobTitle = targetJob?.title || 'General Technical Screening';

      // Map human labels to canonical backend enum values
      let typeEnum = 'ai_technical';
      let formatEnum = 'AI';
      if (inviteFormat === 'AI Screening') {
        typeEnum = 'ai_screening';
        formatEnum = 'AI';
      } else if (inviteFormat === 'Recruiter Interview') {
        typeEnum = 'recruiter_interview';
        formatEnum = 'Video';
      }

      await axios.post(
        '/api/interviews',
        {
          candidateId: selectedCandidateForInvite.id || selectedCandidateForInvite._id,
          candidateName: selectedCandidateForInvite.name,
          jobId: finalJobId,
          jobTitle: finalJobTitle,
          scheduledAt: new Date(inviteDate).toISOString(),
          type: typeEnum,
          format: formatEnum,
          notes: inviteNotes
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setInviteFeedback({ type: 'success', message: `Interview invitation sent to ${selectedCandidateForInvite.name}! ✓` });
      setTimeout(() => {
        setSelectedCandidateForInvite(null);
      }, 1500);
    } catch (err) {
      console.error('Submit Interview Invitation Error:', err);
      setInviteFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to schedule interview invitation.' });
    } finally {
      setSubmittingInvite(false);
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedSkill('');
  };

  return (
    <div style={{ padding: '2rem', width: '100%', minHeight: '100%', boxSizing: 'border-box' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.4rem 0' }}>
            🤖 AI Candidate Search & Talent Sourcing
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>
            Discover verified developer profiles registered on SkillForge AI.
          </p>
        </div>

        {candidates.length > 0 && (
          <span
            style={{
              fontSize: '0.85rem',
              fontWeight: 800,
              padding: '0.4rem 0.9rem',
              borderRadius: '20px',
              background: 'rgba(139, 92, 246, 0.15)',
              color: '#8B5CF6',
              border: '1px solid rgba(139, 92, 246, 0.3)'
            }}
          >
            {candidates.length} Candidate Profiles Found
          </span>
        )}
      </div>

      {/* Filter Bar */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', borderRadius: '14px', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
          <input
            type="text"
            placeholder="🔍 Search candidates by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 2.2rem 0.65rem 1rem',
              borderRadius: '9px',
              background: 'var(--input-bg)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '0.88rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          )}
        </div>

        <select
          value={selectedSkill}
          onChange={(e) => setSelectedSkill(e.target.value)}
          style={{
            padding: '0.65rem 1rem',
            borderRadius: '9px',
            background: 'var(--input-bg)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            fontSize: '0.88rem',
            outline: 'none',
            minWidth: '160px'
          }}
        >
          <option value="">All Skills ({availableSkills.length})</option>
          {availableSkills.map((sk, idx) => (
            <option key={idx} value={sk}>{sk}</option>
          ))}
        </select>

        {(search || selectedSkill) && (
          <button
            type="button"
            onClick={handleClearFilters}
            style={{
              padding: '0.65rem 1rem',
              borderRadius: '9px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#EF4444',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Clear Filters ✕
          </button>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', borderRadius: '14px', marginBottom: '2rem', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, color: '#EF4444', marginBottom: '0.2rem' }}>⚠️ Unable to Query Talent Database</div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{error}</div>
          </div>
          <button type="button" className="recruiter-dashboard-cta-btn" onClick={fetchCandidates} style={{ background: '#EF4444' }}>↻ Retry</button>
        </div>
      )}

      {/* Loading Skeleton State */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', width: '100%' }}>
          <CandidateCardSkeleton />
          <CandidateCardSkeleton />
          <CandidateCardSkeleton />
          <CandidateCardSkeleton />
          <CandidateCardSkeleton />
          <CandidateCardSkeleton />
        </div>
      ) : candidates.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem 2rem', borderRadius: '16px', textAlign: 'center', background: 'var(--bg-card)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>
            No Developer Profiles Found
          </h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 1.5rem auto', fontSize: '0.92rem' }}>
            {search || selectedSkill ? 'No candidates match your current search or skill filter criteria.' : 'Verified developer profiles registered on SkillForge AI will appear here.'}
          </p>

          {(search || selectedSkill) && (
            <button
              type="button"
              className="recruiter-dashboard-cta-btn"
              onClick={handleClearFilters}
            >
              Clear Search & Filters
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', width: '100%', boxSizing: 'border-box' }}>
          {candidates.map((c) => {
            const candId = c.id || c._id;
            const isSaved = Boolean(savedState[candId]);

            return (
              <motion.div
                key={candId}
                whileHover={{ y: -4 }}
                className="glass-panel"
                style={{
                  padding: '1.5rem',
                  borderRadius: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  gap: '1.25rem',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  width: '100%',
                  minWidth: 0,
                  boxSizing: 'border-box',
                  overflow: 'hidden'
                }}
              >
                {/* Identity Header */}
                <div style={{ width: '100%', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.85rem' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #8B5CF6, #00D4FF)',
                        display: 'flex',
                        alignItems: 'center',
                        justify: 'center',
                        color: '#FFFFFF',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        flexShrink: 0
                      }}
                    >
                      {getInitials(c.name)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                      <h3
                        style={{
                          fontSize: '1.1rem',
                          fontWeight: 800,
                          color: 'var(--text-primary)',
                          margin: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {c.name}
                      </h3>
                      <p
                        style={{
                          fontSize: '0.82rem',
                          color: 'var(--text-muted)',
                          margin: '0.2rem 0 0 0',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        ✉️ {c.email}
                      </p>
                    </div>
                  </div>

                  <p
                    style={{
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      color: '#8B5CF6',
                      margin: '0 0 0.35rem 0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {c.title}
                  </p>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 0.85rem 0' }}>
                    📍 {c.location}
                  </p>

                  {/* Skills badges */}
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', maxHeight: '72px', overflow: 'hidden' }}>
                    {c.skills.map((s, sIdx) => (
                      <span
                        key={sIdx}
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.55rem',
                          borderRadius: '6px',
                          background: 'rgba(139, 92, 246, 0.15)',
                          color: '#8B5CF6',
                          border: '1px solid rgba(139, 92, 246, 0.3)'
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* View Profile Action */}
                <button
                  type="button"
                  onClick={() => setSelectedCandidateForProfile(c)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#8B5CF6',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    textAlign: 'left',
                    padding: 0,
                    cursor: 'pointer'
                  }}
                >
                  View Profile details →
                </button>

                {/* Action Footer (FIXES OVERFLOW PERMANENTLY WITH FLEX 1 1 0) */}
                <div style={{ display: 'flex', gap: '0.5rem', width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
                  <button
                    type="button"
                    className="recruiter-dashboard-cta-btn"
                    onClick={() => handleOpenInvite(c)}
                    style={{
                      flex: '1 1 0',
                      minWidth: 0,
                      height: '40px',
                      padding: '0 0.4rem',
                      fontSize: '0.8rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    ✉️ Invite
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleSave(candId)}
                    style={{
                      flex: '1 1 0',
                      minWidth: 0,
                      height: '40px',
                      padding: '0 0.4rem',
                      fontSize: '0.8rem',
                      borderRadius: '10px',
                      background: isSaved ? 'rgba(139, 92, 246, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                      border: isSaved ? '1px solid #8B5CF6' : '1px solid rgba(139, 92, 246, 0.4)',
                      color: isSaved ? '#8B5CF6' : 'var(--text-primary)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {saving[candId] ? 'Saving...' : isSaved ? '⭐ Saved' : '⭐ Save Talent'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* VIEW PROFILE MODAL */}
      <AnimatePresence>
        {selectedCandidateForProfile && (
          <div
            style={{
              position: 'fixed',
              top: 0, left: 0, width: '100vw', height: '100vh',
              background: 'rgba(0, 0, 0, 0.7)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              padding: '1rem'
            }}
            onClick={() => setSelectedCandidateForProfile(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-panel"
              style={{
                width: '100%',
                maxWidth: '560px',
                borderRadius: '20px',
                padding: '2rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                maxHeight: '90vh',
                overflowY: 'auto'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div
                    style={{
                      width: '48px', height: '48px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #8B5CF6, #00D4FF)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#FFF', fontWeight: 800, fontSize: '1.1rem'
                    }}
                  >
                    {getInitials(selectedCandidateForProfile.name)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                      {selectedCandidateForProfile.name}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#8B5CF6', margin: '0.2rem 0 0 0', fontWeight: 700 }}>
                      {selectedCandidateForProfile.title}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCandidateForProfile(null)}
                  style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    Contact Details
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', margin: 0 }}>
                    ✉️ {selectedCandidateForProfile.email} • 📍 {selectedCandidateForProfile.location}
                  </p>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    About & Bio
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                    {selectedCandidateForProfile.bio || 'Verified software developer registered on SkillForge AI.'}
                  </p>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    Verified Skills
                  </h4>
                  <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                    {selectedCandidateForProfile.skills.map((sk, sIdx) => (
                      <span
                        key={sIdx}
                        style={{
                          fontSize: '0.8rem', fontWeight: 700, padding: '0.25rem 0.65rem',
                          borderRadius: '6px', background: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6'
                        }}
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                  <button
                    type="button"
                    className="recruiter-dashboard-cta-btn"
                    style={{ flex: 1 }}
                    onClick={() => {
                      const cand = selectedCandidateForProfile;
                      setSelectedCandidateForProfile(null);
                      handleOpenInvite(cand);
                    }}
                  >
                    ✉️ Invite to Technical Screen
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SCHEDULE INTERVIEW MODAL */}
      <AnimatePresence>
        {selectedCandidateForInvite && (
          <div
            style={{
              position: 'fixed',
              top: 0, left: 0, width: '100vw', height: '100vh',
              background: 'rgba(0, 0, 0, 0.7)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              padding: '1rem'
            }}
            onClick={() => setSelectedCandidateForInvite(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-panel"
              style={{
                width: '100%',
                maxWidth: '520px',
                borderRadius: '20px',
                padding: '2rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  ✉️ Schedule Technical Interview
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedCandidateForInvite(null)}
                  style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitInvite} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {inviteFeedback && (
                  <div
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: '10px',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      background: inviteFeedback.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                      color: inviteFeedback.type === 'error' ? '#EF4444' : '#22C55E',
                      border: inviteFeedback.type === 'error' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(34, 197, 94, 0.3)'
                    }}
                  >
                    {inviteFeedback.message}
                  </div>
                )}

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                    Candidate
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={`${selectedCandidateForInvite.name} (${selectedCandidateForInvite.email})`}
                    style={{
                      width: '100%', padding: '0.65rem 1rem', borderRadius: '9px',
                      background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)', fontSize: '0.88rem', boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                    Job Requisition
                  </label>
                  <select
                    value={inviteJobId}
                    onChange={(e) => setInviteJobId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 1rem',
                      borderRadius: '9px',
                      background: 'var(--input-bg, #1E1B4B)',
                      border: '1px solid var(--border-color, rgba(139, 92, 246, 0.3))',
                      color: 'var(--text-primary, #FFFFFF)',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  >
                    {recruiterJobs.length === 0 ? (
                      <option value="general" style={{ background: '#1E1B4B', color: '#FFFFFF' }}>
                        General Technical Screening Requisition
                      </option>
                    ) : (
                      recruiterJobs.map(j => (
                        <option
                          key={j._id || j.id}
                          value={j._id || j.id}
                          style={{ background: '#1E1B4B', color: '#FFFFFF' }}
                        >
                          {j.title} ({j.department || 'Engineering'})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                    Interview Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={inviteDate}
                    onChange={(e) => setInviteDate(e.target.value)}
                    required
                    style={{
                      width: '100%', padding: '0.65rem 1rem', borderRadius: '9px',
                      background: 'var(--input-bg)', border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                    Interview Format
                  </label>
                  <select
                    value={inviteFormat}
                    onChange={(e) => setInviteFormat(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 1rem',
                      borderRadius: '9px',
                      background: 'var(--input-bg, #1E1B4B)',
                      border: '1px solid var(--border-color, rgba(139, 92, 246, 0.3))',
                      color: 'var(--text-primary, #FFFFFF)',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="AI Technical Screen" style={{ background: '#1E1B4B', color: '#FFFFFF' }}>AI Technical Screen</option>
                    <option value="System Design Deep Dive" style={{ background: '#1E1B4B', color: '#FFFFFF' }}>System Design Deep Dive</option>
                    <option value="Live Coding Session" style={{ background: '#1E1B4B', color: '#FFFFFF' }}>Live Coding Session</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedCandidateForInvite(null)}
                    style={{
                      flex: 1, padding: '0.75rem', borderRadius: '10px',
                      background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)', fontWeight: 700, cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submittingInvite}
                    className="recruiter-dashboard-cta-btn"
                    style={{ flex: 1 }}
                  >
                    {submittingInvite ? 'Sending...' : 'Send Invitation ✉️'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default CandidateSearch;
