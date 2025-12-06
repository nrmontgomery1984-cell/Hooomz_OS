import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Tag } from 'lucide-react';
import { PageContainer } from '../components/layout';
import { Card, Button, StatusDot, ProgressBar } from '../components/ui';
import { TaskList, AddTaskModal } from '../components/tasks';
import { ActivityFeed } from '../components/activity';
import { useScopeData } from '../hooks';
import {
  getLoop,
  getTasks,
  updateTaskStatus,
  getProject,
  getProjectActivity,
  createActivityEntry,
  createTask,
} from '../services/api';

export function LoopDetail() {
  const { projectId, loopId } = useParams();
  const [project, setProject] = useState(null);
  const [loop, setLoop] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' | 'activity'

  // Get scope data helpers
  const { getCategoryName } = useScopeData(projectId);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [projectRes, loopRes, tasksRes] = await Promise.all([
        getProject(projectId),
        getLoop(loopId),
        getTasks(loopId),
      ]);
      setProject(projectRes.data);
      setLoop(loopRes.data);
      setTasks(tasksRes.data || []);
      setLoading(false);

      // Load activity for this loop (filter by loop context)
      setActivityLoading(true);
      const activityRes = await getProjectActivity(projectId, 50);
      // Filter to loop-related activities
      const loopActivities = (activityRes.data || []).filter(a =>
        a.loop_id === loopId ||
        (tasksRes.data || []).some(t => t.id === a.task_id)
      );
      setActivities(loopActivities);
      setActivityLoading(false);
    }
    loadData();
  }, [projectId, loopId]);

  const handleToggleTask = async (taskId, newStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const previousStatus = task.status;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status: newStatus } : t
      )
    );

    const { error } = await updateTaskStatus(taskId, newStatus);

    if (error) {
      // Revert on error
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, status: previousStatus } : t
        )
      );
      return;
    }

    // Log activity on successful status change
    if (newStatus === 'completed') {
      const entry = await createActivityEntry({
        event_type: 'task.completed',
        event_data: {
          title: task.title,
          completed_date: new Date().toISOString().split('T')[0],
        },
        project_id: projectId,
        loop_id: loopId,
        task_id: taskId,
        category_code: task.category_code,
        subcategory_code: task.subcategory_code,
        contact_ids: task.contact_ids || [],
        actor_name: 'You',
      });

      if (entry.data) {
        setActivities((prev) => [entry.data, ...prev]);
      }
    } else if (previousStatus === 'completed' && newStatus === 'pending') {
      // Reopened a task
      const entry = await createActivityEntry({
        event_type: 'task.status_changed',
        event_data: {
          title: task.title,
          old_status: 'completed',
          new_status: 'pending',
        },
        project_id: projectId,
        loop_id: loopId,
        task_id: taskId,
        category_code: task.category_code,
        contact_ids: task.contact_ids || [],
        actor_name: 'You',
      });

      if (entry.data) {
        setActivities((prev) => [entry.data, ...prev]);
      }
    }
  };

  const handleAddTask = async (taskData) => {
    const { data, error } = await createTask(taskData);

    if (!error && data) {
      setTasks((prev) => [...prev, data]);

      // Log activity
      const entry = await createActivityEntry({
        event_type: 'task.created',
        event_data: { title: taskData.title },
        project_id: projectId,
        loop_id: loopId,
        task_id: data.id,
        category_code: taskData.category_code,
        subcategory_code: taskData.subcategory_code,
        contact_ids: taskData.contact_ids || [],
        actor_name: 'You',
      });

      if (entry.data) {
        setActivities((prev) => [entry.data, ...prev]);
      }
    }
  };

  if (loading) {
    return (
      <PageContainer backTo={`/projects/${projectId}`}>
        <div className="space-y-4">
          <div className="bg-gray-100 rounded-lg h-24 animate-pulse" />
          <div className="bg-gray-100 rounded-lg h-16 animate-pulse" />
          <div className="bg-gray-100 rounded-lg h-16 animate-pulse" />
        </div>
      </PageContainer>
    );
  }

  if (!loop) {
    return (
      <PageContainer backTo={`/projects/${projectId}`} title="Loop Not Found">
        <p className="text-gray-500">This loop doesn't exist.</p>
      </PageContainer>
    );
  }

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const totalCount = tasks.filter((t) => t.status !== 'cancelled').length;
  const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const statusColors = {
    completed: 'green',
    active: loop.health_color || 'yellow',
    blocked: 'red',
    pending: 'gray',
  };

  const categoryName = loop.category_code ? getCategoryName(loop.category_code) : null;

  return (
    <PageContainer
      backTo={`/projects/${projectId}`}
      title={loop.name}
      subtitle={`${project?.name || 'Project'} • ${loop.loop_type}`}
    >
      {/* Loop Header */}
      <Card className="p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <StatusDot status={statusColors[loop.status]} size="md" />
            <span className="text-sm text-gray-500 capitalize">{loop.status}</span>
          </div>
          <span className="text-sm text-gray-500">
            {completedCount} / {totalCount} tasks
          </span>
        </div>
        <ProgressBar value={completionPct} color={statusColors[loop.status]} height="normal" />

        {/* Category & Description */}
        {(categoryName || loop.description) && (
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
            {categoryName && (
              <div className="flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-600">{categoryName}</span>
              </div>
            )}
            {loop.description && (
              <p className="text-sm text-gray-600">{loop.description}</p>
            )}
          </div>
        )}
      </Card>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-4">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`
            flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors
            ${activeTab === 'tasks'
              ? 'bg-white text-charcoal shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
            }
          `}
        >
          Tasks ({totalCount})
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`
            flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors
            ${activeTab === 'activity'
              ? 'bg-white text-charcoal shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
            }
          `}
        >
          Activity ({activities.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'tasks' ? (
        <>
          {/* Tasks Header */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-charcoal">Tasks</h2>
            <Button variant="secondary" size="sm" onClick={() => setShowAddTask(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Add Task
            </Button>
          </div>

          <TaskList
            tasks={tasks}
            onToggle={handleToggleTask}
            projectId={projectId}
            loopId={loopId}
            emptyMessage="No tasks in this loop yet. Add one to get started!"
          />
        </>
      ) : (
        <>
          {/* Activity Header */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-charcoal">Loop Activity</h2>
          </div>

          <ActivityFeed
            activities={activities}
            loading={activityLoading}
            projectId={projectId}
            emptyMessage="No activity in this loop yet"
          />
        </>
      )}

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={showAddTask}
        onClose={() => setShowAddTask(false)}
        loopId={loopId}
        projectId={projectId}
        loopCategory={loop.category_code}
        onSubmit={handleAddTask}
      />
    </PageContainer>
  );
}
