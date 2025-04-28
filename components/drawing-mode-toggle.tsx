"use client"

import React, { useEffect } from "react"

import { useState, useRef } from "react"
import { Pencil, MousePointer, X, Undo2, Redo2, Trash2 } from "lucide-react"

interface DrawingModeToggleProps {
  svgRef: React.RefObject<SVGSVGElement>
  viewBox?: string
  onModeChange?: (isDrawingMode: boolean) => void
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

export default function DrawingModeToggle({ svgRef, viewBox, onModeChange }: DrawingModeToggleProps) {
  const [isDrawingMode, setIsDrawingMode] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const [showDrawingPanel, setShowDrawingPanel] = useState(false)
  const [currentPath, setCurrentPath] = useState<string>("")
  const [paths, setPaths] = useState<{ path: string; stroke: string; stitchType: StitchType; strokeWidth: string }[]>(
    [],
  )
  const [undoStack, setUndoStack] = useState<
    { path: string; stroke: string; stitchType: StitchType; strokeWidth: string }[]
  >([])
  const [stitchType, setStitchType] = useState<StitchType>("running")
  const [strokeColor, setStrokeColor] = useState<string>("#251e1d")
  const [strokeWidth, setStrokeWidth] = useState<string>("3")
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

    // Add the new path to the paths array
    setPaths((prev) => [
      ...prev,
      {
        path: currentPath,
        stroke: strokeColor,
        stitchType: stitchType,
        strokeWidth: strokeWidth,
      },
    ])

    // Clear the undo stack when a new path is added
    setUndoStack([])

    setIsDrawing(false)
    setCurrentPath("")
  }

  // Undo the last drawing
  const handleUndo = () => {
    if (paths.length === 0) return

    // Remove the last path and add it to the undo stack
    const lastPath = paths[paths.length - 1]
    setPaths((prev) => prev.slice(0, -1))
    setUndoStack((prev) => [...prev, lastPath])
  }

