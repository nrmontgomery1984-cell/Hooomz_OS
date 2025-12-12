/**
 * Wall Material Calculator
 *
 * Calculates material quantities and costs per linear foot of wall
 * based on ceiling height and wall type configuration.
 *
 * Standard wall framing:
 * - Bottom plate: 1 piece running horizontally
 * - Top plates: 2 pieces running horizontally (double top plate)
 * - Studs: 1 per linear foot (simplified from 16" OC)
 * - Sheathing: 4'x8' sheets (32 sq ft)
 * - Insulation: R-value batts with coverage in sq ft per bag
 */

import { getMaterials, getMaterialById } from './costCatalogue';

// Lumber dimension mappings to catalogue search patterns
// Format: { dimension: { platePattern, studPattern, lengths } }
export const LUMBER_DIMENSIONS = {
  '2x4': {
    name: '2x4',
    platePatterns: ['2x4x8 KD', '2x4x10 KD', '2x4x12 KD'],
    studPattern: '2x4x92-5/8 Stud KD', // Pre-cut stud for 8' ceiling
    genericStudPattern: '2x4x8 KD', // Fallback for other heights
    insulationWidth: 15, // inches - standard batt width for 2x4 walls
    insulationRValue: 'R12', // Typical R-value for 2x4 walls
  },
  '2x6': {
    name: '2x6',
    platePatterns: ['2x6x8 KD', '2x6x10 KD', '2x6x12 KD'],
    studPattern: '2x6x92-5/8 Stud KD',
    genericStudPattern: '2x6x8 KD',
    insulationWidth: 15,
    insulationRValue: 'R20', // Typical R-value for 2x6 walls
  },
};

// Sheathing options
export const SHEATHING_TYPES = {
  'osb': {
    name: 'OSB 7/16"',
    pattern: 'OSB 7/16" 4x8',
    sqftPerSheet: 32,
  },
  'plywood_3/8': {
    name: 'Plywood 3/8"',
    pattern: 'Plywood 3/8" Standard 4x8',
    sqftPerSheet: 32,
  },
  'plywood_5/8': {
    name: 'Plywood 5/8"',
    pattern: 'Plywood 5/8" Standard SE 4x8',
    sqftPerSheet: 32,
  },
};

// Insulation options with coverage info
export const INSULATION_TYPES = {
  'r12_batt': {
    name: 'R12 Batt',
    pattern: 'R12 15" Certainteed Batt',
    sqftPerBag: 117.5,
    forWallType: '2x4',
  },
  'r20_batt': {
    name: 'R20 Batt',
    pattern: 'R20 15" Certainteed Batt',
    sqftPerBag: 68.54,
    forWallType: '2x6',
  },
  'xps_foam': {
    name: 'XPS Foam 1"',
    pattern: 'XPS Foam 1" 4x8',
    sqftPerSheet: 32,
    forWallType: 'any',
  },
};

/**
 * Find a material in the catalogue by partial name match
 * @param {Array} materials - Array of material objects
 * @param {string} pattern - Pattern to search for in material name
 * @returns {Object|null} - Matching material or null
 */
export function findMaterialByPattern(materials, pattern) {
  if (!materials || !pattern) return null;
  return materials.find(m =>
    m.name.toLowerCase().includes(pattern.toLowerCase())
  ) || null;
}

/**
 * Find the best lumber match for plates based on required length
 * Prefers the shortest length that covers the need, minimizing waste
 * @param {Array} materials - Array of material objects
 * @param {string} dimension - '2x4' or '2x6'
 * @param {number} lengthNeeded - Length needed in feet
 * @returns {Object|null} - Best matching material
 */
export function findBestPlateMatch(materials, dimension, lengthNeeded = 8) {
  const config = LUMBER_DIMENSIONS[dimension];
  if (!config) return null;

  // Try to find plates in order of length (8, 10, 12, etc.)
  for (const pattern of config.platePatterns) {
    const material = findMaterialByPattern(materials, pattern);
    if (material) {
      // Extract length from name (e.g., "2x4x8 KD" -> 8)
      const match = material.name.match(/(\d+)x(\d+)x(\d+)/);
      if (match) {
        const plateLength = parseInt(match[3], 10);
        if (plateLength >= lengthNeeded) {
          return { ...material, lengthFt: plateLength };
        }
      }
    }
  }

  // Fallback to first available
  for (const pattern of config.platePatterns) {
    const material = findMaterialByPattern(materials, pattern);
    if (material) return material;
  }

  return null;
}

/**
 * Find the best stud match based on ceiling height
 * @param {Array} materials - Array of material objects
 * @param {string} dimension - '2x4' or '2x6'
 * @param {number} ceilingHeight - Ceiling height in feet
 * @returns {Object|null} - Best matching material
 */
