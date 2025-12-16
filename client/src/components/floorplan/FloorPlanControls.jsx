import {
  Layers,
  Zap,
  Droplets,
  Wind,
  Square,
  Tag,
  X,
  ChevronDown,
} from 'lucide-react';

/**
 * FloorPlanControls - Floor selector, trade filter, and status summary
 */
export function FloorPlanControls({
  floorPlans = [],
  currentFloorPlanId,
  onFloorPlanChange,
  tradeFilter,
  onTradeFilterChange,
  statusSummary,
  showLabels,
  onToggleLabels,
  TRADE_COLORS = {},
}) {
  const TRADES = [
    { key: 'framing', label: 'Framing', icon: Layers },
    { key: 'electrical', label: 'Electrical', icon: Zap },
    { key: 'plumbing', label: 'Plumbing', icon: Droplets },
    { key: 'hvac', label: 'HVAC', icon: Wind },
    { key: 'drywall', label: 'Drywall', icon: Square },
    { key: 'insulation', label: 'Insulation', icon: Layers },
    { key: 'flooring', label: 'Flooring', icon: Square },
    { key: 'trim', label: 'Trim', icon: Layers },
    { key: 'paint', label: 'Paint', icon: Droplets },
  ];

  return (
    <div className="space-y-4">
      {/* Floor Selector */}
      {floorPlans.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <label className="block text-xs font-medium text-gray-500 mb-2">
            Floor Level
          </label>
          <div className="flex flex-wrap gap-2">
            {floorPlans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => onFloorPlanChange(plan.id)}
                className={`
                  px-3 py-1.5 text-sm rounded-lg transition-colors
                  ${currentFloorPlanId === plan.id
                    ? 'bg-charcoal text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {plan.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Trade Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-500">
            Filter by Trade
          </label>
          {tradeFilter && (
            <button
              onClick={() => onTradeFilterChange(null)}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => onTradeFilterChange(null)}
            className={`
              px-2.5 py-1 text-xs rounded-full transition-colors flex items-center gap-1
              ${!tradeFilter
                ? 'bg-charcoal text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            All
          </button>
          {TRADES.map((trade) => {
            const Icon = trade.icon;
            const isActive = tradeFilter === trade.key;
            const color = TRADE_COLORS[trade.key] || '#6B7280';

            return (
              <button
                key={trade.key}
                onClick={() => onTradeFilterChange(isActive ? null : trade.key)}
                className={`
                  px-2.5 py-1 text-xs rounded-full transition-colors flex items-center gap-1
                  ${isActive
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
                style={isActive ? { backgroundColor: color } : {}}
              >
                <Icon className="w-3 h-3" />
                {trade.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Options */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showLabels}
            onChange={(e) => onToggleLabels(e.target.checked)}
            className="rounded border-gray-300 text-charcoal focus:ring-charcoal"
          />
          <span className="text-sm text-gray-700">Show element labels</span>
        </label>
      </div>

      {/* Status Summary */}
      {statusSummary && (
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <label className="block text-xs font-medium text-gray-500 mb-3">
            Progress Summary
          </label>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">Overall Progress</span>
              <span className="font-medium text-charcoal">
                {statusSummary.overallProgress}%
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${statusSummary.overallProgress}%` }}
              />
            </div>
          </div>

          {/* Status counts */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-gray-600">Total Elements</span>
              <span className="font-medium">{statusSummary.totalElements}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-gray-600">Linked to Loops</span>
              <span className="font-medium">{statusSummary.linkedElements}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-emerald-50 rounded">
              <span className="text-emerald-700">Completed</span>
              <span className="font-medium text-emerald-700">
                {(statusSummary.statusCounts?.completed || 0) + (statusSummary.statusCounts?.complete || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 bg-amber-50 rounded">
              <span className="text-amber-700">In Progress</span>
              <span className="font-medium text-amber-700">
                {(statusSummary.statusCounts?.in_progress || 0) + (statusSummary.statusCounts?.active || 0)}
              </span>
            </div>
            {(statusSummary.statusCounts?.blocked || 0) > 0 && (
              <div className="flex items-center justify-between p-2 bg-red-50 rounded col-span-2">
                <span className="text-red-700">Blocked</span>
                <span className="font-medium text-red-700">
                  {statusSummary.statusCounts.blocked}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default FloorPlanControls;
