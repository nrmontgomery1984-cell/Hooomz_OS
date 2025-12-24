/**
 * Change Orders Database Service
 *
 * All change order operations via Supabase.
 * Change orders are required to modify loops/tasks after contract phase.
 */

import { supabase } from '../supabase';
import { CHANGE_ORDER_TYPES } from '../../lib/constants';

/**
 * Get all change orders for a project
 */
export async function getChangeOrders(projectId) {
  const { data, error } = await supabase
    .from('change_orders')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) {
    // Table might not exist yet
    if (error.code === '42P01') {
      return { data: [], error: null };
    }
    console.error('[db.changeOrders] getChangeOrders error:', error);
    return { data: [], error };
  }

  return { data: data || [], error: null };
}

/**
 * Get a single change order by ID
 */
export async function getChangeOrder(changeOrderId) {
  const { data, error } = await supabase
    .from('change_orders')
    .select('*')
    .eq('id', changeOrderId)
    .single();

  if (error) {
    console.error('[db.changeOrders] getChangeOrder error:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Create a new change order
 */
export async function createChangeOrder(changeOrderData) {
  const insertData = {
    project_id: changeOrderData.project_id,
    title: changeOrderData.title,
    description: changeOrderData.description || null,
    change_type: changeOrderData.change_type || 'customer',
    status: 'pending',
    amount: changeOrderData.amount || 0,
    reason: changeOrderData.reason || null,
    requested_by: changeOrderData.requested_by || null,
    affects_loops: changeOrderData.affects_loops || [],
    affects_tasks: changeOrderData.affects_tasks || [],
    line_items: changeOrderData.line_items || [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('change_orders')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('[db.changeOrders] createChangeOrder error:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Update a change order
 */
export async function updateChangeOrder(changeOrderId, updates) {
  const { data, error } = await supabase
    .from('change_orders')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', changeOrderId)
    .select()
    .single();

  if (error) {
    console.error('[db.changeOrders] updateChangeOrder error:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Delete a change order (only if pending)
 */
export async function deleteChangeOrder(changeOrderId) {
  // Only allow deletion of pending change orders
  const { data: current } = await getChangeOrder(changeOrderId);
  if (current && current.status !== 'pending') {
    return {
      data: null,
      error: { message: 'Can only delete pending change orders' },
    };
  }

  const { data, error } = await supabase
    .from('change_orders')
    .delete()
    .eq('id', changeOrderId)
    .select()
    .single();

  if (error) {
    console.error('[db.changeOrders] deleteChangeOrder error:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Approve a change order
 */
export async function approveChangeOrder(changeOrderId, approvedBy = null) {
  return updateChangeOrder(changeOrderId, {
    status: 'approved',
    approved_by: approvedBy,
    approved_at: new Date().toISOString(),
  });
}

/**
 * Reject a change order
 */
export async function rejectChangeOrder(changeOrderId, rejectedBy = null, reason = null) {
  return updateChangeOrder(changeOrderId, {
    status: 'rejected',
    rejected_by: rejectedBy,
    rejected_at: new Date().toISOString(),
    rejection_reason: reason,
  });
}

/**
 * Get pending change orders for a project
 */
export async function getPendingChangeOrders(projectId) {
  const { data, error } = await supabase
    .from('change_orders')
    .select('*')
    .eq('project_id', projectId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    if (error.code === '42P01') {
      return { data: [], error: null };
    }
    console.error('[db.changeOrders] getPendingChangeOrders error:', error);
    return { data: [], error };
  }

  return { data: data || [], error: null };
}

/**
 * Get approved change orders for a project
 */
export async function getApprovedChangeOrders(projectId) {
  const { data, error } = await supabase
    .from('change_orders')
    .select('*')
    .eq('project_id', projectId)
    .eq('status', 'approved')
    .order('approved_at', { ascending: false });

  if (error) {
    if (error.code === '42P01') {
      return { data: [], error: null };
    }
    console.error('[db.changeOrders] getApprovedChangeOrders error:', error);
    return { data: [], error };
  }

  return { data: data || [], error: null };
}

/**
 * Calculate change order totals for a project
 */
export async function getChangeOrderTotals(projectId) {
  const { data, error } = await getChangeOrders(projectId);

  if (error) {
    return { data: null, error };
  }

  const totals = {
    total_count: data.length,
    pending_count: 0,
    approved_count: 0,
    rejected_count: 0,
    pending_amount: 0,
    approved_amount: 0,
    rejected_amount: 0,
    net_approved_amount: 0,
    by_type: {
      customer: { count: 0, amount: 0 },
      contractor: { count: 0, amount: 0 },
      no_cost: { count: 0, amount: 0 },
    },
  };

  data.forEach(co => {
    const amount = co.amount || 0;
    const type = co.change_type || 'customer';

    switch (co.status) {
      case 'pending':
        totals.pending_count++;
        totals.pending_amount += amount;
        break;
      case 'approved':
        totals.approved_count++;
        totals.approved_amount += amount;
        totals.net_approved_amount += amount;
        break;
      case 'rejected':
        totals.rejected_count++;
        totals.rejected_amount += amount;
        break;
    }

    if (totals.by_type[type]) {
      totals.by_type[type].count++;
      if (co.status === 'approved') {
        totals.by_type[type].amount += amount;
      }
    }
  });

  return { data: totals, error: null };
}

/**
 * Get change orders affecting a specific loop
 */
export async function getLoopChangeOrders(loopId) {
  const { data, error } = await supabase
    .from('change_orders')
    .select('*')
    .contains('affects_loops', [loopId])
    .order('created_at', { ascending: false });

  if (error) {
    if (error.code === '42P01') {
      return { data: [], error: null };
    }
    console.error('[db.changeOrders] getLoopChangeOrders error:', error);
    return { data: [], error };
  }

  return { data: data || [], error: null };
}

/**
 * Check if a loop can be modified (based on project phase and pending COs)
 */
export async function canModifyLoop(projectId, loopId) {
  // Get project to check phase
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('phase')
    .eq('id', projectId)
    .single();

  if (projectError) {
    return { canModify: false, reason: 'Could not check project phase' };
  }

  // Check if phase allows direct edits
  const lockedPhases = ['contract', 'active', 'complete', 'maintained'];
  if (!lockedPhases.includes(project.phase)) {
    return { canModify: true, reason: null };
  }

  // Check for approved change order affecting this loop
  const { data: approvedCOs } = await supabase
    .from('change_orders')
    .select('id')
    .eq('project_id', projectId)
    .eq('status', 'approved')
    .contains('affects_loops', [loopId])
    .limit(1);

  if (approvedCOs && approvedCOs.length > 0) {
    return { canModify: true, reason: 'Approved change order exists' };
  }

  return {
    canModify: false,
    reason: 'Project is in locked phase. Create a change order to modify.',
  };
}
