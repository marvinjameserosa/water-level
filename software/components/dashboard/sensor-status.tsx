"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Wifi, Camera } from "lucide-react"

interface Sensor {
  name: string
  status: "connected" | "disconnected" | "online" | "offline"
  icon: "ultrasonic" | "camera"
}

interface SensorStatusProps {
  sensors: Sensor[]
}

export function SensorStatus({ sensors }: SensorStatusProps) {
  const isActive = (status: Sensor["status"]) => 
    status === "connected" || status === "online"

  const getIcon = (iconType: Sensor["icon"]) => {
    switch (iconType) {
      case "ultrasonic":
        return <Wifi className="size-4" />
      case "camera":
        return <Camera className="size-4" />
    }
  }

  return (
    <Card className="shadow-none border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Sensor Diagnostics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sensors.map((sensor, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between rounded-lg bg-secondary p-3"
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex size-8 items-center justify-center rounded-md",
                  isActive(sensor.status) ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  {getIcon(sensor.icon)}
                </div>
                <span className="text-sm font-medium text-foreground">{sensor.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "size-2 rounded-full",
                  isActive(sensor.status) ? "bg-success" : "bg-destructive"
                )} />
                <span className={cn(
                  "text-xs font-medium capitalize",
                  isActive(sensor.status) ? "text-success" : "text-destructive"
                )}>
                  {sensor.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
