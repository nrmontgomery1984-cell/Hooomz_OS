/**
 * Labour Rate Catalogue - Hooomz Buildz
 *
 * Generated: 2025-12-02
 * Source: Local sub-trade quotes (2024-2025)
 * Region: Greater Moncton, New Brunswick
 *
 * CONFIDENCE LEVELS:
 * 0 = "estimate"  - No field data, industry estimate (RED)
 * 1 = "limited"   - 1-2 data points (YELLOW)
 * 2 = "verified"  - 3+ data points or multiple quotes agreeing (GREEN)
 *
 * Suppliers Referenced:
 * - PLG Builders (framing) - 2 quotes
 * - Hub City Plumbing - 2 quotes
 * - Elite Trade Painting - 1 quote
 * - Carter's Septic - 1 quote
 * - Greenfoot Energy (HVAC) - 1 quote
 * - Cap Pelé Sawmill (trusses) - 1 quote
 */

// Confidence level constants
export const CONFIDENCE = {
  ESTIMATE: 0,  // No field data - RED background
  LIMITED: 1,   // 1-2 data points - YELLOW background
  VERIFIED: 2   // 3+ data points - GREEN background
};

// Confidence level colors for UI
export const CONFIDENCE_COLORS = {
  0: { bg: '#FFCDD2', text: '#B71C1C', label: 'Estimate' },      // Red
  1: { bg: '#FFF9C4', text: '#F57F17', label: 'Limited Data' },  // Yellow
  2: { bg: '#C8E6C9', text: '#1B5E20', label: 'Verified' }       // Green
};

// Trade categories
export const LABOUR_CATEGORIES = [
  { id: 'framing', name: 'Framing' },
  { id: 'plumbing', name: 'Plumbing' },
  { id: 'electrical', name: 'Electrical' },
  { id: 'hvac', name: 'HVAC' },
  { id: 'painting', name: 'Painting' },
  { id: 'drywall', name: 'Drywall' },
  { id: 'flooring', name: 'Flooring' },
  { id: 'roofing', name: 'Roofing' },
  { id: 'siding', name: 'Siding' },
  { id: 'insulation', name: 'Insulation' },
  { id: 'excavation', name: 'Excavation' },
  { id: 'concrete', name: 'Concrete' },
  { id: 'windows_doors', name: 'Windows & Doors' },
  { id: 'trim_carpentry', name: 'Trim Carpentry' },
  { id: 'tile', name: 'Tile' }
];

// ===========================================
// LABOUR RATES DATABASE
// ===========================================

