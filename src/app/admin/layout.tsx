// app/layout.tsx
import { headers } from 'next/headers';
import { AppSidebar } from '@/components/AppSidebar';
import { adminMenu, reviewerMenu } from '@/types/menu';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppHeader from '@/components/AppHeader';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Mengakses header untuk mendapatkan peran pengguna
  const headersList = await headers();
  const role = headersList.get('pkm-user-role') || 'guest'; // Default ke 'guest' jika header tidak tersedia

  // Menentukan menu berdasarkan peran
  const menu = role === 'admin' ? adminMenu : reviewerMenu;

  return (
    <>
      <SidebarProvider>
      <div className="grid grid-cols-[250px_auto] w-screen h-screen">
        
        <aside className="bg-gray-200 p-4">
          <AppSidebar menu={menu} />
        </aside>

        <main className="flex-1 p-4">
          {children}
        </main>
      </div>
    </SidebarProvider>
    </>
  );
}
