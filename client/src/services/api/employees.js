/**
 * Employees API Module
 *
 * Handles employee/team member CRUD operations.
 */

import { supabase, isConfigured, generateId, now, response, handleError } from './config';

/**
 * Transform employee from DB snake_case to UI camelCase
 */
function transformFromDb(emp) {
  if (!emp) return null;

  return {
    id: emp.id,
    firstName: emp.first_name,
    lastName: emp.last_name,
    email: emp.email,
    phone: emp.phone,
    role: emp.role,
    hourlyRate: emp.hourly_rate,
    isActive: emp.is_active,
    avatarUrl: emp.avatar_url,
    skills: emp.skills || [],
    notes: emp.notes,
    startDate: emp.start_date,
    createdAt: emp.created_at,
    updatedAt: emp.updated_at,
  };
}

/**
 * Transform employee from UI camelCase to DB snake_case
 */
function transformToDb(emp) {
  const dbRecord = {};

  if (emp.firstName !== undefined) dbRecord.first_name = emp.firstName;
  if (emp.lastName !== undefined) dbRecord.last_name = emp.lastName;
  if (emp.email !== undefined) dbRecord.email = emp.email;
  if (emp.phone !== undefined) dbRecord.phone = emp.phone;
  if (emp.role !== undefined) dbRecord.role = emp.role;
  if (emp.hourlyRate !== undefined) dbRecord.hourly_rate = emp.hourlyRate;
  if (emp.isActive !== undefined) dbRecord.is_active = emp.isActive;
  if (emp.avatarUrl !== undefined) dbRecord.avatar_url = emp.avatarUrl;
  if (emp.skills !== undefined) dbRecord.skills = emp.skills;
  if (emp.notes !== undefined) dbRecord.notes = emp.notes;
  if (emp.startDate !== undefined) dbRecord.start_date = emp.startDate;

  return dbRecord;
}

/**
 * Get all employees
 */
export async function getEmployees() {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .is('deleted_at', null)
      .eq('is_active', true)
      .order('last_name', { ascending: true });

    if (error) {
      return handleError(error, 'getEmployees');
    }

    const transformed = (data || []).map(transformFromDb).filter(Boolean);
    return response(transformed);
  } catch (err) {
    return handleError(err, 'getEmployees');
  }
}

/**
 * Get a single employee by ID
 */
export async function getEmployee(id) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return handleError(error, 'getEmployee');
    }

    return response(transformFromDb(data));
  } catch (err) {
    return handleError(err, 'getEmployee');
  }
}

/**
 * Create a new employee
 */
export async function createEmployee(employeeData) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  const dbRecord = {
    id: generateId(),
    ...transformToDb(employeeData),
    is_active: true,
    created_at: now(),
    updated_at: now(),
  };

  try {
    const { data, error } = await supabase
      .from('employees')
      .insert(dbRecord)
      .select()
      .single();

    if (error) {
      return handleError(error, 'createEmployee');
    }

    return response(transformFromDb(data));
  } catch (err) {
    return handleError(err, 'createEmployee');
  }
}

/**
 * Update an employee
 */
export async function updateEmployee(id, updates) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  const dbUpdates = {
    ...transformToDb(updates),
    updated_at: now(),
  };

  try {
    const { data, error } = await supabase
      .from('employees')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return handleError(error, 'updateEmployee');
    }

    return response(transformFromDb(data));
  } catch (err) {
    return handleError(err, 'updateEmployee');
  }
}

/**
 * Soft delete an employee
 */
export async function deleteEmployee(id) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  try {
    const { data, error } = await supabase
      .from('employees')
      .update({
        deleted_at: now(),
        is_active: false,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return handleError(error, 'deleteEmployee');
    }

    return response({ id, deleted: true });
  } catch (err) {
    return handleError(err, 'deleteEmployee');
  }
}

/**
 * Get employees by role
 */
export async function getEmployeesByRole(role) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .is('deleted_at', null)
      .eq('is_active', true)
      .eq('role', role)
      .order('last_name', { ascending: true });

    if (error) {
      return handleError(error, 'getEmployeesByRole');
    }

    const transformed = (data || []).map(transformFromDb).filter(Boolean);
    return response(transformed);
  } catch (err) {
    return handleError(err, 'getEmployeesByRole');
  }
}

/**
 * Search employees by name
 */
export async function searchEmployees(query) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .is('deleted_at', null)
      .eq('is_active', true)
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
      .order('last_name', { ascending: true });

    if (error) {
      return handleError(error, 'searchEmployees');
    }

    const transformed = (data || []).map(transformFromDb).filter(Boolean);
    return response(transformed);
  } catch (err) {
    return handleError(err, 'searchEmployees');
  }
}
