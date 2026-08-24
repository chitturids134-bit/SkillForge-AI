import React, { useState, useEffect, useCallback } from 'react';
import { getCompanyProfile, updateCompanyProfile } from '../../services/companyService';
import StatusBadge from '../../components/common/StatusBadge';
import GradientButton from '../../components/common/GradientButton';

function TagInput({ label, tags = [], onAddTag, onRemoveTag, placeholder }) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (inputValue.trim()) {
        onAddTag(inputValue.trim());
        setInputValue('');
      }
    }
  };

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
        {label}
      </label>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          padding: '0.65rem 0.85rem',
          borderRadius: '10px',
          background: 'var(--input-bg)',
          border: '1px solid var(--border-color)',
          minHeight: '44px',
          alignItems: 'center',
        }}
      >
        {tags.map((tag, idx) => (
          <span
            key={idx}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.3rem 0.65rem',
              borderRadius: '6px',
              background: 'rgba(139, 92, 246, 0.15)',
              color: '#8B5CF6',
              fontSize: '0.82rem',
              fontWeight: 600,
            }}
          >
            {tag}
            <button
              type="button"
              onClick={() => onRemoveTag(tag)}
              style={{
                background: 'none',
                border: 'none',
                color: '#8B5CF6',
                cursor: 'pointer',
                fontSize: '0.9rem',
                padding: 0,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || 'Type & press Enter...'}
          style={{
            border: 'none',
            background: 'transparent',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: '0.85rem',
            flex: 1,
            minWidth: '140px',
          }}
        />
      </div>
    </div>
  );
}

function CompanyProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'saved', 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const [imageError, setImageError] = useState(false);

  const [initialData, setInitialData] = useState(null);
  const [formData, setFormData] = useState({
    companyName: '',
    logoUrl: '',
    tagline: '',
    description: '',
    website: '',
    email: '',
    phone: '',
    industry: '',
    companySize: '11-50',
    foundedYear: '',
    headquarters: '',
    hiringStatus: 'actively-hiring',
    hiringCategories: [],
    specialties: [],
    technologies: [],
  });

  const [verification, setVerification] = useState({
    status: 'unverified',
    rejectionReason: '',
  });

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await getCompanyProfile();
      if (res && res.success && res.data) {
        const c = res.data;
        const normalized = {
          companyName: c.companyName || '',
          logoUrl: c.logoUrl || '',
          tagline: c.tagline || '',
          description: c.description || '',
          website: c.website || '',
          email: c.email || '',
          phone: c.phone || '',
          industry: c.industry || '',
          companySize: c.companySize || '11-50',
          foundedYear: c.foundedYear || '',
          headquarters: c.headquarters || '',
          hiringStatus: c.hiringStatus || 'actively-hiring',
          hiringCategories: c.hiringCategories || [],
          specialties: c.specialties || [],
          technologies: c.technologies || [],
        };

        setFormData(normalized);
        setInitialData(normalized);
        setVerification(c.verification || { status: 'unverified' });
      }
    } catch (err) {
      console.error('Fetch Company Profile Error:', err);
      setErrorMsg(err.message || 'Failed to load company profile.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSaveStatus(null);
    setErrorMsg('');
  };

  const handleAddTag = (field, tag) => {
    if (!formData[field].includes(tag)) {
      setFormData((prev) => ({ ...prev, [field]: [...prev[field], tag] }));
      setSaveStatus(null);
      setErrorMsg('');
    }
  };

  const handleRemoveTag = (field, tag) => {
    setFormData((prev) => ({ ...prev, [field]: prev[field].filter((t) => t !== tag) }));
    setSaveStatus(null);
    setErrorMsg('');
  };

  const isDirty = initialData && JSON.stringify(initialData) !== JSON.stringify(formData);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSaveStatus(null);

    try {
      const res = await updateCompanyProfile(formData);
      if (res && res.success && res.data) {
        const updated = res.data;
        const normalized = {
          companyName: updated.companyName || '',
          logoUrl: updated.logoUrl || '',
          tagline: updated.tagline || '',
          description: updated.description || '',
          website: updated.website || '',
          email: updated.email || '',
          phone: updated.phone || '',
          industry: updated.industry || '',
          companySize: updated.companySize || '11-50',
          foundedYear: updated.foundedYear || '',
          headquarters: updated.headquarters || '',
          hiringStatus: updated.hiringStatus || 'actively-hiring',
          hiringCategories: updated.hiringCategories || [],
          specialties: updated.specialties || [],
          technologies: updated.technologies || [],
        };
        setFormData(normalized);
        setInitialData(normalized);
        setVerification(updated.verification || { status: 'unverified' });
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        throw new Error(res?.message || 'Failed to save changes.');
      }
    } catch (err) {
      console.error('Update Profile Error:', err);
      setSaveStatus('error');
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to save company profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (initialData) {
      setFormData(initialData);
      setErrorMsg('');
      setSaveStatus(null);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', width: '100%' }}>
        <div className="glass-panel" style={{ padding: '3rem', borderRadius: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem', animation: 'spin 1s infinite linear' }}>⚙️</div>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Loading company profile...</p>
        </div>
      </div>
    );
  }

  const isVerified = verification.status === 'verified';
  const initials = (formData.companyName || 'C').slice(0, 2).toUpperCase();

  return (
    <div style={{ padding: '2rem', width: '100%' }}>
      
      {/* Page Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              🏢 Company Profile Management
            </h1>
            <StatusBadge status={isVerified ? 'Verified' : verification.status === 'pending' ? 'Pending' : 'Unverified'} />
          </div>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>
            Manage organization details, hiring tags, tech stack showcase, and candidate public profile.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {isDirty && (
            <button
              type="button"
              onClick={handleCancel}
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
          )}
          <button
            type="submit"
            className="recruiter-dashboard-cta-btn"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? 'Saving...' : saveStatus === 'saved' ? 'Saved ✓' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* VERIFIED SECURITY WARNING BANNER */}
      {isVerified && (
        <div
          className="glass-panel"
          style={{
            padding: '1.25rem 1.5rem',
            borderRadius: '14px',
            marginBottom: '2rem',
            background: 'rgba(59, 130, 246, 0.12)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>🔒</span>
          <div>
            <div style={{ fontWeight: 800, color: '#3B82F6', fontSize: '0.92rem', marginBottom: '0.2rem' }}>
              Verified Corporate Identity Information Locked
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Your organization identity has been verified by SkillForge AI Admin. Critical fields (Company Name, Domain, Email, Industry, Size, Location) are locked to protect employer trust. Contact Admin to request changes.
            </div>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {errorMsg && (
        <div style={{ padding: '0.85rem 1.25rem', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#EF4444', fontWeight: 600, marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {saveStatus === 'saved' && (
        <div style={{ padding: '0.85rem 1.25rem', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#22C55E', fontWeight: 600, marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          ✅ Company profile updated successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* 1. Core Identity */}
        <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '16px', background: 'var(--bg-card)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
            📌 Core Company Identity
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Company Name {isVerified && '🔒'}
              </label>
              <input
                type="text"
                disabled={isVerified}
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.85rem',
                  borderRadius: '10px',
                  background: isVerified ? 'var(--hover-bg)' : 'var(--input-bg)',
                  border: '1px solid var(--border-color)',
                  color: isVerified ? 'var(--text-muted)' : 'var(--text-primary)',
                  cursor: isVerified ? 'not-allowed' : 'text',
                  outline: 'none',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Corporate Domain / Website {isVerified && '🔒'}
              </label>
              <input
                type="url"
                disabled={isVerified}
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://acme.com"
                style={{
                  width: '100%',
                  padding: '0.75rem 0.85rem',
                  borderRadius: '10px',
                  background: isVerified ? 'var(--hover-bg)' : 'var(--input-bg)',
                  border: '1px solid var(--border-color)',
                  color: isVerified ? 'var(--text-muted)' : 'var(--text-primary)',
                  cursor: isVerified ? 'not-allowed' : 'text',
                  outline: 'none',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Official Corporate Email {isVerified && '🔒'}
              </label>
              <input
                type="email"
                disabled={isVerified}
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="recruiter@acme.com"
                style={{
                  width: '100%',
                  padding: '0.75rem 0.85rem',
                  borderRadius: '10px',
                  background: isVerified ? 'var(--hover-bg)' : 'var(--input-bg)',
                  border: '1px solid var(--border-color)',
                  color: isVerified ? 'var(--text-muted)' : 'var(--text-primary)',
                  cursor: isVerified ? 'not-allowed' : 'text',
                  outline: 'none',
                  fontSize: '0.9rem',
                }}
              />
            </div>
          </div>
        </div>

        {/* 2. Organization Metrics & Location */}
        <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '16px', background: 'var(--bg-card)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
            🏢 Organization Details & Location
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Industry Sector {isVerified && '🔒'}
              </label>
              <input
                type="text"
                disabled={isVerified}
                value={formData.industry}
                onChange={(e) => handleChange('industry', e.target.value)}
                placeholder="e.g. Software & AI Platforms"
                style={{
                  width: '100%',
                  padding: '0.75rem 0.85rem',
                  borderRadius: '10px',
                  background: isVerified ? 'var(--hover-bg)' : 'var(--input-bg)',
                  border: '1px solid var(--border-color)',
                  color: isVerified ? 'var(--text-muted)' : 'var(--text-primary)',
                  cursor: isVerified ? 'not-allowed' : 'text',
                  outline: 'none',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Company Size {isVerified && '🔒'}
              </label>
              <select
                disabled={isVerified}
                value={formData.companySize}
                onChange={(e) => handleChange('companySize', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.85rem',
                  borderRadius: '10px',
                  background: isVerified ? 'var(--hover-bg)' : 'var(--input-bg)',
                  border: '1px solid var(--border-color)',
                  color: isVerified ? 'var(--text-muted)' : 'var(--text-primary)',
                  cursor: isVerified ? 'not-allowed' : 'pointer',
                  outline: 'none',
                  fontSize: '0.9rem',
                }}
              >
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="501-1000">501-1000 employees</option>
                <option value="1001-5000">1001-5000 employees</option>
                <option value="5001+">5001+ employees</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Headquarters Location {isVerified && '🔒'}
              </label>
              <input
                type="text"
                disabled={isVerified}
                value={formData.headquarters}
                onChange={(e) => handleChange('headquarters', e.target.value)}
                placeholder="e.g. San Francisco, CA"
                style={{
                  width: '100%',
                  padding: '0.75rem 0.85rem',
                  borderRadius: '10px',
                  background: isVerified ? 'var(--hover-bg)' : 'var(--input-bg)',
                  border: '1px solid var(--border-color)',
                  color: isVerified ? 'var(--text-muted)' : 'var(--text-primary)',
                  cursor: isVerified ? 'not-allowed' : 'text',
                  outline: 'none',
                  fontSize: '0.9rem',
                }}
              />
            </div>
          </div>
        </div>

        {/* 3. Editable Branding & Bio */}
        <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '16px', background: 'var(--bg-card)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
            🎨 Company Branding & Description
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Company Tagline
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                placeholder="e.g. Empowering developers through AI engineering"
                style={{
                  width: '100%',
                  padding: '0.75rem 0.85rem',
                  borderRadius: '10px',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Full Company Overview & Mission
              </label>
              <textarea
                rows={5}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Share your company history, work culture, engineering values..."
                style={{
                  width: '100%',
                  padding: '0.75rem 0.85rem',
                  borderRadius: '10px',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  resize: 'vertical',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          </div>
        </div>

        {/* 4. Hiring Tags */}
        <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '16px', background: 'var(--bg-card)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
            🎯 Hiring Status & Tags
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <TagInput
              label="Hiring Categories"
              tags={formData.hiringCategories}
              onAddTag={(t) => handleAddTag('hiringCategories', t)}
              onRemoveTag={(t) => handleRemoveTag('hiringCategories', t)}
              placeholder="e.g. Software Engineering, AI/ML"
            />

            <TagInput
              label="Core Technologies Hired For"
              tags={formData.technologies}
              onAddTag={(t) => handleAddTag('technologies', t)}
              onRemoveTag={(t) => handleRemoveTag('technologies', t)}
              placeholder="e.g. React, Node.js, Python"
            />
          </div>
        </div>

        {/* Footer Actions */}
        

      </form>
    </div>
  );
}

export default CompanyProfile;
