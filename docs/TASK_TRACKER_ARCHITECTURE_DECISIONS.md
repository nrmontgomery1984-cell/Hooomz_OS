# HOOOMZ OS TASK TRACKER: ARCHITECTURAL DECISION DOCUMENT

## Document Purpose
This document explains the critical architectural decisions for the Hooomz OS task tracker category/subcategory/task hierarchy. These decisions will determine whether the system can elegantly sync across Field Guide, Sales/Estimates, and Task/Time Tracking - or whether it becomes a maintenance nightmare of mapping tables and edge cases.

**Author:** Claude Code
**Date:** December 8, 2025
**Status:** DRAFT FOR REVIEW

---

## PART 1: THE FUNDAMENTAL TENSION

### The Problem We're Solving
Hooomz OS needs ONE category system that serves THREE very different purposes:

| Purpose | What It Needs | Example |
|---------|---------------|---------|
| **Field Guide** | Educational structure for learning construction | "How do I tape drywall joints?" |
| **Estimates** | Pricing structure for costing work | "How much does drywall cost per sq ft?" |
| **Task Tracking** | Work breakdown for scheduling/tracking | "Hang drywall in Living Room - 3 hours" |

The trap: Creating three separate systems that "map to each other" creates technical debt that compounds forever.

### The Hooomz First Principle at Stake
**"Everything is a loop within a loop"**

If we get the hierarchy wrong, we break this principle. The category system must allow:
- A Field Guide module to exist as a "learning loop"
- An estimate line item to exist as a "pricing loop"
- A task to exist as a "work loop"
- All three to reference the SAME underlying category without translation layers

---

## PART 2: ANALYSIS OF CURRENT STATE

### What Already Exists

#### 1. Scope Categories (`scopeCategories.js`)
**20 trade-based categories** using 2-letter codes:
```
SW (Site Work), FN (Foundation), FS (Framing-Structural), FI (Framing-Interior),
RF (Roofing), EE (Exterior Envelope), IA (Insulation & Air Sealing), EL (Electrical),
PL (Plumbing), HV (HVAC), DW (Drywall), PT (Painting), FL (Flooring), TL (Tile),
FC (Finish Carpentry), CM (Cabinetry & Millwork), SR (Stairs & Railings),
EF (Exterior Finishes), FZ (Final Completion), GN (General/Meta)
```

Each has **subcategories** like:
- `EL-01`: Rough-In
- `EL-02`: Trim/Finish
- `EL-03`: Service & Panel

#### 2. Field Guide Categories
**5 educational groupings:**
- Safety & Compliance (OH-01 through OH-05)
- Framing & Structure (FF-01 through FF-08)
- Exterior & Weather (EW-01 through EW-11)
- Interior Finish (IF-01 through IF-07)
- Tile (TI-01 through TI-05)

**Problem:** These DON'T map cleanly to the scope categories. "FF-03: Wall Framing" could be `FS` (structural) or `FI` (interior partition) depending on context.

#### 3. Room Types for Intake
**16 room types** that drive renovation scoping:
```
kitchen, primary_bath, secondary_bath, powder_room, living_room, dining_room,
bedrooms, basement, laundry, mudroom, home_office, garage, exterior,
windows_doors, roofing, addition
```

Each room maps to a PRIMARY category (e.g., kitchen → CM), but kitchen work involves EL, PL, CM, DW, PT, FL, TL...

#### 4. Estimate Line Items
Currently broken down by **room + trade percentage**:
- Kitchen gets 12% to EL, 18% to PL, 25% to CM, etc.

### The Mapping Problem Visualized

```
FIELD GUIDE                    SCOPE CATEGORIES                    ROOMS
────────────                   ────────────────                    ─────
FF-03 Wall Framing ──────────→ FS Framing-Structural ←───────────→ addition
                   └─────────→ FI Framing-Interior  ←───────────→ basement

IF-01 Drywall Install ───────→ DW Drywall ←─────────────────────→ ALL ROOMS

EW-04 Window Install ────────→ EE Exterior Envelope ←───────────→ windows_doors
                     └───────→ FC Finish Carpentry (interior trim)
```

**This is a MANY-TO-MANY relationship that will become unmaintainable.**

---

## PART 3: THE ARCHITECTURAL DECISION

### Decision: THREE-AXIS CATEGORIZATION SYSTEM

Instead of trying to make one hierarchy serve all purposes, I propose a **three-axis** system where any work item can be located by:

```
AXIS 1: TRADE (who does this work?)
AXIS 2: PHASE (when in construction sequence?)
AXIS 3: LOCATION (where in the building?)
```

Every task, estimate line item, and Field Guide module can be tagged on ALL THREE axes. This eliminates the mapping problem because we're not forcing a tree structure onto a multi-dimensional reality.

