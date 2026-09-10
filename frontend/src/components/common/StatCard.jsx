import React from 'react';

const StatCard = ({ label, value, icon: Icon, color = 'blue', onClick }) => {
  const colorStyles = {
    blue: { bg: '#eff6ff', color: '#2563eb' },
    amber: { bg: '#fffbeb', color: '#d97706' },
    emerald: { bg: '#ecfdf5', color: '#059669' },
    slate: { bg: '#f1f5f9', color: '#475569' },
    rose: { bg: '#fef2f2', color: '#dc2626' },
    purple: { bg: '#f5f3ff', color: '#7c3aed' }
  };

  const style = colorStyles[color] || colorStyles.blue;

  return (
    <div
      className="stat-card"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="stat-icon" style={{ backgroundColor: style.bg, color: style.color }}>
        {Icon && <Icon size={24} />}
      </div>
      <div className="stat-info">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value ?? 0}</span>
      </div>
    </div>
  );
};

export default StatCard;
