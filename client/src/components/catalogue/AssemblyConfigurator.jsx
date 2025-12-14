import { useState, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Save,
  X,
  Play,
  Package,
  Hammer,
  ChevronDown,
  ChevronRight,
  Settings,
} from 'lucide-react';
import { Card, Button, Input } from '../ui';
import { getMaterials, formatCurrency } from '../../lib/costCatalogue';
import { ASSEMBLY_CATEGORIES } from '../../data/assemblyCategories';

// Re-export for backwards compatibility
export { ASSEMBLY_CATEGORIES };

/**
 * AssemblyConfigurator - Build custom assemblies with formulas
 */
export function AssemblyConfigurator({
  onSave,
  onCancel,
  existingAssembly = null,
  materials: providedMaterials = null,
}) {
  const materials = providedMaterials || getMaterials();

  // Assembly metadata
  const [name, setName] = useState(existingAssembly?.name || '');
  const [description, setDescription] = useState(existingAssembly?.description || '');
  const [category, setCategory] = useState(existingAssembly?.category || 'framing');
  const [subcategory, setSubcategory] = useState(existingAssembly?.subcategory || existingAssembly?.scopeItemId || '');
  const [unit, setUnit] = useState(existingAssembly?.unit || 'LF');

  // Auto-update unit when subcategory changes
  const handleSubcategoryChange = (newSubcategory) => {
    setSubcategory(newSubcategory);
    // Find the subcategory and set its default unit
    const catData = ASSEMBLY_CATEGORIES[category];
    const subcat = catData?.subcategories?.find(s => s.id === newSubcategory);
    if (subcat?.unit) {
      setUnit(subcat.unit);
    }
  };

  // Auto-update subcategory when category changes
  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    const catData = ASSEMBLY_CATEGORIES[newCategory];
    if (catData?.subcategories?.length > 0) {
      const firstSubcat = catData.subcategories[0];
      setSubcategory(firstSubcat.id);
      setUnit(firstSubcat.unit);
    }
  };

  // Material components with formulas
  const [components, setComponents] = useState(
    existingAssembly?.components || []
  );

  // Labor configuration
  const [laborRate, setLaborRate] = useState(existingAssembly?.laborCostPerUnit || 0);
  const [laborFormula, setLaborFormula] = useState(
    existingAssembly?.laborFormula || 'per_lf'
  );

  // Test inputs for preview
  const [testLinearFeet, setTestLinearFeet] = useState(10);
  const [testCeilingHeight, setTestCeilingHeight] = useState(9);

  // UI state
  const [expandedSections, setExpandedSections] = useState({
    components: true,
    labor: true,
    preview: true,
  });

  // Add a new empty component
  const addComponent = () => {
    const newComponent = {
      id: `comp-${Date.now()}`,
      name: '',
      materialId: null,
      materialName: '',
      materialUnit: '',
      materialUnitCost: 0,
      amount: 0, // Amount of material unit per 1 LF of assembly
    };
    setComponents([...components, newComponent]);
    setShowAddComponent(false);
  };

  // Update a component
  const updateComponent = (componentId, updates) => {
    setComponents(components.map(c =>
      c.id === componentId ? { ...c, ...updates } : c
    ));
  };

  // Remove a component
  const removeComponent = (componentId) => {
    setComponents(components.filter(c => c.id !== componentId));
  };

  // Calculate total preview using simple amount × cost
  const preview = useMemo(() => {
    const lf = testLinearFeet || 0;
    const height = testCeilingHeight || 9;
    const wallArea = lf * height;

    let materialsCost = 0;
    const componentBreakdown = components.map(component => {
      // Simple calculation: amount per LF × linear feet × unit cost
      const quantity = (component.amount || 0) * lf;
      const cost = quantity * (component.materialUnitCost || 0);
      materialsCost += cost;
      return {
        ...component,
        calculatedQuantity: quantity,
        calculatedCost: cost,
      };
    });

    const laborCost = laborRate * lf;
    const totalCost = materialsCost + laborCost;
    const costPerLF = lf > 0 ? totalCost / lf : 0;

    return {
      linearFeet: lf,
      ceilingHeight: height,
      wallArea,
      components: componentBreakdown,
      materialsCost,
      laborCost,
      totalCost,
      costPerLF,
    };
  }, [components, testLinearFeet, testCeilingHeight, laborRate]);

  // Save assembly
  const handleSave = () => {
    if (!name.trim()) {
      alert('Please enter an assembly name');
      return;
    }

    const assembly = {
      id: existingAssembly?.id || `custom-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      category,
      subcategory: subcategory || null, // Scope item ID (e.g., 'fr-ext', 'fl-lvp')
      scopeItemId: subcategory || null, // Alias for compatibility with SCOPE_ITEMS
      unit,
      laborCostPerUnit: laborRate,
      laborFormula,
      materialCostPerUnit: preview.costPerLF - laborRate, // Fallback for non-formula contexts
      components,
      isCustom: true,
      createdAt: existingAssembly?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave?.(assembly);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-charcoal flex items-center gap-2">
          <Settings className="w-5 h-5" />
          {existingAssembly ? 'Edit Assembly' : 'New Assembly Configurator'}
        </h2>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={onCancel}>
            <X className="w-4 h-4 mr-1" />
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="w-4 h-4 mr-1" />
            Save Assembly
          </Button>
        </div>
      </div>

      {/* Basic Info */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assembly Name *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., 2x6 Exterior Wall with R20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-charcoal focus:border-transparent"
            >
              <option value="LF">Linear Feet (LF)</option>
              <option value="SF">Square Feet (SF)</option>
              <option value="EA">Each (EA)</option>
              <option value="SQ">Square (100 SF)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-charcoal focus:border-transparent"
            >
              {Object.entries(ASSEMBLY_CATEGORIES).map(([key, cat]) => (
                <option key={key} value={key}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subcategory (Scope Item)
            </label>
            <select
              value={subcategory}
              onChange={(e) => handleSubcategoryChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-charcoal focus:border-transparent"
            >
              <option value="">-- Select subcategory --</option>
              {ASSEMBLY_CATEGORIES[category]?.subcategories?.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} ({sub.unit})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Links this assembly to a specific scope item for estimating
            </p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., 2x6 framing, R-20 insulation, OSB sheathing"
            />
          </div>
        </div>
      </Card>

      {/* Material Components */}
      <Card className="overflow-hidden">
        <button
          onClick={() => toggleSection('components')}
          className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <span className="font-medium text-charcoal flex items-center gap-2">
            <Package className="w-5 h-5" />
            Material Components ({components.length})
          </span>
          {expandedSections.components ? (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {expandedSections.components && (
          <div className="p-4 space-y-3">
            {components.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No components added yet. Add materials to build your assembly.
              </p>
            ) : (
              components.map((component) => (
                <ComponentRow
                  key={component.id}
                  component={component}
                  materials={materials}
                  onUpdate={(updates) => updateComponent(component.id, updates)}
                  onRemove={() => removeComponent(component.id)}
                />
              ))
            )}

            {/* Add Component */}
            <Button
              variant="secondary"
              size="sm"
              onClick={addComponent}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Component
            </Button>
          </div>
        )}
      </Card>

      {/* Labor Configuration */}
      <Card className="overflow-hidden">
        <button
          onClick={() => toggleSection('labor')}
          className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <span className="font-medium text-charcoal flex items-center gap-2">
            <Hammer className="w-5 h-5" />
            Labor Configuration
          </span>
          {expandedSections.labor ? (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {expandedSections.labor && (
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Labor Rate (per LF)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={laborRate}
                    onChange={(e) => setLaborRate(parseFloat(e.target.value) || 0)}
                    className="pl-7"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Labor Formula
                </label>
                <select
                  value={laborFormula}
                  onChange={(e) => setLaborFormula(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-charcoal focus:border-transparent"
                >
                  <option value="per_lf">Per Linear Foot</option>
                  <option value="per_sf">Per Square Foot</option>
                  <option value="hourly">Hourly Rate</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Live Preview */}
      <Card className="overflow-hidden">
        <button
          onClick={() => toggleSection('preview')}
          className="w-full px-4 py-3 flex items-center justify-between bg-blue-50 hover:bg-blue-100 transition-colors"
        >
          <span className="font-medium text-blue-800 flex items-center gap-2">
            <Play className="w-5 h-5" />
            Live Preview
          </span>
          {expandedSections.preview ? (
            <ChevronDown className="w-5 h-5 text-blue-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-blue-400" />
          )}
        </button>

        {expandedSections.preview && (
          <div className="p-4 space-y-4">
            {/* Test Inputs */}
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-100">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Linear Feet
                </label>
                <Input
                  type="number"
                  value={testLinearFeet}
                  onChange={(e) => setTestLinearFeet(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Ceiling Height
                </label>
                <Input
                  type="number"
                  value={testCeilingHeight}
                  onChange={(e) => setTestCeilingHeight(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            {/* Results */}
            <div className="space-y-3">
              <div className="text-sm text-gray-500">
                Wall Area: {preview.wallArea} SF ({preview.linearFeet} LF × {preview.ceilingHeight}')
              </div>

              {/* Component Breakdown */}
              {preview.components.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="text-sm font-medium text-gray-700">Material Breakdown:</div>
                  {preview.components.map((comp) => (
                    <div key={comp.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {comp.calculatedQuantity.toFixed(2)} × {comp.materialName}
                      </span>
                      <span className="font-medium">{formatCurrency(comp.calculatedCost)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                    <span className="text-gray-600">Materials Subtotal</span>
                    <span className="font-medium">{formatCurrency(preview.materialsCost)}</span>
                  </div>
                </div>
              )}

              {/* Labor */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Labor ({formatCurrency(laborRate)}/LF × {preview.linearFeet} LF)</span>
                <span className="font-medium">{formatCurrency(preview.laborCost)}</span>
              </div>

              {/* Totals */}
              <div className="pt-3 border-t border-gray-200 space-y-2">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Cost</span>
                  <span className="text-green-600">{formatCurrency(preview.totalCost)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Cost per Linear Foot</span>
                  <span className="font-medium text-green-600">{formatCurrency(preview.costPerLF)}/LF</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

/**
 * ComponentRow - Material component with simple quantity configuration
 *
 * Each component has:
 * - Name: What you call it (e.g., "Bottom Plate")
 * - Material: From catalogue (e.g., "2x4x8 KD" @ $3.90/EA)
 * - Amount: How many units of the material per 1 LF of assembly
 */
function ComponentRow({ component, onUpdate, onRemove, materials }) {
  const [showMaterialPicker, setShowMaterialPicker] = useState(false);
  const [materialSearch, setMaterialSearch] = useState('');

  // Calculate cost per assembly unit
  const costPerUnit = (component.amount || 0) * (component.materialUnitCost || 0);

  // Filter materials for picker
  const filteredMaterials = useMemo(() => {
    if (!materials) return [];
    if (!materialSearch) return materials.slice(0, 15);
    const query = materialSearch.toLowerCase();
    return materials
      .filter(m => m.name.toLowerCase().includes(query))
      .slice(0, 15);
  }, [materials, materialSearch]);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <div className="p-3 space-y-3">
        {/* Row 1: Component Name + Delete */}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Component Name</label>
            <Input
              value={component.name || ''}
              onChange={(e) => onUpdate({ name: e.target.value })}
              placeholder="e.g., Bottom Plate, Studs, Sheathing"
              className="text-sm"
            />
          </div>
          <button
            onClick={onRemove}
            className="text-gray-400 hover:text-red-500 p-2 mt-5"
            title="Remove component"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Row 2: Material Selection */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Material (from catalogue)</label>
          {showMaterialPicker ? (
            <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
              <Input
                value={materialSearch}
                onChange={(e) => setMaterialSearch(e.target.value)}
                placeholder="Search materials..."
                className="text-sm mb-2"
                autoFocus
              />
              <div className="max-h-40 overflow-y-auto space-y-1">
                {filteredMaterials.map((mat) => (
                  <button
                    key={mat.id}
                    onClick={() => {
                      onUpdate({
                        materialId: mat.id,
                        materialName: mat.name,
                        materialUnit: mat.unit,
                        materialUnitCost: mat.unitCost,
                      });
                      setShowMaterialPicker(false);
                      setMaterialSearch('');
                    }}
                    className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-white flex justify-between items-center"
                  >
                    <span className="truncate">{mat.name}</span>
                    <span className="text-gray-500 text-xs ml-2 whitespace-nowrap">
                      {formatCurrency(mat.unitCost)}/{mat.unit}
                    </span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  setShowMaterialPicker(false);
                  setMaterialSearch('');
                }}
                className="mt-2 text-xs text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowMaterialPicker(true)}
              className="w-full text-left px-3 py-2 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              {component.materialName ? (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{component.materialName}</span>
                  <span className="text-xs text-gray-500">
                    {formatCurrency(component.materialUnitCost)}/{component.materialUnit}
                  </span>
                </div>
              ) : (
                <span className="text-sm text-gray-400">Select a material...</span>
              )}
            </button>
          )}
        </div>

        {/* Row 3: Amount per unit */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Amount per 1 LF of assembly
            </label>
            <Input
              type="number"
              step="0.001"
              min="0"
              value={component.amount || ''}
              onChange={(e) => onUpdate({ amount: parseFloat(e.target.value) || 0 })}
              placeholder="0.000"
              className="text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Unit from catalogue
            </label>
            <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600">
              {component.materialUnit || '—'}
            </div>
          </div>
        </div>

        {/* Row 4: Cost calculation */}
        {component.materialUnitCost > 0 && component.amount > 0 && (
          <div className="bg-green-50 border border-green-100 rounded-lg p-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                {component.amount} × {formatCurrency(component.materialUnitCost)} =
              </span>
              <span className="font-semibold text-green-700">
                {formatCurrency(costPerUnit)} / LF
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AssemblyConfigurator;
