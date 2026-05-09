'use client'

interface VideoFeedProps {
  isAlert: boolean
}

export function VideoFeed({ isAlert }: VideoFeedProps) {
  return (
    <div className="relative w-full aspect-video bg-foreground rounded overflow-hidden shadow-sm">
      {/* Simulated video feed */}
      <div className="w-full h-full bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center relative">
        {/* Water tank visualization */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white text-sm font-medium opacity-50">
            Live Feed
          </div>
        </div>

        {/* Alert overlay banner */}
        {isAlert && (
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-destructive bg-opacity-90 py-4 px-6">
            <div className="text-center text-white font-bold text-lg tracking-wide">
              THRESHOLD ALERT: HEIGHT EXCEEDED
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
