import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, Trash2, Edit3, BookOpen, X } from 'lucide-react';
import { bookService } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import FormInput from '../../components/FormInput';
import StatusBadge from '../../components/StatusBadge';
import ResponsiveTable from '../../components/ResponsiveTable';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';

const ManageBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');

  // Edit Modal State
  const [editingBook, setEditingBook] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    author: '',
    category: '',
    publisher: '',
    quantity: 0,
    availableCopies: 0,
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Delete State
  const [deletingId, setDeletingId] = useState(null);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await bookService.getBooks(search);
      setBooks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching books for management:', err);
      setError('Failed to load books. Please verify backend connectivity.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [search]);

  // Open Edit Modal
  const openEditModal = (book) => {
    setEditingBook(book);
    setEditForm({
      title: book.title,
      author: book.author,
      category: book.category,
      publisher: book.publisher,
      quantity: book.quantity,
      availableCopies: book.availableCopies,
    });
    setEditError('');
  };

  // Submit Edit Form
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');

    const { title, author, category, publisher, quantity, availableCopies } = editForm;

    if (!title.trim() || !author.trim() || !category.trim() || !publisher.trim()) {
      setEditError('Please fill in all text fields.');
      return;
    }

    const parsedQty = parseInt(quantity, 10);
    const parsedAvail = parseInt(availableCopies, 10);

    if (isNaN(parsedQty) || parsedQty < 0 || isNaN(parsedAvail) || parsedAvail < 0) {
      setEditError('Quantity and available copies must be non-negative numbers.');
      return;
    }

    if (parsedAvail > parsedQty) {
      setEditError('Available copies cannot exceed total quantity.');
      return;
    }

    try {
      setEditLoading(true);
      const res = await bookService.updateBook(editingBook.bookId || editingBook._id, {
        title: title.trim(),
        author: author.trim(),
        category: category.trim(),
        publisher: publisher.trim(),
        quantity: parsedQty,
        availableCopies: parsedAvail,
      });

      setSuccess(res.message || `Book "${title}" updated successfully!`);
      setEditingBook(null);
      fetchBooks();
    } catch (err) {
      console.error('Error updating book:', err);
      setEditError(err.response?.data?.message || 'Failed to update book.');
    } finally {
      setEditLoading(false);
    }
  };

  // Handle Delete Book
  const handleDeleteBook = async (book) => {
    if (!window.confirm(`Are you sure you want to delete book "${book.title}" (${book.bookId})?`)) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      setDeletingId(book.bookId);

      const res = await bookService.deleteBook(book.bookId || book._id);
      setSuccess(res.message || `Book "${book.title}" deleted successfully!`);
      fetchBooks();
    } catch (err) {
      console.error('Error deleting book:', err);
      setError(err.response?.data?.message || 'Failed to delete book.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Manage Books"
        description="View, search, edit details, manage copy stock, or delete catalog titles."
        actions={
          <Link to="/admin/add-book">
            <Button variant="primary" icon={PlusCircle}>
              Add New Book
            </Button>
          </Link>
        }
      />

      {error && <AlertMessage type="error" message={error} onClose={() => setError('')} />}
      {success && <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />}

      <Card>
        {/* Search bar inside Card */}
        <div style={{ marginBottom: '20px', maxWidth: '420px' }}>
          <div className="search-wrapper">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Filter books by title, author, or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading catalog inventory..." />
        ) : books.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No Books Found"
            description={
              search
                ? `No books match your filter "${search}".`
                : 'Your catalog currently has no books. Start by adding one.'
            }
            action={
              <Link to="/admin/add-book">
                <Button variant="primary" size="sm" icon={PlusCircle}>
                  Add Book
                </Button>
              </Link>
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
                <th>Total Qty</th>
                <th>Available</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => {
                const isAvailable = book.availableCopies > 0;
                const isDeleting = deletingId === book.bookId;

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
                    <td style={{ textAlign: 'center' }}>{book.quantity}</td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>
                      {book.availableCopies}
                    </td>
                    <td>
                      <StatusBadge status={isAvailable ? 'Available' : 'Out of Stock'} />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Edit3}
                          onClick={() => openEditModal(book)}
                          title="Edit Book Details"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Trash2}
                          loading={isDeleting}
                          onClick={() => handleDeleteBook(book)}
                          title="Delete Book"
                          style={{ color: 'var(--danger-600)', borderColor: 'var(--danger-200)' }}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </ResponsiveTable>
        )}
      </Card>

      {/* Edit Book Modal */}
      {editingBook && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>Edit Book Details</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setEditingBook(null)}
              >
                <X size={18} />
              </button>
            </div>

            {editError && (
              <AlertMessage
                type="error"
                message={editError}
                onClose={() => setEditError('')}
              />
            )}

            <form onSubmit={handleEditSubmit} className="modal-body">
              <div style={{ marginBottom: '12px', fontSize: '0.85rem', color: 'var(--secondary-600)' }}>
                Book ID: <code style={{ fontWeight: 600 }}>{editingBook.bookId}</code>
              </div>

              <FormInput
                label="Book Title"
                id="editTitle"
                name="title"
                value={editForm.title}
                onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                required
              />

              <div className="grid grid-cols-2">
                <FormInput
                  label="Author"
                  id="editAuthor"
                  name="author"
                  value={editForm.author}
                  onChange={(e) => setEditForm((p) => ({ ...p, author: e.target.value }))}
                  required
                />
                <FormInput
                  label="Category"
                  id="editCategory"
                  name="category"
                  value={editForm.category}
                  onChange={(e) => setEditForm((p) => ({ ...p, category: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-2">
                <FormInput
                  label="Publisher"
                  id="editPublisher"
                  name="publisher"
                  value={editForm.publisher}
                  onChange={(e) => setEditForm((p) => ({ ...p, publisher: e.target.value }))}
                  required
                />
                <FormInput
                  label="Total Quantity"
                  id="editQuantity"
                  name="quantity"
                  type="number"
                  min="0"
                  value={editForm.quantity}
                  onChange={(e) => setEditForm((p) => ({ ...p, quantity: e.target.value }))}
                  required
                />
              </div>

              <FormInput
                label="Available Copies"
                id="editAvailableCopies"
                name="availableCopies"
                type="number"
                min="0"
                max={editForm.quantity}
                value={editForm.availableCopies}
                onChange={(e) => setEditForm((p) => ({ ...p, availableCopies: e.target.value }))}
                required
              />

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingBook(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={editLoading}>
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBooks;
