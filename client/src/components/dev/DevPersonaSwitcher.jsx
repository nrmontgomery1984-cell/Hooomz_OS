import { useState } from 'react';
import {
  HardHat,
  Home,
  Zap,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Wrench,
  X,
} from 'lucide-react';
import { useDevAuth } from '../../hooks/useDevAuth';
import { ROLE_RESTRICTIONS } from '../../lib/devData';

// Persona icons and styling
const PERSONA_CONFIG = {
  contractor: {
    icon: HardHat,
    label: 'Contractor',
    shortLabel: 'CONT',
    bgColor: 'bg-blue-500',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-600',
    hoverBg: 'hover:bg-blue-50',
    activeBg: 'bg-blue-100',
  },
  homeowner: {
    icon: Home,
    label: 'Homeowner',
    shortLabel: 'HOME',
    bgColor: 'bg-emerald-500',
    borderColor: 'border-emerald-500',
    textColor: 'text-emerald-600',
    hoverBg: 'hover:bg-emerald-50',
    activeBg: 'bg-emerald-100',
  },
  subcontractor: {
    icon: Zap,
    label: 'Subcontractor',
    shortLabel: 'SUB',
    bgColor: 'bg-orange-500',
    borderColor: 'border-orange-500',
    textColor: 'text-orange-600',
    hoverBg: 'hover:bg-orange-50',
    activeBg: 'bg-orange-100',
  },
};

/**
 * DevPersonaSwitcher - Floating panel for switching between test personas
 *
 * Only renders in development mode.
 * Positioned in bottom-right corner with collapse/expand functionality.
 */
export function DevPersonaSwitcher() {
  const { currentPersona, switchPersona, resetTestData, isDevMode, personas } = useDevAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showRestrictions, setShowRestrictions] = useState(false);

  // Don't render in production
  if (!isDevMode || !currentPersona) {
    return null;
  }

  // Get current persona key
  const currentPersonaKey = Object.keys(personas).find(
    (key) => personas[key].id === currentPersona.id
  );
  const currentConfig = PERSONA_CONFIG[currentPersonaKey] || PERSONA_CONFIG.contractor;
  const CurrentIcon = currentConfig.icon;

  // Get restrictions for current role
  const restrictions = ROLE_RESTRICTIONS[currentPersona.role] || [];

  // Collapsed view - just a small floating button
  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className={`fixed bottom-20 lg:bottom-4 right-4 z-[100] flex items-center gap-2 px-3 py-2 rounded-full shadow-lg border-2 ${currentConfig.borderColor} bg-white hover:shadow-xl transition-all`}
        title="Dev Mode - Click to expand"
      >
        <CurrentIcon className={`w-5 h-5 ${currentConfig.textColor}`} />
        <span className={`text-sm font-medium ${currentConfig.textColor}`}>
          {currentConfig.shortLabel}
        </span>
        <Wrench className="w-3 h-3 text-gray-400" />
      </button>
    );
  }

  // Expanded view
  return (
    <div
      className={`fixed bottom-20 lg:bottom-4 right-4 z-[100] w-72 bg-white rounded-xl shadow-2xl border-2 ${currentConfig.borderColor} overflow-hidden`}
    >
      {/* Header */}
      <div className="bg-gray-50 px-4 py-2 flex items-center justify-between border-b">
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-semibold text-gray-700">DEV MODE</span>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="p-1 hover:bg-gray-200 rounded transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Current Persona */}
      <div className="px-4 py-3 border-b">
        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
          Currently viewing as:
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full ${currentConfig.bgColor} flex items-center justify-center`}
          >
            <CurrentIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">{currentPersona.name}</div>
            <div className={`text-sm ${currentConfig.textColor} font-medium`}>
              {currentConfig.label}
            </div>
          </div>
        </div>
      </div>

      {/* Persona Switcher Buttons */}
      <div className="p-3">
        <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
          Switch persona:
        </div>
        <div className="flex gap-2">
          {Object.entries(PERSONA_CONFIG).map(([key, config]) => {
            const Icon = config.icon;
            const isActive = currentPersonaKey === key;

            return (
              <button
                key={key}
                onClick={() => switchPersona(key)}
                className={`flex-1 flex flex-col items-center gap-1 py-2 px-2 rounded-lg border-2 transition-all ${
                  isActive
                    ? `${config.borderColor} ${config.activeBg}`
                    : `border-gray-200 ${config.hoverBg}`
                }`}
                title={`Switch to ${config.label}`}
              >
                <Icon
                  className={`w-5 h-5 ${isActive ? config.textColor : 'text-gray-400'}`}
                />
                <span
                  className={`text-xs font-medium ${
                    isActive ? config.textColor : 'text-gray-500'
                  }`}
                >
                  {config.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Restrictions Accordion */}
      {restrictions.length > 0 && (
        <div className="border-t">
          <button
            onClick={() => setShowRestrictions(!showRestrictions)}
            className="w-full px-4 py-2 flex items-center justify-between text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <span>What this persona CAN'T do</span>
            {showRestrictions ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {showRestrictions && (
            <div className="px-4 pb-3">
              <ul className="space-y-1">
                {restrictions.map((restriction, index) => (
                  <li
                    key={index}
                    className="text-xs text-gray-500 flex items-start gap-2"
                  >
                    <span className="text-red-400 mt-0.5">×</span>
                    {restriction}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Reset Data Button */}
      <div className="border-t p-3">
        <button
          onClick={() => {
            if (window.confirm('Reset all test data to initial state?')) {
              resetTestData();
            }
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Test Data
        </button>
      </div>

      {/* Persona Description */}
      <div className="bg-gray-50 px-4 py-2 border-t">
        <p className="text-xs text-gray-500">{currentPersona.description}</p>
      </div>
    </div>
  );
}

export default DevPersonaSwitcher;
