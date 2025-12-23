import { useState, useCallback } from 'react';
import { updateProjectPhase, createActivityEntry, signContract, startProduction } from '../services/api';
import {
  validateTransition,
  isValidTransition,
  PHASES,
} from '../lib/phaseTransitions';

/**
 * usePhaseTransition - Hook for managing phase transitions
 *
 * Handles validation, API calls, and activity logging for phase changes.
 *
 * @param {Object} project - Current project data
 * @param {Function} onUpdate - Callback when project is updated
 * @returns {Object} Phase transition utilities
 */
export function usePhaseTransition(project, onUpdate) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionError, setTransitionError] = useState(null);
  const [targetPhase, setTargetPhase] = useState(null);
  const [showModal, setShowModal] = useState(false);

  /**
   * Initiate a phase transition (opens modal for confirmation)
   */
  const initiateTransition = useCallback((toPhase) => {
    if (!project) return;

    const fromPhase = project.phase;

    // Check if transition is valid
    if (!isValidTransition(fromPhase, toPhase)) {
      setTransitionError(`Cannot transition from ${fromPhase} to ${toPhase}`);
      return;
    }

    setTargetPhase(toPhase);
    setTransitionError(null);
    setShowModal(true);
  }, [project]);

  /**
   * Confirm and execute the phase transition
   */
  const confirmTransition = useCallback(async ({ fromPhase, toPhase, notes, date }) => {
    if (!project) {
      return;
    }

    setIsTransitioning(true);
    setTransitionError(null);

    try {
      // Validate one more time
      const validation = validateTransition(project, fromPhase, toPhase);
      if (!validation.canProceed) {
        throw new Error(validation.blockers.join(', '));
      }

      const gate = validation.gate;
      let resultData;

      // Special handling for contract signing (quoted → contracted)
      // This generates the production scope from the estimate
      if (gate?.generatesScope) {
        // Get estimate data from intake_data where EstimateBuilder saves it
        const intakeData = project.intake_data || {};
        const contractData = {
          contractValue: project.estimate_high || project.estimate_low || 0,
          selectedTier: intakeData.build_tier || project.build_tier || 'better',
          lineItems: intakeData.estimate_line_items || project.estimate_line_items || [],
        };

        const { data, error } = await signContract(project.id, contractData);

        if (error) {
          // Handle Supabase error object
          const errorMessage = typeof error === 'object'
            ? (error.message || error.details || JSON.stringify(error))
            : String(error);
          throw new Error(errorMessage);
        }

        resultData = data?.project;
      }
      // Special handling for starting construction (contracted → active)
      // This generates loops/tasks from estimate if they don't exist
      else if (toPhase === 'active' && fromPhase === 'contracted') {
        const { data, error } = await startProduction(project.id, project);

        if (error) {
          // Handle Supabase error object
          const errorMessage = typeof error === 'object'
            ? (error.message || error.details || JSON.stringify(error))
            : String(error);
          throw new Error(errorMessage);
        }

        resultData = data?.project;
      } else {
        // Standard phase transition
        // Note: Many date fields don't exist as top-level columns in the database
        // Only 'actual_completion' exists at top level. Other dates go in intake_data.
        const updateData = {
          phase: toPhase,
        };

        // Prepare intake_data updates for dates that aren't top-level columns
        const intakeDataUpdates = {
          ...project.intake_data,
          phase_changed_at: new Date().toISOString(),
        };

        // Set dates based on transition
        if (gate?.setsDate === 'actual_start') {
          // actual_start isn't a top-level column, store in intake_data
          intakeDataUpdates.actual_start = new Date().toISOString().split('T')[0];
        } else if (gate?.setsDate === 'actual_completion') {
          // actual_completion IS a top-level column
          updateData.actual_completion = new Date().toISOString().split('T')[0];
        } else if (gate?.setsDate) {
          // Other dates like contract_signed_at, quote_sent_at go in intake_data
          intakeDataUpdates[gate.setsDate] = new Date().toISOString();
        }

        if (date && gate?.requiresDate) {
          // Required dates (like quote_sent_at) also go in intake_data
          intakeDataUpdates[gate.requiresDate] = date;
        }

        // Include the intake_data updates
        updateData.intake_data = intakeDataUpdates;

        // Call API to update project
        console.log('[phaseTransition] Calling updateProjectPhase with:', updateData);
        const { data, error } = await updateProjectPhase(project.id, updateData);
        console.log('[phaseTransition] updateProjectPhase result:', { data, error });

        if (error) {
          // Handle Supabase error object
          const errorMessage = typeof error === 'object'
            ? (error.message || error.details || JSON.stringify(error))
            : error;
          throw new Error(errorMessage);
        }

        resultData = data;

        // Log activity for standard transitions
        await createActivityEntry({
          event_type: 'phase.changed',
          event_data: {
            from_phase: fromPhase,
            to_phase: toPhase,
            from_label: PHASES[fromPhase]?.label,
            to_label: PHASES[toPhase]?.label,
            notes: notes || undefined,
          },
          project_id: project.id,
          actor_name: 'You',
        });
      }

      // Callback with updated project
      console.log('[phaseTransition] resultData:', resultData);
      if (onUpdate && resultData) {
        console.log('[phaseTransition] Calling onUpdate callback');
        onUpdate(resultData);
      } else {
        console.log('[phaseTransition] NOT calling onUpdate:', { hasOnUpdate: !!onUpdate, hasResultData: !!resultData });
      }

      // Close modal
      setShowModal(false);
      setTargetPhase(null);

      return { success: true, data: resultData };
    } catch (error) {
      setTransitionError(error.message);
      return { success: false, error: error.message };
    } finally {
      setIsTransitioning(false);
    }
  }, [project, onUpdate]);

  /**
   * Cancel the transition (close modal)
   */
  const cancelTransition = useCallback(() => {
    setShowModal(false);
    setTargetPhase(null);
    setTransitionError(null);
  }, []);

  /**
   * Get validation result for a potential transition
   */
  const getValidation = useCallback((toPhase) => {
    if (!project) return null;
    return validateTransition(project, project.phase, toPhase);
  }, [project]);

  return {
    // State
    isTransitioning,
    transitionError,
    targetPhase,
    showModal,

    // Actions
    initiateTransition,
    confirmTransition,
    cancelTransition,
    getValidation,

    // Current phase info
    currentPhase: project?.phase,
    currentPhaseLabel: PHASES[project?.phase]?.label,
  };
}
