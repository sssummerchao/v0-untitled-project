"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"

import { X, Undo, Redo } from "lucide-react"

interface ShapeDrawingProps {
  selectedShape: string
  svgRef: React.RefObject<SVGSVGElement>
  viewBox: string
  onClose: () => void
}

export default function ShapeDrawing({ selectedShape, svgRef, viewBox, onClose }: ShapeDrawingProps) {
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentPath, setCurrentPath] = useState("")
  const [paths, setPaths] = useState<string[]>([])
  const [redoPaths, setRedoPaths] = useState<string[]>([])
  const [strokeColor, setStrokeColor] = useState("#000000")
  const [strokeWidth, setStrokeWidth] = useState(3)
  const [strokeDasharray, setStrokeDasharray] = useState("")
  const canvasRef = useRef<SVGSVGElement>(null)
  const shapeRef = useRef<SVGElement | null>(null)
  const [shapeBounds, setShapeBounds] = useState({ x: 0, y: 0, width: 0, height: 0 })

  // Available colors for drawing
  const colors = [
    "#000000", // Black
    "#8B0000", // Dark Red
    "#E49B0F", // Orange
    "#D2B48C", // Tan
    "#6B8E23", // Olive Green
    "#4682B4", // Steel Blue
    "#9370DB", // Medium Purple
    "#2F4F4F", // Dark Slate Gray
  ]

  // Available stroke patterns
  const strokePatterns = [
    "", // Solid line
    "5,5", // Dashed line
    "2,2", // Dotted line
    "10,5,5,5", // Dash-dot line
  ]

  // Find the selected shape element when component mounts
  useEffect(() => {
    if (!svgRef.current) return

    // Find the shape by ID or data-shape-id
    const shape = svgRef.current.querySelector(`#${selectedShape}, [data-shape-id="${selectedShape}"]`) as SVGElement

    if (shape) {
      shapeRef.current = shape

      // Get the bounding box of the shape
      const bbox = shape.getBBox()
      setShapeBounds({
        x: bbox.x,
        y: bbox.y,
        width: bbox.width,
        height: bbox.height,
      })
    }
  }, [selectedShape, svgRef])

  // Handle mouse down event to start drawing
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!canvasRef.current) return

    setIsDrawing(true)
    setRedoPaths([]) // Clear redo stack when starting a new drawing

    // Get the point in SVG coordinates
    const pt = getMousePosition(e)
    const newPath = `M ${pt.x} ${pt.y}`
    setCurrentPath(newPath)
  }

  // Handle mouse move event to continue drawing
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawing || !canvasRef.current) return

    // Get the point in SVG coordinates
    const pt = getMousePosition(e)
    setCurrentPath((prev) => `${prev} L ${pt.x} ${pt.y}`)
  }

  // Handle mouse up event to finish drawing
  const handleMouseUp = () => {
    if (!isDrawing) return

    setIsDrawing(false)
    if (currentPath) {
      setPaths((prev) => [...prev, currentPath])
      setCurrentPath("")
    }
  }

  // Handle mouse leave event to finish drawing
  const handleMouseLeave = () => {
    if (isDrawing) {
      handleMouseUp()
    }
  }

  // Convert mouse position to SVG coordinates
  const getMousePosition = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!canvasRef.current) return { x: 0, y: 0 }

    const CTM = canvasRef.current.getScreenCTM()
    if (!CTM) return { x: 0, y: 0 }

    return {
      x: (e.clientX - CTM.e) / CTM.a,
      y: (e.clientY - CTM.f) / CTM.d,
    }
  }

  // Handle undo action
  const handleUndo = () => {
    if (paths.length === 0) return

    const lastPath = paths[paths.length - 1]
    setPaths(paths.slice(0, -1))
    setRedoPaths((prev) => [...prev, lastPath])
  }

  // Handle redo action
  const handleRedo = () => {
    if (redoPaths.length === 0) return

    const pathToRedo = redoPaths[redoPaths.length - 1]
    setRedoPaths(redoPaths.slice(0, -1))
    setPaths((prev) => [...prev, pathToRedo])
  }

  // Save the drawing to the shape
  const saveDrawing = () => {
    if (!shapeRef.current || !svgRef.current || paths.length === 0) {
      onClose()
      return
    }

    // Create a group element to hold all the paths
    const drawingGroup = document.createElementNS("http://www.w3.org/2000/svg", "g")
    drawingGroup.setAttribute("class", "shape-drawing")
    drawingGroup.setAttribute("data-shape-id", selectedShape)

    // Add all paths to the group
    paths.forEach((pathData) => {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
      path.setAttribute("d", pathData)
      path.setAttribute("stroke", strokeColor)
      path.setAttribute("stroke-width", strokeWidth.toString())
      if (strokeDasharray) {
        path.setAttribute("stroke-dasharray", strokeDasharray)
      }
      path.setAttribute("fill", "none")
      path.setAttribute("pointer-events", "none")
      drawingGroup.appendChild(path)
    })

    // Find if there's an existing drawing for this shape and remove it
    const existingDrawing = svgRef.current.querySelector(`g.shape-drawing[data-shape-id="${selectedShape}"]`)
    if (existingDrawing) {
      existingDrawing.remove()
    }

    // Add the new drawing group to the SVG
    svgRef.current.appendChild(drawingGroup)

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative flex h-full w-full max-w-7xl items-center justify-center">
        {/* Drawing tools panel - positioned to the left */}
        <div
          className="absolute left-4 top-1/2 -translate-y-1/2 transform rounded-lg bg-white p-4 shadow-lg"
          style={{ height: "500px", width: "120px" }}
        >
          <div className="flex h-full flex-col justify-between">
            <div>
              <h3 className="mb-2 text-center font-bold">Color:</h3>
              <div className="mb-4 grid grid-cols-3 gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    className={`h-8 w-8 rounded-full border ${
                      strokeColor === color ? "border-2 border-blue-500" : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setStrokeColor(color)}
                    aria-label={`Select ${color} color`}
                  />
                ))}
              </div>

              <h3 className="mb-2 text-center font-bold">Stitch:</h3>
              <div className="mb-4 flex flex-col space-y-2">
                {strokePatterns.map((pattern, index) => (
                  <button
                    key={index}
                    className={`h-8 rounded border ${
                      strokeDasharray === pattern ? "border-2 border-blue-500" : "border-gray-300"
                    }`}
                    onClick={() => setStrokeDasharray(pattern)}
                    aria-label={`Select stitch pattern ${index + 1}`}
                  >
                    <svg className="h-full w-full">
                      <line
                        x1="10%"
                        y1="50%"
                        x2="90%"
                        y2="50%"
                        stroke="black"
                        strokeWidth="3"
                        strokeDasharray={pattern || "none"}
                      />
                    </svg>
                  </button>
                ))}
              </div>

              {/* Stroke Width Control */}
              <h3 className="mb-2 text-center font-bold">Width:</h3>
              <div className="mb-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={strokeWidth}
                  onChange={(e) => setStrokeWidth(Number.parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="mt-1 text-center">{strokeWidth}px</div>
              </div>
            </div>

            <div className="mt-auto grid grid-cols-2 gap-2">
              <button
                onClick={handleUndo}
                disabled={paths.length === 0}
                className={`flex items-center justify-center rounded-md border p-2 ${
                  paths.length === 0 ? "cursor-not-allowed opacity-50" : "hover:bg-gray-100"
                }`}
                aria-label="Undo"
              >
                <Undo size={20} />
              </button>
              <button
                onClick={handleRedo}
                disabled={redoPaths.length === 0}
                className={`flex items-center justify-center rounded-md border p-2 ${
                  redoPaths.length === 0 ? "cursor-not-allowed opacity-50" : "hover:bg-gray-100"
                }`}
                aria-label="Redo"
              >
                <Redo size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Drawing canvas */}
        <div className="relative h-[80vh] w-[80vw] overflow-hidden rounded-lg bg-white shadow-lg">
          <div className="absolute right-2 top-2 z-10 flex space-x-2">
            <button
              onClick={saveDrawing}
              className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              aria-label="Save drawing"
            >
              Save
            </button>
            <button
              onClick={onClose}
              className="rounded-md bg-gray-200 p-2 hover:bg-gray-300"
              aria-label="Close drawing mode"
            >
              <X size={20} />
            </button>
          </div>

          <svg
            ref={canvasRef}
            className="h-full w-full cursor-crosshair"
            viewBox={viewBox}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            {/* Render the shape outline */}
            {shapeRef.current && (
              <rect
                x={shapeBounds.x}
                y={shapeBounds.y}
                width={shapeBounds.width}
                height={shapeBounds.height}
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2"
                strokeDasharray="5,5"
                pointerEvents="none"
              />
            )}

            {/* Render existing paths */}
            {paths.map((path, index) => (
              <path
                key={index}
                d={path}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                fill="none"
                pointerEvents="none"
              />
            ))}

            {/* Render current path being drawn */}
            {currentPath && (
              <path
                d={currentPath}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                fill="none"
                pointerEvents="none"
              />
            )}
          </svg>
        </div>
      </div>
    </div>
  )
}
