import { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  DollarSign,
  Package,
  Layers,
  Search,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Check,
  Lock,
  Unlock,
  Eye,
  FileEdit,
  Shield,
  Download,
  Upload,
  ScanLine,
  Settings,
} from 'lucide-react';
import {
  MATERIAL_CATEGORIES,
  loadCatalogueData,
  saveLaborRates,
  saveMaterials,
  saveAssemblies,
  saveCustomAssembly,
  deleteCustomAssembly,
  resetCatalogueToDefaults,
  formatCurrency,
  calculateAssemblyCost,
} from '../lib/costCatalogue';
import { TRADE_NAMES } from '../lib/estimateHelpers';
import { AssemblyBuilder } from '../components/catalogue/AssemblyBuilder';
import { AssemblyConfigurator } from '../components/catalogue/AssemblyConfigurator';
import { Modal } from '../components/ui';
import { ReceiptScanner } from '../components/receipt';

// Tab definitions
const TABS = [
  { id: 'labor', label: 'Labor Rates', icon: DollarSign },
  { id: 'materials', label: 'Materials', icon: Package },
  { id: 'assemblies', label: 'Assemblies', icon: Layers },
  { id: 'configurator', label: 'Configurator', icon: Settings },
];

// Edit modes
const EDIT_MODES = {
  VIEW: 'view',           // Just viewing, no edits
  QUICK: 'quick',         // Quick edit - changes not saved to template
  TEMPLATE: 'template',   // Edit template - permanently saves to defaults
};

