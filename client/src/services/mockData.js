// Mock data for development without Supabase
// Two sample projects generated from customer intake forms

// =============================================================================
// LOCAL STORAGE PERSISTENCE
// =============================================================================

const STORAGE_KEYS = {
  projects: 'hooomz_mock_projects',
  loops: 'hooomz_mock_loops',
  tasks: 'hooomz_mock_tasks',
};

function loadFromStorage(key, defaultValue) {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error(`Error loading ${key} from localStorage:`, e);
  }
  return defaultValue;
}

export function saveProjectsToStorage() {
  try {
    localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(mockProjects));
    localStorage.setItem(STORAGE_KEYS.loops, JSON.stringify(mockLoops));
    localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(mockTasks));
  } catch (e) {
    console.error('Error saving mock data to localStorage:', e);
  }
}

// =============================================================================
// PROJECTS - Generated from Intake
// =============================================================================

const defaultProjects = [
  // PROJECT 1: New Construction - The Hendersons
  {
    id: 'proj-nc-001',
    name: 'Henderson Family - 45 Riverside Drive',
    status: 'active',
    phase: 'active',
    progress: 35,

    // Contact info
    client_name: 'Mike & Sarah Henderson',
    client_email: 'hendersons@email.com',
    client_phone: '506-555-1234',
    preferred_contact: 'text',

    // Project details
    address: '45 Riverside Drive, Quispamsis, NB',
    build_tier: 'better',
    budget_range: '400_600k',
    target_start: '2025-03',
    target_completion: '2025-11',
    priorities: ['energy_efficiency', 'low_maintenance', 'durability'],

    // Estimate & Budget
    estimate_low: 485000,
    estimate_high: 565000,
    contract_value: 525000,
    spent: 185000,
    committed: 95000,

    // Dashboard-specific data
    dashboard: {
      // Schedule
      schedule: {
        projectStart: '2025-03-01',
        targetCompletion: '2025-11-15',
        currentCompletion: '2025-11-22',
        slippageDays: 7,
      },
      // Change Orders
      changeOrders: [
        {
          id: 'co-001',
          description: 'Upgraded kitchen appliance package',
          amount: 4500,
          status: 'approved',
          dateSubmitted: '2025-05-10',
        },
        {
          id: 'co-002',
          description: 'Add electric car charger to garage',
          amount: 2200,
          status: 'pending',
          dateSubmitted: '2025-06-15',
        },
      ],
      // Pending Decisions
      pendingDecisions: [
        {
          id: 'dec-001',
          category: 'Kitchen Backsplash',
          description: 'Select tile pattern and color',
          dueDate: '2025-07-01',
          daysOverdue: 5,
          status: 'overdue',
        },
        {
          id: 'dec-002',
          category: 'Light Fixtures',
          description: 'Confirm dining room chandelier selection',
          dueDate: '2025-07-10',
          daysOverdue: 0,
          status: 'pending',
        },
      ],
      // Milestones
      milestones: [
        { id: 'ms-001', name: 'Framing Inspection', date: '2025-07-02', type: 'inspection', status: 'upcoming' },
        { id: 'ms-002', name: 'Cabinet Delivery', date: '2025-07-15', type: 'delivery', status: 'upcoming' },
        { id: 'ms-003', name: 'Electrician Start', date: '2025-07-08', type: 'sub_start', status: 'upcoming' },
        { id: 'ms-004', name: 'Progress Payment #3', date: '2025-07-20', type: 'payment', status: 'upcoming' },
      ],
      // Team
      team: {
        projectLead: {
          id: 'team-001',
          name: 'Dave Henderson',
          role: 'Project Manager',
          phone: '506-555-0100',
          email: 'dave@hendersoncontracting.ca',
        },
        subcontractors: [
          { id: 'sub-001', company: 'Spark Electric', trade: 'Electrical', contact: 'Jim', phone: '506-555-2001', status: 'scheduled', scheduledDates: { start: '2025-07-08', end: '2025-07-18' } },
          { id: 'sub-002', company: 'Flow Plumbing', trade: 'Plumbing', contact: 'Mike', phone: '506-555-2002', status: 'on_site' },
          { id: 'sub-003', company: 'Cool Air HVAC', trade: 'HVAC', contact: 'Sarah', phone: '506-555-2003', status: 'scheduled', scheduledDates: { start: '2025-07-22', end: '2025-07-30' } },
          { id: 'sub-004', company: 'Board & Tape', trade: 'Drywall', contact: 'Pete', phone: '506-555-2004', status: 'not_scheduled' },
        ],
      },
    },

    // Intake metadata
    intake_type: 'new_construction',
    intake_data: {
      form_type: 'new_construction',
      contact: {
        full_name: 'Mike & Sarah Henderson',
        email: 'hendersons@email.com',
        phone: '506-555-1234',
        preferred_contact: 'text',
      },
      project: {
        address: '45 Riverside Drive, Quispamsis, NB',
        lot_purchased: 'yes',
        desired_start_month: '2025-03',
        target_completion_month: '2025-11',
        budget_range: '400_600k',
        build_tier: 'better',
        priorities: ['energy_efficiency', 'low_maintenance', 'durability'],
      },
      site: {
        water_supply: 'municipal',
        sewage_system: 'municipal',
        power_to_lot: 'yes',
        road_access: 'paved_municipal',
        lot_cleared: 'partial',
        foundation_type: 'full_basement',
      },
      layout: {
        sqft_range: '2000_2400',
        storeys: '2',
        basement_finish: 'partial',
        bedrooms: '4',
        primary_ensuite: true,
        full_bathrooms: '3',
        half_bathrooms: '1',
        garage_size: 'double',
        garage_type: 'attached',
        laundry_location: 'second_floor',
        outdoor_spaces: ['covered_porch', 'deck'],
      },
      selections: {
        exterior: {
          siding_type: 'fiber_cement',
          roof_material: 'architectural',
          window_frame: 'fiberglass',
          exterior_style: 'traditional',
        },
        interior: {
          main_floor_flooring: 'engineered',
          bedroom_flooring: 'carpet',
          door_style: 'shaker',
          trim_style: 'craftsman',
        },
        kitchen: {
          cabinet_construction: 'semi_custom',
          cabinet_style: 'shaker',
          countertop: 'quartz',
          island_size: 'medium',
          backsplash: 'full',
        },
        bathrooms: {
          primary_shower: 'walk_in_tile',
          secondary_bath: 'tile_tub_shower',
          vanity_type: 'semi_custom',
          vanity_top: 'quartz',
        },
        mechanical: {
          hvac_system: 'ducted_heat_pump',
          water_heater: 'heat_pump',
          electrical_upgrades: ['ev_ready', 'whole_home_surge', 'recessed_lighting'],
        },
      },
      notes: {
        must_haves: ['Open concept main floor', 'Mudroom with lockers', 'Large pantry'],
        pain_points: [],
        inspiration_urls: ['https://pinterest.com/hendersons/dream-home'],
        style_notes: 'Modern farmhouse with clean lines. White and gray palette with wood accents.',
        additional_notes: 'We have two kids under 10 and a golden retriever. Durability is key!',
      },
    },

    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-28T14:30:00Z',
  },

  // PROJECT 2: Renovation - The MacDonalds
  {
    id: 'proj-reno-001',
    name: 'MacDonald Renovation - 78 King Street',
    status: 'active',
    phase: 'active',
    progress: 22,

    // Contact info
    client_name: 'Janet MacDonald',
    client_email: 'janet.macdonald@email.com',
    client_phone: '506-555-5678',
    preferred_contact: 'email',

    // Project details
    address: '78 King Street, Rothesay, NB',
    build_tier: 'better',
    budget_range: '100_200k',
    target_start: '2025-02',
    target_completion: '2025-06',
    priorities: ['aesthetics', 'resale_value', 'energy_efficiency'],

    // Estimate
    estimate_low: 127000,
    estimate_high: 178000,
    estimate_breakdown: [
      { room: 'kitchen', tier: 'full', low: 45000, high: 65000 },
      { room: 'primary_bath', tier: 'full', low: 25000, high: 35000 },
      { room: 'secondary_bath', tier: 'refresh', low: 4500, high: 6500 },
      { room: 'powder_room', tier: 'full', low: 8000, high: 11000 },
      { room: 'basement', tier: 'full', low: 35000, high: 50000 },
      { room: 'laundry', tier: 'full', low: 8000, high: 12000 },
    ],

    // Intake metadata
    intake_type: 'renovation',
    intake_data: {
      form_type: 'renovation',
      contact: {
        full_name: 'Janet MacDonald',
        email: 'janet.macdonald@email.com',
        phone: '506-555-5678',
        preferred_contact: 'email',
        primary_decision_maker: 'self',
      },
      project: {
        address: '78 King Street, Rothesay, NB',
        desired_start_month: '2025-02',
        target_completion_month: '2025-06',
        budget_range: '100_200k',
        build_tier: 'better',
        priorities: ['aesthetics', 'resale_value', 'energy_efficiency'],
      },
      renovation: {
        home_age: '1970_1990',
        home_style: 'split_level',
        current_sqft: '2000_2400',
        selected_rooms: ['kitchen', 'primary_bath', 'secondary_bath', 'powder_room', 'basement', 'laundry'],
        room_tiers: {
          kitchen: 'full',
          primary_bath: 'full',
          secondary_bath: 'refresh',
          powder_room: 'full',
          basement: 'full',
          laundry: 'full',
        },
        known_issues: ['water_damage', 'electrical'],
        issue_details: 'Some water staining in basement ceiling from old bathroom leak (fixed). Electrical panel is original 100 amp fuse box.',
        previous_renovations: 'Roof replaced 2019, windows replaced 2021, furnace replaced 2022.',
        structural_notes: 'Would love to open up kitchen to dining room if possible.',
        electrical_service: '100_amp',
        electrical_panel: 'fuse',
        plumbing_type: 'copper',
        heating_type: 'oil_boiler',
        cooling_type: 'window_units',
        water_heater: 'oil_tank',
        occupancy_during: 'stay_partial',
        site_access: 'key_lockbox',
        parking: 'driveway',
        pets: 'indoor',
        pet_notes: 'Two cats - will keep them in bedroom during work.',
      },
      selections: {
        kitchen: {
          cabinet_construction: 'semi_custom',
          cabinet_style: 'shaker',
          countertop: 'quartz',
          island_size: 'medium',
          backsplash: 'full',
        },
        bathrooms: {
          primary_shower: 'walk_in_tile',
          secondary_bath: 'acrylic_tub_shower',
          vanity_type: 'semi_custom',
          vanity_top: 'quartz',
        },
      },
      notes: {
        must_haves: ['Larger kitchen island', 'Walk-in shower in primary bath', 'Finished rec room in basement'],
        pain_points: ['Kitchen is cramped and dark', 'Only one full bathroom upstairs', 'Basement is unusable'],
        inspiration_urls: ['https://houzz.com/janet-reno-ideas'],
        style_notes: 'Transitional style - not too modern, not too traditional. Love navy blue accents.',
        additional_notes: 'Planning to sell in 3-5 years, so want updates that will appeal to buyers.',
      },
    },

    created_at: '2025-01-20T09:00:00Z',
    updated_at: '2025-01-28T16:45:00Z',
  },

  // PROJECT 3: New Lead in Intake Phase (just submitted)
  {
    id: 'proj-intake-001',
    name: 'Thompson Kitchen Reno - 92 Main Street',
    status: 'intake',
    phase: 'intake',
    progress: 0,

    // Contact info
    client_name: 'David Thompson',
    client_email: 'dthompson@email.com',
    client_phone: '506-555-9999',
    preferred_contact: 'phone',

    // Project details
    address: '92 Main Street, Saint John, NB',
    build_tier: 'good',
    budget_range: '50_100k',
    target_start: '2025-04',
    target_completion: '2025-06',
    priorities: ['affordability', 'durability'],

    // Estimate from intake
    estimate_low: 25000,
    estimate_high: 35000,

    // Intake metadata
    intake_type: 'renovation',
    intake_data: {
      form_type: 'renovation',
      contact: {
        full_name: 'David Thompson',
        email: 'dthompson@email.com',
        phone: '506-555-9999',
        preferred_contact: 'phone',
      },
      project: {
        address: '92 Main Street, Saint John, NB',
        desired_start_month: '2025-04',
        target_completion_month: '2025-06',
        budget_range: '50_100k',
        build_tier: 'good',
        priorities: ['affordability', 'durability'],
      },
      renovation: {
        home_age: '1990_2010',
        home_style: 'bungalow',
        selected_rooms: ['kitchen'],
        room_tiers: {
          kitchen: 'full',
        },
      },
      notes: {
        must_haves: ['More counter space', 'New appliances'],
        pain_points: ['Cabinets falling apart', 'No dishwasher'],
        style_notes: 'Simple and functional',
      },
    },

    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // PROJECT 4: In Estimate Phase
  {
    id: 'proj-estimate-001',
    name: 'Wilson Basement Finish - 34 Oak Lane',
    status: 'estimate',
    phase: 'estimate',
    progress: 0,

    // Contact info
    client_name: 'Karen Wilson',
    client_email: 'kwilson@email.com',
    client_phone: '506-555-7777',
    preferred_contact: 'email',

    // Project details
    address: '34 Oak Lane, Hampton, NB',
    build_tier: 'better',
    budget_range: '50_100k',
    target_start: '2025-05',
    target_completion: '2025-08',
    priorities: ['aesthetics', 'resale_value'],

    // Estimate being developed
    estimate_low: 45000,
    estimate_high: 65000,
    estimate_breakdown: [
      { room: 'basement', tier: 'full', low: 45000, high: 65000 },
    ],

    // Intake metadata
    intake_type: 'renovation',
    intake_data: {
      form_type: 'renovation',
      contact: {
        full_name: 'Karen Wilson',
        email: 'kwilson@email.com',
        phone: '506-555-7777',
        preferred_contact: 'email',
      },
      renovation: {
        selected_rooms: ['basement'],
        room_tiers: {
          basement: 'full',
        },
      },
      notes: {
        must_haves: ['Home theatre area', 'Bedroom for guests', 'Full bathroom'],
      },
    },

    created_at: '2025-01-25T10:00:00Z',
    updated_at: '2025-01-28T14:00:00Z',
  },
];

// Load projects from localStorage or use defaults
export const mockProjects = loadFromStorage(STORAGE_KEYS.projects, defaultProjects);

// =============================================================================
// LOOPS - Generated from Intake Room Selections & Templates
// =============================================================================

const defaultLoops = {
  // Henderson New Construction Loops
  'proj-nc-001': [
    {
      id: 'loop-nc-001',
      project_id: 'proj-nc-001',
      name: 'Site Prep & Foundation',
      category: 'FN',
      status: 'completed',
      display_order: 1,
      source: 'intake',
      progress: 100,
    },
    {
      id: 'loop-nc-002',
      project_id: 'proj-nc-001',
      name: 'Framing',
      category: 'FS',
      status: 'active',
      display_order: 2,
      source: 'intake',
      progress: 65,
    },
    {
      id: 'loop-nc-003',
      project_id: 'proj-nc-001',
      name: 'Exterior Envelope',
      category: 'EE',
      status: 'active',
      display_order: 3,
      source: 'intake',
      progress: 20,
    },
    {
      id: 'loop-nc-004',
      project_id: 'proj-nc-001',
      name: 'Rough-In MEP',
      category: 'EL',
      status: 'pending',
      display_order: 4,
      source: 'intake',
      progress: 0,
    },
    {
      id: 'loop-nc-005',
      project_id: 'proj-nc-001',
      name: 'Insulation & Drywall',
      category: 'IA',
      status: 'pending',
      display_order: 5,
      source: 'intake',
      progress: 0,
    },
    {
      id: 'loop-nc-006',
      project_id: 'proj-nc-001',
      name: 'Kitchen',
      category: 'CM',
      status: 'pending',
      display_order: 6,
      source: 'intake',
      room_type: 'kitchen',
      progress: 0,
    },
    {
      id: 'loop-nc-007',
      project_id: 'proj-nc-001',
      name: 'Bathrooms',
      category: 'PL',
      status: 'pending',
      display_order: 7,
      source: 'intake',
      progress: 0,
    },
    {
      id: 'loop-nc-008',
      project_id: 'proj-nc-001',
      name: 'Interior Finishes',
      category: 'FC',
      status: 'pending',
      display_order: 8,
      source: 'intake',
      progress: 0,
    },
    {
      id: 'loop-nc-009',
      project_id: 'proj-nc-001',
      name: 'Final Punch & Closeout',
      category: 'FZ',
      status: 'pending',
      display_order: 9,
      source: 'intake',
      progress: 0,
    },
  ],

  // MacDonald Renovation Loops - Generated from room_tiers selections
  'proj-reno-001': [
    {
      id: 'loop-reno-001',
      project_id: 'proj-reno-001',
      name: 'Kitchen',
      category: 'CM',
      status: 'active',
      display_order: 1,
      source: 'intake',
      room_type: 'kitchen',
      reno_tier: 'full',
      progress: 45,
    },
    {
      id: 'loop-reno-002',
      project_id: 'proj-reno-001',
      name: 'Primary Bathroom',
      category: 'PL',
      status: 'pending',
      display_order: 2,
      source: 'intake',
      room_type: 'primary_bath',
      reno_tier: 'full',
      progress: 0,
    },
    {
      id: 'loop-reno-003',
      project_id: 'proj-reno-001',
      name: 'Secondary Bathroom',
      category: 'PL',
      status: 'pending',
      display_order: 3,
      source: 'intake',
      room_type: 'secondary_bath',
      reno_tier: 'refresh',
      progress: 0,
    },
    {
      id: 'loop-reno-004',
      project_id: 'proj-reno-001',
      name: 'Powder Room',
      category: 'PL',
      status: 'pending',
      display_order: 4,
      source: 'intake',
      room_type: 'powder_room',
      reno_tier: 'full',
      progress: 0,
    },
    {
      id: 'loop-reno-005',
      project_id: 'proj-reno-001',
      name: 'Basement',
      category: 'FI',
      status: 'active',
      display_order: 5,
      source: 'intake',
      room_type: 'basement',
      reno_tier: 'full',
      progress: 15,
    },
    {
      id: 'loop-reno-006',
      project_id: 'proj-reno-001',
      name: 'Laundry Room',
      category: 'PL',
      status: 'pending',
      display_order: 6,
      source: 'intake',
      room_type: 'laundry',
      reno_tier: 'full',
      progress: 0,
    },
    {
      id: 'loop-reno-007',
      project_id: 'proj-reno-001',
      name: 'Electrical Panel Upgrade',
      category: 'EL',
      status: 'completed',
      display_order: 7,
      source: 'intake',
      progress: 100,
    },
  ],
};

// Load loops from localStorage or use defaults
export const mockLoops = loadFromStorage(STORAGE_KEYS.loops, defaultLoops);

// =============================================================================
// TASKS - Generated from Intake Templates
// =============================================================================

const defaultTasks = {
  // Henderson - Site Prep & Foundation (completed)
  'loop-nc-001': [
    { id: 'task-nc-001', loop_id: 'loop-nc-001', title: 'Clear lot and grub stumps', status: 'completed', category: 'GN', display_order: 1 },
    { id: 'task-nc-002', loop_id: 'loop-nc-001', title: 'Excavate for foundation', status: 'completed', category: 'FN', display_order: 2 },
    { id: 'task-nc-003', loop_id: 'loop-nc-001', title: 'Install footings', status: 'completed', category: 'FN', display_order: 3 },
    { id: 'task-nc-004', loop_id: 'loop-nc-001', title: 'Pour foundation walls', status: 'completed', category: 'FN', display_order: 4 },
    { id: 'task-nc-005', loop_id: 'loop-nc-001', title: 'Waterproof and drain tile', status: 'completed', category: 'FN', display_order: 5 },
    { id: 'task-nc-006', loop_id: 'loop-nc-001', title: 'Backfill foundation', status: 'completed', category: 'FN', display_order: 6 },
    { id: 'task-nc-007', loop_id: 'loop-nc-001', title: 'Pour basement slab', status: 'completed', category: 'FN', display_order: 7 },
  ],

  // Henderson - Framing (active)
  'loop-nc-002': [
    { id: 'task-nc-008', loop_id: 'loop-nc-002', title: 'Frame first floor walls', status: 'completed', category: 'FS', display_order: 1 },
    { id: 'task-nc-009', loop_id: 'loop-nc-002', title: 'Install first floor joists', status: 'completed', category: 'FS', display_order: 2 },
    { id: 'task-nc-010', loop_id: 'loop-nc-002', title: 'Frame second floor walls', status: 'completed', category: 'FS', display_order: 3 },
    { id: 'task-nc-011', loop_id: 'loop-nc-002', title: 'Install ceiling joists', status: 'in_progress', category: 'FS', display_order: 4, estimated_hours: 16 },
    { id: 'task-nc-012', loop_id: 'loop-nc-002', title: 'Set roof trusses', status: 'pending', category: 'FS', display_order: 5, estimated_hours: 8 },
    { id: 'task-nc-013', loop_id: 'loop-nc-002', title: 'Install roof sheathing', status: 'pending', category: 'FS', display_order: 6 },
    { id: 'task-nc-014', loop_id: 'loop-nc-002', title: 'Frame garage', status: 'pending', category: 'FS', display_order: 7 },
  ],

  // Henderson - Exterior Envelope (starting)
  'loop-nc-003': [
    { id: 'task-nc-015', loop_id: 'loop-nc-003', title: 'Install house wrap', status: 'in_progress', category: 'EE', display_order: 1, estimated_hours: 8 },
    { id: 'task-nc-016', loop_id: 'loop-nc-003', title: 'Install windows', status: 'pending', category: 'EE', display_order: 2, estimated_hours: 16 },
    { id: 'task-nc-017', loop_id: 'loop-nc-003', title: 'Install exterior doors', status: 'pending', category: 'EE', display_order: 3 },
    { id: 'task-nc-018', loop_id: 'loop-nc-003', title: 'Install roofing', status: 'pending', category: 'RF', display_order: 4 },
    { id: 'task-nc-019', loop_id: 'loop-nc-003', title: 'Install fiber cement siding', status: 'pending', category: 'EE', display_order: 5 },
    { id: 'task-nc-020', loop_id: 'loop-nc-003', title: 'Install soffit and fascia', status: 'pending', category: 'EE', display_order: 6 },
    { id: 'task-nc-021', loop_id: 'loop-nc-003', title: 'Install exterior trim', status: 'pending', category: 'EE', display_order: 7 },
  ],

  // MacDonald - Kitchen (active, full reno)
  'loop-reno-001': [
    { id: 'task-reno-001', loop_id: 'loop-reno-001', title: 'Demo existing kitchen', status: 'completed', category: 'GN', display_order: 1 },
    { id: 'task-reno-002', loop_id: 'loop-reno-001', title: 'Remove wall to dining room', status: 'completed', category: 'FS', display_order: 2 },
    { id: 'task-reno-003', loop_id: 'loop-reno-001', title: 'Install beam for opening', status: 'completed', category: 'FS', display_order: 3 },
    { id: 'task-reno-004', loop_id: 'loop-reno-001', title: 'Rough plumbing relocations', status: 'completed', category: 'PL', subcategory: 'PL-01', display_order: 4 },
    { id: 'task-reno-005', loop_id: 'loop-reno-001', title: 'Rough electrical relocations', status: 'in_progress', category: 'EL', subcategory: 'EL-01', display_order: 5, estimated_hours: 12 },
    { id: 'task-reno-006', loop_id: 'loop-reno-001', title: 'Install drywall', status: 'pending', category: 'DW', display_order: 6 },
    { id: 'task-reno-007', loop_id: 'loop-reno-001', title: 'Prime and paint walls', status: 'pending', category: 'PT', display_order: 7 },
    { id: 'task-reno-008', loop_id: 'loop-reno-001', title: 'Install flooring', status: 'pending', category: 'FL', display_order: 8 },
    { id: 'task-reno-009', loop_id: 'loop-reno-001', title: 'Install cabinets', status: 'pending', category: 'CM', subcategory: 'CM-01', display_order: 9 },
    { id: 'task-reno-010', loop_id: 'loop-reno-001', title: 'Install quartz countertops', status: 'pending', category: 'CM', subcategory: 'CM-03', display_order: 10 },
    { id: 'task-reno-011', loop_id: 'loop-reno-001', title: 'Install backsplash', status: 'pending', category: 'TL', display_order: 11 },
    { id: 'task-reno-012', loop_id: 'loop-reno-001', title: 'Install sink and faucet', status: 'pending', category: 'PL', subcategory: 'PL-02', display_order: 12 },
    { id: 'task-reno-013', loop_id: 'loop-reno-001', title: 'Install appliances', status: 'pending', category: 'GN', display_order: 13 },
    { id: 'task-reno-014', loop_id: 'loop-reno-001', title: 'Trim electrical', status: 'pending', category: 'EL', subcategory: 'EL-02', display_order: 14 },
    { id: 'task-reno-015', loop_id: 'loop-reno-001', title: 'Install trim and casing', status: 'pending', category: 'FC', display_order: 15 },
    { id: 'task-reno-016', loop_id: 'loop-reno-001', title: 'Final clean and punch list', status: 'pending', category: 'FZ', display_order: 16 },
  ],

  // MacDonald - Primary Bathroom (full reno, pending)
  'loop-reno-002': [
    { id: 'task-reno-017', loop_id: 'loop-reno-002', title: 'Demo existing bathroom', status: 'pending', category: 'GN', display_order: 1 },
    { id: 'task-reno-018', loop_id: 'loop-reno-002', title: 'Rough plumbing', status: 'pending', category: 'PL', subcategory: 'PL-01', display_order: 2 },
    { id: 'task-reno-019', loop_id: 'loop-reno-002', title: 'Rough electrical', status: 'pending', category: 'EL', subcategory: 'EL-01', display_order: 3 },
    { id: 'task-reno-020', loop_id: 'loop-reno-002', title: 'Install shower pan', status: 'pending', category: 'PL', display_order: 4 },
    { id: 'task-reno-021', loop_id: 'loop-reno-002', title: 'Tile waterproofing', status: 'pending', category: 'TL', subcategory: 'TL-02', display_order: 5 },
    { id: 'task-reno-022', loop_id: 'loop-reno-002', title: 'Install wall tile', status: 'pending', category: 'TL', subcategory: 'TL-03', display_order: 6 },
    { id: 'task-reno-023', loop_id: 'loop-reno-002', title: 'Install floor tile', status: 'pending', category: 'TL', subcategory: 'TL-03', display_order: 7 },
    { id: 'task-reno-024', loop_id: 'loop-reno-002', title: 'Install vanity', status: 'pending', category: 'CM', subcategory: 'CM-02', display_order: 8 },
    { id: 'task-reno-025', loop_id: 'loop-reno-002', title: 'Install toilet', status: 'pending', category: 'PL', subcategory: 'PL-02', display_order: 9 },
    { id: 'task-reno-026', loop_id: 'loop-reno-002', title: 'Install glass shower door', status: 'pending', category: 'GN', display_order: 10 },
    { id: 'task-reno-027', loop_id: 'loop-reno-002', title: 'Trim electrical', status: 'pending', category: 'EL', subcategory: 'EL-02', display_order: 11 },
    { id: 'task-reno-028', loop_id: 'loop-reno-002', title: 'Paint and accessories', status: 'pending', category: 'PT', display_order: 12 },
  ],

  // MacDonald - Secondary Bathroom (refresh, pending)
  'loop-reno-003': [
    { id: 'task-reno-029', loop_id: 'loop-reno-003', title: 'Protect floors and adjacent areas', status: 'pending', category: 'GN', display_order: 1 },
    { id: 'task-reno-030', loop_id: 'loop-reno-003', title: 'Replace vanity', status: 'pending', category: 'CM', subcategory: 'CM-02', display_order: 2 },
    { id: 'task-reno-031', loop_id: 'loop-reno-003', title: 'Replace faucet', status: 'pending', category: 'PL', display_order: 3 },
    { id: 'task-reno-032', loop_id: 'loop-reno-003', title: 'Replace toilet', status: 'pending', category: 'PL', display_order: 4 },
    { id: 'task-reno-033', loop_id: 'loop-reno-003', title: 'Update lighting', status: 'pending', category: 'EL', display_order: 5 },
    { id: 'task-reno-034', loop_id: 'loop-reno-003', title: 'Paint', status: 'pending', category: 'PT', display_order: 6 },
    { id: 'task-reno-035', loop_id: 'loop-reno-003', title: 'Re-caulk tub/shower', status: 'pending', category: 'TL', display_order: 7 },
    { id: 'task-reno-036', loop_id: 'loop-reno-003', title: 'Final clean', status: 'pending', category: 'GN', display_order: 8 },
  ],

  // MacDonald - Basement (full finish, active)
  'loop-reno-005': [
    { id: 'task-reno-037', loop_id: 'loop-reno-005', title: 'Design layout and obtain permits', status: 'completed', category: 'GN', display_order: 1 },
    { id: 'task-reno-038', loop_id: 'loop-reno-005', title: 'Address water staining area', status: 'completed', category: 'FN', display_order: 2 },
    { id: 'task-reno-039', loop_id: 'loop-reno-005', title: 'Frame walls and bulkheads', status: 'in_progress', category: 'FI', subcategory: 'FI-01', display_order: 3, estimated_hours: 24 },
    { id: 'task-reno-040', loop_id: 'loop-reno-005', title: 'Rough electrical', status: 'pending', category: 'EL', subcategory: 'EL-01', display_order: 4 },
    { id: 'task-reno-041', loop_id: 'loop-reno-005', title: 'Insulate exterior walls', status: 'pending', category: 'IA', display_order: 5 },
    { id: 'task-reno-042', loop_id: 'loop-reno-005', title: 'Drywall', status: 'pending', category: 'DW', display_order: 6 },
    { id: 'task-reno-043', loop_id: 'loop-reno-005', title: 'Install flooring', status: 'pending', category: 'FL', display_order: 7 },
    { id: 'task-reno-044', loop_id: 'loop-reno-005', title: 'Paint', status: 'pending', category: 'PT', display_order: 8 },
    { id: 'task-reno-045', loop_id: 'loop-reno-005', title: 'Trim electrical', status: 'pending', category: 'EL', subcategory: 'EL-02', display_order: 9 },
    { id: 'task-reno-046', loop_id: 'loop-reno-005', title: 'Install doors and trim', status: 'pending', category: 'FC', display_order: 10 },
  ],

  // MacDonald - Electrical Panel Upgrade (completed first!)
  'loop-reno-007': [
    { id: 'task-reno-047', loop_id: 'loop-reno-007', title: 'Permit and inspection scheduling', status: 'completed', category: 'EL', display_order: 1 },
    { id: 'task-reno-048', loop_id: 'loop-reno-007', title: 'Install new 200A panel', status: 'completed', category: 'EL', display_order: 2 },
    { id: 'task-reno-049', loop_id: 'loop-reno-007', title: 'Transfer circuits to new panel', status: 'completed', category: 'EL', display_order: 3 },
    { id: 'task-reno-050', loop_id: 'loop-reno-007', title: 'NB Power meter upgrade', status: 'completed', category: 'EL', display_order: 4 },
    { id: 'task-reno-051', loop_id: 'loop-reno-007', title: 'Final inspection - passed', status: 'completed', category: 'EL', display_order: 5 },
  ],
};

// Load tasks from localStorage or use defaults
export const mockTasks = loadFromStorage(STORAGE_KEYS.tasks, defaultTasks);

// =============================================================================
// TODAY TASKS
// =============================================================================

export const mockTodayTasks = [
  {
    id: 'task-nc-011',
    loop_id: 'loop-nc-002',
    project_name: 'Henderson Family - 45 Riverside Drive',
    loop_name: 'Framing',
    title: 'Install ceiling joists',
    status: 'in_progress',
    priority: 1,
    estimated_hours: 16,
  },
  {
    id: 'task-nc-015',
    loop_id: 'loop-nc-003',
    project_name: 'Henderson Family - 45 Riverside Drive',
    loop_name: 'Exterior Envelope',
    title: 'Install house wrap',
    status: 'in_progress',
    priority: 2,
    estimated_hours: 8,
  },
  {
    id: 'task-reno-005',
    loop_id: 'loop-reno-001',
    project_name: 'MacDonald Renovation - 78 King Street',
    loop_name: 'Kitchen',
    title: 'Rough electrical relocations',
    status: 'in_progress',
    priority: 1,
    estimated_hours: 12,
  },
  {
    id: 'task-reno-039',
    loop_id: 'loop-reno-005',
    project_name: 'MacDonald Renovation - 78 King Street',
    loop_name: 'Basement',
    title: 'Frame walls and bulkheads',
    status: 'in_progress',
    priority: 2,
    estimated_hours: 24,
  },
];

// =============================================================================
// TIME ENTRY
// =============================================================================

export const mockTimeEntry = {
  id: 'te1',
  task_id: 'task-reno-005',
  task_title: 'Rough electrical relocations',
  project_name: 'MacDonald Renovation - 78 King Street',
  start_time: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
  allocated_minutes: 480, // 8 hours allocated
  duration_minutes: 180, // 3 hours elapsed
};

// =============================================================================
// CONTACTS
// =============================================================================

export const mockContacts = [
  // Subcontractors
  {
    id: 'c1',
    contact_type: 'subcontractor',
    name: 'Joe Martinez',
    company: 'Elite Electrical',
    phone: '506-555-0101',
    email: 'joe@eliteelectrical.ca',
    trade: 'EL',
  },
  {
    id: 'c2',
    contact_type: 'subcontractor',
    name: 'Tom LeBlanc',
    company: 'LeBlanc Plumbing',
    phone: '506-555-0102',
    email: 'tom@leblancplumbing.ca',
    trade: 'PL',
  },
  {
    id: 'c3',
    contact_type: 'subcontractor',
    name: 'Dave Wilson',
    company: 'Wilson HVAC',
    phone: '506-555-0103',
    email: 'dave@wilsonhvac.ca',
    trade: 'HV',
  },
  {
    id: 'c4',
    contact_type: 'subcontractor',
    name: 'Mike Brown',
    company: 'Brown Drywall',
    phone: '506-555-0104',
    email: 'mike@browndrywall.ca',
    trade: 'DW',
  },
  {
    id: 'c5',
    contact_type: 'subcontractor',
    name: 'Carlos Ramirez',
    company: 'Ramirez Tile',
    phone: '506-555-0105',
    email: 'carlos@ramireztile.ca',
    trade: 'TL',
  },
  // Suppliers
  {
    id: 'c6',
    contact_type: 'supplier',
    name: 'Kent Building Supplies',
    company: 'Kent Building Supplies',
    phone: '506-555-0201',
    email: 'orders@kent.ca',
  },
  {
    id: 'c7',
    contact_type: 'supplier',
    name: 'Taylor Lumber',
    company: 'Taylor Lumber',
    phone: '506-555-0202',
    email: 'sales@taylorlumber.ca',
  },
  // Inspectors
  {
    id: 'c8',
    contact_type: 'inspector',
    name: 'Town of Quispamsis',
    company: 'Building Inspection',
    phone: '506-555-0301',
    email: 'inspections@quispamsis.ca',
  },
  // Clients
  {
    id: 'c9',
    contact_type: 'client',
    name: 'Mike Henderson',
    company: '',
    phone: '506-555-1234',
    email: 'hendersons@email.com',
    project_ids: ['proj-nc-001'],
  },
  {
    id: 'c10',
    contact_type: 'client',
    name: 'Janet MacDonald',
    company: '',
    phone: '506-555-5678',
    email: 'janet.macdonald@email.com',
    project_ids: ['proj-reno-001'],
  },
];

// =============================================================================
// PROJECT CONTACTS
// =============================================================================

export const mockProjectContacts = {
  'proj-nc-001': ['c1', 'c2', 'c3', 'c4', 'c6', 'c7', 'c8', 'c9'],
  'proj-reno-001': ['c1', 'c2', 'c4', 'c5', 'c6', 'c10'],
};

// =============================================================================
// ACTIVITY LOG
// =============================================================================

export const mockActivityLog = {
  'proj-nc-001': [
    {
      id: 'a1',
      event_type: 'task.completed',
      event_data: { title: 'Pour basement slab' },
      category_code: 'FN',
      actor_name: 'Henderson Contracting',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'a2',
      event_type: 'loop.completed',
      event_data: { name: 'Site Prep & Foundation' },
      category_code: 'FN',
      actor_name: 'System',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'a3',
      event_type: 'time.started',
      event_data: { task_title: 'Install ceiling joists' },
      category_code: 'FS',
      actor_name: 'Henderson Contracting',
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'a4',
      event_type: 'material.received',
      event_data: { description: 'Roof trusses delivered - 24 units' },
      category_code: 'FS',
      contact_ids: ['c7'],
      actor_name: 'Henderson Contracting',
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'a5',
      event_type: 'project.created_from_intake',
      event_data: {
        project_name: 'Henderson Family - 45 Riverside Drive',
        intake_type: 'new_construction',
        loops_created: 9,
        estimate_low: 485000,
        estimate_high: 565000,
      },
      actor_name: 'Mike Henderson',
      created_at: '2025-01-15T10:00:00Z',
    },
  ],
  'proj-reno-001': [
    {
      id: 'a6',
      event_type: 'loop.completed',
      event_data: { name: 'Electrical Panel Upgrade' },
      category_code: 'EL',
      actor_name: 'System',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'a7',
      event_type: 'task.completed',
      event_data: { title: 'Remove wall to dining room' },
      category_code: 'FS',
      actor_name: 'Henderson Contracting',
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'a8',
      event_type: 'photo.uploaded',
      event_data: { description: 'Kitchen demo progress', count: 5 },
      category_code: 'GN',
      actor_name: 'Henderson Contracting',
      created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'a9',
      event_type: 'time.started',
      event_data: { task_title: 'Rough electrical relocations' },
      category_code: 'EL',
      contact_ids: ['c1'],
      actor_name: 'Henderson Contracting',
      created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'a10',
      event_type: 'note.added',
      event_data: { note: 'Client confirmed navy blue for island - Benjamin Moore Hale Navy' },
      category_code: 'CM',
      actor_name: 'Henderson Contracting',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'a11',
      event_type: 'project.created_from_intake',
      event_data: {
        project_name: 'MacDonald Renovation - 78 King Street',
        intake_type: 'renovation',
        loops_created: 7,
        estimate_low: 127000,
        estimate_high: 178000,
      },
      actor_name: 'Janet MacDonald',
      created_at: '2025-01-20T09:00:00Z',
    },
  ],
};
