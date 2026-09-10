import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LifeBuoy, LayoutDashboard, Ticket, PlusCircle, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAgent } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="nav-brand">
          <div className="brand-icon">
            <LifeBuoy size={20} />
          </div>
          <span>SupportDesk</span>
        </Link>

        <nav className="nav-links">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/tickets"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <Ticket size={16} />
            <span>{isAgent ? 'All Tickets' : 'My Tickets'}</span>
          </NavLink>

          {/* Customers can quickly create tickets */}
          <NavLink
            to="/tickets/new"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <PlusCircle size={16} />
            <span>New Ticket</span>
          </NavLink>
        </nav>

        <div className="nav-user">
          <div className="user-info">
            <span className="user-name">{user.name}</span>
            <span className={`role-badge ${isAgent ? 'agent' : 'customer'}`}>
              {isAgent ? 'Support Agent' : 'Customer'}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="btn btn-secondary btn-sm"
            title="Sign out of your account"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
