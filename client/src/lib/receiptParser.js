/**
 * Receipt Parser - Hooomz
 *
 * Utilities for parsing receipt data and matching items to the Cost Catalogue
 */

import { MATERIAL_CATEGORIES } from './costCatalogue';

// Keywords for auto-detecting material categories
const CATEGORY_KEYWORDS = {
  lumber: ['2x4', '2x6', '2x8', '2x10', '2x12', '1x', 'plywood', 'osb', 'lumber', 'stud', 'joist', 'beam', 'sheathing', 'spf', 'pt ', 'kd '],
  drywall: ['drywall', 'gypsum', 'sheetrock', 'joint compound', 'mud', 'tape', 'corner bead'],
  electrical: ['wire', 'romex', 'nmd', 'outlet', 'switch', 'breaker', 'panel', 'gfci', 'afci', 'pot light', 'receptacle', 'electrical', 'volt', 'amp'],
  plumbing: ['pex', 'pipe', 'pvc', 'abs', 'copper', 'faucet', 'toilet', 'sink', 'valve', 'fitting', 'drain', 'plumb', 'shower', 'tub'],
  hvac: ['hvac', 'duct', 'vent', 'furnace', 'air handler', 'thermostat', 'hvac', 'heat', 'cool'],
  roofing: ['shingle', 'roofing', 'felt', 'ice shield', 'drip edge', 'flashing', 'ridge vent', 'soffit', 'fascia'],
  insulation: ['insulation', 'batt', 'blown', 'spray foam', 'r-', 'r12', 'r20', 'r24', 'r40', 'roxul', 'fiberglass'],
  flooring: ['flooring', 'hardwood', 'laminate', 'vinyl', 'lvp', 'lvt', 'underlayment', 'floor'],
  tile: ['tile', 'grout', 'thinset', 'mortar', 'backsplash', 'ceramic', 'porcelain', 'marble', 'granite'],
  paint: ['paint', 'primer', 'stain', 'varnish', 'caulk', 'sealant', 'finish'],
  cabinets: ['cabinet', 'vanity', 'countertop', 'counter'],
  doors_windows: ['door', 'window', 'frame', 'jamb', 'casing', 'weatherstrip', 'threshold'],
  trim: ['trim', 'molding', 'baseboard', 'crown', 'casing', 'quarter round', 'shoe'],
  hardware: ['screw', 'nail', 'bolt', 'nut', 'washer', 'anchor', 'hinge', 'handle', 'knob', 'bracket', 'joist hanger', 'simpson', 'fastener', 'staple', 'blade', 'bit'],
  exterior: ['siding', 'soffit', 'fascia', 'gutter', 'downspout', 'exterior'],
  fixtures: ['fixture', 'light', 'fan', 'appliance', 'range', 'dishwasher', 'hood'],
};

// Common unit mappings from receipt text to standard units
const UNIT_MAPPINGS = {
  'ea': 'each',
  'each': 'each',
  'pc': 'each',
  'pcs': 'each',
  'unit': 'each',
  'sqft': 'sqft',
  'sq ft': 'sqft',
  'sf': 'sqft',
  'lnft': 'lnft',
  'ln ft': 'lnft',
  'lf': 'lnft',
  'ft': 'lnft',
  'roll': 'roll',
  'rl': 'roll',
  'bundle': 'bundle',
  'bdl': 'bundle',
  'gallon': 'gallon',
  'gal': 'gallon',
  'sheet': 'sheet',
  'sht': 'sheet',
  'box': 'box',
  'bx': 'box',
  'bag': 'bag',
  'pack': 'pack',
  'pk': 'pack',
  'lb': 'lb',
  'kg': 'kg',
};

/**
 * Auto-detect material category based on item name
 */
export function detectCategory(itemName) {
  const lowerName = itemName.toLowerCase();

  for (const [categoryId, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerName.includes(keyword)) {
        return categoryId;
      }
    }
  }

  return 'hardware'; // Default fallback
}

/**
 * Normalize unit text to standard unit
 */
export function normalizeUnit(unitText) {
  if (!unitText) return 'each';
  const lower = unitText.toLowerCase().trim();
  return UNIT_MAPPINGS[lower] || 'each';
}

/**
 * Generate a unique ID for a new material
 */
export function generateMaterialId(category, existingMaterials) {
  const prefix = category.substring(0, 3);
  const existingIds = existingMaterials
    .filter(m => m.id.startsWith(prefix))
    .map(m => parseInt(m.id.split('-')[1]) || 0);
  const nextNum = Math.max(0, ...existingIds) + 1;
  return `${prefix}-${String(nextNum).padStart(3, '0')}`;
}

/**
 * Find potential matches for an extracted item in the existing materials
 */
