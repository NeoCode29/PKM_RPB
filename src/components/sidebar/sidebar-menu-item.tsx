"use client"

import { MenuItem } from "@/types/menu";
import { SidebarMenuItem as UISidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { 
  ChevronRight, 
  LayoutDashboard, 
  Users, 
  FileText, 
  ClipboardCheck, 
  ClipboardList, 
  BarChart, 
  Settings, 
  LogOut,
  FileIcon 
} from "lucide-react";

interface SidebarMenuItemProps {
  item: MenuItem;
  isActive: boolean;
}

export function SidebarMenuItemComponent({ item, isActive }: SidebarMenuItemProps) {
  // Map string icon ke komponen icon
  const getIcon = () => {
    switch (item.icon) {
      case "LayoutDashboard": return <LayoutDashboard className="h-5 w-5" />;
      case "Users": return <Users className="h-5 w-5" />;
      case "FileText": return <FileText className="h-5 w-5" />;
      case "ClipboardCheck": return <ClipboardCheck className="h-5 w-5" />;
      case "ClipboardList": return <ClipboardList className="h-5 w-5" />;
      case "BarChart": return <BarChart className="h-5 w-5" />;
      case "Settings": return <Settings className="h-5 w-5" />;
      case "LogOut": return <LogOut className="h-5 w-5" />;
      default: return <FileIcon className="h-5 w-5" />;
    }
  };

  return (
    <UISidebarMenuItem>
      <SidebarMenuButton asChild>
        <Link 
          href={item.link} 
          className={cn(
            "flex items-center py-2 px-3 rounded-md w-full text-sm",
            isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-secondary"
          )}
        >
          <div className={cn(
            "mr-3",
            isActive ? "text-primary" : "text-muted-foreground" 
          )}>
            {getIcon()}
          </div>
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </UISidebarMenuItem>
  );
} 