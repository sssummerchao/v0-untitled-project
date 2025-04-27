"use client"

import { MousePointer, Pencil } from "lucide-react"
import { useState } from "react"

interface DrawingModeSelectorProps {
  onModeChange: (isDrawingMode: boolean) => void
  initialMode?: "select" | "draw"
}

export default function DrawingModeSelector({ onModeChange, initialMode = "select" }: DrawingModeSelectorProps) {
  const [mode, setMode] = useState<"select" | "draw">(initialMode)

  const handleModeChange = (newMode: "select" | "draw") => {
    setMode(newMode)
    onModeChange(newMode === "draw")
  }

  return (
    <div className="fixed bottom-8 left-8 z-20 bg-white rounded-lg shadow-lg p-2 flex gap-2">
      <button
        onClick={() => handleModeChange("select")}
        className={`p-2 rounded-md transition-colors ${
          mode === "select" ? "bg-blue-500 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
        }`}
        title="Select shapes"
      >
        <MousePointer size={24} />
      </button>
      <button
        onClick={() => handleModeChange("draw")}
        className={`p-2 rounded-md transition-colors ${
          mode === "draw" ? "bg-blue-500 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
        }`}
        title="Draw on quilt"
      >
        <Pencil size={24} />
      </button>
    </div>
  )
}
