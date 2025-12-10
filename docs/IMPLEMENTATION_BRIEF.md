# Hooomz OS - Implementation Brief for Immediate Sprint

## Context for Reviewer

This document accompanies the comprehensive app review (`APP_REVIEW_AND_PROPOSALS.md`) and provides clarified scope, architectural decisions, and implementation specifications for the first sprint of UX improvements.

**Project:** Hooomz OS - Construction project management system for residential contractors
**Target Users:** Small-to-medium residential contractors in Atlantic Canada
**Core Differentiators:** Speed of use, mobile-first field use, premium minimal aesthetic, three-axis task organization (Trade × Phase × Location)

---

## Decisions Made (Q&A Summary)

### Architecture & Scope

**Q1: FAB vs Center Nav Button?**
- **Decision:** Combine them. The center nav button becomes the quick-action trigger.
- **Rationale:** One interaction pattern, not two. Reduces cognitive load and UI clutter.
- **Implementation:** Redesign BottomNav with prominent center [+] that expands to context-aware actions.

**Q2: Current State Management?**
- **Answer:** Prop drilling + localStorage for persistence. No global state library.
- **Decision for this sprint:** Add lightweight React Context for notification counts and recent items.
- **Future consideration:** Zustand if state complexity grows, but not needed for immediate items.

**Q3: Sprint Scope?**
- **Decision:** Immediate items only:
  - A3: Inline Status Toggle
  - A4: Smart Defaults
  - C1: Consistent Card Interactions
  - B3: Haptic Feedback
- **Rationale:** Get these solid first. Iterate into Near-Term (FAB, swipe actions, bottom nav redesign) after validation.

### Field Realities

**Q4: Offline Mode Timing?**
- **Decision:** Keep in Future backlog.
- **Rationale:** The current localStorage mock system functions as de facto offline-first. Real offline with sync queuing is a larger architectural piece requiring service workers, IndexedDB, and conflict resolution. Not needed for MVP.

**Q5: Weather Widget?**
- **Decision:** Skip entirely.
- **Rationale:** Nice-to-have fluff. Contractors check weather on their phones. Adds API dependency and maintenance burden for minimal value.

### Tech Preferences

**Q6: Swipe Library?**
- **Decision:** Use `react-swipeable` when implementing swipe actions (Near-Term sprint).
- **Rationale:** Lightweight, reliable, well-maintained. No need for custom gesture physics.

**Q7: TypeScript?**
- **Decision:** Stay JavaScript for now.
- **Rationale:** Consistency matters more than incremental TS adoption. Full migration can happen later as a dedicated effort.

### Three-Axis Model Integration

**Q: How does the quantum task model influence these UX improvements?**
- **Answer:** The key integration point is **Smart Defaults (A4)**. When a user is in Loop Tracker filtered to "Electrical × Rough-In × Kitchen", quick-add should pre-fill those three axes automatically.
- **Implementation:** Pass current filter context as `defaultValues` to AddTaskModal and similar components.

---

## Implementation Specifications

### A3: Inline Status Toggle

**Goal:** Single tap to advance status; long press for full menu.

**Files to Modify:**
- `client/src/pages/Selections.jsx` (SelectionCard)
- `client/src/pages/Today.jsx` (TaskItem if exists)
- `client/src/pages/LoopTracker.jsx` (task items)

**Behavior:**
```
Single Tap on Status Badge:
  - Selection: pending → approved → ordered → received (cycle)
  - Task: pending → in_progress → completed (cycle)

Long Press (500ms):
  - Show full dropdown with all status options
  - Same UI as current, just triggered differently

Visual Feedback:
  - Brief scale animation on tap (scale to 0.95, back to 1)
  - Color transition smooth (150ms)
  - Haptic feedback on status change
```

**Code Pattern:**
```jsx
const [pressTimer, setPressTimer] = useState(null);

const handlePointerDown = () => {
  const timer = setTimeout(() => {
    setShowStatusMenu(true);
    haptic('medium');
  }, 500);
  setPressTimer(timer);
};

const handlePointerUp = () => {
  if (pressTimer) {
    clearTimeout(pressTimer);
    setPressTimer(null);
    // Short press - cycle status
    cycleStatus();
    haptic('light');
  }
};

const cycleStatus = () => {
  const statusOrder = ['pending', 'approved', 'ordered', 'received'];
  const currentIndex = statusOrder.indexOf(selection.status);
  const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
  onStatusChange(selection.id, nextStatus);
};
```

