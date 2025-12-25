import { useState, useEffect, createContext, useContext } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);

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
        console.warn('Auth initialization timed out, proceeding without session');
        setLoading(false);
      }
    }, timeoutMs);

    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
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
        console.error('Error initializing auth:', err);
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth event:', event);

        // Handle password recovery event
        if (event === 'PASSWORD_RECOVERY') {
          setIsRecoveryMode(true);
          setUser(session?.user ?? null);
          setLoading(false);
          // Redirect to set-password page if not already there
          if (!window.location.pathname.includes('password')) {
            window.location.href = '/set-password';
          }
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
  }, []);

  // Fetch employee profile linked to auth user
  async function fetchEmployeeProfile(email) {
    if (!email) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('email', email)
      .is('deleted_at', null)
      .single();

    if (!error && data) {
      setEmployee(data);
    }
    setLoading(false);
  }

  // Sign in with email/password
  async function signIn({ email, password }) {
    if (!isSupabaseConfigured()) {
      return { error: { message: 'Auth not configured' } };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { data, error };
  }

  // Sign out
  async function signOut() {
    console.log('signOut called, supabase configured:', isSupabaseConfigured());

    // Always clear local state first
    setUser(null);
    setEmployee(null);

    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Sign out error:', err);
      }
    }

    // Always redirect to login, regardless of Supabase status
    window.location.href = '/login';
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
