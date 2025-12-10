# Hooomz OS - Implementation Sprint 01: Immediate UX Improvements

## Overview

This document provides complete, copy-paste ready implementation instructions for the first sprint of UX improvements to Hooomz OS. All architectural decisions are finalized. No open questions remain.

**Sprint Scope:**
- A3: Inline Status Toggle
- A4: Smart Defaults
- C1: Consistent Card Interactions
- B3: Haptic Feedback

**Estimated Effort:** 10-15 hours total

**Key Principle:** Every change serves speed-of-use for contractors in the field.

---

## Pre-Implementation Setup

### Verify Project Structure

Before starting, confirm these paths exist:
```
client/src/
├── components/
│   ├── ui/
│   │   └── Card.jsx
│   └── selections/
│       ├── AddSelectionModal.jsx
│       └── SelectionDetailModal.jsx
├── pages/
│   ├── Selections.jsx
│   ├── Today.jsx
│   └── LoopTracker.jsx
└── utils/
    └── (create new files here)
```

### Install No New Dependencies

All features use native browser APIs and CSS. No new npm packages required for this sprint.

---

## Implementation 1: Haptic Feedback Utility (B3)

**Priority:** Do this first. Other implementations depend on it.

### Create: `client/src/utils/haptic.js`

```javascript
/**
 * Haptic Feedback Utility for Hooomz OS
 *
 * Provides physical feedback for key interactions.
 * Fails silently on unsupported devices.
 */

/**
 * Trigger haptic feedback
 * @param {'light' | 'medium' | 'heavy'} intensity - Vibration intensity
 */
export function haptic(intensity = 'light') {
  if (typeof navigator === 'undefined' || !navigator.vibrate) {
    return;
  }

  const patterns = {
    light: [10],      // Quick tap - status changes, button presses
    medium: [20],     // Confirmation - task completion, form submit
    heavy: [30, 10, 30], // Alert - timer start/stop, delete confirm
  };

  try {
    navigator.vibrate(patterns[intensity] || patterns.light);
  } catch {
    // Silent fail - haptics are enhancement, not requirement
  }
}

/**
 * Check if haptic feedback is available
 * @returns {boolean}
 */
export function hasHapticSupport() {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
}
```

### Usage Reference

Import and call where needed:
```javascript
import { haptic } from '../utils/haptic';

// On status change
haptic('light');

// On task completion
haptic('medium');

// On timer start/stop
haptic('heavy');
```

---

## Implementation 2: Smart Defaults Utility (A4)

### Create: `client/src/utils/recentDefaults.js`

```javascript
/**
 * Smart Defaults Utility for Hooomz OS
 *
 * Stores and retrieves recent user selections per project.
 * Reduces form-filling friction by pre-populating fields.
 */

const STORAGE_PREFIX = 'hooomz_recent_defaults';

/**
 * Get storage key for a project
 * @param {string} projectId
 * @returns {string}
 */
function getStorageKey(projectId) {
  return projectId ? `${STORAGE_PREFIX}_${projectId}` : STORAGE_PREFIX;
}

/**
 * Get recent defaults for a project
 * @param {string} projectId - Optional project ID for project-scoped defaults
 * @returns {Object} Recent default values
 */
export function getRecentDefaults(projectId = null) {
  try {
    const key = getStorageKey(projectId);
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

/**
 * Update recent defaults for a project
 * @param {Object} updates - Key-value pairs to update
 * @param {string} projectId - Optional project ID for project-scoped defaults
 */
export function updateRecentDefaults(updates, projectId = null) {
  try {
    const key = getStorageKey(projectId);
    const current = getRecentDefaults(projectId);
    const updated = {
      ...current,
      ...updates,
      _lastUpdated: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(updated));
  } catch {
    // Silent fail - defaults are enhancement, not requirement
  }
}

/**
 * Clear recent defaults for a project
 * @param {string} projectId - Optional project ID
 */
export function clearRecentDefaults(projectId = null) {
  try {
    const key = getStorageKey(projectId);
    localStorage.removeItem(key);
  } catch {
    // Silent fail
  }
}

/**
 * Build smart defaults from multiple context sources
 * Priority: URL params > Current filters > Recent defaults
 *
 * @param {Object} options
 * @param {Object} options.urlParams - Values from URL (highest priority)
 * @param {Object} options.currentFilters - Values from active filters
 * @param {string} options.projectId - Project ID for recent defaults lookup
 * @returns {Object} Merged defaults with priority applied
 */
export function buildSmartDefaults({ urlParams = {}, currentFilters = {}, projectId = null }) {
  const recent = getRecentDefaults(projectId);

  // Priority: URL > Filters > Recent
  // Only include non-null, non-undefined values
  const merged = {};

  // Start with recent defaults (lowest priority)
  Object.entries(recent).forEach(([key, value]) => {
    if (value != null && !key.startsWith('_')) {
      merged[key] = value;
    }
  });

  // Override with current filters
  Object.entries(currentFilters).forEach(([key, value]) => {
    if (value != null && value !== '' && value !== 'all') {
      merged[key] = value;
    }
  });

  // Override with URL params (highest priority)
  Object.entries(urlParams).forEach(([key, value]) => {
    if (value != null && value !== '') {
      merged[key] = value;
    }
  });

  return merged;
}
```

