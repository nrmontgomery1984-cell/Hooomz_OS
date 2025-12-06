/**
 * Estimate Builder Helpers
 *
 * Pricing logic, tier calculations, and estimate generation
 * from intake data.
 *
 * Line items are structured for filtering by:
 * - room: which room/area (kitchen, primary_bath, etc.)
 * - tradeCode: which trade (EL, PL, CM, etc.) - maps to SCOPE_CATEGORIES
 * - category: display grouping (derived from trade or room)
 */

/**
 * Build tiers with pricing multipliers
 */
export const BUILD_TIERS = {
  good: {
    id: 'good',
    label: 'Good',
    description: 'Quality materials, standard finishes',
    multiplier: 1.0,
    color: 'blue',
  },
  better: {
    id: 'better',
    label: 'Better',
    description: 'Upgraded materials, enhanced finishes',
    multiplier: 1.25,
    color: 'indigo',
  },
  best: {
    id: 'best',
    label: 'Best',
    description: 'Premium materials, custom finishes',
    multiplier: 1.55,
    color: 'purple',
  },
};

/**
 * Renovation tiers
 */
export const RENO_TIERS = {
  refresh: {
    id: 'refresh',
    label: 'Refresh',
    description: 'Cosmetic updates, fixtures only',
    multiplier: 0.35,
  },
  full: {
    id: 'full',
    label: 'Full',
    description: 'Complete renovation',
    multiplier: 1.0,
  },
};

/**
 * Base pricing per square foot by project type (Good tier)
 */
export const BASE_PRICING = {
  new_construction: {
    base_psf: 225, // Base price per sqft
    basement_finished_psf: 85,
    basement_unfinished_psf: 35,
    garage_attached_psf: 65,
    garage_detached_psf: 85,
  },
  renovation: {
    // Per-room base pricing (Good tier, full reno)
    kitchen: { base: 35000, perSqft: 150 },
    primary_bath: { base: 22000, perSqft: 400 },
    secondary_bath: { base: 12000, perSqft: 350 },
    powder_room: { base: 6000, perSqft: 300 },
    basement: { base: 25000, perSqft: 45 },
    laundry: { base: 5000, perSqft: 150 },
    living_room: { base: 8000, perSqft: 35 },
    bedroom: { base: 4000, perSqft: 30 },
    bedrooms: { base: 4000, perSqft: 30 }, // Alias for intake schema compatibility
    dining_room: { base: 6000, perSqft: 40 },
    home_office: { base: 5000, perSqft: 45 },
    mudroom: { base: 4000, perSqft: 100 },
    garage: { base: 3000, perSqft: 25 },
    exterior: { base: 15000, perSqft: 0 },
    windows_doors: { base: 8000, perSqft: 0 },
    roofing: { base: 12000, perSqft: 0 },
    addition: { base: 50000, perSqft: 200 },
  },
};

/**
 * Room templates - breakdown by trade for each room type
 * Each room generates multiple line items by trade
 * Percentages show how the room budget is allocated
 *
 * tradeCode maps to SCOPE_CATEGORIES (EL, PL, CM, etc.)
 */
export const ROOM_TRADE_BREAKDOWN = {
  kitchen: {
    label: 'Kitchen',
    trades: [
      { tradeCode: 'DM', name: 'Demo & Prep', percent: 0.05 },
      { tradeCode: 'EL', name: 'Electrical', percent: 0.12 },
      { tradeCode: 'PL', name: 'Plumbing', percent: 0.10 },
      { tradeCode: 'DW', name: 'Drywall & Patching', percent: 0.05 },
      { tradeCode: 'CM', name: 'Cabinets', percent: 0.30 },
      { tradeCode: 'CM', name: 'Countertops', percent: 0.15, subCode: 'CM-03' },
      { tradeCode: 'TL', name: 'Backsplash Tile', percent: 0.05 },
      { tradeCode: 'FL', name: 'Flooring', percent: 0.08 },
      { tradeCode: 'PT', name: 'Painting', percent: 0.05 },
      { tradeCode: 'GN', name: 'Fixtures & Appliance Install', percent: 0.05 },
    ],
  },
  primary_bath: {
    label: 'Primary Bathroom',
    trades: [
      { tradeCode: 'DM', name: 'Demo & Prep', percent: 0.08 },
      { tradeCode: 'PL', name: 'Plumbing Rough & Finish', percent: 0.20 },
      { tradeCode: 'EL', name: 'Electrical', percent: 0.10 },
      { tradeCode: 'DW', name: 'Drywall & Backer', percent: 0.08 },
      { tradeCode: 'TL', name: 'Tile - Shower/Tub', percent: 0.18 },
      { tradeCode: 'TL', name: 'Tile - Floor', percent: 0.08, subCode: 'TL-03' },
      { tradeCode: 'CM', name: 'Vanity & Top', percent: 0.12 },
      { tradeCode: 'PT', name: 'Painting', percent: 0.04 },
      { tradeCode: 'GN', name: 'Fixtures & Accessories', percent: 0.12 },
    ],
  },
  secondary_bath: {
    label: 'Secondary Bathroom',
    trades: [
      { tradeCode: 'DM', name: 'Demo & Prep', percent: 0.08 },
      { tradeCode: 'PL', name: 'Plumbing Rough & Finish', percent: 0.22 },
      { tradeCode: 'EL', name: 'Electrical', percent: 0.10 },
      { tradeCode: 'DW', name: 'Drywall & Backer', percent: 0.08 },
      { tradeCode: 'TL', name: 'Tile - Tub Surround', percent: 0.15 },
      { tradeCode: 'TL', name: 'Tile - Floor', percent: 0.08, subCode: 'TL-03' },
      { tradeCode: 'CM', name: 'Vanity & Top', percent: 0.12 },
      { tradeCode: 'PT', name: 'Painting', percent: 0.05 },
      { tradeCode: 'GN', name: 'Fixtures & Accessories', percent: 0.12 },
    ],
  },
  powder_room: {
    label: 'Powder Room',
    trades: [
      { tradeCode: 'DM', name: 'Demo & Prep', percent: 0.08 },
      { tradeCode: 'PL', name: 'Plumbing', percent: 0.25 },
      { tradeCode: 'EL', name: 'Electrical', percent: 0.12 },
      { tradeCode: 'DW', name: 'Drywall', percent: 0.10 },
      { tradeCode: 'FL', name: 'Flooring', percent: 0.12 },
      { tradeCode: 'CM', name: 'Vanity & Top', percent: 0.15 },
      { tradeCode: 'PT', name: 'Painting', percent: 0.08 },
      { tradeCode: 'GN', name: 'Fixtures & Accessories', percent: 0.10 },
    ],
  },
  basement: {
    label: 'Basement',
    trades: [
      { tradeCode: 'FI', name: 'Framing', percent: 0.20 },
      { tradeCode: 'EL', name: 'Electrical Rough & Finish', percent: 0.15 },
      { tradeCode: 'PL', name: 'Plumbing (if bath)', percent: 0.10 },
      { tradeCode: 'HV', name: 'HVAC Extension', percent: 0.10 },
      { tradeCode: 'IA', name: 'Insulation', percent: 0.08 },
      { tradeCode: 'DW', name: 'Drywall', percent: 0.15 },
      { tradeCode: 'FL', name: 'Flooring', percent: 0.10 },
      { tradeCode: 'PT', name: 'Painting', percent: 0.07 },
      { tradeCode: 'FC', name: 'Trim & Doors', percent: 0.05 },
    ],
  },
  living_room: {
    label: 'Living Room',
    trades: [
      { tradeCode: 'DM', name: 'Demo & Prep', percent: 0.05 },
      { tradeCode: 'EL', name: 'Electrical', percent: 0.15 },
      { tradeCode: 'DW', name: 'Drywall & Repairs', percent: 0.15 },
      { tradeCode: 'FL', name: 'Flooring', percent: 0.35 },
      { tradeCode: 'PT', name: 'Painting', percent: 0.15 },
      { tradeCode: 'FC', name: 'Trim & Molding', percent: 0.15 },
    ],
  },
  bedrooms: {
    label: 'Bedrooms',
    trades: [
      { tradeCode: 'DM', name: 'Demo & Prep', percent: 0.05 },
      { tradeCode: 'EL', name: 'Electrical', percent: 0.15 },
      { tradeCode: 'DW', name: 'Drywall & Repairs', percent: 0.15 },
      { tradeCode: 'FL', name: 'Flooring', percent: 0.30 },
      { tradeCode: 'PT', name: 'Painting', percent: 0.20 },
      { tradeCode: 'FC', name: 'Trim & Closet', percent: 0.15 },
    ],
  },
  dining_room: {
    label: 'Dining Room',
    trades: [
      { tradeCode: 'DM', name: 'Demo & Prep', percent: 0.05 },
      { tradeCode: 'EL', name: 'Electrical', percent: 0.15 },
      { tradeCode: 'DW', name: 'Drywall & Repairs', percent: 0.15 },
      { tradeCode: 'FL', name: 'Flooring', percent: 0.35 },
      { tradeCode: 'PT', name: 'Painting', percent: 0.15 },
      { tradeCode: 'FC', name: 'Trim & Molding', percent: 0.15 },
    ],
  },
  laundry: {
    label: 'Laundry Room',
    trades: [
      { tradeCode: 'DM', name: 'Demo & Prep', percent: 0.08 },
      { tradeCode: 'PL', name: 'Plumbing', percent: 0.25 },
      { tradeCode: 'EL', name: 'Electrical', percent: 0.15 },
      { tradeCode: 'DW', name: 'Drywall', percent: 0.10 },
      { tradeCode: 'FL', name: 'Flooring', percent: 0.15 },
      { tradeCode: 'CM', name: 'Cabinets/Shelving', percent: 0.12 },
      { tradeCode: 'PT', name: 'Painting', percent: 0.08 },
      { tradeCode: 'GN', name: 'Fixtures', percent: 0.07 },
    ],
  },
  mudroom: {
    label: 'Mudroom/Entry',
    trades: [
      { tradeCode: 'DM', name: 'Demo & Prep', percent: 0.08 },
      { tradeCode: 'EL', name: 'Electrical', percent: 0.12 },
      { tradeCode: 'DW', name: 'Drywall', percent: 0.12 },
      { tradeCode: 'FL', name: 'Flooring', percent: 0.25 },
      { tradeCode: 'FC', name: 'Built-ins & Hooks', percent: 0.20 },
      { tradeCode: 'PT', name: 'Painting', percent: 0.12 },
      { tradeCode: 'TL', name: 'Tile (if applicable)', percent: 0.11 },
    ],
  },
  home_office: {
    label: 'Home Office',
    trades: [
      { tradeCode: 'DM', name: 'Demo & Prep', percent: 0.05 },
      { tradeCode: 'EL', name: 'Electrical & Data', percent: 0.20 },
      { tradeCode: 'DW', name: 'Drywall', percent: 0.12 },
      { tradeCode: 'FL', name: 'Flooring', percent: 0.25 },
      { tradeCode: 'FC', name: 'Built-ins & Shelving', percent: 0.18 },
      { tradeCode: 'PT', name: 'Painting', percent: 0.12 },
      { tradeCode: 'GN', name: 'Fixtures & Lighting', percent: 0.08 },
    ],
  },
  garage: {
    label: 'Garage',
    trades: [
      { tradeCode: 'DM', name: 'Demo & Prep', percent: 0.10 },
      { tradeCode: 'EL', name: 'Electrical', percent: 0.25 },
      { tradeCode: 'DW', name: 'Drywall (if finishing)', percent: 0.20 },
      { tradeCode: 'FL', name: 'Floor Coating', percent: 0.25 },
      { tradeCode: 'GN', name: 'Storage Systems', percent: 0.20 },
    ],
  },
  exterior: {
    label: 'Exterior/Siding',
    trades: [
      { tradeCode: 'DM', name: 'Demo & Prep', percent: 0.10 },
      { tradeCode: 'EE', name: 'Siding Install', percent: 0.50 },
      { tradeCode: 'EE', name: 'Trim & Fascia', percent: 0.20, subCode: 'EE-03' },
      { tradeCode: 'PT', name: 'Painting/Staining', percent: 0.15 },
      { tradeCode: 'GN', name: 'Cleanup', percent: 0.05 },
    ],
  },
  windows_doors: {
    label: 'Windows & Doors',
    trades: [
      { tradeCode: 'DM', name: 'Demo & Removal', percent: 0.10 },
      { tradeCode: 'EE', name: 'Window Installation', percent: 0.45 },
      { tradeCode: 'EE', name: 'Door Installation', percent: 0.25, subCode: 'EE-02' },
      { tradeCode: 'FC', name: 'Trim & Casing', percent: 0.15 },
      { tradeCode: 'PT', name: 'Touch-up Painting', percent: 0.05 },
    ],
  },
  roofing: {
    label: 'Roofing',
    trades: [
      { tradeCode: 'DM', name: 'Tear-off', percent: 0.15 },
      { tradeCode: 'RF', name: 'Decking Repairs', percent: 0.10, subCode: 'RF-01' },
      { tradeCode: 'RF', name: 'Underlayment', percent: 0.10, subCode: 'RF-02' },
      { tradeCode: 'RF', name: 'Shingles/Roofing', percent: 0.45, subCode: 'RF-03' },
      { tradeCode: 'RF', name: 'Flashing & Vents', percent: 0.15, subCode: 'RF-04' },
      { tradeCode: 'GN', name: 'Cleanup & Haul', percent: 0.05 },
    ],
  },
  addition: {
    label: 'Addition',
    trades: [
      { tradeCode: 'SW', name: 'Site Work & Foundation', percent: 0.15 },
      { tradeCode: 'FS', name: 'Framing', percent: 0.20 },
      { tradeCode: 'RF', name: 'Roofing', percent: 0.08 },
      { tradeCode: 'EE', name: 'Exterior Envelope', percent: 0.10 },
      { tradeCode: 'EL', name: 'Electrical', percent: 0.10 },
      { tradeCode: 'PL', name: 'Plumbing', percent: 0.07 },
      { tradeCode: 'HV', name: 'HVAC', percent: 0.07 },
      { tradeCode: 'IA', name: 'Insulation', percent: 0.05 },
      { tradeCode: 'DW', name: 'Drywall', percent: 0.08 },
      { tradeCode: 'FL', name: 'Flooring', percent: 0.05 },
      { tradeCode: 'PT', name: 'Painting', percent: 0.05 },
    ],
  },
};

