"use client";

import { Card } from "@/components/ui/card";
import { AlertCircle, CheckCircle } from "lucide-react";

interface MetricDisplayProps {
  label: string;
  value: string | number;
  unit?: string;
  status?: "ok" | "alert";
  icon?: React.ReactNode;
}

export function MetricDisplay({
  label,
  value,
  unit = "",
  status,
  icon,
}: MetricDisplayProps) {
  const statusColor = status === "alert" ? "text-destructive" : "text-success";
  const statusIcon =
    status === "alert" ? (
      <AlertCircle className="size-5" />
    ) : (
      <CheckCircle className="size-5" />
    );
  const displayedIcon = icon ?? statusIcon;

  return (
    <Card className="p-4 border border-border">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className="text-2xl font-bold text-foreground">
            {value}
            {unit && <span className="text-lg ml-1">{unit}</span>}
          </p>
        </div>
        {(status || icon) && <div className={statusColor}>{displayedIcon}</div>}
      </div>
    </Card>
  );
}
