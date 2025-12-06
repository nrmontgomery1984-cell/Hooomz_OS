/**
 * HOOOMZ Intake Schema
 *
 * Defines the structure for customer intake forms.
 * Intake data becomes the seed for Projects, Loops, and Tasks.
 *
 * Project Phases: intake → estimate → contract → active → complete
 */

// ============================================================================
// PROJECT PHASES & STATUS
// ============================================================================

export const PROJECT_PHASES = {
  INTAKE: 'intake',       // Customer filling out form
  ESTIMATE: 'estimate',   // Builder pricing and scope review
  CONTRACT: 'contract',   // Scope locked, awaiting signature
  ACTIVE: 'active',       // Work in progress
  COMPLETE: 'complete',   // Project finished
  CANCELLED: 'cancelled', // Project cancelled
};

// ============================================================================
// BUILD TIERS
// ============================================================================

export const BUILD_TIERS = {
  GOOD: 'good',
  BETTER: 'better',
  BEST: 'best',
};

export const BUILD_TIER_OPTIONS = [
  { value: 'good', label: 'Good', description: 'Quality construction, budget-conscious selections' },
  { value: 'better', label: 'Better', description: 'Enhanced finishes and materials' },
  { value: 'best', label: 'Best', description: 'Premium specifications throughout' },
];

// ============================================================================
// RENO TIERS (for renovation scope)
// ============================================================================

export const RENO_TIERS = {
  REFRESH: 'refresh',   // Cosmetic update, keep layout
  FULL_RENO: 'full',    // Gut to studs, new everything
};

export const RENO_TIER_OPTIONS = [
  { value: 'refresh', label: 'Refresh', description: 'Cosmetic updates, keep existing layout' },
  { value: 'full', label: 'Full Renovation', description: 'Gut to studs, complete rebuild' },
];

// ============================================================================
// COMMON SELECT OPTIONS
// ============================================================================

export const BUDGET_RANGES_NEW = [
  { value: 'undecided', label: 'Undecided' },
  { value: 'under_400k', label: 'Under $400k' },
  { value: '400_600k', label: '$400k - $600k' },
  { value: '600_800k', label: '$600k - $800k' },
  { value: '800k_1m', label: '$800k - $1M' },
  { value: 'over_1m', label: 'Over $1M' },
];

export const BUDGET_RANGES_RENO = [
  { value: 'undecided', label: 'Undecided' },
  { value: 'under_50k', label: 'Under $50k' },
  { value: '50_100k', label: '$50k - $100k' },
  { value: '100_200k', label: '$100k - $200k' },
  { value: '200_400k', label: '$200k - $400k' },
  { value: 'over_400k', label: 'Over $400k' },
];

