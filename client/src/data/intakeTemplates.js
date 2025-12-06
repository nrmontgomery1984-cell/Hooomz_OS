/**
 * HOOOMZ Intake Templates
 *
 * Templates define:
 * 1. Default tasks for each room/scope type
 * 2. Pricing ranges by tier
 * 3. Spec defaults by build tier
 *
 * These templates generate Loops and Tasks when intake is finalized.
 */

// ============================================================================
// PRICING RANGES (NB 2025 Ballpark)
// ============================================================================

export const PRICING = {
  // Kitchen - by reno tier and build tier
  kitchen: {
    refresh: { good: [8000, 12000], better: [15000, 22000], best: [25000, 35000] },
    full: { good: [25000, 35000], better: [45000, 65000], best: [75000, 120000] },
  },
  primary_bath: {
    refresh: { good: [4000, 6000], better: [7000, 10000], best: [12000, 18000] },
    full: { good: [15000, 20000], better: [25000, 35000], best: [40000, 60000] },
  },
  secondary_bath: {
    refresh: { good: [2500, 4000], better: [4500, 6500], best: [7000, 10000] },
    full: { good: [10000, 14000], better: [16000, 22000], best: [24000, 32000] },
  },
  powder_room: {
    refresh: { good: [1500, 2500], better: [3000, 4500], best: [5000, 7500] },
    full: { good: [5000, 7000], better: [8000, 11000], best: [12000, 16000] },
  },
  // Basement - fixed for refresh, per sqft for full finish
  basement: {
    refresh: { good: [3000, 5000], better: [6000, 9000], best: [10000, 15000] },
    full_per_sqft: { good: [35, 45], better: [50, 65], best: [75, 100] },
  },
  // Living spaces - per sqft
  living_spaces: {
    refresh_per_sqft: { good: [2, 3], better: [4, 6], best: [8, 12] },
    full_per_sqft: { good: [12, 18], better: [22, 30], best: [35, 50] },
  },
  laundry: {
    refresh: { good: [800, 1500], better: [2000, 3000], best: [3500, 5000] },
    full: { good: [5000, 7000], better: [8000, 12000], best: [14000, 20000] },
  },
  mudroom: {
    refresh: { good: [600, 1200], better: [1500, 2500], best: [3000, 5000] },
    full: { good: [4000, 6000], better: [7000, 10000], best: [12000, 18000] },
  },
  // Exterior - fixed for refresh, per sqft wall area for full
  exterior: {
    refresh: { good: [2000, 4000], better: [5000, 10000], best: [12000, 20000] },
    full_per_sqft: { good: [12, 18], better: [20, 28], best: [30, 45] },
  },
};

// ============================================================================
// ROOM TEMPLATES - Default tasks by room type and reno tier
// ============================================================================

