import { useState, useMemo, useCallback } from 'react';
import {
  Plus,
  Trash2,
  Save,
  X,
  Play,
  Calculator,
  Package,
  Hammer,
  Layers,
  ChevronDown,
  ChevronRight,
  Info,
  Copy,
  Settings,
  DollarSign,
} from 'lucide-react';
import { Card, Button, Input } from '../ui';
import { getMaterials, formatCurrency } from '../../lib/costCatalogue';
import {
  calculateWallMaterials,
  LUMBER_DIMENSIONS,
  SHEATHING_TYPES,
  INSULATION_TYPES,
} from '../../lib/wallMaterialCalculator';

/**
 * Formula types supported by the configurator
 */
const FORMULA_TYPES = {
  // Quantity based on linear feet
  PER_LF: {
    id: 'per_lf',
    name: 'Per Linear Foot',
    description: 'Quantity = Linear Feet × Multiplier',
    calculate: (lf, height, multiplier) => lf * multiplier,
  },
  // Quantity based on wall area (LF × height)
  PER_SF: {
    id: 'per_sf',
    name: 'Per Square Foot',
    description: 'Quantity = (Linear Feet × Height) ÷ Coverage',
    calculate: (lf, height, coverage) => (lf * height) / coverage,
  },
  // Fixed quantity per project
  FIXED: {
    id: 'fixed',
    name: 'Fixed Quantity',
    description: 'Always use this quantity regardless of measurements',
    calculate: (lf, height, qty) => qty,
  },
  // Plates: calculate based on lumber lengths
  PLATES: {
    id: 'plates',
    name: 'Plate Calculation',
    description: 'Bottom (1×) + Top (2×) plates from lumber lengths',
    calculate: (lf, height, lumberLength) => Math.ceil((lf * 3) / lumberLength),
  },
  // Studs: one per linear foot
  STUDS: {
    id: 'studs',
    name: 'Stud Calculation',
    description: '1 stud per linear foot (16" OC simplified)',
    calculate: (lf, height, multiplier = 1) => Math.ceil(lf * multiplier),
  },
  // Sheet goods: based on coverage per sheet
  SHEETS: {
    id: 'sheets',
    name: 'Sheet Calculation',
    description: 'Wall Area ÷ Sheet Coverage (e.g., 32 SF per 4×8 sheet)',
    calculate: (lf, height, sqftPerSheet) => Math.ceil((lf * height) / sqftPerSheet),
  },
};

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
  const [unit, setUnit] = useState(existingAssembly?.unit || 'LF');

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
  const [showAddComponent, setShowAddComponent] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    components: true,
    labor: true,
    preview: true,
  });

  // Material search
  const [materialSearch, setMaterialSearch] = useState('');

  const filteredMaterials = useMemo(() => {
    if (!materialSearch) return materials.slice(0, 20);
    const query = materialSearch.toLowerCase();
    return materials
      .filter(m => m.name.toLowerCase().includes(query) || m.category.includes(query))
      .slice(0, 20);
  }, [materials, materialSearch]);

  // Add a component
  const addComponent = (material) => {
    const newComponent = {
      id: `comp-${Date.now()}`,
      materialId: material.id,
      materialName: material.name,
      materialUnit: material.unit,
      materialUnitCost: material.unitCost,
      formulaType: 'per_lf',
      formulaValue: 1, // Default multiplier
      description: '',
    };
    setComponents([...components, newComponent]);
    setShowAddComponent(false);
    setMaterialSearch('');
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

  // Calculate component cost
  const calculateComponentCost = useCallback((component, lf, height) => {
    const formula = FORMULA_TYPES[component.formulaType.toUpperCase()] ||
                    FORMULA_TYPES.PER_LF;
    const quantity = formula.calculate(lf, height, component.formulaValue);
    const cost = quantity * component.materialUnitCost;
    return { quantity, cost };
  }, []);

  // Calculate total preview
  const preview = useMemo(() => {
    const lf = testLinearFeet || 0;
    const height = testCeilingHeight || 9;
    const wallArea = lf * height;

    let materialsCost = 0;
    const componentBreakdown = components.map(component => {
      const { quantity, cost } = calculateComponentCost(component, lf, height);
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
  }, [components, testLinearFeet, testCeilingHeight, laborRate, calculateComponentCost]);

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
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-charcoal focus:border-transparent"
            >
              <option value="framing">Framing</option>
              <option value="electrical">Electrical</option>
              <option value="plumbing">Plumbing</option>
              <option value="hvac">HVAC</option>
              <option value="drywall">Drywall</option>
              <option value="flooring">Flooring</option>
              <option value="roofing">Roofing</option>
              <option value="exterior">Exterior</option>
            </select>
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
                  onUpdate={(updates) => updateComponent(component.id, updates)}
                  onRemove={() => removeComponent(component.id)}
                />
              ))
            )}

            {/* Add Component */}
            {showAddComponent ? (
              <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Add Material</span>
                  <button
                    onClick={() => {
                      setShowAddComponent(false);
                      setMaterialSearch('');
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <Input
                  value={materialSearch}
                  onChange={(e) => setMaterialSearch(e.target.value)}
                  placeholder="Search materials..."
                  className="mb-2"
                  autoFocus
                />
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {filteredMaterials.map((material) => (
                    <button
                      key={material.id}
                      onClick={() => addComponent(material)}
                      className="w-full text-left px-3 py-2 text-sm rounded hover:bg-white transition-colors flex justify-between"
                    >
                      <span>{material.name}</span>
                      <span className="text-gray-500">
                        {formatCurrency(material.unitCost)}/{material.unit}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowAddComponent(true)}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Material Component
              </Button>
            )}
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
 * ComponentRow - Individual material component with clear quantity configuration
 */
function ComponentRow({ component, onUpdate, onRemove }) {
  const [expanded, setExpanded] = useState(true); // Default expanded for clarity

  // Calculate example for 1 LF at 9' ceiling
  const exampleQty = useMemo(() => {
    const formula = FORMULA_TYPES[component.formulaType?.toUpperCase()] || FORMULA_TYPES.PER_LF;
    return formula.calculate(1, 9, component.formulaValue);
  }, [component.formulaType, component.formulaValue]);

  const exampleCost = exampleQty * component.materialUnitCost;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 bg-white flex items-center justify-between">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-left flex-1"
        >
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
          <div>
            <span className="font-medium text-sm">{component.materialName}</span>
            <span className="text-xs text-gray-500 ml-2">
              {formatCurrency(component.materialUnitCost)}/{component.materialUnit}
            </span>
          </div>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-green-600 font-medium">
            {formatCurrency(exampleCost)}/LF
          </span>
          <button
            onClick={onRemove}
            className="text-gray-400 hover:text-red-500 p-1"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Configuration - Always show for clarity */}
      {expanded && (
        <div className="px-3 py-3 bg-gray-50 border-t border-gray-200 space-y-3">
          {/* Quantity per LF input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How much of this material per 1 linear foot of wall?
            </label>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Calculation Method
                </label>
                <select
                  value={component.formulaType}
                  onChange={(e) => onUpdate({ formulaType: e.target.value })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-charcoal"
                >
                  <option value="per_lf">Quantity per LF</option>
                  <option value="per_sf">Divide wall area by coverage</option>
                  <option value="plates">Plates (3× LF ÷ lumber length)</option>
                  <option value="studs">Studs (1 per LF)</option>
                  <option value="sheets">Sheets (wall area ÷ sheet size)</option>
                  <option value="fixed">Fixed quantity</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  {getFormulaValueLabel(component.formulaType)}
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={component.formulaValue}
                  onChange={(e) => onUpdate({ formulaValue: parseFloat(e.target.value) || 0 })}
                  className="text-sm"
                />
              </div>
            </div>
          </div>

          {/* Live example calculation */}
          <div className="bg-white rounded p-2 border border-gray-100">
            <div className="text-xs text-gray-500 mb-1">Example: 1 LF wall × 9' ceiling</div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">
                {exampleQty.toFixed(3)} {component.materialUnit} × {formatCurrency(component.materialUnitCost)}
              </span>
              <span className="font-semibold text-green-600">
                = {formatCurrency(exampleCost)}
              </span>
            </div>
          </div>

          {/* Formula explanation */}
          <div className="text-xs text-gray-400 flex items-start gap-1">
            <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span>{getFormulaExplanation(component.formulaType, component.formulaValue)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Get appropriate label for formula value input
 */
function getFormulaValueLabel(formulaType) {
  switch (formulaType) {
    case 'per_lf':
      return 'Quantity per LF';
    case 'studs':
      return 'Studs per LF';
    case 'per_sf':
      return 'Material covers (SF)';
    case 'sheets':
      return 'Sheet size (SF)';
    case 'plates':
      return 'Lumber length (ft)';
    case 'fixed':
      return 'Fixed quantity';
    default:
      return 'Value';
  }
}

/**
 * Get human-readable explanation of the formula
 */
function getFormulaExplanation(formulaType, value) {
  switch (formulaType) {
    case 'per_lf':
      return `Uses ${value} unit(s) of this material for every 1 linear foot of wall`;
    case 'studs':
      return `Uses ${value} stud(s) for every 1 linear foot (standard 16" OC = 1 per LF)`;
    case 'per_sf':
      return `Wall area (LF × height) divided by ${value} SF coverage per unit`;
    case 'sheets':
      return `Wall area divided by ${value} SF per sheet (4×8 sheet = 32 SF)`;
    case 'plates':
      return `3× linear feet (bottom + double top) divided by ${value}' lumber length`;
    case 'fixed':
      return `Always uses exactly ${value} unit(s) regardless of wall size`;
    default:
      return '';
  }
}

export default AssemblyConfigurator;
