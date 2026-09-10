import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '5rem 1rem',
        textAlign: 'center'
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'var(--primary-light)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem'
        }}
      >
        <HelpCircle size={36} />
      </div>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
        404 - Page Not Found
      </h1>
      <p style={{ color: 'var(--text-muted)', maxWidth: '440px', marginBottom: '1.75rem' }}>
        The page or support resource you are looking for does not exist or may have been moved.
      </p>
      <Link to="/" className="btn btn-primary">
        <ArrowLeft size={16} />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
};

export default NotFoundPage;
