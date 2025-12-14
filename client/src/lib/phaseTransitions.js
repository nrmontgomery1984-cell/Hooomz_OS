/**
 * Phase Transition Configuration
 *
 * Defines the valid phase flow, gate conditions, and transition rules.
 * Phase IDs match PROJECT_PHASES in types/dashboard.js
 *
 * Flow: intake → estimating → quoted → contracted → active → punch_list → complete
 */

/**
 * Phase definitions with metadata
 */
export const PHASES = {
  intake: {
    id: 'intake',
    label: 'New Lead',
    description: 'New lead - reviewing intake form',
    order: 1,
    color: 'purple',
  },
  estimating: {
    id: 'estimating',
    label: 'Estimating',
    description: 'Preparing detailed estimate',
    order: 2,
    color: 'blue',
  },
  quoted: {
    id: 'quoted',
    label: 'Quoted',
    description: 'Quote sent - awaiting client response',
    order: 3,
    color: 'cyan',
  },
  contracted: {
    id: 'contracted',
    label: 'Contracted',
    description: 'Contract signed - ready to start',
    order: 4,
    color: 'indigo',
  },
  active: {
    id: 'active',
    label: 'In Progress',
    description: 'Construction in progress',
    order: 5,
    color: 'emerald',
  },
  punch_list: {
    id: 'punch_list',
    label: 'Punch List',
    description: 'Final items and walkthrough',
    order: 6,
    color: 'amber',
  },
  complete: {
    id: 'complete',
    label: 'Complete',
    description: 'Project finished',
    order: 7,
    color: 'gray',
  },
  cancelled: {
    id: 'cancelled',
    label: 'Cancelled',
    description: 'Project cancelled',
    order: 99,
    color: 'red',
  },
};

/**
 * Valid phase transitions
 * Key = current phase, Value = array of valid next phases
 */
export const VALID_TRANSITIONS = {
  intake: ['estimating', 'cancelled'],
  estimating: ['intake', 'quoted', 'cancelled'],
  quoted: ['estimating', 'contracted', 'cancelled'],
  contracted: ['quoted', 'active', 'cancelled'],
  active: ['contracted', 'punch_list', 'cancelled'],
  punch_list: ['active', 'complete', 'cancelled'],
  complete: ['punch_list'], // Can reopen to punch list if issues found
  cancelled: ['intake'], // Can revive a cancelled project
};

/**
 * Gate conditions for each transition
 * soft = warnings (can proceed), hard = blockers (cannot proceed)
 */
