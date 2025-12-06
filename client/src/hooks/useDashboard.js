import { useState, useEffect, useMemo } from 'react';
import { createDashboardFromProject } from '../lib/dashboardHelpers';
import { getProject } from '../services/api';

/**
 * useDashboard - Hook for loading and managing dashboard data
 *
 * @param {string} projectId - Project ID to load
 * @returns {Object} Dashboard state and actions
 */
export function useDashboard(projectId) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load project data
  useEffect(() => {
    async function loadProject() {
      if (!projectId) return;

      setLoading(true);
      setError(null);

      try {
        const { data, error: apiError } = await getProject(projectId);

        if (apiError) {
          setError(apiError);
        } else {
          setProject(data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [projectId]);

  // Transform project to dashboard data
  const dashboardData = useMemo(() => {
    if (!project) return null;
    return createDashboardFromProject(project);
  }, [project]);

  // Action handler
  const handleAction = (action, payload) => {
    console.log('Dashboard action:', action, payload);

    // These would typically update state or call APIs
    switch (action) {
      case 'view_estimate':
        // Navigate to estimate view
        break;
      case 'message_client':
        // Open message composer
        break;
      case 'add_note':
        // Open note modal
        break;
      case 'request_decision':
        // Send decision request
        break;
      case 'add_change_order':
        // Open change order form
        break;
      case 'resolve_blocker':
        // Open blocker resolution modal
        break;
      case 'complete_task':
        // Mark task complete
        break;
      case 'handle_approval':
        // Process approval/decline
        break;
      case 'view_scope':
        // Open scope details
        break;
      default:
        console.warn('Unknown dashboard action:', action);
    }
  };

  return {
    project,
    dashboardData,
    loading,
    error,
    handleAction,
    refresh: () => {
      // Force reload
      setProject(null);
      setLoading(true);
    },
  };
}

/**
 * useDashboardFromData - Hook for using pre-loaded project data
 *
 * @param {Object} project - Project data object
 * @returns {Object} Dashboard data
 */
export function useDashboardFromData(project) {
  const dashboardData = useMemo(() => {
    if (!project) return null;
    return createDashboardFromProject(project);
  }, [project]);

  return { dashboardData };
}