**Status Cycles by Entity:**
| Entity | Status Flow |
|--------|-------------|
| Material Selection | pending → approved → ordered → received |
| Task | pending → in_progress → completed |
| Loop | active → paused → completed |

---

### A4: Smart Defaults

**Goal:** Reduce friction by pre-filling form fields based on context.

**Files to Modify:**
- `client/src/components/selections/AddSelectionModal.jsx`
- Any AddTaskModal component (to be located)
- Parent pages that open modals

**Context Sources:**
```javascript
// From URL params
const { projectId } = useParams();

// From current filters (Loop Tracker example)
const currentFilters = {
  trade: filterTrade,      // e.g., 'electrical'
  phase: filterPhase,      // e.g., 'rough-in'
  location: filterRoom,    // e.g., 'kitchen'
};

// From recent activity (localStorage)
const recentDefaults = JSON.parse(localStorage.getItem('hooomz_recent_defaults') || '{}');
// { lastCategory: 'flooring', lastRoom: 'room-001', lastTrade: 'flooring' }
```

**Implementation Pattern:**
```jsx
// In parent page (e.g., Selections.jsx)
const getSmartDefaults = () => ({
  projectId,
  roomId: filterRoom || recentDefaults.lastRoom,
  categoryCode: recentDefaults.lastCategory,
  tradeCode: filterTrade || recentDefaults.lastTrade,
});

<AddSelectionModal
  defaultValues={getSmartDefaults()}
  onSave={(selection) => {
    // Update recent defaults
    updateRecentDefaults({
      lastCategory: selection.categoryCode,
      lastRoom: selection.roomId,
      lastTrade: selection.tradeCode,
    });
    handleSave(selection);
  }}
/>

// In AddSelectionModal
const [formData, setFormData] = useState({
  ...emptySelection,
  ...defaultValues, // Smart defaults applied here
});
```

**Recent Defaults Storage:**
```javascript
// utils/recentDefaults.js
const STORAGE_KEY = 'hooomz_recent_defaults';

export function getRecentDefaults() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

export function updateRecentDefaults(updates) {
  const current = getRecentDefaults();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...updates }));
}
```

---

### C1: Consistent Card Interactions

**Goal:** All clickable cards behave the same way visually.

**Files to Modify:**
- `client/src/components/ui/Card.jsx`
- All card usages across the app

**Card Component Enhancement:**
```jsx
// Current Card (basic)
export function Card({ children, className }) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-100 ${className}`}>
      {children}
    </div>
  );
}

