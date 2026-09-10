import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Checking authentication session..." />;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If unauthorized for this specific role route, redirect to root dashboard
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
