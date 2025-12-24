/**
 * Hooomz OS - Canonical Data Model
 *
 * This is the SINGLE SOURCE OF TRUTH for all constants, enums, and type definitions.
 * All other files should import from here - never define these values elsewhere.
 *
 * @module constants
 */

// =============================================================================
// PROJECT PHASES
// =============================================================================

/**
 * Project phase definitions
 *
 * Flow:
 *   SALES (intake → discovery → pricing)
 *   → ESTIMATE → QUOTE → CONTRACT → ACTIVE → COMPLETE → MAINTAINED
 */
export const PROJECT_PHASES = {
  // Sales sub-phases
  intake: {
    id: 'intake',
    label: 'Intake',
    group: 'sales',
    groupLabel: 'Sales',
    description: 'Initial project information captured',
    order: 1,
    color: 'purple',
    allowsLoopEdits: true,
  },
  discovery: {
    id: 'discovery',
    label: 'Discovery',
    group: 'sales',
    groupLabel: 'Sales',
    description: 'Understanding full scope and requirements',
    order: 2,
    color: 'purple',
    allowsLoopEdits: true,
  },
  pricing: {
    id: 'pricing',
    label: 'Pricing',
    group: 'sales',
    groupLabel: 'Sales',
    description: 'Internal rough estimate and budget',
    order: 3,
    color: 'purple',
    allowsLoopEdits: true,
  },
  // Main phases
  estimate: {
    id: 'estimate',
    label: 'Estimate',
    group: 'pre_contract',
    groupLabel: 'Pre-Contract',
    description: 'Detailed line-item estimate for customer',
    order: 4,
    color: 'blue',
    allowsLoopEdits: true,
  },
  quote: {
    id: 'quote',
    label: 'Quote',
    group: 'pre_contract',
    groupLabel: 'Pre-Contract',
    description: 'Customer reviewing and confirming quote',
    order: 5,
    color: 'cyan',
    allowsLoopEdits: true,
  },
  contract: {
    id: 'contract',
    label: 'Contract',
    group: 'pre_contract',
    groupLabel: 'Pre-Contract',
    description: 'All selections made, contract generated',
    order: 6,
    color: 'indigo',
    allowsLoopEdits: false, // Locked - requires CO after this
  },
  active: {
    id: 'active',
    label: 'Active',
    group: 'production',
    groupLabel: 'Production',
    description: 'Contract signed, deposit received, work in progress',
    order: 7,
    color: 'emerald',
    allowsLoopEdits: false, // Only via CO
  },
  complete: {
    id: 'complete',
    label: 'Complete',
    group: 'closed',
    groupLabel: 'Closed',
    description: 'Closeout process completed',
    order: 8,
    color: 'gray',
    allowsLoopEdits: false,
  },
  maintained: {
    id: 'maintained',
    label: 'Maintained',
    group: 'warranty',
    groupLabel: 'Warranty',
    description: 'In warranty/maintenance program',
    order: 9,
    color: 'teal',
    allowsLoopEdits: false,
  },
  cancelled: {
    id: 'cancelled',
    label: 'Cancelled',
    group: 'closed',
    groupLabel: 'Closed',
    description: 'Project cancelled',
    order: 99,
    color: 'red',
    allowsLoopEdits: false,
  },
};

/**
 * Phase group definitions for UI grouping
 */
export const PHASE_GROUPS = {
  sales: {
    id: 'sales',
    label: 'Sales',
    phases: ['intake', 'discovery', 'pricing'],
    color: 'purple',
  },
  pre_contract: {
    id: 'pre_contract',
    label: 'Pre-Contract',
    phases: ['estimate', 'quote', 'contract'],
    color: 'blue',
  },
  production: {
    id: 'production',
    label: 'Production',
    phases: ['active'],
    color: 'emerald',
  },
  closed: {
    id: 'closed',
    label: 'Closed',
    phases: ['complete', 'cancelled'],
    color: 'gray',
  },
  warranty: {
    id: 'warranty',
    label: 'Warranty',
    phases: ['maintained'],
    color: 'teal',
  },
};

/**
 * Valid phase transitions
 * Key = current phase, Value = array of valid next phases
 */
