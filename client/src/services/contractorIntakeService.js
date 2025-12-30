/**
 * Contractor Intake Service
 *
 * Generates projects with LOOPS from contractor scope-of-work data.
 * Each enabled trade category becomes a loop, and scope items become tasks within that loop.
 *
 * Flow: Contractor Intake → Project + Loops + Tasks (all created together)
 */

import { createProject, createLoopsBatch, createTasksBatch } from './db';
import { getEnabledCategories } from '../data/contractorIntakeSchema';
import { calculateScopeCosts } from '../lib/scopeCostEstimator';
import {
  getTrade,
  getTradeFromScopePrefix,
  PROJECT_PHASES,
} from '../lib/constants';

/**
 * Generate a Project with Loops and Tasks from contractor intake data
 *
 * @param {Object} formData - The contractor intake form data
 * @returns {{ data: Object|null, error: string|null }}
 */
export async function generateProjectFromContractorIntake(formData) {
  try {
    const { project, client, scope, instances } = formData;

    console.log('[contractorIntakeService] Starting project generation');
    console.log('[contractorIntakeService] scope:', scope);
    console.log('[contractorIntakeService] instances:', instances);

    // Check if using new instances format or old scope format
    const hasInstances = instances && instances.length > 0;
    const hasOldScope = Object.values(scope || {}).some(cat =>
      cat.enabled && Object.values(cat.items || {}).some(item => item.qty > 0)
    );

    if (!hasInstances && !hasOldScope) {
      return { data: null, error: 'No scope items selected. Please add at least one trade.' };
    }

    // Build effective scope from instances or existing scope
    let effectiveScope = scope || {};
    let enabledCategories = [];

    if (hasInstances) {
      effectiveScope = buildScopeFromInstances(instances);
      enabledCategories = Object.keys(effectiveScope);
      console.log('[contractorIntakeService] Built scope from instances:', effectiveScope);
    } else {
      enabledCategories = getEnabledCategories(scope);
    }

    console.log('[contractorIntakeService] enabledCategories:', enabledCategories);

    // Calculate cost estimates
    const costEstimate = hasOldScope
      ? calculateScopeCosts(scope, project.specLevel || 'standard')
      : { grandTotal: 0, categories: {} };

    // Build project data
    const projectData = {
      name: project.name,
      phase: 'estimate', // Contractor projects start in estimate phase
      address: project.address || null,

      // Client info
      client_name: client?.hasClient ? client.name : null,
      client_email: client?.hasClient ? client.email : null,
      client_phone: client?.hasClient ? client.phone : null,

      // Estimates
      estimate_high: costEstimate.grandTotal || null,
      estimate_low: costEstimate.grandTotal ? Math.round(costEstimate.grandTotal * 0.9) : null,

      // Intake metadata
      intake_type: 'contractor',
      build_tier: project.specLevel || 'standard',
      intake_data: {
        ...formData,
        cost_estimate: costEstimate,
      },
    };

    console.log('[contractorIntakeService] Creating project...');

    // ========================================
    // 1. CREATE PROJECT
    // ========================================
    const { data: createdProject, error: projectError } = await createProject(projectData);

    if (projectError) {
      console.error('[contractorIntakeService] Project create error:', projectError);
      return { data: null, error: `Failed to create project: ${projectError}` };
    }

    console.log('[contractorIntakeService] Project created:', createdProject.id);

    // ========================================
    // 2. CREATE LOOPS (one per enabled trade category)
    // ========================================
    const loopsToCreate = [];
    const tasksByLoop = {};

    // Sort enabled categories by trade order
    const sortedCategories = sortCategoriesByTradeOrder(enabledCategories);

    let loopOrder = 1;

    for (const tradeCode of sortedCategories) {
      const categoryData = effectiveScope[tradeCode];
      if (!categoryData || !categoryData.enabled) continue;

      const trade = getTrade(tradeCode);
      const items = categoryData.items || {};
      const itemCount = Object.keys(items).filter(k => items[k]?.qty > 0).length;

      if (itemCount === 0) continue;

      const loop = {
        project_id: createdProject.id,
        name: trade.name,
        loop_type: 'trade',
        trade_code: trade.code,
        status: 'pending',
        display_order: loopOrder++,
        source: 'contractor_intake',
        health_score: 0,
        health_color: 'gray',
      };

      loopsToCreate.push(loop);

      // Prepare tasks for this loop
      tasksByLoop[trade.code] = [];
      let taskOrder = 1;

      for (const [itemId, itemData] of Object.entries(items)) {
        if (!itemData || itemData.qty <= 0) continue;

        const taskTitle = itemData.name || itemData.scopeItemId || itemId;

        tasksByLoop[trade.code].push({
          title: taskTitle,
          description: itemData.notes || null,
          status: 'pending',
          priority: 2,
          category_code: trade.code,
          location: itemData.level || null,
          display_order: taskOrder++,
          source: 'contractor_intake',
          quantity: itemData.qty || 1,
          unit: itemData.unit || null,
          scope_item_id: itemData.scopeItemId || itemId,
        });
      }
    }

    console.log('[contractorIntakeService] Creating', loopsToCreate.length, 'loops...');

    // Create all loops
    const { data: createdLoops, error: loopsError } = await createLoopsBatch(loopsToCreate);

    if (loopsError) {
      console.error('[contractorIntakeService] Loops create error:', loopsError);
      // Continue with empty loops array if batch fails
    }

    const loops = createdLoops || [];

    // ========================================
    // 3. CREATE TASKS (one per scope item)
    // ========================================
    const allTasksToCreate = [];

    for (const loop of loops) {
      // trade_code may be mapped to category_code by createLoopsBatch
      const tradeCode = loop.trade_code || loop.category_code;
      const tasksForLoop = tasksByLoop[tradeCode] || [];

      for (const task of tasksForLoop) {
        allTasksToCreate.push({
          ...task,
          loop_id: loop.id,
        });
      }
    }

    console.log('[contractorIntakeService] Creating', allTasksToCreate.length, 'tasks...');

    let createdTasks = [];
    if (allTasksToCreate.length > 0) {
      const { data: tasks, error: tasksError } = await createTasksBatch(allTasksToCreate);

      if (tasksError) {
        console.error('[contractorIntakeService] Tasks create error:', tasksError);
      } else {
        createdTasks = tasks || [];
      }
    }

    console.log('[contractorIntakeService] Complete!', {
      loops: loops.length,
      tasks: createdTasks.length,
    });

    return {
      data: {
        ...createdProject,
        loops,
        tasks: createdTasks,
        loopCount: loops.length,
        taskCount: createdTasks.length,
        categoryCount: enabledCategories.length,
      },
      error: null,
    };

  } catch (err) {
    console.error('[contractorIntakeService] Error:', err);
    return { data: null, error: err.message };
  }
}