### Axis 1: TRADE (The Craftsperson Perspective)

**Purpose:** Who is qualified/responsible for this work?

This becomes our PRIMARY hierarchy because it's the most stable:
- A plumber is always a plumber
- Electrical work always requires an electrician
- This is how subtrades are contracted

**Proposed Trade Categories (refined from existing):**

| Code | Trade | Typical Subtrade |
|------|-------|------------------|
| `DM` | Demolition | General/Laborer |
| `SW` | Site Work | Excavation contractor |
| `FN` | Foundation | Concrete contractor |
| `FR` | Framing | Framing crew |
| `RF` | Roofing | Roofing contractor |
| `EX` | Exterior | Siding contractor |
| `WD` | Windows & Doors | Window installer |
| `IN` | Insulation | Insulation contractor |
| `EL` | Electrical | Electrician |
| `PL` | Plumbing | Plumber |
| `HV` | HVAC | HVAC technician |
| `DW` | Drywall | Drywall crew |
| `PT` | Painting | Painter |
| `FL` | Flooring | Flooring installer |
| `TL` | Tile | Tile setter |
| `FC` | Finish Carpentry | Finish carpenter |
| `CB` | Cabinetry | Cabinet installer |
| `CT` | Countertops | Counter fabricator |
| `FX` | Fixtures | Various (often PL/EL) |
| `CL` | Cleaning | Cleaner |
| `PM` | Project Management | GC/Superintendent |

**Subcategories within Trade:** Only where truly distinct skillsets exist
- `EL-RO`: Electrical Rough-In (different crew than trim)
- `EL-TR`: Electrical Trim/Finish
- `PL-RO`: Plumbing Rough-In
- `PL-TR`: Plumbing Trim/Finish
- `DW-HG`: Drywall Hanging
- `DW-FN`: Drywall Finishing/Taping

### Axis 2: PHASE (The Construction Sequence Perspective)

**Purpose:** When in the build sequence does this happen?

This drives scheduling and dependencies. A task's phase determines what must come BEFORE and AFTER.

**Proposed Phases (construction reality):**

| Order | Phase Code | Phase Name | Description |
|-------|------------|------------|-------------|
| 1 | `PH-DM` | Demolition | Tear out existing |
| 2 | `PH-SS` | Site & Structure | Foundation, framing, roof |
| 3 | `PH-EW` | Envelope & Weather | Exterior, windows, weatherproofing |
| 4 | `PH-RO` | Rough-In | MEP rough (electrical, plumbing, HVAC) |
| 5 | `PH-IS` | Insulation & Sealing | Insulation, air barrier |
| 6 | `PH-DW` | Drywall | Hanging and finishing |
| 7 | `PH-PR` | Prime & Prep | Priming, floor prep |
| 8 | `PH-FN` | Finish | Trim, cabinets, flooring, paint |
| 9 | `PH-FX` | Fixtures | Final fixtures, appliances |
| 10 | `PH-PL` | Punch List | Touch-ups, corrections |
| 11 | `PH-CL` | Closeout | Cleaning, final inspection |

**Key insight:** Phases are CROSS-TRADE. Multiple trades work during "Finish" phase. The INTERSECTION of Trade + Phase = specific work type.

### Axis 3: LOCATION (The Spatial Perspective)

**Purpose:** Where in the building is this work happening?

This is the "loop binding" from the quantum task spec. Location can be:
- A specific room (Living Room)
- A floor (1st Floor)
- A zone (West Wing)
- The whole building (Exterior)
- A system (Main Electrical Panel)

**Location is NOT a fixed hierarchy.** It's a flexible tagging system:

```
Building
├── Floor: 1st Floor
│   ├── Room: Kitchen
│   ├── Room: Living Room
│   └── Room: Dining Room
├── Floor: 2nd Floor
│   ├── Room: Primary Bedroom
│   │   └── Zone: Ensuite
│   └── Room: Secondary Bedroom
├── System: Electrical
│   ├── Panel: Main Panel
│   └── Circuit: Kitchen 20A
└── Exterior
    ├── Zone: Front
    └── Zone: Rear
```

**For renovations:** Location = rooms selected in intake
**For new construction:** Location = building structure (defined later, "quantum state")

---

## PART 4: HOW THE THREE AXES INTERSECT

### The Intersection Model

Every work item exists at the intersection of Trade × Phase × Location:

