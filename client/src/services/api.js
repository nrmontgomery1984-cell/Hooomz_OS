import { supabase, isSupabaseConfigured } from './supabase';
import {
  mockProjects,
  demoProjects,
  mockLoops,
  mockTasks,
  mockTodayTasks,
  mockTimeEntry,
  mockTimeEntries,
  mockActiveTimeEntry,
  setActiveTimeEntry,
  saveTimeEntriesToStorage,
  mockActivityLog,
  saveProjectsToStorage,
  // Task Tracker imports
  workCategories,
  workSubcategories,
  stages,
  phases,
  mockTaskTrackerLocations,
  mockTaskTemplates,
  mockTaskInstances,
  defaultPhaseChecklists,
  mockContacts,
  saveTaskTrackerToStorage,
  // Material Selections imports
  mockMaterialSelections,
  saveMaterialSelectionsToStorage,
  selectionCategories,
  selectionStatuses,
  selectionPhases,
  trades,
  // Floor Plan imports
  mockFloorPlans,
  mockFloorPlanElements,
  saveFloorPlansToStorage,
  saveFloorPlanElementsToStorage,
  FLOOR_PLAN_STATUS_COLORS,
  ELEMENT_TYPE_DEFAULTS,
  TRADE_COLORS,
} from './mockData';
import { getChecklistForTask, getFieldGuideModules } from '../data/taskChecklists';

// Use Supabase for projects (RLS policies allow anonymous access)
const USE_MOCK_PROJECTS = false;

