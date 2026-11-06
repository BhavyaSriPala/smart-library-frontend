import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle2, Search } from 'lucide-react';
import { issueService } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import ResponsiveTable from '../../components/ResponsiveTable';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';

const BookRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      setError('');
      // Admin fetches all issued/request records
      const data = await issueService.getIssuedBooks();
      const records = data.issues || (Array.isArray(data) ? data : []);
      // Filter for PENDING requests
      const pendingList = records.filter(
        (i) => (i.status || '').toUpperCase() === 'PENDING'
      );
      setRequests(pendingList);
    } catch (err) {
      console.error('Error fetching pending requests:', err);
      setError('Failed to fetch pending book requests. Please check admin authorization.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const handleIssueBook = async (reqRecord) => {
    setError('');
    setSuccess('');

    // Pre-check available copies
    const available = reqRecord.availableCopies ?? reqRecord.book?.availableCopies ?? 0;
    if (available <= 0) {
      setError(
        `Cannot issue "${reqRecord.title || reqRecord.book?.title}": No available copies in stock. Request remains PENDING.`
      );
      return;
    }

    try {
      setActionLoadingId(reqRecord.issueId);
      const res = await issueService.issueBook(reqRecord.issueId);
      setSuccess(
        res.message ||
          `Book "${reqRecord.title || reqRecord.book?.title}" issued successfully to ${reqRecord.studentName || 'student'}. 15-day due date set!`
      );
      // Refresh list
      fetchPendingRequests();
    } catch (err) {
      console.error('Error issuing book request:', err);
      const msg =
        err.response?.data?.message ||
        'Failed to issue book. Please check available copies.';
      setError(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const title = (r.title || r.book?.title || '').toLowerCase();
    const student = (r.studentName || r.user?.name || r.userId || '').toLowerCase();
    const email = (r.studentEmail || r.user?.email || '').toLowerCase();
    const issueId = (r.issueId || '').toLowerCase();
    return title.includes(q) || student.includes(q) || email.includes(q) || issueId.includes(q);
  });

  return (
    <div>
      <PageHeader
        title="Student Book Requests"
        description="Review student borrow requests, verify inventory copy availability, and issue books with 15-day loans."
      />

      {error && <AlertMessage type="error" message={error} onClose={() => setError('')} />}
      {success && <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />}

      <Card>
        {/* Search bar */}
        <div style={{ marginBottom: '20px', maxWidth: '420px' }}>
          <div className="search-wrapper">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Search by student name, email, book, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading pending student requests..." />
        ) : filteredRequests.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No Pending Book Requests"
            description={
              search
                ? `No pending requests match "${search}".`
                : 'All student borrow requests have been processed. Great job!'
            }
          />
        ) : (
          <ResponsiveTable>
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Student Details</th>
                <th>Book Title</th>
                <th>Author</th>
                <th>Stock Availability</th>
                <th>Request Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((reqRecord) => {
                const bookTitle = reqRecord.title || reqRecord.book?.title || reqRecord.bookId;
                const author = reqRecord.author || reqRecord.book?.author || '—';
                const studentName = reqRecord.studentName || reqRecord.user?.name || reqRecord.userId;
                const studentEmail = reqRecord.studentEmail || reqRecord.user?.email || '';
                const copies = reqRecord.availableCopies ?? reqRecord.book?.availableCopies ?? 0;
                const hasCopies = copies > 0;
                const isProcessing = actionLoadingId === reqRecord.issueId;
                const reqDate = reqRecord.requestDate || reqRecord.createdAt;

                return (
                  <tr key={reqRecord.issueId || reqRecord._id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>
                      {reqRecord.issueId}
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
                    <td>{author}</td>
                    <td>
                      <span
                        style={{
                          fontWeight: 600,
                          color: hasCopies ? 'var(--success-700)' : 'var(--danger-600)',
                        }}
                      >
                        {copies} {copies === 1 ? 'copy' : 'copies'} available
                      </span>
                    </td>
                    <td>{reqDate ? new Date(reqDate).toLocaleDateString() : '—'}</td>
                    <td>
                      <StatusBadge status="PENDING" />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {hasCopies ? (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={CheckCircle2}
                          loading={isProcessing}
                          onClick={() => handleIssueBook(reqRecord)}
                        >
                          Issue Book
                        </Button>
                      ) : (
                        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled
                            style={{ borderColor: 'var(--danger-300)', color: 'var(--danger-600)' }}
                          >
                            Out of Stock
                          </Button>
                          <span style={{ fontSize: '0.72rem', color: 'var(--danger-600)', marginTop: '2px' }}>
                            Cannot Issue
                          </span>
                        </div>
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

export default BookRequests;
