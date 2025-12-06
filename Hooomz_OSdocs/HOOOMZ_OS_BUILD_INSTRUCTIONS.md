# Hooomz OS - Complete Build Package for Claude Code

## Project Overview

**Project Name:** Hooomz OS  
**Save Location:** `D:\Hooomz_OS`  
**Product Type:** Construction Project Management Platform  
**Target User:** Small residential contractors (1-10 person companies)  
**Design Philosophy:** Premium, minimal, Apple-like refinement

---

## Core Concept: The Loops Architecture

Hooomz OS is built on a revolutionary "Loops" architecture that mirrors how contractors actually think about work. Unlike rigid hierarchical systems, Loops are flexible, nestable containers that can represent phases, areas, trades, rooms, or any organizational structure the contractor needs.

### The Three Pillars

1. **Activity Log = The Heartbeat**
   - Everything is an event written to an immutable log
   - Not a feature users interact with directly—it's the foundation
   - All modules read from and write to this single event stream
   - Enables complete traceability of any resource through the project lifecycle

2. **Loops = The Identity**
   - Flexible nested containers (not rigid hierarchies)
   - Can go as deep as needed: Project → Phase → Area → Room → Zone → Task
   - Color status (🟢🟡🔴) bubbles up through nesting
   - The differentiator that matches how contractors actually organize work

3. **Modules = Views/Interfaces**
   - Modules are not silos—they're different lenses on the same data
   - All write to the same event stream
   - All reference the same loop structure
   - Examples: Schedule, Estimates, Time Tracking, Client Portal

### Project Lifecycle Stages

Every resource flows through these stages:
```
INTAKE → ESTIMATE → CONTRACT/SCOPE → PRODUCTION → INVOICE → PAID → WARRANTY
```

---

## Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| Frontend | React 18 + Vite | Fast builds, HMR |
| Styling | TailwindCSS | Utility-first, matches design system |
| Icons | Lucide React | Clean line icons |
| State | React hooks + Context | Keep it simple |
| Backend | Node.js + Express | API layer |
| Database | Supabase (PostgreSQL) | Auth, DB, storage, realtime |
| Auth | Supabase Auth | Built-in, secure |
| Hosting | Vercel (frontend) | Free tier works |
| PWA | Yes | Mobile access without app stores |

---

## Database Schema

### Core Tables

