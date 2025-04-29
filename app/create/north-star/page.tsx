"use client"

import Link from "next/link"
import Image from "next/image"
import { STORAGE_KEYS } from "@/utils/pattern-constants"
import { useState, useRef } from "react"
import FreeDrawingCanvas from "@/components/free-drawing-canvas"
import DrawingModeSelector from "@/components/drawing-mode-selector"
import NorthStarSVGPattern from "@/components/north-star-svg-pattern"
// Update the import for the download function
import { downloadPattern } from "@/utils/pattern-download-new"

export default function CreateNorthStarPage() {
  const [fabricSelections, setFabricSelections] = useState({})
  const [mode, setMode] = useState<"select" | "draw">("select")
  const svgRef = useRef<SVGSVGElement>(null)

  // Save fabric selections when navigating to the print page
  const saveFabricSelections = () => {
    localStorage.setItem(STORAGE_KEYS.NORTH_STAR, JSON.stringify(fabricSelections))
  }

  // Update fabric selections when a fabric is selected
  const handleFabricSelect = (shape, fabricPath) => {
    if (mode === "draw") return // Don't select shapes in drawing mode

    setFabricSelections((prev) => ({
      ...prev,
      [shape]: fabricPath,
    }))
  }

  const handleModeChange = (isDrawingMode: boolean) => {
    setMode(isDrawingMode ? "draw" : "select")
  }

  // Function to download the pattern as an image
  const handleDownloadImage = async () => {
    // Save fabric selections first
    saveFabricSelections()

    if (!svgRef.current) {
      alert("Could not find the pattern to download. Please try again.")
      return
    }

    // Temporarily switch to select mode to ensure drawings are visible in the main SVG
    const previousMode = mode
    if (mode === "draw") {
      setMode("select")
      // Give a small delay to allow the UI to update
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    try {
      // Download the pattern
      await downloadPattern(svgRef.current, "north-star-quilt-pattern.png")
    } finally {
      // Restore previous mode if needed
      if (previousMode === "draw") {
        setMode(previousMode)
      }
    }
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
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center mb-8 relative">
            <div className="absolute left-0">
              <Link href="/patterns" draggable="false" style={{ pointerEvents: "auto" }}>
                <Image src="/close.png" alt="Close" width={60} height={60} draggable="false" />
              </Link>
            </div>
            <h1 className="text-4xl font-bold text-center text-gray-900">Create Your North Star Quilt</h1>
          </div>

          <p className="text-xl text-center text-gray-700 mb-12">
            Select shapes in the pattern, then scan fabric with your webcam to create your own unique quilt. You can
            also draw freely on the pattern.
          </p>

          <div className="flex justify-center">
            {/* Pattern is centered, drawing menu will appear on the left when in drawing mode */}
            <div className="relative">
              <NorthStarSVGPattern
                onFabricSelect={handleFabricSelect}
                svgRef={svgRef}
                isDrawingMode={mode === "draw"}
                style={{ width: "100%", height: "auto" }}
              />

              {/* Free drawing canvas (only active in drawing mode) */}
              <FreeDrawingCanvas
                svgRef={svgRef}
                viewBox="0 0 1080 1080"
                isActive={mode === "draw"}
                defaultStrokeWidth="2"
              />
            </div>
          </div>

          {/* Drawing mode selector */}
          <DrawingModeSelector onModeChange={handleModeChange} />

          <div className="fixed bottom-8 right-8 z-10">
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
