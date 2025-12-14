/**
 * Acceptance Criteria Data
 * Based on Atlantic Home Warranty standards
 *
 * These criteria define what constitutes "acceptable work" for various
 * construction tasks, providing transparency for clients.
 */

export const ACCEPTANCE_CRITERIA = [
  // Foundation & Concrete
  {
    id: 'ac-foundation-walls',
    category: 'Foundation & Concrete',
    itemType: 'Concrete Foundation Walls',
    description: 'Surface shall be free from holes or honeycombing larger than 50 mm (2 inches) in diameter or 25 mm (1 inch) deep.',
    tolerance: 'Max hole: 50mm dia / 25mm deep',
    referenceSection: 'AHW Sec 1.10',
    tradeCodes: ['CM', 'FD'],
    keywords: ['foundation', 'concrete', 'basement', 'walls', 'pour'],
  },
  {
    id: 'ac-basement-floor',
    category: 'Foundation & Concrete',
    itemType: 'Concrete Basement Floor',
    description: 'In habitable rooms, the floor shall not have pits, depressions, or unevenness exceeding 10 mm (3/8 inch) within any 1200 mm (48 inch) measurement.',
    tolerance: 'Max unevenness: 10mm in 1200mm',
    referenceSection: 'AHW Sec 1.12',
    tradeCodes: ['CM', 'FD'],
    keywords: ['basement', 'floor', 'concrete', 'slab'],
  },
  {
    id: 'ac-foundation-cracks',
    category: 'Foundation & Concrete',
    itemType: 'Foundation Crack Width',
    description: 'Cracks in poured concrete foundations shall not exceed 3 mm (1/8 inch) in width. Cracks allowing water penetration are not acceptable.',
    tolerance: 'Max crack width: 3mm',
    referenceSection: 'AHW Sec 1.11',
    tradeCodes: ['CM', 'FD'],
    keywords: ['foundation', 'crack', 'concrete', 'basement'],
  },

  // Framing
  {
    id: 'ac-wall-framing',
    category: 'Framing',
    itemType: 'Wall Framing',
    description: 'Walls shall not be out of plumb by more than 19 mm (3/4 inch) in 2.4 m (8 feet) vertical measurement.',
    tolerance: 'Max out of plumb: 19mm in 2.4m',
    referenceSection: 'AHW Sec 2.03',
    tradeCodes: ['FR', 'CM'],
    keywords: ['framing', 'wall', 'stud', 'plumb', 'exterior', 'interior'],
  },
  {
    id: 'ac-floor-framing',
    category: 'Framing',
    itemType: 'Floor Framing',
    description: 'Floors shall not be out of level by more than 19 mm (3/4 inch) in 6 m (20 feet) or proportionally in shorter spans.',
    tolerance: 'Max out of level: 19mm in 6m',
    referenceSection: 'AHW Sec 2.04',
    tradeCodes: ['FR', 'CM'],
    keywords: ['floor', 'joist', 'framing', 'level', 'subfloor'],
  },
  {
    id: 'ac-ceiling-framing',
    category: 'Framing',
    itemType: 'Ceiling Framing',
    description: 'Ceiling joists and rafters shall not have visible bow or sag exceeding 12 mm (1/2 inch) in 2.4 m (8 feet).',
    tolerance: 'Max sag: 12mm in 2.4m',
    referenceSection: 'AHW Sec 2.05',
    tradeCodes: ['FR', 'CM'],
    keywords: ['ceiling', 'joist', 'rafter', 'framing'],
  },

  // Windows & Doors
  {
    id: 'ac-interior-doors',
    category: 'Windows & Doors',
    itemType: 'Interior Doors',
    description: 'Door shall not bind on the doorjamb and the latch must engage with relative ease. Gap variance shall not exceed double the narrowest dimension.',
    tolerance: 'No binding allowed',
    referenceSection: 'AHW Sec 3.02',
    tradeCodes: ['WD', 'CM', 'FR'],
    keywords: ['door', 'interior', 'swing', 'hinge'],
  },
  {
    id: 'ac-exterior-doors',
    category: 'Windows & Doors',
    itemType: 'Exterior Doors',
    description: 'Door shall be weather-tight when closed. Weather stripping shall make contact on all sides. No daylight visible around closed door.',
    tolerance: 'Weather-tight seal required',
    referenceSection: 'AHW Sec 3.01',
    tradeCodes: ['WD', 'CM', 'FR'],
    keywords: ['door', 'exterior', 'entry', 'weather'],
  },
  {
    id: 'ac-windows',
    category: 'Windows & Doors',
    itemType: 'Windows',
    description: 'Windows shall operate freely without binding, and shall remain open at any position. Glazing shall be free from scratches visible from 1.8 m (6 feet).',
    tolerance: 'Free operation required',
    referenceSection: 'AHW Sec 3.04',
    tradeCodes: ['WD', 'CM'],
    keywords: ['window', 'glazing', 'casement', 'double-hung'],
  },

  // Exterior Finishes
  {
    id: 'ac-siding-vinyl',
    category: 'Exterior Finishes',
    itemType: 'Siding (Vinyl/Aluminum)',
    description: 'Siding shall be free from bows and waviness exceeding 12.7 mm (1/2 inch) in any 750 mm (32 inches).',
    tolerance: 'Max bow: 12.7mm in 750mm',
    referenceSection: 'AHW Sec 4.02',
    tradeCodes: ['EX', 'CM'],
    keywords: ['siding', 'vinyl', 'aluminum', 'exterior', 'cladding'],
  },
  {
    id: 'ac-roofing-shingles',
    category: 'Exterior Finishes',
    itemType: 'Roofing Shingles',
    description: 'Shingles shall be properly aligned and secured. No exposed nails or improper overlaps. Flashing must be properly installed at all penetrations.',
    tolerance: 'Proper alignment and sealing',
    referenceSection: 'AHW Sec 4.05',
    tradeCodes: ['RF', 'CM'],
    keywords: ['roof', 'shingle', 'flashing', 'roofing'],
  },
  {
    id: 'ac-soffit-fascia',
    category: 'Exterior Finishes',
    itemType: 'Soffit and Fascia',
    description: 'Joints shall be tight with gaps not exceeding 3 mm (1/8 inch). No visible warping or sagging.',
    tolerance: 'Max gap: 3mm',
    referenceSection: 'AHW Sec 4.04',
    tradeCodes: ['EX', 'CM'],
    keywords: ['soffit', 'fascia', 'overhang', 'exterior'],
  },

  // Interior Finishes - Drywall
  {
    id: 'ac-drywall-surface',
    category: 'Interior Finishes',
    itemType: 'Drywall Surface',
    description: 'Surface shall be free of blemishes (nail pops, blisters) that are readily noticeable from a distance of 1.8 m (6 feet) perpendicular to the wall.',
    tolerance: 'Viewing distance: 1.8m',
    referenceSection: 'AHW Sec 5.01',
    tradeCodes: ['DW', 'CM'],
    keywords: ['drywall', 'gypsum', 'wallboard', 'finish'],
  },
  {
    id: 'ac-drywall-joints',
    category: 'Interior Finishes',
    itemType: 'Drywall Joints/Seams',
    description: 'Joints shall not show ridges or depressions exceeding 3 mm (1/8 inch) when viewed under normal lighting from 1.8 m (6 feet).',
    tolerance: 'Max ridge/depression: 3mm',
    referenceSection: 'AHW Sec 5.02',
    tradeCodes: ['DW', 'CM'],
    keywords: ['drywall', 'joint', 'tape', 'seam', 'mud'],
  },
  {
    id: 'ac-drywall-corners',
    category: 'Interior Finishes',
    itemType: 'Drywall Corners',
    description: 'Inside and outside corners shall be straight within 6 mm (1/4 inch) in 2.4 m (8 feet) when measured with a straightedge.',
    tolerance: 'Max deviation: 6mm in 2.4m',
    referenceSection: 'AHW Sec 5.03',
    tradeCodes: ['DW', 'CM'],
    keywords: ['drywall', 'corner', 'bead', 'angle'],
  },

  // Interior Finishes - Paint
  {
    id: 'ac-painted-surfaces',
    category: 'Interior Finishes',
    itemType: 'Painted Surfaces',
    description: 'Exposed surfaces shall have a uniform appearance (colour, sheen, texture) when viewed from 1.8 m (6 feet).',
    tolerance: 'Viewing distance: 1.8m',
    referenceSection: 'AHW Sec 5.10',
    tradeCodes: ['PT', 'CM'],
    keywords: ['paint', 'coating', 'finish', 'wall', 'ceiling'],
  },
  {
    id: 'ac-paint-coverage',
    category: 'Interior Finishes',
    itemType: 'Paint Coverage',
    description: 'Paint shall provide complete coverage with no visible bare spots, drips, runs, or lap marks when viewed from 1.8 m (6 feet).',
    tolerance: 'Complete coverage required',
    referenceSection: 'AHW Sec 5.11',
    tradeCodes: ['PT', 'CM'],
    keywords: ['paint', 'coverage', 'drip', 'run'],
  },

  // Cabinets & Millwork
  {
    id: 'ac-cabinet-installation',
    category: 'Cabinets & Millwork',
    itemType: 'Cabinet Installation',
    description: 'Visible gaps where cabinets abut walls or ceilings shall not exceed 3 mm (1/8 inch).',
    tolerance: 'Max gap: 3mm',
    referenceSection: 'AHW Sec 6.01',
    tradeCodes: ['CA', 'CM', 'ML'],
    keywords: ['cabinet', 'kitchen', 'vanity', 'install'],
  },
  {
    id: 'ac-cabinet-doors',
    category: 'Cabinets & Millwork',
    itemType: 'Cabinet Doors & Drawers',
    description: 'Doors and drawers shall open and close freely without binding. Adjacent doors shall be aligned within 3 mm (1/8 inch).',
    tolerance: 'Max misalignment: 3mm',
    referenceSection: 'AHW Sec 6.02',
    tradeCodes: ['CA', 'CM', 'ML'],
    keywords: ['cabinet', 'door', 'drawer', 'hinge'],
  },
  {
    id: 'ac-trim-baseboard',
    category: 'Cabinets & Millwork',
    itemType: 'Trim & Baseboard',
    description: 'Joints shall be tight-fitting with gaps not exceeding 1.5 mm (1/16 inch). Mitered corners shall meet cleanly.',
    tolerance: 'Max gap: 1.5mm',
    referenceSection: 'AHW Sec 6.05',
    tradeCodes: ['ML', 'CM', 'FR'],
    keywords: ['trim', 'baseboard', 'moulding', 'casing'],
  },
  {
    id: 'ac-countertops',
    category: 'Cabinets & Millwork',
    itemType: 'Countertops',
    description: 'Countertops shall be level within 6 mm (1/4 inch) in any 3 m (10 feet) span. Seams shall be tight and color-matched.',
    tolerance: 'Max level variance: 6mm in 3m',
    referenceSection: 'AHW Sec 6.04',
    tradeCodes: ['CA', 'CM'],
    keywords: ['counter', 'countertop', 'granite', 'quartz', 'laminate'],
  },

  // Flooring
  {
    id: 'ac-finished-flooring',
    category: 'Flooring',
    itemType: 'Finished Flooring',
    description: 'Applied flooring shall be free of ridges or depressions exceeding 6 mm (1/4 inch) in any 813 mm (32 inches).',
    tolerance: 'Max variation: 6mm in 813mm',
    referenceSection: 'AHW Sec 7.01',
    tradeCodes: ['FL', 'CM'],
    keywords: ['floor', 'flooring', 'hardwood', 'laminate', 'vinyl', 'lvp'],
  },
  {
    id: 'ac-tile-flooring',
    category: 'Flooring',
    itemType: 'Tile Flooring',
    description: 'Tiles shall be level with adjacent tiles within 1.5 mm (1/16 inch). Grout lines shall be uniform in width within 1.5 mm (1/16 inch).',
    tolerance: 'Max lippage: 1.5mm',
    referenceSection: 'AHW Sec 7.03',
    tradeCodes: ['TL', 'FL', 'CM'],
    keywords: ['tile', 'ceramic', 'porcelain', 'grout'],
  },
  {
    id: 'ac-carpet',
    category: 'Flooring',
    itemType: 'Carpet Installation',
    description: 'Carpet shall be stretched tight without visible seams, wrinkles, or buckles. Seams shall be located away from high-traffic areas.',
    tolerance: 'No visible seams/wrinkles',
    referenceSection: 'AHW Sec 7.04',
    tradeCodes: ['FL', 'CM'],
    keywords: ['carpet', 'flooring', 'stretch'],
  },

  // Electrical
  {
    id: 'ac-electrical-outlets',
    category: 'Electrical',
    itemType: 'Electrical Outlets',
    description: 'Outlets shall be installed plumb and level. Cover plates shall fit flush against wall surface with no gaps exceeding 1.5 mm (1/16 inch).',
    tolerance: 'Max gap: 1.5mm',
    referenceSection: 'AHW Sec 8.01',
    tradeCodes: ['EL'],
    keywords: ['outlet', 'receptacle', 'electrical', 'plug'],
  },
  {
    id: 'ac-electrical-switches',
    category: 'Electrical',
    itemType: 'Light Switches',
    description: 'Switches shall operate smoothly and control intended fixtures. Multiple switches controlling the same fixture shall operate consistently.',
    tolerance: 'Proper operation required',
    referenceSection: 'AHW Sec 8.02',
    tradeCodes: ['EL'],
    keywords: ['switch', 'light', 'electrical', 'dimmer'],
  },
  {
    id: 'ac-light-fixtures',
    category: 'Electrical',
    itemType: 'Light Fixtures',
    description: 'Fixtures shall be securely mounted, level, and centered. No visible wiring or connections.',
    tolerance: 'Secure, level mounting',
    referenceSection: 'AHW Sec 8.03',
    tradeCodes: ['EL'],
    keywords: ['light', 'fixture', 'lighting', 'install'],
  },

  // Plumbing
  {
    id: 'ac-plumbing-fixtures',
    category: 'Plumbing',
    itemType: 'Plumbing Fixtures',
    description: 'Fixtures shall be securely mounted without movement. No leaks at connections. Hot water on left, cold on right.',
    tolerance: 'No leaks or movement',
    referenceSection: 'AHW Sec 9.01',
    tradeCodes: ['PL'],
    keywords: ['plumbing', 'fixture', 'faucet', 'sink', 'toilet'],
  },
  {
    id: 'ac-plumbing-drainage',
    category: 'Plumbing',
    itemType: 'Drainage',
    description: 'All drains shall empty completely without standing water or gurgling sounds. P-traps shall maintain water seal.',
    tolerance: 'Complete drainage required',
    referenceSection: 'AHW Sec 9.03',
    tradeCodes: ['PL'],
    keywords: ['drain', 'drainage', 'trap', 'waste'],
  },
  {
    id: 'ac-water-supply',
    category: 'Plumbing',
    itemType: 'Water Supply',
    description: 'Supply lines shall deliver adequate flow and pressure. No hammer, banging, or excessive noise during operation.',
    tolerance: 'Adequate flow, no noise',
    referenceSection: 'AHW Sec 9.02',
    tradeCodes: ['PL'],
    keywords: ['water', 'supply', 'pipe', 'pressure'],
  },

  // HVAC
  {
    id: 'ac-heating-system',
    category: 'Mechanical',
    itemType: 'Heating System',
    description: 'System shall be capable of maintaining 22°C in living spaces and 18°C in unfinished basements at design temperature.',
    tolerance: 'Target: 22°C / 18°C',
    referenceSection: 'AHW Sec 10.01',
    tradeCodes: ['HV', 'MC'],
    keywords: ['heating', 'furnace', 'hvac', 'heat'],
  },
  {
    id: 'ac-hvac-registers',
    category: 'Mechanical',
    itemType: 'HVAC Registers & Grilles',
    description: 'Registers shall be properly aligned with openings. Air flow shall not create whistling or excessive noise.',
    tolerance: 'Proper alignment, no noise',
    referenceSection: 'AHW Sec 10.03',
    tradeCodes: ['HV', 'MC'],
    keywords: ['register', 'grille', 'vent', 'hvac', 'duct'],
  },
  {
    id: 'ac-ductwork',
    category: 'Mechanical',
    itemType: 'Ductwork',
    description: 'Ductwork shall be properly sealed at all joints. No audible air leaks. Insulation intact on exposed sections.',
    tolerance: 'Sealed joints, no leaks',
    referenceSection: 'AHW Sec 10.04',
    tradeCodes: ['HV', 'MC'],
    keywords: ['duct', 'ductwork', 'hvac', 'air'],
  },

  // Insulation
  {
    id: 'ac-insulation',
    category: 'Insulation',
    itemType: 'Wall/Ceiling Insulation',
    description: 'Insulation shall be installed to fill cavities without compression, gaps, or voids. R-value shall meet code requirements.',
    tolerance: 'Full coverage, no voids',
    referenceSection: 'AHW Sec 2.10',
    tradeCodes: ['IN', 'FR'],
    keywords: ['insulation', 'batt', 'blown', 'r-value'],
  },
  {
    id: 'ac-vapour-barrier',
    category: 'Insulation',
    itemType: 'Vapour Barrier',
    description: 'Vapour barrier shall be continuous with all seams and penetrations properly sealed. No tears or punctures.',
    tolerance: 'Continuous, sealed',
    referenceSection: 'AHW Sec 2.11',
    tradeCodes: ['IN', 'FR'],
    keywords: ['vapour', 'barrier', 'poly', 'seal'],
  },
];