export const PHASE_TRANSITIONS = {
  // Sales phases
  intake: ['discovery', 'cancelled'],
  discovery: ['intake', 'pricing', 'cancelled'],
  pricing: ['discovery', 'estimate', 'cancelled'],
  // Pre-contract phases
  estimate: ['pricing', 'quote', 'cancelled'],
  quote: ['estimate', 'contract', 'cancelled'],
  contract: ['quote', 'active', 'cancelled'],
  // Production
  active: ['contract', 'complete', 'cancelled'],
  // Closed
  complete: ['active', 'maintained'], // Can reopen or move to warranty
  maintained: ['complete'], // Can return to complete if warranty issue needs work
  cancelled: ['intake'], // Can revive
};

/**
 * Legacy phase mappings for database migration
 * Maps old phase names to new phase names
 */
export const LEGACY_PHASE_MAP = {
  estimating: 'estimate',
  quoted: 'quote',
  contracted: 'contract',
  punch_list: 'active', // Punch list absorbed into active
  production: 'active',
};

// =============================================================================
// TRADE CODES
// =============================================================================

/**
 * Trade code definitions
 * These represent categories of construction work
 */
export const TRADE_CODES = {
  SW: { code: 'SW', name: 'Site Work', order: 1 },
  DM: { code: 'DM', name: 'Demo & Prep', order: 2 },
  FN: { code: 'FN', name: 'Foundation', order: 3 },
  FS: { code: 'FS', name: 'Structural Framing', order: 4 },
  FI: { code: 'FI', name: 'Interior Framing', order: 5 },
  RF: { code: 'RF', name: 'Roofing', order: 6 },
  EE: { code: 'EE', name: 'Exterior Envelope', order: 7 },
  WD: { code: 'WD', name: 'Windows & Doors', order: 8 },
  IA: { code: 'IA', name: 'Insulation & Air Sealing', order: 9 },
  EL: { code: 'EL', name: 'Electrical', order: 10 },
  PL: { code: 'PL', name: 'Plumbing', order: 11 },
  HV: { code: 'HV', name: 'HVAC', order: 12 },
  DW: { code: 'DW', name: 'Drywall', order: 13 },
  PT: { code: 'PT', name: 'Painting', order: 14 },
  FL: { code: 'FL', name: 'Flooring', order: 15 },
  TL: { code: 'TL', name: 'Tile', order: 16 },
  FC: { code: 'FC', name: 'Finish Carpentry', order: 17 },
  CM: { code: 'CM', name: 'Cabinetry & Millwork', order: 18 },
  CT: { code: 'CT', name: 'Countertops', order: 19 },
  SR: { code: 'SR', name: 'Stairs & Railings', order: 20 },
  FX: { code: 'FX', name: 'Fixtures', order: 21 },
  EF: { code: 'EF', name: 'Exterior Finishes', order: 22 },
  CL: { code: 'CL', name: 'Cleaning & Closeout', order: 23 },
  GN: { code: 'GN', name: 'General', order: 99 },
};

/**
 * Trade order array for sorting loops in construction sequence
 */
export const TRADE_ORDER = Object.values(TRADE_CODES)
  .sort((a, b) => a.order - b.order)
  .map(t => t.code);

/**
 * Legacy trade code aliases for backward compatibility
 * Maps old codes to their canonical equivalents
 */
export const TRADE_CODE_ALIASES = {
  FR: 'FS', // Old "Framing" → new "Structural Framing"
  EX: 'EE', // Old "Exterior" → new "Exterior Envelope"
  IN: 'IA', // Old "Insulation" → new "Insulation & Air Sealing"
  CB: 'CM', // Old "Cabinetry" → new "Cabinetry & Millwork"
  FZ: 'CL', // Old "Final Completion" → new "Cleaning & Closeout"
};

/**
 * Scope item ID prefix to trade code mapping
 * Used to determine trade from scope item IDs like "fr-ext", "pl-rough"
 */
export const SCOPE_ITEM_PREFIX_TO_TRADE = {
  sw: 'SW', // Site Work
  dm: 'DM', // Demo & Prep
  fn: 'FN', // Foundation
  fr: 'FS', // Framing → Structural Framing
  fs: 'FS', // Structural Framing
  fi: 'FI', // Interior Framing
  rf: 'RF', // Roofing
  ex: 'EE', // Exterior → Exterior Envelope
  ee: 'EE', // Exterior Envelope
  wd: 'WD', // Windows & Doors
  in: 'IA', // Insulation → Insulation & Air Sealing
  ia: 'IA', // Insulation & Air Sealing
  el: 'EL', // Electrical
  pl: 'PL', // Plumbing
  hv: 'HV', // HVAC
  dw: 'DW', // Drywall
  pt: 'PT', // Painting
  fl: 'FL', // Flooring
  tl: 'TL', // Tile
  fc: 'FC', // Finish Carpentry
  cb: 'CM', // Cabinetry → Cabinetry & Millwork
  cm: 'CM', // Cabinetry & Millwork
  ct: 'CT', // Countertops
  sr: 'SR', // Stairs & Railings
  fx: 'FX', // Fixtures
  ef: 'EF', // Exterior Finishes
  cl: 'CL', // Cleaning & Closeout
  gn: 'GN', // General
};