```
┌─────────────────────────────────────────────────────────────┐
│                         LOCATION                            │
│                        (Kitchen)                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                       PHASE                          │  │
│  │                    (Rough-In)                        │  │
│  │  ┌────────────────────────────────────────────────┐ │  │
│  │  │                    TRADE                       │ │  │
│  │  │                 (Electrical)                   │ │  │
│  │  │                                                │ │  │
│  │  │   TASK: Run 20A circuit for kitchen island    │ │  │
│  │  │   • Field Guide: EL Electrical > Rough-In     │ │  │
│  │  │   • Estimate: EL-RO @ Kitchen rate            │ │  │
│  │  │   • Hours: 2.5                                 │ │  │
│  │  │   • Materials: 12/2 wire, box, breaker        │ │  │
│  │  │                                                │ │  │
│  │  └────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### How This Solves the Three-System Problem

#### For Field Guide:
- Organize primarily by **Trade** (what you're learning)
- Secondary organization by **Phase** (when you'd do this)
- Field Guide modules link to: `trade_code`, optionally `phase_code`

```
Field Guide: Electrical Rough-In
├── Trade: EL (Electrical)
├── Phase: PH-RO (Rough-In)
├── Location: N/A (applies to any location)
└── Content: How to run circuits, box placement, code requirements...
```

#### For Estimates:
- Line items tagged by **Trade** (for subtrade pricing)
- Adjusted by **Location** (kitchen electrical costs more than bedroom)
- **Phase** implied by trade (EL-RO = rough-in phase)

```
Estimate Line Item: Electrical Rough-In - Kitchen
├── Trade: EL-RO
├── Location: Kitchen
├── Phase: PH-RO (derived from trade)
├── Base Price: $2,400
└── Multipliers: Build tier (1.25) × Room complexity (1.3)
```

#### For Tasks:
- Created from templates based on **Trade + Phase**
- Bound to **Location** (specific room/area)
- Can be filtered/viewed by ANY axis

```
Task Instance: Run dedicated circuit for island
├── Template: EL-RO-CIRCUIT (from trade/phase)
├── Trade: EL-RO
├── Phase: PH-RO
├── Location: Kitchen (bound to room loop)
├── Assigned: ABC Electric
├── Estimated Hours: 2.5
├── Status: Pending
└── Depends On: FR tasks in Kitchen (framing must be done)
```

---

## PART 5: THE TASK HIERARCHY REFINED

### Task Template Structure

Based on the three-axis model, here's how task templates should be structured:

```
TASK TEMPLATE
├── id: "tpl-el-ro-circuit"
├── name: "Run dedicated circuit"
├── trade_code: "EL-RO"
├── phase_code: "PH-RO"
├── description: "Install dedicated 20A circuit from panel to location"
├── field_guide_links: ["EL-03", "EL-05"]  // Related learning modules
├── default_hours: 2.5
├── materials_template: [
│   { name: "12/2 NM wire", unit: "ft", qty_per_instance: 50 },
│   { name: "Single gang box", unit: "each", qty_per_instance: 1 },
│   { name: "20A breaker", unit: "each", qty_per_instance: 1 }
│ ]
├── checklist_template: [
│   "Verify panel capacity",
│   "Plan wire route",
│   "Install box",
│   "Run wire",
│   "Make connections",
│   "Label circuit"
│ ]
├── loop_binding: "per_room" | "per_floor" | "per_building" | "per_instance"
├── typical_quantity: 1
└── dependencies: {
    blocked_by_phases: ["PH-SS"],  // Must have framing
    blocks_phases: ["PH-IS"]       // Must be done before insulation
  }
```

### Task Instance Structure

When a template is instantiated:

```
TASK INSTANCE
├── id: "task-abc123"
├── template_id: "tpl-el-ro-circuit"
├── project_id: "proj-xyz"
│
├── AXES (inherited + specific):
│   ├── trade_code: "EL-RO"
│   ├── phase_code: "PH-RO"
│   └── location_id: "loc-kitchen-01"  // Specific room
│
├── INSTANCE DATA:
│   ├── name: "Run dedicated circuit for island" // Can override template
│   ├── estimated_hours: 2.5
│   ├── actual_hours: 0
│   ├── status: "not_started"
│   ├── priority: 3
│   ├── due_date: "2025-02-15"
│   └── assigned_to: "contact-abc-electric"
│
├── MATERIALS (copied from template, editable):
│   └── [...material instances with got_it status]
│
├── CHECKLIST (copied from template, editable):
│   └── [...checklist items with completion status]
│
└── DEPENDENCIES (calculated from template + project):
    ├── blocked_by: ["task-framing-kitchen"]
    └── blocks: ["task-insulation-kitchen"]
