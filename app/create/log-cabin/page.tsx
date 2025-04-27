"use client"

import LogCabinSVGPattern from "@/components/log-cabin-svg-pattern"
import Link from "next/link"
import Image from "next/image"
import { STORAGE_KEYS } from "@/utils/pattern-constants"
import { useState, useRef } from "react"
import FreeDrawingCanvas from "@/components/free-drawing-canvas"
import DrawingModeSelector from "@/components/drawing-mode-selector"

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
  const handleDownloadImage = () => {
    const canvas = document.createElement("canvas")
    canvas.width = 600
    canvas.height = 600
    const ctx = canvas.getContext("2d")

    if (!ctx) return

    // Draw the Log Cabin pattern with fabric selections if available
    if (Object.keys(fabricSelections).length > 0) {
      // Draw with selected fabrics
      const size = 600
      const center = size / 2
      const blockSize = size / 10

      // Draw center square
      ctx.fillStyle = fabricSelections.center ? `url(${fabricSelections.center})` : DEFAULT_COLORS.LOG_CABIN.center
      ctx.fillRect(center - blockSize, center - blockSize, blockSize * 2, blockSize * 2)

      // Draw log strips
      const drawLogStrip = (round: number, color: string) => {
        const offset = blockSize * (round + 1)
        const length = blockSize * (round + 1) * 2

        ctx.fillStyle = color

        // Top strip
        ctx.fillRect(center - offset, center - offset, length, blockSize)

        // Right strip
        ctx.fillRect(center + offset - blockSize, center - offset, blockSize, length)

        // Bottom strip
        ctx.fillRect(center - offset, center + offset - blockSize, length, blockSize)

        // Left strip
        ctx.fillRect(center - offset, center - offset, blockSize, length - blockSize)
      }

      // Draw log strips with alternating colors
      for (let i = 1; i <= 4; i++) {
        const color =
          i % 2 === 1
            ? fabricSelections.lightLogs
              ? `url(${fabricSelections.lightLogs})`
              : DEFAULT_COLORS.LOG_CABIN.lightLogs
            : fabricSelections.darkLogs
              ? `url(${fabricSelections.darkLogs})`
              : DEFAULT_COLORS.LOG_CABIN.darkLogs
        drawLogStrip(i, color)
      }

      // Draw grid lines
      ctx.strokeStyle = "#AAAAAA"
      ctx.lineWidth = 0.5

      // Draw grid on the entire canvas
      for (let i = 0; i <= 10; i++) {
        // Vertical lines
        ctx.beginPath()
        ctx.moveTo(i * blockSize, 0)
        ctx.lineTo(i * blockSize, size)
        ctx.stroke()

        // Horizontal lines
        ctx.beginPath()
        ctx.moveTo(0, i * blockSize)
        ctx.lineTo(size, i * blockSize)
        ctx.stroke()
      }
    } else {
      // Draw with default colors
      const size = 600
      const center = size / 2
      const blockSize = size / 10

      // Draw center square
      ctx.fillStyle = DEFAULT_COLORS.LOG_CABIN.center
      ctx.fillRect(center - blockSize, center - blockSize, blockSize * 2, blockSize * 2)

      // Draw log strips
      const drawLogStrip = (round: number, color: string) => {
        const offset = blockSize * (round + 1)
        const length = blockSize * (round + 1) * 2

        ctx.fillStyle = color

        // Top strip
        ctx.fillRect(center - offset, center - offset, length, blockSize)

        // Right strip
        ctx.fillRect(center + offset - blockSize, center - offset, blockSize, length)

        // Bottom strip
        ctx.fillRect(center - offset, center + offset - blockSize, length, blockSize)

        // Left strip
        ctx.fillRect(center - offset, center - offset, blockSize, length - blockSize)
      }

      // Draw log strips with alternating colors
      for (let i = 1; i <= 4; i++) {
        drawLogStrip(i, i % 2 === 1 ? DEFAULT_COLORS.LOG_CABIN.lightLogs : DEFAULT_COLORS.LOG_CABIN.darkLogs)
      }

      // Draw grid lines
      ctx.strokeStyle = "#AAAAAA"
      ctx.lineWidth = 0.5

      // Draw grid on the entire canvas
      for (let i = 0; i <= 10; i++) {
        // Vertical lines
        ctx.beginPath()
        ctx.moveTo(i * blockSize, 0)
        ctx.lineTo(i * blockSize, size)
        ctx.stroke()

        // Horizontal lines
        ctx.beginPath()
        ctx.moveTo(0, i * blockSize)
        ctx.lineTo(size, i * blockSize)
        ctx.stroke()
      }
    }

    // Create download link
    const dataUrl = canvas.toDataURL("image/png")
    const link = document.createElement("a")
    link.download = "log-cabin-quilt-pattern.png"
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
              <Link href="/patterns">
                <Image src="/close.png" alt="Close" width={60} height={60} />
              </Link>
            </div>
            <h1 className="text-4xl font-bold text-center text-gray-900">Create Your Log Cabin Quilt</h1>
          </div>

          <p className="text-xl text-center text-gray-700 mb-12">
            Select shapes in the pattern, then scan fabric with your webcam to create your own unique quilt. You can
            also draw freely on the pattern.
          </p>

          <div className="flex flex-col md:flex-row gap-8 items-start justify-center">
            <div className="relative" style={{ width: "500px", height: "500px" }}>
              <LogCabinSVGPattern onFabricSelect={handleFabricSelect} svgRef={svgRef} isDrawingMode={mode === "draw"} />
              <FreeDrawingCanvas svgRef={svgRef} viewBox="0 0 1080 1080" isActive={mode === "draw"} />
            </div>
          </div>

          {/* Drawing mode selector */}
          <DrawingModeSelector onModeChange={handleModeChange} />

          <div className="absolute bottom-8 right-8 z-10">
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
