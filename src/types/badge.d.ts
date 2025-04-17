import "@radix-ui/react-icons";
import { ButtonHTMLAttributes } from "react";

declare module "@/components/ui/badge" {
  export interface BadgeProps extends ButtonHTMLAttributes<HTMLDivElement> {
    variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
  }
} 