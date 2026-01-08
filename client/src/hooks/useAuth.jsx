import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { logger } from '../utils/logger';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);

  // Fetch employee profile linked to auth user
  const fetchEmployeeProfile = useCallback(async (email) => {
    if (!email) {
      setLoading(false);
      return;
    }

    try {
      // Add timeout to prevent hanging on RLS issues
      const queryPromise = supabase
        .from('employees')
        .select('*')
        .eq('email', email)
        .is('deleted_at', null)
        .single();

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Employee query timeout')), 3000)
      );

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

      if (!error && data) {
        setEmployee(data);
      }
    } catch (err) {
      logger.warn('Failed to fetch employee profile', { message: err.message });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    let mounted = true;

    // Check if we're on a password reset/set page - if so, wait for token processing
    const isPasswordPage = window.location.pathname.includes('password');
    const hasTokenInUrl = window.location.hash.includes('access_token') ||
                          window.location.hash.includes('type=recovery') ||
                          window.location.hash.includes('type=magiclink');

    // Timeout fallback - longer timeout if we're processing a token
    const timeoutMs = hasTokenInUrl ? 10000 : 5000;
    const timeout = setTimeout(() => {
      if (mounted) {
        logger.warn('Auth initialization timed out, proceeding without session');
        setLoading(false);
      }
    }, timeoutMs);

    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          logger.error('Error getting session', error);
          if (mounted) setLoading(false);
          return;
        }

        if (mounted) {
          setUser(session?.user ?? null);
          if (session?.user) {
            await fetchEmployeeProfile(session.user.email);
          } else {
            setLoading(false);
          }
        }
      } catch (err) {
        logger.error('Error initializing auth', err);
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        logger.debug('Auth event', { event });

        // Handle password recovery event
        if (event === 'PASSWORD_RECOVERY') {
          setIsRecoveryMode(true);
          setUser(session?.user ?? null);
          setLoading(false);
          return;
        }

        // Handle magic link sign in (for invites)
        if (event === 'SIGNED_IN' && isPasswordPage) {
          setUser(session?.user ?? null);
          setLoading(false);
          return;
        }

        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchEmployeeProfile(session.user.email);
        } else {
          setEmployee(null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [fetchEmployeeProfile]);

  // Sign in with email/password
  async function signIn(email, password) {
    if (!isSupabaseConfigured()) {
      return { error: { message: 'Auth not configured' } };
    }

    // Handle both (email, password) and ({email, password}) signatures
    let emailStr, passwordStr;
    if (typeof email === 'object' && email !== null) {
      emailStr = String(email.email || '').trim();
      passwordStr = String(email.password || '');
    } else {
      emailStr = String(email || '').trim();
      passwordStr = String(password || '');
    }

    if (!emailStr || !passwordStr) {
      return { error: { message: 'Email and password are required' } };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailStr,
      password: passwordStr,
    });

    return { data, error };
  }

  // Sign out - returns a promise that resolves after sign out
  // Note: Caller should handle navigation using React Router
  async function signOut() {
    // Clear local state first
    setUser(null);
    setEmployee(null);

    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        logger.error('Sign out error', err);
      }
    }

    return { error: null };
  }

  // Send password reset email
  async function resetPassword(email) {
    if (!isSupabaseConfigured()) {
      return { error: { message: 'Auth not configured' } };
    }

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    return { data, error };
  }

  // Invite employee (admin function)
  async function inviteEmployee(email) {
    if (!isSupabaseConfigured()) {
      return { error: { message: 'Auth not configured' } };
    }

    // Send magic link / invite
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/set-password`,
      },
    });

    return { data, error };
  }

  // Update password (for invited users setting password first time)
  async function updatePassword(newPassword) {
    if (!isSupabaseConfigured()) {
      return { error: { message: 'Auth not configured' } };
    }

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    return { data, error };
  }

  const value = {
    user,
    employee,
    loading,
    isAuthenticated: !!user,
    isRecoveryMode,
    isAdmin: employee?.role === 'administrator' || employee?.role === 'manager',
    signIn,
    signOut,
    resetPassword,
    inviteEmployee,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