/**
 * Trade code to display name mapping
 */
export const TRADE_NAMES = {
  DM: 'Demo',
  SW: 'Site Work',
  FN: 'Foundation',
  FR: 'Framing',
  FS: 'Framing - Structural',
  FI: 'Framing - Interior',
  RF: 'Roofing',
  EE: 'Exterior Envelope',
  IA: 'Insulation',
  EL: 'Electrical',
  PL: 'Plumbing',
  HV: 'HVAC',
  DW: 'Drywall',
  PT: 'Painting',
  FL: 'Flooring',
  TL: 'Tile',
  FC: 'Finish Carpentry',
  CM: 'Cabinetry & Millwork',
  SR: 'Stairs & Railings',
  EF: 'Exterior Finishes',
  GN: 'General',
  FZ: 'Final Completion',
};

/**
 * Selection upgrades - additional costs for specific selections
 */
export const SELECTION_PRICING = {
  // Exterior
  siding_type: {
    vinyl: 0,
    fiber_cement: 8000,
    cedar: 15000,
    brick: 25000,
    stone: 35000,
  },
  roof_material: {
    asphalt: 0,
    architectural: 3500,
    metal: 12000,
    slate: 35000,
  },
  window_frame: {
    vinyl: 0,
    fiberglass: 4500,
    wood: 12000,
    aluminum_clad: 8000,
  },

  // Kitchen
  cabinet_construction: {
    stock: 0,
    semi_custom: 8000,
    custom: 25000,
  },
  countertop: {
    laminate: 0,
    butcher_block: 2500,
    granite: 5000,
    quartz: 7500,
    marble: 15000,
  },
  backsplash: {
    none: 0,
    partial: 1200,
    full: 3500,
  },

  // Bathrooms
  primary_shower: {
    prefab: 0,
    tile_tub_shower: 3500,
    walk_in_tile: 8000,
    custom_tile: 15000,
  },
  vanity_type: {
    stock: 0,
    semi_custom: 2500,
    custom: 8000,
  },
  vanity_top: {
    laminate: 0,
    cultured_marble: 800,
    granite: 1500,
    quartz: 2000,
  },

  // Mechanical
  hvac_system: {
    baseboard: 0,
    forced_air: 5000,
    ducted_heat_pump: 12000,
    geothermal: 35000,
  },
  water_heater: {
    electric_tank: 0,
    gas_tank: 800,
    tankless: 2500,
    heat_pump: 3500,
  },
};

/**
 * Square footage ranges mapped to averages
 */
export const SQFT_RANGES = {
  'under_1200': 1000,
  '1200_1600': 1400,
  '1600_2000': 1800,
  '2000_2400': 2200,
  '2400_3000': 2700,
  'over_3000': 3500,
};

/**
 * New Construction Trade Breakdown - Detailed
 * Each phase broken down into granular line items with labor/materials split
 * Percentage of total construction cost by phase/trade
 * Based on typical 2-storey home construction
 */
