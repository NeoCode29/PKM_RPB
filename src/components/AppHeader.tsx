"use client"

import { Bell, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DynamicBreadcrumb from "./DynamicBreadcrumb";

export default function AppHeader() {
  return (
    <header className="border-b bg-background shrink-0">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">Sistem PKM RPB</h1>
        </div>     
      </div>
    </header>
  );
}