export function findMaterialMatches(extractedItem, existingMaterials) {
  const matches = [];
  const itemNameLower = extractedItem.name.toLowerCase();
  const itemWords = itemNameLower.split(/\s+/).filter(w => w.length > 2);

  for (const material of existingMaterials) {
    const materialNameLower = material.name.toLowerCase();

    // Check for SKU match first (exact)
    if (extractedItem.sku && material.sku === extractedItem.sku) {
      matches.push({ material, score: 100, matchType: 'sku' });
      continue;
    }

    // Check for exact name match
    if (materialNameLower === itemNameLower) {
      matches.push({ material, score: 95, matchType: 'exact' });
      continue;
    }

    // Check for word overlap (fuzzy match)
    const materialWords = materialNameLower.split(/\s+/).filter(w => w.length > 2);
    const commonWords = itemWords.filter(w => materialWords.some(mw => mw.includes(w) || w.includes(mw)));
    const overlapScore = (commonWords.length / Math.max(itemWords.length, materialWords.length)) * 80;

    if (overlapScore >= 40) {
      matches.push({ material, score: overlapScore, matchType: 'fuzzy' });
    }
  }

  // Sort by score descending
  return matches.sort((a, b) => b.score - a.score).slice(0, 5);
}

/**
 * Parse receipt text into structured items
 * This is a fallback parser when AI extraction isn't available
 */
export function parseReceiptText(text) {
  const lines = text.split('\n').filter(line => line.trim());
  const items = [];

  // Common receipt line patterns
  // Pattern: "ITEM NAME    QTY @ PRICE   TOTAL"
  // Pattern: "ITEM NAME    QTY    PRICE"
  const linePattern = /^(.+?)\s+(\d+)\s*[@x]\s*\$?([\d.]+)\s+\$?([\d.]+)$/i;
  const simplePattern = /^(.+?)\s+\$?([\d.]+)$/;

  for (const line of lines) {
    // Skip header/footer lines
    if (line.match(/subtotal|tax|total|thank|date|store|receipt/i)) continue;

    const match = line.match(linePattern);
    if (match) {
      items.push({
        name: match[1].trim(),
        quantity: parseInt(match[2]),
        unitPrice: parseFloat(match[3]),
        totalPrice: parseFloat(match[4]),
        suggestedCategory: detectCategory(match[1]),
        suggestedUnit: 'each',
      });
    }
  }

  return items;
}

/**
 * Create a prompt for Claude AI to extract receipt data
 */
export function createExtractionPrompt() {
  return `You are analyzing a construction supply store receipt. Extract all material items with:
- name: Full product name
- sku: Item/SKU number if visible
- quantity: Number purchased
- unitPrice: Price per unit
- totalPrice: Line total
- suggestedCategory: One of [lumber, drywall, electrical, plumbing, hvac, roofing, insulation, flooring, tile, paint, cabinets, doors_windows, trim, hardware, exterior, fixtures]
- suggestedUnit: One of [each, sqft, lnft, bundle, roll, gallon, sheet, box, bag, pack, lb]

Return as JSON array. Skip tax lines, subtotals, and non-material items.

Example output:
[
  {
    "name": "2X4X8 STUD SPF",
    "sku": "2832427",
    "quantity": 4,
    "unitPrice": 4.25,
    "totalPrice": 17.00,
    "suggestedCategory": "lumber",
    "suggestedUnit": "each"
  }
]`;
}

/**
 * Validate extracted item data
 */
export function validateExtractedItem(item) {
  const errors = [];

  if (!item.name || item.name.trim().length === 0) {
    errors.push('Name is required');
  }

  if (typeof item.quantity !== 'number' || item.quantity <= 0) {
    errors.push('Quantity must be a positive number');
  }

  if (typeof item.unitPrice !== 'number' || item.unitPrice < 0) {
    errors.push('Unit price must be a non-negative number');
  }

  const validCategories = MATERIAL_CATEGORIES.map(c => c.id);
  if (!validCategories.includes(item.suggestedCategory)) {
    errors.push('Invalid category');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate price change percentage
 */
export function calculatePriceChange(oldPrice, newPrice) {
  if (oldPrice === 0) return newPrice > 0 ? 100 : 0;
  return ((newPrice - oldPrice) / oldPrice) * 100;
}

/**
 * Format an extracted item for display
 */
export function formatExtractedItem(item) {
  const category = MATERIAL_CATEGORIES.find(c => c.id === item.suggestedCategory);
  return {
    ...item,
    categoryName: category?.name || 'Unknown',
    formattedPrice: `$${item.unitPrice.toFixed(2)}`,
    formattedTotal: `$${item.totalPrice.toFixed(2)}`,
  };
}

export default {
  detectCategory,
  normalizeUnit,
  generateMaterialId,
  findMaterialMatches,
  parseReceiptText,
  createExtractionPrompt,
  validateExtractedItem,
  calculatePriceChange,
  formatExtractedItem,
};
