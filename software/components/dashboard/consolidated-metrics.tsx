'use client'

interface ConsolidatedMetricsProps {
  currentHeight: number
  calculatedDifference: number
  containerDiameter: number
}

export function ConsolidatedMetrics({
  currentHeight,
  calculatedDifference,
  containerDiameter,
}: ConsolidatedMetricsProps) {
  return (
    <div className="grid grid-cols-2 gap-6 bg-card rounded p-6 shadow-sm">
      <div className="border-r border-border pr-6">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Current Height (H)
        </div>
        <div className="text-3xl font-bold text-foreground">
          {currentHeight.toFixed(1)} <span className="text-lg font-normal text-muted-foreground">cm</span>
        </div>
        <div className="text-xs text-muted-foreground mt-1">Real-time reading</div>
      </div>
      <div className="pl-6">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Calculated Difference
        </div>
        <div className="text-3xl font-bold text-foreground">
          {calculatedDifference.toFixed(1)} <span className="text-lg font-normal text-muted-foreground">cm</span>
        </div>
        <div className="text-xs text-muted-foreground mt-1">Based on {containerDiameter.toFixed(1)} cm Diameter</div>
      </div>
    </div>
  )
}
