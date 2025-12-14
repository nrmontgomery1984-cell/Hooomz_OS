/**
 * Change Order Management - Hooomz
 *
 * Storage and utilities for tracking project change orders
 */

// Change order statuses
export const CHANGE_ORDER_STATUSES = [
  { id: 'pending', name: 'Pending Approval', color: 'amber' },
  { id: 'approved', name: 'Approved', color: 'emerald' },
  { id: 'declined', name: 'Declined', color: 'red' },
];

// Change order reasons/types
export const CHANGE_ORDER_REASONS = [
  { id: 'client_request', name: 'Client Request' },
  { id: 'design_change', name: 'Design Change' },
  { id: 'scope_expansion', name: 'Scope Expansion' },
  { id: 'unforeseen_condition', name: 'Unforeseen Condition' },
  { id: 'code_requirement', name: 'Code Requirement' },
  { id: 'material_substitution', name: 'Material Substitution' },
  { id: 'schedule_change', name: 'Schedule Change' },
  { id: 'other', name: 'Other' },
];

// Storage key
const STORAGE_KEY = 'hooomz_change_orders';

/**
 * Load all change orders from storage
 */
export function loadChangeOrders() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading change orders:', error);
    return [];
  }
}

/**
 * Save change orders to storage
 */
export function saveChangeOrders(changeOrders) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(changeOrders));
  } catch (error) {
    console.error('Error saving change orders:', error);
  }
}

/**
 * Get change orders for a specific project
 */
export function getProjectChangeOrders(projectId) {
  const changeOrders = loadChangeOrders();
  return changeOrders
    .filter(co => co.projectId === projectId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/**
 * Add a new change order
 */
export function addChangeOrder(changeOrder) {
  const changeOrders = loadChangeOrders();
  const newChangeOrder = {
    ...changeOrder,
    id: `co-${Date.now()}`,
    status: changeOrder.status || 'pending',
    createdAt: new Date().toISOString(),
  };
  changeOrders.push(newChangeOrder);
  saveChangeOrders(changeOrders);
  return newChangeOrder;
}

/**
 * Update an existing change order
 */
export function updateChangeOrder(changeOrderId, updates) {
  const changeOrders = loadChangeOrders();
  const index = changeOrders.findIndex(co => co.id === changeOrderId);
  if (index !== -1) {
    changeOrders[index] = {
      ...changeOrders[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveChangeOrders(changeOrders);
    return changeOrders[index];
  }
  return null;
}

/**
 * Delete a change order
 */
export function deleteChangeOrder(changeOrderId) {
  const changeOrders = loadChangeOrders();
  const filtered = changeOrders.filter(co => co.id !== changeOrderId);
  saveChangeOrders(filtered);
}

/**
 * Approve a change order
 */
export function approveChangeOrder(changeOrderId, approvedBy = 'You') {
  return updateChangeOrder(changeOrderId, {
    status: 'approved',
    approvedBy,
    approvedAt: new Date().toISOString(),
  });
}

/**
 * Decline a change order
 */
export function declineChangeOrder(changeOrderId, declinedReason = '') {
  return updateChangeOrder(changeOrderId, {
    status: 'declined',
    declinedReason,
    declinedAt: new Date().toISOString(),
  });
}

/**
 * Calculate change order totals for a project
 */
export function calculateChangeOrderTotals(projectId) {
  const changeOrders = getProjectChangeOrders(projectId);

  const totals = {
    total: 0,
    approved: 0,
    pending: 0,
    declined: 0,
    count: changeOrders.length,
    approvedCount: 0,
    pendingCount: 0,
    declinedCount: 0,
  };

  changeOrders.forEach(co => {
    const amount = co.amount || 0;

    switch (co.status) {
      case 'approved':
        totals.approved += amount;
        totals.approvedCount++;
        totals.total += amount; // Only approved COs affect total
        break;
      case 'pending':
        totals.pending += amount;
        totals.pendingCount++;
        break;
      case 'declined':
        totals.declined += amount;
        totals.declinedCount++;
        break;
    }
  });

  return totals;
}

/**
 * Get pending change orders for a project
 */
export function getPendingChangeOrders(projectId) {
  return getProjectChangeOrders(projectId).filter(co => co.status === 'pending');
}

/**
 * Get approved change orders for a project
 */
export function getApprovedChangeOrders(projectId) {
  return getProjectChangeOrders(projectId).filter(co => co.status === 'approved');
}

/**
 * Get the net impact of approved change orders on contract value
 */
export function getApprovedChangeOrderValue(projectId) {
  const approved = getApprovedChangeOrders(projectId);
  return approved.reduce((sum, co) => sum + (co.amount || 0), 0);
}

/**
 * Format currency for display
 */
export function formatCurrency(amount) {
  const isNegative = amount < 0;
  const formatted = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));

  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Get status color classes
 */
export function getStatusColors(status) {
  const colors = {
    pending: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
    approved: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
    declined: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  };
  return colors[status] || colors.pending;
}

export default {
  CHANGE_ORDER_STATUSES,
  CHANGE_ORDER_REASONS,
  loadChangeOrders,
  saveChangeOrders,
  getProjectChangeOrders,
  addChangeOrder,
  updateChangeOrder,
  deleteChangeOrder,
  approveChangeOrder,
  declineChangeOrder,
  calculateChangeOrderTotals,
  getPendingChangeOrders,
  getApprovedChangeOrders,
  getApprovedChangeOrderValue,
  formatCurrency,
  getStatusColors,
};
