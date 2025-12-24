/**
 * Intake Service
 *
 * Handles the conversion of intake form data into:
 * - A Project record (in intake phase)
 * - Loop records for each room/scope area
 * - Task records from templates
 */

import { supabase } from './supabase';
import { createProject, createLoopsBatch, createTasksBatch } from './db';
import { getRoomTemplate } from '../data/intakeTemplates';

/**
 * Generate a full Project with Loops and Tasks from intake data
 *
 * @param {Object} formData - The complete intake form data
 * @param {Object} estimate - The calculated estimate
 * @returns {{ data: Object|null, error: string|null }}
 */
export async function generateProjectFromIntake(formData, estimate) {
  console.log('[intakeService] generateProjectFromIntake called');

  try {
    const { contact, project, renovation, notes } = formData;

    // Build project data
    const projectData = {
      name: `${contact.full_name} - ${project.address || 'New Project'}`,
      phase: 'intake',
      address: project.address || null,
      description: notes?.additional_notes || null,
      project_type: formData.form_type || 'renovation',

      // Client info
      client_name: contact.full_name,
      client_email: contact.email,
      client_phone: contact.phone,

      // Estimates
      estimate_low: estimate?.low || null,
      estimate_high: estimate?.high || null,

      // Intake metadata
      intake_type: formData.form_type,
      build_tier: project.build_tier || 'better',
      intake_data: formData,
    };

    console.log('[intakeService] Creating project...');

    // Create the project
    const { data: createdProject, error: projectError } = await createProject(projectData);

    if (projectError) {
      console.error('[intakeService] Project creation error:', projectError);
      return { data: null, error: `Failed to create project: ${projectError}` };
    }

    console.log('[intakeService] Project created:', createdProject.id);

    // Prepare loops and tasks from room selections
    const loopsToCreate = [];
    const tasksByLoop = {};
    let loopOrder = 1;

    if (renovation?.room_tiers) {
      for (const [roomType, renoTier] of Object.entries(renovation.room_tiers)) {
        const template = getRoomTemplate(roomType, renoTier);
        if (!template) continue;

        const loopKey = `loop-${loopOrder}`;

        loopsToCreate.push({
          project_id: createdProject.id,
          name: template.loopName,
          loop_type: 'room',
          trade_code: template.category || null,
          status: 'pending',
          display_order: loopOrder,
          source: 'intake',
        });

        // Prepare tasks for this loop
        tasksByLoop[loopKey] = (template.defaults || []).map((task, index) => ({
          title: task.title,
          description: null,
          status: 'pending',
          priority: 2,
          category_code: task.category || null,
          display_order: index + 1,
          source: 'intake',
        }));

        loopOrder++;
      }
    }

    console.log('[intakeService] Creating', loopsToCreate.length, 'loops...');

    // Create all loops
    let loops = [];
    if (loopsToCreate.length > 0) {
      const { data: createdLoops, error: loopsError } = await createLoopsBatch(loopsToCreate);

      if (loopsError) {
        console.error('[intakeService] Loops creation error:', loopsError);
      } else {
        loops = createdLoops || [];
      }
    }

    // Create tasks for each loop
    const allTasksToCreate = [];
    loops.forEach((loop, index) => {
      const loopKey = `loop-${index + 1}`;
      const tasksForLoop = tasksByLoop[loopKey] || [];

      for (const task of tasksForLoop) {
        allTasksToCreate.push({
          ...task,
          loop_id: loop.id,
        });
      }
    });

    console.log('[intakeService] Creating', allTasksToCreate.length, 'tasks...');

    let createdTasks = [];
    if (allTasksToCreate.length > 0) {
      const { data: tasks, error: tasksError } = await createTasksBatch(allTasksToCreate);

      if (tasksError) {
        console.error('[intakeService] Tasks creation error:', tasksError);
      } else {
        createdTasks = tasks || [];
      }
    }

    // Log activity
    try {
      await supabase.from('activity_log').insert({
        event_type: 'project.created_from_intake',
        event_data: {
          project_name: createdProject.name,
          intake_type: formData.form_type,
          loops_created: loops.length,
          tasks_created: createdTasks.length,
          estimate_low: estimate?.low,
          estimate_high: estimate?.high,
        },
        project_id: createdProject.id,
        actor_name: contact.full_name,
      });
    } catch (err) {
      console.warn('[intakeService] Activity log failed:', err);
    }

    console.log('[intakeService] Complete!', {
      loops: loops.length,
      tasks: createdTasks.length,
    });

    return {
      data: {
        ...createdProject,
        loops,
        tasks: createdTasks,
      },
      error: null,
    };

  } catch (err) {
    console.error('[intakeService] generateProjectFromIntake error:', err);
    return { data: null, error: err.message };
  }
}

/**
 * Update a project's phase
 */
export async function updateProjectPhase(projectId, newPhase) {
  const { data, error } = await supabase
    .from('projects')
    .update({
      phase: newPhase,
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId)
    .select()
    .single();

  return { data, error };
}

/**
 * Get intake data for an existing project
 */
export async function getProjectIntakeData(projectId) {
  const { data, error } = await supabase
    .from('projects')
    .select('intake_data, intake_type, estimate_low, estimate_high')
    .eq('id', projectId)
    .single();

  return { data, error };
}

/**
 * Add a change order to an active project
 * Creates a new Loop with tasks
 */
export async function addChangeOrder(projectId, changeOrderData) {
  const { name, description, roomType, renoTier, estimateLow, estimateHigh } = changeOrderData;

  // Get current loop count for ordering
  const { count } = await supabase
    .from('loops')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId);

  const template = roomType ? getRoomTemplate(roomType, renoTier || 'full') : null;

  // Create the change order loop
  const { data: loop, error: loopError } = await supabase
    .from('loops')
    .insert({
      project_id: projectId,
      name: name || (template ? `Change Order - ${template.loopName}` : 'Change Order'),
      loop_type: 'change_order',
      trade_code: template?.category || null,
      status: 'pending',
      display_order: (count || 0) + 1,
      source: 'change_order',
    })
    .select()
    .single();

  if (loopError) {
    return { data: null, error: loopError.message };
  }

  // Create tasks from template if applicable
  if (template && template.defaults) {
    const taskData = template.defaults.map((task, index) => ({
      loop_id: loop.id,
      title: task.title,
      status: 'pending',
      category_code: task.category || null,
      display_order: index + 1,
      source: 'change_order',
    }));

    await supabase.from('tasks').insert(taskData);
  }

  // Log activity
  try {
    await supabase.from('activity_log').insert({
      event_type: 'change_order.created',
      event_data: {
        loop_name: loop.name,
        reason: description,
        estimate_low: estimateLow,
        estimate_high: estimateHigh,
      },
      project_id: projectId,
      loop_id: loop.id,
    });
  } catch (err) {
    console.warn('[intakeService] Activity log failed:', err);
  }

  return { data: loop, error: null };
}
