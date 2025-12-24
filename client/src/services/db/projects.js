/**
 * Projects Database Service
 *
 * All project CRUD operations via Supabase.
 */

import { supabase } from '../supabase';
import { PROJECT_PHASES, LEGACY_PHASE_MAP, getPhase } from '../../lib/constants';

/**
 * Normalize a phase value, handling legacy names
 */
function normalizePhase(phase) {
  if (!phase) return 'intake';
  return LEGACY_PHASE_MAP[phase] || phase;
}

/**
 * Get all projects
 */
export async function getProjects(filters = {}) {
  let query = supabase
    .from('projects')
    .select('*')
    .is('deleted_at', null)
    .order('updated_at', { ascending: false });

  // Apply filters
  if (filters.phase) {
    query = query.eq('phase', filters.phase);
  }
  if (filters.phase_group) {
    query = query.eq('phase_group', filters.phase_group);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[db.projects] getProjects error:', error);
    return { data: [], error };
  }

  // Normalize phases in response
  const normalized = (data || []).map(p => ({
    ...p,
    phase: normalizePhase(p.phase),
  }));

  return { data: normalized, error: null };
}

/**
 * Get a single project by ID
 */
export async function getProject(id) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('[db.projects] getProject error:', error);
    return { data: null, error };
  }

  // Normalize phase
  if (data) {
    data.phase = normalizePhase(data.phase);
  }

  return { data, error: null };
}

/**
 * Create a new project
 */
export async function createProject(projectData) {
  // Ensure phase is valid
  const phase = projectData.phase || 'intake';
  const phaseConfig = getPhase(phase);

  const insertData = {
    ...projectData,
    phase,
    phase_group: phaseConfig.group,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Remove any undefined values
  Object.keys(insertData).forEach(key => {
    if (insertData[key] === undefined) {
      delete insertData[key];
    }
  });

  const { data, error } = await supabase
    .from('projects')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('[db.projects] createProject error:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Update a project
 */
export async function updateProject(projectId, updates) {
  // If phase is being updated, also update phase_group
  if (updates.phase) {
    const phaseConfig = getPhase(updates.phase);
    updates.phase_group = phaseConfig.group;
  }

  const { data, error } = await supabase
    .from('projects')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId)
    .select()
    .single();

  if (error) {
    console.error('[db.projects] updateProject error:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Soft delete a project
 */
export async function deleteProject(projectId) {
  const { data, error } = await supabase
    .from('projects')
    .update({
      deleted_at: new Date().toISOString(),
    })
    .eq('id', projectId)
    .select()
    .single();

  if (error) {
    console.error('[db.projects] deleteProject error:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Update project phase with transition validation
 */
export async function updateProjectPhase(projectId, newPhase, metadata = {}) {
  const phaseConfig = getPhase(newPhase);

  const updates = {
    phase: newPhase,
    phase_group: phaseConfig.group,
    ...metadata,
  };

  // Set timestamp fields based on phase
  switch (newPhase) {
    case 'quote':
      if (!metadata.quote_sent_at) {
        updates.quote_sent_at = new Date().toISOString();
      }
      break;
    case 'contract':
      if (!metadata.quote_accepted_at) {
        updates.quote_accepted_at = new Date().toISOString();
      }
      break;
    case 'active':
      if (!metadata.contract_signed_at) {
        updates.contract_signed_at = new Date().toISOString();
      }
      if (!metadata.actual_start) {
        updates.actual_start = new Date().toISOString();
      }
      break;
    case 'complete':
      if (!metadata.actual_completion) {
        updates.actual_completion = new Date().toISOString();
      }
      break;
  }

  return updateProject(projectId, updates);
}

/**
 * Get projects by phase group
 */
export async function getProjectsByPhaseGroup(phaseGroup) {
  return getProjects({ phase_group: phaseGroup });
}

/**
 * Get project activity log
 */
export async function getProjectActivity(projectId, limit = 20) {
  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[db.projects] getProjectActivity error:', error);
    return { data: [], error };
  }

  return { data: data || [], error: null };
}

/**
 * Create activity log entry
 */
export async function createActivityEntry(entry) {
  const { data, error } = await supabase
    .from('activity_log')
    .insert({
      ...entry,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('[db.projects] createActivityEntry error:', error);
    return { data: null, error };
  }

  return { data, error: null };
}
