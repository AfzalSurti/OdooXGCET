import { Outlet } from 'react-router-dom';
import { TopNavBar } from './TopNavBar';

export function AppLayout() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <TopNavBar />
      <main className="flex-1 overflow-auto">
        <div className="page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
