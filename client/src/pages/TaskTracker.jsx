import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft } from 'lucide-react';
import { PageContainer } from '../components/layout';
import { Button, Card } from '../components/ui';
import {
  WorkCategoryLoop,
  TaskDetailPanel,
  FilterBar,
} from '../components/tasktracker';
import { useTaskTracker } from '../hooks/useTaskTracker';
import { getProject, getTaskTemplates } from '../services/api';

/**
 * Task Tracker Page - Core module for production management
 * Implements the Three Axis Model: Work Category, Stage, Location
 */
export function TaskTracker() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  // Project data
  const [project, setProject] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [projectLoading, setProjectLoading] = useState(true);

  // Task Tracker hook
  const {
    categories,
    subcategories,
    stages,
    phases,
    locations,
    locationTree,
    contacts,
    instances,
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
    toggleTaskComplete,
    getSubcategoryGroups,
    getContact,
    getLocation,
    getStage,
    getCategory,
    stats,
  } = useTaskTracker(projectId);

  // Phase filter for checklist
  const [phaseFilter, setPhaseFilter] = useState(null);

  // Load project and templates
  useEffect(() => {
    async function loadProject() {
      if (!projectId) return;
      setProjectLoading(true);

      const [projectRes, templatesRes] = await Promise.all([
        getProject(projectId),
        getTaskTemplates(projectId),
      ]);

      setProject(projectRes.data);
      setTemplates(templatesRes.data || []);
      setProjectLoading(false);
    }

    loadProject();
  }, [projectId]);

  // Get template for selected instance
  const selectedTemplate = selectedInstance
    ? templates.find((t) => t.id === selectedInstance.templateId)
    : null;

  // Handle task click - open detail panel
  const handleTaskClick = (instance) => {
    setSelectedInstance(instance);
  };

  // Handle detail panel close
  const handleCloseDetail = () => {
    setSelectedInstance(null);
  };

  // Loading state
  if (loading || projectLoading) {
    return (
      <PageContainer title="Task Tracker">
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-400">Loading tasks...</div>
        </div>
      </PageContainer>
    );
  }

  // Error state
  if (error) {
    const errorMessage = typeof error === 'string' ? error : JSON.stringify(error);
    return (
      <PageContainer title="Task Tracker">
        <div className="flex items-center justify-center py-20">
          <div className="text-red-500">Error: {errorMessage}</div>
        </div>
      </PageContainer>
    );
  }

  // No project selected state
  if (!project) {
    return (
      <PageContainer title="Task Tracker">
        <Card className="p-8 text-center">
          <h3 className="text-lg font-medium text-charcoal mb-2">
            No Project Selected
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Select a project to view its task tracker
          </p>
          <Button onClick={() => navigate('/production')}>
            View Active Projects
          </Button>
        </Card>
      </PageContainer>
    );
  }

  return (
    <>
      <PageContainer
        title="Task Tracker"
        subtitle={project.name}
        backTo={`/projects/${projectId}`}
        action={
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Add Task
          </Button>
        }
      >
        {/* Filter Bar */}
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
                No Tasks Found
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {Object.values(filters).some((v) => v !== null)
                  ? 'No tasks match your current filters. Try adjusting or clearing filters.'
                  : 'This project has no tasks yet. Add tasks to start tracking work.'}
              </p>
              {Object.values(filters).some((v) => v !== null) && (
                <Button variant="secondary" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </Card>
          )}
        </div>

        {/* Summary Stats Card */}
        {categoryGroups.length > 0 && (
          <Card className="mt-6 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Project Progress</p>
                <p className="text-2xl font-semibold text-charcoal">
                  {stats.completionPercent}%
                </p>
              </div>
              <div className="flex gap-6 text-sm">
                <div className="text-center">
                  <p className="text-gray-400">Completed</p>
                  <p className="text-lg font-medium text-emerald-600">
                    {stats.completed}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400">In Progress</p>
                  <p className="text-lg font-medium text-blue-600">
                    {stats.inProgress}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400">Pending</p>
                  <p className="text-lg font-medium text-gray-600">
                    {stats.pending}
                  </p>
                </div>
                {stats.blocked > 0 && (
                  <div className="text-center">
                    <p className="text-gray-400">Blocked</p>
                    <p className="text-lg font-medium text-red-600">
                      {stats.blocked}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}
      </PageContainer>

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
            template={selectedTemplate}
            category={getCategory(selectedInstance.categoryCode)}
            stage={getStage(selectedInstance.stageCode)}
            location={getLocation(selectedInstance.locationId)}
            contact={getContact(selectedInstance.assignedTo)}
            contacts={contacts}
            phases={phases}
            phaseFilter={phaseFilter}
            onPhaseFilterChange={setPhaseFilter}
            onClose={handleCloseDetail}
            onUpdate={updateInstance}
          />
        </>
      )}
    </>
  );
}
