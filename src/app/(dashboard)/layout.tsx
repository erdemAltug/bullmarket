import { Header } from '@/components/shared/Header';
import { Sidebar } from '@/components/shared/Sidebar';
import {
  MobileBottomNav,
  MobileNavDrawer,
  MobileNavProvider,
} from '@/components/shared/MobileNav';
import { CommandPalette } from '@/components/shared/CommandPalette';
import { NavigationProgress } from '@/components/shared/NavigationProgress';
import { TabTitleEngine } from '@/components/shared/TabTitleEngine';
import { AlertEngine } from '@/components/alerts/AlertEngine';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MobileNavProvider>
      <div className="flex min-h-screen flex-col bg-[var(--background)]">
        <NavigationProgress />
        <TabTitleEngine />
        <Header />
        <CommandPalette />
        <AlertEngine />
        <MobileNavDrawer />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-3 pb-[5.5rem] sm:p-4 md:p-6 md:pb-6">
            {children}
          </main>
        </div>
        <MobileBottomNav />
      </div>
    </MobileNavProvider>
  );
}
