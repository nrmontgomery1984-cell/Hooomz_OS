import { TrendingUp, TrendingDown, DollarSign, AlertTriangle } from 'lucide-react';
import { EXPENSE_CATEGORIES, formatCurrency } from '../../lib/expenses';

export function ExpenseSummary({ totals, budget }) {
  const remaining = budget - totals.total;
  const percentUsed = budget > 0 ? (totals.total / budget) * 100 : 0;
  const isOverBudget = remaining < 0;
  const isWarning = percentUsed >= 80 && percentUsed < 100;

  // Get top categories by spending
  const categorySpending = Object.entries(totals.byCategory)
    .filter(([_, amount]) => amount > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <div className="space-y-4">
      {/* Main Budget Card */}
      <div className={`rounded-xl p-4 ${
        isOverBudget ? 'bg-red-50 border border-red-200' :
        isWarning ? 'bg-amber-50 border border-amber-200' :
        'bg-emerald-50 border border-emerald-200'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-600">Budget Status</span>
          {isOverBudget && (
            <span className="flex items-center gap-1 text-xs font-medium text-red-600">
              <AlertTriangle className="w-3 h-3" />
              Over Budget
            </span>
          )}
        </div>

        {/* Progress Bar */}
        <div className="h-3 bg-white rounded-full overflow-hidden mb-3">
          <div
            className={`h-full transition-all ${
              isOverBudget ? 'bg-red-500' :
              isWarning ? 'bg-amber-500' :
              'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(percentUsed, 100)}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500 mb-1">Budget</p>
            <p className="font-semibold text-charcoal">{formatCurrency(budget)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Spent</p>
            <p className={`font-semibold ${isOverBudget ? 'text-red-600' : 'text-charcoal'}`}>
              {formatCurrency(totals.total)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Remaining</p>
            <p className={`font-semibold ${isOverBudget ? 'text-red-600' : 'text-emerald-600'}`}>
              {formatCurrency(remaining)}
            </p>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {categorySpending.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-3">Spending by Category</h3>
          <div className="space-y-2">
            {categorySpending.map(([categoryId, amount]) => {
              const category = EXPENSE_CATEGORIES.find(c => c.id === categoryId);
              const percent = totals.total > 0 ? (amount / totals.total) * 100 : 0;
              return (
                <div key={categoryId} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-700">{category?.name || categoryId}</span>
                      <span className="font-medium text-charcoal">{formatCurrency(amount)}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 w-10 text-right">
                    {percent.toFixed(0)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <p className="text-2xl font-bold text-charcoal">{totals.count}</p>
          <p className="text-xs text-gray-500">Total Expenses</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <p className="text-2xl font-bold text-charcoal">
            {totals.count > 0 ? formatCurrency(totals.total / totals.count) : '$0'}
          </p>
          <p className="text-xs text-gray-500">Avg. Expense</p>
        </div>
      </div>
    </div>
  );
}
