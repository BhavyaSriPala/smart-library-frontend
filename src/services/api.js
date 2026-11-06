import axios from 'axios';

// Base API configuration using environment variable or local backend fallback
const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_BASE_URL = rawApiUrl.replace(/\/+$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT authentication token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smart_library_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token on authentication failure/expiration if not already on login/register
      if (
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/register')
      ) {
        localStorage.removeItem('smart_library_token');
        localStorage.removeItem('smart_library_user');
      }
    }
    return Promise.reject(error);
  }
);

// ----------------------------------------------------------------------
// Reusable API Service Methods mapping to existing Express endpoints
// ----------------------------------------------------------------------

export const authService = {
  // POST /login
  login: async (email, password) => {
    const response = await api.post('/login', { email, password });
    return response.data;
  },

  // POST /register (Student registration only)
  register: async (name, email, password) => {
    const response = await api.post('/register', { name, email, password });
    return response.data;
  },
};

export const bookService = {
  // GET /books or GET /books?search=query
  getBooks: async (search = '') => {
    const endpoint = search.trim() ? `/books?search=${encodeURIComponent(search.trim())}` : '/books';
    const response = await api.get(endpoint);
    return response.data;
  },

  // POST /books (Admin only)
  addBook: async (bookData) => {
    const response = await api.post('/books', bookData);
    return response.data;
  },

  // PUT /books/:id (Admin only)
  updateBook: async (id, bookData) => {
    const response = await api.put(`/books/${id}`, bookData);
    return response.data;
  },

  // DELETE /books/:id (Admin only)
  deleteBook: async (id) => {
    const response = await api.delete(`/books/${id}`);
    return response.data;
  },
};

export const issueService = {
  // POST /requestBook (Student requests book -> PENDING, stock unchanged)
  requestBook: async (bookId) => {
    const response = await api.post('/requestBook', { bookId });
    return response.data;
  },

  // POST /issueBook (Admin issues pending request by issueId OR direct issue by bookId)
  issueBook: async (issueIdOrBookId, userId = null) => {
    const payload = {};
    if (typeof issueIdOrBookId === 'object' && issueIdOrBookId !== null) {
      Object.assign(payload, issueIdOrBookId);
    } else if (typeof issueIdOrBookId === 'string' && (issueIdOrBookId.startsWith('REQ_') || issueIdOrBookId.startsWith('ISSUE_'))) {
      payload.issueId = issueIdOrBookId;
    } else {
      payload.bookId = issueIdOrBookId;
      if (userId) payload.userId = userId;
    }
    const response = await api.post('/issueBook', payload);
    return response.data;
  },

  // PUT /returnBook (Admin returns book -> RETURNED, stock + 1, stop fine)
  returnBook: async (issueId) => {
    const response = await api.put('/returnBook', { issueId });
    return response.data;
  },

  // POST /payFine (Admin marks fine as PAID)
  payFine: async (issueId) => {
    const response = await api.post('/payFine', { issueId });
    return response.data;
  },

  // GET /issuedBooks (Student: their own; Admin: all or filter by userId/status)
  getIssuedBooks: async (userId = null, status = null) => {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (status) params.append('status', status);
    const queryString = params.toString();
    const endpoint = queryString ? `/issuedBooks?${queryString}` : '/issuedBooks';
    const response = await api.get(endpoint);
    return response.data;
  },
};

export const studentService = {
  // GET /students (Admin only)
  getStudents: async () => {
    const response = await api.get('/students');
    return response.data;
  },

  // PUT /students/:userId (Admin only: update name and email)
  updateStudent: async (userId, data) => {
    const response = await api.put(`/students/${userId}`, data);
    return response.data;
  },

  // PUT /students/:userId/reset-password (Admin only: set new password)
  resetPassword: async (userId, newPassword) => {
    const response = await api.put(`/students/${userId}/reset-password`, { newPassword });
    return response.data;
  },
};

export default api;
