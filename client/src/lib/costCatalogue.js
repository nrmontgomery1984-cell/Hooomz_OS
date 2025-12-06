/**
 * Cost Catalogue - Hooomz Buildz
 * 
 * Generated: 2025-12-02
 * Source: 64 Home Hardware receipts (Aug-Dec 2025)
 * Region: Greater Moncton, New Brunswick
 * 
 * Suppliers:
 * - Elmwood Hardware Ltd (257 Elmwood Drive, Moncton)
 * - Magnetic Hill Home Hardware (2463 Mountain Rd, Moncton)
 * - Downey Home Hardware (1106 Cleveland Ave, Riverview)
 * - Dieppe Home Hardware (205 Acadie Ave, Dieppe)
 */

// Material Categories
export const MATERIAL_CATEGORIES = [
  { id: 'lumber', name: 'Lumber & Framing' },
  { id: 'drywall', name: 'Drywall & Finishing' },
  { id: 'electrical', name: 'Electrical' },
  { id: 'plumbing', name: 'Plumbing' },
  { id: 'hvac', name: 'HVAC' },
  { id: 'roofing', name: 'Roofing' },
  { id: 'insulation', name: 'Insulation' },
  { id: 'flooring', name: 'Flooring' },
  { id: 'tile', name: 'Tile & Stone' },
  { id: 'paint', name: 'Paint & Finishes' },
  { id: 'cabinets', name: 'Cabinets & Counters' },
  { id: 'doors_windows', name: 'Doors & Windows' },
  { id: 'trim', name: 'Trim & Molding' },
  { id: 'hardware', name: 'Hardware & Fasteners' },
  { id: 'exterior', name: 'Exterior & Siding' },
  { id: 'fixtures', name: 'Fixtures & Appliances' },
];