```

---

## PART 6: THE "LOOP" IN THIS CONTEXT

### Redefining "Loop" for Hooomz OS

In the original spec, "loop" meant a nested container. Let me clarify how this maps to the three-axis model:

**Loop = A filtered view of tasks that share a common axis value**

```
"Kitchen Loop" = All tasks WHERE location = Kitchen
"Electrical Loop" = All tasks WHERE trade = EL*
"Rough-In Loop" = All tasks WHERE phase = PH-RO
"Today's Loop" = All tasks WHERE due_date = today
```

The SAME tasks can appear in MULTIPLE loops simultaneously. This is the power of the three-axis model - you're not forcing tasks into one hierarchy.

### Loop Types in the UI

| Loop Type | Primary Axis | Secondary Grouping | Use Case |
|-----------|--------------|-------------------|----------|
| Location Loop | Location | Phase, then Trade | "Show me all Kitchen work" |
| Trade Loop | Trade | Location, then Phase | "Show me all Electrical work" |
| Phase Loop | Phase | Trade, then Location | "Show me all Rough-In work" |
| Schedule Loop | Due Date | Priority, then Trade | "Show me this week's work" |
| Assignee Loop | Assigned To | Phase, then Location | "Show me Bob's tasks" |

### The Nested Loop Architecture

The "loops within loops" principle still applies:

```
PROJECT (outermost loop)
├── PHASE LOOP: Rough-In
│   ├── TRADE LOOP: Electrical
│   │   ├── LOCATION LOOP: Kitchen
│   │   │   └── Task: Run island circuit
│   │   │   └── Task: Run dishwasher circuit
│   │   └── LOCATION LOOP: Primary Bath
│   │       └── Task: Run exhaust fan circuit
│   └── TRADE LOOP: Plumbing
│       └── ...
└── PHASE LOOP: Finish
    └── ...
```

**OR** the same data viewed differently:

```
PROJECT (outermost loop)
├── LOCATION LOOP: Kitchen
│   ├── PHASE LOOP: Demo
│   │   └── Task: Demo existing cabinets
│   ├── PHASE LOOP: Rough-In
│   │   └── Task: Run island circuit (EL)
│   │   └── Task: Run dishwasher circuit (EL)
│   │   └── Task: Rough plumbing for sink (PL)
│   └── PHASE LOOP: Finish
│       └── Task: Install cabinets (CB)
└── LOCATION LOOP: Primary Bath
    └── ...
```

**Same tasks, different views.** The three-axis model makes this possible without data duplication.

---

## PART 7: FIELD GUIDE INTEGRATION

### How Field Guide Maps to Trade/Phase

Each Field Guide module should be tagged with:

```
MODULE: "Drywall Finishing"
├── primary_trade: "DW-FN"
├── primary_phase: "PH-DW"
├── related_trades: ["PT"]  // Painting follows
├── related_phases: ["PH-PR"]  // Priming follows
└── room_relevance: "all"  // Applies to all rooms with drywall
```

### Linking Tasks to Learning

When a user is working on a task:

```
TASK: Tape and mud drywall joints (Kitchen)
├── trade_code: DW-FN
└── field_guide_recommendations:
    ├── Primary: "IF-02: Drywall Finishing" (exact match)
    ├── Related: "IF-03: Interior Painting" (next step)
    └── Context: "OH-03: Material Handling" (safety)
```

### Field Guide Categories Revised

To align with the three-axis model, Field Guide should be reorganized:

**By Trade (primary organization):**
```
📚 FIELD GUIDE
├── 🔨 Demolition & Site (DM, SW)
├── 🏗️ Structure (FN, FR, RF)
├── 🏠 Envelope (EX, WD, IN)
├── ⚡ Electrical (EL)
├── 🔧 Plumbing (PL)
├── 💨 HVAC (HV)
├── 📋 Drywall (DW)
├── 🎨 Painting (PT)
├── 🪵 Flooring (FL)
├── 🔲 Tile (TL)
├── 🚪 Finish Carpentry (FC)
├── 🗄️ Cabinetry (CB)
└── ⚠️ Safety & General (PM, OH)
```

**Within each trade, organized by Phase:**
```
⚡ Electrical
├── Rough-In Phase
│   ├── EL-01: Planning & Layout
│   ├── EL-02: Panel & Service
│   ├── EL-03: Running Cable
│   └── EL-04: Box Installation
├── Finish Phase
│   ├── EL-05: Device Installation
│   ├── EL-06: Fixture Installation
│   └── EL-07: Testing & Commissioning
└── Specialized
    ├── EL-08: Low Voltage Systems
    └── EL-09: Outdoor Electrical
