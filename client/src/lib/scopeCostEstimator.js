/**
 * Scope Cost Estimator
 *
 * Maps contractor intake scope items to Cost Catalogue labour rates
 * and calculates estimated costs for the project.
 */

import { loadCatalogueData, formatCurrency } from './costCatalogue';
import { SCOPE_ITEMS, UNIT_LABELS } from '../data/contractorIntakeSchema';

/**
 * Mapping from scope item IDs to labour catalogue rate IDs
 * and their associated unit conversion factors
 */
const SCOPE_TO_LABOUR_MAP = {
  // ============================================
  // FRAMING (FR) -> framing category
  // ============================================
  'fr-ext': { labourId: 'frm-002', labourCategory: 'FRAMING' }, // Exterior Walls -> Exterior Wall Framing
  'fr-int': { labourId: 'frm-003', labourCategory: 'FRAMING' }, // Interior Walls -> Interior Wall Framing
  'fr-bearing': { labourId: 'frm-003', labourCategory: 'FRAMING', multiplier: 1.25 }, // Bearing walls - 25% premium
  'fr-ceil': { labourId: 'frm-003', labourCategory: 'FRAMING' }, // Ceiling Framing
  'fr-floor': { labourId: 'frm-001', labourCategory: 'FRAMING' }, // Floor Framing -> Floor System
  'fr-truss': { labourId: 'rof-001', labourCategory: 'ROOFING' }, // Roof Trusses
  'fr-roof': { labourId: 'frm-004', labourCategory: 'FRAMING' }, // Roof Framing -> Roof System
  'fr-header': { labourId: 'frm-010', labourCategory: 'FRAMING', flatRate: 150 }, // Headers/Beams - per EA

  // ============================================
  // WINDOWS & DOORS (WD) -> windows_doors category
  // ============================================
  'wd-win': { labourId: 'wd-003', labourCategory: 'WINDOWS_DOORS' }, // Windows (remodel default)
  'wd-ext-door': { labourId: 'wd-006', labourCategory: 'WINDOWS_DOORS' }, // Exterior Doors (remodel)
  'wd-int-door': { labourId: 'trim-004', labourCategory: 'TRIM_CARPENTRY' }, // Interior Doors
  'wd-patio': { labourId: 'wd-007', labourCategory: 'WINDOWS_DOORS' }, // Patio/Sliding Doors
  'wd-garage': { labourCategory: 'WINDOWS_DOORS', flatRate: 450 }, // Garage Doors (estimate)

  // ============================================
  // INSULATION (IN) -> insulation category
  // ============================================
  'in-batt': { labourCategory: 'INSULATION', flatRate: 0.65 }, // Batt Insulation per SF
  'in-spray': { labourCategory: 'INSULATION', flatRate: 1.50 }, // Spray Foam per SF
  'in-blown': { labourCategory: 'INSULATION', flatRate: 0.75 }, // Blown-In per SF
  'in-board': { labourCategory: 'INSULATION', flatRate: 1.00 }, // Rigid Board per SF
  'in-ext': { labourId: 'ins-001', labourCategory: 'INSULATION' }, // Exterior Insulation
  'in-box': { labourCategory: 'INSULATION', flatRate: 8.00 }, // Box Headers per LF
  'in-subslab': { labourCategory: 'INSULATION', flatRate: 0.85 }, // Sub-Slab per SF

  // ============================================
  // ELECTRICAL (EL) -> electrical category
  // ============================================
  'el-panel': { labourId: 'elec-003', labourCategory: 'ELECTRICAL' }, // Panel/Service
  'el-rough': { labourCategory: 'ELECTRICAL', flatRate: 450 }, // Rough-In per room
  'el-outlet': { labourId: 'elec-001', labourCategory: 'ELECTRICAL' }, // Outlets/Switches
  'el-light': { labourId: 'elec-002', labourCategory: 'ELECTRICAL' }, // Light Fixtures
  'el-low-v': { labourCategory: 'ELECTRICAL', flatRate: 125 }, // Low Voltage/Data per EA

  // ============================================
  // PLUMBING (PL) -> plumbing category
  // ============================================
  'pl-rough': { labourCategory: 'PLUMBING', flatRate: 400 }, // Rough-In per fixture
  'pl-toilet': { labourId: 'plm-001', labourCategory: 'PLUMBING' }, // Toilets
  'pl-sink': { labourId: 'plm-004', labourCategory: 'PLUMBING' }, // Sinks (vanity)
  'pl-tub': { labourId: 'plm-002', labourCategory: 'PLUMBING' }, // Tub/Shower
  'pl-water-heat': { labourId: 'plm-009', labourCategory: 'PLUMBING' }, // Water Heater
  'pl-gas': { labourCategory: 'PLUMBING', flatRate: 35 }, // Gas Line per LF

  // ============================================
  // HVAC (HV) -> hvac category
  // ============================================
  'hv-furnace': { labourId: 'hvac-002', labourCategory: 'HVAC' }, // Furnace
  'hv-ac': { labourCategory: 'HVAC', flatRate: 2500 }, // AC Condenser (estimate)
  'hv-duct': { labourId: 'hvac-003', labourCategory: 'HVAC' }, // Ductwork
  'hv-minisplit': { labourCategory: 'HVAC', flatRate: 1800 }, // Mini-Split per EA
  'hv-register': { labourCategory: 'HVAC', flatRate: 45 }, // Registers/Grilles per EA

  // ============================================
  // DRYWALL (DW) -> drywall category
  // ============================================
  'dw-strap': { labourCategory: 'DRYWALL', flatRate: 0.50 }, // Strapping per SF
  'dw-hang-wall': { labourId: 'dry-001', labourCategory: 'DRYWALL' }, // Hang Drywall - Walls
  'dw-hang-ceil': { labourId: 'dry-002', labourCategory: 'DRYWALL' }, // Hang Drywall - Ceilings (fire rate)
  'dw-tape': { labourId: 'dry-003', labourCategory: 'DRYWALL' }, // Tape & Mud
  'dw-texture': { labourCategory: 'DRYWALL', flatRate: 0.50 }, // Texture per SF
  'dw-patch': { labourCategory: 'DRYWALL', flatRate: 75 }, // Patch/Repair per EA

  // ============================================
  // PAINTING (PT) -> painting category
  // ============================================
  'pt-prime': { labourId: 'pnt-001', labourCategory: 'PAINTING' }, // Prime
  'pt-walls': { labourId: 'pnt-002', labourCategory: 'PAINTING' }, // Paint Walls
  'pt-ceil': { labourId: 'pnt-003', labourCategory: 'PAINTING' }, // Paint Ceilings
  'pt-trim': { labourId: 'pnt-004', labourCategory: 'PAINTING' }, // Paint Trim
  'pt-doors': { labourCategory: 'PAINTING', flatRate: 75 }, // Paint Doors per EA
  'pt-cab': { labourCategory: 'PAINTING', flatRate: 35 }, // Paint Cabinets per LF

  // ============================================
  // FLOORING (FL) -> flooring category
  // ============================================
  'fl-lvp': { labourId: 'flr-002', labourCategory: 'FLOORING' }, // LVP/Laminate
  'fl-hardwood': { labourId: 'flr-001', labourCategory: 'FLOORING' }, // Hardwood
  'fl-carpet': { labourCategory: 'FLOORING', flatRate: 2.00 }, // Carpet per SF
  'fl-sub': { labourCategory: 'FLOORING', flatRate: 3.50 }, // Subfloor Repair per SF

  // ============================================
  // TILE (TL) -> tile category
  // ============================================
  'tl-floor': { labourId: 'til-001', labourCategory: 'TILE' }, // Floor Tile
  'tl-wall': { labourId: 'til-002', labourCategory: 'TILE' }, // Wall Tile
  'tl-shower': { labourId: 'til-002', labourCategory: 'TILE', multiplier: 1.25 }, // Shower Tile - premium
  'tl-backsplash': { labourCategory: 'TILE', flatRate: 12 }, // Backsplash per SF

  // ============================================
  // FINISH CARPENTRY (FC) -> trim_carpentry category
  // ============================================
  'fc-base': { labourId: 'trim-001', labourCategory: 'TRIM_CARPENTRY' }, // Baseboard
  'fc-case': { labourId: 'trim-002', labourCategory: 'TRIM_CARPENTRY' }, // Door Casing
  'fc-crown': { labourId: 'trim-005', labourCategory: 'TRIM_CARPENTRY' }, // Crown Molding
  'fc-shelf': { labourCategory: 'TRIM_CARPENTRY', flatRate: 15 }, // Shelving per LF
  'fc-closet': { labourCategory: 'TRIM_CARPENTRY', flatRate: 350 }, // Closet Systems per EA

  // ============================================
  // CABINETRY (CB)
  // ============================================
  'cb-base': { labourCategory: 'TRIM_CARPENTRY', flatRate: 65 }, // Base Cabinets per LF
  'cb-upper': { labourCategory: 'TRIM_CARPENTRY', flatRate: 55 }, // Upper Cabinets per LF
  'cb-vanity': { labourCategory: 'TRIM_CARPENTRY', flatRate: 175 }, // Vanity per EA
  'cb-pantry': { labourCategory: 'TRIM_CARPENTRY', flatRate: 225 }, // Pantry Cabinet per EA

  // ============================================
  // COUNTERTOPS (CT)
  // ============================================
  'ct-lam': { labourCategory: 'TRIM_CARPENTRY', flatRate: 25 }, // Laminate install per SF
  'ct-quartz': { labourCategory: 'TRIM_CARPENTRY', flatRate: 35 }, // Quartz install per SF
  'ct-granite': { labourCategory: 'TRIM_CARPENTRY', flatRate: 35 }, // Granite install per SF
  'ct-butcher': { labourCategory: 'TRIM_CARPENTRY', flatRate: 30 }, // Butcher Block install per SF

  // ============================================
  // FIXTURES (FX)
  // ============================================
  'fx-faucet': { labourCategory: 'PLUMBING', flatRate: 85 }, // Faucets per EA
  'fx-hardware': { labourCategory: 'TRIM_CARPENTRY', flatRate: 150 }, // Cabinet Hardware per set
  'fx-mirror': { labourCategory: 'TRIM_CARPENTRY', flatRate: 75 }, // Mirrors per EA
  'fx-towel': { labourCategory: 'TRIM_CARPENTRY', flatRate: 45 }, // Bath Accessories per set

  // ============================================
  // SITE WORK (SW)
  // ============================================
  'sw-demo': { labourCategory: 'EXCAVATION', flatRate: 2500 }, // Demolition allowance
  'sw-debris': { labourCategory: 'EXCAVATION', flatRate: 450 }, // Debris Removal per load
  'sw-grade': { labourCategory: 'EXCAVATION', flatRate: 1.50 }, // Grading per SF
  'sw-exc': { labourCategory: 'EXCAVATION', flatRate: 85 }, // Excavation per CY

  // ============================================
  // FOUNDATION (FN)
  // ============================================
  'fn-foot': { labourCategory: 'CONCRETE', flatRate: 35 }, // Footings per LF
  'fn-wall': { labourCategory: 'CONCRETE', flatRate: 45 }, // Foundation Walls per LF
  'fn-slab': { labourCategory: 'CONCRETE', flatRate: 8 }, // Slab on Grade per SF
  'fn-water': { labourCategory: 'CONCRETE', flatRate: 4 }, // Waterproofing per SF

  // ============================================
  // ROOFING (RF)
  // ============================================
  'rf-shingle': { labourId: 'rof-002', labourCategory: 'ROOFING' }, // Shingles per SQ
  'rf-flat': { labourCategory: 'ROOFING', flatRate: 6 }, // Flat Roof per SF
  'rf-flash': { labourCategory: 'ROOFING', flatRate: 500 }, // Flashing allowance
  'rf-vent': { labourCategory: 'ROOFING', flatRate: 125 }, // Ventilation per EA

  // ============================================
  // EXTERIOR (EX)
  // ============================================
  'ex-siding': { labourId: 'sid-001', labourCategory: 'SIDING' }, // Siding per SF
  'ex-trim': { labourCategory: 'SIDING', flatRate: 8 }, // Exterior Trim per LF
  'ex-gutter': { labourCategory: 'SIDING', flatRate: 12 }, // Gutters per LF
  'ex-soffit': { labourId: 'sid-002', labourCategory: 'SIDING' }, // Soffit & Fascia

  // ============================================
  // CLEANING & CLOSEOUT (CL)
  // ============================================
  'cl-rough': { labourCategory: 'CLEANING', flatRate: 350 }, // Rough Clean per EA
  'cl-final': { labourCategory: 'CLEANING', flatRate: 500 }, // Final Clean per EA
  'cl-punch': { labourCategory: 'CLEANING', flatRate: 250 }, // Punch List per EA
};