// Materials Database - Real NB pricing from receipts
export const materials = [
  // ============================================
  // LUMBER - KD (Kiln Dried)
  // ============================================
  {
    id: "lum-001",
    category: "lumber",
    name: "2x4x8 KD SPF",
    unit: "EA",
    unitCost: 3.90,
    supplier: "Home Hardware",
    sku: "2832427"
  },
  {
    id: "lum-002",
    category: "lumber",
    name: "2x4x12 KD SPF",
    unit: "EA",
    unitCost: 7.18,
    supplier: "Home Hardware",
    sku: "2832431"
  },
  {
    id: "lum-003",
    category: "lumber",
    name: "2x4x92-5/8 Stud KD",
    unit: "EA",
    unitCost: 4.49,
    supplier: "Home Hardware",
    sku: "2833521"
  },
  {
    id: "lum-004",
    category: "lumber",
    name: "2x10x10 KD",
    unit: "EA",
    unitCost: 22.03,
    supplier: "Home Hardware",
    sku: "2832479"
  },
  {
    id: "lum-005",
    category: "lumber",
    name: "2x12x12 KD",
    unit: "EA",
    unitCost: 40.48,
    supplier: "Home Hardware",
    sku: "2832499"
  },

  // ============================================
  // LUMBER - PT (Pressure Treated)
  // ============================================
  {
    id: "lum-006",
    category: "lumber",
    name: "2x4x8 PT Brown",
    unit: "EA",
    unitCost: 7.94,
    supplier: "Home Hardware",
    sku: "2836166"
  },
  {
    id: "lum-007",
    category: "lumber",
    name: "2x4x12 PT Brown",
    unit: "EA",
    unitCost: 11.90,
    supplier: "Home Hardware",
    sku: "2836168"
  },
  {
    id: "lum-008",
    category: "lumber",
    name: "2x6x8 PT Brown",
    unit: "EA",
    unitCost: 13.36,
    supplier: "Home Hardware",
    sku: "2836149"
  },
  {
    id: "lum-009",
    category: "lumber",
    name: "2x8x8 PT Brown",
    unit: "EA",
    unitCost: 18.76,
    supplier: "Home Hardware",
    sku: "2836151"
  },
  {
    id: "lum-010",
    category: "lumber",
    name: "2x8x10 PT Brown",
    unit: "EA",
    unitCost: 23.46,
    supplier: "Home Hardware",
    sku: "2836152"
  },
  {
    id: "lum-011",
    category: "lumber",
    name: "2x8x12 PT Brown",
    unit: "EA",
    unitCost: 28.15,
    supplier: "Home Hardware",
    sku: "2836153"
  },
  {
    id: "lum-012",
    category: "lumber",
    name: "2x8x16 PT Brown",
    unit: "EA",
    unitCost: 38.66,
    supplier: "Home Hardware",
    sku: "2836155"
  },
  {
    id: "lum-013",
    category: "lumber",
    name: "2x10x8 PT Brown",
    unit: "EA",
    unitCost: 25.01,
    supplier: "Home Hardware",
    sku: "2836156"
  },
  {
    id: "lum-014",
    category: "lumber",
    name: "2x10x10 PT Brown",
    unit: "EA",
    unitCost: 31.27,
    supplier: "Home Hardware",
    sku: "2836157"
  },
  {
    id: "lum-015",
    category: "lumber",
    name: "2x10x12 PT Brown",
    unit: "EA",
    unitCost: 37.52,
    supplier: "Home Hardware",
    sku: "2836158"
  },
  {
    id: "lum-016",
    category: "lumber",
    name: "1x6x8 PT Brown",
    unit: "EA",
    unitCost: 6.61,
    supplier: "Home Hardware",
    sku: "2835131"
  },

  // ============================================
  // LUMBER - Sheet Goods
  // ============================================
  {
    id: "lum-017",
    category: "lumber",
    name: "1x3x12 Spruce Strapping",
    unit: "EA",
    unitCost: 3.67,
    supplier: "Home Hardware",
    sku: "2833329"
  },
  {
    id: "lum-018",
    category: "lumber",
    name: "OSB 7/16\" 4x8",
    unit: "EA",
    unitCost: 12.72,
    supplier: "Home Hardware",
    sku: "2814855"
  },
  {
    id: "lum-019",
    category: "lumber",
    name: "Plywood 3/8\" Standard 4x8",
    unit: "EA",
    unitCost: 29.39,
    supplier: "Home Hardware",
    sku: "2817481"
  },
  {
    id: "lum-020",
    category: "lumber",
    name: "Plywood 5/8\" Standard SE 4x8",
    unit: "EA",
    unitCost: 51.92,
    supplier: "Home Hardware",
    sku: "2817485"
  },
  {
    id: "lum-021",
    category: "lumber",
    name: "MDF 1/2\" 4x8",
    unit: "EA",
    unitCost: 48.98,
    supplier: "Home Hardware",
    sku: "2813237"
  },
  {
    id: "lum-022",
    category: "lumber",
    name: "Cedar Shims 14\" 42pc",
    unit: "EA",
    unitCost: 8.79,
    supplier: "Home Hardware",
    sku: "261069"
  },

  // ============================================
  // DRYWALL
  // ============================================
  {
    id: "dry-001",
    category: "drywall",
    name: "Drywall 1/2\" 4x8",
    unit: "EA",
    unitCost: 17.48,
    supplier: "Home Hardware",
    sku: "2709818"
  },
  {
    id: "dry-002",
    category: "drywall",
    name: "Drywall 5/8\" Fire Rated 4x8",
    unit: "EA",
    unitCost: 28.24,
    supplier: "Home Hardware",
    sku: "2709103"
  },
  {
    id: "dry-003",
    category: "drywall",
    name: "Drywall 1/2\" M2Tech Mold Resistant 4x8",
    unit: "EA",
    unitCost: 41.38,
    supplier: "Home Hardware",
    sku: "2709312"
  },
  {
    id: "dry-004",
    category: "drywall",
    name: "Drywall Angle 25G 10'",
    unit: "EA",
    unitCost: 3.90,
    supplier: "Home Hardware",
    sku: "DA25"
  },
  {
    id: "dry-005",
    category: "drywall",
    name: "Joint Compound BestMud 17L",
    unit: "EA",
    unitCost: 30.29,
    supplier: "Home Hardware",
    sku: "1625746"
  },
  {
    id: "dry-006",
    category: "drywall",
    name: "Sheetrock 90 Setting Compound 11kg",
    unit: "BG",
    unitCost: 42.99,
    supplier: "Home Hardware",
    sku: "2710122"
  },
  {
    id: "dry-007",
    category: "drywall",
    name: "A/P Compound 20 Sheetrock 1.25kg",
    unit: "EA",
    unitCost: 16.16,
    supplier: "Home Hardware",
    sku: "2710008"
  },
  {
    id: "dry-008",
    category: "drywall",
    name: "Joint Tape 2x250'",
    unit: "EA",
    unitCost: 8.12,
    supplier: "Home Hardware",
    sku: "1625058"
  },
  {
    id: "dry-009",
    category: "drywall",
    name: "Joint Tape Perf 2x500'",
    unit: "RL",
    unitCost: 9.79,
    supplier: "Home Hardware",
    sku: "1625105"
  },
  {
    id: "dry-010",
    category: "drywall",
    name: "Acoustical Sealant Grey 300ml",
    unit: "EA",
    unitCost: 7.34,
    supplier: "Home Hardware",
    sku: "2034000"
  },
  {
    id: "dry-011",
    category: "drywall",
    name: "Acoustical Sealant PL 295ml",
    unit: "EA",
    unitCost: 9.30,
    supplier: "Home Hardware",
    sku: "2034549"
  },
  {
    id: "dry-012",
    category: "drywall",
    name: "Dust Control Compound 5.5kg",
    unit: "EA",
    unitCost: 26.45,
    supplier: "Home Hardware",
    sku: "1625722"
  },
  {
    id: "dry-013",
    category: "drywall",
    name: "Access Panel 9x9 White",
    unit: "EA",
    unitCost: 23.51,
    supplier: "Home Hardware",
    sku: "2709901"
  },
  {
    id: "dry-014",
    category: "drywall",
    name: "Access Panel 12x12 White",
    unit: "EA",
    unitCost: 20.57,
    supplier: "Home Hardware",
    sku: "2709902"
  },

  // ============================================
  // INSULATION
  // ============================================
  {
    id: "ins-001",
    category: "insulation",
    name: "XPS Foam 1\" 4x8 R5",
    unit: "EA",
    unitCost: 34.10,
    supplier: "Home Hardware",
    sku: "2719300"
  },
  {
    id: "ins-002",
    category: "insulation",
    name: "R12 15\" Certainteed Batt 117.5sf",
    unit: "BG",
    unitCost: 76.17,
    supplier: "Home Hardware",
    sku: "2717330"
  },
  {
    id: "ins-003",
    category: "insulation",
    name: "R20 15\" Certainteed Batt 68.54sf",
    unit: "BG",
    unitCost: 71.00,
    supplier: "Home Hardware",
    sku: "2717286"
  },
  {
    id: "ins-004",
    category: "insulation",
    name: "Vapor Barrier 102\" Ultra+ 1500sf",
    unit: "RL",
    unitCost: 97.99,
    supplier: "Home Hardware",
    sku: "2645843"
  },
  {
    id: "ins-005",
    category: "insulation",
    name: "Attic Hatch Insulated R50",
    unit: "EA",
    unitCost: 202.85,
    supplier: "Home Hardware",
    sku: "EAHI"
  },
  {
    id: "ins-006",
    category: "insulation",
    name: "Insulation Kit Laminate/Hardwood 10-26",
    unit: "EA",
    unitCost: 38.21,
    supplier: "Home Hardware",
    sku: "2530941"
  },

  // ============================================
  // EXTERIOR
  // ============================================
  {
    id: "ext-001",
    category: "exterior",
    name: "PT Decking 5/4x6x8",
    unit: "EA",
    unitCost: 9.08,
    supplier: "Home Hardware",
    sku: "2835240"
  },
  {
    id: "ext-002",
    category: "exterior",
    name: "PT Decking 5/4x6x12",
    unit: "EA",
    unitCost: 13.62,
    supplier: "Home Hardware",
    sku: "2835242"
  },
  {
    id: "ext-003",
    category: "exterior",
    name: "PT Decking 5/4x6x14",
    unit: "EA",
    unitCost: 16.36,
    supplier: "Home Hardware",
    sku: "2835244"
  },
  {
    id: "ext-004",
    category: "exterior",
    name: "Vinyl J Trim 5/8\" White 12'",
    unit: "EA",
    unitCost: 8.16,
    supplier: "Home Hardware",
    sku: "2621101"
  },
  {
    id: "ext-005",
    category: "exterior",
    name: "Sheathing Tape Red 60mmx55m",
    unit: "EA",
    unitCost: 11.45,
    supplier: "Home Hardware",
    sku: "2611202"
  },
  {
    id: "ext-006",
    category: "exterior",
    name: "Crusher Dust 20kg",
    unit: "EA",
    unitCost: 10.19,
    supplier: "Home Hardware",
    sku: "5010189"
  },
  {
    id: "ext-007",
    category: "exterior",
    name: "Concrete Mix 25kg",
    unit: "EA",
    unitCost: 7.99,
    supplier: "Home Hardware",
    sku: "262263"
  },
  {
    id: "ext-008",
    category: "exterior",
    name: "Weed Barrier 20yr 3x50'",
    unit: "EA",
    unitCost: 26.45,
    supplier: "Home Hardware",
    sku: "5010448"
  },
  {
    id: "ext-009",
    category: "exterior",
    name: "Patio Slab 12x12",
    unit: "EA",
    unitCost: 5.40,
    supplier: "Home Hardware",
    sku: "5010100"
  },

  // ============================================
  // TRIM
  // ============================================
  {
    id: "trm-001",
    category: "trim",
    name: "Heritage Baseboard 1/2x5-13/16",
    unit: "FT",
    unitCost: 0.97,
    supplier: "Home Hardware",
    sku: "BASE42"
  },
  {
    id: "trm-002",
    category: "trim",
    name: "Quarter Round 1/2x1/2 FJP",
    unit: "FT",
    unitCost: 0.95,
    supplier: "Home Hardware",
    sku: "2907123"
  },
  {
    id: "trm-003",
    category: "trim",
    name: "MDF Casing/Base Kit 1/2x3-1/2 78\"",
    unit: "KT",
    unitCost: 69.00,
    supplier: "Home Hardware",
    sku: "2188"
  },
  {
    id: "trm-004",
    category: "trim",
    name: "MDF Casing/Base 78\" (loose)",
    unit: "PC",
    unitCost: 9.18,
    supplier: "Home Hardware",
    sku: "2188"
  },
  {
    id: "trm-005",
    category: "trim",
    name: "MDF Baseboard 1/2x5-1/2x8'",
    unit: "EA",
    unitCost: 14.99,
    supplier: "Home Hardware",
    sku: "2930474"
  },
  {
    id: "trm-006",
    category: "trim",
    name: "Door Stop FJP Prime 5/16x1-1/16",
    unit: "EA",
    unitCost: 13.50,
    supplier: "Home Hardware",
    sku: "2933601"
  },

  // ============================================
  // PAINT & FINISHING
  // ============================================
  {
    id: "pnt-001",
    category: "paint",
    name: "Interior Primer 18.9L (5gal)",
    unit: "EA",
    unitCost: 127.39,
    supplier: "Home Hardware",
    sku: "1850624"
  },
  {
    id: "pnt-002",
    category: "paint",
    name: "Rust Paint Tremclad 340g",
    unit: "EA",
    unitCost: 14.69,
    supplier: "Home Hardware",
    sku: "1822040"
  },
  {
    id: "pnt-003",
    category: "paint",
    name: "Paint Roller Frame 240mm",
    unit: "EA",
    unitCost: 14.20,
    supplier: "Home Hardware",
    sku: "1655067"
  },
  {
    id: "pnt-004",
    category: "paint",
    name: "Paint Rollers LF 240mmx6mm 3pk",
    unit: "PK",
    unitCost: 14.69,
    supplier: "Home Hardware",
    sku: "1655624"
  },
  {
    id: "pnt-005",
    category: "paint",
    name: "Paint Rollers MCR 240mmx15mm 10pk",
    unit: "PK",
    unitCost: 42.13,
    supplier: "Home Hardware",
    sku: "1655660"
  },
  {
    id: "pnt-006",
    category: "paint",
    name: "Paint Rollers MCR 240mmx10mm 3pk",
    unit: "PK",
    unitCost: 15.67,
    supplier: "Home Hardware",
    sku: "1655669"
  },
  {
    id: "pnt-007",
    category: "paint",
    name: "Foam Roller Refills 4\" 10pk",
    unit: "PK",
    unitCost: 13.71,
    supplier: "Home Hardware",
    sku: "1655550"
  },
  {
    id: "pnt-008",
    category: "paint",
    name: "Paint Tray Liner Jumbo 3pk",
    unit: "PK",
    unitCost: 10.77,
    supplier: "Home Hardware",
    sku: "1656007"
  },
  {
    id: "pnt-009",
    category: "paint",
    name: "Paint Roller Tray 240mm",
    unit: "EA",
    unitCost: 9.30,
    supplier: "Home Hardware",
    sku: "1656112"
  },
  {
    id: "pnt-010",
    category: "paint",
    name: "Paint Brush Angle 3\"",
    unit: "EA",
    unitCost: 23.51,
    supplier: "Home Hardware",
    sku: "1612093"
  },
  {
    id: "pnt-011",
    category: "paint",
    name: "Paint Brush Angled 2.5\"",
    unit: "EA",
    unitCost: 13.71,
    supplier: "Home Hardware",
    sku: "1612091"
  },
  {
    id: "pnt-012",
    category: "paint",
    name: "Paint Mixer Metal 4.75x23.5\"",
    unit: "EA",
    unitCost: 27.43,
    supplier: "Home Hardware",
    sku: "1211803"
  },
  {
    id: "pnt-013",
    category: "paint",
    name: "Drop Sheet Fabric/Poly 8x12'",
    unit: "EA",
    unitCost: 14.20,
    supplier: "Home Hardware",
    sku: "1643210"
  },
  {
    id: "pnt-014",
    category: "paint",
    name: "Painter's Tape Green 24mmx55m",
    unit: "EA",
    unitCost: 4.89,
    supplier: "Home Hardware",
    sku: "1670891"
  },
  {
    id: "pnt-015",
    category: "paint",
    name: "Caulk Acrylic White 300ml",
    unit: "EA",
    unitCost: 4.89,
    supplier: "Home Hardware",
    sku: "2036319"
  },
  {
    id: "pnt-016",
    category: "paint",
    name: "Caulk Alex Plus White 300ml",
    unit: "EA",
    unitCost: 3.13,
    supplier: "Home Hardware",
    sku: "2036317"
  },
  {
    id: "pnt-017",
    category: "paint",
    name: "Caulk Acrylic Fast Dry White 300ml",
    unit: "EA",
    unitCost: 4.89,
    supplier: "Home Hardware",
    sku: "2031706"
  },
  {
    id: "pnt-018",
    category: "paint",
    name: "Caulk Latex Mold+TR White 300ml",
    unit: "EA",
    unitCost: 5.87,
    supplier: "Home Hardware",
    sku: "2034294"
  },
  {
    id: "pnt-019",
    category: "paint",
    name: "Caulk Thermoplastic Clear 295ml",
    unit: "EA",
    unitCost: 11.75,
    supplier: "Home Hardware",
    sku: "2036346"
  },
  {
    id: "pnt-020",
    category: "paint",
    name: "Caulk Thermoplastic Translucent 295ml",
    unit: "EA",
    unitCost: 11.75,
    supplier: "Home Hardware",
    sku: "2036356"
  },
  {
    id: "pnt-021",
    category: "paint",
    name: "Silicone K+B Paintable White 280ml",
    unit: "EA",
    unitCost: 15.18,
    supplier: "Home Hardware",
    sku: "2031251"
  },
  {
    id: "pnt-022",
    category: "paint",
    name: "Silicone K+B TS White 300ml",
    unit: "EA",
    unitCost: 18.61,
    supplier: "Home Hardware",
    sku: "2034392"
  },
  {
    id: "pnt-023",
    category: "paint",
    name: "Silicone K+B Ult White 300ml",
    unit: "EA",
    unitCost: 18.61,
    supplier: "Home Hardware",
    sku: "2034393"
  },
  {
    id: "pnt-024",
    category: "paint",
    name: "Silicone II Lt Grey 290ml",
    unit: "EA",
    unitCost: 14.20,
    supplier: "Home Hardware",
    sku: "2034532"
  },
  {
    id: "pnt-025",
    category: "paint",
    name: "Wood Filler Lt Oak 90ml",
    unit: "EA",
    unitCost: 7.34,
    supplier: "Home Hardware",
    sku: "1625263"
  },
  {
    id: "pnt-026",
    category: "paint",
    name: "Wood Filler Mahogany 90ml",
    unit: "EA",
    unitCost: 7.34,
    supplier: "Home Hardware",
    sku: "1625290"
  },

  // ============================================
  // HARDWARE - Connectors
  // ============================================
  {
    id: "hdw-001",
    category: "hardware",
    name: "Joist Hanger 18GA 2x6",
    unit: "EA",
    unitCost: 1.75,
    supplier: "Home Hardware",
    sku: "2682010"
  },
  {
    id: "hdw-002",
    category: "hardware",
    name: "Joist Hanger Double 2x6",
    unit: "EA",
    unitCost: 4.50,
    supplier: "Home Hardware",
    sku: "2682047"
  },
  {
    id: "hdw-003",
    category: "hardware",
    name: "Joist Hanger HDN Flng 2x6",
    unit: "EA",
    unitCost: 4.20,
    supplier: "Home Hardware",
    sku: "2682066"
  },
  {
    id: "hdw-004",
    category: "hardware",
    name: "Joist Hanger Triple 2x8",
    unit: "EA",
    unitCost: 5.57,
    supplier: "Home Hardware",
    sku: "2649354"
  },
  {
    id: "hdw-005",
    category: "hardware",
    name: "Jack Hanger S/S RHT",
    unit: "EA",
    unitCost: 13.49,
    supplier: "Home Hardware",
    sku: "2681911"
  },

  // ============================================
  // HARDWARE - Fasteners
  // ============================================
  {
    id: "hdw-006",
    category: "hardware",
    name: "Joist Hanger Nails",
    unit: "PK",
    unitCost: 27.43,
    supplier: "Home Hardware",
    sku: "2684001"
  },
  {
    id: "hdw-007",
    category: "hardware",
    name: "Framing Nails Paslode 3-1/4\" 3000ct",
    unit: "CT",
    unitCost: 71.27,
    supplier: "Home Hardware",
    sku: "1285567"
  },
  {
    id: "hdw-008",
    category: "hardware",
    name: "Brad Nails 18G 1-3/4\" Galv",
    unit: "EA",
    unitCost: 18.67,
    supplier: "Home Hardware",
    sku: "7102142A"
  },
  {
    id: "hdw-009",
    category: "hardware",
    name: "Deck Screws 8x3\" Box",
    unit: "BX",
    unitCost: 99.99,
    supplier: "Home Hardware",
    sku: "2169100"
  },
  {
    id: "hdw-010",
    category: "hardware",
    name: "Drywall Screws Coarse 7x2.5\"",
    unit: "LB",
    unitCost: 6.70,
    supplier: "Home Hardware",
    sku: "2161423"
  },
  {
    id: "hdw-011",
    category: "hardware",
    name: "Concrete Screws 3/16x3-1/4\" 25pk",
    unit: "PK",
    unitCost: 15.18,
    supplier: "Home Hardware",
    sku: "2186717"
  },
  {
    id: "hdw-012",
    category: "hardware",
    name: "Self-Drill Screws Pan 6x3/8\" 10pk",
    unit: "PK",
    unitCost: 2.93,
    supplier: "Home Hardware",
    sku: "2166881"
  },
  {
    id: "hdw-013",
    category: "hardware",
    name: "Self-Drill Screws Pan 3/4x8 pk",
    unit: "PK",
    unitCost: 13.22,
    supplier: "Home Hardware",
    sku: "2166854"
  },
  {
    id: "hdw-014",
    category: "hardware",
    name: "Wood Screws Brass Flat 10x2\" 5pk",
    unit: "PK",
    unitCost: 3.91,
    supplier: "Home Hardware",
    sku: "2180472"
  },
  {
    id: "hdw-015",
    category: "hardware",
    name: "Wood Screws Flat Socket 6x2\" 10pk",
    unit: "PK",
    unitCost: 3.42,
    supplier: "Home Hardware",
    sku: "2178971"
  },
  {
    id: "hdw-016",
    category: "hardware",
    name: "Soffit Screws White 8x1-1/4\" 100pk",
    unit: "EA",
    unitCost: 12.24,
    supplier: "Home Hardware",
    sku: "2169544"
  },
  {
    id: "hdw-017",
    category: "hardware",
    name: "Staples T50 5/16\" 1000pk",
    unit: "PK",
    unitCost: 14.69,
    supplier: "Home Hardware",
    sku: "1073031"
  },

  // ============================================
  // HARDWARE - Blades & Bits
  // ============================================
  {
    id: "hdw-018",
    category: "hardware",
    name: "Circular Saw Blade 7-1/4\" 24T",
    unit: "EA",
    unitCost: 11.73,
    supplier: "Home Hardware",
    sku: "1221655"
  },
  {
    id: "hdw-019",
    category: "hardware",
    name: "Circular Saw Blades 10\" 40T/60T 2pk",
    unit: "PK",
    unitCost: 93.09,
    supplier: "Home Hardware",
    sku: "1350900"
  },
  {
    id: "hdw-020",
    category: "hardware",
    name: "T20 U-Bit 3-1/2\"",
    unit: "EA",
    unitCost: 4.89,
    supplier: "Home Hardware",
    sku: "122425"
  },
  {
    id: "hdw-021",
    category: "hardware",
    name: "Nutsetter 6\" x 1/4\"",
    unit: "EA",
    unitCost: 13.02,
    supplier: "Home Hardware",
    sku: "122436"
  },
  {
    id: "hdw-022",
    category: "hardware",
    name: "Concrete Screw Drill Bit 5/32\"",
    unit: "EA",
    unitCost: 7.83,
    supplier: "Home Hardware",
    sku: "1244600"
  },
  {
    id: "hdw-023",
    category: "hardware",
    name: "Spade Bit 1-1/4\"",
    unit: "EA",
    unitCost: 8.81,
    supplier: "Home Hardware",
    sku: "1214765"
  },
  {
    id: "hdw-024",
    category: "hardware",
    name: "Tile & Glass Bit 1/2\"",
    unit: "EA",
    unitCost: 16.65,
    supplier: "Home Hardware",
    sku: "1243900"
  },
  {
    id: "hdw-025",
    category: "hardware",
    name: "Tile & Glass Bit 3/16\"",
    unit: "EA",
    unitCost: 8.81,
    supplier: "Home Hardware",
    sku: "1243903"
  },
  {
    id: "hdw-026",
    category: "hardware",
    name: "Masonry Bit Tungsten 3/16x4.5\"",
    unit: "EA",
    unitCost: 23.51,
    supplier: "Home Hardware",
    sku: "1244450"
  },
  {
    id: "hdw-027",
    category: "hardware",
    name: "Impact Bit #2 Square 6\"",
    unit: "EA",
    unitCost: 6.85,
    supplier: "Home Hardware",
    sku: "128601"
  },
  {
    id: "hdw-028",
    category: "hardware",
    name: "Sanding Discs 5\" 150G 50pk",
    unit: "PK",
    unitCost: 9.77,
    supplier: "Home Hardware",
    sku: "1234126"
  },
  {
    id: "hdw-029",
    category: "hardware",
    name: "Sanding Sponge 180G",
    unit: "EA",
    unitCost: 6.85,
    supplier: "Home Hardware",
    sku: "1061527"
  },

  // ============================================
  // HARDWARE - Door Hardware
  // ============================================
  {
    id: "hdw-030",
    category: "hardware",
    name: "Hinges Butt Black 3.5x5/8\"",
    unit: "EA",
    unitCost: 5.18,
    supplier: "Home Hardware",
    sku: "2410674"
  },
  {
    id: "hdw-031",
    category: "hardware",
    name: "Hinges Butt Black 3.5x1/4\"",
    unit: "EA",
    unitCost: 5.38,
    supplier: "Home Hardware",
    sku: "2410668"
  },
  {
    id: "hdw-032",
    category: "hardware",
    name: "Hinges Butt Satin Chrome 3.5x1/4\"",
    unit: "EA",
    unitCost: 5.38,
    supplier: "Home Hardware",
    sku: "2410671"
  },
  {
    id: "hdw-033",
    category: "hardware",
    name: "Magnetic Latch Double White",
    unit: "EA",
    unitCost: 4.60,
    supplier: "Home Hardware",
    sku: "2307524"
  },

  // ============================================
  // HARDWARE - Adhesives & Misc
  // ============================================
  {
    id: "hdw-034",
    category: "hardware",
    name: "Instant Adhesive 50g",
    unit: "EA",
    unitCost: 19.59,
    supplier: "Home Hardware",
    sku: "2030751"
  },
  {
    id: "hdw-035",
    category: "hardware",
    name: "Instant Adhesive 2-Part 100g",
    unit: "EA",
    unitCost: 31.35,
    supplier: "Home Hardware",
    sku: "2030755"
  },
  {
    id: "hdw-036",
    category: "hardware",
    name: "Panel & Moulding Adhesive 266ml",
    unit: "EA",
    unitCost: 12.24,
    supplier: "Home Hardware",
    sku: "2032983"
  },
  {
    id: "hdw-037",
    category: "hardware",
    name: "Foam Gun Cleaner 12oz",
    unit: "EA",
    unitCost: 18.51,
    supplier: "Home Hardware",
    sku: "7102213A"
  },
  {
    id: "hdw-038",
    category: "hardware",
    name: "Siding Removal Tool 6\"",
    unit: "EA",
    unitCost: 8.81,
    supplier: "Home Hardware",
    sku: "1012901"
  },

  // ============================================
  // HVAC
  // ============================================
  {
    id: "hvac-001",
    category: "hvac",
    name: "Aluminum Flex Duct 4x8'",
    unit: "PK",
    unitCost: 21.55,
    supplier: "Home Hardware",
    sku: "3721501"
  },
  {
    id: "hvac-002",
    category: "hvac",
    name: "Dryer Vent Pipe 4x24 Alum",
    unit: "EA",
    unitCost: 8.81,
    supplier: "Home Hardware",
    sku: "3721217"
  },
  {
    id: "hvac-003",
    category: "hvac",
    name: "Dryer Vent Elbow Adj 4\"",
    unit: "EA",
    unitCost: 7.34,
    supplier: "Home Hardware",
    sku: "3721235"
  },
  {
    id: "hvac-004",
    category: "hvac",
    name: "Vent Cap White Promax 4\"",
    unit: "EA",
    unitCost: 12.73,
    supplier: "Home Hardware",
    sku: "3721316"
  },
  {
    id: "hvac-005",
    category: "hvac",
    name: "Supply/Exhaust Grill Round 4-5\"",
    unit: "EA",
    unitCost: 21.55,
    supplier: "Home Hardware",
    sku: "5538037"
  },

  // ============================================
  // PLUMBING
  // ============================================
  {
    id: "plm-001",
    category: "plumbing",
    name: "ABS Pipe 1.5x12'",
    unit: "EA",
    unitCost: 29.39,
    supplier: "Home Hardware",
    sku: "3252045"
  },
  {
    id: "plm-002",
    category: "plumbing",
    name: "Pipe Straps CPVC J 3/4\" 10pk",
    unit: "PK",
    unitCost: 4.50,
    supplier: "Home Hardware",
    sku: "3255141"
  },

  // ============================================
  // FLOORING
  // ============================================
  {
    id: "flr-001",
    category: "flooring",
    name: "Self-Leveling Cement E-Z Flow 50L",
    unit: "EA",
    unitCost: 55.85,
    supplier: "Home Hardware",
    sku: "2622629"
  },
  {
    id: "flr-002",
    category: "flooring",
    name: "Primer EZ Flow 100 946ml",
    unit: "EA",
    unitCost: 28.41,
    supplier: "Home Hardware",
    sku: "2622647"
  },

  // ============================================
  // TILE
  // ============================================
  {
    id: "til-001",
    category: "tile",
    name: "V-Notch Spreader 9\"",
    unit: "EA",
    unitCost: 5.57,
    supplier: "Home Hardware",
    sku: "1077971"
  },
  {
    id: "til-002",
    category: "tile",
    name: "Grout Float 4x9",
    unit: "EA",
    unitCost: 10.77,
    supplier: "Home Hardware",
    sku: "1078782"
  },
  {
    id: "til-003",
    category: "tile",
    name: "Ceramic Tile Adhesive 0.946L",
    unit: "EA",
    unitCost: 13.71,
    supplier: "Home Hardware",
    sku: "2032791"
  },

  // ============================================
  // ROOFING
  // ============================================
  {
    id: "rof-001",
    category: "roofing",
    name: "Vent Rafter Double 22-1/2x48",
    unit: "EA",
    unitCost: 4.26,
    supplier: "Home Hardware",
    sku: "2670069"
  },

  // ============================================
  // DOORS & WINDOWS
  // ============================================
  {
    id: "dw-001",
    category: "doors_windows",
    name: "Exterior Door 32\" LH 6-Panel Steel",
    unit: "EA",
    unitCost: 354.00,
    supplier: "Home Hardware",
    sku: "E32LH6586P"
  }
];

