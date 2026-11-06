import React, { useEffect, useState } from 'react';
import { Users, Search, Edit3, Key, X, Eye, EyeOff } from 'lucide-react';
import { studentService } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import FormInput from '../../components/FormInput';
import StatusBadge from '../../components/StatusBadge';
import ResponsiveTable from '../../components/ResponsiveTable';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');

  // Edit Modal State
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Reset Password Modal State
  const [resettingStudent, setResettingStudent] = useState(null);
  const [resetForm, setResetForm] = useState({ newPassword: '', confirmPassword: '' });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await studentService.getStudents();
      const list = Array.isArray(data) ? data : data.students || [];
      setStudents(list);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load registered student records. Verify admin privileges.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Open Edit Modal
  const openEditModal = (student) => {
    setEditingStudent(student);
    setEditForm({ name: student.name, email: student.email });
    setEditError('');
  };

  // Submit Edit Form
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');

    if (!editForm.name.trim() || !editForm.email.trim()) {
      setEditError('Name and email are required.');
      return;
    }

    try {
      setEditLoading(true);
      const res = await studentService.updateStudent(editingStudent.userId, {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
      });

      setSuccess(res.message || `Student ${editForm.name} updated successfully!`);
      setEditingStudent(null);
      fetchStudents();
    } catch (err) {
      console.error('Error updating student:', err);
      setEditError(err.response?.data?.message || 'Failed to update student details.');
    } finally {
      setEditLoading(false);
    }
  };

  // Open Reset Password Modal
  const openResetModal = (student) => {
    setResettingStudent(student);
    setResetForm({ newPassword: '', confirmPassword: '' });
    setResetError('');
    setShowNewPassword(false);
  };

  // Submit Password Reset
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setResetError('');

    if (!resetForm.newPassword) {
      setResetError('New password is required.');
      return;
    }

    if (resetForm.newPassword.length < 6) {
      setResetError('New password must be at least 6 characters long.');
      return;
    }

    if (resetForm.newPassword !== resetForm.confirmPassword) {
      setResetError('Passwords do not match.');
      return;
    }

    try {
      setResetLoading(true);
      const res = await studentService.resetPassword(
        resettingStudent.userId,
        resetForm.newPassword
      );

      setSuccess(
        res.message || `Password for ${resettingStudent.name} has been reset successfully!`
      );
      setResettingStudent(null);
    } catch (err) {
      console.error('Error resetting password:', err);
      setResetError(err.response?.data?.message || 'Failed to reset student password.');
    } finally {
      setResetLoading(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.email && s.email.toLowerCase().includes(q)) ||
      (s.userId && s.userId.toLowerCase().includes(q))
    );
  });

  return (
    <div>
      <PageHeader
        title="Student Directory & Management"
        description="View registered students, update account details, and securely reset passwords."
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
              placeholder="Search by student name, email, or user ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading student directory..." />
        ) : filteredStudents.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No Students Found"
            description={
              search
                ? `No student records matched your search query "${search}".`
                : 'There are currently no registered student records in the system.'
            }
          />
        ) : (
          <ResponsiveTable>
            <thead>
              <tr>
                <th>User ID</th>
                <th>Student Name</th>
                <th>Email Address</th>
                <th>Role</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.userId || student._id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>
                    {student.userId}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--primary-100)',
                          color: 'var(--primary-700)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                        }}
                      >
                        {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                      </div>
                      <span style={{ fontWeight: 600 }}>{student.name}</span>
                    </div>
                  </td>
                  <td>{student.email}</td>
                  <td>
                    <StatusBadge status={student.role || 'student'} />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Edit3}
                        onClick={() => openEditModal(student)}
                        title="Edit Student Details"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Key}
                        onClick={() => openResetModal(student)}
                        title="Reset Student Password"
                      >
                        Reset Password
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </ResponsiveTable>
        )}
      </Card>

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>Edit Student Information</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setEditingStudent(null)}
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
                User ID: <code style={{ fontWeight: 600 }}>{editingStudent.userId}</code>
              </div>

              <FormInput
                label="Student Name"
                id="editName"
                name="name"
                value={editForm.name}
                onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                required
              />

              <FormInput
                label="Email Address"
                id="editEmail"
                name="email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                required
              />

              <div className="form-group">
                <label className="form-label">Role</label>
                <input
                  type="text"
                  value="Student (Fixed)"
                  disabled
                  className="form-input"
                  style={{ backgroundColor: 'var(--secondary-100)', cursor: 'not-allowed' }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--secondary-500)', marginTop: '4px', display: 'block' }}>
                  Student role cannot be modified.
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingStudent(null)}
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

      {/* Reset Password Modal */}
      {resettingStudent && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3>Reset Password</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setResettingStudent(null)}
              >
                <X size={18} />
              </button>
            </div>

            {resetError && (
              <AlertMessage
                type="error"
                message={resetError}
                onClose={() => setResetError('')}
              />
            )}

            <form onSubmit={handleResetSubmit} className="modal-body">
              <p style={{ fontSize: '0.88rem', color: 'var(--secondary-600)', marginBottom: '16px' }}>
                Resetting password for <strong>{resettingStudent.name}</strong> ({resettingStudent.email}).
                Old password is never displayed or accessible.
              </p>

              <FormInput
                label="New Password"
                id="newPassword"
                name="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Enter at least 6 characters"
                value={resetForm.newPassword}
                onChange={(e) => setResetForm((p) => ({ ...p, newPassword: e.target.value }))}
                required
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((p) => !p)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      color: 'var(--secondary-500)',
                    }}
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />

              <FormInput
                label="Confirm New Password"
                id="confirmPassword"
                name="confirmPassword"
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Re-enter new password"
                value={resetForm.confirmPassword}
                onChange={(e) => setResetForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                required
              />

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setResettingStudent(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={resetLoading} icon={Key}>
                  Set New Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
