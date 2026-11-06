import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import StudentLayout from '../layouts/StudentLayout';
import AdminLayout from '../layouts/AdminLayout';

// Route Guards
import StudentRoute from '../components/StudentRoute';
import AdminRoute from '../components/AdminRoute';

// Public Pages
import Home from '../pages/public/Home';
import Login from '../pages/public/Login';
import Register from '../pages/public/Register';

// Student Pages
import StudentDashboard from '../pages/student/StudentDashboard';
import BookList from '../pages/student/BookList';
import SearchBooks from '../pages/student/SearchBooks';
import MyBooks from '../pages/student/MyBooks';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import ManageBooks from '../pages/admin/ManageBooks';
import AddBook from '../pages/admin/AddBook';
import Students from '../pages/admin/Students';
import BookRequests from '../pages/admin/BookRequests';
import IssuedBooks from '../pages/admin/IssuedBooks';
import ReturnedBooks from '../pages/admin/ReturnedBooks';
import FineCollection from '../pages/admin/FineCollection';

// Context
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import { AlertCircle } from 'lucide-react';

// Public-only route guard (redirects already logged-in users to their dashboard)
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin/dashboard' : '/student/dashboard'} replace />;
  }
  return children;
};

// 404 Not Found Page
const NotFound = () => (
  <div style={{ maxWidth: '600px', margin: '80px auto', padding: '0 20px', textAlign: 'center' }}>
    <Card>
      <EmptyState
        icon={AlertCircle}
        title="404 — Page Not Found"
        description="The page you are looking for does not exist or has been moved."
        action={
          <Link to="/">
            <Button variant="primary" size="sm">
              Return to Home
            </Button>
          </Link>
        }
      />
    </Card>
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      {/* ========================================================
          PUBLIC ROUTES
          ======================================================== */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          }
        />
      </Route>

      {/* ========================================================
          STUDENT ROUTES (Requires Authentication + Student Role)
          ======================================================== */}
      <Route
        path="/student"
        element={
          <StudentRoute>
            <StudentLayout />
          </StudentRoute>
        }
      >
        <Route index element={<Navigate to="/student/dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="books" element={<BookList />} />
        <Route path="search" element={<SearchBooks />} />
        <Route path="my-books" element={<MyBooks />} />
      </Route>

      {/* ========================================================
          ADMIN ROUTES (Requires Authentication + Admin Role)
          ======================================================== */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="books" element={<ManageBooks />} />
        <Route path="add-book" element={<AddBook />} />
        <Route path="students" element={<Students />} />
        <Route path="requests" element={<BookRequests />} />
        <Route path="issued-books" element={<IssuedBooks />} />
        <Route path="returns" element={<ReturnedBooks />} />
        <Route path="fines" element={<FineCollection />} />
      </Route>

      {/* ========================================================
          CATCH-ALL 404 ROUTE
          ======================================================== */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
