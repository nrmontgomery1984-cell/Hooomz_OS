import { useState } from 'react';
import { ChevronDown, ChevronUp, User, DollarSign, Calendar, ClipboardList, AlertTriangle, Users, Activity } from 'lucide-react';
import { ProjectHeader } from './ProjectHeader';
import { ClientCard } from './ClientCard';
import { BudgetTracker, BudgetSummaryCard } from './BudgetTracker';
import { ScheduleSnapshot, ScheduleSummaryCard } from './ScheduleSnapshot';
import { ScopeSummary } from './ScopeSummary';
import { ActionItems } from './ActionItems';
import { TeamSection } from './TeamSection';
import { DashboardActivityFeed } from './DashboardActivityFeed';

/**
 * CollapsibleSection - Mobile-friendly collapsible card wrapper
 */
function CollapsibleSection({ title, icon: Icon, badge, defaultExpanded = false, children }) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full flex items-center justify-between p-3 transition-colors ${
          expanded ? 'bg-gray-100' : 'hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className={`w-4 h-4 ${expanded ? 'text-charcoal' : 'text-gray-400'}`} />}
          <span className="font-medium text-charcoal">{title}</span>
          {badge && (
            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
              {badge}
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-charcoal" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {expanded && (
        <div className="border-t border-gray-200">
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * ProjectDashboard - Main dashboard container
 *
 * Central command center for contractors managing renovation
 * and new construction projects.
 *
 * Layout (Mobile):
 * - Header (full width, compact)
 * - Collapsible sections for each area
 *
 * Layout (Desktop):
 * - Header (full width)
 * - Grid: Client | Budget
 * - Grid: Schedule | Scope
 * - Action Items (full width)
 * - Grid: Team | Activity
 *
 * @param {Object} dashboardData - Transformed dashboard data
 * @param {Object} project - Full project object (for phase transitions)
 * @param {Function} onAction - Action handler
 * @param {Function} onPhaseTransition - Handler for initiating phase transitions
 */
export function ProjectDashboard({ dashboardData, project, onAction, onPhaseTransition, viewMode = 'contractor' }) {
  const isHomeownerView = viewMode === 'homeowner';
  const {
    header,
    client,
    budget,
    schedule,
    scope,
    actionItems,
    team,
    activities,
  } = dashboardData;

  // Action handlers
  const handleHeaderAction = (action) => {
    switch (action) {
      case 'view_estimate':
        onAction?.('view_estimate');
        break;
      case 'message_client':
        onAction?.('message_client', client.client);
        break;
      case 'add_note':
        onAction?.('add_note');
        break;
      default:
        break;
    }
  };

  const handleRequestDecision = () => {
    onAction?.('request_decision', client);
  };

  const handleAddChangeOrder = () => {
    onAction?.('add_change_order');
  };

  const handleViewChangeOrder = (changeOrder) => {
    onAction?.('view_change_order', changeOrder);
  };

  const handleResolveBlocker = (blockerId) => {
    onAction?.('resolve_blocker', blockerId);
  };

  const handleCompleteTask = (taskId) => {
    onAction?.('complete_task', taskId);
  };

  const handleApprove = (approvalId, approved) => {
    onAction?.('handle_approval', { approvalId, approved });
  };

  const handleViewFullScope = () => {
    onAction?.('view_scope');
  };

  const handleAddNote = () => {
    onAction?.('add_note');
  };

  // Count pending items for badges
  const pendingDecisionsCount = client.pendingDecisions?.length || 0;
  const hasUrgentActions = actionItems.blockers.length > 0 || actionItems.overdueTasks.length > 0;

  return (
    <div className="space-y-3">
      {/* Project Header - Full Width */}
      <ProjectHeader
        header={header}
        project={project}
        onAction={handleHeaderAction}
        onPhaseTransition={isHomeownerView ? null : onPhaseTransition}
        viewMode={viewMode}
      />

      {/* Mobile Layout: Collapsible Sections */}
      <div className="lg:hidden space-y-2">
        {/* Action Items - Always visible if urgent */}
        {hasUrgentActions && (
          <CollapsibleSection
            title="Action Items"
            icon={AlertTriangle}
            badge={`${actionItems.blockers.length + actionItems.overdueTasks.length} urgent`}
            defaultExpanded={true}
          >
            <ActionItems
              actionItems={actionItems}
              onResolveBlocker={handleResolveBlocker}
              onCompleteTask={handleCompleteTask}
              onApprove={handleApprove}
            />
          </CollapsibleSection>
        )}

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 gap-2">
          <BudgetSummaryCard budget={budget} />
          <ScheduleSummaryCard schedule={schedule} />
        </div>

        {/* Client Section */}
        <CollapsibleSection
          title="Client"
          icon={User}
          badge={pendingDecisionsCount > 0 ? `${pendingDecisionsCount} pending` : null}
          defaultExpanded={pendingDecisionsCount > 0}
        >
          <ClientCard
            clientData={client}
            onRequestDecision={handleRequestDecision}
          />
        </CollapsibleSection>

        {/* Budget Section */}
        <CollapsibleSection
          title="Budget Details"
          icon={DollarSign}
          defaultExpanded={false}
        >
          <BudgetTracker
            budget={budget}
            onAddChangeOrder={handleAddChangeOrder}
            onViewChangeOrder={handleViewChangeOrder}
          />
        </CollapsibleSection>

        {/* Schedule Section */}
        <CollapsibleSection
          title="Schedule"
          icon={Calendar}
          defaultExpanded={false}
        >
          <ScheduleSnapshot schedule={schedule} />
        </CollapsibleSection>

        {/* Scope Section */}
        <CollapsibleSection
          title="Scope"
          icon={ClipboardList}
          defaultExpanded={false}
        >
          <ScopeSummary
            scope={scope}
            onViewFullScope={handleViewFullScope}
          />
        </CollapsibleSection>

        {/* Action Items - Show if not urgent (collapsed) */}
        {!hasUrgentActions && (
          <CollapsibleSection
            title="Action Items"
            icon={AlertTriangle}
            defaultExpanded={false}
          >
            <ActionItems
              actionItems={actionItems}
              onResolveBlocker={handleResolveBlocker}
              onCompleteTask={handleCompleteTask}
              onApprove={handleApprove}
            />
          </CollapsibleSection>
        )}

        {/* Team Section */}
        <CollapsibleSection
          title="Team"
          icon={Users}
          defaultExpanded={false}
        >
          <TeamSection team={team} />
        </CollapsibleSection>

        {/* Activity Section */}
        <CollapsibleSection
          title="Activity"
          icon={Activity}
          defaultExpanded={false}
        >
          <DashboardActivityFeed
            activities={activities}
            onAddNote={handleAddNote}
          />
        </CollapsibleSection>
      </div>

      {/* Desktop Layout: Grid */}
      <div className="hidden lg:block space-y-4">
        {/* Row 1: Client + Budget */}
        <div className="grid grid-cols-2 gap-4">
          <ClientCard
            clientData={client}
            onRequestDecision={handleRequestDecision}
          />
          <BudgetTracker
            budget={budget}
            onAddChangeOrder={handleAddChangeOrder}
            onViewChangeOrder={handleViewChangeOrder}
          />
        </div>

        {/* Row 2: Schedule + Scope */}
        <div className="grid grid-cols-2 gap-4">
          <ScheduleSnapshot schedule={schedule} />
          <ScopeSummary
            scope={scope}
            onViewFullScope={handleViewFullScope}
          />
        </div>

        {/* Action Items - Full Width */}
        <ActionItems
          actionItems={actionItems}
          onResolveBlocker={handleResolveBlocker}
          onCompleteTask={handleCompleteTask}
          onApprove={handleApprove}
        />

        {/* Row 3: Team + Activity */}
        <div className="grid grid-cols-2 gap-4">
          <TeamSection team={team} />
          <DashboardActivityFeed
            activities={activities}
            onAddNote={handleAddNote}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * ProjectDashboardCompact - Smaller version for sidebar/overview
 */
export function ProjectDashboardCompact({ dashboardData }) {
  const { header, budget, schedule, actionItems } = dashboardData;

  return (
    <div className="space-y-3">
      {/* Quick health status */}
      <div className={`
        p-3 rounded-lg border
        ${header.healthStatus === 'behind'
          ? 'bg-red-50 border-red-200'
          : header.healthStatus === 'at_risk'
            ? 'bg-amber-50 border-amber-200'
            : 'bg-emerald-50 border-emerald-200'
        }
      `}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-charcoal">Project Health</span>
          <span className={`
            text-xs font-medium
            ${header.healthStatus === 'behind'
              ? 'text-red-700'
              : header.healthStatus === 'at_risk'
                ? 'text-amber-700'
                : 'text-emerald-700'
            }
          `}>
            {header.healthStatus.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
        </div>
        <p className="text-xs text-gray-600">{header.healthReason}</p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500">Budget Used</p>
          <p className="text-sm font-medium text-charcoal">
            {Math.round(((budget.totalSpent + budget.totalCommitted) / budget.contractValue) * 100)}%
          </p>
        </div>
        <div className="p-2 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500">Days Left</p>
          <p className="text-sm font-medium text-charcoal">
            {Math.max(0, Math.ceil((new Date(schedule.targetCompletion) - new Date()) / (1000 * 60 * 60 * 24)))}
          </p>
        </div>
      </div>

      {/* Action items summary */}
      {(actionItems.blockers.length > 0 || actionItems.overdueTasks.length > 0) && (
        <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs font-medium text-red-700">
            {actionItems.blockers.length} blockers • {actionItems.overdueTasks.length} overdue
          </p>
        </div>
      )}
    </div>
  );
}

export default ProjectDashboard;
