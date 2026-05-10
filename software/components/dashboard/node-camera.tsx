"use client";

import { useState } from "react";
import { SmallVideoFeed } from "@/components/dashboard/small-video-feed";

interface NodeCameraProps {
  nodeId: string;
  isAlert: boolean;
  initialImageUrl?: string;
  onCaptureComplete?: () => void;
  currentWaterLevel?: number;
  totalDepth?: number;
}

export function NodeCamera({ nodeId, isAlert, initialImageUrl, onCaptureComplete, currentWaterLevel, totalDepth }: NodeCameraProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [localImageUrl, setLocalImageUrl] = useState<string | undefined>(initialImageUrl);

  const handleCapture = async () => {
    if (isCapturing) return;

    setIsCapturing(true);
    try {
      const res = await fetch("/api/system/node", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nodeId }),
      });

      if (!res.ok) {
        throw new Error("Capture failed");
      }

      const data = await res.json();
      if (data.success && data.entry?.image) {
        setLocalImageUrl(`${data.entry.image}?ts=${Date.now()}`);
        if (onCaptureComplete) {
          onCaptureComplete();
        }
      }
    } catch (error) {
      console.error(`Failed manual capture for ${nodeId}:`, error);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <SmallVideoFeed
      isAlert={isAlert}
      isCapturing={isCapturing}
      imageUrl={localImageUrl || initialImageUrl}
      onManualCapture={handleCapture}
      currentWaterLevel={currentWaterLevel}
      totalDepth={totalDepth}
    />
  );
}