// ============================================
// STORAGE FUNCTIONS
// ============================================

const STORAGE_KEY = 'hooomz_cost_catalogue';

/**
 * Get all materials from storage (or defaults)
 */
export function getMaterials() {
  if (typeof window === 'undefined') return materials;
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return parsed.materials || materials;
    } catch (e) {
      console.error('Error parsing stored materials:', e);
      return materials;
    }
  }
  return materials;
}

/**
 * Save materials to storage
 */
export function saveMaterials(updatedMaterials) {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    materials: updatedMaterials,
    lastUpdated: new Date().toISOString()
  }));
}

/**
 * Get materials by category
 */
export function getMaterialsByCategory(category) {
  return getMaterials().filter(m => m.category === category);
}

/**
 * Find material by SKU
 */
export function getMaterialBySku(sku) {
  return getMaterials().find(m => m.sku === sku);
}

/**
 * Find material by ID
 */
export function getMaterialById(id) {
  return getMaterials().find(m => m.id === id);
}

/**
 * Add new material
 */
export function addMaterial(material) {
  const currentMaterials = getMaterials();
  const newMaterial = {
    ...material,
    id: material.id || `custom-${Date.now()}`
  };
  currentMaterials.push(newMaterial);
  saveMaterials(currentMaterials);
  return newMaterial;
}

