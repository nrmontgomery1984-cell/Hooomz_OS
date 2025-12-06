import { useNavigate } from 'react-router-dom';
import { Camera, FileText, Clock, Tag, Users, MapPin, Play } from 'lucide-react';
import { Checkbox, StatusDot } from '../ui';

export function TaskItem({ task, onToggle, onStartTimer, activeTimerTaskId, categoryName, contactNames = [], location, projectId, loopId }) {
  const navigate = useNavigate();
  const isCompleted = task.status === 'completed';
  const isInProgress = task.status === 'in_progress';
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !isCompleted;

  const handleClick = (e) => {
    // Don't navigate if clicking the checkbox
    if (e.target.closest('button')) return;
    if (projectId && loopId) {
      navigate(`/projects/${projectId}/loops/${loopId}/tasks/${task.id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        flex items-start gap-3 px-4 py-3 border-b border-gray-100 last:border-0
        ${isInProgress ? 'border-l-2 border-l-blue-500' : ''}
        ${projectId && loopId ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}
      `}
    >
      <Checkbox
        checked={isCompleted}
        onChange={() => onToggle?.(task.id, isCompleted ? 'pending' : 'completed')}
        className="mt-0.5"
      />
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm ${
            isCompleted ? 'text-gray-400 line-through' : 'text-charcoal'
          }`}
        >
          {task.title}
        </p>

        {/* Category, Location & Contact badges */}
        {(categoryName || location || contactNames.length > 0) && (
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {categoryName && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 text-xs text-gray-600 rounded">
                <Tag className="w-3 h-3" />
                {categoryName}
              </span>
            )}
            {location && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 text-xs text-amber-700 rounded">
                <MapPin className="w-3 h-3" />
                {location}
              </span>
            )}
            {contactNames.length > 0 && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-xs text-blue-600 rounded">
                <Users className="w-3 h-3" />
                {contactNames.length === 1 ? contactNames[0] : `${contactNames.length} people`}
              </span>
            )}
          </div>
        )}

        {task.due_date && (
          <p className={`text-xs mt-1 ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
            Due {new Date(task.due_date).toLocaleDateString()}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 mt-0.5">
        {/* Start Timer Button */}
        {onStartTimer && !isCompleted && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartTimer(task.id, task.title, task.estimated_hours);
            }}
            disabled={activeTimerTaskId === task.id}
            className={`
              p-1.5 rounded-lg transition-colors
              ${activeTimerTaskId === task.id
                ? 'bg-emerald-100 text-emerald-600 cursor-default'
                : 'hover:bg-emerald-50 text-gray-400 hover:text-emerald-600'
              }
            `}
            title={activeTimerTaskId === task.id ? 'Timer running' : 'Start timer'}
          >
            <Play className={`w-3.5 h-3.5 ${activeTimerTaskId === task.id ? 'fill-current' : ''}`} />
          </button>
        )}
        {task.estimated_hours && (
          <div className="flex items-center gap-1 text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs">{task.estimated_hours}h</span>
          </div>
        )}
        {task.has_photos && <Camera className="w-3.5 h-3.5 text-gray-400" />}
        {task.has_notes && <FileText className="w-3.5 h-3.5 text-gray-400" />}
        {isOverdue && <StatusDot status="red" size="xs" />}
      </div>
    </div>
  );
}
