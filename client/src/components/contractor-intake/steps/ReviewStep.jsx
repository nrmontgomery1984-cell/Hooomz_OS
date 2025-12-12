import { Edit2, Building2, Layers, Calendar, User, DollarSign, AlertTriangle, MapPin } from 'lucide-react';
import { useMemo } from 'react';
import { Card } from '../../ui';
import {
  SCOPE_ITEMS,
  UNIT_LABELS,
  PROJECT_TYPES,
  SPEC_LEVELS,
  STOREY_OPTIONS,
  CEILING_HEIGHT_OPTIONS,
  getEnabledCategories,
  getCategoryScopeItems,
  getTotalScopeItemCount,
} from '../../../data/contractorIntakeSchema';
import { getCostSummary, getCostBreakdown } from '../../../lib/scopeCostEstimator';
import {
  SCOPE_ITEMS as ESTIMATE_SCOPE_ITEMS,
  calculateInstanceTotals,
  DEFAULT_WALL_ASSEMBLIES,
} from '../../../lib/estimateHelpers';
import { formatCurrency } from '../../../lib/costCatalogue';

/**
 * Review Step - Summary of all entered data before submission
 */
export function ReviewStep({ data, onEditStep }) {
  const { project, client, scope, schedule, building, instances = [], assemblies = [] } = data;

  const enabledCategories = getEnabledCategories(scope);
  const totalOldScopeItems = getTotalScopeItemCount(scope);
  const hasInstances = instances.length > 0;

  // Total items count (old format + new instances)
  const totalItems = totalOldScopeItems + instances.length;

  const projectType = PROJECT_TYPES.find(t => t.value === project.projectType);
  const specLevel = SPEC_LEVELS.find(s => s.value === project.specLevel);
  const storeyOption = STOREY_OPTIONS.find(s => s.value === building?.storeys);

  // Calculate instance-based costs
  const instanceTotals = useMemo(() => {
    if (!hasInstances) return null;
    const ceilingHeights = building?.ceilingHeights || { basement: 8, main: 9, second: 8, third: 8 };
    const projectAssemblies = assemblies.length > 0 ? assemblies : DEFAULT_WALL_ASSEMBLIES;
    return calculateInstanceTotals(instances, projectAssemblies, ceilingHeights, null);
  }, [instances, assemblies, building?.ceilingHeights, hasInstances]);

  // Calculate costs from the Cost Catalogue (old format)
  const costEstimate = useMemo(() => {
    return getCostSummary(scope, project.specLevel);
  }, [scope, project.specLevel]);

  const costBreakdown = useMemo(() => {
    return getCostBreakdown(scope, project.specLevel);
  }, [scope, project.specLevel]);

  // Group instances by category for display
  const instancesByCategory = useMemo(() => {
    const grouped = {};
    Object.entries(ESTIMATE_SCOPE_ITEMS).forEach(([categoryKey, categoryData]) => {
      const categoryInstances = instances.filter(inst =>
        categoryData.items.some(item => item.id === inst.scopeItemId)
      );
      if (categoryInstances.length > 0) {
        grouped[categoryKey] = {
          name: categoryData.name,
          instances: categoryInstances,
          items: categoryData.items,
        };
      }
    });
    return grouped;
  }, [instances]);

  // Calculate end date
  const getEndDate = () => {
    if (!schedule.startDate || !schedule.estimatedDuration) return null;
    const start = new Date(schedule.startDate);
    const weeks = parseInt(schedule.estimatedDuration);
    if (isNaN(weeks)) return null;
    const end = new Date(start);
    end.setDate(end.getDate() + (weeks * 7));
    return end;
  };

  const endDate = getEndDate();

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        Review your project details before creating. You can edit any section by clicking the edit button.
      </p>

      {/* Project Info */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
          <h3 className="font-medium text-charcoal flex items-center gap-2">
            <Building2 className="w-4 h-4 text-gray-400" />
            Project Information
          </h3>
          <button
            type="button"
            onClick={() => onEditStep(0)}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Project Name</span>
            <span className="font-medium text-charcoal">{project.name || '—'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Address</span>
            <span className="font-medium text-charcoal">{project.address || '—'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Type</span>
            <span className="font-medium text-charcoal">{projectType?.label || '—'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Spec Level</span>
            <span className="font-medium text-charcoal">{specLevel?.label || '—'}</span>
          </div>
          {/* Building Configuration */}
          {building && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Storeys</span>
                <span className="font-medium text-charcoal">{storeyOption?.label || building.storeys}</span>
              </div>
              {building.ceilingHeights && (
                <div className="text-sm">
                  <span className="text-gray-500">Ceiling Heights:</span>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {building.hasBasement && (
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                        Basement: {building.ceilingHeights.basement || 8}'
                      </span>
                    )}
                    <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                      Main: {building.ceilingHeights.main || 9}'
                    </span>
                    {parseFloat(building.storeys || '1') >= 1.5 && (
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                        2nd: {building.ceilingHeights.second || 8}'
                      </span>
                    )}
                    {parseFloat(building.storeys || '1') >= 3 && (
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                        3rd: {building.ceilingHeights.third || 8}'
                      </span>
                    )}
                  </div>
                </div>
              )}
              {building.hasBasement && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Basement</span>
                  <span className="font-medium text-charcoal">Yes</span>
                </div>
              )}
            </>
          )}
          {project.notes && (
            <div className="pt-2 border-t border-gray-100">
              <span className="text-sm text-gray-500 block mb-1">Notes</span>
              <p className="text-sm text-charcoal">{project.notes}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Client Info (if provided) */}
      {client.hasClient && (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
            <h3 className="font-medium text-charcoal flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              Client Information
            </h3>
            <button
              type="button"
              onClick={() => onEditStep(0)}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Name</span>
              <span className="font-medium text-charcoal">{client.name || '—'}</span>
            </div>
            {client.email && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Email</span>
                <span className="font-medium text-charcoal">{client.email}</span>
              </div>
            )}
            {client.phone && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Phone</span>
                <span className="font-medium text-charcoal">{client.phone}</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Scope of Work */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
          <h3 className="font-medium text-charcoal flex items-center gap-2">
            <Layers className="w-4 h-4 text-gray-400" />
            Scope of Work
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              {totalItems} items
            </span>
          </h3>
          <button
            type="button"
            onClick={() => onEditStep(1)}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4">
          {/* Instance-based scope (new format) */}
          {hasInstances && (
            <div className="space-y-4">
              {Object.entries(instancesByCategory).map(([categoryKey, categoryData]) => (
                <div key={categoryKey}>
                  <h4 className="text-sm font-medium text-charcoal mb-2">
                    {categoryData.name}
                  </h4>
                  <div className="space-y-2">
                    {categoryData.instances.map(inst => {
                      const itemDef = categoryData.items.find(i => i.id === inst.scopeItemId);
                      return (
                        <div key={inst.id} className="flex items-center justify-between text-sm pl-3 py-1 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">{itemDef?.name || inst.scopeItemId}</span>
                            <span className="flex items-center gap-1 text-xs text-blue-600">
                              <MapPin className="w-3 h-3" />
                              {inst.level}
                            </span>
                          </div>
                          <span className="font-mono text-gray-900">
                            {inst.measurement} {itemDef?.unit?.toUpperCase() || 'units'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              {/* Instance totals */}
              {instanceTotals && (
                <div className="pt-3 mt-3 border-t border-gray-200">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Labor</span>
                    <span className="font-medium">{formatCurrency(instanceTotals.labor)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Materials</span>
                    <span className="font-medium">{formatCurrency(instanceTotals.materials)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-charcoal">Estimate (Better tier)</span>
                    <span className="text-blue-600">{formatCurrency(instanceTotals.better)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Old scope format - show if no instances but has old scope items */}
          {!hasInstances && enabledCategories.length > 0 && (
            <div className="space-y-4">
              {enabledCategories.map(code => {
                const category = SCOPE_ITEMS[code];
                const items = getCategoryScopeItems(scope, code);

                if (items.length === 0) return null;

                return (
                  <div key={code}>
                    <h4 className="text-sm font-medium text-charcoal mb-2">
                      {category.name}
                    </h4>
                    <div className="space-y-1">
                      {items.map(item => (
                        <div key={item.id} className="flex items-center justify-between text-sm pl-3">
                          <span className="text-gray-600">{item.name}</span>
                          <span className="font-mono text-gray-900">
                            {item.qty} {UNIT_LABELS[item.unit]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* No scope items at all */}
          {!hasInstances && enabledCategories.length === 0 && (
            <p className="text-sm text-gray-500">No scope items added</p>
          )}
        </div>
      </Card>

      {/* Schedule */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
          <h3 className="font-medium text-charcoal flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            Schedule
          </h3>
          <button
            type="button"
            onClick={() => onEditStep(2)}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Start Date</span>
            <span className="font-medium text-charcoal">
              {schedule.startDate
                ? new Date(schedule.startDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : '—'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Duration</span>
            <span className="font-medium text-charcoal">
              {schedule.estimatedDuration
                ? `${schedule.estimatedDuration} week${schedule.estimatedDuration !== '1' ? 's' : ''}`
                : '—'}
            </span>
          </div>
          {endDate && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Est. Completion</span>
              <span className="font-medium text-blue-600">
                {endDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          )}
          {schedule.milestones?.length > 0 && (
            <div className="pt-2 border-t border-gray-100 mt-2">
              <span className="text-sm text-gray-500 block mb-2">Milestones</span>
              <div className="space-y-1">
                {schedule.milestones.map(m => (
                  <div key={m.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">{m.name}</span>
                    <span className="text-gray-900">
                      {new Date(m.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Cost Estimate */}
      {totalItems > 0 && (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-green-50 border-b border-green-100">
            <h3 className="font-medium text-charcoal flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              Cost Estimate
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                from Cost Catalogue
              </span>
            </h3>
          </div>
          <div className="p-4">
            {/* Summary totals */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Labour</div>
                <div className="text-lg font-semibold text-charcoal">{costEstimate.labour}</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Materials (est)</div>
                <div className="text-lg font-semibold text-charcoal">{costEstimate.materials}</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="text-xs text-green-600 mb-1">Total Estimate</div>
                <div className="text-lg font-bold text-green-700">{costEstimate.total}</div>
              </div>
            </div>

            {/* Low confidence warning */}
            {costEstimate.lowConfidenceCount > 0 && (
              <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-yellow-800">
                  <span className="font-medium">{costEstimate.lowConfidenceCount} items</span> use estimated rates (not from verified quotes).
                  Review these in the Cost Catalogue for more accurate pricing.
                </div>
              </div>
            )}

            {/* Category breakdown */}
            <div className="space-y-3">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Breakdown by Category
              </div>
              {costBreakdown.map(category => (
                <div key={category.code} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <span className="text-sm font-medium text-charcoal">{category.name}</span>
                    <span className="text-xs text-gray-400 ml-2">({category.itemCount} items)</span>
                  </div>
                  <span className="text-sm font-mono text-gray-700">{category.total}</span>
                </div>
              ))}
            </div>

            {/* Spec level note */}
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Estimates based on <span className="font-medium">{specLevel?.label || 'Standard'}</span> spec level.
                Actual costs may vary based on site conditions and material selections.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Summary Banner */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <span className="font-medium">Ready to create!</span> This will generate a new project with{' '}
          {hasInstances ? (
            <>
              <span className="font-medium">{Object.keys(instancesByCategory).length} work categories</span> and{' '}
              <span className="font-medium">{instances.length} scope items</span>
            </>
          ) : (
            <>
              <span className="font-medium">{enabledCategories.length} work categories</span> and{' '}
              <span className="font-medium">{totalOldScopeItems} scope items</span>
            </>
          )}
          . Tasks will be auto-generated based on your scope.
        </p>
      </div>
    </div>
  );
}
