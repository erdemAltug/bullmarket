import { Header } from '@/components/shared/Header';
import { Sidebar } from '@/components/shared/Sidebar';
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
    <div className="flex min-h-screen flex-col bg-[#050508]">
      <NavigationProgress />
      <TabTitleEngine />
      <Header />
      <CommandPalette />
      <AlertEngine />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