/**
 * Get labour rate from catalogue by ID
 */
function getLabourRateById(laborRates, labourId) {
  for (const categoryRates of Object.values(laborRates)) {
    const rate = categoryRates.pieceRates?.find(r => r.id === labourId);
    if (rate) return rate;
  }
  return null;
}

/**
 * Calculate cost for a single scope item
 */
export function calculateScopeItemCost(scopeItemId, quantity, laborRates) {
  const mapping = SCOPE_TO_LABOUR_MAP[scopeItemId];
  if (!mapping || !quantity || quantity <= 0) {
    return { cost: 0, source: 'none', confidence: 0 };
  }

  let unitCost = 0;
  let source = 'estimate';
  let confidence = 0;

  // Try to get rate from labour catalogue
  if (mapping.labourId) {
    const rate = getLabourRateById(laborRates, mapping.labourId);
    if (rate) {
      unitCost = rate.rate || rate.unitCost || 0;
      source = 'catalogue';
      confidence = rate.confidence ?? 1;
    }
  }

  // Fall back to flat rate if no catalogue rate found or if flatRate is specified
  if (mapping.flatRate !== undefined && (unitCost === 0 || !mapping.labourId)) {
    unitCost = mapping.flatRate;
    source = 'flat';
    confidence = 0;
  }

  // Apply multiplier if specified
  if (mapping.multiplier) {
    unitCost *= mapping.multiplier;
  }

  const cost = unitCost * quantity;

  return {
    cost,
    unitCost,
    quantity,
    source,
    confidence,
    labourCategory: mapping.labourCategory,
  };
}

