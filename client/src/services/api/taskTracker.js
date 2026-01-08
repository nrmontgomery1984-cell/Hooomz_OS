/**
 * Task Tracker API Module
 *
 * Handles the three-axis task tracking model:
 * - Axis 1: Work Categories (trades)
 * - Axis 2: Construction Stages
 * - Axis 3: Locations
 */

import { supabase, isConfigured, generateId, now, response, handleError } from './config';

/**
 * Work categories (Axis 1)
 */
export const WORK_CATEGORIES = [
  { code: 'SW', name: 'Site Work', color: '#78350F' },
  { code: 'FN', name: 'Foundation', color: '#1E3A8A' },
  { code: 'FS', name: 'Structural Framing', color: '#92400E' },
  { code: 'FI', name: 'Interior Framing', color: '#B45309' },
  { code: 'RF', name: 'Roofing', color: '#7C3AED' },
  { code: 'EE', name: 'Exterior Envelope', color: '#059669' },
  { code: 'IA', name: 'Insulation & Air Sealing', color: '#EC4899' },
  { code: 'EL', name: 'Electrical', color: '#F59E0B' },
  { code: 'PL', name: 'Plumbing', color: '#3B82F6' },
  { code: 'HV', name: 'HVAC', color: '#10B981' },
  { code: 'DW', name: 'Drywall', color: '#9CA3AF' },
  { code: 'PT', name: 'Painting', color: '#EC4899' },
  { code: 'FL', name: 'Flooring', color: '#8B5CF6' },
  { code: 'TL', name: 'Tile', color: '#14B8A6' },
  { code: 'FC', name: 'Finish Carpentry', color: '#B45309' },
  { code: 'CM', name: 'Cabinetry & Millwork', color: '#92400E' },
  { code: 'SR', name: 'Stairs & Railings', color: '#6B7280' },
  { code: 'EF', name: 'Exterior Finishes', color: '#059669' },
  { code: 'FZ', name: 'Final Completion', color: '#22C55E' },
  { code: 'DM', name: 'Demo & Prep', color: '#EF4444' },
  { code: 'GN', name: 'General', color: '#6B7280' },
];

/**
 * Construction stages (Axis 2)
 */
export const STAGES = [
  { code: 'ST-DM', name: 'Demo', order: 1 },
  { code: 'ST-FR', name: 'Framing', order: 2 },
  { code: 'ST-RI', name: 'Rough-In', order: 3 },
  { code: 'ST-IN', name: 'Inspection', order: 4 },
  { code: 'ST-FN', name: 'Finishes', order: 5 },
  { code: 'ST-FX', name: 'Fixtures', order: 6 },
  { code: 'ST-PU', name: 'Punch List', order: 7 },
];

/**
 * Project phases
 */
export const PHASES = [
  { code: 'PH-PRE', name: 'Pre-Construction', order: 1 },
  { code: 'PH-FND', name: 'Foundation', order: 2 },
  { code: 'PH-FRM', name: 'Framing', order: 3 },
  { code: 'PH-MEP', name: 'Mechanical/Electrical/Plumbing', order: 4 },
  { code: 'PH-FIN', name: 'Finishes', order: 5 },
  { code: 'PH-CLO', name: 'Closeout', order: 6 },
];

// =============================================================================
// CATEGORIES & STAGES
// =============================================================================

/**
 * Get all work categories
 */
export async function getWorkCategories() {
  return response(WORK_CATEGORIES);
}

/**
 * Get subcategories for a work category
 */
export async function getWorkSubcategories(categoryCode = null) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  try {
    let query = supabase
      .from('work_subcategories')
      .select('*')
      .order('display_order', { ascending: true });

    if (categoryCode) {
      query = query.eq('category_code', categoryCode);
    }

    const { data, error } = await query;

    if (error) {
      return handleError(error, 'getWorkSubcategories');
    }

    return response(data || []);
  } catch (err) {
    return handleError(err, 'getWorkSubcategories');
  }
}

/**
 * Get all construction stages
 */
export async function getStages() {
  return response(STAGES);
}

/**
 * Get all phases
 */
export async function getPhases() {
  return response(PHASES);
}

// =============================================================================
// LOCATIONS (Axis 3)
// =============================================================================

/**
 * Get locations for a project
 */
