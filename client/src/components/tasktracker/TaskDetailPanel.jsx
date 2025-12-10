import { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Layers,
  Wrench,
  Package,
  ListChecks,
  Camera,
  BookOpen,
  ExternalLink,
} from 'lucide-react';
import { Button, Checkbox, Select } from '../ui';

/**
 * Task Detail Panel - Slide-out panel for task instance details
 * Shows three-axis context (immutable), editable assignments, and checklists
 */
export function TaskDetailPanel({
  instance,
  category,
  stage,
  contacts,
  onClose,
  onUpdate,
}) {
  const [localInstance, setLocalInstance] = useState(instance);
  const [activeChecklistTab, setActiveChecklistTab] = useState('process');

  // Checklist completion state (local only for now)
  const [completedItems, setCompletedItems] = useState({});

  // Keep local state in sync with prop
  useEffect(() => {
    setLocalInstance(instance);
  }, [instance]);

  if (!instance) return null;

  const isCompleted = localInstance.status === 'completed';
  const isBlocked = localInstance.status === 'blocked';
  const isOverdue =
    localInstance.dueDate &&
    new Date(localInstance.dueDate) < new Date() &&
    !isCompleted;

  // Get the attached checklist
  const checklist = localInstance.checklist;
  const fieldGuideModules = localInstance.fieldGuideModules || [];

  // Handle status change
  const handleStatusChange = async (newStatus) => {
    setLocalInstance((prev) => ({ ...prev, status: newStatus }));
    await onUpdate?.(instance.id, { status: newStatus });
  };

  // Handle assignment change
  const handleAssignmentChange = async (contactId) => {
    setLocalInstance((prev) => ({ ...prev, assignedTo: contactId }));
    await onUpdate?.(instance.id, { assignedTo: contactId });
  };

  // Handle priority change
  const handlePriorityChange = async (priority) => {
    const numPriority = parseInt(priority, 10);
    setLocalInstance((prev) => ({ ...prev, priority: numPriority }));
    await onUpdate?.(instance.id, { priority: numPriority });
  };

  // Handle due date change
  const handleDueDateChange = async (e) => {
    const dueDate = e.target.value;
    setLocalInstance((prev) => ({ ...prev, dueDate }));
    await onUpdate?.(instance.id, { dueDate });
  };

  // Toggle checklist item
  const toggleChecklistItem = (itemId) => {
    setCompletedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  // Status options
  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'blocked', label: 'Blocked' },
    { value: 'completed', label: 'Completed' },
  ];

  // Priority options
  const priorityOptions = [
    { value: '1', label: 'P1 - Critical' },
    { value: '2', label: 'P2 - High' },
    { value: '3', label: 'P3 - Medium' },
    { value: '4', label: 'P4 - Low' },
  ];

  // Contact options for assignment
  const contactOptions = contacts
    .filter((c) => c.contact_type === 'subcontractor')
    .map((c) => ({
      value: c.id,
      label: `${c.name} - ${c.company}`,
    }));

  // Checklist tabs
  const checklistTabs = [
    { id: 'tools', label: 'Tools', icon: Wrench, count: checklist?.tools?.length || 0 },
    { id: 'materials', label: 'Materials', icon: Package, count: checklist?.materials?.length || 0 },
    { id: 'process', label: 'Process', icon: ListChecks, count: checklist?.process?.length || 0 },
    { id: 'photos', label: 'Photos', icon: Camera, count: checklist?.photos?.length || 0 },
  ];

  // Render checklist items based on active tab
  const renderChecklistContent = () => {
    if (!checklist) {
      return (
        <div className="text-center py-8 text-gray-400">
          <ListChecks className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No checklist available for this task type</p>
        </div>
      );
    }

    const items = checklist[activeChecklistTab] || [];

    if (items.length === 0) {
      return (
        <div className="text-center py-6 text-gray-400">
          <p className="text-sm">No items in this category</p>
        </div>
      );
    }

    // Calculate completion for this tab
    const completedCount = items.filter(item => completedItems[item.id]).length;

    return (
      <div className="space-y-1">
        {/* Progress indicator */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span>{completedCount} of {items.length} complete</span>
          <span className="font-medium text-emerald-600">
            {items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0}%
          </span>
        </div>

        {items.map((item) => {
          const isChecked = completedItems[item.id];
          const itemLabel = activeChecklistTab === 'process' ? item.step :
                           activeChecklistTab === 'photos' ? item.shot :
                           item.item;
          const isRequired = item.required !== false;
          const isCritical = item.critical;

          return (
            <div
              key={item.id}
              onClick={() => toggleChecklistItem(item.id)}
              className={`
                flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-colors
                ${isChecked ? 'bg-emerald-50' : isCritical ? 'bg-amber-50' : 'bg-gray-50 hover:bg-gray-100'}
              `}
            >
              <Checkbox
                checked={isChecked}
                onChange={() => toggleChecklistItem(item.id)}
                className="mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${isChecked ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                  {itemLabel}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {isCritical && !isChecked && (
                    <span className="text-xs text-amber-600 font-medium">Critical</span>
                  )}
                  {!isRequired && !isChecked && (
                    <span className="text-xs text-gray-400">Optional</span>
                  )}
                </div>
              </div>
              {isChecked && (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          {category && (
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: category.color }}
            />
          )}
          <h2 className="text-lg font-semibold text-charcoal truncate">
            Task Details
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Task Name & Status */}
        <div className="px-4 py-4 border-b border-gray-100">
          <h3 className="text-base font-medium text-charcoal">
            {localInstance.name}
          </h3>

          {/* Checklist Name */}
          {checklist && (
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {checklist.name}
              {checklist.fieldGuideRef && (
                <span className="text-gray-400">({checklist.fieldGuideRef})</span>
              )}
            </p>
          )}

          {/* Status Selector */}
          <div className="mt-3">
            <Select
              label="Status"
              value={localInstance.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              options={statusOptions}
            />
          </div>

          {/* Blocked Reason (if blocked) */}
          {isBlocked && (
            <div className="mt-2 p-2 bg-red-50 rounded-md">
              <div className="flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">Blocked</span>
              </div>
              {localInstance.dependencyOverrides?.blockedByReason && (
                <p className="text-xs text-red-600 mt-1">
                  {localInstance.dependencyOverrides.blockedByReason}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Three Axes (Read-Only) */}
        <div className="px-4 py-4 border-b border-gray-100 bg-gray-50">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Task Location (Fixed)
          </h4>

          <div className="space-y-2">
            {/* Work Category (Axis 1) */}
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: category?.color || '#9CA3AF' }}
              />
              <span className="text-sm text-gray-600">
                <span className="font-medium">{category?.name || 'Unknown'}</span>
                <span className="text-gray-400 ml-1">({localInstance.categoryCode})</span>
              </span>
            </div>

            {/* Stage (Axis 2) */}
            <div className="flex items-center gap-2">
              <Layers className="w-3 h-3 text-gray-400" />
              <span className="text-sm text-gray-600">
                <span className="font-medium">{stage?.name || 'Unknown'}</span>
                <span className="text-gray-400 ml-1">({localInstance.stageCode})</span>
              </span>
            </div>

            {/* Location (Axis 3) */}
            {localInstance.locationPath && (
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3 text-amber-500" />
                <span className="text-sm text-gray-600">
                  {localInstance.locationPath.split('.').map((part, i, arr) => (
                    <span key={i}>
                      {part}
                      {i < arr.length - 1 && (
                        <ChevronRight className="w-3 h-3 inline mx-0.5 text-gray-300" />
                      )}
                    </span>
                  ))}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Assignments (Editable) */}
        <div className="px-4 py-4 border-b border-gray-100">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Assignments
          </h4>

          <div className="space-y-3">
            {/* Contractor */}
            <Select
              label="Assigned To"
              value={localInstance.assignedTo || ''}
              onChange={(e) => handleAssignmentChange(e.target.value || null)}
              options={[{ value: '', label: 'Unassigned' }, ...contactOptions]}
            />

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={localInstance.dueDate || ''}
                onChange={handleDueDateChange}
                className={`
                  w-full px-3 py-2 border rounded-md text-sm
                  focus:outline-none focus:ring-2 focus:ring-charcoal focus:border-transparent
                  ${isOverdue ? 'border-red-300 bg-red-50' : 'border-gray-300'}
                `}
              />
              {isOverdue && (
                <p className="text-xs text-red-500 mt-1">This task is overdue</p>
              )}
            </div>

            {/* Priority */}
            <Select
              label="Priority"
              value={String(localInstance.priority || 3)}
              onChange={(e) => handlePriorityChange(e.target.value)}
              options={priorityOptions}
            />
          </div>
        </div>

        {/* Checklists with Tabs */}
        <div className="px-4 py-4 border-b border-gray-100">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Checklists
          </h4>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-3 -mx-4 px-4">
            {checklistTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeChecklistTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveChecklistTab(tab.id)}
                  className={`
                    flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors
                    ${isActive
                      ? 'border-charcoal text-charcoal'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                    }
                  `}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`
                      text-[10px] px-1.5 py-0.5 rounded-full
                      ${isActive ? 'bg-charcoal text-white' : 'bg-gray-200 text-gray-600'}
                    `}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          {renderChecklistContent()}
        </div>

        {/* Field Guide Reference */}
        {fieldGuideModules.length > 0 && (
          <div className="px-4 py-4 border-b border-gray-100">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Field Guide Reference
            </h4>
            <div className="flex flex-wrap gap-2">
              {fieldGuideModules.map((moduleId) => (
                <a
                  key={moduleId}
                  href={`/field-guide?module=${moduleId}`}
                  className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs hover:bg-blue-100 transition-colors"
                >
                  <BookOpen className="w-3 h-3" />
                  {moduleId}
                  <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Time Tracking */}
        <div className="px-4 py-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Time Tracking
          </h4>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Estimated</p>
                <p className="text-sm font-medium text-charcoal">
                  {localInstance.estimatedHours || 0}h
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-500" />
              <div>
                <p className="text-xs text-gray-400">Actual</p>
                <p className="text-sm font-medium text-charcoal">
                  {localInstance.actualHours || 0}h
                </p>
              </div>
            </div>

            {localInstance.reworkCount > 0 && (
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <div>
                  <p className="text-xs text-gray-400">Rework</p>
                  <p className="text-sm font-medium text-amber-600">
                    {localInstance.reworkCount}x ({localInstance.reworkHours || 0}h)
                  </p>
                </div>
              </div>
            )}
          </div>

          <Button
            variant="secondary"
            size="sm"
            className="mt-3 w-full"
            disabled={isCompleted}
          >
            <Clock className="w-4 h-4 mr-2" />
            Log Time
          </Button>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-4 py-3 border-t border-gray-200 flex gap-2">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={onClose}
        >
          Close
        </Button>
        {!isCompleted && (
          <Button
            variant="primary"
            className="flex-1"
            onClick={() => handleStatusChange('completed')}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Complete
          </Button>
        )}
      </div>
    </div>
  );
}
