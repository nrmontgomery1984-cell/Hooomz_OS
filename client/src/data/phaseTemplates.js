/**
 * Phase Builder Templates
 *
 * Intelligent construction sequencing for Hooomz OS.
 * Templates define the logical order of construction phases based on
 * structural dependencies, code requirements, and best practices.
 *
 * Uses existing SCOPE_CATEGORIES trade codes (EL, PL, DW, PT, FL, FC, etc.)
 */

// ============================================================================
// PHASE CATEGORY DEFINITIONS
// ============================================================================

export const PHASE_CATEGORIES = {
  foundation: { label: 'Foundation', color: '#6B7280' },
  structural: { label: 'Structural / Framing', color: '#3B82F6' },
  envelope: { label: 'Envelope', color: '#8B5CF6' },
  plumbing: { label: 'Plumbing', color: '#06B6D4' },
  hvac: { label: 'HVAC', color: '#F97316' },
  electrical: { label: 'Electrical', color: '#EAB308' },
  insulation: { label: 'Insulation', color: '#EC4899' },
  drywall: { label: 'Drywall', color: '#A3A3A3' },
  paint: { label: 'Paint', color: '#22C55E' },
  flooring: { label: 'Flooring', color: '#78716C' },
  trim: { label: 'Trim / Millwork', color: '#92400E' },
  cabinets: { label: 'Cabinets / Fixtures', color: '#14B8A6' },
  exterior: { label: 'Exterior', color: '#7C3AED' },
  punchout: { label: 'Punch-out / Final', color: '#EF4444' },
};

// ============================================================================
// DEPENDENCY TYPES
// ============================================================================

/**
 * Hard dependencies: structural/code - CANNOT be violated
 * - Load path: bearing elements must complete before what they carry
 * - Inspection holds: rough-ins complete before covering
 * - Life safety: fire blocking, egress requirements
 *
 * Soft dependencies: best practice - CAN override with reason
 * - Protection sequence: finish work top-down or protected
 * - Trade coordination: typical rough-in order
 * - Efficiency: logical flow for crew movement
 */

// ============================================================================
// NEW CONSTRUCTION - MULTI STOREY TEMPLATE
// ============================================================================

