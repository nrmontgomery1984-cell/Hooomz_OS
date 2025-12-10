import { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Calendar,
  X,
} from 'lucide-react';
import { Modal, Button, TextArea, Input } from '../ui';
import {
  PHASES,
  validateTransition,
  getAvailableTransitions,
  isBackwardTransition,
  getPhaseColors,
} from '../../lib/phaseTransitions';

/**
 * PhaseTransitionModal - Confirms phase transitions with validation
 */
export function PhaseTransitionModal({
  isOpen,
  onClose,
  project,
  targetPhase,
  onConfirm,
}) {
  const [notes, setNotes] = useState('');
  const [dateValue, setDateValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!project || !targetPhase) return null;

  const currentPhase = project.phase;
  const validation = validateTransition(project, currentPhase, targetPhase);
  const { canProceed, warnings, blockers, gate } = validation;

  const isBackward = isBackwardTransition(currentPhase, targetPhase);
  const isCancellation = targetPhase === 'cancelled';

  const currentPhaseData = PHASES[currentPhase];
  const targetPhaseData = PHASES[targetPhase];
  const targetColors = getPhaseColors(targetPhase);

  const handleConfirm = async () => {
    if (!canProceed) return;

    setIsSubmitting(true);
    try {
      await onConfirm({
        fromPhase: currentPhase,
        toPhase: targetPhase,
        notes: notes.trim(),
        date: dateValue || undefined,
      });
      onClose();
    } catch (error) {
      console.error('Phase transition failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setNotes('');
    setDateValue('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-charcoal">
              {gate?.action || 'Change Phase'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {gate?.description || `Move project to ${targetPhaseData?.label} phase`}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Phase Transition Visual */}
        <div className="flex items-center justify-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <span className={`
              inline-block px-3 py-1 rounded-full text-sm font-medium
              ${getPhaseColors(currentPhase).bg} ${getPhaseColors(currentPhase).text}
            `}>
              {currentPhaseData?.label}
            </span>
            <p className="text-xs text-gray-500 mt-1">Current</p>
          </div>

          {isBackward ? (
            <ArrowLeft className="w-6 h-6 text-amber-500" />
          ) : isCancellation ? (
            <XCircle className="w-6 h-6 text-red-500" />
          ) : (
            <ArrowRight className="w-6 h-6 text-emerald-500" />
          )}

          <div className="text-center">
            <span className={`
              inline-block px-3 py-1 rounded-full text-sm font-medium
              ${targetColors.bg} ${targetColors.text}
            `}>
              {targetPhaseData?.label}
            </span>
            <p className="text-xs text-gray-500 mt-1">New Phase</p>
          </div>
        </div>

        {/* Blockers (if any) */}
        {blockers.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="font-medium text-red-700">Cannot Proceed</span>
            </div>
            <ul className="space-y-1">
              {blockers.map((blocker, index) => (
                <li key={index} className="text-sm text-red-600 flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">•</span>
                  {blocker}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Warnings (if any) */}
        {warnings.length > 0 && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span className="font-medium text-amber-700">Warnings</span>
            </div>
            <ul className="space-y-1">
              {warnings.map((warning, index) => (
                <li key={index} className="text-sm text-amber-600 flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">•</span>
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* All Clear */}
        {canProceed && blockers.length === 0 && warnings.length === 0 && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span className="text-sm text-emerald-700">
                All conditions met - ready to proceed
              </span>
            </div>
          </div>
        )}

        {/* Date Field (if required) */}
        {gate?.requiresDate && canProceed && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="w-4 h-4 inline mr-1" />
              {gate.requiresDate === 'quote_sent_at' ? 'Quote Sent Date' : 'Date'}
            </label>
            <Input
              type="date"
              value={dateValue}
              onChange={(e) => setDateValue(e.target.value)}
              className="w-full"
            />
          </div>
        )}

        {/* Date auto-set notice */}
        {gate?.setsDate && canProceed && (
          <div className="mb-4 p-2 bg-blue-50 rounded text-sm text-blue-700">
            <Calendar className="w-4 h-4 inline mr-1" />
            {gate.setsDate === 'actual_start'
              ? "Today's date will be recorded as the construction start date"
              : gate.setsDate === 'actual_completion'
                ? "Today's date will be recorded as the completion date"
                : `${gate.setsDate} will be set to today`
            }
          </div>
        )}

        {/* Notes/Reason Field */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {gate?.requiresReason ? 'Reason (required)' : 'Notes (optional)'}
          </label>
          <TextArea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={
              isCancellation
                ? 'Why is this project being cancelled?'
                : isBackward
                  ? 'Reason for moving back to previous phase...'
                  : 'Any notes about this transition...'
            }
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={handleClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!canProceed || isSubmitting || (gate?.requiresReason && !notes.trim())}
            className={`flex-1 ${isCancellation ? 'bg-red-600 hover:bg-red-700' : ''}`}
          >
            {isSubmitting ? 'Processing...' : gate?.action || 'Confirm'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/**
 * PhaseTransitionButton - Quick action button for next phase
 */
export function PhaseTransitionButton({ project, onTransition, size = 'md' }) {
  const currentPhase = project?.phase;
  if (!currentPhase) return null;

  const transitions = getAvailableTransitions(currentPhase);
  const primaryTransition = transitions.find(t => !t.isBackward && t.id !== 'cancelled');

  if (!primaryTransition) return null;

  return (
    <Button
      size={size}
      onClick={() => onTransition(primaryTransition.id)}
      className={size === 'sm' ? 'text-xs' : ''}
    >
      <ArrowRight className={size === 'sm' ? 'w-3 h-3 mr-1' : 'w-4 h-4 mr-1'} />
      {primaryTransition.action}
    </Button>
  );
}

/**
 * PhaseSelector - Dropdown to select any valid phase
 */
export function PhaseSelector({ project, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const currentPhase = project?.phase;

  if (!currentPhase) return null;

  const transitions = getAvailableTransitions(currentPhase);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-sm text-gray-600 hover:text-charcoal underline"
      >
        Change phase...
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-2">
              <p className="text-xs text-gray-500 px-2 pb-2 border-b border-gray-100">
                Move to phase:
              </p>
              {transitions.map((transition) => {
                const colors = getPhaseColors(transition.id);
                return (
                  <button
                    key={transition.id}
                    onClick={() => {
                      onSelect(transition.id);
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-2 py-2 hover:bg-gray-50 rounded flex items-center gap-2"
                  >
                    {transition.isBackward ? (
                      <ArrowLeft className="w-4 h-4 text-amber-500" />
                    ) : transition.id === 'cancelled' ? (
                      <XCircle className="w-4 h-4 text-red-500" />
                    ) : (
                      <ArrowRight className="w-4 h-4 text-emerald-500" />
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-xs ${colors.bg} ${colors.text}`}>
                      {transition.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