/**
 * Resolve trade code from a scope item ID prefix
 * @param {string} prefix - The prefix from a scope item ID (e.g., "fr" from "fr-ext")
 * @returns {string} The canonical trade code
 */
export function getTradeFromScopePrefix(prefix) {
  return SCOPE_ITEM_PREFIX_TO_TRADE[prefix?.toLowerCase()] || 'GN';
}

// =============================================================================
// LOOP STATUS
// =============================================================================

/**
 * Loop status definitions
 */
export const LOOP_STATUSES = {
  pending: {
    id: 'pending',
    label: 'Pending',
    description: 'Not yet started',
    color: 'gray',
    order: 1,
  },
  ready: {
    id: 'ready',
    label: 'Ready',
    description: 'Prerequisites met, ready to start',
    color: 'blue',
    order: 2,
  },
  in_progress: {
    id: 'in_progress',
    label: 'In Progress',
    description: 'Work is actively being performed',
    color: 'emerald',
    order: 3,
  },
  blocked: {
    id: 'blocked',
    label: 'Blocked',
    description: 'Cannot proceed due to blocker',
    color: 'red',
    order: 4,
  },
  complete: {
    id: 'complete',
    label: 'Complete',
    description: 'All tasks finished',
    color: 'gray',
    order: 5,
  },
};

// =============================================================================
// TASK STATUS
// =============================================================================

/**
 * Task status definitions
 */
export const TASK_STATUSES = {
  pending: {
    id: 'pending',
    label: 'Pending',
    description: 'Not yet started',
    color: 'gray',
    order: 1,
  },
  in_progress: {
    id: 'in_progress',
    label: 'In Progress',
    description: 'Work is being performed',
    color: 'blue',
    order: 2,
  },
  blocked: {
    id: 'blocked',
    label: 'Blocked',
    description: 'Cannot proceed',
    color: 'red',
    order: 3,
  },
  complete: {
    id: 'complete',
    label: 'Complete',
    description: 'Task finished',
    color: 'emerald',
    order: 4,
  },
};

// =============================================================================
// CHANGE ORDERS
// =============================================================================

/**
 * Change order types
 */
export const CHANGE_ORDER_TYPES = {
  customer: {
    id: 'customer',
    label: 'Customer Request',
    description: 'Change requested by the customer',
    requiresCustomerApproval: true,
  },
  contractor: {
    id: 'contractor',
    label: 'Contractor Initiated',
    description: 'Change initiated by contractor',
    requiresCustomerApproval: true,
  },
  no_cost: {
    id: 'no_cost',
    label: 'No Cost',
    description: 'Change with no cost impact',
    requiresCustomerApproval: false,
  },
};

/**
 * Change order statuses
 */
export const CHANGE_ORDER_STATUSES = {
  draft: {
    id: 'draft',
    label: 'Draft',
    color: 'gray',
  },
  pending: {
    id: 'pending',
    label: 'Pending Approval',
    color: 'amber',
  },
  approved: {
    id: 'approved',
    label: 'Approved',
    color: 'emerald',
  },
  declined: {
    id: 'declined',
    label: 'Declined',
    color: 'red',
  },
};

// =============================================================================
// USER ROLES
// =============================================================================

/**
 * User role definitions with permission levels
 * Higher level = more permissions
 */
