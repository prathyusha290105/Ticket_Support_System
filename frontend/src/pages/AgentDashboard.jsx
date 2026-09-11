import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/common/StatCard';
import TicketTable from '../components/tickets/TicketTable';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

import {
  Ticket,
  AlertCircle,
  Clock,
  CheckCircle2,
  Flame,
  UserCheck,
  ArrowRight,
  Filter,
  BarChart3,
  TrendingUp,
  XCircle
} from 'lucide-react';

const CATEGORY_LABELS = {
  'Technical Issue': 'Technical Issue',
  Billing: 'Billing',
  Account: 'Account',
  General: 'General',
  Other: 'Other'
};

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
          api.get('/tickets?status=OPEN')
        ]);

        setStats(statsRes.data.data);
        setPriorityTickets(ticketsRes.data.data.slice(0, 6));
      } catch (err) {
        setError(
          err.response?.data?.message ||
          'Failed to load agent dashboard.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAgentDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading support operations dashboard..." />;
  }

  const totalTickets = stats?.total || 0;
  const resolvedTickets = stats?.resolved || 0;
  const resolutionRate =
    totalTickets > 0
      ? Math.round((resolvedTickets / totalTickets) * 100)
      : 0;

  const categories = stats?.categories || {};

  const categoryData = Object.entries(CATEGORY_LABELS).map(
    ([key, label]) => ({
      key,
      label,
      count: categories[key] || 0
    })
  );

  const maxCategoryCount = Math.max(
    ...categoryData.map((category) => category.count),
    1
  );

  return (
    <div>
      {/* Header */}
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
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.25rem'
            }}
          >
            <span className="role-badge agent">Support Staff</span>

            <span
              style={{
                fontSize: '0.875rem',
                color: 'var(--text-muted)'
              }}
            >
              Ticket Operations
            </span>
          </div>

          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: 'var(--text-main)'
            }}
          >
            Welcome back, Agent {user?.name?.split(' ')[0]}!
          </h1>

          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.9375rem',
              marginTop: '0.25rem'
            }}
          >
            System-wide ticketing queue, assignments, and resolution performance
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '0.75rem'
          }}
        >
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

      {/* Operations Metrics */}
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

        <StatCard
          label="Closed"
          value={stats?.closed}
          icon={XCircle}
          color="slate"
          onClick={() => navigate('/tickets?status=CLOSED')}
        />
      </div>

      {/* Operations Insights */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 2fr) minmax(260px, 1fr)',
          gap: '1rem',
          marginTop: '1rem'
        }}
      >
        {/* Category Distribution */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                <BarChart3 size={20} color="var(--primary)" />
                <span>Ticket Distribution</span>
              </h2>

              <p
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--text-muted)',
                  marginTop: '0.125rem'
                }}
              >
                Current ticket volume across support categories
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              paddingTop: '0.5rem'
            }}
          >
            {categoryData.map((category) => (
              <div key={category.key}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.35rem'
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'var(--text-main)'
                    }}
                  >
                    {category.label}
                  </span>

                  <span
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--text-muted)',
                      fontWeight: 600
                    }}
                  >
                    {category.count}
                  </span>
                </div>

                <div
                  style={{
                    width: '100%',
                    height: '8px',
                    background: 'var(--bg-subtle, #f1f5f9)',
                    borderRadius: '999px',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      width: `${(category.count / maxCategoryCount) * 100}%`,
                      height: '100%',
                      background: 'var(--primary)',
                      borderRadius: '999px',
                      transition: 'width 0.4s ease'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resolution Performance */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                <TrendingUp size={20} color="var(--primary)" />
                <span>Resolution Performance</span>
              </h2>

              <p
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--text-muted)',
                  marginTop: '0.125rem'
                }}
              >
                Overall support resolution progress
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem 0.5rem'
            }}
          >
            <div
              style={{
                width: '130px',
                height: '130px',
                borderRadius: '50%',
                background: `conic-gradient(
                  var(--primary) ${resolutionRate * 3.6}deg,
                  var(--bg-subtle, #f1f5f9) ${resolutionRate * 3.6}deg
                )`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div
                style={{
                  width: '102px',
                  height: '102px',
                  borderRadius: '50%',
                  background: 'var(--surface, #ffffff)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column'
                }}
              >
                <span
                  style={{
                    fontSize: '1.75rem',
                    fontWeight: 800,
                    color: 'var(--text-main)'
                  }}
                >
                  {resolutionRate}%
                </span>

                <span
                  style={{
                    fontSize: '0.7rem',
                    color: 'var(--text-muted)'
                  }}
                >
                  resolved
                </span>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
                marginTop: '1.25rem',
                padding: '0 0.5rem'
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)'
                  }}
                >
                  Resolved
                </div>

                <strong>{resolvedTickets}</strong>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)'
                  }}
                >
                  Total
                </div>

                <strong>{totalTickets}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Open Queue Triage */}
      <div
        className="card"
        style={{
          marginTop: '1rem'
        }}
      >
        <div className="card-header">
          <div>
            <h2 className="card-title">
              <AlertCircle size={20} color="var(--primary)" />
              <span>Open Ticket Queue</span>
            </h2>

            <p
              style={{
                fontSize: '0.8125rem',
                color: 'var(--text-muted)',
                marginTop: '0.125rem'
              }}
            >
              Customer issues currently awaiting resolution or further agent action
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
          <TicketTable
            tickets={priorityTickets}
            showCustomer={true}
          />
        )}
      </div>
    </div>
  );
};

export default AgentDashboard;