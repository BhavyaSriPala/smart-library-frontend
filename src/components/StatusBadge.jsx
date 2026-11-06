import React from 'react';

const StatusBadge = ({ status }) => {
  if (!status) return null;

  const normalized = status.toString().trim().toLowerCase();

  let variant = 'info';
  let label = status;

  if (normalized === 'pending') {
    variant = 'info';
    label = 'PENDING';
  } else if (normalized === 'issued') {
    variant = 'warning';
    label = 'ISSUED';
  } else if (normalized === 'returned') {
    variant = 'success';
    label = 'RETURNED';
  } else if (normalized === 'paid') {
    variant = 'success';
    label = 'PAID';
  } else if (normalized === 'unpaid') {
    variant = 'danger';
    label = 'UNPAID';
  } else if (normalized === 'available') {
    variant = 'success';
    label = 'Available';
  } else if (
    normalized === 'unavailable' ||
    normalized === 'out of stock' ||
    normalized === '0'
  ) {
    variant = 'danger';
    label = 'Out of Stock';
  } else if (normalized === 'admin') {
    variant = 'primary';
    label = 'Admin / Librarian';
  } else if (normalized === 'student') {
    variant = 'info';
    label = 'Student';
  }

  return (
    <span className={`badge badge-${variant}`}>
      <span className="badge-dot"></span>
      {label}
    </span>
  );
};

export default StatusBadge;
