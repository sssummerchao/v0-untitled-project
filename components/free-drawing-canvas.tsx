"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Trash2 } from "lucide-react"

interface FreeDrawingCanvasProps {
  svgRef: React.RefObject<SVGSVGElement>
  viewBox: string
  isActive?: boolean
}

export default function FreeDrawingCanvas({ svgRef, viewBox, isActive = false }: FreeDrawingCanvasProps) {
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentPath, setCurrentPath] = useState<string>("")
  const [paths, setPaths] = useState<{ path: string; stroke: string; strokeWidth: string; strokeDasharray: string }[]>(
    [],
  )
  const [strokeType, setStrokeType] = useState<string>("solid")
  const [strokeWidth, setStrokeWidth] = useState<string>("3")
  const [strokeColor, setStrokeColor] = useState<string>("#000000")
  const canvasRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<SVGSVGElement>(null)
  const [drawingGroupId] = useState(`drawing-group-${Math.random().toString(36).substring(2, 9)}`)
  const [actualViewBox, setActualViewBox] = useState(viewBox)

  // Extract viewBox dimensions
  const viewBoxDimensions = actualViewBox.split(" ").map(Number)
  const viewBoxMinX = viewBoxDimensions[0] || 0
  const viewBoxMinY = viewBoxDimensions[1] || 0
  const svgWidth = viewBoxDimensions[2] || 1080
  const svgHeight = viewBoxDimensions[3] || 1080

  // Get the actual viewBox from the SVG element
  useEffect(() => {
    if (svgRef.current) {
      const svgViewBox = svgRef.current.getAttribute("viewBox")
      if (svgViewBox) {
        setActualViewBox(svgViewBox)
        console.log("Using SVG viewBox:", svgViewBox)
      } else {
        console.log("Using provided viewBox:", viewBox)
      }
    }
  }, [svgRef, viewBox])

  // Initialize drawing group when component mounts
  useEffect(() => {
    if (!svgRef.current) return

    // Create a drawing group if it doesn't exist
    let drawingGroup = svgRef.current.querySelector(`g[data-drawing-group="${drawingGroupId}"]`)
    if (!drawingGroup) {
      drawingGroup = document.createElementNS("http://www.w3.org/2000/svg", "g")
      drawingGroup.setAttribute("data-drawing-group", drawingGroupId)
      svgRef.current.appendChild(drawingGroup)
    }

    return () => {
      // Clean up when component unmounts
      if (svgRef.current) {
        const group = svgRef.current.querySelector(`g[data-drawing-group="${drawingGroupId}"]`)
        if (group) {
          group.remove()
        }
      }
    }
  }, [svgRef, drawingGroupId])

  // Toggle visibility of drawings in main SVG based on active state
  useEffect(() => {
    if (!svgRef.current) return

    const drawingGroup = svgRef.current.querySelector(`g[data-drawing-group="${drawingGroupId}"]`)
    if (drawingGroup) {
      // Hide drawings in main SVG when in drawing mode (they'll be shown in overlay)
      // Show drawings in main SVG when in selection mode
      drawingGroup.style.display = isActive ? "none" : "block"
    }
  }, [isActive, svgRef, drawingGroupId])

  // Update drawings in main SVG when paths change or mode changes
  useEffect(() => {
    if (!svgRef.current) return

    // Get the drawing group
    const drawingGroup = svgRef.current.querySelector(`g[data-drawing-group="${drawingGroupId}"]`)
    if (!drawingGroup) return

    // Clear existing paths
    while (drawingGroup.firstChild) {
      drawingGroup.removeChild(drawingGroup.firstChild)
    }

    // Add the paths to the group
    paths.forEach(({ path, stroke, strokeWidth, strokeDasharray }) => {
      const pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path")
      pathElement.setAttribute("d", path)
      pathElement.setAttribute("fill", "none")
      pathElement.setAttribute("stroke", stroke)
      pathElement.setAttribute("stroke-width", strokeWidth)
      if (strokeDasharray) {
        pathElement.setAttribute("stroke-dasharray", strokeDasharray)
      }
      drawingGroup.appendChild(pathElement)
    })
  }, [paths, svgRef, drawingGroupId])

  // Create a function to get the SVG point from a mouse or touch event
  const getSVGPoint = (
    event: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent,
  ): { x: number; y: number } | null => {
    if (!svgRef.current || !overlayRef.current) return null

    // Get the client coordinates
    let clientX, clientY
    if ((event as TouchEvent).touches) {
      clientX = (event as TouchEvent).touches[0].clientX
      clientY = (event as TouchEvent).touches[0].clientY
    } else {
      clientX = (event as MouseEvent).clientX
      clientY = (event as MouseEvent).clientY
    }

    // Get the bounding rectangle of the SVG element
    const svgRect = svgRef.current.getBoundingClientRect()
    const overlayRect = overlayRef.current.getBoundingClientRect()

    // Calculate the point in SVG coordinates
    const scaleX = svgWidth / overlayRect.width
    const scaleY = svgHeight / overlayRect.height

    const x = viewBoxMinX + (clientX - overlayRect.left) * scaleX
    const y = viewBoxMinY + (clientY - overlayRect.top) * scaleY

    return { x, y }
  }

  // Start drawing
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isActive) return
    e.preventDefault()

    const point = getSVGPoint(e)
    if (!point) return

    setIsDrawing(true)
    setCurrentPath(`M ${point.x} ${point.y}`)
  }

  // Continue drawing
  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !isActive) return
    e.preventDefault()

    const point = getSVGPoint(e)
    if (!point) return

    setCurrentPath((prev) => `${prev} L ${point.x} ${point.y}`)
  }

  // End drawing
  const handleMouseUp = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !currentPath || !isActive) return
    e.preventDefault()

    // Get the stroke dash array based on the selected stroke type
    let strokeDasharray = ""
    switch (strokeType) {
      case "dashed":
        strokeDasharray = "10 5"
        break
      case "dotted":
        strokeDasharray = "2 5"
        break
      case "dash-dot":
        strokeDasharray = "10 5 2 5"
        break
      default:
        strokeDasharray = ""
    }

    setPaths((prev) => [
      ...prev,
      {
        path: currentPath,
        stroke: strokeColor,
        strokeWidth,
        strokeDasharray,
      },
    ])

    setIsDrawing(false)
    setCurrentPath("")
  }

  // Clear all drawings
  const clearDrawings = () => {
    setPaths([])
  }

  // Color options
  const colorOptions = [
    "#000000", // Black
    "#FF0000", // Red
    "#0000FF", // Blue
    "#008000", // Green
    "#FFA500", // Orange
    "#800080", // Purple
    "#A52A2A", // Brown
  ]

  // Ensure the overlay SVG has the same dimensions and viewBox as the main SVG
  useEffect(() => {
    if (!overlayRef.current || !svgRef.current) return

    // Match the overlay SVG's dimensions to the main SVG
    const updateOverlayDimensions = () => {
      const mainSvgRect = svgRef.current?.getBoundingClientRect()
      if (!mainSvgRect) return

      // Set the overlay SVG's dimensions
      overlayRef.current.style.width = `${mainSvgRect.width}px`
      overlayRef.current.style.height = `${mainSvgRect.height}px`

      // Ensure the overlay is positioned exactly over the main SVG
      if (canvasRef.current) {
        canvasRef.current.style.position = "absolute"
        canvasRef.current.style.top = "0"
        canvasRef.current.style.left = "0"
        canvasRef.current.style.width = "100%"
        canvasRef.current.style.height = "100%"
        canvasRef.current.style.pointerEvents = isActive ? "auto" : "none"
      }
    }

    // Update dimensions initially and on resize
    updateOverlayDimensions()
    window.addEventListener("resize", updateOverlayDimensions)

    return () => {
      window.removeEventListener("resize", updateOverlayDimensions)
    }
  }, [svgRef, isActive])

  if (!isActive) return null

  return (
    <>
      {/* Drawing tools panel - positioned above the mode selector */}
      <div
        className="fixed bottom-36 left-8 z-20 bg-white rounded-lg shadow-lg p-2 flex flex-col gap-2"
        style={{ width: "80px" }}
      >
        {/* Color selector - vertical layout */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-medium">Color:</span>
          <div className="grid grid-cols-3 gap-1">
            {colorOptions.map((color) => (
              <button
                key={color}
                className={`w-5 h-5 rounded-full border ${strokeColor === color ? "ring-2 ring-blue-500" : ""}`}
                style={{ backgroundColor: color }}
                onClick={() => setStrokeColor(color)}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* Line style options */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-medium">Style:</span>
          <div className="flex flex-col gap-1">
            <button
              className={`p-1 rounded w-full ${strokeType === "solid" ? "bg-blue-100" : "hover:bg-gray-100"}`}
              onClick={() => setStrokeType("solid")}
              title="Solid Line"
            >
              <div className="w-full h-1 bg-black"></div>
            </button>
            <button
              className={`p-1 rounded w-full ${strokeType === "dashed" ? "bg-blue-100" : "hover:bg-gray-100"}`}
              onClick={() => setStrokeType("dashed")}
              title="Dashed Line"
            >
              <div className="w-full h-1 bg-black" style={{ borderTop: "1px dashed black" }}></div>
            </button>
            <button
              className={`p-1 rounded w-full ${strokeType === "dotted" ? "bg-blue-100" : "hover:bg-gray-100"}`}
              onClick={() => setStrokeType("dotted")}
              title="Dotted Line"
            >
              <div className="w-full h-1 bg-black" style={{ borderTop: "1px dotted black" }}></div>
            </button>
          </div>
        </div>

        {/* Line width selector */}
        <div className="flex flex-col items-center gap-1">
          <label htmlFor="stroke-width" className="text-xs font-medium">
            Width:
          </label>
          <select
            id="stroke-width"
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(e.target.value)}
            className="border rounded px-1 py-1 text-xs w-full"
          >
            <option value="1">Thin</option>
            <option value="3">Medium</option>
            <option value="5">Thick</option>
            <option value="8">Very</option>
          </select>
        </div>

        {/* Clear button */}
        <button
          className="mt-1 px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center justify-center"
          onClick={clearDrawings}
        >
          <Trash2 size={14} className="mr-1" />
          <span className="text-xs">Clear</span>
        </button>
      </div>

      {/* Drawing canvas overlay - positioned exactly over the SVG */}
      <div
        ref={canvasRef}
        className="absolute inset-0 cursor-crosshair"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: isActive ? "auto" : "none",
          zIndex: 10,
        }}
      >
        {/* Overlay SVG for real-time drawing visualization */}
        <svg
          ref={overlayRef}
          width="100%"
          height="100%"
          viewBox={actualViewBox}
          style={{ position: "absolute", top: 0, left: 0 }}
          preserveAspectRatio="xMidYMid meet"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
        >
          {/* Current path being drawn */}
          {isDrawing && currentPath && (
            <path
              d={currentPath}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={
                strokeType === "dashed"
                  ? "10 5"
                  : strokeType === "dotted"
                    ? "2 5"
                    : strokeType === "dash-dot"
                      ? "10 5 2 5"
                      : ""
              }
            />
          )}

          {/* Only show existing paths in the overlay when in drawing mode */}
          {paths.map((path, index) => (
            <path
              key={index}
              d={path.path}
              fill="none"
              stroke={path.stroke}
              strokeWidth={path.strokeWidth}
              strokeDasharray={path.strokeDasharray}
            />
          ))}
        </svg>
      </div>
    </>
  )
}
