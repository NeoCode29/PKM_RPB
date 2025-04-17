"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";
import { logoutUser } from "@/app/auth/actions";

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showIcon?: boolean;
}

export function LogoutButton({ 
  variant = "default", 
  size = "default", 
  className = "",
  showIcon = true 
}: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logoutUser();
    } catch (error) {
      console.error("Error logging out:", error);
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleLogout}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Keluar...
        </>
      ) : (
        <>
          {showIcon && <LogOut className="mr-2 h-4 w-4" />}
          Keluar
        </>
      )}
    </Button>
  );
} 