```sql
-- ===========================================
-- FOUNDATION: Users & Organizations
-- ===========================================

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  organization_id UUID REFERENCES organizations(id),
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'member', -- 'owner', 'admin', 'member', 'viewer'
  avatar_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- CORE: Projects
-- ===========================================

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Basic Info
  name TEXT NOT NULL,
  address TEXT,
  description TEXT,
  project_type TEXT DEFAULT 'renovation', -- 'new_construction', 'renovation', 'addition', 'repair'
  
  -- Client Info
  client_name TEXT,
  client_email TEXT,
  client_phone TEXT,
  
  -- Status & Lifecycle
  status TEXT DEFAULT 'intake', -- 'intake', 'estimate', 'contract', 'production', 'invoice', 'paid', 'warranty', 'archived'
  health_score INTEGER DEFAULT 100, -- 0-100, calculated from loops
  
  -- Dates
  start_date DATE,
  target_completion DATE,
  actual_completion DATE,
  
  -- Financials
  estimated_budget DECIMAL(12,2),
  contract_value DECIMAL(12,2),
  
  -- Metadata
  settings JSONB DEFAULT '{}',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ -- soft delete
);

-- ===========================================
-- CORE: Loops (The Heart of the System)
-- ===========================================

CREATE TABLE loops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  parent_loop_id UUID REFERENCES loops(id) ON DELETE CASCADE, -- enables nesting
  
  -- Identity
  name TEXT NOT NULL,
  loop_type TEXT DEFAULT 'phase', -- 'phase', 'area', 'trade', 'room', 'zone', 'custom'
  description TEXT,
  
  -- Status (bubbles up to parent)
  status TEXT DEFAULT 'pending', -- 'pending', 'active', 'blocked', 'completed', 'cancelled'
  health_color TEXT DEFAULT 'green', -- 'green', 'yellow', 'red', 'gray'
  health_score INTEGER DEFAULT 100, -- 0-100
  
  -- Scheduling
  planned_start DATE,
  planned_end DATE,
  actual_start DATE,
  actual_end DATE,
  
  -- Ordering & Display
  display_order INTEGER DEFAULT 0,
  is_collapsed BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast tree traversal
CREATE INDEX idx_loops_parent ON loops(parent_loop_id);
CREATE INDEX idx_loops_project ON loops(project_id);

-- ===========================================
-- CORE: Tasks (Work Items within Loops)
-- ===========================================

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loop_id UUID REFERENCES loops(id) ON DELETE CASCADE,
  parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE, -- subtasks
  
  -- Content
  title TEXT NOT NULL,
  description TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'blocked', 'completed', 'cancelled'
  priority INTEGER DEFAULT 3, -- 1=urgent, 2=high, 3=normal, 4=low
  
  -- Assignment
  assigned_to UUID REFERENCES users(id),
  
  -- Time
  estimated_hours DECIMAL(6,2),
  actual_hours DECIMAL(6,2) DEFAULT 0, -- calculated from time_entries
  due_date DATE,
  completed_at TIMESTAMPTZ,
  
  -- Ordering
  display_order INTEGER DEFAULT 0,
  
  -- Metadata
  labels TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- HEARTBEAT: Activity Log (Immutable Event Stream)
-- ===========================================

CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- What happened
  event_type TEXT NOT NULL, -- 'task.created', 'task.completed', 'time.started', 'photo.uploaded', etc.
  event_data JSONB NOT NULL, -- full event payload
  
  -- Context
  organization_id UUID REFERENCES organizations(id),
  project_id UUID REFERENCES projects(id),
  loop_id UUID REFERENCES loops(id),
  task_id UUID REFERENCES tasks(id),
  
  -- Who & When
  actor_id UUID REFERENCES users(id),
  actor_name TEXT, -- denormalized for display
  created_at TIMESTAMPTZ DEFAULT NOW()
  
  -- Note: No updated_at - events are immutable
);

-- Indexes for common queries
CREATE INDEX idx_activity_project ON activity_log(project_id, created_at DESC);
CREATE INDEX idx_activity_loop ON activity_log(loop_id, created_at DESC);
CREATE INDEX idx_activity_type ON activity_log(event_type, created_at DESC);

-- ===========================================
-- ESSENTIAL: Time Tracking
-- ===========================================

CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  
  -- Time
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER, -- calculated on stop
  
  -- Allocation (for percentage tracking)
  allocated_minutes INTEGER, -- how long this should take
  
  -- Notes
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- ESSENTIAL: Photos & Files
-- ===========================================

CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Context (polymorphic - can attach to project, loop, or task)
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  loop_id UUID REFERENCES loops(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  
  -- File Info
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT, -- 'photo', 'document', 'receipt', 'plan'
  file_size INTEGER,
  mime_type TEXT,
  
  -- Photo-specific
  photo_stage TEXT, -- 'before', 'during', 'after', 'issue'
  caption TEXT,
  
  -- Metadata
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- ESSENTIAL: Estimates & Line Items
-- ===========================================

CREATE TABLE estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Info
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft', -- 'draft', 'sent', 'viewed', 'approved', 'rejected', 'converted'
  
  -- Validity
  valid_until DATE,
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  
  -- Totals (calculated)
  subtotal DECIMAL(12,2) DEFAULT 0,
  tax_rate DECIMAL(5,4) DEFAULT 0.15, -- 15% HST for NB
  tax_amount DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) DEFAULT 0,
  
  -- Notes
  client_notes TEXT, -- visible to client
  internal_notes TEXT, -- contractor only
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE estimate_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id UUID REFERENCES estimates(id) ON DELETE CASCADE,
  
  -- Categorization
  category TEXT, -- 'Demo', 'Framing', 'Electrical', etc.
  subcategory TEXT,
  
  -- Item
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) DEFAULT 1,
  unit TEXT DEFAULT 'ea', -- 'ea', 'sqft', 'lf', 'hr'
  unit_price DECIMAL(12,2) NOT NULL,
  total_price DECIMAL(12,2), -- calculated
  
  -- Ordering
  display_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- ESSENTIAL: Daily Logs
-- ===========================================

CREATE TABLE daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  
  -- Conditions
  weather TEXT,
  temperature_high INTEGER,
  temperature_low INTEGER,
  weather_impact INTEGER DEFAULT 0, -- 0-10
  
  -- Crew
  crew_count INTEGER,
  crew_names TEXT[],
  
  -- Work Summary
  work_completed TEXT,
  issues_encountered TEXT,
  materials_used TEXT,
  
  -- Self-assessment
  energy_level INTEGER, -- 1-10
  focus_level INTEGER, -- 1-10
  
  -- Metadata
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(project_id, log_date)
);

-- ===========================================
-- STANDARD: Contacts
-- ===========================================

CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Type
  contact_type TEXT NOT NULL, -- 'client', 'subcontractor', 'supplier', 'inspector'
  
  -- Info
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  
  -- Notes
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link contacts to projects
CREATE TABLE project_contacts (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  role TEXT, -- 'client', 'electrician', 'plumber', etc.
  PRIMARY KEY (project_id, contact_id)
);

-- ===========================================
-- STANDARD: Checklists (Atul Gawande style)
-- ===========================================

CREATE TABLE checklist_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  
  name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'Framing', 'Drywall', 'Electrical', etc.
  
  items JSONB NOT NULL, -- array of {description, is_critical, order}
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE task_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  template_id UUID REFERENCES checklist_templates(id),
  
  items JSONB NOT NULL, -- array of {description, is_critical, is_completed, completed_at, completed_by}
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- SPECIALIZED: Training & Development
-- ===========================================

CREATE TABLE training_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  
  title TEXT NOT NULL,
  category TEXT, -- 'Framing', 'Drywall', 'Safety', etc.
  content TEXT, -- markdown content
  estimated_minutes INTEGER,
  difficulty TEXT DEFAULT 'beginner', -- 'beginner', 'intermediate', 'advanced'
  
  -- For NB Building Code compliance
  code_references TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_training_progress (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  guide_id UUID REFERENCES training_guides(id) ON DELETE CASCADE,
  
  status TEXT DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed'
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  PRIMARY KEY (user_id, guide_id)
);

-- ===========================================
-- FUNCTIONS: Health Score Calculation
-- ===========================================

-- Function to calculate loop health based on child loops and tasks
CREATE OR REPLACE FUNCTION calculate_loop_health(loop_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  child_health INTEGER;
  task_health INTEGER;
  total_health INTEGER;
BEGIN
  -- Get average health of child loops
  SELECT COALESCE(AVG(health_score), 100)
  INTO child_health
  FROM loops
  WHERE parent_loop_id = loop_uuid AND status != 'cancelled';
  
  -- Get health based on task completion
  SELECT 
    CASE 
      WHEN COUNT(*) = 0 THEN 100
      ELSE (COUNT(*) FILTER (WHERE status = 'completed')::DECIMAL / COUNT(*)::DECIMAL * 100)::INTEGER
    END
  INTO task_health
  FROM tasks
  WHERE loop_id = loop_uuid AND status != 'cancelled';
  
  -- Average the two (or just use what's available)
  total_health := (child_health + task_health) / 2;
  
  RETURN total_health;
END;
$$ LANGUAGE plpgsql;

-- Function to determine health color
CREATE OR REPLACE FUNCTION get_health_color(score INTEGER)
RETURNS TEXT AS $$
BEGIN
  IF score >= 70 THEN RETURN 'green';
  ELSIF score >= 40 THEN RETURN 'yellow';
  ELSE RETURN 'red';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- TRIGGERS: Auto-update timestamps
-- ===========================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_loops_updated_at BEFORE UPDATE ON loops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Add more triggers as needed...

-- ===========================================
-- TRIGGERS: Activity Log Auto-Recording
-- ===========================================

CREATE OR REPLACE FUNCTION log_task_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO activity_log (event_type, event_data, project_id, loop_id, task_id, actor_id)
    SELECT 
      'task.created',
      jsonb_build_object('title', NEW.title, 'status', NEW.status),
      l.project_id,
      NEW.loop_id,
      NEW.id,
      NEW.created_by
    FROM loops l WHERE l.id = NEW.loop_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != NEW.status THEN
      INSERT INTO activity_log (event_type, event_data, project_id, loop_id, task_id, actor_id)
      SELECT 
        'task.status_changed',
        jsonb_build_object('title', NEW.title, 'old_status', OLD.status, 'new_status', NEW.status),
        l.project_id,
        NEW.loop_id,
        NEW.id,
        NEW.created_by -- ideally this would be current user
      FROM loops l WHERE l.id = NEW.loop_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_task_activity AFTER INSERT OR UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION log_task_changes();

-- ===========================================
-- ROW LEVEL SECURITY
-- ===========================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE loops ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Users can only see their organization's data
CREATE POLICY org_isolation ON projects
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Similar policies for other tables...
```

