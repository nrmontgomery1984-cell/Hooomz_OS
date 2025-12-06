/**
 * HOOOMZ Scope Categories
 *
 * Master list of work categories and subcategories.
 * Used across: Activity Log, Tasks, Estimates, Loops, Reports
 *
 * Structure matches HOOOMZ_TASK_HIERARCHY.md
 * Each category has a 2-letter code for compact storage/display
 */

export const SCOPE_CATEGORIES = [
  {
    code: 'SW',
    name: 'Site Work',
    subcategories: [
      { code: 'SW-01', name: 'Site Preparation' },
      { code: 'SW-02', name: 'Excavation' },
    ]
  },
  {
    code: 'FN',
    name: 'Foundation',
    subcategories: [
      { code: 'FN-01', name: 'Footings' },
      { code: 'FN-02', name: 'Foundation Walls' },
      { code: 'FN-03', name: 'Slab Work' },
      { code: 'FN-04', name: 'Waterproofing' },
    ]
  },
  {
    code: 'FS',
    name: 'Framing - Structural',
    subcategories: [
      { code: 'FS-01', name: 'Floor Framing' },
      { code: 'FS-02', name: 'Wall Framing' },
      { code: 'FS-03', name: 'Ceiling/Roof Framing' },
      { code: 'FS-04', name: 'Beams & Headers' },
      { code: 'FS-05', name: 'Sheathing' },
    ]
  },
  {
    code: 'FI',
    name: 'Framing - Interior',
    subcategories: [
      { code: 'FI-01', name: 'Partition Walls' },
      { code: 'FI-02', name: 'Blocking & Backing' },
    ]
  },
  {
    code: 'RF',
    name: 'Roofing',
    subcategories: [
      { code: 'RF-01', name: 'Roof Deck Prep' },
      { code: 'RF-02', name: 'Underlayment' },
      { code: 'RF-03', name: 'Shingles/Roofing' },
      { code: 'RF-04', name: 'Flashing' },
      { code: 'RF-05', name: 'Ventilation' },
    ]
  },
  {
    code: 'EE',
    name: 'Exterior Envelope',
    subcategories: [
      { code: 'EE-01', name: 'House Wrap/WRB' },
      { code: 'EE-02', name: 'Windows & Doors' },
      { code: 'EE-03', name: 'Exterior Trim' },
      { code: 'EE-04', name: 'Siding' },
    ]
  },
  {
    code: 'IA',
    name: 'Insulation & Air Sealing',
    subcategories: [
      { code: 'IA-01', name: 'Air Sealing' },
      { code: 'IA-02', name: 'Cavity Insulation' },
      { code: 'IA-03', name: 'Moisture Management' },
      { code: 'IA-04', name: 'Attic Insulation' },
      { code: 'IA-05', name: 'Basement/Crawl Insulation' },
    ]
  },
  {
    code: 'EL',
    name: 'Electrical',
    subcategories: [
      { code: 'EL-01', name: 'Rough-In' },
      { code: 'EL-02', name: 'Trim/Finish' },
      { code: 'EL-03', name: 'Service & Panel' },
    ]
  },
  {
    code: 'PL',
    name: 'Plumbing',
    subcategories: [
      { code: 'PL-01', name: 'Rough-In' },
      { code: 'PL-02', name: 'Trim/Finish' },
    ]
  },
  {
    code: 'HV',
    name: 'HVAC',
    subcategories: [
      { code: 'HV-01', name: 'Rough-In' },
      { code: 'HV-02', name: 'Trim/Finish' },
    ]
  },
  {
    code: 'DW',
    name: 'Drywall',
    subcategories: [
      { code: 'DW-01', name: 'Hanging' },
      { code: 'DW-02', name: 'Finishing' },
    ]
  },
  {
    code: 'PT',
    name: 'Painting',
    subcategories: [
      { code: 'PT-01', name: 'Prep' },
      { code: 'PT-02', name: 'Prime' },
      { code: 'PT-03', name: 'Finish Coats' },
    ]
  },
  {
    code: 'FL',
    name: 'Flooring',
    subcategories: [
      { code: 'FL-01', name: 'Subfloor Prep' },
      { code: 'FL-02', name: 'Hardwood' },
      { code: 'FL-03', name: 'LVP/Laminate' },
      { code: 'FL-04', name: 'Carpet' },
      { code: 'FL-05', name: 'Tile' },
      { code: 'FL-06', name: 'Concrete/Epoxy' },
      { code: 'FL-07', name: 'Transitions & Trim' },
    ]
  },
  {
    code: 'TL',
    name: 'Tile',
    subcategories: [
      { code: 'TL-01', name: 'Substrate Prep' },
      { code: 'TL-02', name: 'Waterproofing' },
      { code: 'TL-03', name: 'Tile Setting' },
      { code: 'TL-04', name: 'Grouting & Sealing' },
    ]
  },
  {
    code: 'FC',
    name: 'Finish Carpentry',
    subcategories: [
      { code: 'FC-01', name: 'Door Installation' },
      { code: 'FC-02', name: 'Base Trim' },
      { code: 'FC-03', name: 'Casing & Headers' },
      { code: 'FC-04', name: 'Crown Molding' },
      { code: 'FC-05', name: 'Built-Ins' },
      { code: 'FC-06', name: 'Closet Systems' },
    ]
  },
  {
    code: 'CM',
    name: 'Cabinetry & Millwork',
    subcategories: [
      { code: 'CM-01', name: 'Kitchen Cabinets' },
      { code: 'CM-02', name: 'Bath Vanities' },
      { code: 'CM-03', name: 'Countertops' },
      { code: 'CM-04', name: 'Custom Millwork' },
    ]
  },
  {
    code: 'SR',
    name: 'Stairs & Railings',
    subcategories: [
      { code: 'SR-01', name: 'Stair Construction' },
      { code: 'SR-02', name: 'Railings & Balusters' },
    ]
  },
  {
    code: 'EF',
    name: 'Exterior Finishes',
    subcategories: [
      { code: 'EF-01', name: 'Decks & Porches' },
      { code: 'EF-02', name: 'Hardscape' },
      { code: 'EF-03', name: 'Landscaping' },
    ]
  },
  {
    code: 'FZ',
    name: 'Final Completion',
    subcategories: [
      { code: 'FZ-01', name: 'Punch List' },
    ]
  },
];

