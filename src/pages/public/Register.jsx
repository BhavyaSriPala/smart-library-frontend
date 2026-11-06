import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, UserPlus } from 'lucide-react';
import { authService } from '../../services/api';
import FormInput from '../../components/FormInput';
import Button from '../../components/Button';
import AlertMessage from '../../components/AlertMessage';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Email address is required.');
      return;
    }

    if (!password) {
      setErrorMessage('Password is required.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      // Backend POST /register registers student only (role: 'student')
      const data = await authService.register(name.trim(), email.trim(), password);

      setSuccessMessage(
        data.message || 'Registration successful! You can now log in to the student portal.'
      );

      // Reset form
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');

      // Redirect to login after a brief moment
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Registration failed. Please verify your details or check if the email is already in use.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Student Registration</h1>
          <p>Create your library portal account</p>
        </div>

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
            label="Full Name"
            id="name"
            name="name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
            icon={User}
          />

          <FormInput
            label="Email Address"
            id="email"
            name="email"
            type="email"
            placeholder="student@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            icon={Mail}
          />

          <FormInput
            label="Password"
            id="password"
            name="password"
            type="password"
            placeholder="Create a secure password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            icon={Lock}
          />

          <FormInput
            label="Confirm Password"
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            icon={Lock}
          />

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            icon={UserPlus}
            style={{ width: '100%', marginTop: '8px' }}
          >
            Create Student Account
          </Button>
        </form>

        <div className="auth-footer">
          Already registered?{' '}
          <Link to="/login" style={{ fontWeight: 600 }}>
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
