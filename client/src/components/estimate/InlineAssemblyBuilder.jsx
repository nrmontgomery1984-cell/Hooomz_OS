import { useState, useMemo, useRef, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Search,
  Package,
  Wrench,
  ChevronDown,
  ChevronRight,
  Save,
  AlertCircle,
} from 'lucide-react';
import { MATERIAL_CATEGORIES, formatCurrency, loadCatalogueData } from '../../lib/costCatalogue';

/**
 * InlineAssemblyBuilder - Compact assembly builder for contractor intake
 *
 * Features:
 * - Search bar with autocomplete for materials and labor
 * - Add items to build up assembly cost
 * - Inline form (not a modal)
 * - Edit mode: pass existing assembly to edit
 */
export function InlineAssemblyBuilder({ onSave, onCancel, assembly: existingAssembly }) {
  // Load catalogue data
  const catalogueData = useMemo(() => loadCatalogueData(), []);
  const { laborRates, materials } = catalogueData;

  // Determine if we're editing or creating
  const isEditing = !!existingAssembly;

  // Assembly form state - initialize from existing assembly if editing
  const [name, setName] = useState(existingAssembly?.name || '');
  const [description, setDescription] = useState(existingAssembly?.description || '');

  // Components state - initialize from existing assembly if editing
  const [laborComponents, setLaborComponents] = useState(existingAssembly?.laborComponents || []);
  const [materialComponents, setMaterialComponents] = useState(existingAssembly?.materialComponents || []);

  // Reset form state when existingAssembly changes (e.g., switching from create to edit, or editing different assembly)
  useEffect(() => {
    setName(existingAssembly?.name || '');
    setDescription(existingAssembly?.description || '');
    setLaborComponents(existingAssembly?.laborComponents || []);
    setMaterialComponents(existingAssembly?.materialComponents || []);
    setSearchQuery('');
    setShowDropdown(false);
  }, [existingAssembly]);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState('materials'); // 'materials' | 'labor'
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !searchInputRef.current?.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get all labor rates as flat list
  const allLaborRates = useMemo(() => {
    const rates = [];
    if (!laborRates) return rates;
    Object.entries(laborRates).forEach(([code, data]) => {
      if (data?.pieceRates) {
        data.pieceRates.forEach(rate => {
          rates.push({
            ...rate,
            tradeCode: code,
            tradeName: data.name,
          });
        });
      }
    });
    return rates;
  }, [laborRates]);

  // Filter items by search
  const filteredMaterials = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2 || !materials) return [];
    const lower = searchQuery.toLowerCase();
    return materials
      .filter(
        mat =>
          mat.name.toLowerCase().includes(lower) ||
          mat.category.toLowerCase().includes(lower) ||
          mat.sku?.toLowerCase().includes(lower)
      )
      .slice(0, 15); // Limit results
  }, [materials, searchQuery]);

  const filteredLaborRates = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    const lower = searchQuery.toLowerCase();
    return allLaborRates
      .filter(
        rate =>
          rate.task?.toLowerCase().includes(lower) ||
          rate.tradeName?.toLowerCase().includes(lower) ||
          rate.notes?.toLowerCase().includes(lower)
      )
      .slice(0, 15); // Limit results
  }, [allLaborRates, searchQuery]);

  // Calculate totals
  const totals = useMemo(() => {
    let laborTotal = 0;
    let materialTotal = 0;

    laborComponents.forEach(comp => {
      laborTotal += (comp.rate || 0) * (comp.qty || 1);
    });

    materialComponents.forEach(comp => {
      materialTotal += (comp.unitCost || 0) * (comp.qty || 1);
    });

    return {
      labor: laborTotal,
      materials: materialTotal,
      total: laborTotal + materialTotal,
    };
  }, [laborComponents, materialComponents]);

  // Add material component
  const addMaterialComponent = (material) => {
    const existing = materialComponents.find(c => c.id === material.id);
    if (existing) {
      setMaterialComponents(prev =>
        prev.map(c => (c.id === material.id ? { ...c, qty: c.qty + 1 } : c))
      );
    } else {
      setMaterialComponents(prev => [
        ...prev,
        {
          id: material.id,
          name: material.name,
          unitCost: material.unitCost,
          unit: material.unit,
          qty: 1,
          category: material.category,
        },
      ]);
    }
    setSearchQuery('');
    setShowDropdown(false);
  };

  // Add labor component
  const addLaborComponent = (rate) => {
    const existing = laborComponents.find(c => c.id === rate.id);
    if (existing) {
      setLaborComponents(prev =>
        prev.map(c => (c.id === rate.id ? { ...c, qty: c.qty + 1 } : c))
      );
    } else {
      setLaborComponents(prev => [
        ...prev,
        {
          id: rate.id,
          name: rate.task,
          rate: rate.rate,
          unit: rate.unit,
          qty: 1,
          tradeCode: rate.tradeCode,
        },
      ]);
    }
    setSearchQuery('');
    setShowDropdown(false);
  };

  // Update quantities
  const updateMaterialQty = (id, qty) => {
    if (qty <= 0) {
      setMaterialComponents(prev => prev.filter(c => c.id !== id));
    } else {
      setMaterialComponents(prev =>
        prev.map(c => (c.id === id ? { ...c, qty } : c))
      );
    }
  };

  const updateLaborQty = (id, qty) => {
    if (qty <= 0) {
      setLaborComponents(prev => prev.filter(c => c.id !== id));
    } else {
      setLaborComponents(prev =>
        prev.map(c => (c.id === id ? { ...c, qty } : c))
      );
    }
  };

  // Remove components
  const removeMaterialComponent = (id) => {
    setMaterialComponents(prev => prev.filter(c => c.id !== id));
  };

  const removeLaborComponent = (id) => {
    setLaborComponents(prev => prev.filter(c => c.id !== id));
  };

  // Save assembly
  const handleSave = () => {
    if (!name.trim()) return;
    if (laborComponents.length === 0 && materialComponents.length === 0) return;

    const assembly = {
      // Preserve existing id when editing, generate new when creating
      id: isEditing ? existingAssembly.id : `custom-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || 'Custom assembly',
      laborComponents,
      materialComponents,
      laborCostPerUnit: totals.labor,
      materialCostPerUnit: totals.materials,
      unit: existingAssembly?.unit || 'lf',
      isCustom: true,
      selected: existingAssembly?.selected !== false, // Preserve selection state
      // Track edit history
      updatedAt: new Date().toISOString(),
      createdAt: existingAssembly?.createdAt || new Date().toISOString(),
    };

    onSave(assembly);
  };

  const hasItems = laborComponents.length > 0 || materialComponents.length > 0;
  const canSave = name.trim() && hasItems;

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-charcoal">
          {isEditing ? 'Edit Assembly' : 'Build Custom Assembly'}
        </h4>
        <button
          onClick={onCancel}
          className="p-1 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Name & Description */}
      <div className="space-y-3 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Assembly Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., 2x6 Exterior with Spray Foam"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Search with Autocomplete */}
      <div className="relative mb-4">
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Add Items from Catalogue
        </label>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-2">
          <button
            onClick={() => setActiveTab('materials')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium ${
              activeTab === 'materials'
                ? 'text-charcoal border-b-2 border-charcoal'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Package className="w-3 h-3" />
            Materials
          </button>
          <button
            onClick={() => setActiveTab('labor')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium ${
              activeTab === 'labor'
                ? 'text-charcoal border-b-2 border-charcoal'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Wrench className="w-3 h-3" />
            Labor
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowDropdown(e.target.value.length >= 2);
            }}
            onFocus={() => setShowDropdown(searchQuery.length >= 2)}
            placeholder={`Search ${activeTab === 'materials' ? 'materials' : 'labor rates'}...`}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Dropdown Results */}
        {showDropdown && (
          <div
            ref={dropdownRef}
            className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {activeTab === 'materials' ? (
              filteredMaterials.length > 0 ? (
                <div className="py-1">
                  {filteredMaterials.map((mat) => {
                    const isAdded = materialComponents.some(c => c.id === mat.id);
                    return (
                      <button
                        key={mat.id}
                        onClick={() => addMaterialComponent(mat)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-blue-50 ${
                          isAdded ? 'bg-green-50' : ''
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-charcoal truncate">{mat.name}</div>
                          <div className="text-xs text-gray-400">
                            {MATERIAL_CATEGORIES.find(c => c.id === mat.category)?.name || mat.category}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-charcoal">
                            {formatCurrency(mat.unitCost)}/{mat.unit}
                          </span>
                          <Plus className="w-4 h-4 text-gray-400" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : searchQuery.length >= 2 ? (
                <div className="px-3 py-4 text-sm text-gray-500 text-center">
                  No materials found
                </div>
              ) : null
            ) : (
              filteredLaborRates.length > 0 ? (
                <div className="py-1">
                  {filteredLaborRates.map((rate) => {
                    const isAdded = laborComponents.some(c => c.id === rate.id);
                    return (
                      <button
                        key={rate.id}
                        onClick={() => addLaborComponent(rate)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-blue-50 ${
                          isAdded ? 'bg-green-50' : ''
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-charcoal truncate">{rate.task}</div>
                          <div className="text-xs text-gray-400">{rate.tradeName}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-charcoal">
                            {formatCurrency(rate.rate)}/{rate.unit}
                          </span>
                          <Plus className="w-4 h-4 text-gray-400" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : searchQuery.length >= 2 ? (
                <div className="px-3 py-4 text-sm text-gray-500 text-center">
                  No labor rates found
                </div>
              ) : null
            )}
          </div>
        )}
      </div>

      {/* Added Items */}
      {hasItems ? (
        <div className="space-y-3 mb-4">
          {/* Materials */}
          {materialComponents.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1">
                <Package className="w-3 h-3" />
                Materials ({materialComponents.length})
              </h5>
              <div className="space-y-1">
                {materialComponents.map((comp) => (
                  <div
                    key={comp.id}
                    className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded px-2 py-1.5"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-charcoal truncate">{comp.name}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateMaterialQty(comp.id, comp.qty - 1)}
                        className="w-5 h-5 flex items-center justify-center bg-white border border-gray-200 rounded text-xs"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={comp.qty}
                        onChange={(e) => updateMaterialQty(comp.id, parseFloat(e.target.value) || 0)}
                        className="w-10 text-center text-xs border border-gray-200 rounded py-0.5"
                        min="0"
                      />
                      <button
                        onClick={() => updateMaterialQty(comp.id, comp.qty + 1)}
                        className="w-5 h-5 flex items-center justify-center bg-white border border-gray-200 rounded text-xs"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-xs font-medium w-16 text-right">
                      {formatCurrency(comp.unitCost * comp.qty)}
                    </span>
                    <button
                      onClick={() => removeMaterialComponent(comp.id)}
                      className="p-0.5 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Labor */}
          {laborComponents.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1">
                <Wrench className="w-3 h-3" />
                Labor ({laborComponents.length})
              </h5>
              <div className="space-y-1">
                {laborComponents.map((comp) => (
                  <div
                    key={comp.id}
                    className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded px-2 py-1.5"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-charcoal truncate">{comp.name}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateLaborQty(comp.id, comp.qty - 1)}
                        className="w-5 h-5 flex items-center justify-center bg-white border border-gray-200 rounded text-xs"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={comp.qty}
                        onChange={(e) => updateLaborQty(comp.id, parseFloat(e.target.value) || 0)}
                        className="w-10 text-center text-xs border border-gray-200 rounded py-0.5"
                        min="0"
                        step="0.5"
                      />
                      <button
                        onClick={() => updateLaborQty(comp.id, comp.qty + 1)}
                        className="w-5 h-5 flex items-center justify-center bg-white border border-gray-200 rounded text-xs"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-xs font-medium w-16 text-right">
                      {formatCurrency(comp.rate * comp.qty)}
                    </span>
                    <button
                      onClick={() => removeLaborComponent(comp.id)}
                      className="p-0.5 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 text-gray-400 mb-4">
          <AlertCircle className="w-8 h-8 mb-2" />
          <p className="text-xs">Search and add items above</p>
        </div>
      )}

      {/* Totals & Save */}
      <div className="border-t border-gray-200 pt-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-500">Labor:</span>
          <span className="font-medium">{formatCurrency(totals.labor)}</span>
        </div>
        <div className="flex justify-between text-xs mb-2">
          <span className="text-gray-500">Materials:</span>
          <span className="font-medium">{formatCurrency(totals.materials)}</span>
        </div>
        <div className="flex justify-between text-sm font-bold border-t border-gray-200 pt-2 mb-3">
          <span className="text-charcoal">Total per LF:</span>
          <span className="text-charcoal">{formatCurrency(totals.total)}/LF</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="flex-1 px-3 py-2 text-sm font-medium text-white bg-charcoal rounded-lg hover:bg-charcoal/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
          >
            <Save className="w-4 h-4" />
            {isEditing ? 'Update Assembly' : 'Save Assembly'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default InlineAssemblyBuilder;
