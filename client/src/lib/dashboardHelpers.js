/**
 * Dashboard Helper Functions
 *
 * Data transformations and utilities for the project dashboard.
 */

import { calculateHealthStatus, generateAlerts } from './alertRules';

/**
 * Calculate days between two dates
 * @param {string|Date} date1
 * @param {string|Date} date2
 * @returns {number}
 */
export function daysBetween(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculate days since a date (from today)
 * @param {string|Date} date
 * @returns {number}
 */
export function daysSince(date) {
  return daysBetween(date, new Date());
}

/**
 * Calculate days until a date (from today)
 * @param {string|Date} date
 * @returns {number} Negative if in the past
 */
export function daysUntil(date) {
  const target = new Date(date);
  const today = new Date();
  const diffTime = target - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Format currency
 * @param {number} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format percentage
 * @param {number} value - Decimal value (0.85 = 85%)
 * @returns {string}
 */
export function formatPercent(value) {
  return `${Math.round(value * 100)}%`;
}

/**
 * Generate a project name from intake data
 * @param {Object} intake - Intake form data
 * @returns {string}
 */
export function generateProjectName(intake) {
  const clientName = intake.contact?.full_name?.split(' ')[0] || 'New';

  if (intake.form_type === 'new_construction') {
    return `${clientName} - New Home Build`;
  }

  // For renovation, use primary room(s)
  const rooms = intake.renovation?.selected_rooms || [];
  if (rooms.length === 1) {
    const room = formatRoomName(rooms[0]);
    return `${clientName} ${room} Reno`;
  }
  if (rooms.length <= 3) {
    const roomNames = rooms.slice(0, 2).map(formatRoomName).join(' & ');
    return `${clientName} ${roomNames} Reno`;
  }

  return `${clientName} Whole-House Reno`;
}

/**
 * Format room key to display name
 * @param {string} roomKey
 * @returns {string}
 */
export function formatRoomName(roomKey) {
  const roomNames = {
    kitchen: 'Kitchen',
    primary_bath: 'Primary Bath',
    secondary_bath: 'Secondary Bath',
    powder_room: 'Powder Room',
    basement: 'Basement',
    living_room: 'Living Room',
    dining_room: 'Dining Room',
    primary_bedroom: 'Primary Bedroom',
    bedroom: 'Bedroom',
    laundry: 'Laundry',
    mudroom: 'Mudroom',
    garage: 'Garage',
    office: 'Office',
    exterior: 'Exterior',
  };
  return roomNames[roomKey] || roomKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Generate default phases for a project based on type
 * @param {Object} intake - Intake form data
 * @returns {Array}
 */
export function generateDefaultPhases(intake) {
  // Note: startDate/endDate could be used for date calculations in future
  // const startDate = intake.project?.desired_start_month || intake.timeline?.start_date;
  // const endDate = intake.project?.target_completion_month || intake.timeline?.completion_date;

  if (intake.form_type === 'new_construction') {
    return [
      { name: 'Site Prep', status: 'upcoming', percentComplete: 0 },
      { name: 'Foundation', status: 'upcoming', percentComplete: 0 },
      { name: 'Framing', status: 'upcoming', percentComplete: 0 },
      { name: 'Rough-In', status: 'upcoming', percentComplete: 0 },
      { name: 'Exterior', status: 'upcoming', percentComplete: 0 },
      { name: 'Insulation & Drywall', status: 'upcoming', percentComplete: 0 },
      { name: 'Interior Finish', status: 'upcoming', percentComplete: 0 },
      { name: 'Final', status: 'upcoming', percentComplete: 0 },
    ];
  }

  // Renovation phases
  return [
    { name: 'Demo', status: 'upcoming', percentComplete: 0 },
    { name: 'Rough-In', status: 'upcoming', percentComplete: 0 },
    { name: 'Drywall', status: 'upcoming', percentComplete: 0 },
    { name: 'Finish', status: 'upcoming', percentComplete: 0 },
    { name: 'Punch List', status: 'upcoming', percentComplete: 0 },
  ];
}

/**
 * Generate initial action items for a new project
 * @param {Object} intake - Intake form data
 * @returns {Array}
 */
export function generateInitialActions(intake) {
  const actions = [
    {
      id: 'action-site-visit',
      title: 'Schedule site visit',
      category: 'scheduling',
      priority: 'high',
      dueDate: addDays(new Date(), 3).toISOString(),
      assignedTo: 'Project Lead',
    },
    {
      id: 'action-review-intake',
      title: 'Review intake form details',
      category: 'admin',
      priority: 'high',
      dueDate: addDays(new Date(), 1).toISOString(),
      assignedTo: 'Project Lead',
    },
    {
      id: 'action-prepare-estimate',
      title: 'Prepare detailed estimate',
      category: 'estimating',
      priority: 'medium',
      dueDate: addDays(new Date(), 7).toISOString(),
      assignedTo: 'Estimator',
    },
  ];

  // Add selection-specific actions
  const selections = intake.selections || {};

  // Check for undecided items
  Object.entries(selections).forEach(([category, items]) => {
    Object.entries(items || {}).forEach(([item, value]) => {
      if (value === 'undecided' || value === 'unknown') {
        actions.push({
          id: `action-decision-${category}-${item}`,
          title: `Get ${formatRoomName(item)} selection from client`,
          category: 'decisions',
          priority: 'medium',
          dueDate: addDays(new Date(), 5).toISOString(),
          assignedTo: 'Project Lead',
        });
      }
    });
  });

  // Renovation-specific checks
  if (intake.renovation) {
    // Check for hazardous materials
    if (intake.renovation.home_age === 'pre_1980' || intake.renovation.home_age === '1980_1990') {
      actions.push({
        id: 'action-hazmat-test',
        title: 'Schedule asbestos/lead testing',
        category: 'safety',
        priority: 'high',
        dueDate: addDays(new Date(), 5).toISOString(),
        assignedTo: 'Project Lead',
      });
    }

    // Check electrical panel
    if (intake.renovation.electrical_panel === 'fuse' || intake.renovation.electrical_service === '60_amp') {
      actions.push({
        id: 'action-electrical-assess',
        title: 'Assess electrical upgrade requirements',
        category: 'estimating',
        priority: 'medium',
        dueDate: addDays(new Date(), 7).toISOString(),
        assignedTo: 'Electrician',
      });
    }

    // Check plumbing
    if (intake.renovation.plumbing_type === 'galvanized') {
      actions.push({
        id: 'action-plumbing-assess',
        title: 'Assess plumbing replacement scope',
        category: 'estimating',
        priority: 'medium',
        dueDate: addDays(new Date(), 7).toISOString(),
        assignedTo: 'Plumber',
      });
    }
  }

  return actions;
}

/**
 * Add days to a date
 * @param {Date} date
 * @param {number} days
 * @returns {Date}
 */
export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Normalize phase names to match PROJECT_PHASES ids
 * Maps various phase name formats to canonical phase ids
 */
const PHASE_ALIASES = {
  estimate: 'estimating',
  contract: 'contracted',
  quote: 'quoted',
  // Add more aliases as needed
};

function normalizePhase(phase) {
  return PHASE_ALIASES[phase] || phase;
}

/**
 * Transform intake data into dashboard data structure
 * @param {Object} project - Project with intake_data
 * @returns {Object} DashboardData
 */
export function createDashboardFromProject(project) {
  const intake = project.intake_data || {};
  const dashData = project.dashboard || {}; // Rich dashboard data if available

  // Header
  const header = {
    projectName: project.name,
    projectType: project.intake_type || intake.form_type || 'renovation',
    address: project.address || intake.project?.address || 'Address pending',
    phase: normalizePhase(project.phase || 'intake'),
    phaseStartDate: project.created_at,
    daysInPhase: daysSince(project.created_at),
    healthStatus: 'on_track',
    healthReason: 'All metrics healthy',
  };

  // Client - use dashboard pending decisions if available
  const contact = intake.contact || {};
  const client = {
    client: {
      name: project.client_name || contact.full_name || 'Client Name',
      email: project.client_email || contact.email || '',
      phone: project.client_phone || contact.phone || '',
      preferredContact: project.preferred_contact || contact.preferred_contact || 'email',
      decisionMaker: contact.decision_maker || contact.full_name,
    },
    pendingDecisions: dashData.pendingDecisions || [],
    lastContact: project.updated_at || project.created_at,
    daysSinceContact: daysSince(project.updated_at || project.created_at),
  };

  // Budget - use rich data if available
  const budget = {
    estimatedTotal: project.estimate_high || 0,
    contractValue: project.contract_value || project.estimate_high || 0,
    totalSpent: project.spent || 0,
    totalCommitted: project.committed || 0,
    totalRemaining: (project.contract_value || project.estimate_high || 0) - (project.spent || 0) - (project.committed || 0),
    changeOrders: dashData.changeOrders || [],
    marginTarget: 20,
    currentMargin: project.spent > 0 ? 18.5 : 20, // Simulated margin compression
    costsByCategory: project.estimate_breakdown?.map(b => ({
      category: formatRoomName(b.room),
      budgeted: b.high || 0,
      spent: 0,
      committed: 0,
      variance: b.high || 0,
    })) || [],
  };

  // Schedule - use rich data if available
  const scheduleData = dashData.schedule || {};
  const schedule = {
    projectStart: scheduleData.projectStart || intake.project?.desired_start_month || project.target_start,
    targetCompletion: scheduleData.targetCompletion || intake.project?.target_completion_month || project.target_completion,
    currentCompletion: scheduleData.currentCompletion || intake.project?.target_completion_month || project.target_completion,
    slippageDays: scheduleData.slippageDays || 0,
    currentPhase: getPhaseDisplayName(project.phase),
    phases: generateDefaultPhases(intake),
    upcomingMilestones: dashData.milestones || [],
  };

  // Scope
  const rooms = [];

  // Add rooms from renovation data
  if (intake.renovation?.room_tiers) {
    Object.entries(intake.renovation.room_tiers).forEach(([room, tier]) => {
      rooms.push({
        room: formatRoomName(room),
        tier: tier === 'full' ? 'full_reno' : 'refresh',
        keySelections: getKeySelectionsForRoom(room, intake.selections),
        scopeItemCount: 8, // Placeholder
      });
    });
  }

  // For new construction, add standard rooms
  if (intake.form_type === 'new_construction' && intake.layout) {
    rooms.push(
      { room: 'Kitchen', tier: 'full_finish', keySelections: getKeySelectionsForRoom('kitchen', intake.selections), scopeItemCount: 12 },
      { room: 'Primary Bath', tier: 'full_finish', keySelections: getKeySelectionsForRoom('bathrooms', intake.selections), scopeItemCount: 10 }
    );
  }

  const scope = {
    projectType: header.projectType,
    buildTier: project.build_tier || intake.project?.build_tier || 'better',
    rooms,
    specialFeatures: intake.layout?.outdoor_spaces || [],
    clientMustHaves: intake.notes?.must_haves || [],
    clientPainPoints: intake.notes?.pain_points || [],
    inspirationLinks: intake.notes?.inspiration_urls || [],
  };

  // Action Items - generate initial ones for new projects
  const initialActions = project.phase === 'intake' ? generateInitialActions(intake) : [];
  const actionItems = {
    blockers: [],
    overdueTasks: [],
    todayTasks: initialActions.filter(a => daysUntil(a.dueDate) <= 0),
    pendingApprovals: [],
    alerts: [],
  };

  // Team - use rich data if available
  const teamData = dashData.team || {};
  const team = {
    projectLead: teamData.projectLead || {
      id: 'lead-001',
      name: 'Project Manager',
      role: 'Project Lead',
      phone: '506-555-0100',
      email: 'pm@hendersoncontracting.ca',
    },
    teamMembers: teamData.teamMembers || [],
    subcontractors: teamData.subcontractors || [],
  };

  // Activities
  const activities = [
    {
      id: 'activity-created',
      type: 'status_change',
      actor: 'System',
      timestamp: project.created_at,
      content: 'Project created from intake form',
    },
  ];

  // Assemble dashboard data
  const dashboardData = {
    header,
    client,
    budget,
    schedule,
    scope,
    actionItems,
    team,
    activities,
  };

  // Calculate health status
  const health = calculateHealthStatus(dashboardData);
  dashboardData.header.healthStatus = health.status;
  dashboardData.header.healthReason = health.reason;

  // Generate alerts
  dashboardData.actionItems.alerts = generateAlerts(dashboardData);

  return dashboardData;
}

/**
 * Get display name for phase
 * @param {string} phase
 * @returns {string}
 */
function getPhaseDisplayName(phase) {
  const names = {
    intake: 'Intake',
    estimate: 'Estimating',
    estimating: 'Estimating',
    quoted: 'Quoted',
    contract: 'Contracted',
    contracted: 'Contracted',
    active: 'Active',
    punch_list: 'Punch List',
    complete: 'Complete',
  };
  return names[phase] || phase;
}

/**
 * Extract key selections for a room
 * @param {string} room
 * @param {Object} selections
 * @returns {Array}
 */
function getKeySelectionsForRoom(room, selections) {
  if (!selections) return [];

  const result = [];
  const roomSelections = selections[room] || {};

  Object.entries(roomSelections).forEach(([item, value]) => {
    if (value && value !== 'undecided' && value !== 'unknown') {
      result.push({
        item: item.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value: value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      });
    }
  });

  return result.slice(0, 5); // Top 5 selections
}

/**
 * Format relative time
 * @param {string|Date} date
 * @returns {string}
 */
export function formatRelativeTime(date) {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return then.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
}

/**
 * Format date for display
 * @param {string|Date} date
 * @param {string} format - 'short' | 'long' | 'month'
 * @returns {string}
 */
export function formatDate(date, format = 'short') {
  if (!date) return '—';

  const d = new Date(date);

  switch (format) {
    case 'long':
      return d.toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    case 'month':
      return d.toLocaleDateString('en-CA', { month: 'short', year: 'numeric' });
    case 'short':
    default:
      return d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
  }
}