export const TRANSITION_GATES = {
  // intake → estimating
  'intake→estimating': {
    soft: [
      {
        check: (project) => !project.client_phone && !project.client_email,
        message: 'No contact information on file',
      },
      {
        check: (project) => !project.address,
        message: 'Project address not specified',
      },
    ],
    hard: [],
    action: 'Start Estimate',
    description: 'Begin preparing a detailed estimate for this project.',
  },

  // estimating → quoted
  'estimating→quoted': {
    soft: [
      {
        check: (project) => {
          const intake = project.intake_data || {};
          const selections = intake.selections || {};
          return Object.values(selections).some(cat =>
            Object.values(cat || {}).some(v => v === 'undecided')
          );
        },
        message: 'Some selections are still marked as undecided',
      },
    ],
    hard: [
      {
        check: (project) => !project.estimate_high && !project.estimate_low,
        message: 'No estimate value set - cannot send estimate without pricing',
      },
    ],
    action: 'Send Estimate',
    description: 'Send the estimate to the client for review.',
    requiresDate: 'quote_sent_at',
  },

  // quoted → contracted (Contract Signing!)
  'quoted→contracted': {
    soft: [],
    hard: [
      {
        check: (project) => !project.estimate_high && !project.estimate_low,
        message: 'No estimate value to convert to contract',
      },
    ],
    action: 'Sign Contract',
    description: 'Client has approved the quote. Sign the contract and generate production scope.',
    setsDate: 'contract_signed_at',
    generatesScope: true, // Flag to trigger scope generation
  },

  // contracted → active
  'contracted→active': {
    soft: [],
    hard: [
      {
        check: (project) => !project.contract_value && !project.estimate_high,
        message: 'No contract value set',
      },
    ],
    action: 'Start Construction',
    description: 'Begin active construction. This will set the actual start date.',
    setsDate: 'actual_start',
    promptsForWallSections: true, // Prompt PM to name wall sections for exterior framing
  },

  // active → punch_list
  'active→punch_list': {
    soft: [
      {
        check: (project) => {
          const dashboard = project.dashboard || {};
          return (dashboard.blockers || []).length > 0;
        },
        message: 'There are unresolved blockers',
      },
      {
        check: (project) => (project.progress || 0) < 90,
        message: 'Project progress is under 90%',
      },
    ],
    hard: [],
    action: 'Begin Punch List',
    description: 'Substantial completion reached. Begin final walkthrough and punch list.',
  },

  // punch_list → complete
  'punch_list→complete': {
    soft: [],
    hard: [
      {
        check: (project) => {
          const remaining = (project.contract_value || 0) - (project.spent || 0);
          return remaining > 1000; // More than $1000 unpaid
        },
        message: 'Outstanding balance remains - ensure final payment received',
      },
    ],
    action: 'Mark Complete',
    description: 'Project is finished. This will set the completion date.',
    setsDate: 'actual_completion',
  },

  // Backward transitions
  'estimating→intake': {
    soft: [
      {
        check: () => true,
        message: 'Moving backward to Intake phase - estimate work will be preserved',
      },
    ],
    hard: [],
    action: 'Return to Intake',
    description: 'Return project to intake phase for re-evaluation.',
    isBackward: true,
  },

  'quoted→estimating': {
    soft: [
      {
        check: () => true,
        message: 'Quote may need to be re-sent after changes',
      },
    ],
    hard: [],
    action: 'Revise Estimate',
    description: 'Return to estimating phase to revise the quote.',
    isBackward: true,
  },

  'contracted→quoted': {
    soft: [
      {
        check: (project) => project.contract_signed_at,
        message: 'Contract was already signed - this requires client agreement',
      },
    ],
    hard: [],
    action: 'Revert to Quoted',
    description: 'Return to quoted phase. Contract terms may need renegotiation.',
    isBackward: true,
  },

  'active→contracted': {
    soft: [
      {
        check: () => true,
        message: 'Moving backward from active construction - this is unusual',
      },
    ],
    hard: [],
    action: 'Pause Construction',
    description: 'Return to contracted phase. Construction will be paused.',
    isBackward: true,
  },

  'punch_list→active': {
    soft: [],
    hard: [],
    action: 'Return to Active',
    description: 'Return to active construction for additional work.',
    isBackward: true,
  },

  'complete→punch_list': {
    soft: [
      {
        check: () => true,
        message: 'Reopening completed project - warranty issue or callback?',
      },
    ],
    hard: [],
    action: 'Reopen Project',
    description: 'Reopen for additional punch list items.',
    isBackward: true,
  },

  // Cancellation (from any phase)
  'intake→cancelled': {
    soft: [],
    hard: [],
    action: 'Cancel Project',
    description: 'Cancel this project. It can be revived later if needed.',
    requiresReason: true,
  },
  'estimating→cancelled': {
    soft: [],
    hard: [],
    action: 'Cancel Project',
    description: 'Cancel this project. Estimate work will be preserved.',
    requiresReason: true,
  },
  'quoted→cancelled': {
    soft: [],
    hard: [],
    action: 'Cancel Project',
    description: 'Cancel this project. Quote has not been accepted.',
    requiresReason: true,
  },
  'contracted→cancelled': {
    soft: [
      {
        check: (project) => project.contract_signed_at,
        message: 'Contract was signed - ensure proper cancellation documentation',
      },
    ],
    hard: [],
    action: 'Cancel Project',
    description: 'Cancel this project after contract signing.',
    requiresReason: true,
  },
  'active→cancelled': {
    soft: [
      {
        check: () => true,
        message: 'Cancelling active construction - ensure all subs are notified',
      },
    ],
    hard: [],
    action: 'Cancel Project',
    description: 'Cancel active construction. This is a significant action.',
    requiresReason: true,
  },
  'punch_list→cancelled': {
    soft: [
      {
        check: () => true,
        message: 'Cancelling near completion - unusual circumstance',
      },
    ],
    hard: [],
    action: 'Cancel Project',
    description: 'Cancel project during punch list phase.',
    requiresReason: true,
  },

  // Revival from cancelled
  'cancelled→intake': {
    soft: [],
    hard: [],
    action: 'Revive Project',
    description: 'Restore this cancelled project to intake phase.',
  },
};