export function findBestStudMatch(materials, dimension, ceilingHeight) {
  const config = LUMBER_DIMENSIONS[dimension];
  if (!config) return null;

  // For standard 8' ceilings, use pre-cut studs (92-5/8")
  if (ceilingHeight <= 8) {
    const precut = findMaterialByPattern(materials, config.studPattern);
    if (precut) return precut;
  }

  // For taller ceilings, find lumber that's at least as long as ceiling height
  // Need stud length = ceiling height - 3 plates (4.5" total) ≈ ceiling height - 0.5'
  const studLengthNeeded = ceilingHeight;

  // Search for appropriate length lumber
  const lengthOptions = [8, 10, 12, 14, 16];
  for (const len of lengthOptions) {
    if (len >= studLengthNeeded) {
      const pattern = `${dimension}x${len} KD`;
      const material = findMaterialByPattern(materials, pattern);
      if (material) return material;
    }
  }

  // Fallback to generic
  return findMaterialByPattern(materials, config.genericStudPattern);
}

/**
 * Calculate wall materials for a given linear footage and ceiling height
 *
 * @param {Object} options - Configuration options
 * @param {number} options.linearFeet - Total linear feet of wall
 * @param {number} options.ceilingHeight - Ceiling height in feet
 * @param {string} options.lumberDimension - '2x4' or '2x6'
 * @param {string} options.sheathingType - Key from SHEATHING_TYPES
 * @param {string} options.insulationType - Key from INSULATION_TYPES
 * @param {boolean} options.includeSheathing - Whether to include sheathing
 * @param {boolean} options.includeInsulation - Whether to include insulation
 * @param {Array} options.materials - Materials from catalogue (optional, will load if not provided)
 * @returns {Object} - Calculation results with materials, quantities, and costs
 */
export function calculateWallMaterials(options) {
  const {
    linearFeet = 1,
    ceilingHeight = 9,
    lumberDimension = '2x4',
    sheathingType = 'osb',
    insulationType = null, // Auto-select based on wall type if null
    includeSheathing = true,
    includeInsulation = true,
    materials: providedMaterials = null,
  } = options;

  // Load materials from catalogue if not provided
  const materials = providedMaterials || getMaterials();

  const result = {
    inputs: {
      linearFeet,
      ceilingHeight,
      lumberDimension,
      sheathingType,
      insulationType,
    },
    wallArea: linearFeet * ceilingHeight, // Total wall area in sq ft
    materials: [],
    totalCost: 0,
    costPerLinearFoot: 0,
  };

  // === LUMBER CALCULATIONS ===

  // Bottom plate: 1 LF per LF of wall
  const bottomPlate = findBestPlateMatch(materials, lumberDimension, 8);
  if (bottomPlate) {
    const plateLength = bottomPlate.lengthFt || 8;
    const platesNeeded = Math.ceil(linearFeet / plateLength);
    const plateCost = platesNeeded * bottomPlate.unitCost;

    result.materials.push({
      id: bottomPlate.id,
      name: bottomPlate.name,
      description: 'Bottom plate',
      quantity: platesNeeded,
      unit: bottomPlate.unit,
      unitCost: bottomPlate.unitCost,
      totalCost: plateCost,
      calculation: `${linearFeet} LF / ${plateLength}' lengths = ${platesNeeded} pieces`,
    });
    result.totalCost += plateCost;
  }

  // Top plates: 2 LF per LF of wall (double top plate)
  const topPlate = findBestPlateMatch(materials, lumberDimension, 8);
  if (topPlate) {
    const plateLength = topPlate.lengthFt || 8;
    const platesNeeded = Math.ceil((linearFeet * 2) / plateLength);
    const plateCost = platesNeeded * topPlate.unitCost;

    result.materials.push({
      id: topPlate.id,
      name: topPlate.name,
      description: 'Top plates (double)',
      quantity: platesNeeded,
      unit: topPlate.unit,
      unitCost: topPlate.unitCost,
      totalCost: plateCost,
      calculation: `${linearFeet} LF x 2 plates / ${plateLength}' lengths = ${platesNeeded} pieces`,
    });
    result.totalCost += plateCost;
  }

  // Studs: 1 per LF (simplified from 16" OC)
  const stud = findBestStudMatch(materials, lumberDimension, ceilingHeight);
  if (stud) {
    const studsNeeded = Math.ceil(linearFeet);
    const studCost = studsNeeded * stud.unitCost;

    result.materials.push({
      id: stud.id,
      name: stud.name,
      description: 'Wall studs (1 per LF)',
      quantity: studsNeeded,
      unit: stud.unit,
      unitCost: stud.unitCost,
      totalCost: studCost,
      calculation: `${linearFeet} LF = ${studsNeeded} studs`,
    });
    result.totalCost += studCost;
  }

  // === SHEATHING CALCULATIONS ===
  if (includeSheathing) {
    const sheathingConfig = SHEATHING_TYPES[sheathingType];
    if (sheathingConfig) {
      const sheathing = findMaterialByPattern(materials, sheathingConfig.pattern);
      if (sheathing) {
        const sheetsNeeded = Math.ceil(result.wallArea / sheathingConfig.sqftPerSheet);
        const sheathingCost = sheetsNeeded * sheathing.unitCost;

        result.materials.push({
          id: sheathing.id,
          name: sheathing.name,
          description: 'Wall sheathing',
          quantity: sheetsNeeded,
          unit: sheathing.unit,
          unitCost: sheathing.unitCost,
          totalCost: sheathingCost,
          calculation: `${result.wallArea} sq ft / ${sheathingConfig.sqftPerSheet} sq ft per sheet = ${sheetsNeeded} sheets`,
        });
        result.totalCost += sheathingCost;
      }
    }
  }

  // === INSULATION CALCULATIONS ===
  if (includeInsulation) {
    // Auto-select insulation based on wall type if not specified
    const effectiveInsulationType = insulationType ||
      (lumberDimension === '2x6' ? 'r20_batt' : 'r12_batt');

    const insulationConfig = INSULATION_TYPES[effectiveInsulationType];
    if (insulationConfig) {
      const insulation = findMaterialByPattern(materials, insulationConfig.pattern);
      if (insulation) {
        const coverage = insulationConfig.sqftPerBag || insulationConfig.sqftPerSheet;
        const unitsNeeded = Math.ceil(result.wallArea / coverage);
        const insulationCost = unitsNeeded * insulation.unitCost;

        result.materials.push({
          id: insulation.id,
          name: insulation.name,
          description: 'Wall insulation',
          quantity: unitsNeeded,
          unit: insulation.unit,
          unitCost: insulation.unitCost,
          totalCost: insulationCost,
          calculation: `${result.wallArea} sq ft / ${coverage} sq ft per ${insulation.unit.toLowerCase()} = ${unitsNeeded} ${insulation.unit.toLowerCase()}s`,
        });
        result.totalCost += insulationCost;
      }
    }
  }

  // Calculate cost per linear foot
  result.costPerLinearFoot = linearFeet > 0 ? result.totalCost / linearFeet : 0;

  return result;
}