/**
 * Update material price
 */
export function updateMaterialPrice(id, newPrice) {
  const currentMaterials = getMaterials();
  const index = currentMaterials.findIndex(m => m.id === id);
  if (index !== -1) {
    currentMaterials[index].unitCost = newPrice;
    currentMaterials[index].lastUpdated = new Date().toISOString();
    saveMaterials(currentMaterials);
    return currentMaterials[index];
  }
  return null;
}

/**
 * Reset to default materials
 */
export function resetToDefaults() {
  saveMaterials(materials);
  return materials;
}

// ============================================
// COMPATIBILITY LAYER
// Integrates with labourCatalogue.js for full catalogue
// ============================================

import {
  labourRates as importedLabourRates,
  assemblies as importedAssemblies,
  LABOUR_CATEGORIES,
  getLabourRates,
  getLabourRateById,
  calculateAssemblyCostFromRates,
  CONFIDENCE,
  CONFIDENCE_COLORS,
} from './labourCatalogue.js';

// Re-export labour data for convenience
export { LABOUR_CATEGORIES, CONFIDENCE, CONFIDENCE_COLORS };

/**
 * Format currency (CAD)
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(amount || 0);
}

/**
 * Convert labour rates array to object format expected by CostCatalogue.jsx LaborRatesTab
 *
 * Expected format:
 * {
 *   'FRAMING': {
 *     name: 'Framing',
 *     description: 'Framing work',
 *     hourlyRate: 55.00,
 *     pieceRates: [{ id: '...', task: '...', rate: 25, unit: 'each', notes: '...' }]
 *   }
 * }
 */
