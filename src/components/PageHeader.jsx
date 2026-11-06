import React from 'react';

const PageHeader = ({ title, description, actions = null }) => {
  return (
    <div className="page-header">
      <div className="page-header-content">
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </div>
  );
};

export default PageHeader;
