/**
 * Contractor Intake Schema
 *
 * Defines the structure for contractor scope-of-work intake.
 * More efficient/direct than homeowner intake - focused on trades and quantities.
 */

// ============================================================================
// PROJECT TYPES
// ============================================================================

export const PROJECT_TYPES = [
  { value: 'renovation', label: 'Renovation' },
  { value: 'new_construction', label: 'New Construction' },
  { value: 'addition', label: 'Addition' },
  { value: 'repair', label: 'Repair/Service' },
];

// ============================================================================
// SPEC LEVELS (maps to build_tier)
// ============================================================================

export const SPEC_LEVELS = [
  { value: 'budget', label: 'Budget', description: 'Builder-grade materials, basic finishes' },
  { value: 'standard', label: 'Standard', description: 'Mid-range materials, quality finishes' },
  { value: 'premium', label: 'Premium', description: 'High-end materials, custom details' },
];

// ============================================================================
// BUILDING CONFIGURATION OPTIONS
// ============================================================================

export const STOREY_OPTIONS = [
  { value: '1', label: '1 Storey (Bungalow)' },
  { value: '1.5', label: '1.5 Storey' },
  { value: '2', label: '2 Storey' },
  { value: '3', label: '3 Storey' },
];

export const CEILING_HEIGHT_OPTIONS = [
  { value: 8, label: "8'" },
  { value: 9, label: "9'" },
  { value: 10, label: "10'" },
  { value: 12, label: "12'" },
];

// ============================================================================
// SCOPE ITEMS - Trade-specific line items with unit types
// ============================================================================