```

---

## PART 8: ESTIMATE INTEGRATION

### Estimate Line Items as Proto-Tasks

An estimate line item IS essentially a task template with pricing attached:

```
ESTIMATE LINE ITEM
├── trade_code: "EL-RO"
├── phase_code: "PH-RO"
├── location: "Kitchen"
├── description: "Electrical rough-in"
├── quantity: 1
├── unit_price: 2400
├── labor_hours: 16
├── loop_binding: "per_room"
└── converts_to_template: "tpl-el-ro-kitchen"
```

### Conversion: Estimate → Tasks

When an estimate is accepted:

1. **Group line items by Trade + Phase + Location**
2. **Create task templates** (or use existing templates)
3. **Instantiate tasks** bound to locations
4. **Link back to estimate** for cost tracking

```javascript
// Pseudo-code
function convertEstimateToTasks(estimate) {
  const taskGroups = groupBy(estimate.lineItems,
    item => `${item.trade_code}-${item.phase_code}-${item.location_id}`
  );

  for (const [key, items] of taskGroups) {
    const template = findOrCreateTemplate(items[0]);
    const instance = createTaskInstance({
      template_id: template.id,
      project_id: estimate.project_id,
      location_id: items[0].location_id,
      estimate_line_item_ids: items.map(i => i.id),
      estimated_hours: sum(items, 'labor_hours'),
      estimated_cost: sum(items, 'total_price')
    });
  }
}
```

### Cost Tracking Through Tasks

Every task instance links back to estimate line items:

```
TASK: Electrical Rough-In (Kitchen)
├── estimate_line_items: ["eli-001", "eli-002"]
├── budgeted_cost: $2,400
├── budgeted_hours: 16
├── actual_hours: 14.5
├── actual_cost: $2,175  // (calculated from time entries)
└── variance: +$225 under budget
```

---

## PART 9: THE ROOM/LOCATION PROBLEM

### The Challenge

Renovations are scoped by ROOM, but work is done by TRADE. A "Kitchen Renovation" involves:
- Demolition (trade: DM)
- Electrical rough-in (trade: EL-RO)
- Plumbing rough-in (trade: PL-RO)
- HVAC (trade: HV)
- Drywall (trade: DW)
- Cabinets (trade: CB)
- Counters (trade: CT)
- Tile backsplash (trade: TL)
- Flooring (trade: FL)
- Painting (trade: PT)
- Trim (trade: FC)
- Fixtures (trade: FX)
- Electrical finish (trade: EL-TR)
- Plumbing finish (trade: PL-TR)

That's 14+ different trades for ONE room!

### The Solution: Room-Trade Matrix

For renovation pricing, we maintain a **Room-Trade Matrix** that defines what percentage of each trade applies to each room type:

```javascript
ROOM_TRADE_MATRIX = {
  kitchen: {
    DM: 0.08,   // 8% demolition
    EL: 0.12,   // 12% electrical (rough + finish)
    PL: 0.15,   // 15% plumbing
    HV: 0.03,   // 3% HVAC (range hood)
    DW: 0.08,   // 8% drywall
    CB: 0.25,   // 25% cabinets
    CT: 0.12,   // 12% countertops
    TL: 0.05,   // 5% tile (backsplash)
    FL: 0.04,   // 4% flooring
    PT: 0.04,   // 4% painting
    FC: 0.02,   // 2% trim
    FX: 0.02,   // 2% fixtures
    // Total: 100%
  },
  primary_bath: {
    DM: 0.10,
    EL: 0.08,
    PL: 0.25,   // Higher plumbing %
    TL: 0.20,   // Higher tile %
    // ... etc
  }
}
```

### Task Generation from Room Scope

When a room is added to project scope:

```javascript
function generateRoomTasks(room, renoTier, buildTier) {
  const trades = Object.keys(ROOM_TRADE_MATRIX[room.type]);
  const tasks = [];

  for (const trade of trades) {
    const templates = getTemplatesForTrade(trade, renoTier);
    for (const template of templates) {
      tasks.push({
        template_id: template.id,
        location_id: room.id,
        trade_code: trade,
        phase_code: template.phase_code,
        // Quantum state: hours/cost calculated when instantiated
      });
    }
  }

  return tasks;
}
```

---

## PART 10: DEPENDENCIES AND SEQUENCING

### Phase-Based Dependencies

The simplest dependency model: **earlier phases block later phases**

```
PH-DM (Demo) → PH-SS (Structure) → PH-EW (Envelope) → PH-RO (Rough-In) →
PH-IS (Insulation) → PH-DW (Drywall) → PH-PR (Prime) → PH-FN (Finish) →
PH-FX (Fixtures) → PH-PL (Punch) → PH-CL (Closeout)
```

### Cross-Trade Dependencies within Phase

Some dependencies exist WITHIN a phase:
- Electrical boxes must be installed BEFORE drywall
- Plumbing rough-in must be tested BEFORE insulation
- Cabinet install must happen BEFORE countertop templating

These are encoded in task templates:

```javascript
TEMPLATE: "Install base cabinets"
├── phase_code: "PH-FN"
├── trade_code: "CB"
├── dependencies: {
│   must_complete_first: ["DW-*", "FL-*"],  // Drywall and flooring done
│   must_complete_before: ["CT-*"]           // Before countertops
│ }
```

### Location-Aware Dependencies

Some tasks in one location block tasks in another:
- Main electrical panel upgrade blocks ALL electrical work
- Main water shutoff affects ALL plumbing
- These are "system-level" dependencies

```javascript
TASK: "Upgrade main panel"
├── location: "Electrical System"
├── blocks_locations: ["*"]  // All locations
├── blocks_trades: ["EL-*"]  // All electrical
```

---

## PART 11: THE UNIFIED CODE SYSTEM

### Final Proposed Code Structure

```
[TRADE]-[PHASE]-[SPECIFICS]
```

**Examples:**
- `EL-RO-CIR`: Electrical, Rough-In, Circuit Run
- `PL-FN-FIX`: Plumbing, Finish, Fixture Install
- `DW-DW-HNG`: Drywall, Drywall Phase, Hanging
- `CB-FN-BSE`: Cabinetry, Finish Phase, Base Cabinets

### Code Registry

```javascript
TRADE_CODES = {
  DM: { name: "Demolition", color: "#EF4444" },
  SW: { name: "Site Work", color: "#F59E0B" },
  FN: { name: "Foundation", color: "#8B5CF6" },
  FR: { name: "Framing", color: "#EC4899" },
  RF: { name: "Roofing", color: "#6366F1" },
  EX: { name: "Exterior", color: "#14B8A6" },
  WD: { name: "Windows & Doors", color: "#06B6D4" },
  IN: { name: "Insulation", color: "#F97316" },
  EL: { name: "Electrical", color: "#EAB308" },
  PL: { name: "Plumbing", color: "#3B82F6" },
  HV: { name: "HVAC", color: "#22C55E" },
  DW: { name: "Drywall", color: "#A855F7" },
  PT: { name: "Painting", color: "#F43F5E" },
  FL: { name: "Flooring", color: "#84CC16" },
  TL: { name: "Tile", color: "#0EA5E9" },
  FC: { name: "Finish Carpentry", color: "#D946EF" },
  CB: { name: "Cabinetry", color: "#10B981" },
  CT: { name: "Countertops", color: "#6D28D9" },
  FX: { name: "Fixtures", color: "#0891B2" },
  CL: { name: "Cleaning", color: "#64748B" },
  PM: { name: "Project Management", color: "#1E293B" },
}

