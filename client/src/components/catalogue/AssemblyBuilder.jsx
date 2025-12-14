import { useState, useMemo, useEffect } from 'react';
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
import { formatCurrency, MATERIAL_CATEGORIES } from '../../lib/costCatalogue';
import { ASSEMBLY_CATEGORIES } from '../../data/assemblyCategories';

/**
 * AssemblyBuilder - Create custom assemblies from labor rates and materials
 */
export function AssemblyBuilder({
  isOpen,
  onClose,
  onSave,
  laborRates,
  materials,
  editingAssembly = null,
}) {
  // Assembly form state
  const [name, setName] = useState(editingAssembly?.name || '');
  const [description, setDescription] = useState(editingAssembly?.description || '');
  const [category, setCategory] = useState(editingAssembly?.category || 'framing');
  const [subcategory, setSubcategory] = useState(editingAssembly?.subcategory || editingAssembly?.scopeItemId || '');
  const [unit, setUnit] = useState(editingAssembly?.unit || 'EA');
  const [notes, setNotes] = useState(editingAssembly?.notes || '');

  // Components state (labor items)
  const [laborComponents, setLaborComponents] = useState(
    editingAssembly?.laborComponents || []
  );

  // Materials state
  const [materialComponents, setMaterialComponents] = useState(
    editingAssembly?.materialComponents || []
  );

  // UI state
  const [activeTab, setActiveTab] = useState('labor'); // 'labor' | 'materials'
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Reset form state when modal opens or editingAssembly changes
  useEffect(() => {
    if (isOpen) {
      setName(editingAssembly?.name || '');
      setDescription(editingAssembly?.description || '');
      setCategory(editingAssembly?.category || 'framing');
      setSubcategory(editingAssembly?.subcategory || editingAssembly?.scopeItemId || '');
      setUnit(editingAssembly?.unit || 'EA');
      setNotes(editingAssembly?.notes || '');
      setLaborComponents(editingAssembly?.laborComponents || []);
      setMaterialComponents(editingAssembly?.materialComponents || []);
      setActiveTab('labor');
      setSearchQuery('');
      setExpandedCategory(null);
    }
  }, [isOpen, editingAssembly]);

  // Auto-update unit when subcategory changes
  const handleSubcategoryChange = (newSubcategory) => {
    setSubcategory(newSubcategory);
    const catData = ASSEMBLY_CATEGORIES[category];
    const subcat = catData?.subcategories?.find(s => s.id === newSubcategory);
    if (subcat?.unit) {
      setUnit(subcat.unit);
    }
  };

  // Auto-update subcategory when category changes
  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    // Reset subcategory when category changes
    setSubcategory('');
  };

  // Get all labor rates as flat list for searching
  const allLaborRates = useMemo(() => {
    if (!laborRates || typeof laborRates !== 'object') return [];
    const rates = [];
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

  // Filter labor rates by search
  const filteredLaborRates = useMemo(() => {
    if (!searchQuery) return allLaborRates;
    const lower = searchQuery.toLowerCase();
    return allLaborRates.filter(
      rate =>
        rate.task?.toLowerCase().includes(lower) ||
        rate.tradeName?.toLowerCase().includes(lower) ||
        rate.notes?.toLowerCase().includes(lower)
    );
  }, [allLaborRates, searchQuery]);

  // Filter materials by search
  const filteredMaterials = useMemo(() => {
    if (!materials || !Array.isArray(materials)) return [];
    if (!searchQuery) return materials;
    const lower = searchQuery.toLowerCase();
    return materials.filter(
      mat =>
        mat?.name?.toLowerCase().includes(lower) ||
        mat?.category?.toLowerCase().includes(lower) ||
        mat?.sku?.toLowerCase().includes(lower)
    );
  }, [materials, searchQuery]);

  // Group filtered materials by category
  const groupedMaterials = useMemo(() => {
    const groups = {};
    MATERIAL_CATEGORIES.forEach(cat => {
      const items = filteredMaterials.filter(m => m.category === cat.id);
      if (items.length > 0) {
        groups[cat.id] = { ...cat, items };
      }
    });
    return groups;
  }, [filteredMaterials]);

  // Group filtered labor by trade
  const groupedLabor = useMemo(() => {
    const groups = {};
    filteredLaborRates.forEach(rate => {
      if (!groups[rate.tradeCode]) {
        groups[rate.tradeCode] = {
          code: rate.tradeCode,
          name: rate.tradeName,
          items: [],
        };
      }
      groups[rate.tradeCode].items.push(rate);
    });
    return groups;
  }, [filteredLaborRates]);

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
  };

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
  };

  // Update component qty
  const updateLaborQty = (id, qty) => {
    if (qty <= 0) {
      setLaborComponents(prev => prev.filter(c => c.id !== id));
    } else {
      setLaborComponents(prev =>
        prev.map(c => (c.id === id ? { ...c, qty } : c))
      );
    }
  };

  const updateMaterialQty = (id, qty) => {
    if (qty <= 0) {
      setMaterialComponents(prev => prev.filter(c => c.id !== id));
    } else {
      setMaterialComponents(prev =>
        prev.map(c => (c.id === id ? { ...c, qty } : c))
      );
    }
  };

  // Remove components
  const removeLaborComponent = (id) => {
    setLaborComponents(prev => prev.filter(c => c.id !== id));
  };

  const removeMaterialComponent = (id) => {
    setMaterialComponents(prev => prev.filter(c => c.id !== id));
  };

  // Save assembly
  const handleSave = () => {
    if (!name.trim()) {
      alert('Please enter an assembly name');
      return;
    }

    if (laborComponents.length === 0 && materialComponents.length === 0) {
      alert('Please add at least one labor or material item');
      return;
    }

    const assembly = {
      id: editingAssembly?.id || `custom-asm-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      category,
      subcategory: subcategory || null, // Scope item ID (e.g., 'fr-ext', 'fl-lvp')
      scopeItemId: subcategory || null, // Alias for compatibility with SCOPE_ITEMS
      unit,
      notes: notes.trim(),
      // Store both labor and material components
      laborComponents,
      materialComponents,
      // Also store in legacy format for compatibility
      components: laborComponents.map(c => ({
        id: c.id,
        qty: c.qty,
        description: c.name,
      })),
      materials: materialComponents.map(m => ({
        materialId: m.id,
        qty: m.qty,
      })),
      // Calculated cost (per unit)
      unitCost: totals.total,
      laborCostPerUnit: totals.labor,
      materialCostPerUnit: totals.materials,
      // Legacy aliases
      laborCost: totals.labor,
      materialsCost: totals.materials,
      // Metadata
      confidence: 2, // Custom assemblies are "verified" since user created them
      source: 'Custom Assembly',
      sourceDate: new Date().toISOString().split('T')[0],
      isCustom: true,
    };

    onSave(assembly);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal - wider for builder */}
      <div className="relative bg-white w-full max-w-4xl mx-4 rounded-xl shadow-elevated max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="text-xl font-semibold text-charcoal">
              {editingAssembly ? 'Edit Assembly' : 'Create Custom Assembly'}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Combine labor rates and materials into reusable assemblies
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Panel - Item Selection */}
          <div className="w-1/2 border-r border-gray-200 flex flex-col">
            {/* Tabs with count badges */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('labor')}
                className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
                  activeTab === 'labor'
                    ? 'text-charcoal border-b-2 border-charcoal bg-white'
                    : 'text-gray-500 hover:text-gray-700 bg-gray-50'
                }`}
              >
                <Wrench className="w-4 h-4" />
                Labor
                {laborComponents.length > 0 && (
                  <span className="bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded-full">
                    {laborComponents.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('materials')}
                className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
                  activeTab === 'materials'
                    ? 'text-charcoal border-b-2 border-charcoal bg-white'
                    : 'text-gray-500 hover:text-gray-700 bg-gray-50'
                }`}
              >
                <Package className="w-4 h-4" />
                Materials
                {materialComponents.length > 0 && (
                  <span className="bg-amber-100 text-amber-700 text-xs px-1.5 py-0.5 rounded-full">
                    {materialComponents.length}
                  </span>
                )}
              </button>
            </div>
            {/* Hint to add from both tabs */}
            <div className="px-3 py-2 bg-blue-50 text-xs text-blue-700 border-b border-blue-100">
              💡 Add items from both tabs to build a complete assembly
            </div>

            {/* Search */}
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab === 'labor' ? 'labor rates' : 'materials'}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-charcoal/20 focus:border-charcoal"
                />
              </div>
            </div>

            {/* Item List */}
            <div className="flex-1 overflow-y-auto p-3">
              {activeTab === 'labor' ? (
                /* Labor Rates */
                <div className="space-y-2">
                  {Object.entries(groupedLabor).length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No labor rates found</p>
                  ) : (
                    Object.entries(groupedLabor).map(([code, group]) => (
                      <div key={code} className="border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => setExpandedCategory(expandedCategory === code ? null : code)}
                          className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 text-left"
                        >
                          <div className="flex items-center gap-2">
                            {expandedCategory === code ? (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            )}
                            <span className="font-medium text-sm text-charcoal">{group.name}</span>
                            <span className="text-xs text-gray-400">({group.items.length})</span>
                          </div>
                        </button>
                        {expandedCategory === code && (
                          <div className="divide-y divide-gray-100">
                            {group.items.map((rate) => {
                              const isAdded = laborComponents.some(c => c.id === rate.id);
                              return (
                                <div
                                  key={rate.id}
                                  className={`flex items-center justify-between px-3 py-2 hover:bg-blue-50 cursor-pointer ${
                                    isAdded ? 'bg-green-50' : ''
                                  }`}
                                  onClick={() => addLaborComponent(rate)}
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm text-charcoal truncate">{rate.task}</div>
                                    <div className="text-xs text-gray-400">
                                      {formatCurrency(rate.rate)}/{rate.unit}
                                    </div>
                                  </div>
                                  <button className="p-1 text-charcoal hover:bg-charcoal/10 rounded">
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              ) : (
                /* Materials */
                <div className="space-y-2">
                  {Object.entries(groupedMaterials).length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No materials found</p>
                  ) : (
                    Object.entries(groupedMaterials).map(([catId, group]) => (
                      <div key={catId} className="border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => setExpandedCategory(expandedCategory === catId ? null : catId)}
                          className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 text-left"
                        >
                          <div className="flex items-center gap-2">
                            {expandedCategory === catId ? (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            )}
                            <span className="font-medium text-sm text-charcoal">{group.name}</span>
                            <span className="text-xs text-gray-400">({group.items.length})</span>
                          </div>
                        </button>
                        {expandedCategory === catId && (
                          <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                            {group.items.map((mat) => {
                              const isAdded = materialComponents.some(c => c.id === mat.id);
                              return (
                                <div
                                  key={mat.id}
                                  className={`flex items-center justify-between px-3 py-2 hover:bg-blue-50 cursor-pointer ${
                                    isAdded ? 'bg-green-50' : ''
                                  }`}
                                  onClick={() => addMaterialComponent(mat)}
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm text-charcoal truncate">{mat.name}</div>
                                    <div className="text-xs text-gray-400">
                                      {formatCurrency(mat.unitCost)}/{mat.unit}
                                    </div>
                                  </div>
                                  <button className="p-1 text-charcoal hover:bg-charcoal/10 rounded">
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Assembly Details */}
          <div className="w-1/2 flex flex-col">
            {/* Assembly Form */}
            <div className="p-4 border-b border-gray-200 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Assembly Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Full Bathroom Renovation"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-charcoal/20 focus:border-charcoal"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of this assembly"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-charcoal/20 focus:border-charcoal"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-charcoal/20 focus:border-charcoal"
                  >
                    {Object.entries(ASSEMBLY_CATEGORIES).map(([key, cat]) => (
                      <option key={key} value={key}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Subcategory
                  </label>
                  <select
                    value={subcategory}
                    onChange={(e) => handleSubcategoryChange(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-charcoal/20 focus:border-charcoal"
                  >
                    <option value="">-- Select --</option>
                    {ASSEMBLY_CATEGORIES[category]?.subcategories?.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Unit
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-charcoal/20 focus:border-charcoal"
                >
                  <option value="EA">Each</option>
                  <option value="SF">Sq Ft</option>
                  <option value="LF">Lin Ft</option>
                  <option value="SQ">Square (100 SF)</option>
                  <option value="JOB">Job</option>
                  <option value="ROOM">Room</option>
                </select>
              </div>
            </div>

            {/* Selected Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Labor Components */}
              {laborComponents.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-2">
                    <Wrench className="w-3 h-3" />
                    Labor ({laborComponents.length})
                  </h4>
                  <div className="space-y-2">
                    {laborComponents.map((comp) => (
                      <div
                        key={comp.id}
                        className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-charcoal truncate">{comp.name}</div>
                          <div className="text-xs text-gray-500">
                            {formatCurrency(comp.rate)}/{comp.unit}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateLaborQty(comp.id, comp.qty - 1)}
                            className="w-6 h-6 flex items-center justify-center bg-white border border-gray-200 rounded text-gray-600 hover:bg-gray-100"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={comp.qty}
                            onChange={(e) => updateLaborQty(comp.id, parseFloat(e.target.value) || 0)}
                            className="w-12 text-center text-sm border border-gray-200 rounded py-1"
                            min="0"
                            step="0.5"
                          />
                          <button
                            onClick={() => updateLaborQty(comp.id, comp.qty + 1)}
                            className="w-6 h-6 flex items-center justify-center bg-white border border-gray-200 rounded text-gray-600 hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-sm font-medium text-charcoal w-20 text-right">
                          {formatCurrency(comp.rate * comp.qty)}
                        </div>
                        <button
                          onClick={() => removeLaborComponent(comp.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Material Components */}
              {materialComponents.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-2">
                    <Package className="w-3 h-3" />
                    Materials ({materialComponents.length})
                  </h4>
                  <div className="space-y-2">
                    {materialComponents.map((comp) => (
                      <div
                        key={comp.id}
                        className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-charcoal truncate">{comp.name}</div>
                          <div className="text-xs text-gray-500">
                            {formatCurrency(comp.unitCost)}/{comp.unit}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateMaterialQty(comp.id, comp.qty - 1)}
                            className="w-6 h-6 flex items-center justify-center bg-white border border-gray-200 rounded text-gray-600 hover:bg-gray-100"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={comp.qty}
                            onChange={(e) => updateMaterialQty(comp.id, parseFloat(e.target.value) || 0)}
                            className="w-12 text-center text-sm border border-gray-200 rounded py-1"
                            min="0"
                          />
                          <button
                            onClick={() => updateMaterialQty(comp.id, comp.qty + 1)}
                            className="w-6 h-6 flex items-center justify-center bg-white border border-gray-200 rounded text-gray-600 hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-sm font-medium text-charcoal w-20 text-right">
                          {formatCurrency(comp.unitCost * comp.qty)}
                        </div>
                        <button
                          onClick={() => removeMaterialComponent(comp.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {laborComponents.length === 0 && materialComponents.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <AlertCircle className="w-12 h-12 mb-3" />
                  <p className="text-sm">No items added yet</p>
                  <p className="text-xs mt-1">Select labor rates or materials from the left panel</p>
                </div>
              )}

              {/* Notes */}
              {(laborComponents.length > 0 || materialComponents.length > 0) && (
                <div className="mt-4">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional notes about this assembly..."
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-charcoal/20 focus:border-charcoal resize-none"
                  />
                </div>
              )}
            </div>

            {/* Footer with Totals */}
            <div className="border-t border-gray-200 bg-gray-50 p-4">
              {/* Cost Breakdown */}
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Labor:</span>
                <span className="font-medium">{formatCurrency(totals.labor)}</span>
              </div>
              <div className="flex justify-between text-sm mb-3">
                <span className="text-gray-500">Materials:</span>
                <span className="font-medium">{formatCurrency(totals.materials)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-3 mb-4">
                <span className="text-charcoal">Total:</span>
                <span className="text-charcoal">{formatCurrency(totals.total)}/{unit}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!name.trim() || (laborComponents.length === 0 && materialComponents.length === 0)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-charcoal rounded-lg hover:bg-charcoal/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingAssembly ? 'Update Assembly' : 'Save Assembly'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssemblyBuilder;
