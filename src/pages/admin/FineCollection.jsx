import React, { useEffect, useState } from 'react';
import { IndianRupee, Search, CheckCircle2 } from 'lucide-react';
import { issueService } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import ResponsiveTable from '../../components/ResponsiveTable';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';

const FineCollection = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collectingId, setCollectingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('unpaid'); // 'unpaid' | 'paid' | 'all'

  const fetchFines = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await issueService.getIssuedBooks();
      const records = data.issues || (Array.isArray(data) ? data : []);

      // Keep loans that incurred fines (either calculatedFine > 0 OR paymentStatus === 'PAID')
      const fineRecords = records.filter((i) => {
        const calculatedFine = i.calculatedFine ?? i.fine ?? 0;
        return calculatedFine > 0 || i.paymentStatus === 'PAID';
      });

      setIssues(fineRecords);
    } catch (err) {
      console.error('Error fetching fines:', err);
      setError('Failed to fetch fine records. Please verify admin privileges.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFines();
  }, []);

  const handleCollectFine = async (record) => {
    const studentName = record.studentName || record.user?.name || record.userId;
    const bookTitle = record.title || record.book?.title || record.bookId;
    const fineAmount = record.outstandingFine ?? record.calculatedFine ?? record.fine ?? 0;

    if (
      !window.confirm(
        `Confirm fine collection of ₹${fineAmount} from ${studentName} for "${bookTitle}"?`
      )
    ) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      setCollectingId(record.issueId);

      const res = await issueService.payFine(record.issueId);
      setSuccess(
        res.message ||
          `Fine of ₹${fineAmount} collected from ${studentName} and marked as PAID!`
      );
      // Refresh list
      fetchFines();
    } catch (err) {
      console.error('Error collecting fine:', err);
      const msg = err.response?.data?.message || 'Failed to collect fine.';
      setError(msg);
    } finally {
      setCollectingId(null);
    }
  };

  const filteredByStatus = issues.filter((i) => {
    const isPaid = i.paymentStatus === 'PAID';
    if (filter === 'unpaid') return !isPaid;
    if (filter === 'paid') return isPaid;
    return true;
  });

  const filteredFines = filteredByStatus.filter((i) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const student = (i.studentName || i.user?.name || i.userId || '').toLowerCase();
    const email = (i.studentEmail || i.user?.email || '').toLowerCase();
    const title = (i.title || i.book?.title || '').toLowerCase();
    const issueId = (i.issueId || '').toLowerCase();
    return student.includes(q) || email.includes(q) || title.includes(q) || issueId.includes(q);
  });

  const unpaidCount = issues.filter((i) => i.paymentStatus !== 'PAID').length;
  const paidCount = issues.filter((i) => i.paymentStatus === 'PAID').length;
  const totalUnpaidAmount = issues
    .filter((i) => i.paymentStatus !== 'PAID')
    .reduce((acc, curr) => acc + (curr.outstandingFine ?? curr.calculatedFine ?? 0), 0);

  return (
    <div>
      <PageHeader
        title="Fine Collection & Management"
        description="Monitor outstanding overdue penalties, collect student library dues, and maintain transparent payment history."
      />

      {error && <AlertMessage type="error" message={error} onClose={() => setError('')} />}
      {success && <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Summary Banner */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '20px',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            className={`btn ${filter === 'unpaid' ? 'btn-primary' : 'btn-outline'} btn-sm`}
            onClick={() => setFilter('unpaid')}
          >
            Outstanding / Unpaid ({unpaidCount})
          </button>
          <button
            className={`btn ${filter === 'paid' ? 'btn-primary' : 'btn-outline'} btn-sm`}
            onClick={() => setFilter('paid')}
          >
            Collected / Paid ({paidCount})
          </button>
          <button
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'} btn-sm`}
            onClick={() => setFilter('all')}
          >
            All Fine Records ({issues.length})
          </button>
        </div>

        <div
          style={{
            backgroundColor: 'var(--danger-50)',
            border: '1px solid var(--danger-200)',
            color: 'var(--danger-700)',
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 700,
            fontSize: '0.9rem',
          }}
        >
          Total Outstanding: ₹{totalUnpaidAmount}
        </div>
      </div>

      <Card>
        {/* Search Bar */}
        <div style={{ marginBottom: '20px', maxWidth: '420px' }}>
          <div className="search-wrapper">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Search by student, email, book, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading fine records..." />
        ) : filteredFines.length === 0 ? (
          <EmptyState
            icon={IndianRupee}
            title={
              filter === 'unpaid'
                ? 'No Outstanding Fines'
                : 'No Fine Records Found'
            }
            description={
              search
                ? `No records match your query "${search}".`
                : filter === 'unpaid'
                ? 'All library overdue fines have been paid and settled. Outstanding dues: ₹0!'
                : 'No fine payment records found in the library history.'
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
                <th>Fine Amount</th>
                <th>Payment Status</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredFines.map((record) => {
                const bookTitle = record.title || record.book?.title || record.bookId;
                const studentName = record.studentName || record.user?.name || record.userId;
                const studentEmail = record.studentEmail || record.user?.email || '';
                const isPaid = record.paymentStatus === 'PAID';
                const fineAmount = record.calculatedFine ?? record.fine ?? 0;
                const isCollecting = collectingId === record.issueId;

                return (
                  <tr key={record.issueId || record._id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>
                      {record.issueId}
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
                      {record.issueDate
                        ? new Date(record.issueDate).toLocaleDateString()
                        : '—'}
                    </td>
                    <td>
                      {record.dueDate
                        ? new Date(record.dueDate).toLocaleDateString()
                        : '—'}
                    </td>
                    <td>
                      {record.returnDate ? (
                        new Date(record.returnDate).toLocaleDateString()
                      ) : (
                        <span style={{ color: 'var(--warning-700)', fontSize: '0.8rem' }}>
                          Active Borrow
                        </span>
                      )}
                    </td>
                    <td>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          color: isPaid ? 'var(--success-700)' : 'var(--danger-700)',
                        }}
                      >
                        ₹{fineAmount}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={isPaid ? 'PAID' : 'UNPAID'} />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {isPaid ? (
                        <span
                          style={{
                            color: 'var(--success-700)',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <CheckCircle2 size={14} /> Settled
                          {record.paidAt && (
                            <span style={{ color: 'var(--secondary-400)', fontSize: '0.72rem' }}>
                              ({new Date(record.paidAt).toLocaleDateString()})
                            </span>
                          )}
                        </span>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={IndianRupee}
                          loading={isCollecting}
                          onClick={() => handleCollectFine(record)}
                        >
                          Collect Fine
                        </Button>
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

export default FineCollection;
