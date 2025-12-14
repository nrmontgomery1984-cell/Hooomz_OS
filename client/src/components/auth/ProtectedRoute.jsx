import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts';

/**
 * ProtectedRoute - Wraps routes that require authentication
 *
 * Flow:
 * 1. If loading, show loading spinner
 * 2. If in mock mode (no Supabase), allow access (for demo)
 * 3. If not authenticated, redirect to login
 * 4. If authenticated but no organization, redirect to onboarding
 * 5. Otherwise, render children
 */
export function ProtectedRoute({ children, requireOrg = true }) {
  const { user, organization, loading, isMockMode } = useAuth();
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

  // In mock mode, allow access without auth
  if (isMockMode) {
    return children;
  }

  // Not authenticated - redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated but no organization - redirect to onboarding
  if (requireOrg && !organization) {
    return <Navigate to="/onboarding" replace />;
  }

  // All checks passed - render children
  return children;
}

/**
 * PublicRoute - Wraps routes that should redirect authenticated users
 * (like login/signup pages)
 */
export function PublicRoute({ children }) {
  const { user, organization, loading, isMockMode } = useAuth();

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

  // In mock mode, allow access
  if (isMockMode) {
    return children;
  }

  // If authenticated and has org, redirect to dashboard
  if (user && organization) {
    return <Navigate to="/" replace />;
  }

  // If authenticated but no org, redirect to onboarding
  if (user && !organization) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}
