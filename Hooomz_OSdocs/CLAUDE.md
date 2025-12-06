# CLAUDE.md - Hooomz OS Build Instructions

## Project Overview

You are building **Hooomz OS**, a construction project management platform for small residential contractors (1-10 person companies). The project should be saved to `D:\Hooomz_OS`.

This is a ground-up rebuild with a revolutionary "Loops" architecture that matches how contractors actually think about work.

---

## The Three Pillars (MUST UNDERSTAND)

### 1. Activity Log = The Heartbeat
- Everything is an event written to an immutable log
- Not a user-facing feature—it's the database foundation
- All modules read from and write to this single event stream
- Enables complete traceability through project lifecycle

### 2. Loops = The Identity  
- Flexible nested containers (not rigid hierarchies)
- Can represent: phases, areas, trades, rooms, zones—whatever fits
- Can nest infinitely deep
- Color status (🟢🟡🔴) bubbles up through nesting
- This is THE differentiator

### 3. Modules = Views/Interfaces
- Not silos—different lenses on the same data
- All write to the same event stream
- All reference the same loop structure

---

## Tech Stack

```
Frontend: React 18 + Vite + TailwindCSS + Lucide Icons
Backend: Node.js + Express  
Database: Supabase (PostgreSQL)
Auth: Supabase Auth
Hosting: Vercel (frontend)
PWA: Yes
```

---

## Design System (CRITICAL)

The design MUST match these specifications exactly:

### Colors
```javascript
charcoal: '#1a1a1a'           // Primary text and actions
status.green: '#10b981'        // Healthy
status.yellow: '#f59e0b'       // Warning  
status.red: '#ef4444'          // Critical
gray.50: '#fafafa'             // Secondary backgrounds
gray.500: '#737373'            // Secondary text
```

### Shadows (BARELY PERCEPTIBLE)
```css
shadow-card: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)
```
Shadows should feel like a gentle lift, not a drop. Almost invisible.

### Typography
- Font: Inter (or system sans-serif fallback)
- Clear hierarchy: titles semibold, body regular
- Muted grays for secondary text

