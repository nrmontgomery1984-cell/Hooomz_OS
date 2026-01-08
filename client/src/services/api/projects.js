/**
 * Projects API Module
 *
 * Handles all project-related CRUD operations.
 * Supabase is the source of truth.
 */

import { supabase, isConfigured, generateId, now, response, handleError } from './config';

/**
 * Get all projects (excluding soft-deleted)
 */
export async function getProjects() {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .is('deleted_at', null)
      .order('updated_at', { ascending: false });

    if (error) {
      return handleError(error, 'getProjects');
    }

    return response(data || []);
  } catch (err) {
    return handleError(err, 'getProjects');
  }
}

/**
 * Get a single project by ID
 */
export async function getProject(id) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return handleError(error, 'getProject');
    }

    return response(data);
  } catch (err) {
    return handleError(err, 'getProject');
  }
}

/**
 * Create a new project
 */
export async function createProject(projectData) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  const newProject = {
    id: generateId(),
    name: projectData.name,
    client_name: projectData.client_name,
    client_email: projectData.client_email || null,
    client_phone: projectData.client_phone || null,
    address: projectData.address || null,
    phase: projectData.phase || 'intake',
    intake_type: projectData.intake_type || null,
    intake_data: projectData.intake_data || null,
    build_tier: projectData.build_tier || null,
    estimate_low: projectData.estimate_low || null,
    estimate_high: projectData.estimate_high || null,
    estimate_line_items: projectData.estimate_line_items || null,
    created_at: now(),
    updated_at: now(),
    phase_changed_at: now(),
  };

  try {
    const { data, error } = await supabase
      .from('projects')
      .insert(newProject)
      .select()
      .single();

    if (error) {
      return handleError(error, 'createProject');
    }

    return response(data);
  } catch (err) {
    return handleError(err, 'createProject');
  }
}

/**
 * Update a project
 */
export async function updateProject(id, updates) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  try {
    const { data, error } = await supabase
      .from('projects')
      .update({
        ...updates,
        updated_at: now(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return handleError(error, 'updateProject');
    }

    return response(data);
  } catch (err) {
    return handleError(err, 'updateProject');
  }
}

/**
 * Update project phase with related fields
 */
export async function updateProjectPhase(id, phaseData) {
  return updateProject(id, phaseData);
}

/**
 * Soft delete a project
 */
export async function deleteProject(id) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  try {
    const { data, error } = await supabase
      .from('projects')
      .update({ deleted_at: now() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return handleError(error, 'deleteProject');
    }

    return response(data);
  } catch (err) {
    return handleError(err, 'deleteProject');
  }
}

/**
 * Sign contract - transitions project to contracted phase
 */
export async function signContract(projectId, contractData) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  const { contractValue, selectedTier, lineItems } = contractData;

  // Get current project to merge intake_data
  const { data: currentProject, error: fetchError } = await getProject(projectId);
  if (fetchError) {
    return response(null, fetchError);
  }

  const updatedIntakeData = {
    ...(currentProject?.intake_data || {}),
    phase_changed_at: now(),
    contract_signed_at: now(),
    build_tier: selectedTier,
    estimate_line_items: lineItems,
  };

  const { data, error } = await updateProject(projectId, {
    phase: 'contracted',
    contract_value: contractValue,
    intake_data: updatedIntakeData,
  });

  if (error) {
    return response(null, error);
  }

  return response({ project: data });
}

/**
 * Start production - transitions project to active phase
 */
export async function startProduction(projectId, project) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  const updatedIntakeData = {
    ...(project?.intake_data || {}),
    phase_changed_at: now(),
    actual_start: new Date().toISOString().split('T')[0],
  };

  const { data, error } = await updateProject(projectId, {
    phase: 'active',
    intake_data: updatedIntakeData,
  });

  if (error) {
    return response(null, error);
  }

  return response({ project: data });
}
