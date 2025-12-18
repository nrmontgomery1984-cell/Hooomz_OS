import { supabase, isSupabaseConfigured } from './supabase';
import { PROJECT_PHASES } from '../data/intakeSchema';
import { getRoomTemplate, calculateEstimate } from '../data/intakeTemplates';
import { mockProjects, mockLoops, mockTasks, saveProjectsToStorage } from './mockData';

// Force mock mode to match api.js - ensures projects are stored consistently
const USE_MOCK_PROJECTS = true;

/**
 * Intake Service
 *
 * Handles the conversion of intake form data into:
 * - A Project record (in intake/estimate phase)
 * - Loop records for each room/scope area
 * - Task records from templates
 */

/**
 * Generate a full Project with Loops and Tasks from intake data
 *
 * @param {Object} formData - The complete intake form data
 * @param {Object} estimate - The calculated estimate
 * @returns {{ data: Object|null, error: string|null }}
 */
export async function generateProjectFromIntake(formData, estimate) {
  try {
    const { contact, project, renovation, selections, notes } = formData;

    // 1. Create the Project
    const projectData = {
      name: `${contact.full_name} - ${project.address || 'New Project'}`,
      status: 'intake',
      phase: PROJECT_PHASES.INTAKE,
      progress: 0,
      health_score: 100, // New projects start healthy

      // Contact info
      client_name: contact.full_name,
      client_email: contact.email,
      client_phone: contact.phone,
      preferred_contact: contact.preferred_contact,

      // Project details
      address: project.address,
      build_tier: project.build_tier,
      budget_range: project.budget_range,
      target_start: project.desired_start_month,
      target_completion: project.target_completion_month,
      priorities: project.priorities,

      // Estimate
      estimate_low: estimate?.low || null,
      estimate_high: estimate?.high || null,
      estimate_breakdown: estimate?.breakdown || null,

      // Store full intake data for reference
      intake_data: formData,
      intake_type: formData.form_type,

      // Notes
      notes: notes?.additional_notes || '',
      must_haves: notes?.must_haves?.filter(Boolean) || [],
      pain_points: notes?.pain_points?.filter(Boolean) || [],
      style_notes: notes?.style_notes || '',
      inspiration_urls: notes?.inspiration_urls?.filter(Boolean) || [],

      // Metadata
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Mock mode handling - use mock when Supabase not configured OR USE_MOCK_PROJECTS is true
    if (!isSupabaseConfigured() || USE_MOCK_PROJECTS) {
      const projectId = `p${Date.now()}`;
      const newProject = {
        id: projectId,
        ...projectData,
      };

      // Add to mock projects array (persists in memory)
      mockProjects.unshift(newProject);

      // Generate mock loops
      const projectLoops = [];
      let loopOrder = 1;

      if (renovation?.room_tiers) {
        for (const [roomType, renoTier] of Object.entries(renovation.room_tiers)) {
          const template = getRoomTemplate(roomType, renoTier);
          if (!template) continue;

          const loopId = `l${Date.now()}-${loopOrder}`;
          const newLoop = {
            id: loopId,
            project_id: projectId,
            name: template.loopName,
            category: template.category,
            status: 'pending',
            display_order: loopOrder,
            room_type: roomType,
            reno_tier: renoTier,
            source: 'intake',
            progress: 0,
            created_at: new Date().toISOString(),
          };
          projectLoops.push(newLoop);

          // Generate tasks for this loop
          const loopTasks = template.defaults.map((task, index) => ({
            id: `t${Date.now()}-${loopOrder}-${index}`,
            loop_id: loopId,
            project_id: projectId,
            title: task.title,
            category: task.category,
            subcategory: task.subcategory || null,
            status: 'pending',
            display_order: index + 1,
            source: 'template',
            created_at: new Date().toISOString(),
          }));

          // Add tasks to mock data
          mockTasks[loopId] = loopTasks;
          loopOrder++;
        }
      }

      // Add loops to mock data
      mockLoops[projectId] = projectLoops;

      // Persist to localStorage
      saveProjectsToStorage();

      console.log('Project created (mock):', newProject);
      console.log('Loops created (mock):', projectLoops.length);

      return {
        data: {
          ...newProject,
          loops: projectLoops,
        },
        error: null,
      };
    }

    // Real Supabase implementation
    // Map to database schema columns only
    const dbProjectData = {
      name: projectData.name,
      status: 'intake',
      address: projectData.address || null,
      description: projectData.notes || null,
      project_type: formData.form_type || 'renovation',
      client_name: projectData.client_name,
      client_email: projectData.client_email,
      client_phone: projectData.client_phone,
      health_score: 100,
      estimated_budget: estimate?.high || null,
    };

    const { data: createdProject, error: projectError } = await supabase
      .from('projects')
      .insert(dbProjectData)
      .select()
      .single();

    if (projectError) {
      console.error('Project creation error:', projectError);
      // Fall back to mock mode if Supabase fails (RLS/schema issues)
      console.log('Falling back to mock mode...');
      const projectId = `p${Date.now()}`;
      const newProject = { id: projectId, ...projectData };
      mockProjects.unshift(newProject);

      // Generate loops for mock
      const projectLoops = [];
      let loopOrder = 1;
      if (renovation?.room_tiers) {
        for (const [roomType, renoTier] of Object.entries(renovation.room_tiers)) {
          const template = getRoomTemplate(roomType, renoTier);
          if (!template) continue;
          const loopId = `l${Date.now()}-${loopOrder}`;
          projectLoops.push({
            id: loopId,
            project_id: projectId,
            name: template.loopName,
            status: 'pending',
            display_order: loopOrder++,
          });
        }
      }
      mockLoops[projectId] = projectLoops;
      saveProjectsToStorage();

      return { data: { ...newProject, loops: projectLoops }, error: null };
    }

    // 2. Create loops and tasks for each selected room
    const loops = [];
    const allTasks = [];
    let loopOrder = 1;

    if (renovation?.room_tiers) {
      for (const [roomType, renoTier] of Object.entries(renovation.room_tiers)) {
        const template = getRoomTemplate(roomType, renoTier);
        if (!template) continue;

        // Create loop
        const { data: loop, error: loopError } = await supabase
          .from('loops')
          .insert({
            project_id: createdProject.id,
            name: template.loopName,
            category: template.category,
            status: 'pending',
            display_order: loopOrder,
            room_type: roomType,
            reno_tier: renoTier,
            source: 'intake',
          })
          .select()
          .single();

        if (loopError) {
          console.error('Loop creation error:', loopError);
          continue;
        }

        loops.push(loop);

        // Create tasks for this loop
        const taskData = template.defaults.map((task, index) => ({
          loop_id: loop.id,
          project_id: createdProject.id,
          title: task.title,
          category: task.category,
          subcategory: task.subcategory || null,
          status: 'pending',
          display_order: index + 1,
          source: 'template',
        }));

        const { data: tasks, error: tasksError } = await supabase
          .from('tasks')
          .insert(taskData)
          .select();

        if (tasksError) {
          console.error('Tasks creation error:', tasksError);
        } else {
          allTasks.push(...tasks);
        }

        loopOrder++;
      }
    }

    // Log activity
    await supabase.from('activity_log').insert({
      event_type: 'project.created_from_intake',
      event_data: {
        project_name: createdProject.name,
        intake_type: formData.form_type,
        loops_created: loops.length,
        tasks_created: allTasks.length,
        estimate_low: estimate?.low,
        estimate_high: estimate?.high,
      },
      project_id: createdProject.id,
      actor_name: contact.full_name,
    });

    return {
      data: {
        ...createdProject,
        loops,
        tasks: allTasks,
      },
      error: null,
    };
  } catch (err) {
    console.error('generateProjectFromIntake error:', err);
    return { data: null, error: err.message };
  }
}

/**
 * Update a project's phase
 */
export async function updateProjectPhase(projectId, newPhase) {
  if (!isSupabaseConfigured()) {
    console.log('Phase updated (mock):', projectId, newPhase);
    return { data: { id: projectId, phase: newPhase }, error: null };
  }

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
  if (!isSupabaseConfigured()) {
    return { data: null, error: 'Mock mode - no intake data' };
  }

  const { data, error } = await supabase
    .from('projects')
    .select('intake_data, intake_type, estimate_low, estimate_high, estimate_breakdown')
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

  if (!isSupabaseConfigured()) {
    const mockLoop = {
      id: `l${Date.now()}`,
      project_id: projectId,
      name: name || `Change Order - ${roomType}`,
      category: 'CO',
      status: 'pending',
      is_change_order: true,
      change_order_reason: description,
      estimate_low: estimateLow,
      estimate_high: estimateHigh,
      source: 'change_order',
      created_at: new Date().toISOString(),
    };

    console.log('Change order created (mock):', mockLoop);
    return { data: mockLoop, error: null };
  }

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
      category: template?.category || 'CO',
      status: 'pending',
      display_order: (count || 0) + 1,
      is_change_order: true,
      change_order_reason: description,
      room_type: roomType,
      reno_tier: renoTier,
      estimate_low: estimateLow,
      estimate_high: estimateHigh,
      source: 'change_order',
    })
    .select()
    .single();

  if (loopError) {
    return { data: null, error: loopError.message };
  }

  // Create tasks from template if applicable
  if (template) {
    const taskData = template.defaults.map((task, index) => ({
      loop_id: loop.id,
      project_id: projectId,
      title: task.title,
      category: task.category,
      subcategory: task.subcategory || null,
      status: 'pending',
      display_order: index + 1,
      source: 'change_order',
    }));

    await supabase.from('tasks').insert(taskData);
  }

  // Log activity
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

  return { data: loop, error: null };
}
