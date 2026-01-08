import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Logo } from '../components/ui/Logo';
import { logger } from '../utils/logger';

const REMEMBER_EMAIL_KEY = 'hooomz-remember-email';

export function Login() {
  const navigate = useNavigate();
  const { signIn, resetPassword, user, loading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('login'); // 'login' or 'forgot'
  const [resetSent, setResetSent] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      navigate('/', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Load remembered email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY);
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'forgot') {
      const { error: resetError } = await resetPassword(email);
      setLoading(false);
      if (resetError) {
        setError(resetError.message);
      } else {
        setResetSent(true);
      }
      return;
    }

    // Save or clear remembered email
    if (rememberMe) {
      localStorage.setItem(REMEMBER_EMAIL_KEY, email);
    } else {
      localStorage.removeItem(REMEMBER_EMAIL_KEY);
    }

    try {
      // Use the proper auth flow through the Supabase client
      const { error: signInError } = await signIn(email.trim(), password);
      setLoading(false);

      if (signInError) {
        logger.error('Login failed', signInError);
        setError(signInError.message || 'Login failed. Please check your credentials.');
      } else {
        // Navigate using React Router (SPA navigation)
        navigate('/', { replace: true });
      }
    } catch (err) {
      logger.error('Unexpected login error', err);
      setLoading(false);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  if (resetSent) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Mail className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-charcoal mb-2">Check your email</h2>
            <p className="text-gray-600 mb-6">
              We sent a password reset link to <strong>{email}</strong>
            </p>
            <button
              onClick={() => {
                setMode('login');
                setResetSent(false);
              }}
              className="text-sm text-blue-600 hover:underline"
            >
              Back to login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Logo className="mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-charcoal">
            {mode === 'login' ? 'Sign in to Hooomz' : 'Reset password'}
          </h1>
          <p className="text-gray-600 mt-2">
            {mode === 'login'
              ? 'Enter your credentials to access your account'
              : 'Enter your email to receive a reset link'}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {mode === 'login' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Enter your password"
                      required
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-600">
                    Remember me on this device
                  </label>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-charcoal text-white rounded-lg hover:bg-charcoal/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === 'login' ? 'Sign In' : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-4 text-center">
            {mode === 'login' ? (
              <button
                onClick={() => setMode('forgot')}
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot your password?
              </button>
            ) : (
              <button
                onClick={() => setMode('login')}
                className="text-sm text-blue-600 hover:underline"
              >
                Back to login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
