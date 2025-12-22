import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  UserPlus,
  Calculator,
  FileSignature,
  HardHat,
  CheckCircle2,
  Settings,
  BookOpen,
  GraduationCap,
  Timer,
  Search,
  Receipt,
  ClipboardList,
  Home,
  Zap,
  ChevronDown,
  Clock,
  Shield,
  Briefcase,
  Hammer,
  User,
  Users,
} from 'lucide-react';
import { Logo } from '../ui/Logo';
import { ProjectSearch } from './ProjectSearch';
import { useDevAuth } from '../../hooks/useDevAuth';
import { ROLES } from '../../lib/devData';
import { mockProjects } from '../../services/mockData';

// Map project phase to nav path
const PHASE_TO_NAV = {
  intake: '/sales',
  estimating: '/estimates',
  approval: '/estimates',
  contracted: '/contracts',
  active: '/production',
  complete: '/completed',
};

// Check if nav item should be active based on current path
// Handles project subpages like /projects/xxx/estimate -> Estimates
const checkIsActive = (to, pathname, projectPhase = null) => {
  // Exact match for root
  if (to === '/') return pathname === '/';

  // Direct match
  if (pathname === to || pathname.startsWith(to + '/')) return true;

  // Project page matching - highlight appropriate nav based on URL subpage or phase
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
    // Main project view - highlight based on project's current phase
    if (projectPhase && PHASE_TO_NAV[projectPhase]) {
      return to === PHASE_TO_NAV[projectPhase];
    }
    return false;
  }

  return false;
};

// Navigation organized by business phase
const navSections = [
  {
    label: 'Overview',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
      // Today page hidden - reserved for field worker features
      // { to: '/today', icon: Calendar, label: 'Today' },
    ],
  },
  {
    label: 'Daily',
    items: [
      { to: '/time-tracker', icon: Timer, label: 'Time' },
      { to: '/expenses', icon: Receipt, label: 'Expenses' },
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
    label: 'People',
    items: [
      { to: '/team', icon: Users, label: 'Team' },
    ],
  },
  {
    label: 'Tools',
    items: [
      { to: '/cost-catalogue', icon: BookOpen, label: 'Cost Catalogue' },
      { to: '/field-guide', icon: GraduationCap, label: 'Field Guide' },
      { to: '/time-budget', icon: Clock, label: 'Time Budget' },
    ],
  },
];

// Icon mapping for roles
const ROLE_ICONS = {
  administrator: Shield,
  manager: Briefcase,
  foreman: HardHat,
  carpenter: Hammer,
  apprentice: GraduationCap,
  labourer: User,
  homeowner: Home,
  subcontractor: Zap,
  contractor: Shield, // Legacy alias
};

// Get color classes from hex color
const getColorClasses = (hexColor) => {
  const colorMap = {
    '#8b5cf6': { text: 'text-purple-600', border: 'border-purple-500', bg: 'bg-purple-500' },
    '#3b82f6': { text: 'text-blue-600', border: 'border-blue-500', bg: 'bg-blue-500' },
    '#f59e0b': { text: 'text-amber-600', border: 'border-amber-500', bg: 'bg-amber-500' },
    '#10b981': { text: 'text-emerald-600', border: 'border-emerald-500', bg: 'bg-emerald-500' },
    '#06b6d4': { text: 'text-cyan-600', border: 'border-cyan-500', bg: 'bg-cyan-500' },
    '#64748b': { text: 'text-slate-600', border: 'border-slate-500', bg: 'bg-slate-500' },
    '#22c55e': { text: 'text-green-600', border: 'border-green-500', bg: 'bg-green-500' },
    '#f97316': { text: 'text-orange-600', border: 'border-orange-500', bg: 'bg-orange-500' },
  };
  return colorMap[hexColor] || { text: 'text-gray-600', border: 'border-gray-500', bg: 'bg-gray-500' };
};

// Get persona display config from role
const getPersonaConfig = (role) => {
  const roleConfig = ROLES[role] || ROLES.tradesperson;
  const colors = getColorClasses(roleConfig.color);
  return {
    icon: ROLE_ICONS[role] || User,
    label: roleConfig.label,
    shortLabel: roleConfig.shortLabel,
    description: roleConfig.description,
    ...colors,
  };
};

// Roles to show in the persona switcher (internal team roles only)
const SWITCHABLE_ROLES = ['administrator', 'manager', 'foreman', 'carpenter', 'apprentice', 'labourer'];

export function Sidebar() {
  const location = useLocation();
  const pathname = location.pathname;
  const [showSearch, setShowSearch] = useState(false);
  const [showPersonaDropdown, setShowPersonaDropdown] = useState(false);
  const { currentPersona, switchPersona } = useDevAuth();

  // Get current project's phase if we're on a project page
  const currentProjectPhase = (() => {
    const projectMatch = pathname.match(/\/projects\/([^/]+)/);
    if (projectMatch) {
      const projectId = projectMatch[1];
      const project = mockProjects.find(p => p.id === projectId);
      return project?.phase || null;
    }
    return null;
  })();

  const currentConfig = getPersonaConfig(currentPersona?.role || 'administrator');
  const CurrentIcon = currentConfig.icon;

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

      {/* Role Switcher */}
      <div className="px-3 pt-3 relative">
        <button
          onClick={() => setShowPersonaDropdown(!showPersonaDropdown)}
          className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm rounded-lg transition-colors border-2 ${currentConfig.border} bg-white hover:bg-gray-50`}
        >
          <div className="flex items-center gap-2">
            <CurrentIcon className={`w-4 h-4 ${currentConfig.text}`} />
            <span className={`font-medium ${currentConfig.text}`}>
              {currentConfig.label}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 ${currentConfig.text} transition-transform ${showPersonaDropdown ? 'rotate-180' : ''}`} />
        </button>

        {showPersonaDropdown && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowPersonaDropdown(false)}
            />
            <div className="absolute left-3 right-3 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 max-h-80 overflow-y-auto">
              {SWITCHABLE_ROLES.map((role) => {
                const config = getPersonaConfig(role);
                const Icon = config.icon;
                const isActive = currentPersona?.role === role ||
                  (role === 'administrator' && currentPersona?.role === 'contractor');
                return (
                  <button
                    key={role}
                    onClick={() => {
                      switchPersona(role);
                      setShowPersonaDropdown(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? `${config.text} bg-gray-50 font-medium`
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? config.text : 'text-gray-400'}`} />
                    <div className="flex-1 text-left">
                      <div>{config.label}</div>
                      <div className="text-xs text-gray-400 font-normal">{config.description}</div>
                    </div>
                    {isActive && <span className="text-xs">✓</span>}
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
                const isActive = checkIsActive(to, pathname, currentProjectPhase);
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
