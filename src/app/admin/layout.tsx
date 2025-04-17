// app/layout.tsx
import { AppSidebar } from '@/components/AppSidebar';
import { adminMenu } from '@/types/menu';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppHeader from '@/components/AppHeader';
import DynamicBreadcrumb from '@/components/DynamicBreadcrumb';
import { Toaster } from '@/components/ui/toaster';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="grid grid-cols-[250px_1fr] min-h-screen h-screen overflow-hidden w-screen">
        {/* Sidebar */}
        <aside className="border-r h-screen overflow-auto">
          <AppSidebar menu={adminMenu} title="Admin Panel" />
        </aside>
        
        {/* Header dan Content */}
        <div className="flex flex-col h-screen">
          <AppHeader />
          <div className="px-6 py-2 border-b">
            <DynamicBreadcrumb />
          </div>
          <main className="flex-grow p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}