/**
 * Calculate total estimated costs for entire scope
 */
export function calculateScopeCosts(scope, specLevel = 'standard') {
  const { laborRates, materials } = loadCatalogueData();

  const results = {
    categories: {},
    totalLabour: 0,
    totalMaterials: 0,
    grandTotal: 0,
    itemCount: 0,
    lowConfidenceItems: [],
  };

  // Spec level multipliers
  const specMultiplier = {
    budget: 0.85,
    standard: 1.0,
    premium: 1.25,
  }[specLevel] || 1.0;

  // Process each enabled category
  for (const [categoryCode, categoryData] of Object.entries(scope || {})) {
    if (!categoryData.enabled) continue;

    const categoryInfo = SCOPE_ITEMS[categoryCode];
    if (!categoryInfo) continue;

    const categoryResult = {
      name: categoryInfo.name,
      items: [],
      totalLabour: 0,
      totalMaterials: 0,
    };

    // Process each item in the category
    for (const [itemId, itemData] of Object.entries(categoryData.items || {})) {
      if (!itemData.qty || itemData.qty <= 0) continue;

      const itemInfo = categoryInfo.items?.find(i => i.id === itemId);
      if (!itemInfo) continue;

      const costResult = calculateScopeItemCost(itemId, itemData.qty, laborRates);

      // Apply spec level multiplier
      const labourCost = costResult.cost * specMultiplier;

      // Estimate materials cost (rough 60/40 labour/materials split for most trades)
      const materialsCost = labourCost * 0.67; // Materials roughly equal to labour

      categoryResult.items.push({
        id: itemId,
        name: itemInfo.name,
        quantity: itemData.qty,
        unit: itemInfo.unit,
        unitLabel: UNIT_LABELS[itemInfo.unit] || itemInfo.unit,
        unitCost: costResult.unitCost,
        labourCost,
        materialsCost,
        totalCost: labourCost + materialsCost,
        source: costResult.source,
        confidence: costResult.confidence,
        notes: itemData.notes,
      });

      categoryResult.totalLabour += labourCost;
      categoryResult.totalMaterials += materialsCost;
      results.itemCount++;

      // Track low confidence items
      if (costResult.confidence === 0) {
        results.lowConfidenceItems.push({
          category: categoryInfo.name,
          item: itemInfo.name,
          source: costResult.source,
        });
      }
    }

    if (categoryResult.items.length > 0) {
      results.categories[categoryCode] = categoryResult;
      results.totalLabour += categoryResult.totalLabour;
      results.totalMaterials += categoryResult.totalMaterials;
    }
  }

  results.grandTotal = results.totalLabour + results.totalMaterials;

  return results;
}