export async function getProjectLocations(projectId) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  try {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('project_id', projectId)
      .order('display_order', { ascending: true });

    if (error) {
      return handleError(error, 'getProjectLocations');
    }

    return response(data || []);
  } catch (err) {
    return handleError(err, 'getProjectLocations');
  }
}

/**
 * Create a location
 */
export async function createLocation(locationData) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  const newLocation = {
    id: generateId(),
    project_id: locationData.projectId,
    parent_id: locationData.parentId || null,
    name: locationData.name,
    location_type: locationData.locationType || 'room',
    path: locationData.path || locationData.name,
    display_order: locationData.displayOrder || 0,
    created_at: now(),
    updated_at: now(),
  };

  try {
    const { data, error } = await supabase
      .from('locations')
      .insert(newLocation)
      .select()
      .single();

    if (error) {
      return handleError(error, 'createLocation');
    }

    return response(data);
  } catch (err) {
    return handleError(err, 'createLocation');
  }
}

// =============================================================================
// TASK INSTANCES
// =============================================================================

/**
 * Get task instances for a project with filters
 */
export async function getTaskInstances(projectId, filters = {}) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  try {
    let query = supabase
      .from('task_instances')
      .select('*')
      .eq('project_id', projectId);

    if (filters.categoryCode) query = query.eq('category_code', filters.categoryCode);
    if (filters.stageCode) query = query.eq('stage_code', filters.stageCode);
    if (filters.locationId) query = query.eq('location_id', filters.locationId);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.assignedTo) query = query.eq('assigned_to', filters.assignedTo);

    const { data, error } = await query.order('priority', { ascending: true });

    if (error) {
      return handleError(error, 'getTaskInstances');
    }

    return response(data || []);
  } catch (err) {
    return handleError(err, 'getTaskInstances');
  }
}

/**
 * Get a single task instance
 */
export async function getTaskInstance(instanceId) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  try {
    const { data, error } = await supabase
      .from('task_instances')
      .select('*')
      .eq('id', instanceId)
      .single();

    if (error) {
      return handleError(error, 'getTaskInstance');
    }

    return response(data);
  } catch (err) {
    return handleError(err, 'getTaskInstance');
  }
}

/**
 * Create a task instance
 */
export async function createTaskInstance(projectId, taskData) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  const newInstance = {
    id: generateId(),
    project_id: projectId,
    template_id: taskData.templateId || null,
    category_code: taskData.categoryCode,
    subcategory_code: taskData.subcategoryCode || null,
    stage_code: taskData.stageCode || 'ST-RI',
    location_id: taskData.locationId || null,
    location_path: taskData.locationPath || null,
    name: taskData.name,
    description: taskData.description || null,
    status: taskData.status || 'pending',
    priority: taskData.priority || 2,
    assigned_to: taskData.assignedTo || null,
    due_date: taskData.dueDate || null,
    estimated_hours: taskData.estimatedHours || null,
    actual_hours: taskData.actualHours || null,
    source: taskData.source || null,
    created_at: now(),
    updated_at: now(),
  };

  try {
    const { data, error } = await supabase
      .from('task_instances')
      .insert(newInstance)
      .select()
      .single();

    if (error) {
      return handleError(error, 'createTaskInstance');
    }

    return response(data);
  } catch (err) {
    return handleError(err, 'createTaskInstance');
  }
}

/**
 * Update a task instance
 */
export async function updateTaskInstance(instanceId, updates) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  const dbUpdates = {
    updated_at: now(),
  };

  if (updates.categoryCode !== undefined) dbUpdates.category_code = updates.categoryCode;
  if (updates.subcategoryCode !== undefined) dbUpdates.subcategory_code = updates.subcategoryCode;
  if (updates.stageCode !== undefined) dbUpdates.stage_code = updates.stageCode;
  if (updates.locationId !== undefined) dbUpdates.location_id = updates.locationId;
  if (updates.locationPath !== undefined) dbUpdates.location_path = updates.locationPath;
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
  if (updates.assignedTo !== undefined) dbUpdates.assigned_to = updates.assignedTo;
  if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
  if (updates.estimatedHours !== undefined) dbUpdates.estimated_hours = updates.estimatedHours;
  if (updates.actualHours !== undefined) dbUpdates.actual_hours = updates.actualHours;

  try {
    const { data, error } = await supabase
      .from('task_instances')
      .update(dbUpdates)
      .eq('id', instanceId)
      .select()
      .single();

    if (error) {
      return handleError(error, 'updateTaskInstance');
    }

    return response(data);
  } catch (err) {
    return handleError(err, 'updateTaskInstance');
  }
}

