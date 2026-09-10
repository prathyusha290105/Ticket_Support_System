import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import PriorityBadge from '../common/PriorityBadge';
import { ChevronRight, User as UserIcon } from 'lucide-react';

const TicketTable = ({ tickets = [], showCustomer = false }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="table-responsive">
      <table className="ticket-table">
        <thead>
          <tr>
            <th>Ticket ID</th>
            <th>Title</th>
            {showCustomer && <th>Customer</th>}
            <th>Category</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Assigned Agent</th>
            <th>Updated</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket._id}>
              <td data-label="Ticket ID">
                <span className="ticket-id" title={ticket._id}>
                  #{ticket._id.slice(-6).toUpperCase()}
                </span>
              </td>
              <td data-label="Title">
                <Link to={`/tickets/${ticket._id}`} className="ticket-title-link">
                  {ticket.title}
                </Link>
              </td>
              {showCustomer && (
                <td data-label="Customer">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <UserIcon size={14} color="var(--text-muted)" />
                    <span style={{ fontWeight: 500 }}>{ticket.customer?.name || 'Customer'}</span>
                  </div>
                </td>
              )}
              <td data-label="Category">
                <span className="category-tag">{ticket.category}</span>
              </td>
              <td data-label="Priority">
                <PriorityBadge priority={ticket.priority} />
              </td>
              <td data-label="Status">
                <StatusBadge status={ticket.status} />
              </td>
              <td data-label="Assigned Agent">
                {ticket.assignedAgent ? (
                  <span style={{ fontWeight: 500, color: 'var(--agent-accent)' }}>
                    {ticket.assignedAgent.name}
                  </span>
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.8125rem' }}>
                    Unassigned
                  </span>
                )}
              </td>
              <td data-label="Updated" style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                {formatDate(ticket.updatedAt)}
              </td>
              <td data-label="Action">
                <Link
                  to={`/tickets/${ticket._id}`}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  <span>View</span>
                  <ChevronRight size={14} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TicketTable;
