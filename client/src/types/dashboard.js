/**
 * Dashboard Type Definitions
 *
 * These JSDoc types define the structure for the project dashboard.
 * Used for documentation and IDE IntelliSense.
 */

/**
 * @typedef {'intake' | 'estimating' | 'quoted' | 'contracted' | 'active' | 'punch_list' | 'complete'} ProjectPhase
 */

/**
 * @typedef {'on_track' | 'at_risk' | 'behind'} HealthStatus
 */

/**
 * @typedef {'new_construction' | 'renovation'} ProjectType
 */

/**
 * @typedef {'good' | 'better' | 'best'} BuildTier
 */

// =============================================================================
// PROJECT HEADER
// =============================================================================

/**
 * @typedef {Object} ProjectHeader
 * @property {string} projectName
 * @property {ProjectType} projectType
 * @property {string} address
 * @property {ProjectPhase} phase
 * @property {string} phaseStartDate
 * @property {number} daysInPhase
 * @property {HealthStatus} healthStatus
 * @property {string} [healthReason] - Explanation for health status
 */

// =============================================================================
// CLIENT
// =============================================================================

/**
 * @typedef {Object} ClientInfo
 * @property {string} name
 * @property {string} email
 * @property {string} phone
 * @property {'text' | 'email' | 'phone'} preferredContact
 * @property {string} [decisionMaker]
 */

/**
 * @typedef {Object} Decision
 * @property {string} id
 * @property {string} category
 * @property {string} description
 * @property {string} dueDate
 * @property {number} daysOverdue
 * @property {'pending' | 'reminded' | 'received' | 'overdue'} status
 * @property {string[]} [options]
 */

/**
 * @typedef {Object} ClientCard
 * @property {ClientInfo} client
 * @property {Decision[]} pendingDecisions
 * @property {string} lastContact
 * @property {number} daysSinceContact
 */

// =============================================================================
// BUDGET
// =============================================================================

/**
 * @typedef {Object} ChangeOrder
 * @property {string} id
 * @property {string} description
 * @property {number} amount
 * @property {'pending' | 'approved' | 'declined'} status
 * @property {string} dateSubmitted
 */

/**
 * @typedef {Object} CategoryCost
 * @property {string} category
 * @property {number} budgeted
 * @property {number} spent
 * @property {number} committed
 * @property {number} variance
 */

/**
 * @typedef {Object} BudgetData
 * @property {number} estimatedTotal
 * @property {number} contractValue
 * @property {number} totalSpent
 * @property {number} totalCommitted
 * @property {number} totalRemaining
 * @property {ChangeOrder[]} changeOrders
 * @property {number} marginTarget
 * @property {number} currentMargin
 * @property {CategoryCost[]} costsByCategory
 */

// =============================================================================
// SCHEDULE
// =============================================================================

/**
 * @typedef {Object} SchedulePhase
 * @property {string} name
 * @property {string} startDate
 * @property {string} endDate
 * @property {'complete' | 'in_progress' | 'upcoming' | 'delayed'} status
 * @property {number} percentComplete
 */

/**
 * @typedef {Object} Milestone
 * @property {string} id
 * @property {string} name
 * @property {string} date
 * @property {'inspection' | 'delivery' | 'sub_start' | 'client_walkthrough' | 'payment'} type
 * @property {'upcoming' | 'today' | 'overdue'} status
 * @property {string} [assignedTo]
 */

/**
 * @typedef {Object} ScheduleData
 * @property {string} projectStart
 * @property {string} targetCompletion
 * @property {string} currentCompletion
 * @property {number} slippageDays
 * @property {string} currentPhase
 * @property {SchedulePhase[]} phases
 * @property {Milestone[]} upcomingMilestones
 */

// =============================================================================
// SCOPE
// =============================================================================

/**
 * @typedef {Object} Selection
 * @property {string} item
 * @property {string} value
 */

/**
 * @typedef {Object} RoomScope
 * @property {string} room
 * @property {'refresh' | 'full_reno' | 'full_finish'} tier
 * @property {Selection[]} keySelections
 * @property {number} scopeItemCount
 */

/**
 * @typedef {Object} ScopeData
 * @property {ProjectType} projectType
 * @property {BuildTier} buildTier
 * @property {RoomScope[]} rooms
 * @property {string[]} specialFeatures
 * @property {string[]} clientMustHaves
 * @property {string[]} [clientPainPoints]
 * @property {string[]} [inspirationLinks]
 */

// =============================================================================
// ACTION ITEMS
// =============================================================================

/**
 * @typedef {Object} Blocker
 * @property {string} id
 * @property {'decision' | 'material' | 'sub' | 'inspection' | 'payment' | 'permit'} type
 * @property {string} description
 * @property {string} blockedPhase
 * @property {number} daysSinceCreated
 * @property {string} owner
 * @property {string} action
 */