---

## Implementation 3: Enhanced Card Component (C1)

### Modify: `client/src/components/ui/Card.jsx`

Replace the entire file contents:

```javascript
/**
 * Card Component for Hooomz OS
 *
 * Provides consistent card styling with optional interactive states.
 * Interactive cards have hover effects, cursor changes, and press feedback.
 */

import React from 'react';

/**
 * Card component with optional interactive states
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.interactive - Force interactive styles (auto-detected from onClick)
 * @param {Function} props.onClick - Click handler (makes card interactive)
 * @param {boolean} props.disabled - Disable interactions
 */
export function Card({
  children,
  className = '',
  interactive,
  onClick,
  disabled = false,
  ...props
}) {
  // Auto-detect interactive if onClick is provided
  const isInteractive = (interactive ?? !!onClick) && !disabled;

  const baseClasses = 'bg-white rounded-lg shadow-sm border border-gray-100';

  const interactiveClasses = isInteractive
    ? 'cursor-pointer hover:shadow-md hover:border-gray-200 active:scale-[0.99] transition-all duration-150'
    : '';

  const disabledClasses = disabled
    ? 'opacity-50 cursor-not-allowed'
    : '';

  const handleClick = (e) => {
    if (disabled || !onClick) return;
    onClick(e);
  };

  const handleKeyDown = (e) => {
    if (disabled || !onClick) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(e);
    }
  };

  return (
    <div
      className={`${baseClasses} ${interactiveClasses} ${disabledClasses} ${className}`}
      onClick={handleClick}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-disabled={disabled || undefined}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * CardHeader - Optional header section for cards
 */
export function CardHeader({ children, className = '' }) {
  return (
    <div className={`px-4 py-3 border-b border-gray-100 ${className}`}>
      {children}
    </div>
  );
}

/**
 * CardContent - Main content area for cards
 */
export function CardContent({ children, className = '' }) {
  return (
    <div className={`p-4 ${className}`}>
      {children}
    </div>
  );
}

/**
 * CardFooter - Optional footer section for cards
 */
export function CardFooter({ children, className = '' }) {
  return (
    <div className={`px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-lg ${className}`}>
      {children}
    </div>
  );
}

export default Card;
```

---

## Implementation 4: Inline Status Toggle Component (A3)

### Create: `client/src/components/ui/StatusBadge.jsx`

This is a new reusable component for status badges with tap-to-cycle and long-press-for-menu:

