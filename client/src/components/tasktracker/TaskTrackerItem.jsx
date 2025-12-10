import { Clock, MapPin, Users, AlertCircle, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { Checkbox } from '../ui';

/**
 * Task Tracker Item - Individual task instance display
 * Shows task with three-axis context: Work Category (via parent), Stage, Location
 */
export function TaskTrackerItem({
  instance,
  onClick,
  onToggle,
  contact,
  showCategory = false,
  categoryColor,
}) {
  const isCompleted = instance.status === 'completed';
  const isInProgress = instance.status === 'in_progress';
  const isBlocked = instance.status === 'blocked';
  const isOverdue = instance.dueDate && new Date(instance.dueDate) < new Date() && !isCompleted;

  // Format location path to show just the room name
  const locationName = instance.locationPath?.split('.').pop() || '';

  // Status icon based on state
  const StatusIcon = () => {
    if (isCompleted) {
      return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    }
    if (isBlocked) {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
    if (isInProgress) {
      return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
    }
    return <Circle className="w-4 h-4 text-gray-300" />;
  };

  // Priority indicator
  const PriorityBadge = () => {
    if (instance.priority === 1) {
      return (
        <span className="px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded">
          P1
        </span>
      );
    }
    return null;
  };

  return (
    <div
      onClick={onClick}
      className={`
        flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors
        ${isInProgress ? 'border-l-2 border-l-blue-500' : ''}
        ${isBlocked ? 'border-l-2 border-l-red-500 bg-red-50/50' : ''}
      `}
    >
      {/* Checkbox */}
      <div className="mt-0.5" onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={isCompleted}
          onChange={onToggle}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Task Name */}
        <div className="flex items-center gap-2">
          <p
            className={`text-sm ${
              isCompleted
                ? 'text-gray-400 line-through'
                : isBlocked
                ? 'text-red-700'
                : 'text-charcoal'
            }`}
          >
            {instance.name}
          </p>
          <PriorityBadge />
        </div>

        {/* Metadata Row */}
        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          {/* Location Badge (Axis 3) */}
          {locationName && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 text-xs text-amber-700 rounded">
              <MapPin className="w-3 h-3" />
              {locationName}
            </span>
          )}

          {/* Assigned Contact */}
          {contact && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-xs text-blue-600 rounded">
              <Users className="w-3 h-3" />
              {contact.name}
            </span>
          )}

          {/* Category Badge (if shown) */}
          {showCategory && categoryColor && (
            <span
              className="px-1.5 py-0.5 text-xs rounded"
              style={{
                backgroundColor: `${categoryColor}15`,
                color: categoryColor,
              }}
            >
              {instance.categoryCode}
            </span>
          )}
        </div>

        {/* Due Date & Blocked Reason */}
        <div className="flex items-center gap-3 mt-1">
          {instance.dueDate && (
            <span
              className={`text-xs ${
                isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'
              }`}
            >
              {isOverdue ? 'Overdue: ' : 'Due: '}
              {new Date(instance.dueDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}

          {isBlocked && instance.dependencyOverrides?.blockedByReason && (
            <span className="text-xs text-red-600">
              {instance.dependencyOverrides.blockedByReason}
            </span>
          )}
        </div>
      </div>

      {/* Right Side - Status & Time */}
      <div className="flex items-center gap-3 mt-0.5">
        {/* Time Tracking */}
        {instance.estimatedHours && (
          <div className="flex items-center gap-1 text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs">
              {instance.actualHours || 0}/{instance.estimatedHours}h
            </span>
          </div>
        )}

        {/* Status Icon */}
        <StatusIcon />
      </div>
    </div>
  );
}
