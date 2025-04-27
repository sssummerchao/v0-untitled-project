"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { STORAGE_KEYS, DEFAULT_COLORS } from "@/utils/pattern-constants"

export default function PrintCrossroadsPage() {
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
    const savedFabrics = localStorage.getItem(STORAGE_KEYS.CROSSROADS)
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

    // Draw the Crossroads pattern with fabric selections if available
    if (fabricSelections) {
      drawCrossroadsPatternWithFabrics(ctx, fabricSelections)
    } else {
      drawCrossroadsPattern(ctx)
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
          <title>Print Crossroads Quilt Pattern</title>
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
          <h1>Crossroads Quilt Pattern</h1>
          <p>Your custom quilt pattern is ready to print.</p>
          <img src="${dataUrl}" alt="Crossroads Quilt Pattern" />
          <button onclick="window.print()">Print Pattern</button>
        </body>
      </html>
    `)

    printWindow.document.close()
  }

  // Draw the Crossroads pattern with default colors
  const drawCrossroadsPattern = (ctx: CanvasRenderingContext2D) => {
    const size = 600
    const blockSize = size / 3

    // Draw background
    ctx.fillStyle = DEFAULT_COLORS.CROSSROADS.background
    ctx.fillRect(0, 0, size, size)

    // Draw center square
    ctx.fillStyle = DEFAULT_COLORS.CROSSROADS.centerSquare
    ctx.fillRect(blockSize, blockSize, blockSize, blockSize)

    // Draw rectangles
    ctx.fillStyle = DEFAULT_COLORS.CROSSROADS.rectangles

    // Top rectangle
    ctx.fillRect(blockSize, 0, blockSize, blockSize)

    // Right rectangle
    ctx.fillRect(2 * blockSize, blockSize, blockSize, blockSize)

    // Bottom rectangle
    ctx.fillRect(blockSize, 2 * blockSize, blockSize, blockSize)

    // Left rectangle
    ctx.fillRect(0, blockSize, blockSize, blockSize)

    // Draw grid lines
    ctx.strokeStyle = "#AAAAAA"
    ctx.lineWidth = 0.5

    // Draw grid on the entire canvas
    const gridSize = blockSize / 4
    for (let i = 0; i <= 12; i++) {
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

  // Draw the Crossroads pattern with fabric selections
  const drawCrossroadsPatternWithFabrics = (ctx: CanvasRenderingContext2D, fabrics: Record<string, string>) => {
    const size = 600
    const blockSize = size / 3

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
    drawCrossroadsPattern(ctx)

    // Then overlay with fabric patterns if available
    const loadFabrics = async () => {
      // Map shape keys to their corresponding regions in the pattern
      const shapeMap: Record<string, (pattern: CanvasPattern) => void> = {
        background: (pattern) => {
          ctx.fillStyle = pattern
          ctx.fillRect(0, 0, size, size)
        },
        centerSquare: (pattern) => {
          ctx.fillStyle = pattern
          ctx.fillRect(blockSize, blockSize, blockSize, blockSize)
        },
        rectangles: (pattern) => {
          ctx.fillStyle = pattern

          // Top rectangle
          ctx.fillRect(blockSize, 0, blockSize, blockSize)

          // Right rectangle
          ctx.fillRect(2 * blockSize, blockSize, blockSize, blockSize)

          // Bottom rectangle
          ctx.fillRect(blockSize, 2 * blockSize, blockSize, blockSize)

          // Left rectangle
          ctx.fillRect(0, blockSize, blockSize, blockSize)
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

      // Redraw grid lines
      ctx.strokeStyle = "#AAAAAA"
      ctx.lineWidth = 0.5

      // Draw grid on the entire canvas
      const gridSize = blockSize / 4
      for (let i = 0; i <= 12; i++) {
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
            <Link href="/">
              <div className="transition-transform hover:scale-105">
                <Image src="/close-button.png" alt="Close" width={60} height={60} />
              </div>
            </Link>
          </div>

          {/* Back to patterns button */}
          <div className="fixed bottom-8 left-8 z-10">
            <Link href="/create/crossroads">
              <Image
                src="/back-to-patterns-button.png"
                alt="Back to patterns"
                width={180}
                height={180}
                className="transition-transform hover:scale-105"
              />
            </Link>
          </div>

          {/* Print button */}
          <div className="fixed bottom-8 right-8 z-10">
            <button onClick={handlePrint} className="bg-transparent border-0 p-0 cursor-pointer">
              <Image
                src="/print-button.png"
                alt="Print"
                width={180}
                height={180}
                className="transition-transform hover:scale-105"
              />
            </button>
          </div>

          <h1 className="text-4xl font-bold text-center text-gray-900 mb-4">Print Your Crossroads Quilt</h1>
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