export const NEW_CONSTRUCTION_MULTI_STOREY = {
  id: 'new_construction_multi_storey',
  name: 'New Construction - Multi Storey',
  description: 'Full build sequence with floor-by-floor structural progression',
  projectTypes: ['new_construction'],
  isSystem: true,
  phases: [
    // FOUNDATION
    {
      id: 'foundation',
      name: 'Foundation',
      shortName: 'FND',
      category: 'foundation',
      order: 1,
      tradeCodes: ['FN'],
      description: 'Footings, walls, slab',
      dependencies: [],
      locationScope: { type: 'floors', floors: ['basement'] },
    },

    // STRUCTURAL - Floor by floor, bottom up
    {
      id: 'bearing_walls_basement',
      name: 'Bearing Walls - Basement',
      shortName: 'BW-B',
      category: 'structural',
      order: 2,
      tradeCodes: ['FS'],
      description: 'Load-bearing walls only',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'foundation', reason: 'Load path: foundation must support bearing walls' }
      ],
      locationScope: { type: 'floors', floors: ['basement'] },
    },
    {
      id: 'floor_framing_main',
      name: 'Floor Framing - Main',
      shortName: 'FF-M',
      category: 'structural',
      order: 3,
      tradeCodes: ['FS'],
      description: 'Joists, subfloor',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'bearing_walls_basement', reason: 'Load path: bearing walls below must support floor' }
      ],
      locationScope: { type: 'floors', floors: ['main'] },
    },
    {
      id: 'exterior_walls_main',
      name: 'Exterior Walls - Main',
      shortName: 'EW-M',
      category: 'structural',
      order: 4,
      tradeCodes: ['FS'],
      description: 'Lateral bracing first',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'floor_framing_main', reason: 'Floor deck required for wall plates' }
      ],
      locationScope: { type: 'floors', floors: ['main'] },
    },
    {
      id: 'bearing_walls_main',
      name: 'Bearing Walls - Main',
      shortName: 'BW-M',
      category: 'structural',
      order: 5,
      tradeCodes: ['FS'],
      description: 'Interior bearing walls',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'exterior_walls_main', reason: 'Exterior walls provide lateral stability' }
      ],
      locationScope: { type: 'floors', floors: ['main'] },
    },
    {
      id: 'floor_framing_upper',
      name: 'Floor Framing - Upper',
      shortName: 'FF-U',
      category: 'structural',
      order: 6,
      tradeCodes: ['FS'],
      description: 'Second floor deck',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'bearing_walls_main', reason: 'Load path: bearing walls below must support floor' }
      ],
      locationScope: { type: 'floors', floors: ['upper'] },
    },
    {
      id: 'exterior_walls_upper',
      name: 'Exterior Walls - Upper',
      shortName: 'EW-U',
      category: 'structural',
      order: 7,
      tradeCodes: ['FS'],
      description: 'Upper floor exterior walls',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'floor_framing_upper', reason: 'Floor deck required for wall plates' }
      ],
      locationScope: { type: 'floors', floors: ['upper'] },
    },
    {
      id: 'bearing_walls_upper',
      name: 'Bearing Walls - Upper',
      shortName: 'BW-U',
      category: 'structural',
      order: 8,
      tradeCodes: ['FS'],
      description: 'Upper floor bearing walls (if applicable)',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'exterior_walls_upper', reason: 'Exterior walls provide lateral stability' }
      ],
      locationScope: { type: 'floors', floors: ['upper'] },
    },
    {
      id: 'roof_structure',
      name: 'Roof Structure',
      shortName: 'ROOF',
      category: 'structural',
      order: 9,
      tradeCodes: ['FS', 'RF'],
      description: 'Trusses or rafters',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'exterior_walls_upper', reason: 'All exterior walls must support roof' }
      ],
      locationScope: { type: 'all' },
    },
    {
      id: 'strapping',
      name: 'Strapping',
      shortName: 'STRAP',
      category: 'structural',
      order: 10,
      tradeCodes: ['FS'],
      description: 'All floors',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'roof_structure', reason: 'Roof must be complete before interior work' }
      ],
      locationScope: { type: 'all' },
    },
    {
      id: 'partition_walls',
      name: 'Partition Walls',
      shortName: 'PART',
      category: 'structural',
      order: 11,
      tradeCodes: ['FS'],
      description: 'Non-bearing interior walls',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'strapping', reason: 'Strapping complete before partitions' }
      ],
      locationScope: { type: 'all' },
    },

    // ENVELOPE
    {
      id: 'sheathing',
      name: 'Sheathing',
      shortName: 'SHTH',
      category: 'envelope',
      order: 12,
      tradeCodes: ['FS'],
      description: 'Wall and roof sheathing',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'roof_structure', reason: 'Structure must be complete' }
      ],
      locationScope: { type: 'all' },
    },
    {
      id: 'wrb',
      name: 'Weather Resistive Barrier',
      shortName: 'WRB',
      category: 'envelope',
      order: 13,
      tradeCodes: ['EX'],
      description: 'House wrap / WRB',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'sheathing', reason: 'WRB applied to sheathing' }
      ],
      locationScope: { type: 'all' },
    },
    {
      id: 'window_door_bucks',
      name: 'Window/Door Bucks',
      shortName: 'BUCK',
      category: 'envelope',
      order: 14,
      tradeCodes: ['FS', 'FC'],
      description: 'Rough openings prepared',
      dependencies: [
        { type: 'soft', requiresPhaseId: 'wrb', reason: 'WRB typically before bucks for proper lapping', canOverride: true }
      ],
      locationScope: { type: 'all' },
    },
    {
      id: 'windows_doors',
      name: 'Windows & Doors',
      shortName: 'W&D',
      category: 'envelope',
      order: 15,
      tradeCodes: ['FC'],
      description: 'Window and door units installed',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'window_door_bucks', reason: 'Bucks must be installed first' }
      ],
      locationScope: { type: 'all' },
    },
    {
      id: 'roofing',
      name: 'Roofing',
      shortName: 'ROOF-F',
      category: 'envelope',
      order: 16,
      tradeCodes: ['RF'],
      description: 'Roofing material installed (before siding - water sheds down)',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'sheathing', reason: 'Roof sheathing required' },
        { type: 'soft', requiresPhaseId: 'windows_doors', reason: 'Building dried in before roofing crew', canOverride: true }
      ],
      locationScope: { type: 'all' },
    },
    {
      id: 'soffit_fascia',
      name: 'Soffit & Fascia',
      shortName: 'S&F',
      category: 'envelope',
      order: 17,
      tradeCodes: ['EX'],
      description: 'Soffit and fascia installed',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'roofing', reason: 'Roofing must be complete' }
      ],
      locationScope: { type: 'all' },
    },
    {
      id: 'siding',
      name: 'Siding / Cladding',
      shortName: 'SIDE',
      category: 'envelope',
      order: 18,
      tradeCodes: ['EX'],
      description: 'Exterior cladding installed',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'wrb', reason: 'WRB must be installed' },
        { type: 'soft', requiresPhaseId: 'roofing', reason: 'Water sheds from roof over siding', canOverride: true }
      ],
      locationScope: { type: 'all' },
    },

    // MECHANICAL ROUGH-IN
    {
      id: 'plumbing_rough',
      name: 'Plumbing Rough-In',
      shortName: 'PL-R',
      category: 'plumbing',
      order: 19,
      tradeCodes: ['PL'],
      description: 'Stacks/drains first - least flexible routing',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'partition_walls', reason: 'Walls must be framed for pipe routing' }
      ],
      locationScope: { type: 'all' },
    },
    {
      id: 'hvac_rough',
      name: 'HVAC Rough-In',
      shortName: 'HV-R',
      category: 'hvac',
      order: 20,
      tradeCodes: ['HV'],
      description: 'Trunks need clearance',
      dependencies: [
        { type: 'soft', requiresPhaseId: 'plumbing_rough', reason: 'Plumbing routes first (less flexible)', canOverride: true }
      ],
      locationScope: { type: 'all' },
    },
    {
      id: 'electrical_rough',
      name: 'Electrical Rough-In',
      shortName: 'EL-R',
      category: 'electrical',
      order: 21,
      tradeCodes: ['EL'],
      description: 'Most flexible - runs last',
      dependencies: [
        { type: 'soft', requiresPhaseId: 'hvac_rough', reason: 'Electrical most flexible, runs after HVAC', canOverride: true }
      ],
      locationScope: { type: 'all' },
    },
    {
      id: 'low_voltage',
      name: 'Low Voltage / Data',
      shortName: 'LV',
      category: 'electrical',
      order: 22,
      tradeCodes: ['EL'],
      description: 'Data, security, AV wiring',
      dependencies: [
        { type: 'soft', requiresPhaseId: 'electrical_rough', reason: 'After main electrical rough', canOverride: true }
      ],
      locationScope: { type: 'all' },
    },

    // INSPECTION HOLD
    {
      id: 'rough_in_inspection',
      name: 'Rough-In Inspection',
      shortName: 'INSP-R',
      category: 'punchout',
      order: 23,
      tradeCodes: [],
      description: 'All rough-ins inspected before covering',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'plumbing_rough', reason: 'Plumbing must be inspected' },
        { type: 'hard', requiresPhaseId: 'hvac_rough', reason: 'HVAC must be inspected' },
        { type: 'hard', requiresPhaseId: 'electrical_rough', reason: 'Electrical must be inspected' }
      ],
      locationScope: { type: 'all' },
    },

    // INSULATION
    {
      id: 'insulation',
      name: 'Insulation',
      shortName: 'INS',
      category: 'insulation',
      order: 24,
      tradeCodes: ['IN'],
      description: 'After rough-in inspection',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'rough_in_inspection', reason: 'Must pass rough-in inspection before covering' }
      ],
      locationScope: { type: 'all' },
    },
    {
      id: 'vapor_barrier',
      name: 'Vapor Barrier',
      shortName: 'VB',
      category: 'insulation',
      order: 25,
      tradeCodes: ['IN'],
      description: 'Vapor barrier over insulation',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'insulation', reason: 'Insulation first, then vapor barrier' }
      ],
      locationScope: { type: 'all' },
    },

    // DRYWALL
    {
      id: 'drywall_board_ceilings',
      name: 'Drywall - Ceilings',
      shortName: 'DW-C',
      category: 'drywall',
      order: 26,
      tradeCodes: ['DW'],
      description: 'Board ceilings all floors',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'vapor_barrier', reason: 'Vapor barrier must be complete' }
      ],
      locationScope: { type: 'all' },
    },
    {
      id: 'drywall_board_walls',
      name: 'Drywall - Walls',
      shortName: 'DW-W',
      category: 'drywall',
      order: 27,
      tradeCodes: ['DW'],
      description: 'Board walls (upper floors first - scaffold efficiency)',
      dependencies: [
        { type: 'soft', requiresPhaseId: 'drywall_board_ceilings', reason: 'Ceilings before walls (efficiency)', canOverride: true }
      ],
      locationScope: { type: 'all' },
    },
    {
      id: 'drywall_tape_first',
      name: 'Drywall - Tape & First Coat',
      shortName: 'DW-T1',
      category: 'drywall',
      order: 28,
      tradeCodes: ['DW'],
      description: 'Tape and first coat',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'drywall_board_walls', reason: 'All boarding complete' }
      ],
      locationScope: { type: 'all' },
    },
    {
      id: 'drywall_second_coat',
      name: 'Drywall - Second Coat',
      shortName: 'DW-T2',
      category: 'drywall',
      order: 29,
      tradeCodes: ['DW'],
      description: 'Second coat',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'drywall_tape_first', reason: 'First coat must dry' }
      ],
      locationScope: { type: 'all' },
    },
    {
      id: 'drywall_sand',
      name: 'Drywall - Sand',
      shortName: 'DW-S',
      category: 'drywall',
      order: 30,
      tradeCodes: ['DW'],
      description: 'Sand (per area progression)',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'drywall_second_coat', reason: 'Second coat must dry' }
      ],
      locationScope: { type: 'all' },
    },

    // PAINT PHASE 1 (before flooring)
    {
      id: 'paint_prime_ceilings',
      name: 'Paint - Prime & Paint Ceilings',
      shortName: 'PT-C',
      category: 'paint',
      order: 31,
      groupId: 'paint_phase_1',
      tradeCodes: ['PT'],
      description: 'Prime and paint ceilings',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'drywall_sand', reason: 'Drywall must be sanded' }
      ],
      locationScope: { type: 'all' },
    },
    {
      id: 'vertical_trim_install',
      name: 'Install Vertical Trim',
      shortName: 'VT',
      category: 'trim',
      order: 32,
      groupId: 'paint_phase_1',
      tradeCodes: ['FC'],
      description: 'Door/window casing',
      dependencies: [
        { type: 'soft', requiresPhaseId: 'paint_prime_ceilings', reason: 'Ceilings done before trim install', canOverride: true }
      ],
      locationScope: { type: 'all' },
    },
    {
      id: 'trim_caulk_prep',
      name: 'Caulk & Prep Casings',
      shortName: 'T-CK',
      category: 'trim',
      order: 33,
      groupId: 'paint_phase_1',
      tradeCodes: ['FC', 'PT'],
      description: 'Caulk and prep casings',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'vertical_trim_install', reason: 'Trim must be installed to caulk' }
      ],
      locationScope: { type: 'all' },
    },
    {
      id: 'paint_doors_casings',
      name: 'Paint - Spray Doors & Casings',
      shortName: 'PT-DC',
      category: 'paint',
      order: 34,
      groupId: 'paint_phase_1',
      tradeCodes: ['PT'],
      description: 'Spray doors and casings',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'trim_caulk_prep', reason: 'Caulk must be done before spraying' }
      ],
      locationScope: { type: 'all' },
    },
    {
      id: 'paint_walls',
      name: 'Paint - Walls Complete',
      shortName: 'PT-W',
      category: 'paint',
      order: 35,
      groupId: 'paint_phase_1',
      tradeCodes: ['PT'],
      description: 'Finish paint walls - complete',
      dependencies: [
        { type: 'soft', requiresPhaseId: 'paint_doors_casings', reason: 'Doors/casings before walls (spray sequence)', canOverride: true }
      ],
      locationScope: { type: 'all' },
    },

    // FLOORING
    {
      id: 'flooring_install',
      name: 'Flooring Install',
      shortName: 'FL',
      category: 'flooring',
      order: 36,
      tradeCodes: ['FL'],
      description: 'Install flooring (full wall access, proper expansion gaps)',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'paint_walls', reason: 'Paint Phase 1 complete before flooring' }
      ],
      locationScope: { type: 'all' },
    },

    // TRIM PHASE 2 (after flooring)
    {
      id: 'baseboard_install',
      name: 'Baseboard Install',
      shortName: 'BB',
      category: 'trim',
      order: 37,
      tradeCodes: ['FC'],
      description: 'Baseboard sits on floor, covers expansion gap',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'flooring_install', reason: 'Flooring must be installed first' }
      ],
      locationScope: { type: 'all' },
    },

    // PAINT PHASE 2 (punch-out)
    {
      id: 'paint_baseboard_fill',
      name: 'Paint - Fill Baseboard Holes',
      shortName: 'PT-BF',
      category: 'paint',
      order: 38,
      groupId: 'paint_phase_2',
      tradeCodes: ['PT'],
      description: 'Fill baseboard nail holes',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'baseboard_install', reason: 'Baseboard must be nailed first' }
      ],
      locationScope: { type: 'all' },
    },
    {
      id: 'paint_baseboard_caulk',
      name: 'Paint - Caulk Baseboard',
      shortName: 'PT-BC',
      category: 'paint',
      order: 39,
      groupId: 'paint_phase_2',
      tradeCodes: ['PT'],
      description: 'Caulk baseboard to wall',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'paint_baseboard_fill', reason: 'Fill before caulk' }
      ],
      locationScope: { type: 'all' },
    },
    {
      id: 'paint_baseboard_final',
      name: 'Paint - Baseboard Final Coat',
      shortName: 'PT-BB',
      category: 'paint',
      order: 40,
      groupId: 'paint_phase_2',
      tradeCodes: ['PT'],
      description: 'Final coat on baseboard',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'paint_baseboard_caulk', reason: 'Caulk before final coat' }
      ],
      locationScope: { type: 'all' },
    },
    {
      id: 'paint_touchups',
      name: 'Paint - Touch-ups',
      shortName: 'PT-TU',
      category: 'paint',
      order: 41,
      groupId: 'paint_phase_2',
      tradeCodes: ['PT'],
      description: 'Wall and ceiling touch-ups after flooring/trim crews',
      dependencies: [
        { type: 'soft', requiresPhaseId: 'paint_baseboard_final', reason: 'After all painting complete', canOverride: true }
      ],
      locationScope: { type: 'all' },
    },

    // CABINETS & FIXTURES
    {
      id: 'cabinet_install',
      name: 'Cabinet Installation',
      shortName: 'CAB',
      category: 'cabinets',
      order: 42,
      tradeCodes: ['CM'],
      description: 'Kitchen and bath cabinets',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'flooring_install', reason: 'Flooring under cabinets for appliance install' }
      ],
      locationScope: { type: 'rooms', roomTypes: ['kitchen', 'bathroom', 'laundry'] },
    },
    {
      id: 'countertop_template',
      name: 'Countertop Template',
      shortName: 'CT-T',
      category: 'cabinets',
      order: 43,
      tradeCodes: ['CM'],
      description: 'Countertop templating',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'cabinet_install', reason: 'Cabinets must be installed for templating' }
      ],
      locationScope: { type: 'rooms', roomTypes: ['kitchen', 'bathroom', 'laundry'] },
    },
    {
      id: 'countertop_install',
      name: 'Countertop Install',
      shortName: 'CT-I',
      category: 'cabinets',
      order: 44,
      tradeCodes: ['CM'],
      description: 'Countertop installation',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'countertop_template', reason: 'Template before fabrication and install' }
      ],
      locationScope: { type: 'rooms', roomTypes: ['kitchen', 'bathroom', 'laundry'] },
    },
    {
      id: 'backsplash',
      name: 'Backsplash Tile',
      shortName: 'TILE-B',
      category: 'cabinets',
      order: 45,
      tradeCodes: ['TL'],
      description: 'Kitchen backsplash',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'countertop_install', reason: 'Countertop must be in for backsplash to meet it' }
      ],
      locationScope: { type: 'rooms', roomTypes: ['kitchen'] },
    },

    // PLUMBING TRIM
    {
      id: 'plumbing_trim',
      name: 'Plumbing Trim',
      shortName: 'PL-T',
      category: 'plumbing',
      order: 46,
      tradeCodes: ['PL'],
      description: 'Fixtures: sinks, toilets, faucets',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'countertop_install', reason: 'Countertops for sink installs' },
        { type: 'soft', requiresPhaseId: 'paint_touchups', reason: 'Paint complete before fixtures', canOverride: true }
      ],
      locationScope: { type: 'all' },
    },

    // ELECTRICAL TRIM
    {
      id: 'electrical_trim',
      name: 'Electrical Trim',
      shortName: 'EL-T',
      category: 'electrical',
      order: 47,
      tradeCodes: ['EL'],
      description: 'Devices, fixtures, panels',
      dependencies: [
        { type: 'soft', requiresPhaseId: 'paint_touchups', reason: 'Paint complete before devices', canOverride: true }
      ],
      locationScope: { type: 'all' },
    },

    // HVAC TRIM
    {
      id: 'hvac_trim',
      name: 'HVAC Trim',
      shortName: 'HV-T',
      category: 'hvac',
      order: 48,
      tradeCodes: ['HV'],
      description: 'Grilles, thermostats, commissioning',
      dependencies: [
        { type: 'soft', requiresPhaseId: 'paint_touchups', reason: 'Paint complete before grilles', canOverride: true }
      ],
      locationScope: { type: 'all' },
    },

    // APPLIANCES
    {
      id: 'appliance_install',
      name: 'Appliance Installation',
      shortName: 'APPL',
      category: 'cabinets',
      order: 49,
      tradeCodes: ['CM', 'PL', 'EL'],
      description: 'Kitchen and laundry appliances',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'plumbing_trim', reason: 'Water connections for appliances' },
        { type: 'hard', requiresPhaseId: 'electrical_trim', reason: 'Power for appliances' }
      ],
      locationScope: { type: 'rooms', roomTypes: ['kitchen', 'laundry'] },
    },

    // FINAL
    {
      id: 'final_inspection',
      name: 'Final Inspection',
      shortName: 'INSP-F',
      category: 'punchout',
      order: 50,
      tradeCodes: [],
      description: 'Final building inspection',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'plumbing_trim', reason: 'All plumbing complete' },
        { type: 'hard', requiresPhaseId: 'electrical_trim', reason: 'All electrical complete' },
        { type: 'hard', requiresPhaseId: 'hvac_trim', reason: 'All HVAC complete' }
      ],
      locationScope: { type: 'all' },
    },
    {
      id: 'punch_list',
      name: 'Punch List',
      shortName: 'PUNCH',
      category: 'punchout',
      order: 51,
      tradeCodes: [],
      description: 'Final walkthrough items',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'final_inspection', reason: 'Must pass final inspection' }
      ],
      locationScope: { type: 'all' },
    },
    {
      id: 'client_walkthrough',
      name: 'Client Walkthrough',
      shortName: 'WALK',
      category: 'punchout',
      order: 52,
      tradeCodes: [],
      description: 'Client walkthrough and handover',
      dependencies: [
        { type: 'soft', requiresPhaseId: 'punch_list', reason: 'Punch items addressed before walkthrough', canOverride: true }
      ],
      locationScope: { type: 'all' },
    },
  ],
  scopeRules: [
    // If single storey, remove upper floor phases
    {
      condition: { type: 'building_has', value: 'single_storey' },
      action: { type: 'remove_phase', phaseIds: ['floor_framing_upper', 'exterior_walls_upper', 'bearing_walls_upper'] }
    },
    // If no basement, remove basement phases
    {
      condition: { type: 'scope_excludes', value: 'basement' },
      action: { type: 'remove_phase', phaseIds: ['bearing_walls_basement'] }
    },
  ],
};

