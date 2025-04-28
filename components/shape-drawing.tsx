"use client"

import React from "react"

import { useState, useRef } from "react"
import { X, Undo2, Redo2 } from "lucide-react"

interface ShapeDrawingProps {
  selectedShape: string | null
  svgRef: React.RefObject<SVGSVGElement>
  viewBox: string
  onClose: () => void
}

// Define stitch types
type StitchType = "running" | "chain" | "cross"

// Define cross stitch color combinations
const crossStitchCombinations = [
  { main: "#251e1d", accent: "#89a3cb" }, // Dark brown/black with light blue
  { main: "#842735", accent: "#251e1d" }, // Burgundy with black
  { main: "#ef9929", accent: "#5d6341" }, // Orange with olive green
  { main: "#daccb8", accent: "#b79ec2" }, // Beige with lavender
  { main: "#89a3cb", accent: "#842735" }, // Light blue with burgundy
  { main: "#b79ec2", accent: "#35405a" }, // Lavender with navy blue
  { main: "#35405a", accent: "#ef9929" }, // Navy blue with orange
  { main: "#5d6341", accent: "#daccb8" }, // Olive green with beige
]

// Add color options array with the requested colors
const colorOptions = [
  "#251e1d", // Dark brown/black
  "#842735", // Burgundy
  "#ef9929", // Orange
  "#daccb8", // Beige
  "#89a3cb", // Light blue
  "#b79ec2", // Lavender
  "#35405a", // Navy blue
  "#5d6341", // Olive green
]

