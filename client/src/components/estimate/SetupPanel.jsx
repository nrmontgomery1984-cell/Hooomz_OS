import { useState, useMemo } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Ruler,
  Layers,
  Plus,
  Check,
  Edit2,
  Trash2,
  X,
  Home,
  Square,
  Hammer,
} from 'lucide-react';
import { CEILING_HEIGHTS, loadAssemblyTemplates } from '../../lib/estimateHelpers';
import {
  ASSEMBLY_CATEGORIES,
  getAssembliesByCategory,
  getAssembliesBySubcategory,
} from '../../lib/assembliesDatabase';

// Common level presets for quick add
const LEVEL_PRESETS = [
  { value: 'basement', label: 'Basement' },
  { value: 'main', label: 'Main Floor' },
  { value: 'second', label: '2nd Floor' },
  { value: 'third', label: '3rd Floor' },
  { value: 'fourth', label: '4th Floor' },
  { value: 'attic', label: 'Attic' },
  { value: 'garage', label: 'Garage' },
  { value: 'exterior', label: 'Exterior' },
];

// Category tab icons
const CATEGORY_ICONS = {
  wall: Layers,
  floor: Square,
  roof: Home,
  foundation: Hammer,
};

/**
 * SetupPanel - One-time configuration for estimate
 *
 * - Ceiling height selector (persists for all wall calculations)
 * - Project levels display (derived from intake) + add custom levels
 * - Build assembly selector with category tabs (walls, floors, roofs, foundation)
 */
