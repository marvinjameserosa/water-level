"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  label: string
  value: string
  icon: React.ReactNode
  status?: "active" | "static" | "alert"
  subtitle?: string
}

export function MetricCard({ label, value, icon, status = "static", subtitle }: MetricCardProps) {
  return (
    <Card className="shadow-none border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
          <div
            className={cn(
              "size-2.5 rounded-full",
              status === "active" && "bg-success",
              status === "static" && "bg-muted-foreground",
              status === "alert" && "bg-destructive"
            )}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