// ============================================================================
// KITCHEN RENOVATION TEMPLATE
// ============================================================================

export const KITCHEN_RENOVATION = {
  id: 'kitchen_renovation',
  name: 'Kitchen Renovation',
  description: 'Full kitchen renovation sequence',
  projectTypes: ['renovation'],
  isSystem: true,
  phases: [
    {
      id: 'demo',
      name: 'Demo',
      shortName: 'DEMO',
      category: 'structural',
      order: 1,
      tradeCodes: ['DM'],
      description: 'Remove existing cabinets, counters, flooring',
      dependencies: [],
      locationScope: { type: 'rooms', roomTypes: ['kitchen'] },
    },
    {
      id: 'structural_mods',
      name: 'Structural Modifications',
      shortName: 'STRUCT',
      category: 'structural',
      order: 2,
      tradeCodes: ['FS'],
      description: 'Wall removals, headers, beam work (if any)',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'demo', reason: 'Demo complete before structural' }
      ],
      locationScope: { type: 'rooms', roomTypes: ['kitchen'] },
    },
    {
      id: 'plumbing_rough',
      name: 'Plumbing Rough',
      shortName: 'PL-R',
      category: 'plumbing',
      order: 3,
      tradeCodes: ['PL'],
      description: 'Relocations, new lines',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'structural_mods', reason: 'Structure stable before plumbing' }
      ],
      locationScope: { type: 'rooms', roomTypes: ['kitchen'] },
    },
    {
      id: 'electrical_rough',
      name: 'Electrical Rough',
      shortName: 'EL-R',
      category: 'electrical',
      order: 4,
      tradeCodes: ['EL'],
      description: 'New circuits, panel work',
      dependencies: [
        { type: 'soft', requiresPhaseId: 'plumbing_rough', reason: 'Plumbing routes first', canOverride: true }
      ],
      locationScope: { type: 'rooms', roomTypes: ['kitchen'] },
    },
    {
      id: 'hvac_mods',
      name: 'HVAC Modifications',
      shortName: 'HV-M',
      category: 'hvac',
      order: 5,
      tradeCodes: ['HV'],
      description: 'Duct relocations, range hood duct',
      dependencies: [
        { type: 'soft', requiresPhaseId: 'electrical_rough', reason: 'Coordinate with electrical', canOverride: true }
      ],
      locationScope: { type: 'rooms', roomTypes: ['kitchen'] },
    },
    {
      id: 'inspection',
      name: 'Rough-In Inspection',
      shortName: 'INSP',
      category: 'punchout',
      order: 6,
      tradeCodes: [],
      description: 'Inspect all rough-ins',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'plumbing_rough', reason: 'Plumbing inspected' },
        { type: 'hard', requiresPhaseId: 'electrical_rough', reason: 'Electrical inspected' }
      ],
      locationScope: { type: 'rooms', roomTypes: ['kitchen'] },
    },
    {
      id: 'insulation',
      name: 'Insulation',
      shortName: 'INS',
      category: 'insulation',
      order: 7,
      tradeCodes: ['IN'],
      description: 'If exterior wall opened',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'inspection', reason: 'After inspection pass' }
      ],
      locationScope: { type: 'rooms', roomTypes: ['kitchen'] },
    },
    {
      id: 'drywall',
      name: 'Drywall Patch/Repair',
      shortName: 'DW',
      category: 'drywall',
      order: 8,
      tradeCodes: ['DW'],
      description: 'Patch and finish drywall',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'insulation', reason: 'Insulation before drywall' }
      ],
      locationScope: { type: 'rooms', roomTypes: ['kitchen'] },
    },
    {
      id: 'prime_paint',
      name: 'Prime & Paint',
      shortName: 'PT',
      category: 'paint',
      order: 9,
      tradeCodes: ['PT'],
      description: 'Walls and ceiling',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'drywall', reason: 'Drywall complete' }
      ],
      locationScope: { type: 'rooms', roomTypes: ['kitchen'] },
    },
    {
      id: 'cabinet_install',
      name: 'Cabinet Installation',
      shortName: 'CAB',
      category: 'cabinets',
      order: 10,
      tradeCodes: ['CM'],
      description: 'Upper and lower cabinets',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'prime_paint', reason: 'Walls painted before cabinets' }
      ],
      locationScope: { type: 'rooms', roomTypes: ['kitchen'] },
    },
    {
      id: 'countertop_template',
      name: 'Countertop Template',
      shortName: 'CT-T',
      category: 'cabinets',
      order: 11,
      tradeCodes: ['CM'],
      description: 'Template for fabrication',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'cabinet_install', reason: 'Cabinets installed for template' }
      ],
      locationScope: { type: 'rooms', roomTypes: ['kitchen'] },
    },
    {
      id: 'countertop_install',
      name: 'Countertop Install',
      shortName: 'CT-I',
      category: 'cabinets',
      order: 12,
      tradeCodes: ['CM'],
      description: 'Install countertops',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'countertop_template', reason: 'Template before install' }
      ],
      locationScope: { type: 'rooms', roomTypes: ['kitchen'] },
    },
    {
      id: 'backsplash',
      name: 'Backsplash Tile',
      shortName: 'TILE',
      category: 'cabinets',
      order: 13,
      tradeCodes: ['TL'],
      description: 'Tile backsplash',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'countertop_install', reason: 'Counters before backsplash' }
      ],
      locationScope: { type: 'rooms', roomTypes: ['kitchen'] },
    },
    {
      id: 'plumbing_trim',
      name: 'Plumbing Fixtures',
      shortName: 'PL-T',
      category: 'plumbing',
      order: 14,
      tradeCodes: ['PL'],
      description: 'Sink, disposal, dishwasher connections',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'countertop_install', reason: 'Counters for sink install' }
      ],
      locationScope: { type: 'rooms', roomTypes: ['kitchen'] },
    },
    {
      id: 'electrical_trim',
      name: 'Electrical Fixtures',
      shortName: 'EL-T',
      category: 'electrical',
      order: 15,
      tradeCodes: ['EL'],
      description: 'Under-cabinet lights, outlets, switches',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'cabinet_install', reason: 'Cabinets installed for under-cabinet' },
        { type: 'soft', requiresPhaseId: 'backsplash', reason: 'Backsplash before outlet covers', canOverride: true }
      ],
      locationScope: { type: 'rooms', roomTypes: ['kitchen'] },
    },
    {
      id: 'appliances',
      name: 'Appliance Install',
      shortName: 'APPL',
      category: 'cabinets',
      order: 16,
      tradeCodes: ['CM', 'PL', 'EL'],
      description: 'All appliances',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'plumbing_trim', reason: 'Water/drain for appliances' },
        { type: 'hard', requiresPhaseId: 'electrical_trim', reason: 'Power for appliances' }
      ],
      locationScope: { type: 'rooms', roomTypes: ['kitchen'] },
    },
    {
      id: 'touchup_punch',
      name: 'Touch-up & Punch',
      shortName: 'PUNCH',
      category: 'punchout',
      order: 17,
      tradeCodes: ['PT'],
      description: 'Final touch-ups and punch list',
      dependencies: [
        { type: 'soft', requiresPhaseId: 'appliances', reason: 'All work complete', canOverride: true }
      ],
      locationScope: { type: 'rooms', roomTypes: ['kitchen'] },
    },
  ],
  scopeRules: [],
};