/**
 * @typedef {Object} ActionTask
 * @property {string} id
 * @property {string} title
 * @property {string} dueDate
 * @property {string} assignedTo
 * @property {'high' | 'medium' | 'low'} priority
 * @property {string} category
 */

/**
 * @typedef {Object} Approval
 * @property {string} id
 * @property {'change_order' | 'payment' | 'selection' | 'schedule'} type
 * @property {string} description
 * @property {number} [amount]
 * @property {string} requestedDate
 * @property {string} from
 */

/**
 * @typedef {Object} Alert
 * @property {string} id
 * @property {'budget' | 'schedule' | 'communication' | 'inspection' | 'material'} type
 * @property {'info' | 'warning' | 'critical'} severity
 * @property {string} message
 * @property {string} timestamp
 */

/**
 * @typedef {Object} ActionItemsData
 * @property {Blocker[]} blockers
 * @property {ActionTask[]} overdueTasks
 * @property {ActionTask[]} todayTasks
 * @property {Approval[]} pendingApprovals
 * @property {Alert[]} alerts
 */

// =============================================================================
// TEAM
// =============================================================================

/**
 * @typedef {Object} TeamMember
 * @property {string} id
 * @property {string} name
 * @property {string} role
 * @property {string} phone
 * @property {string} email
 * @property {string} [avatar]
 */

/**
 * @typedef {Object} Subcontractor
 * @property {string} id
 * @property {string} company
 * @property {string} trade
 * @property {string} contact
 * @property {string} phone
 * @property {'scheduled' | 'on_site' | 'complete' | 'not_scheduled'} status
 * @property {{start: string, end: string}} [scheduledDates]
 * @property {string} [lastUpdate]
 */

/**
 * @typedef {Object} TeamData
 * @property {TeamMember} projectLead
 * @property {TeamMember[]} teamMembers
 * @property {Subcontractor[]} subcontractors
 */

// =============================================================================
// ACTIVITY
// =============================================================================

/**
 * @typedef {Object} Activity
 * @property {string} id
 * @property {'note' | 'message' | 'change_order' | 'photo' | 'status_change' | 'task_complete' | 'payment'} type
 * @property {string} actor
 * @property {string} timestamp
 * @property {string} content
 * @property {Object} [metadata]
 */

// =============================================================================
// FULL DASHBOARD DATA
// =============================================================================

/**
 * @typedef {Object} DashboardData
 * @property {ProjectHeader} header
 * @property {ClientCard} client
 * @property {BudgetData} budget
 * @property {ScheduleData} schedule
 * @property {ScopeData} scope
 * @property {ActionItemsData} actionItems
 * @property {TeamData} team
 * @property {Activity[]} activities
 */

export const PROJECT_PHASES = [
  { id: 'intake', label: 'New Lead', order: 1 },
  { id: 'estimating', label: 'Estimating', order: 2 },
  { id: 'quoted', label: 'Quoted', order: 3 },
  { id: 'contracted', label: 'Contracted', order: 4 },
  { id: 'active', label: 'In Progress', order: 5 },
  { id: 'punch_list', label: 'Punch List', order: 6 },
  { id: 'complete', label: 'Complete', order: 7 },
];

export const HEALTH_STATUS = {
  on_track: { label: 'On Track', color: 'green' },
  at_risk: { label: 'At Risk', color: 'yellow' },
  behind: { label: 'Behind', color: 'red' },
};

export const BLOCKER_TYPES = {
  decision: { label: 'Client Decision', icon: 'MessageCircle' },
  material: { label: 'Material Delay', icon: 'Package' },
  sub: { label: 'Subcontractor', icon: 'Users' },
  inspection: { label: 'Inspection', icon: 'ClipboardCheck' },
  payment: { label: 'Payment', icon: 'DollarSign' },
  permit: { label: 'Permit', icon: 'FileCheck' },
};

export const MILESTONE_TYPES = {
  inspection: { label: 'Inspection', icon: 'ClipboardCheck' },
  delivery: { label: 'Delivery', icon: 'Truck' },
  sub_start: { label: 'Sub Start', icon: 'HardHat' },
  client_walkthrough: { label: 'Walkthrough', icon: 'Users' },
  payment: { label: 'Payment', icon: 'DollarSign' },
};

export const TRADE_ICONS = {
  electrical: 'Zap',
  plumbing: 'Droplet',
  hvac: 'Wind',
  drywall: 'Square',
  flooring: 'Grid3X3',
  painting: 'Paintbrush',
  cabinets: 'Box',
  tile: 'LayoutGrid',
  roofing: 'Home',
  framing: 'Frame',
  concrete: 'Layers',
  insulation: 'Thermometer',
};
