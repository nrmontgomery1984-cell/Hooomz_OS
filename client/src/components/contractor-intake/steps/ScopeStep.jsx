import { useState, useMemo } from 'react';
import { Layers, Ruler, Package, Zap, AlertCircle, Check, ChevronDown, ChevronUp, Settings, Plus, Trash2, Edit2 } from 'lucide-react';
import { Card } from '../../ui';
import { BulkAddMode, TallyMode, InstanceList, InlineAssemblyBuilder } from '../../estimate';
import {
  SCOPE_ITEMS,
  DEFAULT_WALL_ASSEMBLIES,
  calculateInstanceTotals,
  loadAssemblyTemplates,
  saveAssemblyTemplate,
} from '../../../lib/estimateHelpers';
import { formatCurrency } from '../../../lib/costCatalogue';

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

  // Load all available assemblies and merge with project-selected ones
  const allAssemblies = loadAssemblyTemplates();
  const projectAssemblyIds = data.assemblies?.map(a => a.id) || [];
  const assemblies = allAssemblies.map(a => ({
    ...a,
    selected: projectAssemblyIds.length > 0
      ? projectAssemblyIds.includes(a.id)
      : ['ext-2x6', 'int-2x4'].includes(a.id), // Default selections
  }));
  const selectedAssemblies = assemblies.filter(a => a.selected);

  // Handle assembly selection toggle
  const handleAssemblyToggle = (assemblyId) => {
    const newAssemblies = assemblies.map(a => ({
      ...a,
      selected: a.id === assemblyId ? !a.selected : a.selected,
    }));
    onChange(prev => ({
      ...prev,
      assemblies: newAssemblies.filter(a => a.selected),
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
            <span className="font-medium text-charcoal text-sm">Wall Assemblies</span>
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
                Select wall assemblies to use for measurements. These determine labor + material costs.
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

            {/* Assembly Grid */}
            <div className="grid grid-cols-2 gap-2">
              {assemblies.map((assembly) => (
                <div
                  key={assembly.id}
                  className={`relative flex items-start gap-2 p-3 rounded-lg border text-left transition-colors ${
                    assembly.selected
                      ? 'bg-green-50 border-green-300'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <button
                    onClick={() => handleAssemblyToggle(assembly.id)}
                    className="flex items-start gap-2 flex-1"
                  >
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        assembly.selected
                          ? 'bg-green-500 text-white'
                          : 'border-2 border-gray-300'
                      }`}
                    >
                      {assembly.selected && <Check className="w-3 h-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-charcoal truncate">
                        {assembly.name}
                        {assembly.isCustom && (
                          <span className="ml-1 text-xs text-blue-600">(custom)</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {assembly.description}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        ${(assembly.laborCostPerUnit + assembly.materialCostPerUnit).toFixed(2)}/SF
                      </div>
                    </div>
                  </button>
                  {assembly.isCustom && (
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditAssembly(assembly);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-500"
                        title="Edit assembly"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAssembly(assembly.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-500"
                        title="Delete custom assembly"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
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
            assemblies={selectedAssemblies.length > 0 ? selectedAssemblies : DEFAULT_WALL_ASSEMBLIES}
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
            assemblies={selectedAssemblies.length > 0 ? selectedAssemblies : DEFAULT_WALL_ASSEMBLIES}
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