export const labourRates = [
  // ============================================
  // FRAMING - PLG Builders
  // ============================================

  // New Construction Framing (per SF)
  {
    id: "frm-001",
    category: "framing",
    name: "Floor System - New Construction",
    description: "Sill plate, gasket, floor joists, LVL beams, rim board, strongbacks, squash blocks, joist hangers, T&G subfloor glued & screwed",
    unit: "SF",
    unitCost: 4.04,
    confidence: 1,
    source: "PLG Builders #545 - 274 Cedar (1,300 SF)",
    sourceDate: "2025-01",
    notes: "Ground level floor system, new construction"
  },
  {
    id: "frm-002",
    category: "framing",
    name: "Exterior Wall Framing - New Construction",
    description: "2x6 16\"OC, sheathing, Tyvek, sealant gaskets, bearing walls, nailing per code",
    unit: "SF",
    unitCost: 4.39,
    confidence: 1,
    source: "PLG Builders #545 - 274 Cedar (1,300 SF)",
    sourceDate: "2025-01",
    notes: "Exterior insulation/strapping extra"
  },
  {
    id: "frm-003",
    category: "framing",
    name: "Interior Wall Framing - New Construction",
    description: "Interior partitions, door openings, backing/blocking, ceiling strapping (1st/2nd floor), stairs, pocket door frames",
    unit: "SF",
    unitCost: 6.35,
    confidence: 1,
    source: "PLG Builders #545 - 274 Cedar (1,300 SF)",
    sourceDate: "2025-01",
    notes: "Basement ceiling strapping extra"
  },
  {
    id: "frm-004",
    category: "framing",
    name: "Roof System - New Construction",
    description: "Truss layout & install, joist hangers, strong ties, trim board, bracing, roof sheathing, includes 4hr crane",
    unit: "SF",
    unitCost: 8.04,
    confidence: 1,
    source: "PLG Builders #545 - 274 Cedar (1,300 SF)",
    sourceDate: "2025-01",
    notes: "Extra crane time $220/hr"
  },
  {
    id: "frm-005",
    category: "framing",
    name: "Complete Shell Framing - New Construction",
    description: "Floor, exterior walls, interior walls, roof system complete",
    unit: "SF",
    unitCost: 22.83,
    confidence: 1,
    source: "PLG Builders #545 - 274 Cedar (1,300 SF)",
    sourceDate: "2025-01",
    notes: "Labour only, does not include materials or trusses"
  },

  // Addition/Remodel Framing (per SF - based on addition area)
  {
    id: "frm-006",
    category: "framing",
    name: "Floor System - Addition",
    description: "Sill plate, gasket, floor joists, LVL beams, rim board, T&G subfloor",
    unit: "SF",
    unitCost: 8.93,
    confidence: 1,
    source: "PLG Builders #640 - 44 Teesdale (140 SF addition)",
    sourceDate: "2025-03",
    notes: "Higher $/SF due to small addition complexity"
  },
  {
    id: "frm-007",
    category: "framing",
    name: "Complete Shell Framing - Addition",
    description: "Floor, exterior walls, interior walls, roof system for addition",
    unit: "SF",
    unitCost: 37.54,
    confidence: 1,
    source: "PLG Builders #640 - 44 Teesdale (140 SF addition)",
    sourceDate: "2025-03",
    notes: "Small additions have higher $/SF than new construction"
  },

  // Framing - Per Unit Items
  {
    id: "frm-010",
    category: "framing",
    name: "Stair Stringer - Cut & Install",
    description: "Cut new stair stringers and install temporary steps",
    unit: "EA",
    unitCost: 850.00,
    confidence: 1,
    source: "PLG Builders #640",
    sourceDate: "2025-03",
    notes: "Per stair flight"
  },
  {
    id: "frm-011",
    category: "framing",
    name: "Ceiling Strapping Over Drywall",
    description: "Install strapping on ceiling over existing drywall",
    unit: "JOB",
    unitCost: 650.00,
    confidence: 1,
    source: "PLG Builders #640 - 44 Teesdale",
    sourceDate: "2025-03",
    notes: "~1,100 SF house, approximately $0.59/SF"
  },

  // ============================================
  // WINDOWS & DOORS - PLG Builders
  // ============================================
  {
    id: "wd-001",
    category: "windows_doors",
    name: "Window Install <16 SF - New Construction",
    description: "Install customer-supplied window, seal with silicone and flashing tape",
    unit: "EA",
    unitCost: 150.00,
    confidence: 0,
    source: "Industry estimate",
    sourceDate: "2025-01",
    notes: "Window not included, materials not included"
  },
  {
    id: "wd-002",
    category: "windows_doors",
    name: "Window Install 16-25 SF - New Construction",
    description: "Install customer-supplied window, seal with silicone and flashing tape",
    unit: "EA",
    unitCost: 200.00,
    confidence: 1,
    source: "PLG Builders #545 - 274 Cedar",
    sourceDate: "2025-01",
    notes: "Window not included, materials not included"
  },
  {
    id: "wd-003",
    category: "windows_doors",
    name: "Window Install <16 SF - Remodel",
    description: "Remove old window, resize opening if needed, install new window, seal",
    unit: "EA",
    unitCost: 350.00,
    confidence: 1,
    source: "PLG Builders #640 - 44 Teesdale",
    sourceDate: "2025-03",
    notes: "Window not included, +$150 vs new construction"
  },
  {
    id: "wd-004",
    category: "windows_doors",
    name: "Window Install 16-25 SF - Remodel",
    description: "Remove old window, resize opening if needed, install new window, seal",
    unit: "EA",
    unitCost: 400.00,
    confidence: 1,
    source: "PLG Builders #640 - 44 Teesdale",
    sourceDate: "2025-03",
    notes: "Window not included, +$200 vs new construction"
  },
  {
    id: "wd-005",
    category: "windows_doors",
    name: "Exterior Door Prehung - New Construction",
    description: "Install customer-supplied steel door prehung, seal with silicone and flashing tape",
    unit: "EA",
    unitCost: 350.00,
    confidence: 1,
    source: "PLG Builders #545 - 274 Cedar",
    sourceDate: "2025-01",
    notes: "Door and hardware not included"
  },
  {
    id: "wd-006",
    category: "windows_doors",
    name: "Exterior Door Prehung - Remodel",
    description: "Remove old door, resize opening if needed, install new prehung door, seal",
    unit: "EA",
    unitCost: 550.00,
    confidence: 1,
    source: "PLG Builders #640 - 44 Teesdale",
    sourceDate: "2025-03",
    notes: "Door and hardware not included, +$200 vs new construction"
  },
  {
    id: "wd-007",
    category: "windows_doors",
    name: "Patio Door 5-7' - Remodel",
    description: "Remove old window/door, reframe opening, install patio door, seal",
    unit: "EA",
    unitCost: 600.00,
    confidence: 1,
    source: "PLG Builders #640 - 44 Teesdale",
    sourceDate: "2025-03",
    notes: "Door not included, materials not included"
  },

  // ============================================
  // INSULATION - PLG Builders
  // ============================================
  {
    id: "ins-001",
    category: "insulation",
    name: "Rigid Foam 2\" - Exterior Walls",
    description: "Install 2\" rigid foam insulation on exterior walls",
    unit: "SF",
    unitCost: 1.32,
    confidence: 1,
    source: "PLG Builders #640 - 44 Teesdale ($1,450 / ~1,100 SF)",
    sourceDate: "2025-03",
    notes: "Labour only, foam not included"
  },

  // ============================================
  // SIDING - PLG Builders
  // ============================================
  {
    id: "sid-001",
    category: "siding",
    name: "Vinyl Siding Install",
    description: "Install vinyl siding, starter strip, J-trim, sealant, electrical box trim",
    unit: "SF",
    unitCost: 4.55,
    confidence: 1,
    source: "PLG Builders #640 - 44 Teesdale ($5,000 / ~1,100 SF)",
    sourceDate: "2025-03",
    notes: "Labour only - siding, J-trim, starter, caulking, nails NOT included"
  },
  {
    id: "sid-002",
    category: "siding",
    name: "Soffit & Fascia Install",
    description: "Install soffit, F-trim, bend/shape fascia metal, install fascia, includes SS nails/screws",
    unit: "SF",
    unitCost: 2.92,
    confidence: 1,
    source: "PLG Builders #640 - 44 Teesdale ($3,215 / ~1,100 SF)",
    sourceDate: "2025-03",
    notes: "Labour only - metal fascia, soffit material, F-trim NOT included"
  },

  // ============================================
  // ROOFING - Cap Pelé Sawmill
  // ============================================
  {
    id: "rof-001",
    category: "roofing",
    name: "Roof Trusses - Common",
    description: "Prefab roof truss, 2x4 lumber, standard pitch",
    unit: "EA",
    unitCost: 100.00,
    confidence: 1,
    source: "Cap Pelé Sawmill #625133 (avg of 8 trusses @ $803)",
    sourceDate: "2025-03",
    notes: "14-15' span, 5/12 pitch, delivered"
  },
  {
    id: "rof-002",
    category: "roofing",
    name: "Shingle Install",
    description: "Install asphalt shingles, underlayment, ice & water, vents",
    unit: "SQ",
    unitCost: 350.00,
    confidence: 0,
    source: "Industry estimate - Moncton area",
    sourceDate: "2025-01",
    notes: "Per 100 SF (1 square), labour only"
  },

  // ============================================
  // PLUMBING - Hub City Plumbing
  // ============================================

  // Per-fixture rough-in + finish rates (derived)
  {
    id: "plm-001",
    category: "plumbing",
    name: "Toilet (WC) - Rough-in + Finish",
    description: "ABS drain, vent, water supply, install fixture",
    unit: "EA",
    unitCost: 450.00,
    confidence: 1,
    source: "Hub City Plumbing - derived from quotes",
    sourceDate: "2025-06",
    notes: "Fixture supplied by owner"
  },
  {
    id: "plm-002",
    category: "plumbing",
    name: "Bathtub - Rough-in + Finish",
    description: "ABS drain, vent, water supply, install fixture",
    unit: "EA",
    unitCost: 550.00,
    confidence: 1,
    source: "Hub City Plumbing - derived from quotes",
    sourceDate: "2025-06",
    notes: "Fixture supplied by owner"
  },
  {
    id: "plm-003",
    category: "plumbing",
    name: "Shower - Rough-in + Finish",
    description: "ABS drain, vent, water supply, install fixture",
    unit: "EA",
    unitCost: 550.00,
    confidence: 1,
    source: "Hub City Plumbing - derived from quotes",
    sourceDate: "2025-06",
    notes: "Fixture supplied by owner, glass extra"
  },
  {
    id: "plm-004",
    category: "plumbing",
    name: "Lavatory (Vanity Sink) - Rough-in + Finish",
    description: "ABS drain, vent, water supply, install fixture",
    unit: "EA",
    unitCost: 350.00,
    confidence: 1,
    source: "Hub City Plumbing - derived from quotes",
    sourceDate: "2025-06",
    notes: "Fixture supplied by owner"
  },
  {
    id: "plm-005",
    category: "plumbing",
    name: "Kitchen Sink - Hookup",
    description: "Connect sink drain and water supply",
    unit: "EA",
    unitCost: 200.00,
    confidence: 1,
    source: "Hub City Plumbing #1066 - derived",
    sourceDate: "2025-09",
    notes: "Fixture supplied by owner"
  },
  {
    id: "plm-006",
    category: "plumbing",
    name: "Dishwasher - Install + Hookup",
    description: "Install dishwasher, connect drain and water supply",
    unit: "EA",
    unitCost: 150.00,
    confidence: 1,
    source: "Hub City Plumbing #1066 - derived",
    sourceDate: "2025-09",
    notes: "Appliance supplied by owner"
  },
  {
    id: "plm-007",
    category: "plumbing",
    name: "Fridge Water Line",
    description: "Run water line to fridge location",
    unit: "EA",
    unitCost: 125.00,
    confidence: 1,
    source: "Hub City Plumbing #1066 - derived",
    sourceDate: "2025-09",
    notes: ""
  },
  {
    id: "plm-008",
    category: "plumbing",
    name: "Washing Machine - Rough-in",
    description: "Drain, vent, hot/cold water supply for washer",
    unit: "EA",
    unitCost: 400.00,
    confidence: 1,
    source: "Hub City Plumbing #1054 - derived",
    sourceDate: "2025-06",
    notes: "New construction"
  },
  {
    id: "plm-009",
    category: "plumbing",
    name: "HWT + Floor Drain",
    description: "Hot water tank hookup with floor drain",
    unit: "EA",
    unitCost: 450.00,
    confidence: 1,
    source: "Hub City Plumbing #1054 - derived",
    sourceDate: "2025-06",
    notes: "Tank supplied by owner"
  },
  {
    id: "plm-010",
    category: "plumbing",
    name: "Water Meter Install",
    description: "Supply and install water meter",
    unit: "EA",
    unitCost: 300.00,
    confidence: 0,
    source: "Industry estimate",
    sourceDate: "2025-01",
    notes: "Included in new construction package"
  },
  {
    id: "plm-011",
    category: "plumbing",
    name: "Backwater Valve (N.O.)",
    description: "Supply and install normally-open backwater valve on sewer main",
    unit: "EA",
    unitCost: 400.00,
    confidence: 0,
    source: "Industry estimate",
    sourceDate: "2025-01",
    notes: "Required by city bylaw"
  },
  {
    id: "plm-012",
    category: "plumbing",
    name: "Plumbing Permit",
    description: "Plumbing permit fee",
    unit: "EA",
    unitCost: 755.00,
    confidence: 2,
    source: "Hub City Plumbing #1054",
    sourceDate: "2025-06",
    notes: "Moncton area, may vary by municipality"
  },
  {
    id: "plm-013",
    category: "plumbing",
    name: "Hosebib (Outdoor Tap)",
    description: "Install exterior hose bib",
    unit: "EA",
    unitCost: 200.00,
    confidence: 1,
    source: "Hub City Plumbing #1054 - derived",
    sourceDate: "2025-06",
    notes: ""
  },

  // ============================================
  // HVAC - Greenfoot Energy
  // ============================================
  {
    id: "hvac-001",
    category: "hvac",
    name: "HRV System - Fully Ducted",
    description: "Fantech HERO 120H or equiv, all electrical, distribution ductwork, hush grills, vent hoods, ECO-Touch controller, bathroom booster timers",
    unit: "EA",
    unitCost: 4250.00,
    confidence: 1,
    source: "Greenfoot Energy #227675-QUO-8",
    sourceDate: "2025-03",
    notes: "72-136 CFM, SRE 80% @ 0°C, 63% @ -25°C. Warranty: lifetime core, 7yr motors, 5yr parts, 1yr labour"
  },
  {
    id: "hvac-002",
    category: "hvac",
    name: "Furnace Install - Gas",
    description: "Install gas furnace, ductwork connections, venting",
    unit: "EA",
    unitCost: 3500.00,
    confidence: 0,
    source: "Industry estimate - Moncton area",
    sourceDate: "2025-01",
    notes: "Equipment not included"
  },
  {
    id: "hvac-003",
    category: "hvac",
    name: "Ductwork - New Construction",
    description: "Supply and return ductwork, registers, grilles",
    unit: "SF",
    unitCost: 8.00,
    confidence: 0,
    source: "Industry estimate",
    sourceDate: "2025-01",
    notes: "Per SF of conditioned floor area"
  },

  // ============================================
  // PAINTING - Elite Trade Painting
  // ============================================
  {
    id: "pnt-001",
    category: "painting",
    name: "Smoke Seal - Walls, Ceilings, Floors",
    description: "Prime/seal all drywall surfaces and subfloor with oil-based primer (Zinsser Cover Stain)",
    unit: "SF",
    unitCost: 2.00,
    confidence: 1,
    source: "Elite Trade Painting #250079 - 44 Teesdale ($2,595 / ~1,300 SF)",
    sourceDate: "2025-03",
    notes: "Includes all paint, labour, materials. 1-2 days."
  },
  {
    id: "pnt-002",
    category: "painting",
    name: "Interior Paint - Walls (2 coats)",
    description: "Prep, prime if needed, 2 coats finish paint on walls",
    unit: "SF",
    unitCost: 2.50,
    confidence: 0,
    source: "Industry estimate - Moncton area",
    sourceDate: "2025-01",
    notes: "Wall SF, not floor SF"
  },
  {
    id: "pnt-003",
    category: "painting",
    name: "Interior Paint - Ceilings (2 coats)",
    description: "Prep, prime if needed, 2 coats finish paint on ceilings",
    unit: "SF",
    unitCost: 2.00,
    confidence: 0,
    source: "Industry estimate - Moncton area",
    sourceDate: "2025-01",
    notes: "Ceiling SF"
  },
  {
    id: "pnt-004",
    category: "painting",
    name: "Interior Paint - Trim (per LF)",
    description: "Prep, prime, paint baseboard/casing/crown",
    unit: "LF",
    unitCost: 3.00,
    confidence: 0,
    source: "Industry estimate - Moncton area",
    sourceDate: "2025-01",
    notes: "Per linear foot of trim"
  },
  {
    id: "pnt-005",
    category: "painting",
    name: "Painting - Additional Labour",
    description: "Hourly rate for work outside quoted scope",
    unit: "HR",
    unitCost: 60.00,
    confidence: 2,
    source: "Elite Trade Painting #250079",
    sourceDate: "2025-03",
    notes: "Plus materials/rentals"
  },

  // ============================================
  // DRYWALL
  // ============================================
  {
    id: "dry-001",
    category: "drywall",
    name: "Drywall Hang - 1/2\" Regular",
    description: "Hang 1/2\" drywall on walls and ceilings",
    unit: "SF",
    unitCost: 0.75,
    confidence: 0,
    source: "Industry estimate - Moncton area",
    sourceDate: "2025-01",
    notes: "Labour only, drywall not included"
  },
  {
    id: "dry-002",
    category: "drywall",
    name: "Drywall Hang - 5/8\" Fire",
    description: "Hang 5/8\" fire-rated drywall",
    unit: "SF",
    unitCost: 0.85,
    confidence: 0,
    source: "Industry estimate - Moncton area",
    sourceDate: "2025-01",
    notes: "Labour only, drywall not included"
  },
  {
    id: "dry-003",
    category: "drywall",
    name: "Drywall Tape & Mud - Level 4",
    description: "Tape, mud, sand to Level 4 finish",
    unit: "SF",
    unitCost: 1.25,
    confidence: 0,
    source: "Industry estimate - Moncton area",
    sourceDate: "2025-01",
    notes: "Labour and compound included"
  },
  {
    id: "dry-004",
    category: "drywall",
    name: "Drywall Complete - Hang + Level 4",
    description: "Hang 1/2\" drywall, tape, mud, sand to Level 4",
    unit: "SF",
    unitCost: 2.00,
    confidence: 0,
    source: "Industry estimate - Moncton area",
    sourceDate: "2025-01",
    notes: "Labour only, drywall not included"
  },

  // ============================================
  // ELECTRICAL
  // ============================================
  {
    id: "elec-001",
    category: "electrical",
    name: "Outlet/Switch - Rough + Finish",
    description: "Run wire, install box, device, and plate",
    unit: "EA",
    unitCost: 150.00,
    confidence: 0,
    source: "Industry estimate - Moncton area",
    sourceDate: "2025-01",
    notes: "Standard 15A circuit"
  },
  {
    id: "elec-002",
    category: "electrical",
    name: "Light Fixture - Install",
    description: "Install customer-supplied light fixture",
    unit: "EA",
    unitCost: 75.00,
    confidence: 0,
    source: "Industry estimate - Moncton area",
    sourceDate: "2025-01",
    notes: "Fixture not included, assumes existing circuit"
  },
  {
    id: "elec-003",
    category: "electrical",
    name: "Panel Upgrade - 200A",
    description: "Upgrade electrical panel to 200A service",
    unit: "EA",
    unitCost: 2500.00,
    confidence: 0,
    source: "Industry estimate - Moncton area",
    sourceDate: "2025-01",
    notes: "Panel and permit included"
  },
  {
    id: "elec-004",
    category: "electrical",
    name: "Circuit - New 15A",
    description: "Run new 15A circuit from panel",
    unit: "EA",
    unitCost: 250.00,
    confidence: 0,
    source: "Industry estimate - Moncton area",
    sourceDate: "2025-01",
    notes: "Wire and breaker included"
  },
  {
    id: "elec-005",
    category: "electrical",
    name: "Circuit - New 20A Dedicated",
    description: "Run new 20A dedicated circuit (kitchen, bath)",
    unit: "EA",
    unitCost: 300.00,
    confidence: 0,
    source: "Industry estimate - Moncton area",
    sourceDate: "2025-01",
    notes: "Wire and breaker included"
  },

  // ============================================
  // EXCAVATION / SEPTIC - Carter's Septic
  // ============================================
  {
    id: "exc-001",
    category: "excavation",
    name: "Foundation - As Per Plans",
    description: "Excavate and pour foundation per plans",
    unit: "JOB",
    unitCost: 3266.00,
    confidence: 1,
    source: "Carter's Septic #33952 - 274 Cedar",
    sourceDate: "2024-11",
    notes: "Price varies significantly by size/complexity"
  },
  {
    id: "exc-002",
    category: "excavation",
    name: "Service Line",
    description: "Excavate and install service line (water/sewer)",
    unit: "LF",
    unitCost: 60.00,
    confidence: 1,
    source: "Carter's Septic #33952 - 274 Cedar ($2,400 / 40')",
    sourceDate: "2024-11",
    notes: ""
  },
  {
    id: "exc-003",
    category: "excavation",
    name: "Driveway Excavation",
    description: "Excavate and prep driveway area",
    unit: "LF",
    unitCost: 73.33,
    confidence: 1,
    source: "Carter's Septic #33952 - 274 Cedar ($2,200 / 30')",
    sourceDate: "2024-11",
    notes: ""
  },
  {
    id: "exc-004",
    category: "excavation",
    name: "Sono Tubes",
    description: "Install sono tube footings",
    unit: "EA",
    unitCost: 270.00,
    confidence: 1,
    source: "Carter's Septic #33952",
    sourceDate: "2024-11",
    notes: ""
  },
  {
    id: "exc-005",
    category: "excavation",
    name: "Fill In/Out",
    description: "Fill or remove material",
    unit: "EA",
    unitCost: 130.00,
    confidence: 1,
    source: "Carter's Septic #33952",
    sourceDate: "2024-11",
    notes: "Per load or event"
  },
  {
    id: "exc-006",
    category: "excavation",
    name: "Heat Concrete",
    description: "Heating for concrete pour (winter)",
    unit: "JOB",
    unitCost: 2520.00,
    confidence: 1,
    source: "Carter's Septic #33952 - 274 Cedar",
    sourceDate: "2024-11",
    notes: "Winter pours only"
  },
  {
    id: "exc-007",
    category: "excavation",
    name: "Regmatic System",
    description: "Install Regmatic septic system",
    unit: "EA",
    unitCost: 900.00,
    confidence: 1,
    source: "Carter's Septic #33952",
    sourceDate: "2024-11",
    notes: ""
  },

  // ============================================
  // FLOORING
  // ============================================
  {
    id: "flr-001",
    category: "flooring",
    name: "Hardwood Install - Nail Down",
    description: "Install solid hardwood flooring, nail down method",
    unit: "SF",
    unitCost: 4.50,
    confidence: 0,
    source: "Industry estimate - Moncton area",
    sourceDate: "2025-01",
    notes: "Labour only, flooring not included"
  },
  {
    id: "flr-002",
    category: "flooring",
    name: "Laminate/LVP Install - Click",
    description: "Install click-lock laminate or luxury vinyl plank",
    unit: "SF",
    unitCost: 2.50,
    confidence: 0,
    source: "Industry estimate - Moncton area",
    sourceDate: "2025-01",
    notes: "Labour only, flooring not included, includes underlayment install"
  },
  {
    id: "flr-003",
    category: "flooring",
    name: "Self-Leveling Cement",
    description: "Apply self-leveling cement (E-Z Flow or equiv)",
    unit: "SF",
    unitCost: 3.00,
    confidence: 0,
    source: "Industry estimate - Moncton area",
    sourceDate: "2025-01",
    notes: "Labour and material"
  },

  // ============================================
  // TILE
  // ============================================
  {
    id: "til-001",
    category: "tile",
    name: "Floor Tile Install",
    description: "Install floor tile with thinset",
    unit: "SF",
    unitCost: 8.00,
    confidence: 0,
    source: "Industry estimate - Moncton area",
    sourceDate: "2025-01",
    notes: "Labour only, tile not included"
  },
  {
    id: "til-002",
    category: "tile",
    name: "Wall Tile Install",
    description: "Install wall tile with thinset",
    unit: "SF",
    unitCost: 10.00,
    confidence: 0,
    source: "Industry estimate - Moncton area",
    sourceDate: "2025-01",
    notes: "Labour only, tile not included"
  },
  {
    id: "til-003",
    category: "tile",
    name: "Tile Grout",
    description: "Grout tile installation",
    unit: "SF",
    unitCost: 2.00,
    confidence: 0,
    source: "Industry estimate - Moncton area",
    sourceDate: "2025-01",
    notes: "Labour and grout included"
  },

  // ============================================
  // TRIM CARPENTRY
  // ============================================
  {
    id: "trim-001",
    category: "trim_carpentry",
    name: "Baseboard Install",
    description: "Install baseboard trim",
    unit: "LF",
    unitCost: 3.50,
    confidence: 0,
    source: "Industry estimate - Moncton area",
    sourceDate: "2025-01",
    notes: "Labour only, trim not included"
  },
  {
    id: "trim-002",
    category: "trim_carpentry",
    name: "Door Casing Install",
    description: "Install door casing both sides",
    unit: "EA",
    unitCost: 75.00,
    confidence: 0,
    source: "Industry estimate - Moncton area",
    sourceDate: "2025-01",
    notes: "Labour only, trim not included"
  },
  {
    id: "trim-003",
    category: "trim_carpentry",
    name: "Window Casing Install",
    description: "Install window casing including stool and apron",
    unit: "EA",
    unitCost: 100.00,
    confidence: 0,
    source: "Industry estimate - Moncton area",
    sourceDate: "2025-01",
    notes: "Labour only, trim not included"
  },
  {
    id: "trim-004",
    category: "trim_carpentry",
    name: "Interior Door Hang - Prehung",
    description: "Install prehung interior door",
    unit: "EA",
    unitCost: 150.00,
    confidence: 0,
    source: "Industry estimate - Moncton area",
    sourceDate: "2025-01",
    notes: "Door not included"
  },
  {
    id: "trim-005",
    category: "trim_carpentry",
    name: "Crown Moulding Install",
    description: "Install crown moulding",
    unit: "LF",
    unitCost: 6.00,
    confidence: 0,
    source: "Industry estimate - Moncton area",
    sourceDate: "2025-01",
    notes: "Labour only, trim not included"
  }
];