/**
 * Build scope structure from instances array
 * Groups instances by trade code extracted from scopeItemId
 */
function buildScopeFromInstances(instances) {
  const tradeGroups = {};

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
    // Add more as needed
  };

  for (const instance of instances) {
    // Extract trade code from scopeItemId (e.g., "fr-ext" -> "fr" -> "FS")
    const scopeItemId = instance.scopeItemId || '';
    const prefix = scopeItemId.split('-')[0]?.toLowerCase();
    const tradeCode = getTradeFromScopePrefix(prefix);

    if (!tradeGroups[tradeCode]) {
      tradeGroups[tradeCode] = {
        enabled: true,
        items: {},
      };
    }

    // Add instance as a scope item
    const itemId = instance.id || `inst-${Object.keys(tradeGroups[tradeCode].items).length}`;
    const itemName = SCOPE_ITEM_NAMES[scopeItemId] || scopeItemId || 'Item';

    tradeGroups[tradeCode].items[itemId] = {
      qty: instance.measurement || instance.quantity || 1,
      unit: instance.unit || 'lf',
      name: itemName,
      level: instance.level,
      assemblyId: instance.assemblyId,
      notes: instance.notes || null,
      scopeItemId: scopeItemId,
      instanceRef: instance,
    };
  }

  return tradeGroups;
}

/**
 * Sort trade codes by canonical construction order
 */
function sortCategoriesByTradeOrder(categories) {
  return [...categories].sort((a, b) => {
    const tradeA = getTrade(a);
    const tradeB = getTrade(b);
    return tradeA.order - tradeB.order;
  });
}

/**
 * Calculate estimated project duration based on scope
 * Returns duration in weeks
 */
export function estimateProjectDuration(scope) {
  const enabledCategories = getEnabledCategories(scope);

  // Base durations per category (in days)
  const categoryDurations = {
    SW: 3, DM: 2, FN: 7, FS: 10, FI: 5, RF: 3, EE: 5, WD: 2,
    IA: 2, EL: 5, PL: 5, HV: 5, DW: 10,
    PT: 7, FL: 5, TL: 5, FC: 5, CM: 3, CT: 2, SR: 3, FX: 2, EF: 3, CL: 2, GN: 1,
  };

  let totalDays = 0;
  for (const code of enabledCategories) {
    // Resolve any legacy codes
    const trade = getTrade(code);
    totalDays += categoryDurations[trade.code] || 3;
  }

  // Convert to weeks (round up)
  return Math.ceil(totalDays / 5); // 5 working days per week
}

/**
 * Check if project estimates can be recalculated
 */
export function canRecalculateEstimate(project) {
  if (!project) return false;
  if (project.contract_signed) return false;
  if (!project.intake_data?.scope) return false;

  // Block if project is in production or later phases
  const phase = PROJECT_PHASES[project.phase];
  if (!phase?.allowsLoopEdits) return false;

  return true;
}

/**
 * Recalculate project estimates from current scope
 * Only allowed if contract is not signed
 *
 * @param {string} projectId - The project ID to recalculate
 * @param {string} notes - Optional notes for this recalculation
 * @returns {{ data: Object|null, error: string|null }}
 */
export async function recalculateProjectEstimate(projectId, notes = '') {
  // For now, return an error since we need to implement this with Supabase
  console.warn('[contractorIntakeService] recalculateProjectEstimate not yet implemented');
  return {
    data: null,
    error: 'Estimate recalculation not yet implemented. Please edit the estimate manually.',
  };
}
