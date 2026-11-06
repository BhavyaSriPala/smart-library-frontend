import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, ArrowLeft } from 'lucide-react';
import { bookService } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';
import FormInput from '../../components/FormInput';
import Button from '../../components/Button';
import AlertMessage from '../../components/AlertMessage';

const AddBook = () => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: '',
    publisher: '',
    quantity: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const { title, author, category, publisher, quantity } = formData;

    if (!title.trim() || !author.trim() || !category.trim() || !publisher.trim()) {
      setErrorMessage('Please fill in all required text fields.');
      return;
    }

    const parsedQty = parseInt(quantity, 10);
    if (isNaN(parsedQty) || parsedQty < 0) {
      setErrorMessage('Quantity must be a valid non-negative number.');
      return;
    }

    try {
      setLoading(true);
      // Existing backend POST /books sets availableCopies = quantity
      const res = await bookService.addBook({
        title: title.trim(),
        author: author.trim(),
        category: category.trim(),
        publisher: publisher.trim(),
        quantity: parsedQty,
      });

      setSuccessMessage(res.message || 'Book added to catalog successfully!');
      setFormData({
        title: '',
        author: '',
        category: '',
        publisher: '',
        quantity: '',
      });

      setTimeout(() => {
        navigate('/admin/books');
      }, 1400);
    } catch (err) {
      console.error('Error adding book:', err);
      const msg =
        err.response?.data?.message ||
        'Failed to add book. Please verify your input and admin privileges.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Add New Book"
        description="Add a new academic textbook or reference publication to the library catalog."
        actions={
          <Link to="/admin/books">
            <Button variant="outline" size="sm" icon={ArrowLeft}>
              Back to Catalog
            </Button>
          </Link>
        }
      />

      <div style={{ maxWidth: '720px' }}>
        <Card>
          {errorMessage && (
            <AlertMessage
              type="error"
              message={errorMessage}
              onClose={() => setErrorMessage('')}
            />
          )}

          {successMessage && (
            <AlertMessage
              type="success"
              message={successMessage}
              onClose={() => setSuccessMessage('')}
            />
          )}

          <form onSubmit={handleSubmit}>
            <FormInput
              label="Book Title"
              id="title"
              name="title"
              placeholder="e.g. Introduction to Algorithms"
              value={formData.title}
              onChange={handleChange}
              required
            />

            <div className="grid grid-cols-2">
              <FormInput
                label="Author"
                id="author"
                name="author"
                placeholder="e.g. Thomas H. Cormen"
                value={formData.author}
                onChange={handleChange}
                required
              />

              <FormInput
                label="Category / Subject"
                id="category"
                name="category"
                placeholder="e.g. Computer Science"
                value={formData.category}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-2">
              <FormInput
                label="Publisher"
                id="publisher"
                name="publisher"
                placeholder="e.g. MIT Press"
                value={formData.publisher}
                onChange={handleChange}
                required
              />

              <FormInput
                label="Quantity (Copies)"
                id="quantity"
                name="quantity"
                type="number"
                min="0"
                placeholder="e.g. 5"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
            </div>

            <div
              style={{
                display: 'flex',
                gap: '12px',
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: '1px solid var(--secondary-100)',
              }}
            >
              <Button type="submit" variant="primary" loading={loading} icon={PlusCircle}>
                Add Book to Catalog
              </Button>
              <Link to="/admin/books">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AddBook;
