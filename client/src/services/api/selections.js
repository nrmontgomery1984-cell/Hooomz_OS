/**
 * Material Selections API Module
 *
 * Handles material selection CRUD operations.
 * Selections track materials chosen for a project.
 */

import { supabase, isConfigured, generateId, now, response, handleError } from './config';

/**
 * Selection categories
 */
export const SELECTION_CATEGORIES = {
  PL: { code: 'PL', name: 'Plumbing', icon: '🚿' },
  EL: { code: 'EL', name: 'Electrical', icon: '💡' },
  FL: { code: 'FL', name: 'Flooring', icon: '🪵' },
  TL: { code: 'TL', name: 'Tile', icon: '🔲' },
  CB: { code: 'CB', name: 'Cabinetry', icon: '🗄️' },
  CT: { code: 'CT', name: 'Countertops', icon: '🪨' },
  FC: { code: 'FC', name: 'Finish Carpentry', icon: '🚪' },
  HW: { code: 'HW', name: 'Hardware', icon: '🔩' },
  AP: { code: 'AP', name: 'Appliances', icon: '🍳' },
  PT: { code: 'PT', name: 'Paint', icon: '🎨' },
};

/**
 * Selection statuses
 */
export const SELECTION_STATUSES = [
  { code: 'pending', name: 'Pending Selection', color: 'gray' },
  { code: 'selected', name: 'Selected', color: 'blue' },
  { code: 'ordered', name: 'Ordered', color: 'yellow' },
  { code: 'shipped', name: 'Shipped', color: 'orange' },
  { code: 'delivered', name: 'Delivered', color: 'green' },
  { code: 'installed', name: 'Installed', color: 'emerald' },
];

/**
 * Get all material selections for a project
 */
export async function getSelections(projectId, filters = {}) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  try {
    let query = supabase
      .from('material_selections')
      .select('*')
      .eq('project_id', projectId);

    if (filters.categoryCode) query = query.eq('category_code', filters.categoryCode);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.roomId) query = query.eq('room_id', filters.roomId);

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return handleError(error, 'getSelections');
    }

    return response(data || []);
  } catch (err) {
    return handleError(err, 'getSelections');
  }
}

/**
 * Get a single material selection by ID
 */
export async function getSelection(selectionId) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  try {
    const { data, error } = await supabase
      .from('material_selections')
      .select('*')
      .eq('id', selectionId)
      .single();

    if (error) {
      return handleError(error, 'getSelection');
    }

    return response(data);
  } catch (err) {
    return handleError(err, 'getSelection');
  }
}

/**
 * Create a new material selection
 */
export async function createSelection(projectId, selectionData) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  const newSelection = {
    id: generateId(),
    project_id: projectId,
    category_code: selectionData.categoryCode,
    subcategory_code: selectionData.subcategoryCode || null,
    trade_code: selectionData.tradeCode || null,
    room_id: selectionData.roomId || null,
    phase_code: selectionData.phaseCode || null,
    item_name: selectionData.itemName,
    description: selectionData.description || null,
    manufacturer: selectionData.manufacturer || null,
    model_number: selectionData.modelNumber || null,
    color: selectionData.color || null,
    finish: selectionData.finish || null,
    quantity: selectionData.quantity || 1,
    unit_of_measurement: selectionData.unitOfMeasurement || 'each',
    cost_per_unit: selectionData.costPerUnit || null,
    allowance_amount: selectionData.allowanceAmount || null,
    supplier_url: selectionData.supplierUrl || null,
    lead_time_days: selectionData.leadTimeDays || null,
    status: selectionData.status || 'pending',
    notes: selectionData.notes || null,
    created_at: now(),
    updated_at: now(),
  };

  try {
    const { data, error } = await supabase
      .from('material_selections')
      .insert(newSelection)
      .select()
      .single();

    if (error) {
      return handleError(error, 'createSelection');
    }

    return response(data);
  } catch (err) {
    return handleError(err, 'createSelection');
  }
}

/**
 * Update a material selection
 */
