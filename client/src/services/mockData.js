// Mock data for development without Supabase
// Two sample projects generated from customer intake forms

// =============================================================================
// LOCAL STORAGE PERSISTENCE
// =============================================================================

const STORAGE_KEYS = {
  projects: 'hooomz_mock_projects',
  loops: 'hooomz_mock_loops',
  tasks: 'hooomz_mock_tasks',
  taskTrackerTemplates: 'hooomz_task_templates',
  taskTrackerInstances: 'hooomz_task_instances',
  taskTrackerLocations: 'hooomz_task_locations',
  timeEntries: 'hooomz_time_entries',
  activeTimeEntry: 'hooomz_active_time_entry',
  materialSelections: 'hooomz_material_selections',
  floorPlans: 'hooomz_floor_plans',
  floorPlanElements: 'hooomz_floor_plan_elements',
  dataCleared: 'hooomz_data_cleared', // Marker to prevent defaults from loading
};

// Check if data has been explicitly cleared by user
function isDataCleared() {
  return localStorage.getItem(STORAGE_KEYS.dataCleared) === 'true';
}

function loadFromStorage(key, defaultValue) {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
    // If data was cleared, return empty default (not mock defaults)
    if (isDataCleared()) {
      return Array.isArray(defaultValue) ? [] : (typeof defaultValue === 'object' && defaultValue !== null ? {} : defaultValue);
    }
  } catch (e) {
    console.error(`Error loading ${key} from localStorage:`, e);
  }
  return defaultValue;
}

// Special loader for task instances that merges stored data with defaults
// This ensures new projects in defaults are always included
function loadTaskInstancesFromStorage(key, defaultValue) {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const storedData = JSON.parse(stored);
      // If data was cleared, don't merge with defaults - just return stored (empty) data
      if (isDataCleared()) {
        return storedData;
      }
      // Merge: keep stored data, but add any missing projects from defaults
      const merged = { ...storedData };
      for (const projectId of Object.keys(defaultValue)) {
        if (!merged[projectId]) {
          merged[projectId] = defaultValue[projectId];
        }
      }
      return merged;
    }
    // If data was cleared but nothing stored yet, return empty object
    if (isDataCleared()) {
      return {};
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

// Clear all mock data and reset to empty state
export function clearAllMockData() {
  try {
    // Set the "data cleared" marker FIRST - this prevents defaults from loading
    localStorage.setItem(STORAGE_KEYS.dataCleared, 'true');

    // Set empty arrays in localStorage so defaults don't load on refresh
    localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.loops, JSON.stringify({}));
    localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify({}));
    localStorage.setItem(STORAGE_KEYS.taskTrackerInstances, JSON.stringify({}));
    localStorage.setItem(STORAGE_KEYS.taskTrackerLocations, JSON.stringify({}));
    localStorage.setItem(STORAGE_KEYS.taskTrackerTemplates, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.timeEntries, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.materialSelections, JSON.stringify([]));
    localStorage.removeItem(STORAGE_KEYS.activeTimeEntry);

    // Reset in-memory arrays to empty
    mockProjects.length = 0;
    mockTimeEntries.length = 0;
    mockMaterialSelections.length = 0;
    mockActiveTimeEntry = null;

    // Clear object-type data by deleting all keys
    Object.keys(mockLoops).forEach(key => delete mockLoops[key]);
    Object.keys(mockTasks).forEach(key => delete mockTasks[key]);

    // Clear task tracker data
    if (typeof mockTaskInstances !== 'undefined') {
      Object.keys(mockTaskInstances).forEach(key => delete mockTaskInstances[key]);
    }
    if (typeof mockTaskTrackerLocations !== 'undefined') {
      Object.keys(mockTaskTrackerLocations).forEach(key => delete mockTaskTrackerLocations[key]);
    }
    if (typeof mockTaskTemplates !== 'undefined' && Array.isArray(mockTaskTemplates)) {
      mockTaskTemplates.length = 0;
    }

    console.log('All mock data cleared successfully');
    return true;
  } catch (e) {
    console.error('Error clearing mock data:', e);
    return false;
  }
}

// Restore mock data by removing the cleared marker and reloading
export function restoreMockData() {
  try {
    // Remove the cleared marker
    localStorage.removeItem(STORAGE_KEYS.dataCleared);
    // Remove all stored data so defaults will load on refresh
    Object.values(STORAGE_KEYS).forEach(key => {
      if (key !== STORAGE_KEYS.dataCleared) {
        localStorage.removeItem(key);
      }
    });
    console.log('Mock data will be restored on next page reload');
    return true;
  } catch (e) {
    console.error('Error restoring mock data:', e);
    return false;
  }
}

// Expose to window for easy console access
if (typeof window !== 'undefined') {
  window.clearAllMockData = clearAllMockData;
  window.restoreMockData = restoreMockData;
}

// =============================================================================
// PROJECTS - Generated from Intake
// =============================================================================

// Production mode: Start with empty projects (users create their own)
// Set to false to load demo projects for development/testing
const LOAD_DEMO_DATA = false;

const demoProjects = [
  // ============================================================================
  // PROJECT 1: INTAKE PHASE (New Lead / Sales)
  // ============================================================================
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

    // Estimate from intake (rough)
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

    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },

  // ============================================================================
  // PROJECT 2: ESTIMATING PHASE
  // ============================================================================
  {
    id: 'proj-estimate-001',
    name: 'Wilson Basement Finish - 34 Oak Lane',
    status: 'estimating',
    phase: 'estimating',
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
    // Line items for estimate builder
    estimate_line_items: [
      { id: 'eli-001', name: 'Demo & Prep', tradeCode: 'DM', room: 'basement', roomLabel: 'Basement', quantity: 1, unitPriceGood: 1800, unitPriceBetter: 2250, unitPriceBest: 2790 },
      { id: 'eli-002', name: 'Framing - Walls & Bulkheads', tradeCode: 'FI', room: 'basement', roomLabel: 'Basement', quantity: 1, unitPriceGood: 4500, unitPriceBetter: 5625, unitPriceBest: 6975 },
      { id: 'eli-003', name: 'Electrical Rough-in', tradeCode: 'EL', room: 'basement', roomLabel: 'Basement', quantity: 1, unitPriceGood: 3200, unitPriceBetter: 4000, unitPriceBest: 4960 },
      { id: 'eli-004', name: 'Plumbing Rough-in (Bathroom)', tradeCode: 'PL', room: 'basement', roomLabel: 'Basement', quantity: 1, unitPriceGood: 2800, unitPriceBetter: 3500, unitPriceBest: 4340 },
      { id: 'eli-005', name: 'Insulation', tradeCode: 'IA', room: 'basement', roomLabel: 'Basement', quantity: 1, unitPriceGood: 2400, unitPriceBetter: 3000, unitPriceBest: 3720 },
      { id: 'eli-006', name: 'Drywall & Finishing', tradeCode: 'DW', room: 'basement', roomLabel: 'Basement', quantity: 1, unitPriceGood: 5600, unitPriceBetter: 7000, unitPriceBest: 8680 },
      { id: 'eli-007', name: 'Painting', tradeCode: 'PT', room: 'basement', roomLabel: 'Basement', quantity: 1, unitPriceGood: 2000, unitPriceBetter: 2500, unitPriceBest: 3100 },
      { id: 'eli-008', name: 'Flooring - LVP', tradeCode: 'FL', room: 'basement', roomLabel: 'Basement', quantity: 1, unitPriceGood: 4800, unitPriceBetter: 6000, unitPriceBest: 7440 },
      { id: 'eli-009', name: 'Bathroom Tile', tradeCode: 'TL', room: 'basement', roomLabel: 'Basement Bath', quantity: 1, unitPriceGood: 2400, unitPriceBetter: 3000, unitPriceBest: 3720 },
      { id: 'eli-010', name: 'Bathroom Fixtures', tradeCode: 'PL', subCode: 'PL-02', room: 'basement', roomLabel: 'Basement Bath', quantity: 1, unitPriceGood: 1800, unitPriceBetter: 2250, unitPriceBest: 2790 },
      { id: 'eli-011', name: 'Vanity & Top', tradeCode: 'CM', subCode: 'CM-02', room: 'basement', roomLabel: 'Basement Bath', quantity: 1, unitPriceGood: 1200, unitPriceBetter: 1500, unitPriceBest: 1860 },
      { id: 'eli-012', name: 'Trim Electrical', tradeCode: 'EL', subCode: 'EL-02', room: 'basement', roomLabel: 'Basement', quantity: 1, unitPriceGood: 1600, unitPriceBetter: 2000, unitPriceBest: 2480 },
      { id: 'eli-013', name: 'Doors & Trim', tradeCode: 'FC', room: 'basement', roomLabel: 'Basement', quantity: 1, unitPriceGood: 2800, unitPriceBetter: 3500, unitPriceBest: 4340 },
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
      project: {
        address: '34 Oak Lane, Hampton, NB',
        desired_start_month: '2025-05',
        target_completion_month: '2025-08',
        budget_range: '50_100k',
        build_tier: 'better',
        priorities: ['aesthetics', 'resale_value'],
      },
      renovation: {
        home_age: '2000_2015',
        home_style: 'two_storey',
        selected_rooms: ['basement'],
        room_tiers: {
          basement: 'full',
        },
      },
      notes: {
        must_haves: ['Home theatre area', 'Bedroom for guests', 'Full bathroom'],
        pain_points: ['Unfinished space', 'Cold in winter'],
        style_notes: 'Modern but warm, good lighting',
      },
    },

    created_at: '2025-01-25T10:00:00Z',
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },

  // ============================================================================
  // PROJECT 3: CONTRACTED PHASE (Ready to Start)
  // ============================================================================
  {
    id: 'proj-contract-001',
    name: 'Patel Primary Bath Reno - 56 Maple Drive',
    status: 'contracted',
    phase: 'contracted',
    progress: 0,

    // Contact info
    client_name: 'Raj & Priya Patel',
    client_email: 'patels@email.com',
    client_phone: '506-555-3333',
    preferred_contact: 'email',

    // Project details
    address: '56 Maple Drive, Fredericton, NB',
    build_tier: 'better',
    budget_range: '25_50k',
    target_start: '2025-02',
    target_completion: '2025-03',
    priorities: ['aesthetics', 'durability', 'resale_value'],

    // Estimate & Contract
    estimate_low: 28000,
    estimate_high: 38000,
    contract_value: 34500,
    contract_signed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    quote_sent_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    quote_response: 'approved',
    quote_response_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),

    // Line items for scope generation
    estimate_line_items: [
      { id: 'eli-100', name: 'Demo & Prep', tradeCode: 'DM', room: 'primary_bath', roomLabel: 'Primary Bathroom', quantity: 1, unitPriceGood: 2200, unitPriceBetter: 2750, unitPriceBest: 3410 },
      { id: 'eli-101', name: 'Plumbing Rough & Finish', tradeCode: 'PL', room: 'primary_bath', roomLabel: 'Primary Bathroom', quantity: 1, unitPriceGood: 5600, unitPriceBetter: 7000, unitPriceBest: 8680 },
      { id: 'eli-102', name: 'Electrical', tradeCode: 'EL', room: 'primary_bath', roomLabel: 'Primary Bathroom', quantity: 1, unitPriceGood: 2800, unitPriceBetter: 3500, unitPriceBest: 4340 },
      { id: 'eli-103', name: 'Drywall & Backer Board', tradeCode: 'DW', room: 'primary_bath', roomLabel: 'Primary Bathroom', quantity: 1, unitPriceGood: 2240, unitPriceBetter: 2800, unitPriceBest: 3472 },
      { id: 'eli-104', name: 'Tile - Shower', tradeCode: 'TL', room: 'primary_bath', roomLabel: 'Primary Bathroom', quantity: 1, unitPriceGood: 5040, unitPriceBetter: 6300, unitPriceBest: 7812 },
      { id: 'eli-105', name: 'Tile - Floor', tradeCode: 'TL', subCode: 'TL-03', room: 'primary_bath', roomLabel: 'Primary Bathroom', quantity: 1, unitPriceGood: 2240, unitPriceBetter: 2800, unitPriceBest: 3472 },
      { id: 'eli-106', name: 'Vanity & Quartz Top', tradeCode: 'CM', room: 'primary_bath', roomLabel: 'Primary Bathroom', quantity: 1, unitPriceGood: 3360, unitPriceBetter: 4200, unitPriceBest: 5208 },
      { id: 'eli-107', name: 'Painting', tradeCode: 'PT', room: 'primary_bath', roomLabel: 'Primary Bathroom', quantity: 1, unitPriceGood: 1120, unitPriceBetter: 1400, unitPriceBest: 1736 },
      { id: 'eli-108', name: 'Glass Shower Door', tradeCode: 'GN', room: 'primary_bath', roomLabel: 'Primary Bathroom', quantity: 1, unitPriceGood: 1600, unitPriceBetter: 2000, unitPriceBest: 2480 },
      { id: 'eli-109', name: 'Fixtures & Accessories', tradeCode: 'GN', room: 'primary_bath', roomLabel: 'Primary Bathroom', quantity: 1, unitPriceGood: 1800, unitPriceBetter: 2250, unitPriceBest: 2790 },
    ],

    // Intake metadata
    intake_type: 'renovation',
    intake_data: {
      form_type: 'renovation',
      contact: {
        full_name: 'Raj & Priya Patel',
        email: 'patels@email.com',
        phone: '506-555-3333',
        preferred_contact: 'email',
      },
      project: {
        address: '56 Maple Drive, Fredericton, NB',
        desired_start_month: '2025-02',
        target_completion_month: '2025-03',
        budget_range: '25_50k',
        build_tier: 'better',
        priorities: ['aesthetics', 'durability', 'resale_value'],
      },
      renovation: {
        home_age: '1990_2010',
        home_style: 'two_storey',
        selected_rooms: ['primary_bath'],
        room_tiers: {
          primary_bath: 'full',
        },
      },
      selections: {
        bathrooms: {
          primary_shower: 'walk_in_tile',
          vanity_type: 'semi_custom',
          vanity_top: 'quartz',
        },
      },
      notes: {
        must_haves: ['Walk-in shower', 'Double vanity', 'Heated floors'],
        pain_points: ['Dated 90s tub/shower combo', 'Poor ventilation'],
        style_notes: 'Clean modern look, white subway tile, black fixtures',
      },
    },

    created_at: '2025-01-10T10:00:00Z',
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },

  // ============================================================================
  // PROJECT 4: ACTIVE PHASE (In Progress) - New Construction
  // ============================================================================
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
    contract_signed_at: '2025-02-15T10:00:00Z',
    actual_start: '2025-03-01',

    // Dashboard-specific data
    dashboard: {
      schedule: {
        projectStart: '2025-03-01',
        targetCompletion: '2025-11-15',
        currentCompletion: '2025-11-22',
        slippageDays: 7,
      },
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
      milestones: [
        { id: 'ms-001', name: 'Framing Inspection', date: '2025-07-02', type: 'inspection', status: 'upcoming' },
        { id: 'ms-002', name: 'Cabinet Delivery', date: '2025-07-15', type: 'delivery', status: 'upcoming' },
        { id: 'ms-003', name: 'Electrician Start', date: '2025-07-08', type: 'sub_start', status: 'upcoming' },
        { id: 'ms-004', name: 'Progress Payment #3', date: '2025-07-20', type: 'payment', status: 'upcoming' },
      ],
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
    updated_at: new Date().toISOString(),
  },

  // ============================================================================
  // PROJECT 5: ACTIVE PHASE (In Progress) - Renovation
  // ============================================================================
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

    // Estimate & Contract
    estimate_low: 127000,
    estimate_high: 178000,
    contract_value: 152000,
    spent: 33440,
    committed: 45000,
    contract_signed_at: '2025-01-25T10:00:00Z',
    actual_start: '2025-02-03',
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
    updated_at: new Date().toISOString(),
  },

  // ============================================================================
  // PROJECT 6: COMPLETE PHASE
  // ============================================================================
  {
    id: 'proj-complete-001',
    name: 'Roberts Kitchen & Bath - 123 Cedar Lane',
    status: 'complete',
    phase: 'complete',
    progress: 100,

    // Contact info
    client_name: 'Tom & Lisa Roberts',
    client_email: 'roberts.family@email.com',
    client_phone: '506-555-4444',
    preferred_contact: 'text',

    // Project details
    address: '123 Cedar Lane, Rothesay, NB',
    build_tier: 'best',
    budget_range: '100_200k',
    target_start: '2024-09',
    target_completion: '2024-12',
    priorities: ['aesthetics', 'quality', 'resale_value'],

    // Final numbers
    estimate_low: 95000,
    estimate_high: 125000,
    contract_value: 115000,
    spent: 118500, // Slightly over due to upgrades
    committed: 0,
    contract_signed_at: '2024-08-20T10:00:00Z',
    actual_start: '2024-09-05',
    actual_completion: '2024-12-18',

    // Intake metadata
    intake_type: 'renovation',
    intake_data: {
      form_type: 'renovation',
      contact: {
        full_name: 'Tom & Lisa Roberts',
        email: 'roberts.family@email.com',
        phone: '506-555-4444',
        preferred_contact: 'text',
      },
      project: {
        address: '123 Cedar Lane, Rothesay, NB',
        desired_start_month: '2024-09',
        target_completion_month: '2024-12',
        budget_range: '100_200k',
        build_tier: 'best',
        priorities: ['aesthetics', 'quality', 'resale_value'],
      },
      renovation: {
        home_age: '2000_2015',
        home_style: 'two_storey',
        selected_rooms: ['kitchen', 'primary_bath'],
        room_tiers: {
          kitchen: 'full',
          primary_bath: 'full',
        },
      },
      selections: {
        kitchen: {
          cabinet_construction: 'custom',
          cabinet_style: 'modern',
          countertop: 'quartz',
          island_size: 'large',
          backsplash: 'full',
        },
        bathrooms: {
          primary_shower: 'walk_in_tile',
          vanity_type: 'custom',
          vanity_top: 'quartz',
        },
      },
      notes: {
        must_haves: ['Large island with seating', 'Spa-like primary bath', 'Premium finishes'],
        pain_points: ['Kitchen feels dated', 'Want more storage'],
        style_notes: 'Modern luxury, clean lines, high-end finishes',
      },
    },

    // Completion notes
    completion_notes: 'Project completed successfully. Client very happy with results. Minor punch list items addressed within 1 week of substantial completion.',
    warranty_end: '2025-12-18',

    created_at: '2024-08-01T10:00:00Z',
    updated_at: '2024-12-18T16:00:00Z',
  },
];