/**
 * Get all unique categories
 */
export function getCategories() {
  const categories = [...new Set(ACCEPTANCE_CRITERIA.map(c => c.category))];
  return categories.sort();
}

/**
 * Get criteria by category
 */
export function getCriteriaByCategory(category) {
  return ACCEPTANCE_CRITERIA.filter(c => c.category === category);
}

/**
 * Get criteria by trade code
 */
export function getCriteriaByTradeCode(tradeCode) {
  return ACCEPTANCE_CRITERIA.filter(c => c.tradeCodes.includes(tradeCode));
}

/**
 * Find matching criteria for a line item based on keywords and trade code
 */
export function findMatchingCriteria(lineItem) {
  const { name = '', description = '', tradeCode = '', category = '' } = lineItem;
  const searchText = `${name} ${description} ${category}`.toLowerCase();

  // Score each criteria based on matches
  const scored = ACCEPTANCE_CRITERIA.map(criteria => {
    let score = 0;

    // Trade code match is strongest
    if (tradeCode && criteria.tradeCodes.includes(tradeCode)) {
      score += 10;
    }

    // Keyword matches
    criteria.keywords.forEach(keyword => {
      if (searchText.includes(keyword.toLowerCase())) {
        score += 2;
      }
    });

    // Item type match
    if (searchText.includes(criteria.itemType.toLowerCase())) {
      score += 5;
    }

    return { ...criteria, score };
  });

  // Return criteria with score > 0, sorted by score
  return scored
    .filter(c => c.score > 0)
    .sort((a, b) => b.score - a.score);
}

/**
 * Get the best matching criteria for a line item
 */
export function getBestMatchingCriteria(lineItem) {
  const matches = findMatchingCriteria(lineItem);
  return matches.length > 0 ? matches[0] : null;
}

/**
 * Get criteria by ID
 */
export function getCriteriaById(id) {
  return ACCEPTANCE_CRITERIA.find(c => c.id === id) || null;
}

export default ACCEPTANCE_CRITERIA;
