import React from 'react';

function ExperienceForm({ data, onChange }) {
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
        company: '',
        role: '',
        location: '',
        startMonthYear: '',
        endMonthYear: '',
        current: false,
        description: '',
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
            title="Remove Experience"
          >
            ✕
          </button>
          <h4 style={{ marginBottom: '1.25rem', fontSize: '1rem', color: 'var(--accent-primary)' }}>
            Work Experience Entry #{index + 1}
          </h4>

          <div className="auth-form" style={{ gap: '1rem' }}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Company/Organization Name *</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Google"
                  value={item.company || ''}
                  onChange={(e) => handleItemChange(index, 'company', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Role/Job Title *</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Software Engineering Intern"
                  value={item.role || ''}
                  onChange={(e) => handleItemChange(index, 'role', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Mountain View, CA (or Remote)"
                  value={item.location || ''}
                  onChange={(e) => handleItemChange(index, 'location', e.target.value)}
                />
              </div>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.5rem', marginTop: '1.8rem' }}>
                <input
                  type="checkbox"
                  id={`current-${index}`}
                  checked={item.current || false}
                  onChange={(e) => handleItemChange(index, 'current', e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor={`current-${index}`} style={{ cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500' }}>
                  I currently work here
                </label>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Start Date * (e.g. Month Year)</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="June 2024"
                  value={item.startMonthYear || ''}
                  onChange={(e) => handleItemChange(index, 'startMonthYear', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">End Date * (or Present)</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="August 2024"
                  value={item.current ? 'Present' : (item.endMonthYear || '')}
                  onChange={(e) => handleItemChange(index, 'endMonthYear', e.target.value)}
                  disabled={item.current}
                  required={!item.current}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea
                className="form-input"
                rows="4"
                placeholder="Describe your achievements, roles, technologies used, and responsibilities..."
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
        ＋ Add Experience
      </button>
    </div>
  );
}

export default ExperienceForm;
