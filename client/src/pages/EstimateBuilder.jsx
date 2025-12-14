import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Send,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Calculator,
  FileText,
  Filter,
  Home,
  Wrench,
  RefreshCw,
  BookOpen,
  DollarSign,
  Ruler,
  Tag,
  Lock,
  Eye,
  ExternalLink,
  Package,
  Hammer,
  Layers,
} from 'lucide-react';
import { Card, Button, Input, TextArea, useToast } from '../components/ui';
import { usePermissions } from '../hooks/usePermissions';
import { ContractorOnly, NotRole } from '../components/dev/PermissionGate';
import {
  generateEstimateFromIntake,
  calculateEstimateTotals,
  formatCurrency,
  formatSelectionLabel,
  BUILD_TIERS,
  TRADE_NAMES,
  applyLaborRatesToEstimate,
  getEstimateTradesSummary,
  // Instance-based estimating
  getLevelsFromProject,
  loadAssemblyTemplates,
  calculateInstanceTotals,
} from '../lib/estimateHelpers';
import { loadCatalogueData } from '../lib/costCatalogue';
import { getProject, updateProject, updateProjectPhase } from '../services/api';
import { SetupPanel, BulkAddMode, TallyMode, InstanceList } from '../components/estimate';
import { AssemblyBuilder } from '../components/catalogue/AssemblyBuilder';
import { AcceptanceCriteriaToggle, AcceptanceCriteriaDisplay } from '../components/estimates';
import { getBestMatchingCriteria } from '../data/acceptanceCriteria';

/**
 * EstimateBuilder - Create and edit project estimates
 *
 * Features:
 * - Auto-populates from intake data
 * - Good/Better/Best tier columns
 * - Editable line items
 * - Summary with range display
 */