// ============================================================================
// BATHROOM RENOVATION TEMPLATE
// ============================================================================

export const BATHROOM_RENOVATION = {
  id: 'bathroom_renovation',
  name: 'Bathroom Renovation',
  description: 'Full bathroom renovation sequence',
  projectTypes: ['renovation'],
  isSystem: true,
  phases: [
    {
      id: 'demo',
      name: 'Demo',
      shortName: 'DEMO',
      category: 'structural',
      order: 1,
      tradeCodes: ['DM'],
      description: 'Remove existing fixtures, tile, vanity',
      dependencies: [],
      locationScope: { type: 'rooms', roomTypes: ['bathroom'] },
    },
    {
      id: 'structural',
      name: 'Structural (if any)',
      shortName: 'STRUCT',
      category: 'structural',
      order: 2,
      tradeCodes: ['FS'],
      description: 'Floor repairs, wall modifications',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'demo', reason: 'Demo complete first' }
      ],
      locationScope: { type: 'rooms', roomTypes: ['bathroom'] },
    },
    {
      id: 'plumbing_rough',
      name: 'Plumbing Rough',
      shortName: 'PL-R',
      category: 'plumbing',
      order: 3,
      tradeCodes: ['PL'],
      description: 'Shower valve, drain relocations',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'structural', reason: 'Structure stable' }
      ],
      locationScope: { type: 'rooms', roomTypes: ['bathroom'] },
    },
    {
      id: 'electrical_rough',
      name: 'Electrical Rough',
      shortName: 'EL-R',
      category: 'electrical',
      order: 4,
      tradeCodes: ['EL'],
      description: 'Circuits, fan, heated floor',
      dependencies: [
        { type: 'soft', requiresPhaseId: 'plumbing_rough', reason: 'Coordinate routing', canOverride: true }
      ],
      locationScope: { type: 'rooms', roomTypes: ['bathroom'] },
    },
    {
      id: 'hvac',
      name: 'HVAC - Exhaust Fan',
      shortName: 'HV',
      category: 'hvac',
      order: 5,
      tradeCodes: ['HV'],
      description: 'Exhaust fan ducting',
      dependencies: [
        { type: 'soft', requiresPhaseId: 'electrical_rough', reason: 'Fan wiring coordinated', canOverride: true }
      ],
      locationScope: { type: 'rooms', roomTypes: ['bathroom'] },
    },
    {
      id: 'inspection',
      name: 'Rough-In Inspection',
      shortName: 'INSP',
      category: 'punchout',
      order: 6,
      tradeCodes: [],
      description: 'Inspect rough-ins',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'plumbing_rough', reason: 'Plumbing inspected' },
        { type: 'hard', requiresPhaseId: 'electrical_rough', reason: 'Electrical inspected' }
      ],
      locationScope: { type: 'rooms', roomTypes: ['bathroom'] },
    },
    {
      id: 'insulation',
      name: 'Insulation',
      shortName: 'INS',
      category: 'insulation',
      order: 7,
      tradeCodes: ['IN'],
      description: 'Exterior walls',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'inspection', reason: 'After inspection' }
      ],
      locationScope: { type: 'rooms', roomTypes: ['bathroom'] },
    },
    {
      id: 'vapor_barrier',
      name: 'Vapor Barrier',
      shortName: 'VB',
      category: 'insulation',
      order: 8,
      tradeCodes: ['IN'],
      description: 'If required by code',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'insulation', reason: 'Insulation first' }
      ],
      locationScope: { type: 'rooms', roomTypes: ['bathroom'] },
    },
    {
      id: 'drywall',
      name: 'Drywall / Cement Board',
      shortName: 'DW',
      category: 'drywall',
      order: 9,
      tradeCodes: ['DW'],
      description: 'Cement board in wet areas',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'vapor_barrier', reason: 'VB before boarding' }
      ],
      locationScope: { type: 'rooms', roomTypes: ['bathroom'] },
    },
    {
      id: 'waterproofing',
      name: 'Waterproofing',
      shortName: 'WP',
      category: 'plumbing',
      order: 10,
      tradeCodes: ['TL', 'PL'],
      description: 'Shower/tub areas',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'drywall', reason: 'Board before waterproofing' }
      ],
      locationScope: { type: 'rooms', roomTypes: ['bathroom'] },
    },
    {
      id: 'tile',
      name: 'Tile Installation',
      shortName: 'TILE',
      category: 'flooring',
      order: 11,
      tradeCodes: ['TL'],
      description: 'Floor and wall tile',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'waterproofing', reason: 'Waterproofing complete' }
      ],
      locationScope: { type: 'rooms', roomTypes: ['bathroom'] },
    },
    {
      id: 'grout',
      name: 'Grout & Seal',
      shortName: 'GROUT',
      category: 'flooring',
      order: 12,
      tradeCodes: ['TL'],
      description: 'Grout and seal tile',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'tile', reason: 'Tile set before grout' }
      ],
      locationScope: { type: 'rooms', roomTypes: ['bathroom'] },
    },
    {
      id: 'vanity',
      name: 'Vanity/Cabinet Install',
      shortName: 'VAN',
      category: 'cabinets',
      order: 13,
      tradeCodes: ['CM'],
      description: 'Vanity cabinet',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'grout', reason: 'Floor tile complete' }
      ],
      locationScope: { type: 'rooms', roomTypes: ['bathroom'] },
    },
    {
      id: 'countertop',
      name: 'Countertop',
      shortName: 'CT',
      category: 'cabinets',
      order: 14,
      tradeCodes: ['CM'],
      description: 'Vanity top',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'vanity', reason: 'Vanity installed' }
      ],
      locationScope: { type: 'rooms', roomTypes: ['bathroom'] },
    },
    {
      id: 'paint',
      name: 'Paint',
      shortName: 'PT',
      category: 'paint',
      order: 15,
      tradeCodes: ['PT'],
      description: 'Non-tiled surfaces',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'drywall', reason: 'Drywall complete' },
        { type: 'soft', requiresPhaseId: 'grout', reason: 'Tile done before painting adjacent areas', canOverride: true }
      ],
      locationScope: { type: 'rooms', roomTypes: ['bathroom'] },
    },
    {
      id: 'plumbing_trim',
      name: 'Plumbing Trim',
      shortName: 'PL-T',
      category: 'plumbing',
      order: 16,
      tradeCodes: ['PL'],
      description: 'Faucets, toilet, shower trim',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'countertop', reason: 'Counter for faucet' },
        { type: 'hard', requiresPhaseId: 'grout', reason: 'Tile complete for shower trim' }
      ],
      locationScope: { type: 'rooms', roomTypes: ['bathroom'] },
    },
    {
      id: 'electrical_trim',
      name: 'Electrical Trim',
      shortName: 'EL-T',
      category: 'electrical',
      order: 17,
      tradeCodes: ['EL'],
      description: 'Lights, fan, GFCI outlets',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'paint', reason: 'Paint before devices' }
      ],
      locationScope: { type: 'rooms', roomTypes: ['bathroom'] },
    },
    {
      id: 'mirror_accessories',
      name: 'Mirror & Accessories',
      shortName: 'ACC',
      category: 'cabinets',
      order: 18,
      tradeCodes: ['FC'],
      description: 'Mirror, towel bars, TP holder',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'paint', reason: 'Paint complete' }
      ],
      locationScope: { type: 'rooms', roomTypes: ['bathroom'] },
    },
    {
      id: 'caulk_punch',
      name: 'Caulk & Punch',
      shortName: 'PUNCH',
      category: 'punchout',
      order: 19,
      tradeCodes: [],
      description: 'Final caulking and punch list',
      dependencies: [
        { type: 'soft', requiresPhaseId: 'plumbing_trim', reason: 'All fixtures installed', canOverride: true },
        { type: 'soft', requiresPhaseId: 'electrical_trim', reason: 'All devices installed', canOverride: true }
      ],
      locationScope: { type: 'rooms', roomTypes: ['bathroom'] },
    },
  ],
  scopeRules: [],
};

