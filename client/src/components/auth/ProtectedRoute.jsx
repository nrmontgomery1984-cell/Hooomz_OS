import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { isSupabaseConfigured } from '../../services/supabase';

/**
 * ProtectedRoute - Wraps routes that require authentication
 *
 * Flow:
 * 1. If loading, show loading spinner
 * 2. If Supabase not configured (dev mode), allow access
 * 3. If not authenticated, redirect to login
 * 4. Otherwise, render children
 */
export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
          <p className="mt-2 text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // In dev mode without Supabase, allow access
  if (!isSupabaseConfigured()) {
    return children;
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // All checks passed - render children
  return children;
}

/**
 * PublicRoute - Wraps routes that should redirect authenticated users
 * (like login/signup pages)
 */
export function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // In dev mode without Supabase, allow access immediately
  if (!isSupabaseConfigured()) {
    return children;
  }

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
          <p className="mt-2 text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}
