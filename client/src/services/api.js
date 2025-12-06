import { supabase, isSupabaseConfigured } from './supabase';
import {
  mockProjects,
  mockLoops,
  mockTasks,
  mockTodayTasks,
  mockTimeEntry,
  mockActivityLog,
  saveProjectsToStorage,
} from './mockData';

// Projects API
export async function getProjects() {
  if (!isSupabaseConfigured()) {
    return { data: mockProjects, error: null };
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .is('deleted_at', null)
    .order('updated_at', { ascending: false });

  return { data, error };
}

export async function getProject(id) {
  if (!isSupabaseConfigured()) {
    const project = mockProjects.find((p) => p.id === id);
    return { data: project || null, error: project ? null : 'Not found' };
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
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

  if (!isSupabaseConfigured()) {
    // Add to mock array
    mockProjects.unshift(newProject);
    // Persist to localStorage
    saveProjectsToStorage();
    console.log('Project created (mock):', newProject);
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
  if (!isSupabaseConfigured()) {
    return { data: mockLoops[projectId] || [], error: null };
  }

  const { data, error } = await supabase
    .from('loops')
    .select('*')
    .eq('project_id', projectId)
    .order('display_order', { ascending: true });

  return { data, error };
}

export async function getLoop(id) {
  if (!isSupabaseConfigured()) {
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
  if (!isSupabaseConfigured()) {
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
  if (!isSupabaseConfigured()) {
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
  if (!isSupabaseConfigured()) {
    console.log('Task updated (mock):', id, updates);
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
  if (!isSupabaseConfigured()) {
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
  if (!isSupabaseConfigured()) {
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

// Time Tracking API
export async function getActiveTimeEntry() {
  if (!isSupabaseConfigured()) {
    return { data: mockTimeEntry, error: null };
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

export async function startTimer(taskId, allocatedMinutes = 60) {
  if (!isSupabaseConfigured()) {
    return {
      data: {
        id: 'new-entry',
        task_id: taskId,
        start_time: new Date().toISOString(),
        allocated_minutes: allocatedMinutes,
      },
      error: null,
    };
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

export async function stopTimer(entryId) {
  if (!isSupabaseConfigured()) {
    return { data: { id: entryId, end_time: new Date().toISOString() }, error: null };
  }

  const now = new Date();
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
    })
    .eq('id', entryId)
    .select()
    .single();

  return { data, error };
}

// Activity Log API - The Heartbeat
export async function getProjectActivity(projectId, limit = 20) {
  if (!isSupabaseConfigured()) {
    return { data: mockActivityLog[projectId] || [], error: null };
  }

  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(limit);

  return { data, error };
}

// Create a new task
export async function createTask(task) {
  if (!isSupabaseConfigured()) {
    const newTask = {
      id: `t${Date.now()}`,
      ...task,
      created_at: new Date().toISOString(),
    };
    console.log('Task created (mock):', newTask);
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
  if (!isSupabaseConfigured()) {
    const newLoop = {
      id: `l${Date.now()}`,
      ...loop,
      created_at: new Date().toISOString(),
    };
    console.log('Loop created (mock):', newLoop);
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
  if (!isSupabaseConfigured()) {
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
  if (!isSupabaseConfigured()) {
    const newNote = {
      id: `n${Date.now()}`,
      task_id: taskId,
      ...note,
      created_at: new Date().toISOString(),
    };
    console.log('Note added (mock):', newNote);
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
  if (!isSupabaseConfigured()) {
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
  if (!isSupabaseConfigured()) {
    const newPhoto = {
      id: `p${Date.now()}`,
      task_id: taskId,
      ...photo,
      created_at: new Date().toISOString(),
    };
    console.log('Photo added (mock):', newPhoto);
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
  if (!isSupabaseConfigured()) {
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
  if (!isSupabaseConfigured()) {
    // Mock: add to local array for demo
    const newEntry = {
      id: `a${Date.now()}`,
      ...entry,
      created_at: new Date().toISOString(),
    };
    console.log('Activity logged (mock):', newEntry);
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
  if (!isSupabaseConfigured()) {
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

    console.log('Project phase updated (mock):', updatedProject);
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

  return { data, error };
}

/**
 * Update project data (general purpose)
 * @param {string} projectId - Project ID
 * @param {Object} updates - Fields to update
 */
export async function updateProject(projectId, updates) {
  if (!isSupabaseConfigured()) {
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
    console.log('Project updated (mock):', updatedProject);
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

  return { data, error };
}

/**
 * Generate loops and tasks from estimate line items when contract is signed
 * This transforms the pricing estimate into actionable production scope
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

  // Group line items by room/area to create loops
  const roomGroups = lineItems.reduce((acc, item) => {
    const roomKey = item.room || item.category || 'General';
    if (!acc[roomKey]) {
      acc[roomKey] = {
        roomLabel: item.roomLabel || item.category || 'General',
        items: [],
      };
    }
    acc[roomKey].items.push(item);
    return acc;
  }, {});

  const createdLoops = [];
  const createdTasks = [];
  let loopOrder = 1;

  // Create a loop for each room/area
  for (const [roomKey, group] of Object.entries(roomGroups)) {
    const loopId = `loop-${projectId.slice(-8)}-${roomKey}-${Date.now()}`;

    const loop = {
      id: loopId,
      project_id: projectId,
      name: group.roomLabel,
      category: group.items[0]?.tradeCode || 'GN',
      status: 'pending',
      display_order: loopOrder++,
      source: 'estimate',
      progress: 0,
      // Store budget info for tracking
      budgeted_amount: group.items.reduce((sum, item) => {
        const tierKey = `unitPrice${selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)}`;
        return sum + ((item[tierKey] || item.unitPriceBetter || 0) * (item.quantity || 1));
      }, 0),
    };

    // Create the loop
    const { data: createdLoop, error: loopError } = await createLoop(loop);
    if (loopError) {
      console.error('Failed to create loop:', loopError);
      continue;
    }
    createdLoops.push(createdLoop || loop);

    // Create tasks for each line item in this room
    let taskOrder = 1;
    for (const item of group.items) {
      const tierKey = `unitPrice${selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)}`;
      const amount = (item[tierKey] || item.unitPriceBetter || 0) * (item.quantity || 1);

      const task = {
        id: `task-${projectId.slice(-8)}-${item.id || taskOrder}-${Date.now()}`,
        loop_id: loopId,
        title: item.name,
        description: item.description || '',
        status: 'pending',
        category: item.tradeCode || 'GN',
        subcategory: item.subCode || null,
        display_order: taskOrder++,
        source: 'estimate',
        // Budget tracking
        budgeted_amount: amount,
        // Original estimate reference
        estimate_line_item_id: item.id,
      };

      const { data: createdTask, error: taskError } = await createTask(task);
      if (taskError) {
        console.error('Failed to create task:', taskError);
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

  // Update project to contracted phase
  const { data: project, error: projectError } = await updateProjectPhase(projectId, {
    phase: 'contracted',
    phase_changed_at: new Date().toISOString(),
    contract_value: contractValue,
    contract_signed_at: new Date().toISOString(),
    build_tier: selectedTier,
    estimate_line_items: lineItems,
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

  if (scopeError) {
    console.error('Failed to generate scope:', scopeError);
  }

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
