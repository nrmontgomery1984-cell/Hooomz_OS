import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  ListTodo,
  Users,
  Briefcase,
  Filter,
  Calendar,
  User,
  MapPin,
  Layers,
} from 'lucide-react';
import { PageContainer } from '../components/layout';
import { Button, Card, StatusDot, ProgressBar } from '../components/ui';
import { WeatherWidget } from '../components/dashboard';
import { QuickNotes } from '../components/notes';
import {
  getProjects,
  getWorkCategories,
  getStages,
  getContacts,
  getTaskInstances,
  updateTaskInstance,
} from '../services/api';

/**
 * Dashboard - Primary view combining Loop Tracker with drill-down navigation
 * Shows company-wide task overview with category → subcategory → task hierarchy
 */
export function Dashboard() {
  const navigate = useNavigate();

  // Data state
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stages, setStages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [viewMode, setViewMode] = useState('by-category'); // by-category, by-project, by-trade, by-team, by-status
  const [expandedGroups, setExpandedGroups] = useState({});
  const [expandedSubgroups, setExpandedSubgroups] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    projectId: null,
    categoryCode: null,
    status: null,
    assignedTo: null,
    dueWithin: null,
  });

  // Load all data
  useEffect(() => {
    async function loadData() {
      setLoading(true);

      try {
        const [projectsRes, categoriesRes, stagesRes, contactsRes] = await Promise.all([
          getProjects(),
          getWorkCategories(),
          getStages(),
          getContacts(),
        ]);

        // Filter for active/contracted projects
        const activeProjects = (projectsRes.data || []).filter(p => {
          return (
            p.status === 'active' ||
            p.status === 'contracted' ||
            p.status === 'in_progress' ||
            p.phase === 'active' ||
            p.phase === 'contracted' ||
            p.phase === 'in_progress' ||
            p.phase === 'production'
          );
        });

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

        // Auto-expand first category with active tasks
        const firstActive = tasks.find(t => t.status === 'in_progress' || t.status === 'blocked');
        if (firstActive) {
          setExpandedGroups({ [firstActive.categoryCode || 'unknown']: true });
        }

      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
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
      result = result.filter(t => t.assignedTo === filters.assignedTo);
    }
    if (filters.dueWithin) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      result = result.filter(t => {
        if (!t.dueDate) return filters.dueWithin === 'no-date';
        const due = new Date(t.dueDate);
        switch (filters.dueWithin) {
          case 'overdue':
            return due < today && t.status !== 'completed';
          case 'today':
            return due.toDateString() === today.toDateString();
          case 'week':
            const weekFromNow = new Date(today);
            weekFromNow.setDate(weekFromNow.getDate() + 7);
            return due >= today && due <= weekFromNow;
          default:
            return true;
        }
      });
    }

    return result;
  }, [allTasks, filters]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = filteredTasks.length;
    const completed = filteredTasks.filter(t => t.status === 'completed').length;
    const inProgress = filteredTasks.filter(t => t.status === 'in_progress').length;
    const pending = filteredTasks.filter(t => t.status === 'pending').length;
    const blocked = filteredTasks.filter(t => t.status === 'blocked').length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const overdue = filteredTasks.filter(t => {
      if (!t.dueDate || t.status === 'completed') return false;
      return new Date(t.dueDate) < today;
    }).length;
    const dueToday = filteredTasks.filter(t => {
      if (!t.dueDate || t.status === 'completed') return false;
      return new Date(t.dueDate).toDateString() === today.toDateString();
    }).length;

    return {
      total,
      completed,
      inProgress,
      pending,
      blocked,
      overdue,
      dueToday,
      completionPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [filteredTasks]);

  // Get group key based on view mode
  const getGroupKey = useCallback((task, mode) => {
    switch (mode) {
      case 'by-category':
      case 'by-trade':
        return task.categoryCode || 'uncategorized';
      case 'by-project':
        return task.projectId || 'unknown-project';
      case 'by-team':
        return task.assignedTo || 'unassigned';
      case 'by-status':
        return task.status || 'pending';
      default:
        return task.categoryCode || 'uncategorized';
    }
  }, []);

  // Group tasks based on current view mode
  const groupedTasks = useMemo(() => {
    const groups = {};

    filteredTasks.forEach(task => {
      const key = getGroupKey(task, viewMode);

      if (!groups[key]) {
        groups[key] = {
          key,
          tasks: [],
          subcategories: {},
          stats: { total: 0, completed: 0, inProgress: 0, blocked: 0 },
        };
      }

      const group = groups[key];
      group.tasks.push(task);
      group.stats.total++;
      if (task.status === 'completed') group.stats.completed++;
      if (task.status === 'in_progress') group.stats.inProgress++;
      if (task.status === 'blocked') group.stats.blocked++;

      // For category view, also group by subcategory
      if (viewMode === 'by-category') {
        const subcatId = task.subcategoryId || task.stageCode || 'general';
        if (!group.subcategories[subcatId]) {
          group.subcategories[subcatId] = {
            id: subcatId,
            name: task.subcategoryName || stages.find(s => s.code === subcatId)?.name || subcatId,
            tasks: [],
            stats: { total: 0, completed: 0, inProgress: 0, blocked: 0 },
          };
        }

        const subcat = group.subcategories[subcatId];
        subcat.tasks.push(task);
        subcat.stats.total++;
        if (task.status === 'completed') subcat.stats.completed++;
        if (task.status === 'in_progress') subcat.stats.inProgress++;
        if (task.status === 'blocked') subcat.stats.blocked++;
      }
    });

    // Add labels and metadata based on view mode
    Object.values(groups).forEach(group => {
      switch (viewMode) {
        case 'by-category':
        case 'by-trade': {
          const category = categories.find(c => c.code === group.key);
          group.code = group.key;
          group.name = category?.name || group.key;
          group.color = category?.color || '#6b7280';
          group.icon = Layers;
          break;
        }
        case 'by-project': {
          const project = projects.find(p => p.id === group.key);
          group.name = project?.name || 'Unknown Project';
          group.color = '#3b82f6';
          group.icon = Briefcase;
          group.meta = project;
          break;
        }
        case 'by-team': {
          if (group.key === 'unassigned') {
            group.name = 'Unassigned';
            group.color = '#6b7280';
          } else {
            const contact = contacts.find(c => c.id === group.key);
            group.name = contact?.name || 'Unknown';
            group.color = '#8b5cf6';
            group.meta = contact;
          }
          group.icon = User;
          break;
        }
        case 'by-status': {
          const statusLabels = {
            pending: 'Pending',
            in_progress: 'In Progress',
            blocked: 'Blocked',
            completed: 'Completed',
          };
          const statusColors = {
            pending: '#6b7280',
            in_progress: '#3b82f6',
            blocked: '#ef4444',
            completed: '#10b981',
          };
          group.name = statusLabels[group.key] || group.key;
          group.color = statusColors[group.key] || '#6b7280';
          group.icon = ListTodo;
          break;
        }
        default:
          group.name = group.key;
          group.color = '#6b7280';
          group.icon = ListTodo;
      }
    });

    // Sort groups
    return Object.values(groups).sort((a, b) => {
      // By status: blocked first, then in_progress, pending, completed
      if (viewMode === 'by-status') {
        const order = { blocked: 0, in_progress: 1, pending: 2, completed: 3 };
        return (order[a.key] ?? 4) - (order[b.key] ?? 4);
      }
      // Otherwise sort by active work (blocked/in-progress first)
      const aActive = a.stats.inProgress + a.stats.blocked;
      const bActive = b.stats.inProgress + b.stats.blocked;
      if (aActive !== bActive) return bActive - aActive;
      return a.name.localeCompare(b.name);
    });
  }, [filteredTasks, viewMode, categories, stages, projects, contacts, getGroupKey]);

  // Toggle category expansion
  const toggleCategory = (code) => {
    setExpandedGroups(prev => ({ ...prev, [code]: !prev[code] }));
  };

  // Toggle subcategory expansion
  const toggleSubcategory = (catCode, subcatId) => {
    const key = `${catCode}-${subcatId}`;
    setExpandedSubgroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Update task status
  const handleStatusChange = async (taskId, newStatus) => {
    await updateTaskInstance(taskId, { status: newStatus });
    setAllTasks(prev =>
      prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
    );
  };

  // Clear filters
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

  // Check if task is overdue
  const isOverdue = (task) => {
    if (task.status === 'completed' || !task.dueDate) return false;
    return new Date(task.dueDate) < new Date();
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'gray';
      case 'in_progress': return 'blue';
      case 'blocked': return 'red';
      case 'completed': return 'green';
      default: return 'gray';
    }
  };

  // Loading state
  if (loading) {
    return (
      <PageContainer title="Dashboard">
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-gray-100 rounded-lg h-20 animate-pulse" />
            ))}
          </div>
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-100 rounded-lg h-24 animate-pulse" />
          ))}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Dashboard"
      subtitle={`${stats.total} tasks across ${projects.length} active projects`}
    >
      {/* Stats Row - Clickable to filter */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        <StatCard
          label="Total"
          value={stats.total}
          color="gray"
          onClick={clearAllFilters}
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

      {/* View Mode Selector & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {/* View Mode Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg overflow-x-auto">
          {[
            { value: 'by-category', label: 'Category', icon: Layers },
            { value: 'by-project', label: 'Project', icon: Briefcase },
            { value: 'by-team', label: 'Team', icon: Users },
            { value: 'by-status', label: 'Status', icon: ListTodo },
          ].map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setViewMode(value)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap
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

        {/* Filters */}
        <div className="flex items-center gap-2 sm:ml-auto">
          <Button
            variant={showFilters || hasActiveFilters ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-1" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-white/20 rounded-full">
                {Object.values(filters).filter(v => v !== null).length}
              </span>
            )}
          </Button>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <Card className="p-4 mb-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
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

            {/* Trade/Category Filter */}
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
                <option value="">All Team</option>
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

      {/* Main Content Grid - Tasks + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Groups - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-3">
          {groupedTasks.length > 0 ? (
            groupedTasks.map(group => (
              <TaskGroup
                key={group.key}
                group={group}
                viewMode={viewMode}
                isExpanded={expandedGroups[group.key]}
                onToggle={() => toggleCategory(group.key)}
                expandedSubgroups={expandedSubgroups}
                onToggleSubcategory={(subcatId) => toggleSubcategory(group.key, subcatId)}
                onTaskClick={(task) => navigate(`/projects/${task.projectId}`)}
                onStatusChange={handleStatusChange}
                contacts={contacts}
                categories={categories}
                isOverdue={isOverdue}
                getStatusColor={getStatusColor}
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

        {/* Sidebar - Weather & Notes */}
        <div className="space-y-6">
          {/* Weather Widget */}
          <WeatherWidget compact />

          {/* Quick Notes */}
          <QuickNotes compact />
        </div>
      </div>
    </PageContainer>
  );
}

