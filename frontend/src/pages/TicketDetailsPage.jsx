import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/common/StatusBadge';
import PriorityBadge from '../components/common/PriorityBadge';
import MessageThread from '../components/tickets/MessageThread';
import ReplyBox from '../components/tickets/ReplyBox';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  UserCheck,
  RefreshCw
} from 'lucide-react';

const TicketDetailsPage = () => {
  const { id } = useParams();
  const { user, isAgent } = useAuth();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyLoading, setReplyLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchTicketData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [ticketRes, messagesRes] = await Promise.all([
        api.get(`/tickets/${id}`),
        api.get(`/tickets/${id}/messages`)
      ]);

      setTicket(ticketRes.data.data);
      setMessages(messagesRes.data.data);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load ticket details or conversation.'
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTicketData();
  }, [fetchTicketData]);

  const handleStatusChange = async (newStatus) => {
    try {
      setActionLoading(true);
      setError('');
      const res = await api.patch(`/tickets/${id}`, { status: newStatus });
      setTicket(res.data.data);
      setSuccessMsg(`Ticket status updated to ${newStatus}`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update ticket status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePriorityChange = async (newPriority) => {
    try {
      setActionLoading(true);
      setError('');
      const res = await api.patch(`/tickets/${id}`, { priority: newPriority });
      setTicket(res.data.data);
      setSuccessMsg(`Ticket priority updated to ${newPriority}`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update ticket priority.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignToMe = async () => {
    try {
      setActionLoading(true);
      setError('');
      const res = await api.patch(`/tickets/${id}/assign`, { agentId: user._id });
      setTicket(res.data.data);
      setSuccessMsg('You have successfully taken ownership of this ticket.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign ticket.');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePostReply = async (messageText) => {
    try {
      setReplyLoading(true);
      setError('');
      const res = await api.post(`/tickets/${id}/messages`, { message: messageText });
      // Append the new message to state
      setMessages((prev) => [...prev, res.data.data]);

      // If status changed on backend (e.g. customer replied to resolved ticket), re-fetch ticket state
      if (ticket.status === 'RESOLVED' && !isAgent) {
        setTicket((prev) => ({ ...prev, status: 'IN_PROGRESS' }));
      }

      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post reply.');
      return false;
    } finally {
      setReplyLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  if (loading) {
    return <LoadingSpinner message="Fetching ticket details and conversation thread..." />;
  }

  if (error && !ticket) {
    return (
      <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
        <button onClick={() => navigate('/tickets')} className="btn btn-secondary">
          <ArrowLeft size={16} />
          <span>Back to Tickets</span>
        </button>
      </div>
    );
  }

  const isAssignedToCurrentAgent = ticket?.assignedAgent?._id === user?._id;
  const isTicketClosed = ticket?.status === 'CLOSED';

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Back link & Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}
      >
        <Link
          to="/tickets"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            fontSize: '0.875rem',
            color: 'var(--text-muted)'
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Tickets</span>
        </Link>

        <button
          onClick={fetchTicketData}
          className="btn btn-secondary btn-sm"
          title="Refresh conversation"
          disabled={loading}
        >
          <RefreshCw size={13} className={loading ? 'spinner' : ''} />
          <span>Refresh Thread</span>
        </button>
      </div>

      {successMsg && (
        <div className="alert alert-success">
          <CheckCircle size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Ticket Overview Header Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              <span className="ticket-id" style={{ fontSize: '0.875rem' }}>
                #{ticket._id.toUpperCase()}
              </span>
              <span className="category-tag">{ticket.category}</span>
              <PriorityBadge priority={ticket.priority} />
              <StatusBadge status={ticket.status} />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {ticket.title}
            </h1>
          </div>

          {/* Support Agent Quick Action Controls */}
          {isAgent && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                flexWrap: 'wrap',
                background: 'var(--bg-subtle)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)'
              }}
            >
              {!isAssignedToCurrentAgent && (
                <button
                  onClick={handleAssignToMe}
                  className="btn btn-primary btn-sm"
                  disabled={actionLoading}
                >
                  <UserCheck size={14} />
                  <span>Assign to Me</span>
                </button>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>STATUS:</span>
                <select
                  className="form-control"
                  style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.8125rem' }}
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={actionLoading}
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>PRIORITY:</span>
                <select
                  className="form-control"
                  style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.8125rem' }}
                  value={ticket.priority}
                  onChange={(e) => handlePriorityChange(e.target.value)}
                  disabled={actionLoading}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Metadata Details Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            padding: '1rem 0',
            borderTop: '1px solid var(--border-color)',
            borderBottom: '1px solid var(--border-color)',
            fontSize: '0.8125rem'
          }}
        >
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block' }}>Customer</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.25rem', fontWeight: 600 }}>
              <User size={14} color="var(--primary)" />
              <span>{ticket.customer?.name}</span>
              <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.75rem' }}>
                ({ticket.customer?.email})
              </span>
            </div>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block' }}>Assigned Agent</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.25rem', fontWeight: 600 }}>
              <ShieldCheck size={14} color="var(--agent-accent)" />
              <span>{ticket.assignedAgent ? ticket.assignedAgent.name : 'Unassigned'}</span>
            </div>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block' }}>Created On</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.25rem', color: 'var(--text-main)' }}>
              <Calendar size={14} />
              <span>{formatDate(ticket.createdAt)}</span>
            </div>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block' }}>Last Updated</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.25rem', color: 'var(--text-main)' }}>
              <Clock size={14} />
              <span>{formatDate(ticket.updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div style={{ marginTop: '1.25rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.025em', marginBottom: '0.5rem' }}>
            Problem Description
          </h3>
          <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: 'var(--text-main)' }}>
            {ticket.description}
          </p>
        </div>
      </div>

      {/* Conversation Thread & Replies Card */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <MessageSquare size={18} color="var(--primary)" />
            <span>Conversation History ({messages.length})</span>
          </h2>
        </div>

        <MessageThread messages={messages} />

        <ReplyBox
          onSubmit={handlePostReply}
          loading={replyLoading}
          isClosed={isTicketClosed}
        />
      </div>
    </div>
  );
};

export default TicketDetailsPage;
