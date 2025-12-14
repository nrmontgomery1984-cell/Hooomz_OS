import { useState, useMemo } from 'react';
import { Plus, Minus, Calculator } from 'lucide-react';
import {
  SCOPE_ITEMS,
  initializeTallyCounts,
  createInstance,
} from '../../lib/estimateHelpers';

/**
 * TallyMode - +/- counters for repetitive items per level
 *
 * Grid layout:
 * - Rows = item types (doors, windows, etc.)
 * - Columns = levels (Basement, Main, 2nd Floor, etc.)
 * - Each cell has +/- buttons and count
 *
 * Like BulkAddMode, this uses local state and an explicit "Add to Estimate" button.
 */
export function TallyMode({
  scopeCategory = 'openings',
  levels,
  instances,
  onInstancesChange,
}) {
  const scopeItems = SCOPE_ITEMS[scopeCategory]?.items || [];

  // Memoize scopeItemIds so it doesn't change on every render
  const scopeItemIds = useMemo(
    () => scopeItems.map(item => item.id),
    [scopeCategory]
  );

  // Local counts state (not synced to parent until "Add to Estimate" is clicked)
  const [counts, setCounts] = useState(() => initializeTallyCounts(levels, scopeItems));

  // Get existing counts from instances (for display)
  const existingCounts = useMemo(() => {
    const existing = {};
    instances
      .filter(inst => scopeItemIds.includes(inst.scopeItemId))
      .forEach(inst => {
        if (!existing[inst.scopeItemId]) {
          existing[inst.scopeItemId] = {};
        }
        existing[inst.scopeItemId][inst.level] =
          (existing[inst.scopeItemId][inst.level] || 0) + (inst.measurement || 0);
      });
    return existing;
  }, [instances, scopeItemIds]);

  const handleIncrement = (itemId, levelValue) => {
    setCounts(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [levelValue]: (prev[itemId]?.[levelValue] || 0) + 1,
      },
    }));
  };

  const handleDecrement = (itemId, levelValue) => {
    setCounts(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [levelValue]: Math.max(0, (prev[itemId]?.[levelValue] || 0) - 1),
      },
    }));
  };

  const handleInputChange = (itemId, levelValue, value) => {
    const numValue = parseInt(value) || 0;
    setCounts(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [levelValue]: Math.max(0, numValue),
      },
    }));
  };

  // Calculate totals from LOCAL counts (pending)
  const getItemTotal = (itemId) => {
    return Object.values(counts[itemId] || {}).reduce((sum, count) => sum + count, 0);
  };

  const getLevelTotal = (levelValue) => {
    return scopeItems.reduce((sum, item) => {
      return sum + (counts[item.id]?.[levelValue] || 0);
    }, 0);
  };

  const getGrandTotal = () => {
    return scopeItems.reduce((sum, item) => sum + getItemTotal(item.id), 0);
  };

  // Calculate totals from EXISTING instances (already saved)
  const getExistingItemTotal = (itemId) => {
    return Object.values(existingCounts[itemId] || {}).reduce((sum, count) => sum + count, 0);
  };

  const getExistingGrandTotal = () => {
    return scopeItems.reduce((sum, item) => sum + getExistingItemTotal(item.id), 0);
  };

  // Calculate cost estimates
  const getItemCost = (item) => {
    const total = getItemTotal(item.id);
    return total * (item.defaultCost || 0);
  };

  const getTotalCost = () => {
    return scopeItems.reduce((sum, item) => sum + getItemCost(item), 0);
  };

  // Add to Estimate - commits current counts to instances
  const handleAddToEstimate = () => {
    const newInstances = [];

    // Convert counts to instances
    Object.entries(counts).forEach(([scopeItemId, levelCounts]) => {
      Object.entries(levelCounts).forEach(([level, count]) => {
        if (count > 0) {
          newInstances.push(
            createInstance({
              scopeItemId,
              level,
              measurement: count,
            })
          );
        }
      });
    });

    console.log('[TallyMode] Adding instances:', newInstances);
    console.log('[TallyMode] Current counts:', counts);

    if (newInstances.length === 0) {
      console.log('[TallyMode] No instances to add');
      return;
    }

    // Keep instances from other categories, add new ones
    const otherInstances = instances.filter(
      inst => !scopeItemIds.includes(inst.scopeItemId)
    );
    const allInstances = [...otherInstances, ...newInstances];
    console.log('[TallyMode] Other instances:', otherInstances.length);
    console.log('[TallyMode] Total instances after add:', allInstances.length);

    onInstancesChange(allInstances);

    // Reset local counts
    setCounts(initializeTallyCounts(levels, scopeItems));
  };

  const pendingTotal = getGrandTotal();
  const existingTotal = getExistingGrandTotal();

  return (
    <div className="space-y-4">
      {/* Existing Items Summary */}
      {existingTotal > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
          <div className="text-sm text-blue-800 font-medium">
            Already in estimate: {existingTotal} items
          </div>
          <div className="text-xs text-blue-600 mt-1">
            {scopeItems.map(item => {
              const count = getExistingItemTotal(item.id);
              return count > 0 ? `${item.name}: ${count}` : null;
            }).filter(Boolean).join(' • ')}
          </div>
        </div>
      )}

      {/* Tally Grid */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase sticky left-0 bg-gray-50 min-w-[140px]">
                  Item
                </th>
                {levels?.map((level) => (
                  <th
                    key={level.value}
                    className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase min-w-[100px]"
                  >
                    {level.label}
                  </th>
                ))}
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase min-w-[80px] bg-gray-100">
                  Total
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase min-w-[90px] bg-gray-100">
                  Est. Cost
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {scopeItems.map((item) => {
                const itemTotal = getItemTotal(item.id);
                const itemCost = getItemCost(item);

                return (
                  <tr key={item.id} className="hover:bg-gray-50/50">
                    <td className="px-3 py-2 sticky left-0 bg-white">
                      <div className="font-medium text-sm text-charcoal">
                        {item.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        ${item.defaultCost?.toLocaleString() || 0}/ea
                      </div>
                    </td>
                    {levels?.map((level) => {
                      const count = counts[item.id]?.[level.value] || 0;
                      return (
                        <td key={level.value} className="px-2 py-2">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleDecrement(item.id, level.value)}
                              disabled={count === 0}
                              className="w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <input
                              type="number"
                              value={count}
                              onChange={(e) =>
                                handleInputChange(item.id, level.value, e.target.value)
                              }
                              className="w-10 text-center text-sm font-medium border border-gray-200 rounded py-1 focus:ring-1 focus:ring-charcoal/20 focus:border-charcoal"
                              min="0"
                            />
                            <button
                              onClick={() => handleIncrement(item.id, level.value)}
                              className="w-7 h-7 flex items-center justify-center bg-charcoal hover:bg-charcoal/90 rounded text-white"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      );
                    })}
                    <td className="px-3 py-2 text-center bg-gray-50">
                      <span
                        className={`inline-flex items-center justify-center min-w-[32px] px-2 py-1 rounded-full text-sm font-semibold ${
                          itemTotal > 0
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {itemTotal}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right bg-gray-50">
                      <span
                        className={`text-sm font-medium ${
                          itemCost > 0 ? 'text-charcoal' : 'text-gray-400'
                        }`}
                      >
                        ${itemCost.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-100 border-t-2 border-gray-200">
              <tr>
                <td className="px-3 py-2 font-semibold text-sm text-charcoal sticky left-0 bg-gray-100">
                  Level Totals
                </td>
                {levels?.map((level) => {
                  const levelTotal = getLevelTotal(level.value);
                  return (
                    <td key={level.value} className="px-3 py-2 text-center">
                      <span
                        className={`text-sm font-semibold ${
                          levelTotal > 0 ? 'text-charcoal' : 'text-gray-400'
                        }`}
                      >
                        {levelTotal}
                      </span>
                    </td>
                  );
                })}
                <td className="px-3 py-2 text-center">
                  <span className="inline-flex items-center justify-center min-w-[40px] px-2 py-1 rounded-full text-sm font-bold bg-charcoal text-white">
                    {pendingTotal}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  <span className="text-sm font-bold text-charcoal">
                    ${getTotalCost().toLocaleString()}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Subtotal & Add to Estimate Button */}
      <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
        <div>
          <div className="text-sm text-gray-600">
            Pending: <span className="font-semibold text-charcoal">{pendingTotal} items</span>
          </div>
          {getTotalCost() > 0 && (
            <div className="text-xs text-gray-500">
              Est. cost: ${getTotalCost().toLocaleString()}
            </div>
          )}
        </div>
        <button
          onClick={handleAddToEstimate}
          disabled={pendingTotal === 0}
          className="flex items-center gap-2 px-4 py-2 bg-charcoal text-white rounded-lg text-sm font-medium hover:bg-charcoal/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Calculator className="w-4 h-4" />
          Add to Estimate
        </button>
      </div>

      {/* Help Text */}
      <p className="text-xs text-gray-500">
        Use +/- buttons or type directly to count items per level, then click "Add to Estimate".
      </p>
    </div>
  );
}

export default TallyMode;