---

## Design System

### Colors

```javascript
// design-tokens.js
export const colors = {
  // Primary palette
  charcoal: '#1a1a1a',
  
  // Status colors (muted, sophisticated)
  status: {
    green: '#10b981',
    yellow: '#f59e0b', 
    red: '#ef4444',
    gray: '#9ca3af'
  },
  
  // Grays
  gray: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717'
  },
  
  // Backgrounds
  background: {
    primary: '#ffffff',
    secondary: '#fafafa',
    card: '#ffffff'
  },
  
  // Text
  text: {
    primary: '#1a1a1a',
    secondary: '#6b7280',
    muted: '#9ca3af'
  }
}
```

### Typography

```javascript
// Typography scale
export const typography = {
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  
  sizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem' // 30px
  },
  
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  }
}
```

### Shadows

```javascript
// Shadows - barely perceptible, premium feel
export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.03)',
  DEFAULT: '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
  md: '0 4px 6px rgba(0, 0, 0, 0.04), 0 2px 4px rgba(0, 0, 0, 0.02)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.04), 0 4px 6px rgba(0, 0, 0, 0.02)'
}
```

### Component Patterns

```jsx
// Card component pattern
<div className="bg-white rounded-lg shadow-sm p-4">
  {/* Content */}
</div>

// Status dot
<span className={`w-2 h-2 rounded-full ${
  status === 'green' ? 'bg-emerald-500' :
  status === 'yellow' ? 'bg-amber-500' :
  'bg-red-500'
}`} />

// Progress bar
<div className="h-0.5 bg-gray-100 rounded-full overflow-hidden">
  <div 
    className={`h-full rounded-full ${colorClass}`}
    style={{ width: `${percentage}%` }}
  />
</div>

// Button - Primary
<button className="px-4 py-2 bg-charcoal text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
  Action
</button>

// Button - Secondary
<button className="px-4 py-2 border border-gray-300 text-charcoal rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
  Secondary
</button>
```

