import { useState, useCallback } from 'react';
import { updateProjectPhase, createActivityEntry, signContract } from '../services/api';
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
    if (!project) return;

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
        const contractData = {
          contractValue: project.estimate_high || project.estimate_low || 0,
          selectedTier: project.build_tier || 'better',
          lineItems: project.estimate_line_items || [],
        };

        const { data, error } = await signContract(project.id, contractData);

        if (error) {
          throw new Error(error);
        }

        resultData = data?.project;

        // Log additional info about generated scope
        if (data?.loops?.length > 0) {
          console.log(`Generated ${data.loops.length} loops and ${data.tasks?.length || 0} tasks from estimate`);
        }
      } else {
        // Standard phase transition
        const updateData = {
          phase: toPhase,
          phase_changed_at: new Date().toISOString(),
        };

        // Set dates based on transition
        if (gate?.setsDate === 'actual_start') {
          updateData.actual_start = new Date().toISOString().split('T')[0];
        } else if (gate?.setsDate === 'actual_completion') {
          updateData.actual_completion = new Date().toISOString().split('T')[0];
        } else if (gate?.setsDate) {
          updateData[gate.setsDate] = new Date().toISOString();
        }

        if (date && gate?.requiresDate) {
          updateData[gate.requiresDate] = date;
        }

        // Call API to update project
        const { data, error } = await updateProjectPhase(project.id, updateData);

        if (error) {
          throw new Error(error);
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
      if (onUpdate && resultData) {
        onUpdate(resultData);
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
