/**
 * Loops API Module
 *
 * Handles loop (scope container) CRUD operations.
 * Loops group tasks by trade, area, or phase.
 */

import { supabase, isConfigured, generateId, now, response, handleError } from './config';

/**
 * Trade category display order for construction workflow
 */
const TRADE_ORDER = [
  'SW', 'FN', 'FS', 'FI', 'RF', 'EE', 'IA', 'EL', 'PL', 'HV',
  'DW', 'PT', 'FL', 'TL', 'FC', 'CM', 'SR', 'EF', 'FZ', 'DM', 'GN',
];

/**
 * Trade code to display name mapping
 */
export const TRADE_NAMES = {
  SW: 'Site Work',
  FN: 'Foundation',
  FS: 'Structural Framing',
  FI: 'Interior Framing',
  RF: 'Roofing',
  EE: 'Exterior Envelope',
  IA: 'Insulation & Air Sealing',
  EL: 'Electrical',
  PL: 'Plumbing',
  HV: 'HVAC',
  DW: 'Drywall',
  PT: 'Painting',
  FL: 'Flooring',
  TL: 'Tile',
  FC: 'Finish Carpentry',
  CM: 'Cabinetry & Millwork',
  SR: 'Stairs & Railings',
  EF: 'Exterior Finishes',
  FZ: 'Final Completion',
  DM: 'Demo & Prep',
  GN: 'General',
};

/**
 * Get loops for a project
 */
export async function getLoops(projectId) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  try {
    const { data, error } = await supabase
      .from('loops')
      .select('*')
      .eq('project_id', projectId)
      .order('display_order', { ascending: true });

    if (error) {
      return handleError(error, 'getLoops');
    }

    return response(data || []);
  } catch (err) {
    return handleError(err, 'getLoops');
  }
}

/**
 * Get a single loop by ID
 */
export async function getLoop(id) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  try {
    const { data, error } = await supabase
      .from('loops')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return handleError(error, 'getLoop');
    }

    return response(data);
  } catch (err) {
    return handleError(err, 'getLoop');
  }
}

/**
 * Create a new loop
 */
export async function createLoop(loopData) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  const newLoop = {
    id: loopData.id || generateId(),
    project_id: loopData.project_id,
    name: loopData.name,
    loop_type: loopData.loop_type || 'custom',
    category_code: loopData.category_code || null,
    status: loopData.status || 'pending',
    display_order: loopData.display_order || 0,
    source: loopData.source || null,
    health_score: loopData.health_score || 0,
    health_color: loopData.health_color || 'gray',
    budgeted_amount: loopData.budgeted_amount || null,
    task_count: loopData.task_count || 0,
    created_at: now(),
    updated_at: now(),
  };

  try {
    const { data, error } = await supabase
      .from('loops')
      .insert(newLoop)
      .select()
      .single();

    if (error) {
      return handleError(error, 'createLoop');
    }

    return response(data);
  } catch (err) {
    return handleError(err, 'createLoop');
  }
}

/**
 * Update a loop
 */
export async function updateLoop(id, updates) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  try {
    const { data, error } = await supabase
      .from('loops')
      .update({
        ...updates,
        updated_at: now(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return handleError(error, 'updateLoop');
    }

    return response(data);
  } catch (err) {
    return handleError(err, 'updateLoop');
  }
}

/**
 * Delete a loop
 */
export async function deleteLoop(id) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  try {
    const { error } = await supabase
      .from('loops')
      .delete()
      .eq('id', id);

    if (error) {
      return handleError(error, 'deleteLoop');
    }

    return response({ id, deleted: true });
  } catch (err) {
    return handleError(err, 'deleteLoop');
  }
}

/**
 * Infer trade code from category/name
 */
function inferTradeCode(item) {
  if (item.tradeCode) return item.tradeCode;

  const text = `${item.category || ''} ${item.name || ''}`.toLowerCase();
  const mappings = {
    'electrical': 'EL', 'plumbing': 'PL', 'hvac': 'HV',
    'drywall': 'DW', 'painting': 'PT', 'flooring': 'FL',
    'tile': 'TL', 'cabinet': 'CM', 'millwork': 'CM',
    'framing': 'FS', 'foundation': 'FN', 'roofing': 'RF',
    'insulation': 'IA', 'demo': 'DM', 'site': 'SW',
    'exterior': 'EF', 'finish': 'FC', 'carpentry': 'FC',
    'stair': 'SR', 'window': 'WD', 'door': 'WD',
  };

  for (const [key, code] of Object.entries(mappings)) {
    if (text.includes(key)) return code;
  }
  return 'GN';
}

/**
 * Sort trades by construction order
 */