export const SCOPE_ITEMS = {
  // Site Work
  SW: {
    name: 'Site Work',
    items: [
      { id: 'sw-demo', name: 'Demolition', unit: 'allowance', defaultQty: 1 },
      { id: 'sw-debris', name: 'Debris Removal', unit: 'loads', defaultQty: 1 },
      { id: 'sw-grade', name: 'Grading & Prep', unit: 'sf', defaultQty: null },
      { id: 'sw-exc', name: 'Excavation', unit: 'cy', defaultQty: null },
    ],
  },

  // Foundation
  FN: {
    name: 'Foundation',
    items: [
      { id: 'fn-foot', name: 'Footings', unit: 'lf', defaultQty: null },
      { id: 'fn-wall', name: 'Foundation Walls', unit: 'lf', defaultQty: null },
      { id: 'fn-slab', name: 'Slab on Grade', unit: 'sf', defaultQty: null },
      { id: 'fn-water', name: 'Waterproofing', unit: 'sf', defaultQty: null },
    ],
  },

  // Framing
  FR: {
    name: 'Framing',
    items: [
      { id: 'fr-ext', name: 'Exterior Walls', unit: 'lf', defaultQty: null },
      { id: 'fr-int', name: 'Interior Walls', unit: 'lf', defaultQty: null },
      { id: 'fr-bearing', name: 'Bearing Walls', unit: 'lf', defaultQty: null },
      { id: 'fr-ceil', name: 'Ceiling Framing', unit: 'sf', defaultQty: null },
      { id: 'fr-floor', name: 'Floor Framing', unit: 'sf', defaultQty: null },
      { id: 'fr-truss', name: 'Roof Trusses', unit: 'ea', defaultQty: null },
      { id: 'fr-roof', name: 'Roof Framing', unit: 'sf', defaultQty: null },
      { id: 'fr-header', name: 'Headers/Beams', unit: 'ea', defaultQty: null },
    ],
  },

  // Roofing
  RF: {
    name: 'Roofing',
    items: [
      { id: 'rf-shingle', name: 'Shingles', unit: 'sq', defaultQty: null },
      { id: 'rf-flat', name: 'Flat Roof/TPO', unit: 'sf', defaultQty: null },
      { id: 'rf-flash', name: 'Flashing & Details', unit: 'allowance', defaultQty: 1 },
      { id: 'rf-vent', name: 'Ventilation', unit: 'ea', defaultQty: null },
    ],
  },

  // Exterior
  EX: {
    name: 'Exterior',
    items: [
      { id: 'ex-siding', name: 'Siding', unit: 'sf', defaultQty: null },
      { id: 'ex-trim', name: 'Exterior Trim', unit: 'lf', defaultQty: null },
      { id: 'ex-gutter', name: 'Gutters & Downspouts', unit: 'lf', defaultQty: null },
      { id: 'ex-soffit', name: 'Soffit & Fascia', unit: 'lf', defaultQty: null },
    ],
  },

  // Windows & Doors
  WD: {
    name: 'Windows & Doors',
    items: [
      { id: 'wd-win', name: 'Windows', unit: 'ea', defaultQty: null },
      { id: 'wd-ext-door', name: 'Exterior Doors', unit: 'ea', defaultQty: null },
      { id: 'wd-int-door', name: 'Interior Doors', unit: 'ea', defaultQty: null },
      { id: 'wd-patio', name: 'Patio/Sliding Doors', unit: 'ea', defaultQty: null },
      { id: 'wd-garage', name: 'Garage Doors', unit: 'ea', defaultQty: null },
    ],
  },

  // Insulation
  IN: {
    name: 'Insulation',
    items: [
      { id: 'in-batt', name: 'Batt Insulation', unit: 'sf', defaultQty: null },
      { id: 'in-spray', name: 'Spray Foam', unit: 'sf', defaultQty: null },
      { id: 'in-blown', name: 'Blown-In', unit: 'sf', defaultQty: null },
      { id: 'in-board', name: 'Rigid Board', unit: 'sf', defaultQty: null },
      { id: 'in-ext', name: 'Exterior Insulation', unit: 'sf', defaultQty: null },
      { id: 'in-box', name: 'Box Headers', unit: 'lf', defaultQty: null },
      { id: 'in-subslab', name: 'Sub-Slab Insulation', unit: 'sf', defaultQty: null },
    ],
  },

  // Electrical
  EL: {
    name: 'Electrical',
    items: [
      { id: 'el-panel', name: 'Panel/Service', unit: 'ea', defaultQty: 1 },
      { id: 'el-rough', name: 'Rough-In (per room)', unit: 'ea', defaultQty: null },
      { id: 'el-outlet', name: 'Outlets/Switches', unit: 'ea', defaultQty: null },
      { id: 'el-light', name: 'Light Fixtures', unit: 'ea', defaultQty: null },
      { id: 'el-low-v', name: 'Low Voltage/Data', unit: 'ea', defaultQty: null },
    ],
  },

  // Plumbing
  PL: {
    name: 'Plumbing',
    items: [
      { id: 'pl-rough', name: 'Rough-In (per fixture)', unit: 'ea', defaultQty: null },
      { id: 'pl-toilet', name: 'Toilets', unit: 'ea', defaultQty: null },
      { id: 'pl-sink', name: 'Sinks', unit: 'ea', defaultQty: null },
      { id: 'pl-tub', name: 'Tub/Shower', unit: 'ea', defaultQty: null },
      { id: 'pl-water-heat', name: 'Water Heater', unit: 'ea', defaultQty: null },
      { id: 'pl-gas', name: 'Gas Line', unit: 'lf', defaultQty: null },
    ],
  },

  // HVAC
  HV: {
    name: 'HVAC',
    items: [
      { id: 'hv-furnace', name: 'Furnace', unit: 'ea', defaultQty: null },
      { id: 'hv-ac', name: 'AC Condenser', unit: 'ea', defaultQty: null },
      { id: 'hv-duct', name: 'Ductwork', unit: 'lf', defaultQty: null },
      { id: 'hv-minisplit', name: 'Mini-Split', unit: 'ea', defaultQty: null },
      { id: 'hv-register', name: 'Registers/Grilles', unit: 'ea', defaultQty: null },
    ],
  },

  // Drywall
  DW: {
    name: 'Drywall',
    items: [
      { id: 'dw-strap', name: 'Strapping', unit: 'sf', defaultQty: null },
      { id: 'dw-hang-wall', name: 'Hang Drywall - Walls', unit: 'sf', defaultQty: null },
      { id: 'dw-hang-ceil', name: 'Hang Drywall - Ceilings', unit: 'sf', defaultQty: null },
      { id: 'dw-tape', name: 'Tape & Mud', unit: 'sf', defaultQty: null },
      { id: 'dw-texture', name: 'Texture', unit: 'sf', defaultQty: null },
      { id: 'dw-patch', name: 'Patch/Repair', unit: 'ea', defaultQty: null },
    ],
  },

  // Painting
  PT: {
    name: 'Painting',
    items: [
      { id: 'pt-prime', name: 'Prime', unit: 'sf', defaultQty: null },
      { id: 'pt-walls', name: 'Paint Walls', unit: 'sf', defaultQty: null },
      { id: 'pt-ceil', name: 'Paint Ceilings', unit: 'sf', defaultQty: null },
      { id: 'pt-trim', name: 'Paint Trim', unit: 'lf', defaultQty: null },
      { id: 'pt-doors', name: 'Paint Doors', unit: 'ea', defaultQty: null },
      { id: 'pt-cab', name: 'Paint Cabinets', unit: 'lf', defaultQty: null },
    ],
  },

  // Flooring
  FL: {
    name: 'Flooring',
    items: [
      { id: 'fl-lvp', name: 'LVP/Laminate', unit: 'sf', defaultQty: null },
      { id: 'fl-hardwood', name: 'Hardwood', unit: 'sf', defaultQty: null },
      { id: 'fl-carpet', name: 'Carpet', unit: 'sf', defaultQty: null },
      { id: 'fl-sub', name: 'Subfloor Repair', unit: 'sf', defaultQty: null },
    ],
  },

  // Tile
  TL: {
    name: 'Tile',
    items: [
      { id: 'tl-floor', name: 'Floor Tile', unit: 'sf', defaultQty: null },
      { id: 'tl-wall', name: 'Wall Tile', unit: 'sf', defaultQty: null },
      { id: 'tl-shower', name: 'Shower Tile', unit: 'sf', defaultQty: null },
      { id: 'tl-backsplash', name: 'Backsplash', unit: 'sf', defaultQty: null },
    ],
  },

  // Finish Carpentry
  FC: {
    name: 'Finish Carpentry',
    items: [
      { id: 'fc-base', name: 'Baseboard', unit: 'lf', defaultQty: null },
      { id: 'fc-case', name: 'Door Casing', unit: 'ea', defaultQty: null },
      { id: 'fc-crown', name: 'Crown Molding', unit: 'lf', defaultQty: null },
      { id: 'fc-shelf', name: 'Shelving', unit: 'lf', defaultQty: null },
      { id: 'fc-closet', name: 'Closet Systems', unit: 'ea', defaultQty: null },
    ],
  },

  // Cabinetry
  CB: {
    name: 'Cabinetry',
    items: [
      { id: 'cb-base', name: 'Base Cabinets', unit: 'lf', defaultQty: null },
      { id: 'cb-upper', name: 'Upper Cabinets', unit: 'lf', defaultQty: null },
      { id: 'cb-vanity', name: 'Vanity', unit: 'ea', defaultQty: null },
      { id: 'cb-pantry', name: 'Pantry Cabinet', unit: 'ea', defaultQty: null },
    ],
  },

  // Countertops
  CT: {
    name: 'Countertops',
    items: [
      { id: 'ct-lam', name: 'Laminate', unit: 'sf', defaultQty: null },
      { id: 'ct-quartz', name: 'Quartz', unit: 'sf', defaultQty: null },
      { id: 'ct-granite', name: 'Granite', unit: 'sf', defaultQty: null },
      { id: 'ct-butcher', name: 'Butcher Block', unit: 'sf', defaultQty: null },
    ],
  },

  // Fixtures
  FX: {
    name: 'Fixtures',
    items: [
      { id: 'fx-faucet', name: 'Faucets', unit: 'ea', defaultQty: null },
      { id: 'fx-hardware', name: 'Cabinet Hardware', unit: 'set', defaultQty: null },
      { id: 'fx-mirror', name: 'Mirrors', unit: 'ea', defaultQty: null },
      { id: 'fx-towel', name: 'Bath Accessories', unit: 'set', defaultQty: null },
    ],
  },

  // Cleaning & Closeout
  CL: {
    name: 'Cleaning & Closeout',
    items: [
      { id: 'cl-rough', name: 'Rough Clean', unit: 'ea', defaultQty: 1 },
      { id: 'cl-final', name: 'Final Clean', unit: 'ea', defaultQty: 1 },
      { id: 'cl-punch', name: 'Punch List', unit: 'ea', defaultQty: 1 },
    ],
  },
};

