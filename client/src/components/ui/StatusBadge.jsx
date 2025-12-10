/**
 * StatusBadge Component for Hooomz OS
 *
 * Single tap: Cycle to next status
 * Long press (400ms): Show full status menu
 * Keyboard: Enter = cycle, Space = menu
 */

import { useState, useRef, useCallback } from 'react';
import { haptic } from '../../utils/haptic';

// Status configurations by entity type
const STATUS_CONFIG = {
  selection: {
    order: ['pending', 'approved', 'ordered', 'received'],
    colors: {
      pending: { bg: '#9CA3AF', text: 'white' },      // gray-400
      approved: { bg: '#3B82F6', text: 'white' },     // blue-500
      ordered: { bg: '#F59E0B', text: 'white' },      // amber-500
      received: { bg: '#10B981', text: 'white' },     // green-500
    },
    labels: {
      pending: 'Pending',
      approved: 'Approved',
      ordered: 'Ordered',
      received: 'Received',
    },
    terminal: 'received',
  },
  task: {
    order: ['pending', 'in_progress', 'completed'],
    colors: {
      pending: { bg: '#9CA3AF', text: 'white' },
      in_progress: { bg: '#3B82F6', text: 'white' },
      completed: { bg: '#10B981', text: 'white' },
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
      active: { bg: '#10B981', text: 'white' },
      paused: { bg: '#F59E0B', text: 'white' },
      completed: { bg: '#6B7280', text: 'white' },
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
 * @param {Array} props.customStatuses - Optional custom statuses array [{code, name, color}]
 */
export function StatusBadge({
  status,
  type = 'task',
  onChange,
  disabled = false,
  className = '',
  customStatuses = null,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const pressTimerRef = useRef(null);
  const didLongPressRef = useRef(false);

  // Use custom statuses if provided, otherwise use config
  const config = STATUS_CONFIG[type] || STATUS_CONFIG.task;

  // Build status info from either custom or config
  const getStatusColor = (statusCode) => {
    if (customStatuses) {
      const found = customStatuses.find(s => s.code === statusCode);
      return found?.color || '#9CA3AF';
    }
    return config.colors[statusCode]?.bg || '#9CA3AF';
  };

  const getStatusLabel = (statusCode) => {
    if (customStatuses) {
      const found = customStatuses.find(s => s.code === statusCode);
      return found?.name || statusCode;
    }
    return config.labels[statusCode] || statusCode;
  };

  const getStatusOrder = () => {
    if (customStatuses) {
      return customStatuses.map(s => s.code);
    }
    return config.order;
  };

  const getTerminalStatus = () => {
    if (customStatuses) {
      return customStatuses[customStatuses.length - 1]?.code;
    }
    return config.terminal;
  };

  const statusColor = getStatusColor(status);
  const statusLabel = getStatusLabel(status);
  const statusOrder = getStatusOrder();
  const terminalStatus = getTerminalStatus();

  // Get next status in cycle (or null if at terminal)
  const getNextStatus = useCallback(() => {
    if (status === terminalStatus) {
      // At terminal, cycle back to first
      return statusOrder[0];
    }
    const currentIndex = statusOrder.indexOf(status);
    if (currentIndex === -1) return statusOrder[0];
    const nextIndex = (currentIndex + 1) % statusOrder.length;
    return statusOrder[nextIndex];
  }, [status, terminalStatus, statusOrder]);

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

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Badge Button */}
      <button
        type="button"
        className={`
          px-2.5 py-1 text-xs font-medium rounded-full
          transition-all duration-150 select-none
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isPressed ? 'scale-95' : 'scale-100'}
          focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500
        `}
        style={{
          backgroundColor: statusColor,
          color: 'white',
        }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={showMenu}
      >
        {statusLabel}
      </button>

      {/* Dropdown Menu */}
      {showMenu && (
        <div
          className="absolute z-50 mt-1 right-0 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[140px]"
          role="listbox"
        >
          {statusOrder.map((statusOption) => (
            <button
              key={statusOption}
              type="button"
              className={`
                w-full px-3 py-2 text-left text-sm
                hover:bg-gray-50 transition-colors
                flex items-center gap-2
                ${statusOption === status ? 'font-medium bg-gray-50' : ''}
              `}
              onClick={(e) => {
                e.stopPropagation();
                selectStatus(statusOption);
              }}
              role="option"
              aria-selected={statusOption === status}
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: getStatusColor(statusOption) }}
              />
              {getStatusLabel(statusOption)}
            </button>
          ))}
        </div>
      )}

      {/* Click-outside overlay to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(false);
          }}
        />
      )}
    </div>
  );
}

export default StatusBadge;
