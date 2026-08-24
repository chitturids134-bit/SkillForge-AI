import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getRecruiterVerification, submitRecruiterVerification } from '../../services/recruiterService';
import StatusBadge from '../../components/common/StatusBadge';
import GradientButton from '../../components/common/GradientButton';

function RecruiterVerification() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verifData, setVerifData] = useState(null);

  // Form State for Submission Modal
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('Technology');
  const [companySize, setCompanySize] = useState('11-50');
  const [headquarters, setHeadquarters] = useState('');
  const [confirmAccuracy, setConfirmAccuracy] = useState(false);

  const [docBusinessReg, setDocBusinessReg] = useState('cert_inc_2026.pdf');
  const [docTaxId, setDocTaxId] = useState('ein_tax_verification.pdf');
  const [docIdentity, setDocIdentity] = useState('recruiter_id_auth.pdf');

  const fetchVerification = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getRecruiterVerification();
      if (res && res.success && res.data) {
        setVerifData(res.data);
        const comp = res.data.company || {};
        setCompanyName(comp.companyName || '');
        setEmail(comp.email || '');
        setWebsite(comp.website || '');
        setIndustry(comp.industry || 'Technology');
        setCompanySize(comp.companySize || '11-50');
        setHeadquarters(comp.headquarters || '');
      } else {
        throw new Error(res?.message || 'Failed to load verification status');
      }
    } catch (err) {
      console.error('Verification fetch error:', err);
      setError(err.message || 'Unable to connect to verification service');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVerification();
  }, [fetchVerification]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (status === 'APPROVED') {
      setFormError('Your organization is already verified by SkillForge AI Admin.');
      return;
    }

    if (!companyName || !email || !website) {
      setFormError('Please fill in all required company details.');
      return;
    }

    if (!confirmAccuracy) {
      setFormError('You must confirm that the submitted information and documents are accurate.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        companyName,
        email,
        website,
        industry,
        companySize,
        headquarters,
        documents: [
          { key: 'business_registration', name: 'Business Registration Certificate', filename: docBusinessReg },
          { key: 'tax_id', name: 'Corporate Tax Identification (EIN / VAT)', filename: docTaxId },
          { key: 'identity_proof', name: 'Recruiter Authorization ID', filename: docIdentity },
        ],
      };

      const res = await submitRecruiterVerification(payload);
      if (res && res.success) {
        setFormSuccess('Verification request submitted successfully for Admin review!');
        setVerifData(res.data);
        setTimeout(() => {
          setShowModal(false);
          setFormSuccess('');
        }, 1500);
      } else {
        setFormError(res?.message || 'Failed to submit verification request.');
      }
    } catch (err) {
      setFormError(err.message || 'Submission error. Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  const status = verifData?.status || 'NOT_STARTED'; // 'NOT_STARTED', 'PENDING', 'APPROVED', 'REJECTED'

  return (
    <div style={{ padding: '2rem', width: '100%' }}>
      
      {/* HEADER SECTION */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.4rem 0' }}>
          🏢 Recruiter Verification Center
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>
          Official corporate verification to post job requisitions, search talent, and access verified candidate profiles.
        </p>
      </div>

      {/* ERROR STATE */}
      {error && (
        <div
          className="glass-panel"
          style={{
            padding: '1.25rem 1.5rem',
            borderRadius: '14px',
            marginBottom: '2rem',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ fontWeight: 700, color: '#EF4444', marginBottom: '0.2rem' }}>
              ⚠️ Unable to Load Verification Information
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              {error}
            </div>
          </div>
          <GradientButton onClick={fetchVerification} style={{ background: '#EF4444' }}>
            🔄 Retry
          </GradientButton>
        </div>
      )}

      {/* LOADING STATE */}
      {loading ? (
        <div className="glass-panel" style={{ padding: '3rem', borderRadius: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem', animation: 'spin 1s infinite linear' }}>⚙️</div>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Loading verification details from database...</p>
        </div>
      ) : (
        <>
          {/* TOP VERIFICATION STATUS OVERVIEW CARD */}
          <div
            className="glass-panel"
            style={{
              padding: '2rem',
              borderRadius: '16px',
              marginBottom: '2rem',
              background: status === 'APPROVED'
                ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(16, 185, 129, 0.03))'
                : status === 'REJECTED'
                ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(220, 38, 38, 0.03))'
                : 'var(--bg-card)',
              border: status === 'APPROVED'
                ? '1px solid rgba(34, 197, 94, 0.3)'
                : status === 'REJECTED'
                ? '1px solid rgba(239, 68, 68, 0.3)'
                : '1px solid var(--border-color)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Verification Status
                  </h2>

                  {status === 'APPROVED' && (
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, padding: '0.3rem 0.8rem', borderRadius: '20px', background: 'rgba(34, 197, 94, 0.18)', color: '#22C55E', border: '1px solid rgba(34, 197, 94, 0.4)' }}>
                      ✓ Verified Organization
                    </span>
                  )}

                  {status === 'PENDING' && (
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, padding: '0.3rem 0.8rem', borderRadius: '20px', background: 'rgba(245, 158, 11, 0.18)', color: '#F59E0B', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
                      ⏳ Verification Pending
                    </span>
                  )}

                  {status === 'REJECTED' && (
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, padding: '0.3rem 0.8rem', borderRadius: '20px', background: 'rgba(239, 68, 68, 0.18)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                      ❌ Verification Rejected
                    </span>
                  )}

                  {status === 'NOT_STARTED' && (
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, padding: '0.3rem 0.8rem', borderRadius: '20px', background: 'var(--hover-bg)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                      ⚪ Not Started
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
                  {status === 'APPROVED' && 'Your organization has been officially verified by SkillForge AI Admin. You have full access to the recruiter workspace.'}
                  {status === 'PENDING' && 'Your verification request has been submitted and is currently under Admin review.'}
                  {status === 'REJECTED' && 'Your verification request was reviewed and rejected by Admin. Please update information and resubmit.'}
                  {status === 'NOT_STARTED' && 'Complete your corporate verification to unlock full candidate access and posting features.'}
                </p>
              </div>

              {/* ACTION BUTTON */}
              <div>
                {status === 'NOT_STARTED' && (
                  <button
                    type="button"
                    className="recruiter-dashboard-cta-btn"
                    onClick={() => setShowModal(true)}
                  >
                    <span>🚀</span> Start Verification
                  </button>
                )}

                {status === 'PENDING' && (
                  <button
                    type="button"
                    className="recruiter-dashboard-cta-btn"
                    disabled
                    style={{ opacity: 0.6, cursor: 'not-allowed' }}
                  >
                    <span>⏳</span> Under Admin Review
                  </button>
                )}

                {status === 'REJECTED' && (
                  <button
                    type="button"
                    className="recruiter-dashboard-cta-btn"
                    onClick={() => setShowModal(true)}
                  >
                    <span>🔄</span> Update & Resubmit
                  </button>
                )}

                {status === 'APPROVED' && (
                  <button
                    type="button"
                    className="recruiter-dashboard-cta-btn"
                    onClick={() => navigate('/recruiter/dashboard')}
                  >
                    <span>📊</span> Go to Recruiter Dashboard
                  </button>
                )}
              </div>
            </div>

            {/* REJECTION REASON DISPLAY */}
            {status === 'REJECTED' && verifData?.rejectionReason && (
              <div style={{ padding: '1rem 1.25rem', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', marginBottom: '1.5rem' }}>
                <div style={{ fontWeight: 800, color: '#EF4444', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  ❌ Reason for Rejection:
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  "{verifData.rejectionReason}"
                </div>
              </div>
            )}

            {/* PROGRESS STAGE INDICATOR */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              {verifData?.timeline?.map((step, index) => (
                <div
                  key={index}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: '12px',
                    background: step.completed
                      ? 'rgba(34, 197, 94, 0.12)'
                      : step.inProgress
                      ? 'rgba(245, 158, 11, 0.12)'
                      : step.rejected
                      ? 'rgba(239, 68, 68, 0.12)'
                      : 'var(--bg-secondary)',
                    border: step.completed
                      ? '1px solid rgba(34, 197, 94, 0.3)'
                      : step.inProgress
                      ? '1px solid rgba(245, 158, 11, 0.3)'
                      : step.rejected
                      ? '1px solid rgba(239, 68, 68, 0.3)'
                      : '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    Stage {index + 1}
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span>{step.completed ? '✅' : step.inProgress ? '⏳' : step.rejected ? '❌' : '⚪'}</span>
                    <span>{step.stage}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MAIN 2-COLUMN SECTION */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start', marginBottom: '2rem' }}>
            
            {/* LEFT: COMPANY DETAILS & REQUIREMENTS */}
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  🏢 Company Profile Summary
                </h3>
                <button
                  onClick={() => navigate('/recruiter/company')}
                  style={{ background: 'none', border: 'none', color: '#8B5CF6', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  View Profile →
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Organization:</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{verifData?.company?.companyName || 'Not Set'}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Corporate Email:</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{verifData?.company?.email || 'Not Set'}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Website Domain:</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{verifData?.company?.website || 'Not Set'}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Industry:</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{verifData?.company?.industry || 'Technology'}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Company Size:</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{verifData?.company?.companySize || '11-50'}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Recruiter Contact:</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{verifData?.company?.recruiterName || 'Recruiter'}</span>
                </div>
              </div>
            </div>

            {/* RIGHT: SUBMITTED DOCUMENTS */}
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 1.25rem 0' }}>
                📄 Required Verification Documents
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {verifData?.documents?.map((doc, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: '12px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      justify: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                        {doc.name}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {doc.filename || 'No document uploaded'}
                      </div>
                    </div>

                    <StatusBadge status={doc.status || 'Not Uploaded'} />
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* UNLOCKED RECRUITER BENEFITS GRID */}
          <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 1.25rem 0' }}>
              ✨ Verified Recruiter Benefits & Unlocked Features
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {verifData?.unlockedFeatures?.map((feat, i) => (
                <div
                  key={i}
                  style={{
                    padding: '1rem 1.25rem',
                    borderRadius: '12px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>✅</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                    {feat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* SUBMISSION MODAL */}
      <AnimatePresence>
        {showModal && (
          <div
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(8px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              padding: '1rem',
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel"
              style={{
                width: '100%',
                maxWidth: '650px',
                borderRadius: '20px',
                padding: '2rem',
                maxHeight: '90vh',
                overflowY: 'auto',
                border: '1px solid var(--border-color)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  🚀 Recruiter Verification Request
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}
                >
                  ✕
                </button>
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

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* Company Name & Email */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                      Organization Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Acme Corp"
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '9px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                      Corporate Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="recruiter@acme.com"
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '9px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                {/* Website Domain & Industry */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                      Corporate Website *
                    </label>
                    <input
                      type="url"
                      required
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://acme.com"
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '9px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                      Industry Sector *
                    </label>
                    <input
                      type="text"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      placeholder="Technology / Software"
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '9px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                {/* Document Attachments */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                    📄 Attach Verification Documents
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                        Business Registration Certificate *
                      </label>
                      <input
                        type="text"
                        value={docBusinessReg}
                        onChange={(e) => setDocBusinessReg(e.target.value)}
                        style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                        Corporate Tax ID / Registration Proof *
                      </label>
                      <input
                        type="text"
                        value={docTaxId}
                        onChange={(e) => setDocTaxId(e.target.value)}
                        style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Compliance Checkbox */}
                <div style={{ marginTop: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)', cursor: 'pointer', lineHeight: '1.4' }}>
                    <input
                      type="checkbox"
                      checked={confirmAccuracy}
                      onChange={(e) => setConfirmAccuracy(e.target.checked)}
                      style={{ width: '16px', height: '16px', marginTop: '2px', cursor: 'pointer' }}
                    />
                    <span>
                      I confirm that the corporate information and documents submitted are accurate and represent an authorized recruiter account.
                    </span>
                  </label>
                </div>

                {/* Submit Action */}
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <GradientButton variant="outline" onClick={() => setShowModal(false)}>
                    Cancel
                  </GradientButton>
                  <GradientButton type="submit" disabled={submitting}>
                    {submitting ? 'Submitting Request...' : 'Submit for Verification'}
                  </GradientButton>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default RecruiterVerification;
