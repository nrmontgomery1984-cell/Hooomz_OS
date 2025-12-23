import { useState, useEffect, createContext, useContext } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    let mounted = true;

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
      async (_event, session) => {
        if (!mounted) return;
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
  async function signIn(email, password) {
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
    if (!isSupabaseConfigured()) {
      return { error: null };
    }

    const { error } = await supabase.auth.signOut();
    setUser(null);
    setEmployee(null);
    return { error };
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
