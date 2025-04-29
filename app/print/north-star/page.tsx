"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { STORAGE_KEYS, DEFAULT_COLORS } from "@/utils/pattern-constants"

export default function PrintNorthStarPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [fabricSelections, setFabricSelections] = useState<Record<string, string> | null>(null)

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = 600
    canvas.height = 600

    // Load saved fabric selections
    const savedFabrics = localStorage.getItem(STORAGE_KEYS.NORTH_STAR)
    if (savedFabrics) {
      try {
        const parsedFabrics = JSON.parse(savedFabrics)
        setFabricSelections(parsedFabrics)
      } catch (error) {
        console.error("Error parsing saved fabrics:", error)
      }
    }
  }, [])

  // Draw pattern when fabric selections change
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Draw the North Star pattern with fabric selections if available
    if (fabricSelections) {
      drawNorthStarPatternWithFabrics(ctx, fabricSelections)
    } else {
      drawNorthStarPattern(ctx)
    }
  }, [fabricSelections])

  // Print function
  const handlePrint = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const printWindow = window.open("", "_blank")
    if (!printWindow) {
      alert("Please allow pop-ups to print your quilt pattern")
      return
    }

    const dataUrl = canvas.toDataURL("image/png")

    printWindow.document.write(`
      <html>
        <head>
          <title>Print North Star Quilt Pattern</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              font-family: Arial, sans-serif;
            }
            img {
              max-width: 100%;
              height: auto;
              margin-bottom: 20px;
              border: 1px solid #ccc;
            }
            h1 {
              margin-bottom: 10px;
            }
            p {
              margin-bottom: 20px;
            }
            @media print {
              button {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <h1>North Star Quilt Pattern</h1>
          <p>Your custom quilt pattern is ready to print.</p>
          <img src="${dataUrl}" alt="North Star Quilt Pattern" />
          <button onclick="window.print()">Print Pattern</button>
        </body>
      </html>
    `)

    printWindow.document.close()
  }

  // Draw the North Star pattern with default colors
  const drawNorthStarPattern = (ctx: CanvasRenderingContext2D) => {
    const size = 600
    const centerSize = size / 3
    const offset = (size - centerSize) / 2

    // Draw outer squares (orange)
    ctx.fillStyle = DEFAULT_COLORS.NORTH_STAR.outerSquares
    ctx.fillRect(0, 0, offset, offset) // Top left
    ctx.fillRect(size - offset, 0, offset, offset) // Top right
    ctx.fillRect(0, size - offset, offset, offset) // Bottom left
    ctx.fillRect(size - offset, size - offset, offset, offset) // Bottom right

    // Draw triangles (red/brown)
    ctx.fillStyle = DEFAULT_COLORS.NORTH_STAR.triangles

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

    // Draw diagonal triangles (light blue)
    ctx.fillStyle = DEFAULT_COLORS.NORTH_STAR.diagonalTriangles

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

    // Draw center square (mint green)
    ctx.fillStyle = DEFAULT_COLORS.NORTH_STAR.centerSquare
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

  // Draw the North Star pattern with fabric selections
  const drawNorthStarPatternWithFabrics = (ctx: CanvasRenderingContext2D, fabrics: Record<string, string>) => {
    const size = 600
    const centerSize = size / 3
    const offset = (size - centerSize) / 2

    // Helper function to create pattern from fabric image
    const createPatternFromFabric = (fabricPath: string): Promise<CanvasPattern | null> => {
      return new Promise((resolve) => {
        const img = new Image()
        img.onload = () => {
          const pattern = ctx.createPattern(img, "repeat")
          resolve(pattern)
        }
        img.onerror = () => {
          console.error(`Failed to load fabric image: ${fabricPath}`)
          resolve(null)
        }
        img.src = fabricPath
        img.crossOrigin = "anonymous"
      })
    }

    // Draw the pattern with default colors first
    drawNorthStarPattern(ctx)

    // Then overlay with fabric patterns if available
    const loadFabrics = async () => {
      // Map shape keys to their corresponding regions in the pattern
      const shapeMap: Record<string, (pattern: CanvasPattern) => void> = {
        outerSquares: (pattern) => {
          ctx.fillStyle = pattern
          ctx.fillRect(0, 0, offset, offset) // Top left
          ctx.fillRect(size - offset, 0, offset, offset) // Top right
          ctx.fillRect(0, size - offset, offset, offset) // Bottom left
          ctx.fillRect(size - offset, size - offset, offset, offset) // Bottom right
        },
        triangles: (pattern) => {
          ctx.fillStyle = pattern

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
        },
        diagonalTriangles: (pattern) => {
          ctx.fillStyle = pattern

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
        },
        centerSquare: (pattern) => {
          ctx.fillStyle = pattern
          ctx.fillRect(offset, offset, centerSize, centerSize)

          // Redraw grid lines on center square
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
        },
      }

      // Apply fabric patterns to each shape
      for (const [shape, fabricPath] of Object.entries(fabrics)) {
        if (fabricPath && shapeMap[shape]) {
          const pattern = await createPatternFromFabric(fabricPath)
          if (pattern) {
            shapeMap[shape](pattern)
          }
        }
      }
    }

    loadFabrics()
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
      <div className="container mx-auto px-4 py-12 relative">
        <div className="max-w-6xl mx-auto">
          {/* Close button */}
          <div className="fixed top-8 left-8 z-10">
            <Link href="/" draggable="false" style={{ pointerEvents: "auto" }}>
              <div className="transition-transform hover:scale-105">
                <Image src="/close-button.png" alt="Close" width={60} height={60} draggable="false" />
              </div>
            </Link>
          </div>

          {/* Back to patterns button */}
          <div className="fixed bottom-8 left-8 z-10">
            <Link href="/create/north-star" draggable="false" style={{ pointerEvents: "auto" }}>
              <Image
                src="/back-to-patterns-button.png"
                alt="Back to patterns"
                width={180}
                height={180}
                className="transition-transform hover:scale-105"
                draggable="false"
              />
            </Link>
          </div>

          {/* Print button with steps indicator */}
          <div className="fixed bottom-8 right-8 z-10">
            <button onClick={handlePrint} className="bg-transparent border-0 p-0 cursor-pointer">
              <Image
                src="/print-button.png"
                alt="Print"
                width={180}
                height={180}
                className="transition-transform hover:scale-105"
                draggable="false"
              />
            </button>
          </div>

          <h1 className="text-4xl font-bold text-center text-gray-900 mb-4">Print Your North Star Quilt</h1>
          <p className="text-xl text-center text-gray-700 mb-8">
            Your quilt pattern is ready to print. Click the print button to save or print your pattern.
          </p>

          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              className="border border-gray-300 rounded-lg shadow-lg"
              style={{ maxWidth: "100%", height: "auto" }}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
