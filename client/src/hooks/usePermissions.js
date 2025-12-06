import { useMemo } from 'react';
import { useDevAuth } from './useDevAuth';
import {
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  canAccessProject,
  canAccessTask,
  isRole,
  getVisibleFields,
} from '../lib/permissions';

/**
 * Hook for checking permissions in components
 *
 * @returns {Object} Permission checking functions bound to current user
 */
export function usePermissions() {
  const { currentPersona, isDevMode } = useDevAuth();

  const permissions = useMemo(() => {
    const user = currentPersona;

    return {
      /**
       * Check if user has a specific permission
       * @param {string} permission
       * @returns {boolean}
       */
      can: (permission) => hasPermission(user, permission),

      /**
       * Check if user has ALL permissions
       * @param {string[]} perms
       * @returns {boolean}
       */
      canAll: (perms) => hasAllPermissions(user, perms),

      /**
       * Check if user has ANY permission
       * @param {string[]} perms
       * @returns {boolean}
       */
      canAny: (perms) => hasAnyPermission(user, perms),

      /**
       * Check if user can access a project
       * @param {string} projectId
       * @returns {boolean}
       */
      canAccessProject: (projectId) => canAccessProject(user, projectId),

      /**
       * Check if user can access a task
       * @param {string} taskId
       * @returns {boolean}
       */
      canAccessTask: (taskId) => canAccessTask(user, taskId),

      /**
       * Check if user is a specific role
       * @param {string|string[]} roles
       * @returns {boolean}
       */
      isRole: (roles) => isRole(user, roles),

      /**
       * Get visible fields for current user
       * @returns {Object}
       */
      visibleFields: getVisibleFields(user?.role),

      /**
       * Current user role
       */
      role: user?.role || null,

      /**
       * Is contractor
       */
      isContractor: user?.role === 'contractor',

      /**
       * Is homeowner
       */
      isHomeowner: user?.role === 'homeowner',

      /**
       * Is subcontractor
       */
      isSubcontractor: user?.role === 'subcontractor',

      /**
       * Current user
       */
      user,

      /**
       * Is in dev mode
       */
      isDevMode,
    };
  }, [currentPersona, isDevMode]);

  return permissions;
}

export default usePermissions;