// ============================================================================
// BASEMENT FINISH TEMPLATE
// ============================================================================

export const BASEMENT_FINISH = {
  id: 'basement_finish',
  name: 'Basement Finish',
  description: 'Basement finishing with moisture considerations',
  projectTypes: ['renovation', 'basement_finish'],
  isSystem: true,
  phases: [
    {
      id: 'moisture_mitigation',
      name: 'Moisture Mitigation',
      shortName: 'MOIST',
      category: 'foundation',
      order: 1,
      tradeCodes: ['FN', 'PL'],
      description: 'Drainage, sealing, vapor management',
      dependencies: [],
      locationScope: { type: 'floors', floors: ['basement'] },
    },
    {
      id: 'framing',
      name: 'Framing',
      shortName: 'FRAME',
      category: 'structural',
      order: 2,
      tradeCodes: ['FS'],
      description: '2x4 walls off concrete, or metal studs',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'moisture_mitigation', reason: 'Moisture addressed before framing' }
      ],
      locationScope: { type: 'floors', floors: ['basement'] },
    },
    {
      id: 'plumbing_rough',
      name: 'Plumbing Rough',
      shortName: 'PL-R',
      category: 'plumbing',
      order: 3,
      tradeCodes: ['PL'],
      description: 'Bathroom if applicable',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'framing', reason: 'Walls framed for routing' }
      ],
      locationScope: { type: 'floors', floors: ['basement'] },
    },
    {
      id: 'electrical_rough',
      name: 'Electrical Rough',
      shortName: 'EL-R',
      category: 'electrical',
      order: 4,
      tradeCodes: ['EL'],
      description: 'Circuits, subpanel',
      dependencies: [
        { type: 'soft', requiresPhaseId: 'plumbing_rough', reason: 'Plumbing routes first', canOverride: true }
      ],
      locationScope: { type: 'floors', floors: ['basement'] },
    },
    {
      id: 'hvac_rough',
      name: 'HVAC Rough',
      shortName: 'HV-R',
      category: 'hvac',
      order: 5,
      tradeCodes: ['HV'],
      description: 'Ductwork extensions',
      dependencies: [
        { type: 'soft', requiresPhaseId: 'electrical_rough', reason: 'Coordinate routing', canOverride: true }
      ],
      locationScope: { type: 'floors', floors: ['basement'] },
    },
    {
      id: 'inspection',
      name: 'Rough-In Inspection',
      shortName: 'INSP',
      category: 'punchout',
      order: 6,
      tradeCodes: [],
      description: 'Inspect all rough-ins',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'plumbing_rough', reason: 'Plumbing inspected' },
        { type: 'hard', requiresPhaseId: 'electrical_rough', reason: 'Electrical inspected' }
      ],
      locationScope: { type: 'floors', floors: ['basement'] },
    },
    {
      id: 'insulation',
      name: 'Insulation',
      shortName: 'INS',
      category: 'insulation',
      order: 7,
      tradeCodes: ['IN'],
      description: 'Rigid or batt depending on assembly',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'inspection', reason: 'After inspection' }
      ],
      locationScope: { type: 'floors', floors: ['basement'] },
    },
    {
      id: 'vapor_barrier',
      name: 'Vapor Barrier',
      shortName: 'VB',
      category: 'insulation',
      order: 8,
      tradeCodes: ['IN'],
      description: 'Code-dependent',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'insulation', reason: 'Insulation first' }
      ],
      locationScope: { type: 'floors', floors: ['basement'] },
    },
    {
      id: 'drywall',
      name: 'Drywall',
      shortName: 'DW',
      category: 'drywall',
      order: 9,
      tradeCodes: ['DW'],
      description: 'Board, tape, sand',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'vapor_barrier', reason: 'VB before boarding' }
      ],
      locationScope: { type: 'floors', floors: ['basement'] },
    },
    {
      id: 'paint_phase_1',
      name: 'Paint Phase 1',
      shortName: 'PT-1',
      category: 'paint',
      order: 10,
      groupId: 'paint',
      tradeCodes: ['PT'],
      description: 'Walls and ceilings before flooring',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'drywall', reason: 'Drywall complete' }
      ],
      locationScope: { type: 'floors', floors: ['basement'] },
    },
    {
      id: 'flooring',
      name: 'Flooring',
      shortName: 'FL',
      category: 'flooring',
      order: 11,
      tradeCodes: ['FL'],
      description: 'LVP or tile for moisture resistance',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'paint_phase_1', reason: 'Paint done before flooring' }
      ],
      locationScope: { type: 'floors', floors: ['basement'] },
    },
    {
      id: 'trim',
      name: 'Trim',
      shortName: 'TRIM',
      category: 'trim',
      order: 12,
      tradeCodes: ['FC'],
      description: 'Baseboard, casing',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'flooring', reason: 'Flooring before baseboard' }
      ],
      locationScope: { type: 'floors', floors: ['basement'] },
    },
    {
      id: 'paint_phase_2',
      name: 'Paint Phase 2 - Punch',
      shortName: 'PT-2',
      category: 'paint',
      order: 13,
      groupId: 'paint',
      tradeCodes: ['PT'],
      description: 'Trim paint and touch-ups',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'trim', reason: 'Trim installed before paint' }
      ],
      locationScope: { type: 'floors', floors: ['basement'] },
    },
    {
      id: 'plumbing_trim',
      name: 'Plumbing Trim',
      shortName: 'PL-T',
      category: 'plumbing',
      order: 14,
      tradeCodes: ['PL'],
      description: 'Fixtures if bathroom included',
      dependencies: [
        { type: 'soft', requiresPhaseId: 'paint_phase_2', reason: 'Paint done first', canOverride: true }
      ],
      locationScope: { type: 'floors', floors: ['basement'] },
    },
    {
      id: 'electrical_trim',
      name: 'Electrical Trim',
      shortName: 'EL-T',
      category: 'electrical',
      order: 15,
      tradeCodes: ['EL'],
      description: 'Devices, fixtures',
      dependencies: [
        { type: 'soft', requiresPhaseId: 'paint_phase_2', reason: 'Paint done first', canOverride: true }
      ],
      locationScope: { type: 'floors', floors: ['basement'] },
    },
    {
      id: 'hvac_trim',
      name: 'HVAC Trim',
      shortName: 'HV-T',
      category: 'hvac',
      order: 16,
      tradeCodes: ['HV'],
      description: 'Grilles, registers',
      dependencies: [
        { type: 'soft', requiresPhaseId: 'paint_phase_2', reason: 'Paint done first', canOverride: true }
      ],
      locationScope: { type: 'floors', floors: ['basement'] },
    },
    {
      id: 'finals',
      name: 'Finals & Punch',
      shortName: 'FINAL',
      category: 'punchout',
      order: 17,
      tradeCodes: [],
      description: 'Final inspection and punch list',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'electrical_trim', reason: 'All electrical complete' },
        { type: 'soft', requiresPhaseId: 'plumbing_trim', reason: 'All plumbing complete', canOverride: true }
      ],
      locationScope: { type: 'floors', floors: ['basement'] },
    },
  ],
  scopeRules: [
    // If no bathroom, remove plumbing phases
    {
      condition: { type: 'scope_excludes', value: 'bathroom' },
      action: { type: 'remove_phase', phaseIds: ['plumbing_rough', 'plumbing_trim'] }
    },
  ],
};

