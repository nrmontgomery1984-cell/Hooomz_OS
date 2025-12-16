import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Users,
  Clock,
  DollarSign,
  Calculator,
  ChevronDown,
  ChevronUp,
  FolderOpen,
  Download,
  X,
  Check,
  Calendar
} from 'lucide-react';
import { Card, Button } from '../components/ui';
import { getProjects } from '../services/api';

const STORAGE_KEY = 'hooomz_time_budget_crews';

// Load saved crews from localStorage
function loadCrewsFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : getDefaultCrews();
  } catch {
    return getDefaultCrews();
  }
}

function saveCrewsToStorage(crews) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(crews));
}

function getDefaultCrews() {
  return [
    { id: '1', name: 'Lead Carpenter', hourlyRate: 85, isActive: true },
    { id: '2', name: 'Carpenter', hourlyRate: 65, isActive: true },
    { id: '3', name: 'Apprentice', hourlyRate: 45, isActive: true },
    { id: '4', name: 'Laborer', hourlyRate: 35, isActive: false },
  ];
}

// Work categories with labor rates
const WORK_CATEGORIES = [
  { code: 'DM', name: 'Demo', avgHoursPerUnit: 0.5, unit: 'SF' },
  { code: 'FS', name: 'Framing', avgHoursPerUnit: 0.15, unit: 'SF' },
  { code: 'EL', name: 'Electrical', avgHoursPerUnit: 0.25, unit: 'outlet' },
  { code: 'PL', name: 'Plumbing', avgHoursPerUnit: 2, unit: 'fixture' },
  { code: 'DW', name: 'Drywall', avgHoursPerUnit: 0.08, unit: 'SF' },
  { code: 'PT', name: 'Paint', avgHoursPerUnit: 0.05, unit: 'SF' },
  { code: 'FL', name: 'Flooring', avgHoursPerUnit: 0.1, unit: 'SF' },
  { code: 'TL', name: 'Tile', avgHoursPerUnit: 0.2, unit: 'SF' },
  { code: 'CM', name: 'Cabinets', avgHoursPerUnit: 1.5, unit: 'LF' },
  { code: 'FC', name: 'Trim/Finish', avgHoursPerUnit: 0.15, unit: 'LF' },
  { code: 'RF', name: 'Roofing', avgHoursPerUnit: 0.03, unit: 'SF' },
  { code: 'GN', name: 'General', avgHoursPerUnit: 1, unit: 'hour' },
];

// Map estimate trade codes to our categories
function mapTradeToCategory(tradeCode) {
  const mapping = {
    'demo': 'DM',
    'framing': 'FS',
    'electrical': 'EL',
    'plumbing': 'PL',
    'drywall': 'DW',
    'paint': 'PT',
    'flooring': 'FL',
    'tile': 'TL',
    'cabinets': 'CM',
    'trim': 'FC',
    'roofing': 'RF',
    'hvac': 'GN',
    'insulation': 'GN',
    'windows': 'GN',
    'doors': 'GN',
  };
  return mapping[tradeCode?.toLowerCase()] || 'GN';
}

