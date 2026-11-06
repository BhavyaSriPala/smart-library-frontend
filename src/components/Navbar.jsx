import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogOut, Menu, User } from 'lucide-react';
import Button from './Button';

const Navbar = ({ onToggleSidebar }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="top-navbar">
      <div style={{ display: 'flex', alignContent: 'center', alignItems: 'center', gap: '14px' }}>
        {isAuthenticated && (
          <button
            onClick={onToggleSidebar}
            aria-label="Toggle Sidebar"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              padding: '6px',
              borderRadius: 'var(--radius-xs)',
              cursor: 'pointer',
              color: 'var(--secondary-700)',
            }}
          >
            <Menu size={22} />
          </button>
        )}

        <Link to="/" className="brand-logo">
          <div className="brand-icon">
            <BookOpen size={20} />
          </div>
          <span>SmartLib</span>
          <span className="brand-tag">
            {isAdmin ? 'Admin' : isAuthenticated ? 'Student' : 'Portal'}
          </span>
        </Link>
      </div>

      <div className="user-profile-menu">
        {isAuthenticated ? (
          <>
            <div className="user-badge hide-mobile">
              <div className="user-avatar">
                {user?.name ? user.name.charAt(0).toUpperCase() : <User size={16} />}
              </div>
              <div className="user-details">
                <span className="user-name">{user?.name || 'User'}</span>
                <span className="user-role-label">
                  {isAdmin ? 'Librarian / Admin' : 'Student'}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={LogOut}
              onClick={handleLogout}
              title="Sign Out"
            >
              <span className="hide-mobile">Logout</span>
            </Button>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link to="/login">
              <Button variant="outline" size="sm">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm">
                Register
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
