import React from 'react';

function PersonalInfoForm({ data, onChange }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({
      ...data,
      [name]: value,
    });
  };

  return (
    <div className="auth-form" style={{ gap: '1.25rem' }}>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="fullName">Full Name *</label>
          <div className="input-icon-wrapper">
            <span className="input-icon">👤</span>
            <input
              className="form-input with-icon"
              type="text"
              id="fullName"
              name="fullName"
              placeholder="Deva Dharshini"
              value={data.fullName || ''}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="email">Email Address *</label>
          <div className="input-icon-wrapper">
            <span className="input-icon">✉️</span>
            <input
              className="form-input with-icon"
              type="email"
              id="email"
              name="email"
              placeholder="user@skillforge.ai"
              value={data.email || ''}
              onChange={handleChange}
              required
            />
          </div>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="phone">Phone Number *</label>
          <div className="input-icon-wrapper">
            <span className="input-icon">📞</span>
            <input
              className="form-input with-icon"
              type="tel"
              id="phone"
              name="phone"
              placeholder="+1 (555) 019-2834"
              value={data.phone || ''}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="address">Address / Location</label>
          <div className="input-icon-wrapper">
            <span className="input-icon">📍</span>
            <input
              className="form-input with-icon"
              type="text"
              id="address"
              name="address"
              placeholder="San Francisco, CA"
              value={data.address || ''}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="githubUrl">GitHub Profile URL</label>
          <div className="input-icon-wrapper">
            <span className="input-icon">🔗</span>
            <input
              className="form-input with-icon"
              type="url"
              id="githubUrl"
              name="githubUrl"
              placeholder="https://github.com/username"
              value={data.githubUrl || ''}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="linkedinUrl">LinkedIn Profile URL</label>
          <div className="input-icon-wrapper">
            <span className="input-icon">🔗</span>
            <input
              className="form-input with-icon"
              type="url"
              id="linkedinUrl"
              name="linkedinUrl"
              placeholder="https://linkedin.com/in/username"
              value={data.linkedinUrl || ''}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="portfolioUrl">Portfolio Website URL</label>
        <div className="input-icon-wrapper">
          <span className="input-icon">🌐</span>
          <input
            className="form-input with-icon"
            type="url"
            id="portfolioUrl"
            name="portfolioUrl"
            placeholder="https://john-doe.dev"
            value={data.portfolioUrl || ''}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-group" style={{ position: 'relative' }}>
        <label className="form-label" htmlFor="summary">Professional Summary</label>
        <textarea
          className="form-input"
          id="summary"
          name="summary"
          rows="4"
          placeholder="Write a short summary about your experience and skills..."
          value={data.summary || ''}
          onChange={handleChange}
          maxLength={500}
          style={{ resize: 'vertical', paddingBottom: '1.75rem' }}
        />
        <span className="textarea-char-count">
          {(data.summary || '').length}/500
        </span>
      </div>
    </div>
  );
}

export default PersonalInfoForm;
