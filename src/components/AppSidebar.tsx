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
import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

interface AppSidebarProps {
  menu: MenuItem[];
  title?: string;
}

export function AppSidebar({ menu, title = "Menu" }: AppSidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      {/* Mobile Menu Button */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Sidebar */}
      <div className={`
        md:w-64 w-[280px]
        fixed md:sticky top-0 
        h-screen
        transition-all duration-300 ease-in-out
        ${isOpen ? 'left-0' : '-left-[280px] md:left-0'}
        z-40
        bg-background
        border-r
      `}>
        {/* Mobile Close Button */}
        <div className="absolute top-4 right-4 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Sidebar Content */}
        <div className="h-full overflow-y-auto">
          <div className="pt-16 md:pt-4">
            <Sidebar>
              <SidebarContent className="px-4">
                <SidebarGroup>
                  <SidebarGroupLabel className="text-lg font-semibold tracking-tight mb-4">
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
                            onItemClick={() => setIsOpen(false)}
                          />
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>
            </Sidebar>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
