import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookMarked, CheckCircle2, AlertTriangle, BookOpen } from 'lucide-react';
import { issueService } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import ResponsiveTable from '../../components/ResponsiveTable';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';

const MyBooks = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all | pending | issued | returned

  const fetchMyIssues = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await issueService.getIssuedBooks();
      const records = data.issues || (Array.isArray(data) ? data : []);
      setIssues(records);
    } catch (err) {
      console.error('Error fetching student book records:', err);
      setError('Failed to fetch your book records. Please verify connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyIssues();
  }, []);

  const filteredIssues = issues.filter((issue) => {
    const s = (issue.status || '').toUpperCase();
    if (filter === 'pending') return s === 'PENDING';
    if (filter === 'issued') return s === 'ISSUED';
    if (filter === 'returned') return s === 'RETURNED';
    return true;
  });

  const pendingCount = issues.filter((i) => (i.status || '').toUpperCase() === 'PENDING').length;
  const issuedCount = issues.filter((i) => (i.status || '').toUpperCase() === 'ISSUED').length;
  const returnedCount = issues.filter((i) => (i.status || '').toUpperCase() === 'RETURNED').length;

  return (
    <div>
      <PageHeader
        title="My Books & Requests"
        description="Track your borrow requests, active 15-day loans, due dates, fines, and return history."
        actions={
          <Link to="/student/books">
            <Button variant="primary" size="sm" icon={BookOpen}>
              Borrow More Books
            </Button>
          </Link>
        }
      />

      {error && <AlertMessage type="error" message={error} onClose={() => setError('')} />}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button
          className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'} btn-sm`}
          onClick={() => setFilter('all')}
        >
          All Records ({issues.length})
        </button>
        <button
          className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-outline'} btn-sm`}
          onClick={() => setFilter('pending')}
        >
          Pending Requests ({pendingCount})
        </button>
        <button
          className={`btn ${filter === 'issued' ? 'btn-primary' : 'btn-outline'} btn-sm`}
          onClick={() => setFilter('issued')}
        >
          Currently Borrowed ({issuedCount})
        </button>
        <button
          className={`btn ${filter === 'returned' ? 'btn-primary' : 'btn-outline'} btn-sm`}
          onClick={() => setFilter('returned')}
        >
          Returned History ({returnedCount})
        </button>
      </div>

      <Card>
        {loading ? (
          <LoadingSpinner text="Loading your book records..." />
        ) : filteredIssues.length === 0 ? (
          <EmptyState
            icon={BookMarked}
            title="No Records Found"
            description={
              filter === 'all'
                ? 'You have not requested or borrowed any books yet.'
                : `No records found under "${filter}".`
            }
            action={
              <Link to="/student/books">
                <Button variant="primary" size="sm">
                  Browse Catalog
                </Button>
              </Link>
            }
          />
        ) : (
          <ResponsiveTable>
            <thead>
              <tr>
                <th>Request / Issue ID</th>
                <th>Book Title</th>
                <th>Author</th>
                <th>Status</th>
                <th>Request Date</th>
                <th>Issue Date</th>
                <th>Due Date (15 Days)</th>
                <th>Return Date</th>
                <th>Fine Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredIssues.map((issue) => {
                const bookTitle = issue.title || issue.book?.title || issue.bookId;
                const author = issue.author || issue.book?.author || '—';
                const status = (issue.status || 'PENDING').toUpperCase();

                const isPending = status === 'PENDING';
                const isIssued = status === 'ISSUED';
                const isReturned = status === 'RETURNED';

                const reqDate = issue.requestDate || issue.createdAt;
                const isPaid = issue.paymentStatus === 'PAID';
                const fineVal = issue.outstandingFine !== undefined ? issue.outstandingFine : (issue.fine || 0);

                return (
                  <tr key={issue.issueId || issue._id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>
                      {issue.issueId}
                    </td>
                    <td style={{ fontWeight: 600 }}>{bookTitle}</td>
                    <td>{author}</td>
                    <td>
                      <StatusBadge status={status} />
                    </td>
                    <td>
                      {reqDate ? new Date(reqDate).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      {isPending ? (
                        <span style={{ color: 'var(--secondary-400)' }}>—</span>
                      ) : issue.issueDate ? (
                        new Date(issue.issueDate).toLocaleDateString()
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      {isPending ? (
                        <span style={{ color: 'var(--secondary-400)' }}>—</span>
                      ) : issue.dueDate ? (
                        <span
                          style={{
                            fontWeight: issue.isOverdue && isIssued ? 700 : 500,
                            color: issue.isOverdue && isIssued ? 'var(--danger-600)' : 'inherit',
                          }}
                        >
                          {new Date(issue.dueDate).toLocaleDateString()}
                          {issue.isOverdue && isIssued && ' (Overdue)'}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      {isReturned && issue.returnDate ? (
                        new Date(issue.returnDate).toLocaleDateString()
                      ) : isIssued ? (
                        <span style={{ color: 'var(--warning-700)', fontSize: '0.82rem', fontWeight: 500 }}>
                          Currently Borrowed
                        </span>
                      ) : (
                        <span style={{ color: 'var(--secondary-400)' }}>—</span>
                      )}
                    </td>
                    <td>
                      {isPending ? (
                        <span style={{ color: 'var(--secondary-400)' }}>—</span>
                      ) : isPaid ? (
                        <span
                          style={{
                            color: 'var(--success-700)',
                            backgroundColor: 'var(--success-50)',
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-xs)',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          <CheckCircle2 size={12} /> ₹0 (Paid)
                        </span>
                      ) : fineVal > 0 ? (
                        <span
                          style={{
                            color: 'var(--danger-700)',
                            backgroundColor: 'var(--danger-50)',
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-xs)',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          <AlertTriangle size={12} /> ₹{fineVal} (Unpaid)
                        </span>
                      ) : (
                        <span style={{ color: 'var(--success-700)', fontWeight: 600 }}>₹0</span>
                      )}
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

export default MyBooks;
