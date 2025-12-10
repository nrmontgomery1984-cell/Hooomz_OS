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
} from 'lucide-react';
import { Logo } from '../ui/Logo';

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
      { to: '/loop-tracker', icon: ListTodo, label: 'Loop Tracker' },
      { to: '/time-tracker', icon: Timer, label: 'Time Tracker' },
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

export function Sidebar() {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <aside className="hidden lg:flex w-60 bg-white border-r border-gray-200 h-screen flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-gray-100">
        <Logo />
      </div>

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