export const NEW_CONSTRUCTION_BREAKDOWN = {
  site_foundation: {
    label: 'Site & Foundation',
    percent: 0.12,
    trades: [
      // Site Work
      { tradeCode: 'SW', name: 'Survey & Layout', percent: 0.03, type: 'labor' },
      { tradeCode: 'SW', name: 'Tree Removal & Clearing', percent: 0.04, type: 'labor' },
      { tradeCode: 'SW', name: 'Stump Grinding & Disposal', percent: 0.02, type: 'labor' },
      { tradeCode: 'SW', name: 'Excavation - Equipment', percent: 0.08, type: 'equipment' },
      { tradeCode: 'SW', name: 'Excavation - Labor', percent: 0.06, type: 'labor' },
      { tradeCode: 'SW', name: 'Gravel/Stone Base Material', percent: 0.04, type: 'material' },
      // Foundation
      { tradeCode: 'FN', name: 'Footing Forms - Labor', percent: 0.04, type: 'labor' },
      { tradeCode: 'FN', name: 'Footing Rebar & Wire Mesh', percent: 0.03, type: 'material' },
      { tradeCode: 'FN', name: 'Footing Concrete', percent: 0.06, type: 'material' },
      { tradeCode: 'FN', name: 'Foundation Wall Forms - Rental', percent: 0.05, type: 'equipment' },
      { tradeCode: 'FN', name: 'Foundation Wall Concrete', percent: 0.12, type: 'material' },
      { tradeCode: 'FN', name: 'Foundation Wall Labor', percent: 0.08, type: 'labor' },
      { tradeCode: 'FN', name: 'Anchor Bolts & Ties', percent: 0.02, type: 'material' },
      { tradeCode: 'FN', name: 'Waterproofing Membrane', percent: 0.04, type: 'material' },
      { tradeCode: 'FN', name: 'Drain Tile & Gravel', percent: 0.04, type: 'material' },
      { tradeCode: 'FN', name: 'Waterproofing Labor', percent: 0.03, type: 'labor' },
      { tradeCode: 'SW', name: 'Backfill - Equipment', percent: 0.04, type: 'equipment' },
      { tradeCode: 'SW', name: 'Rough Grade - Labor', percent: 0.03, type: 'labor' },
      { tradeCode: 'FN', name: 'Slab Vapor Barrier', percent: 0.02, type: 'material' },
      { tradeCode: 'FN', name: 'Basement Slab Concrete', percent: 0.08, type: 'material' },
      { tradeCode: 'FN', name: 'Slab Finishing Labor', percent: 0.05, type: 'labor' },
    ],
  },
  framing: {
    label: 'Framing',
    percent: 0.15,
    trades: [
      // Floor System
      { tradeCode: 'FS', name: 'Sill Plate & Gasket', percent: 0.02, type: 'material' },
      { tradeCode: 'FS', name: 'Floor Joists (I-Joist/TJI)', percent: 0.06, type: 'material' },
      { tradeCode: 'FS', name: 'Rim Board/Band Joist', percent: 0.02, type: 'material' },
      { tradeCode: 'FS', name: 'Subfloor Sheathing (3/4" T&G)', percent: 0.04, type: 'material' },
      { tradeCode: 'FS', name: 'Floor System Labor', percent: 0.06, type: 'labor' },
      // Wall Framing
      { tradeCode: 'FS', name: 'Wall Studs (2x6)', percent: 0.08, type: 'material' },
      { tradeCode: 'FS', name: 'Headers & Beams (LVL)', percent: 0.04, type: 'material' },
      { tradeCode: 'FS', name: 'Wall Plates & Blocking', percent: 0.03, type: 'material' },
      { tradeCode: 'FS', name: 'Wall Framing Labor - Main Floor', percent: 0.08, type: 'labor' },
      { tradeCode: 'FS', name: 'Wall Framing Labor - Second Floor', percent: 0.07, type: 'labor' },
      // Roof
      { tradeCode: 'FS', name: 'Roof Trusses', percent: 0.10, type: 'material' },
      { tradeCode: 'FS', name: 'Truss Delivery & Crane', percent: 0.03, type: 'equipment' },
      { tradeCode: 'FS', name: 'Truss Setting Labor', percent: 0.05, type: 'labor' },
      { tradeCode: 'FS', name: 'Roof Sheathing (7/16" OSB)', percent: 0.05, type: 'material' },
      { tradeCode: 'FS', name: 'Roof Sheathing Labor', percent: 0.04, type: 'labor' },
      // Sheathing & Wrap
      { tradeCode: 'FS', name: 'Wall Sheathing (7/16" OSB)', percent: 0.05, type: 'material' },
      { tradeCode: 'FS', name: 'House Wrap (Tyvek/Similar)', percent: 0.02, type: 'material' },
      { tradeCode: 'FS', name: 'Wall Sheathing & Wrap Labor', percent: 0.04, type: 'labor' },
      { tradeCode: 'FS', name: 'Framing Hardware (Hangers, Ties)', percent: 0.03, type: 'material' },
      { tradeCode: 'FS', name: 'Nails, Screws, Fasteners', percent: 0.02, type: 'material' },
      { tradeCode: 'FS', name: 'Scaffolding Rental', percent: 0.02, type: 'equipment' },
    ],
  },
  roofing: {
    label: 'Roofing',
    percent: 0.04,
    trades: [
      { tradeCode: 'RF', name: 'Ice & Water Shield', percent: 0.08, type: 'material' },
      { tradeCode: 'RF', name: 'Synthetic Underlayment', percent: 0.06, type: 'material' },
      { tradeCode: 'RF', name: 'Drip Edge & Starter Strip', percent: 0.04, type: 'material' },
      { tradeCode: 'RF', name: 'Asphalt Shingles (Architectural)', percent: 0.28, type: 'material' },
      { tradeCode: 'RF', name: 'Ridge Cap Shingles', percent: 0.04, type: 'material' },
      { tradeCode: 'RF', name: 'Roofing Labor', percent: 0.22, type: 'labor' },
      { tradeCode: 'RF', name: 'Roof Vents (Ridge & Soffit)', percent: 0.05, type: 'material' },
      { tradeCode: 'RF', name: 'Plumbing & Exhaust Boots', percent: 0.03, type: 'material' },
      { tradeCode: 'RF', name: 'Step Flashing & Valley Metal', percent: 0.04, type: 'material' },
      { tradeCode: 'RF', name: 'Aluminum Soffit Panels', percent: 0.06, type: 'material' },
      { tradeCode: 'RF', name: 'Aluminum Fascia', percent: 0.04, type: 'material' },
      { tradeCode: 'RF', name: 'Soffit & Fascia Labor', percent: 0.06, type: 'labor' },
    ],
  },
  exterior: {
    label: 'Exterior Envelope',
    percent: 0.10,
    trades: [
      // Windows
      { tradeCode: 'EE', name: 'Windows - Vinyl Double-Hung', percent: 0.18, type: 'material' },
      { tradeCode: 'EE', name: 'Window Flashing & Tape', percent: 0.02, type: 'material' },
      { tradeCode: 'EE', name: 'Window Installation Labor', percent: 0.08, type: 'labor' },
      { tradeCode: 'EE', name: 'Window Trim (Exterior)', percent: 0.03, type: 'material' },
      // Doors
      { tradeCode: 'EE', name: 'Entry Door (Fiberglass)', percent: 0.05, type: 'material' },
      { tradeCode: 'EE', name: 'Sliding Patio Door', percent: 0.05, type: 'material' },
      { tradeCode: 'EE', name: 'Garage Service Door', percent: 0.02, type: 'material' },
      { tradeCode: 'EE', name: 'Door Installation Labor', percent: 0.04, type: 'labor' },
      // Siding
      { tradeCode: 'EE', name: 'Vinyl Siding', percent: 0.16, type: 'material' },
      { tradeCode: 'EE', name: 'J-Channel & Accessories', percent: 0.03, type: 'material' },
      { tradeCode: 'EE', name: 'Siding Installation Labor', percent: 0.12, type: 'labor' },
      // Trim
      { tradeCode: 'EE', name: 'Corner Boards & Trim', percent: 0.04, type: 'material' },
      { tradeCode: 'EE', name: 'Exterior Caulking', percent: 0.02, type: 'material' },
      { tradeCode: 'EE', name: 'Trim & Caulking Labor', percent: 0.04, type: 'labor' },
      { tradeCode: 'EE', name: 'Exterior Paint/Stain (Trim)', percent: 0.04, type: 'material' },
      { tradeCode: 'EE', name: 'Exterior Painting Labor', percent: 0.04, type: 'labor' },
      { tradeCode: 'EE', name: 'Scaffolding Rental', percent: 0.04, type: 'equipment' },
    ],
  },
  electrical: {
    label: 'Electrical',
    percent: 0.08,
    trades: [
      // Service
      { tradeCode: 'EL', name: '200A Panel & Breakers', percent: 0.08, type: 'material' },
      { tradeCode: 'EL', name: 'Meter Base & Service Cable', percent: 0.04, type: 'material' },
      { tradeCode: 'EL', name: 'Panel Installation Labor', percent: 0.05, type: 'labor' },
      // Rough Wiring
      { tradeCode: 'EL', name: 'Romex Wire (14/2, 12/2, 10/2)', percent: 0.10, type: 'material' },
      { tradeCode: 'EL', name: 'Electrical Boxes & Covers', percent: 0.04, type: 'material' },
      { tradeCode: 'EL', name: 'Wire Staples & Connectors', percent: 0.02, type: 'material' },
      { tradeCode: 'EL', name: 'Rough Wiring Labor - Main Floor', percent: 0.10, type: 'labor' },
      { tradeCode: 'EL', name: 'Rough Wiring Labor - Second Floor', percent: 0.08, type: 'labor' },
      { tradeCode: 'EL', name: 'Rough Wiring Labor - Basement', percent: 0.05, type: 'labor' },
      // Fixtures & Devices
      { tradeCode: 'EL', name: 'Receptacles & Switches', percent: 0.04, type: 'material' },
      { tradeCode: 'EL', name: 'Cover Plates', percent: 0.01, type: 'material' },
      { tradeCode: 'EL', name: 'Light Fixtures Allowance', percent: 0.08, type: 'material' },
      { tradeCode: 'EL', name: 'Recessed Light Cans', percent: 0.04, type: 'material' },
      { tradeCode: 'EL', name: 'Device & Fixture Install Labor', percent: 0.08, type: 'labor' },
      // Low Voltage
      { tradeCode: 'EL', name: 'CAT6 Cable & Jacks', percent: 0.03, type: 'material' },
      { tradeCode: 'EL', name: 'Coax Cable', percent: 0.02, type: 'material' },
      { tradeCode: 'EL', name: 'Smoke/CO Detectors', percent: 0.02, type: 'material' },
      { tradeCode: 'EL', name: 'Low Voltage Labor', percent: 0.04, type: 'labor' },
      { tradeCode: 'EL', name: 'Permit & Inspections', percent: 0.04, type: 'permit' },
      { tradeCode: 'EL', name: 'GFI/AFCI Breakers', percent: 0.04, type: 'material' },
    ],
  },
  plumbing: {
    label: 'Plumbing',
    percent: 0.08,
    trades: [
      // Underground & Rough-in
      { tradeCode: 'PL', name: 'Drain Waste Vent (DWV) Pipe', percent: 0.08, type: 'material' },
      { tradeCode: 'PL', name: 'PEX Supply Piping', percent: 0.06, type: 'material' },
      { tradeCode: 'PL', name: 'Fittings & Connectors', percent: 0.04, type: 'material' },
      { tradeCode: 'PL', name: 'Rough-in Labor - Kitchen', percent: 0.06, type: 'labor' },
      { tradeCode: 'PL', name: 'Rough-in Labor - Primary Bath', percent: 0.06, type: 'labor' },
      { tradeCode: 'PL', name: 'Rough-in Labor - Secondary Bath', percent: 0.05, type: 'labor' },
      { tradeCode: 'PL', name: 'Rough-in Labor - Powder Room', percent: 0.03, type: 'labor' },
      { tradeCode: 'PL', name: 'Rough-in Labor - Laundry', percent: 0.03, type: 'labor' },
      // Water Supply
      { tradeCode: 'PL', name: 'Main Water Line', percent: 0.04, type: 'material' },
      { tradeCode: 'PL', name: 'Shut-off Valves', percent: 0.02, type: 'material' },
      { tradeCode: 'PL', name: 'Pressure Regulator', percent: 0.01, type: 'material' },
      { tradeCode: 'PL', name: 'Hose Bibs (2)', percent: 0.02, type: 'material' },
      { tradeCode: 'PL', name: 'Water Supply Install Labor', percent: 0.05, type: 'labor' },
      // Fixtures
      { tradeCode: 'PL', name: 'Kitchen Sink', percent: 0.03, type: 'material' },
      { tradeCode: 'PL', name: 'Kitchen Faucet', percent: 0.02, type: 'material' },
      { tradeCode: 'PL', name: 'Toilets (3)', percent: 0.04, type: 'material' },
      { tradeCode: 'PL', name: 'Bathroom Faucets', percent: 0.03, type: 'material' },
      { tradeCode: 'PL', name: 'Shower Valves & Trim', percent: 0.04, type: 'material' },
      { tradeCode: 'PL', name: 'Laundry Box', percent: 0.01, type: 'material' },
      { tradeCode: 'PL', name: 'Fixture Installation Labor', percent: 0.10, type: 'labor' },
      { tradeCode: 'PL', name: 'Water Heater (50 gal)', percent: 0.06, type: 'material' },
      { tradeCode: 'PL', name: 'Water Heater Install', percent: 0.03, type: 'labor' },
      { tradeCode: 'PL', name: 'Permit & Inspections', percent: 0.04, type: 'permit' },
      { tradeCode: 'PL', name: 'Testing & Commissioning', percent: 0.02, type: 'labor' },
    ],
  },
  hvac: {
    label: 'HVAC',
    percent: 0.07,
    trades: [
      // Equipment
      { tradeCode: 'HV', name: 'Furnace (95% Efficient)', percent: 0.14, type: 'material' },
      { tradeCode: 'HV', name: 'Air Conditioner (3 ton)', percent: 0.12, type: 'material' },
      { tradeCode: 'HV', name: 'Thermostat (Programmable)', percent: 0.02, type: 'material' },
      { tradeCode: 'HV', name: 'Equipment Install Labor', percent: 0.08, type: 'labor' },
      // Ductwork
      { tradeCode: 'HV', name: 'Trunk Line Duct', percent: 0.06, type: 'material' },
      { tradeCode: 'HV', name: 'Branch Runs & Flex Duct', percent: 0.06, type: 'material' },
      { tradeCode: 'HV', name: 'Registers & Grilles', percent: 0.04, type: 'material' },
      { tradeCode: 'HV', name: 'Return Air Grilles & Filters', percent: 0.02, type: 'material' },
      { tradeCode: 'HV', name: 'Duct Installation Labor', percent: 0.12, type: 'labor' },
      { tradeCode: 'HV', name: 'Duct Sealing (Mastic/Tape)', percent: 0.02, type: 'material' },
      // Venting & Controls
      { tradeCode: 'HV', name: 'Flue Pipe & Termination', percent: 0.03, type: 'material' },
      { tradeCode: 'HV', name: 'Condensate Drain & Pump', percent: 0.02, type: 'material' },
      { tradeCode: 'HV', name: 'Gas Line (to Furnace)', percent: 0.03, type: 'material' },
      { tradeCode: 'HV', name: 'HRV/ERV Unit', percent: 0.06, type: 'material' },
      { tradeCode: 'HV', name: 'Venting Install Labor', percent: 0.04, type: 'labor' },
      // Balancing
      { tradeCode: 'HV', name: 'System Start-up', percent: 0.02, type: 'labor' },
      { tradeCode: 'HV', name: 'Air Balancing', percent: 0.03, type: 'labor' },
      { tradeCode: 'HV', name: 'Permit & Inspections', percent: 0.04, type: 'permit' },
      { tradeCode: 'HV', name: 'Bathroom Exhaust Fans (3)', percent: 0.03, type: 'material' },
      { tradeCode: 'HV', name: 'Range Hood Vent', percent: 0.02, type: 'material' },
    ],
  },
  insulation_drywall: {
    label: 'Insulation & Drywall',
    percent: 0.08,
    trades: [
      // Wall Insulation
      { tradeCode: 'IA', name: 'Batt Insulation R-22 Walls', percent: 0.12, type: 'material' },
      { tradeCode: 'IA', name: 'Wall Insulation Labor', percent: 0.08, type: 'labor' },
      { tradeCode: 'IA', name: 'Vapor Barrier (6 mil poly)', percent: 0.02, type: 'material' },
      // Attic Insulation
      { tradeCode: 'IA', name: 'Blown-in Attic R-60', percent: 0.08, type: 'material' },
      { tradeCode: 'IA', name: 'Attic Insulation Labor', percent: 0.04, type: 'labor' },
      { tradeCode: 'IA', name: 'Attic Baffles', percent: 0.01, type: 'material' },
      // Drywall
      { tradeCode: 'DW', name: 'Drywall Sheets (1/2" & 5/8")', percent: 0.14, type: 'material' },
      { tradeCode: 'DW', name: 'Drywall Screws & Corner Bead', percent: 0.02, type: 'material' },
      { tradeCode: 'DW', name: 'Drywall Hanging Labor', percent: 0.14, type: 'labor' },
      { tradeCode: 'DW', name: 'Joint Compound & Tape', percent: 0.04, type: 'material' },
      { tradeCode: 'DW', name: 'Taping & Mudding Labor', percent: 0.12, type: 'labor' },
      { tradeCode: 'DW', name: 'Sanding Labor', percent: 0.05, type: 'labor' },
      { tradeCode: 'DW', name: 'Touch-up & Repair', percent: 0.02, type: 'labor' },
      { tradeCode: 'IA', name: 'Rim Joist Spray Foam', percent: 0.04, type: 'material' },
      { tradeCode: 'IA', name: 'Spray Foam Labor', percent: 0.04, type: 'labor' },
      { tradeCode: 'IA', name: 'Acoustical Sealant', percent: 0.02, type: 'material' },
      { tradeCode: 'DW', name: 'Ceiling Texture (if applicable)', percent: 0.02, type: 'labor' },
    ],
  },
  interior_finishes: {
    label: 'Interior Finishes',
    percent: 0.12,
    trades: [
      // Doors
      { tradeCode: 'FC', name: 'Interior Doors (Prehung)', percent: 0.08, type: 'material' },
      { tradeCode: 'FC', name: 'Door Hardware (Hinges, Knobs)', percent: 0.03, type: 'material' },
      { tradeCode: 'FC', name: 'Bi-fold Closet Doors', percent: 0.03, type: 'material' },
      { tradeCode: 'FC', name: 'Door Installation Labor', percent: 0.05, type: 'labor' },
      // Trim & Casing
      { tradeCode: 'FC', name: 'Door Casing', percent: 0.04, type: 'material' },
      { tradeCode: 'FC', name: 'Window Casing', percent: 0.03, type: 'material' },
      { tradeCode: 'FC', name: 'Baseboard', percent: 0.05, type: 'material' },
      { tradeCode: 'FC', name: 'Crown Molding (Main Areas)', percent: 0.03, type: 'material' },
      { tradeCode: 'FC', name: 'Trim Installation Labor', percent: 0.08, type: 'labor' },
      // Closets
      { tradeCode: 'FC', name: 'Closet Shelving & Rods', percent: 0.04, type: 'material' },
      { tradeCode: 'FC', name: 'Closet Install Labor', percent: 0.02, type: 'labor' },
      // Flooring - Main Living
      { tradeCode: 'FL', name: 'LVP/Hardwood - Main Living', percent: 0.10, type: 'material' },
      { tradeCode: 'FL', name: 'Underlayment', percent: 0.02, type: 'material' },
      { tradeCode: 'FL', name: 'Flooring Install Labor - Main', percent: 0.06, type: 'labor' },
      { tradeCode: 'FL', name: 'Transitions & Trim', percent: 0.02, type: 'material' },
      // Flooring - Bedrooms
      { tradeCode: 'FL', name: 'Carpet - Bedrooms', percent: 0.05, type: 'material' },
      { tradeCode: 'FL', name: 'Carpet Pad', percent: 0.02, type: 'material' },
      { tradeCode: 'FL', name: 'Carpet Install Labor', percent: 0.03, type: 'labor' },
      // Painting
      { tradeCode: 'PT', name: 'Primer', percent: 0.02, type: 'material' },
      { tradeCode: 'PT', name: 'Interior Paint', percent: 0.04, type: 'material' },
      { tradeCode: 'PT', name: 'Painting Labor - Walls/Ceilings', percent: 0.06, type: 'labor' },
      { tradeCode: 'PT', name: 'Painting Labor - Trim', percent: 0.04, type: 'labor' },
    ],
  },
  kitchen: {
    label: 'Kitchen',
    percent: 0.08,
    trades: [
      // Cabinets
      { tradeCode: 'CM', name: 'Base Cabinets', percent: 0.18, type: 'material' },
      { tradeCode: 'CM', name: 'Wall Cabinets', percent: 0.12, type: 'material' },
      { tradeCode: 'CM', name: 'Pantry Cabinet', percent: 0.05, type: 'material' },
      { tradeCode: 'CM', name: 'Cabinet Hardware (Pulls/Knobs)', percent: 0.02, type: 'material' },
      { tradeCode: 'CM', name: 'Cabinet Installation Labor', percent: 0.08, type: 'labor' },
      // Countertops
      { tradeCode: 'CM', name: 'Countertop (Quartz/Granite)', percent: 0.16, type: 'material' },
      { tradeCode: 'CM', name: 'Countertop Template & Install', percent: 0.06, type: 'labor' },
      { tradeCode: 'CM', name: 'Undermount Sink Cutout', percent: 0.02, type: 'labor' },
      // Backsplash
      { tradeCode: 'TL', name: 'Backsplash Tile', percent: 0.05, type: 'material' },
      { tradeCode: 'TL', name: 'Tile Adhesive & Grout', percent: 0.01, type: 'material' },
      { tradeCode: 'TL', name: 'Backsplash Install Labor', percent: 0.04, type: 'labor' },
      // Appliances
      { tradeCode: 'GN', name: 'Refrigerator Allowance', percent: 0.06, type: 'material' },
      { tradeCode: 'GN', name: 'Range/Oven Allowance', percent: 0.05, type: 'material' },
      { tradeCode: 'GN', name: 'Dishwasher', percent: 0.03, type: 'material' },
      { tradeCode: 'GN', name: 'Range Hood', percent: 0.02, type: 'material' },
      { tradeCode: 'GN', name: 'Microwave', percent: 0.02, type: 'material' },
      { tradeCode: 'GN', name: 'Appliance Delivery & Install', percent: 0.03, type: 'labor' },
    ],
  },
  bathrooms: {
    label: 'Bathrooms',
    percent: 0.06,
    trades: [
      // Primary Bath
      { tradeCode: 'CM', name: 'Primary Bath Vanity (60")', percent: 0.08, type: 'material' },
      { tradeCode: 'CM', name: 'Primary Bath Vanity Top', percent: 0.05, type: 'material' },
      { tradeCode: 'TL', name: 'Primary Bath Floor Tile', percent: 0.06, type: 'material' },
      { tradeCode: 'TL', name: 'Primary Shower Tile', percent: 0.10, type: 'material' },
      { tradeCode: 'TL', name: 'Primary Bath Tile Labor', percent: 0.08, type: 'labor' },
      { tradeCode: 'GN', name: 'Primary Shower Door', percent: 0.05, type: 'material' },
      { tradeCode: 'GN', name: 'Primary Bath Mirror', percent: 0.02, type: 'material' },
      { tradeCode: 'GN', name: 'Primary Bath Accessories', percent: 0.02, type: 'material' },
      // Secondary Bath
      { tradeCode: 'CM', name: 'Secondary Bath Vanity (36")', percent: 0.05, type: 'material' },
      { tradeCode: 'CM', name: 'Secondary Bath Vanity Top', percent: 0.03, type: 'material' },
      { tradeCode: 'TL', name: 'Secondary Bath Floor Tile', percent: 0.04, type: 'material' },
      { tradeCode: 'TL', name: 'Tub Surround Tile', percent: 0.06, type: 'material' },
      { tradeCode: 'TL', name: 'Secondary Bath Tile Labor', percent: 0.06, type: 'labor' },
      { tradeCode: 'GN', name: 'Bathtub (Acrylic)', percent: 0.04, type: 'material' },
      { tradeCode: 'GN', name: 'Secondary Bath Mirror', percent: 0.02, type: 'material' },
      { tradeCode: 'GN', name: 'Shower Curtain Rod', percent: 0.01, type: 'material' },
      // Powder Room
      { tradeCode: 'CM', name: 'Powder Room Vanity', percent: 0.04, type: 'material' },
      { tradeCode: 'TL', name: 'Powder Room Floor Tile', percent: 0.02, type: 'material' },
      { tradeCode: 'TL', name: 'Powder Room Tile Labor', percent: 0.02, type: 'labor' },
      { tradeCode: 'GN', name: 'Powder Room Mirror', percent: 0.02, type: 'material' },
      { tradeCode: 'GN', name: 'Towel Bars & Accessories', percent: 0.03, type: 'material' },
      { tradeCode: 'CM', name: 'Vanity Installation Labor', percent: 0.06, type: 'labor' },
      { tradeCode: 'GN', name: 'Shower Door Install Labor', percent: 0.04, type: 'labor' },
    ],
  },
  exterior_finishes: {
    label: 'Exterior Finishes',
    percent: 0.02,
    trades: [
      // Deck/Porch
      { tradeCode: 'EF', name: 'Deck Framing Lumber', percent: 0.10, type: 'material' },
      { tradeCode: 'EF', name: 'Composite Decking', percent: 0.15, type: 'material' },
      { tradeCode: 'EF', name: 'Deck Railing System', percent: 0.08, type: 'material' },
      { tradeCode: 'EF', name: 'Deck Hardware & Fasteners', percent: 0.03, type: 'material' },
      { tradeCode: 'EF', name: 'Deck Construction Labor', percent: 0.14, type: 'labor' },
      // Driveway
      { tradeCode: 'EF', name: 'Driveway Gravel Base', percent: 0.05, type: 'material' },
      { tradeCode: 'EF', name: 'Asphalt/Concrete Driveway', percent: 0.15, type: 'material' },
      { tradeCode: 'EF', name: 'Driveway Install Labor', percent: 0.08, type: 'labor' },
      { tradeCode: 'EF', name: 'Walkway Pavers/Concrete', percent: 0.04, type: 'material' },
      { tradeCode: 'EF', name: 'Walkway Install Labor', percent: 0.03, type: 'labor' },
      // Grading & Landscaping
      { tradeCode: 'EF', name: 'Final Grading - Equipment', percent: 0.04, type: 'equipment' },
      { tradeCode: 'EF', name: 'Topsoil & Spreading', percent: 0.04, type: 'material' },
      { tradeCode: 'EF', name: 'Seed/Sod Allowance', percent: 0.04, type: 'material' },
      { tradeCode: 'EF', name: 'Landscaping Labor', percent: 0.03, type: 'labor' },
    ],
  },
  permits_fees: {
    label: 'Permits & Fees',
    percent: 0.02,
    trades: [
      { tradeCode: 'GN', name: 'Building Permit', percent: 0.35, type: 'permit' },
      { tradeCode: 'GN', name: 'Electrical Permit', percent: 0.10, type: 'permit' },
      { tradeCode: 'GN', name: 'Plumbing Permit', percent: 0.10, type: 'permit' },
      { tradeCode: 'GN', name: 'HVAC Permit', percent: 0.08, type: 'permit' },
      { tradeCode: 'GN', name: 'Development Charges', percent: 0.15, type: 'permit' },
      { tradeCode: 'GN', name: 'Utility Connection Fees', percent: 0.12, type: 'permit' },
      { tradeCode: 'GN', name: 'Survey/Lot Staking', percent: 0.05, type: 'permit' },
      { tradeCode: 'GN', name: 'Final Inspections', percent: 0.05, type: 'permit' },
    ],
  },
  general_conditions: {
    label: 'General Conditions',
    percent: 0.02,
    trades: [
      { tradeCode: 'GN', name: 'Project Management', percent: 0.25, type: 'labor' },
      { tradeCode: 'GN', name: 'Site Supervision', percent: 0.20, type: 'labor' },
      { tradeCode: 'GN', name: 'Portable Toilet Rental', percent: 0.05, type: 'equipment' },
      { tradeCode: 'GN', name: 'Dumpster/Waste Removal', percent: 0.12, type: 'equipment' },
      { tradeCode: 'GN', name: 'Temporary Power', percent: 0.06, type: 'equipment' },
      { tradeCode: 'GN', name: 'Site Security', percent: 0.04, type: 'equipment' },
      { tradeCode: 'GN', name: 'Cleaning (Progress & Final)', percent: 0.10, type: 'labor' },
      { tradeCode: 'GN', name: 'Punch List & Touch-ups', percent: 0.08, type: 'labor' },
      { tradeCode: 'GN', name: 'Insurance & Bonding', percent: 0.06, type: 'overhead' },
      { tradeCode: 'GN', name: 'Small Tools & Consumables', percent: 0.04, type: 'material' },
    ],
  },
};

