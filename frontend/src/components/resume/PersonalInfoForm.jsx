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
          <input
            className="form-input"
            type="text"
            id="fullName"
            name="fullName"
            placeholder="John Doe"
            value={data.fullName || ''}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="email">Email Address *</label>
          <input
            className="form-input"
            type="email"
            id="email"
            name="email"
            placeholder="john.doe@example.com"
            value={data.email || ''}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="phone">Phone Number *</label>
          <input
            className="form-input"
            type="tel"
            id="phone"
            name="phone"
            placeholder="+1 (555) 019-2834"
            value={data.phone || ''}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="address">Address/Location</label>
          <input
            className="form-input"
            type="text"
            id="address"
            name="address"
            placeholder="San Francisco, CA"
            value={data.address || ''}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="githubUrl">GitHub Profile URL</label>
          <input
            className="form-input"
            type="url"
            id="githubUrl"
            name="githubUrl"
            placeholder="https://github.com/username"
            value={data.githubUrl || ''}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="linkedinUrl">LinkedIn Profile URL</label>
          <input
            className="form-input"
            type="url"
            id="linkedinUrl"
            name="linkedinUrl"
            placeholder="https://linkedin.com/in/username"
            value={data.linkedinUrl || ''}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="portfolioUrl">Portfolio Website URL</label>
        <input
          className="form-input"
          type="url"
          id="portfolioUrl"
          name="portfolioUrl"
          placeholder="https://john-doe.dev"
          value={data.portfolioUrl || ''}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="summary">Professional Summary</label>
        <textarea
          className="form-input"
          id="summary"
          name="summary"
          rows="4"
          placeholder="Passionate Software Engineer with 2+ years of full-stack engineering expertise..."
          value={data.summary || ''}
          onChange={handleChange}
          style={{ resize: 'vertical' }}
        />
      </div>
    </div>
  );
}

export default PersonalInfoForm;
