import { useState } from 'react';
import { ProjectHeader } from './ProjectHeader';
import { ClientCard } from './ClientCard';
import { BudgetTracker } from './BudgetTracker';
import { ScheduleSnapshot } from './ScheduleSnapshot';
import { ScopeSummary } from './ScopeSummary';
import { ActionItems } from './ActionItems';
import { TeamSection } from './TeamSection';
import { DashboardActivityFeed } from './DashboardActivityFeed';

/**
 * ProjectDashboard - Main dashboard container
 *
 * Central command center for contractors managing renovation
 * and new construction projects.
 *
 * Layout:
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
export function ProjectDashboard({ dashboardData, project, onAction, onPhaseTransition }) {
  const [showScopeModal, setShowScopeModal] = useState(false);

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
    setShowScopeModal(true);
    onAction?.('view_scope');
  };

  const handleAddNote = () => {
    onAction?.('add_note');
  };

  return (
    <div className="space-y-4">
      {/* Project Header - Full Width */}
      <ProjectHeader
        header={header}
        project={project}
        onAction={handleHeaderAction}
        onPhaseTransition={onPhaseTransition}
      />

      {/* Row 1: Client + Budget */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ClientCard
          clientData={client}
          onRequestDecision={handleRequestDecision}
        />
        <BudgetTracker
          budget={budget}
          onAddChangeOrder={handleAddChangeOrder}
        />
      </div>

      {/* Row 2: Schedule + Scope */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ScheduleSnapshot schedule={schedule} />
        <ScopeSummary
          scope={scope}
          onViewFullScope={handleViewFullScope}
        />
      </div>

      {/* Action Items - Full Width (Most important after header) */}
      <ActionItems
        actionItems={actionItems}
        onResolveBlocker={handleResolveBlocker}
        onCompleteTask={handleCompleteTask}
        onApprove={handleApprove}
      />

      {/* Row 3: Team + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TeamSection team={team} />
        <DashboardActivityFeed
          activities={activities}
          onAddNote={handleAddNote}
        />
      </div>
    </div>
  );
}

/**
 * ProjectDashboardCompact - Smaller version for sidebar/overview
 */
export function ProjectDashboardCompact({ dashboardData }) {
  const { header, client, budget, schedule, actionItems } = dashboardData;

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
