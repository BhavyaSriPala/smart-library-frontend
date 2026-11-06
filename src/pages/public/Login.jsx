import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Eye, EyeOff, HelpCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/api';
import FormInput from '../../components/FormInput';
import Button from '../../components/Button';
import AlertMessage from '../../components/AlertMessage';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    try {
      setLoading(true);
      const data = await authService.login(email.trim(), password);

      const userObject = data.user || {
        userId: data.userId,
        name: data.name,
        email: data.email,
        role: data.role,
      };

      // Store auth info in state and localStorage via context
      login(data.token, userObject);

      // Role-based redirection: student -> /student/dashboard, admin -> /admin/dashboard
      if (userObject.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    } catch (err) {
      // Phase 10 exact requirement: If credentials are incorrect, show "Incorrect email or password. Please try again."
      const status = err.response?.status;
      if (status === 401) {
        setErrorMessage('Incorrect email or password. Please try again.');
      } else {
        const msg =
          err.response?.data?.message ||
          'Incorrect email or password. Please try again.';
        setErrorMessage(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your library account</p>
        </div>

        {errorMessage && (
          <AlertMessage
            type="error"
            message={errorMessage}
            onClose={() => setErrorMessage('')}
          />
        )}

        <form onSubmit={handleSubmit}>
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
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            icon={Lock}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  color: 'var(--secondary-500)',
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />

          {/* Phase 10 Forgot Password Notice */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              margin: '8px 0 16px',
              fontSize: '0.82rem',
              color: 'var(--secondary-600)',
              backgroundColor: 'var(--secondary-50)',
              padding: '8px 12px',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--secondary-200)',
            }}
          >
            <HelpCircle size={15} style={{ color: 'var(--primary-600)', flexShrink: 0 }} />
            <span>
              Forgot your password? Please contact the librarian/admin to reset your password.
            </span>
          </div>

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            icon={LogIn}
            style={{ width: '100%', marginTop: '4px' }}
          >
            Sign In
          </Button>
        </form>

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register" style={{ fontWeight: 600 }}>
            Register as Student
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