function convertLabourRatesToObject() {
  const laborRates = {};

  LABOUR_CATEGORIES.forEach(cat => {
    const categoryRates = importedLabourRates.filter(r => r.category === cat.id);
    if (categoryRates.length > 0) {
      // Use uppercase code as key (FRAMING, PLUMBING, etc.)
      const code = cat.id.toUpperCase();

      // Find an hourly rate if one exists, otherwise use a default
      const hourlyRateItem = categoryRates.find(r => r.unit === 'HR' || r.unit === 'hour');
      const defaultHourlyRate = hourlyRateItem ? hourlyRateItem.unitCost : 0;

      laborRates[code] = {
        name: cat.name,
        description: `${cat.name} trade rates from local sub-contractors`,
        hourlyRate: defaultHourlyRate,
        // Convert to pieceRates format with 'task' field
        pieceRates: categoryRates.map(r => ({
          id: r.id,
          task: r.name,  // UI expects 'task' not 'name'
          rate: r.unitCost,
          unit: r.unit.toLowerCase(),
          notes: r.description + (r.notes ? ` — ${r.notes}` : ''),
          // Additional metadata
          confidence: r.confidence,
          source: r.source,
          sourceDate: r.sourceDate,
        }))
      };
    }
  });

  return laborRates;
}

