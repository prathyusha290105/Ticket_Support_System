import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LifeBuoy, Lock, Mail, AlertCircle, ArrowRight, UserCheck, Shield } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isSessionExpired = new URLSearchParams(location.search).get('session') === 'expired';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(email.trim(), password);
      navigate('/');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div
            className="brand-icon"
            style={{ width: '44px', height: '44px', margin: '0 auto 1rem auto' }}
          >
            <LifeBuoy size={26} />
          </div>
          <h1>Welcome to SupportDesk</h1>
          <p>Sign in to manage your support requests and tickets</p>
        </div>

        {isSessionExpired && (
          <div className="alert alert-error">
            <AlertCircle size={16} />
            <span>Your session has expired. Please sign in again.</span>
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="email"
                type="email"
                className="form-control"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: '1rem', height: '1rem' }} />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', marginTop: '1.25rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ fontWeight: 600 }}>
            Register as Customer
          </Link>
        </p>

        {/* Demo 1-Click Fill Box */}
        <div className="demo-credentials-box">
          <h4>One-Click Demo Credentials</h4>
          <div className="demo-btn-group">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickFill('customer@supportdesk.com', 'password123')}
            >
              <UserCheck size={13} color="var(--primary)" />
              <span>Demo Customer</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickFill('agent@supportdesk.com', 'password123')}
            >
              <Shield size={13} color="var(--agent-accent)" />
              <span>Demo Agent</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
