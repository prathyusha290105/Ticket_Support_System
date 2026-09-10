import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/common/StatCard';
import TicketTable from '../components/tickets/TicketTable';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import {
  Shield,
  Ticket,
  AlertCircle,
  Clock,
  CheckCircle2,
  Flame,
  UserCheck,
  ArrowRight,
  Filter
} from 'lucide-react';

const AgentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [priorityTickets, setPriorityTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAgentDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, ticketsRes] = await Promise.all([
          api.get('/dashboard/stats'),
          // Fetch open & in-progress tickets needing triage
          api.get('/tickets?status=OPEN')
        ]);

        setStats(statsRes.data.data);
        setPriorityTickets(ticketsRes.data.data.slice(0, 6));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load agent dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchAgentDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading support triage dashboard..." />;
  }

  return (
    <div>
      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="role-badge agent">Support Staff</span>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Ticket Operations</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Welcome back, Agent {user?.name?.split(' ')[0]}!
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
            System-wide ticketing queue, assignments, and resolution performance
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/tickets" className="btn btn-secondary">
            <Filter size={15} />
            <span>Browse Queue</span>
          </Link>
          <Link to="/tickets/new" className="btn btn-primary">
            <Ticket size={15} />
            <span>Create Ticket</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Cards Grid */}
      <div className="stats-grid">
        <StatCard
          label="Total Tickets"
          value={stats?.total}
          icon={Ticket}
          color="slate"
          onClick={() => navigate('/tickets')}
        />
        <StatCard
          label="Open Queue"
          value={stats?.open}
          icon={AlertCircle}
          color="blue"
          onClick={() => navigate('/tickets?status=OPEN')}
        />
        <StatCard
          label="In Progress"
          value={stats?.inProgress}
          icon={Clock}
          color="amber"
          onClick={() => navigate('/tickets?status=IN_PROGRESS')}
        />
        <StatCard
          label="High Priority"
          value={stats?.highPriority}
          icon={Flame}
          color="rose"
          onClick={() => navigate('/tickets?priority=HIGH')}
        />
        <StatCard
          label="Assigned to Me"
          value={stats?.assignedToMe}
          icon={UserCheck}
          color="purple"
          onClick={() => navigate('/tickets?assignedAgent=me')}
        />
        <StatCard
          label="Resolved"
          value={stats?.resolved}
          icon={CheckCircle2}
          color="emerald"
          onClick={() => navigate('/tickets?status=RESOLVED')}
        />
      </div>

      {/* Open Queue Triage Section */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">
              <AlertCircle size={20} color="var(--primary)" />
              <span>Incoming Open Tickets (Needs Triage)</span>
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
              Newly submitted customer issues awaiting review or agent assignment
            </p>
          </div>
          <Link
            to="/tickets?status=OPEN"
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            <span>View All Open</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {priorityTickets.length === 0 ? (
          <EmptyState
            title="Triage queue is clean!"
            description="There are currently no unassigned open tickets requiring immediate attention."
            actionText="View Complete Ticket History"
            onAction={() => navigate('/tickets')}
          />
        ) : (
          <TicketTable tickets={priorityTickets} showCustomer={true} />
        )}
      </div>
    </div>
  );
};

export default AgentDashboard;
