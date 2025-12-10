import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button, Card } from '../ui';
import { WorkCategoryLoop, TaskDetailPanel, FilterBar, AddTaskModal } from '../tasktracker';
import { useTaskTracker } from '../../hooks/useTaskTracker';

/**
 * Loops View - Integrated Task Tracker within the Loops tab
 * Replaces separate loops list with Three-Axis task management
 */
export function LoopsView({ projectId }) {
  // Task Tracker hook provides all data and actions
  const {
    categories,
    stages,
    locations,
    locationTree,
    contacts,
    categoryGroups,
    loading,
    error,
    selectedInstance,
    setSelectedInstance,
    expandedCategories,
    toggleCategory,
    filters,
    setFilter,
    clearFilters,
    updateInstance,
    addInstance,
    toggleTaskComplete,
    getSubcategoryGroups,
    getContact,
    getStage,
    getCategory,
    stats,
  } = useTaskTracker(projectId);

  // Add Task Modal state
  const [showAddTask, setShowAddTask] = useState(false);

  // Handle task click - open detail panel
  const handleTaskClick = (instance) => {
    setSelectedInstance(instance);
  };

  // Handle detail panel close
  const handleCloseDetail = () => {
    setSelectedInstance(null);
  };

  // Handle add task
  const handleAddTask = async (taskData) => {
    const { error: addError } = await addInstance(taskData);
    if (!addError) {
      setShowAddTask(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-charcoal">Loops</h2>
        </div>
        <div className="bg-gray-100 rounded-lg h-20 animate-pulse" />
        <div className="bg-gray-100 rounded-lg h-20 animate-pulse" />
        <div className="bg-gray-100 rounded-lg h-20 animate-pulse" />
      </div>
    );
  }

  // Error state
  if (error) {
    const errorMessage = typeof error === 'string' ? error : JSON.stringify(error);
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-charcoal">Loops</h2>
        </div>
        <Card className="p-8 text-center">
          <p className="text-red-500 text-sm">{errorMessage}</p>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-semibold text-charcoal">Loops</h2>
          {stats.total > 0 && (
            <p className="text-sm text-gray-500">
              {stats.completed} of {stats.total} tasks complete ({stats.completionPercent}%)
            </p>
          )}
        </div>
        <Button variant="secondary" size="sm" onClick={() => setShowAddTask(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Add Task
        </Button>
      </div>

      {/* Filter Bar */}
      {stats.total > 0 && (
        <div className="mb-4">
          <FilterBar
            filters={filters}
            onFilterChange={setFilter}
            onClearFilters={clearFilters}
            categories={categories}
            stages={stages}
            locations={locations}
            locationTree={locationTree}
            contacts={contacts}
            stats={stats}
          />
        </div>
      )}

      {/* Work Category Loops */}
      <div className="space-y-3">
        {categoryGroups.length > 0 ? (
          categoryGroups.map((group) => (
            <WorkCategoryLoop
              key={group.category.code}
              categoryGroup={group}
              subcategoryGroups={getSubcategoryGroups(group.category.code)}
              isExpanded={expandedCategories[group.category.code]}
              onToggle={() => toggleCategory(group.category.code)}
              onTaskClick={handleTaskClick}
              onTaskToggle={toggleTaskComplete}
              getContact={getContact}
            />
          ))
        ) : (
          <Card className="p-8 text-center">
            <h3 className="text-lg font-medium text-charcoal mb-2">
              {Object.values(filters).some((v) => v !== null) ? 'No Tasks Match Filters' : 'No Tasks Yet'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {Object.values(filters).some((v) => v !== null)
                ? 'Try adjusting or clearing your filters.'
                : 'Tasks will appear here when added to the project.'}
            </p>
            {Object.values(filters).some((v) => v !== null) ? (
              <Button variant="secondary" onClick={clearFilters}>
                Clear Filters
              </Button>
            ) : (
              <Button variant="secondary" size="sm" onClick={() => setShowAddTask(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Add First Task
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* Summary Stats Card */}
      {categoryGroups.length > 0 && (
        <Card className="mt-6 p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm text-gray-500">Progress</p>
              <p className="text-2xl font-semibold text-charcoal">
                {stats.completionPercent}%
              </p>
            </div>
            <div className="flex gap-4 sm:gap-6 text-sm">
              <div className="text-center">
                <p className="text-gray-400 text-xs">Done</p>
                <p className="text-lg font-medium text-emerald-600">
                  {stats.completed}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-xs">Active</p>
                <p className="text-lg font-medium text-blue-600">
                  {stats.inProgress}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-xs">Pending</p>
                <p className="text-lg font-medium text-gray-600">
                  {stats.pending}
                </p>
              </div>
              {stats.blocked > 0 && (
                <div className="text-center">
                  <p className="text-gray-400 text-xs">Blocked</p>
                  <p className="text-lg font-medium text-red-600">
                    {stats.blocked}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Task Detail Panel (Slide-out) */}
      {selectedInstance && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={handleCloseDetail}
          />

          {/* Panel */}
          <TaskDetailPanel
            instance={selectedInstance}
            category={getCategory(selectedInstance.categoryCode)}
            stage={getStage(selectedInstance.stageCode)}
            contacts={contacts}
            onClose={handleCloseDetail}
            onUpdate={updateInstance}
          />
        </>
      )}

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={showAddTask}
        onClose={() => setShowAddTask(false)}
        onAdd={handleAddTask}
        categories={categories}
        stages={stages}
        locations={locations}
        contacts={contacts}
      />
    </>
  );
}