/**
 * Generate estimate line items from intake data or blank template
 */
export function generateEstimateFromIntake(project) {
  // Check if project has saved line items already
  if (project.estimate_line_items?.length > 0) {
    return {
      lineItems: project.estimate_line_items,
      projectType: project.intake_type || 'manual',
      selectedTier: project.build_tier || 'better',
      source: 'saved',
    };
  }

  const intake = project.intake_data || {};
  const hasIntakeData = intake.form_type || intake.project || intake.renovation || intake.layout;

  // No intake data - return blank template
  if (!hasIntakeData) {
    return generateBlankEstimate(project);
  }

  const isNewConstruction = project.intake_type === 'new_construction';

  if (isNewConstruction) {
    return generateNewConstructionEstimate(project, intake);
  } else {
    return generateRenovationEstimate(project, intake);
  }
}

/**
 * Generate a blank estimate template for manual entry
 */
function generateBlankEstimate(project) {
  const lineItems = [];

  // Add common starter categories with placeholder items
  const starterCategories = [
    { category: 'Labor', name: 'Labor', description: 'Project labor costs' },
    { category: 'Materials', name: 'Materials', description: 'Building materials' },
    { category: 'Subcontractors', name: 'Subcontractor Work', description: 'Subcontracted trades' },
  ];

  starterCategories.forEach((starter, index) => {
    lineItems.push({
      id: `starter-${index}`,
      category: starter.category,
      name: starter.name,
      description: starter.description,
      unit: 'lump',
      quantity: 1,
      unitPriceGood: 0,
      unitPriceBetter: 0,
      unitPriceBest: 0,
      source: 'template',
    });
  });

  return {
    lineItems,
    projectType: 'manual',
    selectedTier: project.build_tier || 'better',
    source: 'blank',
  };
}

