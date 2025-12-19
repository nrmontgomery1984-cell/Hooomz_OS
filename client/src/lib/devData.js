/**
 * Dev Mode Test Data
 *
 * Test personas and project data for multi-user experience testing.
 * This file should be tree-shaken out of production builds.
 */

// =============================================================================
// ROLE DEFINITIONS
// =============================================================================

/**
 * Role hierarchy with permission levels
 * Higher numbers = more permissions
 */
export const ROLES = {
  // Internal team roles
  administrator: {
    level: 100,
    label: 'Administrator',
    shortLabel: 'Admin',
    description: 'Full system access - settings, users, financials',
    color: '#8b5cf6', // purple
    icon: 'Shield',
    canAccessAdmin: true,
    canManageUsers: true,
    canViewFinancials: true,
    canEditSettings: true,
  },
  manager: {
    level: 80,
    label: 'Manager',
    shortLabel: 'Manager',
    description: 'Project oversight, team management, reporting',
    color: '#3b82f6', // blue
    icon: 'Briefcase',
    canAccessAdmin: false,
    canManageUsers: false,
    canViewFinancials: true,
    canEditSettings: false,
  },
  foreman: {
    level: 60,
    label: 'Foreman',
    shortLabel: 'Foreman',
    description: 'Site supervision, crew coordination, quality control',
    color: '#f59e0b', // amber
    icon: 'HardHat',
    canAccessAdmin: false,
    canManageUsers: false,
    canViewFinancials: false,
    canEditSettings: false,
  },
  tradesperson: {
    level: 40,
    label: 'Tradesperson',
    shortLabel: 'Trade',
    description: 'Skilled work, time tracking, task completion',
    color: '#10b981', // emerald
    icon: 'Wrench',
    canAccessAdmin: false,
    canManageUsers: false,
    canViewFinancials: false,
    canEditSettings: false,
  },
  apprentice: {
    level: 30,
    label: 'Apprentice',
    shortLabel: 'Apprentice',
    description: 'Learning, assisting, time tracking',
    color: '#06b6d4', // cyan
    icon: 'GraduationCap',
    canAccessAdmin: false,
    canManageUsers: false,
    canViewFinancials: false,
    canEditSettings: false,
  },
  labourer: {
    level: 20,
    label: 'Labourer',
    shortLabel: 'Labourer',
    description: 'General labour, time tracking',
    color: '#64748b', // slate
    icon: 'User',
    canAccessAdmin: false,
    canManageUsers: false,
    canViewFinancials: false,
    canEditSettings: false,
  },
  // External roles (for reference)
  homeowner: {
    level: 10,
    label: 'Homeowner',
    shortLabel: 'Client',
    description: 'Project client - view only access',
    color: '#22c55e', // green
    icon: 'Home',
    canAccessAdmin: false,
    canManageUsers: false,
    canViewFinancials: false,
    canEditSettings: false,
  },
  subcontractor: {
    level: 10,
    label: 'Subcontractor',
    shortLabel: 'Sub',
    description: 'External contractor - assigned work only',
    color: '#f97316', // orange
    icon: 'Zap',
    canAccessAdmin: false,
    canManageUsers: false,
    canViewFinancials: false,
    canEditSettings: false,
  },
};

/**
 * Feature permissions by role
 * true = full access, 'view' = read-only, false = no access
 */
export const PERMISSIONS = {
  // Dashboard & Overview
  dashboard: {
    administrator: true,
    manager: true,
    foreman: true,
    tradesperson: 'limited', // simplified view
    apprentice: 'limited',
    labourer: 'limited',
    homeowner: 'own_project',
    subcontractor: 'assigned',
  },
  // Pipeline (Sales, Estimates, Contracts)
  pipeline: {
    administrator: true,
    manager: true,
    foreman: 'view',
    tradesperson: false,
    apprentice: false,
    labourer: false,
    homeowner: false,
    subcontractor: false,
  },
  // Production management
  production: {
    administrator: true,
    manager: true,
    foreman: true,
    tradesperson: 'assigned',
    apprentice: 'assigned',
    labourer: 'assigned',
    homeowner: 'view',
    subcontractor: 'assigned',
  },
  // Time tracking
  time: {
    administrator: true,
    manager: true,
    foreman: true,
    tradesperson: true,
    apprentice: true,
    labourer: true,
    homeowner: false,
    subcontractor: true,
  },
  // Expenses
  expenses: {
    administrator: true,
    manager: true,
    foreman: true,
    tradesperson: 'own',
    apprentice: 'own',
    labourer: 'own',
    homeowner: false,
    subcontractor: 'own',
  },
  // Daily log
  dailyLog: {
    administrator: true,
    manager: true,
    foreman: true,
    tradesperson: true,
    apprentice: true,
    labourer: true,
    homeowner: false,
    subcontractor: true,
  },
  // Cost catalogue
  costCatalogue: {
    administrator: true,
    manager: true,
    foreman: 'view',
    tradesperson: false,
    apprentice: false,
    labourer: false,
    homeowner: false,
    subcontractor: false,
  },
  // Settings
  settings: {
    administrator: true,
    manager: 'view',
    foreman: false,
    tradesperson: false,
    apprentice: false,
    labourer: false,
    homeowner: false,
    subcontractor: false,
  },
  // Field guide (training)
  fieldGuide: {
    administrator: true,
    manager: true,
    foreman: true,
    tradesperson: true,
    apprentice: true,
    labourer: true,
    homeowner: false,
    subcontractor: true,
  },
};

