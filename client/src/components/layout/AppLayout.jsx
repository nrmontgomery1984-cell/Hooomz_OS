import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { MobileHeader } from './MobileHeader';

export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <MobileHeader />
      <main className="flex-1 bg-white lg:bg-gray-50 pt-14 lg:pt-0 pb-16 lg:pb-0">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
