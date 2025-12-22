import { useState, useEffect, useMemo } from 'react';
import {
  Play,
  Square,
  Clock,
  ChevronRight,
  ChevronDown,
  Building2,
  X,
  Plus,
  History,
  PenLine,
  User,
  Filter,
  Calendar,
} from 'lucide-react';
import { PageContainer } from '../components/layout';
import { Card, Button } from '../components/ui';
import { ROLES } from '../lib/devData';

// Team members data - shared with Team.jsx (includes hourly rates for labor cost calculation)
const TEAM_MEMBERS = [
  { id: 'emp-001', firstName: 'Nathan', lastName: 'Henderson', preferredName: '', role: 'administrator', hourlyRate: 75 },
  { id: 'emp-002', firstName: 'Lisa', lastName: 'Chen', preferredName: '', role: 'manager', hourlyRate: 55 },
  { id: 'emp-003', firstName: 'Mike', lastName: 'Sullivan', preferredName: '', role: 'foreman', hourlyRate: 48 },
  { id: 'emp-004', firstName: 'Joe', lastName: 'Martinez', preferredName: '', role: 'carpenter', hourlyRate: 42 },
  { id: 'emp-005', firstName: 'Tyler', lastName: 'Brooks', preferredName: 'Ty', role: 'apprentice', hourlyRate: 28 },
  { id: 'emp-006', firstName: 'Sam', lastName: 'Wilson', preferredName: '', role: 'labourer', hourlyRate: 24 },
];
import {
  getProjects,
  getWorkCategories,
  getWorkSubcategories,
  getTaskInstances,
  getActiveTimeEntry,
  getTimeEntries,
  clockIn,
  clockOut,
} from '../services/api';

/**
 * TimeTrackerPage - Simple time tracking
 *
 * Features:
 * - Clock in/out with live timer
 * - Manual time entry
 * - Recent entries history
 * - Filtering by date range, team member, project
 * - Pay period configuration with recurring schedule
 *
 * TODO: Reporting Module
 * - Time reports by project, team member, pay period
 * - Expense reports (labor + materials) vs budget
 * - Overhead tracking and allocation
 * - Progress measurement (% complete vs time/cost spent)
 * - Export to CSV/PDF for payroll and accounting
 * - Dashboard widgets for key metrics
 */
