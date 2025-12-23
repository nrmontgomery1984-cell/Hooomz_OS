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
 *
 * PRICING DATA:
 * Line items should have materialsCost and laborCost from catalogue when available:
 * - materialsCost: from materials catalogue (64 Home Hardware receipts)
 * - laborCost: from labour catalogue (local sub-trade quotes)
 * Items without catalogue data are flagged for manual pricing entry.
 */

import { loadCatalogueData, getMaterials } from './costCatalogue';
import { SCOPE_TO_LABOUR_MAP } from './scopeCostEstimator';
import { calculateWallMaterials, getWallCostPerLinearFoot } from './wallMaterialCalculator';

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
 * Look up pricing from catalogue data for a scope item
 *
 * Returns:
 * - laborCost: unit labor cost from labour catalogue (or null)
 * - materialsCost: unit materials cost (or null - many labor rates are labor-only)
 * - hasData: true if we found catalogue pricing
 * - confidence: 0-2 confidence level from catalogue
 * - source: 'catalogue' | 'flat' | 'none'
 */
function lookupCataloguePricing(scopeItemId, _quantity, laborRates) {
  // Note: _quantity param reserved for future materials quantity calculations
  // Check if we have a mapping for this scope item
  const mapping = SCOPE_TO_LABOUR_MAP?.[scopeItemId];

  if (!mapping) {
    return {
      laborCost: null,
      materialsCost: null,
      hasData: false,
      confidence: 0,
      source: 'none',
      catalogueSource: null,
    };
  }

  let laborCost = null;
  let materialsCost = null;
  let confidence = 0;
  let source = 'none';
  let catalogueSource = null;

  // Try to get rate from labour catalogue
  if (mapping.labourId && laborRates) {
    // Search through all trade categories for the rate
    for (const tradeData of Object.values(laborRates)) {
      const rate = tradeData.pieceRates?.find(r => r.id === mapping.labourId);
      if (rate) {
        laborCost = rate.rate || rate.unitCost || 0;
        confidence = rate.confidence ?? 1;
        source = 'catalogue';
        catalogueSource = `${tradeData.name}: ${rate.task}`;

        // Check if notes indicate materials are included or separate
        const notes = (rate.notes || '').toLowerCase();
        if (notes.includes('supplied by owner') || notes.includes('fixtures extra') || notes.includes('materials extra')) {
          // Labor-only rate, materials not included
          materialsCost = null;
        } else if (notes.includes('includes materials') || notes.includes('materials included')) {
          // Rate includes materials - we can't split it accurately
          // For now, treat as 60/40 labor/materials
          materialsCost = laborCost * 0.67; // materials roughly 40% of total
          laborCost = laborCost * 0.6; // labor roughly 60% of total
        }
        break;
      }
    }
  }

  // Fall back to flat rate if no catalogue rate found
  if (laborCost === null && mapping.flatRate !== undefined) {
    laborCost = mapping.flatRate;
    source = 'flat';
    confidence = 0;
    catalogueSource = 'Flat rate estimate';
  }

  // Apply multiplier if specified in mapping
  if (laborCost !== null && mapping.multiplier) {
    laborCost *= mapping.multiplier;
  }

  return {
    laborCost,
    materialsCost,
    hasData: laborCost !== null,
    confidence,
    source,
    catalogueSource,
  };
}

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

  // Handle contractor intake - convert taskInstances to line items
  if (project.intake_type === 'contractor') {
    return generateContractorEstimate(project, intake);
  }

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
 * Generate estimate from contractor intake scope data
 * Converts contractor scope items to line items for the estimate builder
 *
 * Uses actual catalogue data when available:
 * - laborCost: from labour catalogue (scopeCostEstimator lookup)
 * - materialsCost: calculated based on labour catalogue notes
 *   (many items note "fixtures/materials supplied by owner" meaning labor-only rate)
 */
