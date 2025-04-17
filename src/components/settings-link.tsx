"use client"

import { Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface SettingsLinkProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
  showIcon?: boolean;
}

export function SettingsLink({
  variant = "ghost",
  className = "",
  showIcon = true,
}: SettingsLinkProps) {
  return (
    <Button
      variant={variant}
      className={className}
      asChild
    >
      <Link href="/settings">
        {showIcon && <Settings className="mr-2 h-4 w-4" />}
        Pengaturan
      </Link>
    </Button>
  );
} 