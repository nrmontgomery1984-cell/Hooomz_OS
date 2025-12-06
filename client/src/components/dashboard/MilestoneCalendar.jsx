import { ClipboardCheck, Truck, HardHat, Users, DollarSign, AlertCircle } from 'lucide-react';
import { formatDate, daysUntil } from '../../lib/dashboardHelpers';

/**
 * MilestoneCalendar - Upcoming milestones display
 */
export function MilestoneCalendar({ milestones = [], maxItems = 5 }) {
  const sortedMilestones = [...milestones].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const visibleMilestones = sortedMilestones.slice(0, maxItems);

  if (visibleMilestones.length === 0) {
    return (
      <div className="text-center py-4 text-gray-400 text-sm">
        No upcoming milestones
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {visibleMilestones.map((milestone) => (
        <MilestoneItem key={milestone.id} milestone={milestone} />
      ))}
    </div>
  );
}

/**
 * MilestoneItem - Single milestone row
 */
export function MilestoneItem({ milestone }) {
  const days = daysUntil(milestone.date);

  const typeConfig = {
    inspection: { icon: ClipboardCheck, color: 'text-blue-500', bg: 'bg-blue-50' },
    delivery: { icon: Truck, color: 'text-amber-500', bg: 'bg-amber-50' },
    sub_start: { icon: HardHat, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    client_walkthrough: { icon: Users, color: 'text-purple-500', bg: 'bg-purple-50' },
    payment: { icon: DollarSign, color: 'text-green-500', bg: 'bg-green-50' },
  };

  const { icon: Icon, color, bg } = typeConfig[milestone.type] || typeConfig.inspection;

  const getStatusStyle = () => {
    if (milestone.status === 'overdue' || days < 0) {
      return 'text-red-600 bg-red-50 border-red-200';
    }
    if (milestone.status === 'today' || days === 0) {
      return 'text-blue-600 bg-blue-50 border-blue-200';
    }
    return 'text-gray-600 bg-white border-gray-200';
  };

  const getDaysLabel = () => {
    if (days < 0) return `${Math.abs(days)}d overdue`;
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `${days}d`;
  };

  return (
    <div
      className={`
        flex items-center gap-3 p-2.5 rounded-lg border transition-colors
        hover:border-gray-300 ${getStatusStyle()}
      `}
    >
      <div className={`p-1.5 rounded-lg ${bg}`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-charcoal truncate">{milestone.name}</p>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{formatDate(milestone.date)}</span>
          {milestone.assignedTo && (
            <>
              <span>•</span>
              <span>{milestone.assignedTo}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {(milestone.status === 'overdue' || days < 0) && (
          <AlertCircle className="w-4 h-4 text-red-500" />
        )}
        <span
          className={`
            text-xs font-medium px-2 py-0.5 rounded-full
            ${days <= 0
              ? 'bg-red-100 text-red-700'
              : days <= 3
                ? 'bg-amber-100 text-amber-700'
                : 'bg-gray-100 text-gray-600'
            }
          `}
        >
          {getDaysLabel()}
        </span>
      </div>
    </div>
  );
}

/**
 * MilestoneTimeline - Horizontal timeline view
 */
export function MilestoneTimeline({ milestones = [], weeks = 2 }) {
  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + weeks * 7);

  // Filter milestones within range
  const visibleMilestones = milestones.filter((m) => {
    const date = new Date(m.date);
    return date >= today && date <= endDate;
  });

  const typeConfig = {
    inspection: { color: 'bg-blue-500' },
    delivery: { color: 'bg-amber-500' },
    sub_start: { color: 'bg-emerald-500' },
    client_walkthrough: { color: 'bg-purple-500' },
    payment: { color: 'bg-green-500' },
  };

  return (
    <div className="relative">
      {/* Timeline bar */}
      <div className="h-1 bg-gray-200 rounded-full" />

      {/* Today marker */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow" />

      {/* Milestone markers */}
      {visibleMilestones.map((milestone) => {
        const date = new Date(milestone.date);
        const totalDays = weeks * 7;
        const daysFromStart = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
        const position = (daysFromStart / totalDays) * 100;
        const { color } = typeConfig[milestone.type] || typeConfig.inspection;

        return (
          <div
            key={milestone.id}
            className="absolute top-1/2 -translate-y-1/2 group"
            style={{ left: `${Math.min(position, 100)}%` }}
          >
            <div className={`w-2.5 h-2.5 rounded-full ${color} border-2 border-white shadow`} />

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-charcoal text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              {milestone.name} - {formatDate(milestone.date)}
            </div>
          </div>
        );
      })}

      {/* Week labels */}
      <div className="flex justify-between mt-2 text-xs text-gray-400">
        <span>Today</span>
        <span>{weeks} weeks</span>
      </div>
    </div>
  );
}