function generateContractorEstimate(project, intake) {
  try {
    const lineItems = [];
    const scope = intake?.scope || {};
    const specLevel = intake?.project?.specLevel || project?.build_tier || 'standard';

    // Load catalogue data for pricing lookups
    const catalogueData = loadCatalogueData();
    const laborRates = catalogueData?.laborRates || {};

    // Tier multipliers for Good/Better/Best pricing (legacy, used when no catalogue data)
    const tierMultipliers = {
      good: specLevel === 'standard' ? 0.85 : specLevel === 'premium' ? 0.9 : 0.8,
      better: 1.0,
      best: specLevel === 'standard' ? 1.15 : specLevel === 'premium' ? 1.2 : 1.25,
    };

    // If project has taskInstances (from mock mode), convert those
    if (project?.taskInstances?.length > 0) {
      project.taskInstances.forEach((task, index) => {
        // Try to get pricing from catalogue
        const scopeItemId = task.scopeItemId || task.id;
        const cataloguePricing = lookupCataloguePricing(scopeItemId, task.quantity || 1, laborRates);

        const lineItem = {
          id: task.id || `contractor-${index}`,
          category: task.categoryCode || 'General',
          name: task.name || 'Unnamed Item',
          description: task.notes || '',
          unit: task.unit || 'ea',
          quantity: task.quantity || 1,
          tradeCode: task.categoryCode,
          source: cataloguePricing.source,
          // Catalogue pricing (null if not found)
          laborCost: cataloguePricing.laborCost,
          materialsCost: cataloguePricing.materialsCost,
          catalogueConfidence: cataloguePricing.confidence,
          catalogueSource: cataloguePricing.catalogueSource,
        };

        // Calculate tier prices (for display and backwards compatibility)
        if (cataloguePricing.hasData) {
          const labor = cataloguePricing.laborCost || 0;
          const materials = cataloguePricing.materialsCost || 0;
          // Materials are fixed, labor varies by tier
          lineItem.unitPriceGood = Math.round(materials + labor);
          lineItem.unitPriceBetter = Math.round(materials + (labor * 1.15));
          lineItem.unitPriceBest = Math.round(materials + (labor * 1.35));
        } else {
          // Fallback to legacy calculation
          const basePrice = task.estimate_total || 0;
          lineItem.unitPriceGood = Math.round(basePrice * tierMultipliers.good);
          lineItem.unitPriceBetter = Math.round(basePrice * tierMultipliers.better);
          lineItem.unitPriceBest = Math.round(basePrice * tierMultipliers.best);
        }

        lineItems.push(lineItem);
      });
    } else if (scope && typeof scope === 'object') {
      // No taskInstances, create from scope data directly
      // scope[categoryCode].items is an OBJECT keyed by itemId, not an array
      Object.entries(scope).forEach(([categoryCode, categoryData]) => {
        if (!categoryData || typeof categoryData !== 'object') return;
        if (!categoryData.enabled || !categoryData.items) return;

        const items = categoryData.items;
        if (!items || typeof items !== 'object') return;

        // items is an object like { "item-id": { qty: 2, notes: "..." } }
        Object.entries(items).forEach(([itemId, itemData]) => {
          if (!itemData || typeof itemData !== 'object') return;
          if (!itemData.qty || itemData.qty <= 0) return;

          // Try to get pricing from catalogue using scope item mapping
          const cataloguePricing = lookupCataloguePricing(itemId, itemData.qty, laborRates);

          const lineItem = {
            id: `${categoryCode}-${itemId}`,
            category: categoryCode,
            name: itemData.name || itemId,
            description: itemData.notes || '',
            unit: itemData.unit || 'ea',
            quantity: itemData.qty,
            tradeCode: categoryCode,
            source: 'intake',
            // Catalogue pricing (null if not found)
            laborCost: cataloguePricing.laborCost,
            materialsCost: cataloguePricing.materialsCost,
            catalogueConfidence: cataloguePricing.confidence,
            catalogueSource: cataloguePricing.catalogueSource,
          };

          // Calculate tier prices
          if (cataloguePricing.hasData) {
            const labor = cataloguePricing.laborCost || 0;
            const materials = cataloguePricing.materialsCost || 0;
            lineItem.unitPriceGood = Math.round(materials + labor);
            lineItem.unitPriceBetter = Math.round(materials + (labor * 1.15));
            lineItem.unitPriceBest = Math.round(materials + (labor * 1.35));
          } else {
            // Fallback to legacy calculation
            const baseRate = itemData.unitCost || 50;
            const basePrice = itemData.qty * baseRate;
            lineItem.unitPriceGood = Math.round(basePrice * tierMultipliers.good);
            lineItem.unitPriceBetter = Math.round(basePrice * tierMultipliers.better);
            lineItem.unitPriceBest = Math.round(basePrice * tierMultipliers.best);
          }

          lineItems.push(lineItem);
        });
      });
    }

    // If no items found, return a blank template with starter categories
    if (lineItems.length === 0) {
      return {
        lineItems: [
          { id: 'starter-0', category: 'Labor', name: 'Labor', description: 'Project labor costs', unit: 'lump', quantity: 1, unitPriceGood: 0, unitPriceBetter: 0, unitPriceBest: 0, source: 'template' },
          { id: 'starter-1', category: 'Materials', name: 'Materials', description: 'Building materials', unit: 'lump', quantity: 1, unitPriceGood: 0, unitPriceBetter: 0, unitPriceBest: 0, source: 'template' },
          { id: 'starter-2', category: 'Subcontractors', name: 'Subcontractor Work', description: 'Subcontracted trades', unit: 'lump', quantity: 1, unitPriceGood: 0, unitPriceBetter: 0, unitPriceBest: 0, source: 'template' },
        ],
        projectType: 'contractor',
        selectedTier: project?.build_tier || 'better',
        source: 'blank',
      };
    }

    return {
      lineItems,
      projectType: 'contractor',
      selectedTier: project?.build_tier || 'better',
      source: 'contractor_intake',
    };
  } catch (error) {
    console.error('generateContractorEstimate error:', error);
    // Return blank estimate on any error
    return {
      lineItems: [
        { id: 'starter-0', category: 'Labor', name: 'Labor', description: 'Project labor costs', unit: 'lump', quantity: 1, unitPriceGood: 0, unitPriceBetter: 0, unitPriceBest: 0, source: 'template' },
        { id: 'starter-1', category: 'Materials', name: 'Materials', description: 'Building materials', unit: 'lump', quantity: 1, unitPriceGood: 0, unitPriceBetter: 0, unitPriceBest: 0, source: 'template' },
      ],
      projectType: 'contractor',
      selectedTier: project?.build_tier || 'better',
      source: 'blank',
    };
  }
}

/**
 * Generate trade-based estimate for HomeownerQuote display
 * Creates items with tradeCode for acceptance criteria matching
 * Uses actual intake data when available, falls back to trade template
 * Exported for use in HomeownerQuote
 */