/**
 * Default labor rates - now populated from labourCatalogue
 */
export const DEFAULT_LABOR_RATES = convertLabourRatesToObject();

/**
 * Default assemblies - now populated from labourCatalogue
 */
export const DEFAULT_ASSEMBLIES = importedAssemblies;

// Storage key for custom assemblies
const CUSTOM_ASSEMBLIES_KEY = 'hooomz_custom_assemblies';

/**
 * Get custom assemblies from localStorage
 */
export function getCustomAssemblies() {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(CUSTOM_ASSEMBLIES_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing custom assemblies:', e);
      return [];
    }
  }
  return [];
}

/**
 * Save custom assembly
 */
export function saveCustomAssembly(assembly) {
  if (typeof window === 'undefined') return;

  const customAssemblies = getCustomAssemblies();
  const existingIndex = customAssemblies.findIndex(a => a.id === assembly.id);

  if (existingIndex >= 0) {
    // Update existing
    customAssemblies[existingIndex] = assembly;
  } else {
    // Add new
    customAssemblies.push(assembly);
  }

  localStorage.setItem(CUSTOM_ASSEMBLIES_KEY, JSON.stringify(customAssemblies));
  return assembly;
}

/**
 * Delete custom assembly
 */
export function deleteCustomAssembly(assemblyId) {
  if (typeof window === 'undefined') return;

  const customAssemblies = getCustomAssemblies();
  const filtered = customAssemblies.filter(a => a.id !== assemblyId);
  localStorage.setItem(CUSTOM_ASSEMBLIES_KEY, JSON.stringify(filtered));
}

