import { useState, useMemo } from 'react';
import {
  CheckCircle,
  Circle,
  Clock,
  Camera,
  FileText,
  Plus,
  AlertTriangle,
  Package,
  ClipboardCheck,
  CloudRain,
  Phone,
  FileEdit,
  DollarSign,
  HardHat,
  ChevronRight,
  Calendar,
  Tag,
  Users,
  Filter
} from 'lucide-react';
import { Card, Modal, Button } from '../ui';
import { useScopeData } from '../../hooks';

const eventIcons = {
  'task.created': Plus,
  'task.completed': CheckCircle,
  'task.status_changed': Circle,
  'time.started': Clock,
  'time.stopped': Clock,
  'photo.uploaded': Camera,
  'loop.created': Plus,
  'loop.completed': CheckCircle,
  'note.added': FileText,
  'issue.flagged': AlertTriangle,
  'material.received': Package,
  'inspection.scheduled': ClipboardCheck,
  'weather.delay': CloudRain,
  'client.contact': Phone,
  'change.requested': FileEdit,
  'payment.received': DollarSign,
  'subcontractor.update': HardHat,
};

const eventColors = {
  'task.created': 'text-blue-500',
  'task.completed': 'text-emerald-500',
  'task.status_changed': 'text-gray-500',
  'time.started': 'text-blue-500',
  'time.stopped': 'text-gray-500',
  'photo.uploaded': 'text-purple-500',
  'loop.created': 'text-blue-500',
  'loop.completed': 'text-emerald-500',
  'note.added': 'text-gray-600',
  'issue.flagged': 'text-red-500',
  'material.received': 'text-amber-600',
  'inspection.scheduled': 'text-indigo-500',
  'weather.delay': 'text-sky-500',
  'client.contact': 'text-teal-500',
  'change.requested': 'text-orange-500',
  'payment.received': 'text-emerald-600',
  'subcontractor.update': 'text-orange-600',
};

const eventLabels = {
  'task.created': 'Task Created',
  'task.completed': 'Task Completed',
  'task.status_changed': 'Status Changed',
  'time.started': 'Timer Started',
  'time.stopped': 'Time Logged',
  'photo.uploaded': 'Photo Uploaded',
  'loop.created': 'Loop Created',
  'loop.completed': 'Loop Completed',
  'note.added': 'Note Added',
  'issue.flagged': 'Issue Flagged',
  'material.received': 'Material Received',
  'inspection.scheduled': 'Inspection',
  'weather.delay': 'Weather Delay',
  'client.contact': 'Client Contact',
  'change.requested': 'Change Request',
  'payment.received': 'Payment Received',
  'subcontractor.update': 'Subcontractor Update',
};

function formatEventMessage(event) {
  const data = event.event_data || {};

  switch (event.event_type) {
    case 'task.created':
      return `Created task "${data.title || 'Untitled'}"`;
    case 'task.completed':
      return `Completed "${data.title || 'task'}"`;
    case 'task.status_changed':
      return `Changed "${data.title || 'task'}" from ${data.old_status} to ${data.new_status}`;
    case 'time.started':
      return `Started timer on "${data.task_title || 'task'}"`;
    case 'time.stopped':
      return `Stopped timer (${data.duration_minutes || 0} min)`;
    case 'photo.uploaded':
      return data.description || `Added photo to "${data.task_title || data.loop_name || 'item'}"`;
    case 'loop.created':
      return `Created loop "${data.name || 'Untitled'}"`;
    case 'loop.completed':
      return `Completed loop "${data.name || 'loop'}"`;
    case 'note.added':
      return data.note || 'Added a note';
    case 'issue.flagged':
      return data.description || 'Flagged an issue';
    case 'material.received':
      return data.description || 'Material received';
    case 'inspection.scheduled':
      return data.description || 'Inspection logged';
    case 'weather.delay':
      return data.description || 'Weather delay';
    case 'client.contact':
      return data.description || 'Client contact';
    case 'change.requested':
      return data.description || 'Change requested';
    case 'payment.received':
      return data.description || 'Payment received';
    case 'subcontractor.update':
      return data.description || 'Subcontractor update';
    default:
      return event.event_type.replace(/\./g, ' ');
  }
}

function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

function formatFullDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

// Keys that represent date fields in event_data
const dateFieldKeys = [
  'date', 'delay_date', 'original_due_date', 'new_due_date',
  'completed_date', 'received_date', 'scheduled_date',
  'contact_date', 'request_date', 'payment_date'
];

