"use client"

import BearPawsPatternRecognition from "@/components/bear-paws-pattern-recognition"
import Link from "next/link"
import Image from "next/image"
import { STORAGE_KEYS } from "@/utils/pattern-constants"
import { useState, useRef } from "react"
import FreeDrawingCanvas from "@/components/free-drawing-canvas"
import DrawingModeSelector from "@/components/drawing-mode-selector"

export default function CreateBearPawsPage() {
  const [fabricSelections, setFabricSelections] = useState({})
  const [mode, setMode] = useState<"select" | "draw">("select")
  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedFabrics, setSelectedFabrics] = useState({})

  // Save fabric selections when navigating to the print page
  const saveFabricSelections = () => {
    localStorage.setItem(STORAGE_KEYS.BEAR_PAWS, JSON.stringify(fabricSelections))
  }

  // Update fabric selections when a fabric is selected
  const handleFabricSelect = (shape, fabricPath) => {
    if (mode === "draw") return // Don't select shapes in drawing mode

    setFabricSelections((prev) => ({
      ...prev,
      [shape]: fabricPath,
    }))

    setSelectedFabrics((prev) => ({
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

    // Draw the Bear Paws pattern with fabric selections if available
    if (Object.keys(selectedFabrics).length > 0) {
      // Draw with selected fabrics
      const size = 600
      const blockSize = size / 2

      // Draw background squares
      ctx.fillStyle = selectedFabrics.background ? `url(${selectedFabrics.background})` : "#F8E71C"
      ctx.fillRect(0, 0, size, size)

      // Draw paw blocks
      const drawPawBlock = (x: number, y: number) => {
        const pawSize = blockSize
        const smallSquareSize = pawSize / 4

        // Draw small squares (claws)
        ctx.fillStyle = selectedFabrics.claws ? `url(${selectedFabrics.claws})` : "#F44336"

        // Top left
        ctx.fillRect(x, y, smallSquareSize, smallSquareSize)

        // Top right
        ctx.fillRect(x + smallSquareSize, y, smallSquareSize, smallSquareSize)

        // Bottom left
        ctx.fillRect(x, y + smallSquareSize, smallSquareSize, smallSquareSize)

        // Bottom right
        ctx.fillRect(x + smallSquareSize, y + smallSquareSize, smallSquareSize, smallSquareSize)

        // Draw large square (paw pad)
        ctx.fillStyle = selectedFabrics.pawPad ? `url(${selectedFabrics.pawPad})` : "#2196F3"
        ctx.fillRect(x + 2 * smallSquareSize, y + 2 * smallSquareSize, 2 * smallSquareSize, 2 * smallSquareSize)
      }

      // Draw paw blocks in each corner
      drawPawBlock(0, 0) // Top left
      drawPawBlock(blockSize, 0) // Top right
      drawPawBlock(0, blockSize) // Bottom left
      drawPawBlock(blockSize, blockSize) // Bottom right

      // Draw grid lines
      ctx.strokeStyle = "#AAAAAA"
      ctx.lineWidth = 0.5

      // Draw grid on the entire canvas
      const gridSize = blockSize / 8
      for (let i = 0; i <= 16; i++) {
        // Vertical lines
        ctx.beginPath()
        ctx.moveTo(i * gridSize, 0)
        ctx.lineTo(i * gridSize, size)
        ctx.stroke()

        // Horizontal lines
        ctx.beginPath()
        ctx.moveTo(0, i * gridSize)
        ctx.lineTo(size, i * gridSize)
        ctx.stroke()
      }
    } else {
      // Draw with default colors
      const size = 600
      const blockSize = size / 2

      // Draw background squares
      ctx.fillStyle = "#F8E71C"
      ctx.fillRect(0, 0, size, size)

      // Draw paw blocks
      const drawPawBlock = (x: number, y: number) => {
        const pawSize = blockSize
        const smallSquareSize = pawSize / 4

        // Draw small squares (claws)
        ctx.fillStyle = "#F44336"

        // Top left
        ctx.fillRect(x, y, smallSquareSize, smallSquareSize)

        // Top right
        ctx.fillRect(x + smallSquareSize, y, smallSquareSize, smallSquareSize)

        // Bottom left
        ctx.fillRect(x, y + smallSquareSize, smallSquareSize, smallSquareSize)

        // Bottom right
        ctx.fillRect(x + smallSquareSize, y + smallSquareSize, smallSquareSize, smallSquareSize)

        // Draw large square (paw pad)
        ctx.fillStyle = "#2196F3"
        ctx.fillRect(x + 2 * smallSquareSize, y + 2 * smallSquareSize, 2 * smallSquareSize, 2 * smallSquareSize)
      }

      // Draw paw blocks in each corner
      drawPawBlock(0, 0) // Top left
      drawPawBlock(blockSize, 0) // Top right
      drawPawBlock(0, blockSize) // Bottom left
      drawPawBlock(blockSize, blockSize) // Bottom right

      // Draw grid lines
      ctx.strokeStyle = "#AAAAAA"
      ctx.lineWidth = 0.5

      // Draw grid on the entire canvas
      const gridSize = blockSize / 8
      for (let i = 0; i <= 16; i++) {
        // Vertical lines
        ctx.beginPath()
        ctx.moveTo(i * gridSize, 0)
        ctx.lineTo(i * gridSize, size)
        ctx.stroke()

        // Horizontal lines
        ctx.beginPath()
        ctx.moveTo(0, i * gridSize)
        ctx.lineTo(size, i * gridSize)
        ctx.stroke()
      }
    }

    // Create download link
    const dataUrl = canvas.toDataURL("image/png")
    const link = document.createElement("a")
    link.download = "bear-paws-quilt-pattern.png"
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
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center mb-8 relative">
            <div className="absolute left-0">
              <Link href="/patterns">
                <Image src="/close.png" alt="Close" width={60} height={60} />
              </Link>
            </div>
            <h1 className="text-4xl font-bold text-center text-gray-900">Create Your Bear Paw Pattern</h1>
          </div>

          <p className="text-xl text-center text-gray-700 mb-8">
            Select shapes in the pattern, then scan fabric with your webcam to create your own unique quilt. You can
            also draw freely on the pattern.
          </p>

          <div className="flex flex-col items-center">
            <div className="relative" style={{ width: "500px", height: "500px" }}>
              <BearPawsPatternRecognition
                onFabricSelect={handleFabricSelect}
                svgRef={svgRef}
                isDrawingMode={mode === "draw"}
              />
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