// ============================================================================
// DECK / EXTERIOR STRUCTURE TEMPLATE
// ============================================================================

export const DECK_EXTERIOR = {
  id: 'deck_exterior',
  name: 'Deck / Exterior Structure',
  description: 'Deck or exterior structure build sequence',
  projectTypes: ['renovation', 'deck_exterior'],
  isSystem: true,
  phases: [
    {
      id: 'permit_layout',
      name: 'Permit & Layout',
      shortName: 'PERM',
      category: 'foundation',
      order: 1,
      tradeCodes: [],
      description: 'Permit approval and site layout',
      dependencies: [],
      locationScope: { type: 'all' },
    },
    {
      id: 'footings',
      name: 'Footings',
      shortName: 'FTG',
      category: 'foundation',
      order: 2,
      tradeCodes: ['FN'],
      description: 'Sono tubes or pads',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'permit_layout', reason: 'Permit required' }
      ],
      locationScope: { type: 'all' },
    },
    {
      id: 'posts',
      name: 'Posts',
      shortName: 'POST',
      category: 'structural',
      order: 3,
      tradeCodes: ['FS'],
      description: 'Set and brace posts',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'footings', reason: 'Footings support posts' }
      ],
      locationScope: { type: 'all' },
    },
    {
      id: 'beams',
      name: 'Beam Installation',
      shortName: 'BEAM',
      category: 'structural',
      order: 4,
      tradeCodes: ['FS'],
      description: 'Main beams',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'posts', reason: 'Posts support beams' }
      ],
      locationScope: { type: 'all' },
    },
    {
      id: 'ledger',
      name: 'Ledger',
      shortName: 'LDGR',
      category: 'structural',
      order: 5,
      tradeCodes: ['FS'],
      description: 'If attached to house',
      dependencies: [
        { type: 'soft', requiresPhaseId: 'beams', reason: 'Beams and ledger coordinate', canOverride: true }
      ],
      locationScope: { type: 'all' },
    },
    {
      id: 'joists',
      name: 'Joist Framing',
      shortName: 'JOIST',
      category: 'structural',
      order: 6,
      tradeCodes: ['FS'],
      description: 'Floor joists',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'beams', reason: 'Beams support joists' },
        { type: 'hard', requiresPhaseId: 'ledger', reason: 'Ledger required for attached deck' }
      ],
      locationScope: { type: 'all' },
    },
    {
      id: 'blocking',
      name: 'Blocking & Bridging',
      shortName: 'BLOCK',
      category: 'structural',
      order: 7,
      tradeCodes: ['FS'],
      description: 'Joist blocking',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'joists', reason: 'Joists in place' }
      ],
      locationScope: { type: 'all' },
    },
    {
      id: 'decking',
      name: 'Decking',
      shortName: 'DECK',
      category: 'exterior',
      order: 8,
      tradeCodes: ['EX'],
      description: 'Deck boards',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'blocking', reason: 'Framing complete' }
      ],
      locationScope: { type: 'all' },
    },
    {
      id: 'railing_posts',
      name: 'Railing Posts',
      shortName: 'R-POST',
      category: 'exterior',
      order: 9,
      tradeCodes: ['EX'],
      description: 'Railing post installation',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'decking', reason: 'Decking supports post bases' }
      ],
      locationScope: { type: 'all' },
    },
    {
      id: 'railing',
      name: 'Railing Assembly',
      shortName: 'RAIL',
      category: 'exterior',
      order: 10,
      tradeCodes: ['EX'],
      description: 'Rails, balusters, cap',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'railing_posts', reason: 'Posts installed' }
      ],
      locationScope: { type: 'all' },
    },
    {
      id: 'stairs',
      name: 'Stairs',
      shortName: 'STAIR',
      category: 'exterior',
      order: 11,
      tradeCodes: ['EX', 'SR'],
      description: 'Deck stairs',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'decking', reason: 'Deck surface complete' }
      ],
      locationScope: { type: 'all' },
    },
    {
      id: 'finish',
      name: 'Finishing',
      shortName: 'FIN',
      category: 'exterior',
      order: 12,
      tradeCodes: ['EX', 'PT'],
      description: 'Stain/seal if wood',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'railing', reason: 'All woodwork complete' },
        { type: 'hard', requiresPhaseId: 'stairs', reason: 'Stairs complete' }
      ],
      locationScope: { type: 'all' },
    },
    {
      id: 'final_inspection',
      name: 'Final Inspection',
      shortName: 'INSP',
      category: 'punchout',
      order: 13,
      tradeCodes: [],
      description: 'Final building inspection',
      dependencies: [
        { type: 'hard', requiresPhaseId: 'finish', reason: 'All work complete' }
      ],
      locationScope: { type: 'all' },
    },
  ],
  scopeRules: [
    // If freestanding, remove ledger
    {
      condition: { type: 'building_has', value: 'freestanding' },
      action: { type: 'remove_phase', phaseIds: ['ledger'] }
    },
  ],
};

