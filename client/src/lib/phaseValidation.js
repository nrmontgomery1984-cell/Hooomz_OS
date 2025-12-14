/**
 * Phase Builder - Dependency Validation Engine
 *
 * Enforces construction sequencing rules:
 * - Hard dependencies: structural/code - CANNOT be violated
 * - Soft dependencies: best practice - CAN override with reason
 */

import { PHASE_TEMPLATES, PHASE_CATEGORIES } from '../data/phaseTemplates';

// ============================================================================
// VALIDATION RESULT TYPES
// ============================================================================

/**
 * @typedef {Object} ValidationError
 * @property {'hard_dependency_violation'} type
 * @property {string} message
 * @property {string} blockedPhaseId
 * @property {string} requiredPhaseId
 * @property {string} suggestion
 */

/**
 * @typedef {Object} ValidationWarning
 * @property {'soft_dependency_violation'|'efficiency_concern'} type
 * @property {string} message
 * @property {string} recommendation
 * @property {boolean} canOverride
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid
 * @property {ValidationError[]} errors
 * @property {ValidationWarning[]} warnings
 */

// ============================================================================
// CORE VALIDATION FUNCTIONS
// ============================================================================

/**
 * Build a map of phase IDs to their status
 * @param {Object[]} projectPhases - Project's current phases with status
 * @returns {Map<string, string>} phaseId -> status
 */
function buildPhaseStatusMap(projectPhases) {
  const map = new Map();
  projectPhases.forEach(phase => {
    map.set(phase.id, phase.status || 'pending');
  });
  return map;
}

/**
 * Get a phase by ID from template
 * @param {Object} template - Phase template
 * @param {string} phaseId - Phase ID to find
 * @returns {Object|null}
 */
function getPhaseFromTemplate(template, phaseId) {
  return template.phases.find(p => p.id === phaseId) || null;
}

/**
 * Validate if a phase can be marked as complete
 * Checks all dependencies are satisfied
 *
 * @param {string} phaseId - Phase to validate
 * @param {Object[]} projectPhases - Current project phases with status
 * @param {Object} template - Phase template being used
 * @returns {ValidationResult}
 */
export function validatePhaseCompletion(phaseId, projectPhases, template) {
  const result = {
    valid: true,
    errors: [],
    warnings: [],
  };

  const phase = getPhaseFromTemplate(template, phaseId);
  if (!phase) {
    result.valid = false;
    result.errors.push({
      type: 'hard_dependency_violation',
      message: `Phase "${phaseId}" not found in template`,
      blockedPhaseId: phaseId,
      requiredPhaseId: null,
      suggestion: 'Ensure the phase exists in the selected template',
    });
    return result;
  }

  const statusMap = buildPhaseStatusMap(projectPhases);

  // Check each dependency
  for (const dep of phase.dependencies) {
    const requiredPhase = getPhaseFromTemplate(template, dep.requiresPhaseId);
    const requiredStatus = statusMap.get(dep.requiresPhaseId);

    // Check if required phase is complete
    const isComplete = requiredStatus === 'complete' || requiredStatus === 'completed';

    if (!isComplete) {
      if (dep.type === 'hard') {
        // Hard dependency violation - blocks completion
        result.valid = false;
        result.errors.push({
          type: 'hard_dependency_violation',
          message: `Cannot complete "${phase.name}" - requires "${requiredPhase?.name || dep.requiresPhaseId}" to be complete first`,
          blockedPhaseId: phaseId,
          requiredPhaseId: dep.requiresPhaseId,
          suggestion: `Complete "${requiredPhase?.name || dep.requiresPhaseId}" before proceeding. Reason: ${dep.reason}`,
        });
      } else {
        // Soft dependency - warning only
        result.warnings.push({
          type: 'soft_dependency_violation',
          message: `"${requiredPhase?.name || dep.requiresPhaseId}" is typically completed before "${phase.name}"`,
          recommendation: dep.reason,
          canOverride: dep.canOverride !== false,
        });
      }
    }
  }

  return result;
}

/**
 * Validate if phases can be reordered
 * Ensures new order doesn't violate hard dependencies
 *
 * @param {Object[]} proposedOrder - Phases in proposed new order
 * @param {Object} template - Phase template
 * @returns {ValidationResult}
 */