export function generateTradeBasedEstimate(project) {
  const intake = project.intake_data || {};

  // Helper to check if items are real intake-based items (not old placeholder format)
  const hasIntakeItems = (items) => {
    // Items from intake data have source: 'intake' and specific trade info
    // Old placeholder format has 3 generic items without source
    return items.length > 0 && items.some(item =>
      item.source === 'intake' || item.room || item.roomLabel
    );
  };

  // Check for renovation intake first (most common)
  const hasRenovationData = intake.renovation?.selected_rooms?.length > 0;
  if (hasRenovationData) {
    const estimate = generateRenovationEstimate(project, intake);
    // Ensure all items have tradeCode
    estimate.lineItems = estimate.lineItems.map(item => ({
      ...item,
      tradeCode: item.tradeCode || mapCategoryToTradeCode(item.category) || 'GC',
    }));
    if (hasIntakeItems(estimate.lineItems)) {
      return estimate;
    }
  }

  // Try contractor intake
  if (project.intake_type === 'contractor' && intake.scope) {
    const estimate = generateContractorEstimate(project, intake);
    // Ensure all items have tradeCode
    estimate.lineItems = estimate.lineItems.map(item => ({
      ...item,
      tradeCode: item.tradeCode || item.category || 'GC',
    }));
    if (hasIntakeItems(estimate.lineItems)) {
      return estimate;
    }
  }

  // Check for new construction intake
  if (project.intake_type === 'new_construction' && intake.layout) {
    const estimate = generateNewConstructionEstimate(project, intake);
    // Ensure all items have tradeCode
    estimate.lineItems = estimate.lineItems.map(item => ({
      ...item,
      tradeCode: item.tradeCode || mapCategoryToTradeCode(item.category) || 'GC',
    }));
    if (hasIntakeItems(estimate.lineItems)) {
      return estimate;
    }
  }

  // Fallback to blank trade-based template with 24 items across 10 categories
  return generateBlankEstimate(project);
}

/**
 * Map category names to trade codes for acceptance criteria matching
 */
function mapCategoryToTradeCode(category) {
  if (!category) return null;
  const cat = category.toLowerCase();

  if (cat.includes('foundation') || cat.includes('concrete')) return 'FD';
  if (cat.includes('framing') || cat.includes('structural')) return 'FR';
  if (cat.includes('electrical')) return 'EL';
  if (cat.includes('plumbing')) return 'PL';
  if (cat.includes('hvac') || cat.includes('mechanical') || cat.includes('heating')) return 'HV';
  if (cat.includes('insulation')) return 'IN';
  if (cat.includes('drywall')) return 'DW';
  if (cat.includes('paint')) return 'PT';
  if (cat.includes('floor')) return 'FL';
  if (cat.includes('tile')) return 'TL';
  if (cat.includes('cabinet') || cat.includes('millwork') || cat.includes('trim')) return 'CA';
  if (cat.includes('window') || cat.includes('door')) return 'WD';
  if (cat.includes('roof')) return 'RF';
  if (cat.includes('siding') || cat.includes('exterior')) return 'EX';
  if (cat.includes('kitchen')) return 'KI';
  if (cat.includes('bath')) return 'BA';

  return 'GC'; // General Contractor
}

/**
 * Generate a blank estimate template for manual entry
 * Creates trade-based line items that match acceptance criteria
 */