export const USER_ROLES = {
  administrator: {
    id: 'administrator',
    level: 100,
    label: 'Administrator',
    shortLabel: 'Admin',
    description: 'Full system access - settings, users, financials',
    color: '#8b5cf6',
    permissions: {
      canAccessAdmin: true,
      canManageUsers: true,
      canViewFinancials: true,
      canEditSettings: true,
      canApproveChangeOrders: true,
      canDeleteProjects: true,
    },
  },
  manager: {
    id: 'manager',
    level: 80,
    label: 'Manager',
    shortLabel: 'Manager',
    description: 'Project oversight, team management, reporting',
    color: '#3b82f6',
    permissions: {
      canAccessAdmin: false,
      canManageUsers: false,
      canViewFinancials: true,
      canEditSettings: false,
      canApproveChangeOrders: true,
      canDeleteProjects: false,
    },
  },
  foreman: {
    id: 'foreman',
    level: 60,
    label: 'Foreman',
    shortLabel: 'Foreman',
    description: 'Site supervision, crew coordination, quality control',
    color: '#f59e0b',
    permissions: {
      canAccessAdmin: false,
      canManageUsers: false,
      canViewFinancials: false,
      canEditSettings: false,
      canApproveChangeOrders: false,
      canDeleteProjects: false,
    },
  },
  carpenter: {
    id: 'carpenter',
    level: 40,
    label: 'Carpenter',
    shortLabel: 'Carpenter',
    description: 'Skilled work, time tracking, task completion',
    color: '#10b981',
    permissions: {
      canAccessAdmin: false,
      canManageUsers: false,
      canViewFinancials: false,
      canEditSettings: false,
      canApproveChangeOrders: false,
      canDeleteProjects: false,
    },
  },
  apprentice: {
    id: 'apprentice',
    level: 30,
    label: 'Apprentice',
    shortLabel: 'Apprentice',
    description: 'Learning, assisting, time tracking',
    color: '#06b6d4',
    permissions: {
      canAccessAdmin: false,
      canManageUsers: false,
      canViewFinancials: false,
      canEditSettings: false,
      canApproveChangeOrders: false,
      canDeleteProjects: false,
    },
  },
  labourer: {
    id: 'labourer',
    level: 20,
    label: 'Labourer',
    shortLabel: 'Labourer',
    description: 'General labour, time tracking',
    color: '#64748b',
    permissions: {
      canAccessAdmin: false,
      canManageUsers: false,
      canViewFinancials: false,
      canEditSettings: false,
      canApproveChangeOrders: false,
      canDeleteProjects: false,
    },
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get phase by ID with fallback
 */
export function getPhase(phaseId) {
  return PROJECT_PHASES[phaseId] || PROJECT_PHASES.intake;
}

/**
 * Get trade by code with fallback
 * Handles legacy aliases
 */
export function getTrade(code) {
  const aliased = TRADE_CODE_ALIASES[code] || code;
  return TRADE_CODES[aliased] || TRADE_CODES.GN;
}

/**
 * Get trade name by code
 */
export function getTradeName(code) {
  return getTrade(code).name;
}

/**
 * Check if a phase allows direct loop/task edits
 * (vs requiring a change order)
 */
export function phaseAllowsLoopEdits(phaseId) {
  const phase = PROJECT_PHASES[phaseId];
  return phase?.allowsLoopEdits ?? false;
}

/**
 * Check if transition between phases is valid
 */
export function isValidPhaseTransition(fromPhase, toPhase) {
  const validNext = PHASE_TRANSITIONS[fromPhase] || [];
  return validNext.includes(toPhase);
}

/**
 * Get available phase transitions from current phase
 */
export function getAvailablePhaseTransitions(currentPhase) {
  const validNext = PHASE_TRANSITIONS[currentPhase] || [];
  return validNext.map(phaseId => PROJECT_PHASES[phaseId]).filter(Boolean);
}

/**
 * Sort loops by trade order
 */
export function sortLoopsByTradeOrder(loops) {
  return [...loops].sort((a, b) => {
    const orderA = getTrade(a.category_code || a.trade_code).order;
    const orderB = getTrade(b.category_code || b.trade_code).order;
    return orderA - orderB;
  });
}

/**
 * Check if user has permission
 */
export function userHasPermission(role, permission) {
  const roleConfig = USER_ROLES[role];
  return roleConfig?.permissions?.[permission] ?? false;
}

/**
 * Get color classes for a phase
 */
export function getPhaseColorClasses(phaseId) {
  const phase = PROJECT_PHASES[phaseId];
  const color = phase?.color || 'gray';

  const colorMap = {
    purple: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
    cyan: { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200' },
    indigo: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
    teal: { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
    gray: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
    red: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  };

  return colorMap[color] || colorMap.gray;
}

/**
 * Get color classes for a status
 */
export function getStatusColorClasses(status) {
  const colorMap = {
    pending: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
    ready: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
    in_progress: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
    blocked: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
    complete: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' },
    approved: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
    declined: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
    draft: { bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-200' },
  };

  return colorMap[status] || colorMap.pending;
}