---

## Folder Structure

```
Hooomz_OS/
├── client/                          # React frontend
│   ├── public/
│   │   ├── favicon.ico
│   │   └── manifest.json            # PWA manifest
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                  # Base UI components
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── StatusDot.jsx
│   │   │   │   ├── ProgressBar.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Checkbox.jsx
│   │   │   │   └── index.js
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── BottomNav.jsx
│   │   │   │   ├── Header.jsx
│   │   │   │   └── PageContainer.jsx
│   │   │   ├── projects/
│   │   │   │   ├── ProjectCard.jsx
│   │   │   │   ├── ProjectHealth.jsx
│   │   │   │   └── ProjectStats.jsx
│   │   │   ├── loops/
│   │   │   │   ├── LoopCard.jsx
│   │   │   │   ├── LoopTree.jsx
│   │   │   │   └── LoopHealth.jsx
│   │   │   ├── tasks/
│   │   │   │   ├── TaskItem.jsx
│   │   │   │   ├── TaskList.jsx
│   │   │   │   └── TaskChecklist.jsx
│   │   │   ├── time/
│   │   │   │   ├── TimeTracker.jsx
│   │   │   │   └── TimeEntry.jsx
│   │   │   └── daily/
│   │   │       ├── SystemCheck.jsx
│   │   │       └── TodayFocus.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Today.jsx
│   │   │   ├── Projects.jsx
│   │   │   ├── ProjectDetail.jsx
│   │   │   ├── LoopDetail.jsx
│   │   │   ├── Estimates.jsx
│   │   │   ├── EstimateBuilder.jsx
│   │   │   ├── Clients.jsx
│   │   │   ├── Training.jsx
│   │   │   ├── Settings.jsx
│   │   │   ├── Login.jsx
│   │   │   └── NotFound.jsx
│   │   ├── hooks/
│   │   │   ├── useProjects.js
│   │   │   ├── useLoops.js
│   │   │   ├── useTasks.js
│   │   │   ├── useTimeTracking.js
│   │   │   ├── useActivityLog.js
│   │   │   └── useAuth.js
│   │   ├── services/
│   │   │   ├── api.js               # Axios instance
│   │   │   ├── projects.js
│   │   │   ├── loops.js
│   │   │   ├── tasks.js
│   │   │   ├── time.js
│   │   │   └── auth.js
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ProjectContext.jsx
│   │   ├── utils/
│   │   │   ├── formatters.js
│   │   │   ├── validators.js
│   │   │   └── constants.js
│   │   ├── styles/
│   │   │   ├── design-tokens.js
│   │   │   └── index.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── server/                          # Express backend
│   ├── src/
│   │   ├── routes/
│   │   │   ├── projects.js
│   │   │   ├── loops.js
│   │   │   ├── tasks.js
│   │   │   ├── time.js
│   │   │   ├── estimates.js
│   │   │   ├── files.js
│   │   │   ├── contacts.js
│   │   │   └── activity.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── validation.js
│   │   │   └── errorHandler.js
│   │   ├── services/
│   │   │   ├── healthCalculator.js
│   │   │   └── activityLogger.js
│   │   ├── utils/
│   │   │   └── supabase.js
│   │   └── index.js
│   ├── package.json
│   └── .env.example
│
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       ├── 002_functions.sql
│       └── 003_seed_data.sql
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── DESIGN_SYSTEM.md
│   └── MODULES.md
│
├── .gitignore
├── package.json                     # Root workspace config
└── README.md
```

