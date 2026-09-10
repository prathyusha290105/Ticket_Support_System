import React from 'react';

const LoadingSpinner = ({ message = 'Loading content...' }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3.5rem 1rem',
        color: 'var(--text-muted)'
      }}
    >
      <div
        className="spinner"
        style={{
          width: '2.5rem',
          height: '2.5rem',
          borderColor: 'var(--border-color)',
          borderTopColor: 'var(--primary)',
          marginBottom: '1rem'
        }}
      />
      <p style={{ fontSize: '0.9375rem', fontWeight: 500 }}>{message}</p>
    </div>
  );
};

export default LoadingSpinner;