// ===========================================
// ASSEMBLIES (Combined Tasks)
// ===========================================

export const assemblies = [
  // ============================================
  // BATHROOM ASSEMBLIES
  // ============================================
  {
    id: "asm-bath-001",
    category: "plumbing",
    name: "3-Piece Bathroom - Rough + Finish",
    description: "WC, tub/shower, lavatory - complete plumbing rough-in and finish",
    components: [
      { id: "plm-001", qty: 1, description: "Toilet" },
      { id: "plm-002", qty: 1, description: "Bathtub" },
      { id: "plm-004", qty: 1, description: "Lavatory" }
    ],
    unit: "EA",
    unitCost: 1350.00,
    confidence: 1,
    source: "Hub City Plumbing - derived",
    sourceDate: "2025-06",
    notes: "Fixtures supplied by owner"
  },
  {
    id: "asm-bath-002",
    category: "plumbing",
    name: "4-Piece Bathroom - Rough + Finish",
    description: "WC, tub, separate shower, lavatory - complete plumbing",
    components: [
      { id: "plm-001", qty: 1, description: "Toilet" },
      { id: "plm-002", qty: 1, description: "Bathtub" },
      { id: "plm-003", qty: 1, description: "Shower" },
      { id: "plm-004", qty: 1, description: "Lavatory" }
    ],
    unit: "EA",
    unitCost: 1900.00,
    confidence: 1,
    source: "Hub City Plumbing - derived",
    sourceDate: "2025-06",
    notes: "Fixtures supplied by owner"
  },
  {
    id: "asm-bath-003",
    category: "plumbing",
    name: "5-Piece Bathroom - Rough + Finish",
    description: "WC, tub, shower, double lavatory - complete plumbing",
    components: [
      { id: "plm-001", qty: 1, description: "Toilet" },
      { id: "plm-002", qty: 1, description: "Bathtub" },
      { id: "plm-003", qty: 1, description: "Shower" },
      { id: "plm-004", qty: 2, description: "Lavatory x2" }
    ],
    unit: "EA",
    unitCost: 2250.00,
    confidence: 1,
    source: "Hub City Plumbing #1066 - derived",
    sourceDate: "2025-09",
    notes: "Fixtures and shower glass supplied by owner"
  },
  {
    id: "asm-bath-004",
    category: "plumbing",
    name: "2-Piece Powder Room - Rough + Finish",
    description: "WC, lavatory - complete plumbing",
    components: [
      { id: "plm-001", qty: 1, description: "Toilet" },
      { id: "plm-004", qty: 1, description: "Lavatory" }
    ],
    unit: "EA",
    unitCost: 800.00,
    confidence: 1,
    source: "Hub City Plumbing - derived",
    sourceDate: "2025-06",
    notes: "Fixtures supplied by owner"
  },

  // ============================================
  // KITCHEN ASSEMBLIES
  // ============================================
  {
    id: "asm-kit-001",
    category: "plumbing",
    name: "Kitchen Plumbing Package",
    description: "Kitchen sink, dishwasher, fridge water line",
    components: [
      { id: "plm-005", qty: 1, description: "Kitchen sink hookup" },
      { id: "plm-006", qty: 1, description: "Dishwasher" },
      { id: "plm-007", qty: 1, description: "Fridge line" }
    ],
    unit: "EA",
    unitCost: 475.00,
    confidence: 2,
    source: "Hub City Plumbing #1066 - 44 Teesdale",
    sourceDate: "2025-09",
    notes: "Direct quote, not derived"
  },

  // ============================================
  // LAUNDRY ASSEMBLIES
  // ============================================
  {
    id: "asm-lnd-001",
    category: "plumbing",
    name: "Laundry Room Plumbing",
    description: "Washer rough-in, utility sink optional",
    components: [
      { id: "plm-008", qty: 1, description: "Washing machine rough-in" }
    ],
    unit: "EA",
    unitCost: 400.00,
    confidence: 1,
    source: "Hub City Plumbing - derived",
    sourceDate: "2025-06",
    notes: ""
  },

  // ============================================
  // FRAMING ASSEMBLIES
  // ============================================
  {
    id: "asm-frm-001",
    category: "framing",
    name: "Complete Shell - New Construction",
    description: "Floor system, exterior walls, interior walls, roof system - labour only",
    components: [
      { id: "frm-001", qty: 1, description: "Floor system" },
      { id: "frm-002", qty: 1, description: "Exterior walls" },
      { id: "frm-003", qty: 1, description: "Interior walls" },
      { id: "frm-004", qty: 1, description: "Roof system" }
    ],
    unit: "SF",
    unitCost: 22.83,
    confidence: 1,
    source: "PLG Builders #545 - 274 Cedar",
    sourceDate: "2025-01",
    notes: "Does not include materials, trusses, or crane beyond 4 hrs"
  },
  {
    id: "asm-frm-002",
    category: "framing",
    name: "Complete Shell - Small Addition",
    description: "Floor system, exterior walls, interior walls, roof system - labour only",
    components: [
      { id: "frm-006", qty: 1, description: "Floor system" },
      { id: "frm-002", qty: 1, description: "Exterior walls" },
      { id: "frm-003", qty: 1, description: "Interior walls" },
      { id: "frm-004", qty: 1, description: "Roof system" }
    ],
    unit: "SF",
    unitCost: 37.54,
    confidence: 1,
    source: "PLG Builders #640 - 44 Teesdale",
    sourceDate: "2025-03",
    notes: "Based on 140 SF addition - smaller = higher $/SF"
  },

  // ============================================
  // EXTERIOR ASSEMBLIES
  // ============================================
  {
    id: "asm-ext-001",
    category: "siding",
    name: "Complete Exterior Finish - Vinyl",
    description: "Vinyl siding, soffit, fascia - labour only",
    components: [
      { id: "sid-001", qty: 1, description: "Vinyl siding install" },
      { id: "sid-002", qty: 1, description: "Soffit & fascia" }
    ],
    unit: "SF",
    unitCost: 7.47,
    confidence: 1,
    source: "PLG Builders #640 - 44 Teesdale",
    sourceDate: "2025-03",
    notes: "Labour only - all materials not included"
  },

  // ============================================
  // DRYWALL ASSEMBLIES
  // ============================================
  {
    id: "asm-dry-001",
    category: "drywall",
    name: "Drywall Complete - Standard Room",
    description: "Hang 1/2\" drywall, tape, mud, sand to Level 4 finish",
    components: [
      { id: "dry-001", qty: 1, description: "Hang drywall" },
      { id: "dry-003", qty: 1, description: "Tape & mud Level 4" }
    ],
    unit: "SF",
    unitCost: 2.00,
    confidence: 0,
    source: "Industry estimate",
    sourceDate: "2025-01",
    notes: "Labour only, drywall not included"
  },

  // ============================================
  // WHOLE HOUSE ASSEMBLIES (PER FIXTURE COUNT)
  // ============================================
  {
    id: "asm-plm-house-001",
    category: "plumbing",
    name: "Complete House Plumbing - New Duplex (per unit)",
    description: "Full plumbing package per unit: underground, rough-in, finish, fixtures",
    components: [
      { id: "plm-001", qty: 1.5, description: "WC (avg)" },
      { id: "plm-004", qty: 2, description: "Vanity" },
      { id: "plm-002", qty: 1.5, description: "Tub/shower" },
      { id: "plm-008", qty: 1, description: "Washer" },
      { id: "plm-005", qty: 1, description: "Kitchen sink" },
      { id: "plm-009", qty: 1, description: "HWT + floor drain" }
    ],
    unit: "EA",
    unitCost: 7050.00,
    confidence: 1,
    source: "Hub City Plumbing #1054 - 274 Cedar ($14,100 / 2 units)",
    sourceDate: "2025-06",
    notes: "Includes water meter and backwater valve. Fixtures by owner."
  }
];

