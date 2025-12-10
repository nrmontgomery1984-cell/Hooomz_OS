import { useState } from 'react';
import { Filter, X, ChevronDown, MapPin, Layers, Users, CheckSquare } from 'lucide-react';
import { Button } from '../ui';

/**
 * Filter Bar for Task Tracker
 * Provides filtering by all three axes plus assignments
 */
export function FilterBar({
  filters,
  onFilterChange,
  onClearFilters,
  categories,
  stages,
  locations,
  locationTree,
  contacts,
  stats,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Count active filters
  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== null && v !== undefined
  ).length;

  // Get subcontractors for assignment filter
  const subcontractors = contacts.filter((c) => c.contact_type === 'subcontractor');

  // Status filter options
  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-gray-100 text-gray-600' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
    { value: 'blocked', label: 'Blocked', color: 'bg-red-100 text-red-700' },
    { value: 'completed', label: 'Completed', color: 'bg-emerald-100 text-emerald-700' },
  ];

  // Build flat location options with indentation
  const flattenLocations = (nodes, depth = 0) => {
    let result = [];
    nodes.forEach((node) => {
      result.push({
        id: node.id,
        path: node.path,
        label: '  '.repeat(depth) + node.name,
        type: node.locationType,
      });
      if (node.children && node.children.length > 0) {
        result = result.concat(flattenLocations(node.children, depth + 1));
      }
    });
    return result;
  };

  const flatLocations = flattenLocations(locationTree || []);

  return (
    <div className="bg-white rounded-lg shadow-card overflow-hidden">
      {/* Filter Header - Always Visible */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm font-medium text-charcoal hover:text-gray-600"
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="px-1.5 py-0.5 text-xs bg-charcoal text-white rounded-full">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Quick Filter Pills */}
          {!isExpanded && activeFilterCount > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {filters.categoryCode && (
                <FilterPill
                  label={categories.find((c) => c.code === filters.categoryCode)?.name}
                  color={categories.find((c) => c.code === filters.categoryCode)?.color}
                  onRemove={() => onFilterChange('categoryCode', null)}
                />
              )}
              {filters.stageCode && (
                <FilterPill
                  label={stages.find((s) => s.code === filters.stageCode)?.name}
                  onRemove={() => onFilterChange('stageCode', null)}
                />
              )}
              {filters.locationPath && (
                <FilterPill
                  label={filters.locationPath.split('.').pop()}
                  icon={<MapPin className="w-3 h-3" />}
                  onRemove={() => onFilterChange('locationPath', null)}
                />
              )}
              {filters.status && (
                <FilterPill
                  label={filters.status}
                  onRemove={() => onFilterChange('status', null)}
                />
              )}
              {filters.assignedTo && (
                <FilterPill
                  label={contacts.find((c) => c.id === filters.assignedTo)?.name}
                  icon={<Users className="w-3 h-3" />}
                  onRemove={() => onFilterChange('assignedTo', null)}
                />
              )}
            </div>
          )}
        </div>

        {/* Stats Summary */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>
            <span className="font-medium text-charcoal">{stats.total}</span> tasks
          </span>
          <span className="text-emerald-600">
            {stats.completed} done
          </span>
          {stats.inProgress > 0 && (
            <span className="text-blue-600">
              {stats.inProgress} active
            </span>
          )}
          {stats.blocked > 0 && (
            <span className="text-red-600">
              {stats.blocked} blocked
            </span>
          )}
          {stats.overdue > 0 && (
            <span className="text-red-600 font-medium">
              {stats.overdue} overdue
            </span>
          )}

          {activeFilterCount > 0 && (
            <button
              onClick={onClearFilters}
              className="text-gray-400 hover:text-gray-600"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Expanded Filter Options */}
      {isExpanded && (
        <div className="px-4 py-4 border-t border-gray-100 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Work Category (Axis 1) */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">
                Work Category
              </label>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {categories.map((cat) => (
                  <button
                    key={cat.code}
                    onClick={() =>
                      onFilterChange(
                        'categoryCode',
                        filters.categoryCode === cat.code ? null : cat.code
                      )
                    }
                    className={`
                      w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm text-left transition-colors
                      ${
                        filters.categoryCode === cat.code
                          ? 'bg-charcoal text-white'
                          : 'hover:bg-gray-100 text-gray-700'
                      }
                    `}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Stage (Axis 2) */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">
                <Layers className="w-3 h-3 inline mr-1" />
                Stage
              </label>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {stages.map((stage) => (
                  <button
                    key={stage.code}
                    onClick={() =>
                      onFilterChange(
                        'stageCode',
                        filters.stageCode === stage.code ? null : stage.code
                      )
                    }
                    className={`
                      w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm text-left transition-colors
                      ${
                        filters.stageCode === stage.code
                          ? 'bg-charcoal text-white'
                          : 'hover:bg-gray-100 text-gray-700'
                      }
                    `}
                  >
                    <span className="text-gray-400 text-xs w-4">
                      {stage.stageOrder}
                    </span>
                    {stage.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Location (Axis 3) */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">
                <MapPin className="w-3 h-3 inline mr-1" />
                Location
              </label>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {flatLocations.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() =>
                      onFilterChange(
                        'locationPath',
                        filters.locationPath === loc.path ? null : loc.path
                      )
                    }
                    className={`
                      w-full px-2 py-1.5 rounded text-sm text-left transition-colors
                      ${
                        filters.locationPath === loc.path
                          ? 'bg-charcoal text-white'
                          : 'hover:bg-gray-100 text-gray-700'
                      }
                    `}
                  >
                    <span className="whitespace-pre">{loc.label}</span>
                    <span className="text-xs text-gray-400 ml-1">
                      {loc.type === 'room' ? '' : `(${loc.type})`}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Assignments & Status */}
            <div className="space-y-4">
              {/* Status */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">
                  <CheckSquare className="w-3 h-3 inline mr-1" />
                  Status
                </label>
                <div className="flex flex-wrap gap-1">
                  {statusOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() =>
                        onFilterChange(
                          'status',
                          filters.status === opt.value ? null : opt.value
                        )
                      }
                      className={`
                        px-2 py-1 rounded text-xs transition-colors
                        ${
                          filters.status === opt.value
                            ? 'bg-charcoal text-white'
                            : opt.color
                        }
                      `}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assigned To */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">
                  <Users className="w-3 h-3 inline mr-1" />
                  Assigned To
                </label>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {subcontractors.map((contact) => (
                    <button
                      key={contact.id}
                      onClick={() =>
                        onFilterChange(
                          'assignedTo',
                          filters.assignedTo === contact.id ? null : contact.id
                        )
                      }
                      className={`
                        w-full px-2 py-1.5 rounded text-sm text-left transition-colors
                        ${
                          filters.assignedTo === contact.id
                            ? 'bg-charcoal text-white'
                            : 'hover:bg-gray-100 text-gray-700'
                        }
                      `}
                    >
                      {contact.name}
                      <span className="text-xs text-gray-400 ml-1">
                        {contact.company}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Filter Pill - Shows active filter with remove button
 */
function FilterPill({ label, color, icon, onRemove }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full"
      style={color ? { backgroundColor: `${color}20`, color } : undefined}
    >
      {icon}
      {label}
      <button
        onClick={onRemove}
        className="ml-0.5 p-0.5 hover:bg-gray-200 rounded-full"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}
