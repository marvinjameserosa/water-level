"use client";

import { useEffect, useState, useCallback } from "react";
import { AlertBanner } from "@/components/dashboard/alert-banner";
import { BatteryStatus } from "@/components/dashboard/battery-status";
import { NodeDashboard } from "@/components/dashboard/node-dashboard";

type StoredReading = {
  timestamp: string;
  image?: string;
  nodeId?: string;
  h?: number;
  d?: number;
  diff?: number;
};

const DEFAULT_DIAMETER = 10.4;
const DEFAULT_WATER_LEVEL = 10.7;
const DEFAULT_USER_THRESHOLD = 2.0;

function latestCaptureForNode(history: StoredReading[], nodeId: string) {
  for (let i = history.length - 1; i >= 0; i--) {
    if ((history[i].nodeId ?? "node_1") === nodeId) {
      return history[i];
    }
  }
  return undefined;
}

export default function WaterLevelDashboard() {
  const [history, setHistory] = useState<StoredReading[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Per-node states for inputs
  const [node1Config, setNode1Config] = useState<{ diameter: number | string; threshold: number | string }>({ diameter: DEFAULT_DIAMETER, threshold: DEFAULT_USER_THRESHOLD });
  const [node2Config, setNode2Config] = useState<{ diameter: number | string; threshold: number | string }>({ diameter: DEFAULT_DIAMETER, threshold: DEFAULT_USER_THRESHOLD });

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch('/data.json?ts=' + Date.now(), { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        // Since we are now using separate nodes, let's just initialize them to the global default if present
        if (typeof data.diameter === "number") {
          setNode1Config(prev => ({ ...prev, diameter: data.diameter }));
          setNode2Config(prev => ({ ...prev, diameter: data.diameter }));
        }
        if (Array.isArray(data.history)) setHistory(data.history);
      }
    } catch (err) {
      console.error("Data history load failed:", err);
    }
  }, []);

  const fetchStateData = useCallback(async () => {
    try {
      const res = await fetch('/api/system/node', { cache: "no-store" });
      if (!res.ok) {
        setConnectionError(`API returned an error: ${res.statusText}`);
        return;
      }
      setConnectionError(null);
      
      const nodes = await res.json();

      setHistory((prev) => {
        const newHistory = [...prev];
        const now = new Date().toISOString();
        let changed = false;

        const updateNodeHistory = (nodeId: string, state: any) => {
          if (!state) return;
          const last = latestCaptureForNode(newHistory, nodeId);
          if (!last || last.h !== state.h || last.d !== state.d || last.diff !== state.diff) {
            newHistory.push({
              timestamp: now,
              nodeId,
              h: state.h,
              d: state.d,
              diff: state.diff,
            });
            changed = true;
          }
        };

        updateNodeHistory("node_1", nodes?.node_1);
        updateNodeHistory("node_2", nodes?.node_2);

        if (newHistory.length > 50) return newHistory.slice(newHistory.length - 50);
        return changed ? newHistory : prev;
      });

    } catch (error) {
      console.error("Failed to load state data:", error);
      setConnectionError("Could not reach data API.");
    }
  }, []);

  useEffect(() => {
    fetchHistory().finally(() => setInitialLoadDone(true));
  }, [fetchHistory]);

  useEffect(() => {
    if (!initialLoadDone) return;
    
    void fetchStateData();
    const intervalId = window.setInterval(fetchStateData, 5000);
    return () => window.clearInterval(intervalId);
  }, [fetchStateData, initialLoadDone]);

  const node1Latest = latestCaptureForNode(history, "node_1");
  const node2Latest = latestCaptureForNode(history, "node_2");

  // Extract the raw distance measured by the ultrasonic sensor (from the top)
  const node1Distance = node1Latest?.d;
  const node2Distance = node2Latest?.d;
  
  // Evaluate alerts directly based on Actual Water Level
  const node1CurrentLevel = typeof node1Distance === "number" ? Math.max(0, Number(node1Config.diameter) - node1Distance) : undefined;
  const node2CurrentLevel = typeof node2Distance === "number" ? Math.max(0, Number(node2Config.diameter) - node2Distance) : undefined;

  const node1Alert = typeof node1Config.threshold === "number" && node1CurrentLevel !== undefined ? node1CurrentLevel <= node1Config.threshold : false;
  const node2Alert = typeof node2Config.threshold === "number" && node2CurrentLevel !== undefined ? node2CurrentLevel <= node2Config.threshold : false;

  const node1ImageUrl = Array([...history]).reverse().find(h => (h.nodeId ?? "node_1") === "node_1" && h.image)?.image;
  const node2ImageUrl = Array([...history]).reverse().find(h => (h.nodeId ?? "node_1") === "node_2" && h.image)?.image;

  return (
    <div className="container mx-auto p-4 max-w-6xl space-y-6">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Node sensors taking height measurements from the bottom of the container
          </p>
        </div>
        <BatteryStatus />
      </header>

      {connectionError && (
        <AlertBanner
          title="Connection Error"
          description={connectionError}
          variant="destructive"
        />
      )}

      {(node1Alert || node2Alert) && (
        <AlertBanner
          title="Water Level Alert"
          description={`Water level is ${node1Alert ? "Node 1" : "Node 2"} below threshold.`}
        />
      )}

      <div className="grid gap-8">
        <NodeDashboard
          nodeId="node_1"
          title="Node 1"
          history={history}
          level={node1Distance}
          containerDiameter={node1Config.diameter}
          userThreshold={node1Config.threshold}
          onDiameterChange={(val) => setNode1Config(prev => ({ ...prev, diameter: val }))}
          onThresholdChange={(val) => setNode1Config(prev => ({ ...prev, threshold: val }))}
          imageUrl={node1ImageUrl}
          onCaptureComplete={fetchHistory}
        />

        <NodeDashboard
          nodeId="node_2"
          title="Node 2"
          history={history}
          level={node2Distance}
          containerDiameter={node2Config.diameter}
          userThreshold={node2Config.threshold}
          onDiameterChange={(val) => setNode2Config(prev => ({ ...prev, diameter: val }))}
          onThresholdChange={(val) => setNode2Config(prev => ({ ...prev, threshold: val }))}
          imageUrl={node2ImageUrl}
          onCaptureComplete={fetchHistory}
        />
      </div>
    </div>
  );
}
