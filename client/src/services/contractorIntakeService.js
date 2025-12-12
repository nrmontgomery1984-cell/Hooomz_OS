import { supabase, isSupabaseConfigured } from './supabase';
import { mockProjects, saveProjectsToStorage } from './mockData';
import {
  SCOPE_ITEMS,
  getEnabledCategories,
  getCategoryScopeItems,
} from '../data/contractorIntakeSchema';
import { calculateScopeCosts } from '../lib/scopeCostEstimator';
import { calculateInstanceTotals, generateLineItemsFromInstances } from '../lib/estimateHelpers';

/**
 * Contractor Intake Service
 *
 * Generates projects from contractor scope-of-work data.
 * Creates task instances based on the scope items entered.
 */

/**
 * Generate a Project with Tasks from contractor intake data
 *
 * @param {Object} formData - The contractor intake form data
 * @returns {{ data: Object|null, error: string|null }}
 */
export async function generateProjectFromContractorIntake(formData) {
  try {
    const { project, client, scope, schedule, instances, assemblies, building } = formData;

    // Check if we're using the new instance-based format
    const hasInstances = instances && instances.length > 0;
    const ceilingHeights = building?.ceilingHeights || { basement: 8, main: 9, second: 8, third: 8 };

    // Build project data
    const projectData = {
      name: project.name,
      status: 'estimate', // Contractor projects start in estimate phase
      address: project.address,
      project_type: project.projectType,
      build_tier: project.specLevel,

      // Client info (if provided)
      client_name: client.hasClient ? client.name : null,
      client_email: client.hasClient ? client.email : null,
      client_phone: client.hasClient ? client.phone : null,

      // Schedule
      target_start: schedule.startDate,
      estimated_duration_weeks: parseInt(schedule.estimatedDuration) || null,

      // Health
      health_score: 100,
      progress: 0,

      // Notes
      notes: project.notes || null,

      // Store full intake data
      intake_data: formData,
      intake_type: 'contractor',

      // Metadata
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Get enabled categories and their items
    const enabledCategories = getEnabledCategories(scope);

    // Calculate cost estimates - use instances if available, otherwise fallback to scope
    let costEstimate;

    if (hasInstances) {
      // Use new instance-based calculation
      const instanceTotals = calculateInstanceTotals(instances, assemblies, ceilingHeights, null);
      costEstimate = {
        totalLabour: instanceTotals.labor,
        totalMaterials: instanceTotals.materials,
        grandTotal: instanceTotals.better, // Use "better" tier as default
        itemCount: instances.length,
        lowConfidenceItems: [],
        categories: {},
        // Store tier breakdown
        tiers: {
          good: instanceTotals.good,
          better: instanceTotals.better,
          best: instanceTotals.best,
        },
      };

      console.log('=== CONTRACTOR INTAKE COST ESTIMATE (INSTANCES) ===');
      console.log('Instance count:', instances.length);
      console.log('Assemblies:', assemblies?.length || 0);
      console.log('Instance totals:', instanceTotals);
      console.log('==================================================');
    } else {
      // Fallback to old scope-based calculation
      costEstimate = calculateScopeCosts(scope, project.specLevel);

      console.log('=== CONTRACTOR INTAKE COST ESTIMATE (SCOPE) ===');
      console.log('Scope data:', JSON.stringify(scope, null, 2));
      console.log('Spec level:', project.specLevel);
      console.log('Cost estimate result:', costEstimate);
      console.log('Total Labour:', costEstimate.totalLabour);
      console.log('Total Materials:', costEstimate.totalMaterials);
      console.log('Grand Total:', costEstimate.grandTotal);
      console.log('Item count:', costEstimate.itemCount);
      console.log('===============================================');
    }

    // Create initial estimate snapshot for history
    const estimateSnapshot = {
      id: `est-${Date.now()}`,
      created_at: new Date().toISOString(),
      spec_level: project.specLevel,
      total_labour: costEstimate.totalLabour,
      total_materials: costEstimate.totalMaterials,
      grand_total: costEstimate.grandTotal,
      item_count: costEstimate.itemCount,
      low_confidence_count: costEstimate.lowConfidenceItems.length,
      categories: costEstimate.categories,
      source: 'contractor_intake',
      notes: 'Initial estimate from contractor intake',
    };

    // Mock mode handling
    if (!isSupabaseConfigured()) {
      const projectId = `p${Date.now()}`;
      const newProject = {
        id: projectId,
        ...projectData,
        // Phase must be set for dashboard to recognize project status
        phase: 'estimating',
        // Cost estimate totals - include estimate_high/low for dashboard compatibility
        estimate_labour: costEstimate.totalLabour,
        estimate_materials: costEstimate.totalMaterials,
        estimate_total: costEstimate.grandTotal,
        estimate_high: costEstimate.tiers?.best || costEstimate.grandTotal,
        estimate_low: costEstimate.tiers?.good || Math.round(costEstimate.grandTotal * 0.9),
        // Tier breakdown for new instance-based estimates
        estimate_tiers: costEstimate.tiers || null,
        // Estimate history (array of snapshots)
        estimate_history: [estimateSnapshot],
        // Contract status - estimates can be recalculated until contract is signed
        contract_signed: false,
        contract_signed_at: null,
        // Store instance data for recalculation and display
        instances: hasInstances ? instances : null,
        assemblies: hasInstances ? assemblies : null,
        ceilingHeights: hasInstances ? ceilingHeights : null,
      };

      // Add to mock projects
      mockProjects.unshift(newProject);

      // Generate task instances from scope items with cost data
      const taskInstances = [];
      let taskOrder = 1;

      if (hasInstances) {
        // Generate line items from instances (new format)
        const lineItems = generateLineItemsFromInstances(instances, assemblies, ceilingHeights, null);

        for (const lineItem of lineItems) {
          taskInstances.push({
            id: `ti-${Date.now()}-${taskOrder}`,
            project_id: projectId,
            name: lineItem.name,
            categoryCode: lineItem.tradeCode,
            stageCode: getStageForCategory(lineItem.tradeCode),
            status: 'pending',
            quantity: lineItem.quantity,
            unit: lineItem.unit,
            notes: lineItem.description || null,
            displayOrder: taskOrder,
            source: 'contractor_intake_instances',
            created_at: new Date().toISOString(),
            // Cost estimate data
            estimate_labour: lineItem.laborCost || 0,
            estimate_materials: lineItem.materialsCost || 0,
            estimate_total: (lineItem.laborCost || 0) + (lineItem.materialsCost || 0),
            estimate_unit_cost: lineItem.unitPriceBetter || 0,
            estimate_source: 'instance_calculation',
            estimate_confidence: 1,
            // Store instance reference
            instanceIds: lineItem.instanceIds,
            byLevel: lineItem.byLevel,
          });
          taskOrder++;
        }
      } else {
        // Use old scope-based format
        for (const categoryCode of enabledCategories) {
          const items = getCategoryScopeItems(scope, categoryCode);
          const categoryEstimate = costEstimate.categories[categoryCode];

          for (const item of items) {
            // Map scope items to task instances
            const stageCode = getStageForCategory(categoryCode);

            // Find the cost data for this specific item
            const itemCost = categoryEstimate?.items?.find(i => i.id === item.id) || null;

            taskInstances.push({
              id: `ti-${Date.now()}-${taskOrder}`,
              project_id: projectId,
              name: item.name,
              categoryCode: categoryCode,
              stageCode: stageCode,
              status: 'pending',
              quantity: item.qty,
              unit: item.unit,
              notes: item.notes || null,
              displayOrder: taskOrder,
              source: 'contractor_intake',
              created_at: new Date().toISOString(),
              // Cost estimate data from Cost Catalogue
              estimate_labour: itemCost?.labourCost || 0,
              estimate_materials: itemCost?.materialsCost || 0,
              estimate_total: itemCost?.totalCost || 0,
              estimate_unit_cost: itemCost?.unitCost || 0,
              estimate_source: itemCost?.source || 'none',
              estimate_confidence: itemCost?.confidence ?? 0,
            });
            taskOrder++;
          }
        }
      }

      // Store task instances (would normally go to mockTaskInstances)
      // For now, we'll attach them to the project
      newProject.taskInstances = taskInstances;

      // Persist to localStorage
      saveProjectsToStorage();

      console.log('Contractor project created (mock):', newProject);
      console.log('Task instances created:', taskInstances.length);
      if (hasInstances) {
        console.log('Instance-based estimate - instances:', instances.length);
      }

      return {
        data: {
          ...newProject,
          taskCount: taskInstances.length,
          categoryCount: enabledCategories.length,
          instanceCount: hasInstances ? instances.length : 0,
        },
        error: null,
      };
    }

    // Real Supabase implementation
    const dbProjectData = {
      name: projectData.name,
      status: 'estimate',
      phase: 'estimating',
      address: projectData.address || null,
      project_type: projectData.project_type || 'renovation',
      build_tier: projectData.build_tier || 'better',
      client_name: projectData.client_name,
      client_email: projectData.client_email,
      client_phone: projectData.client_phone,
      health_score: 100,
      description: projectData.notes,
      // Cost estimates for dashboard display
      estimate_high: costEstimate.grandTotal,
      estimate_low: Math.round(costEstimate.grandTotal * 0.9),
      // Store intake data for recalculation
      intake_type: 'contractor',
      intake_data: formData,
    };

    const { data: createdProject, error: projectError } = await supabase
      .from('projects')
      .insert(dbProjectData)
      .select()
      .single();

    if (projectError) {
      console.error('Project creation error:', projectError);
      // Fall back to mock mode
      return generateProjectFromContractorIntakeMock(formData);
    }

    // Create task instances for each scope item
    const taskInstances = [];
    let taskOrder = 1;

    for (const categoryCode of enabledCategories) {
      const items = getCategoryScopeItems(scope, categoryCode);

      for (const item of items) {
        const stageCode = getStageForCategory(categoryCode);

        const taskData = {
          project_id: createdProject.id,
          name: item.name,
          category_code: categoryCode,
          stage_code: stageCode,
          status: 'pending',
          quantity: item.qty,
          unit: item.unit,
          notes: item.notes || null,
          display_order: taskOrder,
          source: 'contractor_intake',
        };

        const { data: task, error: taskError } = await supabase
          .from('task_instances')
          .insert(taskData)
          .select()
          .single();

        if (!taskError && task) {
          taskInstances.push(task);
        }
        taskOrder++;
      }
    }

    // Log activity
    await supabase.from('activity_log').insert({
      event_type: 'project.created_from_contractor_intake',
      event_data: {
        project_name: createdProject.name,
        categories: enabledCategories,
        task_count: taskInstances.length,
      },
      project_id: createdProject.id,
      actor_name: 'Contractor',
    });

    return {
      data: {
        ...createdProject,
        taskCount: taskInstances.length,
        categoryCount: enabledCategories.length,
      },
      error: null,
    };
  } catch (err) {
    console.error('generateProjectFromContractorIntake error:', err);
    return { data: null, error: err.message };
  }
}

/**
 * Fallback mock generation
 */
async function generateProjectFromContractorIntakeMock(formData) {
  const { project, client, scope, schedule } = formData;
  const enabledCategories = getEnabledCategories(scope);

  // Calculate costs for the fallback as well
  const costEstimate = calculateScopeCosts(scope, project.specLevel || 'standard');

  const projectId = `p${Date.now()}`;
  const newProject = {
    id: projectId,
    name: project.name,
    status: 'estimate',
    phase: 'estimating',
    address: project.address,
    project_type: project.projectType,
    client_name: client.hasClient ? client.name : null,
    health_score: 100,
    progress: 0,
    created_at: new Date().toISOString(),
    // Cost estimates for dashboard compatibility
    estimate_labour: costEstimate.totalLabour,
    estimate_materials: costEstimate.totalMaterials,
    estimate_total: costEstimate.grandTotal,
    estimate_high: costEstimate.grandTotal,
    estimate_low: Math.round(costEstimate.grandTotal * 0.9),
  };

  mockProjects.unshift(newProject);
  saveProjectsToStorage();

  // Count tasks
  let taskCount = 0;
  for (const code of enabledCategories) {
    taskCount += getCategoryScopeItems(scope, code).length;
  }

  return {
    data: {
      ...newProject,
      taskCount,
      categoryCount: enabledCategories.length,
    },
    error: null,
  };
}

/**
 * Map category codes to their typical initial stage
 */
function getStageForCategory(categoryCode) {
  const stageMap = {
    // Site & early work
    SW: 'ST-DM',  // Demolition
    FN: 'ST-SS',  // Site & Structure
    FR: 'ST-SS',  // Site & Structure
    RF: 'ST-EW',  // Envelope
    EX: 'ST-EW',  // Envelope
    WD: 'ST-EW',  // Envelope

    // Rough-in trades
    EL: 'ST-RO',  // Rough-In
    PL: 'ST-RO',  // Rough-In
    HV: 'ST-RO',  // Rough-In
    IN: 'ST-IS',  // Insulation

    // Finish work
    DW: 'ST-DW',  // Drywall
    PT: 'ST-FN',  // Finish
    FL: 'ST-FN',  // Finish
    TL: 'ST-FN',  // Finish
    FC: 'ST-FN',  // Finish
    CB: 'ST-FN',  // Finish
    CT: 'ST-FN',  // Finish
    FX: 'ST-FX',  // Fixtures
    CL: 'ST-PL',  // Punch List
  };

  return stageMap[categoryCode] || 'ST-FN';
}

/**
 * Calculate estimated project duration based on scope
 * Returns duration in weeks
 */
export function estimateProjectDuration(scope) {
  const enabledCategories = getEnabledCategories(scope);

  // Base durations per category (in days)
  const categoryDurations = {
    SW: 3, FN: 7, FR: 10, RF: 3, EX: 5, WD: 2,
    IN: 2, EL: 5, PL: 5, HV: 5, DW: 10,
    PT: 7, FL: 5, TL: 5, FC: 5, CB: 3, CT: 2, FX: 2, CL: 2,
  };

  let totalDays = 0;
  for (const code of enabledCategories) {
    totalDays += categoryDurations[code] || 3;
  }

  // Convert to weeks (round up)
  return Math.ceil(totalDays / 5); // 5 working days per week
}

/**
 * Recalculate project estimates from current scope and Cost Catalogue rates
 * Only allowed if contract is not signed
 *
 * @param {string} projectId - The project ID to recalculate
 * @param {string} notes - Optional notes for this recalculation
 * @returns {{ data: Object|null, error: string|null }}
 */
export async function recalculateProjectEstimate(projectId, notes = '') {
  try {
    // Find the project
    const project = mockProjects.find(p => p.id === projectId);
    if (!project) {
      return { data: null, error: 'Project not found' };
    }

    // Check if contract is signed - cannot recalculate after contract
    if (project.contract_signed) {
      return {
        data: null,
        error: 'Cannot recalculate estimates after contract is signed',
      };
    }

    // Check if we have intake data to recalculate from
    if (!project.intake_data?.scope) {
      return {
        data: null,
        error: 'No scope data available for recalculation',
      };
    }

    const { scope } = project.intake_data;
    const specLevel = project.intake_data?.project?.specLevel || project.build_tier || 'standard';

    // Recalculate costs from current Cost Catalogue rates
    const costEstimate = calculateScopeCosts(scope, specLevel);
    const enabledCategories = getEnabledCategories(scope);

    // Create new estimate snapshot
    const newSnapshot = {
      id: `est-${Date.now()}`,
      created_at: new Date().toISOString(),
      spec_level: specLevel,
      total_labour: costEstimate.totalLabour,
      total_materials: costEstimate.totalMaterials,
      grand_total: costEstimate.grandTotal,
      item_count: costEstimate.itemCount,
      low_confidence_count: costEstimate.lowConfidenceItems.length,
      categories: costEstimate.categories,
      source: 'recalculation',
      notes: notes || 'Manual recalculation',
      previous_total: project.estimate_total,
      change_amount: costEstimate.grandTotal - (project.estimate_total || 0),
    };

    // Update project totals
    project.estimate_labour = costEstimate.totalLabour;
    project.estimate_materials = costEstimate.totalMaterials;
    project.estimate_total = costEstimate.grandTotal;
    project.updated_at = new Date().toISOString();

    // Add to estimate history
    if (!project.estimate_history) {
      project.estimate_history = [];
    }
    project.estimate_history.push(newSnapshot);

    // Update task instance costs if they exist
    if (project.taskInstances) {
      for (const task of project.taskInstances) {
        const categoryEstimate = costEstimate.categories[task.categoryCode];
        const itemCost = categoryEstimate?.items?.find(i => i.name === task.name) || null;

        if (itemCost) {
          task.estimate_labour = itemCost.labourCost;
          task.estimate_materials = itemCost.materialsCost;
          task.estimate_total = itemCost.totalCost;
          task.estimate_unit_cost = itemCost.unitCost;
          task.estimate_source = itemCost.source;
          task.estimate_confidence = itemCost.confidence;
          task.estimate_updated_at = new Date().toISOString();
        }
      }
    }

    // Persist changes
    saveProjectsToStorage();

    console.log('Project estimate recalculated:', projectId);
    console.log('New total:', costEstimate.grandTotal);
    console.log('History entries:', project.estimate_history.length);

    return {
      data: {
        ...project,
        categoryCount: enabledCategories.length,
        recalculated: true,
        snapshot: newSnapshot,
      },
      error: null,
    };
  } catch (err) {
    console.error('recalculateProjectEstimate error:', err);
    return { data: null, error: err.message };
  }
}

/**
 * Check if project estimates can be recalculated
 *
 * @param {Object} project - The project object
 * @returns {boolean}
 */
export function canRecalculateEstimate(project) {
  if (!project) return false;
  if (project.contract_signed) return false;
  if (!project.intake_data?.scope) return false;
  // Also block if project is in production or later phases
  const blockedStatuses = ['production', 'complete', 'closed', 'archived'];
  if (blockedStatuses.includes(project.status)) return false;
  return true;
}

/**
 * Get estimate history for a project
 *
 * @param {string} projectId - The project ID
 * @returns {{ data: Array|null, error: string|null }}
 */
export function getEstimateHistory(projectId) {
  const project = mockProjects.find(p => p.id === projectId);
  if (!project) {
    return { data: null, error: 'Project not found' };
  }

  return {
    data: project.estimate_history || [],
    error: null,
  };
}