---

## Module Tier Structure

### CORE (Foundation - Always Active)

| Module | Purpose | Tables |
|--------|---------|--------|
| Projects | Top-level container | projects |
| Loops | Flexible nested organization | loops |
| Tasks | Work items inside loops | tasks |
| Activity Log | Immutable event stream | activity_log |
| Contacts | People connected to projects | contacts, project_contacts |
| Users | Role-based access | users, organizations |

### ESSENTIAL (Day-to-Day Operations)

| Module | Purpose |
|--------|---------|
| Schedule/Calendar | Timeline visualization |
| Daily Log | Daily conditions & progress |
| Time Tracking | Start/stop timers on tasks |
| Photos | Before/during/after documentation |
| Files | Document storage |
| Estimates | Quote creation |
| Invoices | Billing (future) |
| Messages/Notifications | Communication |

### STANDARD (Most Will Use)

| Module | Purpose |
|--------|---------|
| My Crew | Team management |
| My Subs | Subcontractor profiles |
| Client Portal | Homeowner-facing view |
| Checklists | Quality control |
| Templates | Reusable patterns |
| Permit Tracking | Inspection scheduling |
| Reports | Analytics |

### SPECIALIZED (Toggle On/Off)

| Module | Purpose |
|--------|---------|
| Training Library | Field guides |
| Apprentice Log | Learning progress |
| Pre-Construction | Planning phase tools |
| Warranty Management | Post-completion tracking |

---

## Key Screens to Build (Priority Order)

### Phase 1: Core Dashboard & Projects

1. **Project Dashboard (Mobile)** - Grid of project cards with health scores
2. **Project Dashboard (Desktop)** - Sidebar nav + project grid
3. **Single Project View** - Health overview + active loops
4. **Loop Detail View** - Tasks within a loop

### Phase 2: Daily Operations

5. **Today View** - System check + focus items + tasks
6. **Time Tracker** - Active timer with percentage visualization
7. **Task Detail** - Checklist, photos, notes

### Phase 3: Client & Estimates

8. **Estimate Builder** - Split panel editor
9. **Client Portal** - Homeowner view (separate route/auth)

### Phase 4: Polish & Extended

10. **Training/Field Guides** - Learning module
11. **Empty States** - First-time user experience
12. **Settings** - User preferences

---

## API Endpoints

