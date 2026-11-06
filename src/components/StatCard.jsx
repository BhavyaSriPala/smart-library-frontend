import React from 'react';

const StatCard = ({
  title,
  value,
  icon: Icon,
  variant = 'primary', // primary | success | warning | info
  description,
  onClick,
}) => {
  return (
    <div
      className="stat-card"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {Icon && (
        <div className={`stat-icon-wrapper stat-icon-${variant}`}>
          <Icon size={26} />
        </div>
      )}
      <div className="stat-info">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{title}</div>
        {description && (
          <div style={{ fontSize: '0.75rem', color: 'var(--secondary-400)', marginTop: '2px' }}>
            {description}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