```javascript
/**
 * StatusBadge Component for Hooomz OS
 *
 * Single tap: Cycle to next status
 * Long press (400ms): Show full status menu
 * Keyboard: Enter = cycle, Space = menu
 */

import React, { useState, useRef, useCallback } from 'react';
import { haptic } from '../../utils/haptic';

// Status configurations by entity type
const STATUS_CONFIG = {
  selection: {
    order: ['pending', 'approved', 'ordered', 'received'],
    colors: {
      pending: 'bg-gray-100 text-gray-700',
      approved: 'bg-blue-100 text-blue-700',
      ordered: 'bg-amber-100 text-amber-700',
      received: 'bg-green-100 text-green-700',
    },
    labels: {
      pending: 'Pending',
      approved: 'Approved',
      ordered: 'Ordered',
      received: 'Received',
    },
    terminal: 'received', // Status that doesn't cycle further
  },
  task: {
    order: ['pending', 'in_progress', 'completed'],
    colors: {
      pending: 'bg-gray-100 text-gray-700',
      in_progress: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
    },
    labels: {
      pending: 'Pending',
      in_progress: 'In Progress',
      completed: 'Completed',
    },
    terminal: 'completed',
  },
  loop: {
    order: ['active', 'paused', 'completed'],
    colors: {
      active: 'bg-green-100 text-green-700',
      paused: 'bg-amber-100 text-amber-700',
      completed: 'bg-gray-100 text-gray-700',
    },
    labels: {
      active: 'Active',
      paused: 'Paused',
      completed: 'Completed',
    },
    terminal: 'completed',
  },
};

const LONG_PRESS_DURATION = 400; // ms

/**
 * StatusBadge with tap-to-cycle and long-press-for-menu
 *
 * @param {Object} props
 * @param {string} props.status - Current status value
 * @param {string} props.type - Entity type: 'selection' | 'task' | 'loop'
 * @param {Function} props.onChange - Called with new status on change
 * @param {boolean} props.disabled - Disable interactions
 * @param {string} props.className - Additional CSS classes
 */
export function StatusBadge({
  status,
  type = 'task',
  onChange,
  disabled = false,
  className = '',
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const pressTimerRef = useRef(null);
  const didLongPressRef = useRef(false);

  const config = STATUS_CONFIG[type] || STATUS_CONFIG.task;
  const colorClass = config.colors[status] || config.colors[config.order[0]];
  const label = config.labels[status] || status;

  // Get next status in cycle (or null if at terminal)
  const getNextStatus = useCallback(() => {
    if (status === config.terminal) return null;
    const currentIndex = config.order.indexOf(status);
    if (currentIndex === -1) return config.order[0];
    const nextIndex = (currentIndex + 1) % config.order.length;
    return config.order[nextIndex];
  }, [status, config]);

  // Cycle to next status
  const cycleStatus = useCallback(() => {
    if (disabled) return;
    const nextStatus = getNextStatus();
    if (nextStatus && onChange) {
      haptic('light');
      onChange(nextStatus);
    }
  }, [disabled, getNextStatus, onChange]);

  // Show full menu
  const openMenu = useCallback(() => {
    if (disabled) return;
    haptic('medium');
    setShowMenu(true);
  }, [disabled]);

  // Select status from menu
  const selectStatus = useCallback((newStatus) => {
    if (onChange) {
      haptic('light');
      onChange(newStatus);
    }
    setShowMenu(false);
  }, [onChange]);

  // Pointer/touch handlers for long press detection
  const handlePointerDown = (e) => {
    if (disabled) return;
    e.stopPropagation();

    setIsPressed(true);
    didLongPressRef.current = false;

    pressTimerRef.current = setTimeout(() => {
      didLongPressRef.current = true;
      setIsPressed(false);
      openMenu();
    }, LONG_PRESS_DURATION);
  };

  const handlePointerUp = (e) => {
    if (disabled) return;
    e.stopPropagation();

    setIsPressed(false);

    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }

    // If wasn't a long press, cycle status
    if (!didLongPressRef.current) {
      cycleStatus();
    }
  };

  const handlePointerLeave = () => {
    setIsPressed(false);
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  // Keyboard support for accessibility
  const handleKeyDown = (e) => {
    if (disabled) return;
    e.stopPropagation();

    if (e.key === 'Enter') {
      e.preventDefault();
      cycleStatus();
    } else if (e.key === ' ') {
      e.preventDefault();
      openMenu();
    } else if (e.key === 'Escape' && showMenu) {
      e.preventDefault();
      setShowMenu(false);
    }
  };

  // Close menu when clicking outside
  const handleMenuBlur = () => {
    // Small delay to allow click on menu item
    setTimeout(() => setShowMenu(false), 150);
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Badge Button */}
      <button
        type="button"
        className={`
          px-2 py-1 text-xs font-medium rounded-full
          transition-all duration-150 select-none
          ${colorClass}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isPressed ? 'scale-95' : 'scale-100'}
          focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500
        `}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={showMenu}
      >
        {label}
      </button>

      {/* Dropdown Menu */}
      {showMenu && (
        <div
          className="absolute z-50 mt-1 left-0 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[120px]"
          role="listbox"
          onBlur={handleMenuBlur}
        >
          {config.order.map((statusOption) => (
            <button
              key={statusOption}
              type="button"
              className={`
                w-full px-3 py-2 text-left text-sm
                hover:bg-gray-50 transition-colors
                ${statusOption === status ? 'font-medium bg-gray-50' : ''}
              `}
              onClick={(e) => {
                e.stopPropagation();
                selectStatus(statusOption);
              }}
              role="option"
              aria-selected={statusOption === status}
            >
              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${config.colors[statusOption].split(' ')[0]}`} />
              {config.labels[statusOption]}
            </button>
          ))}
        </div>
      )}

      {/* Click-outside overlay to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}

export default StatusBadge;
```

---

## Implementation 5: Update Selections Page (A3 + A4)

### Modify: `client/src/pages/Selections.jsx`

Find and update the SelectionCard component (or extract it to a separate file). Here's the pattern to apply:

**Step 1: Add imports at top of file**

```javascript
import { haptic } from '../utils/haptic';
import { StatusBadge } from '../components/ui/StatusBadge';
import { buildSmartDefaults, updateRecentDefaults } from '../utils/recentDefaults';
import { useParams } from 'react-router-dom';
```

**Step 2: Update status handling in SelectionCard**

Replace any existing status badge with the new StatusBadge component:

```javascript
// Before (example - find similar pattern)
<span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selection.status)}`}>
  {selection.status}
</span>

// After
<StatusBadge
  status={selection.status}
  type="selection"
  onChange={(newStatus) => handleStatusChange(selection.id, newStatus)}
/>
```

**Step 3: Add smart defaults to AddSelectionModal opening**

```javascript
// In the Selections page component:
const { projectId } = useParams();

// Get current filter values (adjust based on actual state variable names)
const currentFilters = {
  roomId: filterRoom,
  categoryCode: filterCategory,
  // Add other relevant filters
};

// Build smart defaults when opening modal
const handleOpenAddModal = () => {
  const defaults = buildSmartDefaults({
    urlParams: { projectId },
    currentFilters,
    projectId,
  });
  setModalDefaults(defaults);
  setShowAddModal(true);
};

// Update recent defaults on save
const handleSaveSelection = (selection) => {
  updateRecentDefaults({
    lastRoomId: selection.roomId,
    lastCategoryCode: selection.categoryCode,
    lastTradeCode: selection.tradeCode,
  }, projectId);

  // Continue with existing save logic...
  saveSelection(selection);
  setShowAddModal(false);
};
```

**Step 4: Pass defaults to AddSelectionModal**

```javascript
<AddSelectionModal
  isOpen={showAddModal}
  onClose={() => setShowAddModal(false)}
  onSave={handleSaveSelection}
  defaultValues={modalDefaults}  // Add this prop
/>
```

---

## Implementation 6: Update AddSelectionModal (A4)

### Modify: `client/src/components/selections/AddSelectionModal.jsx`

**Step 1: Accept defaultValues prop**

```javascript
function AddSelectionModal({
  isOpen,
  onClose,
  onSave,
  defaultValues = {}  // Add this
}) {
```

**Step 2: Initialize form state with defaults**

```javascript
// Initial empty state
const emptySelection = {
  name: '',
  roomId: '',
  categoryCode: '',
  tradeCode: '',
  status: 'pending',
  estimatedCost: '',
  notes: '',
  // ... other fields
};

// Merge with defaults
const [formData, setFormData] = useState({
  ...emptySelection,
  ...defaultValues,
});

// Reset form when modal opens with new defaults
useEffect(() => {
  if (isOpen) {
    setFormData({
      ...emptySelection,
      ...defaultValues,
    });
  }
}, [isOpen, defaultValues]);
```

**Step 3: Add haptic feedback on save**

```javascript
import { haptic } from '../../utils/haptic';

const handleSubmit = (e) => {
  e.preventDefault();
  haptic('light');
  onSave(formData);
};
```

---

## Implementation 7: Update Today Page (A3)

### Modify: `client/src/pages/Today.jsx`

Apply the StatusBadge component to task items:

```javascript
import { StatusBadge } from '../components/ui/StatusBadge';
import { haptic } from '../utils/haptic';

// In task list rendering, replace status display:
<StatusBadge
  status={task.status}
  type="task"
  onChange={(newStatus) => handleTaskStatusChange(task.id, newStatus)}
/>
```

---

## Implementation 8: Update Loop Tracker (A3 + A4)

### Modify: `client/src/pages/LoopTracker.jsx`

**Step 1: Add imports**

```javascript
import { StatusBadge } from '../components/ui/StatusBadge';
import { haptic } from '../utils/haptic';
import { buildSmartDefaults, updateRecentDefaults } from '../utils/recentDefaults';
```

**Step 2: Apply StatusBadge to task items**

```javascript
<StatusBadge
  status={task.status}
  type="task"
  onChange={(newStatus) => handleTaskStatusChange(task.id, newStatus)}
/>
```

**Step 3: Pass filter context as smart defaults when adding tasks**

```javascript
// Get current filters from component state
const currentFilters = {
  tradeCode: filterTrade,
  phaseCode: filterPhase,
  locationId: filterLocation,
};

const handleOpenAddTask = () => {
  const defaults = buildSmartDefaults({
    urlParams: { projectId },
    currentFilters,
    projectId,
  });
  setTaskDefaults(defaults);
  setShowAddTaskModal(true);
};
```

---

## Implementation Verification

### Manual Testing Checklist

After implementing each section, verify:

**Haptic Feedback (B3)**
- [ ] Status change triggers light vibration (on supported devices)
- [ ] Task completion triggers medium vibration
- [ ] No errors on desktop browsers (silent fail)

**Smart Defaults (A4)**
- [ ] Opening AddSelectionModal from filtered view pre-fills filters
- [ ] Recent selections are remembered per project
- [ ] URL project ID is always applied
- [ ] Empty filters don't override recent defaults

**Card Interactions (C1)**
- [ ] All clickable cards show pointer cursor
- [ ] Hover shows shadow increase
- [ ] Press shows slight scale down
- [ ] Non-interactive cards have no hover effects
- [ ] Keyboard navigation works (Tab, Enter)

**Inline Status Toggle (A3)**
- [ ] Single tap cycles to next status
- [ ] Long press (400ms) shows full menu
- [ ] Terminal status (received/completed) doesn't cycle
- [ ] Space bar shows menu, Enter cycles
- [ ] Animation is smooth (scale 0.95 → 1.0)

### Automated Tests (If Test Suite Exists)

Add tests for new utilities:

```javascript
// __tests__/utils/haptic.test.js
import { haptic, hasHapticSupport } from '../utils/haptic';

describe('haptic', () => {
  it('should not throw on unsupported browsers', () => {
    expect(() => haptic('light')).not.toThrow();
  });
});

// __tests__/utils/recentDefaults.test.js
import { getRecentDefaults, updateRecentDefaults, buildSmartDefaults } from '../utils/recentDefaults';

describe('recentDefaults', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return empty object when no defaults stored', () => {
    expect(getRecentDefaults('proj-1')).toEqual({});
  });

  it('should store and retrieve defaults per project', () => {
    updateRecentDefaults({ lastRoom: 'kitchen' }, 'proj-1');
    expect(getRecentDefaults('proj-1').lastRoom).toBe('kitchen');
    expect(getRecentDefaults('proj-2').lastRoom).toBeUndefined();
  });

  it('should prioritize URL > Filters > Recent', () => {
    updateRecentDefaults({ roomId: 'recent-room', tradeCode: 'recent-trade' }, 'proj-1');

    const result = buildSmartDefaults({
      urlParams: { projectId: 'url-project' },
      currentFilters: { roomId: 'filter-room' },
      projectId: 'proj-1',
    });

    expect(result.projectId).toBe('url-project');  // URL wins
    expect(result.roomId).toBe('filter-room');     // Filter wins over recent
    expect(result.tradeCode).toBe('recent-trade'); // Recent used when no override
  });
});
```

---

## File Summary

### New Files Created
| File | Purpose |
|------|---------|
| `client/src/utils/haptic.js` | Haptic feedback utility |
| `client/src/utils/recentDefaults.js` | Smart defaults storage/retrieval |
| `client/src/components/ui/StatusBadge.jsx` | Tap-to-cycle status component |

### Files Modified
| File | Changes |
|------|---------|
| `client/src/components/ui/Card.jsx` | Added interactive prop, consistent hover/press states |
| `client/src/pages/Selections.jsx` | StatusBadge integration, smart defaults |
| `client/src/pages/Today.jsx` | StatusBadge integration |
| `client/src/pages/LoopTracker.jsx` | StatusBadge integration, smart defaults |
| `client/src/components/selections/AddSelectionModal.jsx` | defaultValues prop, haptic on save |

---

## Success Criteria

Sprint is complete when:

1. **Status changes are one tap** — No need to open menus for common status progression
2. **Forms pre-fill intelligently** — Opening add modal in context has relevant fields filled
3. **Cards feel consistent** — Same visual feedback across all interactive cards
4. **Interactions feel physical** — Haptic feedback on key actions (where supported)

---

## Next Sprint Preview (Near-Term)

After this sprint validates well, the following are queued:

- A1: Quick Actions FAB (center nav button)
- A2: Swipe Actions on cards
- B1: Bottom Nav Redesign
- C2: Skeleton Loading States
- D2: Notification Badges

---

*Implementation Document v1.0*
*Sprint: Immediate UX Improvements*
*Target: Hooomz OS*
*December 2024*
