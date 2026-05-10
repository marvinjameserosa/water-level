"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Camera } from "lucide-react";

interface SmallVideoFeedProps {
  isAlert: boolean;
  isCapturing?: boolean;
  imageUrl?: string;
  onManualCapture?: () => void | Promise<void>;
  currentWaterLevel?: number;
  totalDepth?: number;
}

export function SmallVideoFeed({
  isAlert,
  isCapturing = false,
  imageUrl,
  onManualCapture,
  currentWaterLevel,
  totalDepth = 20,
}: SmallVideoFeedProps) {
  const handleCapture = () => {
    if (isCapturing) {
      return;
    }

    void onManualCapture?.();
  };

  return (
    <div className="space-y-3">
      <Card
        className={`relative overflow-hidden border ${isAlert ? "border-destructive/50" : "border-border"}`}
      >
        <div className="relative flex h-48 w-full items-center justify-center bg-muted">
          {imageUrl ? (
            <img
              key={imageUrl}
              src={imageUrl}
              alt="Latest capture"
              className="h-full w-full object-contain bg-[#EEF2F7]"
            />
          ) : (
            <svg
              viewBox="0 0 400 300"
              className="w-full h-full"
              style={{ backgroundColor: "#EEF2F7" }}
            >
              {/* Tank container */}
              <rect
                x="80"
                y="60"
                width="240"
                height="200"
                fill="none"
                stroke="#95A5A6"
                strokeWidth="3"
              />

              {typeof currentWaterLevel === "number" ? (
                <>
                  {/* Water inside tank */}
                  <rect
                    x="80"
                    y={260 - Math.min(200, (currentWaterLevel / totalDepth) * 200)}
                    width="240"
                    height={Math.min(200, (currentWaterLevel / totalDepth) * 200)}
                    fill="#3498DB"
                    opacity="0.4"
                  />

                  {/* Measurement lines */}
                  {[0, 50, 100, 150, 200].map((y, i) => (
                    <g key={i}>
                      <line
                        x1="70"
                        y1={60 + y}
                        x2="80"
                        y2={60 + y}
                        stroke="#95A5A6"
                        strokeWidth="1"
                      />
                      <text
                        x="50"
                        y={65 + y}
                        fontSize="12"
                        fill="#6B7C8A"
                        textAnchor="end"
                      >
                        {(totalDepth - (i * totalDepth) / 4).toFixed(1)}
                      </text>
                    </g>
                  ))}

                  {/* Water level indicator */}
                  <line
                    x1="80"
                    y1={260 - Math.min(200, (currentWaterLevel / totalDepth) * 200)}
                    x2="320"
                    y2={260 - Math.min(200, (currentWaterLevel / totalDepth) * 200)}
                    stroke="#3498DB"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                  <circle cx="320" cy={260 - Math.min(200, (currentWaterLevel / totalDepth) * 200)} r="4" fill="#3498DB" />
                </>
              ) : (
                <text
                  x="200"
                  y="160"
                  fontSize="16"
                  fill="#95A5A6"
                  textAnchor="middle"
                >
                  No Data Available
                </text>
              )}

              {/* Sensor indicator */}
              <circle cx="200" cy="40" r="6" fill="#27AE60" />
              <text
                x="200"
                y="25"
                fontSize="12"
                fill="#2C3E50"
                textAnchor="middle"
                fontWeight="bold"
              >
                ESP32-CAM
              </text>
            </svg>
          )}

          {/* Alert overlay */}
          {isAlert && (
            <div className="absolute inset-0 bg-destructive/10 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <AlertCircle className="size-8 text-destructive" />
                <span className="text-sm font-semibold text-destructive">
                  ALERT
                </span>
              </div>
            </div>
          )}
        </div>
      </Card>
      <Button
        onClick={handleCapture}
        className="h-12 w-full text-sm font-semibold"
        variant="default"
        size="lg"
        disabled={isCapturing}
      >
        <Camera className="size-4 mr-2" />
        {isCapturing ? "Capturing..." : "Manual Trigger"}
      </Button>
    </div>
  );
}
