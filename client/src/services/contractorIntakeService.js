import { createProject } from './api';
import { getEnabledCategories } from '../data/contractorIntakeSchema';
import { calculateScopeCosts } from '../lib/scopeCostEstimator';

/**
 * Contractor Intake Service
 *
 * Generates projects with LOOPS from contractor scope-of-work data.
 * Each enabled trade category becomes a loop, and scope items become tasks within that loop.
 *
 * Flow: Contractor Intake → Project + Loops + Tasks (all created together)
 */

// Trade names for loop display (will be used when loops are re-enabled)
// const TRADE_NAMES = { SW: 'Site Work', FN: 'Foundation', FR: 'Framing', ... };
// const TRADE_ORDER = ['SW', 'FN', 'FR', 'RF', 'EX', 'WD', 'IN', 'EL', 'PL', 'HV', 'DW', 'PT', 'FL', 'TL', 'FC', 'CB', 'CT', 'FX', 'CL'];

/**
 * Generate a Project with Loops and Tasks from contractor intake data
 *
 * @param {Object} formData - The contractor intake form data
 * @returns {{ data: Object|null, error: string|null }}
 */
export async function generateProjectFromContractorIntake(formData) {
  try {
    const { project, client, scope, instances } = formData;

    console.log('[contractorIntakeService] formData:', formData);
    console.log('[contractorIntakeService] scope:', scope);
    console.log('[contractorIntakeService] instances:', instances);
    if (instances?.length > 0) {
      console.log('[contractorIntakeService] First instance:', JSON.stringify(instances[0], null, 2));
    }

    // Check if using new instances format or old scope format
    const hasInstances = instances && instances.length > 0;
    const hasOldScope = Object.values(scope || {}).some(cat =>
      cat.enabled && Object.values(cat.items || {}).some(item => item.qty > 0)
    );

    console.log('[contractorIntakeService] hasInstances:', hasInstances, 'hasOldScope:', hasOldScope);

    if (!hasInstances && !hasOldScope) {
      return { data: null, error: 'No scope items selected. Please add at least one trade.' };
    }

    // For the new instances format, we need to build scope-like structure from instances
    let effectiveScope = scope || {};
    let enabledCategories = [];

    if (hasInstances) {
      // Build scope structure from instances
      // Group instances by trade code extracted from scopeItemId (e.g., "fr-ext" -> "FR")
      const tradeGroups = {};

      // Map scopeItemId prefixes to trade codes
      const SCOPE_ITEM_PREFIX_TO_TRADE = {
        'sw': 'SW', // Site Work
        'fn': 'FN', // Foundation
        'fr': 'FR', // Framing
        'rf': 'RF', // Roofing
        'ex': 'EX', // Exterior
        'wd': 'WD', // Windows & Doors
        'in': 'IN', // Insulation
        'el': 'EL', // Electrical
        'pl': 'PL', // Plumbing
        'hv': 'HV', // HVAC
        'dw': 'DW', // Drywall
        'pt': 'PT', // Painting
        'fl': 'FL', // Flooring
        'tl': 'TL', // Tile
        'fc': 'FC', // Finish Carpentry
        'cb': 'CB', // Cabinetry
        'ct': 'CT', // Countertops
        'fx': 'FX', // Fixtures
        'cl': 'CL', // Cleaning & Closeout
      };

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
        // Extract trade code from scopeItemId (e.g., "fr-ext" -> "fr" -> "FR")
        const scopeItemId = instance.scopeItemId || '';
        const prefix = scopeItemId.split('-')[0]?.toLowerCase();
        const tradeCode = SCOPE_ITEM_PREFIX_TO_TRADE[prefix] || 'GN';

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
          unit: instance.unit || 'lf', // Default to linear feet for framing
          name: itemName,
          level: instance.level,
          assemblyId: instance.assemblyId,
          notes: instance.notes || null,
          scopeItemId: scopeItemId,
          // Keep reference to original instance
          instanceRef: instance,
        };
      }
      effectiveScope = tradeGroups;
      enabledCategories = Object.keys(tradeGroups);
      console.log('[contractorIntakeService] Built scope from instances:', effectiveScope);
    } else {
      enabledCategories = getEnabledCategories(scope);
    }

    console.log('[contractorIntakeService] enabledCategories:', enabledCategories);

    // Calculate cost estimates
    const costEstimate = hasOldScope
      ? calculateScopeCosts(scope, project.specLevel || 'standard')
      : { grandTotal: 0, categories: {} }; // Instances have their own cost calculation

    // Build project data (matching api.js createProject expectations)
    const projectData = {
      name: project.name,
      phase: 'estimating', // Contractor projects start in estimating phase
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

    console.log('[contractorIntakeService] Creating project with loops...');
    console.log('[contractorIntakeService] Enabled trades:', enabledCategories);

    // ========================================
    // 1. CREATE PROJECT (using api.js createProject which handles mock/Supabase)
    // ========================================
    console.log('[contractorIntakeService] About to create project:', projectData);

    const { data: createdProject, error: projectError } = await createProject(projectData);

    if (projectError) {
      console.error('[contractorIntakeService] Project create error:', projectError);
      return { data: null, error: `Failed to create project: ${projectError}` };
    }

    console.log('[contractorIntakeService] Project created:', createdProject.id);

    // Skip loops/tasks/activity for now - just return the project
    // TODO: Re-enable loops creation once Supabase RLS is configured
    console.log('[contractorIntakeService] Complete! Skipping loops/tasks for now.');

    return {
      data: {
        ...createdProject,
        loops: [],
        tasks: [],
        loopCount: 0,
        taskCount: 0,
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
 * Check if project estimates can be recalculated
 */
export function canRecalculateEstimate(project) {
  if (!project) return false;
  if (project.contract_signed) return false;
  if (!project.intake_data?.scope) return false;
  // Block if project is in production or later phases
  const blockedPhases = ['active', 'punch_list', 'complete', 'cancelled'];
  if (blockedPhases.includes(project.phase)) return false;
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
  // This is a placeholder to prevent import errors
  console.warn('[contractorIntakeService] recalculateProjectEstimate not yet implemented for Supabase');
  return {
    data: null,
    error: 'Estimate recalculation not yet implemented. Please edit the estimate manually.',
  };
}
