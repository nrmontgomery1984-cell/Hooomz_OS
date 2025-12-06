import { usePermissions } from '../../hooks/usePermissions';

/**
 * PermissionGate - Conditionally render content based on permissions
 *
 * @param {Object} props
 * @param {string|string[]} props.requires - Permission(s) required
 * @param {boolean} props.requireAll - If true, requires ALL permissions (default: false = ANY)
 * @param {string|string[]} props.roles - Role(s) required (alternative to permissions)
 * @param {React.ReactNode} props.children - Content to render if permitted
 * @param {React.ReactNode} props.fallback - Content to render if NOT permitted
 *
 * @example
 * // Single permission
 * <PermissionGate requires="approve_change_orders">
 *   <ApproveButton />
 * </PermissionGate>
 *
 * @example
 * // Multiple permissions (ANY)
 * <PermissionGate requires={['view_assigned_tasks', 'update_task_status']}>
 *   <TaskList />
 * </PermissionGate>
 *
 * @example
 * // Multiple permissions (ALL required)
 * <PermissionGate requires={['view_documents', 'upload_documents']} requireAll>
 *   <DocumentManager />
 * </PermissionGate>
 *
 * @example
 * // Role-based
 * <PermissionGate roles="contractor">
 *   <ContractorOnlyFeature />
 * </PermissionGate>
 *
 * @example
 * // With fallback
 * <PermissionGate requires="view_financials" fallback={<AccessDenied />}>
 *   <FinancialDashboard />
 * </PermissionGate>
 */
export function PermissionGate({
  requires,
  requireAll = false,
  roles,
  children,
  fallback = null,
}) {
  const { can, canAll, canAny, isRole, user } = usePermissions();

  // If no user (not in dev mode), render children by default
  // This allows the app to work without the dev auth system
  if (!user) {
    return children;
  }

  // Check role-based access
  if (roles) {
    const hasRole = isRole(roles);
    return hasRole ? children : fallback;
  }

  // Check permission-based access
  if (requires) {
    const permissions = Array.isArray(requires) ? requires : [requires];

    let hasPermission;
    if (requireAll) {
      hasPermission = canAll(permissions);
    } else {
      hasPermission = canAny(permissions);
    }

    return hasPermission ? children : fallback;
  }

  // No requirements specified, render children
  return children;
}

/**
 * RoleGate - Shorthand for role-based gating
 */
export function RoleGate({ role, children, fallback = null }) {
  return (
    <PermissionGate roles={role} fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

/**
 * ContractorOnly - Only visible to contractors
 */
export function ContractorOnly({ children, fallback = null }) {
  return (
    <RoleGate role="contractor" fallback={fallback}>
      {children}
    </RoleGate>
  );
}

/**
 * HomeownerOnly - Only visible to homeowners
 */
export function HomeownerOnly({ children, fallback = null }) {
  return (
    <RoleGate role="homeowner" fallback={fallback}>
      {children}
    </RoleGate>
  );
}

/**
 * SubcontractorOnly - Only visible to subcontractors
 */
export function SubcontractorOnly({ children, fallback = null }) {
  return (
    <RoleGate role="subcontractor" fallback={fallback}>
      {children}
    </RoleGate>
  );
}

/**
 * NotRole - Hide from specific roles
 */
export function NotRole({ role, children }) {
  const { isRole } = usePermissions();

  const roles = Array.isArray(role) ? role : [role];
  const isExcludedRole = roles.some((r) => isRole(r));

  return isExcludedRole ? null : children;
}

export default PermissionGate;
