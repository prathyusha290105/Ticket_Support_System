import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CustomerDashboard from './pages/CustomerDashboard';
import AgentDashboard from './pages/AgentDashboard';
import TicketsPage from './pages/TicketsPage';
import CreateTicketPage from './pages/CreateTicketPage';
import TicketDetailsPage from './pages/TicketDetailsPage';
import NotFoundPage from './pages/NotFoundPage';

// Smart Home component that serves the right dashboard based on role
const RoleBasedDashboard = () => {
  const { user, isAgent } = useAuth();
  if (!user) return <LoadingSpinner message="Checking authentication status..." />;
  return isAgent ? <AgentDashboard /> : <CustomerDashboard />;
};

// Route wrapper that redirects already logged-in users away from /login and /register
const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner message="Loading..." />;
  if (user) return <Navigate to="/" replace />;
  return children;
};

const AppContent = () => {
  const { user } = useAuth();

  return (
    <div className="app-container">
      {user && <Navbar />}
      <main className="main-content">
        <Routes>
          {/* Public Auth Routes */}
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <RegisterPage />
              </PublicOnlyRoute>
            }
          />

          {/* Protected Application Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<RoleBasedDashboard />} />
            <Route path="/tickets" element={<TicketsPage />} />
            <Route path="/tickets/new" element={<CreateTicketPage />} />
            <Route path="/tickets/:id" element={<TicketDetailsPage />} />
          </Route>

          {/* Fallback 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
