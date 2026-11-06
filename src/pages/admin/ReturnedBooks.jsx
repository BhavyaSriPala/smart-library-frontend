import React, { useEffect, useState } from 'react';
import { RotateCcw, Search } from 'lucide-react';
import { issueService } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';
import ResponsiveTable from '../../components/ResponsiveTable';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';

const ReturnedBooks = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchReturns = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await issueService.getIssuedBooks();
      const records = data.issues || (Array.isArray(data) ? data : []);
      setIssues(records);
    } catch (err) {
      console.error('Error fetching returned books:', err);
      setError('Failed to fetch library return records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const returnedIssues = issues.filter(
    (i) => (i.status || '').toUpperCase() === 'RETURNED'
  );

  const filteredReturns = returnedIssues.filter((i) => {
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
        title="Returned Books History"
        description="Archive of all received book returns, recorded return timestamps, and final calculated fines."
      />

      {error && <AlertMessage type="error" message={error} onClose={() => setError('')} />}

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
          <LoadingSpinner text="Loading return records..." />
        ) : filteredReturns.length === 0 ? (
          <EmptyState
            icon={RotateCcw}
            title="No Returned Books Found"
            description={
              search
                ? `No return records match your search "${search}".`
                : 'There are currently no return transactions recorded in the library.'
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
                <th>Return Date</th>
                <th>Final Fine</th>
                <th>Payment Status</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredReturns.map((issue) => {
                const bookTitle = issue.title || issue.book?.title || issue.bookId;
                const studentName = issue.studentName || issue.user?.name || issue.userId;
                const studentEmail = issue.studentEmail || issue.user?.email || '';
                const isPaid = issue.paymentStatus === 'PAID';
                const fineVal = issue.calculatedFine !== undefined ? issue.calculatedFine : (issue.fine || 0);

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
                      {issue.dueDate ? new Date(issue.dueDate).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      {issue.returnDate ? (
                        new Date(issue.returnDate).toLocaleDateString()
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      {fineVal > 0 ? (
                        <span style={{ fontWeight: 700, color: isPaid ? 'var(--success-700)' : 'var(--danger-700)' }}>
                          ₹{fineVal}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--success-700)', fontWeight: 600 }}>₹0</span>
                      )}
                    </td>
                    <td>
                      {fineVal > 0 ? (
                        <StatusBadge status={isPaid ? 'PAID' : 'UNPAID'} />
                      ) : (
                        <span style={{ color: 'var(--secondary-400)', fontSize: '0.85rem' }}>No Fine</span>
                      )}
                    </td>
                    <td>
                      <StatusBadge status="RETURNED" />
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

export default ReturnedBooks;
