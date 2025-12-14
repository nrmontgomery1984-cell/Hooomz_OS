import { useState, useMemo } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Trash2,
  Edit2,
  MapPin,
  Layers,
  Plus,
} from 'lucide-react';
import {
  SCOPE_ITEMS,
  summarizeInstances,
  calculateInstanceTotals,
  calculateWallSF,
  BUILD_TIERS,
} from '../../lib/estimateHelpers';
import { formatCurrency } from '../../lib/costCatalogue';

/**
 * InstanceList - Summary sidebar showing all added instances
 *
 * - Collapsed view: shows totals by wall type AND assembly
 * - Expanded view: shows individual instances
 * - Edit/delete buttons per instance
 * - Grand total with tier breakdown
 */
export function InstanceList({
  instances,
  assemblies,
  ceilingHeight, // legacy single value
  ceilingHeights, // new per-level object
  catalogueData,
  onDeleteInstance,
  onEditInstance,
  onAddInstance, // Callback to trigger add mode
  selectedTier = 'better',
  defaultCollapsed = true, // Default to collapsed view
}) {
  // Support both old single ceilingHeight and new per-level ceilingHeights
  const effectiveCeilingHeight = ceilingHeights || ceilingHeight || 9;
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [expandedCategories, setExpandedCategories] = useState({
    structure: false,
    openings: false,
    surfaces: false,
    mep: false,
  });

  // Helper to get ceiling height for a level
  const getCeilingHeightForLevel = (level) => {
    if (typeof effectiveCeilingHeight === 'object' && effectiveCeilingHeight !== null) {
      return effectiveCeilingHeight[level] || 9;
    }
    return effectiveCeilingHeight || 9;
  };

  const summary = summarizeInstances(instances, assemblies, effectiveCeilingHeight, catalogueData);
  const totals = calculateInstanceTotals(instances, assemblies, effectiveCeilingHeight, catalogueData);

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Group by scope item AND assembly for collapsed view
  const collapsedSummary = useMemo(() => {
    const byTypeAndAssembly = {};
    if (!instances || !Array.isArray(instances)) return [];

    instances.forEach(instance => {
      // Find scope item info
      const scopeItem = Object.values(SCOPE_ITEMS)
        .flatMap(cat => cat.items)
        .find(item => item.id === instance.scopeItemId);

      // Find assembly info
      const assembly = assemblies?.find(a => a.id === instance.assemblyId);
      const assemblyName = assembly?.name || 'Default';
      const assemblyId = instance.assemblyId || 'default';

      // Create unique key for scope item + assembly combination
      const key = `${instance.scopeItemId}__${assemblyId}`;

      if (!byTypeAndAssembly[key]) {
        byTypeAndAssembly[key] = {
          scopeItemId: instance.scopeItemId,
          scopeItemName: scopeItem?.name || instance.scopeItemId,
          assemblyId,
          assemblyName,
          totalLF: 0,
          totalSF: 0,
          totalCost: 0,
          instances: [],
          byLevel: {},
        };
      }

      // Calculate measurements
      const lf = instance.measurement || 0;
      const levelHeight = getCeilingHeightForLevel(instance.level);
      const sf = scopeItem?.convertToSF ? calculateWallSF(lf, levelHeight) : lf;

      // Calculate cost
      const laborCost = (assembly?.laborCostPerUnit || 0) * sf;
      const materialsCost = (assembly?.materialCostPerUnit || 0) * sf;

      byTypeAndAssembly[key].totalLF += lf;
      byTypeAndAssembly[key].totalSF += sf;
      byTypeAndAssembly[key].totalCost += laborCost + materialsCost;
      byTypeAndAssembly[key].instances.push(instance);

      // Track by level
      if (!byTypeAndAssembly[key].byLevel[instance.level]) {
        byTypeAndAssembly[key].byLevel[instance.level] = { lf: 0, sf: 0 };
      }
      byTypeAndAssembly[key].byLevel[instance.level].lf += lf;
      byTypeAndAssembly[key].byLevel[instance.level].sf += sf;
    });

    return Object.values(byTypeAndAssembly);
  }, [instances, assemblies, effectiveCeilingHeight]);

  // Group summary items by category for expanded view
  const groupedSummary = {};
  Object.entries(SCOPE_ITEMS).forEach(([categoryKey, categoryData]) => {
    const items = categoryData.items
      .map(item => summary[item.id])
      .filter(Boolean);

    if (items.length > 0) {
      groupedSummary[categoryKey] = {
        name: categoryData.name,
        items,
        totalCost: items.reduce((sum, item) => sum + item.totalCost, 0),
        totalQuantity: items.reduce((sum, item) => sum + item.totalQuantity, 0),
      };
    }
  });

  const tierMultiplier = BUILD_TIERS[selectedTier]?.multiplier || 1;

  if (instances.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">📋</div>
          <p className="text-sm">No items added yet</p>
          <p className="text-xs mt-1 text-gray-400">
            Use the tabs to add structure, openings, and other items
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header with Toggle */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-charcoal">Estimate Summary</h3>
            <p className="text-xs text-gray-500">{instances.length} items added</p>
          </div>
          <div className="flex items-center gap-2">
            {onAddInstance && (
              <button
                onClick={onAddInstance}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-charcoal text-white rounded hover:bg-charcoal/90 font-medium"
              >
                <Plus className="w-3 h-3" />
                Add
              </button>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              {isCollapsed ? 'Show Details' : 'Collapse'}
            </button>
          </div>
        </div>
      </div>

      {/* Collapsed View - Shows totals by wall type + assembly */}
      {isCollapsed ? (
        <div className="divide-y divide-gray-100">
          {collapsedSummary.map((item) => (
            <div
              key={`${item.scopeItemId}__${item.assemblyId}`}
              className="px-4 py-3 hover:bg-gray-50"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="font-medium text-sm text-charcoal truncate">
                      {item.scopeItemName}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 ml-6">
                    {item.assemblyName}
                  </div>
                  {/* Level breakdown in pills */}
                  {Object.keys(item.byLevel).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5 ml-6">
                      {Object.entries(item.byLevel).map(([level, data]) => (
                        <span
                          key={level}
                          className="inline-flex items-center px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                        >
                          <span className="capitalize">{level}</span>: {data.lf.toFixed(1)} LF
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right ml-3 flex-shrink-0">
                  <div className="text-sm font-semibold text-charcoal">
                    {item.totalLF.toFixed(1)} LF
                  </div>
                  <div className="text-xs text-gray-500">
                    {item.totalSF.toLocaleString()} SF
                  </div>
                  <div className="text-sm font-medium text-blue-600 mt-0.5">
                    {formatCurrency(item.totalCost * tierMultiplier)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Expanded View - Original detailed view */
        <div className="divide-y divide-gray-100">
          {Object.entries(groupedSummary).map(([categoryKey, category]) => (
            <div key={categoryKey}>
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(categoryKey)}
                className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {expandedCategories[categoryKey] ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="font-medium text-sm text-charcoal">
                    {category.name}
                  </span>
                  <span className="text-xs text-gray-400">
                    ({category.items.length})
                  </span>
                </div>
                <span className="text-sm font-semibold text-charcoal">
                  {formatCurrency(category.totalCost * tierMultiplier)}
                </span>
              </button>

              {/* Category Items */}
              {expandedCategories[categoryKey] && (
                <div className="bg-gray-50/50 px-4 py-2 space-y-2">
                  {category.items.map((item) => (
                    <div
                      key={item.scopeItemId}
                      className="bg-white rounded-lg border border-gray-200 p-3"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-medium text-sm text-charcoal">
                            {item.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.totalQuantity.toLocaleString()}{' '}
                            {item.instances[0]?.unit?.toUpperCase() || 'units'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-sm text-charcoal">
                            {formatCurrency(item.totalCost * tierMultiplier)}
                          </div>
                          <div className="text-xs text-gray-400">
                            L: {formatCurrency(item.totalLabor)} | M:{' '}
                            {formatCurrency(item.totalMaterials)}
                          </div>
                        </div>
                      </div>

                      {/* By Level Breakdown */}
                      {Object.keys(item.byLevel).length > 1 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {Object.entries(item.byLevel).map(([level, data]) => (
                            <span
                              key={level}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs"
                            >
                              <MapPin className="w-3 h-3" />
                              {level}: {data.quantity.toLocaleString()}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Instance Actions */}
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100 flex-wrap">
                        {item.instances.map((instance, idx) => (
                          <div
                            key={instance.id}
                            className="flex items-center gap-1 text-xs text-gray-500"
                          >
                            {idx > 0 && <span className="text-gray-300">|</span>}
                            <span className="capitalize">{instance.level}</span>
                            <span>({instance.measurement})</span>
                            <button
                              onClick={() => onDeleteInstance?.(instance.id)}
                              className="p-0.5 text-gray-400 hover:text-red-500 rounded"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Totals Footer */}
      <div className="border-t-2 border-gray-200 bg-gray-50 px-4 py-3">
        {/* Labor/Materials Breakdown */}
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-500">Labor:</span>
          <span className="font-medium">{formatCurrency(totals.labor)}</span>
        </div>
        <div className="flex justify-between text-sm mb-3">
          <span className="text-gray-500">Materials:</span>
          <span className="font-medium">{formatCurrency(totals.materials)}</span>
        </div>

        {/* Tier Totals */}
        <div className="border-t border-gray-200 pt-3 space-y-1">
          <div
            className={`flex justify-between text-sm ${
              selectedTier === 'good' ? 'font-bold text-blue-600' : 'text-gray-500'
            }`}
          >
            <span>Good:</span>
            <span>{formatCurrency(totals.good)}</span>
          </div>
          <div
            className={`flex justify-between text-sm ${
              selectedTier === 'better' ? 'font-bold text-indigo-600' : 'text-gray-500'
            }`}
          >
            <span>Better:</span>
            <span>{formatCurrency(totals.better)}</span>
          </div>
          <div
            className={`flex justify-between text-sm ${
              selectedTier === 'best' ? 'font-bold text-purple-600' : 'text-gray-500'
            }`}
          >
            <span>Best:</span>
            <span>{formatCurrency(totals.best)}</span>
          </div>
        </div>

        {/* Selected Tier Grand Total */}
        <div className="mt-3 pt-3 border-t border-gray-300">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-charcoal">
              {BUILD_TIERS[selectedTier]?.label || 'Better'} Total:
            </span>
            <span className="text-xl font-bold text-charcoal">
              {formatCurrency(totals[selectedTier] || totals.better)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InstanceList;