/**
 * Calculate cost per linear foot for a wall configuration
 * Simplified version that returns just the per-LF cost
 *
 * @param {Object} options - Same as calculateWallMaterials
 * @returns {number} - Cost per linear foot
 */
export function getWallCostPerLinearFoot(options) {
  // Calculate for 1 LF to get base rate, then scale for waste factor
  const result = calculateWallMaterials({ ...options, linearFeet: 10 });
  return result.costPerLinearFoot;
}

/**
 * Get a summary breakdown for display
 * @param {Object} options - Same as calculateWallMaterials
 * @returns {Object} - Summary with categorized costs
 */
export function getWallCostBreakdown(options) {
  const result = calculateWallMaterials(options);

  const breakdown = {
    lumber: { items: [], subtotal: 0 },
    sheathing: { items: [], subtotal: 0 },
    insulation: { items: [], subtotal: 0 },
    total: result.totalCost,
    perLinearFoot: result.costPerLinearFoot,
    wallArea: result.wallArea,
  };

  for (const material of result.materials) {
    const category = material.description.toLowerCase().includes('plate') ||
                     material.description.toLowerCase().includes('stud')
      ? 'lumber'
      : material.description.toLowerCase().includes('sheath')
        ? 'sheathing'
        : 'insulation';

    breakdown[category].items.push(material);
    breakdown[category].subtotal += material.totalCost;
  }

  return breakdown;
}

/**
 * Format a material calculation result for display
 * @param {Object} result - Result from calculateWallMaterials
 * @returns {string} - Formatted string for display
 */
export function formatWallCalculation(result) {
  let output = `Wall Materials for ${result.inputs.linearFeet} LF @ ${result.inputs.ceilingHeight}' ceiling\n`;
  output += `Wall Type: ${result.inputs.lumberDimension}\n`;
  output += `Total Wall Area: ${result.wallArea} sq ft\n\n`;

  output += 'Materials:\n';
  for (const mat of result.materials) {
    output += `  ${mat.description}: ${mat.quantity} ${mat.unit} @ $${mat.unitCost.toFixed(2)} = $${mat.totalCost.toFixed(2)}\n`;
    output += `    (${mat.calculation})\n`;
  }

  output += `\nTotal Cost: $${result.totalCost.toFixed(2)}\n`;
  output += `Cost per Linear Foot: $${result.costPerLinearFoot.toFixed(2)}/LF\n`;

  return output;
}

export default {
  calculateWallMaterials,
  getWallCostPerLinearFoot,
  getWallCostBreakdown,
  formatWallCalculation,
  findMaterialByPattern,
  LUMBER_DIMENSIONS,
  SHEATHING_TYPES,
  INSULATION_TYPES,
};
