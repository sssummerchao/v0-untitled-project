"use client"

import FabricRecognition from "@/components/fabric-recognition"
import Link from "next/link"
import Image from "next/image"
import { STORAGE_KEYS } from "@/utils/pattern-constants"
import { useState, useRef } from "react"
import FreeDrawingCanvas from "@/components/free-drawing-canvas"
import DrawingModeSelector from "@/components/drawing-mode-selector"

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

  // Function to download the pattern as an image
  const handleDownloadImage = () => {
    const canvas = document.createElement("canvas")
    canvas.width = 600
    canvas.height = 600
    const ctx = canvas.getContext("2d")

    if (!ctx) return

    // Draw the North Star pattern with fabric selections if available
    if (Object.keys(fabricSelections).length > 0) {
      // Draw with selected fabrics
      const size = 600
      const centerSize = size / 3
      const offset = (size - centerSize) / 2

      // Draw outer squares
      ctx.fillStyle = fabricSelections.outerSquares ? `url(${fabricSelections.outerSquares})` : "white" //DEFAULT_COLORS.NORTH_STAR.outerSquares;
      ctx.fillRect(0, 0, offset, offset) // Top left
      ctx.fillRect(size - offset, 0, offset, offset) // Top right
      ctx.fillRect(0, size - offset, offset, offset) // Bottom left
      ctx.fillRect(size - offset, size - offset, offset, offset) // Bottom right

      // Draw triangles
      ctx.fillStyle = fabricSelections.triangles ? `url(${fabricSelections.triangles})` : "white" //DEFAULT_COLORS.NORTH_STAR.triangles;

      // Top triangles
      ctx.beginPath()
      ctx.moveTo(offset, 0)
      ctx.lineTo(offset + centerSize, 0)
      ctx.lineTo(offset + centerSize / 2, offset)
      ctx.closePath()
      ctx.fill()

      // Right triangles
      ctx.beginPath()
      ctx.moveTo(size, offset)
      ctx.lineTo(size, offset + centerSize)
      ctx.lineTo(size - offset, offset + centerSize / 2)
      ctx.closePath()
      ctx.fill()

      // Bottom triangles
      ctx.beginPath()
      ctx.moveTo(offset, size)
      ctx.lineTo(offset + centerSize, size)
      ctx.lineTo(offset + centerSize / 2, size - offset)
      ctx.closePath()
      ctx.fill()

      // Left triangles
      ctx.beginPath()
      ctx.moveTo(0, offset)
      ctx.lineTo(0, offset + centerSize)
      ctx.lineTo(offset, offset + centerSize / 2)
      ctx.closePath()
      ctx.fill()

      // Draw diagonal triangles
      ctx.fillStyle = fabricSelections.diagonalTriangles ? `url(${fabricSelections.diagonalTriangles})` : "white" //DEFAULT_COLORS.NORTH_STAR.diagonalTriangles;

      // Top left to center
      ctx.beginPath()
      ctx.moveTo(offset, offset)
      ctx.lineTo(offset + centerSize / 2, offset)
      ctx.lineTo(offset, offset + centerSize / 2)
      ctx.closePath()
      ctx.fill()

      // Top right to center
      ctx.beginPath()
      ctx.moveTo(size - offset, offset)
      ctx.lineTo(size - offset, offset + centerSize / 2)
      ctx.lineTo(size - offset - centerSize / 2, offset)
      ctx.closePath()
      ctx.fill()

      // Bottom right to center
      ctx.beginPath()
      ctx.moveTo(size - offset, size - offset)
      ctx.lineTo(size - offset - centerSize / 2, size - offset)
      ctx.lineTo(size - offset, size - offset - centerSize / 2)
      ctx.closePath()
      ctx.fill()

      // Bottom left to center
      ctx.beginPath()
      ctx.moveTo(offset, size - offset)
      ctx.lineTo(offset, size - offset - centerSize / 2)
      ctx.lineTo(offset + centerSize / 2, size - offset)
      ctx.closePath()
      ctx.fill()

      // Draw center square
      ctx.fillStyle = fabricSelections.centerSquare ? `url(${fabricSelections.centerSquare})` : "white" //DEFAULT_COLORS.NORTH_STAR.centerSquare;
      ctx.fillRect(offset, offset, centerSize, centerSize)

      // Draw grid lines on center square
      ctx.strokeStyle = "#AAAAAA"
      ctx.lineWidth = 0.5

      const gridSize = centerSize / 8
      for (let i = 0; i <= 8; i++) {
        // Vertical lines
        ctx.beginPath()
        ctx.moveTo(offset + i * gridSize, offset)
        ctx.lineTo(offset + i * gridSize, offset + centerSize)
        ctx.stroke()

        // Horizontal lines
        ctx.beginPath()
        ctx.moveTo(offset, offset + i * gridSize)
        ctx.lineTo(offset + centerSize, offset + i * gridSize)
        ctx.stroke()
      }
    } else {
      // Draw with default colors
      const size = 600
      const centerSize = size / 3
      const offset = (size - centerSize) / 2

      // Draw outer squares
      ctx.fillStyle = "white" //DEFAULT_COLORS.NORTH_STAR.outerSquares;
      ctx.fillRect(0, 0, offset, offset) // Top left
      ctx.fillRect(size - offset, 0, offset, offset) // Top right
      ctx.fillRect(0, size - offset, offset, offset) // Bottom left
      ctx.fillRect(size - offset, size - offset, offset, offset) // Bottom right

      // Draw triangles
      ctx.fillStyle = "white" //DEFAULT_COLORS.NORTH_STAR.triangles;

      // Top triangles
      ctx.beginPath()
      ctx.moveTo(offset, 0)
      ctx.lineTo(offset + centerSize, 0)
      ctx.lineTo(offset + centerSize / 2, offset)
      ctx.closePath()
      ctx.fill()

      // Right triangles
      ctx.beginPath()
      ctx.moveTo(size, offset)
      ctx.lineTo(size, offset + centerSize)
      ctx.lineTo(size - offset, offset + centerSize / 2)
      ctx.closePath()
      ctx.fill()

      // Bottom triangles
      ctx.beginPath()
      ctx.moveTo(offset, size)
      ctx.lineTo(offset + centerSize, size)
      ctx.lineTo(offset + centerSize / 2, size - offset)
      ctx.closePath()
      ctx.fill()

      // Left triangles
      ctx.beginPath()
      ctx.moveTo(0, offset)
      ctx.lineTo(0, offset + centerSize)
      ctx.lineTo(offset, offset + centerSize / 2)
      ctx.closePath()
      ctx.fill()

      // Draw diagonal triangles
      ctx.fillStyle = "white" //DEFAULT_COLORS.NORTH_STAR.diagonalTriangles;

      // Top left to center
      ctx.beginPath()
      ctx.moveTo(offset, offset)
      ctx.lineTo(offset + centerSize / 2, offset)
      ctx.lineTo(offset, offset + centerSize / 2)
      ctx.closePath()
      ctx.fill()

      // Top right to center
      ctx.beginPath()
      ctx.moveTo(size - offset, offset)
      ctx.lineTo(size - offset, offset + centerSize / 2)
      ctx.lineTo(size - offset - centerSize / 2, offset)
      ctx.closePath()
      ctx.fill()

      // Bottom right to center
      ctx.beginPath()
      ctx.moveTo(size - offset, size - offset)
      ctx.lineTo(size - offset - centerSize / 2, size - offset)
      ctx.lineTo(size - offset, size - offset - centerSize / 2)
      ctx.closePath()
      ctx.fill()

      // Bottom left to center
      ctx.beginPath()
      ctx.moveTo(offset, size - offset)
      ctx.lineTo(offset, size - offset - centerSize / 2)
      ctx.lineTo(offset + centerSize / 2, size - offset)
      ctx.closePath()
      ctx.fill()

      // Draw center square
      ctx.fillStyle = "white" //DEFAULT_COLORS.NORTH_STAR.centerSquare;
      ctx.fillRect(offset, offset, centerSize, centerSize)

      // Draw grid lines on center square
      ctx.strokeStyle = "#AAAAAA"
      ctx.lineWidth = 0.5

      const gridSize = centerSize / 8
      for (let i = 0; i <= 8; i++) {
        // Vertical lines
        ctx.beginPath()
        ctx.moveTo(offset + i * gridSize, offset)
        ctx.lineTo(offset + i * gridSize, offset + centerSize)
        ctx.stroke()

        // Horizontal lines
        ctx.beginPath()
        ctx.moveTo(offset, offset + i * gridSize)
        ctx.lineTo(offset + centerSize, offset + i * gridSize)
        ctx.stroke()
      }
    }

    // Create download link
    const dataUrl = canvas.toDataURL("image/png")
    const link = document.createElement("a")
    link.download = "north-star-quilt-pattern.png"
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleModeChange = (newMode: "select" | "draw") => {
    setMode(newMode)
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
            <FabricRecognition onFabricSelect={handleFabricSelect} svgRef={svgRef} isDrawingMode={mode === "draw"} />

            {/* Free drawing canvas (only active in drawing mode) */}
            <FreeDrawingCanvas svgRef={svgRef} viewBox="0 0 500 500" isActive={mode === "draw"} />
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
