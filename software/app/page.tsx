"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Droplets, BatteryFull, BatteryMedium, BatteryLow, BatteryWarning } from "lucide-react";
import { AlertBanner } from "@/components/dashboard/alert-banner";
import { InputControls } from "@/components/dashboard/input-controls";
import { MetricDisplay } from "@/components/dashboard/metric-display";
import { ReadingsTable } from "@/components/dashboard/readings-table";
import { SmallVideoFeed } from "@/components/dashboard/small-video-feed";

type StoredReading = {
  timestamp: string;
  image?: string;
  nodeId?: string;
  h?: number;
  d?: number;
  diff?: number;
};

type TableReading = {
  id: string;
  nodeId: string;
  timestamp: string;
  containerDiameter: number;
  waterLevel: number;
  difference: number;
  status: "ok" | "alert";
  videoUrl: string;
};

type PicoState = {
  batteryPercentage: number;
  batteryVoltage: number;
};

type NodeState = {
  h: number;
  d: number;
  diff: number;
  hasImage: boolean;
};

type ApiState = {
  pico: PicoState;
  nodes: {
    node_1?: NodeState;
    node_2?: NodeState;
  };
};

const MASTER_IP = "http://192.168.4.1"; // Pico 2W Master AP

const DEFAULT_DIAMETER = 10.4;
const DEFAULT_WATER_LEVEL = 10.7;
const DEFAULT_USER_THRESHOLD = 2.0;

function formatTimestamp(timestamp: string) {
  if (!timestamp.includes("T")) {
    return timestamp;
  }
  return timestamp.replace("T", " ").replace("Z", "").slice(0, 19);
}

function buildReadings(history: StoredReading[], userThreshold: number) {
  if (!history.length) return [];

  return [...history].reverse().slice(0, 5).map((entry, index) => {
    const diameter = typeof entry.d === "number" ? entry.d : DEFAULT_DIAMETER;
    const waterLevel = typeof entry.h === "number" ? entry.h : DEFAULT_WATER_LEVEL;
    const difference = typeof entry.diff === "number" ? entry.diff : Math.abs(waterLevel - diameter);
    const nodeId = entry.nodeId ?? "node_1";

    return {
      id: `${entry.timestamp}-${index}`,
      nodeId,
      timestamp: formatTimestamp(entry.timestamp),
      containerDiameter: diameter,
      waterLevel,
      difference,
      status: difference > userThreshold ? "alert" : "ok",
      videoUrl: entry.image ?? "#",
    };
  });
}

function latestCaptureForNode(history: StoredReading[], nodeId: string) {
  for (let i = history.length - 1; i >= 0; i--) {
    if ((history[i].nodeId ?? "node_1") === nodeId) {
      return history[i];
    }
  }
  return undefined;
}

