import React from 'react';
import { AlertCircle, Clock, CheckCircle2, Lock } from 'lucide-react';

const statusConfig = {
  OPEN: {
    label: 'Open',
    className: 'OPEN',
    icon: AlertCircle
  },
  IN_PROGRESS: {
    label: 'In Progress',
    className: 'IN_PROGRESS',
    icon: Clock
  },
  RESOLVED: {
    label: 'Resolved',
    className: 'RESOLVED',
    icon: CheckCircle2
  },
  CLOSED: {
    label: 'Closed',
    className: 'CLOSED',
    icon: Lock
  }
};

const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || {
    label: status,
    className: 'OPEN',
    icon: AlertCircle
  };

  const Icon = config.icon;

  return (
    <span className={`status-badge ${config.className}`}>
      <Icon size={13} strokeWidth={2.5} />
      {config.label}
    </span>
  );
};

export default StatusBadge;