  // Redo the last undone drawing
  const handleRedo = () => {
    if (undoStack.length === 0) return

    // Remove the last item from the undo stack and add it back to the paths
    const lastUndone = undoStack[undoStack.length - 1]
    setUndoStack((prev) => prev.slice(0, -1))
    setPaths((prev) => [...prev, lastUndone])
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
    paths.forEach(({ path, stroke, stitchType, strokeWidth }) => {
      if (stitchType === "running") {
        // Running stitch (solid line)
        const pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path")
        pathElement.setAttribute("d", path)
        pathElement.setAttribute("fill", "none")
        pathElement.setAttribute("stroke", stroke)
        pathElement.setAttribute("stroke-width", strokeWidth)
        pathElement.setAttribute("stroke-linecap", "round")
        drawingGroup.appendChild(pathElement)
      } else if (stitchType === "chain") {
        // Chain stitch (dashed line with rounded caps)
        const pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path")
        pathElement.setAttribute("d", path)
        pathElement.setAttribute("fill", "none")
        pathElement.setAttribute("stroke", stroke)
        pathElement.setAttribute("stroke-width", strokeWidth)
        pathElement.setAttribute("stroke-dasharray", "5 5")
        pathElement.setAttribute("stroke-linecap", "round")
        drawingGroup.appendChild(pathElement)
      } else if (stitchType === "cross") {
        // Cross stitch (alternating main and accent segments)
        const points = extractPointsFromPath(path)
        if (points.length < 2) return

        // Find the color combination based on the stroke color
        const colorIndex = crossStitchCombinations.findIndex((combo) => combo.main === stroke)
        const colorCombo = colorIndex >= 0 ? crossStitchCombinations[colorIndex] : { main: stroke, accent: "#89a3cb" }

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
            segmentPath.setAttribute("stroke", isMainSegment ? colorCombo.main : colorCombo.accent)
            segmentPath.setAttribute("stroke-width", strokeWidth)
            segmentPath.setAttribute("stroke-linecap", "butt")
            drawingGroup.appendChild(segmentPath)

            // Update for next segment
            currentPoint = { x: endX, y: endY }
            currentDistance = 0
            isMainSegment = !isMainSegment
          } else {
            // Move to the next point
            const segmentPath = document.createElementNS("http://www.w3.org/2000/svg", "path")
            segmentPath.setAttribute("d", `M ${currentPoint.x} ${currentPoint.y} L ${nextPoint.x} ${nextPoint.y}`)
            segmentPath.setAttribute("fill", "none")
            segmentPath.setAttribute("stroke", isMainSegment ? colorCombo.main : colorCombo.accent)
            segmentPath.setAttribute("stroke-width", strokeWidth)
            segmentPath.setAttribute("stroke-linecap", "butt")
            drawingGroup.appendChild(segmentPath)

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
    "#251e1d", // Dark brown/black
    "#842735", // Burgundy
    "#ef9929", // Orange
    "#daccb8", // Beige
    "#89a3cb", // Light blue
    "#b79ec2", // Lavender
    "#35405a", // Navy blue
    "#5d6341", // Olive green
  ]

  // Update the selected cross stitch color combination when the stroke color changes
  useEffect(() => {
    const index = colorOptions.indexOf(strokeColor)
    if (index !== -1) {
      setSelectedCrossStitchIndex(index)
    }
  }, [strokeColor])

  // Render stitch preview based on type
  const renderStitchPreview = (type: StitchType) => {
    switch (type) {
      case "running":
        return (
          <div className="w-full h-4 flex items-center">
            <div className="w-full h-3 bg-black rounded-full"></div>
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
        const colorCombo = crossStitchCombinations[selectedCrossStitchIndex]
        return (
          <div className="w-full h-4 flex items-center">
            <div className="w-[20%] h-2" style={{ backgroundColor: colorCombo.main }}></div>
            <div className="w-[10%] h-2" style={{ backgroundColor: colorCombo.accent }}></div>
            <div className="w-[20%] h-2" style={{ backgroundColor: colorCombo.main }}></div>
            <div className="w-[10%] h-2" style={{ backgroundColor: colorCombo.accent }}></div>
            <div className="w-[20%] h-2" style={{ backgroundColor: colorCombo.main }}></div>
            <div className="w-[10%] h-2" style={{ backgroundColor: colorCombo.accent }}></div>
            <div className="w-[10%] h-2" style={{ backgroundColor: colorCombo.main }}></div>
          </div>
        )
    }
  }

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

              {/* Stroke Width Selector */}
              <div className="flex items-center space-x-2">
                <span className="text-sm">Width:</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={strokeWidth}
                    onChange={(e) => setStrokeWidth(e.target.value)}
                    className="w-24"
                  />
                  <span className="text-sm">{strokeWidth}px</span>
                </div>
              </div>

              {/* Undo/Redo buttons */}
              <div className="flex space-x-2">
                <button
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center"
                  onClick={handleUndo}
                  disabled={paths.length === 0}
                >
                  <Undo2 size={16} className="mr-1" />
                  Undo
                </button>
                <button
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center"
                  onClick={handleRedo}
                  disabled={undoStack.length === 0}
                >
                  <Redo2 size={16} className="mr-1" />
                  Redo
                </button>
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
                  <>
                    {stitchType === "running" && (
                      <path
                        d={currentPath}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                      />
                    )}
                    {stitchType === "chain" && (
                      <path
                        d={currentPath}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        strokeDasharray="5 5"
                        strokeLinecap="round"
                      />
                    )}
                    {stitchType === "cross" && (
                      <>
                        {(() => {
                          const points = extractPointsFromPath(currentPath)
                          if (points.length < 2) return null

                          const colorCombo = crossStitchCombinations[selectedCrossStitchIndex]
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
                              stroke={segment.isMain ? colorCombo.main : colorCombo.accent}
                              strokeWidth={strokeWidth}
                              strokeLinecap="butt"
                            />
                          ))
                        })()}
                      </>
                    )}
                  </>
                )}

                {/* Existing paths */}
                {paths.map((path, index) => (
                  <React.Fragment key={index}>
                    {path.stitchType === "running" && (
                      <path
                        d={path.path}
                        fill="none"
                        stroke={path.stroke}
                        strokeWidth={path.strokeWidth}
                        strokeLinecap="round"
                      />
                    )}
                    {path.stitchType === "chain" && (
                      <path
                        d={path.path}
                        fill="none"
                        stroke={path.stroke}
                        strokeWidth={path.strokeWidth}
                        strokeDasharray="5 5"
                        strokeLinecap="round"
                      />
                    )}
                    {path.stitchType === "cross" && (
                      <>
                        {(() => {
                          const points = extractPointsFromPath(path.path)
                          if (points.length < 2) return null

                          // Find the color combination based on the stroke color
                          const colorIndex = crossStitchCombinations.findIndex((combo) => combo.main === path.stroke)
                          const colorCombo =
                            colorIndex >= 0
                              ? crossStitchCombinations[colorIndex]
                              : { main: path.stroke, accent: "#89a3cb" }

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
                              stroke={segment.isMain ? colorCombo.main : colorCombo.accent}
                              strokeWidth={path.strokeWidth}
                              strokeLinecap="butt"
                            />
                          ))
                        })()}
                      </>
                    )}
                  </React.Fragment>
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
