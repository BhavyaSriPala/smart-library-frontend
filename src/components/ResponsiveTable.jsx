import React from 'react';

const ResponsiveTable = ({ children, className = '' }) => {
  return (
    <div className={`table-responsive ${className}`}>
      <table className="data-table">{children}</table>
    </div>
  );
};

export default ResponsiveTable;
