import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, BookOpen, Send, Clock, CheckCircle2 } from 'lucide-react';
import { bookService, issueService } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import ResponsiveTable from '../../components/ResponsiveTable';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';

const SearchBooks = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [books, setBooks] = useState([]);
  const [myIssues, setMyIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [requestingId, setRequestingId] = useState(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadInitialBooks = async () => {
    try {
      setLoading(true);
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
      console.error('Error fetching initial books:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialBooks();
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      const data = await bookService.getBooks(searchTerm);
      setBooks(Array.isArray(data) ? data : []);
      setSearched(true);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to perform search. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    setSearched(false);
    loadInitialBooks();
  };

  const handleRequestBook = async (book) => {
    setError('');
    setSuccess('');

    try {
      setRequestingId(book.bookId);
      const res = await issueService.requestBook(book.bookId);
      setSuccess(
        res.message || `Request submitted for "${book.title}". Awaiting librarian approval!`
      );
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
        title="Search Books"
        description="Search across catalog books by title, author name, or subject category."
        actions={
          <Link to="/student/my-books">
            <Button variant="outline" size="sm" icon={Clock}>
              View My Requests
            </Button>
          </Link>
        }
      />

      {error && <AlertMessage type="error" message={error} onClose={() => setError('')} />}
      {success && <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />}

      <Card style={{ marginBottom: '24px' }}>
        <form
          onSubmit={handleSearch}
          style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}
        >
          <div className="search-wrapper" style={{ flex: 1 }}>
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Search by title, author, or category (e.g. JavaScript, Algorithms, Cormen)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={handleClear}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--secondary-400)',
                }}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <Button type="submit" variant="primary" icon={Search} loading={loading}>
            Search
          </Button>

          {searched && (
            <Button type="button" variant="outline" onClick={handleClear}>
              Reset
            </Button>
          )}
        </form>
      </Card>

      <Card
        title={
          searched
            ? `Search Results (${books.length} found)`
            : `All Catalog Books (${books.length})`
        }
      >
        {loading ? (
          <LoadingSpinner text="Searching catalog..." />
        ) : books.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No Matching Books Found"
            description={
              searched
                ? `No books matched your search query "${searchTerm}". Try checking the spelling or searching by a broader term.`
                : 'There are no books currently listed in the library catalog.'
            }
            action={
              searched && (
                <Button variant="outline" size="sm" onClick={handleClear}>
                  View All Books
                </Button>
              )
            }
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
                <th>Available Copies</th>
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

export default SearchBooks;
