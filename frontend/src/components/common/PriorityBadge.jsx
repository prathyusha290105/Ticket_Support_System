import React from 'react';
import { ArrowDown, ArrowRight, ArrowUp } from 'lucide-react';

const priorityConfig = {
  LOW: {
    label: 'Low',
    className: 'LOW',
    icon: ArrowDown
  },
  MEDIUM: {
    label: 'Medium',
    className: 'MEDIUM',
    icon: ArrowRight
  },
  HIGH: {
    label: 'High',
    className: 'HIGH',
    icon: ArrowUp
  }
};

const PriorityBadge = ({ priority }) => {
  const config = priorityConfig[priority] || {
    label: priority,
    className: 'MEDIUM',
    icon: ArrowRight
  };

  const Icon = config.icon;

  return (
    <span className={`priority-badge ${config.className}`}>
      <Icon size={12} strokeWidth={2.5} />
      {config.label}
    </span>
  );
};

export default PriorityBadge;