export const CONTACT_METHODS = [
  { value: 'text', label: 'Text Message' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone Call' },
];

export const PRIORITY_OPTIONS = [
  { value: 'energy_efficiency', label: 'Energy Efficiency' },
  { value: 'affordability', label: 'Upfront Affordability' },
  { value: 'low_maintenance', label: 'Low Maintenance' },
  { value: 'durability', label: 'Durability' },
  { value: 'aesthetics', label: 'Aesthetics' },
  { value: 'resale_value', label: 'Resale Value' },
];

// ============================================================================
// ROOM/AREA TYPES (for renovation scoping)
// ============================================================================

export const ROOM_TYPES = [
  { value: 'kitchen', label: 'Kitchen', category: 'CM' },
  { value: 'primary_bath', label: 'Primary Bathroom', category: 'PL' },
  { value: 'secondary_bath', label: 'Secondary Bathroom(s)', category: 'PL' },
  { value: 'powder_room', label: 'Powder Room', category: 'PL' },
  { value: 'living_room', label: 'Living Room', category: 'FC' },
  { value: 'dining_room', label: 'Dining Room', category: 'FC' },
  { value: 'bedrooms', label: 'Bedrooms', category: 'FC' },
  { value: 'basement', label: 'Basement', category: 'FI' },
  { value: 'laundry', label: 'Laundry Room', category: 'PL' },
  { value: 'mudroom', label: 'Mudroom/Entry', category: 'FC' },
  { value: 'home_office', label: 'Home Office', category: 'FC' },
  { value: 'garage', label: 'Garage', category: 'GN' },
  { value: 'exterior', label: 'Exterior/Siding', category: 'EE' },
  { value: 'windows_doors', label: 'Windows & Doors', category: 'EE' },
  { value: 'roofing', label: 'Roofing', category: 'RF' },
  { value: 'addition', label: 'Addition', category: 'FS' },
];

// ============================================================================
// SITE & LOT CONDITIONS (New Construction)
// ============================================================================

export const WATER_SUPPLY_OPTIONS = [
  { value: 'municipal', label: 'Municipal Water' },
  { value: 'well_existing', label: 'Drilled Well (Existing)' },
  { value: 'well_new', label: 'Drilled Well (New Required)' },
  { value: 'dug_well', label: 'Dug Well' },
  { value: 'unknown', label: 'Unknown' },
];

export const SEWAGE_OPTIONS = [
  { value: 'municipal', label: 'Municipal Sewer' },
  { value: 'septic_existing', label: 'Septic (Existing)' },
  { value: 'septic_new', label: 'Septic (New Required)' },
  { value: 'holding_tank', label: 'Holding Tank' },
  { value: 'unknown', label: 'Unknown' },
];

export const FOUNDATION_TYPES = [
  { value: 'full_basement', label: 'Full Basement' },
  { value: 'walkout_basement', label: 'Walk-out Basement' },
  { value: 'crawlspace', label: 'Crawl Space' },
  { value: 'slab', label: 'Slab-on-Grade' },
  { value: 'undecided', label: 'Undecided' },
];

// ============================================================================
// HOME SIZE & LAYOUT OPTIONS
// ============================================================================

export const SQFT_RANGES = [
  { value: 'under_1200', label: 'Under 1,200 sq ft' },
  { value: '1200_1600', label: '1,200 - 1,600 sq ft' },
  { value: '1600_2000', label: '1,600 - 2,000 sq ft' },
  { value: '2000_2400', label: '2,000 - 2,400 sq ft' },
  { value: '2400_3000', label: '2,400 - 3,000 sq ft' },
  { value: 'over_3000', label: 'Over 3,000 sq ft' },
];

export const STOREY_OPTIONS = [
  { value: '1', label: '1 Storey (Bungalow)' },
  { value: '1.5', label: '1.5 Storey' },
  { value: '2', label: '2 Storey' },
  { value: '3', label: '3 Storey' },
];

export const BEDROOM_OPTIONS = [
  { value: '2', label: '2 Bedrooms' },
  { value: '3', label: '3 Bedrooms' },
  { value: '4', label: '4 Bedrooms' },
  { value: '5+', label: '5+ Bedrooms' },
];

export const BATHROOM_OPTIONS = [
  { value: '1', label: '1 Full Bath' },
  { value: '2', label: '2 Full Baths' },
  { value: '3', label: '3 Full Baths' },
  { value: '4', label: '4 Full Baths' },
];

export const GARAGE_OPTIONS = [
  { value: 'none', label: 'No Garage' },
  { value: 'single', label: 'Single Garage' },
  { value: 'double', label: 'Double Garage' },
  { value: 'triple', label: 'Triple Garage' },
];

// ============================================================================
// INTAKE FORM STEP DEFINITIONS
// ============================================================================

export const NEW_CONSTRUCTION_STEPS = [
  { id: 'contact', title: 'Contact Info', description: 'Your information' },
  { id: 'project', title: 'Project Details', description: 'Timeline & budget' },
  { id: 'site', title: 'Site Conditions', description: 'Lot & utilities' },
  { id: 'layout', title: 'Home Layout', description: 'Size & rooms' },
  { id: 'exterior', title: 'Exterior', description: 'Materials & style' },
  { id: 'interior', title: 'Interior', description: 'Finishes & flooring' },
  { id: 'kitchen', title: 'Kitchen', description: 'Cabinets & counters' },
  { id: 'bathrooms', title: 'Bathrooms', description: 'Fixtures & tile' },
  { id: 'mechanical', title: 'Mechanical', description: 'HVAC & electrical' },
  { id: 'features', title: 'Features', description: 'Special requests' },
  { id: 'notes', title: 'Notes', description: 'Must-haves & inspiration' },
];

export const RENOVATION_STEPS = [
  { id: 'contact', title: 'Contact Info', description: 'Your information' },
  { id: 'property', title: 'Property Details', description: 'Home info & timeline' },
  { id: 'scope', title: 'Scope of Work', description: 'Areas to renovate' },
  { id: 'room_tiers', title: 'Room Details', description: 'Refresh vs full reno' },
  { id: 'conditions', title: 'Existing Conditions', description: 'Known issues' },
  { id: 'systems', title: 'Existing Systems', description: 'MEP & structure' },
  { id: 'selections', title: 'Selections', description: 'Materials & finishes' },
  { id: 'logistics', title: 'Logistics', description: 'Access & occupancy' },
  { id: 'notes', title: 'Notes', description: 'Must-haves & pain points' },
];

// ============================================================================
// DEFAULT INTAKE FORM STATE
// ============================================================================

export const getDefaultIntakeState = (type = 'new_construction') => ({
  // Form metadata
  form_type: type, // 'new_construction' | 'renovation'
  current_step: 0,
  completed_steps: [],

  // Contact info
  contact: {
    full_name: '',
    email: '',
    phone: '',
    preferred_contact: 'email',
    primary_decision_maker: 'both',
  },

  // Project basics
  project: {
    address: '',
    lot_purchased: 'still_looking', // new construction only
    desired_start_month: '',
    target_completion_month: '',
    budget_range: 'undecided',
    build_tier: 'better',
    priorities: [], // max 3
  },

  // Site conditions (new construction)
  site: {
    water_supply: 'unknown',
    sewage_system: 'unknown',
    power_to_lot: 'unknown',
    road_access: 'paved_municipal',
    lot_cleared: 'no',
    foundation_type: 'undecided',
  },

  // Home layout
  layout: {
    sqft_range: '1600_2000',
    storeys: '1',
    basement_finish: 'unfinished',
    bedrooms: '3',
    primary_ensuite: true,
    full_bathrooms: '2',
    half_bathrooms: '1',
    garage_size: 'double',
    garage_type: 'attached',
    laundry_location: 'main_floor',
    outdoor_spaces: [],
  },

  // Renovation-specific
  renovation: {
    home_age: 'unknown',
    home_style: 'unknown',
    current_sqft: 'unknown',
    selected_rooms: [],
    room_tiers: {}, // { kitchen: 'full', primary_bath: 'refresh', ... }
    addition_sqft: null,
    structural_changes: [],
    known_issues: [],
    occupancy_during: 'undecided',
  },

  // Selections (shared between new & reno)
  // Start empty - defaults are applied based on build_tier in SelectionsStep
  selections: {
    exterior: {},
    interior: {},
    kitchen: {},
    bathrooms: {},
    mechanical: {},
  },

  // Special features
  features: [],

  // Notes
  notes: {
    must_haves: ['', '', ''],
    pain_points: ['', '', ''], // renovation only
    inspiration_urls: [],
    style_notes: '',
    additional_notes: '',
  },
});

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export function validateStep(stepId, data) {
  const errors = {};

  switch (stepId) {
    case 'contact':
      if (!data.contact?.full_name?.trim()) errors.full_name = 'Name is required';
      if (!data.contact?.email?.trim()) errors.email = 'Email is required';
      if (!data.contact?.phone?.trim()) errors.phone = 'Phone is required';
      break;
    case 'project':
      if (!data.project?.address?.trim()) errors.address = 'Address is required';
      break;
    // Add more validation as needed
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}
