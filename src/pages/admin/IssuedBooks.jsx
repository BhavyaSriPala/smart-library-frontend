import React, { useEffect, useState } from 'react';
import { ClipboardList, Search, RotateCcw, AlertTriangle } from 'lucide-react';
import { issueService } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import ResponsiveTable from '../../components/ResponsiveTable';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';

const IssuedBooks = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returningId, setReturningId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');

  const fetchIssues = async () => {
    try {
      setLoading(true);
      setError('');
      // Admin gets all circulation records
      const data = await issueService.getIssuedBooks();
      const records = data.issues || (Array.isArray(data) ? data : []);
      // Filter for active/issued books primarily on this page
      const activeList = records.filter(
        (i) => (i.status || '').toUpperCase() === 'ISSUED'
      );
      setIssues(activeList);
    } catch (err) {
      console.error('Error fetching issued books:', err);
      setError('Failed to fetch library active issue records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleReturnBook = async (issue) => {
    const bookTitle = issue.title || issue.book?.title || issue.bookId;
    const studentName = issue.studentName || issue.user?.name || issue.userId;

    if (!window.confirm(`Confirm return for "${bookTitle}" borrowed by ${studentName}?`)) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      setReturningId(issue.issueId);

      const res = await issueService.returnBook(issue.issueId);
      const fineAmount = res.fine ?? 0;
      setSuccess(
        `"${bookTitle}" returned successfully! Stock copy restored. ${
          fineAmount > 0
            ? `Final fine of ₹${fineAmount} recorded (payable in Fine Collection).`
            : 'No fine incurred.'
        }`
      );
      // Refresh list
      fetchIssues();
    } catch (err) {
      console.error('Error returning book:', err);
      const msg = err.response?.data?.message || 'Failed to process book return.';
      setError(msg);
    } finally {
      setReturningId(null);
    }
  };

  const filteredIssues = issues.filter((i) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const title = (i.title || i.book?.title || '').toLowerCase();
    const student = (i.studentName || i.user?.name || i.userId || '').toLowerCase();
    const email = (i.studentEmail || i.user?.email || '').toLowerCase();
    const bookId = (i.bookId || '').toLowerCase();
    const issueId = (i.issueId || '').toLowerCase();
    return (
      title.includes(q) ||
      student.includes(q) ||
      email.includes(q) ||
      bookId.includes(q) ||
      issueId.includes(q)
    );
  });

  return (
    <div>
      <PageHeader
        title="Issued Books Tracking"
        description="Monitor active 15-day student book loans, check overdue statuses, and process book returns."
      />

      {error && <AlertMessage type="error" message={error} onClose={() => setError('')} />}
      {success && <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />}

      <Card>
        {/* Search filter */}
        <div style={{ marginBottom: '20px', maxWidth: '420px' }}>
          <div className="search-wrapper">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Search by book title, student name, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading active book issues..." />
        ) : filteredIssues.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No Active Issued Books"
            description={
              search
                ? `No active issue records match your search "${search}".`
                : 'All library books are currently returned and in stock.'
            }
          />
        ) : (
          <ResponsiveTable>
            <thead>
              <tr>
                <th>Issue ID</th>
                <th>Student</th>
                <th>Book Title</th>
                <th>Issue Date</th>
                <th>Due Date (15 Days)</th>
                <th>Current Fine</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredIssues.map((issue) => {
                const bookTitle = issue.title || issue.book?.title || issue.bookId;
                const studentName = issue.studentName || issue.user?.name || issue.userId;
                const studentEmail = issue.studentEmail || issue.user?.email || '';
                const isOverdue = issue.isOverdue;
                const fineVal = issue.outstandingFine ?? issue.fine ?? 0;
                const isReturning = returningId === issue.issueId;

                return (
                  <tr key={issue.issueId || issue._id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>
                      {issue.issueId}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{studentName}</div>
                      {studentEmail && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--secondary-400)' }}>
                          {studentEmail}
                        </div>
                      )}
                    </td>
                    <td style={{ fontWeight: 600 }}>{bookTitle}</td>
                    <td>
                      {issue.issueDate ? new Date(issue.issueDate).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      {issue.dueDate ? (
                        <span
                          style={{
                            fontWeight: isOverdue ? 700 : 500,
                            color: isOverdue ? 'var(--danger-600)' : 'inherit',
                          }}
                        >
                          {new Date(issue.dueDate).toLocaleDateString()}
                          {isOverdue && (
                            <span style={{ fontSize: '0.75rem', display: 'block', color: 'var(--danger-600)' }}>
                              ({issue.daysLate} {issue.daysLate === 1 ? 'day' : 'days'} late)
                            </span>
                          )}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      {fineVal > 0 ? (
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
                          <AlertTriangle size={12} /> ₹{fineVal}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--success-700)', fontWeight: 600 }}>₹0</span>
                      )}
                    </td>
                    <td>
                      <StatusBadge status="ISSUED" />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <Button
                        variant="primary"
                        size="sm"
                        icon={RotateCcw}
                        loading={isReturning}
                        onClick={() => handleReturnBook(issue)}
                      >
                        Return Book
                      </Button>
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

export default IssuedBooks;
