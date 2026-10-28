import { Header } from '@/components/shared/Header';
import { Sidebar } from '@/components/shared/Sidebar';
import {
  MobileBottomNav,
  MobileNavDrawer,
  MobileNavProvider,
} from '@/components/shared/MobileNav';
import { UniversalSearch } from '@/components/search/UniversalSearch';
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
      {/* The page itself scrolls (not an inner div): mobile browsers can then
          collapse the address bar and tap-status-bar-to-top works. */}
      <div className="flex min-h-[calc(100dvh-var(--launch-banner-h,0px))] flex-col bg-[var(--background)]">
        <NavigationProgress />
        <TabTitleEngine />
        <Header />
        <UniversalSearch />
        <AlertEngine />
        <MobileNavDrawer />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex min-w-0 flex-1 flex-col overflow-x-clip p-3 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:p-4 md:p-6 md:pb-8">
            <div className="mx-auto w-full max-w-[1400px] flex-1 pb-6 md:pb-8">{children}</div>
            <SiteFooter />
          </main>
        </div>
        <MobileBottomNav />
      </div>
    </MobileNavProvider>
  );
}
