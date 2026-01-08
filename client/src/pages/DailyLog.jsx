import { useState, useEffect } from 'react';
import { ClipboardList, Plus, CloudSun, Users, Calendar, Building2, Trash2, Edit2, AlertTriangle, CheckCircle } from 'lucide-react';
import { PageContainer } from '../components/layout';
import { Card, Button, Modal, Input, Select } from '../components/ui';
import { getProjects } from '../services/api';
import { useConfirmDialog } from '../hooks/useConfirmDialog';
import { useToast } from '../components/ui';

// Local storage key for daily logs
const DAILY_LOGS_KEY = 'hooomz-daily-logs';

// Weather condition options
const WEATHER_CONDITIONS = [
  { value: 'sunny', label: 'Sunny' },
  { value: 'partly_cloudy', label: 'Partly Cloudy' },
  { value: 'cloudy', label: 'Cloudy' },
  { value: 'rainy', label: 'Rainy' },
  { value: 'stormy', label: 'Stormy' },
  { value: 'snowy', label: 'Snowy' },
  { value: 'windy', label: 'Windy' },
  { value: 'foggy', label: 'Foggy' },
];

// Weather icons mapping
const WEATHER_ICONS = {
  sunny: '☀️',
  partly_cloudy: '⛅',
  cloudy: '☁️',
  rainy: '🌧️',
  stormy: '⛈️',
  snowy: '❄️',
  windy: '💨',
  foggy: '🌫️',
};

/**
 * DailyLog - Job site daily reports
 */