export default function ShapeDrawing({ selectedShape, svgRef, viewBox, onClose }: ShapeDrawingProps) {
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentPath, setCurrentPath] = useState<string>("")
  const [paths, setPaths] = useState<{ path: string; stroke: string; stitchType: StitchType }[]>([])
  const [undoStack, setUndoStack] = useState<{ path: string; stroke: string; stitchType: StitchType }[]>([])
  const [stitchType, setStitchType] = useState<StitchType>("running")
  const [stroke, setStroke] = useState<string>("#251e1d")
  const [selectedCrossStitchIndex, setSelectedCrossStitchIndex] = useState(0)
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

  // Helper function to extract points from a path string
  const extractPointsFromPath = (pathString: string): { x: number; y: number }[] => {
    const points: { x: number; y: number }[] = []
    const parts = pathString.split(/[MLZ]\s*/i).filter(Boolean)

    for (const part of parts) {
      const coords = part.trim().split(/\s+/)
      for (let i = 0; i < coords.length; i += 2) {
        if (i + 1 < coords.length) {
          const x = Number.parseFloat(coords[i])
          const y = Number.parseFloat(coords[i + 1])
          if (!isNaN(x) && !isNaN(y)) {
            points.push({ x, y })
          }
        }
      }
    }

    return points
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

    // Push the current state to the undo stack
    setUndoStack((prev) => [...prev, { path: currentPath, stroke: stroke, stitchType: stitchType }])

    setPaths((prev) => [
      ...prev,
      {
        path: currentPath,
        stroke: stroke,
        stitchType: stitchType,
      },
    ])

    setIsDrawing(false)
    setCurrentPath("")
  }

  // Undo the last drawing action
  const undo = () => {
    if (paths.length === 0) return

    // Get the last path from the paths array
    const lastPath = paths[paths.length - 1]

    // Remove the last path from the paths array
    setPaths((prev) => prev.slice(0, -1))

    // Push the last path to the undo stack
    setUndoStack((prev) => [...prev, lastPath])
  }

  // Redo the last undone action
  const redo = () => {
    if (undoStack.length === 0) return

    // Get the last path from the undo stack
    const lastPath = undoStack[undoStack.length - 1]

    // Remove the last path from the undo stack
    setUndoStack((prev) => prev.slice(0, -1))

    // Add the last path back to the paths array
    setPaths((prev) => [...prev, lastPath])
  }

  // Clear all drawings
  const clearDrawings = () => {
    setPaths([])
    setUndoStack([])
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
    paths.forEach(({ path, stroke, stitchType }) => {
      if (stitchType === "running") {
        // Running stitch (solid line)
        const pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path")
        pathElement.setAttribute("d", path)
        pathElement.setAttribute("fill", "none")
        pathElement.setAttribute("stroke", stroke)
        pathElement.setAttribute("stroke-width", "3")
        pathElement.setAttribute("stroke-linecap", "round")
        pathGroup.appendChild(pathElement)
      } else if (stitchType === "chain") {
        // Chain stitch (dashed line with rounded caps)
        const pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path")
        pathElement.setAttribute("d", path)
        pathElement.setAttribute("fill", "none")
        pathElement.setAttribute("stroke", stroke)
        pathElement.setAttribute("stroke-width", "3")
        pathElement.setAttribute("stroke-dasharray", "5 5")
        pathElement.setAttribute("stroke-linecap", "round")
        pathGroup.appendChild(pathElement)
      } else if (stitchType === "cross") {
        // Cross stitch (alternating black and blue segments)
        const points = extractPointsFromPath(path)
        if (points.length < 2) return

        const { main, accent } = crossStitchCombinations[selectedCrossStitchIndex]

        // Create segments along the path
        const segmentLength = 20 // Length of each segment
        let currentDistance = 0
        let currentPoint = points[0]
        let nextPointIndex = 1
        let isMainSegment = true

        while (nextPointIndex < points.length) {
          const nextPoint = points[nextPointIndex]
          const dx = nextPoint.x - currentPoint.x
          const dy = nextPoint.y - currentPoint.y
          const segmentDistance = Math.sqrt(dx * dx + dy * dy)

          if (currentDistance + segmentDistance >= segmentLength) {
            // Calculate the point at the end of this segment
            const ratio = (segmentLength - currentDistance) / segmentDistance
            const endX = currentPoint.x + dx * ratio
            const endY = currentPoint.y + dy * ratio

            // Create a path for this segment
            const segmentPath = document.createElementNS("http://www.w3.org/2000/svg", "path")
            segmentPath.setAttribute("d", `M ${currentPoint.x} ${currentPoint.y} L ${endX} ${endY}`)
            segmentPath.setAttribute("fill", "none")
            segmentPath.setAttribute("stroke", isMainSegment ? main : accent) // Alternate colors
            segmentPath.setAttribute("stroke-width", "3")
            segmentPath.setAttribute("stroke-linecap", "butt")
            pathGroup.appendChild(segmentPath)

            // Update for next segment
            currentPoint = { x: endX, y: endY }
            currentDistance = 0
            isMainSegment = !isMainSegment
          } else {
            // Move to the next point
            const segmentPath = document.createElementNS("http://www.w3.org/2000/svg", "path")
            segmentPath.setAttribute("d", `M ${currentPoint.x} ${currentPoint.y} L ${nextPoint.x} ${nextPoint.y}`)
            segmentPath.setAttribute("fill", "none")
            segmentPath.setAttribute("stroke", isMainSegment ? main : accent) // Alternate colors
            segmentPath.setAttribute("stroke-width", "3")
            segmentPath.setAttribute("stroke-linecap", "butt")
            pathGroup.appendChild(segmentPath)

            currentDistance += segmentDistance
            currentPoint = nextPoint
            nextPointIndex++

            // If we've reached the segment length, switch colors
            if (currentDistance >= segmentLength) {
              currentDistance = 0
              isMainSegment = !isMainSegment
            }
          }
        }
      }
    })

    onClose()
  }

  // Update the renderStitchPreview function to better display the chain stitch and make the cross stitch match the screenshot
  const renderStitchPreview = (type: StitchType) => {
    switch (type) {
      case "running":
        return (
          <div className="w-full h-4 flex items-center">
            <div className="w-full h-2 bg-black rounded-full"></div>
          </div>
        )
      case "chain":
        return (
          <div className="w-full h-4 flex items-center justify-between">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-2 h-2 bg-black rounded-full"></div>
            ))}
          </div>
        )
      case "cross":
        const { main, accent } = crossStitchCombinations[selectedCrossStitchIndex]
        return (
          <div className="w-full h-4 flex items-center">
            <div className="w-[20%] h-2" style={{ backgroundColor: main }}></div>
            <div className="w-[10%] h-2" style={{ backgroundColor: accent }}></div>
            <div className="w-[20%] h-2" style={{ backgroundColor: main }}></div>
            <div className="w-[10%] h-2" style={{ backgroundColor: accent }}></div>
            <div className="w-[20%] h-2" style={{ backgroundColor: main }}></div>
            <div className="w-[10%] h-2" style={{ backgroundColor: accent }}></div>
            <div className="w-[10%] h-2" style={{ backgroundColor: main }}></div>
          </div>
        )
    }
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
          {/* Stitch style options */}
          <div className="flex space-x-4">
            <button
              className={`p-2 rounded ${stitchType === "running" ? "bg-blue-100" : "hover:bg-gray-100"}`}
              onClick={() => setStitchType("running")}
              title="Running Stitch"
            >
              <div className="w-20 h-4 relative">{renderStitchPreview("running")}</div>
            </button>
            <button
              className={`p-2 rounded ${stitchType === "chain" ? "bg-blue-100" : "hover:bg-gray-100"}`}
              onClick={() => setStitchType("chain")}
              title="Chain Stitch"
            >
              <div className="w-20 h-4 relative">{renderStitchPreview("chain")}</div>
            </button>
            <button
              className={`p-2 rounded ${stitchType === "cross" ? "bg-blue-100" : "hover:bg-gray-100"}`}
              onClick={() => setStitchType("cross")}
              title="Cross Stitch"
            >
              <div className="w-20 h-4 relative">{renderStitchPreview("cross")}</div>
            </button>
          </div>

          {/* Color selector */}
          <div className="flex items-center space-x-2">
            <span className="text-sm">Color:</span>
            {stitchType !== "cross" ? (
              <div className="flex flex-wrap gap-1 max-w-[200px]">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    className={`w-6 h-6 rounded-full border ${stroke === color ? "ring-2 ring-blue-500" : ""}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setStroke(color)}
                    title={color}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-1 max-w-[200px]">
                {crossStitchCombinations.map((_, index) => (
                  <button
                    key={index}
                    className={`w-6 h-6 rounded-full border ${selectedCrossStitchIndex === index ? "ring-2 ring-blue-500" : ""}`}
                    style={{
                      background: `linear-gradient(to right, ${crossStitchCombinations[index].main} 50%, ${crossStitchCombinations[index].accent} 50%)`,
                    }}
                    onClick={() => setSelectedCrossStitchIndex(index)}
                    title={`Main: ${crossStitchCombinations[index].main}, Accent: ${crossStitchCombinations[index].accent}`}
                  />
                ))}
              </div>
            )}
          </div>

          <button className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200" onClick={clearDrawings}>
            Clear
          </button>
          <button className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200" onClick={undo}>
            <Undo2 size={20} />
          </button>
          <button className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200" onClick={redo}>
            <Redo2 size={20} />
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
              <>
                {stitchType === "running" && (
                  <path d={currentPath} fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
                )}
                {stitchType === "chain" && (
                  <path
                    d={currentPath}
                    fill="none"
                    stroke={stroke}
                    strokeWidth="3"
                    strokeDasharray="5 5"
                    strokeLinecap="round"
                  />
                )}
                {stitchType === "cross" && (
                  <>
                    {(() => {
                      const points = extractPointsFromPath(currentPath)
                      if (points.length < 2) return null

                      const { main, accent } = crossStitchCombinations[selectedCrossStitchIndex]

                      const segments = []
                      const segmentLength = 20 // Length of each segment
                      let currentDistance = 0
                      let currentPoint = points[0]
                      let nextPointIndex = 1
                      let isMainSegment = true

                      while (nextPointIndex < points.length) {
                        const nextPoint = points[nextPointIndex]
                        const dx = nextPoint.x - currentPoint.x
                        const dy = nextPoint.y - currentPoint.y
                        const segmentDistance = Math.sqrt(dx * dx + dy * dy)

                        if (currentDistance + segmentDistance >= segmentLength) {
                          // Calculate the point at the end of this segment
                          const ratio = (segmentLength - currentDistance) / segmentDistance
                          const endX = currentPoint.x + dx * ratio
                          const endY = currentPoint.y + dy * ratio

                          // Add a segment
                          segments.push({
                            path: `M ${currentPoint.x} ${currentPoint.y} L ${endX} ${endY}`,
                            isMain: isMainSegment,
                          })

                          // Update for next segment
                          currentPoint = { x: endX, y: endY }
                          currentDistance = 0
                          isMainSegment = !isMainSegment
                        } else {
                          // Move to the next point
                          segments.push({
                            path: `M ${currentPoint.x} ${currentPoint.y} L ${nextPoint.x} ${nextPoint.y}`,
                            isMain: isMainSegment,
                          })

                          currentDistance += segmentDistance
                          currentPoint = nextPoint
                          nextPointIndex++

                          // If we've reached the segment length, switch colors
                          if (currentDistance >= segmentLength) {
                            currentDistance = 0
                            isMainSegment = !isMainSegment
                          }
                        }
                      }

                      return segments.map((segment, i) => (
                        <path
                          key={i}
                          d={segment.path}
                          fill="none"
                          stroke={segment.isMain ? main : accent}
                          strokeWidth="3"
                          strokeLinecap="butt"
                        />
                      ))
                    })()}
                  </>
                )}
              </>
            )}

            {/* Existing paths */}
            {paths.map((path, index) => {
              const { main, accent } = crossStitchCombinations[selectedCrossStitchIndex]
              return (
                <React.Fragment key={index}>
                  {path.stitchType === "running" && (
                    <path d={path.path} fill="none" stroke={path.stroke} strokeWidth="3" strokeLinecap="round" />
                  )}
                  {path.stitchType === "chain" && (
                    <path
                      d={path.path}
                      fill="none"
                      stroke={path.stroke}
                      strokeWidth="3"
                      strokeDasharray="5 5"
                      strokeLinecap="round"
                    />
                  )}
                  {path.stitchType === "cross" && (
                    <>
                      {(() => {
                        const points = extractPointsFromPath(path.path)
                        if (points.length < 2) return null

                        const segmentLength = 20 // Length of each segment
                        let currentDistance = 0
                        let currentPoint = points[0]
                        let nextPointIndex = 1
                        let isMainSegment = true
                        const segments = []

                        while (nextPointIndex < points.length) {
                          const nextPoint = points[nextPointIndex]
                          const dx = nextPoint.x - currentPoint.x
                          const dy = nextPoint.y - currentPoint.y
                          const segmentDistance = Math.sqrt(dx * dx + dy * dy)

                          if (currentDistance + segmentDistance >= segmentLength) {
                            // Calculate the point at the end of this segment
                            const ratio = (segmentLength - currentDistance) / segmentDistance
                            const endX = currentPoint.x + dx * ratio
                            const endY = currentPoint.y + dy * ratio

                            // Add a segment
                            segments.push({
                              path: `M ${currentPoint.x} ${currentPoint.y} L ${endX} ${endY}`,
                              isMain: isMainSegment,
                            })

                            // Update for next segment
                            currentPoint = { x: endX, y: endY }
                            currentDistance = 0
                            isMainSegment = !isMainSegment
                          } else {
                            // Move to the next point
                            segments.push({
                              path: `M ${currentPoint.x} ${currentPoint.y} L ${nextPoint.x} ${nextPoint.y}`,
                              isMain: isMainSegment,
                            })

                            currentDistance += segmentDistance
                            currentPoint = nextPoint
                            nextPointIndex++

                            // If we've reached the segment length, switch colors
                            if (currentDistance >= segmentLength) {
                              currentDistance = 0
                              isMainSegment = !isMainSegment
                            }
                          }
                        }

                        return segments.map((segment, i) => (
                          <path
                            key={i}
                            d={segment.path}
                            fill="none"
                            stroke={segment.isMain ? main : accent}
                            strokeWidth="3"
                            strokeLinecap="butt"
                          />
                        ))
                      })()}
                    </>
                  )}
                </React.Fragment>
              )
            })}
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
