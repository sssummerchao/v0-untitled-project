"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Pencil, MousePointer, X, Trash2 } from "lucide-react"

interface DrawingModeToggleProps {
  svgRef: React.RefObject<SVGSVGElement>
  viewBox?: string
  onModeChange?: (isDrawingMode: boolean) => void
}

export default function DrawingModeToggle({ svgRef, viewBox, onModeChange }: DrawingModeToggleProps) {
  const [isDrawingMode, setIsDrawingMode] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const [showDrawingPanel, setShowDrawingPanel] = useState(false)
  const [currentPath, setCurrentPath] = useState<string>("")
  const [paths, setPaths] = useState<{ path: string; stroke: string; strokeWidth: string; strokeDasharray: string }[]>(
    [],
  )
  const [strokeType, setStrokeType] = useState<string>("solid")
  const [strokeWidth, setStrokeWidth] = useState<string>("3")
  const [strokeColor, setStrokeColor] = useState<string>("#000000")
  const canvasRef = useRef<HTMLDivElement>(null)
  const drawingLayerRef = useRef<SVGSVGElement>(null)

  // Create a function to get the SVG point from a mouse or touch event
  const getSVGPoint = (event: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent): SVGPoint | null => {
    if (!svgRef.current) return null

    // Get the client coordinates
    let clientX, clientY
    if ((event as TouchEvent).touches) {
      clientX = (event as TouchEvent).touches[0].clientX
      clientY = (event as TouchEvent).touches[0].clientY
    } else {
      clientX = (event as MouseEvent).clientX
      clientY = (event as MouseEvent).clientY
    }

    // Create a point in screen coordinates
    const svg = svgRef.current
    const point = svg.createSVGPoint()
    point.x = clientX
    point.y = clientY

    // Convert to SVG coordinates
    const screenCTM = svg.getScreenCTM()
    if (!screenCTM) return null

    return point.matrixTransform(screenCTM.inverse())
  }

  // Start drawing
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()

    const point = getSVGPoint(e)
    if (!point) return

    setIsDrawing(true)
    setCurrentPath(`M ${point.x} ${point.y}`)
  }

  // Continue drawing
  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return
    e.preventDefault()

    const point = getSVGPoint(e)
    if (!point) return

    setCurrentPath((prev) => `${prev} L ${point.x} ${point.y}`)
  }

  // End drawing
  const handleMouseUp = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !currentPath) return
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

  // Save drawings to the main SVG
  const saveDrawings = () => {
    if (!svgRef.current) return

    // Create a group for the drawings if it doesn't exist
    let drawingGroup = svgRef.current.querySelector(`g[data-drawing-group="free-drawing"]`)
    if (!drawingGroup) {
      drawingGroup = document.createElementNS("http://www.w3.org/2000/svg", "g")
      drawingGroup.setAttribute("data-drawing-group", "free-drawing")
      svgRef.current.appendChild(drawingGroup)
    } else {
      // Clear existing paths
      while (drawingGroup.firstChild) {
        drawingGroup.removeChild(drawingGroup.firstChild)
      }
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

    setShowDrawingPanel(false)
  }

  // Toggle drawing mode
  const toggleDrawingMode = () => {
    const newMode = !isDrawingMode
    setIsDrawingMode(newMode)
    if (onModeChange) {
      onModeChange(newMode)
    }
  }

  // Open drawing panel
  const openDrawingPanel = () => {
    setShowDrawingPanel(true)
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

  return (
    <>
      {/* Mode toggle buttons */}
      <div className="fixed bottom-8 left-8 z-10 flex space-x-2">
        <button
          onClick={toggleDrawingMode}
          className={`p-3 rounded-full shadow-lg transition-colors ${
            isDrawingMode ? "bg-blue-500 text-white" : "bg-white text-gray-800 hover:bg-gray-100"
          }`}
          title={isDrawingMode ? "Switch to shape selection mode" : "Switch to drawing mode"}
        >
          {isDrawingMode ? <MousePointer size={24} /> : <Pencil size={24} />}
        </button>

        {isDrawingMode && (
          <button
            onClick={openDrawingPanel}
            className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            title="Open drawing panel"
          >
            <Pencil size={24} />
          </button>
        )}
      </div>

      {/* Drawing panel modal */}
      {showDrawingPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Draw on Quilt</h3>
              <button onClick={() => setShowDrawingPanel(false)} className="p-1 rounded-full hover:bg-gray-200">
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-wrap gap-4 mb-4">
              {/* Line style options */}
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

              {/* Line width selector */}
              <div className="flex items-center space-x-2">
                <label htmlFor="stroke-width" className="text-sm">
                  Line Width:
                </label>
                <select
                  id="stroke-width"
                  value={strokeWidth}
                  onChange={(e) => setStrokeWidth(e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  <option value="1">Thin</option>
                  <option value="3">Medium</option>
                  <option value="5">Thick</option>
                  <option value="8">Very Thick</option>
                </select>
              </div>

              {/* Color selector */}
              <div className="flex items-center space-x-2">
                <span className="text-sm">Color:</span>
                <div className="flex space-x-1">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      className={`w-6 h-6 rounded-full border ${strokeColor === color ? "ring-2 ring-blue-500" : ""}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setStrokeColor(color)}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Clear button */}
              <button
                className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center"
                onClick={clearDrawings}
              >
                <Trash2 size={16} className="mr-1" />
                Clear
              </button>
            </div>

            {/* Drawing canvas */}
            <div
              ref={canvasRef}
              className="flex-1 border border-gray-300 rounded overflow-hidden cursor-crosshair bg-white relative"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleMouseDown}
              onTouchMove={handleMouseMove}
              onTouchEnd={handleMouseUp}
            >
              <svg
                ref={drawingLayerRef}
                width="100%"
                height="100%"
                viewBox={viewBox || (svgRef.current ? svgRef.current.getAttribute("viewBox") || undefined : undefined)}
                style={{ maxHeight: "calc(90vh - 150px)" }}
                className="absolute top-0 left-0 w-full h-full"
              >
                {/* Preview of the SVG content */}
                <g opacity="0.5">
                  {svgRef.current &&
                    Array.from(svgRef.current.children).map((child, index) => {
                      if (child.tagName !== "g" || !child.getAttribute("data-drawing-group")) {
                        return <use key={index} href={`#${child.id}`} xlinkHref={`#${child.id}`} />
                      }
                      return null
                    })}
                </g>

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

                {/* Existing paths */}
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

            {/* Action buttons */}
            <div className="mt-4 flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                onClick={() => setShowDrawingPanel(false)}
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={saveDrawings}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
