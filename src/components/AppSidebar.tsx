// components/Sidebar.tsx
"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { MenuItem } from "@/types/menu";
import { usePathname } from "next/navigation";
import { SidebarMenuItemComponent } from "./sidebar/sidebar-menu-item";

interface AppSidebarProps {
  menu: MenuItem[];
  title?: string;
}

export function AppSidebar({ menu, title = "Menu" }: AppSidebarProps) {
  const pathname = usePathname();
  
  return (
    <Sidebar className="border-r h-full">
      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-semibold tracking-tight">
            {title}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menu.map((item) => {
                const isActive = pathname === item.link || pathname.startsWith(`${item.link}/`);
                return (
                  <SidebarMenuItemComponent 
                    key={item.link}
                    item={item} 
                    isActive={isActive} 
                  />
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
