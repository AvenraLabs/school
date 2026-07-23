import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authAPI } from '../../api';
import { GraduationCap, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import './LoginPage.css';

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, user, isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      if (user.role === 'super_admin') {
        navigate('/super-admin', { replace: true });
      } else if (user.role === 'school_admin') {
        navigate('/admin/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, authLoading, navigate]);

  if (authLoading) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await authAPI.login(username, password);
      const base64Url = response.token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
      );
      const user = JSON.parse(jsonPayload);
      login(user, response.token);
      if (user.role === 'super_admin') navigate('/super-admin');
      else if (user.role === 'school_admin') navigate('/admin/dashboard');
      else setError('Access denied. Only admins can log in here.');
    } catch (err) {
      const msg = err.response?.data?.message || 'Incorrect username or password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Top-left blurred gradient blob */}
      <div className="blob-topleft" />

      {/* Decorative outline circles */}
      <div className="circle-outline circle-top-right" />
      <div className="circle-outline circle-bottom-left" />

      {/* ---------- LEFT: illustration ---------- */}
      <div className="illustration-panel">
        {/* Decorative swirl line */}
        <svg className="swirl-line" viewBox="0 0 1440 1024" fill="none">
          <path
            d="M980 300 C 1120 260, 1250 380, 1180 500 C 1100 640, 900 560, 850 700 C 800 840, 1000 900, 1150 850"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path d="M960 300 l 25 -15 l -5 28" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>

        {/* Sparkles */}
        <Sparkle className="sparkle sparkle-1" size={22} />
        <Sparkle className="sparkle sparkle-2" size={14} />
        <Sparkle className="sparkle sparkle-3" size={10} />

        <img src="/images.svg" alt="" className="illustration-img" />
      </div>

      {/* ---------- RIGHT: form panel ---------- */}
      <div className="form-panel">
        <div className="brand">
          <div className="brand-icon">
            <GraduationCap size={32} color="#fff" strokeWidth={2.2} />
          </div>
          <h1 className="brand-name">SchoolIQ</h1>
          <p className="brand-subtitle">Admin Management Console</p>
        </div>

        <h2 className="welcome-heading">Welcome back</h2>

        {/* Error Alert */}
        {error && (
          <div className="error-alert">
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="text"
            placeholder="Enter Username or Mobile Number"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="login-input"
            required
            disabled={loading}
            autoFocus
          />

          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="password-toggle"
              aria-label={showPassword ? "Hide password" : "Show password"}
              disabled={loading}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button type="submit" className="signin-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="login-spinner" />
                <span>Verifying…</span>
              </>
            ) : (
              <>
                <span>Sign in</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          Powered by{' '}
          <a
            href="https://avenra.org"
            target="_blank"
            rel="noopener noreferrer"
            className="login-footer-link"
          >
            Avenra
          </a>
        </div>
      </div>
    </div>
  );
}

function Sparkle({ size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="white">
      <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" />
    </svg>
  );
}