// =============================================================================
// TEST PERSONAS
// =============================================================================

export const TEST_PERSONAS = {
  // Administrator - full access
  administrator: {
    id: 'dev-admin-001',
    name: 'Nathan Henderson',
    email: 'nathan@hendersoncontracting.ca',
    role: 'administrator',
    company: 'Henderson Contracting',
    avatar: null,
    initials: 'NH',
    color: ROLES.administrator.color,
    projects: ['all'],
    description: 'Full access to all features and settings',
  },

  // Manager - project & team oversight
  manager: {
    id: 'dev-manager-001',
    name: 'Lisa Chen',
    email: 'lisa@hendersoncontracting.ca',
    role: 'manager',
    company: 'Henderson Contracting',
    avatar: null,
    initials: 'LC',
    color: ROLES.manager.color,
    projects: ['all'],
    description: 'Project management and team coordination',
  },

  // Foreman - site supervision
  foreman: {
    id: 'dev-foreman-001',
    name: 'Mike Sullivan',
    email: 'mike@hendersoncontracting.ca',
    role: 'foreman',
    company: 'Henderson Contracting',
    avatar: null,
    initials: 'MS',
    color: ROLES.foreman.color,
    projects: ['dev-project-001', 'dev-project-002'],
    description: 'Site supervision and crew management',
  },

  // Tradesperson - skilled worker
  tradesperson: {
    id: 'dev-trade-001',
    name: 'Joe Martinez',
    email: 'joe@hendersoncontracting.ca',
    role: 'tradesperson',
    trade: 'Carpentry',
    company: 'Henderson Contracting',
    avatar: null,
    initials: 'JM',
    color: ROLES.tradesperson.color,
    projects: ['dev-project-001'],
    description: 'Skilled trade work and time tracking',
  },

  // Apprentice
  apprentice: {
    id: 'dev-apprentice-001',
    name: 'Tyler Brooks',
    email: 'tyler@hendersoncontracting.ca',
    role: 'apprentice',
    trade: 'Carpentry',
    company: 'Henderson Contracting',
    avatar: null,
    initials: 'TB',
    color: ROLES.apprentice.color,
    projects: ['dev-project-001'],
    description: 'Apprentice - learning and assisting',
  },

  // Labourer
  labourer: {
    id: 'dev-labourer-001',
    name: 'Sam Wilson',
    email: 'sam@hendersoncontracting.ca',
    role: 'labourer',
    company: 'Henderson Contracting',
    avatar: null,
    initials: 'SW',
    color: ROLES.labourer.color,
    projects: ['dev-project-001'],
    description: 'General labour and cleanup',
  },

  // Legacy aliases for backwards compatibility
  contractor: {
    id: 'dev-admin-001',
    name: 'Nathan Henderson',
    email: 'nathan@hendersoncontracting.ca',
    role: 'administrator', // Maps to administrator
    company: 'Henderson Contracting',
    avatar: null,
    initials: 'NH',
    color: ROLES.administrator.color,
    projects: ['all'],
    description: 'Full access to all features and settings',
  },

  homeowner: {
    id: 'dev-homeowner-001',
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@email.com',
    role: 'homeowner',
    avatar: null,
    initials: 'SM',
    color: ROLES.homeowner.color,
    projects: ['dev-project-001'],
    description: 'Can view their project and approve decisions',
  },

  subcontractor: {
    id: 'dev-sub-001',
    name: "Mike's Electric Ltd",
    email: 'mike@mikeselectric.ca',
    role: 'subcontractor',
    trade: 'Electrical',
    avatar: null,
    initials: 'ME',
    color: ROLES.subcontractor.color,
    projects: ['dev-project-001', 'dev-project-002'],
    assignedTasks: ['task-electrical-rough', 'task-electrical-finish', 'task-panel-upgrade'],
    description: 'Can manage assigned tasks and log time',
  },
};

