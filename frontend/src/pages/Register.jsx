import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const EmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const IconSun = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);
const IconMoon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

export default function Register() {
  const { register } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }));
  };

  const validate = () => {
    const e = {};

    if (!form.name.trim()) {
      e.name = 'Full name is required';
    } else if (form.name.trim().length < 2) {
      e.name = 'Name must be at least 2 characters';
    }

    if (!form.email.trim()) {
      e.email = 'Email is required';
    } else if (!EmailRegex.test(form.email.trim())) {
      e.email = 'Enter a valid email address';
    }

    if (!form.password) {
      e.password = 'Password is required';
    } else if (form.password.length < 6) {
      e.password = 'Password must be at least 6 characters';
    }

    if (!form.confirm) {
      e.confirm = 'Please confirm your password';
    } else if (form.password !== form.confirm) {
      e.confirm = 'Passwords do not match';
    }

    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await register(form.name.trim(), form.email.trim(), form.password);
      navigate('/');
    } catch (err) {
      setErrors({ global: err.response?.data?.error || 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <button className="theme-toggle" style={{ position: 'fixed', top: '1rem', right: '1rem' }} onClick={toggle}>
        {theme === 'dark' ? <IconSun /> : <IconMoon />}
      </button>

      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-mark">S</div>
          <span className="logo-text">Spendly</span>
        </div>

        <h1 className="auth-heading">Create account</h1>
        <p className="auth-sub">Start tracking your expenses today</p>

        {errors.global && <div className="alert alert-error">{errors.global}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Full name</label>
            <input
              className={`form-input ${errors.name ? 'error' : ''}`}
              value={form.name}
              onChange={set('name')}
              placeholder="Jane Doe"
              autoComplete="name"
            />
            {errors.name && <p className="form-error">{errors.name}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className={`form-input ${errors.email ? 'error' : ''}`}
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="you@example.com"
              autoComplete="email"
            />
            {errors.email && <p className="form-error">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className={`form-input ${errors.password ? 'error' : ''}`}
              type="password"
              value={form.password}
              onChange={set('password')}
              placeholder="At least 6 characters"
              autoComplete="new-password"
            />
            {errors.password && <p className="form-error">{errors.password}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Confirm password</label>
            <input
              className={`form-input ${errors.confirm ? 'error' : ''}`}
              type="password"
              value={form.confirm}
              onChange={set('confirm')}
              placeholder="Repeat your password"
              autoComplete="new-password"
            />
            {errors.confirm && <p className="form-error">{errors.confirm}</p>}
          </div>

          <button type="submit" className="btn btn-primary w-full btn-lg" style={{ marginTop: '0.25rem' }} disabled={loading}>
            {loading ? <span className="spinner" /> : 'Create account'}
          </button>
        </form>

        <p className="auth-divider">
          Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
