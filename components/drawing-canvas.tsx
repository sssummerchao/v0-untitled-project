"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"

interface DrawingCanvasProps {
  selectedShape: string
  onClose: () => void
}

export default function DrawingCanvas({ selectedShape, onClose }: DrawingCanvasProps) {
  const [isDrawing, setIsDrawing] = useState(false)
  const [paths, setPaths] = useState<string[]>([])
  const [currentPath, setCurrentPath] = useState<string>("")
  const [strokeType, setStrokeType] = useState<"solid" | "dashed" | "dotted" | "dash-dot">("solid")
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null)

  // Initialize canvas context
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (context) {
      // Set canvas size to match container
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight

      // Set line style
      context.lineWidth = 3
      context.lineCap = "round"
      context.lineJoin = "round"
      context.strokeStyle = "#000000"

      setCtx(context)
    }
  }, [])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !ctx) return

      // Save current drawing
      const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height)

      // Resize canvas
      canvasRef.current.width = canvasRef.current.offsetWidth
      canvasRef.current.height = canvasRef.current.offsetHeight

      // Restore drawing
      ctx.putImageData(imageData, 0, 0)

      // Reset context properties
      ctx.lineWidth = 3
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.strokeStyle = "#000000"
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [ctx])

  // Start drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!ctx) return

    setIsDrawing(true)

    // Get coordinates
    let x, y
    if ("touches" in e) {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      x = e.nativeEvent.offsetX
      y = e.nativeEvent.offsetY
    }

    // Start new path
    ctx.beginPath()
    ctx.moveTo(x, y)

    // Set dash pattern based on stroke type
    switch (strokeType) {
      case "dashed":
        ctx.setLineDash([10, 5])
        break
      case "dotted":
        ctx.setLineDash([2, 5])
        break
      case "dash-dot":
        ctx.setLineDash([10, 5, 2, 5])
        break
      default:
        ctx.setLineDash([])
    }

    setCurrentPath(`M ${x} ${y}`)
  }

  // Continue drawing
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !ctx) return

    // Get coordinates
    let x, y
    if ("touches" in e) {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      x = e.nativeEvent.offsetX
      y = e.nativeEvent.offsetY
    }

    // Draw line to new position
    ctx.lineTo(x, y)
    ctx.stroke()

    setCurrentPath((prev) => `${prev} L ${x} ${y}`)
  }

  // End drawing
  const endDrawing = () => {
    if (!isDrawing) return

    setIsDrawing(false)

    if (currentPath) {
      setPaths((prev) => [...prev, currentPath])
      setCurrentPath("")
    }

    if (ctx) {
      ctx.closePath()
    }
  }

  // Clear canvas
  const clearCanvas = () => {
    if (!ctx || !canvasRef.current) return

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    setPaths([])
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Drawing on Shape: {selectedShape}</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="flex space-x-4 mb-4">
          <div className="flex space-x-2">
            <button
              className={`p-2 rounded ${strokeType === "solid" ? "bg-blue-100" : "hover:bg-gray-100"}`}
              onClick={() => setStrokeType("solid")}
              title="Solid Line"
            >
              <div className="w-8 h-1 bg-black"></div>
            </button>
            <button
              className={`p-2 rounded ${strokeType === "dashed" ? "bg-blue-100" : "hover:bg-gray-100"}`}
              onClick={() => setStrokeType("dashed")}
              title="Dashed Line"
            >
              <div className="w-8 h-1 bg-black" style={{ borderTop: "1px dashed black" }}></div>
            </button>
            <button
              className={`p-2 rounded ${strokeType === "dotted" ? "bg-blue-100" : "hover:bg-gray-100"}`}
              onClick={() => setStrokeType("dotted")}
              title="Dotted Line"
            >
              <div className="w-8 h-1 bg-black" style={{ borderTop: "1px dotted black" }}></div>
            </button>
            <button
              className={`p-2 rounded ${strokeType === "dash-dot" ? "bg-blue-100" : "hover:bg-gray-100"}`}
              onClick={() => setStrokeType("dash-dot")}
              title="Dash-Dot Line"
            >
              <div
                className="w-8 h-1 bg-black"
                style={{ borderTop: "1px dashed black", borderTopStyle: "dashed" }}
              ></div>
            </button>
          </div>

          <button className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200" onClick={clearCanvas}>
            Clear
          </button>
        </div>

        <div className="flex-1 border border-gray-300 rounded overflow-hidden cursor-crosshair bg-white">
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={endDrawing}
            onMouseLeave={endDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={endDrawing}
          />
        </div>

        <div className="mt-4 flex justify-end">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
