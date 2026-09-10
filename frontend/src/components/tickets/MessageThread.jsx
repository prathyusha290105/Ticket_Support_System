import React from 'react';
import { User, Headphones, Clock } from 'lucide-react';

const MessageThread = ({ messages = [] }) => {
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  return (
    <div className="thread-container">
      {messages.length === 0 ? (
        <div
          style={{
            padding: '2rem 1rem',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.875rem'
          }}
        >
          No messages in this conversation yet. Send a message below to start the thread.
        </div>
      ) : (
        messages.map((msg) => {
          const isAgent = msg.sender?.role === 'AGENT';

          return (
            <div
              key={msg._id}
              className={`message-bubble ${isAgent ? 'agent-message' : 'customer-message'}`}
            >
              <div className="message-header">
                <div className="message-author">
                  {isAgent ? (
                    <Headphones size={16} color="var(--agent-accent)" />
                  ) : (
                    <User size={16} color="var(--primary)" />
                  )}
                  <span>{msg.sender?.name || 'User'}</span>
                  <span className={`role-badge ${isAgent ? 'agent' : 'customer'}`}>
                    {isAgent ? 'Support Agent' : 'Customer'}
                  </span>
                </div>

                <div className="message-time" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock size={12} />
                  <span>{formatTime(msg.createdAt)}</span>
                </div>
              </div>

              <div className="message-body">{msg.message}</div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default MessageThread;
