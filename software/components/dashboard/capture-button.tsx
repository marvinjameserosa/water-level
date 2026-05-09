'use client'

interface CaptureButtonProps {
  onClick?: () => void
}

export function CaptureButton({ onClick }: CaptureButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-primary hover:bg-blue-600 active:bg-blue-700 text-primary-foreground font-bold py-4 px-6 rounded text-base transition-colors duration-150"
    >
      CAPTURE PHOTO MANUALLY
    </button>
  )
}