// ===========================================
// UTILITY FUNCTIONS
// ===========================================

/**
 * Get all labour rates
 */
export function getLabourRates() {
  return labourRates;
}

/**
 * Get labour rates by category
 */
export function getLabourRatesByCategory(category) {
  return labourRates.filter(r => r.category === category);
}

/**
 * Get labour rate by ID
 */
export function getLabourRateById(id) {
  return labourRates.find(r => r.id === id);
}

/**
 * Get all assemblies
 */
export function getAssemblies() {
  return assemblies;
}

/**
 * Get assemblies by category
 */
export function getAssembliesByCategory(category) {
  return assemblies.filter(a => a.category === category);
}

/**
 * Get assembly by ID
 */
export function getAssemblyById(id) {
  return assemblies.find(a => a.id === id);
}

/**
 * Calculate assembly cost with current rates
 */
export function calculateAssemblyCostFromRates(assemblyId) {
  const assembly = getAssemblyById(assemblyId);
  if (!assembly) return null;

  let total = 0;
  for (const component of assembly.components) {
    const rate = getLabourRateById(component.id);
    if (rate) {
      total += rate.unitCost * component.qty;
    }
  }
  return total;
}

/**
 * Get confidence color for UI
 */
export function getConfidenceColor(confidence) {
  return CONFIDENCE_COLORS[confidence] || CONFIDENCE_COLORS[0];
}