/**
 * Delete a task instance
 */
export async function deleteTaskInstance(instanceId) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  try {
    const { error } = await supabase
      .from('task_instances')
      .delete()
      .eq('id', instanceId);

    if (error) {
      return handleError(error, 'deleteTaskInstance');
    }

    return response({ id: instanceId, deleted: true });
  } catch (err) {
    return handleError(err, 'deleteTaskInstance');
  }
}

// =============================================================================
// TASK TEMPLATES
// =============================================================================

/**
 * Get task templates for a project
 */
export async function getTaskTemplates(projectId) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  try {
    const { data, error } = await supabase
      .from('task_templates')
      .select('*')
      .eq('project_id', projectId)
      .order('stage_order', { ascending: true });

    if (error) {
      return handleError(error, 'getTaskTemplates');
    }

    return response(data || []);
  } catch (err) {
    return handleError(err, 'getTaskTemplates');
  }
}

// =============================================================================
// CONTACTS
// =============================================================================

/**
 * Get all contacts
 */
export async function getContacts() {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      return handleError(error, 'getContacts');
    }

    return response(data || []);
  } catch (err) {
    return handleError(err, 'getContacts');
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Group tasks by category
 */
export function groupTasksByCategory(instances, categories = WORK_CATEGORIES) {
  const groups = {};

  categories.forEach(cat => {
    groups[cat.code] = {
      ...cat,
      tasks: [],
      stats: { total: 0, pending: 0, inProgress: 0, completed: 0 },
    };
  });

  instances.forEach(task => {
    const code = task.category_code || task.categoryCode || 'GN';
    if (!groups[code]) {
      groups[code] = {
        code,
        name: code,
        color: '#6B7280',
        tasks: [],
        stats: { total: 0, pending: 0, inProgress: 0, completed: 0 },
      };
    }

    groups[code].tasks.push(task);
    groups[code].stats.total++;

    const status = task.status;
    if (status === 'completed' || status === 'complete') {
      groups[code].stats.completed++;
    } else if (status === 'in_progress') {
      groups[code].stats.inProgress++;
    } else {
      groups[code].stats.pending++;
    }
  });

  return groups;
}

/**
 * Group tasks by stage
 */
export function groupTasksByStage(instances, stages = STAGES) {
  const groups = {};

  stages.forEach(stage => {
    groups[stage.code] = {
      ...stage,
      tasks: [],
      stats: { total: 0, pending: 0, inProgress: 0, completed: 0 },
    };
  });

  instances.forEach(task => {
    const code = task.stage_code || task.stageCode || 'ST-RI';
    if (!groups[code]) {
      groups[code] = {
        code,
        name: code,
        order: 99,
        tasks: [],
        stats: { total: 0, pending: 0, inProgress: 0, completed: 0 },
      };
    }

    groups[code].tasks.push(task);
    groups[code].stats.total++;

    const status = task.status;
    if (status === 'completed' || status === 'complete') {
      groups[code].stats.completed++;
    } else if (status === 'in_progress') {
      groups[code].stats.inProgress++;
    } else {
      groups[code].stats.pending++;
    }
  });

  return groups;
}

/**
 * Group tasks by subcategory
 */
export function groupTasksBySubcategory(instances, subcategories = []) {
  const groups = {};

  subcategories.forEach(sub => {
    groups[sub.code] = {
      ...sub,
      tasks: [],
      stats: { total: 0, pending: 0, inProgress: 0, completed: 0 },
    };
  });

  instances.forEach(task => {
    const code = task.subcategory_code || task.subcategoryCode;
    if (!code) return;

    if (!groups[code]) {
      groups[code] = {
        code,
        name: code,
        tasks: [],
        stats: { total: 0, pending: 0, inProgress: 0, completed: 0 },
      };
    }

    groups[code].tasks.push(task);
    groups[code].stats.total++;

    const status = task.status;
    if (status === 'completed' || status === 'complete') {
      groups[code].stats.completed++;
    } else if (status === 'in_progress') {
      groups[code].stats.inProgress++;
    } else {
      groups[code].stats.pending++;
    }
  });

  return groups;
}