export const ROOM_TEMPLATES = {
  // -------------------------------------------------------------------------
  // KITCHEN
  // -------------------------------------------------------------------------
  kitchen: {
    loopName: 'Kitchen',
    category: 'CM',
    refresh: {
      defaults: [
        { title: 'Protect floors and adjacent areas', category: 'GN' },
        { title: 'Remove existing countertops', category: 'CM' },
        { title: 'Install new countertops', category: 'CM' },
        { title: 'Install backsplash', category: 'TL' },
        { title: 'Paint cabinets or install new doors', category: 'CM' },
        { title: 'Replace hardware', category: 'CM' },
        { title: 'Update lighting fixtures', category: 'EL' },
        { title: 'Replace faucet', category: 'PL' },
        { title: 'Touch up paint', category: 'PT' },
        { title: 'Final clean', category: 'GN' },
      ],
      addons: [
        { title: 'Replace sink', category: 'PL' },
        { title: 'Replace appliances', category: 'GN' },
        { title: 'Under-cabinet lighting', category: 'EL' },
      ],
    },
    full: {
      defaults: [
        { title: 'Demo existing kitchen', category: 'GN' },
        { title: 'Rough plumbing relocations', category: 'PL', subcategory: 'PL-01' },
        { title: 'Rough electrical relocations', category: 'EL', subcategory: 'EL-01' },
        { title: 'Frame any wall changes', category: 'FI' },
        { title: 'Install drywall', category: 'DW' },
        { title: 'Prime and paint walls', category: 'PT' },
        { title: 'Install flooring', category: 'FL' },
        { title: 'Install cabinets', category: 'CM', subcategory: 'CM-01' },
        { title: 'Install countertops', category: 'CM', subcategory: 'CM-03' },
        { title: 'Install backsplash', category: 'TL' },
        { title: 'Install sink and faucet', category: 'PL', subcategory: 'PL-02' },
        { title: 'Install appliances', category: 'GN' },
        { title: 'Trim electrical - outlets, switches, lights', category: 'EL', subcategory: 'EL-02' },
        { title: 'Install trim and casing', category: 'FC' },
        { title: 'Final paint touch-ups', category: 'PT' },
        { title: 'Final clean and punch list', category: 'FZ' },
      ],
      addons: [
        { title: 'Island with plumbing', category: 'PL' },
        { title: 'Pot filler', category: 'PL' },
        { title: 'Custom range hood', category: 'CM' },
        { title: 'Pantry build-out', category: 'FC' },
      ],
    },
  },

  // -------------------------------------------------------------------------
  // PRIMARY BATHROOM
  // -------------------------------------------------------------------------
  primary_bath: {
    loopName: 'Primary Bathroom',
    category: 'PL',
    refresh: {
      defaults: [
        { title: 'Protect floors and adjacent areas', category: 'GN' },
        { title: 'Replace vanity', category: 'CM', subcategory: 'CM-02' },
        { title: 'Replace faucet', category: 'PL' },
        { title: 'Replace toilet', category: 'PL' },
        { title: 'Replace mirror and accessories', category: 'GN' },
        { title: 'Update lighting', category: 'EL' },
        { title: 'Paint walls and ceiling', category: 'PT' },
        { title: 'Re-caulk tub/shower', category: 'TL' },
        { title: 'Final clean', category: 'GN' },
      ],
      addons: [
        { title: 'Install new exhaust fan', category: 'HV' },
        { title: 'Replace shower door', category: 'GN' },
      ],
    },
    full: {
      defaults: [
        { title: 'Demo existing bathroom', category: 'GN' },
        { title: 'Rough plumbing', category: 'PL', subcategory: 'PL-01' },
        { title: 'Rough electrical', category: 'EL', subcategory: 'EL-01' },
        { title: 'Frame any layout changes', category: 'FI' },
        { title: 'Install tub/shower pan', category: 'PL' },
        { title: 'Tile waterproofing', category: 'TL', subcategory: 'TL-02' },
        { title: 'Install wall tile', category: 'TL', subcategory: 'TL-03' },
        { title: 'Install drywall on non-wet walls', category: 'DW' },
        { title: 'Install floor tile', category: 'TL', subcategory: 'TL-03' },
        { title: 'Grout and seal', category: 'TL', subcategory: 'TL-04' },
        { title: 'Install vanity', category: 'CM', subcategory: 'CM-02' },
        { title: 'Install toilet', category: 'PL', subcategory: 'PL-02' },
        { title: 'Install shower door/curtain rod', category: 'GN' },
        { title: 'Trim electrical', category: 'EL', subcategory: 'EL-02' },
        { title: 'Install accessories (mirror, towel bars)', category: 'GN' },
        { title: 'Paint', category: 'PT' },
        { title: 'Final clean and punch list', category: 'FZ' },
      ],
      addons: [
        { title: 'Heated floor', category: 'EL' },
        { title: 'Freestanding tub', category: 'PL' },
        { title: 'Body sprays', category: 'PL' },
        { title: 'Custom glass enclosure', category: 'GN' },
      ],
    },
  },

  // -------------------------------------------------------------------------
  // SECONDARY BATHROOM
  // -------------------------------------------------------------------------
  secondary_bath: {
    loopName: 'Secondary Bathroom',
    category: 'PL',
    refresh: {
      defaults: [
        { title: 'Protect floors and adjacent areas', category: 'GN' },
        { title: 'Replace vanity', category: 'CM', subcategory: 'CM-02' },
        { title: 'Replace faucet', category: 'PL' },
        { title: 'Replace toilet', category: 'PL' },
        { title: 'Update lighting', category: 'EL' },
        { title: 'Paint', category: 'PT' },
        { title: 'Re-caulk tub/shower', category: 'TL' },
        { title: 'Final clean', category: 'GN' },
      ],
      addons: [],
    },
    full: {
      defaults: [
        { title: 'Demo existing bathroom', category: 'GN' },
        { title: 'Rough plumbing', category: 'PL', subcategory: 'PL-01' },
        { title: 'Rough electrical', category: 'EL', subcategory: 'EL-01' },
        { title: 'Install tub/shower', category: 'PL' },
        { title: 'Tile/surround installation', category: 'TL' },
        { title: 'Drywall', category: 'DW' },
        { title: 'Floor tile or vinyl', category: 'FL' },
        { title: 'Install vanity and toilet', category: 'PL', subcategory: 'PL-02' },
        { title: 'Trim electrical', category: 'EL', subcategory: 'EL-02' },
        { title: 'Paint and accessories', category: 'PT' },
        { title: 'Final clean and punch list', category: 'FZ' },
      ],
      addons: [],
    },
  },

  // -------------------------------------------------------------------------
  // POWDER ROOM
  // -------------------------------------------------------------------------
  powder_room: {
    loopName: 'Powder Room',
    category: 'PL',
    refresh: {
      defaults: [
        { title: 'Replace vanity or pedestal sink', category: 'PL' },
        { title: 'Replace faucet', category: 'PL' },
        { title: 'Update lighting and mirror', category: 'EL' },
        { title: 'Paint', category: 'PT' },
        { title: 'Final clean', category: 'GN' },
      ],
      addons: [
        { title: 'Replace flooring', category: 'FL' },
      ],
    },
    full: {
      defaults: [
        { title: 'Demo existing powder room', category: 'GN' },
        { title: 'Rough plumbing', category: 'PL', subcategory: 'PL-01' },
        { title: 'Rough electrical', category: 'EL', subcategory: 'EL-01' },
        { title: 'Drywall', category: 'DW' },
        { title: 'Install flooring', category: 'FL' },
        { title: 'Install vanity/sink and toilet', category: 'PL', subcategory: 'PL-02' },
        { title: 'Trim electrical', category: 'EL', subcategory: 'EL-02' },
        { title: 'Paint and accessories', category: 'PT' },
        { title: 'Final clean', category: 'FZ' },
      ],
      addons: [],
    },
  },

  // -------------------------------------------------------------------------
  // BASEMENT
  // -------------------------------------------------------------------------
  basement: {
    loopName: 'Basement',
    category: 'FI',
    refresh: {
      defaults: [
        { title: 'Assess moisture and address issues', category: 'FN' },
        { title: 'Paint concrete floor or install area rugs', category: 'PT' },
        { title: 'Paint walls', category: 'PT' },
        { title: 'Update lighting', category: 'EL' },
        { title: 'Organize and declutter', category: 'GN' },
        { title: 'Final clean', category: 'GN' },
      ],
      addons: [
        { title: 'Install dehumidifier', category: 'HV' },
        { title: 'Epoxy floor coating', category: 'FL' },
      ],
    },
    full: {
      defaults: [
        { title: 'Design layout and obtain permits', category: 'GN' },
        { title: 'Address any moisture issues', category: 'FN' },
        { title: 'Frame walls and bulkheads', category: 'FI', subcategory: 'FI-01' },
        { title: 'Rough plumbing (if bathroom)', category: 'PL', subcategory: 'PL-01' },
        { title: 'Rough electrical', category: 'EL', subcategory: 'EL-01' },
        { title: 'Rough HVAC', category: 'HV', subcategory: 'HV-01' },
        { title: 'Insulate exterior walls', category: 'IA' },
        { title: 'Drywall', category: 'DW' },
        { title: 'Install flooring', category: 'FL' },
        { title: 'Paint', category: 'PT' },
        { title: 'Trim electrical', category: 'EL', subcategory: 'EL-02' },
        { title: 'Install doors and trim', category: 'FC' },
        { title: 'Final clean and punch list', category: 'FZ' },
      ],
      addons: [
        { title: 'Basement bathroom', category: 'PL' },
        { title: 'Wet bar/kitchenette', category: 'PL' },
        { title: 'Home theatre setup', category: 'EL' },
        { title: 'Egress window', category: 'EE' },
      ],
    },
  },

  // -------------------------------------------------------------------------
  // LAUNDRY ROOM
  // -------------------------------------------------------------------------
  laundry: {
    loopName: 'Laundry Room',
    category: 'PL',
    refresh: {
      defaults: [
        { title: 'Paint walls', category: 'PT' },
        { title: 'Replace faucet', category: 'PL' },
        { title: 'Update lighting', category: 'EL' },
        { title: 'Add shelving or organization', category: 'FC' },
        { title: 'Final clean', category: 'GN' },
      ],
      addons: [],
    },
    full: {
      defaults: [
        { title: 'Demo existing laundry area', category: 'GN' },
        { title: 'Rough plumbing', category: 'PL', subcategory: 'PL-01' },
        { title: 'Rough electrical (including dryer circuit)', category: 'EL', subcategory: 'EL-01' },
        { title: 'Drywall', category: 'DW' },
        { title: 'Install flooring', category: 'FL' },
        { title: 'Install cabinets and countertop', category: 'CM' },
        { title: 'Install laundry sink', category: 'PL', subcategory: 'PL-02' },
        { title: 'Trim electrical', category: 'EL', subcategory: 'EL-02' },
        { title: 'Paint', category: 'PT' },
        { title: 'Connect washer/dryer', category: 'PL' },
        { title: 'Final clean', category: 'FZ' },
      ],
      addons: [],
    },
  },

  // -------------------------------------------------------------------------
  // MUDROOM
  // -------------------------------------------------------------------------
  mudroom: {
    loopName: 'Mudroom/Entry',
    category: 'FC',
    refresh: {
      defaults: [
        { title: 'Paint walls', category: 'PT' },
        { title: 'Add hooks and storage', category: 'FC' },
        { title: 'Update lighting', category: 'EL' },
        { title: 'Replace flooring or add mat', category: 'FL' },
        { title: 'Final clean', category: 'GN' },
      ],
      addons: [],
    },
    full: {
      defaults: [
        { title: 'Demo existing entry', category: 'GN' },
        { title: 'Frame any layout changes', category: 'FI' },
        { title: 'Rough electrical', category: 'EL', subcategory: 'EL-01' },
        { title: 'Drywall', category: 'DW' },
        { title: 'Install flooring (durable/waterproof)', category: 'FL' },
        { title: 'Install built-in storage/cubbies', category: 'FC', subcategory: 'FC-05' },
        { title: 'Install bench', category: 'FC' },
        { title: 'Trim electrical', category: 'EL', subcategory: 'EL-02' },
        { title: 'Paint', category: 'PT' },
        { title: 'Final clean', category: 'FZ' },
      ],
      addons: [],
    },
  },

  // -------------------------------------------------------------------------
  // EXTERIOR (SIDING/ENVELOPE)
  // -------------------------------------------------------------------------
  exterior: {
    loopName: 'Exterior',
    category: 'EE',
    refresh: {
      defaults: [
        { title: 'Power wash existing siding', category: 'GN' },
        { title: 'Repair damaged sections', category: 'EE' },
        { title: 'Caulk and seal openings', category: 'EE' },
        { title: 'Paint or touch up', category: 'PT' },
        { title: 'Clean gutters', category: 'RF' },
        { title: 'Final inspection', category: 'GN' },
      ],
      addons: [
        { title: 'Replace trim boards', category: 'EE' },
        { title: 'Install new exterior lighting', category: 'EL' },
      ],
    },
    full: {
      defaults: [
        { title: 'Set up scaffolding/access', category: 'GN' },
        { title: 'Remove existing siding', category: 'EE' },
        { title: 'Inspect/repair sheathing', category: 'EE' },
        { title: 'Install house wrap/WRB', category: 'EE', subcategory: 'EE-01' },
        { title: 'Install window/door flashing', category: 'EE' },
        { title: 'Install new siding', category: 'EE', subcategory: 'EE-04' },
        { title: 'Install exterior trim', category: 'EE', subcategory: 'EE-03' },
        { title: 'Caulk and seal', category: 'EE' },
        { title: 'Paint exterior', category: 'PT' },
        { title: 'Clean up and final inspection', category: 'GN' },
      ],
      addons: [
        { title: 'Stone/masonry accents', category: 'EE' },
        { title: 'New soffit and fascia', category: 'EE' },
        { title: 'New gutters and downspouts', category: 'RF' },
      ],
    },
  },
};