// Unit labels for display
export const UNIT_LABELS = {
  sf: 'SF',
  lf: 'LF',
  ea: 'Each',
  sq: 'Squares',
  cy: 'CY',
  loads: 'Loads',
  set: 'Set',
  allowance: 'Allow',
};

// Full unit names for tooltips
export const UNIT_NAMES = {
  sf: 'Square Feet',
  lf: 'Linear Feet',
  ea: 'Each',
  sq: 'Roofing Squares (100 SF)',
  cy: 'Cubic Yards',
  loads: 'Dumpster Loads',
  set: 'Set',
  allowance: 'Allowance',
};

// ============================================================================
// CONTRACTOR INTAKE STEPS
// ============================================================================

export const CONTRACTOR_INTAKE_STEPS = [
  { id: 'project', title: 'Project Info', description: 'Basic details' },
  { id: 'scope', title: 'Scope of Work', description: 'Trades & quantities' },
  { id: 'schedule', title: 'Schedule', description: 'Timeline & dates' },
  { id: 'review', title: 'Review', description: 'Confirm & submit' },
];

// ============================================================================
// DEFAULT STATE
// ============================================================================

export const getDefaultContractorIntakeState = () => ({
  // Form metadata
  currentStep: 0,

  // Project info
  project: {
    name: '',
    address: '',
    projectType: 'renovation',
    specLevel: 'standard',
    notes: '',
  },

  // Building configuration - for level/measurement calculations
  building: {
    storeys: '1',           // '1', '1.5', '2', '3'
    hasBasement: false,
    // Per-level ceiling heights (in feet)
    ceilingHeights: {
      basement: 8,
      main: 9,
      second: 8,
      third: 8,
    },
  },

  // Client info (optional - for projects on behalf of clients)
  client: {
    hasClient: false,
    name: '',
    email: '',
    phone: '',
  },

  // Scope of work - keyed by category code
  // Each category has: { enabled: bool, items: { [itemId]: { qty, notes } } }
  scope: {},

  // Instance-based measurements (new system)
  // Array of: { id, scopeItemId, level, measurement, assemblyId, notes }
  instances: [],

  // Build assemblies selected for this project (walls, floors, roofs, foundation)
  assemblies: [],

  // Schedule
  schedule: {
    startDate: '',
    estimatedDuration: '', // in weeks
    milestones: [], // [{ name, date }]
  },

  // Budget (optional - contractor may input their estimate)
  budget: {
    estimatedTotal: null,
    breakdown: {}, // { [categoryCode]: amount }
  },
});