/**
 * Helper to check if a role has permission for a feature
 */
export function hasPermission(role, feature) {
  const permission = PERMISSIONS[feature]?.[role];
  return permission === true || permission === 'view' || permission === 'own' || permission === 'assigned' || permission === 'limited' || permission === 'own_project';
}

/**
 * Helper to check if role has full (edit) access to a feature
 */
export function hasFullAccess(role, feature) {
  return PERMISSIONS[feature]?.[role] === true;
}

/**
 * Get role config
 */
export function getRoleConfig(role) {
  return ROLES[role] || ROLES.labourer;
}

export const TEST_PROJECT = {
  id: 'dev-project-001',
  name: 'Mitchell Kitchen & Bath Reno',
  type: 'renovation',
  status: 'in_progress',
  phase: 'rough_in',

  client: TEST_PERSONAS.homeowner,
  contractor: TEST_PERSONAS.contractor,

  address: {
    street: '123 Test Street',
    city: 'Moncton',
    province: 'NB',
    postalCode: 'E1C 1A1',
    full: '123 Test Street, Moncton, NB',
  },

  budget: {
    estimated: 85000,
    contract: 82500,
    spent: 34200,
    committed: 18500,
    remaining: 29800,
    marginPercent: 18,
  },

  schedule: {
    startDate: '2025-01-15',
    targetCompletion: '2025-04-30',
    currentPhase: 'Rough-In',
    percentComplete: 40,
    daysRemaining: 89,
    onTrack: true,
  },

  scope: {
    buildTier: 'better',
    rooms: [
      { room: 'Kitchen', tier: 'full_reno', percentComplete: 35 },
      { room: 'Primary Bathroom', tier: 'full_reno', percentComplete: 45 },
      { room: 'Powder Room', tier: 'refresh', percentComplete: 60 },
    ],
  },

  pendingDecisions: [
    {
      id: 'decision-001',
      title: 'Kitchen Backsplash Tile Selection',
      description: 'Please select your preferred backsplash tile for the kitchen.',
      options: [
        { id: 'opt-1', name: 'Subway White', price: 0, image: null },
        { id: 'opt-2', name: 'Herringbone Gray', price: 450, image: null },
        { id: 'opt-3', name: 'Mosaic Accent', price: 800, image: null },
      ],
      dueDate: '2025-02-15',
      status: 'pending',
      createdAt: '2025-02-01',
      room: 'Kitchen',
    },
    {
      id: 'decision-002',
      title: 'Bathroom Vanity Hardware',
      description: 'Choose hardware finish for bathroom vanity.',
      options: [
        { id: 'opt-1', name: 'Brushed Nickel', price: 0, image: null },
        { id: 'opt-2', name: 'Matte Black', price: 75, image: null },
        { id: 'opt-3', name: 'Brass', price: 150, image: null },
      ],
      dueDate: '2025-02-20',
      status: 'pending',
      createdAt: '2025-02-05',
      room: 'Primary Bathroom',
    },
  ],

  pendingChangeOrders: [
    {
      id: 'co-001',
      title: 'Add under-cabinet lighting',
      description: 'LED strip lighting under all upper cabinets with dimmer switch.',
      amount: 1200,
      status: 'pending_approval',
      createdAt: '2025-02-08',
      reason: 'Client request during walkthrough',
    },
    {
      id: 'co-002',
      title: 'Upgrade to heated bathroom floor',
      description: 'Electric radiant floor heating in primary bathroom.',
      amount: 2800,
      status: 'pending_approval',
      createdAt: '2025-02-10',
      reason: 'Client request - cold floors concern',
    },
  ],

  assignedSubs: [
    {
      ...TEST_PERSONAS.subcontractor,
      scheduledDates: ['2025-02-10', '2025-02-11', '2025-02-14', '2025-02-15'],
      tasks: [
        {
          id: 'task-electrical-rough',
          name: 'Electrical Rough-In',
          status: 'in_progress',
          room: 'Kitchen',
          scheduledDate: '2025-02-10',
          estimatedHours: 16,
          loggedHours: 6,
        },
        {
          id: 'task-panel-upgrade',
          name: 'Panel Upgrade',
          status: 'pending',
          room: 'Utility',
          scheduledDate: '2025-02-14',
          estimatedHours: 8,
          loggedHours: 0,
        },
      ],
    },
    {
      id: 'dev-sub-002',
      name: 'Atlantic Plumbing Co',
      email: 'info@atlanticplumbing.ca',
      role: 'subcontractor',
      trade: 'Plumbing',
      initials: 'AP',
      color: '#06b6d4',
      scheduledDates: ['2025-02-12', '2025-02-13'],
      tasks: [
        {
          id: 'task-plumbing-rough',
          name: 'Plumbing Rough-In',
          status: 'scheduled',
          room: 'Primary Bathroom',
          scheduledDate: '2025-02-12',
          estimatedHours: 12,
          loggedHours: 0,
        },
      ],
    },
  ],

  recentActivity: [
    {
      id: 'act-001',
      type: 'task_completed',
      message: 'Demo completed in Kitchen',
      timestamp: '2025-02-09T14:30:00',
      user: 'Nathan Henderson',
    },
    {
      id: 'act-002',
      type: 'photo_uploaded',
      message: '5 photos added to Kitchen progress',
      timestamp: '2025-02-09T15:45:00',
      user: 'Nathan Henderson',
    },
    {
      id: 'act-003',
      type: 'message',
      message: 'New message from Sarah Mitchell',
      timestamp: '2025-02-09T16:20:00',
      user: 'Sarah Mitchell',
    },
  ],

  documents: [
    {
      id: 'doc-001',
      name: 'Contract - Mitchell Reno',
      type: 'contract',
      uploadedAt: '2025-01-10',
      size: '2.4 MB',
      visibleTo: ['contractor', 'homeowner'],
    },
    {
      id: 'doc-002',
      name: 'Permit - Building',
      type: 'permit',
      uploadedAt: '2025-01-12',
      size: '1.1 MB',
      visibleTo: ['contractor', 'homeowner', 'subcontractor'],
    },
    {
      id: 'doc-003',
      name: 'Electrical Scope of Work',
      type: 'scope',
      uploadedAt: '2025-01-15',
      size: '450 KB',
      visibleTo: ['contractor', 'subcontractor'],
    },
  ],
};

