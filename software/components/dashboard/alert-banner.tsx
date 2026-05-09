'use client'

import { Card } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

interface AlertBannerProps {
  isAlert: boolean
  difference: number
  threshold: number
}

export function AlertBanner({ isAlert, difference, threshold }: AlertBannerProps) {
  if (!isAlert) {
    return null
  }

  return (
    <Card className="p-4 bg-destructive/10 border border-destructive/30">
      <div className="flex items-center gap-3">
        <AlertCircle className="size-5 text-destructive flex-shrink-0" />
        <div>
          <p className="font-semibold text-destructive">Alert: Threshold Exceeded</p>
          <p className="text-sm text-destructive/80">
            Difference ({difference.toFixed(1)} cm) exceeds threshold (&gt; {threshold} cm)
          </p>
        </div>
      </div>
    </Card>
  )
}

