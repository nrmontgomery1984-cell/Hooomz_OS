/**
 * Tasks Database Service
 *
 * All task CRUD operations via Supabase.
 * Tasks are individual work items within a loop.
 */

import { supabase } from '../supabase';
import { TASK_STATUSES } from '../../lib/constants';
import { recalculateLoopStatus } from './loops';

/**
 * Get all tasks for a loop
 */
export async function getTasks(loopId) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('loop_id', loopId)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('[db.tasks] getTasks error:', error);
    return { data: [], error };
  }

  return { data: data || [], error: null };
}

/**
 * Get a single task by ID
 */
export async function getTask(taskId) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single();

  if (error) {
    console.error('[db.tasks] getTask error:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Create a new task
 */
export async function createTask(taskData) {
  const insertData = {
    loop_id: taskData.loop_id,
    title: taskData.title,
    description: taskData.description || null,
    status: taskData.status || 'pending',
    priority: taskData.priority || 2,
    category_code: taskData.category_code || null,
    subcategory_code: taskData.subcategory_code || null,
    location: taskData.location || null,
    display_order: taskData.display_order || 0,
    source: taskData.source || 'manual',
    budgeted_amount: taskData.budgeted_amount || null,
    quantity: taskData.quantity || null,
    unit: taskData.unit || null,
    scope_item_id: taskData.scope_item_id || null,
    estimated_hours: taskData.estimated_hours || null,
    due_date: taskData.due_date || null,
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
    .from('tasks')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('[db.tasks] createTask error:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Update a task
 */
export async function updateTask(taskId, updates) {
  // Get current task to check if status is changing
  const { data: currentTask } = await getTask(taskId);

  const { data, error } = await supabase
    .from('tasks')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
      // Set completed_at if status is changing to complete
      ...(updates.status === 'complete' && currentTask?.status !== 'complete'
        ? { completed_at: new Date().toISOString() }
        : {}),
    })
    .eq('id', taskId)
    .select()
    .single();

  if (error) {
    console.error('[db.tasks] updateTask error:', error);
    return { data: null, error };
  }

  // If status changed, recalculate loop status
  if (updates.status && currentTask && updates.status !== currentTask.status) {
    await recalculateLoopStatus(currentTask.loop_id);
  }

  return { data, error: null };
}

/**
 * Update task status
 */
export async function updateTaskStatus(taskId, status) {
  return updateTask(taskId, { status });
}

/**
 * Delete a task
 */
export async function deleteTask(taskId) {
  // Get task first to know the loop
  const { data: task } = await getTask(taskId);

  const { data, error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
    .select()
    .single();

  if (error) {
    console.error('[db.tasks] deleteTask error:', error);
    return { data: null, error };
  }

  // Recalculate loop status after deletion
  if (task?.loop_id) {
    await recalculateLoopStatus(task.loop_id);
  }

  return { data, error: null };
}

/**
 * Get all tasks for a project (across all loops)
 */
export async function getProjectTasks(projectId) {
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      loops!inner(project_id)
    `)
    .eq('loops.project_id', projectId)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('[db.tasks] getProjectTasks error:', error);
    return { data: [], error };
  }

  return { data: data || [], error: null };
}

/**
 * Create multiple tasks at once (for intake/estimate generation)
 */
export async function createTasksBatch(tasksData) {
  const preparedTasks = tasksData.map(task => ({
    loop_id: task.loop_id,
    title: task.title,
    description: task.description || null,
    status: task.status || 'pending',
    priority: task.priority || 2,
    category_code: task.category_code || null,
    subcategory_code: task.subcategory_code || null,
    location: task.location || null,
    display_order: task.display_order || 0,
    source: task.source || 'manual',
    budgeted_amount: task.budgeted_amount || null,
    quantity: task.quantity || null,
    unit: task.unit || null,
    scope_item_id: task.scope_item_id || null,
    estimated_hours: task.estimated_hours || null,
    due_date: task.due_date || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  const { data, error } = await supabase
    .from('tasks')
    .insert(preparedTasks)
    .select();

  if (error) {
    console.error('[db.tasks] createTasksBatch error:', error);
    return { data: [], error };
  }

  return { data: data || [], error: null };
}

/**
 * Get task notes
 */
export async function getTaskNotes(taskId) {
  const { data, error } = await supabase
    .from('task_notes')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: false });

  if (error) {
    // Table might not exist yet
    if (error.code === '42P01') {
      return { data: [], error: null };
    }
    console.error('[db.tasks] getTaskNotes error:', error);
    return { data: [], error };
  }

  return { data: data || [], error: null };
}

/**
 * Add a note to a task
 */
export async function addTaskNote(taskId, note) {
  const { data, error } = await supabase
    .from('task_notes')
    .insert({
      task_id: taskId,
      content: note.content,
      author_name: note.author_name,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('[db.tasks] addTaskNote error:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Get task photos
 */
export async function getTaskPhotos(taskId) {
  const { data, error } = await supabase
    .from('files')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[db.tasks] getTaskPhotos error:', error);
    return { data: [], error };
  }

  return { data: data || [], error: null };
}
