"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface Reading {
  id: string;
  nodeId: string;
  timestamp: string;
  containerDiameter: number;
  waterLevel: number;
  difference: number;
  status: "ok" | "alert";
  videoUrl: string;
}

interface ReadingsTableProps {
  readings: Reading[];
  alertThreshold: number | string;
}

export function ReadingsTable({ readings, alertThreshold }: ReadingsTableProps) {
  return (
    <Card className="p-6 border border-border">
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Past Readings
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-semibold text-foreground">
                Node
              </th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">
                Timestamp
              </th>
              <th className="text-right py-3 px-4 font-semibold text-foreground">
                Total Depth (cm)
              </th>
              <th className="text-right py-3 px-4 font-semibold text-foreground" title="Distance from the sensor at the top down to the water surface">
                Distance to Water (cm)
              </th>
              <th className="text-right py-3 px-4 font-semibold text-foreground">
                Water Level (cm)
              </th>
              <th className="text-center py-3 px-4 font-semibold text-foreground">
                Status
              </th>
              <th className="text-center py-3 px-4 font-semibold text-foreground">
                Video
              </th>
            </tr>
          </thead>
          <tbody>
            {readings.map((reading) => (
              <tr
                key={reading.id}
                className="border-b border-border hover:bg-secondary/50 transition-colors"
              >
                <td className="py-3 px-4 text-foreground font-medium">
                  {reading.nodeId}
                </td>
                <td className="py-3 px-4 text-foreground">
                  {reading.timestamp}
                </td>
                <td className="py-3 px-4 text-right text-foreground">
                  {reading.containerDiameter.toFixed(1)}
                </td>
                <td className="py-3 px-4 text-right font-semibold text-foreground">
                  {reading.difference.toFixed(1)}
                </td>
                <td className="py-3 px-4 text-right text-foreground">
                  {reading.waterLevel.toFixed(1)}
                </td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      (typeof alertThreshold === "number" && reading.waterLevel <= alertThreshold)
                        ? "bg-destructive/20 text-destructive"
                        : "bg-success/20 text-success"
                    }`}
                  >
                    {(typeof alertThreshold === "number" && reading.waterLevel <= alertThreshold) ? "ALERT" : "OK"}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(reading.videoUrl, "_blank")}
                    className="inline-flex items-center gap-2"
                  >
                    <Eye className="size-4" />
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
