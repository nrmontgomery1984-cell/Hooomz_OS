import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, MoreHorizontal, LayoutDashboard, List, DollarSign, Calculator, Package, Layers, Eye, EyeOff, Map, FileText } from 'lucide-react';
import { PageContainer } from '../components/layout';
import { Button } from '../components/ui';
import { ProjectDashboard, PhaseTransitionModal, AddChangeOrderModal, ChangeOrderDetailModal, DocumentChecklist } from '../components/dashboard';
import { AddLoopModal, LoopsView } from '../components/loops';
import { ActivityFeed, AddActivityModal } from '../components/activity';
import { AddExpenseModal, ExpenseList, ExpenseSummary } from '../components/expenses';
import { EstimatePanel } from '../components/estimates';
import { useDashboardFromData, usePhaseTransition } from '../hooks';
import {
  getProject,
  getOrGenerateLoops,
  getProjectActivity,
  createActivityEntry,
  createLoop,
} from '../services/api';
import { getProjectExpenses, calculateProjectExpenseTotals } from '../lib/expenses';
import { getProjectChangeOrders } from '../lib/changeOrders';

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
  const [showAddChangeOrder, setShowAddChangeOrder] = useState(false);
  const [selectedChangeOrder, setSelectedChangeOrder] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [changeOrders, setChangeOrders] = useState([]);
  const [viewMode, setViewMode] = useState('contractor'); // 'contractor' | 'homeowner'

  // Generate dashboard data from project, including change orders from localStorage
  const { dashboardData } = useDashboardFromData(project, { changeOrders });

  // Phase transition management
  const handleProjectUpdate = async (updatedProject) => {
    setProject(updatedProject);
    // Also refresh activities and loops to show the phase change and any generated loops
    const [activityRes, loopsRes] = await Promise.all([
      getProjectActivity(projectId),
      getOrGenerateLoops(projectId, updatedProject),
    ]);
    if (activityRes.data) setActivities(activityRes.data);
    if (loopsRes.data) setLoops(loopsRes.data);
  };

  const phaseTransition = usePhaseTransition(project, handleProjectUpdate);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setActivityLoading(true);

      try {
        // First get project and activity in parallel
        const [projectRes, activityRes] = await Promise.all([
          getProject(projectId),
          getProjectActivity(projectId),
        ]);

        setProject(projectRes.data);
        setActivities(activityRes.data || []);

        // Only load related data if project exists
        if (projectRes.data) {
          // Then get or generate loops (needs project data to check for estimate)
          const loopsRes = await getOrGenerateLoops(projectId, projectRes.data);
          setLoops(loopsRes.data || []);

          setExpenses(getProjectExpenses(projectId));
          setChangeOrders(getProjectChangeOrders(projectId));
        }
      } catch (error) {
        console.error('Error loading project data:', error);
        setProject(null);
      } finally {
        setLoading(false);
        setActivityLoading(false);
      }
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

  // Change order handlers
  const handleChangeOrderAdded = async (changeOrder) => {
    setChangeOrders(prev => [changeOrder, ...prev]);

    // Log activity for change order creation
    const entry = await createActivityEntry({
      event_type: 'change_order.created',
      event_data: {
        title: changeOrder.title,
        amount: changeOrder.amount,
        reason: changeOrder.reason,
      },
      project_id: projectId,
      actor_name: 'You',
    });

    if (entry.data) {
      setActivities((prev) => [entry.data, ...prev]);
    }
  };

  const handleChangeOrderUpdated = async (updatedChangeOrder) => {
    setChangeOrders(prev => prev.map(co =>
      co.id === updatedChangeOrder.id ? updatedChangeOrder : co
    ));
    setSelectedChangeOrder(null);

    // Log activity for change order approval/decline
    const eventType = updatedChangeOrder.status === 'approved'
      ? 'change_order.approved'
      : 'change_order.declined';

    const entry = await createActivityEntry({
      event_type: eventType,
      event_data: {
        title: updatedChangeOrder.title,
        amount: updatedChangeOrder.amount,
        approvedBy: updatedChangeOrder.approvedBy,
        declinedReason: updatedChangeOrder.declinedReason,
      },
      project_id: projectId,
      actor_name: updatedChangeOrder.approvedBy || 'You',
    });

    if (entry.data) {
      setActivities((prev) => [entry.data, ...prev]);
    }
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
        // Homeowner goes to quote view, contractor goes to estimate builder
        if (viewMode === 'homeowner') {
          navigate(`/projects/${projectId}/quote`);
        } else {
          navigate(`/projects/${projectId}/estimate`);
        }
        break;
      case 'preview_quote':
        navigate(`/projects/${projectId}/quote`);
        break;
      case 'message_client':
        // Open email client with client email
        if (payload?.email) {
          window.location.href = `mailto:${payload.email}`;
        }
        break;
      case 'add_change_order':
        setShowAddChangeOrder(true);
        break;
      case 'view_change_order':
        setSelectedChangeOrder(payload);
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
      subtitle={`${project.client_name || 'Client TBD'} • ${project.intake_type === 'new_construction' ? 'New Build' : 'Renovation'}`}
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
        <button
          onClick={() => navigate(`/projects/${projectId}/selections`)}
          className="flex items-center justify-center gap-1 px-2 lg:px-3 py-3 text-sm font-medium border-b-2 border-transparent text-gray-500 active:text-charcoal transition-colors"
        >
          <Package className="w-4 h-4 flex-shrink-0" />
          <span className="hidden sm:inline">Selections</span>
        </button>
        <button
          onClick={() => navigate(`/projects/${projectId}/phases`)}
          className="flex items-center justify-center gap-1 px-2 lg:px-3 py-3 text-sm font-medium border-b-2 border-transparent text-gray-500 active:text-charcoal transition-colors"
        >
          <Layers className="w-4 h-4 flex-shrink-0" />
          <span className="hidden sm:inline">Phases</span>
        </button>
        <button
          onClick={() => navigate(`/projects/${projectId}/floor-plans`)}
          className="flex items-center justify-center gap-1 px-2 lg:px-3 py-3 text-sm font-medium border-b-2 border-transparent text-gray-500 active:text-charcoal transition-colors"
        >
          <Map className="w-4 h-4 flex-shrink-0" />
          <span className="hidden sm:inline">Floor Plans</span>
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`flex items-center justify-center gap-1 px-2 lg:px-3 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'documents'
              ? 'border-charcoal text-charcoal'
              : 'border-transparent text-gray-500 active:text-charcoal'
          }`}
        >
          <FileText className="w-4 h-4 flex-shrink-0" />
          <span className="hidden sm:inline">Documents</span>
        </button>

        {/* View Mode Toggle - right side */}
        <div className="ml-auto flex items-center">
          <button
            onClick={() => setViewMode(viewMode === 'contractor' ? 'homeowner' : 'contractor')}
            className={`flex items-center gap-1 px-2 lg:px-3 py-2 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'homeowner'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {viewMode === 'homeowner' ? (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Homeowner View</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Contractor View</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Dashboard View */}
      {activeTab === 'dashboard' && dashboardData && (
        <ProjectDashboard
          dashboardData={dashboardData}
          project={project}
          onAction={handleDashboardAction}
          onPhaseTransition={phaseTransition.initiateTransition}
          viewMode={viewMode}
        />
      )}

      {/* Fallback when dashboard data couldn't be generated */}
      {activeTab === 'dashboard' && !dashboardData && project && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-charcoal mb-2">{project.name}</h3>
          <p className="text-gray-600 mb-4">
            {project.address || 'Address pending'}
          </p>
          <div className="text-sm text-gray-500 space-y-1">
            <p>Phase: {project.phase || 'Estimating'}</p>
            <p>Status: {project.status || 'Active'}</p>
            {project.estimate_total > 0 && (
              <p>Estimate: ${project.estimate_total?.toLocaleString()}</p>
            )}
          </div>
        </div>
      )}

      {/* Phase Transition Modal */}
      <PhaseTransitionModal
        isOpen={phaseTransition.showModal}
        onClose={phaseTransition.cancelTransition}
        project={project}
        targetPhase={phaseTransition.targetPhase}
        onConfirm={phaseTransition.confirmTransition}
        transitionError={phaseTransition.transitionError}
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

      {/* Documents View */}
      {activeTab === 'documents' && (
        <>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-charcoal">Document Checklist</h2>
            <p className="text-sm text-gray-500">
              Track required documents from intake through completion
            </p>
          </div>
          <DocumentChecklist
            projectId={projectId}
            projectPhase={project.phase}
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

      {/* Add Change Order Modal */}
      <AddChangeOrderModal
        isOpen={showAddChangeOrder}
        onClose={() => setShowAddChangeOrder(false)}
        projectId={projectId}
        onChangeOrderAdded={handleChangeOrderAdded}
      />

      {/* Change Order Detail Modal */}
      <ChangeOrderDetailModal
        isOpen={!!selectedChangeOrder}
        onClose={() => setSelectedChangeOrder(null)}
        changeOrder={selectedChangeOrder}
        onUpdate={handleChangeOrderUpdated}
        viewMode={viewMode}
      />
    </PageContainer>
  );
}
