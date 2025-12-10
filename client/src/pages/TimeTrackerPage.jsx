import { useState, useEffect, useMemo } from 'react';
import {
  Play,
  Square,
  Clock,
  ChevronRight,
  ChevronDown,
  Calendar,
  User,
  Building2,
  CheckCircle2,
  X,
  Plus,
  History,
} from 'lucide-react';
import { PageContainer } from '../components/layout';
import { Card, Button } from '../components/ui';
import {
  getProjects,
  getWorkCategories,
  getWorkSubcategories,
  getTaskInstances,
  getContacts,
  getActiveTimeEntry,
  getTimeEntries,
  clockIn,
  clockOut,
} from '../services/api';

/**
 * TimeTrackerPage - Clock in/out for workers
 *
 * Features:
 * - Active timer display when clocked in
 * - Project → Category → Task drill-down for clock in
 * - Recent time entries history
 * - Only shows tasks in scope for selected project
 */
export function TimeTrackerPage() {
  // Data state
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active timer state
  const [activeEntry, setActiveEntry] = useState(null);
  const [elapsed, setElapsed] = useState(0);

  // Time entries history
  const [timeEntries, setTimeEntries] = useState([]);

  // Clock-in selection state
  const [showClockIn, setShowClockIn] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [projectTasks, setProjectTasks] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedSubcategories, setExpandedSubcategories] = useState({});

  // Current user (would come from auth in production)
  const [currentUser] = useState({ id: 'c1', name: 'Joe Martinez' });

  // Clock out modal state
  const [showClockOutModal, setShowClockOutModal] = useState(false);
  const [clockOutNotes, setClockOutNotes] = useState('');
  const [markComplete, setMarkComplete] = useState(false);

  // Load initial data
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [projectsRes, categoriesRes, subcatsRes, contactsRes, activeRes, entriesRes] = await Promise.all([
          getProjects(),
          getWorkCategories(),
          getWorkSubcategories(),
          getContacts(),
          getActiveTimeEntry(),
          getTimeEntries({ userId: currentUser.id }),
        ]);

        // Filter for active/contracted projects only
        const activeProjects = (projectsRes.data || []).filter(p =>
          p.status === 'active' ||
          p.status === 'contracted' ||
          p.status === 'in_progress' ||
          p.phase === 'active' ||
          p.phase === 'contracted' ||
          p.phase === 'in_progress' ||
          p.phase === 'production'
        );

        setProjects(activeProjects);
        setCategories(categoriesRes.data || []);
        setSubcategories(subcatsRes.data || []);
        setContacts(contactsRes.data || []);
        setActiveEntry(activeRes.data);
        setTimeEntries(entriesRes.data || []);
      } catch (err) {
        console.error('TimeTracker load error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [currentUser.id]);

  // Update elapsed time when there's an active entry
  useEffect(() => {
    if (!activeEntry?.startTime) return;

    const startTime = new Date(activeEntry.startTime).getTime();

    const updateElapsed = () => {
      const now = Date.now();
      setElapsed(Math.floor((now - startTime) / 1000));
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [activeEntry?.startTime]);

  // Load tasks when project is selected
  useEffect(() => {
    async function loadProjectTasks() {
      if (!selectedProject) {
        setProjectTasks([]);
        return;
      }

      console.log('Loading tasks for project:', selectedProject.id);
      const { data } = await getTaskInstances(selectedProject.id);
      console.log('Raw tasks returned:', data);

      // Only show incomplete tasks
      const incompleteTasks = (data || []).filter(t =>
        t.status !== 'completed' && t.status !== 'cancelled'
      );
      console.log('Filtered incomplete tasks:', incompleteTasks);
      setProjectTasks(incompleteTasks);

      // Auto-expand categories with tasks
      const catsWithTasks = {};
      incompleteTasks.forEach(t => {
        if (t.categoryCode) catsWithTasks[t.categoryCode] = true;
      });
      setExpandedCategories(catsWithTasks);
    }

    loadProjectTasks();
  }, [selectedProject]);

  // Group tasks by category and subcategory
  const groupedTasks = useMemo(() => {
    const groups = {};

    projectTasks.forEach(task => {
      const catCode = task.categoryCode || 'other';
      if (!groups[catCode]) {
        const category = categories.find(c => c.code === catCode);
        groups[catCode] = {
          code: catCode,
          name: category?.name || catCode,
          color: category?.color || '#6b7280',
          subcategories: {},
          tasks: [],
        };
      }

      // Group by subcategory within category
      const subcatCode = task.subcategoryCode || 'general';
      if (!groups[catCode].subcategories[subcatCode]) {
        const subcat = subcategories.find(s => s.code === subcatCode);
        groups[catCode].subcategories[subcatCode] = {
          code: subcatCode,
          name: subcat?.name || subcatCode,
          tasks: [],
        };
      }

      groups[catCode].subcategories[subcatCode].tasks.push(task);
      groups[catCode].tasks.push(task);
    });

    // Sort by category order
    return Object.values(groups).sort((a, b) => {
      const catA = categories.find(c => c.code === a.code);
      const catB = categories.find(c => c.code === b.code);
      return (catA?.displayOrder || 99) - (catB?.displayOrder || 99);
    });
  }, [projectTasks, categories, subcategories]);

  // Format elapsed time
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format duration in minutes to readable string
  const formatDuration = (minutes) => {
    if (!minutes) return '0m';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs === 0) return `${mins}m`;
    if (mins === 0) return `${hrs}h`;
    return `${hrs}h ${mins}m`;
  };

  // Handle clock in
  const handleClockIn = async (task, e) => {
    // Prevent event propagation (clicking task shouldn't toggle category)
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    console.log('handleClockIn called with task:', task);

    const { data, error } = await clockIn({
      taskId: task.id,
      taskName: task.name,
      projectId: selectedProject.id,
      projectName: selectedProject.name,
      categoryCode: task.categoryCode,
      subcategoryCode: task.subcategoryCode,
      userId: currentUser.id,
      userName: currentUser.name,
      estimatedMinutes: (task.estimatedHours || 1) * 60,
    });

    console.log('clockIn result:', { data, error });

    if (!error && data) {
      setActiveEntry(data);
      setShowClockIn(false);
      setSelectedProject(null);
      setSelectedCategory(null);
      setSelectedSubcategory(null);
    }
  };

  // Handle clock out
  const handleClockOut = async () => {
    if (!activeEntry) return;

    const { data, error } = await clockOut(activeEntry.id, {
      notes: clockOutNotes,
      markTaskComplete: markComplete,
    });

    if (!error && data) {
      setTimeEntries(prev => [data, ...prev]);
      setActiveEntry(null);
      setShowClockOutModal(false);
      setClockOutNotes('');
      setMarkComplete(false);
    }
  };

  // Toggle category expansion
  const toggleCategory = (code) => {
    setExpandedCategories(prev => ({ ...prev, [code]: !prev[code] }));
  };

  // Toggle subcategory expansion
  const toggleSubcategory = (catCode, subcatCode) => {
    const key = `${catCode}-${subcatCode}`;
    setExpandedSubcategories(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Calculate progress percentage
  const getProgressPercent = () => {
    if (!activeEntry?.estimatedMinutes) return 0;
    const elapsedMinutes = elapsed / 60;
    return Math.min(100, Math.round((elapsedMinutes / activeEntry.estimatedMinutes) * 100));
  };

  // Get progress color
  const getProgressColor = (percent) => {
    if (percent >= 90) return 'text-red-500';
    if (percent >= 75) return 'text-amber-500';
    return 'text-emerald-500';
  };

  if (loading) {
    return (
      <PageContainer title="Time Tracker">
        <div className="space-y-4">
          <div className="bg-gray-100 rounded-lg h-48 animate-pulse" />
          <div className="bg-gray-100 rounded-lg h-32 animate-pulse" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Time Tracker"
      subtitle={activeEntry ? 'Currently clocked in' : 'Ready to clock in'}
    >
      {/* Active Timer */}
      {activeEntry ? (
        <Card className="p-6 mb-6 border-2 border-emerald-300 bg-emerald-50/30">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Timer Circle */}
            <div className="relative">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  stroke="#e5e7eb"
                  fill="none"
                  strokeWidth="8"
                  r="54"
                  cx="64"
                  cy="64"
                />
                <circle
                  stroke={getProgressPercent() >= 90 ? '#ef4444' : getProgressPercent() >= 75 ? '#f59e0b' : '#10b981'}
                  fill="none"
                  strokeWidth="8"
                  r="54"
                  cx="64"
                  cy="64"
                  strokeDasharray={2 * Math.PI * 54}
                  strokeDashoffset={2 * Math.PI * 54 * (1 - getProgressPercent() / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-2xl font-bold ${getProgressColor(getProgressPercent())}`}>
                  {getProgressPercent()}%
                </span>
                <span className="text-sm text-gray-500">{formatTime(elapsed)}</span>
              </div>
            </div>

            {/* Task Info */}
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg font-semibold text-charcoal">{activeEntry.taskName}</h3>
              <p className="text-sm text-gray-500">{activeEntry.projectName}</p>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 text-xs text-gray-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Est: {formatDuration(activeEntry.estimatedMinutes)}</span>
              </div>
            </div>

            {/* Clock Out Button */}
            <Button
              variant="primary"
              className="bg-red-500 hover:bg-red-600"
              onClick={() => setShowClockOutModal(true)}
            >
              <Square className="w-4 h-4 mr-2" />
              Clock Out
            </Button>
          </div>
        </Card>
      ) : (
        /* Clock In Button */
        <Card className="p-6 mb-6 text-center">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">You're not currently clocked in</p>
          <Button onClick={() => setShowClockIn(true)}>
            <Play className="w-4 h-4 mr-2" />
            Clock In
          </Button>
        </Card>
      )}

      {/* Clock In Modal - Task Selection */}
      {showClockIn && (
        <Card className="p-4 mb-6 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-charcoal">Select Task to Clock In</h3>
            <button onClick={() => {
              setShowClockIn(false);
              setSelectedProject(null);
            }}>
              <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            </button>
          </div>

          {/* Step 1: Project Selection */}
          {!selectedProject ? (
            <div>
              <p className="text-sm text-gray-500 mb-3">1. Select a project:</p>
              <div className="space-y-2">
                {projects.map(project => (
                  <button
                    type="button"
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-left cursor-pointer"
                  >
                    <Building2 className="w-5 h-5 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-charcoal truncate">{project.name}</p>
                      <p className="text-xs text-gray-400 truncate">{project.address}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                ))}
                {projects.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">
                    No active projects available
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* Step 2: Category/Task Selection */
            <div>
              <button
                onClick={() => setSelectedProject(null)}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mb-3"
              >
                <ChevronRight className="w-3 h-3 rotate-180" />
                Back to projects
              </button>

              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg mb-4">
                <Building2 className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-charcoal">{selectedProject.name}</span>
              </div>

              <p className="text-sm text-gray-500 mb-3">2. Select a task:</p>

              {groupedTasks.length > 0 ? (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {groupedTasks.map(category => (
                    <div key={category.code} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* Category Header */}
                      <button
                        type="button"
                        onClick={() => toggleCategory(category.code)}
                        className="w-full flex items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        {expandedCategories[category.code] ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-medium text-sm text-charcoal">{category.name}</span>
                        <span className="text-xs text-gray-400 ml-auto">
                          {category.tasks.length} tasks
                        </span>
                      </button>

                      {/* Category Tasks */}
                      {expandedCategories[category.code] && (
                        <div className="border-t border-gray-100">
                          {/* Show tasks directly if only one subcategory */}
                          {Object.keys(category.subcategories).length === 1 ? (
                            <div className="divide-y divide-gray-100">
                              {category.tasks.map(task => (
                                <button
                                  type="button"
                                  key={task.id}
                                  onClick={(e) => handleClockIn(task, e)}
                                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left cursor-pointer"
                                >
                                  <Play className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-charcoal truncate">{task.name}</p>
                                    {task.locationPath && (
                                      <p className="text-xs text-gray-400 truncate">
                                        {task.locationPath.split('.').pop()}
                                      </p>
                                    )}
                                  </div>
                                  {task.estimatedHours && (
                                    <span className="text-xs text-gray-400 flex-shrink-0">
                                      ~{task.estimatedHours}h
                                    </span>
                                  )}
                                </button>
                              ))}
                            </div>
                          ) : (
                            /* Show subcategory headers when multiple subcategories */
                            Object.values(category.subcategories).map(subcat => {
                              const subcatKey = `${category.code}-${subcat.code}`;
                              const isSubcatExpanded = expandedSubcategories[subcatKey] !== false;

                              return (
                                <div key={subcat.code}>
                                  {/* Subcategory Header */}
                                  <button
                                    type="button"
                                    onClick={() => toggleSubcategory(category.code, subcat.code)}
                                    className="w-full flex items-center gap-2 px-4 py-2 bg-gray-50/50 hover:bg-gray-100/50 text-left"
                                  >
                                    {isSubcatExpanded ? (
                                      <ChevronDown className="w-3 h-3 text-gray-400" />
                                    ) : (
                                      <ChevronRight className="w-3 h-3 text-gray-400" />
                                    )}
                                    <span className="text-xs text-gray-500">{subcat.name}</span>
                                    <span className="text-xs text-gray-300 ml-auto">{subcat.tasks.length}</span>
                                  </button>

                                  {/* Tasks */}
                                  {isSubcatExpanded && (
                                    <div className="divide-y divide-gray-100">
                                      {subcat.tasks.map(task => (
                                        <button
                                          type="button"
                                          key={task.id}
                                          onClick={(e) => handleClockIn(task, e)}
                                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left cursor-pointer"
                                        >
                                          <Play className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                          <div className="flex-1 min-w-0">
                                            <p className="text-sm text-charcoal truncate">{task.name}</p>
                                            {task.locationPath && (
                                              <p className="text-xs text-gray-400 truncate">
                                                {task.locationPath.split('.').pop()}
                                              </p>
                                            )}
                                          </div>
                                          {task.estimatedHours && (
                                            <span className="text-xs text-gray-400 flex-shrink-0">
                                              ~{task.estimatedHours}h
                                            </span>
                                          )}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-8">
                  No tasks available for this project
                </p>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Clock Out Modal */}
      {showClockOutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-charcoal mb-4">Clock Out</h3>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="font-medium text-charcoal">{activeEntry?.taskName}</p>
              <p className="text-sm text-gray-500">{activeEntry?.projectName}</p>
              <p className="text-sm text-emerald-600 mt-1">
                Time worked: {formatTime(elapsed)}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <textarea
                value={clockOutNotes}
                onChange={(e) => setClockOutNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={3}
                placeholder="What did you work on?"
              />
            </div>

            <label className="flex items-center gap-2 mb-6">
              <input
                type="checkbox"
                checked={markComplete}
                onChange={(e) => setMarkComplete(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-emerald-600"
              />
              <span className="text-sm text-gray-700">Mark task as complete</span>
            </label>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowClockOutModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-500 hover:bg-red-600"
                onClick={handleClockOut}
              >
                <Square className="w-4 h-4 mr-2" />
                Clock Out
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Recent Time Entries */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-charcoal flex items-center gap-2">
          <History className="w-5 h-5 text-gray-400" />
          Recent Time Entries
        </h2>
      </div>

      {timeEntries.length > 0 ? (
        <div className="space-y-2">
          {timeEntries.slice(0, 10).map(entry => (
            <Card key={entry.id} className="p-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-2 h-10 rounded-full"
                  style={{
                    backgroundColor: categories.find(c => c.code === entry.categoryCode)?.color || '#6b7280',
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-charcoal truncate">{entry.taskName}</p>
                  <p className="text-xs text-gray-400 truncate">{entry.projectName}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm text-charcoal">
                    {formatDuration(entry.durationMinutes)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(entry.startTime).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              {entry.notes && (
                <p className="text-xs text-gray-500 mt-2 pl-5 border-l-2 border-gray-200 ml-1">
                  {entry.notes}
                </p>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No time entries yet</p>
          <p className="text-sm text-gray-400">Your time entries will appear here</p>
        </Card>
      )}
    </PageContainer>
  );
}

export default TimeTrackerPage;