/**
 * Generate new construction estimate with comprehensive trade breakdown
 *
 * Creates detailed line items for each construction phase, broken down by trade,
 * similar to how renovation estimates work but for new builds.
 */
function generateNewConstructionEstimate(project, intake) {
  const layout = intake.layout || {};
  const selections = intake.selections || {};
  const site = intake.site || {};

  // Get square footage
  const sqftRange = layout.sqft_range || '2000_2400';
  const baseSqft = SQFT_RANGES[sqftRange] || 2200;

  const lineItems = [];
  const pricing = BASE_PRICING.new_construction;

  // Calculate base project total (Good tier)
  let baseTotalGood = baseSqft * pricing.base_psf;

  // Add basement cost if applicable
  const basementFinish = layout.basement_finish || 'unfinished';
  const basementSqft = Math.round(baseSqft * 0.7);
  let basementCost = 0;
  if (site.foundation_type === 'full_basement') {
    const basementPsf = basementFinish === 'full'
      ? pricing.basement_finished_psf
      : basementFinish === 'partial'
        ? (pricing.basement_finished_psf + pricing.basement_unfinished_psf) / 2
        : pricing.basement_unfinished_psf;
    basementCost = basementSqft * basementPsf;
    baseTotalGood += basementCost;
  }

  // Add garage cost if applicable
  const garageSize = layout.garage_size || 'none';
  const garageType = layout.garage_type || 'attached';
  let garageCost = 0;
  let garageSqft = 0;
  if (garageSize !== 'none') {
    garageSqft = garageSize === 'single' ? 240 : garageSize === 'double' ? 480 : 720;
    const garagePsf = garageType === 'attached'
      ? pricing.garage_attached_psf
      : pricing.garage_detached_psf;
    garageCost = garageSqft * garagePsf;
    baseTotalGood += garageCost;
  }

  // Generate detailed line items from NEW_CONSTRUCTION_BREAKDOWN
  Object.entries(NEW_CONSTRUCTION_BREAKDOWN).forEach(([phaseId, phase]) => {
    const phaseTotal = Math.round(baseTotalGood * phase.percent);

    phase.trades.forEach((trade, index) => {
      const tradeAmount = Math.round(phaseTotal * trade.percent);

      lineItems.push({
        id: `${phaseId}-${trade.tradeCode}-${index}`,
        // Filtering fields
        phase: phaseId,
        phaseLabel: phase.label,
        tradeCode: trade.tradeCode,
        tradeName: TRADE_NAMES[trade.tradeCode] || trade.tradeCode,
        subCode: trade.subCode || null,
        costType: trade.type || 'material', // labor, material, equipment, permit, overhead
        // Display fields
        category: phase.label,
        name: trade.name,
        description: `${baseSqft} sqft build`,
        // Pricing
        unit: 'lump',
        quantity: 1,
        unitPriceGood: tradeAmount,
        unitPriceBetter: Math.round(tradeAmount * BUILD_TIERS.better.multiplier),
        unitPriceBest: Math.round(tradeAmount * BUILD_TIERS.best.multiplier),
        // Metadata
        source: 'intake',
        projectType: 'new_construction',
      });
    });
  });

  // Add basement as separate category if applicable
  if (site.foundation_type === 'full_basement' && basementCost > 0) {
    const basementTrades = basementFinish === 'full' ? [
      // Full finished basement - detailed breakdown
      { tradeCode: 'FN', name: 'Basement Wall Framing', percent: 0.08, type: 'material' },
      { tradeCode: 'FN', name: 'Basement Framing Labor', percent: 0.06, type: 'labor' },
      { tradeCode: 'IA', name: 'Basement Wall Insulation', percent: 0.06, type: 'material' },
      { tradeCode: 'IA', name: 'Insulation Labor', percent: 0.03, type: 'labor' },
      { tradeCode: 'DW', name: 'Basement Drywall Sheets', percent: 0.08, type: 'material' },
      { tradeCode: 'DW', name: 'Basement Drywall Hanging', percent: 0.06, type: 'labor' },
      { tradeCode: 'DW', name: 'Basement Taping & Finishing', percent: 0.05, type: 'labor' },
      { tradeCode: 'EL', name: 'Basement Electrical - Wire & Boxes', percent: 0.04, type: 'material' },
      { tradeCode: 'EL', name: 'Basement Electrical - Labor', percent: 0.06, type: 'labor' },
      { tradeCode: 'EL', name: 'Basement Light Fixtures', percent: 0.03, type: 'material' },
      { tradeCode: 'FL', name: 'Basement Flooring Material', percent: 0.08, type: 'material' },
      { tradeCode: 'FL', name: 'Basement Flooring Install', percent: 0.05, type: 'labor' },
      { tradeCode: 'PT', name: 'Basement Primer & Paint', percent: 0.03, type: 'material' },
      { tradeCode: 'PT', name: 'Basement Painting Labor', percent: 0.06, type: 'labor' },
      { tradeCode: 'FC', name: 'Basement Interior Doors', percent: 0.04, type: 'material' },
      { tradeCode: 'FC', name: 'Basement Trim & Casing', percent: 0.04, type: 'material' },
      { tradeCode: 'FC', name: 'Basement Trim Install Labor', percent: 0.05, type: 'labor' },
      { tradeCode: 'HV', name: 'Basement HVAC Ductwork', percent: 0.05, type: 'material' },
      { tradeCode: 'HV', name: 'Basement HVAC Labor', percent: 0.05, type: 'labor' },
    ] : [
      // Unfinished basement - basic breakdown
      { tradeCode: 'FN', name: 'Basement Foundation Walls', percent: 0.35, type: 'material' },
      { tradeCode: 'FN', name: 'Foundation Labor', percent: 0.20, type: 'labor' },
      { tradeCode: 'FN', name: 'Waterproofing Membrane', percent: 0.10, type: 'material' },
      { tradeCode: 'FN', name: 'Waterproofing Labor', percent: 0.05, type: 'labor' },
      { tradeCode: 'FN', name: 'Drain Tile & Gravel', percent: 0.10, type: 'material' },
      { tradeCode: 'FN', name: 'Basement Slab Concrete', percent: 0.12, type: 'material' },
      { tradeCode: 'FN', name: 'Slab Pour & Finish Labor', percent: 0.08, type: 'labor' },
    ];

    basementTrades.forEach((trade, index) => {
      const tradeAmount = Math.round(basementCost * trade.percent);
      lineItems.push({
        id: `basement-${trade.tradeCode}-${index}`,
        phase: 'basement',
        phaseLabel: 'Basement',
        tradeCode: trade.tradeCode,
        tradeName: TRADE_NAMES[trade.tradeCode] || trade.tradeCode,
        subCode: trade.subCode || null,
        costType: trade.type || 'material',
        category: `Basement (${basementFinish})`,
        name: trade.name,
        description: `${basementSqft} sqft basement`,
        unit: 'lump',
        quantity: 1,
        unitPriceGood: tradeAmount,
        unitPriceBetter: Math.round(tradeAmount * BUILD_TIERS.better.multiplier),
        unitPriceBest: Math.round(tradeAmount * BUILD_TIERS.best.multiplier),
        source: 'intake',
        projectType: 'new_construction',
      });
    });
  }

  // Add garage as separate category if applicable
  if (garageSize !== 'none' && garageCost > 0) {
    const garageTrades = [
      { tradeCode: 'FN', name: 'Garage Slab - Concrete', percent: 0.12, type: 'material' },
      { tradeCode: 'FN', name: 'Garage Slab - Labor', percent: 0.08, type: 'labor' },
      { tradeCode: 'FR', name: 'Garage Framing Lumber', percent: 0.12, type: 'material' },
      { tradeCode: 'FR', name: 'Garage Framing Labor', percent: 0.10, type: 'labor' },
      { tradeCode: 'FR', name: 'Garage Roof Trusses', percent: 0.08, type: 'material' },
      { tradeCode: 'EE', name: 'Garage Door(s)', percent: 0.15, type: 'material' },
      { tradeCode: 'EE', name: 'Garage Door Install', percent: 0.05, type: 'labor' },
      { tradeCode: 'EE', name: 'Garage Service Door', percent: 0.03, type: 'material' },
      { tradeCode: 'EL', name: 'Garage Electrical - Wire & Panel', percent: 0.05, type: 'material' },
      { tradeCode: 'EL', name: 'Garage Electrical - Labor', percent: 0.06, type: 'labor' },
      { tradeCode: 'EL', name: 'Garage Light Fixtures', percent: 0.02, type: 'material' },
      { tradeCode: 'DW', name: 'Garage Drywall', percent: 0.05, type: 'material' },
      { tradeCode: 'DW', name: 'Garage Drywall Labor', percent: 0.04, type: 'labor' },
      { tradeCode: 'PT', name: 'Garage Painting', percent: 0.03, type: 'material' },
      { tradeCode: 'PT', name: 'Garage Paint Labor', percent: 0.02, type: 'labor' },
    ];

    garageTrades.forEach((trade, index) => {
      const tradeAmount = Math.round(garageCost * trade.percent);
      lineItems.push({
        id: `garage-${trade.tradeCode}-${index}`,
        phase: 'garage',
        phaseLabel: 'Garage',
        tradeCode: trade.tradeCode,
        tradeName: TRADE_NAMES[trade.tradeCode] || trade.tradeCode,
        costType: trade.type || 'material',
        category: `${garageSize.charAt(0).toUpperCase() + garageSize.slice(1)} Garage`,
        name: trade.name,
        description: `${garageSqft} sqft ${garageType} garage`,
        unit: 'lump',
        quantity: 1,
        unitPriceGood: tradeAmount,
        unitPriceBetter: Math.round(tradeAmount * 1.1),
        unitPriceBest: Math.round(tradeAmount * 1.2),
        source: 'intake',
        projectType: 'new_construction',
      });
    });
  }

  // Add selection upgrades (these are on top of base pricing)
  const exterior = selections.exterior || {};
  if (exterior.siding_type && SELECTION_PRICING.siding_type[exterior.siding_type]) {
    const basePrice = SELECTION_PRICING.siding_type[exterior.siding_type];
    if (basePrice > 0) {
      lineItems.push({
        id: 'siding-upgrade',
        phase: 'upgrades',
        phaseLabel: 'Upgrades',
        tradeCode: 'EE',
        tradeName: 'Exterior Envelope',
        category: 'Upgrades & Selections',
        name: `Siding Upgrade - ${formatSelectionLabel(exterior.siding_type)}`,
        description: 'Upgrade from standard vinyl',
        unit: 'lump',
        quantity: 1,
        unitPriceGood: basePrice,
        unitPriceBetter: basePrice,
        unitPriceBest: Math.round(basePrice * 1.2),
        source: 'intake',
        isUpgrade: true,
      });
    }
  }

  if (exterior.roof_material && SELECTION_PRICING.roof_material[exterior.roof_material]) {
    const basePrice = SELECTION_PRICING.roof_material[exterior.roof_material];
    if (basePrice > 0) {
      lineItems.push({
        id: 'roof-upgrade',
        phase: 'upgrades',
        phaseLabel: 'Upgrades',
        tradeCode: 'RF',
        tradeName: 'Roofing',
        category: 'Upgrades & Selections',
        name: `Roofing - ${formatSelectionLabel(exterior.roof_material)}`,
        description: 'Upgrade from standard asphalt',
        unit: 'lump',
        quantity: 1,
        unitPriceGood: basePrice,
        unitPriceBetter: basePrice,
        unitPriceBest: Math.round(basePrice * 1.3),
        source: 'intake',
        isUpgrade: true,
      });
    }
  }

  if (exterior.window_frame && SELECTION_PRICING.window_frame[exterior.window_frame]) {
    const basePrice = SELECTION_PRICING.window_frame[exterior.window_frame];
    if (basePrice > 0) {
      lineItems.push({
        id: 'window-upgrade',
        phase: 'upgrades',
        phaseLabel: 'Upgrades',
        tradeCode: 'EE',
        tradeName: 'Exterior Envelope',
        category: 'Upgrades & Selections',
        name: `Windows - ${formatSelectionLabel(exterior.window_frame)}`,
        description: 'Upgrade from vinyl frames',
        unit: 'lump',
        quantity: 1,
        unitPriceGood: basePrice,
        unitPriceBetter: basePrice,
        unitPriceBest: Math.round(basePrice * 1.2),
        source: 'intake',
        isUpgrade: true,
      });
    }
  }

  // Kitchen selections
  const kitchen = selections.kitchen || {};
  addKitchenLineItems(lineItems, kitchen, 'Upgrades & Selections');

  // Bathroom selections
  const bathrooms = selections.bathrooms || {};
  addBathroomLineItems(lineItems, bathrooms, layout);

  // Mechanical
  const mechanical = selections.mechanical || {};
  addMechanicalLineItems(lineItems, mechanical);

  return {
    lineItems,
    projectType: 'new_construction',
    baseSqft,
    baseTotalGood,
    selectedTier: project.build_tier || 'better',
  };
}

