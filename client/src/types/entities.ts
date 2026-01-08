/**
 * Core entity types for Hooomz OS
 *
 * These types represent the main data structures used throughout the application.
 * They are designed to match the database schema and API responses.
 */

// =============================================================================
// User & Auth Types
// =============================================================================

export type UserRole = 'administrator' | 'manager' | 'foreman' | 'carpenter' | 'apprentice' | 'labourer';

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at?: string;
}

export interface Employee {
  id: string;
  user_id?: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  hourly_rate?: number;
  is_active: boolean;
  avatar_url?: string;
  phone?: string;
  job_title?: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
}

// =============================================================================
// Project Types
// =============================================================================

export type ProjectPhase =
  | 'intake'
  | 'discovery'
  | 'pricing'
  | 'estimate'
  | 'quote'
  | 'contract'
  | 'active'
  | 'complete'
  | 'cancelled'
  | 'maintained';

export type PhaseGroup = 'sales' | 'pre_contract' | 'production' | 'closed' | 'warranty';

export type IntakeType = 'new_construction' | 'renovation' | 'contractor';

export interface Project {
  id: string;
  organization_id?: string;
  name: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  phase: ProjectPhase;
  phase_group?: PhaseGroup;
  intake_type?: IntakeType;
  intake_data?: Record<string, unknown>;
  build_tier?: 'good' | 'better' | 'best';
  estimate_low?: number;
  estimate_high?: number;
  estimate_line_items?: unknown[];
  contract_value?: number;
  health_score?: number;
  target_completion?: string;
  actual_completion?: string;
  notes?: string;
  assigned_to?: string;
  created_at: string;
  updated_at?: string;
  phase_changed_at?: string;
  deleted_at?: string;
}

// =============================================================================
// Loop Types
// =============================================================================

export type LoopType = 'phase' | 'area' | 'trade' | 'room' | 'zone' | 'custom';

export type LoopStatus = 'pending' | 'ready' | 'in_progress' | 'blocked' | 'complete';

export type HealthColor = 'green' | 'yellow' | 'red' | 'gray';

export interface Loop {
  id: string;
  project_id: string;
  parent_loop_id?: string;
  name: string;
  loop_type: LoopType;
  status: LoopStatus;
  health_color?: HealthColor;
  health_score?: number;
  planned_start?: string;
  planned_end?: string;
  actual_start?: string;
  actual_end?: string;
  display_order: number;
  is_collapsed?: boolean;
  category_code?: string;
  task_count?: number;
  budgeted_amount?: number;
  source?: 'intake' | 'estimate' | 'contractor_intake' | 'manual';
  created_at: string;
  updated_at?: string;
}

// =============================================================================
// Task Types
// =============================================================================

export type TaskStatus = 'pending' | 'in_progress' | 'blocked' | 'complete';

export type TaskPriority = 1 | 2 | 3 | 4; // 1 = highest

export interface Task {
  id: string;
  loop_id: string;
  parent_task_id?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  category_code?: string;
  subcategory_code?: string;
  location?: string;
  assigned_to?: string;
  estimated_hours?: number;
  actual_hours?: number;
  due_date?: string;
  completed_at?: string;
  display_order: number;
  source?: string;
  budgeted_amount?: number;
  quantity?: number;
  unit?: string;
  created_at: string;
  updated_at?: string;
}

// =============================================================================
// Time Tracking Types
// =============================================================================

export interface TimeEntry {
  id: string;
  task_id?: string;
  project_id?: string;
  user_id?: string;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  allocated_minutes?: number;
  notes?: string;
  category_code?: string;
  subcategory_code?: string;
  billable?: boolean;
  created_at: string;
  updated_at?: string;
}

// =============================================================================
// Activity Log Types
// =============================================================================

export type ActivityEventType =
  | 'task.created'
  | 'task.completed'
  | 'task.updated'
  | 'task.blocked'
  | 'loop.created'
  | 'loop.completed'
  | 'project.phase_changed'
  | 'photo.uploaded'
  | 'note.added'
  | 'time.logged'
  | 'change_order.created'
  | 'change_order.approved';

export interface ActivityEntry {
  id: string;
  event_type: ActivityEventType;
  event_data?: Record<string, unknown>;
  organization_id?: string;
  project_id?: string;
  loop_id?: string;
  task_id?: string;
  actor_id?: string;
  actor_name?: string;
  category_code?: string;
  subcategory_code?: string;
  created_at: string;
}

// =============================================================================
// Change Order Types
// =============================================================================

export type ChangeOrderType = 'customer' | 'contractor' | 'no_cost';

export type ChangeOrderStatus = 'draft' | 'pending' | 'approved' | 'declined';

export interface ChangeOrder {
  id: string;
  project_id: string;
  loop_id?: string;
  change_order_type: ChangeOrderType;
  status: ChangeOrderStatus;
  title: string;
  description?: string;
  amount?: number;
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
  declined_reason?: string;
  created_at: string;
  updated_at?: string;
}

// =============================================================================
// Material Selection Types
// =============================================================================

export type SelectionStatus = 'pending' | 'selected' | 'ordered' | 'received' | 'installed';

export interface MaterialSelection {
  id: string;
  project_id: string;
  category: string;
  name: string;
  description?: string;
  status: SelectionStatus;
  selected_option?: string;
  unit_cost?: number;
  quantity?: number;
  total_cost?: number;
  supplier?: string;
  lead_time_days?: number;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

// =============================================================================
// Floor Plan Types
// =============================================================================

export type FloorPlanElementType =
  | 'wall'
  | 'window'
  | 'door'
  | 'beam'
  | 'zone'
  | 'fixture'
  | 'outlet'
  | 'switch'
  | 'hvac'
  | 'custom';

export interface FloorPlan {
  id: string;
  project_id: string;
  name: string;
  svg_viewbox?: string;
  background_image_url?: string;
  width_feet?: number;
  height_feet?: number;
  floor_number?: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface FloorPlanElement {
  id: string;
  floor_plan_id: string;
  loop_id?: string;
  element_type: FloorPlanElementType;
  label?: string;
  trade_category?: string;
  svg_type: 'path' | 'rect' | 'line' | 'circle' | 'polygon';
  svg_data: Record<string, unknown>;
  stroke_width?: number;
  default_color?: string;
  z_index?: number;
  notes?: string;
  specs?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
}

// =============================================================================
// API Response Types
// =============================================================================

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface ApiListResponse<T> {
  data: T[];
  error: string | null;
}