export function validatePhaseReorder(proposedOrder, template) {
  const result = {
    valid: true,
    errors: [],
    warnings: [],
  };

  // Build position map for proposed order
  const positionMap = new Map();
  proposedOrder.forEach((phase, index) => {
    positionMap.set(phase.id, index);
  });

  // Check each phase's dependencies
  for (const phase of proposedOrder) {
    const templatePhase = getPhaseFromTemplate(template, phase.id);
    if (!templatePhase) continue;

    for (const dep of templatePhase.dependencies) {
      const requiredPosition = positionMap.get(dep.requiresPhaseId);
      const currentPosition = positionMap.get(phase.id);

      // Skip if required phase isn't in the list (might be removed by scope rules)
      if (requiredPosition === undefined) continue;

      // Check if required phase comes before current phase
      if (requiredPosition >= currentPosition) {
        const requiredPhase = getPhaseFromTemplate(template, dep.requiresPhaseId);

        if (dep.type === 'hard') {
          result.valid = false;
          result.errors.push({
            type: 'hard_dependency_violation',
            message: `"${templatePhase.name}" cannot come before "${requiredPhase?.name || dep.requiresPhaseId}"`,
            blockedPhaseId: phase.id,
            requiredPhaseId: dep.requiresPhaseId,
            suggestion: dep.reason,
          });
        } else {
          result.warnings.push({
            type: 'soft_dependency_violation',
            message: `"${requiredPhase?.name || dep.requiresPhaseId}" is typically done before "${templatePhase.name}"`,
            recommendation: dep.reason,
            canOverride: dep.canOverride !== false,
          });
        }
      }
    }
  }

  return result;
}

/**
 * Validate if a task can be marked complete
 * Checks phase-level dependencies
 *
 * @param {Object} task - Task to validate
 * @param {Object[]} projectPhases - Current project phases
 * @param {Object} template - Phase template
 * @returns {ValidationResult}
 */
export function validateTaskCompletion(task, projectPhases, template) {
  // Find which phase this task belongs to based on trade code
  const phase = template.phases.find(p =>
    p.tradeCodes.includes(task.categoryCode || task.category_code)
  );

  if (!phase) {
    // Task not tied to a template phase - allow completion
    return { valid: true, errors: [], warnings: [] };
  }

  // Check if the phase's dependencies are satisfied
  return validatePhaseCompletion(phase.id, projectPhases, template);
}

// ============================================================================
// SCOPE RULE APPLICATION
// ============================================================================

/**
 * Apply scope rules to filter/modify phases for a project
 *
 * @param {Object} template - Phase template
 * @param {Object} project - Project with intake_data
 * @returns {Object[]} Filtered phases
 */
export function applyTempleScopeRules(template, project) {
  let phases = [...template.phases];
  const intakeData = project.intake_data || {};

  for (const rule of template.scopeRules || []) {
    const { condition, action } = rule;
    let conditionMet = false;

    // Evaluate condition
    switch (condition.type) {
      case 'scope_includes':
        conditionMet = checkScopeIncludes(intakeData, condition.value);
        break;
      case 'scope_excludes':
        conditionMet = !checkScopeIncludes(intakeData, condition.value);
        break;
      case 'building_has':
        conditionMet = checkBuildingHas(intakeData, condition.value);
        break;
    }

    // Apply action if condition met
    if (conditionMet) {
      switch (action.type) {
        case 'remove_phase':
          phases = phases.filter(p => !action.phaseIds.includes(p.id));
          break;
        case 'add_phase':
          // Would need phase definitions to add
          break;
        case 'merge_phases':
          // Complex merge logic
          break;
        case 'reorder':
          // Reorder phases
          break;
      }
    }
  }

  return phases;
}

/**
 * Check if scope includes a feature
 */
function checkScopeIncludes(intakeData, value) {
  const selectedRooms = intakeData.renovation?.selected_rooms || [];
  const features = intakeData.features || {};

  // Check rooms
  if (selectedRooms.includes(value)) return true;

  // Check features
  if (features[value]) return true;

  // Check layout
  if (intakeData.layout?.[value]) return true;

  return false;
}

/**
 * Check building characteristics
 */
function checkBuildingHas(intakeData, value) {
  const layout = intakeData.layout || {};

  switch (value) {
    case 'single_storey':
      return layout.storeys === 1 || layout.sqft_range?.includes('1') || false;
    case 'multi_storey':
      return layout.storeys > 1 || false;
    case 'basement':
      return layout.has_basement || layout.basement_type !== 'none';
    case 'freestanding':
      return layout.deck_attached === false;
    default:
      return false;
  }
}

// ============================================================================
// PHASE PROGRESS & STATUS
// ============================================================================

/**
 * Calculate overall progress through phases
 *
 * @param {Object[]} projectPhases - Project phases with status
 * @returns {Object} Progress stats
 */
