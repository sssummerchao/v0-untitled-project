"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { STORAGE_KEYS, DEFAULT_COLORS } from "@/utils/pattern-constants"

export default function PrintBearPawsPage() {
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
    const savedFabrics = localStorage.getItem(STORAGE_KEYS.BEAR_PAWS)
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

    // Draw the Bear Paws pattern with fabric selections if available
    if (fabricSelections) {
      drawBearPawsPatternWithFabrics(ctx, fabricSelections)
    } else {
      drawBearPawsPattern(ctx)
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
          <title>Print Bear Paws Quilt Pattern</title>
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
          <h1>Bear Paws Quilt Pattern</h1>
          <p>Your custom quilt pattern is ready to print.</p>
          <img src="${dataUrl}" alt="Bear Paws Quilt Pattern" />
          <button onclick="window.print()">Print Pattern</button>
        </body>
      </html>
    `)

    printWindow.document.close()
  }

  // Draw the Bear Paws pattern with default colors
  const drawBearPawsPattern = (ctx: CanvasRenderingContext2D) => {
    const size = 600
    const blockSize = size / 2

    // Draw background squares
    ctx.fillStyle = DEFAULT_COLORS.BEAR_PAWS.background
    ctx.fillRect(0, 0, size, size)

    // Draw paw blocks
    const drawPawBlock = (x: number, y: number) => {
      const pawSize = blockSize
      const smallSquareSize = pawSize / 4

      // Draw small squares (claws)
      ctx.fillStyle = DEFAULT_COLORS.BEAR_PAWS.claws

      // Top left
      ctx.fillRect(x, y, smallSquareSize, smallSquareSize)

      // Top right
      ctx.fillRect(x + smallSquareSize, y, smallSquareSize, smallSquareSize)

      // Bottom left
      ctx.fillRect(x, y + smallSquareSize, smallSquareSize, smallSquareSize)

      // Bottom right
      ctx.fillRect(x + smallSquareSize, y + smallSquareSize, smallSquareSize, smallSquareSize)

      // Draw large square (paw pad)
      ctx.fillStyle = DEFAULT_COLORS.BEAR_PAWS.pawPad
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

  // Helper function to create pattern from fabric image
  const createPatternFromFabric = (
    ctx: CanvasRenderingContext2D,
    fabricPath: string,
  ): Promise<CanvasPattern | null> => {
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

  // Draw the Bear Paws pattern with fabric selections
  const drawBearPawsPatternWithFabrics = (ctx: CanvasRenderingContext2D, fabrics: Record<string, string>) => {
    // Draw the pattern with default colors first
    drawBearPawsPattern(ctx)

    // Then overlay with fabric patterns if available
    const size = 600
    const blockSize = size / 2
    const smallSquareSize = blockSize / 4

    // Function to apply background fabric
    const applyBackgroundFabric = async () => {
      if (!fabrics.background) return

      const pattern = await createPatternFromFabric(ctx, fabrics.background)
      if (!pattern) return

      ctx.fillStyle = pattern
      ctx.fillRect(0, 0, size, size)
    }

    // Function to apply claws fabric
    const applyClawsFabric = async () => {
      if (!fabrics.claws) return

      const pattern = await createPatternFromFabric(ctx, fabrics.claws)
      if (!pattern) return

      ctx.fillStyle = pattern

      // Top left paw claws
      ctx.fillRect(0, 0, smallSquareSize, smallSquareSize)
      ctx.fillRect(smallSquareSize, 0, smallSquareSize, smallSquareSize)
      ctx.fillRect(0, smallSquareSize, smallSquareSize, smallSquareSize)
      ctx.fillRect(smallSquareSize, smallSquareSize, smallSquareSize, smallSquareSize)

      // Top right paw claws
      ctx.fillRect(blockSize, 0, smallSquareSize, smallSquareSize)
      ctx.fillRect(blockSize + smallSquareSize, 0, smallSquareSize, smallSquareSize)
      ctx.fillRect(blockSize, smallSquareSize, smallSquareSize, smallSquareSize)
      ctx.fillRect(blockSize + smallSquareSize, smallSquareSize, smallSquareSize, smallSquareSize)

      // Bottom left paw claws
      ctx.fillRect(0, blockSize, smallSquareSize, smallSquareSize)
      ctx.fillRect(smallSquareSize, blockSize, smallSquareSize, smallSquareSize)
      ctx.fillRect(0, blockSize + smallSquareSize, smallSquareSize, smallSquareSize)
      ctx.fillRect(smallSquareSize, blockSize + smallSquareSize, smallSquareSize, smallSquareSize)

      // Bottom right paw claws
      ctx.fillRect(blockSize, blockSize, smallSquareSize, smallSquareSize)
      ctx.fillRect(blockSize + smallSquareSize, blockSize, smallSquareSize, smallSquareSize)
      ctx.fillRect(blockSize, blockSize + smallSquareSize, smallSquareSize, smallSquareSize)
      ctx.fillRect(blockSize + smallSquareSize, blockSize + smallSquareSize, smallSquareSize, smallSquareSize)
    }

    // Function to apply paw pad fabric
    const applyPawPadFabric = async () => {
      if (!fabrics.pawPad) return

      const pattern = await createPatternFromFabric(ctx, fabrics.pawPad)
      if (!pattern) return

      ctx.fillStyle = pattern

      // Top left paw pad
      ctx.fillRect(2 * smallSquareSize, 2 * smallSquareSize, 2 * smallSquareSize, 2 * smallSquareSize)

      // Top right paw pad
      ctx.fillRect(blockSize + 2 * smallSquareSize, 2 * smallSquareSize, 2 * smallSquareSize, 2 * smallSquareSize)

      // Bottom left paw pad
      ctx.fillRect(2 * smallSquareSize, blockSize + 2 * smallSquareSize, 2 * smallSquareSize, 2 * smallSquareSize)

      // Bottom right paw pad
      ctx.fillRect(
        blockSize + 2 * smallSquareSize,
        blockSize + 2 * smallSquareSize,
        2 * smallSquareSize,
        2 * smallSquareSize,
      )
    }

    // Function to redraw grid lines
    const redrawGridLines = () => {
      ctx.strokeStyle = "#AAAAAA"
      ctx.lineWidth = 0.5

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

    // Apply all fabrics in sequence
    const applyAllFabrics = async () => {
      await applyBackgroundFabric()
      await applyClawsFabric()
      await applyPawPadFabric()
      redrawGridLines()
    }

    applyAllFabrics()
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
            <Link href="/create/bear-paws" draggable="false" style={{ pointerEvents: "auto" }}>
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

          {/* Print button */}
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

          <h1 className="text-4xl font-bold text-center text-gray-900 mb-4">Print Your Bear Paws Quilt</h1>
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