export function DailyLog() {
  const [logs, setLogs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [filterProject, setFilterProject] = useState('all');
  const { confirm } = useConfirmDialog();
  const { showToast } = useToast();

  // Load logs from localStorage and projects from API
  useEffect(() => {
    async function loadData() {
      setLoading(true);

      // Load logs from localStorage
      try {
        const saved = localStorage.getItem(DAILY_LOGS_KEY);
        if (saved) {
          setLogs(JSON.parse(saved));
        }
      } catch (err) {
        console.error('Failed to load daily logs:', err);
      }

      // Load projects
      const { data } = await getProjects();
      setProjects(data || []);

      setLoading(false);
    }
    loadData();
  }, []);

  // Save logs to localStorage
  const saveLogs = (newLogs) => {
    setLogs(newLogs);
    localStorage.setItem(DAILY_LOGS_KEY, JSON.stringify(newLogs));
  };

  // Add or update log
  const handleSaveLog = (logData) => {
    if (editingLog) {
      const updated = logs.map(l =>
        l.id === editingLog.id ? { ...l, ...logData, updated_at: new Date().toISOString() } : l
      );
      saveLogs(updated);
      showToast('Daily log updated', 'success');
    } else {
      const newLog = {
        id: `log-${Date.now()}`,
        ...logData,
        created_at: new Date().toISOString(),
      };
      saveLogs([newLog, ...logs]);
      showToast('Daily log added', 'success');
    }
    setShowAddModal(false);
    setEditingLog(null);
  };

  // Delete log
  const handleDeleteLog = async (log) => {
    const confirmed = await confirm({
      title: 'Delete Daily Log',
      message: `Delete log for ${new Date(log.date).toLocaleDateString()}? This cannot be undone.`,
      confirmText: 'Delete',
      variant: 'danger',
    });

    if (confirmed) {
      const updated = logs.filter(l => l.id !== log.id);
      saveLogs(updated);
      showToast('Daily log deleted', 'success');
    }
  };

  // Filter logs
  const filteredLogs = logs.filter(log => {
    if (filterProject !== 'all' && log.project_id !== filterProject) return false;
    return true;
  });

  // Sort logs by date (newest first)
  const sortedLogs = [...filteredLogs].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Group logs by week
  const groupLogsByWeek = (logs) => {
    const groups = {};
    logs.forEach(log => {
      const date = new Date(log.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      if (!groups[weekKey]) {
        groups[weekKey] = [];
      }
      groups[weekKey].push(log);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  };

  const groupedLogs = groupLogsByWeek(sortedLogs);

  // Calculate stats
  const totalCrewDays = filteredLogs.reduce((sum, l) => sum + (parseInt(l.crew_count) || 0), 0);
  const logsWithIssues = filteredLogs.filter(l => l.issues && l.issues.trim()).length;

  const projectOptions = [
    { value: 'all', label: 'All Projects' },
    ...projects.map(p => ({ value: p.id, label: p.name || p.client_name })),
  ];

  return (
    <PageContainer
      title="Daily Log"
      subtitle="Job site daily reports"
      action={
        <Button size="sm" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-1" />
          New Log
        </Button>
      }
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-charcoal">{filteredLogs.length}</p>
          <p className="text-xs text-gray-500">Total Logs</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{totalCrewDays}</p>
          <p className="text-xs text-gray-500">Total Crew Days</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-amber-600">{logsWithIssues}</p>
          <p className="text-xs text-gray-500">Logs with Issues</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-green-600">
            {filteredLogs.length > 0 ? Math.round((filteredLogs.length - logsWithIssues) / filteredLogs.length * 100) : 0}%
          </p>
          <p className="text-xs text-gray-500">Issue-Free Days</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-4">
        <Select
          value={filterProject}
          onChange={setFilterProject}
          options={projectOptions}
          placeholder="Filter by project"
        />
      </div>

      {/* Logs List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 rounded-lg h-32 animate-pulse" />
          ))}
        </div>
      ) : sortedLogs.length === 0 ? (
        <Card className="p-8 text-center">
          <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-2">No daily logs yet</p>
          <p className="text-sm text-gray-400 mb-4">
            Start documenting your job site activity
          </p>
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            Create First Log
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {groupedLogs.map(([weekKey, weekLogs]) => (
            <div key={weekKey}>
              <h3 className="text-sm font-medium text-gray-500 mb-3">
                Week of {new Date(weekKey).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </h3>
              <div className="space-y-3">
                {weekLogs.map((log) => (
                  <LogCard
                    key={log.id}
                    log={log}
                    projects={projects}
                    onEdit={() => {
                      setEditingLog(log);
                      setShowAddModal(true);
                    }}
                    onDelete={() => handleDeleteLog(log)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <LogModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingLog(null);
        }}
        onSave={handleSaveLog}
        log={editingLog}
        projects={projects}
      />
    </PageContainer>
  );
}

function LogCard({ log, projects, onEdit, onDelete }) {
  const project = projects.find(p => p.id === log.project_id);
  const weather = WEATHER_CONDITIONS.find(w => w.value === log.weather);
  const hasIssues = log.issues && log.issues.trim();

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{WEATHER_ICONS[log.weather] || '🌤️'}</div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-charcoal">
                {new Date(log.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </h4>
              {hasIssues ? (
                <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                  <AlertTriangle className="w-3 h-3" />
                  Issues
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                  <CheckCircle className="w-3 h-3" />
                  Good
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
              {project && (
                <span className="flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {project.name || project.client_name}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {log.crew_count || 0} crew
              </span>
              {weather && (
                <span className="flex items-center gap-1">
                  <CloudSun className="w-3 h-3" />
                  {weather.label}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-md text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {log.work_summary && (
        <div className="mb-2">
          <p className="text-sm text-gray-600">{log.work_summary}</p>
        </div>
      )}

      {hasIssues && (
        <div className="mt-3 p-2 bg-amber-50 rounded-md border border-amber-100">
          <p className="text-xs font-medium text-amber-800 mb-1">Issues Reported:</p>
          <p className="text-sm text-amber-700">{log.issues}</p>
        </div>
      )}

      {log.tomorrow_plan && (
        <div className="mt-3 p-2 bg-blue-50 rounded-md border border-blue-100">
          <p className="text-xs font-medium text-blue-800 mb-1">Tomorrow's Plan:</p>
          <p className="text-sm text-blue-700">{log.tomorrow_plan}</p>
        </div>
      )}
    </Card>
  );
}

function LogModal({ isOpen, onClose, onSave, log, projects }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [projectId, setProjectId] = useState('');
  const [weather, setWeather] = useState('sunny');
  const [crewCount, setCrewCount] = useState('');
  const [workSummary, setWorkSummary] = useState('');
  const [issues, setIssues] = useState('');
  const [tomorrowPlan, setTomorrowPlan] = useState('');

  // Reset form when log changes
  useEffect(() => {
    if (log) {
      setDate(log.date || new Date().toISOString().split('T')[0]);
      setProjectId(log.project_id || '');
      setWeather(log.weather || 'sunny');
      setCrewCount(log.crew_count?.toString() || '');
      setWorkSummary(log.work_summary || '');
      setIssues(log.issues || '');
      setTomorrowPlan(log.tomorrow_plan || '');
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setProjectId('');
      setWeather('sunny');
      setCrewCount('');
      setWorkSummary('');
      setIssues('');
      setTomorrowPlan('');
    }
  }, [log, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      date,
      project_id: projectId || null,
      weather,
      crew_count: parseInt(crewCount) || 0,
      work_summary: workSummary,
      issues,
      tomorrow_plan: tomorrowPlan,
    });
  };

  const projectOptions = [
    { value: '', label: 'Select a project' },
    ...projects.map(p => ({ value: p.id, label: p.name || p.client_name })),
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={log ? 'Edit Daily Log' : 'New Daily Log'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Crew Count
            </label>
            <Input
              type="number"
              min="0"
              value={crewCount}
              onChange={(e) => setCrewCount(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project
          </label>
          <Select
            value={projectId}
            onChange={setProjectId}
            options={projectOptions}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Weather Conditions
          </label>
          <Select
            value={weather}
            onChange={setWeather}
            options={WEATHER_CONDITIONS}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Work Summary *
          </label>
          <textarea
            value={workSummary}
            onChange={(e) => setWorkSummary(e.target.value)}
            placeholder="What work was completed today?"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            rows={3}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Issues / Problems
          </label>
          <textarea
            value={issues}
            onChange={(e) => setIssues(e.target.value)}
            placeholder="Any issues, delays, or problems encountered?"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            rows={2}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tomorrow's Plan
          </label>
          <textarea
            value={tomorrowPlan}
            onChange={(e) => setTomorrowPlan(e.target.value)}
            placeholder="What's planned for tomorrow?"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            rows={2}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={!date || !workSummary}>
            {log ? 'Update' : 'Save'} Log
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default DailyLog;
