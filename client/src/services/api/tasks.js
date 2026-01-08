/**
 * Tasks API Module
 *
 * Handles task CRUD operations.
 * Tasks belong to loops and represent work items.
 */

import { supabase, isConfigured, generateId, now, today, response, handleError } from './config';

/**
 * Get tasks for a loop
 */
export async function getTasks(loopId) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('loop_id', loopId)
      .order('display_order', { ascending: true });

    if (error) {
      return handleError(error, 'getTasks');
    }

    return response(data || []);
  } catch (err) {
    return handleError(err, 'getTasks');
  }
}

/**
 * Get a single task by ID
 */
export async function getTask(id) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return handleError(error, 'getTask');
    }

    return response(data);
  } catch (err) {
    return handleError(err, 'getTask');
  }
}

/**
 * Create a new task
 */
export async function createTask(taskData) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  const newTask = {
    id: taskData.id || generateId(),
    loop_id: taskData.loop_id,
    title: taskData.title,
    description: taskData.description || null,
    status: taskData.status || 'pending',
    priority: taskData.priority || 2,
    category_code: taskData.category_code || null,
    subcategory_code: taskData.subcategory_code || null,
    location: taskData.location || null,
    display_order: taskData.display_order || 0,
    source: taskData.source || null,
    assigned_to: taskData.assigned_to || null,
    due_date: taskData.due_date || null,
    estimated_hours: taskData.estimated_hours || null,
    budgeted_amount: taskData.budgeted_amount || null,
    quantity: taskData.quantity || 1,
    created_at: now(),
    updated_at: now(),
  };

  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert(newTask)
      .select()
      .single();

    if (error) {
      return handleError(error, 'createTask');
    }

    return response(data);
  } catch (err) {
    return handleError(err, 'createTask');
  }
}

/**
 * Update a task
 */
export async function updateTask(id, updates) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  try {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        ...updates,
        updated_at: now(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return handleError(error, 'updateTask');
    }

    return response(data);
  } catch (err) {
    return handleError(err, 'updateTask');
  }
}

/**
 * Update task status with completed_at timestamp
 */
export async function updateTaskStatus(taskId, status) {
  const updates = {
    status,
    completed_at: status === 'completed' ? now() : null,
  };

  return updateTask(taskId, updates);
}

/**
 * Delete a task
 */
export async function deleteTask(id) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      return handleError(error, 'deleteTask');
    }

    return response({ id, deleted: true });
  } catch (err) {
    return handleError(err, 'deleteTask');
  }
}

/**
 * Get tasks due today or in progress (for dashboard)
 */
export async function getTodayTasks() {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  try {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        loop:loops(name, project:projects(name))
      `)
      .or(`due_date.eq.${today()},status.eq.in_progress`)
      .order('priority', { ascending: true });

    if (error) {
      return handleError(error, 'getTodayTasks');
    }

    return response(data || []);
  } catch (err) {
    return handleError(err, 'getTodayTasks');
  }
}

/**
 * Create a quick task for today
 */
export async function createTodayTask({ title, loopId }) {
  const newTask = {
    title,
    loop_id: loopId,
    status: 'pending',
    due_date: today(),
  };

  return createTask(newTask);
}

/**
 * Get task notes
 */
export async function getTaskNotes(taskId) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  try {
    const { data, error } = await supabase
      .from('task_notes')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false });

    if (error) {
      return handleError(error, 'getTaskNotes');
    }

    return response(data || []);
  } catch (err) {
    return handleError(err, 'getTaskNotes');
  }
}

/**
 * Add a note to a task
 */
export async function addTaskNote(taskId, note) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  const newNote = {
    id: generateId(),
    task_id: taskId,
    content: note.content,
    author_name: note.author_name,
    created_at: now(),
  };

  try {
    const { data, error } = await supabase
      .from('task_notes')
      .insert(newNote)
      .select()
      .single();

    if (error) {
      return handleError(error, 'addTaskNote');
    }

    return response(data);
  } catch (err) {
    return handleError(err, 'addTaskNote');
  }
}

/**
 * Get task photos
 */
export async function getTaskPhotos(taskId) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  try {
    const { data, error } = await supabase
      .from('task_photos')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false });

    if (error) {
      return handleError(error, 'getTaskPhotos');
    }

    return response(data || []);
  } catch (err) {
    return handleError(err, 'getTaskPhotos');
  }
}

/**
 * Add a photo to a task
 */
export async function addTaskPhoto(taskId, photo) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  const newPhoto = {
    id: generateId(),
    task_id: taskId,
    url: photo.url,
    caption: photo.caption || null,
    created_at: now(),
  };

  try {
    const { data, error } = await supabase
      .from('task_photos')
      .insert(newPhoto)
      .select()
      .single();

    if (error) {
      return handleError(error, 'addTaskPhoto');
    }

    return response(data);
  } catch (err) {
    return handleError(err, 'addTaskPhoto');
  }
}

/**
 * Get tasks for a project (across all loops)
 */
export async function getProjectTasks(projectId) {
  if (!isConfigured()) {
    return response(null, 'Supabase not configured');
  }

  try {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        loop:loops!inner(project_id)
      `)
      .eq('loop.project_id', projectId)
      .order('display_order', { ascending: true });

    if (error) {
      return handleError(error, 'getProjectTasks');
    }

    return response(data || []);
  } catch (err) {
    return handleError(err, 'getProjectTasks');
  }
}
