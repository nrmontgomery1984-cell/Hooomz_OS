import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ListTodo,
  Filter,
  ChevronDown,
  ChevronRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Pause,
  User,
  Building2,
  Calendar,
  TrendingUp,
  Users,
  Briefcase,
  MapPin,
  X,
} from 'lucide-react';
import { PageContainer } from '../components/layout';
import { Card, Button } from '../components/ui';
import {
  getProjects,
  getWorkCategories,
  getStages,
  getContacts,
  getTaskInstances,
  updateTaskInstance,
} from '../services/api';

/**
 * LoopTracker - Company-wide loop/task tracker
 *
 * Shows all tasks across all active projects with:
 * - Multi-project aggregation
 * - Filter by project, trade, status, assignee
 * - Predictive scheduling indicators
 * - Team workload view
 */
export function LoopTracker() {
  // Data state
  const [projects, setProjects] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stages, setStages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  // View state
  const [viewMode, setViewMode] = useState('by-project'); // by-project, by-trade, by-assignee, by-status
  const [expandedGroups, setExpandedGroups] = useState({});
  const [selectedTask, setSelectedTask] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    projectId: null,
    categoryCode: null,
    status: null,
    assignedTo: null,
    dueWithin: null, // null, 'today', 'week', 'overdue'
  });
  const [showFilters, setShowFilters] = useState(false);

  // Load all data
  useEffect(() => {
    async function loadData() {
      setLoading(true);

      try {
        // Load reference data and projects in parallel
        const [projectsRes, categoriesRes, stagesRes, contactsRes] = await Promise.all([
          getProjects(),
          getWorkCategories(),
          getStages(),
          getContacts(),
        ]);

        // Debug logging
        console.log('All projects:', projectsRes.data);
        console.log('Project statuses:', (projectsRes.data || []).map(p => ({ id: p.id, status: p.status, phase: p.phase })));

        // Filter for projects in active production phases
        // Check both status and phase fields as they may be used interchangeably
        const activeProjects = (projectsRes.data || []).filter(p => {
          const isActive =
            p.status === 'active' ||
            p.status === 'contracted' ||
            p.status === 'in_progress' ||
            p.phase === 'active' ||
            p.phase === 'contracted' ||
            p.phase === 'in_progress' ||
            p.phase === 'production';
          return isActive;
        });

        console.log('Active projects:', activeProjects);

        setProjects(activeProjects);
        setCategories(categoriesRes.data || []);
        setStages(stagesRes.data || []);
        setContacts(contactsRes.data || []);

        // Load tasks for each active project
        const taskPromises = activeProjects.map(p => getTaskInstances(p.id));
        const taskResults = await Promise.all(taskPromises);

        // Flatten and attach project info to each task
        const tasks = [];
        taskResults.forEach((result, idx) => {
          if (result.data) {
            result.data.forEach(task => {
              tasks.push({
                ...task,
                projectId: activeProjects[idx].id,
                project: activeProjects[idx],
              });
            });
          }
        });

        setAllTasks(tasks);

        // Auto-expand groups with in-progress or blocked tasks
        const toExpand = {};
        tasks.forEach(t => {
          if (t.status === 'in_progress' || t.status === 'blocked') {
            const key = getGroupKey(t, 'by-project');
            toExpand[key] = true;
          }
        });
        setExpandedGroups(toExpand);

      } catch (err) {
        console.error('TaskBoard load error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Get group key based on view mode
  const getGroupKey = useCallback((task, mode) => {
    switch (mode) {
      case 'by-project':
        return task.projectId || 'unknown-project';
      case 'by-trade':
        return task.categoryCode || 'unknown-trade';
      case 'by-assignee':
        return task.assignedTo || 'unassigned';
      case 'by-status':
        return task.status || 'pending';
      default:
        return task.projectId || 'unknown';
    }
  }, []);

  // Apply filters
  const filteredTasks = useMemo(() => {
    let result = [...allTasks];

    if (filters.projectId) {
      result = result.filter(t => t.projectId === filters.projectId);
    }
    if (filters.categoryCode) {
      result = result.filter(t => t.categoryCode === filters.categoryCode);
    }
    if (filters.status) {
      result = result.filter(t => t.status === filters.status);
    }
    if (filters.assignedTo) {
      if (filters.assignedTo === 'unassigned') {
        result = result.filter(t => !t.assignedTo);
      } else {
        result = result.filter(t => t.assignedTo === filters.assignedTo);
      }
    }
    if (filters.dueWithin) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

      result = result.filter(t => {
        if (!t.dueDate) return filters.dueWithin === 'no-date';
        const due = new Date(t.dueDate);

        switch (filters.dueWithin) {
          case 'overdue':
            return due < today && t.status !== 'completed';
          case 'today':
            return due >= today && due < new Date(today.getTime() + 24 * 60 * 60 * 1000);
          case 'week':
            return due >= today && due <= weekFromNow;
          default:
            return true;
        }
      });
    }

    return result;
  }, [allTasks, filters]);

  // Group tasks by current view mode
  const groupedTasks = useMemo(() => {
    const groups = {};

    filteredTasks.forEach(task => {
      const key = getGroupKey(task, viewMode);
      if (!groups[key]) {
        groups[key] = {
          key,
          tasks: [],
          label: '',
          meta: null,
        };
      }
      groups[key].tasks.push(task);
    });

    // Add labels and sort
    Object.values(groups).forEach(group => {
      switch (viewMode) {
        case 'by-project': {
          const project = projects.find(p => p.id === group.key);
          group.label = project?.name || 'Unknown Project';
          group.meta = project;
          break;
        }
        case 'by-trade': {
          const category = categories.find(c => c.code === group.key);
          group.label = category?.name || group.key || 'Unknown Trade';
          group.meta = category;
          break;
        }
        case 'by-assignee': {
          if (group.key === 'unassigned') {
            group.label = 'Unassigned';
          } else {
            const contact = contacts.find(c => c.id === group.key);
            group.label = contact?.name || 'Unknown';
            group.meta = contact;
          }
          break;
        }
        case 'by-status': {
          group.label = getStatusLabel(group.key);
          break;
        }
        default:
          group.label = group.key || 'Unknown';
      }
    });

    // Sort groups
    return Object.values(groups).sort((a, b) => {
      // By status: blocked first, then in_progress, pending, completed
      if (viewMode === 'by-status') {
        const order = { blocked: 0, in_progress: 1, pending: 2, completed: 3 };
        return (order[a.key] ?? 4) - (order[b.key] ?? 4);
      }
      // Otherwise sort by task count (most first)
      return b.tasks.length - a.tasks.length;
    });
  }, [filteredTasks, viewMode, projects, categories, contacts, getGroupKey]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = filteredTasks.length;
    const completed = filteredTasks.filter(t => t.status === 'completed').length;
    const inProgress = filteredTasks.filter(t => t.status === 'in_progress').length;
    const blocked = filteredTasks.filter(t => t.status === 'blocked').length;
    const pending = filteredTasks.filter(t => t.status === 'pending').length;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const overdue = filteredTasks.filter(t => {
      if (t.status === 'completed' || !t.dueDate) return false;
      return new Date(t.dueDate) < today;
    }).length;

    const dueToday = filteredTasks.filter(t => {
      if (t.status === 'completed' || !t.dueDate) return false;
      const due = new Date(t.dueDate);
      return due >= today && due < new Date(today.getTime() + 24 * 60 * 60 * 1000);
    }).length;

    return {
      total,
      completed,
      inProgress,
      blocked,
      pending,
      overdue,
      dueToday,
      completionPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [filteredTasks]);

  // Toggle group expansion
  const toggleGroup = (key) => {
    setExpandedGroups(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Update task status
  const handleStatusChange = async (taskId, newStatus) => {
    await updateTaskInstance(taskId, { status: newStatus });
    setAllTasks(prev =>
      prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
    );
  };

  // Get status label
  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'in_progress': return 'In Progress';
      case 'blocked': return 'Blocked';
      case 'completed': return 'Completed';
      case 'complete': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status || 'Unknown';
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-gray-500 bg-gray-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'blocked': return 'text-red-600 bg-red-100';
      case 'completed': return 'text-emerald-600 bg-emerald-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return Clock;
      case 'in_progress': return TrendingUp;
      case 'blocked': return AlertTriangle;
      case 'completed': return CheckCircle2;
      case 'complete': return CheckCircle2;
      case 'cancelled': return Pause;
      default: return ListTodo;
    }
  };

  // Check if task is overdue
  const isOverdue = (task) => {
    if (task.status === 'completed' || !task.dueDate) return false;
    return new Date(task.dueDate) < new Date();
  };

  // Clear filter
  const clearFilter = (key) => {
    setFilters(prev => ({ ...prev, [key]: null }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      projectId: null,
      categoryCode: null,
      status: null,
      assignedTo: null,
      dueWithin: null,
    });
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== null);

  if (loading) {
    return (
      <PageContainer title="Loop Tracker" subtitle="Loading...">
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-100 rounded-lg h-24 animate-pulse" />
          ))}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Loop Tracker"
      subtitle={`${stats.total} tasks across ${projects.length} projects`}
    >
      {/* Stats Row - Clickable to filter */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        <StatCard
          label="Total"
          value={stats.total}
          color="gray"
          onClick={() => clearAllFilters()}
          active={!hasActiveFilters}
        />
        <StatCard
          label="In Progress"
          value={stats.inProgress}
          color="blue"
          onClick={() => setFilters(prev => ({ ...prev, status: 'in_progress', dueWithin: null }))}
          active={filters.status === 'in_progress'}
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          color="gray"
          onClick={() => setFilters(prev => ({ ...prev, status: 'pending', dueWithin: null }))}
          active={filters.status === 'pending'}
        />
        <StatCard
          label="Blocked"
          value={stats.blocked}
          color="red"
          highlight={stats.blocked > 0}
          onClick={() => setFilters(prev => ({ ...prev, status: 'blocked', dueWithin: null }))}
          active={filters.status === 'blocked'}
        />
        <StatCard
          label="Overdue"
          value={stats.overdue}
          color="orange"
          highlight={stats.overdue > 0}
          onClick={() => setFilters(prev => ({ ...prev, status: null, dueWithin: 'overdue' }))}
          active={filters.dueWithin === 'overdue'}
        />
        <StatCard
          label="Due Today"
          value={stats.dueToday}
          color="amber"
          onClick={() => setFilters(prev => ({ ...prev, status: null, dueWithin: 'today' }))}
          active={filters.dueWithin === 'today'}
        />
        <StatCard
          label="Complete"
          value={`${stats.completionPercent}%`}
          color="emerald"
          onClick={() => setFilters(prev => ({ ...prev, status: 'completed', dueWithin: null }))}
          active={filters.status === 'completed'}
        />
      </div>

      {/* Controls Row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {/* View Mode Selector */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
          {[
            { value: 'by-project', label: 'Projects', icon: Briefcase },
            { value: 'by-trade', label: 'Trades', icon: Building2 },
            { value: 'by-assignee', label: 'Team', icon: Users },
            { value: 'by-status', label: 'Status', icon: ListTodo },
          ].map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setViewMode(value)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                ${viewMode === value
                  ? 'bg-white text-charcoal shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Filter Toggle */}
        <Button
          variant={showFilters || hasActiveFilters ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="sm:ml-auto"
        >
          <Filter className="w-4 h-4 mr-1" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-xs">
              {Object.values(filters).filter(v => v !== null).length}
            </span>
          )}
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-charcoal">Filters</h3>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* Project Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Project</label>
              <select
                value={filters.projectId || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, projectId: e.target.value || null }))}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
              >
                <option value="">All Projects</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Trade Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Trade</label>
              <select
                value={filters.categoryCode || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, categoryCode: e.target.value || null }))}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
              >
                <option value="">All Trades</option>
                {categories.map(c => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value || null }))}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="blocked">Blocked</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Assignee Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Assignee</label>
              <select
                value={filters.assignedTo || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, assignedTo: e.target.value || null }))}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
              >
                <option value="">All Assignees</option>
                <option value="unassigned">Unassigned</option>
                {contacts.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Due Date Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Due Date</label>
              <select
                value={filters.dueWithin || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, dueWithin: e.target.value || null }))}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
              >
                <option value="">Any Time</option>
                <option value="overdue">Overdue</option>
                <option value="today">Due Today</option>
                <option value="week">Due This Week</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Active Filters Pills */}
      {hasActiveFilters && !showFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.projectId && (
            <FilterPill
              label={`Project: ${projects.find(p => p.id === filters.projectId)?.name || 'Unknown'}`}
              onClear={() => clearFilter('projectId')}
            />
          )}
          {filters.categoryCode && (
            <FilterPill
              label={`Trade: ${categories.find(c => c.code === filters.categoryCode)?.name || filters.categoryCode}`}
              onClear={() => clearFilter('categoryCode')}
            />
          )}
          {filters.status && (
            <FilterPill
              label={`Status: ${getStatusLabel(filters.status)}`}
              onClear={() => clearFilter('status')}
            />
          )}
          {filters.assignedTo && (
            <FilterPill
              label={`Assignee: ${filters.assignedTo === 'unassigned' ? 'Unassigned' : contacts.find(c => c.id === filters.assignedTo)?.name || 'Unknown'}`}
              onClear={() => clearFilter('assignedTo')}
            />
          )}
          {filters.dueWithin && (
            <FilterPill
              label={`Due: ${filters.dueWithin === 'overdue' ? 'Overdue' : filters.dueWithin === 'today' ? 'Today' : 'This Week'}`}
              onClear={() => clearFilter('dueWithin')}
            />
          )}
        </div>
      )}

      {/* Task Groups */}
      <div className="space-y-3">
        {groupedTasks.length > 0 ? (
          groupedTasks.map(group => (
            <TaskGroup
              key={group.key}
              group={group}
              viewMode={viewMode}
              isExpanded={expandedGroups[group.key]}
              onToggle={() => toggleGroup(group.key)}
              categories={categories}
              contacts={contacts}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
              isOverdue={isOverdue}
              onStatusChange={handleStatusChange}
            />
          ))
        ) : (
          <Card className="p-8 text-center">
            <ListTodo className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-charcoal mb-2">
              {hasActiveFilters ? 'No Tasks Match Filters' : 'No Active Tasks'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {hasActiveFilters
                ? 'Try adjusting your filters to see more tasks.'
                : 'Tasks will appear here when projects are in production.'}
            </p>
            {hasActiveFilters && (
              <Button variant="secondary" onClick={clearAllFilters}>
                Clear Filters
              </Button>
            )}
          </Card>
        )}
      </div>
    </PageContainer>
  );
}