// Second test project for sub visibility testing
export const TEST_PROJECT_2 = {
  id: 'dev-project-002',
  name: 'Thompson Basement Finish',
  type: 'renovation',
  status: 'in_progress',
  phase: 'framing',
  address: {
    full: '456 Oak Avenue, Dieppe, NB',
  },
  schedule: {
    percentComplete: 25,
    currentPhase: 'Framing',
  },
};

// Navigation items by role
export const NAV_BY_ROLE = {
  contractor: [
    { to: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
    { to: '/today', label: 'Today', icon: 'Calendar' },
    { to: '/sales', label: 'Sales / Leads', icon: 'UserPlus' },
    { to: '/estimates', label: 'Estimates', icon: 'Calculator' },
    { to: '/contracts', label: 'Contracts', icon: 'FileSignature' },
    { to: '/production', label: 'In Progress', icon: 'HardHat' },
    { to: '/completed', label: 'Completed', icon: 'CheckCircle2' },
    { to: '/cost-catalogue', label: 'Cost Catalogue', icon: 'BookOpen' },
    { to: '/settings', label: 'Settings', icon: 'Settings' },
  ],
  homeowner: [
    { to: '/', label: 'My Project', icon: 'Home' },
    { to: '/decisions', label: 'Decisions', icon: 'CheckSquare' },
    { to: '/messages', label: 'Messages', icon: 'MessageSquare' },
    { to: '/documents', label: 'Documents', icon: 'FileText' },
    { to: '/photos', label: 'Photos', icon: 'Camera' },
    { to: '/payments', label: 'Payments', icon: 'CreditCard' },
  ],
  subcontractor: [
    { to: '/', label: 'My Tasks', icon: 'ClipboardList' },
    { to: '/schedule', label: 'Schedule', icon: 'Calendar' },
    { to: '/time-log', label: 'Time Log', icon: 'Clock' },
    { to: '/messages', label: 'Messages', icon: 'MessageSquare' },
    { to: '/documents', label: 'Documents', icon: 'FileText' },
  ],
};

// What each role CANNOT do (for the indicator panel)
export const ROLE_RESTRICTIONS = {
  contractor: [],
  homeowner: [
    'View other projects',
    'See cost/margin data',
    'Edit estimates',
    'Manage subcontractors',
    'Access sales pipeline',
    'Modify schedules',
  ],
  subcontractor: [
    'View unassigned projects',
    'See financial data',
    'Access client info',
    'Approve change orders',
    'View full project scope',
    'Access other trades\' tasks',
  ],
};

/**
 * Get initial test data state
 * Used for reset functionality
 */
export function getInitialTestData() {
  return {
    project: JSON.parse(JSON.stringify(TEST_PROJECT)),
    project2: JSON.parse(JSON.stringify(TEST_PROJECT_2)),
    personas: JSON.parse(JSON.stringify(TEST_PERSONAS)),
  };
}
