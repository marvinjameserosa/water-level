"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calculator } from "lucide-react"

interface CalculatedResultProps {
  formula: string
  value: string
  threshold: string
}

export function CalculatedResult({ formula, value, threshold }: CalculatedResultProps) {
  return (
    <Card className="shadow-none border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Calculated Difference
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Calculator className="size-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">{value}</span>
              <span className="text-sm text-muted-foreground font-mono">{formula}</span>
            </div>
            <p className="text-xs text-muted-foreground">{threshold}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