// Stat Card Component
function StatCard({ label, value, color, highlight, onClick, active }) {
  const colorClasses = {
    gray: 'bg-gray-50 text-gray-700 hover:bg-gray-100',
    blue: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
    red: highlight ? 'bg-red-100 text-red-700 ring-2 ring-red-200 hover:bg-red-200' : 'bg-red-50 text-red-700 hover:bg-red-100',
    orange: highlight ? 'bg-orange-100 text-orange-700 ring-2 ring-orange-200 hover:bg-orange-200' : 'bg-orange-50 text-orange-700 hover:bg-orange-100',
    amber: 'bg-amber-50 text-amber-700 hover:bg-amber-100',
    emerald: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
  };

  return (
    <button
      onClick={onClick}
      className={`
        rounded-lg p-3 text-left transition-all cursor-pointer
        ${colorClasses[color]}
        ${active ? 'ring-2 ring-offset-1 ring-current' : ''}
      `}
    >
      <p className="text-xs font-medium opacity-75">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </button>
  );
}

// Filter Pill Component
function FilterPill({ label, onClear }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
      {label}
      <button onClick={onClear} className="p-0.5 hover:bg-blue-200 rounded-full">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

// Task Group Component
function TaskGroup({
  group,
  viewMode,
  isExpanded,
  onToggle,
  categories,
  contacts,
  getStatusColor,
  getStatusIcon,
  isOverdue,
  onStatusChange,
}) {
  const completedCount = group.tasks.filter(t => t.status === 'completed').length;
  const blockedCount = group.tasks.filter(t => t.status === 'blocked').length;
  const inProgressCount = group.tasks.filter(t => t.status === 'in_progress').length;
  const overdueCount = group.tasks.filter(t => isOverdue(t)).length;

  // Get group icon based on view mode
  const getGroupIcon = () => {
    switch (viewMode) {
      case 'by-project':
        return Briefcase;
      case 'by-trade':
        return Building2;
      case 'by-assignee':
        return User;
      case 'by-status': {
        const icon = getStatusIcon(group.key);
        return icon || ListTodo;
      }
      default:
        return ListTodo;
    }
  };

  const GroupIcon = getGroupIcon() || ListTodo;

  // Get category color for trades view
  const getCategoryColor = () => {
    if (viewMode === 'by-trade' && group.meta?.color) {
      return group.meta.color;
    }
    return null;
  };

  // Determine status color for card border
  const getCardStatusColor = () => {
    if (blockedCount > 0) return 'red';
    if (inProgressCount > 0) return 'yellow';
    if (completedCount === group.tasks.length && group.tasks.length > 0) return 'green';
    return 'gray';
  };

  const cardStatusColor = getCardStatusColor();

  // Status-based card styling
  const cardStyles = {
    gray: 'border-gray-200 bg-gray-50/30',
    red: 'border-red-300 bg-red-50/40',
    yellow: 'border-amber-300 bg-amber-50/40',
    green: 'border-emerald-300 bg-emerald-50/40',
  };

  return (
    <Card className={`overflow-hidden border-2 ${cardStyles[cardStatusColor]}`}>
      {/* Group Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
      >
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
        )}

        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            backgroundColor: getCategoryColor() ? `${getCategoryColor()}20` : '#f3f4f6',
            color: getCategoryColor() || '#6b7280',
          }}
        >
          <GroupIcon className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-charcoal truncate">{group.label}</h3>
          <p className="text-sm text-gray-500">
            {completedCount}/{group.tasks.length} complete
            {blockedCount > 0 && (
              <span className="text-red-500 ml-2">• {blockedCount} blocked</span>
            )}
            {overdueCount > 0 && (
              <span className="text-orange-500 ml-2">• {overdueCount} overdue</span>
            )}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-2">
          {inProgressCount > 0 && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
              {inProgressCount} active
            </span>
          )}
          {blockedCount > 0 && (
            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
              {blockedCount} blocked
            </span>
          )}
        </div>
      </button>

      {/* Task List */}
      {isExpanded && (
        <div className="border-t border-gray-100">
          {group.tasks.map(task => (
            <TaskRow
              key={task.id}
              task={task}
              viewMode={viewMode}
              categories={categories}
              contacts={contacts}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
              isOverdue={isOverdue(task)}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      )}
    </Card>
  );
}

// Task Row Component
function TaskRow({
  task,
  viewMode,
  categories,
  contacts,
  getStatusColor,
  getStatusIcon,
  isOverdue,
  onStatusChange,
}) {
  const StatusIcon = getStatusIcon(task.status);
  const category = categories.find(c => c.code === task.categoryCode);
  const assignee = contacts.find(c => c.id === task.assignedTo);

  // Format due date
  const formatDueDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className={`
      flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-b-0
      hover:bg-gray-50 transition-colors
      ${isOverdue ? 'bg-orange-50/50' : ''}
    `}>
      {/* Status Toggle */}
      <button
        onClick={() => onStatusChange(
          task.id,
          task.status === 'completed' ? 'pending' : 'completed'
        )}
        className={`
          w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors
          ${task.status === 'completed'
            ? 'bg-emerald-500 text-white'
            : task.status === 'blocked'
              ? 'bg-red-100 text-red-500 border-2 border-red-300'
              : 'border-2 border-gray-300 hover:border-gray-400'
          }
        `}
      >
        {task.status === 'completed' && <CheckCircle2 className="w-4 h-4" />}
        {task.status === 'blocked' && <AlertTriangle className="w-3 h-3" />}
      </button>

      {/* Task Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`
            font-medium truncate
            ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-charcoal'}
          `}>
            {task.name}
          </span>

          {/* Show project name if not in project view */}
          {viewMode !== 'by-project' && task.project && (
            <Link
              to={`/projects/${task.projectId}`}
              className="text-xs text-blue-600 hover:underline flex-shrink-0"
            >
              {task.project.name}
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
          {/* Trade badge (if not in trade view) */}
          {viewMode !== 'by-trade' && category && (
            <span
              className="px-1.5 py-0.5 rounded text-xs font-medium"
              style={{
                backgroundColor: `${category.color}20`,
                color: category.color,
              }}
            >
              {category.name}
            </span>
          )}

          {/* Location */}
          {task.locationPath && (
            <span className="flex items-center gap-1 truncate">
              <MapPin className="w-3 h-3" />
              {task.locationPath.split('.').pop()}
            </span>
          )}

          {/* Assignee (if not in assignee view) */}
          {viewMode !== 'by-assignee' && assignee && (
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {assignee.name.split(' ')[0]}
            </span>
          )}
        </div>
      </div>

      {/* Due Date */}
      {task.dueDate && (
        <span className={`
          text-xs font-medium flex items-center gap-1 flex-shrink-0
          ${isOverdue
            ? 'text-orange-600'
            : task.status === 'completed'
              ? 'text-gray-400'
              : 'text-gray-500'
          }
        `}>
          <Calendar className="w-3 h-3" />
          {formatDueDate(task.dueDate)}
        </span>
      )}

      {/* Status Badge */}
      <span className={`
        px-2 py-0.5 rounded text-xs font-medium flex-shrink-0
        ${getStatusColor(task.status)}
      `}>
        {task.status === 'in_progress' ? 'Active' : task.status === 'pending' ? 'Todo' : task.status}
      </span>
    </div>
  );
}

export default LoopTracker;
