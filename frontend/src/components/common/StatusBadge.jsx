import React from 'react';

function StatusBadge({ status, type }) {
  const getBadgeClass = () => {
    const s = (status || type || '').toLowerCase();
    if (['active', 'completed', 'verified', 'hired', 'approved', 'success'].includes(s)) {
      return 'badge-success';
    }
    if (['pending', 'in progress', 'under review', 'scheduled', 'warning'].includes(s)) {
      return 'badge-warning';
    }
    if (['rejected', 'failed', 'declined', 'expired', 'danger'].includes(s)) {
      return 'badge-danger';
    }
    if (['developer', 'recruiter', 'admin', 'primary'].includes(s)) {
      return 'badge-primary';
    }
    return 'badge-secondary';
  };

  return (
    <span className={`badge ${getBadgeClass()}`}>
      ● {status || type}
    </span>
  );
}

export default StatusBadge;