function generateBlankEstimate(project) {
  const lineItems = [];

  // Trade-based starter items that will match acceptance criteria
  // Each item has tradeCode for criteria matching and realistic placeholder pricing
  const tradeCategories = [
    // Foundation & Concrete
    {
      category: 'Foundation & Concrete',
      tradeCode: 'FD',
      items: [
        { name: 'Concrete Foundation Walls', description: 'Poured concrete foundation walls', basePrice: 8500 },
        { name: 'Concrete Basement Floor', description: 'Basement slab with vapor barrier', basePrice: 4500 },
      ],
    },
    // Framing
    {
      category: 'Framing',
      tradeCode: 'FR',
      items: [
        { name: 'Wall Framing', description: 'Exterior and interior wall framing', basePrice: 12000 },
        { name: 'Floor Framing', description: 'Floor joist system and subfloor', basePrice: 8000 },
        { name: 'Ceiling Framing', description: 'Ceiling joists and rafters', basePrice: 6000 },
      ],
    },
    // Windows & Doors
    {
      category: 'Windows & Doors',
      tradeCode: 'WD',
      items: [
        { name: 'Windows', description: 'Window supply and installation', basePrice: 6500 },
        { name: 'Exterior Doors', description: 'Entry and exterior door installation', basePrice: 3500 },
        { name: 'Interior Doors', description: 'Interior door supply and installation', basePrice: 2500 },
      ],
    },
    // Electrical
    {
      category: 'Electrical',
      tradeCode: 'EL',
      items: [
        { name: 'Electrical Outlets', description: 'Receptacles and wiring', basePrice: 3000 },
        { name: 'Light Switches', description: 'Switches and dimmers', basePrice: 1500 },
        { name: 'Light Fixtures', description: 'Fixture installation', basePrice: 2500 },
      ],
    },
    // Plumbing
    {
      category: 'Plumbing',
      tradeCode: 'PL',
      items: [
        { name: 'Plumbing Fixtures', description: 'Sinks, faucets, toilets', basePrice: 4500 },
        { name: 'Water Supply', description: 'Supply lines and connections', basePrice: 2500 },
        { name: 'Drainage', description: 'Drain lines and venting', basePrice: 3000 },
      ],
    },
    // Interior Finishes
    {
      category: 'Interior Finishes',
      tradeCode: 'DW',
      items: [
        { name: 'Drywall Surface', description: 'Drywall installation and finishing', basePrice: 5500 },
        { name: 'Painted Surfaces', description: 'Interior painting', basePrice: 3500 },
      ],
    },
    // Flooring
    {
      category: 'Flooring',
      tradeCode: 'FL',
      items: [
        { name: 'Finished Flooring', description: 'Hardwood, laminate, or vinyl flooring', basePrice: 4500 },
        { name: 'Tile Flooring', description: 'Ceramic or porcelain tile', basePrice: 3500 },
      ],
    },
    // Cabinets & Millwork
    {
      category: 'Cabinets & Millwork',
      tradeCode: 'CA',
      items: [
        { name: 'Cabinet Installation', description: 'Kitchen and bathroom cabinets', basePrice: 8000 },
        { name: 'Countertops', description: 'Countertop fabrication and installation', basePrice: 4500 },
        { name: 'Trim & Baseboard', description: 'Baseboard, casing, and trim', basePrice: 2500 },
      ],
    },
    // HVAC
    {
      category: 'Mechanical',
      tradeCode: 'HV',
      items: [
        { name: 'Heating System', description: 'Furnace or heat pump installation', basePrice: 6500 },
        { name: 'Ductwork', description: 'HVAC duct system', basePrice: 3500 },
        { name: 'HVAC Registers & Grilles', description: 'Supply and return registers', basePrice: 800 },
      ],
    },
    // Insulation
    {
      category: 'Insulation',
      tradeCode: 'IN',
      items: [
        { name: 'Wall/Ceiling Insulation', description: 'Batt or blown insulation', basePrice: 3500 },
        { name: 'Vapour Barrier', description: 'Poly vapor barrier installation', basePrice: 1200 },
      ],
    },
  ];

  let itemIndex = 0;
  tradeCategories.forEach((trade) => {
    trade.items.forEach((item) => {
      lineItems.push({
        id: `trade-${itemIndex++}`,
        category: trade.category,
        tradeCode: trade.tradeCode,
        tradeName: trade.category,
        name: item.name,
        description: item.description,
        unit: 'lump',
        quantity: 1,
        // Apply tier multipliers to base price
        unitPriceGood: Math.round(item.basePrice * 1.0),
        unitPriceBetter: Math.round(item.basePrice * 1.25),
        unitPriceBest: Math.round(item.basePrice * 1.55),
        source: 'template',
      });
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
 * Calculate estimate totals with optional type filter
 *
 * Line items should have:
 * - materialsCost: actual materials cost from materials catalogue (or null if not linked)
 * - laborCost: actual labor cost from labour catalogue (or null if not linked)
 * - unitPriceGood/Better/Best: total price per unit (for backwards compatibility)
 *
 * When materialsCost/laborCost are available, use those directly.
 * When not available, the item is flagged as missing pricing data.
 *
 * @param {Array} lineItems - Line items to calculate
 * @param {string} estimateType - 'both' | 'materials' | 'labor'
 */
export function calculateEstimateTotals(lineItems, estimateType = 'both') {
  const totals = {
    good: 0,
    better: 0,
    best: 0,
    // Track items without catalogue pricing
    missingPricingCount: 0,
    missingPricingItems: [],
  };

  // Safety helper to ensure we're adding valid numbers
  const safeNumber = (val) => {
    const num = Number(val);
    return isNaN(num) || !isFinite(num) ? 0 : num;
  };

  lineItems.forEach((item) => {
    const qty = safeNumber(item.quantity) || 1;

    // Check if item has actual materials/labor breakdown from catalogue
    const hasMaterialsCost = item.materialsCost !== undefined && item.materialsCost !== null;
    const hasLaborCost = item.laborCost !== undefined && item.laborCost !== null;
    const hasActualBreakdown = hasMaterialsCost || hasLaborCost;

    if (hasActualBreakdown) {
      // Use actual catalogue data
      const materialsCost = safeNumber(item.materialsCost) * qty;
      const laborCost = safeNumber(item.laborCost) * qty;

      // Apply tier multipliers to labor (materials cost is fixed)
      // Good: standard labor rate
      // Better: 1.15x labor (more experienced crew, better finish)
      // Best: 1.35x labor (premium craftsmanship)
      const laborMultipliers = { good: 1.0, better: 1.15, best: 1.35 };

      if (estimateType === 'both') {
        totals.good += materialsCost + (laborCost * laborMultipliers.good);
        totals.better += materialsCost + (laborCost * laborMultipliers.better);
        totals.best += materialsCost + (laborCost * laborMultipliers.best);
      } else if (estimateType === 'materials') {
        totals.good += materialsCost;
        totals.better += materialsCost;
        totals.best += materialsCost;
      } else if (estimateType === 'labor') {
        totals.good += laborCost * laborMultipliers.good;
        totals.better += laborCost * laborMultipliers.better;
        totals.best += laborCost * laborMultipliers.best;
      }

      // Track if we're missing part of the breakdown
      if (!hasMaterialsCost && estimateType !== 'labor') {
        totals.missingPricingItems.push({
          id: item.id,
          name: item.name,
          missing: 'materials',
          tradeCode: item.tradeCode,
        });
      }
      if (!hasLaborCost && estimateType !== 'materials') {
        totals.missingPricingItems.push({
          id: item.id,
          name: item.name,
          missing: 'labor',
          tradeCode: item.tradeCode,
        });
      }
    } else {
      // No catalogue breakdown - use legacy unitPrice fields with estimated split
      // Apply industry-standard 40% materials / 60% labor split
      const MATERIALS_RATIO = 0.40;
      const LABOR_RATIO = 0.60;

      totals.missingPricingCount++;
      totals.missingPricingItems.push({
        id: item.id,
        name: item.name,
        missing: 'both',
        tradeCode: item.tradeCode,
        category: item.category,
      });

      const goodPrice = safeNumber(item.unitPriceGood) * qty;
      const betterPrice = safeNumber(item.unitPriceBetter) * qty;
      const bestPrice = safeNumber(item.unitPriceBest) * qty;

      if (estimateType === 'both') {
        // Full price for combined
        totals.good += goodPrice;
        totals.better += betterPrice;
        totals.best += bestPrice;
      } else if (estimateType === 'materials') {
        // Estimated materials portion (40%)
        totals.good += goodPrice * MATERIALS_RATIO;
        totals.better += betterPrice * MATERIALS_RATIO;
        totals.best += bestPrice * MATERIALS_RATIO;
      } else if (estimateType === 'labor') {
        // Estimated labor portion (60%)
        totals.good += goodPrice * LABOR_RATIO;
        totals.better += betterPrice * LABOR_RATIO;
        totals.best += bestPrice * LABOR_RATIO;
      }
    }
  });

  return totals;
}

/**
 * Calculate estimate range (low/high) for a given tier
 * @param {Array} lineItems - Line items to calculate
 * @param {string} tier - 'good' | 'better' | 'best'
 * @param {string} estimateType - 'both' | 'materials' | 'labor'
 */
export function calculateEstimateRange(lineItems, tier = 'better', estimateType = 'both') {
  const totals = calculateEstimateTotals(lineItems, estimateType);
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

// ============================================================================
// INSTANCE-BASED ESTIMATING (New System)
// ============================================================================

/**
 * Standard ceiling heights
 */
export const CEILING_HEIGHTS = [
  { value: 8, label: "8'" },
  { value: 9, label: "9'" },
  { value: 10, label: "10'" },
  { value: 12, label: "12'" },
];

/**
 * Default build assemblies (legacy wall assemblies)
 *
 * These are the original wall assemblies, kept for backwards compatibility.
 * New projects should use the assembliesDatabase.js which includes walls,
 * floors, roofs, and foundations with NB-specific pricing.
 *
 * The `calculatorConfig` field defines how to calculate material costs
 * using the wallMaterialCalculator.
 *
 * If calculatorConfig is present, materialCostPerUnit is calculated dynamically.
 * The fallback materialCostPerUnit is used when catalogue data is unavailable.
 */
export const DEFAULT_BUILD_ASSEMBLIES = [
  {
    id: 'ext-2x6',
    name: '2x6 Exterior Wall',
    description: '2x6 framing, R-20 insulation, OSB sheathing',
    category: 'framing',
    unit: 'LF', // Changed to LF for linear foot pricing
    laborCostPerUnit: 29.25, // Labor per LF (approx 9' wall)
    materialCostPerUnit: 40.50, // Fallback if catalogue unavailable
    isDefault: true,
    // Calculator config for dynamic pricing from catalogue
    calculatorConfig: {
      lumberDimension: '2x6',
      sheathingType: 'osb',
      insulationType: 'r20_batt',
      includeSheathing: true,
      includeInsulation: true,
    },
  },
  {
    id: 'ext-2x4',
    name: '2x4 Exterior Wall',
    description: '2x4 framing, R-12 insulation, OSB sheathing',
    category: 'framing',
    unit: 'LF',
    laborCostPerUnit: 24.75, // Labor per LF
    materialCostPerUnit: 31.50, // Fallback
    isDefault: true,
    calculatorConfig: {
      lumberDimension: '2x4',
      sheathingType: 'osb',
      insulationType: 'r12_batt',
      includeSheathing: true,
      includeInsulation: true,
    },
  },
  {
    id: 'int-2x4',
    name: '2x4 Interior Wall',
    description: '2x4 framing, no insulation, drywall both sides',
    category: 'framing',
    unit: 'LF',
    laborCostPerUnit: 18.00, // Labor per LF
    materialCostPerUnit: 20.25, // Fallback
    isDefault: true,
    calculatorConfig: {
      lumberDimension: '2x4',
      sheathingType: null, // No sheathing for interior
      insulationType: null,
      includeSheathing: false,
      includeInsulation: false,
    },
  },
  {
    id: 'int-2x4-ins',
    name: '2x4 Interior Wall (Insulated)',
    description: '2x4 framing with sound insulation',
    category: 'framing',
    unit: 'LF',
    laborCostPerUnit: 20.25, // Labor per LF
    materialCostPerUnit: 27.00, // Fallback
    isDefault: true,
    calculatorConfig: {
      lumberDimension: '2x4',
      sheathingType: null,
      insulationType: 'r12_batt',
      includeSheathing: false,
      includeInsulation: true,
    },
  },
];

// Backwards compatibility alias
export const DEFAULT_WALL_ASSEMBLIES = DEFAULT_BUILD_ASSEMBLIES;

/**
 * Calculate dynamic material cost per LF for a wall assembly
 * Uses real catalogue prices when available
 *
 * @param {Object} assembly - Wall assembly with calculatorConfig
 * @param {number} ceilingHeight - Ceiling height in feet
 * @param {Array} materials - Materials from catalogue (optional)
 * @returns {number} - Material cost per linear foot
 */
export function calculateAssemblyMaterialCost(assembly, ceilingHeight = 9, materials = null) {
  if (!assembly.calculatorConfig) {
    // No calculator config, use fallback
    return assembly.materialCostPerUnit || 0;
  }

  try {
    const result = calculateWallMaterials({
      linearFeet: 1, // Calculate for 1 LF
      ceilingHeight,
      ...assembly.calculatorConfig,
      materials: materials || getMaterials(),
    });

    // Return calculated cost per LF, or fallback if calculation failed
    return result.costPerLinearFoot > 0
      ? result.costPerLinearFoot
      : assembly.materialCostPerUnit || 0;
  } catch (error) {
    console.warn('Failed to calculate assembly material cost:', error);
    return assembly.materialCostPerUnit || 0;
  }
}

/**
 * Get detailed material breakdown for a wall assembly
 * Useful for material lists and quotes
 *
 * @param {Object} assembly - Wall assembly with calculatorConfig
 * @param {number} linearFeet - Total linear feet of wall
 * @param {number} ceilingHeight - Ceiling height in feet
 * @param {Array} materials - Materials from catalogue (optional)
 * @returns {Object} - Full calculation result with materials list
 */
export function getAssemblyMaterialBreakdown(assembly, linearFeet, ceilingHeight = 9, materials = null) {
  if (!assembly.calculatorConfig) {
    return {
      materials: [],
      totalCost: linearFeet * (assembly.materialCostPerUnit || 0),
      costPerLinearFoot: assembly.materialCostPerUnit || 0,
      source: 'fallback',
    };
  }

  try {
    const result = calculateWallMaterials({
      linearFeet,
      ceilingHeight,
      ...assembly.calculatorConfig,
      materials: materials || getMaterials(),
    });

    return {
      ...result,
      source: 'catalogue',
    };
  } catch (error) {
    console.warn('Failed to get assembly material breakdown:', error);
    return {
      materials: [],
      totalCost: linearFeet * (assembly.materialCostPerUnit || 0),
      costPerLinearFoot: assembly.materialCostPerUnit || 0,
      source: 'fallback',
    };
  }
}

/**
 * Scope items for instance-based estimating
 * Maps to contractor intake schema items
 */
export const SCOPE_ITEMS = {
  // Structural Framing - Floors, Walls, Ceilings, Roof (BulkAddMode)
  structure: {
    name: 'Structural Framing',
    mode: 'bulk',
    items: [
      // Wall Framing
      { id: 'fr-ext', name: 'Exterior Walls', unit: 'lf', convertToSF: true },
      { id: 'fr-int', name: 'Interior Walls', unit: 'lf', convertToSF: true },
      { id: 'fr-bearing', name: 'Bearing Walls', unit: 'lf', convertToSF: true },
      // Floor Framing
      { id: 'fr-floor', name: 'Floor Framing', unit: 'sf' },
      { id: 'fr-subfloor', name: 'Subfloor Sheathing', unit: 'sf' },
      // Ceiling/Roof Framing
      { id: 'fr-ceil', name: 'Ceiling Framing', unit: 'sf' },
      { id: 'fr-roof', name: 'Roof Framing', unit: 'sf' },
      { id: 'fr-truss', name: 'Roof Trusses', unit: 'ea' },
    ],
  },
  // Windows & Doors (TallyMode)
  openings: {
    name: 'Openings',
    mode: 'tally',
    items: [
      { id: 'wd-win-std', name: 'Windows (Standard)', unit: 'ea', defaultCost: 650 },
      { id: 'wd-win-lrg', name: 'Windows (Large)', unit: 'ea', defaultCost: 1100 },
      { id: 'wd-win-bsmt', name: 'Windows (Basement)', unit: 'ea', defaultCost: 450 },
      { id: 'wd-ext-door', name: 'Exterior Doors', unit: 'ea', defaultCost: 1200 },
      { id: 'wd-int-door', name: 'Interior Doors', unit: 'ea', defaultCost: 400 },
      { id: 'wd-patio', name: 'Patio/Sliding Doors', unit: 'ea', defaultCost: 2500 },
      { id: 'wd-garage', name: 'Garage Doors', unit: 'ea', defaultCost: 1800 },
    ],
  },
  // Finishes - Drywall, Flooring (BulkAddMode by area)
  surfaces: {
    name: 'Finishes',
    mode: 'bulk',
    items: [
      { id: 'dw-ceil', name: 'Drywall Ceilings', unit: 'sf' },
      { id: 'dw-walls', name: 'Drywall Walls', unit: 'sf' },
      { id: 'fl-lvp', name: 'LVP/Laminate Flooring', unit: 'sf' },
      { id: 'fl-hardwood', name: 'Hardwood Flooring', unit: 'sf' },
      { id: 'fl-tile', name: 'Tile Flooring', unit: 'sf' },
      { id: 'fl-carpet', name: 'Carpet', unit: 'sf' },
    ],
  },
  // MEP (TallyMode for fixtures, allowances for systems)
  mep: {
    name: 'MEP',
    mode: 'tally',
    items: [
      { id: 'el-outlet', name: 'Outlets/Switches', unit: 'ea', defaultCost: 150 },
      { id: 'el-light', name: 'Light Fixtures', unit: 'ea', defaultCost: 200 },
      { id: 'pl-toilet', name: 'Toilets', unit: 'ea', defaultCost: 600 },
      { id: 'pl-sink', name: 'Sinks', unit: 'ea', defaultCost: 500 },
      { id: 'pl-tub', name: 'Tub/Shower', unit: 'ea', defaultCost: 1500 },
      { id: 'hv-register', name: 'HVAC Registers', unit: 'ea', defaultCost: 100 },
    ],
  },
};

/**
 * Get available levels from project intake data
 */
export function getLevelsFromProject(project) {
  const levels = [];

  // Determine storeys from intake data
  const storeys = project?.layout?.storeys || project?.storeys || '1';
  const hasBasement = project?.layout?.basement_finish !== 'none' &&
                      project?.layout?.basement_finish !== undefined;

  // Add basement if applicable
  if (hasBasement || project?.site?.foundation_type === 'full_basement' ||
      project?.site?.foundation_type === 'walkout_basement') {
    levels.push({ value: 'basement', label: 'Basement' });
  }

  // Add main floor (always present)
  levels.push({ value: 'main', label: 'Main Floor' });

  // Add upper floors based on storeys
  const numStoreys = parseFloat(storeys);
  if (numStoreys >= 1.5) {
    levels.push({ value: 'second', label: '2nd Floor' });
  }
  if (numStoreys >= 2.5 || numStoreys >= 3) {
    levels.push({ value: 'third', label: '3rd Floor' });
  }

  return levels;
}

/**
 * Calculate wall SF from linear feet and height
 */
export function calculateWallSF(lengthLF, heightFt) {
  return Math.round(lengthLF * heightFt);
}

/**
 * Create a new instance
 */
export function createInstance({
  scopeItemId,
  level,
  location = '',
  measurement,
  assemblyId = null,
  notes = '',
}) {
  return {
    id: `inst-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    scopeItemId,
    level,
    location,
    measurement,
    assemblyId,
    notes,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Calculate cost for a single instance
 */
export function calculateInstanceCost(instance, assemblies, ceilingHeight, catalogueData) {
  const scopeItem = Object.values(SCOPE_ITEMS)
    .flatMap(cat => cat.items)
    .find(item => item.id === instance.scopeItemId);

  if (!scopeItem) return { labor: 0, materials: 0, total: 0, quantity: 0 };

  // Get the linear feet measurement
  const linearFeet = instance.measurement || 0;

  // Determine effective ceiling height for this instance
  let effectiveHeight = 9; // default
  if (typeof ceilingHeight === 'object' && ceilingHeight !== null) {
    // It's a per-level object like { basement: 8, main: 9, second: 8 }
    effectiveHeight = ceilingHeight[instance.level] || 9;
  } else if (typeof ceilingHeight === 'number') {
    effectiveHeight = ceilingHeight;
  }

  // Calculate quantity - for walls this is now LF (not SF)
  // We keep LF for wall calculations since material pricing is per LF
  let quantity = linearFeet;
  let displayUnit = scopeItem.unit;

  // Find assembly if specified
  const assembly = assemblies?.find(a => a.id === instance.assemblyId);

  let laborCost = 0;
  let materialsCost = 0;

  if (assembly) {
    // Check if assembly is from the new database (has source: 'database')
    if (assembly.source === 'database') {
      // New database assemblies have different field names
      // Pricing is per unit (sf for walls, lf for linear items, etc.)
      laborCost = (assembly.laborCostPerUnit || assembly.laborCost || 0) * quantity;
      materialsCost = (assembly.materialCostPerUnit || assembly.materialsCost || 0) * quantity;
      displayUnit = assembly.unit || 'sf';
    } else if (assembly.calculatorConfig) {
      // Use dynamic material pricing from Cost Catalogue
      const dynamicMaterialCost = calculateAssemblyMaterialCost(
        assembly,
        effectiveHeight,
        catalogueData?.materials
      );
      materialsCost = dynamicMaterialCost * linearFeet;

      // Labor is still from assembly (per LF)
      laborCost = (assembly.laborCostPerUnit || 0) * linearFeet;
      displayUnit = 'lf';
    } else if (scopeItem.convertToSF) {
      // Legacy SF-based pricing
      const sfQuantity = calculateWallSF(linearFeet, effectiveHeight);
      laborCost = (assembly.laborCostPerUnit || assembly.laborCost || 0) * sfQuantity;
      materialsCost = (assembly.materialCostPerUnit || assembly.materialsCost || 0) * sfQuantity;
      quantity = sfQuantity;
      displayUnit = 'sf';
    } else {
      // Standard per-unit pricing
      laborCost = (assembly.laborCostPerUnit || assembly.laborCost || 0) * quantity;
      materialsCost = (assembly.materialCostPerUnit || assembly.materialsCost || 0) * quantity;
    }
  } else if (scopeItem.defaultCost) {
    // For tally items, use default cost
    laborCost = scopeItem.defaultCost * 0.4 * quantity;
    materialsCost = scopeItem.defaultCost * 0.6 * quantity;
  } else {
    // Try to get from catalogue
    const catalogueRate = catalogueData?.laborRates?.[scopeItem.id];
    if (catalogueRate) {
      laborCost = (catalogueRate.rate || 0) * quantity;
    }
  }

  return {
    labor: Math.round(laborCost * 100) / 100,
    materials: Math.round(materialsCost * 100) / 100,
    total: Math.round((laborCost + materialsCost) * 100) / 100,
    quantity,
    linearFeet, // Include original LF for reference
    ceilingHeight: effectiveHeight,
    unit: displayUnit,
  };
}

/**
 * Group instances by scope item and calculate totals
 */
export function summarizeInstances(instances, assemblies, ceilingHeight, catalogueData) {
  const summary = {};

  instances.forEach(instance => {
    if (!summary[instance.scopeItemId]) {
      const scopeItem = Object.values(SCOPE_ITEMS)
        .flatMap(cat => cat.items)
        .find(item => item.id === instance.scopeItemId);

      summary[instance.scopeItemId] = {
        scopeItemId: instance.scopeItemId,
        name: scopeItem?.name || instance.scopeItemId,
        instances: [],
        totalQuantity: 0,
        totalLabor: 0,
        totalMaterials: 0,
        totalCost: 0,
        byLevel: {},
      };
    }

    const cost = calculateInstanceCost(instance, assemblies, ceilingHeight, catalogueData);

    summary[instance.scopeItemId].instances.push({
      ...instance,
      ...cost,
    });
    summary[instance.scopeItemId].totalQuantity += cost.quantity;
    summary[instance.scopeItemId].totalLabor += cost.labor;
    summary[instance.scopeItemId].totalMaterials += cost.materials;
    summary[instance.scopeItemId].totalCost += cost.total;

    // Track by level
    if (!summary[instance.scopeItemId].byLevel[instance.level]) {
      summary[instance.scopeItemId].byLevel[instance.level] = {
        quantity: 0,
        cost: 0,
      };
    }
    summary[instance.scopeItemId].byLevel[instance.level].quantity += cost.quantity;
    summary[instance.scopeItemId].byLevel[instance.level].cost += cost.total;
  });

  return summary;
}

/**
 * Convert instances to line items (for compatibility with existing system)
 */
export function generateLineItemsFromInstances(instances, assemblies, ceilingHeight, catalogueData) {
  const summary = summarizeInstances(instances, assemblies, ceilingHeight, catalogueData);

  return Object.values(summary).map(item => {
    const basePrice = item.totalCost / (item.totalQuantity || 1);

    return {
      id: `li-${item.scopeItemId}`,
      name: item.name,
      description: `${item.instances.length} instance(s) across levels`,
      quantity: item.totalQuantity,
      unit: item.instances[0]?.unit || 'ea',
      unitPriceGood: basePrice,
      unitPriceBetter: basePrice * BUILD_TIERS.better.multiplier,
      unitPriceBest: basePrice * BUILD_TIERS.best.multiplier,
      materialsCost: item.totalMaterials,
      laborCost: item.totalLabor,
      tradeCode: getTradeCodeFromScopeItem(item.scopeItemId),
      room: 'project',
      category: getCategoryFromScopeItem(item.scopeItemId),
      // Store instance reference for drill-down
      instanceIds: item.instances.map(i => i.id),
      byLevel: item.byLevel,
    };
  });
}

/**
 * Get trade code from scope item ID
 */
function getTradeCodeFromScopeItem(scopeItemId) {
  const prefix = scopeItemId.split('-')[0];
  const tradeMap = {
    fr: 'FR', // Framing
    wd: 'WD', // Windows & Doors
    dw: 'DW', // Drywall
    fl: 'FL', // Flooring
    el: 'EL', // Electrical
    pl: 'PL', // Plumbing
    hv: 'HV', // HVAC
  };
  return tradeMap[prefix] || 'GN';
}

/**
 * Get category from scope item ID
 */
function getCategoryFromScopeItem(scopeItemId) {
  for (const [category, data] of Object.entries(SCOPE_ITEMS)) {
    if (data.items.some(item => item.id === scopeItemId)) {
      return data.name;
    }
  }
  return 'Other';
}

/**
 * Calculate grand totals from instances
 */
export function calculateInstanceTotals(instances, assemblies, ceilingHeight, catalogueData) {
  const summary = summarizeInstances(instances, assemblies, ceilingHeight, catalogueData);

  // Safety helper to ensure we're adding valid numbers
  const safeNumber = (val) => {
    const num = Number(val);
    return isNaN(num) || !isFinite(num) ? 0 : num;
  };

  let totalLabor = 0;
  let totalMaterials = 0;

  Object.values(summary).forEach(item => {
    totalLabor += safeNumber(item.totalLabor);
    totalMaterials += safeNumber(item.totalMaterials);
  });

  const baseCost = totalLabor + totalMaterials;

  return {
    labor: Math.round(totalLabor * 100) / 100,
    materials: Math.round(totalMaterials * 100) / 100,
    good: Math.round(baseCost * 100) / 100,
    better: Math.round(baseCost * BUILD_TIERS.better.multiplier * 100) / 100,
    best: Math.round(baseCost * BUILD_TIERS.best.multiplier * 100) / 100,
  };
}

/**
 * Initialize tally counts from levels
 */
export function initializeTallyCounts(levels, scopeItems) {
  const counts = {};

  scopeItems.forEach(item => {
    counts[item.id] = {};
    levels.forEach(level => {
      counts[item.id][level.value] = 0;
    });
  });

  return counts;
}

/**
 * Convert tally counts to instances
 */
export function tallyCountsToInstances(tallyCounts) {
  const instances = [];

  Object.entries(tallyCounts).forEach(([scopeItemId, levelCounts]) => {
    Object.entries(levelCounts).forEach(([level, count]) => {
      if (count > 0) {
        instances.push(createInstance({
          scopeItemId,
          level,
          measurement: count,
        }));
      }
    });
  });

  return instances;
}

/**
 * Save assembly as template to localStorage
 */
export function saveAssemblyTemplate(assembly) {
  const templates = JSON.parse(localStorage.getItem('hooomz_assembly_templates') || '[]');

  const existing = templates.findIndex(t => t.id === assembly.id);
  if (existing >= 0) {
    templates[existing] = { ...assembly, updatedAt: new Date().toISOString() };
  } else {
    templates.push({ ...assembly, createdAt: new Date().toISOString() });
  }

  localStorage.setItem('hooomz_assembly_templates', JSON.stringify(templates));
  return templates;
}

/**
 * Load assembly templates from localStorage
 * Returns legacy build assemblies for backwards compatibility
 * New code should use assembliesDatabase.js directly
 */
export function loadAssemblyTemplates() {
  const templates = JSON.parse(localStorage.getItem('hooomz_assembly_templates') || '[]');
  return [...DEFAULT_BUILD_ASSEMBLIES, ...templates];
}

/**
 * Convert a new database assembly to the legacy format
 * Used for compatibility with existing estimate calculations
 */
export function convertDatabaseAssemblyToLegacy(dbAssembly) {
  return {
    id: dbAssembly.id,
    name: dbAssembly.name,
    description: dbAssembly.description,
    category: dbAssembly.category,
    unit: dbAssembly.unit,
    laborCostPerUnit: dbAssembly.laborCost,
    materialCostPerUnit: dbAssembly.materialCost,
    totalCostPerUnit: dbAssembly.totalCost,
    laborHours: dbAssembly.laborHours,
    components: dbAssembly.components,
    codeReference: dbAssembly.codeReference,
    notes: dbAssembly.notes,
    confidence: dbAssembly.confidence,
    source: 'database',
  };
}