/**
 * Check if a phase transition is valid
 * @param {string} fromPhase
 * @param {string} toPhase
 * @returns {boolean}
 */
export function isValidTransition(fromPhase, toPhase) {
  const validNext = VALID_TRANSITIONS[fromPhase] || [];
  return validNext.includes(toPhase);
}

/**
 * Get available transitions for a phase
 * @param {string} currentPhase
 * @returns {Array} Array of phase objects that can be transitioned to
 */
export function getAvailableTransitions(currentPhase) {
  const validNext = VALID_TRANSITIONS[currentPhase] || [];
  return validNext.map(phaseId => ({
    ...PHASES[phaseId],
    transitionKey: `${currentPhase}→${phaseId}`,
    ...(TRANSITION_GATES[`${currentPhase}→${phaseId}`] || {}),
  }));
}

/**
 * Validate a transition and return warnings/blockers
 * @param {Object} project - Project data
 * @param {string} fromPhase
 * @param {string} toPhase
 * @returns {{ canProceed: boolean, warnings: string[], blockers: string[], gate: Object }}
 */
export function validateTransition(project, fromPhase, toPhase) {
  const transitionKey = `${fromPhase}→${toPhase}`;
  const gate = TRANSITION_GATES[transitionKey];

  if (!gate) {
    return {
      canProceed: false,
      warnings: [],
      blockers: ['Invalid phase transition'],
      gate: null,
    };
  }

  const warnings = [];
  const blockers = [];

  // Check soft conditions (warnings)
  (gate.soft || []).forEach(condition => {
    if (condition.check(project)) {
      warnings.push(condition.message);
    }
  });

  // Check hard conditions (blockers)
  (gate.hard || []).forEach(condition => {
    if (condition.check(project)) {
      blockers.push(condition.message);
    }
  });

  return {
    canProceed: blockers.length === 0,
    warnings,
    blockers,
    gate,
  };
}

/**
 * Get the next logical phase (forward progression)
 * @param {string} currentPhase
 * @returns {string|null}
 */
export function getNextPhase(currentPhase) {
  const currentOrder = PHASES[currentPhase]?.order || 0;
  const nextPhase = Object.values(PHASES).find(
    p => p.order === currentOrder + 1 && p.id !== 'cancelled'
  );
  return nextPhase?.id || null;
}

/**
 * Get the previous phase (backward)
 * @param {string} currentPhase
 * @returns {string|null}
 */
export function getPreviousPhase(currentPhase) {
  const currentOrder = PHASES[currentPhase]?.order || 0;
  const prevPhase = Object.values(PHASES).find(
    p => p.order === currentOrder - 1
  );
  return prevPhase?.id || null;
}

/**
 * Check if transition is moving backward
 * @param {string} fromPhase
 * @param {string} toPhase
 * @returns {boolean}
 */
export function isBackwardTransition(fromPhase, toPhase) {
  const fromOrder = PHASES[fromPhase]?.order || 0;
  const toOrder = PHASES[toPhase]?.order || 0;
  return toOrder < fromOrder && toPhase !== 'cancelled';
}

/**
 * Get phase color classes for UI
 * @param {string} phaseId
 * @returns {Object}
 */
export function getPhaseColors(phaseId) {
  const colors = {
    purple: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
    cyan: { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200' },
    indigo: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
    gray: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
    red: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  };

  const phase = PHASES[phaseId];
  return colors[phase?.color] || colors.gray;
}