// ============================================================================
// VALIDATION
// ============================================================================

export function validateContractorIntakeStep(stepId, data) {
  const errors = {};

  switch (stepId) {
    case 'project':
      if (!data.project?.name?.trim()) errors.name = 'Project name is required';
      if (!data.project?.address?.trim()) errors.address = 'Address is required';
      break;

    case 'scope':
      // Accept either old scope format OR new instances format
      const hasOldScope = Object.values(data.scope || {}).some(cat =>
        cat.enabled && Object.values(cat.items || {}).some(item => item.qty > 0)
      );
      const hasInstances = (data.instances || []).length > 0;
      if (!hasOldScope && !hasInstances) {
        errors.scope = 'At least one scope item is required';
      }
      break;

    case 'schedule':
      if (!data.schedule?.startDate) errors.startDate = 'Start date is required';
      break;
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Get enabled categories from scope data
 */
export function getEnabledCategories(scope) {
  return Object.entries(scope || {})
    .filter(([, cat]) => cat.enabled)
    .map(([code]) => code);
}

/**
 * Get scope items with quantities for a category
 */
export function getCategoryScopeItems(scope, categoryCode) {
  const cat = scope?.[categoryCode];
  if (!cat?.enabled) return [];

  return Object.entries(cat.items || {})
    .filter(([, item]) => item.qty > 0)
    .map(([itemId, item]) => ({
      ...SCOPE_ITEMS[categoryCode]?.items?.find(i => i.id === itemId),
      ...item,
    }));
}

/**
 * Calculate total scope item count
 */
export function getTotalScopeItemCount(scope) {
  return Object.values(scope || {}).reduce((total, cat) => {
    if (!cat.enabled) return total;
    return total + Object.values(cat.items || {}).filter(item => item.qty > 0).length;
  }, 0);
}
