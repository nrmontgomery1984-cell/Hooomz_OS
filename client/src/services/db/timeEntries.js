/**
 * Time Entries Database Service
 *
 * All time tracking operations via Supabase.
 * Time entries record work done by employees on tasks.
 */

import { supabase } from '../supabase';

/**
 * Get all time entries for a task
 */
export async function getTaskTimeEntries(taskId) {
  const { data, error } = await supabase
    .from('time_entries')
    .select(`
      *,
      employees(id, name)
    `)
    .eq('task_id', taskId)
    .order('start_time', { ascending: false });

  if (error) {
    console.error('[db.timeEntries] getTaskTimeEntries error:', error);
    return { data: [], error };
  }

  return { data: data || [], error: null };
}

/**
 * Get all time entries for an employee
 */
export async function getEmployeeTimeEntries(employeeId, options = {}) {
  let query = supabase
    .from('time_entries')
    .select(`
      *,
      tasks(id, title, loop_id)
    `)
    .eq('employee_id', employeeId)
    .order('start_time', { ascending: false });

  if (options.startDate) {
    query = query.gte('start_time', options.startDate);
  }
  if (options.endDate) {
    query = query.lte('start_time', options.endDate);
  }
  if (options.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[db.timeEntries] getEmployeeTimeEntries error:', error);
    return { data: [], error };
  }

  return { data: data || [], error: null };
}

/**
 * Get all time entries for a project
 */
export async function getProjectTimeEntries(projectId, options = {}) {
  let query = supabase
    .from('time_entries')
    .select(`
      *,
      employees(id, name),
      tasks!inner(
        id,
        title,
        loops!inner(project_id)
      )
    `)
    .eq('tasks.loops.project_id', projectId)
    .order('start_time', { ascending: false });

  if (options.startDate) {
    query = query.gte('start_time', options.startDate);
  }
  if (options.endDate) {
    query = query.lte('start_time', options.endDate);
  }
  if (options.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[db.timeEntries] getProjectTimeEntries error:', error);
    return { data: [], error };
  }

  return { data: data || [], error: null };
}

/**
 * Get a single time entry
 */
export async function getTimeEntry(entryId) {
  const { data, error } = await supabase
    .from('time_entries')
    .select(`
      *,
      employees(id, name),
      tasks(id, title)
    `)
    .eq('id', entryId)
    .single();

  if (error) {
    console.error('[db.timeEntries] getTimeEntry error:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Create a new time entry
 */
export async function createTimeEntry(entryData) {
  const insertData = {
    task_id: entryData.task_id,
    employee_id: entryData.employee_id,
    user_id: entryData.user_id || null,
    start_time: entryData.start_time || new Date().toISOString(),
    end_time: entryData.end_time || null,
    duration_minutes: entryData.duration_minutes || null,
    allocated_minutes: entryData.allocated_minutes || 60,
    notes: entryData.notes || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Calculate duration if start and end provided
  if (insertData.start_time && insertData.end_time && !insertData.duration_minutes) {
    const start = new Date(insertData.start_time);
    const end = new Date(insertData.end_time);
    insertData.duration_minutes = Math.round((end - start) / 60000);
  }

  const { data, error } = await supabase
    .from('time_entries')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('[db.timeEntries] createTimeEntry error:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Update a time entry
 */
export async function updateTimeEntry(entryId, updates) {
  // Recalculate duration if times changed
  if (updates.start_time || updates.end_time) {
    const { data: current } = await getTimeEntry(entryId);
    if (current) {
      const start = new Date(updates.start_time || current.start_time);
      const end = updates.end_time ? new Date(updates.end_time) :
                  current.end_time ? new Date(current.end_time) : null;

      if (end) {
        updates.duration_minutes = Math.round((end - start) / 60000);
      }
    }
  }

  const { data, error } = await supabase
    .from('time_entries')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', entryId)
    .select()
    .single();

  if (error) {
    console.error('[db.timeEntries] updateTimeEntry error:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Delete a time entry
 */
export async function deleteTimeEntry(entryId) {
  const { data, error } = await supabase
    .from('time_entries')
    .delete()
    .eq('id', entryId)
    .select()
    .single();

  if (error) {
    console.error('[db.timeEntries] deleteTimeEntry error:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Clock in - start a time entry
 */
export async function clockIn(taskId, employeeId, notes = null) {
  return createTimeEntry({
    task_id: taskId,
    employee_id: employeeId,
    start_time: new Date().toISOString(),
    notes,
  });
}

/**
 * Clock out - end an active time entry
 */
export async function clockOut(entryId, notes = null) {
  const endTime = new Date().toISOString();

  const updates = { end_time: endTime };
  if (notes) {
    updates.notes = notes;
  }

  return updateTimeEntry(entryId, updates);
}

/**
 * Get active (clocked in) time entries for an employee
 */
export async function getActiveTimeEntries(employeeId) {
  const { data, error } = await supabase
    .from('time_entries')
    .select(`
      *,
      tasks(id, title, loop_id)
    `)
    .eq('employee_id', employeeId)
    .is('end_time', null)
    .order('start_time', { ascending: false });

  if (error) {
    console.error('[db.timeEntries] getActiveTimeEntries error:', error);
    return { data: [], error };
  }

  return { data: data || [], error: null };
}

/**
 * Get time summary for a date range
 */
export async function getTimeSummary(options = {}) {
  const { projectId, employeeId, startDate, endDate } = options;

  let query = supabase
    .from('time_entries')
    .select(`
      duration_minutes,
      allocated_minutes,
      employee_id,
      task_id,
      tasks!inner(
        loop_id,
        loops!inner(project_id)
      )
    `);

  if (projectId) {
    query = query.eq('tasks.loops.project_id', projectId);
  }
  if (employeeId) {
    query = query.eq('employee_id', employeeId);
  }
  if (startDate) {
    query = query.gte('start_time', startDate);
  }
  if (endDate) {
    query = query.lte('start_time', endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[db.timeEntries] getTimeSummary error:', error);
    return { data: null, error };
  }

  // Calculate totals
  const entries = data || [];
  const totalMinutes = entries.reduce((sum, e) => {
    return sum + (e.duration_minutes || e.allocated_minutes || 0);
  }, 0);

  const uniqueEmployees = new Set(entries.map(e => e.employee_id));
  const uniqueTasks = new Set(entries.map(e => e.task_id));

  return {
    data: {
      total_hours: Math.round(totalMinutes / 60 * 100) / 100,
      total_minutes: totalMinutes,
      entry_count: entries.length,
      employee_count: uniqueEmployees.size,
      task_count: uniqueTasks.size,
    },
    error: null,
  };
}

/**
 * Log time without clock in/out (direct entry)
 */
export async function logTime(taskId, employeeId, minutes, date = null, notes = null) {
  const entryDate = date ? new Date(date) : new Date();

  return createTimeEntry({
    task_id: taskId,
    employee_id: employeeId,
    start_time: entryDate.toISOString(),
    allocated_minutes: minutes,
    duration_minutes: minutes,
    notes,
  });
}
