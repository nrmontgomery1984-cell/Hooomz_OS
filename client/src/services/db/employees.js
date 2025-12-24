/**
 * Employees Database Service
 *
 * All employee CRUD operations via Supabase.
 * Employees are team members who can be assigned to tasks and log time.
 */

import { supabase } from '../supabase';
import { USER_ROLES } from '../../lib/constants';

/**
 * Get all employees for the organization
 */
export async function getEmployees() {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('[db.employees] getEmployees error:', error);
    return { data: [], error };
  }

  return { data: data || [], error: null };
}

/**
 * Get a single employee by ID
 */
export async function getEmployee(employeeId) {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('id', employeeId)
    .single();

  if (error) {
    console.error('[db.employees] getEmployee error:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Get employee by user ID (for linking auth users to employees)
 */
export async function getEmployeeByUserId(userId) {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    // Not found is expected for some cases
    if (error.code === 'PGRST116') {
      return { data: null, error: null };
    }
    console.error('[db.employees] getEmployeeByUserId error:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Create a new employee
 */
export async function createEmployee(employeeData) {
  const insertData = {
    name: employeeData.name,
    email: employeeData.email || null,
    phone: employeeData.phone || null,
    role: employeeData.role || 'crew',
    hourly_rate: employeeData.hourly_rate || null,
    is_active: employeeData.is_active !== false,
    user_id: employeeData.user_id || null,
    avatar_url: employeeData.avatar_url || null,
    skills: employeeData.skills || [],
    notes: employeeData.notes || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('employees')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('[db.employees] createEmployee error:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Update an employee
 */
export async function updateEmployee(employeeId, updates) {
  const { data, error } = await supabase
    .from('employees')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', employeeId)
    .select()
    .single();

  if (error) {
    console.error('[db.employees] updateEmployee error:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Delete an employee (soft delete by setting is_active = false)
 */
export async function deleteEmployee(employeeId, hard = false) {
  if (hard) {
    const { data, error } = await supabase
      .from('employees')
      .delete()
      .eq('id', employeeId)
      .select()
      .single();

    if (error) {
      console.error('[db.employees] deleteEmployee (hard) error:', error);
      return { data: null, error };
    }

    return { data, error: null };
  }

  // Soft delete
  return updateEmployee(employeeId, { is_active: false });
}

/**
 * Get active employees only
 */
export async function getActiveEmployees() {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) {
    console.error('[db.employees] getActiveEmployees error:', error);
    return { data: [], error };
  }

  return { data: data || [], error: null };
}

/**
 * Get employees by role
 */
export async function getEmployeesByRole(role) {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('role', role)
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) {
    console.error('[db.employees] getEmployeesByRole error:', error);
    return { data: [], error };
  }

  return { data: data || [], error: null };
}

/**
 * Get employees assigned to a project (via tasks)
 */
export async function getProjectEmployees(projectId) {
  const { data, error } = await supabase
    .from('employees')
    .select(`
      *,
      tasks!inner(
        loop_id,
        loops!inner(project_id)
      )
    `)
    .eq('tasks.loops.project_id', projectId)
    .eq('is_active', true);

  if (error) {
    console.error('[db.employees] getProjectEmployees error:', error);
    return { data: [], error };
  }

  // Remove duplicates and task data
  const uniqueEmployees = [];
  const seenIds = new Set();

  (data || []).forEach(emp => {
    if (!seenIds.has(emp.id)) {
      seenIds.add(emp.id);
      const { tasks, ...employee } = emp;
      uniqueEmployees.push(employee);
    }
  });

  return { data: uniqueEmployees, error: null };
}

/**
 * Get employee work summary (hours logged, tasks completed)
 */
export async function getEmployeeWorkSummary(employeeId, startDate, endDate) {
  // Get time entries for the period
  let query = supabase
    .from('time_entries')
    .select('duration_minutes, allocated_minutes')
    .eq('employee_id', employeeId);

  if (startDate) {
    query = query.gte('start_time', startDate);
  }
  if (endDate) {
    query = query.lte('start_time', endDate);
  }

  const { data: timeData, error: timeError } = await query;

  if (timeError) {
    console.error('[db.employees] getEmployeeWorkSummary time error:', timeError);
    return { data: null, error: timeError };
  }

  // Calculate totals
  const totalMinutes = (timeData || []).reduce((sum, entry) => {
    return sum + (entry.duration_minutes || entry.allocated_minutes || 0);
  }, 0);

  return {
    data: {
      employee_id: employeeId,
      total_hours: Math.round(totalMinutes / 60 * 100) / 100,
      entry_count: (timeData || []).length,
      period: { start: startDate, end: endDate },
    },
    error: null,
  };
}