// Use empty array for production, demo data for development
const defaultProjects = LOAD_DEMO_DATA ? demoProjects : [];

// Load projects from localStorage or use defaults
export const mockProjects = loadFromStorage(STORAGE_KEYS.projects, defaultProjects);

// =============================================================================
// LOOPS - Generated from Intake Room Selections & Templates
// =============================================================================

const demoLoops = {
  // Henderson New Construction Loops - from estimate
  'proj-nc-001': [
    {
      id: 'loop-nc-001',
      project_id: 'proj-nc-001',
      name: 'Site Prep & Foundation',
      category: 'FN',
      category_code: 'FN',
      status: 'completed',
      display_order: 1,
      source: 'estimate',
      progress: 100,
    },
    {
      id: 'loop-nc-002',
      project_id: 'proj-nc-001',
      name: 'Framing',
      category: 'FS',
      category_code: 'FS',
      status: 'active',
      display_order: 2,
      source: 'estimate',
      progress: 65,
    },
    {
      id: 'loop-nc-003',
      project_id: 'proj-nc-001',
      name: 'Exterior Envelope',
      category: 'EE',
      category_code: 'EE',
      status: 'active',
      display_order: 3,
      source: 'estimate',
      progress: 20,
    },
    {
      id: 'loop-nc-004',
      project_id: 'proj-nc-001',
      name: 'Rough-In MEP',
      category: 'EL',
      category_code: 'EL',
      status: 'pending',
      display_order: 4,
      source: 'estimate',
      progress: 0,
    },
    {
      id: 'loop-nc-005',
      project_id: 'proj-nc-001',
      name: 'Insulation & Drywall',
      category: 'IA',
      category_code: 'IA',
      status: 'pending',
      display_order: 5,
      source: 'estimate',
      progress: 0,
    },
    {
      id: 'loop-nc-006',
      project_id: 'proj-nc-001',
      name: 'Kitchen',
      category: 'CM',
      category_code: 'CM',
      status: 'pending',
      display_order: 6,
      source: 'estimate',
      room_type: 'kitchen',
      progress: 0,
    },
    {
      id: 'loop-nc-007',
      project_id: 'proj-nc-001',
      name: 'Bathrooms',
      category: 'PL',
      category_code: 'PL',
      status: 'pending',
      display_order: 7,
      source: 'estimate',
      progress: 0,
    },
    {
      id: 'loop-nc-008',
      project_id: 'proj-nc-001',
      name: 'Interior Finishes',
      category: 'FC',
      category_code: 'FC',
      status: 'pending',
      display_order: 8,
      source: 'estimate',
      progress: 0,
    },
    {
      id: 'loop-nc-009',
      project_id: 'proj-nc-001',
      name: 'Final Punch & Closeout',
      category: 'FZ',
      category_code: 'FZ',
      status: 'pending',
      display_order: 9,
      source: 'estimate',
      progress: 0,
    },
  ],

  // MacDonald Renovation Loops - from estimate
  'proj-reno-001': [
    {
      id: 'loop-reno-001',
      project_id: 'proj-reno-001',
      name: 'Kitchen',
      category: 'CM',
      category_code: 'CM',
      status: 'active',
      display_order: 1,
      source: 'estimate',
      room_type: 'kitchen',
      reno_tier: 'full',
      progress: 45,
    },
    {
      id: 'loop-reno-002',
      project_id: 'proj-reno-001',
      name: 'Primary Bathroom',
      category: 'PL',
      category_code: 'PL',
      status: 'pending',
      display_order: 2,
      source: 'estimate',
      room_type: 'primary_bath',
      reno_tier: 'full',
      progress: 0,
    },
    {
      id: 'loop-reno-003',
      project_id: 'proj-reno-001',
      name: 'Secondary Bathroom',
      category: 'PL',
      category_code: 'PL',
      status: 'pending',
      display_order: 3,
      source: 'estimate',
      room_type: 'secondary_bath',
      reno_tier: 'refresh',
      progress: 0,
    },
    {
      id: 'loop-reno-004',
      project_id: 'proj-reno-001',
      name: 'Powder Room',
      category: 'PL',
      category_code: 'PL',
      status: 'pending',
      display_order: 4,
      source: 'estimate',
      room_type: 'powder_room',
      reno_tier: 'full',
      progress: 0,
    },
    {
      id: 'loop-reno-005',
      project_id: 'proj-reno-001',
      name: 'Basement',
      category: 'FI',
      category_code: 'FI',
      status: 'active',
      display_order: 5,
      source: 'estimate',
      room_type: 'basement',
      reno_tier: 'full',
      progress: 15,
    },
    {
      id: 'loop-reno-006',
      project_id: 'proj-reno-001',
      name: 'Laundry Room',
      category: 'PL',
      category_code: 'PL',
      status: 'pending',
      display_order: 6,
      source: 'estimate',
      room_type: 'laundry',
      reno_tier: 'full',
      progress: 0,
    },
    {
      id: 'loop-reno-007',
      project_id: 'proj-reno-001',
      name: 'Electrical Panel Upgrade',
      category: 'EL',
      category_code: 'EL',
      status: 'completed',
      display_order: 7,
      source: 'estimate',
      progress: 100,
    },
  ],

  // Roberts Completed Project Loops (all complete)
  'proj-complete-001': [
    {
      id: 'loop-complete-001',
      project_id: 'proj-complete-001',
      name: 'Demo & Prep',
      category_code: 'DM',
      status: 'completed',
      display_order: 1,
      source: 'estimate',
      progress: 100,
    },
    {
      id: 'loop-complete-002',
      project_id: 'proj-complete-001',
      name: 'Electrical',
      category_code: 'EL',
      status: 'completed',
      display_order: 2,
      source: 'estimate',
      progress: 100,
    },
    {
      id: 'loop-complete-003',
      project_id: 'proj-complete-001',
      name: 'Plumbing',
      category_code: 'PL',
      status: 'completed',
      display_order: 3,
      source: 'estimate',
      progress: 100,
    },
    {
      id: 'loop-complete-004',
      project_id: 'proj-complete-001',
      name: 'Drywall',
      category_code: 'DW',
      status: 'completed',
      display_order: 4,
      source: 'estimate',
      progress: 100,
    },
    {
      id: 'loop-complete-005',
      project_id: 'proj-complete-001',
      name: 'Tile',
      category_code: 'TL',
      status: 'completed',
      display_order: 5,
      source: 'estimate',
      progress: 100,
    },
    {
      id: 'loop-complete-006',
      project_id: 'proj-complete-001',
      name: 'Cabinetry & Millwork',
      category_code: 'CM',
      status: 'completed',
      display_order: 6,
      source: 'estimate',
      progress: 100,
    },
    {
      id: 'loop-complete-007',
      project_id: 'proj-complete-001',
      name: 'Flooring',
      category_code: 'FL',
      status: 'completed',
      display_order: 7,
      source: 'estimate',
      progress: 100,
    },
    {
      id: 'loop-complete-008',
      project_id: 'proj-complete-001',
      name: 'Painting',
      category_code: 'PT',
      status: 'completed',
      display_order: 8,
      source: 'estimate',
      progress: 100,
    },
    {
      id: 'loop-complete-009',
      project_id: 'proj-complete-001',
      name: 'Finish Carpentry',
      category_code: 'FC',
      status: 'completed',
      display_order: 9,
      source: 'estimate',
      progress: 100,
    },
    {
      id: 'loop-complete-010',
      project_id: 'proj-complete-001',
      name: 'Final Completion',
      category_code: 'FZ',
      status: 'completed',
      display_order: 10,
      source: 'estimate',
      progress: 100,
    },
  ],
};

// Use empty object for production, demo data for development
const defaultLoops = LOAD_DEMO_DATA ? demoLoops : {};

// Load loops from localStorage or use defaults
export const mockLoops = loadFromStorage(STORAGE_KEYS.loops, defaultLoops);

// =============================================================================
// TASKS - Generated from Intake Templates
// =============================================================================

const demoTasks = {
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
// Use empty object for production, demo data for development
const defaultTasks = LOAD_DEMO_DATA ? demoTasks : {};

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
// TIME ENTRIES - Full time tracking system
// =============================================================================

// Default time entries - sample historical data
const defaultTimeEntries = [
  {
    id: 'te-001',
    taskId: 'inst-proj-nc-001-el-001',
    taskName: 'Rough-In Electrical - Kitchen',
    projectId: 'proj-nc-001',
    projectName: 'Henderson New Construction',
    categoryCode: 'EL',
    subcategoryCode: 'EL-SVC',
    userId: 'c1', // Joe Martinez
    userName: 'Joe Martinez',
    startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000).toISOString(), // 2 days ago, 8am
    endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000).toISOString(), // 2 days ago, 12pm
    durationMinutes: 240, // 4 hours
    notes: 'Ran wiring for kitchen outlets and lighting',
    billable: true,
  },
  {
    id: 'te-002',
    taskId: 'inst-proj-nc-001-el-001',
    taskName: 'Rough-In Electrical - Kitchen',
    projectId: 'proj-nc-001',
    projectName: 'Henderson New Construction',
    categoryCode: 'EL',
    subcategoryCode: 'EL-SVC',
    userId: 'c1',
    userName: 'Joe Martinez',
    startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 13 * 60 * 60 * 1000).toISOString(), // 2 days ago, 1pm
    endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 17 * 60 * 60 * 1000).toISOString(), // 2 days ago, 5pm
    durationMinutes: 240, // 4 hours
    notes: 'Completed kitchen rough-in, started panel work',
    billable: true,
  },
  {
    id: 'te-003',
    taskId: 'inst-proj-nc-001-pl-002',
    taskName: 'Rough-In Plumbing - Primary Bath',
    projectId: 'proj-nc-001',
    projectName: 'Henderson New Construction',
    categoryCode: 'PL',
    subcategoryCode: 'PL-DWV',
    userId: 'c2', // Mike Thompson
    userName: 'Mike Thompson',
    startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000).toISOString(), // yesterday, 7am
    endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000).toISOString(), // yesterday, 3pm
    durationMinutes: 480, // 8 hours
    notes: 'DWV rough-in for primary bath, shower drain and supply lines',
    billable: true,
  },
];