/**
 * Generate renovation estimate with trade breakdown
 *
 * Each room generates multiple line items broken down by trade,
 * enabling filtering by room, trade, or category in the Loops ecosystem.
 */
function generateRenovationEstimate(project, intake) {
  const renovation = intake.renovation || {};
  const roomTiers = renovation.room_tiers || {};
  const selectedRooms = renovation.selected_rooms || [];

  const lineItems = [];

  // Generate line items for each selected room, broken down by trade
  selectedRooms.forEach((roomId) => {
    const renoTier = roomTiers[roomId] || 'full';
    const tierMultiplier = RENO_TIERS[renoTier]?.multiplier || 1.0;
    const roomPricing = BASE_PRICING.renovation[roomId];
    const roomBreakdown = ROOM_TRADE_BREAKDOWN[roomId];

    if (!roomPricing) return;

    // Calculate room total
    const roomSqft = getRoomDefaultSqft(roomId);
    const baseRoomTotal = roomPricing.base + (roomPricing.perSqft * roomSqft);
    const adjustedRoomTotal = Math.round(baseRoomTotal * tierMultiplier);

    // If we have a trade breakdown, create line items per trade
    if (roomBreakdown && roomBreakdown.trades) {
      roomBreakdown.trades.forEach((trade, index) => {
        const tradeAmount = Math.round(adjustedRoomTotal * trade.percent);

        lineItems.push({
          id: `${roomId}-${trade.tradeCode}-${index}`,
          // Filtering fields
          room: roomId,
          roomLabel: formatRoomLabel(roomId),
          tradeCode: trade.tradeCode,
          tradeName: TRADE_NAMES[trade.tradeCode] || trade.tradeCode,
          subCode: trade.subCode || null,
          // Display fields
          category: formatRoomLabel(roomId), // Group by room in UI
          name: trade.name,
          description: `${roomBreakdown.label} - ${renoTier === 'refresh' ? 'Refresh' : 'Full reno'}`,
          // Pricing
          unit: 'lump',
          quantity: 1,
          unitPriceGood: tradeAmount,
          unitPriceBetter: Math.round(tradeAmount * BUILD_TIERS.better.multiplier),
          unitPriceBest: Math.round(tradeAmount * BUILD_TIERS.best.multiplier),
          // Metadata
          source: 'intake',
          renoTier,
        });
      });
    } else {
      // Fallback: single line item for room without breakdown
      lineItems.push({
        id: `room-${roomId}`,
        room: roomId,
        roomLabel: formatRoomLabel(roomId),
        tradeCode: 'GN',
        tradeName: 'General',
        category: formatRoomLabel(roomId),
        name: `${formatRoomLabel(roomId)} - ${RENO_TIERS[renoTier]?.label} Renovation`,
        description: renoTier === 'refresh' ? 'Cosmetic updates' : 'Complete renovation',
        unit: 'lump',
        quantity: 1,
        unitPriceGood: adjustedRoomTotal,
        unitPriceBetter: Math.round(adjustedRoomTotal * BUILD_TIERS.better.multiplier),
        unitPriceBest: Math.round(adjustedRoomTotal * BUILD_TIERS.best.multiplier),
        source: 'intake',
        renoTier,
      });
    }
  });

  // Electrical upgrade if needed (whole-house scope)
  if (renovation.electrical_panel === 'fuse' || renovation.electrical_service === '100_amp') {
    lineItems.push({
      id: 'electrical-upgrade',
      room: 'whole_house',
      roomLabel: 'Whole House',
      tradeCode: 'EL',
      tradeName: 'Electrical',
      category: 'Electrical',
      name: 'Electrical Panel Upgrade',
      description: 'Upgrade to 200A breaker panel',
      unit: 'lump',
      quantity: 1,
      unitPriceGood: 3500,
      unitPriceBetter: 4000,
      unitPriceBest: 4500,
      source: 'intake',
    });
  }

  return {
    lineItems,
    projectType: 'renovation',
    selectedRooms,
    selectedTier: project.build_tier || 'better',
  };
}