PHASE_CODES = {
  DM: { name: "Demolition", order: 1 },
  SS: { name: "Site & Structure", order: 2 },
  EW: { name: "Envelope & Weather", order: 3 },
  RO: { name: "Rough-In", order: 4 },
  IS: { name: "Insulation & Sealing", order: 5 },
  DW: { name: "Drywall", order: 6 },
  PR: { name: "Prime & Prep", order: 7 },
  FN: { name: "Finish", order: 8 },
  FX: { name: "Fixtures", order: 9 },
  PL: { name: "Punch List", order: 10 },
  CL: { name: "Closeout", order: 11 },
}
```

---

## PART 12: HOW EVERYTHING SYNCS

### The Unified Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                          INTAKE FORM                                 │
│  • Rooms selected → LOCATIONS defined                               │
│  • Reno tier selected → SCOPE DEPTH defined                         │
│  • Build tier selected → QUALITY LEVEL defined                      │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      ESTIMATE GENERATION                             │
│  FOR EACH room:                                                      │
│    FOR EACH trade in ROOM_TRADE_MATRIX[room]:                       │
│      CREATE line_item(trade, room, tier_pricing)                    │
│      LINK to task_templates[trade][phase]                           │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      TASK GENERATION                                 │
│  FOR EACH estimate_line_item:                                       │
│    FIND template matching (trade_code, phase_code)                  │
│    CREATE task_instance bound to (location, template)               │
│    INHERIT materials, checklist, hours from template                │
│    CALCULATE dependencies from phase ordering                       │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       FIELD GUIDE LINKS                              │
│  FOR EACH task_instance:                                            │
│    FIND field_guide_modules WHERE trade matches                     │
│    SUGGEST related modules for learning                             │
│    DEEP LINK to specific sections for task context                  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       TIME TRACKING                                  │
│  FOR EACH task worked:                                              │
│    LOG hours against task_instance                                  │
│    ROLL UP to estimate_line_item (cost tracking)                    │
│    ROLL UP to trade totals (contractor billing)                     │
│    ROLL UP to phase totals (progress tracking)                      │
│    ROLL UP to project totals (dashboard)                            │
└─────────────────────────────────────────────────────────────────────┘
```