/**
 * Get all assemblies (default + custom)
 */
export function getAllAssemblies() {
  return [...DEFAULT_ASSEMBLIES, ...getCustomAssemblies()];
}

/**
 * Load catalogue data - compatibility function
 * Returns structure expected by CostCatalogue.jsx and EstimateBuilder.jsx
 * Now includes custom labor rate overrides from localStorage
 */
export function loadCatalogueData() {
  return {
    laborRates: getMergedLaborRates(),
    materials: getMaterials(),
    assemblies: getAllAssemblies(),
  };
}

// Storage key for custom labor rates
const CUSTOM_LABOR_RATES_KEY = 'hooomz_custom_labor_rates';

/**
 * Get custom labor rate overrides from localStorage
 */
export function getCustomLaborRates() {
  if (typeof window === 'undefined') return {};

  const stored = localStorage.getItem(CUSTOM_LABOR_RATES_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing custom labor rates:', e);
      return {};
    }
  }
  return {};
}

/**
 * Save labor rates to localStorage
 * Merges custom overrides with defaults
 */
export function saveLaborRates(rates) {
  if (typeof window === 'undefined') return;

  // Extract only the rates that differ from defaults or are custom
  const customRates = {};

  Object.entries(rates).forEach(([tradeCode, tradeData]) => {
    const defaultTrade = DEFAULT_LABOR_RATES[tradeCode];

    // Check if hourly rate was customized
    if (!defaultTrade || tradeData.hourlyRate !== defaultTrade.hourlyRate) {
      if (!customRates[tradeCode]) {
        customRates[tradeCode] = { ...tradeData };
      } else {
        customRates[tradeCode].hourlyRate = tradeData.hourlyRate;
      }
    }

    // Check for custom piece rates
    if (tradeData.pieceRates) {
      const customPieceRates = tradeData.pieceRates.filter(rate => {
        // Check if this rate is custom (not in defaults)
        const defaultRates = defaultTrade?.pieceRates || [];
        const matchingDefault = defaultRates.find(d => d.id === rate.id);

        if (!matchingDefault) return true; // New custom rate
        if (rate.rate !== matchingDefault.rate) return true; // Modified rate
        return false;
      });

      if (customPieceRates.length > 0) {
        if (!customRates[tradeCode]) {
          customRates[tradeCode] = { pieceRates: customPieceRates };
        } else {
          customRates[tradeCode].pieceRates = customPieceRates;
        }
      }
    }
  });

  localStorage.setItem(CUSTOM_LABOR_RATES_KEY, JSON.stringify({
    rates: customRates,
    lastUpdated: new Date().toISOString()
  }));
}

