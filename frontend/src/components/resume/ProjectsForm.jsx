import React from 'react';

function ProjectsForm({ data, onChange }) {
  const handleItemChange = (index, field, value) => {
    const updated = [...data];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    onChange(updated);
  };

  const handleAddItem = () => {
    onChange([
      ...data,
      {
        title: '',
        description: '',
        technologies: '',
        githubUrl: '',
        liveUrl: '',
      },
    ]);
  };

  const handleRemoveItem = (index) => {
    const updated = data.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div>
      {data.map((item, index) => (
        <div key={index} className="dynamic-entry-card">
          <button
            type="button"
            className="remove-entry-btn"
            onClick={() => handleRemoveItem(index)}
            title="Remove Project"
          >
            ✕
          </button>
          <h4 style={{ marginBottom: '1.25rem', fontSize: '1rem', color: 'var(--accent-primary)' }}>
            Project Entry #{index + 1}
          </h4>

          <div className="auth-form" style={{ gap: '1rem' }}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Project Title *</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="E-Commerce API Service"
                  value={item.title || ''}
                  onChange={(e) => handleItemChange(index, 'title', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Technologies used * (comma separated)</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Node.js, Express, MongoDB"
                  value={item.technologies || ''}
                  onChange={(e) => handleItemChange(index, 'technologies', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">GitHub Repository URL</label>
                <input
                  className="form-input"
                  type="url"
                  placeholder="https://github.com/username/project"
                  value={item.githubUrl || ''}
                  onChange={(e) => handleItemChange(index, 'githubUrl', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Live Deployment URL</label>
                <input
                  className="form-input"
                  type="url"
                  placeholder="https://project.heroku.com"
                  value={item.liveUrl || ''}
                  onChange={(e) => handleItemChange(index, 'liveUrl', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Project Description *</label>
              <textarea
                className="form-input"
                rows="3"
                placeholder="Describe what you built, features implemented, and problems solved..."
                value={item.description || ''}
                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                required
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>
        </div>
      ))}

      <button type="button" className="add-entry-btn" onClick={handleAddItem}>
        ＋ Add Project
      </button>
    </div>
  );
}

export default ProjectsForm;
