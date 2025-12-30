import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Logo } from '../components/ui/Logo';
import { supabase } from '../services/supabase';

export function SetPassword() {
  const navigate = useNavigate();
  const { updatePassword, user, loading: authLoading, isRecoveryMode } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ready, setReady] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  // Check if URL has recovery token - if so, wait for auth to process it
  const hasTokenInUrl = window.location.hash.includes('access_token') ||
                        window.location.hash.includes('type=recovery') ||
                        window.location.hash.includes('type=magiclink');

  // On mount, check for session or wait for token processing
  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      // If we have a token in URL, Supabase should auto-process it
      // Give it time to process, then check for session
      if (hasTokenInUrl) {
        // Wait for Supabase to process the URL token
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      // Check if we have a valid session
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          if (session) {
            setReady(true);
          } else if (hasTokenInUrl) {
            // Token in URL but no session - token may be expired or invalid
            setError('This link has expired or is invalid. Please request a new password reset.');
          }
          setSessionChecked(true);
        }
      } else {
        if (mounted) {
          setError('Authentication service not available');
          setSessionChecked(true);
        }
      }
    };

    checkSession();

    return () => {
      mounted = false;
    };
  }, [hasTokenInUrl]);

  // Also react to auth state changes
  useEffect(() => {
    if (authLoading) return;

    if (isRecoveryMode || user) {
      setReady(true);
    }
  }, [authLoading, isRecoveryMode, user]);

  // Redirect to login if no session and no token after check
  useEffect(() => {
    if (sessionChecked && !ready && !hasTokenInUrl && !error) {
      const timer = setTimeout(() => {
        navigate('/login');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [sessionChecked, ready, hasTokenInUrl, error, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Verify we have a session before attempting password update
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Auth session missing! Please use the link from your email again.');
        return;
      }
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setFormLoading(true);
    try {
      const { error } = await updatePassword(password);

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (err) {
      console.error('Password update error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  // Show loading while waiting for auth to process token
  if ((!sessionChecked || authLoading) && !error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Loader2 className="w-12 h-12 text-emerald-500 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold text-charcoal mb-2">Processing...</h2>
            <p className="text-gray-600">
              Please wait while we verify your link.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-charcoal mb-2">Password Set!</h2>
            <p className="text-gray-600">
              Redirecting you to the dashboard...
            </p>
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
          <h1 className="text-2xl font-bold text-charcoal">Set Your Password</h1>
          <p className="text-gray-600 mt-2">
            Create a password to access your Hooomz account
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
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={formLoading}
              className="w-full py-2.5 bg-charcoal text-white rounded-lg hover:bg-charcoal/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {formLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Set Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SetPassword;