### The Sync Points

| System | Uses Trade | Uses Phase | Uses Location |
|--------|-----------|------------|---------------|
| Field Guide | ✅ Primary | ✅ Secondary | ❌ N/A |
| Estimates | ✅ Pricing | ✅ Sequencing | ✅ Room rates |
| Tasks | ✅ Assignment | ✅ Dependencies | ✅ Binding |
| Time Tracking | ✅ Contractor | ✅ Progress | ✅ Reporting |
| Dashboard | ✅ By trade | ✅ By phase | ✅ By room |

---

## PART 13: WHAT THIS ENABLES

### 1. Single Source of Truth
- ONE category system (Trade × Phase × Location)
- NO mapping tables between systems
- Changes propagate automatically

### 2. Flexible Views
- View by room: "What's left in the Kitchen?"
- View by trade: "What does the electrician need to do?"
- View by phase: "What's in the Rough-In phase?"
- View by timeline: "What's due this week?"
- View by cost: "What's over budget?"

### 3. Intelligent Suggestions
- Field Guide suggests modules based on current task's trade/phase
- Scheduling suggests optimal task order based on phase/dependencies
- Estimates suggest pricing based on historical trade/room data

### 4. Quantum Task Support
- Templates exist independent of location
- Instances bound when building structure defined
- Partial instantiation supported (some rooms defined, others TBD)

### 5. Accurate Costing
- Time tracked by Trade (for contractor billing)
- Costs tracked by Location (for room-level profitability)
- Budget tracked by Phase (for cash flow)

---

## PART 14: MIGRATION PATH

### From Current State

**Current:**
- `scopeCategories.js` has 20 trade codes with subcategories
- Field Guide has separate categorization
- Tasks have `category` and `subcategory` fields

**Migration:**
1. Map existing `scopeCategories` to new Trade codes
2. Add `phase_code` to all task templates
3. Add `phase_code` to all Field Guide modules
4. Update estimate line items to include phase
5. Create Room-Trade Matrix for pricing

### Backwards Compatibility

```javascript
// Mapping layer for existing code
function mapOldCategory(oldCode) {
  const LEGACY_MAP = {
    'SW': 'SW',  // Site Work stays same
    'FS': 'FR',  // Framing-Structural → Framing
    'FI': 'FR',  // Framing-Interior → Framing
    'EE': 'EX',  // Exterior Envelope → Exterior
    // ... etc
  };
  return LEGACY_MAP[oldCode] || oldCode;
}
```

---

## PART 15: OPEN QUESTIONS FOR REVIEW

### Question 1: Sub-Trade Granularity
**Current proposal:** EL-RO (Electrical Rough-In) vs EL-TR (Electrical Trim)
**Alternative:** Just EL with phase determining rough vs finish
**Trade-off:** More codes = more precision but more complexity

### Question 2: Phase as Axis vs Phase as Attribute
**Current proposal:** Phase is an axis (tasks ARE IN a phase)
**Alternative:** Phase is derived from trade (EL-RO implies Rough-In phase)
**Trade-off:** Explicit phase allows override; derived phase is simpler

### Question 3: Location Hierarchy Depth
**Current proposal:** Flexible (Building → Floor → Room → Zone)
**Alternative:** Fixed 2-level (Building → Room only)
**Trade-off:** Deep hierarchy enables new construction; shallow is simpler

### Question 4: Field Guide Module Granularity
**Current proposal:** Trade + Phase based (match task templates)
**Alternative:** Keep educational groupings separate
**Trade-off:** Tight coupling enables suggestions; loose coupling allows different learning paths

### Question 5: Dependency Complexity
**Current proposal:** Phase-based + explicit overrides
**Alternative:** Fully manual dependencies per task
**Trade-off:** Auto-dependencies save time; manual is more accurate

---

## PART 16: RECOMMENDATION SUMMARY

### The Core Decision
**Implement the Three-Axis model (Trade × Phase × Location)** because:

1. It matches construction reality (who, when, where)
2. It eliminates the mapping problem between systems
3. It enables the "loops within loops" principle naturally
4. It supports quantum tasks (templates without locations)
5. It allows any view/filter the user wants

### The Implementation Priority
1. **Define the Trade codes** (refine from existing scopeCategories)
2. **Define the Phase codes** (new, based on construction sequence)
3. **Update Field Guide** to use Trade/Phase tagging
4. **Create Room-Trade Matrix** for estimate generation
5. **Build task templates** with Trade/Phase/dependency metadata
6. **Implement task instances** with location binding

