import { User, Settings, Bell, HelpCircle, LogOut } from 'lucide-react';
import { PageContainer } from '../components/layout';
import { Card } from '../components/ui';
import { useAuth } from '../hooks/useAuth';

const menuItems = [
  { icon: User, label: 'Account Settings', href: '/settings/account' },
  { icon: Bell, label: 'Notifications', href: '/settings/notifications' },
  { icon: Settings, label: 'Preferences', href: '/settings/preferences' },
  { icon: HelpCircle, label: 'Help & Support', href: '/help' },
];

export function Profile() {
  const { employee, signOut } = useAuth();

  const handleSignOut = () => {
    signOut();
  };

  const displayName = employee?.preferredName || employee?.firstName || 'Demo User';
  const displayEmail = employee?.email || 'demo@hooomz.com';

  return (
    <PageContainer title="Profile">
      {/* User Info */}
      <Card className="p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-charcoal">{displayName}</h2>
            <p className="text-sm text-gray-500">{displayEmail}</p>
          </div>
        </div>
      </Card>

      {/* Menu Items */}
      <Card className="mb-6">
        {menuItems.map(({ icon: Icon, label, href }, index) => (
          <a
            key={label}
            href={href}
            className={`
              flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors
              ${index < menuItems.length - 1 ? 'border-b border-gray-100' : ''}
            `}
          >
            <Icon className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-charcoal">{label}</span>
          </a>
        ))}
      </Card>

      {/* Sign Out */}
      <Card>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-red-500"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm">Sign Out</span>
        </button>
      </Card>

      {/* App Version */}
      <p className="text-center text-xs text-gray-400 mt-6">
        Hooomz OS v0.1.0
      </p>
    </PageContainer>
  );
}
