import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authAPI } from '../../api';
import { Eye, EyeOff, AlertCircle, Info, Globe, Mail } from 'lucide-react';
import { Modal } from '../../components/common/Modal';

/* ─── Custom Atmospheric Styles & Keyframes ─── */
const styles = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25%       { transform: translateX(-4px); }
    75%       { transform: translateX(4px); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .shake-anim   { animation: shake 0.4s ease-in-out; }
  .spin-anim    { animation: spin 0.8s linear infinite; }

  .pill-input {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 6px -1px rgba(27, 56, 43, 0.04), 0 1px 3px -1px rgba(0, 0, 0, 0.02);
  }
  .pill-input:focus {
    box-shadow: 0 0 0 3px rgba(27, 56, 43, 0.15), 0 4px 12px -2px rgba(27, 56, 43, 0.08);
  }
  .btn-primary-teak {
    box-shadow: 0 8px 20px -4px rgba(27, 56, 43, 0.35);
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .btn-primary-teak:hover {
    box-shadow: 0 12px 24px -4px rgba(27, 56, 43, 0.45);
    transform: translateY(-1px);
  }
  .btn-primary-teak:active {
    transform: translateY(0);
    box-shadow: 0 4px 12px -2px rgba(27, 56, 43, 0.3);
  }
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
      login(decoded, response.token, response.refreshToken);
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

      <div
        className="min-h-screen w-full relative flex items-center justify-center overflow-x-hidden select-none bg-[#f6f2ea]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 10% 15%, rgba(27, 56, 43, 0.08) 0%, transparent 40%),
            radial-gradient(circle at 90% 85%, rgba(214, 178, 112, 0.12) 0%, transparent 45%),
            radial-gradient(circle at 50% 50%, rgba(253, 251, 247, 0.8) 0%, rgba(246, 242, 234, 0.95) 100%)
          `,
          fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
        }}
      >
        {/* BEGIN: Ambient Geometric Background Decorations */}
        {/* Wireframe circle ring in bottom-left */}
        <div className="pointer-events-none absolute -bottom-16 -left-16 w-80 h-80 rounded-full border border-[#d6cdbd]/70 opacity-60" />
        <div className="pointer-events-none absolute bottom-8 left-8 w-56 h-56 rounded-full border border-[#e4dcce]/60 opacity-40" />

        {/* Wireframe circle ring in top-right */}
        <div className="pointer-events-none absolute -top-12 -right-12 w-72 h-72 rounded-full border border-[#d6cdbd]/70 opacity-60" />

        {/* Subtle decorative sparkles mirroring design */}
        <div className="pointer-events-none absolute top-1/4 left-[15%] text-[#c89d4d]/40 text-xl font-thin select-none">✦</div>
        <div className="pointer-events-none absolute bottom-1/3 left-1/3 text-[#1b382b]/25 text-xs font-thin select-none">✦</div>
        <div className="pointer-events-none absolute top-1/3 right-[12%] text-[#c89d4d]/30 text-sm font-thin select-none">✦</div>
        {/* END: Ambient Geometric Background Decorations */}

        {/* BEGIN: Main Login Container */}
        <main className="w-full max-w-7xl mx-auto px-6 py-6 sm:py-8 lg:py-12 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-8 items-center min-h-0 lg:min-h-[640px]">
            {/* BEGIN: Left Column Featured Academic Visual (Desktop only for streamlined mobile UX) */}
            <section aria-label="Academic Illustration Showcase" className="hidden lg:flex lg:col-span-6 xl:col-span-7 items-center justify-center relative">
              {/* Background subtle orbit lines */}
              <div className="pointer-events-none absolute w-[480px] h-[480px] rounded-full border border-[#dcd3c1]/40 -z-10 scale-90 sm:scale-105" />
              <div className="pointer-events-none absolute w-[360px] h-[360px] rounded-full border border-[#1b382b]/10 -z-10 -rotate-12" />

              {/* High Quality Academic Composition */}
              <div className="relative group p-3 sm:p-5 max-w-lg lg:max-w-xl w-full">
                <div className="relative rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(27,56,43,0.14)] border border-[#e5ded0]/80 bg-[#f9f6f0]/50 backdrop-blur-sm">
                  <img
                    src="/screen.png"
                    alt="SchoolIQ Academic Still Life Composition"
                    className="w-full h-auto object-cover transform transition-transform duration-700 hover:scale-[1.02]"
                    width="1200"
                    height="896"
                  />
                  {/* Soft inner vignette shadow for seamless aesthetic integration */}
                  <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-black/5 shadow-inner" />
                </div>
                {/* Soft glow beneath illustration */}
                <div className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 w-4/5 h-12 bg-[#1b382b]/10 blur-2xl rounded-full" />
              </div>
            </section>
            {/* END: Left Column Featured Academic Visual */}

            {/* BEGIN: Right Column Authentication Form */}
            <section aria-label="Login Form" className="lg:col-span-6 xl:col-span-5 flex flex-col items-center justify-center">
              <div className="w-full max-w-[420px] mx-auto flex flex-col items-center">
                {/* Brand Identity Header */}
                <h1 className="text-3xl font-extrabold text-[#11241c] tracking-tight text-center">
                  School<span className="text-[#c89d4d]">IQ</span>
                </h1>
                <div className="inline-flex items-center gap-2 px-3 py-1 mt-2 mb-5 sm:mb-7 rounded-full bg-[#1b382b]/5 border border-[#1b382b]/10 text-[11px] font-semibold text-[#1e4031] tracking-[0.14em] uppercase shadow-xs select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2e7d58]" />
                  <span>Admin Management Console</span>
                </div>

                {/* Main Welcome Title */}
                <h2 className="text-[26px] sm:text-[32px] font-extrabold text-[#11241c] tracking-tight text-center mb-6 sm:mb-8">
                  Welcome back
                </h2>

                {/* Error Alert */}
                {error && (
                  <div className="shake-anim flex items-start gap-2.5 px-4 py-3 rounded-2xl bg-[#fff5f5] border border-[#fed7d7] text-[#c53030] text-[13.5px] mb-4 w-full box-border">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Credentials Entry Form */}
                <form onSubmit={handleSubmit} className="w-full space-y-4" data-purpose="credentials-form">
                  {/* First Input: Username / Mobile */}
                  <div className="relative">
                    <input
                      id="username-field"
                      name="username"
                      type="text"
                      placeholder="Enter Username or Mobile Number"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      disabled={loading}
                      autoFocus
                      className="pill-input w-full h-[54px] px-6 rounded-full bg-white border border-[#ded8cb] text-[#1c2c24] placeholder-[#8f9b93] text-[15px] focus:outline-none focus:border-[#1b382b] focus:ring-2 focus:ring-[#1b382b]/20 transition duration-150"
                    />
                  </div>

                  {/* Second Input: Password with visibility toggle */}
                  <div className="relative">
                    <input
                      id="password-field"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="pill-input w-full h-[54px] pl-6 pr-14 rounded-full bg-white border border-[#ded8cb] text-[#1c2c24] placeholder-[#8f9b93] text-[15px] focus:outline-none focus:border-[#1b382b] focus:ring-2 focus:ring-[#1b382b]/20 transition duration-150"
                    />
                    {/* Eye Toggle Icon Button */}
                    <button
                      type="button"
                      id="toggle-password-visibility"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword((s) => !s)}
                      disabled={loading}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-[#798a80] hover:text-[#1b382b] p-1 rounded-full focus:outline-none transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  {/* Primary Action Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary-teak w-full h-[54px] rounded-full bg-[#1b382b] hover:bg-[#142c22] text-white font-medium text-[16px] flex items-center justify-center space-x-2 transition-all duration-200 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <span
                            className="spin-anim inline-block rounded-full"
                            style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff' }}
                          />
                          <span>Verifying…</span>
                        </>
                      ) : (
                        <span>Sign in →</span>
                      )}
                    </button>
                  </div>
                </form>

                {/* Footer Attribution Link */}
                <footer className="mt-6 sm:mt-10 flex items-center justify-center" data-purpose="login-footer">
                  <div className="flex items-center space-x-1 text-[13px] text-[#6d7e74]">
                    <span>Powered by</span>
                    <button
                      type="button"
                      onClick={() => setShowAboutModal(true)}
                      className="font-bold text-[#1a3529] hover:underline inline-flex items-center space-x-1 cursor-pointer bg-transparent border-none p-0"
                    >
                      <span>Avenra</span>
                    </button>
                    {/* Info Circle Icon */}
                    <button
                      type="button"
                      onClick={() => setShowAboutModal(true)}
                      title="System Information"
                      className="text-[#87968e] hover:text-[#1b382b] inline-flex items-center justify-center w-4 h-4 rounded-full ml-0.5 focus:outline-none cursor-pointer"
                    >
                      <Info size={14} />
                    </button>
                  </div>
                </footer>
              </div>
            </section>
            {/* END: Right Column Authentication Form */}
          </div>
        </main>
        {/* END: Main Login Container */}

        {/* About Avenra Modal */}
        {showAboutModal && (
          <Modal isOpen={true} onClose={() => setShowAboutModal(false)} title="About Avenra Platform">
            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3 p-3 bg-[#e3ebe6] rounded-[8px] border border-[#d6cdbd]">
                <div className="w-10 h-10 rounded-[8px] bg-[#1b382b] text-white flex items-center justify-center font-bold text-lg">
                  A
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#11241c]">Avenra Enterprise Systems</h4>
                  <p className="text-[#52607D]">School Management System &amp; Administration Console</p>
                </div>
              </div>

              <div className="space-y-2.5 divide-y divide-[#EDEAE1] pt-1">
                <div className="flex items-center justify-between py-1.5">
                  <span className="font-semibold text-[#52607D]">Engineering &amp; Publisher</span>
                  <span className="font-bold text-[#11241c]">Avenra</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="font-semibold text-[#52607D]">Build Version</span>
                  <span className="font-mono text-[#1b382b] font-semibold">v1.0.0 (Production)</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="font-semibold text-[#52607D]">Official Portal</span>
                  <a
                    href="https://avenra.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[#1b382b] hover:underline flex items-center gap-1"
                  >
                    <Globe size={13} /> avenra.org
                  </a>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="font-semibold text-[#52607D]">Technical Support Desk</span>
                  <a
                    href="mailto:founders@avenra.org"
                    className="font-medium text-[#1b382b] hover:underline flex items-center gap-1 font-mono"
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
