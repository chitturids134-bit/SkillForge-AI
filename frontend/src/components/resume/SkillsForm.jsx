import React from 'react';

function SkillsForm({ data, onChange }) {
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div className="auth-form">
      <div className="form-group">
        <label className="form-label" htmlFor="skills">Skills * (comma separated)</label>
        <textarea
          className="form-input"
          id="skills"
          rows="6"
          placeholder="React, Node.js, Express, MongoDB, JavaScript, Python, Docker, Git"
          value={data || ''}
          onChange={handleChange}
          required
          style={{ resize: 'vertical' }}
        />
        <small style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Please separate each skill using a comma. For example: HTML, CSS, JavaScript, React.
        </small>
      </div>
    </div>
  );
}

export default SkillsForm;