export function TimeBudgetCalculator() {
  const navigate = useNavigate();
  const [crews, setCrews] = useState(() => loadCrewsFromStorage());
  const [showCrewManager, setShowCrewManager] = useState(false);
  const [newCrewName, setNewCrewName] = useState('');
  const [newCrewRate, setNewCrewRate] = useState('');

  // Hours per day for days calculation
  const [hoursPerDay, setHoursPerDay] = useState(8);

  // Project import state
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectLineItems, setProjectLineItems] = useState([]);
  const [selectedImportItems, setSelectedImportItems] = useState(new Set());

  // Line items for calculation
  // Each item can have either quantity (SF, etc.) OR dollarAmount - hours calculated from whichever is provided
  const [lineItems, setLineItems] = useState([
    { id: '1', category: 'FS', description: 'Frame new walls', quantity: 200, unit: 'SF', dollarAmount: 0, inputMode: 'quantity' },
  ]);

  // Load projects when picker opens
  useEffect(() => {
    if (showProjectPicker && projects.length === 0) {
      loadProjects();
    }
  }, [showProjectPicker]);

  async function loadProjects() {
    setLoadingProjects(true);
    try {
      const { data } = await getProjects();
      // Filter to projects that have estimates
      const projectsWithEstimates = (data || []).filter(p =>
        p.intake_data?.estimate_line_items?.length > 0 ||
        p.intake_data?.instances?.length > 0 ||
        p.estimate_line_items?.length > 0
      );
      setProjects(projectsWithEstimates);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoadingProjects(false);
    }
  }

  async function handleProjectSelect(project) {
    setSelectedProject(project);

    // Get the estimate line items from the project
    const estimateItems =
      project.intake_data?.estimate_line_items ||
      project.intake_data?.instances ||
      project.estimate_line_items ||
      [];

    // Convert to our format
    const converted = estimateItems.map((item, idx) => ({
      id: `import-${idx}`,
      originalId: item.id,
      category: mapTradeToCategory(item.trade || item.category),
      description: item.name || item.description || 'Unnamed item',
      quantity: item.quantity || 1,
      unit: item.unit || 'EA',
      trade: item.trade || item.category,
      estimatedCost: item.unitPriceBetter * item.quantity || item.total || 0,
    }));

    setProjectLineItems(converted);
    // Select all by default
    setSelectedImportItems(new Set(converted.map(i => i.id)));
  }

  function handleImportSelected() {
    const itemsToImport = projectLineItems
      .filter(item => selectedImportItems.has(item.id))
      .map(item => ({
        id: crypto.randomUUID(),
        category: item.category,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        dollarAmount: item.estimatedCost || 0,
        inputMode: 'quantity', // Default to quantity mode when importing
      }));

    if (itemsToImport.length > 0) {
      setLineItems(prev => [...prev, ...itemsToImport]);
    }

    // Close picker
    setShowProjectPicker(false);
    setSelectedProject(null);
    setProjectLineItems([]);
    setSelectedImportItems(new Set());
  }

  function toggleImportItem(itemId) {
    setSelectedImportItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  }

  function selectAllImportItems() {
    setSelectedImportItems(new Set(projectLineItems.map(i => i.id)));
  }

  function deselectAllImportItems() {
    setSelectedImportItems(new Set());
  }

  // Active crew members for this calculation
  const activeCrews = crews.filter(c => c.isActive);

  // Calculate blended rate
  const blendedRate = useMemo(() => {
    if (activeCrews.length === 0) return 0;
    const total = activeCrews.reduce((sum, c) => sum + c.hourlyRate, 0);
    return total / activeCrews.length;
  }, [activeCrews]);

  // Calculate totals for each line item
  const calculations = useMemo(() => {
    return lineItems.map(item => {
      const category = WORK_CATEGORIES.find(c => c.code === item.category);
      const hoursPerUnit = category?.avgHoursPerUnit || 1;

      let totalHours;
      let laborCost;

      if (item.inputMode === 'dollar' && item.dollarAmount > 0) {
        // Calculate hours from dollar amount: dollars / blended rate = hours
        laborCost = item.dollarAmount;
        totalHours = blendedRate > 0 ? item.dollarAmount / blendedRate : 0;
      } else {
        // Calculate from quantity
        totalHours = item.quantity * hoursPerUnit;
        laborCost = totalHours * blendedRate;
      }

      // With crew working together, elapsed time is reduced
      const crewSize = activeCrews.length;
      const elapsedHours = crewSize > 0 ? totalHours / crewSize : totalHours;

      return {
        ...item,
        categoryName: category?.name || 'Unknown',
        hoursPerUnit,
        totalHours,
        elapsedHours,
        laborCost,
      };
    });
  }, [lineItems, blendedRate, activeCrews]);

  // Grand totals
  const totals = useMemo(() => {
    const base = calculations.reduce((acc, calc) => ({
      totalHours: acc.totalHours + calc.totalHours,
      elapsedHours: acc.elapsedHours + calc.elapsedHours,
      laborCost: acc.laborCost + calc.laborCost,
    }), { totalHours: 0, elapsedHours: 0, laborCost: 0 });

    // Calculate days: total labor hours / (crew size * hours per day)
    // e.g., 72 total hours / (3 crew * 8 hrs/day) = 3 days
    const crewSize = activeCrews.length;
    const crewHoursPerDay = crewSize * hoursPerDay;
    const totalDays = crewHoursPerDay > 0 ? base.totalHours / crewHoursPerDay : 0;

    return {
      ...base,
      totalDays,
      crewHoursPerDay,
    };
  }, [calculations, activeCrews, hoursPerDay]);

  // Crew management functions
  const addCrewMember = () => {
    if (!newCrewName.trim() || !newCrewRate) return;
    const newCrew = {
      id: crypto.randomUUID(),
      name: newCrewName.trim(),
      hourlyRate: parseFloat(newCrewRate),
      isActive: true,
    };
    const updated = [...crews, newCrew];
    setCrews(updated);
    saveCrewsToStorage(updated);
    setNewCrewName('');
    setNewCrewRate('');
  };

  const toggleCrewActive = (crewId) => {
    const updated = crews.map(c =>
      c.id === crewId ? { ...c, isActive: !c.isActive } : c
    );
    setCrews(updated);
    saveCrewsToStorage(updated);
  };

  const removeCrewMember = (crewId) => {
    const updated = crews.filter(c => c.id !== crewId);
    setCrews(updated);
    saveCrewsToStorage(updated);
  };

  const updateCrewRate = (crewId, newRate) => {
    const updated = crews.map(c =>
      c.id === crewId ? { ...c, hourlyRate: parseFloat(newRate) || 0 } : c
    );
    setCrews(updated);
    saveCrewsToStorage(updated);
  };

  // Line item functions
  const addLineItem = () => {
    setLineItems([...lineItems, {
      id: crypto.randomUUID(),
      category: 'GN',
      description: '',
      quantity: 0,
      unit: 'hour',
      dollarAmount: 0,
      inputMode: 'quantity',
    }]);
  };

  const updateLineItem = (id, field, value) => {
    setLineItems(lineItems.map(item => {
      if (item.id !== id) return item;

      // If changing category, update unit to match
      if (field === 'category') {
        const cat = WORK_CATEGORIES.find(c => c.code === value);
        return { ...item, category: value, unit: cat?.unit || 'hour' };
      }

      // If switching input mode, clear the other value
      if (field === 'inputMode') {
        return {
          ...item,
          inputMode: value,
          quantity: value === 'quantity' ? item.quantity : 0,
          dollarAmount: value === 'dollar' ? item.dollarAmount : 0,
        };
      }

      return { ...item, [field]: value };
    }));
  };

  const removeLineItem = (id) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const clearAllItems = () => {
    setLineItems([]);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatHours = (hours) => {
    if (hours < 1) return `${Math.round(hours * 60)}min`;
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-charcoal">Time Budget Calculator</h1>
            <p className="text-xs text-gray-500">Estimate labor hours and costs</p>
          </div>
          <Calculator className="w-5 h-5 text-gray-400" />
        </div>
      </header>

      <div className="p-4 space-y-4 pb-32">
        {/* Crew Section */}
        <Card className="p-4">
          <button
            onClick={() => setShowCrewManager(!showCrewManager)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-charcoal">Crew</span>
              <span className="text-sm text-gray-500">
                ({activeCrews.length} active)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-charcoal">
                  {formatCurrency(blendedRate)}/hr
                </p>
                <p className="text-xs text-gray-500">blended rate</p>
              </div>
              {showCrewManager ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </button>

          {showCrewManager && (
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
              {/* Existing crew members */}
              {crews.map(crew => (
                <div
                  key={crew.id}
                  className={`flex items-center gap-3 p-2 rounded-lg ${
                    crew.isActive ? 'bg-blue-50' : 'bg-gray-50'
                  }`}
                >
                  <button
                    onClick={() => toggleCrewActive(crew.id)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      crew.isActive
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-gray-300'
                    }`}
                  >
                    {crew.isActive && <span className="text-xs">✓</span>}
                  </button>
                  <span className={`flex-1 text-sm ${crew.isActive ? 'text-charcoal' : 'text-gray-400'}`}>
                    {crew.name}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400 text-sm">$</span>
                    <input
                      type="number"
                      value={crew.hourlyRate}
                      onChange={(e) => updateCrewRate(crew.id, e.target.value)}
                      className="w-16 text-sm text-right border border-gray-200 rounded px-2 py-1"
                    />
                    <span className="text-gray-400 text-xs">/hr</span>
                  </div>
                  <button
                    onClick={() => removeCrewMember(crew.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* Add new crew member */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Name/Role"
                  value={newCrewName}
                  onChange={(e) => setNewCrewName(e.target.value)}
                  className="flex-1 text-sm border border-gray-200 rounded px-3 py-2"
                />
                <div className="flex items-center gap-1">
                  <span className="text-gray-400 text-sm">$</span>
                  <input
                    type="number"
                    placeholder="Rate"
                    value={newCrewRate}
                    onChange={(e) => setNewCrewRate(e.target.value)}
                    className="w-20 text-sm border border-gray-200 rounded px-2 py-2"
                  />
                </div>
                <Button size="sm" onClick={addCrewMember}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Line Items */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-charcoal flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              Work Items
            </h2>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowProjectPicker(true)}
              >
                <FolderOpen className="w-4 h-4 mr-1" />
                Import
              </Button>
              <Button size="sm" variant="secondary" onClick={addLineItem}>
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
          </div>

          {lineItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No work items yet</p>
              <p className="text-xs mt-1">Add items manually or import from a project</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lineItems.map((item, index) => {
                const calc = calculations[index];
                return (
                  <div key={item.id} className="p-3 bg-gray-50 rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <select
                        value={item.category}
                        onChange={(e) => updateLineItem(item.id, 'category', e.target.value)}
                        className="text-sm border border-gray-200 rounded px-2 py-1.5 bg-white"
                      >
                        {WORK_CATEGORIES.map(cat => (
                          <option key={cat.code} value={cat.code}>{cat.name}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                        className="flex-1 text-sm border border-gray-200 rounded px-2 py-1.5"
                      />
                      <button
                        onClick={() => removeLineItem(item.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Input mode toggle and value */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateLineItem(item.id, 'inputMode', item.inputMode === 'quantity' ? 'dollar' : 'quantity')}
                          className={`px-2 py-1 text-xs rounded-l border ${
                            item.inputMode === 'quantity'
                              ? 'bg-blue-100 border-blue-300 text-blue-700'
                              : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                          }`}
                          title="Enter quantity"
                        >
                          {item.unit}
                        </button>
                        <button
                          onClick={() => updateLineItem(item.id, 'inputMode', item.inputMode === 'dollar' ? 'quantity' : 'dollar')}
                          className={`px-2 py-1 text-xs rounded-r border-t border-r border-b ${
                            item.inputMode === 'dollar'
                              ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                              : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                          }`}
                          title="Enter dollar amount"
                        >
                          $
                        </button>
                        {item.inputMode === 'quantity' ? (
                          <input
                            type="number"
                            value={item.quantity || ''}
                            onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            className="w-20 text-sm border border-gray-200 rounded px-2 py-1.5 text-right ml-1"
                          />
                        ) : (
                          <div className="flex items-center ml-1">
                            <span className="text-gray-400 text-sm">$</span>
                            <input
                              type="number"
                              value={item.dollarAmount || ''}
                              onChange={(e) => updateLineItem(item.id, 'dollarAmount', parseFloat(e.target.value) || 0)}
                              placeholder="0"
                              className="w-24 text-sm border border-gray-200 rounded px-2 py-1.5 text-right"
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 flex items-center justify-end gap-4 text-sm">
                        <div className="text-gray-500">
                          <span className="font-medium text-charcoal">{formatHours(calc?.totalHours || 0)}</span>
                          <span className="text-xs ml-1">labor</span>
                        </div>
                        <div className="text-gray-500">
                          <span className="font-medium text-charcoal">{formatHours(calc?.elapsedHours || 0)}</span>
                          <span className="text-xs ml-1">elapsed</span>
                        </div>
                        <div className="text-emerald-600 font-medium">
                          {formatCurrency(calc?.laborCost || 0)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {lineItems.length > 1 && (
                <button
                  onClick={clearAllItems}
                  className="w-full py-2 text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Clear all items
                </button>
              )}
            </div>
          )}
        </Card>

        {/* Budget Summary */}
        <Card className="p-4 bg-gradient-to-br from-charcoal to-gray-800 text-white">
          <h2 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Budget Summary
          </h2>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-2xl font-bold">{formatHours(totals.totalHours)}</p>
              <p className="text-xs text-gray-400">Total Labor Hours</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{formatHours(totals.elapsedHours)}</p>
              <p className="text-xs text-gray-400">
                Elapsed ({activeCrews.length} crew)
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-400">{formatCurrency(totals.laborCost)}</p>
              <p className="text-xs text-gray-400">Total Labor Cost</p>
            </div>
          </div>

          {activeCrews.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-700">
              <p className="text-xs text-gray-400">
                Crew: {activeCrews.map(c => c.name).join(', ')}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Blended Rate: {formatCurrency(blendedRate)}/hr × {totals.totalHours.toFixed(1)} hrs = {formatCurrency(totals.laborCost)}
              </p>
            </div>
          )}
        </Card>

        {/* Days Calculator */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium text-charcoal flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Days Calculator
            </h2>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Hours per day:</label>
              <select
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(parseInt(e.target.value))}
                className="text-sm border border-gray-200 rounded px-2 py-1.5 bg-white"
              >
                <option value={4}>4 hrs</option>
                <option value={6}>6 hrs</option>
                <option value={8}>8 hrs</option>
                <option value={10}>10 hrs</option>
                <option value={12}>12 hrs</option>
              </select>
            </div>
            <div className="text-sm text-gray-500">
              × {activeCrews.length} crew = <span className="font-medium text-charcoal">{totals.crewHoursPerDay} hrs/day</span>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-purple-700">
              {totals.totalDays.toFixed(1)} days
            </p>
            <p className="text-sm text-purple-600 mt-1">
              {totals.totalHours.toFixed(1)} labor hrs ÷ {totals.crewHoursPerDay} crew-hrs/day
            </p>
          </div>

          {totals.totalDays > 0 && (
            <div className="mt-3 text-xs text-gray-500 text-center">
              {Math.ceil(totals.totalDays)} working days to complete
              {totals.totalDays % 1 !== 0 && ` (${Math.round((totals.totalDays % 1) * hoursPerDay)} hrs on final day)`}
            </div>
          )}
        </Card>

        {/* Quick Reference */}
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Labor Rate Reference</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {WORK_CATEGORIES.slice(0, 8).map(cat => (
              <div key={cat.code} className="flex justify-between text-gray-600">
                <span>{cat.name}</span>
                <span className="text-gray-400">{cat.avgHoursPerUnit} hrs/{cat.unit}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Project Picker Modal */}
      {showProjectPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg max-h-[80vh] rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-charcoal">
                {selectedProject ? 'Select Items to Import' : 'Import from Project'}
              </h3>
              <button
                onClick={() => {
                  setShowProjectPicker(false);
                  setSelectedProject(null);
                  setProjectLineItems([]);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {!selectedProject ? (
                // Project List
                loadingProjects ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Loading projects...</p>
                  </div>
                ) : projects.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FolderOpen className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No projects with estimates found</p>
                    <p className="text-xs mt-1">Create an estimate first to import items</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {projects.map(project => {
                      const itemCount =
                        project.intake_data?.estimate_line_items?.length ||
                        project.intake_data?.instances?.length ||
                        project.estimate_line_items?.length ||
                        0;
                      return (
                        <button
                          key={project.id}
                          onClick={() => handleProjectSelect(project)}
                          className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <p className="font-medium text-charcoal">{project.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {itemCount} line items • {project.phase || 'No phase'}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )
              ) : (
                // Line Item Selection
                <div className="space-y-3">
                  {/* Select All / None */}
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">
                      {selectedImportItems.size} of {projectLineItems.length} selected
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={selectAllImportItems}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Select All
                      </button>
                      <button
                        onClick={deselectAllImportItems}
                        className="text-xs text-gray-500 hover:underline"
                      >
                        None
                      </button>
                    </div>
                  </div>

                  {projectLineItems.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">No line items found in this project</p>
                    </div>
                  ) : (
                    projectLineItems.map(item => (
                      <div
                        key={item.id}
                        onClick={() => toggleImportItem(item.id)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedImportItems.has(item.id)
                            ? 'bg-blue-50 border border-blue-200'
                            : 'bg-gray-50 border border-transparent hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                            selectedImportItems.has(item.id)
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'border-gray-300'
                          }`}>
                            {selectedImportItems.has(item.id) && <Check className="w-3 h-3" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-charcoal truncate">
                              {item.description}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {item.trade || item.category} • {item.quantity} {item.unit}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {selectedProject && (
              <div className="px-4 py-3 border-t border-gray-200 flex gap-2">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setSelectedProject(null);
                    setProjectLineItems([]);
                  }}
                >
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleImportSelected}
                  disabled={selectedImportItems.size === 0}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Import {selectedImportItems.size} Items
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default TimeBudgetCalculator;
