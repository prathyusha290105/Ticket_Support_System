import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import TicketFilter from '../components/tickets/TicketFilter';
import TicketTable from '../components/tickets/TicketTable';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { Ticket, PlusCircle, AlertCircle, RefreshCw } from 'lucide-react';

const TicketsPage = () => {
  const { isAgent } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Extract initial filters from URL params
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    priority: searchParams.get('priority') || '',
    category: searchParams.get('category') || '',
    assignedAgent: searchParams.get('assignedAgent') || ''
  });

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.category) params.category = filters.category;
      if (filters.assignedAgent) params.assignedAgent = filters.assignedAgent;

      const res = await api.get('/tickets', { params });
      setTickets(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tickets.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    // Update URL search parameters
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val) params.set(key, val);
    });
    setSearchParams(params);
  };

  const handleResetFilters = () => {
    const emptyFilters = {
      search: '',
      status: '',
      priority: '',
      category: '',
      assignedAgent: ''
    };
    setFilters(emptyFilters);
    setSearchParams(new URLSearchParams());
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {isAgent ? 'Support Ticket Queue' : 'My Support Tickets'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
            {isAgent
              ? 'Review, triage, and manage customer inquiries across all departments'
              : 'View status history and updates for all tickets you have raised'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={fetchTickets}
            className="btn btn-secondary"
            title="Refresh tickets list"
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? 'spinner' : ''} />
            <span>Refresh</span>
          </button>

          <Link to="/tickets/new" className="btn btn-primary">
            <PlusCircle size={16} />
            <span>New Ticket</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Panel */}
      <TicketFilter
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Tickets List */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <Ticket size={18} color="var(--primary)" />
            <span>
              {loading ? 'Fetching records...' : `Tickets Found (${tickets.length})`}
            </span>
          </h2>
        </div>

        {loading ? (
          <LoadingSpinner message="Searching tickets database..." />
        ) : tickets.length === 0 ? (
          <EmptyState
            title="No tickets matched your search"
            description="Try clearing your search keyword or relaxing status and priority filters."
            actionText="Reset All Filters"
            onAction={handleResetFilters}
          />
        ) : (
          <TicketTable tickets={tickets} showCustomer={isAgent} />
        )}
      </div>
    </div>
  );
};

export default TicketsPage;
