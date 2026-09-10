import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosClient';
import { PlusCircle, ArrowLeft, AlertCircle, HelpCircle } from 'lucide-react';

const CreateTicketPage = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Technical Issue');
  const [priority, setPriority] = useState('MEDIUM');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || title.trim().length < 3) {
      setError('Please provide a descriptive title (at least 3 characters).');
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      setError('Please provide a detailed description of the issue (at least 10 characters).');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const res = await api.post('/tickets', {
        title: title.trim(),
        category,
        priority,
        description: description.trim()
      });

      const newTicket = res.data.data;
      navigate(`/tickets/${newTicket._id}`);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to create ticket. Please check your inputs.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/tickets"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
            marginBottom: '0.75rem'
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Tickets</span>
        </Link>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
          Create New Support Ticket
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
          Please fill out the form below with as much detail as possible to help our team resolve your request promptly.
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="ticketTitle">
              Ticket Title *
            </label>
            <input
              id="ticketTitle"
              type="text"
              className="form-control"
              placeholder="e.g. Cannot access invoice downloads on billing portal"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
              required
            />
            <p className="form-hint">Summarize your issue or request in a single concise sentence.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div>
              <label className="form-label" htmlFor="ticketCategory">
                Category *
              </label>
              <select
                id="ticketCategory"
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={loading}
              >
                <option value="Technical Issue">Technical Issue</option>
                <option value="Billing">Billing</option>
                <option value="Account">Account</option>
                <option value="General">General</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="form-label" htmlFor="ticketPriority">
                Urgency / Priority *
              </label>
              <select
                id="ticketPriority"
                className="form-control"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                disabled={loading}
              >
                <option value="LOW">Low — General questions or minor items</option>
                <option value="MEDIUM">Medium — Normal operational impact</option>
                <option value="HIGH">High — Critical blocker or system outage</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="ticketDesc">
              Description *
            </label>
            <textarea
              id="ticketDesc"
              className="form-control"
              rows={6}
              placeholder="Provide a step-by-step description of what happened, any error messages encountered, and expected behavior..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              required
            />
            <p className="form-hint">At least 10 characters. Include any URLs, error codes, or reproduction steps.</p>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.875rem',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '1.25rem'
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </button>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner" style={{ width: '1rem', height: '1rem' }} />
                  <span>Submitting Ticket...</span>
                </>
              ) : (
                <>
                  <PlusCircle size={16} />
                  <span>Submit Ticket</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicketPage;
