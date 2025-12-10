import { formatCurrency, formatPercent } from '../../lib/dashboardHelpers';

/**
 * BudgetBar - Stacked horizontal bar showing budget breakdown
 *
 * Displays: Spent (dark) | Committed (medium) | Remaining (light)
 * With contract value marker line.
 */
export function BudgetBar({ spent, committed, remaining, contractValue, showLabels = true }) {
  const total = spent + committed + remaining;
  const spentPct = total > 0 ? (spent / total) * 100 : 0;
  const committedPct = total > 0 ? (committed / total) * 100 : 0;

  // Determine health color based on usage
  const usedPct = (spent + committed) / contractValue;
  const healthColor = usedPct >= 0.95 ? 'red' : usedPct >= 0.80 ? 'amber' : 'emerald';

  return (
    <div className="w-full">
      {/* Labels */}
      {showLabels && (
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Budget Usage</span>
          <span>{formatPercent((spent + committed) / contractValue)} used</span>
        </div>
      )}

      {/* Stacked Bar */}
      <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
        {/* Spent */}
        <div
          className={`absolute left-0 top-0 h-full bg-${healthColor}-600 transition-all duration-500`}
          style={{ width: `${spentPct}%` }}
        />
        {/* Committed */}
        <div
          className={`absolute top-0 h-full bg-${healthColor}-400 transition-all duration-500`}
          style={{ left: `${spentPct}%`, width: `${committedPct}%` }}
        />
        {/* Remaining (implied by gray background) */}

        {/* Contract Value Marker */}
        {contractValue && total > contractValue && (
          <div
            className="absolute top-0 h-full w-0.5 bg-charcoal"
            style={{ left: `${(contractValue / total) * 100}%` }}
          />
        )}
      </div>

      {/* Legend */}
      {showLabels && (
        <div className="flex items-center gap-4 mt-2 text-xs">
          <div className="flex items-center gap-1">
            <span className={`w-2.5 h-2.5 rounded-full bg-${healthColor}-600`} />
            <span className="text-gray-600">Spent</span>
            <span className="font-medium text-charcoal">{formatCurrency(spent)}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className={`w-2.5 h-2.5 rounded-full bg-${healthColor}-400`} />
            <span className="text-gray-600">Committed</span>
            <span className="font-medium text-charcoal">{formatCurrency(committed)}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-200" />
            <span className="text-gray-600">Remaining</span>
            <span className="font-medium text-charcoal">{formatCurrency(remaining)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * BudgetMini - Compact budget indicator for cards
 */
export function BudgetMini({ spent, committed, total }) {
  const usedPct = total > 0 ? ((spent + committed) / total) * 100 : 0;

  const getColor = () => {
    if (usedPct >= 95) return 'red';
    if (usedPct >= 80) return 'amber';
    return 'emerald';
  };

  const color = getColor();

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full bg-${color}-500 transition-all`}
          style={{ width: `${Math.min(usedPct, 100)}%` }}
        />
      </div>
      <span className={`text-xs font-medium text-${color}-600`}>
        {Math.round(usedPct)}%
      </span>
    </div>
  );
}
