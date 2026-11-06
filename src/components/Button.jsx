import React from 'react';

const Button = ({
  children,
  type = 'button',
  variant = 'primary', // primary | secondary | outline | danger | success
  size = 'md', // sm | md | lg
  disabled = false,
  loading = false,
  icon: Icon = null,
  onClick,
  className = '',
  ...props
}) => {
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
  const variantClass = `btn-${variant}`;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`btn ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <span
            className="spinner"
            style={{
              width: size === 'sm' ? '14px' : '18px',
              height: size === 'sm' ? '14px' : '18px',
              borderWidth: '2px',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              borderTopColor: '#ffffff',
            }}
          ></span>
          <span>Loading...</span>
        </>
      ) : (
        <>
          {Icon && <Icon size={size === 'sm' ? 15 : 18} />}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
