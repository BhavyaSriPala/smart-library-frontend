import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  LayoutDashboard,
  Search,
  BookMarked,
  PlusCircle,
  Users,
  ClipboardList,
  RotateCcw,
  LogOut,
  X,
  Clock,
  IndianRupee,
} from 'lucide-react';
import Button from './Button';

const Sidebar = ({ isOpen, onClose }) => {
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (onClose) onClose();
  };

  const studentNavItems = [
    { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Books', path: '/student/books', icon: BookOpen },
    { label: 'Search Books', path: '/student/search', icon: Search },
    { label: 'My Books', path: '/student/my-books', icon: BookMarked },
  ];

  const adminNavItems = [
    { label: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Books', path: '/admin/books', icon: BookOpen },
    { label: 'Add Book', path: '/admin/add-book', icon: PlusCircle },
    { label: 'Students', path: '/admin/students', icon: Users },
    { label: 'Book Requests', path: '/admin/requests', icon: Clock },
    { label: 'Issued Books', path: '/admin/issued-books', icon: ClipboardList },
    { label: 'Returns', path: '/admin/returns', icon: RotateCcw },
    { label: 'Fine Collection', path: '/admin/fines', icon: IndianRupee },
  ];

  const navItems = isAdmin ? adminNavItems : studentNavItems;

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`sidebar-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-logo" style={{ fontSize: '1.05rem' }}>
            <div className="brand-icon" style={{ width: '32px', height: '32px' }}>
              <BookOpen size={18} />
            </div>
            <span>SmartLib</span>
          </div>
          <button
            onClick={onClose}
            className="show-mobile"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--secondary-500)',
              padding: '4px',
            }}
            aria-label="Close Sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-content">
          <span className="sidebar-section-title">
            {isAdmin ? 'ADMINISTRATION' : 'STUDENT PORTAL'}
          </span>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon className="nav-icon" size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        <div className="sidebar-footer">
          <Button
            variant="outline"
            icon={LogOut}
            onClick={handleLogout}
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            Sign Out
          </Button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
