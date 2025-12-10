import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

/**
 * HealthIndicator - Visual health status with icon and label
 *
 * Shows green/yellow/red status with optional tooltip.
 * On mobile (sm size), uses abbreviated labels to fit better.
 */
export function HealthIndicator({ status, reason, size = 'md', showLabel = true }) {
  const config = {
    on_track: {
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      icon: CheckCircle2,
      label: 'On Track',
      shortLabel: 'OK',
    },
    at_risk: {
      color: 'text-amber-500',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: AlertTriangle,
      label: 'At Risk',
      shortLabel: 'Risk',
    },
    behind: {
      color: 'text-red-500',
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: XCircle,
      label: 'Behind',
      shortLabel: 'Late',
    },
  };

  const sizes = {
    sm: { icon: 'w-4 h-4', text: 'text-xs', padding: 'px-2 py-1', useShortLabel: true },
    md: { icon: 'w-5 h-5', text: 'text-sm', padding: 'px-3 py-1.5', useShortLabel: false },
    lg: { icon: 'w-6 h-6', text: 'text-base', padding: 'px-4 py-2', useShortLabel: false },
  };

  const { color, bg, border, icon: Icon, label, shortLabel } = config[status] || config.on_track;
  const { icon: iconSize, text: textSize, padding, useShortLabel } = sizes[size];
  const displayLabel = useShortLabel ? shortLabel : label;

  return (
    <div className="group relative inline-flex flex-shrink-0">
      <div
        className={`
          inline-flex items-center gap-1 rounded-full border whitespace-nowrap
          ${bg} ${border} ${padding}
        `}
      >
        <Icon className={`${iconSize} ${color} flex-shrink-0`} />
        {showLabel && (
          <span className={`font-medium ${textSize} ${color}`}>{displayLabel}</span>
        )}
      </div>

      {/* Tooltip with reason */}
      {reason && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-charcoal text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
          {reason}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-charcoal" />
        </div>
      )}
    </div>
  );
}

/**
 * HealthDot - Simple colored dot indicator
 */
export function HealthDot({ status, size = 'md', pulse = false }) {
  const colors = {
    on_track: 'bg-emerald-500',
    at_risk: 'bg-amber-500',
    behind: 'bg-red-500',
  };

  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <span className="relative inline-flex">
      <span className={`rounded-full ${colors[status]} ${sizes[size]}`} />
      {pulse && status !== 'on_track' && (
        <span
          className={`absolute inset-0 rounded-full ${colors[status]} animate-ping opacity-75`}
        />
      )}
    </span>
  );
}
