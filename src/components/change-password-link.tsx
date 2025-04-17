"use client"

import { Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ChangePasswordLinkProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
  showIcon?: boolean;
}

export function ChangePasswordLink({
  variant = "ghost",
  className = "",
  showIcon = true,
}: ChangePasswordLinkProps) {
  return (
    <Button
      variant={variant}
      className={className}
      asChild
    >
      <Link href="/auth/change-password">
        {showIcon && <Lock className="mr-2 h-4 w-4" />}
        Ganti Password
      </Link>
    </Button>
  );
} 