/**
 * Get merged labor rates (defaults + custom overrides)
 */
export function getMergedLaborRates() {
  const customData = getCustomLaborRates();
  const customRates = customData.rates || {};

  // Start with defaults
  const merged = JSON.parse(JSON.stringify(DEFAULT_LABOR_RATES));

  // Apply custom overrides
  Object.entries(customRates).forEach(([tradeCode, customTrade]) => {
    if (!merged[tradeCode]) {
      merged[tradeCode] = customTrade;
    } else {
      // Override hourly rate if customized
      if (customTrade.hourlyRate !== undefined) {
        merged[tradeCode].hourlyRate = customTrade.hourlyRate;
      }

      // Merge piece rates
      if (customTrade.pieceRates) {
        customTrade.pieceRates.forEach(customRate => {
          const existingIndex = merged[tradeCode].pieceRates.findIndex(
            r => r.id === customRate.id
          );
          if (existingIndex >= 0) {
            merged[tradeCode].pieceRates[existingIndex] = {
              ...merged[tradeCode].pieceRates[existingIndex],
              ...customRate,
              isCustomized: true
            };
          } else {
            merged[tradeCode].pieceRates.push({
              ...customRate,
              isCustom: true
            });
          }
        });
      }
    }
  });

  return merged;
}

/**
 * Reset labor rates to defaults
 */
export function resetLaborRatesToDefaults() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CUSTOM_LABOR_RATES_KEY);
  }
  return DEFAULT_LABOR_RATES;
}

/**
 * Save assemblies - handles custom assemblies
 */
export function saveAssemblies(assembliesData) {
  // Only save custom assemblies to localStorage
  const customAssemblies = assembliesData.filter(a => a.isCustom);
  if (typeof window !== 'undefined') {
    localStorage.setItem(CUSTOM_ASSEMBLIES_KEY, JSON.stringify(customAssemblies));
  }
}

/**
 * Reset catalogue to defaults - compatibility wrapper
 */
export function resetCatalogueToDefaults() {
  resetToDefaults();
  return loadCatalogueData();
}

/**
 * Calculate assembly cost from component rates
 * Returns object format expected by CostCatalogue.jsx AssembliesTab:
 * { total, labor, materials }
 *
 * For our new assembly format with unitCost, we treat the entire cost as labor
 * (since these are labor-only quotes from sub-contractors)
 */
export function calculateAssemblyCost(assembly, materialsOrLaborRates, qualityTier) {
  // Handle new format assemblies with unitCost
  if (assembly && assembly.unitCost !== undefined) {
    // These are labor-only assemblies, materials supplied by owner
    return {
      total: assembly.unitCost,
      labor: assembly.unitCost,
      materials: 0
    };
  }

  // Handle old format with labor.hours and materials array
  if (assembly && assembly.labor) {
    const laborCost = (assembly.labor.hours || 0) * (assembly.labor.rate || 0);
    let materialsCost = 0;

    if (assembly.materials && Array.isArray(materialsOrLaborRates)) {
      for (const item of assembly.materials) {
        const mat = materialsOrLaborRates.find(m => m.id === item.materialId);
        if (mat) {
          materialsCost += mat.unitCost * (item.qty || 1);
        }
      }
    }

    return {
      total: laborCost + materialsCost,
      labor: laborCost,
      materials: materialsCost
    };
  }

  // Fallback for components-based structure
  if (assembly && assembly.components) {
    let total = 0;
    for (const component of assembly.components) {
      const rate = getLabourRateById(component.id);
      if (rate) {
        total += rate.unitCost * component.qty;
      }
    }
    return {
      total: total,
      labor: total,
      materials: 0
    };
  }

  return { total: 0, labor: 0, materials: 0 };
}

// Default export
export default {
  materials,
  MATERIAL_CATEGORIES,
  getMaterials,
  saveMaterials,
  getMaterialsByCategory,
  getMaterialBySku,
  getMaterialById,
  addMaterial,
  updateMaterialPrice,
  resetToDefaults,
  // Compatibility exports
  formatCurrency,
  loadCatalogueData,
  saveLaborRates,
  saveAssemblies,
  resetCatalogueToDefaults,
  calculateAssemblyCost,
  DEFAULT_LABOR_RATES,
  DEFAULT_ASSEMBLIES,
  // Labor rate functions
  getCustomLaborRates,
  getMergedLaborRates,
  resetLaborRatesToDefaults,
};