### The Success Criteria
- [ ] Can generate tasks from estimate with no manual mapping
- [ ] Can link any task to relevant Field Guide content automatically
- [ ] Can view tasks by room, by trade, by phase, by date
- [ ] Can track time and roll up to any dimension
- [ ] Can handle "quantum" tasks that bind to locations later

---

## APPENDIX A: COMPLETE TRADE CODE LIST

| Code | Name | Typical Contractor | Field Guide Coverage |
|------|------|-------------------|---------------------|
| DM | Demolition | General/Laborer | OH-series (safety) |
| SW | Site Work | Excavation | (future) |
| FN | Foundation | Concrete | FF-01 |
| FR | Framing | Framing Crew | FF-02 through FF-08 |
| RF | Roofing | Roofing | EW-06, EW-07 |
| EX | Exterior | Siding | EW-05, EW-09 |
| WD | Windows & Doors | Installer | EW-04 |
| IN | Insulation | Insulation | EW-02, EW-03 |
| EL | Electrical | Electrician | (future) |
| PL | Plumbing | Plumber | (future) |
| HV | HVAC | HVAC Tech | (future) |
| DW | Drywall | Drywall Crew | IF-01, IF-02 |
| PT | Painting | Painter | IF-03 |
| FL | Flooring | Flooring | IF-06 |
| TL | Tile | Tile Setter | TI-01 through TI-05 |
| FC | Finish Carpentry | Finish Carpenter | IF-04, IF-05, IF-07 |
| CB | Cabinetry | Cabinet Installer | (future) |
| CT | Countertops | Fabricator | (future) |
| FX | Fixtures | Various | (future) |
| CL | Cleaning | Cleaner | OH-05 |
| PM | Project Management | GC | (future) |

---

## APPENDIX B: COMPLETE PHASE CODE LIST

| Order | Code | Name | Duration (typical reno) | Trades Active |
|-------|------|------|------------------------|---------------|
| 1 | DM | Demolition | 1-3 days | DM |
| 2 | SS | Site & Structure | 1-5 days | FN, FR |
| 3 | EW | Envelope & Weather | 2-5 days | RF, EX, WD |
| 4 | RO | Rough-In | 3-7 days | EL, PL, HV |
| 5 | IS | Insulation & Sealing | 1-3 days | IN |
| 6 | DW | Drywall | 5-10 days | DW |
| 7 | PR | Prime & Prep | 1-2 days | PT, FL |
| 8 | FN | Finish | 5-15 days | FL, TL, FC, CB, CT, PT |
| 9 | FX | Fixtures | 2-4 days | EL, PL, FX |
| 10 | PL | Punch List | 1-3 days | All |
| 11 | CL | Closeout | 1 day | CL, PM |

---

## APPENDIX C: ROOM-TRADE MATRIX (Full)

```javascript
const ROOM_TRADE_MATRIX = {
  kitchen: {
    DM: 0.08, EL: 0.12, PL: 0.15, HV: 0.03,
    DW: 0.08, PT: 0.04, FL: 0.04, TL: 0.05,
    FC: 0.02, CB: 0.25, CT: 0.12, FX: 0.02
  },
  primary_bath: {
    DM: 0.08, EL: 0.08, PL: 0.22, HV: 0.02,
    DW: 0.08, PT: 0.05, FL: 0.02, TL: 0.20,
    FC: 0.03, CB: 0.10, CT: 0.07, FX: 0.05
  },
  secondary_bath: {
    DM: 0.08, EL: 0.08, PL: 0.22, HV: 0.02,
    DW: 0.08, PT: 0.05, FL: 0.02, TL: 0.22,
    FC: 0.03, CB: 0.08, CT: 0.07, FX: 0.05
  },
  powder_room: {
    DM: 0.10, EL: 0.08, PL: 0.25,
    DW: 0.10, PT: 0.08, FL: 0.05, TL: 0.15,
    FC: 0.05, CB: 0.08, FX: 0.06
  },
  basement: {
    DM: 0.05, FR: 0.15, EL: 0.15, PL: 0.08, HV: 0.05,
    IN: 0.08, DW: 0.15, PT: 0.10, FL: 0.12, FC: 0.05, FX: 0.02
  },
  living_room: {
    DM: 0.05, EL: 0.10, DW: 0.15, PT: 0.25,
    FL: 0.30, FC: 0.10, FX: 0.05
  },
  bedrooms: {
    DM: 0.05, EL: 0.10, DW: 0.15, PT: 0.25,
    FL: 0.30, FC: 0.10, FX: 0.05
  },
  // ... additional rooms
};
```

---

**END OF DOCUMENT**

*This document should be reviewed by additional AI systems (Claude, Gemini) for architectural soundness before implementation begins.*