export function TimeTrackerPage() {
  // Data state
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active timer state
  const [activeEntry, setActiveEntry] = useState(null);
  const [elapsed, setElapsed] = useState(0);

  // Time entries history
  const [timeEntries, setTimeEntries] = useState([]);

  // Clock-in selection state
  const [showClockIn, setShowClockIn] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectTasks, setProjectTasks] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedSubcategories, setExpandedSubcategories] = useState({});

  // Current user (would come from auth in production)
  // Using emp-004 (Joe Martinez) as the default current user to match team data
  const [currentUser] = useState({ id: 'emp-004', name: 'Joe Martinez' });

  // Clock out modal state
  const [showClockOutModal, setShowClockOutModal] = useState(false);
  const [clockOutNotes, setClockOutNotes] = useState('');
  const [markComplete, setMarkComplete] = useState(false);

  // Manual entry modal state
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualEntry, setManualEntry] = useState({
    userId: '',
    projectId: '',
    categoryCode: '',
    subcategoryCode: '',
    taskDescription: '',
    date: new Date().toISOString().split('T')[0],
    hours: '',
    minutes: '',
    notes: '',
  });

  // Filter state for time entries
  const [filters, setFilters] = useState({
    dateRange: 'all', // today, week, month, custom, all
    teamMember: '', // userId or empty for all
    project: '', // projectId or empty for all
    customStart: '', // custom date range start
    customEnd: '', // custom date range end
  });
  const [showFilters, setShowFilters] = useState(false);

  // Pay period settings
  const [payPeriod, setPayPeriod] = useState(() => {
    const saved = localStorage.getItem('hooomz_pay_period');
    return saved ? JSON.parse(saved) : null;
  });
  const [showPayPeriodSetup, setShowPayPeriodSetup] = useState(false);
  const [showPayPeriodDeleteConfirm, setShowPayPeriodDeleteConfirm] = useState(false);

  // Load initial data
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [projectsRes, categoriesRes, subcatsRes, activeRes, entriesRes] = await Promise.all([
          getProjects(),
          getWorkCategories(),
          getWorkSubcategories(),
          getActiveTimeEntry(),
          getTimeEntries({}), // Show all team entries, not filtered by user
        ]);

        // Get all projects for manual entry, filter active ones for clock-in
        setProjects(projectsRes.data || []);
        setCategories(categoriesRes.data || []);
        setSubcategories(subcatsRes.data || []);
        setActiveEntry(activeRes.data);
        setTimeEntries(entriesRes.data || []);
      } catch (err) {
        console.error('Time load error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [currentUser.id]);

  // Filter active projects for clock-in
  const activeProjects = useMemo(() => {
    return projects.filter(p =>
      p.status === 'active' ||
      p.status === 'contracted' ||
      p.status === 'in_progress' ||
      p.phase === 'active' ||
      p.phase === 'contracted' ||
      p.phase === 'in_progress' ||
      p.phase === 'production'
    );
  }, [projects]);

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

  // Calculate current pay period based on saved settings
  const currentPayPeriodRange = useMemo(() => {
    if (!payPeriod) return null;

    const { startDate, lengthDays } = payPeriod;
    const periodStart = new Date(startDate);
    periodStart.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate how many complete periods have passed
    const daysSinceStart = Math.floor((today - periodStart) / (1000 * 60 * 60 * 24));
    const completePeriods = Math.floor(daysSinceStart / lengthDays);

    // Current period start and end
    const currentStart = new Date(periodStart);
    currentStart.setDate(currentStart.getDate() + (completePeriods * lengthDays));

    const currentEnd = new Date(currentStart);
    currentEnd.setDate(currentEnd.getDate() + lengthDays - 1);

    return {
      start: currentStart,
      end: currentEnd,
      periodNumber: completePeriods + 1,
    };
  }, [payPeriod]);

  // Filter time entries based on current filters
  const filteredEntries = useMemo(() => {
    let entries = [...timeEntries];

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let startDate = null;
      let endDate = null;

      switch (filters.dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
          break;
        case 'week':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'pay_period':
          if (currentPayPeriodRange) {
            startDate = currentPayPeriodRange.start;
            endDate = new Date(currentPayPeriodRange.end);
            endDate.setHours(23, 59, 59, 999);
          }
          break;
        case 'custom':
          if (filters.customStart) {
            startDate = new Date(filters.customStart);
            startDate.setHours(0, 0, 0, 0);
          }
          if (filters.customEnd) {
            endDate = new Date(filters.customEnd);
            endDate.setHours(23, 59, 59, 999);
          }
          break;
        default:
          break;
      }

      if (startDate) {
        entries = entries.filter(e => new Date(e.startTime) >= startDate);
      }
      if (endDate) {
        entries = entries.filter(e => new Date(e.startTime) <= endDate);
      }
    }

    // Team member filter
    if (filters.teamMember) {
      entries = entries.filter(e => e.userId === filters.teamMember);
    }

    // Project filter
    if (filters.project) {
      entries = entries.filter(e => e.projectId === filters.project);
    }

    return entries;
  }, [timeEntries, filters, currentPayPeriodRange]);

  // Get unique projects from time entries for filter dropdown
  const projectsInEntries = useMemo(() => {
    const projectMap = new Map();
    timeEntries.forEach(e => {
      if (e.projectId && e.projectName) {
        projectMap.set(e.projectId, e.projectName);
      }
    });
    return Array.from(projectMap, ([id, name]) => ({ id, name }));
  }, [timeEntries]);

  // Get unique team members from time entries for filter dropdown
  const teamMembersInEntries = useMemo(() => {
    const memberMap = new Map();
    timeEntries.forEach(e => {
      if (e.userId && e.userName) {
        memberMap.set(e.userId, e.userName);
      }
    });
    return Array.from(memberMap, ([id, name]) => ({ id, name }));
  }, [timeEntries]);

  // Check if any filters are active
  const hasActiveFilters = filters.dateRange !== 'all' || filters.teamMember || filters.project;

  // Clear all filters
  const clearFilters = () => {
    setFilters({ dateRange: 'all', teamMember: '', project: '', customStart: '', customEnd: '' });
  };

  // Save pay period to localStorage
  const savePayPeriod = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const lengthDays = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    const period = {
      startDate: start,
      lengthDays,
      dayOfWeek: startDate.getDay(),
    };

    localStorage.setItem('hooomz_pay_period', JSON.stringify(period));
    setPayPeriod(period);
    setShowPayPeriodSetup(false);

    // Automatically set filter to pay period
    setFilters(prev => ({ ...prev, dateRange: 'pay_period' }));
  };

  // Clear pay period
  const clearPayPeriod = () => {
    localStorage.removeItem('hooomz_pay_period');
    setPayPeriod(null);
    if (filters.dateRange === 'pay_period') {
      setFilters(prev => ({ ...prev, dateRange: 'all' }));
    }
  };

  // Format date for display
  const formatDateShort = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

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
      <PageContainer title="Time">
        <div className="space-y-4">
          <div className="bg-gray-100 rounded-lg h-48 animate-pulse" />
          <div className="bg-gray-100 rounded-lg h-32 animate-pulse" />
        </div>
      </PageContainer>
    );
  }

  // Get filtered subcategories based on selected category
  const filteredSubcategories = manualEntry.categoryCode
    ? subcategories.filter(s => s.categoryCode === manualEntry.categoryCode)
    : [];

  // Handle manual entry save
  const handleManualEntrySave = () => {
    const totalMinutes = (parseInt(manualEntry.hours) || 0) * 60 + (parseInt(manualEntry.minutes) || 0);
    if (!manualEntry.projectId || !manualEntry.categoryCode || totalMinutes === 0 || !manualEntry.userId) return;

    const isShop = manualEntry.projectId === 'shop';
    const project = isShop ? null : projects.find(p => p.id === manualEntry.projectId);
    const selectedMember = TEAM_MEMBERS.find(m => m.id === manualEntry.userId);
    const memberName = selectedMember
      ? `${selectedMember.preferredName || selectedMember.firstName} ${selectedMember.lastName}`
      : currentUser.name;
    const hourlyRate = selectedMember?.hourlyRate || 40; // Default rate if not found

    // Build task name from category/subcategory/task
    const category = categories.find(c => c.code === manualEntry.categoryCode);
    const subcat = subcategories.find(s => s.code === manualEntry.subcategoryCode);
    let taskName = category?.name || manualEntry.categoryCode;
    if (subcat) taskName += ` → ${subcat.name}`;
    if (manualEntry.taskDescription) taskName += ` → ${manualEntry.taskDescription}`;

    // Calculate labor cost (hours * hourly rate)
    const hoursWorked = totalMinutes / 60;
    const laborCost = Math.round(hoursWorked * hourlyRate * 100) / 100;

    const newEntry = {
      id: `te-manual-${Date.now()}`,
      taskId: null,
      taskName: taskName,
      projectId: manualEntry.projectId,
      projectName: isShop ? 'Shop' : (project?.name || 'Unknown Project'),
      categoryCode: manualEntry.categoryCode,
      subcategoryCode: manualEntry.subcategoryCode || null,
      userId: manualEntry.userId,
      userName: memberName,
      hourlyRate: hourlyRate,
      startTime: new Date(manualEntry.date).toISOString(),
      endTime: new Date(manualEntry.date).toISOString(),
      durationMinutes: totalMinutes,
      laborCost: laborCost,
      notes: manualEntry.notes,
      billable: !isShop, // Shop time is typically not billable
      isManual: true,
      isShop: isShop,
    };

    setTimeEntries(prev => [newEntry, ...prev]);
    setShowManualEntry(false);
    setManualEntry({
      userId: '',
      projectId: '',
      categoryCode: '',
      subcategoryCode: '',
      taskDescription: '',
      date: new Date().toISOString().split('T')[0],
      hours: '',
      minutes: '',
      notes: '',
    });
  };

  return (
    <PageContainer title="Time">
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
        /* Clock In / Manual Entry Buttons */
        <Card className="p-6 mb-6 text-center">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">Track your time</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => setShowClockIn(true)}>
              <Play className="w-4 h-4 mr-2" />
              Clock In
            </Button>
            <Button variant="secondary" onClick={() => setShowManualEntry(true)}>
              <PenLine className="w-4 h-4 mr-2" />
              Manual Entry
            </Button>
          </div>
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
              <p className="text-sm text-gray-500 mb-3">Select a project:</p>
              <div className="space-y-2">
                {activeProjects.map(project => (
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
                {activeProjects.length === 0 && (
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

      {/* Manual Entry Modal */}
      {showManualEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-charcoal">Add Time Entry</h3>
              <button onClick={() => setShowManualEntry(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            {/* Team Member */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <User className="w-4 h-4 inline mr-1" />
                Team Member
              </label>
              <select
                value={manualEntry.userId}
                onChange={(e) => setManualEntry(prev => ({ ...prev, userId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Select team member...</option>
                {TEAM_MEMBERS.map(member => {
                  const displayName = member.preferredName || member.firstName;
                  const roleConfig = ROLES[member.role];
                  return (
                    <option key={member.id} value={member.id}>
                      {displayName} {member.lastName} ({roleConfig?.shortLabel || roleConfig?.label || member.role})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Project */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project / Location
              </label>
              <select
                value={manualEntry.projectId}
                onChange={(e) => setManualEntry(prev => ({ ...prev, projectId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Select a project...</option>
                <option value="shop">🏭 Shop</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={manualEntry.categoryCode}
                onChange={(e) => setManualEntry(prev => ({
                  ...prev,
                  categoryCode: e.target.value,
                  subcategoryCode: '', // Reset subcategory when category changes
                  taskDescription: '',
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Select category...</option>
                {categories.map(cat => (
                  <option key={cat.code} value={cat.code}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Subcategory - only show if category selected and has subcategories */}
            {manualEntry.categoryCode && filteredSubcategories.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategory
                </label>
                <select
                  value={manualEntry.subcategoryCode}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, subcategoryCode: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Select subcategory (optional)...</option>
                  {filteredSubcategories.map(subcat => (
                    <option key={subcat.code} value={subcat.code}>{subcat.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Task Description - optional specific task */}
            {manualEntry.categoryCode && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Description <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={manualEntry.taskDescription}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, taskDescription: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="e.g., Install kitchen cabinets"
                />
              </div>
            )}

            {/* Date */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={manualEntry.date}
                onChange={(e) => setManualEntry(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            {/* Duration */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    max="24"
                    value={manualEntry.hours}
                    onChange={(e) => setManualEntry(prev => ({ ...prev, hours: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="0"
                  />
                  <span className="text-xs text-gray-400 mt-1 block">Hours</span>
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={manualEntry.minutes}
                    onChange={(e) => setManualEntry(prev => ({ ...prev, minutes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="0"
                  />
                  <span className="text-xs text-gray-400 mt-1 block">Minutes</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <textarea
                value={manualEntry.notes}
                onChange={(e) => setManualEntry(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={2}
                placeholder="Any additional details..."
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowManualEntry(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleManualEntrySave}
                disabled={!manualEntry.userId || !manualEntry.projectId || !manualEntry.categoryCode || (!manualEntry.hours && !manualEntry.minutes)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Entry
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Pay Period Setup Modal */}
      {showPayPeriodSetup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-charcoal">Set Up Pay Period</h3>
              <button onClick={() => setShowPayPeriodSetup(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Selected range: <span className="font-medium">{formatDateShort(filters.customStart)}</span> to <span className="font-medium">{formatDateShort(filters.customEnd)}</span>
                </p>
                {(() => {
                  const start = new Date(filters.customStart);
                  const end = new Date(filters.customEnd);
                  const days = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
                  const dayName = start.toLocaleDateString('en-US', { weekday: 'long' });
                  return (
                    <p className="text-sm text-gray-500 mt-1">
                      {days} day period, starting on {dayName}s
                    </p>
                  );
                })()}
              </div>

              <div className="text-sm text-gray-600">
                <p className="font-medium mb-2">This will:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-500">
                  <li>Create a recurring {(() => {
                    const start = new Date(filters.customStart);
                    const end = new Date(filters.customEnd);
                    const days = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
                    return days;
                  })()}-day pay period</li>
                  <li>Start each period on the same day of the week</li>
                  <li>Add "Pay Period" as a filter option</li>
                  <li>Automatically calculate current and future periods</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowPayPeriodSetup(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={() => savePayPeriod(filters.customStart, filters.customEnd)}
              >
                <Clock className="w-4 h-4 mr-2" />
                Set Pay Period
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Time Summary Card */}
      {timeEntries.length > 0 && (
        <Card className="p-4 mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Today's Stats */}
            {(() => {
              const today = new Date().toDateString();
              const todayEntries = timeEntries.filter(e =>
                new Date(e.startTime).toDateString() === today
              );
              const todayMinutes = todayEntries.reduce((sum, e) => sum + (e.durationMinutes || 0), 0);
              const todayCost = todayEntries.reduce((sum, e) => sum + (e.laborCost || 0), 0);

              return (
                <>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Today</p>
                    <p className="text-xl font-bold text-charcoal">{formatDuration(todayMinutes)}</p>
                    {todayCost > 0 && (
                      <p className="text-sm text-emerald-600">${todayCost.toFixed(2)}</p>
                    )}
                  </div>
                </>
              );
            })()}

            {/* This Week's Stats */}
            {(() => {
              const now = new Date();
              const weekStart = new Date(now);
              weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
              weekStart.setHours(0, 0, 0, 0);

              const weekEntries = timeEntries.filter(e =>
                new Date(e.startTime) >= weekStart
              );
              const weekMinutes = weekEntries.reduce((sum, e) => sum + (e.durationMinutes || 0), 0);
              const weekCost = weekEntries.reduce((sum, e) => sum + (e.laborCost || 0), 0);

              return (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">This Week</p>
                  <p className="text-xl font-bold text-charcoal">{formatDuration(weekMinutes)}</p>
                  {weekCost > 0 && (
                    <p className="text-sm text-emerald-600">${weekCost.toFixed(2)}</p>
                  )}
                </div>
              );
            })()}

            {/* Total All Time */}
            {(() => {
              const totalMinutes = timeEntries.reduce((sum, e) => sum + (e.durationMinutes || 0), 0);
              const totalCost = timeEntries.reduce((sum, e) => sum + (e.laborCost || 0), 0);

              return (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">All Time</p>
                  <p className="text-xl font-bold text-charcoal">{formatDuration(totalMinutes)}</p>
                  {totalCost > 0 && (
                    <p className="text-sm text-emerald-600">${totalCost.toFixed(2)}</p>
                  )}
                </div>
              );
            })()}

            {/* Billable vs Non-billable */}
            {(() => {
              const billableEntries = timeEntries.filter(e => e.billable !== false);
              const billableMinutes = billableEntries.reduce((sum, e) => sum + (e.durationMinutes || 0), 0);
              const billableCost = billableEntries.reduce((sum, e) => sum + (e.laborCost || 0), 0);
              const totalMinutes = timeEntries.reduce((sum, e) => sum + (e.durationMinutes || 0), 0);
              const billablePercent = totalMinutes > 0 ? Math.round((billableMinutes / totalMinutes) * 100) : 0;

              return (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Billable</p>
                  <p className="text-xl font-bold text-charcoal">{billablePercent}%</p>
                  {billableCost > 0 && (
                    <p className="text-sm text-emerald-600">${billableCost.toFixed(2)}</p>
                  )}
                </div>
              );
            })()}
          </div>
        </Card>
      )}

      {/* Recent Time Entries */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-charcoal flex items-center gap-2">
            <History className="w-5 h-5 text-gray-400" />
            Time Entries
            {hasActiveFilters && (
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                {filteredEntries.length} results
              </span>
            )}
          </h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
              showFilters || hasActiveFilters
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-emerald-500 rounded-full" />
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <Card className="mt-3 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Date Range Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  <Calendar className="w-3.5 h-3.5 inline mr-1" />
                  Date Range
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  {payPeriod && (
                    <option value="pay_period">
                      Pay Period ({formatDateShort(currentPayPeriodRange?.start)} - {formatDateShort(currentPayPeriodRange?.end)})
                    </option>
                  )}
                  <option value="custom">Custom Range...</option>
                </select>
              </div>

              {/* Team Member Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  <User className="w-3.5 h-3.5 inline mr-1" />
                  Team Member
                </label>
                <select
                  value={filters.teamMember}
                  onChange={(e) => setFilters(prev => ({ ...prev, teamMember: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">All Members</option>
                  {teamMembersInEntries.map(member => (
                    <option key={member.id} value={member.id}>{member.name}</option>
                  ))}
                </select>
              </div>

              {/* Project Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  <Building2 className="w-3.5 h-3.5 inline mr-1" />
                  Project
                </label>
                <select
                  value={filters.project}
                  onChange={(e) => setFilters(prev => ({ ...prev, project: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">All Projects</option>
                  {projectsInEntries.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Custom Date Range */}
            {filters.dateRange === 'custom' && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={filters.customStart}
                      onChange={(e) => setFilters(prev => ({ ...prev, customStart: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={filters.customEnd}
                      onChange={(e) => setFilters(prev => ({ ...prev, customEnd: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                {/* Set as Pay Period checkbox */}
                {filters.customStart && filters.customEnd && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => setShowPayPeriodSetup(true)}
                      className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700"
                    >
                      <Clock className="w-4 h-4" />
                      Set as recurring pay period
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Pay Period Info */}
            {payPeriod && (
              <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-800">
                      Pay Period: {payPeriod.lengthDays} days
                    </p>
                    <p className="text-xs text-emerald-600">
                      Current: {formatDateShort(currentPayPeriodRange?.start)} - {formatDateShort(currentPayPeriodRange?.end)}
                      {currentPayPeriodRange && ` (Period #${currentPayPeriodRange.periodNumber})`}
                    </p>
                  </div>
                  {showPayPeriodDeleteConfirm ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Are you sure?</span>
                      <button
                        onClick={() => {
                          clearPayPeriod();
                          setShowPayPeriodDeleteConfirm(false);
                        }}
                        className="text-xs text-red-600 hover:text-red-700 font-medium"
                      >
                        Yes, Remove
                      </button>
                      <button
                        onClick={() => setShowPayPeriodDeleteConfirm(false)}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowPayPeriodDeleteConfirm(true)}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Clear Filters */}
            {hasActiveFilters && (
              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  Showing {filteredEntries.length} of {timeEntries.length} entries
                </p>
                <button
                  onClick={clearFilters}
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </Card>
        )}
      </div>

      {filteredEntries.length > 0 ? (
        <div className="space-y-2">
          {filteredEntries.slice(0, 20).map(entry => (
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
                  <p className="text-xs text-gray-400 truncate">
                    {entry.projectName}
                    {entry.userName && entry.userName !== currentUser.name && (
                      <span className="ml-2 text-gray-500">• {entry.userName}</span>
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm text-charcoal">
                    {formatDuration(entry.durationMinutes)}
                  </p>
                  {entry.laborCost > 0 && (
                    <p className="text-xs text-emerald-600 font-medium">
                      ${entry.laborCost.toFixed(2)}
                    </p>
                  )}
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
          {hasActiveFilters ? (
            <>
              <p className="text-gray-500">No entries match your filters</p>
              <button
                onClick={clearFilters}
                className="text-sm text-emerald-600 hover:text-emerald-700 mt-2"
              >
                Clear filters to see all entries
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-500">No time entries yet</p>
              <p className="text-sm text-gray-400">Your time entries will appear here</p>
            </>
          )}
        </Card>
      )}
    </PageContainer>
  );
}

export default TimeTrackerPage;
