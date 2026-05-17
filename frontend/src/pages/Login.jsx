import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  ArrowRight, 
  User, 
  Box,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export default function Login({ onLogin }) {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState(searchParams.get('mode') === 'signup' ? 'signup' : 'login');
  const [verificationMode, setVerificationMode] = useState(false);
  const [otp, setOtp] = useState('');
  const [resendCount, setResendCount] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const requestedMode = searchParams.get('mode');
    if (requestedMode === 'signup' || requestedMode === 'login') {
      setMode(requestedMode);
    }

    const errorParam = searchParams.get('error');
    if (errorParam === 'system_update') {
      setError('Session expired due to a platform update or system failure. Please sign in again.');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    let networkInfo = {};
    if (mode === 'signup') {
      try {
        const [ipRes, tz] = await Promise.all([
          fetch('https://api.ipify.org?format=json').then(r => r.json()),
          Intl.DateTimeFormat().resolvedOptions().timeZone
        ]);
        networkInfo = { clientIp: ipRes.ip, timezone: tz };
      } catch (err) {
        console.warn('Network detection failed:', err);
      }
    }

    const endpoint = mode === 'signup' ? `${API}/auth/signup` : `${API}/auth/login`;
    const body = mode === 'signup'
      ? { name, email, password, ...networkInfo }
      : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.needsVerification) {
          setVerificationMode(true);
          setSuccessMessage('Please verify your email.');
        } else {
          setError(data.error || 'Something went wrong.');
        }
      } else {
        if (mode === 'signup') {
          setVerificationMode(true);
          setSuccessMessage(data.message);
        } else {
          onLogin(data.user, data.token);
        }
      }
    } catch {
      setError('Could not connect to server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid OTP.');
      } else {
        setSuccessMessage('Account verified! Signing you in...');
        setTimeout(() => {
          onLogin(data.user, data.token);
        }, 1500);
      }
    } catch {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCount >= 3) {
      setError('Max resend attempts reached.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to resend OTP.');
      } else {
        setSuccessMessage(data.message);
        setResendCount(prev => prev + 1);
      }
    } catch {
      setError('Could not resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(m => m === 'login' ? 'signup' : 'login');
    setError('');
    setSuccessMessage('');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center p-6 transition-colors duration-300">
      <Link
        to="/"
        className="fixed top-6 left-6 flex items-center gap-2 px-4 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-main)] hover:border-brand-500 hover:text-brand-500 rounded-2xl text-sm font-bold transition-all shadow-sm group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Home
      </Link>

      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-500 rounded-2xl shadow-xl shadow-brand-500/20 mb-6">
            <Box className="text-white w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">Architect.io</h1>
          <p className="text-[var(--text-muted)] mt-2 font-medium">Visual Backend Intelligence</p>
        </div>

        <div className="bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-[2rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
          <AnimatePresence>
            {successMessage && (
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="absolute top-0 left-0 right-0 p-4 bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-500 text-xs font-bold text-center z-20"
              >
                {successMessage}
              </motion.div>
            )}
            {error && (
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="absolute top-0 left-0 right-0 p-4 bg-rose-500/10 border-b border-rose-500/20 text-rose-500 text-xs font-bold text-center z-20"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {verificationMode ? (
            <div className="space-y-8 py-4">
              <div className="text-center">
                <h2 className="text-2xl font-black mb-2">Check your email</h2>
                <p className="text-[var(--text-muted)] text-sm font-medium">We've sent a 6-digit code to <br/><span className="text-[var(--text-main)] font-bold">{email}</span></p>
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-brand-500 transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    maxLength="6"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] focus:border-brand-500 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-black tracking-[0.5em] text-center text-xl placeholder:tracking-normal placeholder:font-bold"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-2xl py-4 font-black text-sm transition-all shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 group"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      Verify Account
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center space-y-4">
                <p className="text-xs text-[var(--text-muted)] font-medium">
                  Didn't receive the code? 
                  <button 
                    onClick={handleResendOTP}
                    disabled={loading || resendCount >= 3}
                    className="ml-2 text-brand-500 font-bold hover:underline disabled:opacity-50"
                  >
                    Resend {resendCount > 0 && `(${3 - resendCount} left)`}
                  </button>
                </p>
                <button 
                  onClick={() => { setVerificationMode(false); setOtp(''); setError(''); setSuccessMessage(''); }}
                  className="text-xs font-bold text-[var(--text-muted)] hover:text-brand-500 transition-colors"
                >
                  Back to {mode === 'signup' ? 'Sign Up' : 'Sign In'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex bg-[var(--bg-app)] rounded-2xl p-1 mb-8">
                {['login', 'signup'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { setMode(m); setError(''); setSuccessMessage(''); }}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all capitalize ${
                      mode === m
                        ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    {m === 'login' ? 'Sign In' : 'Sign Up'}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <AnimatePresence>
                  {mode === 'signup' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden space-y-2"
                    >
                      <label className="text-sm font-bold uppercase tracking-widest text-[var(--text-muted)] ml-1">Full Name</label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] group-focus-within:text-brand-500 transition-colors" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] focus:border-brand-500 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-medium"
                          placeholder="Full Name"
                          required={mode === 'signup'}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-widest text-[var(--text-muted)] ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] group-focus-within:text-brand-500 transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] focus:border-brand-500 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-medium"
                      placeholder="name@company.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-widest text-[var(--text-muted)] ml-1">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] group-focus-within:text-brand-500 transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] focus:border-brand-500 rounded-2xl py-4 pl-12 pr-12 outline-none transition-all font-medium"
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-brand-500 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-500 hover:bg-brand-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-brand-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] mt-2"
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      {mode === 'signup' ? 'Create Account' : 'Sign In'}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center mt-6 text-[var(--text-muted)] text-sm font-medium">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={switchMode} className="text-brand-500 font-bold hover:underline">
            {mode === 'login' ? 'Sign up free' : 'Sign in'}
          </button>
        </p>

        <p className="text-center mt-3 text-[var(--text-muted)] text-sm font-medium">
          ← <Link to="/" className="text-brand-500 font-bold hover:underline">Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