// Additional "meta" category for non-trade activities
export const META_CATEGORIES = [
  {
    code: 'GN',
    name: 'General',
    subcategories: [
      { code: 'GN-01', name: 'Project Management' },
      { code: 'GN-02', name: 'Client Communication' },
      { code: 'GN-03', name: 'Permits & Inspections' },
      { code: 'GN-04', name: 'Safety' },
      { code: 'GN-05', name: 'Other' },
    ]
  },
];

// Combined for dropdowns
export const ALL_CATEGORIES = [...SCOPE_CATEGORIES, ...META_CATEGORIES];

/**
 * Helper functions for lookups
 */

// Get category by code
export function getCategoryByCode(code) {
  return ALL_CATEGORIES.find(c => c.code === code);
}

// Get subcategory by code
export function getSubcategoryByCode(code) {
  for (const cat of ALL_CATEGORIES) {
    const sub = cat.subcategories.find(s => s.code === code);
    if (sub) return { ...sub, categoryCode: cat.code, categoryName: cat.name };
  }
  return null;
}

// Get subcategories for a category
export function getSubcategoriesForCategory(categoryCode) {
  const cat = getCategoryByCode(categoryCode);
  return cat ? cat.subcategories : [];
}

// Flatten all subcategories (for search)
export function getAllSubcategories() {
  return ALL_CATEGORIES.flatMap(cat =>
    cat.subcategories.map(sub => ({
      ...sub,
      categoryCode: cat.code,
      categoryName: cat.name,
    }))
  );
}

// Format for display: "Electrical > Rough-In"
export function formatCategoryPath(subcategoryCode) {
  const sub = getSubcategoryByCode(subcategoryCode);
  if (!sub) return subcategoryCode;
  return `${sub.categoryName} > ${sub.name}`;
}

// Format short: "EL-01"
export function formatCategoryShort(subcategoryCode) {
  return subcategoryCode;
}
