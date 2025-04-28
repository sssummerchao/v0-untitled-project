"use client"

import Link from "next/link"
import Image from "next/image"
import { STORAGE_KEYS } from "@/utils/pattern-constants"
import { useState, useRef } from "react"
import FreeDrawingCanvas from "@/components/free-drawing-canvas"
import DrawingModeSelector from "@/components/drawing-mode-selector"
import NorthStarSVGPattern from "@/components/north-star-svg-pattern"
import { downloadPattern } from "@/utils/svg-capture"

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

    // Download the pattern
    await downloadPattern(svgRef.current, "north-star-quilt-pattern.png")
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
              <Link href="/patterns">
                <Image src="/close.png" alt="Close" width={60} height={60} />
              </Link>
            </div>
            <h1 className="text-4xl font-bold text-center text-gray-900">Create Your North Star Quilt</h1>
          </div>

          <p className="text-xl text-center text-gray-700 mb-12">
            Select shapes in the pattern, then scan fabric with your webcam to create your own unique quilt. You can
            also draw freely on the pattern.
          </p>

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

          {/* Drawing mode selector */}
          <DrawingModeSelector onModeChange={handleModeChange} />

          <div className="fixed bottom-8 right-8 z-10">
            <button onClick={handleDownloadImage} className="bg-transparent border-0 p-0 cursor-pointer">
              <div className="relative">
                <Image
                  src="/lets-print-it-out.png"
                  alt="Let's Print It Out"
                  width={180}
                  height={180}
                  className="transition-transform hover:scale-105"
                />
                <Image
                  src="/2-2-steps.png"
                  alt="Step 2 of 2"
                  width={60}
                  height={60}
                  className="absolute top-0 right-0"
                />
              </div>
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