// Projects API
export async function getProjects() {
  if (!isSupabaseConfigured() || USE_MOCK_PROJECTS) {
    return { data: mockProjects, error: null };
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .is('deleted_at', null)
    .order('updated_at', { ascending: false });

  // Merge with localStorage projects (for migration period)
  // This ensures projects created before Supabase was enabled still appear
  const supabaseProjects = data || [];
  const supabaseIds = new Set(supabaseProjects.map(p => p.id));
  const localOnlyProjects = mockProjects.filter(p => !supabaseIds.has(p.id));

  if (localOnlyProjects.length > 0) {
    console.log('Found localStorage-only projects:', localOnlyProjects.length);
    return { data: [...supabaseProjects, ...localOnlyProjects], error: null };
  }

  return { data: supabaseProjects, error };
}

export async function getProject(id) {
  console.log('[api.getProject] id:', id, 'supabaseConfigured:', isSupabaseConfigured(), 'mockCount:', mockProjects.length);

  if (!isSupabaseConfigured() || USE_MOCK_PROJECTS) {
    const project = mockProjects.find((p) => p.id === id);
    console.log('[api.getProject] Mock mode - found:', !!project);
    if (!project) {
      return { data: null, error: 'Not found' };
    }

    // Merge expense data from demoProjects (localStorage may have stale data)
    const demoProject = demoProjects.find((p) => p.id === id);
    if (demoProject?.expenses) {
      return { data: { ...project, expenses: demoProject.expenses }, error: null };
    }

    return { data: project, error: null };
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  console.log('[api.getProject] Supabase result - data:', !!data, 'error:', error);

  // Fallback to localStorage if not found in Supabase (for migration period)
  if (error || !data) {
    const localProject = mockProjects.find((p) => p.id === id);
    console.log('[api.getProject] Fallback to localStorage - found:', !!localProject);
    if (localProject) {
      return { data: localProject, error: null };
    }
  }

  return { data, error };
}

export async function deleteProject(projectId) {
  if (!isSupabaseConfigured() || USE_MOCK_PROJECTS) {
    const index = mockProjects.findIndex(p => p.id === projectId);
    if (index === -1) {
      return { data: null, error: 'Project not found' };
    }
    // Remove from array
    mockProjects.splice(index, 1);
    // Persist to localStorage
    saveProjectsToStorage();
    return { data: { id: projectId }, error: null };
  }

  // Soft delete in Supabase
  const { data, error } = await supabase
    .from('projects')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', projectId)
    .select()
    .single();

  return { data, error };
}

export async function createProject(projectData) {
  const newProject = {
    id: crypto.randomUUID(),
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
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    phase_changed_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured() || USE_MOCK_PROJECTS) {
    // Add to mock array
    mockProjects.unshift(newProject);
    // Persist to localStorage
    saveProjectsToStorage();
    return { data: newProject, error: null };
  }

  const { data, error } = await supabase
    .from('projects')
    .insert(newProject)
    .select()
    .single();

  return { data, error };
}

// Loops API
export async function getLoops(projectId) {
  if (!isSupabaseConfigured() || USE_MOCK_PROJECTS) {
    return { data: mockLoops[projectId] || [], error: null };
  }

  const { data, error } = await supabase
    .from('loops')
    .select('*')
    .eq('project_id', projectId)
    .order('display_order', { ascending: true });

  return { data, error };
}

/**
 * Get loops for a project, generating them from scope data if needed
 *
 * Priority order for scope data:
 * 1. Existing loops from contractor_intake (already match scope perfectly)
 * 2. Existing loops from estimate generation
 * 3. Generate from intake_data.instances (contractor intake scope)
 * 4. Generate from intake_data.scope (legacy contractor format)
 * 5. Generate from estimate_line_items (fallback for homeowner intake)
 */
export async function getOrGenerateLoops(projectId, project) {
  // Get existing loops
  const { data: existingLoops, error } = await getLoops(projectId);
  if (error) return { data: null, error };

  const intakeData = project?.intake_data || {};

  // Check sources for loops
  const hasContractorIntakeLoops = existingLoops?.some(loop => loop.source === 'contractor_intake');
  const hasEstimateLoops = existingLoops?.some(loop => loop.source === 'estimate');
  const hasValidLoops = existingLoops?.length > 0 && (hasContractorIntakeLoops || hasEstimateLoops);

  // If we have valid loops from contractor intake or estimate, use them
  if (hasValidLoops) {
    return { data: existingLoops, error: null };
  }

  // Check available scope data sources
  const instances = intakeData.instances || project?.instances;
  const scope = intakeData.scope;
  const lineItems = intakeData.estimate_line_items || project?.estimate_line_items;
  const buildTier = intakeData.build_tier || intakeData.project?.specLevel || project?.build_tier || 'better';

  // Determine the best scope source
  let scopeSource = null;
  if (instances?.length > 0) {
    scopeSource = 'instances';
  } else if (scope && Object.keys(scope).length > 0) {
    scopeSource = 'scope';
  } else if (lineItems?.length > 0) {
    scopeSource = 'estimate';
  }

  // If no scope data, return empty (or existing stale loops)
  if (!scopeSource) {
    return { data: existingLoops || [], error: null };
  }

  // Check if existing loops are stale mock data (no source or old intake source)
  const hasStaleMockLoops = existingLoops?.length > 0 &&
    existingLoops.every(loop => loop.source === 'intake' || !loop.source);

  // Only regenerate if no valid loops exist or we have stale mock data
  const needsGeneration = !existingLoops?.length || hasStaleMockLoops;

  if (!needsGeneration) {
    return { data: existingLoops || [], error: null };
  }

  // Clear existing loops for this project in mock mode
  if (!isSupabaseConfigured() || USE_MOCK_PROJECTS) {
    const existingLoopsToDelete = existingLoops || [];
    for (const loop of existingLoopsToDelete) {
      delete mockTasks[loop.id];
    }
    mockLoops[projectId] = [];
    delete mockTaskInstances[projectId];
    saveProjectsToStorage();
    saveTaskTrackerToStorage();
  }

  // Generate loops based on best available scope source
  if (scopeSource === 'instances') {
    const { loops, tasks, error: genError } = await generateScopeFromInstances(
      projectId,
      instances,
      buildTier
    );
    if (genError) {
      return { data: [], error: null };
    }
    return { data: loops, error: null };
  } else if (scopeSource === 'scope') {
    const { loops, tasks, error: genError } = await generateScopeFromContractorScope(
      projectId,
      scope,
      buildTier
    );
    if (genError) {
      return { data: [], error: null };
    }
    return { data: loops, error: null };
  } else {
    // Fall back to estimate line items
    const { loops, tasks, error: genError } = await generateScopeFromEstimate(
      projectId,
      lineItems,
      buildTier
    );
    if (genError) {
      return { data: [], error: null };
    }
    return { data: loops, error: null };
  }
}

/**
 * Regenerate loops for a project from its scope data
 * Clears existing loops and creates new ones from the best available scope source
 *
 * Priority: instances > scope > estimate_line_items
 */
export async function regenerateProjectLoops(projectId, project) {
  const intakeData = project?.intake_data || {};
  const instances = intakeData.instances || project?.instances;
  const scope = intakeData.scope;
  const lineItems = intakeData.estimate_line_items || project?.estimate_line_items;
  const buildTier = intakeData.build_tier || intakeData.project?.specLevel || project?.build_tier || 'better';

  // Determine best scope source
  let scopeSource = null;
  if (instances?.length > 0) {
    scopeSource = 'instances';
  } else if (scope && Object.keys(scope).length > 0) {
    scopeSource = 'scope';
  } else if (lineItems?.length > 0) {
    scopeSource = 'estimate';
  }

  if (!scopeSource) {
    return { loops: [], tasks: [], error: 'No scope data to generate from' };
  }

  // Clear existing loops for this project
  if (!isSupabaseConfigured() || USE_MOCK_PROJECTS) {
    const existingLoops = mockLoops[projectId] || [];
    for (const loop of existingLoops) {
      delete mockTasks[loop.id];
    }
    mockLoops[projectId] = [];
    delete mockTaskInstances[projectId];
    saveProjectsToStorage();
    saveTaskTrackerToStorage();
  }

  // Generate new loops from best available source
  if (scopeSource === 'instances') {
    return generateScopeFromInstances(projectId, instances, buildTier);
  } else if (scopeSource === 'scope') {
    return generateScopeFromContractorScope(projectId, scope, buildTier);
  } else {
    return generateScopeFromEstimate(projectId, lineItems, buildTier);
  }
}

export async function getLoop(id) {
  if (!isSupabaseConfigured() || USE_MOCK_PROJECTS) {
    for (const loops of Object.values(mockLoops)) {
      const loop = loops.find((l) => l.id === id);
      if (loop) return { data: loop, error: null };
    }
    return { data: null, error: 'Not found' };
  }

  const { data, error } = await supabase
    .from('loops')
    .select('*')
    .eq('id', id)
    .single();

  return { data, error };
}

// Tasks API
export async function getTasks(loopId) {
  if (!isSupabaseConfigured() || USE_MOCK_PROJECTS) {
    return { data: mockTasks[loopId] || [], error: null };
  }

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('loop_id', loopId)
    .order('display_order', { ascending: true });

  return { data, error };
}

export async function getTask(id) {
  if (!isSupabaseConfigured() || USE_MOCK_PROJECTS) {
    // Search all loops for the task
    for (const tasks of Object.values(mockTasks)) {
      const task = tasks.find((t) => t.id === id);
      if (task) return { data: task, error: null };
    }
    return { data: null, error: 'Not found' };
  }

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .single();

  return { data, error };
}

export async function updateTask(id, updates) {
  if (!isSupabaseConfigured() || USE_MOCK_PROJECTS) {
    return { data: { id, ...updates }, error: null };
  }

  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
}

export async function updateTaskStatus(taskId, status) {
  if (!isSupabaseConfigured() || USE_MOCK_PROJECTS) {
    // Mock update
    return { data: { id: taskId, status }, error: null };
  }

  const { data, error } = await supabase
    .from('tasks')
    .update({
      status,
      completed_at: status === 'completed' ? new Date().toISOString() : null,
    })
    .eq('id', taskId)
    .select()
    .single();

  return { data, error };
}

// Today Tasks API
export async function getTodayTasks() {
  if (!isSupabaseConfigured() || USE_MOCK_PROJECTS) {
    return { data: mockTodayTasks, error: null };
  }

  // In real implementation, fetch tasks due today or in progress
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      loop:loops(name, project:projects(name))
    `)
    .or(`due_date.eq.${today},status.eq.in_progress`)
    .order('priority', { ascending: true });

  return { data, error };
}

export async function createTodayTask({ title }) {
  const newTask = {
    id: crypto.randomUUID(),
    title,
    status: 'pending',
    due_date: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured() || USE_MOCK_PROJECTS) {
    // Add to mock data
    mockTodayTasks.unshift(newTask);
    return { data: newTask, error: null };
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert(newTask)
    .select()
    .single();

  return { data, error };
}

// =============================================================================
// TIME TRACKING API - Full time tracking with clock in/out
// =============================================================================

/**
 * Get the currently active time entry (if any)
 */
export async function getActiveTimeEntry() {
  if (!isSupabaseConfigured() || USE_MOCK_TASK_TRACKER) {
    // Return the active time entry from mock data
    return { data: mockActiveTimeEntry, error: null };
  }

  const { data, error } = await supabase
    .from('time_entries')
    .select(`
      *,
      task:tasks(title, loop:loops(project:projects(name)))
    `)
    .is('end_time', null)
    .single();

  return { data, error };
}

/**
 * Get all time entries, optionally filtered
 * @param {Object} filters - Filter options
 * @param {string} filters.projectId - Filter by project
 * @param {string} filters.taskId - Filter by task
 * @param {string} filters.userId - Filter by user
 * @param {string} filters.startDate - Filter entries after this date
 * @param {string} filters.endDate - Filter entries before this date
 */
export async function getTimeEntries(filters = {}) {
  if (!isSupabaseConfigured() || USE_MOCK_TASK_TRACKER) {
    let entries = [...mockTimeEntries];

    // Apply filters
    if (filters.projectId) {
      entries = entries.filter(e => e.projectId === filters.projectId);
    }
    if (filters.taskId) {
      entries = entries.filter(e => e.taskId === filters.taskId);
    }
    if (filters.userId) {
      entries = entries.filter(e => e.userId === filters.userId);
    }
    if (filters.categoryCode) {
      entries = entries.filter(e => e.categoryCode === filters.categoryCode);
    }
    if (filters.startDate) {
      const start = new Date(filters.startDate);
      entries = entries.filter(e => new Date(e.startTime) >= start);
    }
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      entries = entries.filter(e => new Date(e.startTime) <= end);
    }

    // Sort by start time descending (most recent first)
    entries.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

    return { data: entries, error: null };
  }

  let query = supabase
    .from('time_entries')
    .select('*')
    .order('start_time', { ascending: false });

  if (filters.projectId) {
    query = query.eq('project_id', filters.projectId);
  }
  if (filters.taskId) {
    query = query.eq('task_id', filters.taskId);
  }
  if (filters.userId) {
    query = query.eq('user_id', filters.userId);
  }
  if (filters.startDate) {
    query = query.gte('start_time', filters.startDate);
  }
  if (filters.endDate) {
    query = query.lte('start_time', filters.endDate);
  }

  const { data, error } = await query;
  return { data, error };
}

/**
 * Clock in - Start a timer for a specific task
 * @param {Object} clockInData - Clock in data
 * @param {string} clockInData.taskId - Task ID to clock in on
 * @param {string} clockInData.taskName - Task name for display
 * @param {string} clockInData.projectId - Project ID
 * @param {string} clockInData.projectName - Project name for display
 * @param {string} clockInData.categoryCode - Work category code
 * @param {string} clockInData.subcategoryCode - Subcategory code (optional)
 * @param {string} clockInData.userId - User/worker ID
 * @param {string} clockInData.userName - User name for display
 * @param {number} clockInData.estimatedMinutes - Estimated time for the task
 */
export async function clockIn(clockInData) {
  const newEntry = {
    id: `te-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    taskId: clockInData.taskId,
    taskName: clockInData.taskName,
    projectId: clockInData.projectId,
    projectName: clockInData.projectName,
    categoryCode: clockInData.categoryCode,
    subcategoryCode: clockInData.subcategoryCode || null,
    userId: clockInData.userId,
    userName: clockInData.userName,
    startTime: new Date().toISOString(),
    endTime: null,
    durationMinutes: null,
    estimatedMinutes: clockInData.estimatedMinutes || 60,
    notes: '',
    billable: true,
  };

  if (!isSupabaseConfigured() || USE_MOCK_TASK_TRACKER) {
    // Set as active entry
    setActiveTimeEntry(newEntry);

    // Also update task status to in_progress
    await updateTaskInstance(clockInData.taskId, { status: 'in_progress' });

    return { data: newEntry, error: null };
  }

  const { data, error } = await supabase
    .from('time_entries')
    .insert({
      task_id: clockInData.taskId,
      project_id: clockInData.projectId,
      user_id: clockInData.userId,
      category_code: clockInData.categoryCode,
      subcategory_code: clockInData.subcategoryCode,
      start_time: newEntry.startTime,
      estimated_minutes: clockInData.estimatedMinutes || 60,
      billable: true,
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Clock out - Stop the active timer and save the time entry
 * @param {string} entryId - The time entry ID to close
 * @param {Object} options - Clock out options
 * @param {string} options.notes - Notes about the work done
 * @param {boolean} options.markTaskComplete - Whether to mark the task as completed
 */
export async function clockOut(entryId, options = {}) {
  const now = new Date();

  if (!isSupabaseConfigured() || USE_MOCK_TASK_TRACKER) {
    if (!mockActiveTimeEntry || mockActiveTimeEntry.id !== entryId) {
      return { data: null, error: 'No active time entry found' };
    }

    const startTime = new Date(mockActiveTimeEntry.startTime);
    const durationMinutes = Math.round((now - startTime) / 60000);

    // Complete the entry
    const completedEntry = {
      ...mockActiveTimeEntry,
      endTime: now.toISOString(),
      durationMinutes,
      notes: options.notes || '',
    };

    // Add to history
    mockTimeEntries.unshift(completedEntry);

    // Clear active entry
    setActiveTimeEntry(null);

    // Save to storage
    saveTimeEntriesToStorage();

    // Optionally mark task as complete
    if (options.markTaskComplete) {
      await updateTaskInstance(completedEntry.taskId, { status: 'completed' });
    }

    return { data: completedEntry, error: null };
  }

  // Get the entry to calculate duration
  const { data: entry } = await supabase
    .from('time_entries')
    .select('start_time')
    .eq('id', entryId)
    .single();

  const startTime = new Date(entry.start_time);
  const durationMinutes = Math.round((now - startTime) / 60000);

  const { data, error } = await supabase
    .from('time_entries')
    .update({
      end_time: now.toISOString(),
      duration_minutes: durationMinutes,
      notes: options.notes || '',
    })
    .eq('id', entryId)
    .select()
    .single();

  return { data, error };
}

/**
 * Legacy startTimer function for backwards compatibility
 */
export async function startTimer(taskId, allocatedMinutes = 60) {
  if (!isSupabaseConfigured() || USE_MOCK_TASK_TRACKER) {
    const newEntry = {
      id: `te-${Date.now()}`,
      task_id: taskId,
      start_time: new Date().toISOString(),
      allocated_minutes: allocatedMinutes,
    };
    setActiveTimeEntry(newEntry);
    return { data: newEntry, error: null };
  }

  const { data, error } = await supabase
    .from('time_entries')
    .insert({
      task_id: taskId,
      start_time: new Date().toISOString(),
      allocated_minutes: allocatedMinutes,
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Legacy stopTimer function for backwards compatibility
 */
export async function stopTimer(entryId) {
  return clockOut(entryId);
}

/**
 * Add a manual time entry (for logging time after the fact)
 */
export async function addManualTimeEntry(entryData) {
  const newEntry = {
    id: `te-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    taskId: entryData.taskId,
    taskName: entryData.taskName,
    projectId: entryData.projectId,
    projectName: entryData.projectName,
    categoryCode: entryData.categoryCode,
    subcategoryCode: entryData.subcategoryCode || null,
    userId: entryData.userId,
    userName: entryData.userName,
    startTime: entryData.startTime,
    endTime: entryData.endTime,
    durationMinutes: entryData.durationMinutes,
    notes: entryData.notes || '',
    billable: entryData.billable !== false,
  };

  if (!isSupabaseConfigured() || USE_MOCK_TASK_TRACKER) {
    mockTimeEntries.unshift(newEntry);
    saveTimeEntriesToStorage();
    return { data: newEntry, error: null };
  }

  const { data, error } = await supabase
    .from('time_entries')
    .insert({
      task_id: entryData.taskId,
      project_id: entryData.projectId,
      user_id: entryData.userId,
      category_code: entryData.categoryCode,
      subcategory_code: entryData.subcategoryCode,
      start_time: entryData.startTime,
      end_time: entryData.endTime,
      duration_minutes: entryData.durationMinutes,
      notes: entryData.notes || '',
      billable: entryData.billable !== false,
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Get time summary for a project
 */
export async function getProjectTimeSummary(projectId) {
  const { data: entries } = await getTimeEntries({ projectId });

  if (!entries) {
    return { data: null, error: 'Failed to load entries' };
  }

  // Group by category
  const byCategory = {};
  let totalMinutes = 0;

  entries.forEach(entry => {
    const code = entry.categoryCode || 'other';
    if (!byCategory[code]) {
      byCategory[code] = { code, minutes: 0, entries: 0 };
    }
    byCategory[code].minutes += entry.durationMinutes || 0;
    byCategory[code].entries += 1;
    totalMinutes += entry.durationMinutes || 0;
  });

  return {
    data: {
      totalMinutes,
      totalHours: Math.round(totalMinutes / 60 * 10) / 10,
      byCategory: Object.values(byCategory),
      entryCount: entries.length,
    },
    error: null,
  };
}

// Activity Log API - The Heartbeat
export async function getProjectActivity(projectId, limit = 20) {
  // Use mock when projects are in localStorage mode
  if (!isSupabaseConfigured() || USE_MOCK_PROJECTS) {
    return { data: mockActivityLog[projectId] || [], error: null };
  }

  try {
    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return { data: [], error };
    }
    return { data: data || [], error: null };
  } catch (err) {
    return { data: [], error: err.message };
  }
}

// Create a new task
export async function createTask(task) {
  if (!isSupabaseConfigured() || USE_MOCK_PROJECTS) {
    const newTask = {
      id: task.id || `t${Date.now()}`,
      ...task,
      created_at: new Date().toISOString(),
    };

    // Add to mock tasks store (keyed by loop_id)
    const loopId = task.loop_id;
    if (loopId) {
      if (!mockTasks[loopId]) {
        mockTasks[loopId] = [];
      }
      mockTasks[loopId].push(newTask);
      // Persist to localStorage
      saveProjectsToStorage();
    }

    return { data: newTask, error: null };
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert(task)
    .select()
    .single();

  return { data, error };
}

// Create a new loop
export async function createLoop(loop) {
  if (!isSupabaseConfigured() || USE_MOCK_PROJECTS) {
    const newLoop = {
      id: loop.id || `l${Date.now()}`,
      ...loop,
      created_at: new Date().toISOString(),
    };

    // Add to mock loops store (keyed by project_id)
    const projectId = loop.project_id;
    if (projectId) {
      if (!mockLoops[projectId]) {
        mockLoops[projectId] = [];
      }
      mockLoops[projectId].push(newLoop);
      // Persist to localStorage
      saveProjectsToStorage();
    }

    return { data: newLoop, error: null };
  }

  const { data, error } = await supabase
    .from('loops')
    .insert(loop)
    .select()
    .single();

  return { data, error };
}

// Task Notes API
export async function getTaskNotes(taskId) {
  if (!isSupabaseConfigured() || USE_MOCK_PROJECTS) {
    // Return empty array for mock - notes would be stored per task
    return { data: [], error: null };
  }

  const { data, error } = await supabase
    .from('task_notes')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: false });

  return { data, error };
}

export async function addTaskNote(taskId, note) {
  if (!isSupabaseConfigured() || USE_MOCK_PROJECTS) {
    const newNote = {
      id: `n${Date.now()}`,
      task_id: taskId,
      ...note,
      created_at: new Date().toISOString(),
    };
    return { data: newNote, error: null };
  }

  const { data, error } = await supabase
    .from('task_notes')
    .insert({
      task_id: taskId,
      content: note.content,
      author_name: note.author_name,
    })
    .select()
    .single();

  return { data, error };
}

// Task Photos API
export async function getTaskPhotos(taskId) {
  if (!isSupabaseConfigured() || USE_MOCK_PROJECTS) {
    // Return empty array for mock
    return { data: [], error: null };
  }

  const { data, error } = await supabase
    .from('task_photos')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: false });

  return { data, error };
}

export async function addTaskPhoto(taskId, photo) {
  if (!isSupabaseConfigured() || USE_MOCK_PROJECTS) {
    const newPhoto = {
      id: `p${Date.now()}`,
      task_id: taskId,
      ...photo,
      created_at: new Date().toISOString(),
    };
    return { data: newPhoto, error: null };
  }

  const { data, error } = await supabase
    .from('task_photos')
    .insert({
      task_id: taskId,
      url: photo.url,
      caption: photo.caption,
    })
    .select()
    .single();

  return { data, error };
}

// Task Time Entries API
export async function getTaskTimeEntries(taskId) {
  if (!isSupabaseConfigured() || USE_MOCK_PROJECTS) {
    // Return empty array for mock
    return { data: [], error: null };
  }

  const { data, error } = await supabase
    .from('time_entries')
    .select('*')
    .eq('task_id', taskId)
    .order('start_time', { ascending: false });

  return { data, error };
}

/**
 * Create an activity log entry
 * @param {Object} entry - The activity entry
 * @param {string} entry.event_type - Type of event (e.g., 'task.completed', 'photo.uploaded', 'note.added', 'issue.flagged')
 * @param {Object} entry.event_data - Event-specific data (e.g., { title: 'Task name' })
 * @param {string} [entry.project_id] - Associated project ID
 * @param {string} [entry.loop_id] - Associated loop ID
 * @param {string} [entry.task_id] - Associated task ID
 * @param {string} [entry.actor_name] - Name of person performing action
 */
export async function createActivityEntry(entry) {
  if (!isSupabaseConfigured() || USE_MOCK_PROJECTS) {
    // Mock: add to local array for demo
    const newEntry = {
      id: `a${Date.now()}`,
      ...entry,
      created_at: new Date().toISOString(),
    };

    // Add to mock activity log
    const projectId = entry.project_id;
    if (projectId) {
      if (!mockActivityLog[projectId]) {
        mockActivityLog[projectId] = [];
      }
      mockActivityLog[projectId].unshift(newEntry);
    }

    return { data: newEntry, error: null };
  }

  const { data, error } = await supabase
    .from('activity_log')
    .insert({
      event_type: entry.event_type,
      event_data: entry.event_data || {},
      project_id: entry.project_id,
      loop_id: entry.loop_id,
      task_id: entry.task_id,
      actor_id: entry.actor_id,
      actor_name: entry.actor_name,
      category_code: entry.category_code || null,
      subcategory_code: entry.subcategory_code || null,
      contact_ids: entry.contact_ids || [],
    })
    .select()
    .single();

  return { data, error };
}

// Phase Transition API
/**
 * Update a project's phase and related fields
 * @param {string} projectId - Project ID
 * @param {Object} updates - Phase update data
 * @param {string} updates.phase - New phase
 * @param {string} [updates.phase_changed_at] - Timestamp of change
 * @param {string} [updates.actual_start] - Actual start date
 * @param {string} [updates.actual_completion] - Actual completion date
 * @param {string} [updates.quote_sent_at] - Quote sent date
 */
export async function updateProjectPhase(projectId, updates) {
  if (!isSupabaseConfigured() || USE_MOCK_PROJECTS) {
    // Mock: find and update project
    const projectIndex = mockProjects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) {
      return { data: null, error: 'Project not found' };
    }

    const updatedProject = {
      ...mockProjects[projectIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    // Update in mock array
    mockProjects[projectIndex] = updatedProject;
    // Persist to localStorage
    saveProjectsToStorage();

    return { data: updatedProject, error: null };
  }

  // Log what we're trying to update for debugging
  console.log('[updateProjectPhase] Updating project:', projectId, 'with:', Object.keys(updates));

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
    console.error('[updateProjectPhase] Supabase error:', error.message, error.details, error.hint);
    console.error('[updateProjectPhase] Full error:', JSON.stringify(error, null, 2));
  } else {
    console.log('[updateProjectPhase] Success, updated project:', data?.id, 'phase:', data?.phase);
  }

  // Fallback to localStorage if Supabase update failed or returned no data
  // This handles projects that were created before Supabase migration
  if (error || !data) {
    const projectIndex = mockProjects.findIndex(p => p.id === projectId);
    if (projectIndex !== -1) {
      console.log('Updating project in localStorage (not in Supabase):', projectId);
      const updatedProject = {
        ...mockProjects[projectIndex],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      mockProjects[projectIndex] = updatedProject;
      saveProjectsToStorage();
      return { data: updatedProject, error: null };
    }
  }

  return { data, error };
}

/**
 * Update project data (general purpose)
 * @param {string} projectId - Project ID
 * @param {Object} updates - Fields to update
 */
export async function updateProject(projectId, updates) {
  if (!isSupabaseConfigured() || USE_MOCK_PROJECTS) {
    const projectIndex = mockProjects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) {
      return { data: null, error: 'Project not found' };
    }

    const updatedProject = {
      ...mockProjects[projectIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    mockProjects[projectIndex] = updatedProject;
    // Persist to localStorage
    saveProjectsToStorage();
    return { data: updatedProject, error: null };
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
    console.error('Supabase updateProject error:', error, 'Updates:', updates);
  }

  // Fallback to localStorage if Supabase update failed or returned no data
  // This handles projects that were created before Supabase migration
  if (error || !data) {
    const projectIndex = mockProjects.findIndex(p => p.id === projectId);
    if (projectIndex !== -1) {
      console.log('Updating project in localStorage (not in Supabase):', projectId);
      const updatedProject = {
        ...mockProjects[projectIndex],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      mockProjects[projectIndex] = updatedProject;
      saveProjectsToStorage();
      return { data: updatedProject, error: null };
    }
  }

  return { data, error };
}

/**
 * Trade category display order for construction workflow
 * This determines the sequence loops appear in (typical construction order)
 */
const TRADE_ORDER = [
  'SW', // Site Work
  'FN', // Foundation
  'FS', // Framing - Structural
  'FI', // Framing - Interior
  'RF', // Roofing
  'EE', // Exterior Envelope
  'IA', // Insulation & Air Sealing
  'EL', // Electrical
  'PL', // Plumbing
  'HV', // HVAC
  'DW', // Drywall
  'PT', // Painting
  'FL', // Flooring
  'TL', // Tile
  'FC', // Finish Carpentry
  'CM', // Cabinetry & Millwork
  'SR', // Stairs & Railings
  'EF', // Exterior Finishes
  'FZ', // Final Completion
  'DM', // Demo (often first, but can vary)
  'GN', // General
];

/**
 * Trade code to display name mapping
 * Note: FS (Structural Framing) encompasses floors, walls, ceilings, and roof framing
 */
const TRADE_NAMES = {
  SW: 'Site Work',
  FN: 'Foundation',
  FS: 'Structural Framing',  // Floors, walls, ceilings, roof structure
  FI: 'Interior Framing',    // Non-structural partitions, bulkheads
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
 * Generate loops and tasks from estimate line items when project moves to in_progress
 * This transforms the pricing estimate into actionable production scope
 *
 * Groups by TRADE CATEGORY (Electrical, Plumbing, etc.) not by room
 * Each loop = one trade, each task = a line item within that trade
 *
 * @param {string} projectId - Project ID
 * @param {Array} lineItems - Estimate line items
 * @param {string} selectedTier - Selected build tier (good/better/best)
 * @returns {Object} Created loops and tasks
 */
export async function generateScopeFromEstimate(projectId, lineItems, selectedTier = 'better') {
  if (!lineItems || lineItems.length === 0) {
    return { loops: [], tasks: [], error: 'No line items to convert' };
  }

  // Helper to infer trade code from category/name if not set
  const inferTradeCode = (item) => {
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
  };

  // Group line items by trade code to create loops
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

  // Sort trades by construction order
  const sortedTrades = Object.keys(tradeGroups).sort((a, b) => {
    const aIndex = TRADE_ORDER.indexOf(a);
    const bIndex = TRADE_ORDER.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  const createdLoops = [];
  const createdTasks = [];
  let loopOrder = 1;

  // Create a loop for each trade
  for (const tradeCode of sortedTrades) {
    const group = tradeGroups[tradeCode];
    const loopId = `loop-${projectId.slice(-8)}-${tradeCode}-${Date.now()}`;

    // Calculate budgeted amount for this trade
    const budgetedAmount = group.items.reduce((sum, item) => {
      const tierKey = `unitPrice${selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)}`;
      return sum + ((item[tierKey] || item.unitPriceBetter || 0) * (item.quantity || 1));
    }, 0);

    const loop = {
      id: loopId,
      project_id: projectId,
      name: group.tradeName,
      loop_type: 'task_group',
      category_code: tradeCode,
      status: 'pending',
      display_order: loopOrder++,
      source: 'estimate',
      health_score: 0,
      health_color: 'gray',
      // Budget tracking
      budgeted_amount: budgetedAmount,
      task_count: group.items.length,
    };

    // Create the loop
    const { data: createdLoop, error: loopError } = await createLoop(loop);
    if (loopError) {
      continue;
    }
    createdLoops.push(createdLoop || loop);

    // Create tasks for each line item in this trade
    let taskOrder = 1;
    for (const item of group.items) {
      const tierKey = `unitPrice${selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)}`;
      const amount = (item[tierKey] || item.unitPriceBetter || 0) * (item.quantity || 1);

      // Build task title with room context if available
      const taskTitle = item.roomLabel && item.roomLabel !== item.name
        ? `${item.name} - ${item.roomLabel}`
        : item.name;

      const task = {
        id: `task-${projectId.slice(-8)}-${tradeCode}-${taskOrder}-${Date.now()}`,
        loop_id: loopId,
        title: taskTitle,
        description: item.description || null,
        status: 'pending',
        priority: 2, // Medium priority by default
        category_code: tradeCode,
        subcategory_code: item.subCode || null,
        location: item.roomLabel || null, // Store room as location
        display_order: taskOrder++,
        source: 'estimate',
        // Budget tracking
        budgeted_amount: amount,
        quantity: item.quantity || 1,
        // Original estimate reference
        estimate_line_item_id: item.id,
      };

      const { data: createdTask, error: taskError } = await createTask(task);
      if (taskError) {
        continue;
      }
      createdTasks.push(createdTask || task);
    }
  }

  return {
    loops: createdLoops,
    tasks: createdTasks,
    error: null,
  };
}

/**
 * Generate loops and tasks from contractor intake instances
 * Instances contain the actual scope items with room/location context
 *
 * @param {string} projectId - Project ID
 * @param {Array} instances - Contractor intake instances
 * @param {string} buildTier - Selected build tier
 * @returns {Object} Created loops and tasks
 */
export async function generateScopeFromInstances(projectId, instances, buildTier = 'better') {
  if (!instances || instances.length === 0) {
    return { loops: [], tasks: [], error: 'No instances to convert' };
  }

  // Scope item names for display
  const SCOPE_ITEM_NAMES = {
    'fr-ext': 'Exterior Walls',
    'fr-int': 'Interior Walls',
    'fr-bearing': 'Bearing Walls',
    'fr-ceil': 'Ceiling Framing',
    'fr-floor': 'Floor Framing',
    'fr-truss': 'Roof Trusses',
    'fr-roof': 'Roof Framing',
    'fr-header': 'Headers/Beams',
    'el-rough': 'Electrical Rough-In',
    'el-finish': 'Electrical Finish',
    'pl-rough': 'Plumbing Rough-In',
    'pl-finish': 'Plumbing Finish',
    'hv-rough': 'HVAC Rough-In',
    'hv-finish': 'HVAC Finish',
    'dw-hang': 'Drywall Hang',
    'dw-tape': 'Drywall Tape & Mud',
    'pt-prime': 'Prime Coat',
    'pt-finish': 'Finish Paint',
    'fl-install': 'Flooring Install',
    'tl-install': 'Tile Install',
  };

  // Map scope item prefix to trade code
  const prefixToTrade = {
    'fr': 'FS', 'el': 'EL', 'pl': 'PL', 'hv': 'HV',
    'dw': 'DW', 'pt': 'PT', 'fl': 'FL', 'tl': 'TL',
    'fc': 'FC', 'cm': 'CM', 'dm': 'DM', 'rf': 'RF',
    'ia': 'IA', 'ee': 'EE', 'sr': 'SR', 'fn': 'FN',
    'sw': 'SW', 'ef': 'EF', 'fz': 'FZ',
  };

  // Group instances by trade code
  const tradeGroups = {};

  for (const instance of instances) {
    const scopeItemId = instance.scopeItemId || '';
    const prefix = scopeItemId.split('-')[0]?.toLowerCase();
    const tradeCode = prefixToTrade[prefix] || 'GN';

    if (!tradeGroups[tradeCode]) {
      tradeGroups[tradeCode] = {
        tradeName: TRADE_NAMES[tradeCode] || tradeCode,
        items: [],
      };
    }

    // Build a descriptive name with location context
    const itemName = SCOPE_ITEM_NAMES[scopeItemId] || scopeItemId || 'Item';
    const location = instance.level || instance.room || instance.location;
    const displayName = location && location !== itemName
      ? `${itemName} - ${location}`
      : itemName;

    tradeGroups[tradeCode].items.push({
      ...instance,
      displayName,
      itemName,
      location,
    });
  }

  // Sort trades by construction order
  const sortedTrades = Object.keys(tradeGroups).sort((a, b) => {
    const aIndex = TRADE_ORDER.indexOf(a);
    const bIndex = TRADE_ORDER.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  const createdLoops = [];
  const createdTasks = [];
  let loopOrder = 1;

  // Create a loop for each trade
  for (const tradeCode of sortedTrades) {
    const group = tradeGroups[tradeCode];
    const loopId = `loop-${projectId.slice(-8)}-${tradeCode}-${Date.now()}`;

    const loop = {
      id: loopId,
      project_id: projectId,
      name: group.tradeName,
      loop_type: 'trade',
      category_code: tradeCode,
      status: 'pending',
      display_order: loopOrder++,
      source: 'contractor_intake',
      health_score: 0,
      health_color: 'gray',
      task_count: group.items.length,
    };

    const { data: createdLoop, error: loopError } = await createLoop(loop);
    if (loopError) continue;
    createdLoops.push(createdLoop || loop);

    // Create tasks for each instance in this trade
    let taskOrder = 1;
    for (const item of group.items) {
      const task = {
        id: `task-${projectId.slice(-8)}-${tradeCode}-${taskOrder}-${Date.now()}`,
        loop_id: loopId,
        title: item.displayName,
        description: item.notes || null,
        status: 'pending',
        priority: 2,
        category_code: tradeCode,
        location: item.location || null,
        display_order: taskOrder++,
        source: 'contractor_intake',
        quantity: item.measurement || item.quantity || 1,
        unit: item.unit || null,
        scope_item_id: item.scopeItemId,
        instance_id: item.id,
      };

      const { data: createdTask, error: taskError } = await createTask(task);
      if (taskError) continue;
      createdTasks.push(createdTask || task);
    }
  }

  return {
    loops: createdLoops,
    tasks: createdTasks,
    error: null,
  };
}

/**
 * Generate loops and tasks from contractor scope object (legacy format)
 * Scope is organized by trade category with enabled flags and item quantities
 *
 * @param {string} projectId - Project ID
 * @param {Object} scope - Contractor scope object { tradeCode: { enabled, items: {} } }
 * @param {string} buildTier - Selected build tier
 * @returns {Object} Created loops and tasks
 */
export async function generateScopeFromContractorScope(projectId, scope, buildTier = 'better') {
  if (!scope || Object.keys(scope).length === 0) {
    return { loops: [], tasks: [], error: 'No scope to convert' };
  }

  // Get enabled categories with items
  const enabledCategories = Object.keys(scope).filter(code => {
    const cat = scope[code];
    if (!cat?.enabled) return false;
    const items = cat.items || {};
    return Object.values(items).some(item => item?.qty > 0);
  });

  if (enabledCategories.length === 0) {
    return { loops: [], tasks: [], error: 'No enabled scope items' };
  }

  // Sort by trade order
  const sortedCategories = enabledCategories.sort((a, b) => {
    const aIndex = TRADE_ORDER.indexOf(a);
    const bIndex = TRADE_ORDER.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  const createdLoops = [];
  const createdTasks = [];
  let loopOrder = 1;

  for (const tradeCode of sortedCategories) {
    const categoryData = scope[tradeCode];
    const items = categoryData.items || {};
    const loopId = `loop-${projectId.slice(-8)}-${tradeCode}-${Date.now()}`;

    const loop = {
      id: loopId,
      project_id: projectId,
      name: TRADE_NAMES[tradeCode] || tradeCode,
      loop_type: 'trade',
      category_code: tradeCode,
      status: 'pending',
      display_order: loopOrder++,
      source: 'contractor_intake',
      health_score: 0,
      health_color: 'gray',
    };

    const { data: createdLoop, error: loopError } = await createLoop(loop);
    if (loopError) continue;
    createdLoops.push(createdLoop || loop);

    // Create tasks for each scope item
    let taskOrder = 1;
    for (const [itemId, itemData] of Object.entries(items)) {
      if (!itemData || itemData.qty <= 0) continue;

      const taskTitle = itemData.name || itemData.scopeItemId || itemId;
      const location = itemData.level || itemData.room || null;
      const displayTitle = location && location !== taskTitle
        ? `${taskTitle} - ${location}`
        : taskTitle;

      const task = {
        id: `task-${projectId.slice(-8)}-${tradeCode}-${taskOrder}-${Date.now()}`,
        loop_id: loopId,
        title: displayTitle,
        description: itemData.notes || null,
        status: 'pending',
        priority: 2,
        category_code: tradeCode,
        location: location,
        display_order: taskOrder++,
        source: 'contractor_intake',
        quantity: itemData.qty || 1,
        unit: itemData.unit || null,
        scope_item_id: itemData.scopeItemId || itemId,
      };

      const { data: createdTask, error: taskError } = await createTask(task);
      if (taskError) continue;
      createdTasks.push(createdTask || task);
    }
  }

  return {
    loops: createdLoops,
    tasks: createdTasks,
    error: null,
  };
}

/**
 * Start production - transitions project from contracted to in_progress
 * and generates production scope from estimate if not already done
 *
 * @param {string} projectId - Project ID
 * @param {Object} project - Project data (must include estimate_line_items and build_tier)
 */
export async function startProduction(projectId, project) {
  // Merge new dates into intake_data (since most columns don't exist at top level)
  const updatedIntakeData = {
    ...(project?.intake_data || {}),
    phase_changed_at: new Date().toISOString(),
    actual_start: new Date().toISOString().split('T')[0],
  };

  // Update project to active phase
  // Note: 'status' column doesn't exist, only 'phase'. Use 'active' per PHASES definition.
  const { data: updatedProject, error: projectError } = await updateProjectPhase(projectId, {
    phase: 'active',
    intake_data: updatedIntakeData,
  });

  if (projectError) {
    return { data: null, error: projectError };
  }

  // Check if loops already exist for this project
  const { data: existingLoops } = await getLoops(projectId);

  let loops = existingLoops || [];
  let tasks = [];

  // Get estimate data from intake_data where EstimateBuilder saves it
  const intakeData = project?.intake_data || {};
  const lineItems = intakeData.estimate_line_items || project.estimate_line_items;
  const buildTier = intakeData.build_tier || project.build_tier || 'better';

  // Only generate scope if no loops exist yet
  if (loops.length === 0 && lineItems) {
    const { loops: newLoops, tasks: newTasks, error: scopeError } = await generateScopeFromEstimate(
      projectId,
      lineItems,
      buildTier
    );

    if (!scopeError) {
      loops = newLoops;
      tasks = newTasks;
    }
  }

  // Log activity
  await createActivityEntry({
    project_id: projectId,
    event_type: 'project.started',
    event_data: {
      loops_created: loops.length,
      tasks_created: tasks.length,
    },
    actor_name: 'System',
  });

  return {
    data: {
      project: updatedProject,
      loops,
      tasks,
    },
    error: null,
  };
}

/**
 * Sign contract - transitions project from quoted to contracted
 * and generates production scope from estimate
 *
 * @param {string} projectId - Project ID
 * @param {Object} contractData - Contract details
 * @param {number} contractData.contractValue - Agreed contract value
 * @param {string} contractData.selectedTier - Selected build tier
 * @param {Array} contractData.lineItems - Final estimate line items
 */
export async function signContract(projectId, contractData) {
  const { contractValue, selectedTier, lineItems } = contractData;

  // First fetch the current project to get existing intake_data
  const { data: currentProject, error: fetchError } = await getProject(projectId);
  if (fetchError) {
    return { data: null, error: fetchError };
  }

  // Merge new contract data into intake_data (since most columns don't exist at top level)
  const updatedIntakeData = {
    ...(currentProject?.intake_data || {}),
    phase_changed_at: new Date().toISOString(),
    contract_signed_at: new Date().toISOString(),
    build_tier: selectedTier,
    estimate_line_items: lineItems,
  };

  // Update project to contracted phase
  // Only 'phase' and 'contract_value' exist as top-level columns
  const { data: project, error: projectError } = await updateProjectPhase(projectId, {
    phase: 'contracted',
    contract_value: contractValue,
    intake_data: updatedIntakeData,
  });

  if (projectError) {
    return { data: null, error: projectError };
  }

  // Generate loops and tasks from estimate
  const { loops, tasks, error: scopeError } = await generateScopeFromEstimate(
    projectId,
    lineItems,
    selectedTier
  );

  // Log activity
  await createActivityEntry({
    project_id: projectId,
    event_type: 'contract.signed',
    event_data: {
      contract_value: contractValue,
      build_tier: selectedTier,
      loops_created: loops.length,
      tasks_created: tasks.length,
    },
    actor_name: 'System',
  });

  return {
    data: {
      project,
      loops,
      tasks,
    },
    error: null,
  };
}

// =============================================================================
// TASK TRACKER API - THREE AXIS MODEL
// =============================================================================

/**
 * Get all work categories (Axis 1)
 * Categories are fixed and never change after task creation
 */
// Task Tracker tables don't exist in DB yet - always use mock data
const USE_MOCK_TASK_TRACKER = true;

export async function getWorkCategories() {
  if (!isSupabaseConfigured() || USE_MOCK_TASK_TRACKER) {
    return { data: workCategories, error: null };
  }

  const { data, error } = await supabase
    .from('work_categories')
    .select('*')
    .order('display_order', { ascending: true });

  return { data, error };
}

/**
 * Get subcategories for a work category
 */
export async function getWorkSubcategories(categoryCode = null) {
  if (!isSupabaseConfigured() || USE_MOCK_TASK_TRACKER) {
    const filtered = categoryCode
      ? workSubcategories.filter(s => s.categoryCode === categoryCode)
      : workSubcategories;
    return { data: filtered, error: null };
  }

  let query = supabase
    .from('work_subcategories')
    .select('*')
    .order('display_order', { ascending: true });

  if (categoryCode) {
    query = query.eq('category_code', categoryCode);
  }

  const { data, error } = await query;
  return { data, error };
}

/**
 * Get all construction stages (Axis 2)
 * Stages are fixed and never change
 */
export async function getStages() {
  if (!isSupabaseConfigured() || USE_MOCK_TASK_TRACKER) {
    return { data: stages, error: null };
  }

  const { data, error } = await supabase
    .from('stages')
    .select('*')
    .order('stage_order', { ascending: true });

  return { data, error };
}

/**
 * Get all phases (for checklist filtering - orthogonal to stages)
 */
export async function getPhases() {
  if (!isSupabaseConfigured() || USE_MOCK_TASK_TRACKER) {
    return { data: phases, error: null };
  }

  const { data, error } = await supabase
    .from('phases')
    .select('*')
    .order('display_order', { ascending: true });

  return { data, error };
}

/**
 * Generate default locations for a project
 * Used when no specific location data exists
 */
function generateDefaultLocations(projectId) {
  return [
    { id: `loc-${projectId}-main`, projectId, parentId: null, name: 'Main House', locationType: 'building', path: 'Main House', displayOrder: 1 },
    { id: `loc-${projectId}-1f`, projectId, parentId: `loc-${projectId}-main`, name: '1st Floor', locationType: 'floor', path: 'Main House.1st Floor', displayOrder: 1 },
    { id: `loc-${projectId}-kit`, projectId, parentId: `loc-${projectId}-1f`, name: 'Kitchen', locationType: 'room', path: 'Main House.1st Floor.Kitchen', displayOrder: 1 },
    { id: `loc-${projectId}-living`, projectId, parentId: `loc-${projectId}-1f`, name: 'Living Room', locationType: 'room', path: 'Main House.1st Floor.Living Room', displayOrder: 2 },
    { id: `loc-${projectId}-bath1`, projectId, parentId: `loc-${projectId}-1f`, name: 'Bathroom', locationType: 'room', path: 'Main House.1st Floor.Bathroom', displayOrder: 3 },
    { id: `loc-${projectId}-2f`, projectId, parentId: `loc-${projectId}-main`, name: '2nd Floor', locationType: 'floor', path: 'Main House.2nd Floor', displayOrder: 2 },
    { id: `loc-${projectId}-primary`, projectId, parentId: `loc-${projectId}-2f`, name: 'Primary Bedroom', locationType: 'room', path: 'Main House.2nd Floor.Primary Bedroom', displayOrder: 1 },
    { id: `loc-${projectId}-pbath`, projectId, parentId: `loc-${projectId}-2f`, name: 'Primary Bath', locationType: 'room', path: 'Main House.2nd Floor.Primary Bath', displayOrder: 2 },
  ];
}

/**
 * Get locations for a project (Axis 3)
 */
export async function getProjectLocations(projectId) {
  if (!isSupabaseConfigured() || USE_MOCK_TASK_TRACKER) {
    const existingLocations = mockTaskTrackerLocations[projectId];
    if (existingLocations && existingLocations.length > 0) {
      return { data: existingLocations, error: null };
    }
    // Generate default locations for projects without specific data
    return { data: generateDefaultLocations(projectId), error: null };
  }

  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('project_id', projectId)
    .order('display_order', { ascending: true });

  return { data, error };
}

/**
 * Get task templates for a project (quantum state)
 */
export async function getTaskTemplates(projectId) {
  if (!isSupabaseConfigured() || USE_MOCK_TASK_TRACKER) {
    return { data: mockTaskTemplates[projectId] || [], error: null };
  }

  const { data, error } = await supabase
    .from('task_templates')
    .select('*')
    .eq('project_id', projectId)
    .order('stage_order', { ascending: true });

  return { data, error };
}

/**
 * Generate default task instances for a project
 * Creates sample tasks across different categories, stages, and locations
 */
function generateDefaultTaskInstances(projectId) {
  const locations = generateDefaultLocations(projectId);
  const kitchenLoc = locations.find(l => l.name === 'Kitchen');
  const livingLoc = locations.find(l => l.name === 'Living Room');
  const bathLoc = locations.find(l => l.name === 'Bathroom');
  const primaryLoc = locations.find(l => l.name === 'Primary Bedroom');
  const pbathLoc = locations.find(l => l.name === 'Primary Bath');

  const today = new Date();
  const formatDate = (daysFromNow) => {
    const d = new Date(today);
    d.setDate(d.getDate() + daysFromNow);
    return d.toISOString().split('T')[0];
  };

  return [
    // Electrical tasks
    { id: `inst-${projectId}-el-001`, templateId: 'tpl-el-rough', locationId: kitchenLoc?.id, categoryCode: 'EL', subcategoryCode: 'EL-SVC', stageCode: 'ST-RI', locationPath: kitchenLoc?.path, name: 'Rough-In Electrical - Kitchen', status: 'in_progress', priority: 1, dueDate: formatDate(3), assignedTo: 'c1', estimatedHours: 8 },
    { id: `inst-${projectId}-el-002`, templateId: 'tpl-el-rough', locationId: livingLoc?.id, categoryCode: 'EL', subcategoryCode: 'EL-SVC', stageCode: 'ST-RI', locationPath: livingLoc?.path, name: 'Rough-In Electrical - Living Room', status: 'pending', priority: 2, dueDate: formatDate(5), estimatedHours: 6 },
    { id: `inst-${projectId}-el-003`, templateId: 'tpl-el-trim', locationId: kitchenLoc?.id, categoryCode: 'EL', subcategoryCode: 'EL-FX', stageCode: 'ST-FX', locationPath: kitchenLoc?.path, name: 'Trim Electrical - Kitchen', status: 'pending', priority: 3, dueDate: formatDate(14), estimatedHours: 4 },

    // Plumbing tasks
    { id: `inst-${projectId}-pl-001`, templateId: 'tpl-pl-rough', locationId: bathLoc?.id, categoryCode: 'PL', subcategoryCode: 'PL-DWV', stageCode: 'ST-RI', locationPath: bathLoc?.path, name: 'Rough-In Plumbing - Bathroom', status: 'complete', priority: 1, dueDate: formatDate(-2), assignedTo: 'c2', estimatedHours: 6, actualHours: 7 },
    { id: `inst-${projectId}-pl-002`, templateId: 'tpl-pl-rough', locationId: pbathLoc?.id, categoryCode: 'PL', subcategoryCode: 'PL-DWV', stageCode: 'ST-RI', locationPath: pbathLoc?.path, name: 'Rough-In Plumbing - Primary Bath', status: 'in_progress', priority: 1, dueDate: formatDate(2), assignedTo: 'c2', estimatedHours: 8 },
    { id: `inst-${projectId}-pl-003`, templateId: 'tpl-pl-fixtures', locationId: bathLoc?.id, categoryCode: 'PL', subcategoryCode: 'PL-FX', stageCode: 'ST-FX', locationPath: bathLoc?.path, name: 'Install Fixtures - Bathroom', status: 'pending', priority: 2, dueDate: formatDate(12), estimatedHours: 4 },

    // Drywall tasks
    { id: `inst-${projectId}-dw-001`, templateId: 'tpl-dw-hang', locationId: kitchenLoc?.id, categoryCode: 'DW', stageCode: 'ST-RI', locationPath: kitchenLoc?.path, name: 'Hang Drywall - Kitchen', status: 'pending', priority: 2, dueDate: formatDate(7), estimatedHours: 8 },
    { id: `inst-${projectId}-dw-002`, templateId: 'tpl-dw-hang', locationId: livingLoc?.id, categoryCode: 'DW', stageCode: 'ST-RI', locationPath: livingLoc?.path, name: 'Hang Drywall - Living Room', status: 'pending', priority: 2, dueDate: formatDate(8), estimatedHours: 10 },
    { id: `inst-${projectId}-dw-003`, templateId: 'tpl-dw-finish', locationId: kitchenLoc?.id, categoryCode: 'DW', stageCode: 'ST-FN', locationPath: kitchenLoc?.path, name: 'Tape & Finish - Kitchen', status: 'pending', priority: 3, dueDate: formatDate(10), estimatedHours: 6 },

    // Tile tasks
    { id: `inst-${projectId}-tl-001`, templateId: 'tpl-tl-floor', locationId: bathLoc?.id, categoryCode: 'TL', stageCode: 'ST-FN', locationPath: bathLoc?.path, name: 'Floor Tile - Bathroom', status: 'pending', priority: 2, dueDate: formatDate(15), estimatedHours: 8 },
    { id: `inst-${projectId}-tl-002`, templateId: 'tpl-tl-shower', locationId: pbathLoc?.id, categoryCode: 'TL', stageCode: 'ST-FN', locationPath: pbathLoc?.path, name: 'Shower Tile - Primary Bath', status: 'pending', priority: 2, dueDate: formatDate(16), estimatedHours: 12 },

    // Framing tasks
    { id: `inst-${projectId}-fr-001`, templateId: 'tpl-fr-walls', locationId: primaryLoc?.id, categoryCode: 'FR', stageCode: 'ST-FR', locationPath: primaryLoc?.path, name: 'Interior Framing - Primary Bedroom', status: 'complete', priority: 1, dueDate: formatDate(-5), assignedTo: 'c3', estimatedHours: 6, actualHours: 5 },
    { id: `inst-${projectId}-fr-002`, templateId: 'tpl-fr-walls', locationId: bathLoc?.id, categoryCode: 'FR', stageCode: 'ST-FR', locationPath: bathLoc?.path, name: 'Interior Framing - Bathroom', status: 'complete', priority: 1, dueDate: formatDate(-4), assignedTo: 'c3', estimatedHours: 4, actualHours: 4 },
  ];
}

/**
 * Convert estimate-based loop tasks to Task Tracker instance format
 * This allows the LoopsView to display tasks generated from estimates
 *
 * If no tasks exist for a loop, creates a single task representing the loop itself
 */
function convertLoopTasksToInstances(projectId, loops, tasksMap) {
  const instances = [];
  let priority = 1;

  for (const loop of loops) {
    const loopTasks = tasksMap[loop.id] || [];

    if (loopTasks.length > 0) {
      // Convert actual tasks from the loop
      for (const task of loopTasks) {
        instances.push({
          id: task.id,
          projectId,
          templateId: null,
          categoryCode: task.category_code || loop.category_code,
          subcategoryCode: task.subcategory_code || null,
          stageCode: 'ST-RI', // Default to rough-in stage
          locationId: null,
          locationPath: task.location || null,
          name: task.title || task.name,
          description: task.description || '',
          status: task.status || 'pending',
          priority: priority++,
          assignedTo: task.assigned_to || null,
          dueDate: task.due_date || null,
          estimatedHours: task.estimated_hours || 0,
          actualHours: task.actual_hours || 0,
          source: task.source || 'estimate',
          // Preserve budget info
          budgetedAmount: task.budgeted_amount || 0,
          quantity: task.quantity || 1,
          loopId: loop.id,
          loopName: loop.name,
        });
      }
    } else {
      // No tasks in this loop - create a placeholder task from the loop itself
      // This ensures loops without individual tasks still appear in the task tracker
      instances.push({
        id: `inst-${loop.id}`,
        projectId,
        templateId: null,
        categoryCode: loop.category_code,
        subcategoryCode: null,
        stageCode: 'ST-RI',
        locationId: null,
        locationPath: null,
        name: loop.name,
        description: `${loop.name} scope from estimate`,
        status: loop.status || 'pending',
        priority: priority++,
        assignedTo: null,
        dueDate: null,
        estimatedHours: 0,
        actualHours: 0,
        source: 'estimate',
        budgetedAmount: loop.budgeted_amount || 0,
        quantity: loop.task_count || 1,
        loopId: loop.id,
        loopName: loop.name,
      });
    }
  }

  return instances;
}

/**
 * Convert loops and their tasks from DB to task instances
 * Fetches tasks from Supabase for each loop
 */
async function convertLoopTasksToInstancesFromDB(projectId, loops) {
  const instances = [];
  let priority = 1;

  for (const loop of loops) {
    // Fetch tasks for this loop from DB
    const { data: loopTasks } = await getTasks(loop.id);
    const tasks = loopTasks || [];

    if (tasks.length > 0) {
      // Convert actual tasks from the loop
      for (const task of tasks) {
        instances.push({
          id: task.id,
          projectId,
          templateId: null,
          categoryCode: task.category_code || loop.category_code,
          subcategoryCode: task.subcategory_code || null,
          stageCode: 'ST-RI',
          locationId: null,
          locationPath: task.location || null,
          name: task.title || task.name,
          description: task.description || '',
          status: task.status || 'pending',
          priority: priority++,
          assignedTo: task.assigned_to || null,
          dueDate: task.due_date || null,
          estimatedHours: task.estimated_hours || 0,
          actualHours: task.actual_hours || 0,
          source: task.source || loop.source || 'contractor_intake',
          budgetedAmount: task.budgeted_amount || 0,
          quantity: task.quantity || 1,
          loopId: loop.id,
          loopName: loop.name,
        });
      }
    } else {
      // No tasks in this loop - create a placeholder from the loop itself
      instances.push({
        id: `inst-${loop.id}`,
        projectId,
        templateId: null,
        categoryCode: loop.category_code,
        subcategoryCode: null,
        stageCode: 'ST-RI',
        locationId: null,
        locationPath: null,
        name: loop.name,
        description: `${loop.name} scope`,
        status: loop.status || 'pending',
        priority: priority++,
        assignedTo: null,
        dueDate: null,
        estimatedHours: 0,
        actualHours: 0,
        source: loop.source || 'contractor_intake',
        budgetedAmount: loop.budgeted_amount || 0,
        quantity: loop.task_count || 1,
        loopId: loop.id,
        loopName: loop.name,
      });
    }
  }

  return instances;
}

/**
 * Get task instances for a project with optional filtering
 */
export async function getTaskInstances(projectId, filters = {}) {
  // Always fetch loops from the proper source (Supabase if configured, otherwise mockLoops)
  const { data: projectLoops } = await getLoops(projectId);
  const loopsArray = projectLoops || [];

  if (!isSupabaseConfigured() || USE_MOCK_TASK_TRACKER) {
    // Check for scope-generated loops (from estimate or contractor intake)
    const hasScopeLoops = loopsArray.some(loop =>
      loop.source === 'estimate' || loop.source === 'contractor_intake'
    );

    let instances;

    // If we have scope-based loops, use those (ignore cached mockTaskInstances)
    if (hasScopeLoops && loopsArray.length > 0) {
      // Check if existing instances are from scope or stale mock data
      const existingInstances = mockTaskInstances[projectId] || [];
      const existingAreFromScope = existingInstances.some(inst =>
        inst.source === 'estimate' || inst.source === 'contractor_intake'
      );

      // Also check if the existing instances match the current loops
      // (in case loops were regenerated but instances weren't)
      const existingLoopIds = new Set(existingInstances.map(inst => inst.loopId).filter(Boolean));
      const currentLoopIds = new Set(loopsArray.map(loop => loop.id));
      const loopsMatch = currentLoopIds.size > 0 &&
        [...currentLoopIds].every(id => existingLoopIds.has(id));

      // Regenerate from loops if:
      // 1. No existing instances, OR
      // 2. Existing instances aren't from scope, OR
      // 3. Loop IDs don't match (loops were regenerated)
      if (!existingAreFromScope || existingInstances.length === 0 || !loopsMatch) {
        instances = await convertLoopTasksToInstancesFromDB(projectId, loopsArray);
        // Store these instances so updates persist
        if (instances.length > 0) {
          mockTaskInstances[projectId] = instances;
          saveTaskTrackerToStorage();
        }
      } else {
        instances = existingInstances;
      }
    } else if (loopsArray.length > 0) {
      // Non-scope loops exist, convert them
      instances = await convertLoopTasksToInstancesFromDB(projectId, loopsArray);
    } else {
      // No loops at all - check for existing instances or generate defaults
      instances = mockTaskInstances[projectId];
      if (!instances || instances.length === 0) {
        instances = generateDefaultTaskInstances(projectId);
      }
    }

    // Apply filters
    if (filters.categoryCode) {
      instances = instances.filter(t => t.categoryCode === filters.categoryCode);
    }
    if (filters.stageCode) {
      instances = instances.filter(t => t.stageCode === filters.stageCode);
    }
    if (filters.locationId) {
      instances = instances.filter(t => t.locationId === filters.locationId);
    }
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        instances = instances.filter(t => filters.status.includes(t.status));
      } else {
        instances = instances.filter(t => t.status === filters.status);
      }
    }
    if (filters.assignedTo) {
      instances = instances.filter(t => t.assignedTo === filters.assignedTo);
    }
    if (filters.locationPath) {
      instances = instances.filter(t => t.locationPath?.startsWith(filters.locationPath));
    }

    // Attach checklists to each instance
    const instancesWithChecklists = instances.map(inst => {
      const checklist = getChecklistForTask(inst.categoryCode, inst.name, inst.stageCode);
      const fieldGuideModules = getFieldGuideModules(inst.categoryCode);
      return {
        ...inst,
        checklist: checklist || null,
        fieldGuideModules,
      };
    });

    return { data: instancesWithChecklists, error: null };
  }

  let query = supabase
    .from('task_instances')
    .select('*')
    .eq('project_id', projectId);

  if (filters.categoryCode) {
    query = query.eq('category_code', filters.categoryCode);
  }
  if (filters.stageCode) {
    query = query.eq('stage_code', filters.stageCode);
  }
  if (filters.locationId) {
    query = query.eq('location_id', filters.locationId);
  }
  if (filters.status) {
    if (Array.isArray(filters.status)) {
      query = query.in('status', filters.status);
    } else {
      query = query.eq('status', filters.status);
    }
  }
  if (filters.assignedTo) {
    query = query.eq('assigned_to', filters.assignedTo);
  }

  const { data, error } = await query.order('priority', { ascending: true });
  return { data, error };
}

/**
 * Get a single task instance by ID
 */
export async function getTaskInstance(instanceId) {
  if (!isSupabaseConfigured() || USE_MOCK_PROJECTS) {
    for (const instances of Object.values(mockTaskInstances)) {
      const instance = instances.find(t => t.id === instanceId);
      if (instance) return { data: instance, error: null };
    }
    return { data: null, error: 'Not found' };
  }

  const { data, error } = await supabase
    .from('task_instances')
    .select('*')
    .eq('id', instanceId)
    .single();

  return { data, error };
}

/**
 * Update a task instance
 */
export async function updateTaskInstance(instanceId, updates) {
  if (!isSupabaseConfigured() || USE_MOCK_TASK_TRACKER) {
    // Find and update in mock data
    for (const projectId of Object.keys(mockTaskInstances)) {
      const index = mockTaskInstances[projectId].findIndex(t => t.id === instanceId);
      if (index !== -1) {
        mockTaskInstances[projectId][index] = {
          ...mockTaskInstances[projectId][index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        if (updates.status === 'completed') {
          mockTaskInstances[projectId][index].completedAt = new Date().toISOString();
        }
        saveTaskTrackerToStorage();
        return { data: mockTaskInstances[projectId][index], error: null };
      }
    }
    return { data: null, error: 'Not found' };
  }

  const updateData = {
    ...updates,
    updated_at: new Date().toISOString(),
  };
  if (updates.status === 'completed') {
    updateData.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('task_instances')
    .update(updateData)
    .eq('id', instanceId)
    .select()
    .single();

  return { data, error };
}

/**
 * Create a new task instance
 */
export async function createTaskInstance(projectId, taskData) {
  const newInstance = {
    id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    projectId,
    templateId: null, // Manually created tasks don't have templates
    categoryCode: taskData.categoryCode,
    subcategoryId: taskData.subcategoryId || null,
    stageCode: taskData.stageCode,
    locationId: taskData.locationId || null,
    locationPath: taskData.locationPath || null,
    name: taskData.name,
    description: taskData.description || '',
    status: 'pending',
    priority: taskData.priority || 3,
    assignedTo: taskData.assignedTo || null,
    dueDate: taskData.dueDate || null,
    estimatedHours: taskData.estimatedHours || 0,
    actualHours: 0,
    reworkCount: 0,
    reworkHours: 0,
    dependencyOverrides: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null,
    source: 'manual',
  };

  if (!isSupabaseConfigured() || USE_MOCK_TASK_TRACKER) {
    // Add to mock data
    if (!mockTaskInstances[projectId]) {
      mockTaskInstances[projectId] = [];
    }
    mockTaskInstances[projectId].push(newInstance);
    saveTaskTrackerToStorage();

    // Attach checklist (same logic as getTaskInstances)
    const checklist = getChecklistForTask(newInstance.categoryCode, newInstance.name, newInstance.stageCode);
    const fieldGuideModules = getFieldGuideModules(newInstance.categoryCode);

    return {
      data: {
        ...newInstance,
        checklist: checklist || null,
        fieldGuideModules,
      },
      error: null,
    };
  }

  // Supabase insert
  const { data, error } = await supabase
    .from('task_instances')
    .insert({
      project_id: projectId,
      template_id: null,
      category_code: taskData.categoryCode,
      subcategory_id: taskData.subcategoryId || null,
      stage_code: taskData.stageCode,
      location_id: taskData.locationId || null,
      location_path: taskData.locationPath || null,
      name: taskData.name,
      description: taskData.description || '',
      status: 'pending',
      priority: taskData.priority || 3,
      assigned_to: taskData.assignedTo || null,
      due_date: taskData.dueDate || null,
      estimated_hours: taskData.estimatedHours || 0,
      source: 'manual',
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Get phase checklists for a template
 */
export async function getPhaseChecklists(templateId, phaseFilter = null) {
  if (!isSupabaseConfigured() || USE_MOCK_PROJECTS) {
    let checklists = defaultPhaseChecklists[templateId] || [];
    if (phaseFilter) {
      checklists = checklists.filter(c => c.phaseCode === phaseFilter);
    }
    return { data: checklists, error: null };
  }

  let query = supabase
    .from('task_phase_checklists')
    .select('*')
    .eq('template_id', templateId)
    .order('step_order', { ascending: true });

  if (phaseFilter) {
    query = query.eq('phase_code', phaseFilter);
  }

  const { data, error } = await query;
  return { data, error };
}

/**
 * Get contacts (for assignments)
 */
export async function getContacts() {
  if (!isSupabaseConfigured() || USE_MOCK_TASK_TRACKER) {
    return { data: mockContacts, error: null };
  }

  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .order('name', { ascending: true });

  return { data, error };
}

/**
 * Calculate loop status from task instances (status bubbles UP)
 */
export function calculateLoopStatus(instances) {
  if (!instances || instances.length === 0) return 'gray';

  const hasBlocked = instances.some(t => t.status === 'blocked');
  const hasOverdue = instances.some(t => {
    if (t.status === 'completed' || t.status === 'cancelled') return false;
    if (!t.dueDate) return false;
    return new Date(t.dueDate) < new Date();
  });
  const hasNearDue = instances.some(t => {
    if (t.status === 'completed' || t.status === 'cancelled') return false;
    if (!t.dueDate) return false;
    const due = new Date(t.dueDate);
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
    return due <= twoDaysFromNow && due >= new Date();
  });
  const allComplete = instances.every(t =>
    t.status === 'completed' || t.status === 'cancelled'
  );
  const hasInProgress = instances.some(t => t.status === 'in_progress');

  if (hasBlocked || hasOverdue) return 'red';
  if (hasNearDue) return 'yellow';
  if (allComplete) return 'complete';
  if (hasInProgress) return 'green';
  return 'gray';
}

/**
 * Group task instances by work category for loop view
 */
export function groupTasksByCategory(instances, categories) {
  const grouped = {};

  // Initialize all categories
  categories.forEach(cat => {
    grouped[cat.code] = {
      category: cat,
      instances: [],
      status: 'gray',
      completedCount: 0,
      totalCount: 0,
    };
  });

  // Group instances
  instances.forEach(inst => {
    if (grouped[inst.categoryCode]) {
      grouped[inst.categoryCode].instances.push(inst);
      grouped[inst.categoryCode].totalCount++;
      if (inst.status === 'completed') {
        grouped[inst.categoryCode].completedCount++;
      }
    }
  });

  // Calculate status for each category
  Object.values(grouped).forEach(group => {
    group.status = calculateLoopStatus(group.instances);
  });

  // Filter out empty categories and sort by display order
  return Object.values(grouped)
    .filter(g => g.totalCount > 0)
    .sort((a, b) => a.category.displayOrder - b.category.displayOrder);
}

/**
 * Group task instances by subcategory within a category
 */
export function groupTasksBySubcategory(instances, subcategories) {
  const grouped = {};

  // Group instances by subcategory, or by location if no subcategory
  instances.forEach(inst => {
    const subcat = subcategories.find(s => s.id === inst.subcategoryId);

    // Determine grouping key and name
    let key, groupName;
    if (subcat) {
      key = subcat.id;
      groupName = subcat.name;
    } else if (inst.locationName || inst.location) {
      // Group by location if no subcategory
      key = `loc-${inst.locationId || inst.location || 'other'}`;
      groupName = inst.locationName || inst.location || 'Other';
    } else {
      key = 'uncategorized';
      groupName = 'Other';
    }

    if (!grouped[key]) {
      grouped[key] = {
        subcategory: subcat || { id: key, name: groupName, displayOrder: subcat?.displayOrder || 999 },
        instances: [],
        status: 'gray',
        completedCount: 0,
        totalCount: 0,
      };
    }

    grouped[key].instances.push(inst);
    grouped[key].totalCount++;
    if (inst.status === 'completed') {
      grouped[key].completedCount++;
    }
  });

  // Calculate status for each subcategory
  Object.values(grouped).forEach(group => {
    group.status = calculateLoopStatus(group.instances);
  });

  // Sort by display order
  return Object.values(grouped)
    .sort((a, b) => a.subcategory.displayOrder - b.subcategory.displayOrder);
}

// =============================================================================
// MATERIAL SELECTIONS API
// =============================================================================

/**
 * Get all material selections for a project
 */
export async function getMaterialSelections(projectId, filters = {}) {
  if (!isSupabaseConfigured() || USE_MOCK_PROJECTS) {
    const projectSelections = mockMaterialSelections[projectId] || [];

    // Apply filters
    let filtered = [...projectSelections];

    if (filters.categoryCode) {
      filtered = filtered.filter(s => s.categoryCode === filters.categoryCode);
    }
    if (filters.subcategoryCode) {
      filtered = filtered.filter(s => s.subcategoryCode === filters.subcategoryCode);
    }
    if (filters.status) {
      filtered = filtered.filter(s => s.status === filters.status);
    }
    if (filters.roomId) {
      filtered = filtered.filter(s => s.roomId === filters.roomId);
    }
    if (filters.tradeCode) {
      filtered = filtered.filter(s => s.tradeCode === filters.tradeCode);
    }
    if (filters.phaseCode) {
      filtered = filtered.filter(s => s.phaseCode === filters.phaseCode);
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(s =>
        s.itemName?.toLowerCase().includes(searchLower) ||
        s.manufacturer?.toLowerCase().includes(searchLower) ||
        s.modelNumber?.toLowerCase().includes(searchLower)
      );
    }

    return { data: filtered, error: null };
  }

  // Supabase implementation
  try {
    let query = supabase
      .from('material_selections')
      .select('*')
      .eq('project_id', projectId);

    if (filters.categoryCode) query = query.eq('category_code', filters.categoryCode);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.roomId) query = query.eq('room_id', filters.roomId);

    const { data, error } = await query.order('created_at', { ascending: false });

    // If Supabase returns an error (e.g., table doesn't exist), fall back to mock data
    if (error) {
      const projectSelections = mockMaterialSelections[projectId] || [];
      return { data: projectSelections, error: null };
    }

    return { data, error };
  } catch {
    const projectSelections = mockMaterialSelections[projectId] || [];
    return { data: projectSelections, error: null };
  }
}

/**
 * Get a single material selection by ID
 */
export async function getMaterialSelection(projectId, selectionId) {
  if (!isSupabaseConfigured() || USE_MOCK_PROJECTS) {
    const projectSelections = mockMaterialSelections[projectId] || [];
    const selection = projectSelections.find(s => s.id === selectionId);
    return { data: selection || null, error: selection ? null : 'Not found' };
  }

  try {
    const { data, error } = await supabase
      .from('material_selections')
      .select('*')
      .eq('id', selectionId)
      .single();

    if (error) {
      const projectSelections = mockMaterialSelections[projectId] || [];
      const selection = projectSelections.find(s => s.id === selectionId);
      return { data: selection || null, error: selection ? null : 'Not found' };
    }

    return { data, error };
  } catch {
    const projectSelections = mockMaterialSelections[projectId] || [];
    const selection = projectSelections.find(s => s.id === selectionId);
    return { data: selection || null, error: selection ? null : 'Not found' };
  }
}

/**
 * Create a new material selection
 */
export async function createMaterialSelection(projectId, selectionData) {
  const newSelection = {
    id: crypto.randomUUID(),
    projectId,
    ...selectionData,
    status: selectionData.status || 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (!isSupabaseConfigured() || USE_MOCK_PROJECTS) {
    if (!mockMaterialSelections[projectId]) {
      mockMaterialSelections[projectId] = [];
    }
    mockMaterialSelections[projectId].unshift(newSelection);
    saveMaterialSelectionsToStorage();
    return { data: newSelection, error: null };
  }

  const { data, error } = await supabase
    .from('material_selections')
    .insert({
      ...newSelection,
      project_id: projectId,
      category_code: selectionData.categoryCode,
      subcategory_code: selectionData.subcategoryCode,
      trade_code: selectionData.tradeCode,
      room_id: selectionData.roomId,
      phase_code: selectionData.phaseCode,
      item_name: selectionData.itemName,
      model_number: selectionData.modelNumber,
      cost_per_unit: selectionData.costPerUnit,
      unit_of_measurement: selectionData.unitOfMeasurement,
      allowance_amount: selectionData.allowanceAmount,
      supplier_url: selectionData.supplierUrl,
      lead_time_days: selectionData.leadTimeDays,
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Update a material selection
 */
export async function updateMaterialSelection(projectId, selectionId, updates) {
  if (!isSupabaseConfigured() || USE_MOCK_PROJECTS) {
    const projectSelections = mockMaterialSelections[projectId] || [];
    const index = projectSelections.findIndex(s => s.id === selectionId);

    if (index === -1) {
      return { data: null, error: 'Selection not found' };
    }

    const updated = {
      ...projectSelections[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    mockMaterialSelections[projectId][index] = updated;
    saveMaterialSelectionsToStorage();
    return { data: updated, error: null };
  }

  const { data, error } = await supabase
    .from('material_selections')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', selectionId)
    .select()
    .single();

  return { data, error };
}

/**
 * Delete a material selection
 */
export async function deleteMaterialSelection(projectId, selectionId) {
  if (!isSupabaseConfigured() || USE_MOCK_PROJECTS) {
    const projectSelections = mockMaterialSelections[projectId] || [];
    const index = projectSelections.findIndex(s => s.id === selectionId);

    if (index === -1) {
      return { data: null, error: 'Selection not found' };
    }

    mockMaterialSelections[projectId].splice(index, 1);
    saveMaterialSelectionsToStorage();
    return { data: { id: selectionId }, error: null };
  }

  const { data, error } = await supabase
    .from('material_selections')
    .delete()
    .eq('id', selectionId);

  return { data, error };
}

/**
 * Update selection status (workflow advancement)
 */
export async function updateSelectionStatus(projectId, selectionId, newStatus) {
  return updateMaterialSelection(projectId, selectionId, { status: newStatus });
}

/**
 * Get selection reference data (categories, statuses, phases, trades)
 */
export function getSelectionReferenceData() {
  return {
    categories: selectionCategories,
    statuses: selectionStatuses,
    phases: selectionPhases,
    trades,
  };
}

/**
 * Get rooms for a project (for selection assignment)
 */
export function getProjectRooms(projectId) {
  const locations = mockTaskTrackerLocations[projectId] || [];
  // Filter to only room-type locations
  return locations.filter(loc => loc.locationType === 'room');
}

/**
 * Selection prediction keywords - maps task keywords to selection categories/subcategories
 */
const selectionKeywords = {
  // Plumbing
  'PL-KSK': ['kitchen sink', 'sink', 'undermount sink', 'farmhouse sink'],
  'PL-KFA': ['kitchen faucet', 'faucet'],
  'PL-BSK': ['bathroom sink', 'vanity sink', 'vessel sink', 'pedestal sink'],
  'PL-BFA': ['bathroom faucet', 'lavatory faucet'],
  'PL-TOI': ['toilet', 'water closet', 'commode'],
  'PL-SHB': ['shower pan', 'shower base', 'shower receptor'],
  'PL-SHF': ['shower fixtures', 'shower valve', 'showerhead', 'shower trim', 'shower door'],
  'PL-TUB': ['bathtub', 'tub', 'soaking tub', 'freestanding tub'],
  'PL-TBF': ['tub faucet', 'tub fixtures', 'tub spout'],
  'PL-GRB': ['garbage disposal', 'disposer'],
  'PL-WHT': ['water heater', 'tankless', 'hot water'],

  // Electrical
  'EL-LTC': ['light fixture', 'ceiling light', 'chandelier', 'pendant light', 'flush mount'],
  'EL-LTW': ['wall sconce', 'vanity light', 'wall light'],
  'EL-LTE': ['exterior light', 'outdoor light', 'porch light'],
  'EL-REC': ['recessed light', 'can light', 'pot light', 'downlight'],
  'EL-UCL': ['under-cabinet', 'under cabinet', 'task lighting'],
  'EL-FAN': ['ceiling fan', 'fan'],
  'EL-COV': ['outlet cover', 'switch cover', 'plate'],
  'EL-SMT': ['smart', 'thermostat', 'doorbell'],

  // Flooring
  'FL-HWD': ['hardwood', 'wood floor', 'oak floor', 'maple floor', 'install flooring', 'flooring'],
  'FL-LAM': ['laminate'],
  'FL-LVP': ['lvp', 'vinyl plank', 'luxury vinyl'],
  'FL-TIL': ['tile floor', 'floor tile', 'porcelain floor'],
  'FL-CPT': ['carpet'],

  // Tile
  'TL-BSP': ['backsplash', 'kitchen tile'],
  'TL-BFL': ['bathroom floor tile', 'bath floor'],
  'TL-SHW': ['shower tile', 'wall tile', 'surround'],
  'TL-ACC': ['accent tile', 'niche tile', 'border tile'],

  // Cabinetry
  'CB-KUP': ['upper cabinet', 'wall cabinet'],
  'CB-KLO': ['lower cabinet', 'base cabinet', 'install cabinet', 'cabinets'],
  'CB-KIS': ['island', 'kitchen island'],
  'CB-VAN': ['vanity', 'bathroom vanity', 'install vanity'],
  'CB-LAU': ['laundry cabinet'],

  // Countertops
  'CT-KIT': ['countertop', 'counter', 'quartz', 'granite', 'butcher block'],
  'CT-BTH': ['vanity top', 'bathroom counter'],

  // Finish Carpentry
  'FC-IDR': ['interior door', 'bedroom door', 'closet door'],
  'FC-BAS': ['baseboard', 'base trim'],
  'FC-DCS': ['door casing', 'door trim'],
  'FC-WCS': ['window casing', 'window trim'],
  'FC-CRN': ['crown', 'crown molding'],
  'FC-CLS': ['closet shelving', 'wire shelf', 'closet system'],

  // Hardware
  'HW-PUL': ['cabinet pull', 'drawer pull', 'handle'],
  'HW-KNB': ['cabinet knob', 'knob'],
  'HW-DHN': ['door handle', 'door hardware', 'lever', 'lockset'],

  // Appliances
  'AP-REF': ['refrigerator', 'fridge', 'install appliances', 'appliances'],
  'AP-RNG': ['range', 'oven', 'stove', 'cooktop'],
  'AP-DSH': ['dishwasher'],
  'AP-MIC': ['microwave'],
  'AP-HRF': ['hood', 'range hood', 'vent hood', 'exhaust'],
  'AP-WAS': ['washer', 'washing machine'],
  'AP-DRY': ['dryer'],

  // Paint
  'PT-WAL': ['paint wall', 'wall paint', 'paint', 'prime and paint'],
  'PT-TRM': ['paint trim'],
  'PT-CLG': ['ceiling paint', 'paint ceiling'],
  'PT-STN': ['stain'],
};

/**
 * Get suggested selections based on project tasks
 * Analyzes task titles to predict what material selections will be needed
 */
export function getSuggestedSelections(projectId) {
  // Get all loops for this project (mockLoops is keyed by projectId)
  const projectLoops = mockLoops[projectId] || [];

  // Collect all tasks from all loops
  const allTasks = [];
  for (const loop of projectLoops) {
    const loopTasks = mockTasks[loop.id] || [];
    allTasks.push(...loopTasks);
  }

  // Get existing selections for this project
  const existingSelections = mockMaterialSelections[projectId] || [];
  const existingSubcodes = existingSelections.map(s => s.subcategoryCode);

  // Find matching selections needed
  const suggestions = [];
  const foundSubcodes = new Set();

  for (const task of allTasks) {
    const titleLower = task.title.toLowerCase();

    for (const [subcode, keywords] of Object.entries(selectionKeywords)) {
      // Skip if we already have this selection or already suggested it
      if (existingSubcodes.includes(subcode) || foundSubcodes.has(subcode)) continue;

      for (const keyword of keywords) {
        if (titleLower.includes(keyword)) {
          // Find category and subcategory info
          let categoryInfo = null;
          let subcategoryInfo = null;

          for (const cat of selectionCategories) {
            const sub = cat.subcategories?.find(s => s.code === subcode);
            if (sub) {
              categoryInfo = cat;
              subcategoryInfo = sub;
              break;
            }
          }

          if (categoryInfo && subcategoryInfo) {
            suggestions.push({
              subcategoryCode: subcode,
              categoryCode: categoryInfo.code,
              categoryName: categoryInfo.name,
              subcategoryName: subcategoryInfo.name,
              matchedTask: task.title,
              taskId: task.id,
              taskStatus: task.status,
              priority: task.status === 'in_progress' ? 'high' : task.status === 'pending' ? 'medium' : 'low',
            });
            foundSubcodes.add(subcode);
          }
          break;
        }
      }
    }
  }

  // Sort by priority (in_progress tasks first)
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return suggestions;
}

// =============================================================================
// FLOOR PLANS API
// =============================================================================

// Floor plan tables don't exist in DB yet - always use mock data
const USE_MOCK_FLOOR_PLANS = true;

// Re-export constants for components to use
export { FLOOR_PLAN_STATUS_COLORS, ELEMENT_TYPE_DEFAULTS, TRADE_COLORS };

/**
 * Get all floor plans for a project
 */
export async function getFloorPlans(projectId) {
  if (!isSupabaseConfigured() || USE_MOCK_FLOOR_PLANS) {
    const plans = mockFloorPlans[projectId] || [];
    return { data: plans.filter(p => p.isActive).sort((a, b) => a.floorNumber - b.floorNumber), error: null };
  }

  const { data, error } = await supabase
    .from('floor_plans')
    .select('*')
    .eq('project_id', projectId)
    .eq('is_active', true)
    .order('floor_number', { ascending: true });

  return { data, error };
}

/**
 * Get a single floor plan by ID
 */
export async function getFloorPlan(floorPlanId) {
  if (!isSupabaseConfigured() || USE_MOCK_FLOOR_PLANS) {
    for (const projectPlans of Object.values(mockFloorPlans)) {
      const plan = projectPlans.find(p => p.id === floorPlanId);
      if (plan) return { data: plan, error: null };
    }
    return { data: null, error: 'Floor plan not found' };
  }

  const { data, error } = await supabase
    .from('floor_plans')
    .select('*')
    .eq('id', floorPlanId)
    .single();

  return { data, error };
}

/**
 * Create a new floor plan
 */
export async function createFloorPlan(floorPlanData) {
  const now = new Date().toISOString();
  const newPlan = {
    id: crypto.randomUUID(),
    projectId: floorPlanData.projectId,
    name: floorPlanData.name,
    svgViewbox: floorPlanData.svgViewbox || '0 0 800 600',
    backgroundImageUrl: floorPlanData.backgroundImageUrl || null,
    widthFeet: floorPlanData.widthFeet || null,
    heightFeet: floorPlanData.heightFeet || null,
    floorNumber: floorPlanData.floorNumber ?? 1,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  if (!isSupabaseConfigured() || USE_MOCK_FLOOR_PLANS) {
    if (!mockFloorPlans[floorPlanData.projectId]) {
      mockFloorPlans[floorPlanData.projectId] = [];
    }
    mockFloorPlans[floorPlanData.projectId].push(newPlan);
    mockFloorPlanElements[newPlan.id] = [];
    saveFloorPlansToStorage();
    saveFloorPlanElementsToStorage();
    return { data: newPlan, error: null };
  }

  const { data, error } = await supabase
    .from('floor_plans')
    .insert({
      project_id: floorPlanData.projectId,
      name: floorPlanData.name,
      svg_viewbox: floorPlanData.svgViewbox || '0 0 800 600',
      background_image_url: floorPlanData.backgroundImageUrl || null,
      width_feet: floorPlanData.widthFeet || null,
      height_feet: floorPlanData.heightFeet || null,
      floor_number: floorPlanData.floorNumber ?? 1,
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Update a floor plan
 */
export async function updateFloorPlan(floorPlanId, updates) {
  if (!isSupabaseConfigured() || USE_MOCK_FLOOR_PLANS) {
    for (const projectPlans of Object.values(mockFloorPlans)) {
      const index = projectPlans.findIndex(p => p.id === floorPlanId);
      if (index !== -1) {
        projectPlans[index] = {
          ...projectPlans[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        saveFloorPlansToStorage();
        return { data: projectPlans[index], error: null };
      }
    }
    return { data: null, error: 'Floor plan not found' };
  }

  const dbUpdates = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.svgViewbox !== undefined) dbUpdates.svg_viewbox = updates.svgViewbox;
  if (updates.backgroundImageUrl !== undefined) dbUpdates.background_image_url = updates.backgroundImageUrl;
  if (updates.widthFeet !== undefined) dbUpdates.width_feet = updates.widthFeet;
  if (updates.heightFeet !== undefined) dbUpdates.height_feet = updates.heightFeet;
  if (updates.floorNumber !== undefined) dbUpdates.floor_number = updates.floorNumber;
  if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

  const { data, error } = await supabase
    .from('floor_plans')
    .update(dbUpdates)
    .eq('id', floorPlanId)
    .select()
    .single();

  return { data, error };
}

/**
 * Delete a floor plan (soft delete)
 */
export async function deleteFloorPlan(floorPlanId) {
  return updateFloorPlan(floorPlanId, { isActive: false });
}

// =============================================================================
// FLOOR PLAN ELEMENTS API
// =============================================================================

/**
 * Get all elements for a floor plan
 */
export async function getFloorPlanElements(floorPlanId) {
  if (!isSupabaseConfigured() || USE_MOCK_FLOOR_PLANS) {
    const elements = mockFloorPlanElements[floorPlanId] || [];
    return { data: elements.sort((a, b) => a.zIndex - b.zIndex), error: null };
  }

  const { data, error } = await supabase
    .from('floor_plan_elements')
    .select('*')
    .eq('floor_plan_id', floorPlanId)
    .order('z_index', { ascending: true });

  return { data, error };
}

/**
 * Get elements with their linked loop status
 */
export async function getFloorPlanElementsWithStatus(floorPlanId) {
  if (!isSupabaseConfigured() || USE_MOCK_FLOOR_PLANS) {
    const elements = mockFloorPlanElements[floorPlanId] || [];
    // Enrich with loop status
    const enrichedElements = elements.map(elem => {
      let loopStatus = null;
      let loopName = null;
      if (elem.loopId) {
        const loop = mockLoops.find(l => l.id === elem.loopId);
        if (loop) {
          loopStatus = loop.status;
          loopName = loop.name;
        }
      }
      return {
        ...elem,
        loopStatus,
        loopName,
      };
    });
    return { data: enrichedElements.sort((a, b) => a.zIndex - b.zIndex), error: null };
  }

  const { data, error } = await supabase
    .from('floor_plan_elements')
    .select(`
      *,
      loops (
        id,
        name,
        status,
        health_color
      )
    `)
    .eq('floor_plan_id', floorPlanId)
    .order('z_index', { ascending: true });

  if (data) {
    // Flatten loop info
    const enriched = data.map(elem => ({
      ...elem,
      loopStatus: elem.loops?.status || null,
      loopName: elem.loops?.name || null,
      loopHealthColor: elem.loops?.health_color || null,
    }));
    return { data: enriched, error: null };
  }

  return { data, error };
}

/**
 * Create a new floor plan element
 */
export async function createFloorPlanElement(elementData) {
  const now = new Date().toISOString();
  const defaults = ELEMENT_TYPE_DEFAULTS[elementData.elementType] || ELEMENT_TYPE_DEFAULTS.custom;

  const newElement = {
    id: crypto.randomUUID(),
    floorPlanId: elementData.floorPlanId,
    loopId: elementData.loopId || null,
    elementType: elementData.elementType,
    label: elementData.label || null,
    tradeCategory: elementData.tradeCategory || null,
    svgType: elementData.svgType,
    svgData: elementData.svgData,
    strokeWidth: elementData.strokeWidth ?? defaults.strokeWidth,
    defaultColor: elementData.defaultColor || defaults.color,
    zIndex: elementData.zIndex ?? 0,
    notes: elementData.notes || null,
    specs: elementData.specs || null,
    createdAt: now,
    updatedAt: now,
  };

  if (!isSupabaseConfigured() || USE_MOCK_FLOOR_PLANS) {
    if (!mockFloorPlanElements[elementData.floorPlanId]) {
      mockFloorPlanElements[elementData.floorPlanId] = [];
    }
    mockFloorPlanElements[elementData.floorPlanId].push(newElement);
    saveFloorPlanElementsToStorage();
    return { data: newElement, error: null };
  }

  const { data, error } = await supabase
    .from('floor_plan_elements')
    .insert({
      floor_plan_id: elementData.floorPlanId,
      loop_id: elementData.loopId || null,
      element_type: elementData.elementType,
      label: elementData.label || null,
      trade_category: elementData.tradeCategory || null,
      svg_type: elementData.svgType,
      svg_data: elementData.svgData,
      stroke_width: elementData.strokeWidth ?? defaults.strokeWidth,
      default_color: elementData.defaultColor || defaults.color,
      z_index: elementData.zIndex ?? 0,
      notes: elementData.notes || null,
      specs: elementData.specs || null,
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Update a floor plan element
 */
export async function updateFloorPlanElement(elementId, updates) {
  if (!isSupabaseConfigured() || USE_MOCK_FLOOR_PLANS) {
    for (const elements of Object.values(mockFloorPlanElements)) {
      const index = elements.findIndex(e => e.id === elementId);
      if (index !== -1) {
        elements[index] = {
          ...elements[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        saveFloorPlanElementsToStorage();
        return { data: elements[index], error: null };
      }
    }
    return { data: null, error: 'Element not found' };
  }

  const dbUpdates = {};
  if (updates.loopId !== undefined) dbUpdates.loop_id = updates.loopId;
  if (updates.label !== undefined) dbUpdates.label = updates.label;
  if (updates.tradeCategory !== undefined) dbUpdates.trade_category = updates.tradeCategory;
  if (updates.svgData !== undefined) dbUpdates.svg_data = updates.svgData;
  if (updates.strokeWidth !== undefined) dbUpdates.stroke_width = updates.strokeWidth;
  if (updates.defaultColor !== undefined) dbUpdates.default_color = updates.defaultColor;
  if (updates.zIndex !== undefined) dbUpdates.z_index = updates.zIndex;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
  if (updates.specs !== undefined) dbUpdates.specs = updates.specs;

  const { data, error } = await supabase
    .from('floor_plan_elements')
    .update(dbUpdates)
    .eq('id', elementId)
    .select()
    .single();

  return { data, error };
}

/**
 * Delete a floor plan element
 */
export async function deleteFloorPlanElement(elementId) {
  if (!isSupabaseConfigured() || USE_MOCK_FLOOR_PLANS) {
    for (const [floorPlanId, elements] of Object.entries(mockFloorPlanElements)) {
      const index = elements.findIndex(e => e.id === elementId);
      if (index !== -1) {
        const deleted = elements.splice(index, 1)[0];
        saveFloorPlanElementsToStorage();
        return { data: deleted, error: null };
      }
    }
    return { data: null, error: 'Element not found' };
  }

  const { data, error } = await supabase
    .from('floor_plan_elements')
    .delete()
    .eq('id', elementId)
    .select()
    .single();

  return { data, error };
}

/**
 * Link an element to a loop (existing or create new)
 */
export async function linkElementToLoop(elementId, loopId = null, createLoopData = null) {
  // If creating a new loop
  if (createLoopData && !loopId) {
    const { data: newLoop, error: loopError } = await createLoop(createLoopData);
    if (loopError) {
      return { data: null, error: loopError };
    }
    loopId = newLoop.id;
  }

  // Update element with loop ID
  return updateFloorPlanElement(elementId, { loopId });
}

/**
 * Unlink an element from its loop
 */
export async function unlinkElementFromLoop(elementId) {
  return updateFloorPlanElement(elementId, { loopId: null });
}

/**
 * Get floor plan status summary (for progress indicators)
 */
export async function getFloorPlanStatusSummary(floorPlanId) {
  const { data: elements, error } = await getFloorPlanElementsWithStatus(floorPlanId);

  if (error) return { data: null, error };

  const statusCounts = {
    not_started: 0,
    pending: 0,
    in_progress: 0,
    active: 0,
    blocked: 0,
    complete: 0,
    completed: 0,
    unlinked: 0, // Elements without loops
  };

  let totalLinked = 0;
  let completedCount = 0;

  elements.forEach(elem => {
    if (!elem.loopId) {
      statusCounts.unlinked++;
    } else {
      totalLinked++;
      const status = elem.loopStatus || 'pending';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
      if (status === 'complete' || status === 'completed') {
        completedCount++;
      }
    }
  });

  const overallProgress = totalLinked > 0 ? Math.round((completedCount / totalLinked) * 100) : 0;

  return {
    data: {
      totalElements: elements.length,
      linkedElements: totalLinked,
      unlinkedElements: statusCounts.unlinked,
      statusCounts,
      overallProgress,
    },
    error: null,
  };
}

// ============================================
// Employee API
// ============================================

// Use Supabase for employees (production data)
const USE_MOCK_EMPLOYEES = false;

const EMPLOYEES_STORAGE_KEY = 'hooomz_employees';

// Helper to load employees from localStorage (fallback)
function loadEmployeesFromStorage() {
  try {
    const stored = localStorage.getItem(EMPLOYEES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Helper to save employees to localStorage (fallback)
function saveEmployeesToStorage(employees) {
  localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(employees));
}

// Transform employee data from snake_case (DB) to camelCase (UI)
function transformEmployeeFromDb(emp) {
  return {
    id: emp.id,
    firstName: emp.first_name || emp.name?.split(' ')[0] || '',
    lastName: emp.last_name || emp.name?.split(' ').slice(1).join(' ') || '',
    preferredName: emp.preferred_name || null,
    name: emp.name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim(),
    email: emp.email,
    phone: emp.phone,
    role: emp.role || 'labourer',
    hourlyRate: emp.hourly_rate,
    isActive: emp.is_active !== false,
    userId: emp.user_id,
    avatarUrl: emp.avatar_url,
    skills: emp.skills || [],
    notes: emp.notes,
    address: emp.address || {},
    status: emp.is_active !== false ? 'active' : 'inactive',
    createdAt: emp.created_at,
    updatedAt: emp.updated_at,
  };
}

// GET all employees
export async function getEmployees() {
  console.log('[api.getEmployees] Called, USE_MOCK_EMPLOYEES:', USE_MOCK_EMPLOYEES, 'supabaseConfigured:', isSupabaseConfigured());

  if (!isSupabaseConfigured() || USE_MOCK_EMPLOYEES) {
    console.log('[api.getEmployees] Using mock data');
    return { data: loadEmployeesFromStorage(), error: null };
  }

  try {
    console.log('[api.getEmployees] Fetching from Supabase...');

    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Supabase query timeout after 10s')), 10000)
    );

    const queryPromise = supabase
      .from('employees')
      .select('*');

    const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

    console.log('[api.getEmployees] Supabase response - data:', data?.length, 'error:', error);

    if (error) {
      console.error('[api.getEmployees] Supabase error:', error);
      // Fall back to localStorage on error
      console.log('[api.getEmployees] Falling back to localStorage');
      return { data: loadEmployeesFromStorage(), error: null };
    }

    // Filter out soft-deleted employees
    let filteredData = data || [];
    if (filteredData.length > 0 && 'deleted_at' in filteredData[0]) {
      filteredData = filteredData.filter(emp => !emp.deleted_at);
    }

    // Filter out inactive employees
    filteredData = filteredData.filter(emp => emp.is_active !== false);

    // Transform from snake_case to camelCase for UI
    const transformedData = filteredData.map(transformEmployeeFromDb);

    // Sort by lastName
    transformedData.sort((a, b) => (a.lastName || '').localeCompare(b.lastName || ''));

    console.log('[api.getEmployees] Returning', transformedData.length, 'employees');
    return { data: transformedData, error: null };
  } catch (err) {
    console.error('[api.getEmployees] Exception:', err);
    // Fall back to localStorage on timeout/error
    console.log('[api.getEmployees] Falling back to localStorage due to error');
    return { data: loadEmployeesFromStorage(), error: null };
  }
}

// GET single employee by ID
export async function getEmployee(id) {
  if (!isSupabaseConfigured() || USE_MOCK_EMPLOYEES) {
    const employees = loadEmployeesFromStorage();
    const employee = employees.find(e => e.id === id);
    return { data: employee || null, error: employee ? null : 'Not found' };
  }

  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return { data: null, error };
  }

  // Transform from snake_case to camelCase for UI
  return { data: data ? transformEmployeeFromDb(data) : null, error: null };
}

// CREATE employee
export async function createEmployee(employeeData) {
  // Generate ID for new employees
  const newEmployee = {
    id: `emp-${Date.now()}`,
    ...employeeData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (!isSupabaseConfigured() || USE_MOCK_PROJECTS) {
    const employees = loadEmployeesFromStorage();
    employees.push(newEmployee);
    saveEmployeesToStorage(employees);
    return { data: newEmployee, error: null };
  }

  const { data, error } = await supabase
    .from('employees')
    .insert(newEmployee)
    .select()
    .single();

  return { data, error };
}

// UPDATE employee
export async function updateEmployee(id, updates) {
  if (!isSupabaseConfigured() || USE_MOCK_PROJECTS) {
    const employees = loadEmployeesFromStorage();
    const index = employees.findIndex(e => e.id === id);
    if (index === -1) {
      // Upsert - create if not found
      const newEmployee = {
        id,
        ...updates,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      employees.push(newEmployee);
      saveEmployeesToStorage(employees);
      return { data: newEmployee, error: null };
    }
    employees[index] = {
      ...employees[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    saveEmployeesToStorage(employees);
    return { data: employees[index], error: null };
  }

  const { data, error } = await supabase
    .from('employees')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  return { data, error };
}

// DELETE employee (soft delete)
export async function deleteEmployee(id) {
  if (!isSupabaseConfigured() || USE_MOCK_PROJECTS) {
    const employees = loadEmployeesFromStorage();
    const index = employees.findIndex(e => e.id === id);
    if (index === -1) {
      return { data: null, error: 'Employee not found' };
    }
    employees.splice(index, 1);
    saveEmployeesToStorage(employees);
    return { data: { id, deleted: true }, error: null };
  }

  const { data, error } = await supabase
    .from('employees')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  return { data, error };
}
