/**
 * Assembly Categories - Scope categories with subcategories for building assemblies
 *
 * Used by AssemblyBuilder and AssemblyConfigurator to select what type of
 * assembly is being created and link it to SCOPE_ITEMS for estimating.
 */
export const ASSEMBLY_CATEGORIES = {
  framing: {
    name: 'Framing',
    description: 'Structural framing assemblies',
    subcategories: [
      { id: 'fr-ext', name: 'Exterior Walls', unit: 'LF' },
      { id: 'fr-int', name: 'Interior Walls', unit: 'LF' },
      { id: 'fr-bearing', name: 'Bearing Walls', unit: 'LF' },
      { id: 'fr-ceil', name: 'Ceiling Framing', unit: 'SF' },
      { id: 'fr-floor', name: 'Floor Framing', unit: 'SF' },
      { id: 'fr-roof', name: 'Roof Framing', unit: 'SF' },
    ],
  },
  drywall: {
    name: 'Drywall',
    description: 'Drywall and finishing assemblies',
    subcategories: [
      { id: 'dw-wall', name: 'Wall Drywall', unit: 'SF' },
      { id: 'dw-ceil', name: 'Ceiling Drywall', unit: 'SF' },
      { id: 'dw-fire', name: 'Fire-Rated Drywall', unit: 'SF' },
    ],
  },
  electrical: {
    name: 'Electrical',
    description: 'Electrical assemblies and packages',
    subcategories: [
      { id: 'el-outlet', name: 'Outlet/Switch Package', unit: 'EA' },
      { id: 'el-light', name: 'Light Fixture Package', unit: 'EA' },
      { id: 'el-panel', name: 'Panel/Service', unit: 'EA' },
      { id: 'el-circuit', name: 'Circuit Package', unit: 'EA' },
    ],
  },
  plumbing: {
    name: 'Plumbing',
    description: 'Plumbing assemblies and fixtures',
    subcategories: [
      { id: 'pl-toilet', name: 'Toilet Package', unit: 'EA' },
      { id: 'pl-sink', name: 'Sink Package', unit: 'EA' },
      { id: 'pl-tub', name: 'Tub/Shower Package', unit: 'EA' },
      { id: 'pl-water', name: 'Water Line', unit: 'LF' },
      { id: 'pl-drain', name: 'Drain Line', unit: 'LF' },
    ],
  },
  hvac: {
    name: 'HVAC',
    description: 'Heating, ventilation, and cooling',
    subcategories: [
      { id: 'hv-duct', name: 'Ductwork', unit: 'LF' },
      { id: 'hv-register', name: 'Register/Return', unit: 'EA' },
      { id: 'hv-unit', name: 'Unit Install', unit: 'EA' },
    ],
  },
  flooring: {
    name: 'Flooring',
    description: 'Flooring assemblies',
    subcategories: [
      { id: 'fl-lvp', name: 'LVP/Laminate', unit: 'SF' },
      { id: 'fl-hardwood', name: 'Hardwood', unit: 'SF' },
      { id: 'fl-tile', name: 'Tile', unit: 'SF' },
      { id: 'fl-carpet', name: 'Carpet', unit: 'SF' },
      { id: 'fl-subfloor', name: 'Subfloor', unit: 'SF' },
    ],
  },
  roofing: {
    name: 'Roofing',
    description: 'Roofing assemblies',
    subcategories: [
      { id: 'rf-shingle', name: 'Shingle Roofing', unit: 'SQ' },
      { id: 'rf-metal', name: 'Metal Roofing', unit: 'SQ' },
      { id: 'rf-flat', name: 'Flat Roofing', unit: 'SQ' },
    ],
  },
  exterior: {
    name: 'Exterior',
    description: 'Exterior finishes and siding',
    subcategories: [
      { id: 'ex-vinyl', name: 'Vinyl Siding', unit: 'SF' },
      { id: 'ex-hardie', name: 'Hardie Board', unit: 'SF' },
      { id: 'ex-wood', name: 'Wood Siding', unit: 'SF' },
      { id: 'ex-stucco', name: 'Stucco', unit: 'SF' },
    ],
  },
  insulation: {
    name: 'Insulation',
    description: 'Insulation assemblies',
    subcategories: [
      { id: 'in-batt', name: 'Batt Insulation', unit: 'SF' },
      { id: 'in-spray', name: 'Spray Foam', unit: 'SF' },
      { id: 'in-blown', name: 'Blown-In', unit: 'SF' },
    ],
  },
  windows_doors: {
    name: 'Windows & Doors',
    description: 'Window and door packages',
    subcategories: [
      { id: 'wd-win-std', name: 'Standard Window', unit: 'EA' },
      { id: 'wd-win-lrg', name: 'Large Window', unit: 'EA' },
      { id: 'wd-ext-door', name: 'Exterior Door', unit: 'EA' },
      { id: 'wd-int-door', name: 'Interior Door', unit: 'EA' },
      { id: 'wd-patio', name: 'Patio/Sliding Door', unit: 'EA' },
      { id: 'wd-garage', name: 'Garage Door', unit: 'EA' },
    ],
  },
  trim: {
    name: 'Trim & Millwork',
    description: 'Trim and millwork packages',
    subcategories: [
      { id: 'tr-base', name: 'Baseboard', unit: 'LF' },
      { id: 'tr-crown', name: 'Crown Molding', unit: 'LF' },
      { id: 'tr-casing', name: 'Door/Window Casing', unit: 'EA' },
    ],
  },
  cabinets: {
    name: 'Cabinets & Counters',
    description: 'Cabinet and countertop packages',
    subcategories: [
      { id: 'cb-base', name: 'Base Cabinet', unit: 'LF' },
      { id: 'cb-upper', name: 'Upper Cabinet', unit: 'LF' },
      { id: 'cb-counter', name: 'Countertop', unit: 'LF' },
      { id: 'cb-island', name: 'Island', unit: 'EA' },
    ],
  },
  paint: {
    name: 'Paint & Finishes',
    description: 'Painting and finishing',
    subcategories: [
      { id: 'pt-wall', name: 'Wall Paint', unit: 'SF' },
      { id: 'pt-ceil', name: 'Ceiling Paint', unit: 'SF' },
      { id: 'pt-trim', name: 'Trim Paint', unit: 'LF' },
      { id: 'pt-cabinet', name: 'Cabinet Paint', unit: 'EA' },
    ],
  },
};

export default ASSEMBLY_CATEGORIES;
