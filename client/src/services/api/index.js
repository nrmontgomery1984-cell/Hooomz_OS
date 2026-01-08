/**
 * API Services Index
 *
 * Central export for all API modules.
 * Import from here: import { getProjects, createTask } from '@/services/api'
 */

// Config
export { supabase, isConfigured, generateId, now, today, response, handleError } from './config';

// Projects
export {
  getProjects,
  getProject,
  createProject,
  updateProject,
  updateProjectPhase,
  deleteProject,
  signContract,
  startProduction,
} from './projects';

// Activity
export {
  getProjectActivity,
  getRecentActivity,
  createActivityEntry,
  getActivityByType,
  getLoopActivity,
  getTaskActivity,
} from './activity';

// Loops
export {
  getLoops,
  getLoop,
  createLoop,
  updateLoop,
  deleteLoop,
  generateLoopsFromEstimate,
  getOrGenerateLoops,
  calculateLoopStatus,
  TRADE_NAMES,
} from './loops';

// Tasks
export {
  getTasks,
  getTask,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getTodayTasks,
  createTodayTask,
  getTaskNotes,
  addTaskNote,
  getTaskPhotos,
  addTaskPhoto,
  getProjectTasks,
} from './tasks';

// Employees
export {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeesByRole,
  searchEmployees,
} from './employees';

// Material Selections
export {
  getSelections,
  getSelection,
  createSelection,
  updateSelection,
  deleteSelection,
  updateSelectionStatus,
  getSelectionReferenceData,
  getProjectRooms,
  getSuggestedSelections,
  SELECTION_CATEGORIES,
  SELECTION_STATUSES,
} from './selections';

// Time Tracking
export {
  getActiveTimeEntry,
  getTimeEntries,
  clockIn,
  clockOut,
  addManualTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
  getTaskTimeEntries,
  getProjectTimeSummary,
  startTimer,
  stopTimer,
} from './time';

// Floor Plans
export {
  getFloorPlans,
  getFloorPlan,
  createFloorPlan,
  updateFloorPlan,
  deleteFloorPlan,
  getFloorPlanElements,
  getFloorPlanElementsWithStatus,
  createFloorPlanElement,
  updateFloorPlanElement,
  deleteFloorPlanElement,
  linkElementToLoop,
  unlinkElementFromLoop,
  getFloorPlanStatusSummary,
  FLOOR_PLAN_STATUS_COLORS,
  ELEMENT_TYPE_DEFAULTS,
  TRADE_COLORS,
} from './floorPlans';

// Task Tracker
export {
  getWorkCategories,
  getWorkSubcategories,
  getStages,
  getPhases,
  getProjectLocations,
  createLocation,
  getTaskInstances,
  getTaskInstance,
  createTaskInstance,
  updateTaskInstance,
  deleteTaskInstance,
  getContacts,
  getTaskTemplates,
  groupTasksByCategory,
  groupTasksByStage,
  groupTasksBySubcategory,
  WORK_CATEGORIES,
  STAGES,
  PHASES,
} from './taskTracker';

// Legacy aliases for backwards compatibility during migration
export {
  getSelections as getMaterialSelections,
  getSelection as getMaterialSelection,
  createSelection as createMaterialSelection,
  updateSelection as updateMaterialSelection,
  deleteSelection as deleteMaterialSelection,
} from './selections';
