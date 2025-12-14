import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Download,
  Mail,
  Phone,
  Home,
  CheckCircle,
  MessageSquare,
  ThumbsUp,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card, Button } from '../components/ui';
import {
  calculateEstimateTotals,
  formatCurrency,
  BUILD_TIERS,
} from '../lib/estimateHelpers';
import { getProject, updateProject } from '../services/api';
import { AcceptanceCriteriaToggle, AcceptanceCriteriaDisplay } from '../components/estimates';
import { getBestMatchingCriteria } from '../data/acceptanceCriteria';

/**
 * HomeownerQuote - Professional quote view for homeowners
 *
 * Simplified scope:
 * - Clean, professional quote presentation
 * - Scope summary by area (transparent)
 * - "Looks Good" / "I Have Questions" response buttons
 * - No digital signature (contractor handles actual contracts)
 * - No payment schedule (varies by contractor)
 */
export function HomeownerQuote() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lineItems, setLineItems] = useState([]);
  const [selectedTier, setSelectedTier] = useState('better');
  const [totals, setTotals] = useState({});
  const [responded, setResponded] = useState(false);
  const [responseType, setResponseType] = useState(null); // 'approved' | 'questions'
  const [showAcceptanceCriteria, setShowAcceptanceCriteria] = useState(true); // Default to showing criteria
  const [expandedCategories, setExpandedCategories] = useState({}); // Track expanded categories

  // Load project data
  useEffect(() => {
    async function loadProject() {
      setLoading(true);
      const { data } = await getProject(projectId);
      if (data) {
        setProject(data);
        setSelectedTier(data.build_tier || 'better');

        // Check if already responded
        if (data.quote_response) {
          setResponded(true);
          setResponseType(data.quote_response);
        }

        // Use saved estimate line items from EstimateBuilder
        // Only show items that have been priced (unitPriceBetter > 0)
        const savedItems = data.estimate_line_items || [];
        const pricedItems = savedItems.filter(item =>
          item.name && (item.unitPriceBetter > 0 || item.unitPriceGood > 0 || item.unitPriceBest > 0)
        );
        setLineItems(pricedItems);
        setTotals(calculateEstimateTotals(pricedItems));
      }
      setLoading(false);
    }
    loadProject();
  }, [projectId]);

  // Check if we have line items to display (any items with names)
  const hasLineItems = lineItems.length > 0 && lineItems.some(item => item.name);

  // Group line items by category for display
  const groupedItems = lineItems.reduce((acc, item) => {
    const category = item.roomLabel || item.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  // Calculate category totals
  const getCategoryTotal = (items) => {
    const tierKey = `unitPrice${selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)}`;
    return items.reduce((sum, item) => sum + (item[tierKey] || 0) * item.quantity, 0);
  };

  // Map scope item names to trade codes for acceptance criteria matching
  const getTradeCodeForScopeItem = (itemName) => {
    const name = itemName.toLowerCase();
    if (name.includes('exterior wall') || name.includes('ext-')) return 'FR';
    if (name.includes('interior wall') || name.includes('int-')) return 'FR';
    if (name.includes('framing') || name.includes('bearing')) return 'FR';
    if (name.includes('electrical')) return 'EL';
    if (name.includes('plumbing')) return 'PL';
    if (name.includes('hvac')) return 'HV';
    if (name.includes('insulation')) return 'IN';
    if (name.includes('drywall')) return 'DW';
    if (name.includes('flooring')) return 'FL';
    if (name.includes('painting')) return 'PT';
    if (name.includes('roofing')) return 'RF';
    if (name.includes('siding')) return 'EX';
    if (name.includes('window') || name.includes('door')) return 'WD';
    if (name.includes('kitchen')) return 'KI';
    if (name.includes('bath')) return 'BA';
    if (name.includes('foundation') || name.includes('concrete')) return 'FD';
    return 'GC';
  };

  // Get project scope summary from intake_data
  const getScopeSummary = () => {
    const intake = project?.intake_data || {};
    const scope = intake?.scope || {};
    const renovation = intake?.renovation || {};
    // Check both top-level instances (saved from EstimateBuilder) and intake_data.instances
    const instances = project?.instances || intake?.instances || [];
    const items = [];

    console.log('[HomeownerQuote] Project instances:', project?.instances?.length);
    console.log('[HomeownerQuote] Intake instances:', intake?.instances?.length);
    console.log('[HomeownerQuote] Using instances:', instances.length, instances);

    // Scope item ID to display name mapping (covers all SCOPE_ITEMS categories)
    const assemblyLabels = {
      // Assembly IDs (for assemblyId lookups)
      'ext-2x6': '2x6 Exterior Walls',
      'ext-2x4': '2x4 Exterior Walls',
      'int-2x4': 'Interior Walls',
      'int-2x4-ins': 'Interior Insulated Walls',
      // Walls (framing)
      'fr-ext': 'Exterior Walls',
      'fr-int': 'Interior Walls',
      'fr-bearing': 'Bearing Walls',
      'fr-ceil': 'Ceiling Framing',
      'fr-floor': 'Floor Framing',
      // Openings (windows & doors)
      'wd-win-std': 'Windows (Standard)',
      'wd-win-lrg': 'Windows (Large)',
      'wd-win-bsmt': 'Windows (Basement)',
      'wd-ext-door': 'Exterior Doors',
      'wd-int-door': 'Interior Doors',
      'wd-patio': 'Patio/Sliding Doors',
      'wd-garage': 'Garage Doors',
      // Surfaces (ceilings & floors)
      'dw-ceil': 'Drywall Ceilings',
      'fl-lvp': 'LVP/Laminate Flooring',
      'fl-hardwood': 'Hardwood Flooring',
      'fl-tile': 'Tile Flooring',
      'fl-carpet': 'Carpet',
      // MEP (mechanical, electrical, plumbing)
      'el-outlet': 'Outlets/Switches',
      'el-light': 'Light Fixtures',
      'pl-toilet': 'Toilets',
      'pl-sink': 'Sinks',
      'pl-tub': 'Tub/Shower',
      'hv-register': 'HVAC Registers',
    };

    // Scope items that use 'EA' (each) unit instead of 'LF' (linear feet)
    const eachUnitItems = [
      'wd-win-std', 'wd-win-lrg', 'wd-win-bsmt', 'wd-ext-door', 'wd-int-door', 'wd-patio', 'wd-garage',
      'el-outlet', 'el-light', 'pl-toilet', 'pl-sink', 'pl-tub', 'hv-register',
    ];

    // Check for contractor instances (framing measurements, etc.)
    if (instances.length > 0) {
      // Group by scope item ID (prefer scopeItemId over assemblyId for proper labeling)
      const byAssembly = {};
      instances.forEach(inst => {
        const key = inst.scopeItemId || inst.assemblyId;
        if (!byAssembly[key]) {
          byAssembly[key] = { total: 0, label: assemblyLabels[key] || key, isEach: eachUnitItems.includes(key) };
        }
        byAssembly[key].total += inst.measurement || 0;
      });

      // Add each assembly type with its total
      Object.entries(byAssembly).forEach(([key, data]) => {
        if (data.total > 0) {
          const unit = data.isEach ? '' : ' LF';
          const value = data.isEach ? Math.round(data.total) : Math.round(data.total);
          items.push(`${data.label}${data.isEach ? ` (${value})` : ` - ${value}${unit}`}`);
        }
      });
    }

    // Check for renovation rooms (from quick estimate form)
    const selectedRooms = renovation.selected_rooms || [];
    if (selectedRooms.length > 0) {
      const roomLabels = {
        kitchen: 'Kitchen Renovation',
        primary_bath: 'Primary Bathroom',
        secondary_bath: 'Secondary Bathroom',
        powder_room: 'Powder Room',
        living_room: 'Living Room',
        dining_room: 'Dining Room',
        bedrooms: 'Bedrooms',
        basement: 'Basement',
        laundry: 'Laundry Room',
        mudroom: 'Mudroom/Entry',
        home_office: 'Home Office',
        garage: 'Garage',
        exterior: 'Exterior/Siding',
        windows_doors: 'Windows & Doors',
        roofing: 'Roofing',
        addition: 'Addition',
      };
      selectedRooms.forEach(room => {
        items.push(roomLabels[room] || room);
      });
    }

    // Check for contractor scope items (legacy format)
    if (scope.framing?.enabled || scope.FR?.enabled) items.push('Structural Framing');
    if (scope.electrical?.enabled || scope.EL?.enabled) items.push('Electrical');
    if (scope.plumbing?.enabled || scope.PL?.enabled) items.push('Plumbing');
    if (scope.hvac?.enabled || scope.HV?.enabled) items.push('HVAC');
    if (scope.insulation?.enabled || scope.IN?.enabled) items.push('Insulation');
    if (scope.drywall?.enabled || scope.DW?.enabled) items.push('Drywall');
    if (scope.flooring?.enabled || scope.FL?.enabled) items.push('Flooring');
    if (scope.painting?.enabled || scope.PA?.enabled) items.push('Painting');
    if (scope.roofing?.enabled || scope.RF?.enabled) items.push('Roofing');
    if (scope.siding?.enabled || scope.SD?.enabled) items.push('Siding');
    if (scope.windows?.enabled || scope.WD?.enabled) items.push('Windows & Doors');
    if (scope.kitchen?.enabled || scope.KI?.enabled) items.push('Kitchen');
    if (scope.bathrooms?.enabled || scope.BA?.enabled) items.push('Bathrooms');

    // Check for new construction
    if (project?.intake_type === 'new_construction') {
      const sqftRange = intake?.layout?.sqft_range;
      if (sqftRange) {
        items.push(`New Construction - ${sqftRange.replace('_', '-')} sqft`);
      } else {
        items.push('New Home Construction');
      }
    }

    // Use project name as fallback context
    if (items.length === 0 && project?.name) {
      items.push(project.name);
    }

    return items.length > 0 ? items : ['Full scope per contract'];
  };

  // Handle "Looks Good" response
  const handleApprove = async () => {
    await updateProject(projectId, {
      quote_response: 'approved',
      quote_response_at: new Date().toISOString(),
    });
    setResponded(true);
    setResponseType('approved');
  };

  // Handle "I Have Questions" response
  const handleQuestions = async () => {
    await updateProject(projectId, {
      quote_response: 'questions',
      quote_response_at: new Date().toISOString(),
    });
    setResponded(true);
    setResponseType('questions');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="h-12 bg-gray-200 rounded animate-pulse" />
          <div className="h-96 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-gray-500">Quote not found</p>
        </div>
      </div>
    );
  }

  // Use saved estimate totals if available, otherwise calculate from line items
  // The contractor saves estimate_low/high explicitly, so prefer those
  const quoteTotal = project.estimate_high || project.estimate_low || totals[selectedTier] || totals.better || 0;
  const quoteDate = project.quote_sent_at
    ? new Date(project.quote_sent_at).toLocaleDateString()
    : project.updated_at
      ? new Date(project.updated_at).toLocaleDateString()
      : new Date().toLocaleDateString();

  return (
    <div className="min-h-screen bg-gray-100 pb-16 lg:pb-0">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 print:static">
        <div className="max-w-3xl mx-auto px-4 lg:px-6 py-3 lg:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 lg:gap-4 min-w-0">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors print:hidden flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                <h1 className="text-lg lg:text-xl font-semibold text-charcoal truncate">Project Quote</h1>
                <p className="text-xs lg:text-sm text-gray-500">#{projectId?.slice(-8)}</p>
              </div>
            </div>

            <Button variant="secondary" size="sm" onClick={() => window.print()} className="print:hidden flex-shrink-0">
              <Download className="w-4 h-4 lg:mr-2" />
              <span className="hidden lg:inline">Download PDF</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 lg:px-6 py-4 lg:py-8">
        {/* Company Header */}
        <Card className="p-4 lg:p-6 mb-4 lg:mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-charcoal">Hooomz Construction</h2>
              <p className="text-sm text-gray-500 mt-1">Quality Home Building & Renovation</p>
              <div className="mt-3 space-y-1 text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  (506) 555-0123
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  quotes@hooomz.com
                </p>
              </div>
            </div>
            <div className="sm:text-right">
              <p className="text-sm text-gray-500">Quote Date</p>
              <p className="font-medium text-charcoal">{quoteDate}</p>
              <p className="text-sm text-gray-500 mt-2">Valid For</p>
              <p className="font-medium text-charcoal">30 Days</p>
            </div>
          </div>
        </Card>

        {/* Client & Project Info */}
        <Card className="p-4 lg:p-6 mb-4 lg:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
            <div>
              <h3 className="text-xs lg:text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                Prepared For
              </h3>
              <p className="font-semibold text-charcoal">{project.client_name}</p>
              {project.client_email && <p className="text-sm text-gray-600 truncate">{project.client_email}</p>}
              {project.client_phone && <p className="text-sm text-gray-600">{project.client_phone}</p>}
            </div>
            <div>
              <h3 className="text-xs lg:text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                Project Location
              </h3>
              <p className="font-semibold text-charcoal flex items-center gap-2">
                <Home className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="truncate">{project.address || 'Address pending'}</span>
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {project.intake_type === 'new_construction' ? 'New Construction' : 'Renovation'}
              </p>
            </div>
          </div>
        </Card>

        {/* Selected Package */}
        <Card className="p-4 lg:p-6 mb-4 lg:mb-6">
          <h3 className="text-lg font-semibold text-charcoal mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-400" />
            Your Quote
          </h3>

          <div className="bg-gradient-to-r from-charcoal to-gray-700 rounded-lg p-4 text-white mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Package Level</p>
                <p className="text-xl font-bold">{BUILD_TIERS[selectedTier]?.label || 'Better'}</p>
                <p className="text-sm text-gray-300 mt-1">
                  {BUILD_TIERS[selectedTier]?.description || 'Enhanced quality finishes'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-300">Estimated Total</p>
                <p className="text-3xl font-bold">{formatCurrency(quoteTotal)}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Scope Breakdown */}
        <Card className="p-4 lg:p-6 mb-4 lg:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h3 className="text-base lg:text-lg font-semibold text-charcoal">What's Included</h3>
            <AcceptanceCriteriaToggle
              enabled={showAcceptanceCriteria}
              onChange={setShowAcceptanceCriteria}
            />
          </div>

          {/* Show scope summary when we don't have real line items */}
          {!hasLineItems ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                This quote covers the following scope of work:
              </p>
              <div className="space-y-3">
                {getScopeSummary().map((item, idx) => {
                  // Try to match criteria based on the scope item name
                  const mockItem = { name: item, tradeCode: getTradeCodeForScopeItem(item) };
                  const criteria = getBestMatchingCriteria(mockItem);

                  return (
                    <div key={idx} className="border border-gray-100 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-charcoal">
                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span className="font-medium">{item}</span>
                      </div>
                      {showAcceptanceCriteria && criteria && (
                        <div className="mt-2 ml-6">
                          <AcceptanceCriteriaDisplay criteria={criteria} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-4 italic">
                Detailed line-item breakdown available upon request.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedItems).map(([category, items]) => (
                <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Category Header */}
                  <button
                    onClick={() => setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }))}
                    className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex items-center gap-2">
                        {expandedCategories[category] ? (
                          <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        )}
                        <div className="text-left">
                          <p className="font-medium text-charcoal">{category}</p>
                          <p className="text-xs text-gray-500">
                            {items.length} {items.length === 1 ? 'item' : 'items'}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-charcoal flex-shrink-0">
                        {formatCurrency(getCategoryTotal(items))}
                      </p>
                    </div>
                  </button>

                  {/* Line Items - Always visible, expandable for details */}
                  <div className="divide-y divide-gray-100">
                    {items.map((item, idx) => {
                      const criteria = getBestMatchingCriteria(item);
                      const tierKey = `unitPrice${selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)}`;
                      const itemTotal = (item[tierKey] || 0) * item.quantity;

                      return (
                        <div key={idx} className="px-4 py-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-charcoal">
                                {item.name}
                              </p>
                              {item.description && item.description !== item.name && (
                                <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                              )}
                              {item.quantity > 1 && (
                                <p className="text-xs text-gray-400 mt-0.5">
                                  Qty: {item.quantity} {item.unit && item.unit !== 'lump' ? item.unit : ''}
                                </p>
                              )}
                            </div>
                            <p className="text-sm font-medium text-charcoal flex-shrink-0">
                              {itemTotal > 0 ? formatCurrency(itemTotal) : <span className="text-gray-400">Included</span>}
                            </p>
                          </div>

                          {/* Acceptance Criteria */}
                          {showAcceptanceCriteria && criteria && (
                            <div className="mt-2">
                              <AcceptanceCriteriaDisplay criteria={criteria} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Expanded category details */}
                  {expandedCategories[category] && (
                    <div className="px-4 py-2 bg-blue-50 border-t border-blue-100">
                      <p className="text-xs text-blue-700">
                        Category includes all materials and labor for {category.toLowerCase()}.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-gray-200 mt-4 pt-4">
            <div className="flex items-center justify-between text-base lg:text-lg">
              <span className="font-semibold text-charcoal">Total</span>
              <span className="font-bold text-charcoal">{formatCurrency(quoteTotal)}</span>
            </div>
          </div>
        </Card>

        {/* Response Section */}
        {!responded ? (
          <Card className="p-4 lg:p-6 mb-4 lg:mb-6 print:hidden">
            <h3 className="text-base lg:text-lg font-semibold text-charcoal mb-2">What do you think?</h3>
            <p className="text-sm lg:text-base text-gray-600 mb-4">
              Let us know if this quote looks good or if you have questions.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleApprove} className="flex-1">
                <ThumbsUp className="w-4 h-4 mr-2" />
                Looks Good
              </Button>
              <Button variant="secondary" onClick={handleQuestions} className="flex-1">
                <MessageSquare className="w-4 h-4 mr-2" />
                I Have Questions
              </Button>
            </div>
          </Card>
        ) : (
          <Card className={`p-4 lg:p-6 mb-4 lg:mb-6 ${responseType === 'approved' ? 'bg-emerald-50 border-emerald-200' : 'bg-blue-50 border-blue-200'}`}>
            <div className="flex items-start gap-3 lg:gap-4">
              <div className={`p-2 lg:p-3 rounded-full flex-shrink-0 ${responseType === 'approved' ? 'bg-emerald-100' : 'bg-blue-100'}`}>
                {responseType === 'approved' ? (
                  <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6 text-emerald-600" />
                ) : (
                  <MessageSquare className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                )}
              </div>
              <div className="min-w-0">
                <h3 className={`text-base lg:text-lg font-semibold ${responseType === 'approved' ? 'text-emerald-800' : 'text-blue-800'}`}>
                  {responseType === 'approved' ? 'Thanks for your response!' : 'We\'ll be in touch!'}
                </h3>
                <p className={`text-sm lg:text-base ${responseType === 'approved' ? 'text-emerald-700' : 'text-blue-700'}`}>
                  {responseType === 'approved'
                    ? 'Your contractor has been notified. They\'ll be in touch shortly.'
                    : 'Your contractor has been notified. They\'ll reach out soon.'}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Contact Info */}
        <Card className="p-4 lg:p-6">
          <h3 className="text-base lg:text-lg font-semibold text-charcoal mb-3 lg:mb-4">Questions?</h3>
          <p className="text-sm lg:text-base text-gray-600 mb-4">
            Reach out anytime to discuss this quote.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="secondary" onClick={() => window.location.href = 'mailto:quotes@hooomz.com'}>
              <Mail className="w-4 h-4 mr-2" />
              Email Us
            </Button>
            <Button variant="secondary" onClick={() => window.location.href = 'tel:5065550123'}>
              <Phone className="w-4 h-4 mr-2" />
              Call Us
            </Button>
          </div>
        </Card>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          .print\\:static { position: static !important; }
        }
      `}</style>
    </div>
  );
}

export default HomeownerQuote;