// ============================================================================
// TEMPLATE REGISTRY
// ============================================================================

export const PHASE_TEMPLATES = {
  new_construction_multi_storey: NEW_CONSTRUCTION_MULTI_STOREY,
  kitchen_renovation: KITCHEN_RENOVATION,
  bathroom_renovation: BATHROOM_RENOVATION,
  basement_finish: BASEMENT_FINISH,
  deck_exterior: DECK_EXTERIOR,
};

/**
 * Get template by ID
 */
export function getPhaseTemplate(templateId) {
  return PHASE_TEMPLATES[templateId] || null;
}

/**
 * Get templates applicable to a project type
 */
export function getTemplatesForProjectType(projectType) {
  return Object.values(PHASE_TEMPLATES).filter(template =>
    template.projectTypes.includes(projectType) ||
    template.projectTypes.includes('renovation') // renovation templates apply broadly
  );
}

/**
 * Suggest best template based on project intake data
 */
export function suggestTemplate(project) {
  const intakeType = project.intake_type;
  const intakeData = project.intake_data || {};

  // New construction
  if (intakeType === 'new_construction') {
    return NEW_CONSTRUCTION_MULTI_STOREY;
  }

  // Renovation - check scope
  if (intakeType === 'renovation') {
    const selectedRooms = intakeData.renovation?.selected_rooms || [];

    // Kitchen-only reno
    if (selectedRooms.length === 1 && selectedRooms.includes('kitchen')) {
      return KITCHEN_RENOVATION;
    }

    // Bathroom-only reno
    if (selectedRooms.length === 1 && (selectedRooms.includes('bathroom') || selectedRooms.includes('primary_bath') || selectedRooms.includes('ensuite'))) {
      return BATHROOM_RENOVATION;
    }

    // Basement finish
    if (selectedRooms.length === 1 && selectedRooms.includes('basement')) {
      return BASEMENT_FINISH;
    }

    // Multi-room reno - use new construction template (most comprehensive)
    return NEW_CONSTRUCTION_MULTI_STOREY;
  }

  // Default
  return NEW_CONSTRUCTION_MULTI_STOREY;
}

/**
 * Get all system templates
 */
export function getAllSystemTemplates() {
  return Object.values(PHASE_TEMPLATES).filter(t => t.isSystem);
}
