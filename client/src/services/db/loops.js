/**
 * Loops Database Service
 *
 * All loop CRUD operations via Supabase.
 * Loops are trade-based groupings of tasks within a project.
 */

import { supabase } from '../supabase';
import { getTrade, TRADE_ORDER, sortLoopsByTradeOrder } from '../../lib/constants';

/**
 * Get all loops for a project
 */
export async function getLoops(projectId) {
  const { data, error } = await supabase
    .from('loops')
    .select('*')
    .eq('project_id', projectId)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('[db.loops] getLoops error:', error);
    return { data: [], error };
  }

  // Sort by trade order as fallback
  const sorted = sortLoopsByTradeOrder(data || []);

  return { data: sorted, error: null };
}

/**
 * Get a single loop by ID
 */
export async function getLoop(loopId) {
  const { data, error } = await supabase
    .from('loops')
    .select('*')
    .eq('id', loopId)
    .single();

  if (error) {
    console.error('[db.loops] getLoop error:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Create a new loop
 */
export async function createLoop(loopData) {
  // Ensure we have trade info
  const trade = getTrade(loopData.category_code || loopData.trade_code);

  const insertData = {
    project_id: loopData.project_id,
    name: loopData.name || trade.name,
    loop_type: loopData.loop_type || 'trade',
    category_code: loopData.category_code || loopData.trade_code,
    status: loopData.status || 'pending',
    display_order: loopData.display_order || trade.order,
    source: loopData.source || 'manual',
    health_score: loopData.health_score ?? 0,
    health_color: loopData.health_color || 'gray',
    task_count: loopData.task_count || 0,
    budgeted_amount: loopData.budgeted_amount || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Remove undefined values
  Object.keys(insertData).forEach(key => {
    if (insertData[key] === undefined) {
      delete insertData[key];
    }
  });

  const { data, error } = await supabase
    .from('loops')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('[db.loops] createLoop error:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Update a loop
 */
export async function updateLoop(loopId, updates) {
  const { data, error } = await supabase
    .from('loops')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', loopId)
    .select()
    .single();

  if (error) {
    console.error('[db.loops] updateLoop error:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Delete a loop and all its tasks
 */
export async function deleteLoop(loopId) {
  // Tasks will be cascade deleted by database
  const { data, error } = await supabase
    .from('loops')
    .delete()
    .eq('id', loopId)
    .select()
    .single();

  if (error) {
    console.error('[db.loops] deleteLoop error:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Update loop status based on task completion
 */
export async function recalculateLoopStatus(loopId) {
  // Get all tasks for this loop
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('status')
    .eq('loop_id', loopId);

  if (tasksError) {
    console.error('[db.loops] recalculateLoopStatus error:', tasksError);
    return { data: null, error: tasksError };
  }

  if (!tasks || tasks.length === 0) {
    return updateLoop(loopId, {
      status: 'pending',
      health_score: 0,
      health_color: 'gray',
    });
  }

  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'complete').length;
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;
  const blocked = tasks.filter(t => t.status === 'blocked').length;

  // Calculate status
  let status = 'pending';
  if (completed === total) {
    status = 'complete';
  } else if (blocked > 0) {
    status = 'blocked';
  } else if (inProgress > 0 || completed > 0) {
    status = 'in_progress';
  }

  // Calculate health score (0-100)
  const healthScore = Math.round((completed / total) * 100);

  // Determine health color
  let healthColor = 'gray';
  if (status === 'complete') {
    healthColor = 'gray';
  } else if (healthScore >= 70) {
    healthColor = 'green';
  } else if (healthScore >= 40) {
    healthColor = 'yellow';
  } else if (inProgress > 0 || completed > 0) {
    healthColor = 'yellow';
  }

  if (blocked > 0) {
    healthColor = 'red';
  }

  return updateLoop(loopId, {
    status,
    health_score: healthScore,
    health_color: healthColor,
    task_count: total,
  });
}

/**
 * Delete all loops for a project
 */
export async function deleteProjectLoops(projectId) {
  const { data, error } = await supabase
    .from('loops')
    .delete()
    .eq('project_id', projectId)
    .select();

  if (error) {
    console.error('[db.loops] deleteProjectLoops error:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Create multiple loops at once (for intake/estimate generation)
 */
export async function createLoopsBatch(loopsData) {
  const preparedLoops = loopsData.map(loop => {
    const trade = getTrade(loop.category_code || loop.trade_code);
    return {
      project_id: loop.project_id,
      name: loop.name || trade.name,
      loop_type: loop.loop_type || 'trade',
      category_code: loop.category_code || loop.trade_code,
      status: loop.status || 'pending',
      display_order: loop.display_order || trade.order,
      source: loop.source || 'manual',
      health_score: loop.health_score ?? 0,
      health_color: loop.health_color || 'gray',
      task_count: loop.task_count || 0,
      budgeted_amount: loop.budgeted_amount || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  });

  const { data, error } = await supabase
    .from('loops')
    .insert(preparedLoops)
    .select();

  if (error) {
    console.error('[db.loops] createLoopsBatch error:', error);
    return { data: [], error };
  }

  return { data: data || [], error: null };
}
