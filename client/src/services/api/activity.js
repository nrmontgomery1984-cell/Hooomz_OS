/**
 * Activity Log API Module
 *
 * Handles activity logging and retrieval.
 * Activity log is immutable - entries are never updated, only created.
 */

import { supabase, isConfigured, generateId, now, response, handleError } from './config';

/**
 * Get activity log for a project
 */
export async function getProjectActivity(projectId, limit = 20) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  try {
    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return handleError(error, 'getProjectActivity');
    }

    return response(data || []);
  } catch (err) {
    return handleError(err, 'getProjectActivity');
  }
}

/**
 * Get recent activity across all projects
 */
export async function getRecentActivity(limit = 50) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  try {
    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return handleError(error, 'getRecentActivity');
    }

    return response(data || []);
  } catch (err) {
    return handleError(err, 'getRecentActivity');
  }
}

/**
 * Create an activity log entry
 *
 * @param {Object} entry - The activity entry
 * @param {string} entry.event_type - Type of event (e.g., 'task.completed', 'note.added')
 * @param {Object} entry.event_data - Event-specific data
 * @param {string} [entry.project_id] - Associated project ID
 * @param {string} [entry.loop_id] - Associated loop ID
 * @param {string} [entry.task_id] - Associated task ID
 * @param {string} [entry.actor_id] - ID of person performing action
 * @param {string} [entry.actor_name] - Name of person performing action
 * @param {string} [entry.category_code] - Work category code
 * @param {string} [entry.subcategory_code] - Subcategory code
 */
export async function createActivityEntry(entry) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  const newEntry = {
    id: generateId(),
    event_type: entry.event_type,
    event_data: entry.event_data || {},
    project_id: entry.project_id || null,
    loop_id: entry.loop_id || null,
    task_id: entry.task_id || null,
    actor_id: entry.actor_id || null,
    actor_name: entry.actor_name || 'System',
    category_code: entry.category_code || null,
    subcategory_code: entry.subcategory_code || null,
  };

  try {
    const { data, error } = await supabase
      .from('activity_log')
      .insert(newEntry)
      .select()
      .single();

    if (error) {
      return handleError(error, 'createActivityEntry');
    }

    return response(data);
  } catch (err) {
    return handleError(err, 'createActivityEntry');
  }
}

/**
 * Get activity by type for a project
 */
export async function getActivityByType(projectId, eventType, limit = 20) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  try {
    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .eq('project_id', projectId)
      .eq('event_type', eventType)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return handleError(error, 'getActivityByType');
    }

    return response(data || []);
  } catch (err) {
    return handleError(err, 'getActivityByType');
  }
}

/**
 * Get activity for a specific loop
 */
export async function getLoopActivity(loopId, limit = 20) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  try {
    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .eq('loop_id', loopId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return handleError(error, 'getLoopActivity');
    }

    return response(data || []);
  } catch (err) {
    return handleError(err, 'getLoopActivity');
  }
}

/**
 * Get activity for a specific task
 */
export async function getTaskActivity(taskId, limit = 20) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  try {
    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return handleError(error, 'getTaskActivity');
    }

    return response(data || []);
  } catch (err) {
    return handleError(err, 'getTaskActivity');
  }
}
