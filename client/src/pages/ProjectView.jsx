import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, MoreHorizontal, LayoutDashboard, List, DollarSign, Calculator } from 'lucide-react';
import { PageContainer } from '../components/layout';
import { Button } from '../components/ui';
import { ProjectDashboard, PhaseTransitionModal } from '../components/dashboard';
import { AddLoopModal, LoopsView } from '../components/loops';
import { ActivityFeed, AddActivityModal } from '../components/activity';
import { AddExpenseModal, ExpenseList, ExpenseSummary } from '../components/expenses';
import { EstimatePanel } from '../components/estimates';
import { useDashboardFromData, usePhaseTransition } from '../hooks';
import {
  getProject,
  getLoops,
  getProjectActivity,
  createActivityEntry,
  createLoop,
} from '../services/api';
import { getProjectExpenses, calculateProjectExpenseTotals } from '../lib/expenses';

export function ProjectView() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loops, setLoops] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'loops' | 'activity'
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [showAddLoop, setShowAddLoop] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expenses, setExpenses] = useState([]);

  // Generate dashboard data from project
  const { dashboardData } = useDashboardFromData(project);

  // Phase transition management
  const handleProjectUpdate = (updatedProject) => {
    setProject(updatedProject);
    // Also refresh activities and loops to show the phase change and any generated loops
    Promise.all([
      getProjectActivity(projectId),
      getLoops(projectId),
    ]).then(([activityRes, loopsRes]) => {
      if (activityRes.data) setActivities(activityRes.data);
      if (loopsRes.data) setLoops(loopsRes.data);
    });
  };

  const phaseTransition = usePhaseTransition(project, handleProjectUpdate);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setActivityLoading(true);

      const [projectRes, loopsRes, activityRes] = await Promise.all([
        getProject(projectId),
        getLoops(projectId),
        getProjectActivity(projectId),
      ]);

      setProject(projectRes.data);
      setLoops(loopsRes.data || []);
      setActivities(activityRes.data || []);
      setExpenses(getProjectExpenses(projectId));
      setLoading(false);
      setActivityLoading(false);
    }
    loadData();
  }, [projectId]);

  // Expense handlers
  const handleExpenseAdded = (expense) => {
    setExpenses(prev => [expense, ...prev]);
  };

  const handleExpenseDeleted = (expenseId) => {
    setExpenses(prev => prev.filter(e => e.id !== expenseId));
  };

  const handleAddActivity = async (entry) => {
    const { data } = await createActivityEntry(entry);
    if (data) {
      setActivities((prev) => [data, ...prev]);
    }
  };

  const handleAddLoop = async (loopData) => {
    const { data, error } = await createLoop(loopData);
    if (!error && data) {
      setLoops((prev) => [...prev, data]);

      const entry = await createActivityEntry({
        event_type: 'loop.created',
        event_data: { name: loopData.name },
        project_id: projectId,
        loop_id: data.id,
        category_code: loopData.category_code,
        actor_name: 'You',
      });

      if (entry.data) {
        setActivities((prev) => [entry.data, ...prev]);
      }
    }
  };

  const handleDashboardAction = (action, payload) => {
    console.log('Dashboard action:', action, payload);

    switch (action) {
      case 'add_note':
        setShowAddActivity(true);
        break;
      case 'view_estimate':
        navigate(`/projects/${projectId}/estimate`);
        break;
      case 'message_client':
        // Open email client with client email
        if (payload?.email) {
          window.location.href = `mailto:${payload.email}`;
        }
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <PageContainer backTo="/">
        <div className="space-y-4">
          <div className="bg-gray-100 rounded-lg h-32 animate-pulse" />
          <div className="bg-gray-100 rounded-lg h-20 animate-pulse" />
          <div className="bg-gray-100 rounded-lg h-20 animate-pulse" />
        </div>
      </PageContainer>
    );
  }

  if (!project) {
    return (
      <PageContainer backTo="/" title="Project Not Found">
        <p className="text-gray-500">This project doesn't exist.</p>
      </PageContainer>
    );
  }

  // Determine back link based on project phase
  const getBackLink = () => {
    switch (project.phase) {
      case 'intake':
        return '/sales';
      case 'estimate':
      case 'estimating':
        return '/estimates';
      case 'contract':
      case 'contracted':
        return '/contracts';
      case 'active':
        return '/production';
      case 'complete':
        return '/completed';
      default:
        return '/';
    }
  };

  return (
    <PageContainer
      backTo={getBackLink()}
      title={project.name}
      subtitle={`${project.client_name} • ${project.intake_type === 'new_construction' ? 'New Build' : 'Renovation'}`}
      action={
        <button className="p-2 hover:bg-gray-100 rounded-md transition-colors">
          <MoreHorizontal className="w-5 h-5 text-gray-600" />
        </button>
      }
    >
      {/* View Mode Tabs - Mobile: icon-only, Desktop: icon + label */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center justify-center gap-1 px-2 lg:px-3 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'dashboard'
              ? 'border-charcoal text-charcoal'
              : 'border-transparent text-gray-500 active:text-charcoal'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
          <span className="hidden sm:inline">Dashboard</span>
        </button>
        <button
          onClick={() => setActiveTab('loops')}
          className={`flex items-center justify-center gap-1 px-2 lg:px-3 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'loops'
              ? 'border-charcoal text-charcoal'
              : 'border-transparent text-gray-500 active:text-charcoal'
          }`}
        >
          <List className="w-4 h-4 flex-shrink-0" />
          <span className="hidden sm:inline">Loops</span>
          <span className="text-xs">({loops.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`flex items-center justify-center gap-1 px-2 lg:px-3 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'activity'
              ? 'border-charcoal text-charcoal'
              : 'border-transparent text-gray-500 active:text-charcoal'
          }`}
        >
          <span>Activity</span>
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`flex items-center justify-center gap-1 px-2 lg:px-3 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'expenses'
              ? 'border-charcoal text-charcoal'
              : 'border-transparent text-gray-500 active:text-charcoal'
          }`}
        >
          <DollarSign className="w-4 h-4 flex-shrink-0" />
          <span className="hidden sm:inline">Expenses</span>
        </button>
        <button
          onClick={() => setActiveTab('estimate')}
          className={`flex items-center justify-center gap-1 px-2 lg:px-3 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'estimate'
              ? 'border-charcoal text-charcoal'
              : 'border-transparent text-gray-500 active:text-charcoal'
          }`}
        >
          <Calculator className="w-4 h-4 flex-shrink-0" />
          <span className="hidden sm:inline">Estimate</span>
        </button>
      </div>

      {/* Dashboard View */}
      {activeTab === 'dashboard' && dashboardData && (
        <ProjectDashboard
          dashboardData={dashboardData}
          project={project}
          onAction={handleDashboardAction}
          onPhaseTransition={phaseTransition.initiateTransition}
        />
      )}

      {/* Phase Transition Modal */}
      <PhaseTransitionModal
        isOpen={phaseTransition.showModal}
        onClose={phaseTransition.cancelTransition}
        project={project}
        targetPhase={phaseTransition.targetPhase}
        onConfirm={phaseTransition.confirmTransition}
      />

      {/* Loops View - Integrated Task Tracker */}
      {activeTab === 'loops' && (
        <LoopsView projectId={projectId} />
      )}

      {/* Activity View */}
      {activeTab === 'activity' && (
        <>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold text-charcoal">Activity Log</h2>
              <p className="text-sm text-gray-500">The heartbeat of your project</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setShowAddActivity(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Log Activity
            </Button>
          </div>

          <ActivityFeed
            activities={activities}
            loading={activityLoading}
            projectId={projectId}
            emptyMessage="No activity recorded yet. Actions like completing tasks, adding photos, and logging time will appear here."
          />
        </>
      )}

      {/* Expenses View */}
      {activeTab === 'expenses' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-charcoal">Project Expenses</h2>
              <p className="text-sm text-gray-500">Track materials, labor, and other costs</p>
            </div>
            <Button variant="primary" size="sm" onClick={() => setShowAddExpense(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Add Expense
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Summary Sidebar */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <ExpenseSummary
                totals={calculateProjectExpenseTotals(projectId)}
                budget={project?.contract_value || project?.estimate_high || 100000}
              />
            </div>

            {/* Expense List */}
            <div className="lg:col-span-2 order-1 lg:order-2">
              <ExpenseList
                expenses={expenses}
                onDelete={handleExpenseDeleted}
                emptyMessage="No expenses recorded yet. Add your first expense to start tracking costs."
              />
            </div>
          </div>
        </>
      )}

      {/* Estimate View */}
      {activeTab === 'estimate' && (
        <>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-charcoal">Cost Estimate</h2>
            <p className="text-sm text-gray-500">
              Calculated from scope and Cost Catalogue rates
            </p>
          </div>
          <EstimatePanel
            project={project}
            onProjectUpdate={setProject}
          />
        </>
      )}

      {/* Add Activity Modal */}
      <AddActivityModal
        isOpen={showAddActivity}
        onClose={() => setShowAddActivity(false)}
        projectId={projectId}
        onSubmit={handleAddActivity}
      />

      {/* Add Loop Modal */}
      <AddLoopModal
        isOpen={showAddLoop}
        onClose={() => setShowAddLoop(false)}
        projectId={projectId}
        existingLoops={loops}
        onSubmit={handleAddLoop}
      />

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={showAddExpense}
        onClose={() => setShowAddExpense(false)}
        projectId={projectId}
        onExpenseAdded={handleExpenseAdded}
      />
    </PageContainer>
  );
}
