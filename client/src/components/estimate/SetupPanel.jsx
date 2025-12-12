import { useState } from 'react';
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
} from 'lucide-react';
import { CEILING_HEIGHTS, loadAssemblyTemplates } from '../../lib/estimateHelpers';

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

/**
 * SetupPanel - One-time configuration for estimate
 *
 * - Ceiling height selector (persists for all wall calculations)
 * - Project levels display (derived from intake) + add custom levels
 * - Wall assembly selector/builder
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
  const [selectedAssemblies, setSelectedAssemblies] = useState(
    assemblies?.filter(a => a.selected)?.map(a => a.id) || ['ext-2x6', 'int-2x4']
  );
  const [showAddLevel, setShowAddLevel] = useState(false);
  const [customLevelName, setCustomLevelName] = useState('');

  const allAssemblies = loadAssemblyTemplates();

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

  const handleAssemblyToggle = (assemblyId) => {
    const newSelected = selectedAssemblies.includes(assemblyId)
      ? selectedAssemblies.filter(id => id !== assemblyId)
      : [...selectedAssemblies, assemblyId];

    setSelectedAssemblies(newSelected);

    // Update parent with selected assemblies
    const updatedAssemblies = allAssemblies.map(a => ({
      ...a,
      selected: newSelected.includes(a.id),
    }));
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

          {/* Wall Assemblies */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Layers className="w-4 h-4" />
                Wall Assemblies
              </label>
              <button
                onClick={onOpenAssemblyBuilder}
                className="flex items-center gap-1 text-sm text-charcoal hover:text-charcoal/80 font-medium"
              >
                <Plus className="w-4 h-4" />
                Define New
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {allAssemblies.map((assembly) => {
                const isSelected = selectedAssemblies.includes(assembly.id);
                return (
                  <button
                    key={assembly.id}
                    onClick={() => handleAssemblyToggle(assembly.id)}
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
                      <div className="text-xs text-gray-500 truncate">
                        {assembly.description}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        ${(assembly.laborCostPerUnit + assembly.materialCostPerUnit).toFixed(2)}/SF
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Select assemblies to use for wall calculations. Labor + materials from catalogue.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default SetupPanel;
