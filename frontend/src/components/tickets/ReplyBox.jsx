import React, { useState } from 'react';
import { Send, Lock, AlertCircle } from 'lucide-react';

const ReplyBox = ({ onSubmit, loading, isClosed }) => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Please enter a message before sending.');
      return;
    }
    setError('');
    const success = await onSubmit(message);
    if (success) {
      setMessage('');
    }
  };

  if (isClosed) {
    return (
      <div className="alert" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
        <Lock size={16} />
        <span>This ticket is closed. New replies cannot be added to closed tickets.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
      {error && (
        <div className="alert alert-error" style={{ marginBottom: '0.75rem' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="form-group" style={{ marginBottom: '0.75rem' }}>
        <label className="form-label" htmlFor="replyMessage">
          Post a Reply
        </label>
        <textarea
          id="replyMessage"
          className="form-control"
          rows={4}
          placeholder="Write your response, inquiry, or update..."
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            if (error) setError('');
          }}
          disabled={loading}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="form-hint">
          Keep messages courteous, concise, and informative.
        </span>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || !message.trim()}
        >
          {loading ? (
            <>
              <div className="spinner" style={{ width: '1rem', height: '1rem' }} />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <Send size={15} />
              <span>Send Reply</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ReplyBox;