export function EstimateBuilder() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { isContractor, isHomeowner, isSubcontractor } = usePermissions();
  const { showToast } = useToast();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Estimate state
  const [lineItems, setLineItems] = useState([]);
  const [selectedTier, setSelectedTier] = useState('better');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [editingItem, setEditingItem] = useState(null);
  const [notes, setNotes] = useState('');
  const [estimateSource, setEstimateSource] = useState('blank'); // 'intake', 'saved', 'blank'

  // Filter state
  const [filterRoom, setFilterRoom] = useState('all');
  const [filterTrade, setFilterTrade] = useState('all');
  const [groupBy, setGroupBy] = useState('room'); // 'room' | 'trade'
  const [estimateType, setEstimateType] = useState('both'); // 'both' | 'materials' | 'labor'

  // View mode for different personas
  const [viewMode, setViewMode] = useState('full'); // 'full' | 'homeowner' | 'subcontractor'

  // Catalogue integration
  const [catalogueData, setCatalogueData] = useState(null);
  const [showTradesSummary, setShowTradesSummary] = useState(false);
  const [catalogueApplied, setCatalogueApplied] = useState(false);

  // Instance-based estimating (new system)
  const [entryMode, setEntryMode] = useState('classic'); // 'classic' | 'instance'
  const [instances, setInstances] = useState([]);
  const [ceilingHeight, setCeilingHeight] = useState(9);
  const [assemblies, setAssemblies] = useState(() => loadAssemblyTemplates());
  const [setupCollapsed, setSetupCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('structure'); // 'structure' | 'openings' | 'surfaces' | 'mep'
  const [showAssemblyBuilder, setShowAssemblyBuilder] = useState(false);

  // Levels state - initialized from project, but can be modified
  const [levels, setLevels] = useState([{ value: 'main', label: 'Main Floor' }]);

  // Acceptance Criteria state
  const [showAcceptanceCriteria, setShowAcceptanceCriteria] = useState(false);

  // Initialize levels from project when loaded
  useEffect(() => {
    if (project) {
      const projectLevels = getLevelsFromProject(project);
      setLevels(projectLevels.length > 0 ? projectLevels : [{ value: 'main', label: 'Main Floor' }]);
    }
  }, [project]);

  // Calculate instance-based totals
  const instanceTotals = useMemo(() => {
    return calculateInstanceTotals(instances, assemblies, ceilingHeight, catalogueData);
  }, [instances, assemblies, ceilingHeight, catalogueData]);

  // Determine effective view mode based on persona
  const effectiveViewMode = useMemo(() => {
    // Contractors can toggle between views, others see their restricted view
    if (isContractor) return viewMode;
    if (isHomeowner) return 'homeowner';
    if (isSubcontractor) return 'subcontractor';
    return 'full';
  }, [isContractor, isHomeowner, isSubcontractor, viewMode]);

  // Can edit based on effective view mode
  const canEdit = effectiveViewMode === 'full';

  // Load project and catalogue data
  useEffect(() => {
    async function loadProject() {
      setLoading(true);

      // Load catalogue data
      const catalogue = loadCatalogueData();
      setCatalogueData(catalogue);

      const { data, error } = await getProject(projectId);
      if (data) {
        // Auto-transition from intake to estimating phase when entering EstimateBuilder
        if (data.phase === 'intake') {
          const { data: updatedProject } = await updateProjectPhase(projectId, {
            phase: 'estimating',
            phase_changed_at: new Date().toISOString(),
          });
          if (updatedProject) {
            setProject(updatedProject);
          } else {
            setProject(data);
          }
        } else {
          setProject(data);
        }
        // Map contractor spec levels to estimate tiers
        // standard/premium/luxury → good/better/best
        const tierMap = { standard: 'good', premium: 'better', luxury: 'best' };
        // Check intake_data first (where we save it), then fall back to top-level (legacy)
        const rawTier = data.intake_data?.build_tier || data.build_tier || 'better';
        const mappedTier = tierMap[rawTier] || rawTier;
        // Ensure tier is valid
        const validTier = ['good', 'better', 'best'].includes(mappedTier) ? mappedTier : 'better';
        setSelectedTier(validTier);
        setNotes(data.intake_data?.estimate_notes || data.notes || data.estimate_notes || '');

        // Load saved estimate type if available (check intake_data first)
        const savedEstimateType = data.intake_data?.estimate_type || data.estimate_type;
        if (savedEstimateType && ['both', 'materials', 'labor'].includes(savedEstimateType)) {
          setEstimateType(savedEstimateType);
        }

        // Generate initial estimate from intake or load saved
        // Check intake_data for saved line items first
        const savedLineItems = data.intake_data?.estimate_line_items || data.estimate_line_items;
        let loadedLineItems = [];
        if (savedLineItems && savedLineItems.length > 0) {
          loadedLineItems = savedLineItems;
          setLineItems(savedLineItems);
          setEstimateSource('saved');
        } else {
          const estimate = generateEstimateFromIntake(data);
          loadedLineItems = estimate.lineItems;
          setLineItems(estimate.lineItems);
          setEstimateSource(estimate.source || 'intake');
        }

        // Check if catalogue rates were already applied
        if (data.catalogue_rates_applied) {
          setCatalogueApplied(true);
        }

        // Load instance-based data if project has it
        // Check both top-level (saved from EstimateBuilder) and intake_data (from contractor intake)
        const projectInstances = data.instances || data.intake_data?.instances || [];
        if (projectInstances.length > 0) {
          setInstances(projectInstances);
          setEntryMode('instance'); // Switch to instance mode automatically
        }

        // Load assemblies from project or intake_data
        const projectAssemblies = data.assemblies || data.intake_data?.assemblies || [];
        if (projectAssemblies.length > 0) {
          setAssemblies(projectAssemblies);
        }

        // Load ceiling heights from project or intake_data
        const projectCeilingHeights = data.ceilingHeights || data.intake_data?.building?.ceilingHeights;
        if (projectCeilingHeights) {
          // Handle both object format and single value
          const height = typeof projectCeilingHeights === 'object'
            ? projectCeilingHeights.main || 9
            : projectCeilingHeights;
          setCeilingHeight(height);
        }

        // Expand all categories initially
        const categories = {};
        loadedLineItems.forEach((item) => {
          categories[item.category] = true;
        });
        setExpandedCategories(categories);
      }
      setLoading(false);
    }
    loadProject();
  }, [projectId]);

  // Apply catalogue labor rates to estimate
  const handleApplyCatalogueRates = () => {
    if (!catalogueData?.laborRates) return;

    const updatedItems = applyLaborRatesToEstimate(lineItems, catalogueData.laborRates);
    setLineItems(updatedItems);
    setCatalogueApplied(true);
  };

  // Get trades summary with catalogue rates
  const tradesSummary = useMemo(() => {
    if (!catalogueData?.laborRates) return [];
    return getEstimateTradesSummary(lineItems, catalogueData.laborRates);
  }, [lineItems, catalogueData]);

  // Calculate totals (always on full list for accurate totals)
  const totals = useMemo(() => calculateEstimateTotals(lineItems, estimateType), [lineItems, estimateType]);

  // Determine which totals to display - prefer instance-based when available
  const hasInstanceData = instances.length > 0;
  const displayTotals = useMemo(() => {
    if (hasInstanceData && instanceTotals.good > 0) {
      return {
        good: instanceTotals.good,
        better: instanceTotals.better,
        best: instanceTotals.best,
        labor: instanceTotals.labor,
        materials: instanceTotals.materials,
        missingPricingCount: 0,
        missingPricingItems: [],
      };
    }
    return totals;
  }, [hasInstanceData, instanceTotals, totals]);

  // Calculate display range based on display totals
  const displayRange = useMemo(() => {
    const selectedTotal = displayTotals[selectedTier] || 0;
    return {
      low: Math.round(selectedTotal * 0.95),
      high: Math.round(selectedTotal * 1.10),
    };
  }, [displayTotals, selectedTier]);

  // Get unique rooms and trades for filter dropdowns
  const { uniqueRooms, uniqueTrades } = useMemo(() => {
    const rooms = new Map();
    const trades = new Map();
    lineItems.forEach((item) => {
      if (item.room) rooms.set(item.room, item.roomLabel || item.room);
      if (item.tradeCode) trades.set(item.tradeCode, item.tradeName || TRADE_NAMES[item.tradeCode] || item.tradeCode);
    });
    return {
      uniqueRooms: Array.from(rooms.entries()).map(([value, label]) => ({ value, label })),
      uniqueTrades: Array.from(trades.entries()).map(([value, label]) => ({ value, label })),
    };
  }, [lineItems]);

  // Filter and group line items
  const { filteredItems, groupedItems, filteredTotals } = useMemo(() => {
    // Apply filters
    let filtered = lineItems;
    if (filterRoom !== 'all') {
      filtered = filtered.filter((item) => item.room === filterRoom);
    }
    if (filterTrade !== 'all') {
      filtered = filtered.filter((item) => item.tradeCode === filterTrade);
    }

    // Calculate filtered totals
    const fTotals = calculateEstimateTotals(filtered, estimateType);

    // Group by selected grouping
    const groups = {};
    filtered.forEach((item) => {
      let groupKey;
      if (groupBy === 'trade') {
        groupKey = item.tradeName || TRADE_NAMES[item.tradeCode] || item.tradeCode || 'Other';
      } else {
        groupKey = item.roomLabel || item.category || 'Other';
      }
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
    });

    return { filteredItems: filtered, groupedItems: groups, filteredTotals: fTotals };
  }, [lineItems, filterRoom, filterTrade, groupBy, estimateType]);

  // Toggle category expansion
  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Update line item
  const updateLineItem = (itemId, field, value) => {
    setLineItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    );
  };

  // Delete line item
  const deleteLineItem = (itemId) => {
    setLineItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  // Add custom line item
  const addLineItem = (category) => {
    const newItem = {
      id: `custom-${Date.now()}`,
      category,
      name: 'New Item',
      description: '',
      unit: 'lump',
      quantity: 1,
      unitPriceGood: 0,
      unitPriceBetter: 0,
      unitPriceBest: 0,
      source: 'manual',
      // Piece rate fields
      pricingMode: 'lump', // 'lump' | 'piece'
      pieceRateId: null,
      pieceRate: null,
      pieceRateUnit: null,
    };
    setLineItems((prev) => [...prev, newItem]);
    setEditingItem(newItem.id);
  };

  // Save estimate
  const handleSave = async () => {
    setSaving(true);
    console.log('[EstimateBuilder] Saving instances:', instances);
    console.log('[EstimateBuilder] Instances count:', instances.length);

    // Build the update payload
    // Note: 'notes' column doesn't exist in the live DB, so we store it in intake_data
    const updatePayload = {
      estimate_low: displayRange.low,
      estimate_high: displayRange.high,
      intake_data: {
        ...project?.intake_data,
        instances: instances,
        assemblies: assemblies,
        build_tier: selectedTier,
        estimate_type: estimateType,
        estimate_notes: notes,
        estimate_line_items: lineItems,
      },
    };

    console.log('[EstimateBuilder] Update payload:', JSON.stringify(updatePayload, null, 2));

    try {
      const result = await updateProject(projectId, updatePayload);
      console.log('[EstimateBuilder] Save result:', result);
      if (result.error) {
        console.error('[EstimateBuilder] Save error:', result.error);
        showToast(`Failed to save: ${result.error.message || result.error}`, 'error');
      } else {
        showToast('Estimate saved successfully', 'success');
        // Update local project state with saved data
        if (result.data) {
          setProject(result.data);
        }
      }
    } catch (error) {
      console.error('Failed to save estimate:', error);
      showToast('Failed to save estimate', 'error');
    }
    setSaving(false);
  };

  // Send quote (save and transition to quoted phase)
  const handleSendQuote = async () => {
    // Save first
    await handleSave();

    // Transition to quoted phase
    await updateProjectPhase(projectId, {
      phase: 'quoted',
      phase_changed_at: new Date().toISOString(),
    });

    // Navigate to project view
    navigate(`/projects/${projectId}`);
  };

  // Preview homeowner quote
  const handlePreviewQuote = () => {
    window.open(`/projects/${projectId}/quote`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="h-12 bg-gray-200 rounded animate-pulse" />
          <div className="h-96 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-gray-500">Project not found</p>
        </div>
      </div>
    );
  }

  // Subcontractors cannot access estimate builder at all
  if (isSubcontractor) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <Card className="p-8 text-center">
            <Lock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-charcoal mb-2">Access Restricted</h2>
            <p className="text-gray-500 mb-4">
              Estimate details are not available for subcontractor accounts.
            </p>
            <Button variant="secondary" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 lg:pb-0">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 lg:px-6 py-3 lg:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 lg:gap-4 min-w-0">
              <button
                onClick={() => navigate(`/projects/${projectId}`)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                <h1 className="text-lg lg:text-xl font-semibold text-charcoal truncate">
                  {effectiveViewMode === 'homeowner' ? 'Quote' : 'Estimate'}
                </h1>
                <p className="text-xs lg:text-sm text-gray-500 truncate">
                  {project.name}
                </p>
              </div>
            </div>

            {/* Desktop actions */}
            <div className="hidden lg:flex items-center gap-3">
              {/* View Mode Toggle - Show for contractors or when no role restrictions (production mode) */}
              {(isContractor || (!isHomeowner && !isSubcontractor)) && (
                <div className="flex items-center gap-2 mr-2">
                  <span className="text-xs text-gray-500">View as:</span>
                  <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => setViewMode('full')}
                      className={`px-3 py-1.5 text-xs flex items-center gap-1.5 ${
                        viewMode === 'full'
                          ? 'bg-charcoal text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                      title="Full contractor view with all details"
                    >
                      <Eye className="w-3 h-3" />
                      Contractor
                    </button>
                    <button
                      onClick={() => setViewMode('homeowner')}
                      className={`px-3 py-1.5 text-xs flex items-center gap-1.5 ${
                        viewMode === 'homeowner'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                      title="Preview what homeowner sees"
                    >
                      <Home className="w-3 h-3" />
                      Homeowner
                    </button>
                  </div>
                </div>
              )}

              {/* Homeowner read-only indicator - only show when explicitly logged in as homeowner */}
              {isHomeowner && (
                <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  View Only
                </span>
              )}

              {/* Action buttons - Only for full view mode */}
              {canEdit && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handlePreviewQuote}
                    title="Preview homeowner quote"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Preview Quote
                  </Button>
                  <Button variant="secondary" size="sm" onClick={handleSave} disabled={saving}>
                    <Save className="w-4 h-4 mr-1" />
                    {saving ? 'Saving...' : 'Save Draft'}
                  </Button>
                  <Button size="sm" onClick={handleSendQuote}>
                    <Send className="w-4 h-4 mr-1" />
                    Send Estimate
                  </Button>
                </>
              )}
            </div>

            {/* Mobile actions - simplified */}
            <div className="flex lg:hidden items-center gap-2">
              {canEdit && (
                <>
                  <Button variant="secondary" size="sm" onClick={handleSave} disabled={saving} className="px-2">
                    <Save className="w-4 h-4" />
                  </Button>
                  <Button size="sm" onClick={handleSendQuote} className="px-2">
                    <Send className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-4 lg:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Line Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Estimate Type Selector */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-medium text-charcoal flex items-center gap-2">
                  <Layers className="w-5 h-5" />
                  Estimate Type
                </h2>
                <p className="text-sm text-gray-500">
                  What to include in pricing
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => canEdit && setEstimateType('both')}
                  disabled={!canEdit}
                  className={`
                    p-3 rounded-lg border-2 text-left transition-all
                    ${estimateType === 'both'
                      ? 'border-charcoal bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                    ${!canEdit ? 'cursor-default' : ''}
                  `}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-charcoal flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      Both
                    </span>
                    {estimateType === 'both' && (
                      <Check className="w-4 h-4 text-charcoal" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500">Materials + Labor</p>
                </button>

                <button
                  onClick={() => canEdit && setEstimateType('materials')}
                  disabled={!canEdit}
                  className={`
                    p-3 rounded-lg border-2 text-left transition-all
                    ${estimateType === 'materials'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                    ${!canEdit ? 'cursor-default' : ''}
                  `}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-charcoal flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Materials
                    </span>
                    {estimateType === 'materials' && (
                      <Check className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500">Materials only</p>
                </button>

                <button
                  onClick={() => canEdit && setEstimateType('labor')}
                  disabled={!canEdit}
                  className={`
                    p-3 rounded-lg border-2 text-left transition-all
                    ${estimateType === 'labor'
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                    ${!canEdit ? 'cursor-default' : ''}
                  `}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-charcoal flex items-center gap-2">
                      <Hammer className="w-4 h-4" />
                      Labor
                    </span>
                    {estimateType === 'labor' && (
                      <Check className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500">Labor only</p>
                </button>
              </div>
            </Card>

            {/* Entry Mode Toggle */}
            <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-medium text-charcoal flex items-center gap-2">
                    <Ruler className="w-5 h-5" />
                    Entry Mode
                  </h2>
                  <p className="text-sm text-gray-500">
                    How to enter measurements
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setEntryMode('classic')}
                    className={`
                      p-3 rounded-lg border-2 text-left transition-all
                      ${entryMode === 'classic'
                        ? 'border-charcoal bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-charcoal flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Classic
                      </span>
                      {entryMode === 'classic' && (
                        <Check className="w-4 h-4 text-charcoal" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500">Line items with totals</p>
                  </button>

                  <button
                    onClick={() => setEntryMode('instance')}
                    className={`
                      p-3 rounded-lg border-2 text-left transition-all
                      ${entryMode === 'instance'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-charcoal flex items-center gap-2">
                        <Ruler className="w-4 h-4" />
                        Instance
                      </span>
                      {entryMode === 'instance' && (
                        <Check className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500">Bulk add by measurement</p>
                  </button>
                </div>
            </Card>

            {/* Acceptance Criteria Toggle */}
            <AcceptanceCriteriaToggle
              enabled={showAcceptanceCriteria}
              onChange={setShowAcceptanceCriteria}
            />

            {/* Tier Selector */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-medium text-charcoal flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  {effectiveViewMode === 'homeowner' ? 'Selected Package' : 'Build Tier'}
                </h2>
                {project.build_tier ? (
                  <p className="text-sm text-gray-500">
                    {effectiveViewMode === 'homeowner' ? 'Your selection:' : 'Selected by client:'} {formatSelectionLabel(project.build_tier)}
                  </p>
                ) : canEdit ? (
                  <p className="text-sm text-gray-500">
                    Select a tier for this estimate
                  </p>
                ) : null}
              </div>

              <div className="grid grid-cols-3 gap-3">
                {Object.values(BUILD_TIERS).map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => canEdit && setSelectedTier(tier.id)}
                    disabled={!canEdit}
                    className={`
                      p-3 rounded-lg border-2 text-left transition-all
                      ${selectedTier === tier.id
                        ? 'border-charcoal bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                      ${!canEdit ? 'cursor-default' : ''}
                    `}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-charcoal">{tier.label}</span>
                      {selectedTier === tier.id && (
                        <Check className="w-4 h-4 text-charcoal" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{tier.description}</p>
                    <p className="text-sm font-medium text-charcoal mt-2">
                      {formatCurrency(displayTotals[tier.id])}
                    </p>
                  </button>
                ))}
              </div>
            </Card>

            {/* Instance Mode UI */}
            {entryMode === 'instance' && canEdit && (
              <>
                {/* Setup Panel */}
                <SetupPanel
                  ceilingHeight={ceilingHeight}
                  onCeilingHeightChange={setCeilingHeight}
                  levels={levels}
                  onLevelsChange={setLevels}
                  assemblies={assemblies}
                  onAssembliesChange={setAssemblies}
                  onOpenAssemblyBuilder={() => setShowAssemblyBuilder(true)}
                  collapsed={setupCollapsed}
                  onToggleCollapse={() => setSetupCollapsed(!setupCollapsed)}
                />

                {/* Tabbed Input Interface */}
                <Card className="overflow-hidden">
                  {/* Tab Bar */}
                  <div className="flex border-b border-gray-200 bg-gray-50">
                    {[
                      { id: 'structure', label: 'Structure', icon: Layers },  // Floors, walls, ceilings, roof framing
                      { id: 'openings', label: 'Openings', icon: Home },
                      { id: 'surfaces', label: 'Surfaces', icon: Package },
                      { id: 'mep', label: 'MEP', icon: Wrench },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                          activeTab === tab.id
                            ? 'text-charcoal border-b-2 border-charcoal bg-white'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  <div className="p-4">
                    {activeTab === 'structure' && (
                      <BulkAddMode
                        scopeCategory="structure"
                        levels={levels}
                        assemblies={assemblies.filter(a => a.category === 'framing')}
                        ceilingHeight={ceilingHeight}
                        instances={instances}
                        onInstancesChange={setInstances}
                      />
                    )}
                    {activeTab === 'openings' && (
                      <TallyMode
                        scopeCategory="openings"
                        levels={levels}
                        instances={instances}
                        onInstancesChange={setInstances}
                      />
                    )}
                    {activeTab === 'surfaces' && (
                      <BulkAddMode
                        scopeCategory="surfaces"
                        levels={levels}
                        assemblies={assemblies}
                        ceilingHeight={ceilingHeight}
                        instances={instances}
                        onInstancesChange={setInstances}
                      />
                    )}
                    {activeTab === 'mep' && (
                      <TallyMode
                        scopeCategory="mep"
                        levels={levels}
                        instances={instances}
                        onInstancesChange={setInstances}
                      />
                    )}
                  </div>
                </Card>

                {/* Instance Summary */}
                <InstanceList
                  instances={instances}
                  assemblies={assemblies}
                  ceilingHeight={ceilingHeight}
                  catalogueData={catalogueData}
                  selectedTier={selectedTier}
                  onDeleteInstance={(id) => {
                    setInstances(prev => prev.filter(inst => inst.id !== id));
                  }}
                />
              </>
            )}

            {/* Assembly Builder Modal */}
            {showAssemblyBuilder && (
              <AssemblyBuilder
                isOpen={showAssemblyBuilder}
                onClose={() => setShowAssemblyBuilder(false)}
                onSave={(assembly) => {
                  setAssemblies(prev => [...prev, { ...assembly, selected: true }]);
                  setShowAssemblyBuilder(false);
                }}
                laborRates={catalogueData?.laborRates || {}}
                materials={catalogueData?.materials || []}
              />
            )}

            {/* Line Items by Category - Classic Mode */}
            {entryMode === 'classic' && (
            <Card className="overflow-hidden">
              {/* Header with filters */}
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-medium text-charcoal flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {effectiveViewMode === 'homeowner' ? 'Quote Breakdown' : 'Line Items'}
                    {canEdit && (filterRoom !== 'all' || filterTrade !== 'all') && (
                      <span className="text-xs text-gray-500 font-normal">
                        (filtered: {filteredItems.length} of {lineItems.length})
                      </span>
                    )}
                  </h2>
                </div>

                {/* Filter Bar - Only for full view mode */}
                {canEdit && (
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Group By Toggle */}
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-gray-500">Group by:</span>
                      <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                        <button
                          onClick={() => setGroupBy('room')}
                          className={`px-2 py-1 flex items-center gap-1 ${
                            groupBy === 'room'
                              ? 'bg-charcoal text-white'
                              : 'bg-white text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <Home className="w-3 h-3" />
                          Room
                        </button>
                        <button
                          onClick={() => setGroupBy('trade')}
                          className={`px-2 py-1 flex items-center gap-1 ${
                            groupBy === 'trade'
                              ? 'bg-charcoal text-white'
                              : 'bg-white text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <Wrench className="w-3 h-3" />
                          Trade
                        </button>
                      </div>
                    </div>

                    {/* Room Filter */}
                    {uniqueRooms.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Filter className="w-3 h-3 text-gray-400" />
                        <select
                          value={filterRoom}
                          onChange={(e) => setFilterRoom(e.target.value)}
                          className="text-xs border border-gray-200 rounded px-2 py-1 bg-white"
                        >
                          <option value="all">All Rooms</option>
                          {uniqueRooms.map((room) => (
                            <option key={room.value} value={room.value}>
                              {room.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Trade Filter */}
                    {uniqueTrades.length > 0 && (
                      <div className="flex items-center gap-1">
                        <select
                          value={filterTrade}
                          onChange={(e) => setFilterTrade(e.target.value)}
                          className="text-xs border border-gray-200 rounded px-2 py-1 bg-white"
                        >
                          <option value="all">All Trades</option>
                          {uniqueTrades.map((trade) => (
                            <option key={trade.value} value={trade.value}>
                              {trade.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Clear Filters */}
                    {(filterRoom !== 'all' || filterTrade !== 'all') && (
                      <button
                        onClick={() => {
                          setFilterRoom('all');
                          setFilterTrade('all');
                        }}
                        className="text-xs text-gray-500 hover:text-charcoal flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        Clear
                      </button>
                    )}

                    {/* Filtered Total */}
                    {(filterRoom !== 'all' || filterTrade !== 'all') && (
                      <div className="ml-auto text-xs text-gray-500">
                        Filtered total: <span className="font-medium text-charcoal">{formatCurrency(filteredTotals[selectedTier])}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Homeowner simplified info */}
                {effectiveViewMode === 'homeowner' && (
                  <p className="text-sm text-gray-500">
                    Here's a breakdown of your project scope by area.
                  </p>
                )}
              </div>

              {/* Table Header - Different for homeowner view */}
              {effectiveViewMode === 'homeowner' ? (
                <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs font-medium text-gray-500 border-b border-gray-100 bg-gray-50">
                  <div className="col-span-8">Area / Scope</div>
                  <div className="col-span-4 text-right">Estimated Cost</div>
                </div>
              ) : (
                <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs font-medium text-gray-500 border-b border-gray-100 bg-gray-50">
                  <div className="col-span-5">Item</div>
                  <div className="col-span-1 text-center">Qty</div>
                  <div className="col-span-2 text-right">Good</div>
                  <div className="col-span-2 text-right">Better</div>
                  <div className="col-span-2 text-right">Best</div>
                </div>
              )}

              {/* Categories */}
              <div className="divide-y divide-gray-100">
                {Object.entries(groupedItems).map(([category, items]) => {
                  const categoryTotal = items.reduce(
                    (sum, item) =>
                      sum + item[`unitPrice${selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)}`] * item.quantity,
                    0
                  );

                  // Homeowner view - simplified category rows (no expansion)
                  if (effectiveViewMode === 'homeowner') {
                    return (
                      <div key={category} className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-gray-50">
                        <div className="col-span-8">
                          <span className="font-medium text-charcoal">{category}</span>
                          <span className="text-xs text-gray-500 ml-2">
                            ({items.length} {items.length === 1 ? 'item' : 'items'})
                          </span>
                        </div>
                        <div className="col-span-4 text-right font-medium text-charcoal">
                          {formatCurrency(categoryTotal)}
                        </div>
                      </div>
                    );
                  }

                  // Full contractor view with expandable categories
                  return (
                    <div key={category}>
                      {/* Category Header */}
                      <button
                        onClick={() => toggleCategory(category)}
                        className="w-full px-4 py-2 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {expandedCategories[category] ? (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          )}
                          <span className="font-medium text-charcoal">
                            {category}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({items.length} items)
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-500">
                            {formatCurrency(categoryTotal)}
                          </span>
                        </div>
                      </button>

                      {/* Category Items */}
                      {expandedCategories[category] && (
                        <div className="divide-y divide-gray-50">
                          {items.map((item) => (
                            <LineItemRow
                              key={item.id}
                              item={item}
                              isEditing={editingItem === item.id}
                              selectedTier={selectedTier}
                              catalogueData={catalogueData}
                              showAcceptanceCriteria={showAcceptanceCriteria}
                              acceptanceCriteria={getBestMatchingCriteria(item)}
                              onEdit={() => setEditingItem(item.id)}
                              onSave={() => setEditingItem(null)}
                              onCancel={() => setEditingItem(null)}
                              onUpdate={(field, value) =>
                                updateLineItem(item.id, field, value)
                              }
                              onDelete={() => deleteLineItem(item.id)}
                            />
                          ))}

                          {/* Add Item Button */}
                          <button
                            onClick={() => addLineItem(category)}
                            className="w-full px-4 py-2 text-sm text-gray-500 hover:text-charcoal hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Add item to {category}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add New Category - Only for full view mode */}
              {canEdit && (
                <div className="px-4 py-3 border-t border-gray-200">
                  <button
                    onClick={() => {
                      const category = prompt('Enter category name:');
                      if (category) {
                        addLineItem(category);
                      }
                    }}
                    className="text-sm text-gray-500 hover:text-charcoal flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add new category
                  </button>
                </div>
              )}
            </Card>
            )}
          </div>

          {/* Sidebar - Summary */}
          <div className="space-y-4">
            {/* Estimate Summary */}
            <Card className="p-4 sticky top-24">
              <h3 className="font-medium text-charcoal mb-4">
                Estimate Summary
              </h3>

              {/* Estimate Type Indicator */}
              {estimateType !== 'both' && (
                <div className={`p-3 rounded-lg mb-4 flex items-center gap-2 ${
                  estimateType === 'materials' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {estimateType === 'materials' ? (
                    <Package className="w-4 h-4" />
                  ) : (
                    <Hammer className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">
                    {estimateType === 'materials' ? 'Materials Only' : 'Labor Only'}
                  </span>
                </div>
              )}

              {/* Missing Pricing Data Warning */}
              {displayTotals.missingPricingCount > 0 && (
                <div className="p-3 rounded-lg mb-4 bg-red-50 border border-red-200">
                  <div className="flex items-center gap-2 text-red-700 mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {displayTotals.missingPricingCount} item{displayTotals.missingPricingCount > 1 ? 's' : ''} missing catalogue pricing
                    </span>
                  </div>
                  <p className="text-xs text-red-600 mb-2">
                    These items need manual pricing or catalogue data:
                  </p>
                  <ul className="text-xs text-red-600 space-y-1 max-h-24 overflow-y-auto">
                    {displayTotals.missingPricingItems.slice(0, 5).map((item, idx) => (
                      <li key={idx} className="truncate">
                        • {item.name} ({item.missing === 'both' ? 'no catalogue data' : `missing ${item.missing}`})
                      </li>
                    ))}
                    {displayTotals.missingPricingItems.length > 5 && (
                      <li className="text-red-500 italic">
                        +{displayTotals.missingPricingItems.length - 5} more...
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Selected Tier Total */}
              <div className="p-4 bg-gray-50 rounded-lg mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">
                    {BUILD_TIERS[selectedTier].label} Tier
                  </span>
                  <span className={`
                    px-2 py-0.5 text-xs rounded-full
                    ${selectedTier === 'good' ? 'bg-blue-100 text-blue-700' : ''}
                    ${selectedTier === 'better' ? 'bg-indigo-100 text-indigo-700' : ''}
                    ${selectedTier === 'best' ? 'bg-purple-100 text-purple-700' : ''}
                  `}>
                    Selected
                  </span>
                </div>
                <p className="text-2xl font-semibold text-charcoal">
                  {formatCurrency(displayTotals[selectedTier])}
                </p>
              </div>

              {/* Range */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Low Estimate (-5%)</span>
                  <span className="font-medium">{formatCurrency(displayRange.low)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">High Estimate (+10%)</span>
                  <span className="font-medium">{formatCurrency(displayRange.high)}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Line Items</span>
                  <span>{lineItems.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Categories</span>
                  <span>{Object.keys(groupedItems).length}</span>
                </div>
              </div>

              {/* All Tiers Comparison */}
              <div className="border-t border-gray-200 pt-4">
                <p className="text-xs text-gray-500 mb-2">All Tiers</p>
                <div className="space-y-1">
                  {['good', 'better', 'best'].map((tier) => (
                    <div
                      key={tier}
                      className={`flex justify-between text-sm ${
                        tier === selectedTier ? 'font-medium' : 'text-gray-500'
                      }`}
                    >
                      <span>{BUILD_TIERS[tier]?.label || tier}</span>
                      <span>{formatCurrency(displayTotals[tier] || 0)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Catalogue Integration - Contractor only */}
            {canEdit && (
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-charcoal flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Cost Catalogue
                  </h3>
                  <Link
                    to="/cost-catalogue"
                    className="text-xs text-gray-500 hover:text-charcoal"
                  >
                    Edit Rates →
                  </Link>
                </div>

                {catalogueApplied ? (
                  <div className="p-3 bg-emerald-50 rounded-lg mb-3">
                    <div className="flex items-center gap-2 text-emerald-700 text-sm">
                      <Check className="w-4 h-4" />
                      <span>Catalogue rates applied</span>
                    </div>
                    <p className="text-xs text-emerald-600 mt-1">
                      Line items adjusted based on your labor rates
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 rounded-lg mb-3">
                    <p className="text-sm text-amber-800 mb-2">
                      Apply your catalogue labor rates to adjust estimate pricing
                    </p>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handleApplyCatalogueRates}
                      className="w-full"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Apply Catalogue Rates
                    </Button>
                  </div>
                )}

                {/* Trades Summary Toggle */}
                <button
                  onClick={() => setShowTradesSummary(!showTradesSummary)}
                  className="w-full text-left text-sm text-gray-600 hover:text-charcoal flex items-center justify-between py-2"
                >
                  <span className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Trades Summary
                  </span>
                  {showTradesSummary ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>

                {showTradesSummary && tradesSummary.length > 0 && (
                  <div className="mt-2 space-y-2 border-t border-gray-100 pt-2">
                    {tradesSummary.map((trade) => (
                      <div
                        key={trade.code}
                        className="flex items-center justify-between text-sm"
                      >
                        <div>
                          <span className="text-gray-600">{trade.name}</span>
                          {trade.hourlyRate && (
                            <span className="text-xs text-gray-400 ml-1">
                              (${trade.hourlyRate}/hr)
                            </span>
                          )}
                        </div>
                        <span className="font-medium text-charcoal">
                          {formatCurrency(trade[`total${selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)}`] || trade.totalBetter)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {showTradesSummary && tradesSummary.length === 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    No trade breakdown available for this estimate
                  </p>
                )}
              </Card>
            )}

            {/* Notes - Read-only for homeowners */}
            <Card className="p-4">
              <h3 className="font-medium text-charcoal mb-3">
                {effectiveViewMode === 'homeowner' ? 'Quote Notes' : 'Estimate Notes'}
              </h3>
              {canEdit ? (
                <TextArea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about assumptions, exclusions, or special conditions..."
                  rows={4}
                />
              ) : notes ? (
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{notes}</p>
              ) : (
                <p className="text-sm text-gray-400 italic">No additional notes provided.</p>
              )}
            </Card>

            {/* Source Info - Different content for homeowners */}
            <Card className="p-4">
              <div className="flex items-start gap-3">
                {effectiveViewMode === 'homeowner' ? (
                  <>
                    <FileText className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-charcoal">
                        Your Project Quote
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        This quote was prepared based on your project requirements.
                        Contact us if you have any questions about the scope or pricing.
                      </p>
                    </div>
                  </>
                ) : estimateSource === 'saved' ? (
                  <>
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-charcoal">
                        Previously saved estimate
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        This estimate was previously saved. Make any adjustments needed.
                      </p>
                    </div>
                  </>
                ) : estimateSource === 'blank' ? (
                  <>
                    <FileText className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-charcoal">
                        New estimate
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Start with the template categories or add your own.
                        Use "Add new category" to organize line items.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-charcoal">
                        Auto-generated from intake
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        This estimate was generated from the client's intake form.
                        Review and adjust line items as needed before sending the quote.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Get available piece rates for a trade code from catalogue data
 */
function getPieceRatesForTrade(tradeCode, catalogueData) {
  if (!catalogueData?.laborRates || !tradeCode) return [];

  const trade = catalogueData.laborRates[tradeCode];
  if (!trade?.pieceRates) return [];

  return trade.pieceRates;
}

/**
 * Get all piece rates across all trades (for items without trade code)
 */
function getAllPieceRates(catalogueData) {
  if (!catalogueData?.laborRates) return [];

  const allRates = [];
  Object.entries(catalogueData.laborRates).forEach(([tradeCode, trade]) => {
    if (trade.pieceRates) {
      trade.pieceRates.forEach(rate => {
        allRates.push({
          ...rate,
          tradeCode,
          tradeName: trade.name,
        });
      });
    }
  });
  return allRates;
}

/**
 * Line Item Row Component
 */
function LineItemRow({
  item,
  isEditing,
  selectedTier,
  catalogueData,
  showAcceptanceCriteria,
  acceptanceCriteria,
  onEdit,
  onSave,
  onCancel,
  onUpdate,
  onDelete,
}) {
  const [editValues, setEditValues] = useState({
    name: item.name,
    description: item.description,
    quantity: item.quantity,
    unit: item.unit || 'lump',
    unitPriceGood: item.unitPriceGood,
    unitPriceBetter: item.unitPriceBetter,
    unitPriceBest: item.unitPriceBest,
    pricingMode: item.pricingMode || 'lump',
    pieceRateId: item.pieceRateId || null,
    pieceRate: item.pieceRate || null,
    pieceRateUnit: item.pieceRateUnit || null,
  });

  // Get available piece rates for this item's trade or all trades
  const availablePieceRates = useMemo(() => {
    if (item.tradeCode) {
      return getPieceRatesForTrade(item.tradeCode, catalogueData);
    }
    return getAllPieceRates(catalogueData);
  }, [item.tradeCode, catalogueData]);

  // Handle piece rate selection
  const handlePieceRateSelect = (pieceRateId) => {
    const selectedRate = availablePieceRates.find(r => r.id === pieceRateId);
    if (selectedRate) {
      // Apply tier multipliers to piece rate
      const baseRate = selectedRate.rate;
      setEditValues(v => ({
        ...v,
        pieceRateId: pieceRateId,
        pieceRate: baseRate,
        pieceRateUnit: selectedRate.unit,
        unit: selectedRate.unit,
        unitPriceGood: baseRate,
        unitPriceBetter: Math.round(baseRate * 1.25 * 100) / 100,
        unitPriceBest: Math.round(baseRate * 1.55 * 100) / 100,
        name: editValues.name === 'New Item' ? selectedRate.task : editValues.name,
        description: selectedRate.notes || editValues.description,
      }));
    }
  };

  // Handle pricing mode change
  const handlePricingModeChange = (mode) => {
    setEditValues(v => ({
      ...v,
      pricingMode: mode,
      // Reset piece rate data if switching to lump
      ...(mode === 'lump' ? {
        pieceRateId: null,
        pieceRate: null,
        pieceRateUnit: null,
        unit: 'lump',
      } : {}),
    }));
  };

  const handleSave = () => {
    Object.entries(editValues).forEach(([field, value]) => {
      onUpdate(field, value);
    });
    onSave();
  };

  if (isEditing) {
    return (
      <div className="px-4 py-3 bg-amber-50 border-l-2 border-amber-400">
        <div className="space-y-3">
          {/* Pricing Mode Toggle */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 font-medium">Pricing:</span>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              <button
                type="button"
                onClick={() => handlePricingModeChange('lump')}
                className={`px-3 py-1.5 text-xs flex items-center gap-1.5 ${
                  editValues.pricingMode === 'lump'
                    ? 'bg-charcoal text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <DollarSign className="w-3 h-3" />
                Lump Sum
              </button>
              <button
                type="button"
                onClick={() => handlePricingModeChange('piece')}
                className={`px-3 py-1.5 text-xs flex items-center gap-1.5 ${
                  editValues.pricingMode === 'piece'
                    ? 'bg-charcoal text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Ruler className="w-3 h-3" />
                Piece Rate
              </button>
            </div>
            {editValues.pricingMode === 'piece' && editValues.pieceRate && (
              <span className="text-xs text-emerald-600 flex items-center gap-1">
                <Tag className="w-3 h-3" />
                ${editValues.pieceRate}/{editValues.pieceRateUnit}
              </span>
            )}
          </div>

          {/* Piece Rate Selector (only shown when piece rate mode) */}
          {editValues.pricingMode === 'piece' && availablePieceRates.length > 0 && (
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Select Piece Rate:</label>
              <select
                value={editValues.pieceRateId || ''}
                onChange={(e) => handlePieceRateSelect(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-charcoal/20"
              >
                <option value="">-- Choose a piece rate --</option>
                {availablePieceRates.map((rate) => (
                  <option key={rate.id} value={rate.id}>
                    {rate.tradeName ? `[${rate.tradeName}] ` : ''}{rate.task} - ${rate.rate}/{rate.unit}
                    {rate.notes ? ` (${rate.notes})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {editValues.pricingMode === 'piece' && availablePieceRates.length === 0 && (
            <p className="text-xs text-amber-600">
              No piece rates available for this trade. Add rates in Cost Catalogue.
            </p>
          )}

          {/* Item Details */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              value={editValues.name}
              onChange={(e) =>
                setEditValues((v) => ({ ...v, name: e.target.value }))
              }
              placeholder="Item name"
            />
            <Input
              value={editValues.description}
              onChange={(e) =>
                setEditValues((v) => ({ ...v, description: e.target.value }))
              }
              placeholder="Description"
            />
          </div>

          {/* Quantity and Pricing */}
          <div className="grid grid-cols-5 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Qty {editValues.pricingMode === 'piece' && editValues.pieceRateUnit ? `(${editValues.pieceRateUnit})` : ''}
              </label>
              <Input
                type="number"
                value={editValues.quantity}
                onChange={(e) =>
                  setEditValues((v) => ({ ...v, quantity: parseFloat(e.target.value) || 1 }))
                }
                placeholder="Qty"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Good $/unit</label>
              <Input
                type="number"
                step="0.01"
                value={editValues.unitPriceGood}
                onChange={(e) =>
                  setEditValues((v) => ({ ...v, unitPriceGood: parseFloat(e.target.value) || 0 }))
                }
                placeholder="Good $"
                disabled={editValues.pricingMode === 'piece' && editValues.pieceRateId}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Better $/unit</label>
              <Input
                type="number"
                step="0.01"
                value={editValues.unitPriceBetter}
                onChange={(e) =>
                  setEditValues((v) => ({ ...v, unitPriceBetter: parseFloat(e.target.value) || 0 }))
                }
                placeholder="Better $"
                disabled={editValues.pricingMode === 'piece' && editValues.pieceRateId}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Best $/unit</label>
              <Input
                type="number"
                step="0.01"
                value={editValues.unitPriceBest}
                onChange={(e) =>
                  setEditValues((v) => ({ ...v, unitPriceBest: parseFloat(e.target.value) || 0 }))
                }
                placeholder="Best $"
                disabled={editValues.pricingMode === 'piece' && editValues.pieceRateId}
              />
            </div>
            <div className="flex items-end">
              {editValues.pricingMode === 'piece' && editValues.pieceRate && (
                <div className="text-xs text-gray-500 pb-2">
                  Total: {formatCurrency(editValues.unitPriceBetter * editValues.quantity)}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={onCancel}>
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Check className="w-4 h-4 mr-1" />
              Save
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Display mode
  const isPieceRate = item.pricingMode === 'piece' && item.pieceRate;

  return (
    <div className="hover:bg-gray-50 group">
      <div className="grid grid-cols-12 gap-2 px-4 py-2 items-center">
        {/* Name & Description */}
        <div className="col-span-5">
          <div className="flex items-center gap-2">
            <p className="text-sm text-charcoal">{item.name}</p>
            {isPieceRate && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded">
                <Ruler className="w-3 h-3" />
                ${item.pieceRate}/{item.pieceRateUnit}
              </span>
            )}
          </div>
          {item.description && (
            <p className="text-xs text-gray-500 truncate">{item.description}</p>
          )}
        </div>

        {/* Quantity with unit */}
        <div className="col-span-1 text-center text-sm text-gray-600">
          {item.quantity}
          {isPieceRate && (
            <span className="text-xs text-gray-400 ml-0.5">{item.pieceRateUnit}</span>
          )}
        </div>

        {/* Good */}
        <div className={`col-span-2 text-right text-sm ${
          selectedTier === 'good' ? 'font-medium text-charcoal' : 'text-gray-400'
        }`}>
          {formatCurrency(item.unitPriceGood * item.quantity)}
        </div>

        {/* Better */}
        <div className={`col-span-2 text-right text-sm ${
          selectedTier === 'better' ? 'font-medium text-charcoal' : 'text-gray-400'
        }`}>
          {formatCurrency(item.unitPriceBetter * item.quantity)}
        </div>

        {/* Best */}
        <div className={`col-span-2 text-right text-sm flex items-center justify-end gap-2 ${
          selectedTier === 'best' ? 'font-medium text-charcoal' : 'text-gray-400'
        }`}>
          {formatCurrency(item.unitPriceBest * item.quantity)}

          {/* Actions */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            <button
              onClick={onEdit}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <Edit2 className="w-3 h-3 text-gray-400" />
            </button>
            <button
              onClick={onDelete}
              className="p-1 hover:bg-red-100 rounded"
            >
              <Trash2 className="w-3 h-3 text-red-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Acceptance Criteria - shown below line item when enabled */}
      {showAcceptanceCriteria && acceptanceCriteria && (
        <div className="px-4 pb-2">
          <AcceptanceCriteriaDisplay criteria={acceptanceCriteria} compact />
        </div>
      )}
    </div>
  );
}

export default EstimateBuilder;