/**
 * Add kitchen-specific line items
 */
function addKitchenLineItems(lineItems, kitchen, categoryPrefix) {
  if (kitchen.cabinet_construction && SELECTION_PRICING.cabinet_construction[kitchen.cabinet_construction]) {
    const basePrice = SELECTION_PRICING.cabinet_construction[kitchen.cabinet_construction];
    if (basePrice > 0) {
      lineItems.push({
        id: 'kitchen-cabinets',
        category: categoryPrefix,
        name: `Cabinets - ${formatSelectionLabel(kitchen.cabinet_construction)}`,
        description: 'Cabinet construction upgrade',
        unit: 'lump',
        quantity: 1,
        unitPriceGood: basePrice,
        unitPriceBetter: basePrice,
        unitPriceBest: basePrice * 1.3,
        source: 'intake',
      });
    }
  }

  if (kitchen.countertop && SELECTION_PRICING.countertop[kitchen.countertop]) {
    const basePrice = SELECTION_PRICING.countertop[kitchen.countertop];
    if (basePrice > 0) {
      lineItems.push({
        id: 'kitchen-countertop',
        category: categoryPrefix,
        name: `Countertops - ${formatSelectionLabel(kitchen.countertop)}`,
        description: 'Countertop material upgrade',
        unit: 'lump',
        quantity: 1,
        unitPriceGood: basePrice,
        unitPriceBetter: basePrice,
        unitPriceBest: basePrice * 1.2,
        source: 'intake',
      });
    }
  }

  if (kitchen.backsplash && SELECTION_PRICING.backsplash[kitchen.backsplash]) {
    const basePrice = SELECTION_PRICING.backsplash[kitchen.backsplash];
    if (basePrice > 0) {
      lineItems.push({
        id: 'kitchen-backsplash',
        category: categoryPrefix,
        name: `Backsplash - ${formatSelectionLabel(kitchen.backsplash)}`,
        description: 'Tile backsplash',
        unit: 'lump',
        quantity: 1,
        unitPriceGood: basePrice,
        unitPriceBetter: basePrice * 1.2,
        unitPriceBest: basePrice * 1.5,
        source: 'intake',
      });
    }
  }
}

/**
 * Add bathroom-specific line items
 */
function addBathroomLineItems(lineItems, bathrooms, layout) {
  if (bathrooms.primary_shower && SELECTION_PRICING.primary_shower[bathrooms.primary_shower]) {
    const basePrice = SELECTION_PRICING.primary_shower[bathrooms.primary_shower];
    if (basePrice > 0) {
      lineItems.push({
        id: 'primary-shower',
        category: 'Bathrooms',
        name: `Primary Shower - ${formatSelectionLabel(bathrooms.primary_shower)}`,
        description: 'Shower upgrade',
        unit: 'lump',
        quantity: 1,
        unitPriceGood: basePrice,
        unitPriceBetter: basePrice * 1.15,
        unitPriceBest: basePrice * 1.4,
        source: 'intake',
      });
    }
  }

  if (bathrooms.vanity_type && SELECTION_PRICING.vanity_type[bathrooms.vanity_type]) {
    const basePrice = SELECTION_PRICING.vanity_type[bathrooms.vanity_type];
    const bathCount = parseInt(layout.full_bathrooms || '2') + parseInt(layout.half_bathrooms || '1');
    if (basePrice > 0) {
      lineItems.push({
        id: 'vanities',
        category: 'Bathrooms',
        name: `Vanities - ${formatSelectionLabel(bathrooms.vanity_type)}`,
        description: `Upgrade for ${bathCount} bathrooms`,
        unit: 'each',
        quantity: bathCount,
        unitPriceGood: basePrice,
        unitPriceBetter: basePrice,
        unitPriceBest: basePrice * 1.3,
        source: 'intake',
      });
    }
  }
}

/**
 * Add mechanical line items
 */
function addMechanicalLineItems(lineItems, mechanical) {
  if (mechanical.hvac_system && SELECTION_PRICING.hvac_system[mechanical.hvac_system]) {
    const basePrice = SELECTION_PRICING.hvac_system[mechanical.hvac_system];
    if (basePrice > 0) {
      lineItems.push({
        id: 'hvac',
        category: 'Mechanical',
        name: `HVAC - ${formatSelectionLabel(mechanical.hvac_system)}`,
        description: 'Heating and cooling system',
        unit: 'lump',
        quantity: 1,
        unitPriceGood: basePrice,
        unitPriceBetter: basePrice * 1.1,
        unitPriceBest: basePrice * 1.25,
        source: 'intake',
      });
    }
  }

  if (mechanical.water_heater && SELECTION_PRICING.water_heater[mechanical.water_heater]) {
    const basePrice = SELECTION_PRICING.water_heater[mechanical.water_heater];
    if (basePrice > 0) {
      lineItems.push({
        id: 'water-heater',
        category: 'Mechanical',
        name: `Water Heater - ${formatSelectionLabel(mechanical.water_heater)}`,
        description: 'Hot water system',
        unit: 'lump',
        quantity: 1,
        unitPriceGood: basePrice,
        unitPriceBetter: basePrice,
        unitPriceBest: basePrice * 1.15,
        source: 'intake',
      });
    }
  }

  // Electrical upgrades from array
  if (mechanical.electrical_upgrades?.length > 0) {
    const upgradesCost = mechanical.electrical_upgrades.length * 1500;
    lineItems.push({
      id: 'electrical-upgrades',
      category: 'Electrical',
      name: 'Electrical Upgrades',
      description: mechanical.electrical_upgrades.map(formatSelectionLabel).join(', '),
      unit: 'lump',
      quantity: 1,
      unitPriceGood: upgradesCost,
      unitPriceBetter: upgradesCost * 1.1,
      unitPriceBest: upgradesCost * 1.2,
      source: 'intake',
    });
  }
}

