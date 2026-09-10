import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/common/StatCard';
import TicketTable from '../components/tickets/TicketTable';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { PlusCircle, Ticket, AlertCircle, Clock, CheckCircle2, ArrowRight } from 'lucide-react';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, ticketsRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/tickets')
        ]);

        setStats(statsRes.data.data);
        // Display top 5 most recent tickets
        setRecentTickets(ticketsRes.data.data.slice(0, 5));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading your support dashboard..." />;
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
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
            Track the status of your existing requests or submit a new inquiry
          </p>
        </div>

        <Link to="/tickets/new" className="btn btn-primary">
          <PlusCircle size={16} />
          <span>Create New Ticket</span>
        </Link>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="stats-grid">
        <StatCard
          label="Total Tickets"
          value={stats?.total}
          icon={Ticket}
          color="blue"
          onClick={() => navigate('/tickets')}
        />
        <StatCard
          label="Open"
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
          label="Resolved"
          value={stats?.resolved}
          icon={CheckCircle2}
          color="emerald"
          onClick={() => navigate('/tickets?status=RESOLVED')}
        />
      </div>

      {/* Recent Tickets Section */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <Ticket size={20} color="var(--primary)" />
            <span>Recent Tickets</span>
          </h2>
          {recentTickets.length > 0 && (
            <Link
              to="/tickets"
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          )}
        </div>

        {recentTickets.length === 0 ? (
          <EmptyState
            title="No support tickets yet"
            description="You haven't submitted any tickets yet. Whenever you experience an issue or have a question, create a ticket."
            actionText="Submit Your First Ticket"
            onAction={() => navigate('/tickets/new')}
          />
        ) : (
          <TicketTable tickets={recentTickets} showCustomer={false} />
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
