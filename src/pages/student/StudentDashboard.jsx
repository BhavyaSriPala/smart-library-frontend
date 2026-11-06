import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, BookMarked, ArrowRight, Clock, IndianRupee } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { bookService, issueService } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import Card from '../../components/Card';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import ResponsiveTable from '../../components/ResponsiveTable';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [totalBooksCount, setTotalBooksCount] = useState(0);
  const [issuedBooksCount, setIssuedBooksCount] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [totalOutstandingFine, setTotalOutstandingFine] = useState(0);
  const [recentIssues, setRecentIssues] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch books overview
        const books = await bookService.getBooks();
        setTotalBooksCount(Array.isArray(books) ? books.length : 0);

        // Fetch student's own issued books records
        const issuesRes = await issueService.getIssuedBooks();
        const issuesList = issuesRes.issues || (Array.isArray(issuesRes) ? issuesRes : []);
        setRecentIssues(issuesList.slice(0, 5));

        const activeIssued = issuesList.filter(
          (i) => (i.status || '').toUpperCase() === 'ISSUED'
        );
        const pending = issuesList.filter(
          (i) => (i.status || '').toUpperCase() === 'PENDING'
        );

        const fineSum = issuesList.reduce((acc, curr) => {
          const fineAmount = curr.outstandingFine !== undefined ? curr.outstandingFine : (curr.fine || 0);
          return acc + (curr.paymentStatus === 'PAID' ? 0 : fineAmount);
        }, 0);

        setIssuedBooksCount(activeIssued.length);
        setPendingRequestsCount(pending.length);
        setTotalOutstandingFine(fineSum);
      } catch (err) {
        console.error('Error fetching student dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading student dashboard..." />;
  }

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name || 'Student'}!`}
        description="Access catalog books, track your 15-day loans, review borrow requests, and view fines."
        actions={
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/student/books">
              <Button variant="primary" icon={BookOpen}>
                Request Books
              </Button>
            </Link>
          </div>
        }
      />

      {/* Metrics Grid */}
      <div className="grid grid-cols-4" style={{ marginBottom: '28px' }}>
        <StatCard
          title="Catalog Books"
          value={totalBooksCount}
          icon={BookOpen}
          variant="primary"
          description="Available in library"
        />
        <StatCard
          title="Pending Requests"
          value={pendingRequestsCount}
          icon={Clock}
          variant="info"
          description="Awaiting admin issue"
        />
        <StatCard
          title="Currently Borrowed"
          value={issuedBooksCount}
          icon={BookMarked}
          variant="warning"
          description="Active 15-day loans"
        />
        <StatCard
          title="Outstanding Fine"
          value={`₹${totalOutstandingFine}`}
          icon={IndianRupee}
          variant={totalOutstandingFine > 0 ? 'danger' : 'success'}
          description={totalOutstandingFine > 0 ? 'Overdue fee pending' : 'No dues pending'}
        />
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2" style={{ marginBottom: '28px' }}>
        <Card title="Browse Library Books" subtitle="Explore title catalog, categories, and stock">
          <p style={{ color: 'var(--secondary-600)', fontSize: '0.92rem', marginBottom: '16px' }}>
            Check real-time copy availability for all catalog titles and submit borrow requests.
          </p>
          <Link to="/student/books">
            <Button variant="outline" size="sm" icon={ArrowRight}>
              View All Books
            </Button>
          </Link>
        </Card>

        <Card title="My Books & Requests" subtitle="Monitor active loans, due dates, and return history">
          <p style={{ color: 'var(--secondary-600)', fontSize: '0.92rem', marginBottom: '16px' }}>
            Keep track of your 15-day due dates to avoid ₹1/day fines and view circulation status.
          </p>
          <Link to="/student/my-books">
            <Button variant="outline" size="sm" icon={BookMarked}>
              View My Loans
            </Button>
          </Link>
        </Card>
      </div>

      {/* Recent Activity Table */}
      <Card
        title="My Recent Circulation Activity"
        subtitle="Your latest book requests and borrowing history"
        action={
          <Link to="/student/my-books">
            <Button variant="outline" size="sm">
              View All My Records
            </Button>
          </Link>
        }
      >
        {recentIssues.length === 0 ? (
          <EmptyState
            icon={BookMarked}
            title="No records found"
            description="You do not have any active requests or borrow records yet."
            action={
              <Link to="/student/books">
                <Button variant="primary" size="sm">
                  Browse Books
                </Button>
              </Link>
            }
          />
        ) : (
          <ResponsiveTable>
            <thead>
              <tr>
                <th>ID</th>
                <th>Book Title</th>
                <th>Author</th>
                <th>Request / Issue Date</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentIssues.map((issue) => {
                const status = (issue.status || 'PENDING').toUpperCase();
                const displayDate = issue.issueDate || issue.requestDate || issue.createdAt;
                return (
                  <tr key={issue.issueId || issue._id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>
                      {issue.issueId}
                    </td>
                    <td style={{ fontWeight: 600 }}>{issue.title || issue.book?.title || issue.bookId}</td>
                    <td>{issue.author || issue.book?.author || '—'}</td>
                    <td>
                      {displayDate ? new Date(displayDate).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      {issue.dueDate ? new Date(issue.dueDate).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <StatusBadge status={status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </ResponsiveTable>
        )}
      </Card>
    </div>
  );
};

export default StudentDashboard;
