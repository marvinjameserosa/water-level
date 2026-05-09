"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface AlertStatusProps {
  status: "ok" | "alert"
  description: string
}

export function AlertStatus({ status, description }: AlertStatusProps) {
  return (
    <Card className="shadow-none border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Alert Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "flex size-16 items-center justify-center rounded-full",
              status === "ok" ? "bg-success/10" : "bg-destructive/10"
            )}
          >
            {status === "ok" ? (
              <CheckCircle2 className="size-10 text-success" />
            ) : (
              <AlertTriangle className="size-10 text-destructive" />
            )}
          </div>
          <div>
            <p
              className={cn(
                "text-2xl font-bold",
                status === "ok" ? "text-success" : "text-destructive"
              )}
            >
              {status === "ok" ? "OK" : "ALERT"}
            </p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
