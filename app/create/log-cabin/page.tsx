"use client"

import LogCabinSVGPattern from "@/components/log-cabin-svg-pattern"
import Link from "next/link"
import Image from "next/image"
import { STORAGE_KEYS } from "@/utils/pattern-constants"
import { useState, useRef } from "react"
import FreeDrawingCanvas from "@/components/free-drawing-canvas"
import DrawingModeSelector from "@/components/drawing-mode-selector"
// Update the import for the download function
import { downloadPattern } from "@/utils/pattern-download-new"

const DEFAULT_COLORS = {
  LOG_CABIN: {
    center: "#9A348E",
    lightLogs: "#F5B041",
    darkLogs: "#E45826",
  },
}

export default function CreateLogCabinPage() {
  const [fabricSelections, setFabricSelections] = useState({})
  const [mode, setMode] = useState<"select" | "draw">("select")
  const svgRef = useRef<SVGSVGElement>(null)

  // Save fabric selections when navigating to the print page
  const saveFabricSelections = () => {
    localStorage.setItem(STORAGE_KEYS.LOG_CABIN, JSON.stringify(fabricSelections))
  }

  // Update fabric selections when a fabric is selected
  const handleFabricSelect = (shape, fabricPath) => {
    if (mode === "draw") return // Don't select shapes in drawing mode

    setFabricSelections((prev) => ({
      ...prev,
      [shape]: fabricPath,
    }))
  }

  // Function to download the pattern as an image
  const handleDownloadImage = async () => {
    // Save fabric selections first
    saveFabricSelections()

    if (!svgRef.current) {
      alert("Could not find the pattern to download. Please try again.")
      return
    }

    // Download the pattern
    await downloadPattern(svgRef.current, "log-cabin-quilt-pattern.png")
  }

  // Handle mode change
  const handleModeChange = (isDrawingMode: boolean) => {
    setMode(isDrawingMode ? "draw" : "select")
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center"
      style={{
        background: `
          linear-gradient(to right, #f0f0f0 1px, transparent 1px),
          linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
        backgroundColor: "white",
      }}
    >
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center mb-8 relative">
            <div className="absolute left-0">
              <Link href="/patterns" draggable="false" style={{ pointerEvents: "auto" }}>
                <Image src="/close.png" alt="Close" width={60} height={60} draggable="false" />
              </Link>
            </div>
            <h1 className="text-4xl font-bold text-center text-gray-900">Create Your Log Cabin Quilt</h1>
          </div>

          <p className="text-xl text-center text-gray-700 mb-12">
            Select shapes in the pattern, then scan fabric with your webcam to create your own unique quilt. You can
            also draw freely on the pattern.
          </p>

          <div className="flex flex-col md:flex-row gap-8 items-start justify-center">
            <div className="relative">
              <LogCabinSVGPattern onFabricSelect={handleFabricSelect} svgRef={svgRef} isDrawingMode={mode === "draw"} />
              <FreeDrawingCanvas
                svgRef={svgRef}
                viewBox="0 0 1080 1080"
                isActive={mode === "draw"}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  pointerEvents: mode === "draw" ? "auto" : "none",
                  zIndex: mode === "draw" ? 10 : -1,
                }}
              />
            </div>
          </div>

          {/* Drawing mode selector */}
          <DrawingModeSelector onModeChange={handleModeChange} />

          <div className="absolute bottom-8 right-8 z-10">
            <button onClick={handleDownloadImage} className="bg-transparent border-0 p-0 cursor-pointer">
              <Image
                src="/lets-print-it-out.png"
                alt="Let's Print It Out"
                width={180}
                height={180}
                className="transition-transform hover:scale-105"
                draggable="false"
              />
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
