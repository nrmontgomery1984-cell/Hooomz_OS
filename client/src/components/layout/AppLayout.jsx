import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { MobileHeader } from './MobileHeader';

export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <MobileHeader />
      <main className="flex-1 bg-white lg:bg-gray-50 pt-14 lg:pt-0 pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0 overflow-y-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
