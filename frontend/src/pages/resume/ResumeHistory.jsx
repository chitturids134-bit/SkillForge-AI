import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getResumeHistory,
  restoreResumeVersion,
  deleteResumeVersion,
  compareResumeVersions,
  downloadResumeVersion,
} from '../../services/resumeService';
import { RESUME_TEMPLATES } from '../../data/resumeTemplates';
import ResumePreview from '../../components/resume/ResumePreview';
import StatusBadge from '../../components/common/StatusBadge';
import GradientButton from '../../components/common/GradientButton';
import '../../styles/profile.css';
import '../../styles/resume.css';

function formatRelativeTime(dateStr) {
  if (!dateStr) return 'Recently';
  try {
    const now = new Date();
    const past = new Date(dateStr);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) {
      const mins = Math.floor(diffInSeconds / 60);
      return `${mins} ${mins === 1 ? 'min' : 'mins'} ago`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  } catch {
    return 'Recently';
  }
}

function getAtsBadgeColor(score) {
  if (score >= 80) return { bg: 'rgba(16, 185, 129, 0.15)', color: '#10B981', label: 'Excellent' };
  if (score >= 60) return { bg: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', label: 'Average' };
  return { bg: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', label: 'Needs Work' };
}

function ResumeHistory() {
  const navigate = useNavigate();

  // Primary State
  const [versions, setVersions] = useState([]);
  const [stats, setStats] = useState({
    totalVersions: 0,
    latestVersion: 'N/A',
    bestAtsScore: 0,
    lastUpdated: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Modal States
  const [previewVersion, setPreviewVersion] = useState(null);
  const [restoreModalVersion, setRestoreModalVersion] = useState(null);
  const [deleteModalVersion, setDeleteModalVersion] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Compare Modal State
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [compareSource, setCompareSource] = useState(null);
  const [compareTargetId, setCompareTargetId] = useState('');
  const [comparisonResult, setComparisonResult] = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);

  const showToast = (msg, isError = false) => {
    if (isError) {
      setError(msg);
      setTimeout(() => setError(''), 4000);
    } else {
      setToastMsg(msg);
      setTimeout(() => setToastMsg(''), 3500);
    }
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getResumeHistory();
      if (data) {
        const fetchedVersions = data.versions || data.history || [];
        setVersions(fetchedVersions);
        setStats(data.stats || {
          totalVersions: fetchedVersions.length,
          latestVersion: fetchedVersions.length > 0 ? `V${fetchedVersions[0].versionNumber}` : 'N/A',
          bestAtsScore: fetchedVersions.length > 0 ? Math.max(...fetchedVersions.map(v => v.atsScore || 0)) : 0,
          lastUpdated: fetchedVersions.length > 0 ? fetchedVersions[0].savedAt : null,
        });
      }
    } catch (err) {
      console.error('Fetch history error:', err);
      setError(err.response?.data?.message || 'Failed to load resume version history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Handle Restore Execution
  const handleConfirmRestore = async () => {
    if (!restoreModalVersion) return;
    try {
      setActionLoading(true);
      await restoreResumeVersion(restoreModalVersion._id);
      showToast(`Version ${restoreModalVersion.versionNumber} restored successfully! A new restore snapshot was logged.`);
      setRestoreModalVersion(null);
      await fetchHistory();
    } catch (err) {
      console.error('Restore error:', err);
      showToast(err.response?.data?.message || 'Failed to restore resume version', true);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete Execution
  const handleConfirmDelete = async () => {
    if (!deleteModalVersion) return;
    try {
      setActionLoading(true);
      await deleteResumeVersion(deleteModalVersion._id);
      showToast(`Version ${deleteModalVersion.versionNumber} deleted from history.`);
      setDeleteModalVersion(null);
      await fetchHistory();
    } catch (err) {
      console.error('Delete version error:', err);
      showToast(err.response?.data?.message || 'Failed to delete version', true);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Compare Initiation
  const openCompareModal = (sourceVersion) => {
    setCompareSource(sourceVersion);
    const otherVersions = versions.filter(v => v._id !== sourceVersion._id);
    const defaultTarget = otherVersions.length > 0 ? otherVersions[0]._id : '';
    setCompareTargetId(defaultTarget);
    setComparisonResult(null);
    setCompareModalOpen(true);

    if (defaultTarget) {
      runComparison(sourceVersion._id, defaultTarget);
    }
  };

  const runComparison = async (sourceId, targetId) => {
    if (!sourceId || !targetId) return;
    try {
      setCompareLoading(true);
      const res = await compareResumeVersions(sourceId, targetId);
      if (res && res.comparison) {
        setComparisonResult(res.comparison);
      }
    } catch (err) {
      console.error('Comparison error:', err);
      showToast(err.response?.data?.message || 'Failed to compare resume versions', true);
    } finally {
      setCompareLoading(false);
    }
  };

  // Handle Download Execution
  const handleDownload = async (version) => {
    try {
      showToast(`Downloading Version ${version.versionNumber}...`);
      await downloadResumeVersion(version._id);
    } catch (err) {
      console.error('Download error:', err);
      showToast('Failed to download resume version', true);
    }
  };

  const getTemplateName = (templateId) => {
    const found = RESUME_TEMPLATES.find(t => t.id === templateId);
    return found ? found.title : (templateId || 'Silicon Valley ATS');
  };

  // Highest version number computation for LATEST badge
  const highestVersionNum = versions.length > 0 ? Math.max(...versions.map(v => v.versionNumber || 0)) : 0;

  // Filter & Sort Versions
  const filteredVersions = versions
    .filter(v => {
      const q = searchQuery.toLowerCase();
      const title = (v.title || '').toLowerCase();
      const summary = (v.changeSummary || '').toLowerCase();
      const source = (v.source || '').toLowerCase();
      const template = (v.template || '').toLowerCase();
      return title.includes(q) || summary.includes(q) || source.includes(q) || template.includes(q);
    })
    .sort((a, b) => {
      if (sortBy === 'oldest') return new Date(a.savedAt) - new Date(b.savedAt);
      if (sortBy === 'highest-ats') return (b.atsScore || 0) - (a.atsScore || 0);
      return new Date(b.savedAt) - new Date(a.savedAt); // default newest
    });

  return (
    <div style={{ padding: '2rem', width: '100%' }}>
      {/* Toast Messages */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              zIndex: 9999,
              background: '#10B981',
              color: '#FFFFFF',
              padding: '0.85rem 1.5rem',
              borderRadius: '10px',
              fontWeight: 600,
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            }}
          >
            ✅ {toastMsg}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              zIndex: 9999,
              background: '#EF4444',
              color: '#FFFFFF',
              padding: '0.85rem 1.5rem',
              borderRadius: '10px',
              fontWeight: 600,
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            }}
          >
            ⚠️ {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <div className="history-header">
        <div className="history-header-title-block">
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Resume Versions & History
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.35rem', fontSize: '0.95rem' }}>
            Track, audit, compare, and restore all saved iterations of your ATS engineering resume.
          </p>
        </div>

        <div className="history-header-actions">
          <button
            type="button"
            className="history-btn-studio"
            onClick={() => navigate('/resume')}
          >
            <span>✏️</span> Resume Studio
          </button>
          <button
            type="button"
            className="history-btn-templates"
            onClick={() => navigate('/resume/templates')}
          >
            <span>📄</span> Browse Templates
          </button>
        </div>
      </div>

      {/* Statistics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '14px', background: 'var(--bg-card)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Versions</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
            {stats.totalVersions}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '14px', background: 'var(--bg-card)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Latest Version</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#8B5CF6', marginTop: '0.25rem' }}>
            {stats.latestVersion}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '14px', background: 'var(--bg-card)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Best ATS Score</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10B981', marginTop: '0.25rem' }}>
            {stats.bestAtsScore}/100
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '14px', background: 'var(--bg-card)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Last Updated</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.45rem' }}>
            {formatRelativeTime(stats.lastUpdated)}
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      {loading ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)', borderRadius: '16px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <p>Loading resume version history...</p>
        </div>
      ) : error && versions.length === 0 ? (
        /* Error State */
        <div className="glass-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center', borderRadius: '16px', background: 'var(--bg-card)' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>⚠️</div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Unable to Load Resume History
          </h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 1.75rem auto', fontSize: '0.92rem' }}>
            {error}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <GradientButton onClick={fetchHistory}>
              🔄 Retry Loading
            </GradientButton>
          </div>
        </div>
      ) : versions.length === 0 ? (
        /* Empty State */
        <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', borderRadius: '16px', background: 'var(--bg-card)' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📜</div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            No Saved Resume Versions Yet
          </h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 1.75rem auto', fontSize: '0.92rem' }}>
            Every time you save your resume in Resume Studio, a timestamped snapshot is stored here for backup, comparison, and restoration.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <GradientButton onClick={() => navigate('/resume')}>
              ✨ Go to Resume Studio
            </GradientButton>
            <button
              type="button"
              className="history-btn-secondary"
              onClick={() => navigate('/resume/templates')}
            >
              <span>📄</span> Browse Templates
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', background: 'var(--bg-card)' }}>
          {/* Search & Sort Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '240px', maxWidth: '400px' }}>
              <input
                type="text"
                placeholder="Search versions by title, changes, template..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem 0.65rem 2.5rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  fontSize: '0.88rem',
                }}
              />
              <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                🔍
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Sort by:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                style={{
                  padding: '0.65rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                }}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest-ats">Highest ATS Score</option>
              </select>
            </div>
          </div>

          {/* Versions List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredVersions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                No versions match your search criteria.
              </div>
            ) : (
              filteredVersions.map((v) => {
                const isLatest = v.versionNumber === highestVersionNum;
                const atsBadge = getAtsBadgeColor(v.atsScore || 78);

                return (
                  <motion.div
                    key={v._id || v.versionNumber}
                    whileHover={{ scale: 1.005 }}
                    style={{
                      padding: '1.25rem',
                      borderRadius: '12px',
                      background: 'var(--bg-secondary)',
                      border: isLatest ? '1.5px solid #8B5CF6' : '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem',
                    }}
                  >
                    {/* Left Column: Version Badge + Details */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '280px' }}>
                      <div
                        style={{
                          width: '52px',
                          height: '52px',
                          borderRadius: '12px',
                          background: isLatest ? 'linear-gradient(135deg, #8B5CF6, #7C3AED)' : 'var(--hover-bg)',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '1.1rem',
                          boxShadow: isLatest ? '0 4px 15px rgba(139, 92, 246, 0.3)' : 'none',
                          flexShrink: 0,
                        }}
                      >
                        V{v.versionNumber}
                      </div>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                          <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {v.title || `Version ${v.versionNumber}`}
                          </h4>

                          {isLatest && (
                            <span
                              style={{
                                background: 'rgba(139, 92, 246, 0.2)',
                                color: '#8B5CF6',
                                border: '1px solid #8B5CF6',
                                padding: '0.15rem 0.55rem',
                                borderRadius: '20px',
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                              }}
                            >
                              LATEST
                            </span>
                          )}

                          <span
                            style={{
                              background: atsBadge.bg,
                              color: atsBadge.color,
                              padding: '0.15rem 0.6rem',
                              borderRadius: '20px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                            }}
                          >
                            ATS {v.atsScore || 78}/100 ({atsBadge.label})
                          </span>

                          <span
                            style={{
                              background: 'var(--hover-bg)',
                              color: 'var(--text-secondary)',
                              padding: '0.15rem 0.55rem',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                            }}
                          >
                            {v.source === 'restored' ? '🔄 Restored' : '💾 Saved'}
                          </span>
                        </div>

                        <div style={{ marginTop: '0.35rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          📝 <strong>Changes:</strong> {v.changeSummary || 'Saved resume updates'}
                        </div>

                        <div style={{ marginTop: '0.2rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          🎨 {getTemplateName(v.template)} • Saved {formatRelativeTime(v.savedAt)} ({new Date(v.savedAt).toLocaleString()})
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Action Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => setPreviewVersion(v)}
                        style={{
                          padding: '0.5rem 0.85rem',
                          borderRadius: '8px',
                          background: 'var(--hover-bg)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-primary)',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        👁️ Preview
                      </button>

                      <button
                        type="button"
                        onClick={() => openCompareModal(v)}
                        style={{
                          padding: '0.5rem 0.85rem',
                          borderRadius: '8px',
                          background: 'rgba(59, 130, 246, 0.15)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          color: '#3B82F6',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        ⚖️ Compare
                      </button>

                      <button
                        type="button"
                        onClick={() => setRestoreModalVersion(v)}
                        style={{
                          padding: '0.5rem 0.85rem',
                          borderRadius: '8px',
                          background: 'rgba(139, 92, 246, 0.15)',
                          border: '1px solid rgba(139, 92, 246, 0.3)',
                          color: '#8B5CF6',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        🔄 Restore
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownload(v)}
                        style={{
                          padding: '0.5rem 0.85rem',
                          borderRadius: '8px',
                          background: 'rgba(16, 185, 129, 0.15)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          color: '#10B981',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        📥 Download
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteModalVersion(v)}
                        style={{
                          padding: '0.5rem 0.65rem',
                          borderRadius: '8px',
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#EF4444',
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                        }}
                        title="Delete Version Snapshot"
                      >
                        🗑️
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      <AnimatePresence>
        {previewVersion && (
          <div className="profile-modal-overlay" style={{ zIndex: 9999 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="profile-modal-container"
              style={{ width: '100%', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Previewing Version {previewVersion.versionNumber} ({previewVersion.title})
                  </h3>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Saved {new Date(previewVersion.savedAt).toLocaleString()} • ATS Score: {previewVersion.atsScore}/100
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewVersion(null)}
                  style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  ✕
                </button>
              </div>

              {previewVersion.resumeData ? (
                <ResumePreview
                  personalInfo={previewVersion.resumeData.personalInfo}
                  education={previewVersion.resumeData.education}
                  skills={previewVersion.resumeData.skills}
                  projects={previewVersion.resumeData.projects}
                  experience={previewVersion.resumeData.experience}
                  certifications={previewVersion.resumeData.certifications}
                  templateId={previewVersion.template || previewVersion.resumeData.templateId}
                  isPreviewOnly={true}
                />
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No preview data stored for this snapshot.
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setPreviewVersion(null)}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '8px',
                    background: 'var(--hover-bg)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Close Preview
                </button>
                <GradientButton
                  onClick={() => {
                    setRestoreModalVersion(previewVersion);
                    setPreviewVersion(null);
                  }}
                >
                  🔄 Restore This Version
                </GradientButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* COMPARE MODAL */}
      <AnimatePresence>
        {compareModalOpen && compareSource && (
          <div className="profile-modal-overlay" style={{ zIndex: 9999 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="profile-modal-container"
              style={{ maxWidth: '950px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Compare Resume Versions
                  </h3>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Side-by-side section diff comparison between saved iterations
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCompareModalOpen(false)}
                  style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  ✕
                </button>
              </div>

              {/* Version Selectors */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Base Version (Source):</label>
                  <div style={{ marginTop: '0.35rem', fontWeight: 800, color: '#8B5CF6', fontSize: '1.05rem' }}>
                    V{compareSource.versionNumber} ({compareSource.title}) — ATS {compareSource.atsScore}/100
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Compare Against (Target):</label>
                  <select
                    value={compareTargetId}
                    onChange={(e) => {
                      setCompareTargetId(e.target.value);
                      runComparison(compareSource._id, e.target.value);
                    }}
                    style={{
                      width: '100%',
                      marginTop: '0.35rem',
                      padding: '0.55rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--input-bg)',
                      color: 'var(--text-primary)',
                      fontWeight: 600,
                    }}
                  >
                    {versions
                      .filter(v => v._id !== compareSource._id)
                      .map(v => (
                        <option key={v._id} value={v._id}>
                          V{v.versionNumber} ({v.title}) — ATS {v.atsScore}/100 ({new Date(v.savedAt).toLocaleDateString()})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Comparison Results */}
              {compareLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  Calculating version differences...
                </div>
              ) : comparisonResult ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Skills Diff */}
                  <div style={{ padding: '1rem', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                    <h5 style={{ margin: '0 0 0.75rem 0', color: 'var(--text-primary)', fontWeight: 700 }}>⚡ Skills Differences</h5>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {comparisonResult.changes.skills.added.map(s => (
                        <span key={s} style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10B981', padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
                          + Added: {s}
                        </span>
                      ))}
                      {comparisonResult.changes.skills.removed.map(s => (
                        <span key={s} style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#EF4444', padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
                          - Removed: {s}
                        </span>
                      ))}
                      {comparisonResult.changes.skills.added.length === 0 && comparisonResult.changes.skills.removed.length === 0 && (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No skill differences between these versions.</span>
                      )}
                    </div>
                  </div>

                  {/* Experience & Education Breakdown */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ padding: '1rem', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                      <h5 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontWeight: 700 }}>💼 Experience Count</h5>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        Base (V{comparisonResult.versionA.versionNumber}): {comparisonResult.changes.experience.countFrom} roles<br />
                        Target (V{comparisonResult.versionB.versionNumber}): {comparisonResult.changes.experience.countTo} roles
                      </div>
                    </div>

                    <div style={{ padding: '1rem', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                      <h5 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontWeight: 700 }}>🎓 Education Count</h5>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        Base (V{comparisonResult.versionA.versionNumber}): {comparisonResult.changes.education.countFrom} entries<br />
                        Target (V{comparisonResult.versionB.versionNumber}): {comparisonResult.changes.education.countTo} entries
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setCompareModalOpen(false)}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '8px',
                    background: 'var(--hover-bg)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Close Comparison
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RESTORE CONFIRMATION MODAL */}
      <AnimatePresence>
        {restoreModalVersion && (
          <div className="profile-modal-overlay" style={{ zIndex: 9999 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="profile-modal-container"
              style={{ maxWidth: '520px', width: '90%' }}
            >
              <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Restore Version {restoreModalVersion.versionNumber}?
              </h3>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                Restoring this version will replace your active Resume Studio content with <strong>"{restoreModalVersion.title}"</strong> and log a new restoration snapshot. None of your existing history will be lost.
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setRestoreModalVersion(null)}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '8px',
                    background: 'var(--hover-bg)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <GradientButton
                  onClick={handleConfirmRestore}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Restoring...' : 'Confirm Restore'}
                </GradientButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteModalVersion && (
          <div className="profile-modal-overlay" style={{ zIndex: 9999 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="profile-modal-container"
              style={{ maxWidth: '520px', width: '90%' }}
            >
              <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Delete Version {deleteModalVersion.versionNumber}?
              </h3>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                This will permanently remove historical snapshot <strong>"{deleteModalVersion.title}"</strong> from your audit history. Your active resume content will not be affected.
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setDeleteModalVersion(null)}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '8px',
                    background: 'var(--hover-bg)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleConfirmDelete}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '8px',
                    background: '#EF4444',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {actionLoading ? 'Deleting...' : 'Delete Version'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ResumeHistory;
