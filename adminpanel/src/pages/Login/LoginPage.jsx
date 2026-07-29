import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authAPI } from '../../api';
import { GraduationCap, Eye, EyeOff, ArrowRight, AlertCircle, Info, Globe, Mail } from 'lucide-react';
import { Modal } from '../../components/common/Modal';

/* ─── Inline keyframes (can't be done in Tailwind without config changes) ─── */
const styles = `
  @keyframes pulse-sparkle {
    0%   { transform: scale(0.8) rotate(0deg);  opacity: 0.5; }
    100% { transform: scale(1.2) rotate(15deg); opacity: 1;   }
  }
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25%       { transform: translateX(-4px); }
    75%       { transform: translateX(4px); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .sparkle-anim { animation: pulse-sparkle 3s ease-in-out infinite alternate; }
  .shake-anim   { animation: shake 0.4s ease-in-out; }
  .spin-anim    { animation: spin 0.8s linear infinite; }
`;

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

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

  if (authLoading) return null;

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
      const decoded = JSON.parse(jsonPayload);
      login(decoded, response.token);
      if (decoded.role === 'super_admin') navigate('/super-admin');
      else if (decoded.role === 'school_admin') navigate('/admin/dashboard');
      else setError('Access denied. Only admins can log in here.');
    } catch (err) {
      const msg = err.response?.data?.message || 'Incorrect username or password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>

      {/* Page shell — purple gradient background */}
      <div className="relative min-h-screen w-full overflow-hidden flex flex-row items-center bg-gradient-to-br from-[#eee9f7] via-[#e2d7f3] to-[#c9a8e8] font-sans">

        {/* ── Decorative: blurred top-left blob ── */}
        <div
          className="absolute pointer-events-none z-[1]"
          style={{
            top: '-130px',
            left: '-130px',
            height: '420px',
            width: '420px',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, rgba(99,102,241,0.75) 0%, rgba(139,92,246,0.55) 45%, rgba(196,181,253,0.35) 75%)',
            filter: 'blur(30px)',
          }}
        />

        {/* ── Decorative: outline circles ── */}
        <div className="absolute border-2 border-white/60 rounded-full pointer-events-none" style={{ top: '40px', right: '40px', height: '64px', width: '64px' }} />
        <div className="absolute border-2 border-white/40 rounded-full pointer-events-none" style={{ bottom: '40px', left: '40px', height: '96px', width: '96px' }} />

        {/* ── LEFT: illustration panel (hidden on ≤1024px) ── */}
        <div className="relative z-[5] hidden lg:flex flex-[1.2] h-screen items-center justify-center p-10">
          {/* Decorative swirl SVG */}
          <svg className="absolute inset-0 w-full h-full opacity-70 pointer-events-none" viewBox="0 0 1440 1024" fill="none">
            <path
              d="M980 300 C 1120 260, 1250 380, 1180 500 C 1100 640, 900 560, 850 700 C 800 840, 1000 900, 1150 850"
              stroke="white" strokeWidth="2" strokeLinecap="round"
            />
            <path d="M960 300 l 25 -15 l -5 28" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>

          {/* Sparkles */}
          <Sparkle className="sparkle-anim absolute" style={{ top: '25%', left: '15%' }} size={22} />
          <Sparkle className="sparkle-anim absolute" style={{ top: '55%', left: '80%', animationDelay: '1s' }} size={14} />
          <Sparkle className="sparkle-anim absolute" style={{ top: '70%', left: '20%', animationDelay: '1.5s' }} size={10} />

          <img src="/images.svg" alt="" className="relative z-[6] max-w-[95%] max-h-[85vh] object-contain" />
        </div>

        {/* ── RIGHT: form panel ── */}
        <div className="relative z-10 w-full max-w-[440px] flex flex-col items-center px-6 py-12 lg:px-12 lg:mr-[8%] mx-auto">

          {/* Brand */}
          <div className="flex flex-col items-center text-center mb-2">
            <div
              className="h-16 w-16 rounded-full flex items-center justify-center mb-3 transition-transform hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
                boxShadow: '0 10px 25px -5px rgba(126,34,206,0.45)',
              }}
            >
              <GraduationCap size={32} color="#fff" strokeWidth={2.2} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 m-0">SchoolIQ</h1>
            <p className="text-sm text-gray-500 mt-0.5">Admin Management Console</p>
          </div>

          <h2 className="text-[32px] font-extrabold text-gray-900 mt-7 mb-6 text-center">Welcome back</h2>

          {/* Error Alert */}
          {error && (
            <div className="shake-anim flex items-start gap-2.5 px-[18px] py-3 rounded-2xl bg-[#fff5f5] border border-[#fed7d7] text-[#c53030] text-[13.5px] mb-4 w-full box-border">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-[18px] w-full">
            <input
              type="text"
              placeholder="Enter Username or Mobile Number"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border-none rounded-full bg-white px-6 py-3.5 text-sm text-gray-700 outline-none box-border transition-all placeholder-gray-400"
              style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
              onFocus={e => e.target.style.boxShadow = '0 0 0 3px rgba(168,85,247,0.35)'}
              onBlur={e => e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'}
              required
              disabled={loading}
              autoFocus
            />

            {/* Password field */}
            <div className="relative w-full">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-none rounded-full bg-white px-6 pr-12 py-3.5 text-sm text-gray-700 outline-none box-border transition-all placeholder-gray-400"
                style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                onFocus={e => e.target.style.boxShadow = '0 0 0 3px rgba(168,85,247,0.35)'}
                onBlur={e => e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent border-none text-[#a855f7] hover:text-[#7e22ce] cursor-pointer flex items-center"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                disabled={loading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full border-none rounded-full py-3.5 text-white font-semibold text-[15px] flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(90deg, #a855f7 0%, #7e22ce 100%)',
                boxShadow: '0 10px 25px -5px rgba(126,34,206,0.4)',
              }}
              disabled={loading}
            >
              {loading ? (
                <>
                  {/* Spinner */}
                  <span
                    className="spin-anim inline-block rounded-full"
                    style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff' }}
                  />
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

          {/* Footer */}
          <div className="flex items-center justify-center gap-1.5 mt-10 text-xs text-[#52607D]">
            <span>Powered by</span>
            <button
              type="button"
              onClick={() => setShowAboutModal(true)}
              className="font-bold text-[#2F6F5E] hover:underline cursor-pointer flex items-center gap-1 bg-transparent border-none p-0"
            >
              Avenra <Info size={13} className="text-[#2F6F5E]" />
            </button>
          </div>
        </div>

        {/* About Avenra Modal */}
        {showAboutModal && (
          <Modal isOpen={true} onClose={() => setShowAboutModal(false)} title="About Avenra Platform">
            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3 p-3 bg-[#EAF3F0] rounded-[8px] border border-[#D3E6E0]">
                <div className="w-10 h-10 rounded-[8px] bg-[#2F6F5E] text-white flex items-center justify-center font-bold text-lg">
                  A
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#14213D]">Avenra Enterprise Systems</h4>
                  <p className="text-[#52607D]">School Management System &amp; Administration Console</p>
                </div>
              </div>

              <div className="space-y-2.5 divide-y divide-[#EDEAE1] pt-1">
                <div className="flex items-center justify-between py-1.5">
                  <span className="font-semibold text-[#52607D]">Engineering &amp; Publisher</span>
                  <span className="font-bold text-[#14213D]">Avenra</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="font-semibold text-[#52607D]">Build Version</span>
                  <span className="font-mono text-[#2F6F5E] font-semibold">v1.0.0 (Production)</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="font-semibold text-[#52607D]">Official Portal</span>
                  <a
                    href="https://avenra.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[#2F6F5E] hover:underline flex items-center gap-1"
                  >
                    <Globe size={13} /> avenra.org
                  </a>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="font-semibold text-[#52607D]">Technical Support Desk</span>
                  <a
                    href="mailto:founders@avenra.org"
                    className="font-medium text-[#2F6F5E] hover:underline flex items-center gap-1 font-mono"
                  >
                    <Mail size={13} /> founders@avenra.org
                  </a>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="font-semibold text-[#52607D]">Copyright</span>
                  <span className="text-[#8C97AB]">&copy; {new Date().getFullYear()} Avenra. All rights reserved.</span>
                </div>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </>
  );
}

function Sparkle({ size = 20, className = '', style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style} fill="white">
      <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" />
    </svg>
  );
}
