import { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, ChevronDown, ChevronUp, AlertCircle, Plus } from 'lucide-react';
import { Card, Button } from '../ui';
import { formatCurrency, formatPercent } from '../../lib/dashboardHelpers';
import { usePermissions } from '../../hooks/usePermissions';

/**
 * BudgetTracker - Visual budget health display
 *
 * Role-based visibility:
 * - Contractors: See all data including margin, costs breakdown
 * - Homeowners: See contract value, remaining budget (no margin, no detailed costs)
 * - Subcontractors: Limited view
 */
export function BudgetTracker({ budget, onAddChangeOrder, onViewChangeOrder }) {
  const [expanded, setExpanded] = useState(false);
  const { isContractor, isHomeowner } = usePermissions();

  const {
    estimatedTotal,
    contractValue,
    totalSpent,
    totalCommitted,
    totalRemaining,
    changeOrders,
    marginTarget,
    currentMargin,
    costsByCategory,
  } = budget;

  const usedTotal = totalSpent + totalCommitted;
  const usedPct = contractValue > 0 ? usedTotal / contractValue : 0;
  const spentPct = contractValue > 0 ? totalSpent / contractValue : 0;
  const committedPct = contractValue > 0 ? totalCommitted / contractValue : 0;

  // Health determination
  const getHealthColor = () => {
    if (usedPct >= 0.95) return 'red';
    if (usedPct >= 0.80) return 'amber';
    return 'emerald';
  };

  const healthColor = getHealthColor();
  const pendingChangeOrders = changeOrders.filter(co => co.status === 'pending');
  const marginDiff = marginTarget - currentMargin;

  return (
    <Card className="p-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-charcoal flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-gray-400" />
          Budget
        </h3>
        {/* Only show usage percentage to contractors */}
        {isContractor && (
          <span className={`text-sm font-medium text-${healthColor}-600`}>
            {formatPercent(usedPct)} used
          </span>
        )}
      </div>

      {/* Main Budget Display */}
      <div className="mb-4">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-2xl font-bold text-charcoal">
            {formatCurrency(contractValue || estimatedTotal)}
          </span>
          <span className="text-sm text-gray-500">Contract Value</span>
        </div>

        {/* Progress Bar - Different detail levels */}
        {isContractor ? (
          <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden mb-2">
            {/* Spent portion */}
            <div
              className={`absolute left-0 top-0 h-full bg-${healthColor}-600 transition-all duration-500`}
              style={{ width: `${Math.min(spentPct * 100, 100)}%` }}
            />
            {/* Committed portion */}
            <div
              className={`absolute top-0 h-full bg-${healthColor}-400 transition-all duration-500`}
              style={{
                left: `${Math.min(spentPct * 100, 100)}%`,
                width: `${Math.min(committedPct * 100, 100 - spentPct * 100)}%`
              }}
            />

            {/* 80% warning line */}
            <div
              className="absolute top-0 h-full w-0.5 bg-gray-400"
              style={{ left: '80%' }}
            />
          </div>
        ) : (
          /* Homeowner - simple spent progress bar */
          <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
            <div
              className="absolute left-0 top-0 h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${Math.min(spentPct * 100, 100)}%` }}
            />
          </div>
        )}

        {/* Legend - Different for contractors vs homeowners */}
        {isContractor ? (
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <div className="flex items-center gap-1 mb-0.5">
                <span className={`w-2 h-2 rounded-full bg-${healthColor}-600`} />
                <span className="text-gray-500">Spent</span>
              </div>
              <span className="font-medium text-charcoal">{formatCurrency(totalSpent)}</span>
            </div>
            <div>
              <div className="flex items-center gap-1 mb-0.5">
                <span className={`w-2 h-2 rounded-full bg-${healthColor}-400`} />
                <span className="text-gray-500">Committed</span>
              </div>
              <span className="font-medium text-charcoal">{formatCurrency(totalCommitted)}</span>
            </div>
            <div>
              <div className="flex items-center gap-1 mb-0.5">
                <span className="w-2 h-2 rounded-full bg-gray-200" />
                <span className="text-gray-500">Remaining</span>
              </div>
              <span className="font-medium text-charcoal">{formatCurrency(totalRemaining)}</span>
            </div>
          </div>
        ) : (
          /* Homeowner view - transparent but without margin details */
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <div className="flex items-center gap-1 mb-0.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-gray-500">Spent to Date</span>
              </div>
              <span className="font-medium text-charcoal">{formatCurrency(totalSpent)}</span>
            </div>
            <div>
              <div className="flex items-center gap-1 mb-0.5">
                <span className="w-2 h-2 rounded-full bg-gray-200" />
                <span className="text-gray-500">Remaining</span>
              </div>
              <span className="font-medium text-charcoal">{formatCurrency(totalRemaining)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Margin Indicator - Contractor Only */}
      {isContractor && marginTarget > 0 && (
        <div className={`
          flex items-center justify-between p-2 rounded-lg mb-4
          ${marginDiff > 5
            ? 'bg-red-50 border border-red-200'
            : marginDiff > 0
              ? 'bg-amber-50 border border-amber-200'
              : 'bg-emerald-50 border border-emerald-200'
          }
        `}>
          <div className="flex items-center gap-2 text-sm">
            {marginDiff > 0 ? (
              <TrendingDown className="w-4 h-4 text-red-500" />
            ) : (
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            )}
            <span className="text-gray-700">Margin</span>
          </div>
          <div className="text-sm">
            <span className={`font-medium ${marginDiff > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
              {currentMargin.toFixed(1)}%
            </span>
            <span className="text-gray-500"> / {marginTarget}% target</span>
          </div>
        </div>
      )}

      {/* Change Orders - Show to both contractors and homeowners */}
      {(isContractor || (isHomeowner && pendingChangeOrders.length > 0)) && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">
              {isHomeowner ? 'Pending Approvals' : 'Change Orders'}
            </h4>
            {isContractor && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onAddChangeOrder}
                className="text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add
              </Button>
            )}
          </div>

          {pendingChangeOrders.length > 0 ? (
            <div className="space-y-2">
              {pendingChangeOrders.slice(0, 3).map((co) => (
                <button
                  key={co.id}
                  onClick={() => onViewChangeOrder?.(co)}
                  className="w-full flex items-center justify-between p-2 bg-amber-50 border border-amber-200 rounded-lg text-sm hover:bg-amber-100 transition-colors text-left"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <span className="text-charcoal truncate">{co.title || co.description}</span>
                  </div>
                  <span className="font-medium text-amber-700 flex-shrink-0 ml-2">{formatCurrency(co.amount)}</span>
                </button>
              ))}
              {pendingChangeOrders.length > 3 && (
                <p className="text-xs text-gray-500 text-center">
                  +{pendingChangeOrders.length - 3} more pending
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">No pending change orders</p>
          )}
        </div>
      )}

      {/* Expandable Category Breakdown - Contractor Only */}
      {isContractor && costsByCategory.length > 0 && (
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-between w-full text-sm text-gray-600 hover:text-charcoal transition-colors"
          >
            <span>Cost Breakdown by Category</span>
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {expanded && (
            <div className="mt-3 space-y-2">
              {costsByCategory.map((cat) => (
                <CategoryRow key={cat.category} category={cat} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Homeowner - show percentage spent */}
      {isHomeowner && (
        <div className="text-center text-sm text-gray-600">
          <span className="font-medium text-charcoal">{formatPercent(spentPct)}</span> of budget used
        </div>
      )}
    </Card>
  );
}

/**
 * CategoryRow - Budget category breakdown item
 */
function CategoryRow({ category }) {
  const usedPct = category.budgeted > 0
    ? ((category.spent + category.committed) / category.budgeted) * 100
    : 0;

  const getVarianceColor = () => {
    if (category.variance < 0) return 'text-red-600';
    if (category.variance > category.budgeted * 0.1) return 'text-emerald-600';
    return 'text-gray-600';
  };

  return (
    <div className="p-2 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-charcoal">{category.category}</span>
        <span className={`text-xs font-medium ${getVarianceColor()}`}>
          {category.variance >= 0 ? '+' : ''}{formatCurrency(category.variance)}
        </span>
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${usedPct > 100 ? 'bg-red-500' : 'bg-blue-500'}`}
          style={{ width: `${Math.min(usedPct, 100)}%` }}
        />
      </div>
      <div className="flex justify-between mt-1 text-xs text-gray-500">
        <span>Spent: {formatCurrency(category.spent)}</span>
        <span>Budget: {formatCurrency(category.budgeted)}</span>
      </div>
    </div>
  );
}

/**
 * BudgetSummaryCard - Compact budget display
 */
export function BudgetSummaryCard({ budget }) {
  const usedPct = budget.contractValue > 0
    ? ((budget.totalSpent + budget.totalCommitted) / budget.contractValue) * 100
    : 0;

  return (
    <div className="p-2 bg-white border border-gray-200 rounded-lg min-w-0">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-500">Budget</span>
        <span className={`text-xs font-medium ${usedPct > 80 ? 'text-amber-600' : 'text-emerald-600'}`}>
          {Math.round(usedPct)}%
        </span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${usedPct > 95 ? 'bg-red-500' : usedPct > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
          style={{ width: `${Math.min(usedPct, 100)}%` }}
        />
      </div>
    </div>
  );
}
