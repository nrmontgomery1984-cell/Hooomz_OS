import { useState, useMemo } from 'react';
import { Layers, Ruler, Package, Zap, AlertCircle, Check, ChevronDown, ChevronUp, Settings, Plus, Trash2, Edit2, Home, Square, Hammer } from 'lucide-react';
import { Card } from '../../ui';
import { BulkAddMode, TallyMode, InstanceList, InlineAssemblyBuilder } from '../../estimate';
import {
  SCOPE_ITEMS,
  DEFAULT_BUILD_ASSEMBLIES,
  calculateInstanceTotals,
  loadAssemblyTemplates,
  saveAssemblyTemplate,
} from '../../../lib/estimateHelpers';
import { formatCurrency } from '../../../lib/costCatalogue';
import {
  ASSEMBLY_CATEGORIES,
  getAssembliesByCategory,
  getAssembliesBySubcategory,
} from '../../../lib/assembliesDatabase';

// Category tab icons for Build Assemblies
const CATEGORY_ICONS = {
  wall: Layers,
  floor: Square,
  roof: Home,
  foundation: Hammer,
};

/**
 * Scope Step - Instance-based scope entry with BulkAddMode and TallyMode
 *
 * Uses building configuration from ProjectInfoStep to derive levels.
 * Tabs for: Structure, Openings, Surfaces, MEP
 */
