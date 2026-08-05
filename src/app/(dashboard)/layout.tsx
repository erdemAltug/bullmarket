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
import { SiteFooter } from '@/components/shared/SiteFooter';
import { AlertEngine } from '@/components/alerts/AlertEngine';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MobileNavProvider>
      <div className="flex h-dvh flex-col overflow-hidden bg-[var(--background)]">
        <NavigationProgress />
        <TabTitleEngine />
        <Header />
        <CommandPalette />
        <AlertEngine />
        <MobileNavDrawer />
        <div className="flex min-h-0 flex-1">
          <Sidebar />
          <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto p-3 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:p-4 md:p-6 md:pb-8">
            <div className="flex-1 pb-6 md:pb-8">{children}</div>
            <SiteFooter />
          </main>
        </div>
        <MobileBottomNav />
      </div>
    </MobileNavProvider>
  );
}
