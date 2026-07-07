import React from 'react';

function CertificationsForm({ data, onChange }) {
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
        name: '',
        issuingOrganization: '',
        issueDate: '',
        credentialUrl: '',
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
            title="Remove Certification"
          >
            ✕
          </button>
          <h4 style={{ marginBottom: '1.25rem', fontSize: '1rem', color: 'var(--accent-primary)' }}>
            Certification Entry #{index + 1}
          </h4>

          <div className="auth-form" style={{ gap: '1rem' }}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Certification Name *</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="AWS Certified Solutions Architect"
                  value={item.name || ''}
                  onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Issuing Organization *</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Amazon Web Services"
                  value={item.issuingOrganization || ''}
                  onChange={(e) => handleItemChange(index, 'issuingOrganization', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Issue Date (e.g. Month Year)</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="January 2024"
                  value={item.issueDate || ''}
                  onChange={(e) => handleItemChange(index, 'issueDate', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Credential Verification URL</label>
                <input
                  className="form-input"
                  type="url"
                  placeholder="https://credly.com/verify/..."
                  value={item.credentialUrl || ''}
                  onChange={(e) => handleItemChange(index, 'credentialUrl', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      <button type="button" className="add-entry-btn" onClick={handleAddItem}>
        ＋ Add Certification
      </button>
    </div>
  );
}

export default CertificationsForm;