export function ScopeStep({ data, errors, onChange }) {
  const [activeTab, setActiveTab] = useState('structure');
  const [showAssemblyPanel, setShowAssemblyPanel] = useState(false);
  const [showAssemblyBuilder, setShowAssemblyBuilder] = useState(false);
  const [editingAssembly, setEditingAssembly] = useState(null); // Assembly being edited

  // Build Assemblies category tabs state
  const [activeAssemblyCategory, setActiveAssemblyCategory] = useState('wall');
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const [showAllAssemblies, setShowAllAssemblies] = useState(false);

  // Derive levels from building configuration
  const levels = useMemo(() => {
    const result = [];
    const storeys = data.building?.storeys || '1';
    const hasBasement = data.building?.hasBasement || false;

    if (hasBasement) {
      result.push({ value: 'basement', label: 'Basement' });
    }
    result.push({ value: 'main', label: 'Main Floor' });

    const numStoreys = parseFloat(storeys);
    if (numStoreys >= 1.5) {
      result.push({ value: 'second', label: '2nd Floor' });
    }
    if (numStoreys >= 3) {
      result.push({ value: 'third', label: '3rd Floor' });
    }

    return result;
  }, [data.building?.storeys, data.building?.hasBasement]);

  const ceilingHeights = data.building?.ceilingHeights || { basement: 8, main: 9, second: 8, third: 8 };
  const instances = data.instances || [];

  // Track selected assembly IDs
  const [selectedAssemblyIds, setSelectedAssemblyIds] = useState(() => {
    const existingIds = data.assemblies?.map(a => a.id) || [];
    return existingIds.length > 0 ? existingIds : ['ext-2x6-standard', 'int-partition-std'];
  });

  // Get legacy assemblies for backwards compatibility
  const legacyAssemblies = loadAssemblyTemplates();

  // Get assemblies for current category from the new database
  const categoryAssemblies = useMemo(() => {
    if (activeSubcategory) {
      return getAssembliesBySubcategory(activeAssemblyCategory, activeSubcategory);
    }
    return getAssembliesByCategory(activeAssemblyCategory);
  }, [activeAssemblyCategory, activeSubcategory]);

  // Get current category config
  const currentCategory = ASSEMBLY_CATEGORIES[activeAssemblyCategory];

  // Build the selected assemblies list (combining legacy and new database formats)
  const selectedAssemblies = useMemo(() => {
    const result = [];

    // Add legacy assemblies that are selected
    legacyAssemblies.forEach(a => {
      if (selectedAssemblyIds.includes(a.id)) {
        result.push({ ...a, selected: true });
      }
    });

    // Add database assemblies that are selected (convert to legacy format)
    selectedAssemblyIds.forEach(id => {
      // Skip if already in result (from legacy)
      if (result.some(a => a.id === id)) return;

      // Find in database
      for (const cat of Object.values(ASSEMBLY_CATEGORIES)) {
        for (const subcat of Object.values(cat.assemblies)) {
          if (subcat.assemblies[id]) {
            const dbAssembly = subcat.assemblies[id];
            result.push({
              id: dbAssembly.id,
              name: dbAssembly.name,
              description: dbAssembly.description,
              category: dbAssembly.category,
              unit: dbAssembly.unit,
              laborCostPerUnit: dbAssembly.laborCost,
              materialCostPerUnit: dbAssembly.materialCost,
              totalCostPerUnit: dbAssembly.totalCost,
              laborHours: dbAssembly.laborHours,
              components: dbAssembly.components,
              codeReference: dbAssembly.codeReference,
              notes: dbAssembly.notes,
              confidence: dbAssembly.confidence,
              selected: true,
              source: 'database',
            });
            return;
          }
        }
      }
    });

    return result;
  }, [selectedAssemblyIds, legacyAssemblies]);

  // Handle assembly selection toggle
  const handleAssemblyToggle = (assembly) => {
    const assemblyId = typeof assembly === 'string' ? assembly : assembly.id;
    const newSelectedIds = selectedAssemblyIds.includes(assemblyId)
      ? selectedAssemblyIds.filter(id => id !== assemblyId)
      : [...selectedAssemblyIds, assemblyId];

    setSelectedAssemblyIds(newSelectedIds);

    // Update parent with selected assemblies in legacy format
    const updatedAssemblies = [];

    // Add legacy assemblies
    legacyAssemblies.forEach(a => {
      if (newSelectedIds.includes(a.id)) {
        updatedAssemblies.push({ ...a, selected: true });
      }
    });

    // Add database assemblies (converted to legacy format)
    newSelectedIds.forEach(id => {
      if (updatedAssemblies.some(a => a.id === id)) return;

      for (const cat of Object.values(ASSEMBLY_CATEGORIES)) {
        for (const subcat of Object.values(cat.assemblies)) {
          if (subcat.assemblies[id]) {
            const dbAssembly = subcat.assemblies[id];
            updatedAssemblies.push({
              id: dbAssembly.id,
              name: dbAssembly.name,
              description: dbAssembly.description,
              category: dbAssembly.category,
              unit: dbAssembly.unit,
              laborCostPerUnit: dbAssembly.laborCost,
              materialCostPerUnit: dbAssembly.materialCost,
              totalCostPerUnit: dbAssembly.totalCost,
              laborHours: dbAssembly.laborHours,
              components: dbAssembly.components,
              codeReference: dbAssembly.codeReference,
              notes: dbAssembly.notes,
              confidence: dbAssembly.confidence,
              selected: true,
              source: 'database',
            });
            return;
          }
        }
      }
    });

    onChange(prev => ({
      ...prev,
      assemblies: updatedAssemblies,
    }));
  };

  // Handle saving new or edited assembly from builder
  const handleSaveAssembly = (assembly) => {
    // Save to templates for future use
    saveAssemblyTemplate(assembly);

    if (editingAssembly) {
      // Editing existing assembly - update in place
      onChange(prev => ({
        ...prev,
        assemblies: (prev.assemblies || []).map(a =>
          a.id === assembly.id ? assembly : a
        ),
      }));
      setEditingAssembly(null);
    } else {
      // Adding new assembly
      onChange(prev => ({
        ...prev,
        assemblies: [...(prev.assemblies || []), assembly],
      }));
    }

    setShowAssemblyBuilder(false);
  };

  // Handle editing assembly
  const handleEditAssembly = (assembly) => {
    setEditingAssembly(assembly);
    setShowAssemblyBuilder(true);
  };

  // Handle canceling assembly builder
  const handleCancelBuilder = () => {
    setShowAssemblyBuilder(false);
    setEditingAssembly(null);
  };

  // Handle deleting custom assembly
  const handleDeleteAssembly = (assemblyId) => {
    onChange(prev => ({
      ...prev,
      assemblies: (prev.assemblies || []).filter(a => a.id !== assemblyId),
    }));
  };

  // Calculate running totals
  const totals = useMemo(() => {
    return calculateInstanceTotals(instances, assemblies, ceilingHeights, null);
  }, [instances, assemblies, ceilingHeights]);

  // Handle instances change
  const handleInstancesChange = (newInstances) => {
    onChange(prev => ({
      ...prev,
      instances: newInstances,
    }));
  };

  // Tab configuration
  const tabs = [
    { id: 'structure', label: 'Structure', icon: Layers, mode: 'bulk' },  // Floors, walls, ceilings, roof framing
    { id: 'openings', label: 'Openings', icon: Package, mode: 'tally' },
    { id: 'surfaces', label: 'Finishes', icon: Ruler, mode: 'bulk' },
    { id: 'mep', label: 'MEP', icon: Zap, mode: 'tally' },
  ];

  const activeTabConfig = tabs.find(t => t.id === activeTab);
  const scopeCategory = SCOPE_ITEMS[activeTab];

  return (
    <div className="space-y-4">
      {errors.scope && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {errors.scope}
        </div>
      )}

      {/* Building Config Summary */}
      <Card className="p-3 bg-blue-50 border-blue-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-blue-700">
              <strong>Levels:</strong> {levels.map(l => `${l.label} (${ceilingHeights[l.value] || 9}')`).join(', ')}
            </span>
          </div>
          {instances.length > 0 && (
            <span className="font-semibold text-blue-800">
              Running Total: {formatCurrency(totals.better || 0)}
            </span>
          )}
        </div>
      </Card>

      {/* Assembly Selection Panel */}
      <Card className="overflow-hidden">
        <button
          onClick={() => setShowAssemblyPanel(!showAssemblyPanel)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-gray-500" />
            <span className="font-medium text-charcoal text-sm">Build Assemblies</span>
            <span className="text-xs text-gray-500">
              ({selectedAssemblies.length} selected)
            </span>
          </div>
          {showAssemblyPanel ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {showAssemblyPanel && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-500">
                Select build assemblies to use for measurements. These determine labor + material costs.
              </p>
              {!showAssemblyBuilder && (
                <button
                  onClick={() => setShowAssemblyBuilder(true)}
                  className="flex items-center gap-1 text-sm text-charcoal hover:text-charcoal/80 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Build New
                </button>
              )}
            </div>

            {/* Inline Assembly Builder */}
            {showAssemblyBuilder && (
              <div className="mb-4">
                <InlineAssemblyBuilder
                  assembly={editingAssembly}
                  onSave={handleSaveAssembly}
                  onCancel={handleCancelBuilder}
                />
              </div>
            )}

            {/* Category Tabs */}
            <div className="flex border-b border-gray-200 mb-3">
              {Object.values(ASSEMBLY_CATEGORIES).map((category) => {
                const Icon = CATEGORY_ICONS[category.id] || Layers;
                const isActive = activeAssemblyCategory === category.id;
                const selectedCount = selectedAssemblyIds.filter(id =>
                  getAssembliesByCategory(category.id).some(a => a.id === id)
                ).length;

                return (
                  <button
                    key={category.id}
                    onClick={() => {
                      setActiveAssemblyCategory(category.id);
                      setActiveSubcategory(null);
                      setShowAllAssemblies(false);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                      isActive
                        ? 'text-charcoal border-charcoal'
                        : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {category.label}
                    {selectedCount > 0 && (
                      <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
                        isActive ? 'bg-charcoal text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {selectedCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Subcategory Filter Pills */}
            {currentCategory && (
              <div className="flex flex-wrap gap-1 mb-3">
                <button
                  onClick={() => setActiveSubcategory(null)}
                  className={`px-2 py-1 text-xs rounded-full transition-colors ${
                    !activeSubcategory
                      ? 'bg-charcoal text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                {Object.entries(currentCategory.subcategories).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setActiveSubcategory(key)}
                    className={`px-2 py-1 text-xs rounded-full transition-colors ${
                      activeSubcategory === key
                        ? 'bg-charcoal text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {/* Assembly Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {(showAllAssemblies ? categoryAssemblies : categoryAssemblies.slice(0, 6)).map((assembly) => {
                const isSelected = selectedAssemblyIds.includes(assembly.id);
                return (
                  <button
                    key={assembly.id}
                    onClick={() => handleAssemblyToggle(assembly)}
                    className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-colors ${
                      isSelected
                        ? 'bg-green-50 border-green-300'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-green-500 text-white'
                          : 'border-2 border-gray-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-charcoal truncate">
                        {assembly.name}
                      </div>
                      <div className="text-xs text-gray-500 line-clamp-2">
                        {assembly.description}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-emerald-600 font-medium">
                          ${assembly.totalCost?.toFixed(2) || '0.00'}/{assembly.unit}
                        </span>
                        {assembly.confidence && (
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            assembly.confidence === 'high'
                              ? 'bg-green-100 text-green-700'
                              : assembly.confidence === 'medium'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {assembly.confidence}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Show More / Less Button */}
            {categoryAssemblies.length > 6 && (
              <button
                onClick={() => setShowAllAssemblies(!showAllAssemblies)}
                className="w-full mt-2 py-2 text-sm text-gray-500 hover:text-charcoal flex items-center justify-center gap-1"
              >
                {showAllAssemblies ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Show All ({categoryAssemblies.length - 6} more)
                  </>
                )}
              </button>
            )}

            <p className="text-xs text-gray-500 mt-2">
              Select assemblies for cost calculations. Costs include labor + materials based on NB pricing.
            </p>
          </div>
        )}
      </Card>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const categoryItems = SCOPE_ITEMS[tab.id]?.items || [];
          const itemCount = instances.filter(inst =>
            categoryItems.some(item => item.id === inst.scopeItemId)
          ).length;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-charcoal text-charcoal'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {itemCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {itemCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTabConfig?.mode === 'bulk' ? (
          <BulkAddMode
            scopeCategory={activeTab}
            levels={levels}
            ceilingHeights={ceilingHeights}
            assemblies={selectedAssemblies.length > 0 ? selectedAssemblies : DEFAULT_BUILD_ASSEMBLIES}
            instances={instances}
            onInstancesChange={handleInstancesChange}
          />
        ) : (
          <TallyMode
            scopeCategory={activeTab}
            levels={levels}
            instances={instances}
            onInstancesChange={handleInstancesChange}
          />
        )}
      </div>

      {/* Instance Summary (collapsible) */}
      {instances.length > 0 && (
        <div className="mt-6">
          <InstanceList
            instances={instances}
            assemblies={selectedAssemblies.length > 0 ? selectedAssemblies : DEFAULT_BUILD_ASSEMBLIES}
            ceilingHeights={ceilingHeights}
            catalogueData={null}
            onDeleteInstance={(id) => {
              handleInstancesChange(instances.filter(inst => inst.id !== id));
            }}
            selectedTier="better"
          />
        </div>
      )}

      {/* Help Text */}
      <p className="text-xs text-gray-500 mt-4">
        {activeTabConfig?.mode === 'bulk'
          ? 'Enter measurements in linear feet for walls or square feet for surfaces. Press Enter to add more rows.'
          : 'Use +/- buttons to count items per level. Costs are estimates based on default rates.'}
      </p>
    </div>
  );
}