// ============================================================================
// SPEC DEFAULTS BY BUILD TIER
// ============================================================================

export const TIER_SPECS = {
  kitchen: {
    good: {
      cabinets: 'Modular box store',
      countertops: 'Laminate',
      backsplash: '4" splash',
      hardware: 'Basic',
      faucet: 'Chrome single-handle',
      sink: 'Stainless drop-in',
    },
    better: {
      cabinets: 'Semi-custom, soft-close',
      countertops: 'Entry-level quartz',
      backsplash: 'Full tile',
      hardware: 'Brushed nickel/black',
      faucet: 'Pull-down sprayer',
      sink: 'Undermount stainless',
    },
    best: {
      cabinets: 'Custom to ceiling, plywood box',
      countertops: 'Premium quartz/granite',
      backsplash: 'Designer tile to ceiling',
      hardware: 'Premium selections',
      faucet: 'High-end touchless',
      sink: 'Farmhouse or workstation',
    },
  },
  bathroom: {
    good: {
      vanity: 'Stock 24-36"',
      vanity_top: 'Laminate or cultured marble',
      tile: 'Basic ceramic',
      tub_shower: 'Acrylic insert',
      toilet: 'Standard round',
      faucet: 'Chrome basic',
    },
    better: {
      vanity: 'Semi-custom 48-60"',
      vanity_top: 'Quartz',
      tile: 'Porcelain, accent strip',
      tub_shower: 'Acrylic base + tile walls',
      toilet: 'Elongated, soft-close',
      faucet: 'Brushed nickel widespread',
    },
    best: {
      vanity: 'Custom double vanity',
      vanity_top: 'Premium quartz',
      tile: 'Large format, niche, bench',
      tub_shower: 'Fully tiled, linear drain',
      toilet: 'Wall-hung or high-end',
      faucet: 'Premium finish, waterfall',
    },
  },
  flooring: {
    good: {
      main_living: 'LVP entry-level',
      bedrooms: 'Carpet basic',
      bathrooms: 'Vinyl sheet or LVT',
    },
    better: {
      main_living: 'LVP mid-grade or laminate',
      bedrooms: 'Upgraded carpet with pad',
      bathrooms: 'Porcelain tile',
    },
    best: {
      main_living: 'Engineered hardwood or premium LVP',
      bedrooms: 'Same as main or premium carpet',
      bathrooms: 'Large format porcelain',
    },
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get price range for a room
 */
export function getPriceRange(roomType, renoTier, buildTier, sqft = null) {
  const roomPricing = PRICING[roomType];
  if (!roomPricing) return null;

  // Handle per-sqft pricing
  if (sqft && roomPricing[`${renoTier}_per_sqft`]) {
    const perSqft = roomPricing[`${renoTier}_per_sqft`][buildTier];
    if (perSqft) {
      return [perSqft[0] * sqft, perSqft[1] * sqft];
    }
  }

  // Handle fixed pricing
  const tierPricing = roomPricing[renoTier];
  if (tierPricing && tierPricing[buildTier]) {
    return tierPricing[buildTier];
  }

  return null;
}

/**
 * Get template for a room
 */
export function getRoomTemplate(roomType, renoTier) {
  const template = ROOM_TEMPLATES[roomType];
  if (!template) return null;

  const tierTemplate = template[renoTier];
  if (!tierTemplate) return null;

  return {
    loopName: template.loopName,
    category: template.category,
    defaults: tierTemplate.defaults,
    addons: tierTemplate.addons,
  };
}

/**
 * Generate tasks from a template
 */
export function generateTasksFromTemplate(roomType, renoTier, includeAddons = []) {
  const template = getRoomTemplate(roomType, renoTier);
  if (!template) return [];

  const tasks = [...template.defaults];

  // Add selected addons
  for (const addon of template.addons) {
    if (includeAddons.includes(addon.title)) {
      tasks.push(addon);
    }
  }

  return tasks.map((task, index) => ({
    ...task,
    display_order: index + 1,
    status: 'pending',
    source: 'template',
  }));
}

/**
 * Calculate total estimate from intake selections
 */
export function calculateEstimate(intakeData) {
  const { renovation, project } = intakeData;
  const buildTier = project?.build_tier || 'better';

  let totalLow = 0;
  let totalHigh = 0;
  const breakdown = [];

  for (const [roomType, renoTier] of Object.entries(renovation?.room_tiers || {})) {
    const range = getPriceRange(roomType, renoTier, buildTier);
    if (range) {
      totalLow += range[0];
      totalHigh += range[1];
      breakdown.push({
        room: roomType,
        tier: renoTier,
        low: range[0],
        high: range[1],
      });
    }
  }

  return {
    low: totalLow,
    high: totalHigh,
    breakdown,
    buildTier,
  };
}
