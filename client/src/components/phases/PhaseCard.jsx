/**
 * PhaseCard Component
 *
 * Displays a single phase in the Phase Builder timeline.
 * Shows status, dependencies, and allows status updates.
 */

import { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Lock,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Users,
} from 'lucide-react';
import { PHASE_CATEGORIES } from '../../data/phaseTemplates';

/**
 * Get status icon and color
 */
function getStatusDisplay(status) {
  switch (status) {
    case 'complete':
    case 'completed':
      return {
        icon: CheckCircle2,
        color: 'text-green-500',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        label: 'Complete',
      };
    case 'in_progress':
      return {
        icon: Clock,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        label: 'In Progress',
      };
    case 'blocked':
      return {
        icon: Lock,
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        label: 'Blocked',
      };
    default:
      return {
        icon: Circle,
        color: 'text-gray-400',
        bgColor: 'bg-white',
        borderColor: 'border-gray-200',
        label: 'Pending',
      };
  }
}

export function PhaseCard({
  phase,
  status = 'pending',
  isBlocked = false,
  blockedBy = [],
  onStatusChange,
  onSelect,
  isSelected = false,
  isDragging = false,
  canEdit = true,
  showDependencies = false,
  validationWarnings = [],
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusDisplay = getStatusDisplay(isBlocked ? 'blocked' : status);
  const StatusIcon = statusDisplay.icon;
  const categoryInfo = PHASE_CATEGORIES[phase.category] || { label: 'Other', color: '#6B7280' };

  const handleStatusClick = (e) => {
    e.stopPropagation();
    if (!canEdit || isBlocked) return;

    // Cycle through statuses
    const nextStatus = {
      pending: 'in_progress',
      in_progress: 'complete',
      complete: 'pending',
      completed: 'pending',
    };

    onStatusChange?.(phase.id, nextStatus[status] || 'in_progress');
  };

  return (
    <div
      className={`
        border rounded-lg transition-all cursor-pointer
        ${statusDisplay.borderColor} ${statusDisplay.bgColor}
        ${isSelected ? 'ring-2 ring-charcoal ring-offset-1' : ''}
        ${isDragging ? 'opacity-50 shadow-lg' : ''}
        hover:shadow-sm
      `}
      onClick={() => onSelect?.(phase)}
    >
      <div className="p-3">
        {/* Header Row */}
        <div className="flex items-center gap-3">
          {/* Drag Handle */}
          {canEdit && (
            <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
              <GripVertical className="w-4 h-4" />
            </div>
          )}

          {/* Status Icon */}
          <button
            onClick={handleStatusClick}
            disabled={!canEdit || isBlocked}
            className={`
              p-1 rounded-full transition-colors
              ${canEdit && !isBlocked ? 'hover:bg-white/50' : 'cursor-default'}
            `}
            title={isBlocked ? 'Blocked - complete prerequisites first' : `Status: ${statusDisplay.label}`}
          >
            <StatusIcon className={`w-5 h-5 ${statusDisplay.color}`} />
          </button>

          {/* Phase Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-charcoal truncate">
                {phase.name}
              </span>
              <span
                className="text-xs px-1.5 py-0.5 rounded font-mono"
                style={{ backgroundColor: categoryInfo.color + '20', color: categoryInfo.color }}
              >
                {phase.shortName}
              </span>
            </div>
            <p className="text-xs text-gray-500 truncate">
              {phase.description}
            </p>
          </div>

          {/* Category Badge */}
          <div
            className="hidden sm:flex items-center gap-1 text-xs px-2 py-1 rounded-full"
            style={{ backgroundColor: categoryInfo.color + '15', color: categoryInfo.color }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: categoryInfo.color }}
            />
            {categoryInfo.label}
          </div>

          {/* Trade Codes */}
          {phase.tradeCodes?.length > 0 && (
            <div className="hidden md:flex items-center gap-1">
              <Users className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500">
                {phase.tradeCodes.join(', ')}
              </span>
            </div>
          )}

          {/* Expand Toggle */}
          {(showDependencies || blockedBy.length > 0 || validationWarnings.length > 0) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="p-1 hover:bg-white/50 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </button>
          )}
        </div>

        {/* Blocked Warning */}
        {isBlocked && blockedBy.length > 0 && (
          <div className="mt-2 flex items-start gap-2 text-xs text-red-600 bg-red-100 rounded p-2">
            <Lock className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">Blocked by: </span>
              {blockedBy.map(b => b.phaseName).join(', ')}
            </div>
          </div>
        )}

        {/* Validation Warnings */}
        {validationWarnings.length > 0 && !isBlocked && (
          <div className="mt-2 flex items-start gap-2 text-xs text-amber-600 bg-amber-50 rounded p-2">
            <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <div>
              {validationWarnings.map((w, i) => (
                <div key={i}>{w.message}</div>
              ))}
            </div>
          </div>
        )}

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
            {/* Dependencies */}
            {phase.dependencies?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Dependencies:</p>
                <div className="space-y-1">
                  {phase.dependencies.map((dep, i) => (
                    <div
                      key={i}
                      className={`
                        text-xs flex items-center gap-2 px-2 py-1 rounded
                        ${dep.type === 'hard' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}
                      `}
                    >
                      {dep.type === 'hard' ? (
                        <Lock className="w-3 h-3" />
                      ) : (
                        <AlertTriangle className="w-3 h-3" />
                      )}
                      <span className="font-medium">{dep.requiresPhaseId}</span>
                      <span className="text-gray-500">- {dep.reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location Scope */}
            {phase.locationScope && (
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Applies to:</p>
                <p className="text-xs text-gray-500">
                  {phase.locationScope.type === 'all' && 'All locations'}
                  {phase.locationScope.type === 'floors' && `Floors: ${phase.locationScope.floors.join(', ')}`}
                  {phase.locationScope.type === 'rooms' && `Rooms: ${phase.locationScope.roomTypes.join(', ')}`}
                  {phase.locationScope.type === 'zones' && `Zones: ${phase.locationScope.zones.join(', ')}`}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PhaseCard;