/**
 * Calculate estimate totals for each tier
 */
export function calculateEstimateTotals(lineItems) {
  const totals = {
    good: 0,
    better: 0,
    best: 0,
  };

  lineItems.forEach((item) => {
    totals.good += (item.unitPriceGood || 0) * (item.quantity || 1);
    totals.better += (item.unitPriceBetter || 0) * (item.quantity || 1);
    totals.best += (item.unitPriceBest || 0) * (item.quantity || 1);
  });

  return totals;
}

/**
 * Calculate estimate range (low/high) for a given tier
 */
export function calculateEstimateRange(lineItems, tier = 'better') {
  const totals = calculateEstimateTotals(lineItems);
  const baseTotal = totals[tier] || totals.better;

  // Apply variance: -5% to +10%
  return {
    low: Math.round(baseTotal * 0.95),
    high: Math.round(baseTotal * 1.10),
    base: Math.round(baseTotal),
  };
}

/**
 * Format selection value to label
 */
export function formatSelectionLabel(value) {
  if (!value) return '';
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

/**
 * Format room ID to label
 */
export function formatRoomLabel(roomId) {
  const labels = {
    kitchen: 'Kitchen',
    primary_bath: 'Primary Bathroom',
    secondary_bath: 'Secondary Bathroom',
    powder_room: 'Powder Room',
    basement: 'Basement',
    laundry: 'Laundry Room',
    living_room: 'Living Room',
    bedroom: 'Bedroom',
    bedrooms: 'Bedrooms',
    dining_room: 'Dining Room',
    home_office: 'Home Office',
    mudroom: 'Mudroom',
    garage: 'Garage',
    exterior: 'Exterior/Siding',
    windows_doors: 'Windows & Doors',
    roofing: 'Roofing',
    addition: 'Addition',
  };
  return labels[roomId] || formatSelectionLabel(roomId);
}

/**
 * Get default room square footage for estimates
 */
function getRoomDefaultSqft(roomId) {
  const defaults = {
    kitchen: 150,
    primary_bath: 80,
    secondary_bath: 50,
    powder_room: 25,
    basement: 800,
    laundry: 50,
    living_room: 250,
    bedroom: 150,
    bedrooms: 150,
    dining_room: 150,
    home_office: 120,
    mudroom: 60,
    garage: 400,
    exterior: 0,
    windows_doors: 0,
    roofing: 0,
    addition: 400,
  };
  return defaults[roomId] || 100;
}

/**
 * Format currency
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ============================================================================
// COST CATALOGUE INTEGRATION
// ============================================================================

/**
 * Map ROOM_TRADE_BREAKDOWN trade codes to LABOUR_CATEGORIES
 * The estimate system uses codes like 'EL', 'PL', 'CM'
 * The catalogue uses 'electrical', 'plumbing', 'trim_carpentry'
 */
export const TRADE_CODE_TO_CATEGORY = {
  DM: 'excavation',      // Demo maps to excavation (similar labor profile)
  SW: 'excavation',      // Site Work
  FN: 'concrete',        // Foundation
  FS: 'framing',         // Framing - Structural
  FI: 'framing',         // Framing - Interior
  RF: 'roofing',         // Roofing
  EE: 'siding',          // Exterior Envelope
  IA: 'insulation',      // Insulation
  EL: 'electrical',      // Electrical
  PL: 'plumbing',        // Plumbing
  HV: 'hvac',            // HVAC
  DW: 'drywall',         // Drywall
  PT: 'painting',        // Painting
  FL: 'flooring',        // Flooring
  TL: 'tile',            // Tile
  FC: 'trim_carpentry',  // Finish Carpentry
  CM: 'trim_carpentry',  // Cabinetry & Millwork (uses trim rates)
  SR: 'trim_carpentry',  // Stairs & Railings
  EF: 'siding',          // Exterior Finishes
  GN: null,              // General - no specific trade
  FZ: null,              // Final Completion
};

/**
 * Labor portion by trade (how much of the cost is labor vs materials)
 * More accurate than assuming 70% across the board
 */
export const LABOR_PORTIONS = {
  DM: 0.90,    // Demo is mostly labor
  SW: 0.70,    // Site work
  FN: 0.50,    // Foundation (lots of concrete)
  FS: 0.65,    // Framing - Structural
  FI: 0.70,    // Framing - Interior
  RF: 0.55,    // Roofing (significant material cost)
  EE: 0.50,    // Exterior (siding materials expensive)
  IA: 0.60,    // Insulation
  EL: 0.65,    // Electrical
  PL: 0.60,    // Plumbing
  HV: 0.50,    // HVAC (equipment expensive)
  DW: 0.70,    // Drywall
  PT: 0.75,    // Painting (mostly labor)
  FL: 0.55,    // Flooring (flooring materials expensive)
  TL: 0.65,    // Tile
  FC: 0.75,    // Finish Carpentry
  CM: 0.40,    // Cabinetry (cabinets are expensive)
  SR: 0.70,    // Stairs
  EF: 0.55,    // Exterior Finishes
  GN: 0.60,    // General
  FZ: 0.80,    // Final Completion
};

/**
 * Apply catalogue labor rates to line items
 *
 * This recalculates line item pricing based on the contractor's
 * actual labor rates from their Cost Catalogue.
 *
 * @param {Array} lineItems - Estimate line items
 * @param {Object} laborRates - Labor rates from catalogue (tradeCode -> { hourlyRate, pieceRates })
 * @returns {Array} Updated line items with recalculated pricing
 */
export function applyLaborRatesToEstimate(lineItems, laborRates) {
  return lineItems.map((item) => {
    if (!item.tradeCode) return item;

    // Try to find matching catalogue trade
    const catalogueTrade = laborRates[item.tradeCode] ||
      laborRates[TRADE_CODE_TO_CATEGORY[item.tradeCode]?.toUpperCase()];

    if (!catalogueTrade) return item;

    // Get labor portion for this trade
    const laborPortion = LABOR_PORTIONS[item.tradeCode] || 0.7;
    const materialPortion = 1 - laborPortion;

    // Get hourly rate for scaling
    const catalogueRate = catalogueTrade.hourlyRate;
    const defaultRate = 50; // Base rate assumption

    // If catalogue rate differs from default, scale the pricing
    if (catalogueRate && catalogueRate !== defaultRate) {
      const rateRatio = catalogueRate / defaultRate;

      // Scale the labor portion, keep materials the same
      const scaleFactor = (laborPortion * rateRatio) + materialPortion;

      return {
        ...item,
        unitPriceGood: Math.round(item.unitPriceGood * scaleFactor),
        unitPriceBetter: Math.round(item.unitPriceBetter * scaleFactor),
        unitPriceBest: Math.round(item.unitPriceBest * scaleFactor),
        catalogueAdjusted: true,
        catalogueRate,
        catalogueCategory: TRADE_CODE_TO_CATEGORY[item.tradeCode],
      };
    }

    return item;
  });
}

/**
 * Find a matching piece rate for a line item from the catalogue
 *
 * @param {Object} item - Line item from estimate
 * @param {Object} laborRates - Labor rates from catalogue
 * @returns {Object|null} Matching piece rate or null
 */
export function findMatchingPieceRate(item, laborRates) {
  if (!item.tradeCode) return null;

  const catalogueTrade = laborRates[item.tradeCode] ||
    laborRates[TRADE_CODE_TO_CATEGORY[item.tradeCode]?.toUpperCase()];

  if (!catalogueTrade?.pieceRates) return null;

  // Try to find a matching piece rate by searching task names
  const itemNameLower = item.name.toLowerCase();
  const itemDescLower = (item.description || '').toLowerCase();

  for (const pieceRate of catalogueTrade.pieceRates) {
    const taskLower = pieceRate.task.toLowerCase();

    // Check for keyword matches
    if (itemNameLower.includes(taskLower) || taskLower.includes(itemNameLower)) {
      return pieceRate;
    }
    if (itemDescLower.includes(taskLower) || taskLower.includes(itemDescLower)) {
      return pieceRate;
    }
  }

  return null;
}

/**
 * Get labour rate summary for an estimate
 *
 * Shows which trades are used and what rates apply
 */
export function getEstimateTradesSummary(lineItems, laborRates) {
  const trades = {};

  lineItems.forEach((item) => {
    if (!item.tradeCode) return;

    if (!trades[item.tradeCode]) {
      trades[item.tradeCode] = {
        code: item.tradeCode,
        name: TRADE_NAMES[item.tradeCode] || item.tradeCode,
        itemCount: 0,
        totalGood: 0,
        totalBetter: 0,
        totalBest: 0,
        hourlyRate: laborRates?.[item.tradeCode]?.hourlyRate || null,
      };
    }

    trades[item.tradeCode].itemCount++;
    trades[item.tradeCode].totalGood += (item.unitPriceGood || 0) * (item.quantity || 1);
    trades[item.tradeCode].totalBetter += (item.unitPriceBetter || 0) * (item.quantity || 1);
    trades[item.tradeCode].totalBest += (item.unitPriceBest || 0) * (item.quantity || 1);
  });

  return Object.values(trades).sort((a, b) => b.totalBetter - a.totalBetter);
}
