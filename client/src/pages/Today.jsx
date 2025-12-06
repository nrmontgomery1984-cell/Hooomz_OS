import { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { PageContainer } from '../components/layout';
import { Card, StatusDot } from '../components/ui';
import { TaskList } from '../components/tasks';
import { TimeTracker } from '../components/time';
import { getTodayTasks, getActiveTimeEntry, updateTaskStatus, stopTimer, startTimer } from '../services/api';

export function Today() {
  const [tasks, setTasks] = useState([]);
  const [timeEntry, setTimeEntry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [tasksRes, timeRes] = await Promise.all([
        getTodayTasks(),
        getActiveTimeEntry(),
      ]);
      setTasks(tasksRes.data || []);
      setTimeEntry(timeRes.data);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleToggleTask = async (taskId, newStatus) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status: newStatus } : t
      )
    );

    const { error } = await updateTaskStatus(taskId, newStatus);
    if (error) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, status: newStatus === 'completed' ? 'pending' : 'completed' }
            : t
        )
      );
    }
  };

  const handleStopTimer = async (entryId) => {
    await stopTimer(entryId);
    setTimeEntry(null);
  };

  const handleStartTimer = async (taskId, taskTitle, estimatedHours) => {
    // Stop any existing timer first
    if (timeEntry) {
      await stopTimer(timeEntry.id);
    }

    // Convert hours to minutes, default to 60 if not set
    const allocatedMinutes = estimatedHours ? Math.round(estimatedHours * 60) : 60;

    const { data, error } = await startTimer(taskId, allocatedMinutes);
    if (!error && data) {
      // Find task details for display
      const task = tasks.find(t => t.id === taskId);
      setTimeEntry({
        ...data,
        task_title: taskTitle || task?.title || 'Task',
        project_name: task?.project_name || task?.loop?.project?.name || 'Project',
      });
    }
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // System check stats
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const pendingTasks = tasks.filter((t) => t.status === 'pending').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const overdueTasks = tasks.filter(
    (t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
  ).length;

  if (loading) {
    return (
      <PageContainer title="Today">
        <div className="space-y-4">
          <div className="bg-gray-100 rounded-lg h-32 animate-pulse" />
          <div className="bg-gray-100 rounded-lg h-48 animate-pulse" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Today" subtitle={today}>
      {/* System Check */}
      <Card className="p-4 mb-6">
        <h2 className="text-sm font-medium text-gray-500 mb-3">System Check</h2>
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span className="text-lg font-semibold text-charcoal">{completedTasks}</span>
            </div>
            <p className="text-xs text-gray-500">Done</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-lg font-semibold text-charcoal">{inProgressTasks}</span>
            </div>
            <p className="text-xs text-gray-500">Active</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <StatusDot status="gray" />
              <span className="text-lg font-semibold text-charcoal">{pendingTasks}</span>
            </div>
            <p className="text-xs text-gray-500">Pending</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-lg font-semibold text-charcoal">{overdueTasks}</span>
            </div>
            <p className="text-xs text-gray-500">Overdue</p>
          </div>
        </div>
      </Card>

      {/* Active Timer */}
      {timeEntry && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-charcoal mb-3">Active Timer</h2>
          <TimeTracker timeEntry={timeEntry} onStop={handleStopTimer} />
        </div>
      )}

      {/* Today's Tasks */}
      <div className="mb-3">
        <h2 className="text-lg font-semibold text-charcoal">Today's Tasks</h2>
      </div>

      <TaskList
        tasks={tasks}
        onToggle={handleToggleTask}
        onStartTimer={handleStartTimer}
        activeTimerTaskId={timeEntry?.task_id}
        emptyMessage="No tasks scheduled for today"
      />
    </PageContainer>
  );
}
