import React from 'react';

function EducationForm({ data, onChange }) {
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
        school: '',
        degree: '',
        fieldOfStudy: '',
        startYear: '',
        endYear: '',
        gpa: '',
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
            title="Remove Education"
          >
            ✕
          </button>
          <h4 style={{ marginBottom: '1.25rem', fontSize: '1rem', color: 'var(--accent-primary)' }}>
            Education Entry #{index + 1}
          </h4>

          <div className="auth-form" style={{ gap: '1rem' }}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">School/University *</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Stanford University"
                  value={item.school || ''}
                  onChange={(e) => handleItemChange(index, 'school', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Degree *</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="B.S. Computer Science"
                  value={item.degree || ''}
                  onChange={(e) => handleItemChange(index, 'degree', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Field of Study *</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Software Engineering"
                  value={item.fieldOfStudy || ''}
                  onChange={(e) => handleItemChange(index, 'fieldOfStudy', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">GPA (Scale 4.0 or 10.0)</label>
                <input
                  className="form-input"
                  type="number"
                  step="0.01"
                  placeholder="3.85"
                  value={item.gpa || ''}
                  onChange={(e) => handleItemChange(index, 'gpa', e.target.value ? parseFloat(e.target.value) : '')}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Start Year *</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="2022"
                  value={item.startYear || ''}
                  onChange={(e) => handleItemChange(index, 'startYear', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">End Year (or Expected) *</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="2026"
                  value={item.endYear || ''}
                  onChange={(e) => handleItemChange(index, 'endYear', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      <button type="button" className="add-entry-btn" onClick={handleAddItem}>
        ＋ Add Education
      </button>
    </div>
  );
}

export default EducationForm;
