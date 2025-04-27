"use client"

import type React from "react"

import { useState, useRef } from "react"
import { X } from "lucide-react"

interface ShapeDrawingProps {
  selectedShape: string | null
  svgRef: React.RefObject<SVGSVGElement>
  viewBox: string
  onClose: () => void
}

export default function ShapeDrawing({ selectedShape, svgRef, viewBox, onClose }: ShapeDrawingProps) {
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentPath, setCurrentPath] = useState<string>("")
  const [paths, setPaths] = useState<{ path: string; stroke: string; strokeWidth: string; strokeDasharray: string }[]>(
    [],
  )
  const [strokeType, setStrokeType] = useState<string>("solid")
  const [strokeWidth, setStrokeWidth] = useState<string>("3")
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

  // Get the selected shape element
  const getSelectedShapeElement = () => {
    if (!svgRef.current || !selectedShape) return null

    // Find the shape element by its ID or data attribute
    return (
      svgRef.current.querySelector(`[data-shape-id="${selectedShape}"]`) || svgRef.current.getElementById(selectedShape)
    )
  }

  // Start drawing
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (!selectedShape) return
    e.preventDefault()

    const shapeElement = getSelectedShapeElement()
    if (!shapeElement) return

    setIsDrawing(true)

    const point = getSVGPoint(e)
    if (!point) return

    setCurrentPath(`M ${point.x} ${point.y}`)
  }

  // Continue drawing
  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !selectedShape) return
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
        stroke: "#000000",
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
    if (!svgRef.current || !selectedShape) return

    // Find the shape element
    const shapeElement = getSelectedShapeElement()
    if (!shapeElement) return

    // Create a group for the paths if it doesn't exist
    let pathGroup = svgRef.current.querySelector(`g[data-drawing-group="${selectedShape}"]`)
    if (!pathGroup) {
      pathGroup = document.createElementNS("http://www.w3.org/2000/svg", "g")
      pathGroup.setAttribute("data-drawing-group", selectedShape)
      svgRef.current.appendChild(pathGroup)
    } else {
      // Clear existing paths
      while (pathGroup.firstChild) {
        pathGroup.removeChild(pathGroup.firstChild)
      }
    }

    // Create a clip path if it doesn't exist
    let clipPath = svgRef.current.querySelector(`clipPath[id="clip-${selectedShape}"]`)
    if (!clipPath) {
      clipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath")
      clipPath.setAttribute("id", `clip-${selectedShape}`)

      // Clone the shape element and add it to the clip path
      const clonedShape = shapeElement.cloneNode(true) as SVGElement
      clipPath.appendChild(clonedShape)

      // Add the clip path to the defs
      let defs = svgRef.current.querySelector("defs")
      if (!defs) {
        defs = document.createElementNS("http://www.w3.org/2000/svg", "defs")
        svgRef.current.appendChild(defs)
      }
      defs.appendChild(clipPath)
    }

    // Set the clip path on the path group
    pathGroup.setAttribute("clip-path", `url(#clip-${selectedShape})`)

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
      pathGroup.appendChild(pathElement)
    })

    onClose()
  }

  if (!selectedShape) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Draw on Shape</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-wrap gap-4 mb-4">
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

          <button className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200" onClick={clearDrawings}>
            Clear
          </button>
        </div>

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
            viewBox={viewBox}
            style={{ maxHeight: "calc(90vh - 150px)" }}
            className="absolute top-0 left-0 w-full h-full"
          >
            {/* Preview of the selected shape */}
            <g opacity="0.3">
              {getSelectedShapeElement() && <use href={`#${selectedShape}`} xlinkHref={`#${selectedShape}`} />}
            </g>

            {/* Current path being drawn */}
            {isDrawing && currentPath && (
              <path
                d={currentPath}
                fill="none"
                stroke="#000000"
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

        <div className="mt-4 flex justify-end space-x-2">
          <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300" onClick={onClose}>
            Cancel
          </button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={saveDrawings}>
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