/**
 * Filter rates by confidence level
 */
export function getVerifiedRates() {
  return labourRates.filter(r => r.confidence === CONFIDENCE.VERIFIED);
}

export function getLimitedRates() {
  return labourRates.filter(r => r.confidence === CONFIDENCE.LIMITED);
}

export function getEstimateRates() {
  return labourRates.filter(r => r.confidence === CONFIDENCE.ESTIMATE);
}

/**
 * Get summary statistics
 */
export function getRateSummary() {
  const verified = labourRates.filter(r => r.confidence === 2).length;
  const limited = labourRates.filter(r => r.confidence === 1).length;
  const estimate = labourRates.filter(r => r.confidence === 0).length;

  return {
    total: labourRates.length,
    verified,
    limited,
    estimate,
    verifiedPercent: Math.round((verified / labourRates.length) * 100),
    limitedPercent: Math.round((limited / labourRates.length) * 100),
    estimatePercent: Math.round((estimate / labourRates.length) * 100)
  };
}

// Default export
export default {
  labourRates,
  assemblies,
  CONFIDENCE,
  CONFIDENCE_COLORS,
  LABOUR_CATEGORIES,
  getLabourRates,
  getLabourRatesByCategory,
  getLabourRateById,
  getAssemblies,
  getAssembliesByCategory,
  getAssemblyById,
  calculateAssemblyCostFromRates,
  getConfidenceColor,
  getVerifiedRates,
  getLimitedRates,
  getEstimateRates,
  getRateSummary
};
