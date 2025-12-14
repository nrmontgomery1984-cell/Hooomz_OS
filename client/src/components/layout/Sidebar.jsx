import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  UserPlus,
  Calculator,
  FileSignature,
  HardHat,
  CheckCircle2,
  Calendar,
  Settings,
  BookOpen,
  GraduationCap,
  ListTodo,
  Timer,
  Search,
  Receipt,
  ClipboardList,
  Home,
  Zap,
  ChevronDown,
} from 'lucide-react';
import { Logo } from '../ui/Logo';
import { ProjectSearch } from './ProjectSearch';
import { useDevAuth } from '../../hooks/useDevAuth';

// Check if nav item should be active based on current path
// Handles project subpages like /projects/xxx/estimate -> Estimates
const checkIsActive = (to, pathname) => {
  // Exact match for root
  if (to === '/') return pathname === '/';

  // Direct match
  if (pathname === to || pathname.startsWith(to + '/')) return true;

  // Project page matching - highlight appropriate nav based on URL
  if (pathname.includes('/projects/')) {
    // Estimate builder page
    if (pathname.includes('/estimate')) {
      return to === '/estimates';
    }
    // Contract page
    if (pathname.includes('/contract')) {
      return to === '/contracts';
    }
    // Quote page (homeowner view)
    if (pathname.includes('/quote')) {
      return to === '/estimates';
    }
    // Main project dashboard - highlight Estimates as default
    // (Most project work happens in the estimating/quoting phase)
    return to === '/estimates';
  }

  return false;
};

// Navigation organized by business phase
const navSections = [
  {
    label: 'Overview',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/today', icon: Calendar, label: 'Today' },
    ],
  },
  {
    label: 'Daily',
    items: [
      { to: '/loop-tracker', icon: ListTodo, label: 'Loop Tracker' },
      { to: '/time-tracker', icon: Timer, label: 'Time Tracker' },
      { to: '/expenses', icon: Receipt, label: 'Expense Tracker' },
      { to: '/daily-log', icon: ClipboardList, label: 'Daily Log' },
    ],
  },
  {
    label: 'Pipeline',
    items: [
      { to: '/sales', icon: UserPlus, label: 'Sales / Leads', badge: 'intake' },
      { to: '/estimates', icon: Calculator, label: 'Estimates', badge: 'pricing' },
      { to: '/contracts', icon: FileSignature, label: 'Contracts', badge: 'approval' },
    ],
  },
  {
    label: 'Production',
    items: [
      { to: '/production', icon: HardHat, label: 'In Progress', badge: 'active' },
      { to: '/completed', icon: CheckCircle2, label: 'Completed' },
    ],
  },
  {
    label: 'Tools',
    items: [
      { to: '/cost-catalogue', icon: BookOpen, label: 'Cost Catalogue' },
      { to: '/field-guide', icon: GraduationCap, label: 'Field Guide' },
    ],
  },
];

// Persona configuration for the quick switcher
const PERSONA_CONFIG = {
  contractor: {
    icon: HardHat,
    label: 'Contractor',
    shortLabel: 'CONT',
    bgColor: 'bg-blue-500',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-500',
  },
  homeowner: {
    icon: Home,
    label: 'Homeowner',
    shortLabel: 'HOME',
    bgColor: 'bg-emerald-500',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-500',
  },
  subcontractor: {
    icon: Zap,
    label: 'Sub',
    shortLabel: 'SUB',
    bgColor: 'bg-orange-500',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-500',
  },
};

export function Sidebar() {
  const location = useLocation();
  const pathname = location.pathname;
  const [showSearch, setShowSearch] = useState(false);
  const [showPersonaDropdown, setShowPersonaDropdown] = useState(false);
  const { currentPersona, switchPersona, isDevMode } = useDevAuth();

  const currentConfig = PERSONA_CONFIG[currentPersona?.role] || PERSONA_CONFIG.contractor;
  const CurrentIcon = currentConfig?.icon || HardHat;

  return (
    <aside className="hidden lg:flex w-60 bg-white border-r border-gray-200 h-screen flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-gray-100">
        <Logo />
      </div>

      {/* Search Button */}
      <div className="px-3 pt-3">
        <button
          onClick={() => setShowSearch(true)}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-charcoal bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
        >
          <Search className="w-4 h-4" />
          <span>Search projects...</span>
        </button>
      </div>

      {/* Persona Switcher - Always visible */}
      <div className="px-3 pt-3 relative">
        <button
          onClick={() => setShowPersonaDropdown(!showPersonaDropdown)}
          className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm rounded-lg transition-colors border-2 ${currentConfig.borderColor} bg-white hover:bg-gray-50`}
        >
          <div className="flex items-center gap-2">
            <CurrentIcon className={`w-4 h-4 ${currentConfig.textColor}`} />
            <span className={`font-medium ${currentConfig.textColor}`}>
              {currentConfig.label}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 ${currentConfig.textColor} transition-transform ${showPersonaDropdown ? 'rotate-180' : ''}`} />
        </button>

        {showPersonaDropdown && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowPersonaDropdown(false)}
            />
            <div className="absolute left-3 right-3 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              {Object.entries(PERSONA_CONFIG).map(([role, config]) => {
                const Icon = config.icon;
                const isActive = currentPersona?.role === role;
                return (
                  <button
                    key={role}
                    onClick={() => {
                      switchPersona(role);
                      setShowPersonaDropdown(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? `${config.textColor} bg-gray-50 font-medium`
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? config.textColor : 'text-gray-400'}`} />
                    {config.label}
                    {isActive && <span className="ml-auto text-xs">✓</span>}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Search Modal */}
      {showSearch && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowSearch(false)}
          />
          <div className="fixed left-60 top-20 z-50 w-96">
            <ProjectSearch onClose={() => setShowSearch(false)} />
          </div>
        </>
      )}

      {/* Navigation by sections */}
      <nav className="flex-1 p-3 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.label} className="mb-6">
            <h3 className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {section.label}
            </h3>
            <div className="space-y-1">
              {section.items.map(({ to, icon: Icon, label }) => {
                const isActive = checkIsActive(to, pathname);
                return (
                  <NavLink
                    key={to}
                    to={to}
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors
                      ${isActive
                        ? 'bg-emerald-50 text-emerald-700 font-bold border-l-4 border-emerald-500 -ml-1 pl-4'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-charcoal'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Settings at bottom */}
      <div className="p-3 border-t border-gray-100">
        <NavLink
          to="/settings"
          className={({ isActive }) => `
            flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors
            ${isActive
              ? 'bg-emerald-50 text-emerald-700 font-bold border-l-4 border-emerald-500 -ml-1 pl-4'
              : 'text-gray-600 hover:bg-gray-50 hover:text-charcoal'
            }
          `}
        >
          <Settings className="w-4 h-4" />
          Settings
        </NavLink>
      </div>
    </aside>
  );
}
