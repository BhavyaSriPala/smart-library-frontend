import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Send, CheckCircle2, Clock } from 'lucide-react';
import { bookService, issueService } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import ResponsiveTable from '../../components/ResponsiveTable';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [myIssues, setMyIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestingId, setRequestingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [booksData, issuesData] = await Promise.allSettled([
        bookService.getBooks(),
        issueService.getIssuedBooks(),
      ]);

      if (booksData.status === 'fulfilled') {
        setBooks(Array.isArray(booksData.value) ? booksData.value : []);
      }
      if (issuesData.status === 'fulfilled') {
        const issuesRes = issuesData.value;
        const list = issuesRes.issues || (Array.isArray(issuesRes) ? issuesRes : []);
        setMyIssues(list);
      }
    } catch (err) {
      console.error('Error fetching catalog data:', err);
      setError('Failed to load catalog books. Please verify server connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRequestBook = async (book) => {
    setError('');
    setSuccess('');

    try {
      setRequestingId(book.bookId);
      const res = await issueService.requestBook(book.bookId);
      setSuccess(
        res.message || `Request submitted for "${book.title}". Awaiting librarian approval!`
      );
      // Refresh user's issues list to update button state
      const updatedIssues = await issueService.getIssuedBooks();
      setMyIssues(updatedIssues.issues || []);
    } catch (err) {
      console.error('Error requesting book:', err);
      const msg = err.response?.data?.message || 'Failed to submit book request.';
      setError(msg);
    } finally {
      setRequestingId(null);
    }
  };

  // Helper to determine student's request status for a specific book
  const getBookStudentStatus = (bookId) => {
    const pending = myIssues.find(
      (i) =>
        i.bookId === bookId &&
        (i.status === 'PENDING' || i.status === 'Pending' || i.status === 'pending')
    );
    if (pending) return 'PENDING';

    const issued = myIssues.find(
      (i) =>
        i.bookId === bookId &&
        (i.status === 'ISSUED' || i.status === 'Issued' || i.status === 'issued')
    );
    if (issued) return 'ISSUED';

    return null;
  };

  return (
    <div>
      <PageHeader
        title="Library Book Catalog"
        description="Browse all available books, check copy availability, and submit borrow requests."
        actions={
          <Link to="/student/my-books">
            <Button variant="outline" size="sm" icon={Clock}>
              View My Requests & Books
            </Button>
          </Link>
        }
      />

      {error && <AlertMessage type="error" message={error} onClose={() => setError('')} />}
      {success && <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />}

      <Card>
        {loading ? (
          <LoadingSpinner text="Loading catalog books..." />
        ) : books.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No Books Available"
            description="The library catalog currently has no books listed."
          />
        ) : (
          <ResponsiveTable>
            <thead>
              <tr>
                <th>Book ID</th>
                <th>Title</th>
                <th>Author</th>
                <th>Category</th>
                <th>Publisher</th>
                <th>Available</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => {
                const isAvailable = book.availableCopies > 0;
                const studentStatus = getBookStudentStatus(book.bookId);
                const isRequestingThis = requestingId === book.bookId;

                return (
                  <tr key={book.bookId || book._id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>
                      {book.bookId}
                    </td>
                    <td style={{ fontWeight: 600 }}>{book.title}</td>
                    <td>{book.author}</td>
                    <td>
                      <span
                        style={{
                          backgroundColor: 'var(--secondary-100)',
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-xs)',
                          fontSize: '0.82rem',
                          color: 'var(--secondary-700)',
                        }}
                      >
                        {book.category}
                      </span>
                    </td>
                    <td>{book.publisher}</td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>
                      {book.availableCopies} / {book.quantity}
                    </td>
                    <td>
                      <StatusBadge status={isAvailable ? 'Available' : 'Out of Stock'} />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {studentStatus === 'PENDING' ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: 'var(--warning-700)',
                            backgroundColor: 'var(--warning-50)',
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            border: '1px solid var(--warning-200)',
                          }}
                        >
                          <Clock size={13} /> Requested
                        </span>
                      ) : studentStatus === 'ISSUED' ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: 'var(--info-700)',
                            backgroundColor: 'var(--info-50)',
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            border: '1px solid var(--info-200)',
                          }}
                        >
                          <CheckCircle2 size={13} /> Borrowed
                        </span>
                      ) : isAvailable ? (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={Send}
                          loading={isRequestingThis}
                          onClick={() => handleRequestBook(book)}
                        >
                          Request Book
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" disabled>
                          Out of Stock
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

export default BookList;
