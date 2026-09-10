import React from 'react';
import { Search, X, Filter } from 'lucide-react';

const TicketFilter = ({ filters, onChange, onReset }) => {
  const handleInputChange = (field, value) => {
    onChange({ ...filters, [field]: value });
  };

  const isFiltered =
    filters.search ||
    filters.status ||
    filters.priority ||
    filters.category;

  return (
    <div className="filter-bar">
      <div className="search-input-wrapper">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          className="form-control"
          placeholder="Search by ticket ID or title..."
          value={filters.search || ''}
          onChange={(e) => handleInputChange('search', e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <select
          className="form-control"
          style={{ width: 'auto' }}
          value={filters.status || ''}
          onChange={(e) => handleInputChange('status', e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>

        <select
          className="form-control"
          style={{ width: 'auto' }}
          value={filters.priority || ''}
          onChange={(e) => handleInputChange('priority', e.target.value)}
        >
          <option value="">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>

        <select
          className="form-control"
          style={{ width: 'auto' }}
          value={filters.category || ''}
          onChange={(e) => handleInputChange('category', e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="Technical Issue">Technical Issue</option>
          <option value="Billing">Billing</option>
          <option value="Account">Account</option>
          <option value="General">General</option>
          <option value="Other">Other</option>
        </select>

        {isFiltered && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onReset}
            title="Reset filters"
          >
            <X size={14} />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default TicketFilter;
