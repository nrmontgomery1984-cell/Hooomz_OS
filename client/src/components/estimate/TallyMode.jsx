import { useState, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';
import {
  SCOPE_ITEMS,
  initializeTallyCounts,
  tallyCountsToInstances,
} from '../../lib/estimateHelpers';

/**
 * TallyMode - +/- counters for repetitive items per level
 *
 * Grid layout:
 * - Rows = item types (doors, windows, etc.)
 * - Columns = levels (Basement, Main, 2nd Floor, etc.)
 * - Each cell has +/- buttons and count
 */
export function TallyMode({
  scopeCategory = 'openings',
  levels,
  instances,
  onInstancesChange,
}) {
  const scopeItems = SCOPE_ITEMS[scopeCategory]?.items || [];

  // Initialize counts from existing instances
  const [counts, setCounts] = useState(() => {
    const initial = initializeTallyCounts(levels, scopeItems);

    // Populate from existing instances
    instances
      .filter(inst => scopeItems.some(item => item.id === inst.scopeItemId))
      .forEach(inst => {
        if (initial[inst.scopeItemId]?.[inst.level] !== undefined) {
          initial[inst.scopeItemId][inst.level] += inst.measurement;
        }
      });

    return initial;
  });

  // Sync back to instances when counts change
  useEffect(() => {
    // Remove old instances for this category
    const otherInstances = instances.filter(
      inst => !scopeItems.some(item => item.id === inst.scopeItemId)
    );

    // Add new instances from counts
    const newInstances = tallyCountsToInstances(counts);

    onInstancesChange?.([...otherInstances, ...newInstances]);
  }, [counts]);

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

  // Calculate totals
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

  // Calculate cost estimates
  const getItemCost = (item) => {
    const total = getItemTotal(item.id);
    return total * (item.defaultCost || 0);
  };

  const getTotalCost = () => {
    return scopeItems.reduce((sum, item) => sum + getItemCost(item), 0);
  };

  return (
    <div className="space-y-4">
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
                    {getGrandTotal()}
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

      {/* Help Text */}
      <p className="text-xs text-gray-500">
        Use +/- buttons or type directly to count items per level.
        Costs are estimates based on default rates.
      </p>
    </div>
  );
}

export default TallyMode;