function sortByTradeOrder(trades) {
  return trades.sort((a, b) => {
    const aIndex = TRADE_ORDER.indexOf(a);
    const bIndex = TRADE_ORDER.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
}

/**
 * Generate loops from estimate line items
 * Groups by trade category
 */
export async function generateLoopsFromEstimate(projectId, lineItems, selectedTier = 'better') {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  if (!lineItems || lineItems.length === 0) {
    return response({ loops: [], tasks: [] }, 'No line items to convert');
  }

  // Import tasks module dynamically to avoid circular dependency
  const { createTask } = await import('./tasks.js');

  // Group line items by trade code
  const tradeGroups = lineItems.reduce((acc, item) => {
    const tradeCode = inferTradeCode(item);
    if (!acc[tradeCode]) {
      acc[tradeCode] = {
        tradeName: TRADE_NAMES[tradeCode] || tradeCode,
        items: [],
      };
    }
    acc[tradeCode].items.push(item);
    return acc;
  }, {});

  const sortedTrades = sortByTradeOrder(Object.keys(tradeGroups));
  const createdLoops = [];
  const createdTasks = [];
  let loopOrder = 1;

  for (const tradeCode of sortedTrades) {
    const group = tradeGroups[tradeCode];

    // Calculate budgeted amount for this trade
    const budgetedAmount = group.items.reduce((sum, item) => {
      const tierKey = `unitPrice${selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)}`;
      return sum + ((item[tierKey] || item.unitPriceBetter || 0) * (item.quantity || 1));
    }, 0);

    const loop = {
      id: `loop-${projectId.slice(-8)}-${tradeCode}-${Date.now()}`,
      project_id: projectId,
      name: group.tradeName,
      loop_type: 'task_group',
      category_code: tradeCode,
      status: 'pending',
      display_order: loopOrder++,
      source: 'estimate',
      health_score: 0,
      health_color: 'gray',
      budgeted_amount: budgetedAmount,
      task_count: group.items.length,
    };

    const { data: createdLoop, error: loopError } = await createLoop(loop);
    if (loopError) continue;
    createdLoops.push(createdLoop || loop);

    // Create tasks for each line item
    let taskOrder = 1;
    for (const item of group.items) {
      const tierKey = `unitPrice${selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)}`;
      const amount = (item[tierKey] || item.unitPriceBetter || 0) * (item.quantity || 1);

      const taskTitle = item.roomLabel && item.roomLabel !== item.name
        ? `${item.name} - ${item.roomLabel}`
        : item.name;

      const task = {
        id: `task-${projectId.slice(-8)}-${tradeCode}-${taskOrder}-${Date.now()}`,
        loop_id: loop.id,
        title: taskTitle,
        description: item.description || null,
        status: 'pending',
        priority: 2,
        category_code: tradeCode,
        subcategory_code: item.subCode || null,
        location: item.roomLabel || null,
        display_order: taskOrder++,
        source: 'estimate',
        budgeted_amount: amount,
        quantity: item.quantity || 1,
        estimate_line_item_id: item.id,
      };

      const { data: createdTask, error: taskError } = await createTask(task);
      if (taskError) continue;
      createdTasks.push(createdTask || task);
    }
  }

  return response({ loops: createdLoops, tasks: createdTasks });
}

/**
 * Get loops for a project, generating them from scope data if needed
 * This is a convenience wrapper that returns existing loops
 */
export async function getOrGenerateLoops(projectId, project) {
  // Get existing loops
  const { data: existingLoops, error } = await getLoops(projectId);
  if (error) return { data: null, error };

  // If loops exist, return them
  if (existingLoops && existingLoops.length > 0) {
    return { data: existingLoops, error: null };
  }

  // If no loops exist, check if we can generate from estimate
  const intakeData = project?.intake_data || {};
  const lineItems = intakeData.estimate_line_items || project?.estimate_line_items;
  const buildTier = intakeData.build_tier || project?.build_tier || 'better';

  if (lineItems && lineItems.length > 0) {
    const { data: generated } = await generateLoopsFromEstimate(projectId, lineItems, buildTier);
    return { data: generated?.loops || [], error: null };
  }

  return { data: [], error: null };
}

/**
 * Calculate loop status based on its tasks
 */
export function calculateLoopStatus(tasks) {
  if (!tasks || tasks.length === 0) {
    return { status: 'pending', health_score: 0, health_color: 'gray' };
  }

  const completed = tasks.filter(t => t.status === 'completed' || t.status === 'complete').length;
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;
  const total = tasks.length;

  const health_score = Math.round((completed / total) * 100);

  let status = 'pending';
  if (completed === total) {
    status = 'completed';
  } else if (inProgress > 0 || completed > 0) {
    status = 'active';
  }

  let health_color = 'gray';
  if (health_score >= 70) {
    health_color = 'green';
  } else if (health_score >= 40) {
    health_color = 'yellow';
  } else if (health_score > 0) {
    health_color = 'red';
  }

  return { status, health_score, health_color };
}
