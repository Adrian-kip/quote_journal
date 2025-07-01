import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = ({ openCreateModal }) => {
  const { user, logoutUser, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login'); // Redirect to login after logout
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        Quote Journal
      </Link>
      <div className="navbar-links">
        <button onClick={toggleTheme} className="theme-toggle-btn">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        
        {user ? (
          // Links to show if user is logged in
          <>
            <button onClick={openCreateModal} className="nav-link create-btn">
              Create Quote
            </button>
            <Link to="/profile" className="nav-link">Profile</Link>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </>
        ) : (
          // Links to show if user is logged out
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/signup" className="nav-link">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;