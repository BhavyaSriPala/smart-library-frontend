import React from 'react';

const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>{text}</p>
    </div>
  );
};

export default LoadingSpinner;
