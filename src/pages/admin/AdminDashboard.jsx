import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Users,
  ClipboardList,
  RotateCcw,
  PlusCircle,
  ArrowRight,
  Clock,
  IndianRupee,
} from 'lucide-react';
import { bookService, issueService, studentService } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import Card from '../../components/Card';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import ResponsiveTable from '../../components/ResponsiveTable';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    booksCount: 0,
    studentsCount: 0,
    pendingRequestsCount: 0,
    activeIssuesCount: 0,
    returnedCount: 0,
    totalOutstandingFine: 0,
  });
  const [recentIssues, setRecentIssues] = useState([]);

  useEffect(() => {
    const fetchAdminOverview = async () => {
      try {
        setLoading(true);

        const [booksData, studentsData, issuesData] = await Promise.allSettled([
          bookService.getBooks(),
          studentService.getStudents(),
          issueService.getIssuedBooks(),
        ]);

        const books =
          booksData.status === 'fulfilled' && Array.isArray(booksData.value)
            ? booksData.value
            : [];
        const students =
          studentsData.status === 'fulfilled' && Array.isArray(studentsData.value)
            ? studentsData.value
            : [];
        const issuesRes = issuesData.status === 'fulfilled' ? issuesData.value : {};
        const issues = issuesRes.issues || (Array.isArray(issuesRes) ? issuesRes : []);

        const pending = issues.filter(
          (i) => (i.status || '').toUpperCase() === 'PENDING'
        );
        const activeIssues = issues.filter(
          (i) => (i.status || '').toUpperCase() === 'ISSUED'
        );
        const returnedIssues = issues.filter(
          (i) => (i.status || '').toUpperCase() === 'RETURNED'
        );

        const outstandingFines = issues
          .filter((i) => i.paymentStatus !== 'PAID')
          .reduce(
            (acc, curr) =>
              acc + (curr.outstandingFine ?? curr.calculatedFine ?? curr.fine ?? 0),
            0
          );

        setStats({
          booksCount: books.length,
          studentsCount: students.length,
          pendingRequestsCount: pending.length,
          activeIssuesCount: activeIssues.length,
          returnedCount: returnedIssues.length,
          totalOutstandingFine: outstandingFines,
        });

        setRecentIssues(issues.slice(0, 6));
      } catch (err) {
        console.error('Error fetching admin dashboard overview:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminOverview();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading admin overview..." />;
  }

  return (
    <div>
      <PageHeader
        title="Admin Control Center"
        description="Comprehensive overview of library circulation, student requests, catalog inventory, and fine collection."
        actions={
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/admin/requests">
              <Button variant="outline" icon={Clock}>
                View Requests ({stats.pendingRequestsCount})
              </Button>
            </Link>
            <Link to="/admin/add-book">
              <Button variant="primary" icon={PlusCircle}>
                Add Book
              </Button>
            </Link>
          </div>
        }
      />

      {/* Metrics Row 1 */}
      <div className="grid grid-cols-4" style={{ marginBottom: '16px' }}>
        <StatCard
          title="Total Books"
          value={stats.booksCount}
          icon={BookOpen}
          variant="primary"
          description="In catalog inventory"
        />
        <StatCard
          title="Pending Requests"
          value={stats.pendingRequestsCount}
          icon={Clock}
          variant={stats.pendingRequestsCount > 0 ? 'warning' : 'info'}
          description="Awaiting book issue"
        />
        <StatCard
          title="Currently Issued"
          value={stats.activeIssuesCount}
          icon={ClipboardList}
          variant="info"
          description="Active 15-day loans"
        />
        <StatCard
          title="Outstanding Fines"
          value={`₹${stats.totalOutstandingFine}`}
          icon={IndianRupee}
          variant={stats.totalOutstandingFine > 0 ? 'danger' : 'success'}
          description={stats.totalOutstandingFine > 0 ? 'Uncollected dues' : 'All fines cleared'}
        />
      </div>

      {/* Metrics Row 2 */}
      <div className="grid grid-cols-2" style={{ marginBottom: '28px' }}>
        <StatCard
          title="Registered Students"
          value={stats.studentsCount}
          icon={Users}
          variant="info"
          description="Enrolled student accounts"
        />
        <StatCard
          title="Returned Books"
          value={stats.returnedCount}
          icon={RotateCcw}
          variant="success"
          description="Historical book returns"
        />
      </div>

      {/* Management Quick Actions */}
      <div className="grid grid-cols-3" style={{ marginBottom: '28px' }}>
        <Card title="Book Requests" subtitle="Approve student borrow requests">
          <p style={{ color: 'var(--secondary-600)', fontSize: '0.92rem', marginBottom: '16px' }}>
            Review pending book requests, verify stock availability, and issue books with 15-day terms.
          </p>
          <Link to="/admin/requests">
            <Button variant="primary" size="sm" icon={Clock}>
              Process Requests
            </Button>
          </Link>
        </Card>

        <Card title="Circulation Desk" subtitle="Issued books and returns">
          <p style={{ color: 'var(--secondary-600)', fontSize: '0.92rem', marginBottom: '16px' }}>
            Track active loans, monitor overdue items, and process returns into inventory.
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link to="/admin/issued-books">
              <Button variant="outline" size="sm" icon={ClipboardList}>
                Issued
              </Button>
            </Link>
            <Link to="/admin/returns">
              <Button variant="outline" size="sm" icon={RotateCcw}>
                Returns
              </Button>
            </Link>
          </div>
        </Card>

        <Card title="Fine Management" subtitle="Overdue penalties and dues">
          <p style={{ color: 'var(--secondary-600)', fontSize: '0.92rem', marginBottom: '16px' }}>
            Collect ₹1/day overdue fines per book and mark fine records as PAID.
          </p>
          <Link to="/admin/fines">
            <Button variant="outline" size="sm" icon={IndianRupee}>
              Fine Collection
            </Button>
          </Link>
        </Card>
      </div>

      {/* Second Row Quick Actions */}
      <div className="grid grid-cols-2" style={{ marginBottom: '28px' }}>
        <Card title="Catalog Inventory" subtitle="Maintain titles and copies">
          <p style={{ color: 'var(--secondary-600)', fontSize: '0.92rem', marginBottom: '16px' }}>
            Add new books, edit publishing details, adjust available quantities, or delete records.
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link to="/admin/books">
              <Button variant="outline" size="sm" icon={BookOpen}>
                Manage Books
              </Button>
            </Link>
            <Link to="/admin/add-book">
              <Button variant="primary" size="sm" icon={PlusCircle}>
                Add Book
              </Button>
            </Link>
          </div>
        </Card>

        <Card title="Student Directory" subtitle="Manage registered student members">
          <p style={{ color: 'var(--secondary-600)', fontSize: '0.92rem', marginBottom: '16px' }}>
            View student accounts, edit student name/email, and reset student passwords securely.
          </p>
          <Link to="/admin/students">
            <Button variant="outline" size="sm" icon={Users}>
              Manage Students
            </Button>
          </Link>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card
        title="Recent Circulation Activity"
        subtitle="Latest book requests, issues, and returns across all students"
        action={
          <Link to="/admin/issued-books">
            <Button variant="outline" size="sm" icon={ArrowRight}>
              View All Records
            </Button>
          </Link>
        }
      >
        {recentIssues.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No Circulation Records"
            description="There are currently no book transactions recorded in the library database."
          />
        ) : (
          <ResponsiveTable>
            <thead>
              <tr>
                <th>ID</th>
                <th>Student</th>
                <th>Book Title</th>
                <th>Issue / Request Date</th>
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
                    <td>
                      <div style={{ fontWeight: 600 }}>
                        {issue.studentName || issue.user?.name || issue.userId}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--secondary-400)' }}>
                        {issue.studentEmail || issue.user?.email || ''}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {issue.title || issue.book?.title || issue.bookId}
                    </td>
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

export default AdminDashboard;
