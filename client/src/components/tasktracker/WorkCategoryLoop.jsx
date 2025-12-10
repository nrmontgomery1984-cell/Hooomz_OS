import { ChevronDown, ChevronRight } from 'lucide-react';
import { StatusDot, ProgressBar } from '../ui';
import { TaskTrackerItem } from './TaskTrackerItem';

/**
 * Work Category Loop - Primary loop in the Three Axis Model
 * Displays tasks grouped by work category with collapsible subcategories
 */
export function WorkCategoryLoop({
  categoryGroup,
  subcategoryGroups,
  isExpanded,
  onToggle,
  onTaskClick,
  onTaskToggle,
  getContact,
}) {
  const { category, instances, status, completedCount, totalCount } = categoryGroup;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Map status to StatusDot color
  const getStatusColor = (s) => {
    if (s === 'complete') return 'green';
    if (s === 'red') return 'red';
    if (s === 'yellow') return 'yellow';
    if (s === 'green') return 'green';
    return 'gray';
  };

  return (
    <div className="bg-white rounded-lg shadow-card overflow-hidden">
      {/* Category Header */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
      >
        {/* Expand/Collapse Icon */}
        <div className="text-gray-400">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </div>

        {/* Category Color Bar */}
        <div
          className="w-1 h-8 rounded-full"
          style={{ backgroundColor: category.color }}
        />

        {/* Category Name & Status */}
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-charcoal truncate">
              {category.name}
            </span>
            <StatusDot status={getStatusColor(status)} size="sm" />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <ProgressBar
              value={progressPercent}
              color={status === 'complete' ? 'green' : status === 'red' ? 'red' : 'green'}
              height="thin"
              className="flex-1 max-w-24"
            />
            <span className="text-xs text-gray-400">
              {completedCount}/{totalCount}
            </span>
          </div>
        </div>

        {/* Category Code Badge */}
        <span
          className="px-2 py-0.5 text-xs font-medium rounded"
          style={{
            backgroundColor: `${category.color}20`,
            color: category.color,
          }}
        >
          {category.code}
        </span>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-100">
          {subcategoryGroups && subcategoryGroups.length > 0 ? (
            // Show subcategory groups
            subcategoryGroups.map((subcatGroup) => (
              <SubcategorySection
                key={subcatGroup.subcategory.id}
                subcategoryGroup={subcatGroup}
                categoryColor={category.color}
                onTaskClick={onTaskClick}
                onTaskToggle={onTaskToggle}
                getContact={getContact}
              />
            ))
          ) : (
            // Show tasks directly if no subcategories
            <div className="divide-y divide-gray-100">
              {instances.map((instance) => (
                <TaskTrackerItem
                  key={instance.id}
                  instance={instance}
                  onClick={() => onTaskClick?.(instance)}
                  onToggle={() => onTaskToggle?.(instance.id)}
                  contact={getContact?.(instance.assignedTo)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Subcategory Section within a Work Category Loop
 */
function SubcategorySection({
  subcategoryGroup,
  categoryColor,
  onTaskClick,
  onTaskToggle,
  getContact,
}) {
  const { subcategory, instances, status, completedCount, totalCount } = subcategoryGroup;

  const getStatusColor = (s) => {
    if (s === 'complete') return 'green';
    if (s === 'red') return 'red';
    if (s === 'yellow') return 'yellow';
    if (s === 'green') return 'green';
    return 'gray';
  };

  return (
    <div className="border-b border-gray-100 last:border-0">
      {/* Subcategory Header */}
      <div className="px-4 py-2 bg-gray-50 flex items-center gap-2">
        <div
          className="w-0.5 h-4 rounded-full"
          style={{ backgroundColor: categoryColor }}
        />
        <span className="text-xs font-medium text-gray-600">
          {subcategory.name}
        </span>
        <StatusDot status={getStatusColor(status)} size="xs" />
        <span className="text-xs text-gray-400 ml-auto">
          {completedCount}/{totalCount}
        </span>
      </div>

      {/* Tasks */}
      <div className="divide-y divide-gray-100">
        {instances.map((instance) => (
          <TaskTrackerItem
            key={instance.id}
            instance={instance}
            onClick={() => onTaskClick?.(instance)}
            onToggle={() => onTaskToggle?.(instance.id)}
            contact={getContact?.(instance.assignedTo)}
          />
        ))}
      </div>
    </div>
  );
}
