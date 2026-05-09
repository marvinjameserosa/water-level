"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from "recharts"

const generateData = () => {
  const data = []
  const now = new Date()
  for (let i = 60; i >= 0; i -= 5) {
    const time = new Date(now.getTime() - i * 60 * 1000)
    data.push({
      time: time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      difference: Math.random() * 0.8 + 0.1 // Random value between 0.1 and 0.9
    })
  }
  return data
}

const data = generateData()

export function DifferenceChart() {
  return (
    <Card className="shadow-none border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Difference History (Last Hour)
          </CardTitle>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-primary" />
              <span>Difference</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-px w-4 bg-destructive" style={{ borderTop: "2px dashed" }} />
              <span>Threshold</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis 
                dataKey="time" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#6B7C8A" }}
                interval="preserveStartEnd"
              />
              <YAxis 
                domain={[0, 3]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#6B7C8A" }}
                tickFormatter={(value) => `${value} cm`}
                width={45}
              />
              <ReferenceLine 
                y={2} 
                stroke="#C0392B" 
                strokeDasharray="5 5" 
                strokeWidth={1.5}
              />
              <Line 
                type="monotone" 
                dataKey="difference" 
                stroke="#4A90E2" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#4A90E2" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