export default function WaterLevelDashboard() {
  const [containerDiameter, setContainerDiameter] = useState(DEFAULT_DIAMETER);
  const [userThreshold, setUserThreshold] = useState(DEFAULT_USER_THRESHOLD);
  const [history, setHistory] = useState<StoredReading[]>([]);
  const [picoState, setPicoState] = useState<PicoState | null>(null);
  
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturingNodeId, setCapturingNodeId] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const [node1ImageObjUrl, setNode1ImageObjUrl] = useState<string | undefined>(undefined);
  const [node2ImageObjUrl, setNode2ImageObjUrl] = useState<string | undefined>(undefined);

  const node1Latest = latestCaptureForNode(history, "node_1");
  const node2Latest = latestCaptureForNode(history, "node_2");

  const node1ImageUrl = node1ImageObjUrl;
  const node2ImageUrl = node2ImageObjUrl;

  const node1Level = node1Latest?.h ?? DEFAULT_WATER_LEVEL;
  const node2Level = node2Latest?.h ?? DEFAULT_WATER_LEVEL;

  const fetchStateData = useCallback(async () => {
    try {
      // Fetch Master State which contains Pico battery and all Node states
      const masterRes = await fetch(`${MASTER_IP}/api/state?ts=${Date.now()}`, { cache: "no-store" }).catch((err) => {
        console.error(`[Network Error] Could not connect to Master AP at ${MASTER_IP}. Are you connected to the 'waterlevel' WiFi?`, err);
        setConnectionError(`Cannot reach Master Gateway (${MASTER_IP}). Please verify your WiFi connection.`);
        return null;
      });
      
      if (!masterRes) return; // Error already handled above
      
      if (!masterRes.ok) {
        console.error(`[HTTP Error] Master AP returned status ${masterRes.status}: ${masterRes.statusText}`);
        setConnectionError(`Master Gateway returned an error: ${masterRes.statusText}`);
        return;
      }
      
      // If we got here, connection is successful
      setConnectionError(null);
      
      const json = await masterRes.json();

      if (json.pico) {
        setPicoState((prev) => {
          if (!prev || prev.batteryPercentage !== json.pico.batteryPercentage || prev.batteryVoltage !== json.pico.batteryVoltage) {
            return json.pico;
          }
          return prev;
        });
      }

      const n1State = json.nodes?.node_1;
      const n2State = json.nodes?.node_2;

      setHistory((prev) => {
        const newHistory = [...prev];
        const now = new Date().toISOString();
        let changed = false;

        if (n1State) {
          const lastN1 = latestCaptureForNode(newHistory, "node_1");
          if (!lastN1 || lastN1.h !== n1State.h || lastN1.d !== n1State.d || lastN1.diff !== n1State.diff) {
            newHistory.push({
              timestamp: now,
              nodeId: "node_1",
              h: n1State.h,
              d: n1State.d,
              diff: n1State.diff,
            });
            changed = true;
          }
        }

        if (n2State) {
          const lastN2 = latestCaptureForNode(newHistory, "node_2");
          if (!lastN2 || lastN2.h !== n2State.h || lastN2.d !== n2State.d || lastN2.diff !== n2State.diff) {
            newHistory.push({
              timestamp: now,
              nodeId: "node_2",
              h: n2State.h,
              d: n2State.d,
              diff: n2State.diff,
            });
            changed = true;
          }
        }

        if (newHistory.length > 50) return newHistory.slice(newHistory.length - 50);
        return changed ? newHistory : prev;
      });

    } catch (error) {
      console.error("Failed to load state data:", error);
    }
  }, []);

  // Load initial history from data.json
  useEffect(() => {
    fetch('/data.json?ts=' + Date.now(), { cache: "no-store" })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error("data.json not found or failed");
      })
      .then(data => {
        if (typeof data.diameter === "number") setContainerDiameter(data.diameter);
        if (Array.isArray(data.history)) setHistory(data.history);
      })
      .catch(err => console.error("Initial data load failed:", err))
      .finally(() => setInitialLoadDone(true));
  }, []);

  useEffect(() => {
    if (!initialLoadDone) return;
    
    void fetchStateData();
    const intervalId = window.setInterval(() => {
      void fetchStateData();
    }, 5000);
    return () => window.clearInterval(intervalId);
  }, [fetchStateData, initialLoadDone]);

  const triggerCapture = async (nodeId: string) => {
    if (isCapturing) return;

    setIsCapturing(true);
    setCapturingNodeId(nodeId);

    try {
      // 1. Tell Master to trigger the node
      const triggerRes = await fetch(`${MASTER_IP}/api/trigger?node=${nodeId}&ts=${Date.now()}`, { cache: "no-store" }).catch((err) => {
        console.error(`[Trigger Error] Could not reach Master AP at ${MASTER_IP} to send trigger command.`, err);
        return null;
      });
      
      if (!triggerRes || !triggerRes.ok) {
        throw new Error(`Master failed to accept trigger command: ${triggerRes ? triggerRes.statusText : 'Network Error'}`);
      }
      
      // 2. Wait for the node to poll the master, take the picture, and upload it (e.g. ~4 seconds)
      await new Promise(resolve => setTimeout(resolve, 4000));

      const MAX_RETRIES = 3;
      let attempt = 0;
      let success = false;

      while (attempt < MAX_RETRIES && !success) {
        attempt++;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        try {
          // 3. Fetch the newly uploaded image from the Master
          const response = await fetch(`${MASTER_IP}/api/image?node=${nodeId}&ts=${Date.now()}`, {
            cache: "no-store",
            mode: "cors",
            signal: controller.signal,
          });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
        
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        
        if (nodeId === "node_1") {
          setNode1ImageObjUrl(objectUrl);
        } else {
          setNode2ImageObjUrl(objectUrl);
        }

        // Upload the blob to the Next.js server to save it to public folder
        try {
          const formData = new FormData();
          formData.append("image", blob, `capture_${nodeId}.jpg`);
          formData.append("nodeId", nodeId);
          
          // Use current node's metrics for the upload record
          const h = nodeId === "node_1" ? node1Level : node2Level;
          const diff = nodeId === "node_1" ? node1Diff : node2Diff;
          
          formData.append("h", h.toString());
          formData.append("d", containerDiameter.toString());
          formData.append("diff", diff.toString());

          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (uploadRes.ok) {
            const uploadJson = await uploadRes.json();
            if (uploadJson.success && uploadJson.entry) {
              // Update history so the new saved image appears in the view
              setHistory(prev => {
                const newHistory = [...prev];
                newHistory.push({
                  timestamp: uploadJson.entry.timestamp,
                  nodeId: uploadJson.entry.nodeId,
                  image: uploadJson.entry.image,
                  h: uploadJson.entry.h,
                  d: uploadJson.entry.d,
                  diff: uploadJson.entry.diff,
                });
                return newHistory.length > 50 ? newHistory.slice(newHistory.length - 50) : newHistory;
              });
            }
          } else {
            console.error(`Failed to upload ${nodeId} image to server: ${uploadRes.statusText}`);
          }
        } catch (uploadError) {
          console.error("Error uploading image to server:", uploadError);
        }
        
        success = true; // Mark as successful to exit the loop
      } catch (error) {
        clearTimeout(timeoutId);
        if (attempt >= MAX_RETRIES) {
          console.error(`Manual capture failed for ${nodeId} after ${MAX_RETRIES} attempts:`, error);
        } else {
          console.warn(`Attempt ${attempt} for ${nodeId} failed, retrying in 2 seconds...`);
          // Wait 2 seconds before the next attempt
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
  } catch (outerError) {
    console.error(`Error during capture sequence for ${nodeId}:`, outerError);
  } finally {
    setIsCapturing(false);
    setCapturingNodeId(null);
  }
};

  const node1Diff = Math.abs(node1Level - containerDiameter);
  const node2Diff = Math.abs(node2Level - containerDiameter);

  const node1Alert = node1Diff > userThreshold;
  const node2Alert = node2Diff > userThreshold;
  const anyAlert = node1Alert || node2Alert;
  const maxDiff = Math.max(node1Diff, node2Diff);

  const readings = buildReadings(history, userThreshold);

  // Battery icon logic
  const getBatteryIcon = (percentage: number) => {
    if (percentage > 80) return <BatteryFull className="size-5 text-green-500" />;
    if (percentage > 40) return <BatteryMedium className="size-5 text-yellow-500" />;
    if (percentage > 15) return <BatteryLow className="size-5 text-orange-500" />;
    return <BatteryWarning className="size-5 text-red-500" />;
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-7xl space-y-6 px-6 py-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Droplets className="size-5" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Water Level Analysis
              </h1>
              <p className="text-sm text-muted-foreground">
                Real-time monitoring dashboard
              </p>
            </div>
          </div>
          
          {/* Master Pico Battery Status */}
          {picoState && (
            <div className="flex flex-col items-end gap-1 rounded-lg border border-border bg-card px-4 py-2 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Master Battery
                </span>
                {getBatteryIcon(picoState.batteryPercentage)}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">{picoState.batteryPercentage}%</span>
                <span className="text-sm text-muted-foreground">({picoState.batteryVoltage.toFixed(2)}V)</span>
              </div>
            </div>
          )}
        </header>

        {connectionError && (
          <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-red-500 shadow-sm">
            <h3 className="font-bold">Hardware Connection Error</h3>
            <p className="text-sm">{connectionError}</p>
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="grid gap-6 p-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                  Node 1 (Master)
                </h2>
                <span
                  className={`text-xs font-semibold ${node1Alert ? "text-destructive" : "text-foreground"}`}
                >
                  {node1Alert ? "Alert" : "OK"}
                </span>
              </div>
              <SmallVideoFeed
                isAlert={node1Alert}
                isCapturing={isCapturing && capturingNodeId === "node_1"}
                imageUrl={node1ImageUrl}
                onManualCapture={() => triggerCapture("node_1")}
              />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <MetricDisplay
                  label="Water Level (H)"
                  value={node1Level.toFixed(1)}
                  unit="cm"
                  status={node1Alert ? "alert" : "ok"}
                />
                <MetricDisplay
                  label="|H - D|"
                  value={node1Diff.toFixed(1)}
                  unit="cm"
                  status={node1Alert ? "alert" : "ok"}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                  Node 2 (Slave)
                </h2>
                <span
                  className={`text-xs font-semibold ${node2Alert ? "text-destructive" : "text-foreground"}`}
                >
                  {node2Alert ? "Alert" : "OK"}
                </span>
              </div>
              <SmallVideoFeed
                isAlert={node2Alert}
                isCapturing={isCapturing && capturingNodeId === "node_2"}
                imageUrl={node2ImageUrl}
                onManualCapture={() => triggerCapture("node_2")}
              />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <MetricDisplay
                  label="Water Level (H)"
                  value={node2Level.toFixed(1)}
                  unit="cm"
                  status={node2Alert ? "alert" : "ok"}
                />
                <MetricDisplay
                  label="|H - D|"
                  value={node2Diff.toFixed(1)}
                  unit="cm"
                  status={node2Alert ? "alert" : "ok"}
                />
              </div>
            </div>
          </div>
        </div>

        <AlertBanner
          isAlert={anyAlert}
          difference={maxDiff}
          threshold={userThreshold}
        />

        <InputControls
          containerDiameter={containerDiameter}
          userThreshold={userThreshold}
          onDiameterChange={setContainerDiameter}
          onThresholdChange={setUserThreshold}
        />

        <ReadingsTable readings={readings} />
      </div>
    </main>
  );
}
