/**
 * Time Tracking API Module
 *
 * Handles time entries and clock in/out operations.
 */

import { supabase, isConfigured, generateId, now, response, handleError } from './config';

/**
 * Get the currently active time entry (if any)
 */
export async function getActiveTimeEntry() {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  try {
    const { data, error } = await supabase
      .from('time_entries')
      .select(`
        *,
        task:tasks(title, loop:loops(project:projects(name)))
      `)
      .is('end_time', null)
      .maybeSingle();

    if (error) {
      return handleError(error, 'getActiveTimeEntry');
    }

    return response(data);
  } catch (err) {
    return handleError(err, 'getActiveTimeEntry');
  }
}

/**
 * Get all time entries with optional filters
 */
export async function getTimeEntries(filters = {}) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  try {
    let query = supabase
      .from('time_entries')
      .select('*')
      .order('start_time', { ascending: false });

    if (filters.projectId) query = query.eq('project_id', filters.projectId);
    if (filters.taskId) query = query.eq('task_id', filters.taskId);
    if (filters.userId) query = query.eq('user_id', filters.userId);
    if (filters.startDate) query = query.gte('start_time', filters.startDate);
    if (filters.endDate) query = query.lte('start_time', filters.endDate);

    const { data, error } = await query;

    if (error) {
      return handleError(error, 'getTimeEntries');
    }

    return response(data || []);
  } catch (err) {
    return handleError(err, 'getTimeEntries');
  }
}

/**
 * Clock in - start a new time entry
 */
export async function clockIn(clockInData) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  const newEntry = {
    id: generateId(),
    task_id: clockInData.taskId,
    project_id: clockInData.projectId,
    user_id: clockInData.userId || null,
    category_code: clockInData.categoryCode || null,
    subcategory_code: clockInData.subcategoryCode || null,
    start_time: now(),
    end_time: null,
    duration_minutes: null,
    estimated_minutes: clockInData.estimatedMinutes || 60,
    notes: '',
    billable: true,
    created_at: now(),
    updated_at: now(),
  };

  try {
    const { data, error } = await supabase
      .from('time_entries')
      .insert(newEntry)
      .select()
      .single();

    if (error) {
      return handleError(error, 'clockIn');
    }

    return response(data);
  } catch (err) {
    return handleError(err, 'clockIn');
  }
}

/**
 * Clock out - stop the active timer
 */
export async function clockOut(entryId, options = {}) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  try {
    // Get the entry to calculate duration
    const { data: entry, error: fetchError } = await supabase
      .from('time_entries')
      .select('start_time')
      .eq('id', entryId)
      .single();

    if (fetchError || !entry) {
      return handleError(fetchError || new Error('Entry not found'), 'clockOut');
    }

    const endTime = new Date();
    const startTime = new Date(entry.start_time);
    const durationMinutes = Math.round((endTime - startTime) / 60000);

    const { data, error } = await supabase
      .from('time_entries')
      .update({
        end_time: endTime.toISOString(),
        duration_minutes: durationMinutes,
        notes: options.notes || '',
        updated_at: now(),
      })
      .eq('id', entryId)
      .select()
      .single();

    if (error) {
      return handleError(error, 'clockOut');
    }

    return response(data);
  } catch (err) {
    return handleError(err, 'clockOut');
  }
}

/**
 * Add a manual time entry
 */
export async function addManualTimeEntry(entryData) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  const newEntry = {
    id: generateId(),
    task_id: entryData.taskId || null,
    project_id: entryData.projectId,
    user_id: entryData.userId || null,
    category_code: entryData.categoryCode || null,
    subcategory_code: entryData.subcategoryCode || null,
    start_time: entryData.startTime,
    end_time: entryData.endTime,
    duration_minutes: entryData.durationMinutes,
    notes: entryData.notes || '',
    billable: entryData.billable !== false,
    created_at: now(),
    updated_at: now(),
  };

  try {
    const { data, error } = await supabase
      .from('time_entries')
      .insert(newEntry)
      .select()
      .single();

    if (error) {
      return handleError(error, 'addManualTimeEntry');
    }

    return response(data);
  } catch (err) {
    return handleError(err, 'addManualTimeEntry');
  }
}

/**
 * Update a time entry
 */
export async function updateTimeEntry(entryId, updates) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  try {
    const { data, error } = await supabase
      .from('time_entries')
      .update({
        ...updates,
        updated_at: now(),
      })
      .eq('id', entryId)
      .select()
      .single();

    if (error) {
      return handleError(error, 'updateTimeEntry');
    }

    return response(data);
  } catch (err) {
    return handleError(err, 'updateTimeEntry');
  }
}

/**
 * Delete a time entry
 */
export async function deleteTimeEntry(entryId) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  try {
    const { error } = await supabase
      .from('time_entries')
      .delete()
      .eq('id', entryId);

    if (error) {
      return handleError(error, 'deleteTimeEntry');
    }

    return response({ id: entryId, deleted: true });
  } catch (err) {
    return handleError(err, 'deleteTimeEntry');
  }
}

/**
 * Get time entries for a specific task
 */
export async function getTaskTimeEntries(taskId) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  try {
    const { data, error } = await supabase
      .from('time_entries')
      .select('*')
      .eq('task_id', taskId)
      .order('start_time', { ascending: false });

    if (error) {
      return handleError(error, 'getTaskTimeEntries');
    }

    return response(data || []);
  } catch (err) {
    return handleError(err, 'getTaskTimeEntries');
  }
}

/**
 * Get time summary for a project
 */
export async function getProjectTimeSummary(projectId) {
  const { data: entries, error } = await getTimeEntries({ projectId });

  if (error) {
    return response(null, error);
  }

  if (!entries || entries.length === 0) {
    return response({
      totalMinutes: 0,
      totalHours: 0,
      byCategory: [],
      entryCount: 0,
    });
  }

  // Group by category
  const byCategory = {};
  let totalMinutes = 0;

  entries.forEach(entry => {
    const code = entry.category_code || 'other';
    if (!byCategory[code]) {
      byCategory[code] = { code, minutes: 0, entries: 0 };
    }
    byCategory[code].minutes += entry.duration_minutes || 0;
    byCategory[code].entries += 1;
    totalMinutes += entry.duration_minutes || 0;
  });

  return response({
    totalMinutes,
    totalHours: Math.round(totalMinutes / 60 * 10) / 10,
    byCategory: Object.values(byCategory),
    entryCount: entries.length,
  });
}

/**
 * Legacy startTimer function
 */
export async function startTimer(taskId, allocatedMinutes = 60) {
  return clockIn({
    taskId,
    estimatedMinutes: allocatedMinutes,
  });
}

/**
 * Legacy stopTimer function
 */
export async function stopTimer(entryId) {
  return clockOut(entryId);
}
