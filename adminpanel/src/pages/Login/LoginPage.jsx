import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authAPI } from '../../api';
import { Eye, EyeOff, ArrowRight, GraduationCap, AlertCircle } from 'lucide-react';
import './LoginPage.css';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

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
      if (user.role === 'super_admin') navigate('/super-admin/dashboard');
      else if (user.role === 'school_admin') navigate('/admin/dashboard');
      else setError('Access denied. Only admins can log in here.');
    } catch (err) {
      // 401 from login means wrong credentials — show the message, don't redirect
      const msg = err.response?.data?.message || 'Incorrect username or password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex font-sans">

      {/* ── LEFT PANEL ─────────────────────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[48%] xl:w-[44%] relative flex-col overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #0f0c29 0%, #1a1350 40%, #24243e 100%)' }}
      >
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full opacity-30"
            style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 -left-40 w-[480px] h-[480px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)' }} />
          <div className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }} />
        </div>

        {/* Centered brand mark */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full gap-5">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center backdrop-blur-sm">
            <GraduationCap className="w-8 h-8 text-indigo-300" />
          </div>
          <div className="text-center">
            <p className="text-white font-bold text-2xl tracking-tight">School App</p>
            <p className="text-indigo-400/60 text-xs uppercase tracking-widest font-semibold mt-1">Admin Console</p>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center relative bg-slate-50">

        {/* Subtle dot pattern */}
        <div className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }} />

        <div className="relative z-10 w-full max-w-[400px] mx-8 sm:mx-10 px-2">

          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-3">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <p className="text-slate-900 font-bold text-xl">School App</p>
            <p className="text-slate-400 text-xs mt-0.5">Admin Management Console</p>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back</h2>
            
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-100 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
              <p className="text-rose-700 text-sm leading-snug">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">


            {/* Username */}
            <div>
              <label htmlFor="login-username"
                className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Username
              </label>
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin_school"
                required
                autoFocus
                disabled={loading}
                className="login-input"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password"
                className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                  className="login-input login-input--password"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="login-password-toggle">
                  {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>
            </div>

            {/* Submit — colour matches left panel */}
            <button
              type="submit"
              disabled={loading}
              className="login-submit"
            >
              {loading ? (
                <>
                  <span className="login-spinner" />
                  <span>Verifying…</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="login-submit__arrow" style={{ width: 16, height: 16 }} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Avenra credit */}
        <p className="absolute bottom-5 left-0 right-0 text-center text-[11px] text-slate-400">
          Built by{' '}
          <a
            href="https://www.avenra.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 font-medium hover:text-indigo-500 transition-colors duration-200"
          >
            Avenra
          </a>
        </p>
      </div>
    </div>
  );
}
