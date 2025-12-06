/**
 * Permission checking utilities
 *
 * Centralized permission logic that can be used across the app.
 * In dev mode, this uses the test personas. In production, it will
 * use the real auth system.
 */

/**
 * Check if a user has a specific permission
 * @param {Object} user - User object with permissions array
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export function hasPermission(user, permission) {
  if (!user || !user.permissions) return false;

  // 'all' permission grants everything
  if (user.permissions.includes('all')) return true;

  return user.permissions.includes(permission);
}

/**
 * Check if a user has ALL of the specified permissions
 * @param {Object} user - User object with permissions array
 * @param {string[]} permissions - Permissions to check
 * @returns {boolean}
 */
export function hasAllPermissions(user, permissions) {
  if (!user || !permissions || permissions.length === 0) return false;

  return permissions.every((perm) => hasPermission(user, perm));
}

/**
 * Check if a user has ANY of the specified permissions
 * @param {Object} user - User object with permissions array
 * @param {string[]} permissions - Permissions to check
 * @returns {boolean}
 */
export function hasAnyPermission(user, permissions) {
  if (!user || !permissions || permissions.length === 0) return false;

  return permissions.some((perm) => hasPermission(user, perm));
}

/**
 * Check if a user can access a specific project
 * @param {Object} user - User object with projects array
 * @param {string} projectId - Project ID to check
 * @returns {boolean}
 */
export function canAccessProject(user, projectId) {
  if (!user || !projectId) return false;

  // 'all' projects access
  if (user.projects?.includes('all')) return true;

  return user.projects?.includes(projectId) || false;
}

/**
 * Check if a user can access a specific task
 * @param {Object} user - User object
 * @param {string} taskId - Task ID to check
 * @returns {boolean}
 */
export function canAccessTask(user, taskId) {
  if (!user || !taskId) return false;

  // Contractors can access all tasks
  if (user.role === 'contractor') return true;

  // Subcontractors can only access assigned tasks
  if (user.role === 'subcontractor') {
    return user.assignedTasks?.includes(taskId) || false;
  }

  // Homeowners can view tasks in their project (read-only)
  if (user.role === 'homeowner') {
    return hasPermission(user, 'view_own_project');
  }

  return false;
}

/**
 * Get filtered data based on user permissions
 * @param {Object} user - User object
 * @param {Object[]} items - Array of items to filter
 * @param {string} projectIdField - Field name for project ID
 * @returns {Object[]}
 */
export function filterByProjectAccess(user, items, projectIdField = 'projectId') {
  if (!user || !items) return [];

  if (user.projects?.includes('all')) return items;

  return items.filter((item) => canAccessProject(user, item[projectIdField]));
}

/**
 * Check if user is a specific role
 * @param {Object} user - User object
 * @param {string|string[]} roles - Role(s) to check
 * @returns {boolean}
 */
export function isRole(user, roles) {
  if (!user || !roles) return false;

  const roleArray = Array.isArray(roles) ? roles : [roles];
  return roleArray.includes(user.role);
}

/**
 * Get visible fields for a user role
 * Some data should be hidden based on role
 * @param {string} role - User role
 * @returns {Object} - Object with field visibility flags
 */
export function getVisibleFields(role) {
  const baseFields = {
    projectName: true,
    projectStatus: true,
    projectProgress: true,
    schedule: true,
    messages: true,
    documents: true,
    photos: true,
  };

  switch (role) {
    case 'contractor':
      return {
        ...baseFields,
        costData: true,
        marginData: true,
        allProjects: true,
        clientDetails: true,
        subcontractorDetails: true,
        estimates: true,
        salesPipeline: true,
        fullFinancials: true,
      };

    case 'homeowner':
      return {
        ...baseFields,
        costData: false,
        marginData: false,
        allProjects: false,
        contractTotal: true,
        amountPaid: true,
        amountDue: true,
        decisions: true,
        changeOrders: true,
      };

    case 'subcontractor':
      return {
        ...baseFields,
        costData: false,
        marginData: false,
        allProjects: false,
        assignedTasks: true,
        ownBilling: true,
        timeLogging: true,
        tradeSchedule: true,
      };

    default:
      return baseFields;
  }
}

/**
 * Permission constants for easy reference
 */
export const PERMISSIONS = {
  // Project access
  VIEW_OWN_PROJECT: 'view_own_project',
  VIEW_PROJECT_OVERVIEW: 'view_project_overview',
  VIEW_PROJECT_SCHEDULE: 'view_project_schedule',
  VIEW_PROJECT_PHOTOS: 'view_project_photos',

  // Documents
  VIEW_DOCUMENTS: 'view_documents',
  VIEW_RELEVANT_DOCUMENTS: 'view_relevant_documents',
  UPLOAD_DOCUMENTS: 'upload_documents',

  // Decisions & Change Orders
  APPROVE_DECISIONS: 'approve_decisions',
  APPROVE_CHANGE_ORDERS: 'approve_change_orders',
  CREATE_CHANGE_ORDERS: 'create_change_orders',

  // Tasks
  VIEW_ASSIGNED_TASKS: 'view_assigned_tasks',
  UPDATE_TASK_STATUS: 'update_task_status',
  CREATE_TASKS: 'create_tasks',
  ASSIGN_TASKS: 'assign_tasks',

  // Time & Billing
  LOG_HOURS: 'log_hours',
  VIEW_OWN_BILLING: 'view_own_billing',
  VIEW_ALL_BILLING: 'view_all_billing',

  // Communication
  SEND_MESSAGES: 'send_messages',
  VIEW_MESSAGES: 'view_messages',

  // Photos
  UPLOAD_PHOTOS: 'upload_photos',

  // Payments
  MAKE_PAYMENTS: 'make_payments',
  VIEW_PAYMENT_HISTORY: 'view_payment_history',
  PROCESS_PAYMENTS: 'process_payments',

  // Admin
  MANAGE_USERS: 'manage_users',
  MANAGE_SETTINGS: 'manage_settings',
  VIEW_REPORTS: 'view_reports',
};