export function CostCatalogue() {
  const [activeTab, setActiveTab] = useState('labor');
  const [catalogueData, setCatalogueData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [editMode, setEditMode] = useState(EDIT_MODES.VIEW);
  const [showTemplateConfirm, setShowTemplateConfirm] = useState(false);
  const [showAssemblyBuilder, setShowAssemblyBuilder] = useState(false);
  const [editingAssembly, setEditingAssembly] = useState(null);
  const [showReceiptScanner, setShowReceiptScanner] = useState(false);

  // Load data on mount
  useEffect(() => {
    setCatalogueData(loadCatalogueData());
  }, []);

  // Save handlers
  const handleSaveLaborRates = (rates) => {
    saveLaborRates(rates);
    setCatalogueData((prev) => ({ ...prev, laborRates: rates }));
    setHasChanges(false);
  };

  const handleSaveMaterials = (materials) => {
    saveMaterials(materials);
    setCatalogueData((prev) => ({ ...prev, materials }));
    setHasChanges(false);
  };

  const handleSaveAssemblies = (assemblies) => {
    saveAssemblies(assemblies);
    setCatalogueData((prev) => ({ ...prev, assemblies }));
    setHasChanges(false);
  };

  // Handle saving a custom assembly from the builder
  const handleSaveCustomAssembly = (assembly) => {
    saveCustomAssembly(assembly);
    // Reload catalogue data to get updated assemblies
    setCatalogueData(loadCatalogueData());
    setShowAssemblyBuilder(false);
    setEditingAssembly(null);
  };

  // Handle deleting a custom assembly
  const handleDeleteCustomAssembly = (assemblyId) => {
    if (window.confirm('Are you sure you want to delete this custom assembly?')) {
      deleteCustomAssembly(assemblyId);
      setCatalogueData(loadCatalogueData());
    }
  };

  // Open assembly builder for editing
  const handleEditAssembly = (assembly) => {
    setEditingAssembly(assembly);
    setShowAssemblyBuilder(true);
  };

  const handleReset = () => {
    const defaults = resetCatalogueToDefaults();
    setCatalogueData(defaults);
    setShowResetConfirm(false);
    setHasChanges(false);
  };

  // Receipt scanner handlers
  const handleAddMaterialFromReceipt = (newMaterial) => {
    const updatedMaterials = [...(catalogueData.materials || []), newMaterial];
    saveMaterials(updatedMaterials);
    setCatalogueData((prev) => ({ ...prev, materials: updatedMaterials }));
  };

  const handleUpdateMaterialFromReceipt = (materialId, newPrice) => {
    const updatedMaterials = (catalogueData.materials || []).map((m) =>
      m.id === materialId ? { ...m, unitCost: newPrice } : m
    );
    saveMaterials(updatedMaterials);
    setCatalogueData((prev) => ({ ...prev, materials: updatedMaterials }));
  };

  // Export catalogue data as JSON file
  const handleExport = () => {
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      laborRates: catalogueData.laborRates,
      materials: catalogueData.materials,
      assemblies: catalogueData.assemblies,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cost-catalogue-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import catalogue data from JSON file
  const handleImport = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);

        // Validate structure
        if (!importedData.laborRates && !importedData.materials && !importedData.assemblies) {
          alert('Invalid catalogue file. Missing required data.');
          return;
        }

        // Merge with existing data
        const newData = {
          laborRates: importedData.laborRates || catalogueData.laborRates,
          materials: importedData.materials || catalogueData.materials,
          assemblies: importedData.assemblies || catalogueData.assemblies,
          suppliers: catalogueData.suppliers,
        };

        // Save to localStorage
        if (importedData.laborRates) saveLaborRates(importedData.laborRates);
        if (importedData.materials) saveMaterials(importedData.materials);
        if (importedData.assemblies) saveAssemblies(importedData.assemblies);

        setCatalogueData(newData);
        alert('Catalogue imported successfully!');
      } catch (err) {
        console.error('Import error:', err);
        alert('Failed to import catalogue. Please check the file format.');
      }
    };
    reader.readAsText(file);

    // Reset file input
    event.target.value = '';
  };

  if (!catalogueData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-charcoal"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-charcoal">Cost Catalogue</h1>
              <p className="text-sm text-gray-500">
                Manage your labor rates, materials, and reusable assemblies
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Edit Mode Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setEditMode(EDIT_MODES.VIEW)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                  editMode === EDIT_MODES.VIEW
                    ? 'bg-white text-charcoal shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Eye className="w-4 h-4" />
                View
              </button>
              <button
                onClick={() => setEditMode(EDIT_MODES.QUICK)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                  editMode === EDIT_MODES.QUICK
                    ? 'bg-white text-charcoal shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FileEdit className="w-4 h-4" />
                Quick Edit
              </button>
              <button
                onClick={() => {
                  if (editMode !== EDIT_MODES.TEMPLATE) {
                    setShowTemplateConfirm(true);
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                  editMode === EDIT_MODES.TEMPLATE
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Shield className="w-4 h-4" />
                Edit Template
              </button>
            </div>

            {hasChanges && (
              <span className="text-sm text-amber-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {editMode === EDIT_MODES.TEMPLATE ? 'Template changes' : 'Unsaved'}
              </span>
            )}
            {/* Scan Receipt Button */}
            <button
              onClick={() => setShowReceiptScanner(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition-colors"
            >
              <ScanLine className="w-4 h-4" />
              Scan Receipt
            </button>

            {/* Import/Export Buttons */}
            <div className="flex items-center gap-1 border-l border-gray-200 pl-3">
              <label className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                <Upload className="w-4 h-4" />
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>

            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchQuery('');
                }}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-charcoal text-charcoal'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-charcoal/20"
          />
        </div>
      </div>

      {/* Edit Mode Banner */}
      {editMode !== EDIT_MODES.VIEW && (
        <div className={`mb-4 px-4 py-3 rounded-lg flex items-center justify-between ${
          editMode === EDIT_MODES.TEMPLATE
            ? 'bg-amber-50 border border-amber-200'
            : 'bg-blue-50 border border-blue-200'
        }`}>
          <div className="flex items-center gap-2">
            {editMode === EDIT_MODES.TEMPLATE ? (
              <>
                <Shield className="w-5 h-5 text-amber-600" />
                <span className="text-sm text-amber-800">
                  <strong>Template Edit Mode</strong> — Changes will be permanently saved to your default pricing
                </span>
              </>
            ) : (
              <>
                <FileEdit className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-blue-800">
                  <strong>Quick Edit Mode</strong> — Changes are temporary and won't affect your saved templates
                </span>
              </>
            )}
          </div>
          <button
            onClick={() => {
              setEditMode(EDIT_MODES.VIEW);
              setHasChanges(false);
            }}
            className={`text-sm px-3 py-1 rounded flex items-center gap-1 ${
              editMode === EDIT_MODES.TEMPLATE
                ? 'text-amber-700 hover:bg-amber-100'
                : 'text-blue-700 hover:bg-blue-100'
            }`}
          >
            <Lock className="w-3 h-3" />
            Exit Edit Mode
          </button>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'labor' && (
        <LaborRatesTab
          rates={catalogueData.laborRates}
          onSave={handleSaveLaborRates}
          searchQuery={searchQuery}
          onChanges={() => setHasChanges(true)}
          editMode={editMode}
          isEditable={editMode !== EDIT_MODES.VIEW}
          isTemplateMode={editMode === EDIT_MODES.TEMPLATE}
        />
      )}
      {activeTab === 'materials' && (
        <MaterialsTab
          materials={catalogueData.materials}
          onSave={handleSaveMaterials}
          searchQuery={searchQuery}
          onChanges={() => setHasChanges(true)}
          editMode={editMode}
          isEditable={editMode !== EDIT_MODES.VIEW}
          isTemplateMode={editMode === EDIT_MODES.TEMPLATE}
        />
      )}
      {activeTab === 'assemblies' && (
        <AssembliesTab
          assemblies={catalogueData.assemblies}
          materials={catalogueData.materials}
          laborRates={catalogueData.laborRates}
          onSave={handleSaveAssemblies}
          onCreateAssembly={() => {
            setEditingAssembly(null);
            setShowAssemblyBuilder(true);
          }}
          onEditAssembly={handleEditAssembly}
          onDeleteAssembly={handleDeleteCustomAssembly}
          searchQuery={searchQuery}
          isEditable={editMode !== EDIT_MODES.VIEW}
          isTemplateMode={editMode === EDIT_MODES.TEMPLATE}
        />
      )}

      {/* Configurator Tab */}
      {activeTab === 'configurator' && (
        <AssemblyConfigurator
          materials={catalogueData?.materials || []}
          onSave={(assembly) => {
            // Save the custom assembly
            saveCustomAssembly(assembly);
            // Reload catalogue data to get updated assemblies
            setCatalogueData(loadCatalogueData());
            // Switch to assemblies tab to see the new assembly
            setActiveTab('assemblies');
          }}
          onCancel={() => setActiveTab('assemblies')}
        />
      )}

      {/* Assembly Builder Modal */}
      <AssemblyBuilder
        isOpen={showAssemblyBuilder}
        onClose={() => {
          setShowAssemblyBuilder(false);
          setEditingAssembly(null);
        }}
        onSave={handleSaveCustomAssembly}
        laborRates={catalogueData?.laborRates || {}}
        materials={catalogueData?.materials || []}
        editingAssembly={editingAssembly}
      />

      {/* Template Edit Confirmation Modal */}
      {showTemplateConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Shield className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-charcoal">
                Edit Template Mode
              </h3>
            </div>
            <div className="space-y-3 mb-6">
              <p className="text-gray-600">
                Template mode permanently saves changes to your default pricing.
                These changes will apply to all future estimates.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800">
                  <strong>Use "Quick Edit"</strong> for one-time price adjustments that won't
                  affect your saved templates.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowTemplateConfirm(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setEditMode(EDIT_MODES.TEMPLATE);
                  setShowTemplateConfirm(false);
                }}
                className="px-4 py-2 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 flex items-center gap-2"
              >
                <Unlock className="w-4 h-4" />
                Enable Template Editing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-charcoal mb-2">
              Reset to Defaults?
            </h3>
            <p className="text-gray-600 mb-6">
              This will replace all your custom labor rates, materials, and assemblies
              with the default values. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Reset All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Scanner Modal */}
      <Modal
        isOpen={showReceiptScanner}
        onClose={() => setShowReceiptScanner(false)}
        title="Scan Receipt"
      >
        <ReceiptScanner
          existingMaterials={catalogueData?.materials || []}
          onAddMaterial={handleAddMaterialFromReceipt}
          onUpdateMaterial={handleUpdateMaterialFromReceipt}
          onClose={() => setShowReceiptScanner(false)}
        />
      </Modal>
    </div>
  );
}

// ============================================================================
// LABOR RATES TAB
// ============================================================================

function LaborRatesTab({ rates, onSave, searchQuery, onChanges, isEditable, isTemplateMode }) {
  const [editingRates, setEditingRates] = useState(() => {
    // Deep clone to avoid mutation
    const clone = {};
    Object.entries(rates).forEach(([code, data]) => {
      clone[code] = {
        ...data,
        pieceRates: data.pieceRates ? [...data.pieceRates] : [],
      };
    });
    return clone;
  });
  const [expandedTrade, setExpandedTrade] = useState(null);
  const [editingHourly, setEditingHourly] = useState(null);
  const [editingPieceRate, setEditingPieceRate] = useState(null);
  const [showAddPieceRate, setShowAddPieceRate] = useState(null);

  const filteredRates = useMemo(() => {
    if (!searchQuery) return Object.entries(editingRates);
    const lower = searchQuery.toLowerCase();
    return Object.entries(editingRates).filter(
      ([code, data]) =>
        code.toLowerCase().includes(lower) ||
        data.name.toLowerCase().includes(lower) ||
        data.description.toLowerCase().includes(lower) ||
        data.pieceRates?.some(
          (pr) =>
            pr.task.toLowerCase().includes(lower) ||
            pr.notes?.toLowerCase().includes(lower)
        )
    );
  }, [editingRates, searchQuery]);

  const handleHourlyRateChange = (code, value) => {
    setEditingRates((prev) => ({
      ...prev,
      [code]: { ...prev[code], hourlyRate: parseFloat(value) || 0 },
    }));
    onChanges();
  };

  const handlePieceRateChange = (tradeCode, pieceId, field, value) => {
    setEditingRates((prev) => ({
      ...prev,
      [tradeCode]: {
        ...prev[tradeCode],
        pieceRates: prev[tradeCode].pieceRates.map((pr) =>
          pr.id === pieceId
            ? { ...pr, [field]: field === 'rate' ? parseFloat(value) || 0 : value }
            : pr
        ),
      },
    }));
    onChanges();
  };

  const handleAddPieceRate = (tradeCode, newRate) => {
    const id = `${tradeCode.toLowerCase()}-${Date.now()}`;
    setEditingRates((prev) => ({
      ...prev,
      [tradeCode]: {
        ...prev[tradeCode],
        pieceRates: [...(prev[tradeCode].pieceRates || []), { ...newRate, id }],
      },
    }));
    setShowAddPieceRate(null);
    onChanges();
  };

  const handleDeletePieceRate = (tradeCode, pieceId) => {
    setEditingRates((prev) => ({
      ...prev,
      [tradeCode]: {
        ...prev[tradeCode],
        pieceRates: prev[tradeCode].pieceRates.filter((pr) => pr.id !== pieceId),
      },
    }));
    onChanges();
  };

  const handleSave = () => {
    onSave(editingRates);
    setEditingHourly(null);
    setEditingPieceRate(null);
  };

  const getUnitLabel = (unit) => {
    const labels = {
      hour: '/hr',
      sqft: '/sqft',
      lnft: '/lnft',
      each: '/ea',
      opening: '/opening',
      fixture: '/fixture',
      sheet: '/sheet',
      room: '/room',
    };
    return labels[unit] || `/${unit}`;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">
          {isEditable
            ? isTemplateMode
              ? 'Editing template — changes will be saved permanently.'
              : 'Quick edit mode — changes are temporary.'
            : 'Set hourly rates for T&M work and piece-work rates for specific tasks. Switch to edit mode to make changes.'}
        </p>
        {isEditable && isTemplateMode && (
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 text-sm"
          >
            <Save className="w-4 h-4" />
            Save to Template
          </button>
        )}
      </div>

      <div className="space-y-2">
        {filteredRates.map(([code, data]) => {
          const isExpanded = expandedTrade === code;
          const pieceCount = data.pieceRates?.length || 0;

          return (
            <div
              key={code}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden"
            >
              {/* Trade Header Row */}
              <div
                className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedTrade(isExpanded ? null : code)}
              >
                <div className="flex items-center gap-3 flex-1">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {code}
                  </span>
                  <div>
                    <span className="font-medium text-charcoal">{data.name}</span>
                    <span className="text-sm text-gray-400 ml-2">
                      {data.description}
                    </span>
                  </div>
                </div>

                {/* Hourly Rate */}
                <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                  {pieceCount > 0 && (
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                      {pieceCount} piece rate{pieceCount !== 1 ? 's' : ''}
                    </span>
                  )}
                  {isEditable && editingHourly === code ? (
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400">$</span>
                      <input
                        type="number"
                        step="0.50"
                        value={data.hourlyRate}
                        onChange={(e) => handleHourlyRateChange(code, e.target.value)}
                        className="w-20 px-2 py-1 text-right border rounded focus:ring-2 focus:ring-charcoal/20 text-sm"
                        autoFocus
                      />
                      <span className="text-gray-400 text-sm">/hr</span>
                      <button
                        onClick={() => setEditingHourly(null)}
                        className="p-1 text-green-600 hover:bg-green-50 rounded ml-1"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-charcoal">
                        {formatCurrency(data.hourlyRate)}/hr
                      </span>
                      {isEditable && (
                        <button
                          onClick={() => setEditingHourly(code)}
                          className="p-1 text-gray-400 hover:text-charcoal rounded"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded Piece Rates */}
              {isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase">
                      Piece-Work Rates
                    </h4>
                    {isEditable && (
                      <button
                        onClick={() => setShowAddPieceRate(code)}
                        className="text-xs text-charcoal hover:text-charcoal/70 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Add Rate
                      </button>
                    )}
                  </div>

                  {/* Add Piece Rate Form */}
                  {showAddPieceRate === code && (
                    <AddPieceRateForm
                      onAdd={(newRate) => handleAddPieceRate(code, newRate)}
                      onCancel={() => setShowAddPieceRate(null)}
                    />
                  )}

                  {/* Piece Rates List */}
                  {data.pieceRates && data.pieceRates.length > 0 ? (
                    <div className="space-y-2">
                      {data.pieceRates.map((pieceRate) => (
                        <div
                          key={pieceRate.id}
                          className="bg-white rounded-lg border border-gray-200 p-3"
                        >
                          {editingPieceRate === pieceRate.id ? (
                            <div className="grid grid-cols-12 gap-2 items-center">
                              <input
                                type="text"
                                value={pieceRate.task}
                                onChange={(e) =>
                                  handlePieceRateChange(code, pieceRate.id, 'task', e.target.value)
                                }
                                className="col-span-4 px-2 py-1 text-sm border rounded"
                                placeholder="Task name"
                              />
                              <div className="col-span-2 flex items-center gap-1">
                                <span className="text-gray-400 text-sm">$</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={pieceRate.rate}
                                  onChange={(e) =>
                                    handlePieceRateChange(code, pieceRate.id, 'rate', e.target.value)
                                  }
                                  className="w-full px-2 py-1 text-sm border rounded text-right"
                                />
                              </div>
                              <select
                                value={pieceRate.unit}
                                onChange={(e) =>
                                  handlePieceRateChange(code, pieceRate.id, 'unit', e.target.value)
                                }
                                className="col-span-2 px-2 py-1 text-sm border rounded"
                              >
                                <option value="sqft">sqft</option>
                                <option value="lnft">lnft</option>
                                <option value="each">each</option>
                                <option value="opening">opening</option>
                                <option value="fixture">fixture</option>
                                <option value="sheet">sheet</option>
                                <option value="room">room</option>
                              </select>
                              <input
                                type="text"
                                value={pieceRate.notes || ''}
                                onChange={(e) =>
                                  handlePieceRateChange(code, pieceRate.id, 'notes', e.target.value)
                                }
                                className="col-span-3 px-2 py-1 text-sm border rounded"
                                placeholder="Notes"
                              />
                              <button
                                onClick={() => setEditingPieceRate(null)}
                                className="col-span-1 p-1 text-green-600 hover:bg-green-50 rounded justify-self-center"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <span className="font-medium text-charcoal text-sm">
                                  {pieceRate.task}
                                </span>
                                {pieceRate.notes && (
                                  <span className="text-xs text-gray-400 ml-2">
                                    ({pieceRate.notes})
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-medium text-charcoal">
                                  {formatCurrency(pieceRate.rate)}
                                  <span className="text-gray-400 text-sm">
                                    {getUnitLabel(pieceRate.unit)}
                                  </span>
                                </span>
                                {isEditable && (
                                  <>
                                    <button
                                      onClick={() => setEditingPieceRate(pieceRate.id)}
                                      className="p-1 text-gray-400 hover:text-charcoal rounded"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => handleDeletePieceRate(code, pieceRate.id)}
                                      className="p-1 text-gray-400 hover:text-red-600 rounded"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic">
                      No piece-work rates defined. Click "Add Rate" to create one.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Add Piece Rate Form Component
function AddPieceRateForm({ onAdd, onCancel }) {
  const [task, setTask] = useState('');
  const [rate, setRate] = useState('');
  const [unit, setUnit] = useState('sqft');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    if (!task || !rate) return;
    onAdd({ task, rate: parseFloat(rate), unit, notes });
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
      <div className="grid grid-cols-12 gap-2 items-center">
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          className="col-span-4 px-2 py-1 text-sm border rounded"
          placeholder="Task name"
          autoFocus
        />
        <div className="col-span-2 flex items-center gap-1">
          <span className="text-gray-400 text-sm">$</span>
          <input
            type="number"
            step="0.01"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className="w-full px-2 py-1 text-sm border rounded text-right"
            placeholder="0.00"
          />
        </div>
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className="col-span-2 px-2 py-1 text-sm border rounded"
        >
          <option value="sqft">sqft</option>
          <option value="lnft">lnft</option>
          <option value="each">each</option>
          <option value="opening">opening</option>
          <option value="fixture">fixture</option>
          <option value="sheet">sheet</option>
          <option value="room">room</option>
        </select>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="col-span-2 px-2 py-1 text-sm border rounded"
          placeholder="Notes"
        />
        <div className="col-span-2 flex gap-1 justify-end">
          <button
            onClick={handleSubmit}
            disabled={!task || !rate}
            className="px-2 py-1 text-xs bg-charcoal text-white rounded hover:bg-charcoal/90 disabled:opacity-50"
          >
            Add
          </button>
          <button
            onClick={onCancel}
            className="px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MATERIALS TAB
// ============================================================================

function MaterialsTab({ materials, onSave, searchQuery, onChanges, isEditable, isTemplateMode }) {
  const [editingMaterials, setEditingMaterials] = useState([...materials]);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    category: 'lumber',
    name: '',
    unit: 'each',
    unitCost: 0,
    supplier: '',
  });

  // Group materials by category
  const groupedMaterials = useMemo(() => {
    const filtered = searchQuery
      ? editingMaterials.filter(
          (m) =>
            m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : editingMaterials;

    const groups = {};
    MATERIAL_CATEGORIES.forEach((cat) => {
      groups[cat.id] = {
        ...cat,
        items: filtered.filter((m) => m.category === cat.id),
      };
    });
    return groups;
  }, [editingMaterials, searchQuery]);

  const handleMaterialChange = (id, field, value) => {
    setEditingMaterials((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, [field]: field === 'unitCost' ? parseFloat(value) || 0 : value }
          : m
      )
    );
    onChanges();
  };

  const handleDeleteMaterial = (id) => {
    setEditingMaterials((prev) => prev.filter((m) => m.id !== id));
    onChanges();
  };

  const handleAddMaterial = () => {
    const id = `mat-${Date.now()}`;
    setEditingMaterials((prev) => [...prev, { ...newMaterial, id }]);
    setNewMaterial({
      category: newMaterial.category,
      name: '',
      unit: 'each',
      unitCost: 0,
      supplier: '',
    });
    setShowAddForm(false);
    onChanges();
  };

  const handleSave = () => {
    onSave(editingMaterials);
    setEditingId(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">
          {isEditable
            ? isTemplateMode
              ? 'Editing template — changes will be saved permanently.'
              : 'Quick edit mode — changes are temporary.'
            : 'Track material costs by category. Switch to edit mode to make changes.'}
        </p>
        <div className="flex gap-2">
          {isEditable && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Material
            </button>
          )}
          {isEditable && isTemplateMode && (
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 text-sm"
            >
              <Save className="w-4 h-4" />
              Save to Template
            </button>
          )}
        </div>
      </div>

      {/* Add Material Form */}
      {showAddForm && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
          <h4 className="font-medium text-charcoal mb-3">Add New Material</h4>
          <div className="grid grid-cols-5 gap-3">
            <select
              value={newMaterial.category}
              onChange={(e) => setNewMaterial((prev) => ({ ...prev, category: e.target.value }))}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-charcoal/20"
            >
              {MATERIAL_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Material name"
              value={newMaterial.name}
              onChange={(e) => setNewMaterial((prev) => ({ ...prev, name: e.target.value }))}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-charcoal/20"
            />
            <input
              type="text"
              placeholder="Unit (each, sqft, etc)"
              value={newMaterial.unit}
              onChange={(e) => setNewMaterial((prev) => ({ ...prev, unit: e.target.value }))}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-charcoal/20"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Cost"
              value={newMaterial.unitCost || ''}
              onChange={(e) =>
                setNewMaterial((prev) => ({ ...prev, unitCost: parseFloat(e.target.value) || 0 }))
              }
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-charcoal/20"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddMaterial}
                disabled={!newMaterial.name}
                className="flex-1 px-3 py-2 bg-charcoal text-white rounded-lg hover:bg-charcoal/90 disabled:opacity-50"
              >
                Add
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-3 py-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Accordions */}
      <div className="space-y-2">
        {Object.entries(groupedMaterials).map(([catId, category]) => {
          if (category.items.length === 0 && searchQuery) return null;
          const isExpanded = expandedCategory === catId || searchQuery;

          return (
            <div
              key={catId}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setExpandedCategory(isExpanded && !searchQuery ? null : catId)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="font-medium text-charcoal">{category.name}</span>
                  <span className="text-sm text-gray-400">({category.items.length})</span>
                </div>
              </button>

              {isExpanded && category.items.length > 0 && (
                <div className="border-t border-gray-100">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">
                          Name
                        </th>
                        <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">
                          Unit
                        </th>
                        <th className="text-right px-4 py-2 text-xs font-semibold text-gray-500">
                          Cost
                        </th>
                        <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">
                          Supplier
                        </th>
                        <th className="w-20"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {category.items.map((material) => (
                        <tr key={material.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2">
                            {editingId === material.id ? (
                              <input
                                type="text"
                                value={material.name}
                                onChange={(e) =>
                                  handleMaterialChange(material.id, 'name', e.target.value)
                                }
                                className="w-full px-2 py-1 border rounded text-sm"
                              />
                            ) : (
                              <span className="text-sm text-charcoal">{material.name}</span>
                            )}
                          </td>
                          <td className="px-4 py-2">
                            {editingId === material.id ? (
                              <input
                                type="text"
                                value={material.unit}
                                onChange={(e) =>
                                  handleMaterialChange(material.id, 'unit', e.target.value)
                                }
                                className="w-24 px-2 py-1 border rounded text-sm"
                              />
                            ) : (
                              <span className="text-sm text-gray-500">{material.unit}</span>
                            )}
                          </td>
                          <td className="px-4 py-2 text-right">
                            {editingId === material.id ? (
                              <input
                                type="number"
                                step="0.01"
                                value={material.unitCost}
                                onChange={(e) =>
                                  handleMaterialChange(material.id, 'unitCost', e.target.value)
                                }
                                className="w-24 px-2 py-1 border rounded text-sm text-right"
                              />
                            ) : (
                              <span className="text-sm font-medium text-charcoal">
                                {formatCurrency(material.unitCost)}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2">
                            {editingId === material.id ? (
                              <input
                                type="text"
                                value={material.supplier || ''}
                                onChange={(e) =>
                                  handleMaterialChange(material.id, 'supplier', e.target.value)
                                }
                                className="w-full px-2 py-1 border rounded text-sm"
                                placeholder="Supplier name"
                              />
                            ) : (
                              <span className="text-sm text-gray-400">
                                {material.supplier || '—'}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2">
                            {isEditable && (
                              <div className="flex gap-1 justify-end">
                                <button
                                  onClick={() =>
                                    setEditingId(editingId === material.id ? null : material.id)
                                  }
                                  className="p-1 text-gray-400 hover:text-charcoal rounded"
                                >
                                  {editingId === material.id ? (
                                    <Check className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <Edit2 className="w-4 h-4" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleDeleteMaterial(material.id)}
                                  className="p-1 text-gray-400 hover:text-red-600 rounded"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// ASSEMBLIES TAB
// ============================================================================

function AssembliesTab({
  assemblies,
  materials,
  laborRates,
  onSave,
  onCreateAssembly,
  onEditAssembly,
  onDeleteAssembly,
  searchQuery,
  isEditable,
  isTemplateMode
}) {
  const [localAssemblies, setLocalAssemblies] = useState([...assemblies]);
  const [expandedId, setExpandedId] = useState(null);

  // Update local assemblies when prop changes
  useEffect(() => {
    setLocalAssemblies([...assemblies]);
  }, [assemblies]);

  // Filter assemblies
  const filteredAssemblies = useMemo(() => {
    if (!searchQuery) return localAssemblies;
    const lower = searchQuery.toLowerCase();
    return localAssemblies.filter(
      (a) =>
        a.name.toLowerCase().includes(lower) ||
        a.description.toLowerCase().includes(lower) ||
        a.category.toLowerCase().includes(lower)
    );
  }, [localAssemblies, searchQuery]);

  // Group by category
  const groupedAssemblies = useMemo(() => {
    const groups = {};
    MATERIAL_CATEGORIES.forEach((cat) => {
      groups[cat.id] = {
        ...cat,
        items: filteredAssemblies.filter((a) => a.category === cat.id),
      };
    });
    return groups;
  }, [filteredAssemblies]);

  const handleSave = () => {
    onSave(localAssemblies);
  };

  const getMaterialName = (materialId) => {
    const mat = materials.find((m) => m.id === materialId);
    return mat ? mat.name : materialId;
  };

  const getMaterialCost = (materialId) => {
    const mat = materials.find((m) => m.id === materialId);
    return mat ? mat.unitCost : 0;
  };

  // Count custom vs default assemblies
  const customCount = localAssemblies.filter(a => a.isCustom).length;
  const defaultCount = localAssemblies.length - customCount;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-sm text-gray-500">
            {isEditable
              ? isTemplateMode
                ? 'Editing template — changes will be saved permanently.'
                : 'Quick edit mode — changes are temporary.'
              : 'Assemblies bundle labor and materials for common tasks.'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {defaultCount} default assemblies • {customCount} custom assemblies
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCreateAssembly}
            className="flex items-center gap-2 px-4 py-2 bg-charcoal text-white rounded-lg hover:bg-charcoal/90 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Create Assembly
          </button>
          {isEditable && isTemplateMode && (
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 text-sm"
            >
              <Save className="w-4 h-4" />
              Save to Template
            </button>
          )}
        </div>
      </div>

      {/* Assembly Cards */}
      <div className="grid gap-4">
        {Object.entries(groupedAssemblies).map(([catId, category]) => {
          if (category.items.length === 0) return null;

          return (
            <div key={catId}>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {category.name}
              </h3>
              <div className="space-y-2">
                {category.items.map((assembly) => {
                  const isExpanded = expandedId === assembly.id;
                  const costs = calculateAssemblyCost(assembly, materials, 'better');
                  // Determine if this is old format (has tradeCode/labor) or new format (has unitCost/components)
                  const isNewFormat = assembly.unitCost !== undefined || assembly.components;
                  const displayCode = assembly.tradeCode || assembly.category?.toUpperCase() || 'ASM';
                  const isCustom = assembly.isCustom;

                  return (
                    <div
                      key={assembly.id}
                      className={`bg-white border rounded-xl overflow-hidden ${
                        isCustom ? 'border-blue-200 ring-1 ring-blue-100' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center">
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : assembly.id)}
                          className="flex-1 flex items-center justify-between px-4 py-3 hover:bg-gray-50 text-left"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              )}
                              <span className={`font-mono text-xs px-2 py-0.5 rounded ${
                                isCustom ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'
                              }`}>
                                {isCustom ? 'CUSTOM' : displayCode}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-charcoal">{assembly.name}</div>
                              <div className="text-sm text-gray-500">{assembly.description}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-charcoal">
                              {formatCurrency(costs.total)}/{assembly.unit}
                          </div>
                          <div className="text-xs text-gray-400">
                            {isNewFormat ? (
                              `Labor only • Fixtures by owner`
                            ) : (
                              <>Labor: {formatCurrency(costs.labor)} | Materials: {formatCurrency(costs.materials)}</>
                            )}
                          </div>
                        </div>
                      </button>
                        {/* Edit/Delete buttons for custom assemblies */}
                        {isCustom && (
                          <div className="flex items-center gap-1 pr-3 border-l border-gray-200 pl-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditAssembly(assembly);
                              }}
                              className="p-2 text-gray-500 hover:text-charcoal hover:bg-gray-100 rounded-lg"
                              title="Edit assembly"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteAssembly(assembly.id);
                              }}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                              title="Delete assembly"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      {isExpanded && (
                        <div className="border-t border-gray-100 p-4 bg-gray-50">
                          {isNewFormat ? (
                            /* New format: components-based assemblies */
                            <div className="space-y-4">
                              {/* Components */}
                              {assembly.components && assembly.components.length > 0 && (
                                <div>
                                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                                    Components
                                  </h4>
                                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                                    {assembly.components.map((comp, idx) => (
                                      <div key={idx} className="flex justify-between text-sm py-1">
                                        <span className="text-gray-600">
                                          {comp.description} {comp.qty > 1 ? `x${comp.qty}` : ''}
                                        </span>
                                        <span className="font-mono text-xs text-gray-400">
                                          {comp.id}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Source & Confidence */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                                    Source
                                  </h4>
                                  <div className="bg-white rounded-lg p-3 border border-gray-200 text-sm">
                                    <div className="text-gray-600">{assembly.source || 'Unknown'}</div>
                                    {assembly.sourceDate && (
                                      <div className="text-xs text-gray-400 mt-1">{assembly.sourceDate}</div>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                                    Confidence
                                  </h4>
                                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                      assembly.confidence === 2 ? 'bg-green-100 text-green-800' :
                                      assembly.confidence === 1 ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {assembly.confidence === 2 ? 'Verified' :
                                       assembly.confidence === 1 ? 'Limited Data' : 'Estimate'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Notes */}
                              {assembly.notes && (
                                <div>
                                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                                    Notes
                                  </h4>
                                  <div className="bg-white rounded-lg p-3 border border-gray-200 text-sm text-gray-600">
                                    {assembly.notes}
                                  </div>
                                </div>
                              )}

                              {/* Total */}
                              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                <span className="font-medium text-gray-600">Assembly Total:</span>
                                <span className="text-xl font-bold text-charcoal">
                                  {formatCurrency(costs.total)}/{assembly.unit}
                                </span>
                              </div>
                            </div>
                          ) : (
                            /* Old format: labor + materials breakdown */
                            <>
                              <div className="grid grid-cols-2 gap-6">
                                {/* Labor */}
                                <div>
                                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                                    Labor
                                  </h4>
                                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                                    <div className="flex justify-between text-sm">
                                      <span>Hours:</span>
                                      <span className="font-medium">{assembly.labor?.hours || 0} hrs</span>
                                    </div>
                                    <div className="flex justify-between text-sm mt-1">
                                      <span>Rate ({TRADE_NAMES[assembly.tradeCode] || assembly.tradeCode}):</span>
                                      <span className="font-medium">
                                        {formatCurrency(assembly.labor?.rate || 0)}/hr
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-sm mt-2 pt-2 border-t border-gray-100">
                                      <span className="font-medium">Labor Total:</span>
                                      <span className="font-bold text-charcoal">
                                        {formatCurrency(costs.labor)}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Materials */}
                                <div>
                                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                                    Materials
                                  </h4>
                                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                                    {(assembly.materials || []).map((mat, idx) => (
                                      <div key={idx} className="flex justify-between text-sm py-1">
                                        <span className="text-gray-600">
                                          {getMaterialName(mat.materialId)} x{mat.qty}
                                        </span>
                                        <span className="font-medium">
                                          {formatCurrency(getMaterialCost(mat.materialId) * mat.qty)}
                                        </span>
                                      </div>
                                    ))}
                                    <div className="flex justify-between text-sm mt-2 pt-2 border-t border-gray-100">
                                      <span className="font-medium">Materials Total:</span>
                                      <span className="font-bold text-charcoal">
                                        {formatCurrency(costs.materials)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Tier Pricing */}
                              <div className="mt-4">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                                  Tier Pricing
                                </h4>
                                <div className="flex gap-4">
                                  {['good', 'better', 'best'].map((tier) => {
                                    const tierCost = calculateAssemblyCost(assembly, materials, tier);
                                    return (
                                      <div
                                        key={tier}
                                        className={`flex-1 bg-white rounded-lg p-3 border ${
                                          tier === 'better'
                                            ? 'border-charcoal ring-1 ring-charcoal'
                                            : 'border-gray-200'
                                        }`}
                                      >
                                        <div className="text-xs text-gray-500 uppercase">
                                          {tier}
                                          {tier === 'better' && (
                                            <span className="ml-1 text-charcoal">(default)</span>
                                          )}
                                        </div>
                                        <div className="text-lg font-bold text-charcoal mt-1">
                                          {formatCurrency(tierCost.total)}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                          {assembly.tierMultipliers?.[tier] || 1.0}x multiplier
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CostCatalogue;
