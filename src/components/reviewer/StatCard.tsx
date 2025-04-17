'use client';

import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  className?: string;
  loading?: boolean;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  className = "",
  loading = false,
}: StatCardProps) {
  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-2">
              {loading ? (
                <span className="text-muted-foreground text-sm">Memuat...</span>
              ) : (
                value
              )}
            </h3>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div className="p-2 bg-primary/10 rounded-full">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 