### Projects
```
GET    /api/projects              - List all projects
GET    /api/projects/:id          - Get single project with loops
POST   /api/projects              - Create project
PUT    /api/projects/:id          - Update project
DELETE /api/projects/:id          - Soft delete

GET    /api/projects/:id/health   - Calculate project health
GET    /api/projects/:id/activity - Get activity feed
```

### Loops
```
GET    /api/projects/:projectId/loops     - Get loop tree
POST   /api/projects/:projectId/loops     - Create loop
PUT    /api/loops/:id                      - Update loop
DELETE /api/loops/:id                      - Delete loop

POST   /api/loops/:id/reorder              - Change display order
GET    /api/loops/:id/health               - Calculate loop health
```

### Tasks
```
GET    /api/loops/:loopId/tasks   - Get tasks in loop
POST   /api/loops/:loopId/tasks   - Create task
PUT    /api/tasks/:id             - Update task
DELETE /api/tasks/:id             - Delete task

POST   /api/tasks/:id/complete    - Mark complete
POST   /api/tasks/:id/checklist   - Update checklist items
```

### Time Tracking
```
GET    /api/time/active           - Get active timer (if any)
POST   /api/tasks/:taskId/time/start  - Start timer
POST   /api/time/:id/stop         - Stop timer

GET    /api/projects/:id/time     - Get time entries for project
GET    /api/time/report           - Time report with filters
```

### Activity Log
```
GET    /api/projects/:id/activity - Project activity feed
GET    /api/loops/:id/activity    - Loop activity feed
GET    /api/activity/recent       - Recent activity across all
```

---

## Build Commands

### Initial Setup
```bash
# Create project directory
mkdir D:\Hooomz_OS
cd D:\Hooomz_OS

# Initialize monorepo
npm init -y

# Create client (React + Vite)
npm create vite@latest client -- --template react
cd client
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install react-router-dom axios lucide-react date-fns
npm install @supabase/supabase-js

# Create server
cd ..
mkdir server
cd server
npm init -y
npm install express cors dotenv @supabase/supabase-js joi
npm install -D nodemon

# Back to root
cd ..
```

### Development
```bash
# Run both client and server
npm run dev

# Run client only
cd client && npm run dev

# Run server only
cd server && npm run dev
```

### Database Setup
```bash
# In Supabase dashboard:
# 1. Create new project
# 2. Go to SQL Editor
# 3. Run migrations in order:
#    - 001_initial_schema.sql
#    - 002_functions.sql
#    - 003_seed_data.sql
```

---

## Environment Variables

### Client (.env)
```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:3001
```

### Server (.env)
```
SUPABASE_URL=your-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=3001
NODE_ENV=development
```

---

## Design Reference Images

The following Gemini-generated images should be used as visual targets:

1. Project Dashboard (Mobile) - Clean card grid with health scores
2. Project Dashboard (Desktop) - Sidebar + grid layout
3. Single Project View - Health + stats + loops
4. Today View - System check + focus + tasks
5. Loop Detail / Task List - Refined checkbox list
6. Time Tracker - White background, percentage ring
7. Client Portal - Homeowner-friendly progress view
8. Estimate Builder - Split panel editor
9. Training Module - Field guide library
10. Empty State - Welcoming first-run experience

---

## Critical Design Rules

1. **Shadows**: Barely perceptible (rgba(0,0,0,0.03-0.04))
2. **Typography**: Clear hierarchy, Inter/SF Pro style
3. **Icons**: Refined line art, consistent stroke, Lucide
4. **Spacing**: Intentional, not sparse - balanced whitespace
5. **Colors**: Muted but meaningful status indicators
6. **Background**: Pure white (#FFFFFF) for all screens
7. **Elements**: Every checkbox, dot, bar must feel polished
8. **No**: Gradients, heavy borders, chunky elements

---

## Notes for Claude Code

- Start with the database schema - get Supabase set up first
- Build UI components before pages (bottom-up)
- Match the Gemini mockup aesthetic precisely
- Test on mobile viewport early and often
- Activity Log should record events automatically via triggers
- Health scores calculate from child loops and tasks
- Time tracker shows percentage of allocated time, not just duration
- Keep the codebase simple - this is for a 1-10 person company
