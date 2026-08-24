import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getRecruiterJobs,
  createRecruiterJob,
  updateRecruiterJob,
  changeRecruiterJobStatus,
  deleteRecruiterJob,
} from '../../services/recruiterService';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import GradientButton from '../../components/common/GradientButton';

function RecruiterJobs() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [metrics, setMetrics] = useState({ total: 0, activeCount: 0, closedCount: 0 });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingJob, setViewingJob] = useState(null);

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const [title, setTitle] = useState('');
  const [type, setType] = useState('Full-time');
  const [workMode, setWorkMode] = useState('Remote');
  const [experienceLevel, setExperienceLevel] = useState('Mid');
  const [location, setLocation] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getRecruiterJobs({ search, status: statusFilter });
      if (res && res.success) {
        setJobs(res.data || []);
        setMetrics(res.metrics || { total: 0, activeCount: 0, closedCount: 0 });
      } else {
        throw new Error(res?.message || 'Failed to load jobs');
      }
    } catch (err) {
      console.error('Fetch Recruiter Jobs Error:', err);
      setError(err.message || 'Unable to connect to job service.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const openCreateModal = () => {
    setEditingJob(null);
    setTitle('');
    setType('Full-time');
    setWorkMode('Remote');
    setExperienceLevel('Mid');
    setLocation('San Francisco, CA (Hybrid)');
    setSalaryMin('1200000');
    setSalaryMax('2400000');
    setRequiredSkills('React, Node.js, TypeScript, MongoDB');
    setDescription('We are looking for a talented software engineer to build scalability into our AI platform.');
    setRequirements('3+ years of experience with React & Node.js\nStrong understanding of RESTful APIs and MongoDB');
    setFormError('');
    setFormSuccess('');
    setShowFormModal(true);
  };

  const openEditModal = (job) => {
    setEditingJob(job);
    setTitle(job.title || '');
    setType(job.type || 'Full-time');
    setWorkMode(job.workMode || 'Remote');
    setExperienceLevel(job.experienceLevel || 'Mid');
    setLocation(job.location || '');
    setSalaryMin(job.salaryRange?.min || '');
    setSalaryMax(job.salaryRange?.max || '');
    setRequiredSkills(Array.isArray(job.requiredSkills) ? job.requiredSkills.join(', ') : '');
    setDescription(job.description || '');
    setRequirements(Array.isArray(job.requirements) ? job.requirements.join('\n') : '');
    setFormError('');
    setFormSuccess('');
    setShowFormModal(true);
  };

  const openViewModal = (job) => {
    setViewingJob(job);
    setShowViewModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!title.trim() || !description.trim() || !location.trim()) {
      setFormError('Please fill in Job Title, Description, and Location.');
      return;
    }

    if (!requiredSkills.trim()) {
      setFormError('At least one required skill is required.');
      return;
    }

    const minSal = Number(salaryMin) || 0;
    const maxSal = Number(salaryMax) || 0;
    if (minSal > 0 && maxSal > 0 && minSal > maxSal) {
      setFormError('Minimum salary cannot exceed maximum salary.');
      return;
    }

    setFormSubmitting(true);
    try {
      const payload = {
        title,
        type,
        workMode,
        experienceLevel,
        location,
        salaryMin: minSal,
        salaryMax: maxSal,
        requiredSkills,
        description,
        requirements,
      };

      let res;
      if (editingJob) {
        res = await updateRecruiterJob(editingJob._id, payload);
      } else {
        res = await createRecruiterJob(payload);
      }

      if (res && res.success) {
        setFormSuccess(editingJob ? 'Job updated successfully!' : 'Job posted successfully!');
        setTimeout(() => {
          setShowFormModal(false);
          fetchJobs();
        }, 1200);
      } else {
        setFormError(res?.message || 'Operation failed.');
      }
    } catch (err) {
      setFormError(err.message || 'Failed to save job posting.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleStatus = async (job) => {
    const nextStatus = job.status === 'active' ? 'closed' : 'active';
    const actionLabel = nextStatus === 'active' ? 'reopen' : 'close';

    if (!window.confirm('Are you sure you want to ' + actionLabel + ' "' + job.title + '"?')) {
      return;
    }

    try {
      const res = await changeRecruiterJobStatus(job._id, nextStatus);
      if (res && res.success) {
        fetchJobs();
      }
    } catch (err) {
      alert(err.message || 'Failed to update job status.');
    }
  };

  const handleDeleteJob = async (job) => {
    if (job.applicantCount > 0) {
      alert('Cannot delete "' + job.title + '" because it has ' + job.applicantCount + ' active applicant(s). Please close the job requisition instead to preserve hiring history.');
      return;
    }

    if (!window.confirm('Are you sure you want to permanently delete "' + job.title + '"?')) {
      return;
    }

    try {
      const res = await deleteRecruiterJob(job._id);
      if (res && res.success) {
        fetchJobs();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete job.');
    }
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
      header: 'Job Requisition',
      accessor: 'title',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: '0.2rem' }}>
            {row.title}
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '6px', background: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6' }}>
              {row.workMode || 'Remote'}
            </span>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '6px', background: 'var(--hover-bg)', color: 'var(--text-secondary)' }}>
              {row.type || 'Full-time'}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Location',
      accessor: 'location',
      render: (row) => (
        <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          📍 {row.location || 'Remote'}
        </span>
      ),
    },
    {
      header: 'Applicants',
      render: (row) => (
        <span style={{ fontSize: '0.82rem', fontWeight: 800, padding: '0.3rem 0.75rem', borderRadius: '20px', background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
          👥 {row.applicantCount || 0} candidate{row.applicantCount !== 1 ? 's' : ''}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.status === 'active' ? 'Active' : 'Closed'} />,
    },
    {
      header: 'Posted',
      render: (row) => (
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {formatDate(row.createdAt)}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <button
            onClick={() => openViewModal(row)}
            title="View Job Details"
            style={{ padding: '0.35rem 0.6rem', borderRadius: '7px', background: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.78rem' }}
          >
            👁️ View
          </button>

          <button
            onClick={() => openEditModal(row)}
            title="Edit Job"
            style={{ padding: '0.35rem 0.6rem', borderRadius: '7px', background: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.78rem' }}
          >
            ✏️ Edit
          </button>

          <button
            onClick={() => handleToggleStatus(row)}
            title={row.status === 'active' ? 'Close Job' : 'Reopen Job'}
            style={{ padding: '0.35rem 0.6rem', borderRadius: '7px', background: row.status === 'active' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(34, 197, 94, 0.12)', border: row.status === 'active' ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(34, 197, 94, 0.3)', color: row.status === 'active' ? '#F59E0B' : '#22C55E', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}
          >
            {row.status === 'active' ? '🔒 Close' : '🔓 Reopen'}
          </button>

          <button
            onClick={() => handleDeleteJob(row)}
            title="Delete Job"
            style={{ padding: '0.35rem 0.6rem', borderRadius: '7px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#EF4444', cursor: 'pointer', fontSize: '0.78rem' }}
          >
            🗑️
          </button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: '2rem', width: '100%' }}>
      
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.4rem 0' }}>
            💼 Job Management Studio
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>
            Create, manage, track, and audit active open requisition listings.
          </p>
        </div>

        <button
          type="button"
          className="recruiter-dashboard-cta-btn"
          onClick={openCreateModal}
        >
          <span>➕</span> Create New Job Posting
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '14px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            Total Requisitions
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {metrics.total || 0}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '14px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            Active Postings
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#22C55E' }}>
            {metrics.activeCount || 0}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '14px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            Closed Requisitions
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#EF4444' }}>
            {metrics.closedCount || 0}
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1rem 1.25rem', borderRadius: '14px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ flex: 1, minWidth: '260px' }}>
          <input
            type="text"
            placeholder="🔍 Search jobs by title, location, or skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '9px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['all', 'active', 'closed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: statusFilter === st ? '1px solid #8B5CF6' : '1px solid var(--border-color)',
                background: statusFilter === st ? 'rgba(139, 92, 246, 0.2)' : 'var(--bg-secondary)',
                color: statusFilter === st ? '#8B5CF6' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {st === 'all' ? 'All Jobs' : st}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', borderRadius: '14px', marginBottom: '2rem', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, color: '#EF4444', marginBottom: '0.2rem' }}>⚠️ Unable to Load Job Requisitions</div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{error}</div>
          </div>
          <GradientButton onClick={fetchJobs} style={{ background: '#EF4444' }}>🔄 Retry</GradientButton>
        </div>
      )}

      {loading ? (
        <div className="glass-panel" style={{ padding: '3rem', borderRadius: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem', animation: 'spin 1s infinite linear' }}>⚙️</div>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Loading job requisitions from database...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem 2rem', borderRadius: '16px', textAlign: 'center', background: 'var(--bg-card)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💼</div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>
            No Jobs Posted Yet
          </h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 1.5rem auto', fontSize: '0.92rem' }}>
            Create your first job posting to start receiving AI-matched candidate applications and scheduling technical screenings.
          </p>
          <button
            type="button"
            className="recruiter-dashboard-cta-btn"
            onClick={openCreateModal}
          >
            <span>➕</span> Create New Job Posting
          </button>
        </div>
      ) : (
        <DataTable columns={columns} data={jobs} />
      )}

      <AnimatePresence>
        {showFormModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel"
              style={{ width: '100%', maxWidth: '750px', borderRadius: '20px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border-color)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {editingJob ? '✏️ Edit Job Requisition' : '➕ Create New Job Requisition'}
                </h2>
                <button onClick={() => setShowFormModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
              </div>

              {formError && (
                <div style={{ padding: '0.75rem 1rem', borderRadius: '10px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.25rem' }}>
                  ⚠️ {formError}
                </div>
              )}

              {formSuccess && (
                <div style={{ padding: '0.75rem 1rem', borderRadius: '10px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#22C55E', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.25rem' }}>
                  ✅ {formSuccess}
                </div>
              )}

              <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Job Title *</label>
                  <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Senior AI Full Stack Engineer" style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '9px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Employment Type *</label>
                    <select value={type} onChange={(e) => setType(e.target.value)} style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '9px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Work Mode *</label>
                    <select value={workMode} onChange={(e) => setWorkMode(e.target.value)} style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '9px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}>
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Onsite">Onsite</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Experience Level *</label>
                    <select value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '9px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}>
                      <option value="Entry">Entry Level</option>
                      <option value="Mid">Mid Level</option>
                      <option value="Senior">Senior</option>
                      <option value="Lead">Lead / Staff</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Location *</label>
                    <input type="text" required value={location} onChange={(e) => setLocation(e.target.value)} placeholder="San Francisco, CA (Hybrid)" style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '9px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }} />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Salary Min (INR)</label>
                    <input type="number" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} placeholder="1200000" style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '9px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }} />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Salary Max (INR)</label>
                    <input type="number" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} placeholder="2400000" style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '9px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Required Skills (comma separated) *</label>
                  <input type="text" required value={requiredSkills} onChange={(e) => setRequiredSkills(e.target.value)} placeholder="React, Node.js, TypeScript, MongoDB" style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '9px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Job Description *</label>
                  <textarea rows={4} required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe key duties, company mission, and ideal candidate background..." style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '9px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Qualifications & Requirements (one per line)</label>
                  <textarea rows={3} value={requirements} onChange={(e) => setRequirements(e.target.value)} placeholder="3+ years of React experience&#10;Proficiency in RESTful APIs and Mongoose" style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '9px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowFormModal(false)}
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
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="recruiter-dashboard-cta-btn"
                    disabled={formSubmitting}
                  >
                    {formSubmitting ? 'Saving Requisition...' : (editingJob ? 'Update Requisition' : 'Publish Job Posting')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showViewModal && viewingJob && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel"
              style={{ width: '100%', maxWidth: '650px', borderRadius: '20px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border-color)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.3rem 0' }}>
                    {viewingJob.title}
                  </h2>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    🏢 {viewingJob.company || 'Organization'} • 📍 {viewingJob.location || 'Remote'}
                  </div>
                </div>
                <button onClick={() => setShowViewModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                <StatusBadge status={viewingJob.status === 'active' ? 'Active' : 'Closed'} />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: '6px', background: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6' }}>
                  {viewingJob.workMode}
                </span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: '6px', background: 'var(--hover-bg)', color: 'var(--text-secondary)' }}>
                  {viewingJob.type}
                </span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: '6px', background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6' }}>
                  👥 {viewingJob.applicantCount || 0} Candidates
                </span>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Required Tech Stack & Skills
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {viewingJob.requiredSkills?.map((sk, idx) => (
                    <span key={idx} style={{ fontSize: '0.8rem', fontWeight: 700, padding: '0.25rem 0.6rem', borderRadius: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  Job Description
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                  {viewingJob.description}
                </p>
              </div>

              {viewingJob.requirements?.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    Requirements & Qualifications
                  </div>
                  <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {viewingJob.requirements.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowViewModal(false)}
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

export default RecruiterJobs;
