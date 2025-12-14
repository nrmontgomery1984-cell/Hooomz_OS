import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing session on mount
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      // Mock mode - no auth needed
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadUserData(session.user.id);
        } else {
          setProfile(null);
          setOrganization(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Load user profile and organization
  async function loadUserData(userId) {
    try {
      console.log('Loading user data for:', userId);

      // Get profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      console.log('Profile query result:', { profileData, profileError });

      // If profile doesn't exist, create it
      if (profileError?.code === 'PGRST116') {
        console.log('Profile not found, creating one...');
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: user?.email || '',
            full_name: user?.user_metadata?.full_name || '',
          })
          .select()
          .single();

        if (createError) {
          console.error('Failed to create profile:', createError);
          throw createError;
        }
        setProfile(newProfile);
      } else if (profileError) {
        throw profileError;
      } else {
        setProfile(profileData);

        // Get organization if user has one
        if (profileData?.organization_id) {
          const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', profileData.organization_id)
            .single();

          if (orgError) throw orgError;
          setOrganization(orgData);
        }
      }
    } catch (err) {
      console.error('Error loading user data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Sign up with email/password
  async function signUp({ email, password, fullName }) {
    setError(null);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      setError(error.message);
      return { error };
    }

    return { data };
  }

  // Sign in with email/password
  async function signIn({ email, password }) {
    setError(null);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return { error };
    }

    return { data };
  }

  // Sign out
  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      setError(error.message);
      return { error };
    }
    setUser(null);
    setProfile(null);
    setOrganization(null);
    return { error: null };
  }

  // Reset password
  async function resetPassword(email) {
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
      return { error };
    }

    return { error: null };
  }

  // Update password
  async function updatePassword(newPassword) {
    setError(null);
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setError(error.message);
      return { error };
    }

    return { error: null };
  }

  // Create organization
  async function createOrganization({ name, slug }) {
    setError(null);
    try {
      const { data, error } = await supabase.rpc('create_organization_for_user', {
        org_name: name,
        org_slug: slug,
        user_id: user.id,
      });

      if (error) throw error;

      // Reload user data to get updated profile/org
      await loadUserData(user.id);

      return { data, error: null };
    } catch (err) {
      setError(err.message);
      return { data: null, error: err };
    }
  }

  // Accept organization invite
  async function acceptInvite(token) {
    setError(null);
    try {
      const { data, error } = await supabase.rpc('accept_organization_invite', {
        invite_token: token,
      });

      if (error) throw error;

      // Reload user data
      await loadUserData(user.id);

      return { success: data, error: null };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err };
    }
  }

  // Update profile
  async function updateProfile(updates) {
    setError(null);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      setProfile(data);

      return { data, error: null };
    } catch (err) {
      setError(err.message);
      return { data: null, error: err };
    }
  }

  const value = {
    // State
    user,
    profile,
    organization,
    loading,
    error,
    isAuthenticated: !!user,
    hasOrganization: !!organization,
    isMockMode: !isSupabaseConfigured(),

    // Auth actions
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,

    // Organization actions
    createOrganization,
    acceptInvite,

    // Profile actions
    updateProfile,

    // Utility
    clearError: () => setError(null),
    refreshUserData: () => user && loadUserData(user.id),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
