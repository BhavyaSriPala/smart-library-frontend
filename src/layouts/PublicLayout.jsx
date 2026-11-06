import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

const PublicLayout = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <div className="public-layout">
      <header className="public-navbar">
        <Link to="/" className="brand-logo">
          <div className="brand-icon">
            <BookOpen size={20} />
          </div>
          <span>Smart Library</span>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link
            to="/"
            style={{
              fontWeight: 500,
              color: 'var(--secondary-700)',
              fontSize: '0.95rem',
            }}
          >
            Home
          </Link>

          {isAuthenticated ? (
            <Link to={isAdmin ? '/admin/dashboard' : '/student/dashboard'}>
              <Button variant="primary" size="sm">
                Go to Dashboard
              </Button>
            </Link>
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
        </nav>
      </header>

      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      <footer
        style={{
          borderTop: '1px solid var(--secondary-200)',
          padding: '24px 32px',
          textAlign: 'center',
          color: 'var(--secondary-500)',
          fontSize: '0.85rem',
          backgroundColor: '#ffffff',
        }}
      >
        <p>Smart Library Management Portal &copy; {new Date().getFullYear()} — Mini MERN Project</p>
      </footer>
    </div>
  );
};

export default PublicLayout;
