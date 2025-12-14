import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { HardHat, Home, Zap, ChevronDown } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { MobileHeader } from './MobileHeader';
import { useDevAuth } from '../../hooks/useDevAuth';

// Persona configuration
const PERSONA_CONFIG = {
  contractor: {
    icon: HardHat,
    label: 'Contractor',
    bgColor: 'bg-blue-500',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-500',
  },
  homeowner: {
    icon: Home,
    label: 'Homeowner',
    bgColor: 'bg-emerald-500',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-500',
  },
  subcontractor: {
    icon: Zap,
    label: 'Sub',
    bgColor: 'bg-orange-500',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-500',
  },
};

function DesktopPersonaBar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const { currentPersona, switchPersona } = useDevAuth();

  const currentConfig = PERSONA_CONFIG[currentPersona?.role] || PERSONA_CONFIG.contractor;
  const CurrentIcon = currentConfig.icon;

  return (
    <div className="hidden lg:flex h-10 bg-gray-900 items-center justify-end px-4 gap-4">
      <span className="text-gray-400 text-xs">Viewing as:</span>
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 px-3 py-1.5 rounded bg-gray-800 hover:bg-gray-700 transition-colors"
        >
          <CurrentIcon className={`w-4 h-4 ${currentConfig.textColor}`} />
          <span className="text-white text-sm font-medium">{currentConfig.label}</span>
          <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </button>

        {showDropdown && (
          <>
            <div
              className="fixed inset-0 z-50"
              onClick={() => setShowDropdown(false)}
            />
            <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[160px]">
              {Object.entries(PERSONA_CONFIG).map(([role, config]) => {
                const Icon = config.icon;
                const isActive = currentPersona?.role === role;
                return (
                  <button
                    key={role}
                    onClick={() => {
                      switchPersona(role);
                      setShowDropdown(false);
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
    </div>
  );
}

export function AppLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <DesktopPersonaBar />
      <div className="flex flex-1">
        <Sidebar />
        <MobileHeader />
        <main className="flex-1 bg-white lg:bg-gray-50 pt-14 lg:pt-0 pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0 overflow-y-auto">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
