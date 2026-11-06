import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Search, ShieldCheck, ArrowRight, BookMarked } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import Card from '../../components/Card';

const Home = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px 72px' }}>
      {/* Hero Section */}
      <section
        style={{
          textAlign: 'center',
          padding: '40px 16px 64px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            backgroundColor: 'var(--primary-50)',
            color: 'var(--primary-700)',
            border: '1px solid var(--primary-200)',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '20px',
          }}
        >
          <BookOpen size={16} /> Mini MERN Library Management Portal
        </div>

        <h1
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.25rem)',
            fontWeight: 800,
            color: 'var(--secondary-900)',
            maxWidth: '820px',
            marginBottom: '18px',
            letterSpacing: '-0.5px',
          }}
        >
          Digital Library Access for Modern Campus Learning
        </h1>

        <p
          style={{
            fontSize: '1.15rem',
            color: 'var(--secondary-600)',
            maxWidth: '680px',
            marginBottom: '36px',
            lineHeight: 1.6,
          }}
        >
          Explore books, check real-time availability, issue materials seamlessly, and manage library
          operations with role-based security.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'center' }}>
          {isAuthenticated ? (
            <Link to={isAdmin ? '/admin/dashboard' : '/student/dashboard'}>
              <Button size="lg" icon={ArrowRight}>
                Enter {isAdmin ? 'Admin' : 'Student'} Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button size="lg" variant="primary" icon={ArrowRight}>
                  Sign In to Portal
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="outline">
                  Create Student Account
                </Button>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Feature Grid */}
      <section style={{ marginTop: '20px' }}>
        <div className="grid grid-cols-3">
          <Card>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--primary-50)',
                color: 'var(--primary-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <Search size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Smart Book Search</h3>
            <p style={{ color: 'var(--secondary-500)', fontSize: '0.92rem' }}>
              Quickly find textbooks, guides, and reference material by title, author, or category with
              instant availability feedback.
            </p>
          </Card>

          <Card>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--success-50)',
                color: 'var(--success-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <BookMarked size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Student Issue Tracking</h3>
            <p style={{ color: 'var(--secondary-500)', fontSize: '0.92rem' }}>
              Students can view their active borrows, return history, and issue dates safely isolated to
              their personal dashboard.
            </p>
          </Card>

          <Card>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--info-50)',
                color: 'var(--info-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Librarian Administration</h3>
            <p style={{ color: 'var(--secondary-500)', fontSize: '0.92rem' }}>
              Admin dashboard for full inventory control, book additions, copy adjustments, and viewing
              registered students and circulation records.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Home;
