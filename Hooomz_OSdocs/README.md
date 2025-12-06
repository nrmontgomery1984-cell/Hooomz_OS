# Hooomz OS Build Package

## What's In This Package

This package contains everything needed to build Hooomz OS with Claude Code.

### Files

| File | Purpose |
|------|---------|
| `CLAUDE.md` | **START HERE** - Main instructions for Claude Code |
| `HOOOMZ_OS_BUILD_INSTRUCTIONS.md` | Complete specification with database schema |
| `DESIGN_SYSTEM.md` | Component patterns, colors, typography, spacing |
| `GEMINI_IMAGE_PROMPTS.md` | Prompts to generate visual mockups |
| `INDUSTRY_PAIN_POINTS.md` | Research context on problems being solved |

---

## Quick Start

### 1. Generate Visual Targets (Optional but Recommended)

Use the prompts in `GEMINI_IMAGE_PROMPTS.md` with Gemini to generate mockups:
- Project Dashboard (Mobile + Desktop)
- Single Project View
- Today View
- Loop Detail / Task List
- Time Tracker
- Client Portal
- Estimate Builder
- Training Module
- Empty State

### 2. Open Claude Code

Point Claude Code at your project directory:
```
D:\Hooomz_OS
```

### 3. Feed Claude the Instructions

Copy the contents of `CLAUDE.md` into Claude Code as the initial context. This gives Claude:
- The three pillars (Activity Log, Loops, Modules)
- Tech stack decisions
- Design system requirements
- Database schema
- Build order
- Component patterns
- Quality checklist

### 4. Build in Phases

Follow the build order in `CLAUDE.md`:

**Phase 1: Foundation**
- Project setup
- Design system components
- Layout components
- Supabase setup

**Phase 2: Core Screens**
- Project Dashboard
- Single Project View
- Loop Detail
- Task interactions

**Phase 3: Daily Operations**
- Today View
- Time Tracker

**Phase 4: Desktop & Polish**
- Desktop layouts
- Empty states
- Settings

**Phase 5: Extended**
- Estimate builder
- Client Portal
- Training

---

## Key Concepts

### The Three Pillars

1. **Activity Log = Heartbeat**
   - Everything is an event
   - Immutable record
   - Foundation for all data

2. **Loops = Identity**
   - Flexible nested containers
   - Status bubbles up (🟢🟡🔴)
   - THE differentiator

3. **Modules = Views**
   - Not silos
   - Same data, different lenses

### Design Philosophy

**Premium, Minimal, Apple-like**
- Shadows barely perceptible
- Typography does heavy lifting
- Status colors muted but meaningful
- Every element feels considered

---

## Tech Stack

```
Frontend: React 18 + Vite + TailwindCSS + Lucide
Backend:  Node.js + Express
Database: Supabase (PostgreSQL)
Auth:     Supabase Auth
PWA:      Yes
```

---

## Target User

Small residential contractors (1-10 person companies):
- Owner wears many hats
- No dedicated office staff
- Can't spend hours on data entry
- Running 1-5 active projects
- Currently using spreadsheets + texts + paper

---

## Design Checklist

Every screen should pass this check:
- [ ] Pure white background
- [ ] Shadows almost invisible
- [ ] Clear typography hierarchy
- [ ] Small, refined status dots
- [ ] Thin progress bars
- [ ] Subtle checkboxes
- [ ] Consistent Lucide icons
- [ ] Intentional spacing
- [ ] Works on mobile
- [ ] Feels premium

---

## Questions?

If Claude Code needs clarification:
1. Check `HOOOMZ_OS_BUILD_INSTRUCTIONS.md` for full specs
2. Check `DESIGN_SYSTEM.md` for component details
3. Reference `INDUSTRY_PAIN_POINTS.md` for "why" context

The goal: A tool that small contractors will actually use because it matches how they think and doesn't waste their time.