export function calculatePhaseProgress(projectPhases) {
  const total = projectPhases.length;
  const completed = projectPhases.filter(p => p.status === 'complete' || p.status === 'completed').length;
  const inProgress = projectPhases.filter(p => p.status === 'in_progress').length;
  const blocked = projectPhases.filter(p => p.status === 'blocked').length;
  const pending = projectPhases.filter(p => p.status === 'pending' || !p.status).length;

  return {
    total,
    completed,
    inProgress,
    blocked,
    pending,
    percentComplete: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

/**
 * Get phases that are ready to start (all dependencies complete)
 *
 * @param {Object[]} projectPhases - Project phases with status
 * @param {Object} template - Phase template
 * @returns {Object[]} Phases ready to start
 */
export function getReadyPhases(projectPhases, template) {
  const statusMap = buildPhaseStatusMap(projectPhases);
  const ready = [];

  for (const phase of template.phases) {
    // Skip if already complete or in progress
    const status = statusMap.get(phase.id);
    if (status === 'complete' || status === 'completed' || status === 'in_progress') {
      continue;
    }

    // Check all hard dependencies
    const allHardDepsComplete = phase.dependencies
      .filter(d => d.type === 'hard')
      .every(d => {
        const depStatus = statusMap.get(d.requiresPhaseId);
        return depStatus === 'complete' || depStatus === 'completed';
      });

    if (allHardDepsComplete) {
      ready.push(phase);
    }
  }

  return ready;
}

/**
 * Get phases that are blocked (have incomplete hard dependencies)
 *
 * @param {Object[]} projectPhases - Project phases with status
 * @param {Object} template - Phase template
 * @returns {Object[]} Blocked phases with blocking info
 */
export function getBlockedPhases(projectPhases, template) {
  const statusMap = buildPhaseStatusMap(projectPhases);
  const blocked = [];

  for (const phase of template.phases) {
    const status = statusMap.get(phase.id);
    if (status === 'complete' || status === 'completed') continue;

    const blockingDeps = phase.dependencies
      .filter(d => d.type === 'hard')
      .filter(d => {
        const depStatus = statusMap.get(d.requiresPhaseId);
        return depStatus !== 'complete' && depStatus !== 'completed';
      })
      .map(d => ({
        phaseId: d.requiresPhaseId,
        phaseName: getPhaseFromTemplate(template, d.requiresPhaseId)?.name || d.requiresPhaseId,
        reason: d.reason,
      }));

    if (blockingDeps.length > 0) {
      blocked.push({
        ...phase,
        blockedBy: blockingDeps,
      });
    }
  }

  return blocked;
}

// ============================================================================
// DEPENDENCY GRAPH UTILITIES
// ============================================================================

/**
 * Get all phases that depend on a given phase (direct and transitive)
 *
 * @param {string} phaseId - Phase to check dependents for
 * @param {Object} template - Phase template
 * @returns {string[]} Phase IDs that depend on this phase
 */
export function getDependentPhases(phaseId, template) {
  const dependents = new Set();

  function findDependents(targetId) {
    for (const phase of template.phases) {
      if (phase.dependencies.some(d => d.requiresPhaseId === targetId)) {
        if (!dependents.has(phase.id)) {
          dependents.add(phase.id);
          findDependents(phase.id); // Recursive for transitive deps
        }
      }
    }
  }

  findDependents(phaseId);
  return Array.from(dependents);
}

/**
 * Get all phases that a given phase depends on (direct and transitive)
 *
 * @param {string} phaseId - Phase to check dependencies for
 * @param {Object} template - Phase template
 * @returns {string[]} Phase IDs this phase depends on
 */
export function getPrerequisitePhases(phaseId, template) {
  const prerequisites = new Set();
  const phase = getPhaseFromTemplate(template, phaseId);

  if (!phase) return [];

  function findPrereqs(p) {
    for (const dep of p.dependencies) {
      if (!prerequisites.has(dep.requiresPhaseId)) {
        prerequisites.add(dep.requiresPhaseId);
        const reqPhase = getPhaseFromTemplate(template, dep.requiresPhaseId);
        if (reqPhase) {
          findPrereqs(reqPhase);
        }
      }
    }
  }

  findPrereqs(phase);
  return Array.from(prerequisites);
}

/**
 * Build a visual dependency graph for rendering
 *
 * @param {Object} template - Phase template
 * @returns {Object} Graph structure for visualization
 */
export function buildDependencyGraph(template) {
  const nodes = template.phases.map(phase => ({
    id: phase.id,
    name: phase.name,
    shortName: phase.shortName,
    category: phase.category,
    color: PHASE_CATEGORIES[phase.category]?.color || '#6B7280',
    order: phase.order,
    groupId: phase.groupId,
  }));

  const edges = [];
  for (const phase of template.phases) {
    for (const dep of phase.dependencies) {
      edges.push({
        from: dep.requiresPhaseId,
        to: phase.id,
        type: dep.type,
        reason: dep.reason,
      });
    }
  }

  return { nodes, edges };
}

// ============================================================================
// OVERRIDE TRACKING
// ============================================================================

/**
 * Create an override record for audit trail
 *
 * @param {string} phaseId - Phase being completed despite soft dependency
 * @param {Object[]} warnings - Warnings being overridden
 * @param {string} userId - User making the override
 * @param {string} reason - User-provided reason for override
 * @returns {Object} Override record
 */
export function createOverrideRecord(phaseId, warnings, userId, reason) {
  return {
    id: crypto.randomUUID(),
    phaseId,
    warnings: warnings.map(w => ({
      type: w.type,
      message: w.message,
    })),
    userId,
    reason,
    timestamp: new Date().toISOString(),
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  validatePhaseCompletion,
  validatePhaseReorder,
  validateTaskCompletion,
  applyTempleScopeRules,
  calculatePhaseProgress,
  getReadyPhases,
  getBlockedPhases,
  getDependentPhases,
  getPrerequisitePhases,
  buildDependencyGraph,
  createOverrideRecord,
};