export async function updateSelection(selectionId, updates) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  // Transform camelCase to snake_case for DB
  const dbUpdates = {};
  if (updates.categoryCode !== undefined) dbUpdates.category_code = updates.categoryCode;
  if (updates.subcategoryCode !== undefined) dbUpdates.subcategory_code = updates.subcategoryCode;
  if (updates.tradeCode !== undefined) dbUpdates.trade_code = updates.tradeCode;
  if (updates.roomId !== undefined) dbUpdates.room_id = updates.roomId;
  if (updates.phaseCode !== undefined) dbUpdates.phase_code = updates.phaseCode;
  if (updates.itemName !== undefined) dbUpdates.item_name = updates.itemName;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.manufacturer !== undefined) dbUpdates.manufacturer = updates.manufacturer;
  if (updates.modelNumber !== undefined) dbUpdates.model_number = updates.modelNumber;
  if (updates.color !== undefined) dbUpdates.color = updates.color;
  if (updates.finish !== undefined) dbUpdates.finish = updates.finish;
  if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
  if (updates.unitOfMeasurement !== undefined) dbUpdates.unit_of_measurement = updates.unitOfMeasurement;
  if (updates.costPerUnit !== undefined) dbUpdates.cost_per_unit = updates.costPerUnit;
  if (updates.allowanceAmount !== undefined) dbUpdates.allowance_amount = updates.allowanceAmount;
  if (updates.supplierUrl !== undefined) dbUpdates.supplier_url = updates.supplierUrl;
  if (updates.leadTimeDays !== undefined) dbUpdates.lead_time_days = updates.leadTimeDays;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

  dbUpdates.updated_at = now();

  try {
    const { data, error } = await supabase
      .from('material_selections')
      .update(dbUpdates)
      .eq('id', selectionId)
      .select()
      .single();

    if (error) {
      return handleError(error, 'updateSelection');
    }

    return response(data);
  } catch (err) {
    return handleError(err, 'updateSelection');
  }
}

/**
 * Delete a material selection
 */
export async function deleteSelection(selectionId) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  try {
    const { error } = await supabase
      .from('material_selections')
      .delete()
      .eq('id', selectionId);

    if (error) {
      return handleError(error, 'deleteSelection');
    }

    return response({ id: selectionId, deleted: true });
  } catch (err) {
    return handleError(err, 'deleteSelection');
  }
}

/**
 * Update selection status
 */
export async function updateSelectionStatus(selectionId, newStatus) {
  return updateSelection(selectionId, { status: newStatus });
}

/**
 * Selection phases
 */
export const SELECTION_PHASES = [
  { code: 'preconstruction', name: 'Pre-Construction' },
  { code: 'rough', name: 'Rough-In' },
  { code: 'finish', name: 'Finish' },
  { code: 'final', name: 'Final' },
];

/**
 * Selection trades (who installs)
 */
export const SELECTION_TRADES = [
  { code: 'PL', name: 'Plumber' },
  { code: 'EL', name: 'Electrician' },
  { code: 'FL', name: 'Flooring Installer' },
  { code: 'TL', name: 'Tile Setter' },
  { code: 'CB', name: 'Cabinet Installer' },
  { code: 'CT', name: 'Countertop Fabricator' },
  { code: 'FC', name: 'Finish Carpenter' },
  { code: 'PT', name: 'Painter' },
  { code: 'GC', name: 'General Contractor' },
];

/**
 * Get selection reference data
 */
export function getSelectionReferenceData() {
  return {
    categories: Object.values(SELECTION_CATEGORIES),
    statuses: SELECTION_STATUSES,
    phases: SELECTION_PHASES,
    trades: SELECTION_TRADES,
  };
}

/**
 * Get rooms for a project (for selection assignment)
 * Returns locations that are room-type
 */
export async function getProjectRooms(projectId) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  try {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('project_id', projectId)
      .eq('location_type', 'room')
      .order('display_order', { ascending: true });

    if (error) {
      return handleError(error, 'getProjectRooms');
    }

    return response(data || []);
  } catch (err) {
    return handleError(err, 'getProjectRooms');
  }
}

/**
 * Get suggested selections based on project tasks
 * Returns selection suggestions based on task names/categories
 */
export async function getSuggestedSelections(projectId) {
  // This is a placeholder - in a real implementation this would
  // analyze the project's tasks and suggest relevant selections
  return response([]);
}