// Stat Card Component
function StatCard({ label, value, color, highlight, onClick, active }) {
  const colorClasses = {
    gray: 'bg-gray-50 text-gray-700 hover:bg-gray-100',
    blue: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
    red: highlight ? 'bg-red-100 text-red-700 ring-2 ring-red-200' : 'bg-red-50 text-red-700 hover:bg-red-100',
    orange: highlight ? 'bg-orange-100 text-orange-700 ring-2 ring-orange-200' : 'bg-orange-50 text-orange-700 hover:bg-orange-100',
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

// Task Group Component - handles all view modes
function TaskGroup({
  group,
  viewMode,
  isExpanded,
  onToggle,
  expandedSubgroups,
  onToggleSubcategory,
  onTaskClick,
  onStatusChange,
  contacts,
  categories,
  isOverdue,
}) {
  const { name, color, stats, subcategories, tasks, icon: GroupIcon } = group;

  // For category view, use subcategories; otherwise show tasks directly
  const hasSubcategories = viewMode === 'by-category' && Object.keys(subcategories || {}).length > 0;
  const subcatList = hasSubcategories
    ? Object.values(subcategories).sort((a, b) => {
        const aActive = a.stats.inProgress + a.stats.blocked;
        const bActive = b.stats.inProgress + b.stats.blocked;
        if (aActive !== bActive) return bActive - aActive;
        return a.name.localeCompare(b.name);
      })
    : [];

  const progressPercent = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  // Determine status color
  let statusColor = 'gray';
  if (stats.blocked > 0) statusColor = 'red';
  else if (stats.inProgress > 0) statusColor = 'yellow';
  else if (stats.completed === stats.total && stats.total > 0) statusColor = 'green';

  // Status-based card styling
  const cardStyles = {
    gray: 'border-gray-200 bg-gray-50/30',
    red: 'border-red-300 bg-red-50/40',
    yellow: 'border-amber-300 bg-amber-50/40',
    green: 'border-emerald-300 bg-emerald-50/40',
  };

  return (
    <Card className={`overflow-hidden border-2 ${cardStyles[statusColor]}`}>
      {/* Group Header */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/50 transition-colors"
      >
        {/* Expand Icon */}
        <div className="text-gray-400">
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </div>

        {/* Group Icon/Color */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {GroupIcon && <GroupIcon className="w-4 h-4" />}
        </div>

        {/* Group Name & Progress */}
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-charcoal truncate">{name}</span>
            <StatusDot status={statusColor} size="sm" />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <ProgressBar
              value={progressPercent}
              color={statusColor === 'green' ? 'green' : statusColor === 'red' ? 'red' : 'green'}
              height="thin"
              className="flex-1 max-w-24"
            />
            <span className="text-xs text-gray-400">
              {stats.completed}/{stats.total}
            </span>
          </div>
        </div>

        {/* Stats badges */}
        <div className="flex gap-2 text-xs">
          {stats.inProgress > 0 && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
              {stats.inProgress} active
            </span>
          )}
          {stats.blocked > 0 && (
            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
              {stats.blocked} blocked
            </span>
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-100">
          {hasSubcategories ? (
            // Category view with subcategories
            subcatList.map(subcat => (
              <SubcategorySection
                key={subcat.id}
                subcat={subcat}
                categoryColor={color}
                categoryCode={group.code}
                isExpanded={expandedSubgroups[`${group.key}-${subcat.id}`]}
                onToggle={() => onToggleSubcategory(subcat.id)}
                onTaskClick={onTaskClick}
                onStatusChange={onStatusChange}
                contacts={contacts}
                categories={categories}
                viewMode={viewMode}
                isOverdue={isOverdue}
              />
            ))
          ) : (
            // Other views - show tasks directly
            <div className="divide-y divide-gray-100">
              {tasks.map(task => (
                <TaskRow
                  key={task.id}
                  task={task}
                  viewMode={viewMode}
                  onClick={() => onTaskClick(task)}
                  onStatusChange={onStatusChange}
                  contacts={contacts}
                  categories={categories}
                  isOverdue={isOverdue(task)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

// Subcategory Section
function SubcategorySection({
  subcat,
  categoryColor,
  isExpanded,
  onToggle,
  onTaskClick,
  onStatusChange,
  contacts,
  categories,
  viewMode,
  isOverdue,
}) {
  const { name, tasks, stats } = subcat;

  // Determine status
  let statusColor = 'gray';
  if (stats.blocked > 0) statusColor = 'red';
  else if (stats.inProgress > 0) statusColor = 'yellow';
  else if (stats.completed === stats.total && stats.total > 0) statusColor = 'green';

  return (
    <div className="border-b border-gray-100 last:border-0">
      {/* Subcategory Header */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-2 bg-gray-50 flex items-center gap-2 hover:bg-gray-100 transition-colors"
      >
        <div className="text-gray-400">
          {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </div>
        <div
          className="w-0.5 h-4 rounded-full"
          style={{ backgroundColor: categoryColor }}
        />
        <span className="text-xs font-medium text-gray-600 flex-1 text-left">{name}</span>
        <StatusDot status={statusColor} size="xs" />
        <span className="text-xs text-gray-400">
          {stats.completed}/{stats.total}
        </span>
      </button>

      {/* Tasks */}
      {isExpanded && (
        <div className="divide-y divide-gray-100">
          {tasks.map(task => (
            <TaskRow
              key={task.id}
              task={task}
              viewMode={viewMode}
              onClick={() => onTaskClick(task)}
              onStatusChange={onStatusChange}
              contacts={contacts}
              categories={categories}
              isOverdue={isOverdue(task)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Task Row Component - shows contextual info based on view mode
function TaskRow({ task, viewMode, onClick, onStatusChange, contacts, categories, isOverdue }) {
  const contact = contacts.find(c => c.id === task.assignedTo);
  const category = categories.find(c => c.code === task.categoryCode);

  const statusColors = {
    pending: 'text-gray-500 bg-gray-100',
    in_progress: 'text-blue-600 bg-blue-100',
    blocked: 'text-red-600 bg-red-100',
    completed: 'text-emerald-600 bg-emerald-100',
  };

  return (
    <div
      onClick={onClick}
      className={`
        px-4 py-3 flex items-center gap-3 hover:bg-gray-50 cursor-pointer transition-colors
        ${isOverdue ? 'bg-orange-50/50' : ''}
      `}
    >
      {/* Status toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
          onStatusChange(task.id, nextStatus);
        }}
        className={`
          w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
          ${task.status === 'completed'
            ? 'border-emerald-500 bg-emerald-500 text-white'
            : task.status === 'blocked'
              ? 'border-red-300 bg-red-100'
              : 'border-gray-300 hover:border-emerald-400'
          }
        `}
      >
        {task.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
        {task.status === 'blocked' && <AlertTriangle className="w-3 h-3 text-red-500" />}
      </button>

      {/* Task info */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-charcoal'}`}>
          {task.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {/* Show project name if not in project view */}
          {viewMode !== 'by-project' && task.project && (
            <span className="text-xs text-blue-600">
              {task.project.name}
            </span>
          )}
          {/* Show category if not in category/trade view */}
          {viewMode !== 'by-category' && viewMode !== 'by-trade' && category && (
            <span
              className="px-1.5 py-0.5 text-xs rounded"
              style={{ backgroundColor: `${category.color}20`, color: category.color }}
            >
              {category.name}
            </span>
          )}
          {/* Show location */}
          {task.locationPath && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {task.locationPath.split('.').pop()}
            </span>
          )}
        </div>
      </div>

      {/* Assignee (hide in team view) */}
      {viewMode !== 'by-team' && contact && (
        <span className="text-xs text-gray-500 hidden sm:block">
          {contact.name.split(' ')[0]}
        </span>
      )}

      {/* Due date */}
      {task.dueDate && (
        <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-orange-600 font-medium' : 'text-gray-400'}`}>
          <Calendar className="w-3 h-3" />
          {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      )}

      {/* Status badge (hide in status view) */}
      {viewMode !== 'by-status' && (
        <span className={`
          px-2 py-0.5 text-xs rounded-full
          ${statusColors[task.status] || statusColors.pending}
        `}>
          {task.status === 'in_progress' ? 'Active' : task.status === 'pending' ? 'Todo' : task.status}
        </span>
      )}
    </div>
  );
}
