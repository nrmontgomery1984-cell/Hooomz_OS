import {
  AlertTriangle,
  AlertCircle,
  Clock,
  CheckCircle2,
  MessageCircle,
  Package,
  Users,
  ClipboardCheck,
  DollarSign,
  FileCheck,
  ChevronRight,
  Info,
} from 'lucide-react';
import { Card, Button, Checkbox } from '../ui';
import { daysUntil } from '../../lib/dashboardHelpers';
import { getSeverityColors } from '../../lib/alertRules';

/**
 * ActionItems - Blockers, overdue tasks, today's tasks, approvals, alerts
 */
export function ActionItems({ actionItems, onResolveBlocker, onCompleteTask, onApprove }) {
  const {
    blockers,
    overdueTasks,
    todayTasks,
    pendingApprovals,
    alerts,
  } = actionItems;

  const hasUrgentItems = blockers.length > 0 || alerts.some(a => a.severity === 'critical');

  return (
    <Card className={`p-4 ${hasUrgentItems ? 'border-red-200 bg-red-50/30' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-charcoal flex items-center gap-2">
          <AlertTriangle className={`w-4 h-4 ${hasUrgentItems ? 'text-red-500' : 'text-gray-400'}`} />
          Action Items
        </h3>
        {hasUrgentItems && (
          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
            Needs Attention
          </span>
        )}
      </div>

      {/* Blockers - Most Critical */}
      {blockers.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-red-700 mb-2 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            Blockers ({blockers.length})
          </h4>
          <div className="space-y-2">
            {blockers.map((blocker) => (
              <BlockerCard
                key={blocker.id}
                blocker={blocker}
                onResolve={() => onResolveBlocker?.(blocker.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">System Alerts</h4>
          <div className="space-y-2">
            {alerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </div>
      )}

      {/* Pending Approvals */}
      {pendingApprovals.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <ClipboardCheck className="w-3.5 h-3.5 text-amber-500" />
            Pending Approvals ({pendingApprovals.length})
          </h4>
          <div className="space-y-2">
            {pendingApprovals.map((approval) => (
              <ApprovalCard
                key={approval.id}
                approval={approval}
                onApprove={() => onApprove?.(approval.id, true)}
                onDecline={() => onApprove?.(approval.id, false)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Overdue Tasks */}
      {overdueTasks.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-red-700 mb-2 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Overdue ({overdueTasks.length})
          </h4>
          <div className="space-y-1">
            {overdueTasks.slice(0, 5).map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                isOverdue
                onComplete={() => onCompleteTask?.(task.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Today's Tasks */}
      {todayTasks.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
            Today ({todayTasks.length})
          </h4>
          <div className="space-y-1">
            {todayTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onComplete={() => onCompleteTask?.(task.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {blockers.length === 0 &&
        overdueTasks.length === 0 &&
        todayTasks.length === 0 &&
        pendingApprovals.length === 0 &&
        alerts.length === 0 && (
          <div className="text-center py-6 text-gray-400">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
            <p className="text-sm">No action items - all clear!</p>
          </div>
        )}
    </Card>
  );
}

/**
 * BlockerCard - Critical blocker display
 */
function BlockerCard({ blocker, onResolve }) {
  const typeIcons = {
    decision: MessageCircle,
    material: Package,
    sub: Users,
    inspection: ClipboardCheck,
    payment: DollarSign,
    permit: FileCheck,
  };

  const Icon = typeIcons[blocker.type] || AlertCircle;

  return (
    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-start gap-3">
        <div className="p-1.5 bg-red-100 rounded-lg">
          <Icon className="w-4 h-4 text-red-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-charcoal">{blocker.description}</p>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
            <span>Blocking: {blocker.blockedPhase}</span>
            <span>•</span>
            <span>{blocker.daysSinceCreated}d old</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-red-600 font-medium">
              ACTION: {blocker.action}
            </span>
            <span className="text-xs text-gray-500">Owner: {blocker.owner}</span>
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={onResolve}
          className="text-xs flex-shrink-0"
        >
          Resolve
          <ChevronRight className="w-3 h-3 ml-1" />
        </Button>
      </div>
    </div>
  );
}

/**
 * AlertCard - System alert display
 */
function AlertCard({ alert }) {
  const colors = getSeverityColors(alert.severity);

  const icons = {
    critical: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const Icon = icons[alert.severity] || Info;

  return (
    <div className={`flex items-center gap-2 p-2 rounded-lg border ${colors.bg} ${colors.border}`}>
      <Icon className={`w-4 h-4 flex-shrink-0 ${colors.icon}`} />
      <span className={`text-sm flex-1 ${colors.text}`}>{alert.message}</span>
    </div>
  );
}

/**
 * ApprovalCard - Pending approval with quick actions
 */
function ApprovalCard({ approval, onApprove, onDecline }) {
  const typeLabels = {
    change_order: 'Change Order',
    payment: 'Payment',
    selection: 'Selection',
    schedule: 'Schedule',
  };

  return (
    <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-amber-700 font-medium">
          {typeLabels[approval.type] || approval.type}
        </span>
        <span className="text-xs text-gray-500">
          From: {approval.from}
        </span>
      </div>
      <p className="text-sm text-charcoal mb-2">{approval.description}</p>
      {approval.amount && (
        <p className="text-sm font-medium text-amber-700 mb-2">
          ${approval.amount.toLocaleString()}
        </p>
      )}
      <div className="flex gap-2">
        <Button size="sm" onClick={onApprove} className="text-xs flex-1">
          Approve
        </Button>
        <Button variant="secondary" size="sm" onClick={onDecline} className="text-xs flex-1">
          Decline
        </Button>
      </div>
    </div>
  );
}

/**
 * TaskItem - Single task in checklist
 */
function TaskItem({ task, isOverdue, onComplete }) {
  const daysOver = daysUntil(task.dueDate) * -1;

  const priorityColors = {
    high: 'text-red-600',
    medium: 'text-amber-600',
    low: 'text-gray-500',
  };

  return (
    <div className={`
      flex items-center gap-2 p-2 rounded-lg border transition-colors
      ${isOverdue ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200 hover:border-gray-300'}
    `}>
      <Checkbox checked={false} onChange={onComplete} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-charcoal truncate">{task.title}</p>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className={priorityColors[task.priority]}>{task.priority}</span>
          {task.assignedTo && (
            <>
              <span>•</span>
              <span>{task.assignedTo}</span>
            </>
          )}
        </div>
      </div>
      {isOverdue && (
        <span className="text-xs text-red-600 font-medium flex-shrink-0">
          {daysOver}d overdue
        </span>
      )}
    </div>
  );
}

/**
 * ActionItemsCompact - Summary view
 */
export function ActionItemsCompact({ actionItems }) {
  const totalUrgent = actionItems.blockers.length +
    actionItems.overdueTasks.length +
    actionItems.alerts.filter(a => a.severity === 'critical').length;

  return (
    <div className={`
      p-3 rounded-lg border
      ${totalUrgent > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}
    `}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Action Items</span>
        {totalUrgent > 0 ? (
          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
            {totalUrgent} urgent
          </span>
        ) : (
          <span className="text-xs text-emerald-600">All clear</span>
        )}
      </div>
      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
        {actionItems.blockers.length > 0 && (
          <span className="text-red-600">{actionItems.blockers.length} blockers</span>
        )}
        {actionItems.overdueTasks.length > 0 && (
          <span className="text-amber-600">{actionItems.overdueTasks.length} overdue</span>
        )}
        {actionItems.todayTasks.length > 0 && (
          <span>{actionItems.todayTasks.length} today</span>
        )}
      </div>
    </div>
  );
}