// Load time entries from storage
export const mockTimeEntries = loadFromStorage(STORAGE_KEYS.timeEntries, defaultTimeEntries);

// Active time entry (currently running timer) - null if no active timer
export let mockActiveTimeEntry = loadFromStorage(STORAGE_KEYS.activeTimeEntry, null);

// Legacy single entry for backwards compatibility
export const mockTimeEntry = mockActiveTimeEntry || {
  id: 'te1',
  task_id: 'task-reno-005',
  task_title: 'Rough electrical relocations',
  project_name: 'MacDonald Renovation - 78 King Street',
  start_time: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  allocated_minutes: 480,
  duration_minutes: 180,
};

// Save time entries to localStorage
export function saveTimeEntriesToStorage() {
  try {
    localStorage.setItem(STORAGE_KEYS.timeEntries, JSON.stringify(mockTimeEntries));
    localStorage.setItem(STORAGE_KEYS.activeTimeEntry, JSON.stringify(mockActiveTimeEntry));
  } catch (e) {
    console.error('Error saving time entries to localStorage:', e);
  }
}

// Update active time entry reference
export function setActiveTimeEntry(entry) {
  mockActiveTimeEntry = entry;
  saveTimeEntriesToStorage();
}

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

  // Thompson - Intake Phase (New Lead)
  'proj-intake-001': [
    {
      id: 'a-intake-001',
      event_type: 'project.created_from_intake',
      event_data: {
        project_name: 'Thompson Kitchen Reno - 92 Main Street',
        intake_type: 'renovation',
        estimate_low: 25000,
        estimate_high: 35000,
      },
      actor_name: 'David Thompson',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],

  // Wilson - Estimating Phase
  'proj-estimate-001': [
    {
      id: 'a-est-001',
      event_type: 'project.created_from_intake',
      event_data: {
        project_name: 'Wilson Basement Finish - 34 Oak Lane',
        intake_type: 'renovation',
        estimate_low: 45000,
        estimate_high: 65000,
      },
      actor_name: 'Karen Wilson',
      created_at: '2025-01-25T10:00:00Z',
    },
    {
      id: 'a-est-002',
      event_type: 'phase.changed',
      event_data: {
        from_phase: 'intake',
        to_phase: 'estimating',
        from_label: 'New Lead',
        to_label: 'Estimating',
      },
      actor_name: 'You',
      created_at: '2025-01-26T09:00:00Z',
    },
    {
      id: 'a-est-003',
      event_type: 'note.added',
      event_data: { note: 'Site visit completed. Basement is 850 sqft, 8ft ceilings. Good condition, no moisture issues.' },
      category_code: 'GN',
      actor_name: 'You',
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],

  // Patel - Contracted Phase
  'proj-contract-001': [
    {
      id: 'a-con-001',
      event_type: 'project.created_from_intake',
      event_data: {
        project_name: 'Patel Primary Bath Reno - 56 Maple Drive',
        intake_type: 'renovation',
        estimate_low: 28000,
        estimate_high: 38000,
      },
      actor_name: 'Raj Patel',
      created_at: '2025-01-10T10:00:00Z',
    },
    {
      id: 'a-con-002',
      event_type: 'phase.changed',
      event_data: {
        from_phase: 'intake',
        to_phase: 'estimating',
        from_label: 'New Lead',
        to_label: 'Estimating',
      },
      actor_name: 'You',
      created_at: '2025-01-12T09:00:00Z',
    },
    {
      id: 'a-con-003',
      event_type: 'phase.changed',
      event_data: {
        from_phase: 'estimating',
        to_phase: 'quoted',
        from_label: 'Estimating',
        to_label: 'Quoted',
      },
      actor_name: 'You',
      created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'a-con-004',
      event_type: 'quote.response',
      event_data: {
        response: 'approved',
        client_name: 'Raj & Priya Patel',
      },
      actor_name: 'Raj Patel',
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'a-con-005',
      event_type: 'phase.changed',
      event_data: {
        from_phase: 'quoted',
        to_phase: 'contracted',
        from_label: 'Quoted',
        to_label: 'Contracted',
        contract_value: 34500,
      },
      actor_name: 'You',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'a-con-006',
      event_type: 'note.added',
      event_data: { note: 'Materials ordered. Tile and vanity lead time is 2 weeks. Scheduled start for Feb 15.' },
      category_code: 'GN',
      actor_name: 'You',
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],

  // Roberts - Completed Project
  'proj-complete-001': [
    {
      id: 'a-comp-001',
      event_type: 'project.created_from_intake',
      event_data: {
        project_name: 'Roberts Kitchen & Bath - 123 Cedar Lane',
        intake_type: 'renovation',
        estimate_low: 95000,
        estimate_high: 125000,
      },
      actor_name: 'Tom Roberts',
      created_at: '2024-08-01T10:00:00Z',
    },
    {
      id: 'a-comp-002',
      event_type: 'phase.changed',
      event_data: {
        from_phase: 'contracted',
        to_phase: 'active',
        from_label: 'Contracted',
        to_label: 'In Progress',
      },
      actor_name: 'You',
      created_at: '2024-09-05T08:00:00Z',
    },
    {
      id: 'a-comp-003',
      event_type: 'project.started',
      event_data: {
        loops_created: 10,
        tasks_created: 45,
      },
      actor_name: 'System',
      created_at: '2024-09-05T08:00:00Z',
    },
    {
      id: 'a-comp-004',
      event_type: 'loop.completed',
      event_data: { name: 'Demo & Prep' },
      category_code: 'DM',
      actor_name: 'System',
      created_at: '2024-09-15T16:00:00Z',
    },
    {
      id: 'a-comp-005',
      event_type: 'loop.completed',
      event_data: { name: 'Cabinetry & Millwork' },
      category_code: 'CM',
      actor_name: 'System',
      created_at: '2024-11-20T16:00:00Z',
    },
    {
      id: 'a-comp-006',
      event_type: 'phase.changed',
      event_data: {
        from_phase: 'active',
        to_phase: 'punch_list',
        from_label: 'In Progress',
        to_label: 'Punch List',
      },
      actor_name: 'You',
      created_at: '2024-12-10T14:00:00Z',
    },
    {
      id: 'a-comp-007',
      event_type: 'note.added',
      event_data: { note: 'Final walkthrough completed with clients. 8 punch list items identified.' },
      category_code: 'FZ',
      actor_name: 'You',
      created_at: '2024-12-12T10:00:00Z',
    },
    {
      id: 'a-comp-008',
      event_type: 'phase.changed',
      event_data: {
        from_phase: 'punch_list',
        to_phase: 'complete',
        from_label: 'Punch List',
        to_label: 'Complete',
      },
      actor_name: 'You',
      created_at: '2024-12-18T16:00:00Z',
    },
    {
      id: 'a-comp-009',
      event_type: 'project.completed',
      event_data: {
        final_value: 118500,
        duration_days: 104,
        client_satisfaction: 'Very satisfied',
      },
      actor_name: 'System',
      created_at: '2024-12-18T16:00:00Z',
    },
  ],
};

// =============================================================================
// TASK TRACKER - THREE AXIS MODEL DATA
// =============================================================================

// Work Categories (Axis 1) - NEVER changes after creation
export const workCategories = [
  { code: 'SW', name: 'Site Work', color: '#78716C', icon: 'Shovel', displayOrder: 1 },
  { code: 'FN', name: 'Foundation', color: '#A1A1AA', icon: 'Building', displayOrder: 2 },
  { code: 'FR', name: 'Framing', color: '#F59E0B', icon: 'Frame', displayOrder: 3 },
  { code: 'RF', name: 'Roofing', color: '#6366F1', icon: 'Home', displayOrder: 4 },
  { code: 'EX', name: 'Exterior', color: '#14B8A6', icon: 'Building2', displayOrder: 5 },
  { code: 'WD', name: 'Windows & Doors', color: '#06B6D4', icon: 'DoorOpen', displayOrder: 6 },
  { code: 'IN', name: 'Insulation', color: '#F97316', icon: 'Layers', displayOrder: 7 },
  { code: 'EL', name: 'Electrical', color: '#EAB308', icon: 'Zap', displayOrder: 8 },
  { code: 'PL', name: 'Plumbing', color: '#3B82F6', icon: 'Droplets', displayOrder: 9 },
  { code: 'HV', name: 'HVAC', color: '#22C55E', icon: 'Wind', displayOrder: 10 },
  { code: 'DW', name: 'Drywall', color: '#A855F7', icon: 'Square', displayOrder: 11 },
  { code: 'PT', name: 'Painting', color: '#EC4899', icon: 'Paintbrush', displayOrder: 12 },
  { code: 'FL', name: 'Flooring', color: '#84CC16', icon: 'LayoutGrid', displayOrder: 13 },
  { code: 'TL', name: 'Tile', color: '#0EA5E9', icon: 'Grid3X3', displayOrder: 14 },
  { code: 'FC', name: 'Finish Carpentry', color: '#D946EF', icon: 'Hammer', displayOrder: 15 },
  { code: 'CB', name: 'Cabinetry', color: '#10B981', icon: 'Package', displayOrder: 16 },
  { code: 'CT', name: 'Countertops', color: '#8B5CF6', icon: 'Layers3', displayOrder: 17 },
  { code: 'FX', name: 'Fixtures', color: '#0891B2', icon: 'Lightbulb', displayOrder: 18 },
  { code: 'CL', name: 'Cleaning & Closeout', color: '#64748B', icon: 'Sparkles', displayOrder: 19 },
];

// Work Subcategories - nested under categories
export const workSubcategories = [
  // Electrical
  { id: 'sub-el-svc', categoryCode: 'EL', code: 'EL-SVC', name: 'Service & Panel', displayOrder: 1 },
  { id: 'sub-el-rgh', categoryCode: 'EL', code: 'EL-RGH', name: 'Rough-In', displayOrder: 2 },
  { id: 'sub-el-low', categoryCode: 'EL', code: 'EL-LOW', name: 'Low Voltage', displayOrder: 3 },
  { id: 'sub-el-ltg', categoryCode: 'EL', code: 'EL-LTG', name: 'Lighting', displayOrder: 4 },
  { id: 'sub-el-fin', categoryCode: 'EL', code: 'EL-FIN', name: 'Devices & Finish', displayOrder: 5 },
  // Plumbing
  { id: 'sub-pl-svc', categoryCode: 'PL', code: 'PL-SVC', name: 'Service & Main Lines', displayOrder: 1 },
  { id: 'sub-pl-sup', categoryCode: 'PL', code: 'PL-SUP', name: 'Supply Lines', displayOrder: 2 },
  { id: 'sub-pl-drn', categoryCode: 'PL', code: 'PL-DRN', name: 'Drain Lines', displayOrder: 3 },
  { id: 'sub-pl-gas', categoryCode: 'PL', code: 'PL-GAS', name: 'Gas Lines', displayOrder: 4 },
  { id: 'sub-pl-fix', categoryCode: 'PL', code: 'PL-FIX', name: 'Fixtures', displayOrder: 5 },
  // Drywall
  { id: 'sub-dw-hng', categoryCode: 'DW', code: 'DW-HNG', name: 'Hanging', displayOrder: 1 },
  { id: 'sub-dw-tap', categoryCode: 'DW', code: 'DW-TAP', name: 'Taping', displayOrder: 2 },
  { id: 'sub-dw-fin', categoryCode: 'DW', code: 'DW-FIN', name: 'Finishing', displayOrder: 3 },
  // Framing
  { id: 'sub-fr-str', categoryCode: 'FR', code: 'FR-STR', name: 'Structural', displayOrder: 1 },
  { id: 'sub-fr-int', categoryCode: 'FR', code: 'FR-INT', name: 'Interior Walls', displayOrder: 2 },
  { id: 'sub-fr-clg', categoryCode: 'FR', code: 'FR-CLG', name: 'Ceiling', displayOrder: 3 },
  // Tile
  { id: 'sub-tl-flr', categoryCode: 'TL', code: 'TL-FLR', name: 'Floor Tile', displayOrder: 1 },
  { id: 'sub-tl-wal', categoryCode: 'TL', code: 'TL-WAL', name: 'Wall Tile', displayOrder: 2 },
  { id: 'sub-tl-shw', categoryCode: 'TL', code: 'TL-SHW', name: 'Shower', displayOrder: 3 },
  { id: 'sub-tl-bsp', categoryCode: 'TL', code: 'TL-BSP', name: 'Backsplash', displayOrder: 4 },
];

// Construction Stages (Axis 2) - NEVER changes after creation
export const stages = [
  { code: 'ST-DM', name: 'Demolition', stageOrder: 1, typicalDays: 3 },
  { code: 'ST-SS', name: 'Site & Structure', stageOrder: 2, typicalDays: 5 },
  { code: 'ST-EW', name: 'Envelope', stageOrder: 3, typicalDays: 5 },
  { code: 'ST-RO', name: 'Rough-In', stageOrder: 4, typicalDays: 7 },
  { code: 'ST-IS', name: 'Insulation', stageOrder: 5, typicalDays: 3 },
  { code: 'ST-DW', name: 'Drywall', stageOrder: 6, typicalDays: 10 },
  { code: 'ST-PR', name: 'Prime & Prep', stageOrder: 7, typicalDays: 2 },
  { code: 'ST-FN', name: 'Finish', stageOrder: 8, typicalDays: 15 },
  { code: 'ST-FX', name: 'Fixtures', stageOrder: 9, typicalDays: 4 },
  { code: 'ST-PL', name: 'Punch List', stageOrder: 10, typicalDays: 3 },
  { code: 'ST-CL', name: 'Closeout', stageOrder: 11, typicalDays: 1 },
];

// Phases (for checklists - orthogonal to stages)
export const phases = [
  { code: 'rough_in', name: 'Rough-In', displayOrder: 1 },
  { code: 'finish', name: 'Finish', displayOrder: 2 },
  { code: 'inspection', name: 'Inspection', displayOrder: 3 },
  { code: 'final', name: 'Final', displayOrder: 4 },
];

// Default locations for MacDonald Renovation (proj-reno-001)
const defaultLocations = {
  'proj-reno-001': [
    { id: 'loc-reno-main', projectId: 'proj-reno-001', parentId: null, name: 'Main House', locationType: 'building', path: 'Main House', displayOrder: 1 },
    { id: 'loc-reno-1f', projectId: 'proj-reno-001', parentId: 'loc-reno-main', name: '1st Floor', locationType: 'floor', path: 'Main House.1st Floor', displayOrder: 1 },
    { id: 'loc-reno-kit', projectId: 'proj-reno-001', parentId: 'loc-reno-1f', name: 'Kitchen', locationType: 'room', path: 'Main House.1st Floor.Kitchen', displayOrder: 1 },
    { id: 'loc-reno-dining', projectId: 'proj-reno-001', parentId: 'loc-reno-1f', name: 'Dining Room', locationType: 'room', path: 'Main House.1st Floor.Dining Room', displayOrder: 2 },
    { id: 'loc-reno-powder', projectId: 'proj-reno-001', parentId: 'loc-reno-1f', name: 'Powder Room', locationType: 'room', path: 'Main House.1st Floor.Powder Room', displayOrder: 3 },
    { id: 'loc-reno-laundry', projectId: 'proj-reno-001', parentId: 'loc-reno-1f', name: 'Laundry', locationType: 'room', path: 'Main House.1st Floor.Laundry', displayOrder: 4 },
    { id: 'loc-reno-2f', projectId: 'proj-reno-001', parentId: 'loc-reno-main', name: '2nd Floor', locationType: 'floor', path: 'Main House.2nd Floor', displayOrder: 2 },
    { id: 'loc-reno-primary', projectId: 'proj-reno-001', parentId: 'loc-reno-2f', name: 'Primary Suite', locationType: 'room', path: 'Main House.2nd Floor.Primary Suite', displayOrder: 1 },
    { id: 'loc-reno-pbath', projectId: 'proj-reno-001', parentId: 'loc-reno-2f', name: 'Primary Bath', locationType: 'room', path: 'Main House.2nd Floor.Primary Bath', displayOrder: 2 },
    { id: 'loc-reno-sbath', projectId: 'proj-reno-001', parentId: 'loc-reno-2f', name: 'Secondary Bath', locationType: 'room', path: 'Main House.2nd Floor.Secondary Bath', displayOrder: 3 },
    { id: 'loc-reno-base', projectId: 'proj-reno-001', parentId: 'loc-reno-main', name: 'Basement', locationType: 'floor', path: 'Main House.Basement', displayOrder: 3 },
    { id: 'loc-reno-rec', projectId: 'proj-reno-001', parentId: 'loc-reno-base', name: 'Rec Room', locationType: 'room', path: 'Main House.Basement.Rec Room', displayOrder: 1 },
    { id: 'loc-reno-guest', projectId: 'proj-reno-001', parentId: 'loc-reno-base', name: 'Guest Bedroom', locationType: 'room', path: 'Main House.Basement.Guest Bedroom', displayOrder: 2 },
    // Systems (spatial anchors)
    { id: 'loc-reno-elec-panel', projectId: 'proj-reno-001', parentId: null, name: 'Electrical Panel', locationType: 'system', path: 'Electrical Panel', physicalAnchorId: 'loc-reno-base', displayOrder: 100 },
    { id: 'loc-reno-mech', projectId: 'proj-reno-001', parentId: null, name: 'Mechanical Room', locationType: 'system', path: 'Mechanical Room', physicalAnchorId: 'loc-reno-base', displayOrder: 101 },
  ],
  'proj-nc-001': [
    { id: 'loc-nc-main', projectId: 'proj-nc-001', parentId: null, name: 'Main House', locationType: 'building', path: 'Main House', displayOrder: 1 },
    { id: 'loc-nc-1f', projectId: 'proj-nc-001', parentId: 'loc-nc-main', name: '1st Floor', locationType: 'floor', path: 'Main House.1st Floor', displayOrder: 1 },
    { id: 'loc-nc-kit', projectId: 'proj-nc-001', parentId: 'loc-nc-1f', name: 'Kitchen', locationType: 'room', path: 'Main House.1st Floor.Kitchen', displayOrder: 1 },
    { id: 'loc-nc-living', projectId: 'proj-nc-001', parentId: 'loc-nc-1f', name: 'Living Room', locationType: 'room', path: 'Main House.1st Floor.Living Room', displayOrder: 2 },
    { id: 'loc-nc-mudroom', projectId: 'proj-nc-001', parentId: 'loc-nc-1f', name: 'Mudroom', locationType: 'room', path: 'Main House.1st Floor.Mudroom', displayOrder: 3 },
    { id: 'loc-nc-powder', projectId: 'proj-nc-001', parentId: 'loc-nc-1f', name: 'Powder Room', locationType: 'room', path: 'Main House.1st Floor.Powder Room', displayOrder: 4 },
    { id: 'loc-nc-2f', projectId: 'proj-nc-001', parentId: 'loc-nc-main', name: '2nd Floor', locationType: 'floor', path: 'Main House.2nd Floor', displayOrder: 2 },
    { id: 'loc-nc-primary', projectId: 'proj-nc-001', parentId: 'loc-nc-2f', name: 'Primary Suite', locationType: 'room', path: 'Main House.2nd Floor.Primary Suite', displayOrder: 1 },
    { id: 'loc-nc-pbath', projectId: 'proj-nc-001', parentId: 'loc-nc-2f', name: 'Primary Bath', locationType: 'room', path: 'Main House.2nd Floor.Primary Bath', displayOrder: 2 },
    { id: 'loc-nc-bed2', projectId: 'proj-nc-001', parentId: 'loc-nc-2f', name: 'Bedroom 2', locationType: 'room', path: 'Main House.2nd Floor.Bedroom 2', displayOrder: 3 },
    { id: 'loc-nc-bed3', projectId: 'proj-nc-001', parentId: 'loc-nc-2f', name: 'Bedroom 3', locationType: 'room', path: 'Main House.2nd Floor.Bedroom 3', displayOrder: 4 },
    { id: 'loc-nc-bed4', projectId: 'proj-nc-001', parentId: 'loc-nc-2f', name: 'Bedroom 4', locationType: 'room', path: 'Main House.2nd Floor.Bedroom 4', displayOrder: 5 },
    { id: 'loc-nc-bath2', projectId: 'proj-nc-001', parentId: 'loc-nc-2f', name: 'Hall Bath', locationType: 'room', path: 'Main House.2nd Floor.Hall Bath', displayOrder: 6 },
    { id: 'loc-nc-laundry', projectId: 'proj-nc-001', parentId: 'loc-nc-2f', name: 'Laundry', locationType: 'room', path: 'Main House.2nd Floor.Laundry', displayOrder: 7 },
    { id: 'loc-nc-garage', projectId: 'proj-nc-001', parentId: 'loc-nc-main', name: 'Garage', locationType: 'zone', path: 'Main House.Garage', displayOrder: 3 },
    { id: 'loc-nc-basement', projectId: 'proj-nc-001', parentId: 'loc-nc-main', name: 'Basement', locationType: 'floor', path: 'Main House.Basement', displayOrder: 4 },
  ],
};

// Task Templates (Quantum State - before instantiation)
const defaultTaskTemplates = {
  'proj-reno-001': [
    // Electrical Templates
    {
      id: 'tpl-reno-el-001',
      projectId: 'proj-reno-001',
      categoryCode: 'EL',
      subcategoryId: 'sub-el-rgh',
      stageCode: 'ST-RO',
      locationBinding: 'per_room',
      name: 'Rough-In Electrical',
      description: 'Install boxes, run wire, set up circuits',
      estimatedHours: 4,
      totalQuantity: 6,
      instancesDeployed: 6,
      stageOrder: 1,
      source: 'estimate',
      fieldGuideLinks: ['electrical-rough-in'],
    },
    {
      id: 'tpl-reno-el-002',
      projectId: 'proj-reno-001',
      categoryCode: 'EL',
      subcategoryId: 'sub-el-fin',
      stageCode: 'ST-FX',
      locationBinding: 'per_room',
      name: 'Trim Electrical',
      description: 'Install devices, switches, outlets, covers',
      estimatedHours: 2,
      totalQuantity: 6,
      instancesDeployed: 6,
      stageOrder: 1,
      source: 'estimate',
    },
    // Plumbing Templates
    {
      id: 'tpl-reno-pl-001',
      projectId: 'proj-reno-001',
      categoryCode: 'PL',
      subcategoryId: 'sub-pl-drn',
      stageCode: 'ST-RO',
      locationBinding: 'per_room',
      name: 'Rough Plumbing',
      description: 'Install supply and drain lines',
      estimatedHours: 6,
      totalQuantity: 4,
      instancesDeployed: 4,
      stageOrder: 2,
      source: 'estimate',
    },
    // Drywall Templates
    {
      id: 'tpl-reno-dw-001',
      projectId: 'proj-reno-001',
      categoryCode: 'DW',
      subcategoryId: 'sub-dw-hng',
      stageCode: 'ST-DW',
      locationBinding: 'per_room',
      name: 'Hang Drywall',
      description: 'Install and screw drywall sheets',
      estimatedHours: 3,
      totalQuantity: 8,
      instancesDeployed: 8,
      stageOrder: 1,
      source: 'estimate',
    },
    {
      id: 'tpl-reno-dw-002',
      projectId: 'proj-reno-001',
      categoryCode: 'DW',
      subcategoryId: 'sub-dw-tap',
      stageCode: 'ST-DW',
      locationBinding: 'per_room',
      name: 'Tape & Mud',
      description: 'Tape joints and apply joint compound',
      estimatedHours: 4,
      totalQuantity: 8,
      instancesDeployed: 8,
      stageOrder: 2,
      source: 'estimate',
    },
    // Tile Templates
    {
      id: 'tpl-reno-tl-001',
      projectId: 'proj-reno-001',
      categoryCode: 'TL',
      subcategoryId: 'sub-tl-shw',
      stageCode: 'ST-FN',
      locationBinding: 'per_room',
      name: 'Shower Tile',
      description: 'Waterproof and tile shower surround',
      estimatedHours: 16,
      totalQuantity: 2,
      instancesDeployed: 2,
      stageOrder: 1,
      source: 'estimate',
    },
    {
      id: 'tpl-reno-tl-002',
      projectId: 'proj-reno-001',
      categoryCode: 'TL',
      subcategoryId: 'sub-tl-flr',
      stageCode: 'ST-FN',
      locationBinding: 'per_room',
      name: 'Floor Tile',
      description: 'Install floor tile with thin-set',
      estimatedHours: 8,
      totalQuantity: 3,
      instancesDeployed: 3,
      stageOrder: 2,
      source: 'estimate',
    },
    // Painting Templates
    {
      id: 'tpl-reno-pt-001',
      projectId: 'proj-reno-001',
      categoryCode: 'PT',
      stageCode: 'ST-PR',
      locationBinding: 'per_room',
      name: 'Prime Walls & Ceiling',
      description: 'Apply primer coat to new drywall',
      estimatedHours: 2,
      totalQuantity: 8,
      instancesDeployed: 8,
      stageOrder: 1,
      source: 'estimate',
    },
    {
      id: 'tpl-reno-pt-002',
      projectId: 'proj-reno-001',
      categoryCode: 'PT',
      stageCode: 'ST-FN',
      locationBinding: 'per_room',
      name: 'Finish Paint',
      description: 'Apply two coats finish paint',
      estimatedHours: 3,
      totalQuantity: 8,
      instancesDeployed: 8,
      stageOrder: 3,
      source: 'estimate',
    },
  ],
};

// Task Instances (Collapsed from Quantum State)
const demoTaskInstances = {
  // Henderson New Construction - proj-nc-001
  'proj-nc-001': [
    // Foundation tasks (completed)
    {
      id: 'inst-nc-001',
      templateId: 'tpl-nc-fn-001',
      locationId: 'loc-nc-main',
      categoryCode: 'FN',
      stageCode: 'ST-FD',
      locationPath: 'Main House',
      name: 'Pour Footings',
      status: 'completed',
      priority: 1,
      dueDate: '2025-01-15',
      assignedTo: 'c3',
      estimatedHours: 16,
      actualHours: 18,
      completedAt: '2025-01-15T16:00:00Z',
      reworkCount: 0,
    },
    {
      id: 'inst-nc-002',
      templateId: 'tpl-nc-fn-002',
      locationId: 'loc-nc-main',
      categoryCode: 'FN',
      stageCode: 'ST-FD',
      locationPath: 'Main House',
      name: 'Foundation Walls',
      status: 'completed',
      priority: 1,
      dueDate: '2025-01-22',
      assignedTo: 'c3',
      estimatedHours: 24,
      actualHours: 26,
      completedAt: '2025-01-22T17:00:00Z',
      reworkCount: 0,
    },
    // Framing tasks (in progress)
    {
      id: 'inst-nc-003',
      templateId: 'tpl-nc-fr-001',
      locationId: 'loc-nc-1f',
      categoryCode: 'FR',
      stageCode: 'ST-FR',
      locationPath: 'Main House.1st Floor',
      name: 'Frame First Floor Walls',
      status: 'completed',
      priority: 1,
      dueDate: '2025-01-30',
      assignedTo: 'c6',
      estimatedHours: 32,
      actualHours: 30,
      completedAt: '2025-01-30T15:00:00Z',
      reworkCount: 0,
    },
    {
      id: 'inst-nc-004',
      templateId: 'tpl-nc-fr-002',
      locationId: 'loc-nc-2f',
      categoryCode: 'FR',
      stageCode: 'ST-FR',
      locationPath: 'Main House.2nd Floor',
      name: 'Frame Second Floor Walls',
      status: 'in_progress',
      priority: 1,
      dueDate: '2025-02-08',
      assignedTo: 'c6',
      estimatedHours: 40,
      actualHours: 24,
      reworkCount: 0,
    },
    {
      id: 'inst-nc-005',
      templateId: 'tpl-nc-fr-003',
      locationId: 'loc-nc-main',
      categoryCode: 'RF',
      stageCode: 'ST-FR',
      locationPath: 'Main House',
      name: 'Set Roof Trusses',
      status: 'pending',
      priority: 1,
      dueDate: '2025-02-15',
      assignedTo: 'c6',
      estimatedHours: 16,
      actualHours: 0,
      reworkCount: 0,
    },
    {
      id: 'inst-nc-006',
      templateId: 'tpl-nc-fr-004',
      locationId: 'loc-nc-main',
      categoryCode: 'RF',
      stageCode: 'ST-FR',
      locationPath: 'Main House',
      name: 'Install Roof Sheathing',
      status: 'pending',
      priority: 2,
      dueDate: '2025-02-18',
      assignedTo: 'c6',
      estimatedHours: 20,
      actualHours: 0,
      reworkCount: 0,
    },
    // Exterior Envelope (starting)
    {
      id: 'inst-nc-007',
      templateId: 'tpl-nc-ee-001',
      locationId: 'loc-nc-main',
      categoryCode: 'EE',
      stageCode: 'ST-EE',
      locationPath: 'Main House',
      name: 'Install House Wrap',
      status: 'in_progress',
      priority: 1,
      dueDate: '2025-02-12',
      assignedTo: 'c7',
      estimatedHours: 12,
      actualHours: 4,
      reworkCount: 0,
    },
    {
      id: 'inst-nc-008',
      templateId: 'tpl-nc-ee-002',
      locationId: 'loc-nc-main',
      categoryCode: 'EE',
      stageCode: 'ST-EE',
      locationPath: 'Main House',
      name: 'Install Windows',
      status: 'pending',
      priority: 1,
      dueDate: '2025-02-20',
      assignedTo: 'c7',
      estimatedHours: 24,
      actualHours: 0,
      reworkCount: 0,
    },
    // Electrical Rough (pending)
    {
      id: 'inst-nc-009',
      templateId: 'tpl-nc-el-001',
      locationId: 'loc-nc-kit',
      categoryCode: 'EL',
      stageCode: 'ST-RO',
      locationPath: 'Main House.1st Floor.Kitchen',
      name: 'Rough-In Electrical - Kitchen',
      status: 'pending',
      priority: 2,
      dueDate: '2025-02-25',
      assignedTo: 'c1',
      estimatedHours: 8,
      actualHours: 0,
      reworkCount: 0,
    },
    {
      id: 'inst-nc-010',
      templateId: 'tpl-nc-el-002',
      locationId: 'loc-nc-living',
      categoryCode: 'EL',
      stageCode: 'ST-RO',
      locationPath: 'Main House.1st Floor.Living Room',
      name: 'Rough-In Electrical - Living Room',
      status: 'pending',
      priority: 2,
      dueDate: '2025-02-26',
      assignedTo: 'c1',
      estimatedHours: 6,
      actualHours: 0,
      reworkCount: 0,
    },
    // Plumbing Rough (pending)
    {
      id: 'inst-nc-011',
      templateId: 'tpl-nc-pl-001',
      locationId: 'loc-nc-pbath',
      categoryCode: 'PL',
      stageCode: 'ST-RO',
      locationPath: 'Main House.2nd Floor.Primary Bath',
      name: 'Rough-In Plumbing - Primary Bath',
      status: 'pending',
      priority: 2,
      dueDate: '2025-02-28',
      assignedTo: 'c2',
      estimatedHours: 10,
      actualHours: 0,
      reworkCount: 0,
    },
    {
      id: 'inst-nc-012',
      templateId: 'tpl-nc-pl-002',
      locationId: 'loc-nc-bath2',
      categoryCode: 'PL',
      stageCode: 'ST-RO',
      locationPath: 'Main House.2nd Floor.Hall Bath',
      name: 'Rough-In Plumbing - Hall Bath',
      status: 'pending',
      priority: 2,
      dueDate: '2025-03-01',
      assignedTo: 'c2',
      estimatedHours: 8,
      actualHours: 0,
      reworkCount: 0,
    },
    // HVAC (pending)
    {
      id: 'inst-nc-013',
      templateId: 'tpl-nc-hv-001',
      locationId: 'loc-nc-basement',
      categoryCode: 'HV',
      stageCode: 'ST-RO',
      locationPath: 'Main House.Basement',
      name: 'Install HVAC Equipment',
      status: 'pending',
      priority: 2,
      dueDate: '2025-03-05',
      assignedTo: 'c8',
      estimatedHours: 16,
      actualHours: 0,
      reworkCount: 0,
    },
    {
      id: 'inst-nc-014',
      templateId: 'tpl-nc-hv-002',
      locationId: 'loc-nc-1f',
      categoryCode: 'HV',
      stageCode: 'ST-RO',
      locationPath: 'Main House.1st Floor',
      name: 'Run Ductwork - 1st Floor',
      status: 'pending',
      priority: 3,
      dueDate: '2025-03-08',
      assignedTo: 'c8',
      estimatedHours: 20,
      actualHours: 0,
      reworkCount: 0,
    },
  ],

  // MacDonald Renovation - proj-reno-001
  'proj-reno-001': [
    // Electrical Rough-In - Kitchen (in_progress)
    {
      id: 'inst-reno-001',
      templateId: 'tpl-reno-el-001',
      locationId: 'loc-reno-kit',
      categoryCode: 'EL',
      stageCode: 'ST-RO',
      locationPath: 'Main House.1st Floor.Kitchen',
      name: 'Rough-In Electrical - Kitchen',
      status: 'in_progress',
      priority: 1,
      dueDate: '2025-02-10',
      assignedTo: 'c1', // Joe Martinez - Elite Electrical
      estimatedHours: 6,
      actualHours: 3.5,
      reworkCount: 0,
    },
    // Electrical Rough-In - Primary Bath (pending)
    {
      id: 'inst-reno-002',
      templateId: 'tpl-reno-el-001',
      locationId: 'loc-reno-pbath',
      categoryCode: 'EL',
      stageCode: 'ST-RO',
      locationPath: 'Main House.2nd Floor.Primary Bath',
      name: 'Rough-In Electrical - Primary Bath',
      status: 'pending',
      priority: 2,
      dueDate: '2025-02-12',
      assignedTo: 'c1',
      estimatedHours: 4,
      actualHours: 0,
      reworkCount: 0,
    },
    // Electrical Rough-In - Secondary Bath (pending)
    {
      id: 'inst-reno-003',
      templateId: 'tpl-reno-el-001',
      locationId: 'loc-reno-sbath',
      categoryCode: 'EL',
      stageCode: 'ST-RO',
      locationPath: 'Main House.2nd Floor.Secondary Bath',
      name: 'Rough-In Electrical - Secondary Bath',
      status: 'pending',
      priority: 3,
      dueDate: '2025-02-14',
      assignedTo: 'c1',
      estimatedHours: 3,
      actualHours: 0,
      reworkCount: 0,
    },
    // Electrical Rough-In - Basement Rec Room (pending)
    {
      id: 'inst-reno-004',
      templateId: 'tpl-reno-el-001',
      locationId: 'loc-reno-rec',
      categoryCode: 'EL',
      stageCode: 'ST-RO',
      locationPath: 'Main House.Basement.Rec Room',
      name: 'Rough-In Electrical - Rec Room',
      status: 'pending',
      priority: 2,
      dueDate: '2025-02-15',
      assignedTo: 'c1',
      estimatedHours: 5,
      actualHours: 0,
      reworkCount: 0,
    },
    // Plumbing Rough - Kitchen (completed)
    {
      id: 'inst-reno-005',
      templateId: 'tpl-reno-pl-001',
      locationId: 'loc-reno-kit',
      categoryCode: 'PL',
      stageCode: 'ST-RO',
      locationPath: 'Main House.1st Floor.Kitchen',
      name: 'Rough Plumbing - Kitchen',
      status: 'completed',
      priority: 1,
      dueDate: '2025-02-05',
      assignedTo: 'c2', // Tom LeBlanc - LeBlanc Plumbing
      estimatedHours: 6,
      actualHours: 5.5,
      completedAt: '2025-02-05T14:30:00Z',
      reworkCount: 0,
    },
    // Plumbing Rough - Primary Bath (in_progress)
    {
      id: 'inst-reno-006',
      templateId: 'tpl-reno-pl-001',
      locationId: 'loc-reno-pbath',
      categoryCode: 'PL',
      stageCode: 'ST-RO',
      locationPath: 'Main House.2nd Floor.Primary Bath',
      name: 'Rough Plumbing - Primary Bath',
      status: 'in_progress',
      priority: 1,
      dueDate: '2025-02-08',
      assignedTo: 'c2',
      estimatedHours: 8,
      actualHours: 4,
      reworkCount: 0,
    },
    // Plumbing Rough - Secondary Bath (pending, blocked by stage)
    {
      id: 'inst-reno-007',
      templateId: 'tpl-reno-pl-001',
      locationId: 'loc-reno-sbath',
      categoryCode: 'PL',
      stageCode: 'ST-RO',
      locationPath: 'Main House.2nd Floor.Secondary Bath',
      name: 'Rough Plumbing - Secondary Bath',
      status: 'pending',
      priority: 2,
      dueDate: '2025-02-12',
      assignedTo: 'c2',
      estimatedHours: 4,
      actualHours: 0,
      reworkCount: 0,
    },
    // Drywall Hang - Kitchen (pending, blocked by rough-in stage)
    {
      id: 'inst-reno-008',
      templateId: 'tpl-reno-dw-001',
      locationId: 'loc-reno-kit',
      categoryCode: 'DW',
      stageCode: 'ST-DW',
      locationPath: 'Main House.1st Floor.Kitchen',
      name: 'Hang Drywall - Kitchen',
      status: 'pending',
      priority: 2,
      dueDate: '2025-02-18',
      assignedTo: 'c4', // Mike Brown - Brown Drywall
      estimatedHours: 4,
      actualHours: 0,
      reworkCount: 0,
    },
    // Drywall Hang - Primary Bath (pending)
    {
      id: 'inst-reno-009',
      templateId: 'tpl-reno-dw-001',
      locationId: 'loc-reno-pbath',
      categoryCode: 'DW',
      stageCode: 'ST-DW',
      locationPath: 'Main House.2nd Floor.Primary Bath',
      name: 'Hang Drywall - Primary Bath',
      status: 'pending',
      priority: 2,
      dueDate: '2025-02-20',
      assignedTo: 'c4',
      estimatedHours: 3,
      actualHours: 0,
      reworkCount: 0,
    },
    // Tile - Primary Bath Shower (pending, blocked by drywall)
    {
      id: 'inst-reno-010',
      templateId: 'tpl-reno-tl-001',
      locationId: 'loc-reno-pbath',
      categoryCode: 'TL',
      stageCode: 'ST-FN',
      locationPath: 'Main House.2nd Floor.Primary Bath',
      name: 'Shower Tile - Primary Bath',
      status: 'pending',
      priority: 1,
      dueDate: '2025-03-01',
      assignedTo: 'c5', // Carlos Ramirez - Ramirez Tile
      estimatedHours: 16,
      actualHours: 0,
      reworkCount: 0,
    },
    // Tile - Floor Primary Bath (pending)
    {
      id: 'inst-reno-011',
      templateId: 'tpl-reno-tl-002',
      locationId: 'loc-reno-pbath',
      categoryCode: 'TL',
      stageCode: 'ST-FN',
      locationPath: 'Main House.2nd Floor.Primary Bath',
      name: 'Floor Tile - Primary Bath',
      status: 'pending',
      priority: 2,
      dueDate: '2025-03-05',
      assignedTo: 'c5',
      estimatedHours: 8,
      actualHours: 0,
      reworkCount: 0,
    },
    // Paint Prime - Kitchen (pending)
    {
      id: 'inst-reno-012',
      templateId: 'tpl-reno-pt-001',
      locationId: 'loc-reno-kit',
      categoryCode: 'PT',
      stageCode: 'ST-PR',
      locationPath: 'Main House.1st Floor.Kitchen',
      name: 'Prime Walls & Ceiling - Kitchen',
      status: 'pending',
      priority: 3,
      dueDate: '2025-02-25',
      estimatedHours: 2,
      actualHours: 0,
      reworkCount: 0,
    },
    // Blocked task example
    {
      id: 'inst-reno-013',
      templateId: 'tpl-reno-el-002',
      locationId: 'loc-reno-kit',
      categoryCode: 'EL',
      stageCode: 'ST-FX',
      locationPath: 'Main House.1st Floor.Kitchen',
      name: 'Trim Electrical - Kitchen',
      status: 'blocked',
      priority: 2,
      dueDate: '2025-03-10',
      assignedTo: 'c1',
      estimatedHours: 3,
      actualHours: 0,
      reworkCount: 0,
      dependencyOverrides: {
        blockedByReason: 'Waiting for cabinet installation',
      },
    },
  ],
};

// Phase Checklists (per template)
export const defaultPhaseChecklists = {
  'tpl-reno-el-001': [
    { id: 'chk-el-001', templateId: 'tpl-reno-el-001', phaseCode: 'rough_in', stepOrder: 1, stepDescription: 'Mark box locations per plan', isCritical: false },
    { id: 'chk-el-002', templateId: 'tpl-reno-el-001', phaseCode: 'rough_in', stepOrder: 2, stepDescription: 'Install boxes at correct heights', isCritical: true },
    { id: 'chk-el-003', templateId: 'tpl-reno-el-001', phaseCode: 'rough_in', stepOrder: 3, stepDescription: 'Run wire per circuit plan', isCritical: true },
    { id: 'chk-el-004', templateId: 'tpl-reno-el-001', phaseCode: 'rough_in', stepOrder: 4, stepDescription: 'Label all circuits at panel', isCritical: true },
    { id: 'chk-el-005', templateId: 'tpl-reno-el-001', phaseCode: 'inspection', stepOrder: 1, stepDescription: 'Schedule rough-in inspection', isCritical: true },
    { id: 'chk-el-006', templateId: 'tpl-reno-el-001', phaseCode: 'inspection', stepOrder: 2, stepDescription: 'Pass inspection', isCritical: true },
  ],
  'tpl-reno-dw-001': [
    { id: 'chk-dw-001', templateId: 'tpl-reno-dw-001', phaseCode: 'rough_in', stepOrder: 1, stepDescription: 'Verify framing is complete', isCritical: true },
    { id: 'chk-dw-002', templateId: 'tpl-reno-dw-001', phaseCode: 'rough_in', stepOrder: 2, stepDescription: 'Install vapor barrier if required', isCritical: false },
    { id: 'chk-dw-003', templateId: 'tpl-reno-dw-001', phaseCode: 'rough_in', stepOrder: 3, stepDescription: 'Hang ceiling sheets first', isCritical: false },
    { id: 'chk-dw-004', templateId: 'tpl-reno-dw-001', phaseCode: 'rough_in', stepOrder: 4, stepDescription: 'Hang wall sheets, stagger seams', isCritical: true },
    { id: 'chk-dw-005', templateId: 'tpl-reno-dw-001', phaseCode: 'rough_in', stepOrder: 5, stepDescription: 'Screw at 12" OC on ceilings, 16" on walls', isCritical: true },
  ],
  'tpl-reno-tl-001': [
    { id: 'chk-tl-001', templateId: 'tpl-reno-tl-001', phaseCode: 'rough_in', stepOrder: 1, stepDescription: 'Verify shower pan is properly sloped', isCritical: true },
    { id: 'chk-tl-002', templateId: 'tpl-reno-tl-001', phaseCode: 'rough_in', stepOrder: 2, stepDescription: 'Install backer board', isCritical: true },
    { id: 'chk-tl-003', templateId: 'tpl-reno-tl-001', phaseCode: 'rough_in', stepOrder: 3, stepDescription: 'Apply waterproof membrane', isCritical: true },
    { id: 'chk-tl-004', templateId: 'tpl-reno-tl-001', phaseCode: 'finish', stepOrder: 1, stepDescription: 'Lay out tile pattern', isCritical: false },
    { id: 'chk-tl-005', templateId: 'tpl-reno-tl-001', phaseCode: 'finish', stepOrder: 2, stepDescription: 'Set wall tiles bottom to top', isCritical: true },
    { id: 'chk-tl-006', templateId: 'tpl-reno-tl-001', phaseCode: 'finish', stepOrder: 3, stepDescription: 'Grout and seal', isCritical: true },
    { id: 'chk-tl-007', templateId: 'tpl-reno-tl-001', phaseCode: 'final', stepOrder: 1, stepDescription: 'Clean and polish', isCritical: false },
    { id: 'chk-tl-008', templateId: 'tpl-reno-tl-001', phaseCode: 'final', stepOrder: 2, stepDescription: 'Install fixtures and trim', isCritical: true },
  ],
};

// Use empty defaults for production, demo data for development
const defaultTaskInstances = LOAD_DEMO_DATA ? demoTaskInstances : {};

// Load from storage or use defaults
export const mockTaskTrackerLocations = loadFromStorage(STORAGE_KEYS.taskTrackerLocations, defaultLocations);
export const mockTaskTemplates = loadFromStorage(STORAGE_KEYS.taskTrackerTemplates, defaultTaskTemplates);
// Use special loader for task instances that merges defaults for new projects
export const mockTaskInstances = loadTaskInstancesFromStorage(STORAGE_KEYS.taskTrackerInstances, defaultTaskInstances);

// Save function for Task Tracker data
export function saveTaskTrackerToStorage() {
  try {
    localStorage.setItem(STORAGE_KEYS.taskTrackerTemplates, JSON.stringify(mockTaskTemplates));
    localStorage.setItem(STORAGE_KEYS.taskTrackerInstances, JSON.stringify(mockTaskInstances));
    localStorage.setItem(STORAGE_KEYS.taskTrackerLocations, JSON.stringify(mockTaskTrackerLocations));
  } catch (e) {
    console.error('Error saving Task Tracker data to localStorage:', e);
  }
}

// =============================================================================
// MATERIAL SELECTIONS
// =============================================================================

// Trades (who installs/supplies)
export const trades = [
  { id: 'trade-gc', code: 'GC', name: 'General Contractor' },
  { id: 'trade-plumber', code: 'PL', name: 'Plumber' },
  { id: 'trade-electrician', code: 'EL', name: 'Electrician' },
  { id: 'trade-hvac', code: 'HV', name: 'HVAC Technician' },
  { id: 'trade-carpenter', code: 'FC', name: 'Carpenter/Millworker' },
  { id: 'trade-flooring', code: 'FL', name: 'Flooring Installer' },
  { id: 'trade-painter', code: 'PT', name: 'Painter' },
  { id: 'trade-tiler', code: 'TL', name: 'Tile Setter' },
  { id: 'trade-roofer', code: 'RF', name: 'Roofer' },
  { id: 'trade-mason', code: 'MA', name: 'Mason' },
  { id: 'trade-homeowner', code: 'HO', name: 'Homeowner-supplied' },
];

// Selection Categories with Subcategories
export const selectionCategories = [
  {
    id: 'sel-cat-plumbing',
    code: 'PL',
    name: 'Plumbing',
    icon: 'Droplets',
    color: '#3B82F6',
    subcategories: [
      { id: 'sel-sub-toilet', code: 'PL-TOI', name: 'Toilet' },
      { id: 'sel-sub-shower-base', code: 'PL-SHB', name: 'Shower Base' },
      { id: 'sel-sub-shower-fixtures', code: 'PL-SHF', name: 'Shower Fixtures' },
      { id: 'sel-sub-bathtub', code: 'PL-TUB', name: 'Bathtub' },
      { id: 'sel-sub-bathtub-fixtures', code: 'PL-TBF', name: 'Bathtub Fixtures' },
      { id: 'sel-sub-bath-sink', code: 'PL-BSK', name: 'Bathroom Sink' },
      { id: 'sel-sub-kitchen-sink', code: 'PL-KSK', name: 'Kitchen Sink' },
      { id: 'sel-sub-bar-sink', code: 'PL-BAR', name: 'Bar Sink' },
      { id: 'sel-sub-laundry-sink', code: 'PL-LAU', name: 'Laundry Sink' },
      { id: 'sel-sub-kitchen-faucet', code: 'PL-KFA', name: 'Kitchen Faucet' },
      { id: 'sel-sub-bath-faucet', code: 'PL-BFA', name: 'Bathroom Faucet' },
      { id: 'sel-sub-garbage-disposal', code: 'PL-GRB', name: 'Garbage Disposal' },
      { id: 'sel-sub-water-heater', code: 'PL-WHT', name: 'Water Heater' },
    ],
  },
  {
    id: 'sel-cat-electrical',
    code: 'EL',
    name: 'Electrical',
    icon: 'Zap',
    color: '#EAB308',
    subcategories: [
      { id: 'sel-sub-light-ceiling', code: 'EL-LTC', name: 'Light Fixture - Ceiling' },
      { id: 'sel-sub-light-wall', code: 'EL-LTW', name: 'Light Fixture - Wall' },
      { id: 'sel-sub-light-exterior', code: 'EL-LTE', name: 'Light Fixture - Exterior' },
      { id: 'sel-sub-recessed', code: 'EL-REC', name: 'Recessed Lighting' },
      { id: 'sel-sub-under-cabinet', code: 'EL-UCL', name: 'Under-Cabinet Lighting' },
      { id: 'sel-sub-ceiling-fan', code: 'EL-FAN', name: 'Ceiling Fan' },
      { id: 'sel-sub-outlet-covers', code: 'EL-COV', name: 'Outlet/Switch Covers' },
      { id: 'sel-sub-smart-devices', code: 'EL-SMT', name: 'Smart Home Devices' },
    ],
  },
  {
    id: 'sel-cat-flooring',
    code: 'FL',
    name: 'Flooring',
    icon: 'LayoutGrid',
    color: '#84CC16',
    subcategories: [
      { id: 'sel-sub-hardwood', code: 'FL-HWD', name: 'Hardwood' },
      { id: 'sel-sub-laminate', code: 'FL-LAM', name: 'Laminate' },
      { id: 'sel-sub-lvp', code: 'FL-LVP', name: 'Luxury Vinyl Plank' },
      { id: 'sel-sub-tile-floor', code: 'FL-TIL', name: 'Tile' },
      { id: 'sel-sub-carpet', code: 'FL-CPT', name: 'Carpet' },
      { id: 'sel-sub-concrete', code: 'FL-CON', name: 'Concrete Stain/Paint' },
    ],
  },
  {
    id: 'sel-cat-finish-carpentry',
    code: 'FC',
    name: 'Finish Carpentry',
    icon: 'Hammer',
    color: '#D946EF',
    subcategories: [
      { id: 'sel-sub-int-doors', code: 'FC-IDR', name: 'Interior Doors' },
      { id: 'sel-sub-closet-doors', code: 'FC-CDR', name: 'Closet Doors' },
      { id: 'sel-sub-baseboards', code: 'FC-BAS', name: 'Baseboards' },
      { id: 'sel-sub-door-casing', code: 'FC-DCS', name: 'Door Casing' },
      { id: 'sel-sub-window-casing', code: 'FC-WCS', name: 'Window Casing' },
      { id: 'sel-sub-crown', code: 'FC-CRN', name: 'Crown Molding' },
      { id: 'sel-sub-closet-shelving', code: 'FC-CLS', name: 'Closet Shelving' },
      { id: 'sel-sub-builtins', code: 'FC-BLT', name: 'Built-ins' },
    ],
  },
  {
    id: 'sel-cat-cabinetry',
    code: 'CB',
    name: 'Cabinetry',
    icon: 'Package',
    color: '#10B981',
    subcategories: [
      { id: 'sel-sub-kitchen-upper', code: 'CB-KUP', name: 'Kitchen Cabinets - Upper' },
      { id: 'sel-sub-kitchen-lower', code: 'CB-KLO', name: 'Kitchen Cabinets - Lower' },
      { id: 'sel-sub-kitchen-island', code: 'CB-KIS', name: 'Kitchen Island' },
      { id: 'sel-sub-bath-vanity', code: 'CB-VAN', name: 'Bathroom Vanity' },
      { id: 'sel-sub-laundry-cabs', code: 'CB-LAU', name: 'Laundry Cabinets' },
    ],
  },
  {
    id: 'sel-cat-countertops',
    code: 'CT',
    name: 'Countertops',
    icon: 'Layers3',
    color: '#8B5CF6',
    subcategories: [
      { id: 'sel-sub-kitchen-counter', code: 'CT-KIT', name: 'Kitchen Countertop' },
      { id: 'sel-sub-bath-counter', code: 'CT-BTH', name: 'Bathroom Countertop' },
      { id: 'sel-sub-bar-top', code: 'CT-BAR', name: 'Bar Top' },
      { id: 'sel-sub-laundry-counter', code: 'CT-LAU', name: 'Laundry Counter' },
    ],
  },
  {
    id: 'sel-cat-paint',
    code: 'PT',
    name: 'Drywall and Paint',
    icon: 'Paintbrush',
    color: '#EC4899',
    subcategories: [
      { id: 'sel-sub-paint-walls', code: 'PT-WAL', name: 'Interior Paint - Walls' },
      { id: 'sel-sub-paint-trim', code: 'PT-TRM', name: 'Interior Paint - Trim' },
      { id: 'sel-sub-paint-ceiling', code: 'PT-CLG', name: 'Interior Paint - Ceiling' },
      { id: 'sel-sub-paint-exterior', code: 'PT-EXT', name: 'Exterior Paint' },
      { id: 'sel-sub-stain', code: 'PT-STN', name: 'Stain' },
    ],
  },
  {
    id: 'sel-cat-tile',
    code: 'TL',
    name: 'Tile',
    icon: 'Grid3X3',
    color: '#0EA5E9',
    subcategories: [
      { id: 'sel-sub-backsplash', code: 'TL-BSP', name: 'Kitchen Backsplash' },
      { id: 'sel-sub-bath-floor-tile', code: 'TL-BFL', name: 'Bathroom Tile - Floor' },
      { id: 'sel-sub-shower-tile', code: 'TL-SHW', name: 'Bathroom Tile - Shower' },
      { id: 'sel-sub-accent-tile', code: 'TL-ACC', name: 'Bathroom Tile - Accent' },
    ],
  },
  {
    id: 'sel-cat-hardware',
    code: 'HW',
    name: 'Hardware',
    icon: 'Wrench',
    color: '#64748B',
    subcategories: [
      { id: 'sel-sub-cabinet-pulls', code: 'HW-PUL', name: 'Cabinet Pulls' },
      { id: 'sel-sub-cabinet-knobs', code: 'HW-KNB', name: 'Cabinet Knobs' },
      { id: 'sel-sub-door-handles', code: 'HW-DHN', name: 'Door Handles' },
      { id: 'sel-sub-hinges', code: 'HW-HNG', name: 'Hinges' },
    ],
  },
  {
    id: 'sel-cat-appliances',
    code: 'AP',
    name: 'Appliances',
    icon: 'Refrigerator',
    color: '#0891B2',
    subcategories: [
      { id: 'sel-sub-refrigerator', code: 'AP-REF', name: 'Refrigerator' },
      { id: 'sel-sub-range', code: 'AP-RNG', name: 'Range/Oven' },
      { id: 'sel-sub-dishwasher', code: 'AP-DSH', name: 'Dishwasher' },
      { id: 'sel-sub-microwave', code: 'AP-MIC', name: 'Microwave' },
      { id: 'sel-sub-range-hood', code: 'AP-HUD', name: 'Range Hood' },
      { id: 'sel-sub-washer', code: 'AP-WSH', name: 'Washer' },
      { id: 'sel-sub-dryer', code: 'AP-DRY', name: 'Dryer' },
    ],
  },
  {
    id: 'sel-cat-hvac',
    code: 'HV',
    name: 'HVAC',
    icon: 'Wind',
    color: '#22C55E',
    subcategories: [
      { id: 'sel-sub-furnace', code: 'HV-FUR', name: 'Furnace' },
      { id: 'sel-sub-ac', code: 'HV-AC', name: 'Air Conditioner' },
      { id: 'sel-sub-heatpump', code: 'HV-HP', name: 'Heat Pump' },
      { id: 'sel-sub-hrv', code: 'HV-HRV', name: 'HRV/ERV' },
      { id: 'sel-sub-thermostat', code: 'HV-THM', name: 'Thermostat' },
    ],
  },
];

// Selection Status Workflow
export const selectionStatuses = [
  { code: 'pending', name: 'Pending', color: '#9CA3AF', order: 1 },
  { code: 'researching', name: 'Researching', color: '#60A5FA', order: 2 },
  { code: 'narrowed_down', name: 'Narrowed Down', color: '#A78BFA', order: 3 },
  { code: 'selected', name: 'Selected', color: '#FBBF24', order: 4 },
  { code: 'contractor_approved', name: 'Approved', color: '#34D399', order: 5 },
  { code: 'ordered', name: 'Ordered', color: '#F472B6', order: 6 },
  { code: 'on_site', name: 'On Site', color: '#2DD4BF', order: 7 },
  { code: 'installed', name: 'Installed', color: '#22C55E', order: 8 },
  { code: 'punch_list', name: 'Punch List', color: '#EF4444', order: 9 },
];

// Selection Phases (when selection is needed)
export const selectionPhases = [
  { code: 'estimate', name: 'Estimate', order: 1 },
  { code: 'rough_in', name: 'Rough-In', order: 2 },
  { code: 'installation', name: 'Installation', order: 3 },
  { code: 'finish', name: 'Finish', order: 4 },
  { code: 'inspection', name: 'Inspection', order: 5 },
  { code: 'warranty', name: 'Warranty', order: 6 },
];

// Default Material Selections (sample data for proj-reno-001)
const defaultMaterialSelections = {
  'proj-reno-001': [
    {
      id: 'sel-001',
      projectId: 'proj-reno-001',
      categoryCode: 'PL',
      subcategoryCode: 'PL-KSK',
      tradeCode: 'PL',
      roomId: 'loc-reno-kit',
      phaseCode: 'installation',
      itemName: 'Kraus Standart PRO Undermount Sink',
      manufacturer: 'Kraus',
      modelNumber: 'KHU100-30',
      color: 'Stainless Steel',
      quantity: 1,
      unitOfMeasurement: 'each',
      costPerUnit: 329,
      allowanceAmount: 300,
      supplier: 'Home Depot',
      supplierUrl: 'https://www.homedepot.com/p/KRAUS-Standart-PRO-30in-16-Gauge-Undermount-Single-Bowl-Stainless-Steel-Kitchen-Sink-KHU100-30/205916636',
      leadTimeDays: 7,
      status: 'selected',
      notes: 'Client prefers deep single bowl for large pots',
      createdAt: '2025-01-15T10:00:00Z',
      updatedAt: '2025-01-20T14:30:00Z',
    },
    {
      id: 'sel-002',
      projectId: 'proj-reno-001',
      categoryCode: 'PL',
      subcategoryCode: 'PL-KFA',
      tradeCode: 'PL',
      roomId: 'loc-reno-kit',
      phaseCode: 'installation',
      itemName: 'Delta Trinsic Pull-Down Kitchen Faucet',
      manufacturer: 'Delta',
      modelNumber: '9159-DST',
      color: 'Matte Black',
      finish: 'Matte',
      quantity: 1,
      unitOfMeasurement: 'each',
      costPerUnit: 445,
      allowanceAmount: 350,
      supplier: 'Ferguson',
      status: 'contractor_approved',
      notes: 'Touch2O technology requested',
      createdAt: '2025-01-15T10:15:00Z',
      updatedAt: '2025-01-22T09:00:00Z',
    },
    {
      id: 'sel-003',
      projectId: 'proj-reno-001',
      categoryCode: 'FL',
      subcategoryCode: 'FL-LVP',
      tradeCode: 'FL',
      roomId: 'loc-reno-kit',
      phaseCode: 'installation',
      itemName: 'LifeProof Sterling Oak LVP',
      manufacturer: 'LifeProof',
      modelNumber: 'I966106L',
      color: 'Sterling Oak',
      size: '7.1" x 47.6"',
      quantity: 180,
      unitOfMeasurement: 'sqft',
      costPerUnit: 3.69,
      allowanceAmount: 600,
      supplier: 'Home Depot',
      status: 'ordered',
      notes: 'Includes 10% waste factor. Kitchen + Dining.',
      createdAt: '2025-01-10T08:00:00Z',
      updatedAt: '2025-01-25T11:00:00Z',
    },
    {
      id: 'sel-004',
      projectId: 'proj-reno-001',
      categoryCode: 'TL',
      subcategoryCode: 'TL-BSP',
      tradeCode: 'TL',
      roomId: 'loc-reno-kit',
      phaseCode: 'finish',
      itemName: 'MSI Arabescato Carrara Subway Tile',
      manufacturer: 'MSI',
      modelNumber: 'TARACAR412',
      color: 'White/Gray',
      size: '4" x 12"',
      quantity: 35,
      unitOfMeasurement: 'sqft',
      costPerUnit: 8.99,
      allowanceAmount: 400,
      supplier: 'Floor & Decor',
      status: 'pending',
      notes: 'Client still deciding between this and a matte white option',
      createdAt: '2025-01-18T14:00:00Z',
      updatedAt: '2025-01-18T14:00:00Z',
    },
    {
      id: 'sel-005',
      projectId: 'proj-reno-001',
      categoryCode: 'EL',
      subcategoryCode: 'EL-REC',
      tradeCode: 'EL',
      roomId: 'loc-reno-kit',
      phaseCode: 'rough_in',
      itemName: 'Halo 6" LED Recessed Light',
      manufacturer: 'Halo',
      modelNumber: 'HLB6099FS1EMWR',
      color: 'White',
      quantity: 8,
      unitOfMeasurement: 'each',
      costPerUnit: 24.97,
      allowanceAmount: 200,
      supplier: 'Home Depot',
      status: 'on_site',
      notes: 'Selectable color temp (2700K-5000K)',
      createdAt: '2025-01-08T09:00:00Z',
      updatedAt: '2025-01-28T16:00:00Z',
    },
    {
      id: 'sel-006',
      projectId: 'proj-reno-001',
      categoryCode: 'PL',
      subcategoryCode: 'PL-TOI',
      tradeCode: 'PL',
      roomId: 'loc-reno-powder',
      phaseCode: 'installation',
      itemName: 'TOTO Drake Two-Piece Toilet',
      manufacturer: 'TOTO',
      modelNumber: 'CST776CEG#01',
      color: 'Cotton White',
      quantity: 1,
      unitOfMeasurement: 'each',
      costPerUnit: 449,
      allowanceAmount: 400,
      supplier: 'Ferguson',
      status: 'researching',
      notes: 'Considering upgraded Washlet seat',
      createdAt: '2025-01-20T11:00:00Z',
      updatedAt: '2025-01-20T11:00:00Z',
    },
  ],
};

// Load and export material selections
export let mockMaterialSelections = loadFromStorage(STORAGE_KEYS.materialSelections, defaultMaterialSelections);

// Save function for Material Selections
export function saveMaterialSelectionsToStorage() {
  try {
    localStorage.setItem(STORAGE_KEYS.materialSelections, JSON.stringify(mockMaterialSelections));
  } catch (e) {
    console.error('Error saving Material Selections to localStorage:', e);
  }
}

// =============================================================================
// FLOOR PLANS MOCK DATA
// =============================================================================

// Status colors for floor plan elements (synced with loop status)
export const FLOOR_PLAN_STATUS_COLORS = {
  not_started: '#9CA3AF',   // Gray
  pending: '#9CA3AF',       // Gray (alias)
  in_progress: '#F59E0B',   // Amber
  active: '#F59E0B',        // Amber (alias)
  blocked: '#EF4444',       // Red
  complete: '#10B981',      // Green
  completed: '#10B981',     // Green (alias)
  verified: '#3B82F6',      // Blue
};

// Element type defaults
export const ELEMENT_TYPE_DEFAULTS = {
  wall: { strokeWidth: 8, color: '#374151' },
  window: { strokeWidth: 4, color: '#60A5FA' },
  door: { strokeWidth: 4, color: '#A78BFA' },
  beam: { strokeWidth: 6, color: '#F97316' },
  zone: { strokeWidth: 2, color: '#E5E7EB' },
  fixture: { strokeWidth: 3, color: '#14B8A6' },
  outlet: { strokeWidth: 2, color: '#FBBF24' },
  switch: { strokeWidth: 2, color: '#FBBF24' },
  hvac: { strokeWidth: 3, color: '#8B5CF6' },
  custom: { strokeWidth: 4, color: '#6B7280' },
};

// Trade category colors
export const TRADE_COLORS = {
  framing: '#92400E',
  electrical: '#FBBF24',
  plumbing: '#3B82F6',
  hvac: '#8B5CF6',
  drywall: '#9CA3AF',
  insulation: '#EC4899',
  roofing: '#064E3B',
  flooring: '#78350F',
  trim: '#7C3AED',
  paint: '#DB2777',
  general: '#6B7280',
};

// Default floor plans - sample data for multiple projects
const defaultFloorPlans = {
  'proj-reno-001': [
    {
      id: 'fp-reno-main',
      projectId: 'proj-reno-001',
      name: 'Main Floor',
      svgViewbox: '0 0 800 600',
      backgroundImageUrl: null,
      widthFeet: 40,
      heightFeet: 30,
      floorNumber: 1,
      isActive: true,
      createdAt: '2025-01-10T10:00:00Z',
      updatedAt: '2025-01-10T10:00:00Z',
    },
    {
      id: 'fp-reno-basement',
      projectId: 'proj-reno-001',
      name: 'Basement',
      svgViewbox: '0 0 800 600',
      backgroundImageUrl: null,
      widthFeet: 40,
      heightFeet: 30,
      floorNumber: 0,
      isActive: true,
      createdAt: '2025-01-10T10:00:00Z',
      updatedAt: '2025-01-10T10:00:00Z',
    },
  ],
  'proj-nc-001': [
    {
      id: 'fp-nc-first',
      projectId: 'proj-nc-001',
      name: 'First Floor',
      svgViewbox: '0 0 1000 800',
      backgroundImageUrl: null,
      widthFeet: 50,
      heightFeet: 40,
      floorNumber: 1,
      isActive: true,
      createdAt: '2025-01-05T10:00:00Z',
      updatedAt: '2025-01-05T10:00:00Z',
    },
    {
      id: 'fp-nc-second',
      projectId: 'proj-nc-001',
      name: 'Second Floor',
      svgViewbox: '0 0 1000 800',
      backgroundImageUrl: null,
      widthFeet: 50,
      heightFeet: 40,
      floorNumber: 2,
      isActive: true,
      createdAt: '2025-01-05T10:00:00Z',
      updatedAt: '2025-01-05T10:00:00Z',
    },
  ],
  'proj-estimate-001': [
    {
      id: 'fp-estimate-main',
      projectId: 'proj-estimate-001',
      name: 'Main Floor',
      svgViewbox: '0 0 800 600',
      backgroundImageUrl: null,
      widthFeet: 35,
      heightFeet: 28,
      floorNumber: 1,
      isActive: true,
      createdAt: '2025-01-08T10:00:00Z',
      updatedAt: '2025-01-08T10:00:00Z',
    },
  ],
};

// Default floor plan elements - sample elements for main floor
const defaultFloorPlanElements = {
  'fp-reno-main': [
    {
      id: 'elem-001',
      floorPlanId: 'fp-reno-main',
      loopId: null,
      elementType: 'wall',
      label: 'North Wall - Kitchen',
      tradeCategory: 'framing',
      svgType: 'line',
      svgData: { x1: 100, y1: 100, x2: 400, y2: 100 },
      strokeWidth: 8,
      defaultColor: '#374151',
      zIndex: 1,
      notes: 'Load-bearing wall',
      specs: { length: '15ft', material: '2x6 SPF' },
      createdAt: '2025-01-10T10:00:00Z',
      updatedAt: '2025-01-10T10:00:00Z',
    },
    {
      id: 'elem-002',
      floorPlanId: 'fp-reno-main',
      loopId: null,
      elementType: 'wall',
      label: 'East Wall - Kitchen',
      tradeCategory: 'framing',
      svgType: 'line',
      svgData: { x1: 400, y1: 100, x2: 400, y2: 300 },
      strokeWidth: 8,
      defaultColor: '#374151',
      zIndex: 1,
      notes: null,
      specs: { length: '10ft', material: '2x4 SPF' },
      createdAt: '2025-01-10T10:00:00Z',
      updatedAt: '2025-01-10T10:00:00Z',
    },
    {
      id: 'elem-003',
      floorPlanId: 'fp-reno-main',
      loopId: null,
      elementType: 'window',
      label: 'Kitchen Window',
      tradeCategory: 'framing',
      svgType: 'rect',
      svgData: { x: 180, y: 95, width: 60, height: 10 },
      strokeWidth: 4,
      defaultColor: '#60A5FA',
      zIndex: 2,
      notes: null,
      specs: { width: '3ft', height: '4ft', type: 'casement' },
      createdAt: '2025-01-10T10:00:00Z',
      updatedAt: '2025-01-10T10:00:00Z',
    },
    {
      id: 'elem-004',
      floorPlanId: 'fp-reno-main',
      loopId: null,
      elementType: 'door',
      label: 'Kitchen Entry',
      tradeCategory: 'framing',
      svgType: 'rect',
      svgData: { x: 300, y: 295, width: 40, height: 10 },
      strokeWidth: 4,
      defaultColor: '#A78BFA',
      zIndex: 2,
      notes: null,
      specs: { width: '32in', type: 'interior', swing: 'left-in' },
      createdAt: '2025-01-10T10:00:00Z',
      updatedAt: '2025-01-10T10:00:00Z',
    },
    {
      id: 'elem-005',
      floorPlanId: 'fp-reno-main',
      loopId: null,
      elementType: 'zone',
      label: 'Kitchen Area',
      tradeCategory: null,
      svgType: 'rect',
      svgData: { x: 100, y: 100, width: 300, height: 200 },
      strokeWidth: 2,
      defaultColor: '#E5E7EB',
      zIndex: 0,
      notes: 'Main kitchen work area',
      specs: { area: '150 SF' },
      createdAt: '2025-01-10T10:00:00Z',
      updatedAt: '2025-01-10T10:00:00Z',
    },
    {
      id: 'elem-006',
      floorPlanId: 'fp-reno-main',
      loopId: null,
      elementType: 'outlet',
      label: 'Counter Outlet 1',
      tradeCategory: 'electrical',
      svgType: 'circle',
      svgData: { cx: 150, cy: 150, r: 8 },
      strokeWidth: 2,
      defaultColor: '#FBBF24',
      zIndex: 3,
      notes: '20A dedicated circuit',
      specs: { circuit: '20A', type: 'GFCI' },
      createdAt: '2025-01-10T10:00:00Z',
      updatedAt: '2025-01-10T10:00:00Z',
    },
    {
      id: 'elem-007',
      floorPlanId: 'fp-reno-main',
      loopId: null,
      elementType: 'fixture',
      label: 'Kitchen Sink',
      tradeCategory: 'plumbing',
      svgType: 'rect',
      svgData: { x: 120, y: 110, width: 40, height: 25 },
      strokeWidth: 3,
      defaultColor: '#14B8A6',
      zIndex: 3,
      notes: 'Undermount stainless',
      specs: { type: 'undermount', size: '32x18' },
      createdAt: '2025-01-10T10:00:00Z',
      updatedAt: '2025-01-10T10:00:00Z',
    },
  ],
  'fp-reno-basement': [],
  'fp-nc-first': [
    // Walls linked to Framing loop (active - 65% progress)
    {
      id: 'elem-nc-001',
      floorPlanId: 'fp-nc-first',
      loopId: 'loop-nc-002', // Framing - active
      elementType: 'wall',
      label: 'Front Wall',
      tradeCategory: 'framing',
      svgType: 'line',
      svgData: { x1: 50, y1: 50, x2: 500, y2: 50 },
      strokeWidth: 10,
      defaultColor: '#374151',
      zIndex: 1,
      notes: 'Exterior wall - COMPLETED',
      specs: { length: '45ft', material: '2x6 SPF' },
      createdAt: '2025-01-05T10:00:00Z',
      updatedAt: '2025-01-05T10:00:00Z',
    },
    {
      id: 'elem-nc-002',
      floorPlanId: 'fp-nc-first',
      loopId: 'loop-nc-002', // Framing - active
      elementType: 'wall',
      label: 'Left Wall',
      tradeCategory: 'framing',
      svgType: 'line',
      svgData: { x1: 50, y1: 50, x2: 50, y2: 400 },
      strokeWidth: 10,
      defaultColor: '#374151',
      zIndex: 1,
      notes: 'Exterior wall - COMPLETED',
      specs: { length: '35ft', material: '2x6 SPF' },
      createdAt: '2025-01-05T10:00:00Z',
      updatedAt: '2025-01-05T10:00:00Z',
    },
    {
      id: 'elem-nc-003',
      floorPlanId: 'fp-nc-first',
      loopId: 'loop-nc-002', // Framing - active
      elementType: 'wall',
      label: 'Right Wall',
      tradeCategory: 'framing',
      svgType: 'line',
      svgData: { x1: 500, y1: 50, x2: 500, y2: 400 },
      strokeWidth: 10,
      defaultColor: '#374151',
      zIndex: 1,
      notes: 'Exterior wall - COMPLETED',
      specs: { length: '35ft', material: '2x6 SPF' },
      createdAt: '2025-01-05T10:00:00Z',
      updatedAt: '2025-01-05T10:00:00Z',
    },
    {
      id: 'elem-nc-004',
      floorPlanId: 'fp-nc-first',
      loopId: 'loop-nc-002', // Framing - active
      elementType: 'wall',
      label: 'Back Wall',
      tradeCategory: 'framing',
      svgType: 'line',
      svgData: { x1: 50, y1: 400, x2: 500, y2: 400 },
      strokeWidth: 10,
      defaultColor: '#374151',
      zIndex: 1,
      notes: 'Exterior wall - COMPLETED',
      specs: { length: '45ft', material: '2x6 SPF' },
      createdAt: '2025-01-05T10:00:00Z',
      updatedAt: '2025-01-05T10:00:00Z',
    },
    // Interior partition - linked to Insulation & Drywall (pending)
    {
      id: 'elem-nc-004b',
      floorPlanId: 'fp-nc-first',
      loopId: 'loop-nc-005', // Insulation & Drywall - pending
      elementType: 'wall',
      label: 'Kitchen/Living Partition',
      tradeCategory: 'framing',
      svgType: 'line',
      svgData: { x1: 270, y1: 50, x2: 270, y2: 230 },
      strokeWidth: 6,
      defaultColor: '#9CA3AF',
      zIndex: 1,
      notes: 'Partial wall with pass-through - NOT STARTED',
      specs: { length: '18ft', material: '2x4 SPF' },
      createdAt: '2025-01-05T10:00:00Z',
      updatedAt: '2025-01-05T10:00:00Z',
    },
    // Living Room zone - linked to completed foundation
    {
      id: 'elem-nc-005',
      floorPlanId: 'fp-nc-first',
      loopId: 'loop-nc-001', // Site Prep & Foundation - completed
      elementType: 'zone',
      label: 'Living Room',
      tradeCategory: null,
      svgType: 'rect',
      svgData: { x: 50, y: 50, width: 220, height: 180 },
      strokeWidth: 2,
      defaultColor: '#DBEAFE',
      zIndex: 0,
      notes: 'Open concept living area - FOUNDATION COMPLETE',
      specs: { area: '400 SF' },
      createdAt: '2025-01-05T10:00:00Z',
      updatedAt: '2025-01-05T10:00:00Z',
    },
    // Kitchen zone - linked to Kitchen loop (pending)
    {
      id: 'elem-nc-006',
      floorPlanId: 'fp-nc-first',
      loopId: 'loop-nc-006', // Kitchen - pending
      elementType: 'zone',
      label: 'Kitchen',
      tradeCategory: null,
      svgType: 'rect',
      svgData: { x: 280, y: 50, width: 220, height: 180 },
      strokeWidth: 2,
      defaultColor: '#FEF3C7',
      zIndex: 0,
      notes: 'Kitchen with island - NOT STARTED',
      specs: { area: '400 SF' },
      createdAt: '2025-01-05T10:00:00Z',
      updatedAt: '2025-01-05T10:00:00Z',
    },
    // Front door - linked to Exterior Envelope (active - 20%)
    {
      id: 'elem-nc-007',
      floorPlanId: 'fp-nc-first',
      loopId: 'loop-nc-003', // Exterior Envelope - active
      elementType: 'door',
      label: 'Front Entry',
      tradeCategory: 'framing',
      svgType: 'rect',
      svgData: { x: 120, y: 45, width: 50, height: 10 },
      strokeWidth: 4,
      defaultColor: '#A78BFA',
      zIndex: 2,
      notes: 'Main entry door - IN PROGRESS',
      specs: { width: '36in', type: 'exterior', swing: 'in' },
      createdAt: '2025-01-05T10:00:00Z',
      updatedAt: '2025-01-05T10:00:00Z',
    },
    // Windows - linked to Exterior Envelope (active)
    {
      id: 'elem-nc-008',
      floorPlanId: 'fp-nc-first',
      loopId: 'loop-nc-003', // Exterior Envelope - active
      elementType: 'window',
      label: 'Living Room Window',
      tradeCategory: 'framing',
      svgType: 'rect',
      svgData: { x: 45, y: 120, width: 10, height: 60 },
      strokeWidth: 4,
      defaultColor: '#60A5FA',
      zIndex: 2,
      notes: 'Large picture window - PENDING INSTALL',
      specs: { width: '6ft', height: '5ft', type: 'fixed' },
      createdAt: '2025-01-05T10:00:00Z',
      updatedAt: '2025-01-05T10:00:00Z',
    },
    // Electrical outlets - linked to Rough-In MEP (pending)
    {
      id: 'elem-nc-009',
      floorPlanId: 'fp-nc-first',
      loopId: 'loop-nc-004', // Rough-In MEP - pending
      elementType: 'outlet',
      label: 'Living Room Outlet 1',
      tradeCategory: 'electrical',
      svgType: 'circle',
      svgData: { cx: 80, cy: 200, r: 8 },
      strokeWidth: 2,
      defaultColor: '#FBBF24',
      zIndex: 3,
      notes: 'Standard duplex - NOT STARTED',
      specs: { circuit: '15A', type: 'duplex' },
      createdAt: '2025-01-05T10:00:00Z',
      updatedAt: '2025-01-05T10:00:00Z',
    },
    {
      id: 'elem-nc-010',
      floorPlanId: 'fp-nc-first',
      loopId: 'loop-nc-004', // Rough-In MEP - pending
      elementType: 'outlet',
      label: 'Kitchen Counter Outlet',
      tradeCategory: 'electrical',
      svgType: 'circle',
      svgData: { cx: 350, cy: 80, r: 8 },
      strokeWidth: 2,
      defaultColor: '#FBBF24',
      zIndex: 3,
      notes: 'GFCI required - NOT STARTED',
      specs: { circuit: '20A', type: 'GFCI' },
      createdAt: '2025-01-05T10:00:00Z',
      updatedAt: '2025-01-05T10:00:00Z',
    },
    // Unlinked element (no loop)
    {
      id: 'elem-nc-011',
      floorPlanId: 'fp-nc-first',
      loopId: null,
      elementType: 'fixture',
      label: 'Future Island Location',
      tradeCategory: null,
      svgType: 'rect',
      svgData: { x: 340, y: 120, width: 80, height: 50 },
      strokeWidth: 2,
      defaultColor: '#E5E7EB',
      zIndex: 1,
      notes: 'Kitchen island - not yet assigned to any loop',
      specs: { size: '4x3 ft' },
      createdAt: '2025-01-05T10:00:00Z',
      updatedAt: '2025-01-05T10:00:00Z',
    },
  ],
  'fp-nc-second': [
    // Simple outline for second floor
    {
      id: 'elem-nc2-001',
      floorPlanId: 'fp-nc-second',
      loopId: null,
      elementType: 'zone',
      label: 'Master Bedroom',
      tradeCategory: null,
      svgType: 'rect',
      svgData: { x: 50, y: 50, width: 200, height: 180 },
      strokeWidth: 2,
      defaultColor: '#E0E7FF',
      zIndex: 0,
      notes: 'Primary suite',
      specs: { area: '360 SF' },
      createdAt: '2025-01-05T10:00:00Z',
      updatedAt: '2025-01-05T10:00:00Z',
    },
    {
      id: 'elem-nc2-002',
      floorPlanId: 'fp-nc-second',
      loopId: null,
      elementType: 'zone',
      label: 'Bedroom 2',
      tradeCategory: null,
      svgType: 'rect',
      svgData: { x: 300, y: 50, width: 150, height: 140 },
      strokeWidth: 2,
      defaultColor: '#FCE7F3',
      zIndex: 0,
      notes: null,
      specs: { area: '210 SF' },
      createdAt: '2025-01-05T10:00:00Z',
      updatedAt: '2025-01-05T10:00:00Z',
    },
  ],
  'fp-estimate-main': [
    // Simple bathroom layout
    {
      id: 'elem-est-001',
      floorPlanId: 'fp-estimate-main',
      loopId: null,
      elementType: 'zone',
      label: 'Bathroom',
      tradeCategory: null,
      svgType: 'rect',
      svgData: { x: 100, y: 100, width: 200, height: 150 },
      strokeWidth: 2,
      defaultColor: '#CCFBF1',
      zIndex: 0,
      notes: 'Master bath renovation',
      specs: { area: '100 SF' },
      createdAt: '2025-01-08T10:00:00Z',
      updatedAt: '2025-01-08T10:00:00Z',
    },
    {
      id: 'elem-est-002',
      floorPlanId: 'fp-estimate-main',
      loopId: null,
      elementType: 'fixture',
      label: 'Bathtub',
      tradeCategory: 'plumbing',
      svgType: 'rect',
      svgData: { x: 110, y: 110, width: 80, height: 50 },
      strokeWidth: 3,
      defaultColor: '#14B8A6',
      zIndex: 1,
      notes: 'Freestanding soaking tub',
      specs: { size: '60x32', type: 'freestanding' },
      createdAt: '2025-01-08T10:00:00Z',
      updatedAt: '2025-01-08T10:00:00Z',
    },
    {
      id: 'elem-est-003',
      floorPlanId: 'fp-estimate-main',
      loopId: null,
      elementType: 'fixture',
      label: 'Vanity',
      tradeCategory: 'plumbing',
      svgType: 'rect',
      svgData: { x: 200, y: 110, width: 90, height: 30 },
      strokeWidth: 3,
      defaultColor: '#14B8A6',
      zIndex: 1,
      notes: 'Double vanity',
      specs: { size: '60in', sinks: '2' },
      createdAt: '2025-01-08T10:00:00Z',
      updatedAt: '2025-01-08T10:00:00Z',
    },
  ],
};

// Load and export floor plans
export let mockFloorPlans = loadFromStorage(STORAGE_KEYS.floorPlans, defaultFloorPlans);
export let mockFloorPlanElements = loadFromStorage(STORAGE_KEYS.floorPlanElements, defaultFloorPlanElements);

// Save functions for Floor Plans
export function saveFloorPlansToStorage() {
  try {
    localStorage.setItem(STORAGE_KEYS.floorPlans, JSON.stringify(mockFloorPlans));
  } catch (e) {
    console.error('Error saving Floor Plans to localStorage:', e);
  }
}

export function saveFloorPlanElementsToStorage() {
  try {
    localStorage.setItem(STORAGE_KEYS.floorPlanElements, JSON.stringify(mockFloorPlanElements));
  } catch (e) {
    console.error('Error saving Floor Plan Elements to localStorage:', e);
  }
}