// Enhanced Card
export function Card({
  children,
  className = '',
  interactive = false,
  onClick,
  ...props
}) {
  const baseClasses = 'bg-white rounded-lg shadow-sm border border-gray-100';
  const interactiveClasses = interactive || onClick
    ? 'cursor-pointer hover:shadow-md hover:border-gray-200 transition-all duration-150 active:scale-[0.99]'
    : '';

  return (
    <div
      className={`${baseClasses} ${interactiveClasses} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      {...props}
    >
      {children}
    </div>
  );
}
```

**Usage Audit:**
| Component | Should Be Interactive | Current State |
|-----------|----------------------|---------------|
| SelectionCard | Yes | Has onClick, needs consistent hover |
| ProjectCard | Yes | Check implementation |
| TaskItem | Yes | Check implementation |
| StatCard (Dashboard) | Maybe (if clickable filters) | Verify |
| SummaryCard | No | Should not have hover effect |

**Visual Standards:**
- Interactive: `cursor-pointer`, `hover:shadow-md`, `active:scale-[0.99]`
- Non-interactive: No hover effects, no cursor change
- All cards: Same border radius (`rounded-lg`), same base shadow (`shadow-sm`)

---

### B3: Haptic Feedback

**Goal:** Physical feedback for key interactions.

**New File:** `client/src/utils/haptic.js`

```javascript
/**
 * Trigger haptic feedback if supported
 * @param {'light' | 'medium' | 'heavy'} intensity
 */
export function haptic(intensity = 'light') {
  if (!navigator.vibrate) return;

  const patterns = {
    light: [10],
    medium: [20],
    heavy: [30, 10, 30],
  };

  try {
    navigator.vibrate(patterns[intensity] || patterns.light);
  } catch (e) {
    // Silently fail - haptics are enhancement, not requirement
  }
}

/**
 * Check if haptic feedback is available
 */
export function hasHapticSupport() {
  return 'vibrate' in navigator;
}
```

**Integration Points:**
| Action | Intensity | Location |
|--------|-----------|----------|
| Status change | light | SelectionCard, TaskItem |
| Task completion | medium | Task status toggle |
| Timer start/stop | heavy | TimeTracker |
| Delete confirmation | medium | Delete dialogs |
| Form submission | light | All modals on save |
| Pull-to-refresh trigger | light | (Future) List views |

**Usage Example:**
```jsx
import { haptic } from '../utils/haptic';

const handleStatusChange = (newStatus) => {
  haptic('light');
  onStatusChange(selection.id, newStatus);
};

const handleComplete = () => {
  haptic('medium');
  markTaskComplete(task.id);
};
```

---

## Questions for Review

Before implementation begins, please confirm or clarify:

### Functional Questions

1. **Status Cycle Order:** The proposed cycles are:
   - Selection: pending → approved → ordered → received
   - Task: pending → in_progress → completed

   Are these the correct workflow progressions? Should any statuses be skippable or is strict linear progression correct?

2. **Long Press Duration:** 500ms is standard for long-press detection. Is this appropriate for the contractor user base, or should it be shorter (300ms) for faster workflows?

3. **Smart Defaults Priority:** When multiple context sources conflict (e.g., URL has projectId, filter has different room, recent has different category), what's the priority order?
   - Proposed: URL params > Current filters > Recent defaults

4. **Card Click vs Internal Actions:** Currently SelectionCard has both card-level onClick AND internal buttons (status, menu, external link). The current stopPropagation approach works but adds complexity. Should we:
   - Keep current approach (stopPropagation on internal elements)
   - Move all actions to a detail view (card click only opens detail)
   - Use swipe/long-press for actions instead of visible buttons

### Technical Questions

5. **Haptic Permissions:** Some browsers require user gesture to enable vibration. Should we:
   - Just try and fail silently (current proposal)
   - Add a settings toggle for haptics
   - Request permission explicitly on first use

6. **Animation Library:** For micro-animations (status change, card press), should we:
   - Use CSS transitions only (lighter, current proposal)
   - Add Framer Motion for more control (heavier but more polish)
   - Use a lighter library like `react-spring`

7. **Recent Defaults Scope:** Should recent defaults be:
   - Global (same defaults everywhere)
   - Per-project (each project remembers its own)
   - Per-page (Loop Tracker vs Selections have separate memory)

### Design Questions

8. **Status Badge Animation:** On single-tap cycle, should the badge:
   - Just change color instantly
   - Scale down then up (bounce effect)
   - Slide/flip to new status
   - Show brief checkmark overlay then settle

9. **Interactive Card Active State:** When a card is pressed (before release), should it:
   - Scale down slightly (`scale-[0.99]`)
   - Darken background slightly
   - Show pressed border/shadow
   - Combination

10. **Haptic Feedback Toggle:** Should users be able to disable haptics in settings, or is this an "opinionated" design choice we enforce?

---

## File Change Summary

### New Files
- `client/src/utils/haptic.js` - Haptic feedback utility
- `client/src/utils/recentDefaults.js` - Smart defaults storage

### Modified Files
- `client/src/components/ui/Card.jsx` - Add interactive prop and consistent states
- `client/src/pages/Selections.jsx` - Inline status toggle on SelectionCard
- `client/src/components/selections/AddSelectionModal.jsx` - Accept defaultValues prop
- `client/src/components/selections/SelectionDetailModal.jsx` - Inline status toggle
- (Others TBD based on task/loop implementations)

### No Changes Needed
- Navigation components (BottomNav, Sidebar, MobileHeader) - Near-Term sprint
- API layer - No backend changes for these features
- Routing - No new routes

---

## Success Criteria

After this sprint, the following should be true:

1. **Status changes are faster:** Single tap cycles status without opening menu. Measured by reduced tap count for common workflow.

2. **Forms feel smarter:** Opening add modal in context pre-fills relevant fields. User rarely needs to select project/room/trade manually.

3. **Cards are predictable:** Every clickable card has the same visual feedback. Users know what's interactive at a glance.

4. **Interactions feel physical:** Key actions provide haptic feedback on supported devices. App feels more responsive and premium.

---

## Estimated Effort

| Item | Hours | Dependencies |
|------|-------|--------------|
| A3: Inline Status Toggle | 2-3 | None |
| A4: Smart Defaults | 3-4 | None |
| C1: Card Interactions | 2-3 | None |
| B3: Haptic Feedback | 1-2 | None |
| Testing & Polish | 2-3 | All above |
| **Total** | **10-15 hours** | |

Items can be implemented in parallel as they touch different parts of the codebase.

---

*Document prepared for implementation review*
*Sprint: Immediate UX Improvements*
*Date: December 2024*