export function SetupPanel({
  ceilingHeight,
  onCeilingHeightChange,
  levels,
  onLevelsChange,
  assemblies,
  onAssembliesChange,
  onOpenAssemblyBuilder,
  collapsed = false,
  onToggleCollapse,
}) {
  // Track selected assemblies from the new database
  const [selectedAssemblies, setSelectedAssemblies] = useState(() => {
    // Get IDs from existing assemblies prop or use defaults
    const existingIds = assemblies?.filter(a => a.selected)?.map(a => a.id) || [];
    // Default selections for new projects
    return existingIds.length > 0 ? existingIds : ['ext-2x6-standard', 'int-partition-std'];
  });
  const [showAddLevel, setShowAddLevel] = useState(false);
  const [customLevelName, setCustomLevelName] = useState('');

  // Build Assemblies tab state
  const [activeCategory, setActiveCategory] = useState('wall');
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const [showAllAssemblies, setShowAllAssemblies] = useState(false);

  // Get legacy assemblies for backwards compatibility
  const legacyAssemblies = loadAssemblyTemplates();

  // Get assemblies for current category
  const categoryAssemblies = useMemo(() => {
    if (activeSubcategory) {
      return getAssembliesBySubcategory(activeCategory, activeSubcategory);
    }
    return getAssembliesByCategory(activeCategory);
  }, [activeCategory, activeSubcategory]);

  // Get current category config
  const currentCategory = ASSEMBLY_CATEGORIES[activeCategory];

  // Get available presets (not already added)
  const availablePresets = LEVEL_PRESETS.filter(
    preset => !levels?.some(l => l.value === preset.value)
  );

  const handleAddLevel = (level) => {
    if (!onLevelsChange) return;
    const newLevels = [...(levels || []), level];
    onLevelsChange(newLevels);
    setShowAddLevel(false);
  };

  const handleAddCustomLevel = () => {
    if (!customLevelName.trim() || !onLevelsChange) return;
    const value = customLevelName.toLowerCase().replace(/\s+/g, '-');
    // Check if already exists
    if (levels?.some(l => l.value === value)) {
      setCustomLevelName('');
      return;
    }
    const newLevel = { value, label: customLevelName.trim(), isCustom: true };
    const newLevels = [...(levels || []), newLevel];
    onLevelsChange(newLevels);
    setCustomLevelName('');
    setShowAddLevel(false);
  };

  const handleRemoveLevel = (levelValue) => {
    if (!onLevelsChange) return;
    const newLevels = levels?.filter(l => l.value !== levelValue) || [];
    onLevelsChange(newLevels);
  };

  const handleAssemblyToggle = (assembly) => {
    const assemblyId = assembly.id;
    const newSelected = selectedAssemblies.includes(assemblyId)
      ? selectedAssemblies.filter(id => id !== assemblyId)
      : [...selectedAssemblies, assemblyId];

    setSelectedAssemblies(newSelected);

    // Convert new database assembly format to the format expected by the estimate system
    // Combine legacy assemblies with new ones
    const updatedAssemblies = [
      // Include legacy assemblies that are still selected
      ...legacyAssemblies.map(a => ({
        ...a,
        selected: newSelected.includes(a.id),
      })),
      // Add newly selected database assemblies (converted to estimate format)
      ...newSelected
        .filter(id => !legacyAssemblies.some(a => a.id === id))
        .map(id => {
          // Find assembly in database
          for (const cat of Object.values(ASSEMBLY_CATEGORIES)) {
            for (const subcat of Object.values(cat.assemblies)) {
              if (subcat.assemblies[id]) {
                const dbAssembly = subcat.assemblies[id];
                return {
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
                };
              }
            }
          }
          return null;
        })
        .filter(Boolean),
    ];
    onAssembliesChange?.(updatedAssemblies);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-4">
      {/* Header */}
      <button
        onClick={onToggleCollapse}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-gray-500" />
          <span className="font-medium text-charcoal">Project Setup</span>
          {!collapsed && (
            <span className="text-xs text-gray-500 ml-2">
              {ceilingHeight}' ceilings | {levels?.length || 0} levels | {selectedAssemblies.length} assemblies
            </span>
          )}
        </div>
        {collapsed ? (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Content */}
      {!collapsed && (
        <div className="p-4 space-y-6">
          {/* Ceiling Height */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Ruler className="w-4 h-4" />
              Ceiling Height
            </label>
            <div className="flex gap-2">
              {CEILING_HEIGHTS.map((height) => (
                <button
                  key={height.value}
                  onClick={() => onCeilingHeightChange(height.value)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    ceilingHeight === height.value
                      ? 'bg-charcoal text-white border-charcoal'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-charcoal'
                  }`}
                >
                  {height.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Used to calculate wall SF from linear feet measurements
            </p>
          </div>

          {/* Project Levels */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Layers className="w-4 h-4" />
                Project Levels
              </label>
              {onLevelsChange && (
                <button
                  onClick={() => setShowAddLevel(!showAddLevel)}
                  className="flex items-center gap-1 text-sm text-charcoal hover:text-charcoal/80 font-medium"
                >
                  {showAddLevel ? (
                    <>
                      <X className="w-4 h-4" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Add Level
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Add Level Panel */}
            {showAddLevel && (
              <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                {/* Preset buttons */}
                {availablePresets.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-2">Quick add:</p>
                    <div className="flex flex-wrap gap-1">
                      {availablePresets.map((preset) => (
                        <button
                          key={preset.value}
                          onClick={() => handleAddLevel(preset)}
                          className="px-2 py-1 text-xs bg-white border border-gray-200 rounded hover:border-charcoal hover:bg-gray-50 transition-colors"
                        >
                          + {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {/* Custom level input */}
                <div>
                  <p className="text-xs text-gray-500 mb-2">Or add custom:</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customLevelName}
                      onChange={(e) => setCustomLevelName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCustomLevel()}
                      placeholder="e.g., Mezzanine, Loft..."
                      className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-charcoal/20 focus:border-charcoal"
                    />
                    <button
                      onClick={handleAddCustomLevel}
                      disabled={!customLevelName.trim()}
                      className="px-3 py-1.5 text-sm bg-charcoal text-white rounded-lg hover:bg-charcoal/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Current levels */}
            <div className="flex flex-wrap gap-2">
              {levels?.map((level) => (
                <span
                  key={level.value}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium group"
                >
                  {level.label}
                  {onLevelsChange && levels.length > 1 && (
                    <button
                      onClick={() => handleRemoveLevel(level.value)}
                      className="ml-1 p-0.5 text-blue-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove level"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
              {(!levels || levels.length === 0) && (
                <span className="text-sm text-gray-400 italic">No levels defined</span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {onLevelsChange
                ? 'Click + to add more levels, hover to remove'
                : 'Derived from project intake (storeys + basement)'}
            </p>
          </div>

          {/* Build Assemblies - Tabbed Interface */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Layers className="w-4 h-4" />
                Build Assemblies
                <span className="text-xs text-gray-400 font-normal">
                  ({selectedAssemblies.length} selected)
                </span>
              </label>
              <button
                onClick={onOpenAssemblyBuilder}
                className="flex items-center gap-1 text-sm text-charcoal hover:text-charcoal/80 font-medium"
              >
                <Plus className="w-4 h-4" />
                Define Custom
              </button>
            </div>

            {/* Category Tabs */}
            <div className="flex border-b border-gray-200 mb-3">
              {Object.values(ASSEMBLY_CATEGORIES).map((category) => {
                const Icon = CATEGORY_ICONS[category.id] || Layers;
                const isActive = activeCategory === category.id;
                const selectedCount = selectedAssemblies.filter(id =>
                  getAssembliesByCategory(category.id).some(a => a.id === id)
                ).length;

                return (
                  <button
                    key={category.id}
                    onClick={() => {
                      setActiveCategory(category.id);
                      setActiveSubcategory(null);
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
                const isSelected = selectedAssemblies.includes(assembly.id);
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
              Select assemblies to use for cost calculations. Costs include labor + materials based on NB pricing.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default SetupPanel;
