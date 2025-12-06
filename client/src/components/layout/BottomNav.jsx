import { NavLink } from 'react-router-dom';
import { Home, Calendar, User } from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/today', icon: Calendar, label: 'Today' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-50">
      <div className="flex items-center justify-around h-14">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `
              flex flex-col items-center gap-1 py-2 px-4 min-w-[64px]
              ${isActive ? 'text-charcoal' : 'text-gray-400'}
            `}
          >
            {({ isActive }) => (
              <>
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2 : 1.5} />
                <span className={`text-xs ${isActive ? 'font-medium' : ''}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
