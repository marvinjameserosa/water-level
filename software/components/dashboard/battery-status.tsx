"use client";

import { useEffect, useState } from "react";
import { BatteryFull, BatteryMedium, BatteryLow, BatteryWarning } from "lucide-react";

type PicoState = {
  batteryPercentage: number;
  batteryVoltage: number;
};

export function BatteryStatus() {
  const [picoState, setPicoState] = useState<PicoState | null>(null);

  useEffect(() => {
    async function fetchBattery() {
      try {
        const res = await fetch("/api/system/battery");
        if (res.ok) {
          const data = await res.json();
          setPicoState((prev) => {
            if (!prev || prev.batteryPercentage !== data.batteryPercentage || prev.batteryVoltage !== data.batteryVoltage) {
              return data;
            }
            return prev;
          });
        }
      } catch (err) {
        console.error("Failed to fetch battery state:", err);
      }
    }

    fetchBattery();
    const intervalId = window.setInterval(fetchBattery, 5000);
    return () => window.clearInterval(intervalId);
  }, []);

  const getBatteryIcon = (percentage: number) => {
    if (percentage > 80) return <BatteryFull className="size-5 text-green-500" />;
    if (percentage > 40) return <BatteryMedium className="size-5 text-yellow-500" />;
    if (percentage > 15) return <BatteryLow className="size-5 text-orange-500" />;
    return <BatteryWarning className="size-5 text-red-500" />;
  };

  if (!picoState) return null;

  return (
    <div className="flex flex-col items-end gap-1 rounded-lg border border-border bg-card px-4 py-2 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Systtem Battery
        </span>
        {getBatteryIcon(picoState.batteryPercentage)}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold">{picoState.batteryPercentage}%</span>
        <span className="text-sm text-muted-foreground">({picoState.batteryVoltage.toFixed(2)}V)</span>
      </div>
    </div>
  );
}
