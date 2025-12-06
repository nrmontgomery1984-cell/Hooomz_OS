import { HardHat, Home, Zap } from 'lucide-react';
import { useDevAuth } from '../../hooks/useDevAuth';

// Role configuration
const ROLE_CONFIG = {
  contractor: {
    icon: HardHat,
    label: 'Contractor',
    color: 'blue',
    borderClass: 'border-blue-400',
    bgClass: 'bg-blue-50',
    textClass: 'text-blue-700',
  },
  homeowner: {
    icon: Home,
    label: 'Homeowner',
    color: 'emerald',
    borderClass: 'border-emerald-400',
    bgClass: 'bg-emerald-50',
    textClass: 'text-emerald-700',
  },
  subcontractor: {
    icon: Zap,
    label: 'Subcontractor',
    color: 'orange',
    borderClass: 'border-orange-400',
    bgClass: 'bg-orange-50',
    textClass: 'text-orange-700',
  },
};

/**
 * PersonaIndicator - Shows current persona as a persistent badge
 *
 * Can be placed in the header or sidebar to always show current test persona.
 */
export function PersonaIndicator({ variant = 'badge', className = '' }) {
  const { currentPersona, isDevMode } = useDevAuth();

  if (!isDevMode || !currentPersona) {
    return null;
  }

  const config = ROLE_CONFIG[currentPersona.role] || ROLE_CONFIG.contractor;
  const Icon = config.icon;

  // Badge variant - small inline indicator
  if (variant === 'badge') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full ${config.bgClass} ${config.textClass} text-xs font-medium ${className}`}
      >
        <Icon className="w-3 h-3" />
        <span>{config.label}</span>
      </div>
    );
  }

  // Minimal variant - just icon with tooltip
  if (variant === 'minimal') {
    return (
      <div
        className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${config.bgClass} ${className}`}
        title={`Viewing as: ${currentPersona.name} (${config.label})`}
      >
        <Icon className={`w-3.5 h-3.5 ${config.textClass}`} />
      </div>
    );
  }

  // Full variant - shows name and role
  if (variant === 'full') {
    return (
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-lg ${config.bgClass} border ${config.borderClass} ${className}`}
      >
        <div
          className={`w-8 h-8 rounded-full bg-${config.color}-500 flex items-center justify-center`}
        >
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-sm font-medium text-gray-900">{currentPersona.name}</div>
          <div className={`text-xs ${config.textClass}`}>{config.label}</div>
        </div>
      </div>
    );
  }

  return null;
}

/**
 * DevBorder - Wraps the app with a colored border indicating current persona
 *
 * Only visible in dev mode. Provides a constant visual reminder of the current test persona.
 */
export function DevBorder({ children }) {
  const { currentPersona, isDevMode } = useDevAuth();

  if (!isDevMode || !currentPersona) {
    return children;
  }

  const config = ROLE_CONFIG[currentPersona.role] || ROLE_CONFIG.contractor;

  return (
    <div className={`min-h-screen border-t-4 ${config.borderClass}`}>{children}</div>
  );
}

export default PersonaIndicator;
