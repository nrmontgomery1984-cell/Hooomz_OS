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
 * @param {Object} options - Optional overrides for dashboard data
 * @param {Array} options.changeOrders - Change orders to include in budget
 * @returns {Object} Dashboard data
 */
export function useDashboardFromData(project, options = {}) {
  const { changeOrders } = options;

  const dashboardData = useMemo(() => {
    if (!project) return null;
    const data = createDashboardFromProject(project);

    // Merge in change orders from localStorage if provided
    if (changeOrders && data.budget) {
      data.budget.changeOrders = changeOrders;

      // Calculate approved change order total and adjust contract value
      const approvedTotal = changeOrders
        .filter(co => co.status === 'approved')
        .reduce((sum, co) => sum + (co.amount || 0), 0);

      if (approvedTotal !== 0) {
        // Add approved change orders to contract value
        data.budget.contractValue = (data.budget.contractValue || 0) + approvedTotal;
        // Recalculate remaining based on new contract value
        data.budget.totalRemaining = data.budget.contractValue - (data.budget.totalSpent || 0) - (data.budget.totalCommitted || 0);
        // Store the approved CO total for display
        data.budget.approvedChangeOrdersTotal = approvedTotal;
      }
    }

    return data;
  }, [project, changeOrders]);

  return { dashboardData };
}
