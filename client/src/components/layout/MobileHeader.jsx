import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Search,
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
  Receipt,
  ClipboardList,
  Clock,
} from 'lucide-react';
import { Logo } from '../ui/Logo';
import { ProjectSearch } from './ProjectSearch';

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
      { to: '/sales', icon: UserPlus, label: 'Sales / Leads' },
      { to: '/estimates', icon: Calculator, label: 'Estimates' },
      { to: '/contracts', icon: FileSignature, label: 'Contracts' },
    ],
  },
  {
    label: 'Production',
    items: [
      { to: '/production', icon: HardHat, label: 'In Progress' },
      { to: '/completed', icon: CheckCircle2, label: 'Completed' },
    ],
  },
  {
    label: 'Tools',
    items: [
      { to: '/cost-catalogue', icon: BookOpen, label: 'Cost Catalogue' },
      { to: '/field-guide', icon: GraduationCap, label: 'Field Guide' },
      { to: '/time-budget', icon: Clock, label: 'Time Budget' },
      { to: '/settings', icon: Settings, label: 'Settings' },
    ],
  },
];

export function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const location = useLocation();

  // Get current page title
  const getCurrentPageTitle = () => {
    for (const section of navSections) {
      for (const item of section.items) {
        if (item.to === location.pathname) {
          return item.label;
        }
      }
    }
    // Check if it's a project detail page
    if (location.pathname.includes('/projects/')) {
      return 'Project';
    }
    return 'Hooomz';
  };

  return (
    <>
      {/* Mobile Header Bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-40 flex items-center justify-between px-4">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6 text-charcoal" />
        </button>

        <h1 className="text-lg font-semibold text-charcoal">
          {getCurrentPageTitle()}
        </h1>

        <button
          onClick={() => setShowSearch(true)}
          className="p-2 -mr-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Search projects"
        >
          <Search className="w-5 h-5 text-gray-600" />
        </button>
      </header>

      {/* Search Modal */}
      {showSearch && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowSearch(false)}
          />
          <div className="lg:hidden fixed inset-x-4 top-16 z-50 max-w-lg mx-auto">
            <ProjectSearch onClose={() => setShowSearch(false)} isMobile />
          </div>
        </>
      )}

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-out Menu */}
      <aside
        className={`
          lg:hidden fixed top-0 left-0 h-full w-72 bg-white z-50 transform transition-transform duration-300 ease-in-out flex flex-col overflow-hidden
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Menu Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-100">
          <Logo />
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 pb-8 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
          {navSections.map((section) => (
            <div key={section.label} className="mb-5">
              <h3 className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {section.label}
              </h3>
              <div className="space-y-1">
                {section.items.map(({ to, icon: Icon, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === '/'}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors
                      ${isActive
                        ? 'bg-charcoal text-white font-medium'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-charcoal'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