/**
 * Get cost summary for display
 */
export function getCostSummary(scope, specLevel = 'standard') {
  const costs = calculateScopeCosts(scope, specLevel);

  return {
    labour: formatCurrency(costs.totalLabour),
    materials: formatCurrency(costs.totalMaterials),
    total: formatCurrency(costs.grandTotal),
    itemCount: costs.itemCount,
    categoryCount: Object.keys(costs.categories).length,
    lowConfidenceCount: costs.lowConfidenceItems.length,
    rawCosts: costs,
  };
}

/**
 * Get detailed cost breakdown by category
 */
export function getCostBreakdown(scope, specLevel = 'standard') {
  const costs = calculateScopeCosts(scope, specLevel);

  return Object.entries(costs.categories).map(([code, data]) => ({
    code,
    name: data.name,
    labour: formatCurrency(data.totalLabour),
    materials: formatCurrency(data.totalMaterials),
    total: formatCurrency(data.totalLabour + data.totalMaterials),
    itemCount: data.items.length,
    items: data.items.map(item => ({
      ...item,
      labourFormatted: formatCurrency(item.labourCost),
      materialsFormatted: formatCurrency(item.materialsCost),
      totalFormatted: formatCurrency(item.totalCost),
    })),
  }));
}

export default {
  calculateScopeItemCost,
  calculateScopeCosts,
  getCostSummary,
  getCostBreakdown,
  SCOPE_TO_LABOUR_MAP,
};
