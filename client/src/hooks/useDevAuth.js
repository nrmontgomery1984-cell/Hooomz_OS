import { useContext } from 'react';
import { DevAuthContext } from '../contexts/DevAuthContext.jsx';

/**
 * Hook for accessing dev auth context
 *
 * @returns {Object} Dev auth state and methods
 */
export function useDevAuth() {
  const context = useContext(DevAuthContext);

  if (!context) {
    // Return a default object if not in DevAuthProvider
    // This allows the hook to be used safely outside dev mode
    return {
      currentPersona: null,
      switchPersona: () => {},
      isDevMode: false,
      resetTestData: () => {},
      testProject: null,
    };
  }

  return context;
}

export default useDevAuth;
