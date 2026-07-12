import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';

const S = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    padding: '24px',
    fontFamily: 'Inter, sans-serif',
  },
  card: {
    maxWidth: '480px',
    width: '100%',
    background: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    padding: '40px 32px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
    textAlign: 'center',
  },
  iconWrap: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: '#fee2e2',
    color: '#ef4444',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px',
  },
  title: {
    fontSize: '48px',
    fontWeight: 900,
    color: '#0f172a',
    margin: '0 0 8px',
    lineHeight: 1,
    letterSpacing: '-0.04em',
  },
  heading: {
    fontSize: '20px',
    fontWeight: 800,
    color: '#1e293b',
    margin: '0 0 12px',
  },
  desc: {
    fontSize: '14px',
    color: '#64748b',
    margin: '0 0 32px',
    lineHeight: 1.6,
  },
  btnGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '12px 24px',
    borderRadius: '10px',
    background: '#0f172a',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 700,
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  secondaryBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '12px 24px',
    borderRadius: '10px',
    background: 'transparent',
    color: '#475569',
    fontSize: '14px',
    fontWeight: 700,
    border: '1px solid #cbd5e1',
    cursor: 'pointer',
    transition: 'background 0.2s, border-color 0.2s',
  },
};

export function NotFoundPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoHome = () => {
    if (!user) {
      navigate('/login');
    } else if (user.role === 'super_admin') {
      navigate('/super-admin');
    } else if (user.role === 'school_admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div style={S.container}>
      <div style={S.card}>
        <div style={S.iconWrap}>
          <AlertCircle style={{ width: '32px', height: '32px' }} />
        </div>
        <h1 style={S.title}>404</h1>
        <h2 style={S.heading}>Page not found</h2>
        <p style={S.desc}>
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <div style={S.btnGroup}>
          <button
            onClick={handleGoHome}
            style={S.primaryBtn}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#1e293b')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#0f172a')}
          >
            <Home style={{ width: '16px', height: '16px' }} />
            Go to Home
          </button>
          <button
            onClick={() => navigate(-1)}
            style={S.secondaryBtn}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.borderColor = '#94a3b8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = '#cbd5e1';
            }}
          >
            <ArrowLeft style={{ width: '16px', height: '16px' }} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
export default NotFoundPage;