### Key Rules
1. Pure white backgrounds (#FFFFFF)
2. No gradients
3. No heavy borders
4. Status dots are small and refined (8px)
5. Progress bars are thin (2-3px)
6. Checkboxes are subtle rounded squares (18px)
7. Icons are refined line-art (Lucide, 1.5px stroke)
8. Whitespace is intentional, not sparse

---

## Folder Structure

```
Hooomz_OS/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/          # Button, Card, StatusDot, ProgressBar, etc.
│   │   │   ├── layout/      # Sidebar, BottomNav, PageContainer
│   │   │   ├── projects/    # ProjectCard, ProjectHealth
│   │   │   ├── loops/       # LoopCard, LoopTree
│   │   │   ├── tasks/       # TaskItem, TaskList, TaskChecklist
│   │   │   └── time/        # TimeTracker
│   │   ├── pages/           # Dashboard, Today, Projects, etc.
│   │   ├── hooks/           # useProjects, useLoops, useTasks, etc.
│   │   ├── services/        # API calls
│   │   ├── context/         # AuthContext
│   │   └── styles/          # design-tokens.js
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── src/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── services/
│   └── package.json
├── supabase/
│   └── migrations/
└── README.md
```

---

## Database Schema (Core Tables)

### organizations
```sql
id, name, slug, settings, created_at, updated_at
```

### users
```sql
id, organization_id, email, full_name, role, avatar_url, settings, created_at
```

### projects
```sql
id, organization_id, name, address, description, project_type
client_name, client_email, client_phone
status ('intake','estimate','contract','production','invoice','paid','warranty','archived')
health_score (0-100, calculated)
start_date, target_completion, actual_completion
estimated_budget, contract_value
created_by, created_at, updated_at, deleted_at
```

### loops
```sql
id, project_id, parent_loop_id (self-reference for nesting)
name, loop_type ('phase','area','trade','room','zone','custom')
status ('pending','active','blocked','completed','cancelled')
health_color ('green','yellow','red','gray')
health_score (0-100)
planned_start, planned_end, actual_start, actual_end
display_order, is_collapsed
created_at, updated_at
```

### tasks
```sql
id, loop_id, parent_task_id (for subtasks)
title, description, status, priority (1-4)
assigned_to, estimated_hours, actual_hours
due_date, completed_at, display_order, labels[]
created_by, created_at, updated_at
```

### activity_log (IMMUTABLE)
```sql
id, event_type, event_data (JSONB)
organization_id, project_id, loop_id, task_id
actor_id, actor_name, created_at
-- NO updated_at - events are immutable
```

### time_entries
```sql
id, task_id, user_id
start_time, end_time, duration_minutes
allocated_minutes (for percentage tracking)
notes, created_at, updated_at
```

---

## Build Order

### Phase 1: Foundation
1. Project setup (Vite, Tailwind, folder structure)
2. Design system components (Button, Card, StatusDot, ProgressBar, Checkbox)
3. Layout components (Sidebar, BottomNav, PageContainer)
4. Supabase setup and migrations

### Phase 2: Core Screens (Mobile First)
5. Project Dashboard - card grid with health scores
6. Single Project View - health + stats + loops list
7. Loop Detail - task list within a loop
8. Task interactions - complete, expand checklist

### Phase 3: Daily Operations
9. Today View - system check, focus items, tasks
10. Time Tracker - percentage ring, active timer

### Phase 4: Desktop & Polish
11. Desktop layouts (sidebar nav)
12. Empty states
13. Settings

### Phase 5: Extended
14. Estimate builder
15. Client Portal (separate auth context)
16. Training/Field Guides

---

## Component Patterns

### StatusDot
```jsx
<span className={`w-2 h-2 rounded-full ${
  status === 'green' ? 'bg-emerald-500' :
  status === 'yellow' ? 'bg-amber-500' : 'bg-red-500'
}`} />
```

### ProgressBar
```jsx
<div className="h-0.5 bg-gray-100 rounded-full overflow-hidden">
  <div className={`h-full rounded-full ${colorClass}`} style={{width: `${value}%`}} />
</div>
```

### Card
```jsx
<div className="bg-white rounded-lg shadow-card p-4">
  {children}
</div>
```

### ProjectCard
```jsx
<Card className="hover:shadow-elevated transition-shadow">
  <div className="flex justify-between">
    <div>
      <h3 className="font-semibold text-charcoal">{name}</h3>
      <p className="text-sm text-gray-500">{client}</p>
    </div>
    <div className="flex items-center gap-1.5">
      <span className="text-lg font-semibold">{health}</span>
      <StatusDot status={healthColor} />
    </div>
  </div>
  <ProgressBar value={health} color={healthColor} className="mt-3" />
</Card>
```

---

## Time Tracker Specifics

The time tracker shows **percentage of allocated time**, not just elapsed duration:

```jsx
// Ring showing 58% of allocated time used
<div className="relative">
  <svg className="w-40 h-40">
    {/* Background ring */}
    <circle stroke="#e5e7eb" fill="none" strokeWidth="6" r="70" cx="80" cy="80" />
    {/* Progress ring */}
    <circle 
      stroke="#10b981" 
      fill="none" 
      strokeWidth="6" 
      r="70" 
      cx="80" 
      cy="80"
      strokeDasharray={2 * Math.PI * 70}
      strokeDashoffset={2 * Math.PI * 70 * (1 - percentage/100)}
      className="transition-all"
    />
  </svg>
  <div className="absolute inset-0 flex flex-col items-center justify-center">
    <span className="text-3xl font-semibold text-charcoal">58%</span>
    <span className="text-sm text-gray-500">02:34:18</span>
  </div>
</div>
```

Background is WHITE, not dark.

---

## Health Score Calculation

Health bubbles up from children:

```javascript
function calculateLoopHealth(loop) {
  // Average of child loop health scores
  const childHealth = loop.children.length > 0
    ? average(loop.children.map(c => c.health_score))
    : 100;
  
  // Task completion rate
  const completedTasks = loop.tasks.filter(t => t.status === 'completed').length;
  const totalTasks = loop.tasks.filter(t => t.status !== 'cancelled').length;
  const taskHealth = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 100;
  
  // Combined
  return Math.round((childHealth + taskHealth) / 2);
}

function getHealthColor(score) {
  if (score >= 70) return 'green';
  if (score >= 40) return 'yellow';
  return 'red';
}
```

---

## Activity Log Auto-Recording

Use database triggers to auto-record events:

```sql
CREATE TRIGGER log_task_activity 
AFTER INSERT OR UPDATE ON tasks
FOR EACH ROW EXECUTE FUNCTION log_task_changes();
```

Event types:
- `task.created`
- `task.status_changed`
- `task.completed`
- `time.started`
- `time.stopped`
- `photo.uploaded`
- `loop.created`
- `loop.completed`

---

## API Patterns

### Response Format
```javascript
// Success
{ data: {...} }

// Error  
{ error: "Error message" }
```

### Key Endpoints
```
GET  /api/projects              - List projects
GET  /api/projects/:id          - Project with loops
POST /api/projects              - Create project

GET  /api/projects/:id/loops    - Loop tree
POST /api/loops                 - Create loop
PUT  /api/loops/:id             - Update loop

GET  /api/loops/:id/tasks       - Tasks in loop
POST /api/tasks                 - Create task
PUT  /api/tasks/:id             - Update task
POST /api/tasks/:id/complete    - Mark complete

POST /api/time/start            - Start timer
POST /api/time/:id/stop         - Stop timer

GET  /api/projects/:id/activity - Activity feed
```

---

## Mobile Navigation

```jsx
// Bottom nav - 3 items only
<nav className="fixed bottom-0 left-0 right-0 bg-white border-t">
  <div className="flex justify-around h-14">
    <NavItem icon={Home} label="Home" />
    <NavItem icon={Calendar} label="Today" />
    <NavItem icon={User} label="Profile" />
  </div>
</nav>
```

---

## Desktop Sidebar

```jsx
<aside className="w-60 bg-white border-r h-screen">
  <Logo className="p-4" />
  <nav className="p-3 space-y-1">
    <SidebarItem icon={Home} label="Dashboard" active />
    <SidebarItem icon={Calendar} label="Today" />
    <SidebarItem icon={Folder} label="Projects" />
    <SidebarItem icon={Users} label="Clients" />
    <SidebarItem icon={Archive} label="Archive" />
    <SidebarItem icon={Settings} label="Settings" />
  </nav>
</aside>
```

---

## Quality Checklist

Before considering any component complete:

- [ ] Shadows are barely perceptible
- [ ] Typography hierarchy is clear
- [ ] Status dots are small (8px) and refined
- [ ] Progress bars are thin (2px)
- [ ] Checkboxes are subtle
- [ ] Icons are consistent Lucide line-art
- [ ] Spacing is intentional
- [ ] Works on mobile viewport
- [ ] No heavy borders or gradients
- [ ] Feels premium, not templated

---

## Reference Files

In the build package:
- `HOOOMZ_OS_BUILD_INSTRUCTIONS.md` - Full spec with database schema
- `DESIGN_SYSTEM.md` - Complete design system reference
- `GEMINI_IMAGE_PROMPTS.md` - Visual targets for key screens
- `INDUSTRY_PAIN_POINTS.md` - Context on problems being solved

---

## Remember

1. **Loops are the identity** - not an afterthought
2. **Activity Log is the heartbeat** - everything is an event
3. **Design is premium** - Apple-level refinement
4. **Mobile first** - field workers need it
5. **Small contractors** - keep it simple, no enterprise bloat
