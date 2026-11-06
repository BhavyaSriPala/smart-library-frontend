import React from 'react';

const Card = ({
  children,
  title,
  subtitle,
  action,
  className = '',
  style = {},
}) => {
  return (
    <div className={`card ${className}`} style={style}>
      {(title || action) && (
        <div className="card-header">
          <div>
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="card-body">{children}</div>
    </div>
  );
};

export default Card;
