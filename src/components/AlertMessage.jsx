import React from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

const AlertMessage = ({ type = 'error', message, onClose }) => {
  if (!message) return null;

  const isError = type === 'error';
  const isSuccess = type === 'success';

  return (
    <div className={`alert alert-${type}`} role="alert">
      <div style={{ flexShrink: 0, marginTop: '2px' }}>
        {isError && <AlertCircle size={18} />}
        {isSuccess && <CheckCircle2 size={18} />}
        {!isError && !isSuccess && <Info size={18} />}
      </div>
      <div style={{ flex: 1 }}>{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.1rem',
            lineHeight: 1,
            color: 'inherit',
            opacity: 0.7,
          }}
          aria-label="Close"
        >
          &times;
        </button>
      )}
    </div>
  );
};

export default AlertMessage;