// Format a date string (YYYY-MM-DD) to readable format
function formatDateField(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

// Human-readable labels for date field keys
const dateFieldLabels = {
  date: 'Date',
  delay_date: 'Delay Date',
  original_due_date: 'Original Due Date',
  new_due_date: 'New Due Date',
  completed_date: 'Completion Date',
  received_date: 'Date Received',
  scheduled_date: 'Scheduled Date',
  contact_date: 'Contact Date',
  request_date: 'Request Date',
  payment_date: 'Payment Date'
};

function ActivityItem({ event, onClick, getCategoryName, getContactNames }) {
  const Icon = eventIcons[event.event_type] || Circle;
  const colorClass = eventColors[event.event_type] || 'text-gray-400';

  // Get category and contact display info
  const categoryName = event.category_code ? getCategoryName(event.category_code) : null;
  const contactNames = event.contact_ids?.length > 0 ? getContactNames(event.contact_ids) : [];

  return (
    <button
      onClick={() => onClick(event)}
      className="w-full flex gap-3 px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors text-left"
    >
      <div className={`mt-0.5 ${colorClass}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-charcoal line-clamp-2">
          {formatEventMessage(event)}
        </p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {/* Category badge */}
          {categoryName && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 text-xs text-gray-600 rounded">
              <Tag className="w-3 h-3" />
              {categoryName}
            </span>
          )}
          {/* Contact badge */}
          {contactNames.length > 0 && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-xs text-blue-600 rounded">
              <Users className="w-3 h-3" />
              {contactNames.length === 1 ? contactNames[0] : `${contactNames.length} people`}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          {event.actor_name && (
            <span className="text-xs text-gray-500">{event.actor_name}</span>
          )}
          <span className="text-xs text-gray-400">
            {formatTimeAgo(event.created_at)}
          </span>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-300 mt-1 flex-shrink-0" />
    </button>
  );
}

function ActivityDetailModal({ event, isOpen, onClose, getCategoryName, getContactNames, formatCategoryPath }) {
  if (!event) return null;

  const Icon = eventIcons[event.event_type] || Circle;
  const colorClass = eventColors[event.event_type] || 'text-gray-400';
  const label = eventLabels[event.event_type] || event.event_type;
  const data = event.event_data || {};

  // Separate date fields from other fields
  const dateEntries = Object.entries(data).filter(([key]) => dateFieldKeys.includes(key));
  const otherEntries = Object.entries(data).filter(([key]) => !dateFieldKeys.includes(key));

  // Get category and contact info
  const categoryName = event.category_code ? getCategoryName(event.category_code) : null;
  const categoryPath = event.subcategory_code ? formatCategoryPath(event.subcategory_code) : categoryName;
  const contactNames = event.contact_ids?.length > 0 ? getContactNames(event.contact_ids) : [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Activity Details">
      <div className="space-y-4">
        {/* Type header */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div className={colorClass}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-charcoal">{label}</p>
            <p className="text-xs text-gray-500">{formatFullDate(event.created_at)}</p>
          </div>
        </div>

        {/* Main content */}
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Description</p>
            <p className="text-sm text-charcoal">{formatEventMessage(event)}</p>
          </div>

          {/* Category & Subcategory */}
          {categoryPath && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Category</p>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <Tag className="w-4 h-4 text-gray-500" />
                <p className="text-sm text-charcoal">{categoryPath}</p>
              </div>
            </div>
          )}

          {/* Contacts/People Involved */}
          {contactNames.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">People Involved</p>
              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                <Users className="w-4 h-4 text-blue-500" />
                <p className="text-sm text-charcoal">{contactNames.join(', ')}</p>
              </div>
            </div>
          )}

          {/* Date fields - shown prominently with calendar icon */}
          {dateEntries.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Dates</p>
              <div className="space-y-2">
                {dateEntries.map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                    <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-blue-600">{dateFieldLabels[key] || key.replace(/_/g, ' ')}</p>
                      <p className="text-sm font-medium text-charcoal">{formatDateField(value)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {event.actor_name && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Logged by</p>
              <p className="text-sm text-charcoal">{event.actor_name}</p>
            </div>
          )}

          {/* Show other event data (non-date fields) */}
          {otherEntries.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Details</p>
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                {otherEntries.map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-gray-500 capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="text-charcoal font-medium">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related links - placeholder for future navigation */}
          {(event.task_id || event.loop_id || event.project_id) && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Related</p>
              <div className="space-y-2">
                {event.task_id && (
                  <button className="w-full flex items-center justify-between p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm text-left">
                    <span className="text-gray-600">View Task</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                )}
                {event.loop_id && (
                  <button className="w-full flex items-center justify-between p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm text-left">
                    <span className="text-gray-600">View Loop</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Close button */}
        <Button variant="secondary" onClick={onClose} className="w-full">
          Close
        </Button>
      </div>
    </Modal>
  );
}

// Time range options
const TIME_RANGES = [
  { key: 'today', label: 'Today', days: 0 },
  { key: 'week', label: 'Week', days: 7 },
  { key: 'month', label: 'Month', days: 30 },
  { key: 'all', label: 'All', days: null },
];

// Activity type groups for filtering
const ACTIVITY_TYPE_GROUPS = [
  {
    label: 'Tasks & Loops',
    types: ['task.created', 'task.completed', 'task.status_changed', 'loop.created', 'loop.completed'],
  },
  {
    label: 'Time & Photos',
    types: ['time.started', 'time.stopped', 'photo.uploaded'],
  },
  {
    label: 'Notes & Issues',
    types: ['note.added', 'issue.flagged'],
  },
  {
    label: 'Logistics',
    types: ['material.received', 'inspection.scheduled', 'weather.delay'],
  },
  {
    label: 'Communication',
    types: ['client.contact', 'change.requested', 'payment.received', 'subcontractor.update'],
  },
];

// Get all activity types as flat array
const ALL_ACTIVITY_TYPES = ACTIVITY_TYPE_GROUPS.flatMap(g => g.types);

function TimeRangeTabs({ selected, onChange }) {
  return (
    <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
      {TIME_RANGES.map((range) => (
        <button
          key={range.key}
          onClick={() => onChange(range.key)}
          className={`
            px-3 py-1.5 text-xs font-medium rounded-md transition-colors
            ${selected === range.key
              ? 'bg-white text-charcoal shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
            }
          `}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
}

function FilterModal({ isOpen, onClose, filters, onFiltersChange, categoryOptions }) {
  const { selectedTypes, selectedCategories } = filters;

  const toggleType = (type) => {
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type];
    onFiltersChange({ ...filters, selectedTypes: newTypes });
  };

  const toggleCategory = (code) => {
    const newCategories = selectedCategories.includes(code)
      ? selectedCategories.filter(c => c !== code)
      : [...selectedCategories, code];
    onFiltersChange({ ...filters, selectedCategories: newCategories });
  };

  const selectAllTypes = () => {
    onFiltersChange({ ...filters, selectedTypes: [...ALL_ACTIVITY_TYPES] });
  };

  const clearAllTypes = () => {
    onFiltersChange({ ...filters, selectedTypes: [] });
  };

  const clearAllCategories = () => {
    onFiltersChange({ ...filters, selectedCategories: [] });
  };

  const activeFilterCount =
    (selectedTypes.length < ALL_ACTIVITY_TYPES.length ? 1 : 0) +
    (selectedCategories.length > 0 ? 1 : 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Filter Activity">
      <div className="space-y-5">
        {/* Activity Types */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-charcoal">Activity Types</p>
            <div className="flex gap-2">
              <button
                onClick={selectAllTypes}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                All
              </button>
              <button
                onClick={clearAllTypes}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                None
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {ACTIVITY_TYPE_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="text-xs text-gray-500 mb-1.5">{group.label}</p>
                <div className="flex flex-wrap gap-2">
                  {group.types.map((type) => {
                    const Icon = eventIcons[type] || Circle;
                    const isSelected = selectedTypes.includes(type);
                    return (
                      <button
                        key={type}
                        onClick={() => toggleType(type)}
                        className={`
                          inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded-md border transition-colors
                          ${isSelected
                            ? 'bg-charcoal text-white border-charcoal'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                          }
                        `}
                      >
                        <Icon className="w-3 h-3" />
                        {eventLabels[type]?.replace(' ', '\u00A0') || type}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-charcoal">Categories</p>
            {selectedCategories.length > 0 && (
              <button
                onClick={clearAllCategories}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Clear
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500 mb-2">
            {selectedCategories.length === 0 ? 'Showing all categories' : `${selectedCategories.length} selected`}
          </p>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {categoryOptions.map((cat) => {
              const isSelected = selectedCategories.includes(cat.value);
              return (
                <button
                  key={cat.value}
                  onClick={() => toggleCategory(cat.value)}
                  className={`
                    px-2 py-1 text-xs rounded-md border transition-colors
                    ${isSelected
                      ? 'bg-charcoal text-white border-charcoal'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="secondary"
            onClick={() => {
              onFiltersChange({
                selectedTypes: [...ALL_ACTIVITY_TYPES],
                selectedCategories: [],
              });
            }}
            className="flex-1"
          >
            Reset All
          </Button>
          <Button onClick={onClose} className="flex-1">
            Done {activeFilterCount > 0 && `(${activeFilterCount})`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function ActivityFeed({ activities, loading, emptyMessage = 'No activity yet', projectId }) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [timeRange, setTimeRange] = useState('week');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    selectedTypes: [...ALL_ACTIVITY_TYPES],
    selectedCategories: [], // empty = show all
  });

  // Get scope data helpers
  const {
    getCategoryName,
    getContactNames,
    formatCategoryPath,
    categoryOptions,
  } = useScopeData(projectId);

  // Filter activities based on time range and filters
  const filteredActivities = useMemo(() => {
    if (!activities) return [];

    return activities.filter((event) => {
      // Time range filter
      const range = TIME_RANGES.find(r => r.key === timeRange);
      if (range && range.days !== null) {
        const eventDate = new Date(event.created_at);
        const now = new Date();
        const cutoff = new Date(now);

        if (range.days === 0) {
          // Today: start of day
          cutoff.setHours(0, 0, 0, 0);
        } else {
          cutoff.setDate(now.getDate() - range.days);
        }

        if (eventDate < cutoff) return false;
      }

      // Activity type filter
      if (filters.selectedTypes.length > 0 && !filters.selectedTypes.includes(event.event_type)) {
        return false;
      }

      // Category filter (empty = show all)
      if (filters.selectedCategories.length > 0) {
        if (!event.category_code || !filters.selectedCategories.includes(event.category_code)) {
          return false;
        }
      }

      return true;
    });
  }, [activities, timeRange, filters]);

  // Count active filters
  const activeFilterCount =
    (filters.selectedTypes.length < ALL_ACTIVITY_TYPES.length ? 1 : 0) +
    (filters.selectedCategories.length > 0 ? 1 : 0);

  if (loading) {
    return (
      <Card>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 px-4 py-3 border-b border-gray-100 last:border-0">
            <div className="w-4 h-4 bg-gray-100 rounded-full animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
              <div className="h-3 bg-gray-100 rounded animate-pulse w-1/4" />
            </div>
          </div>
        ))}
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-400 text-sm">{emptyMessage}</p>
      </Card>
    );
  }

  return (
    <>
      {/* Filter Controls */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <TimeRangeTabs selected={timeRange} onChange={setTimeRange} />

        <button
          onClick={() => setShowFilterModal(true)}
          className={`
            inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors
            ${activeFilterCount > 0
              ? 'bg-charcoal text-white border-charcoal'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }
          `}
        >
          <Filter className="w-3.5 h-3.5" />
          Filter
          {activeFilterCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-[10px]">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Results count */}
      {filteredActivities.length !== activities.length && (
        <p className="text-xs text-gray-500 mb-2">
          Showing {filteredActivities.length} of {activities.length} activities
        </p>
      )}

      {/* Activity List */}
      {filteredActivities.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-400 text-sm">No activities match your filters</p>
          <button
            onClick={() => {
              setTimeRange('all');
              setFilters({
                selectedTypes: [...ALL_ACTIVITY_TYPES],
                selectedCategories: [],
              });
            }}
            className="mt-2 text-sm text-blue-600 hover:text-blue-700"
          >
            Clear all filters
          </button>
        </Card>
      ) : (
        <Card>
          {filteredActivities.map((event) => (
            <ActivityItem
              key={event.id}
              event={event}
              onClick={setSelectedEvent}
              getCategoryName={getCategoryName}
              getContactNames={getContactNames}
            />
          ))}
        </Card>
      )}

      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={filters}
        onFiltersChange={setFilters}
        categoryOptions={categoryOptions}
      />

      {/* Detail Modal */}
      <ActivityDetailModal
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        getCategoryName={getCategoryName}
        getContactNames={getContactNames}
        formatCategoryPath={formatCategoryPath}
      />
    </>
  );
}
