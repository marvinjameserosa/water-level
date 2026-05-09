"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Video } from "lucide-react"

interface LiveFeedProps {
  timestamp: string
}

export function LiveFeed({ timestamp }: LiveFeedProps) {
  return (
    <Card className="shadow-none border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            ESP32-CAM Live Stream
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-success" />
            </span>
            <span className="text-xs text-success font-medium">LIVE</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
          {/* Simulated camera feed with water tank visualization */}
          <div className="absolute inset-0 flex flex-col">
            {/* Tank visualization */}
            <div className="flex-1 relative bg-secondary">
              {/* Measurement grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between py-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-muted-foreground/20" />
                    <span className="text-[10px] text-muted-foreground pr-2">{(15 - i * 3)} cm</span>
                  </div>
                ))}
              </div>
              {/* Water fill */}
              <div 
                className="absolute bottom-0 left-0 right-0 bg-primary/20 transition-all duration-1000"
                style={{ height: "71%" }}
              >
                {/* Water surface line */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary/60" />
                {/* Water ripple effect */}
                <div className="absolute top-1 left-0 right-0 h-px bg-primary/30" />
              </div>
              {/* Center icon overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Video className="size-8 text-muted-foreground/30" />
              </div>
            </div>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground text-center">{timestamp}</p>
      </CardContent>
    </Card>
  )
}
