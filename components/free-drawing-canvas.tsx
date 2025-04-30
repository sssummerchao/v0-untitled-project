"use client"

import React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Undo2, Redo2 } from "lucide-react"

// Update the interface to include defaultStrokeWidth prop
interface FreeDrawingCanvasProps {
  svgRef: React.RefObject<SVGSVGElement>
  viewBox: string
  isActive?: boolean
  style?: React.CSSProperties
  defaultStrokeWidth?: string
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

// Update the function signature to include the new prop with a default value
export default function FreeDrawingCanvas({
  svgRef,
  viewBox,
  isActive = false,
  style,
  defaultStrokeWidth = "3",
}: FreeDrawingCanvasProps) {
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentPath, setCurrentPath] = useState<string>("")
  const [paths, setPaths] = useState<{ path: string; stroke: string; stitchType: StitchType }[]>([])
  const [undoStack, setUndoStack] = useState<{ path: string; stroke: string; stitchType: StitchType }[]>([])
  const [stitchType, setStitchType] = useState<StitchType>("running")
  const [strokeColor, setStrokeColor] = useState<string>("#251e1d")
  const [selectedCrossStitchIndex, setSelectedCrossStitchIndex] = useState(0)
  const canvasRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<SVGSVGElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [drawingGroupId] = useState(`drawing-group-${Math.random().toString(36).substring(2, 9)}`)
  const [defaultPositionSet, setDefaultPositionSet] = useState(false)

  // Define stroke width as a state variable so it can be used consistently
  const [strokeWidth, setStrokeWidth] = useState<string>("3")

  // State for draggable menu
  const [menuPosition, setMenuPosition] = useState({ x: 180, y: 0 }) // Y will be calculated on mount
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [hasBeenDragged, setHasBeenDragged] = useState(false)

  // Calculate and set the default position on mount
  useEffect(() => {
    if (defaultPositionSet) return

    // Set a fixed position that works well for most screens
    const calculateFixedPosition = () => {
      // Get the viewport dimensions
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      // Position the menu on the left side of the screen
      const xPosition = 20 // 20px from the left edge

      // Center vertically
      const menuHeight = 500 // The height of our menu
      const yPosition = (viewportHeight - menuHeight) / 2

      setMenuPosition({ x: xPosition, y: yPosition })
      setDefaultPositionSet(true)
    }

    calculateFixedPosition()

    // Recalculate if window is resized
    const handleResize = () => {
      calculateFixedPosition()
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [defaultPositionSet])

  // Extract viewBox dimensions
  const viewBoxDimensions = viewBox.split(" ").map(Number)
  const svgWidth = viewBoxDimensions[2]
  const svgHeight = viewBoxDimensions[3]

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
    paths.forEach(({ path, stroke, stitchType }) => {
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
  }, [paths, svgRef, drawingGroupId, strokeWidth])

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

  // Create a function to get the SVG point from a mouse or touch event
  const getSVGPoint = (
    event: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent,
  ): { x: number; y: number } | null => {
    if (!svgRef.current) return null

    try {
      // Get the client coordinates
      let clientX, clientY
      if ((event as TouchEvent).touches) {
        clientX = (event as TouchEvent).touches[0].clientX
        clientY = (event as TouchEvent).touches[0].clientY
      } else {
        clientX = (event as MouseEvent).clientX
        clientY = (event as MouseEvent).clientY
      }

      // Use the SVG's built-in methods for accurate coordinate transformation
      const svg = svgRef.current
      const point = svg.createSVGPoint()
      point.x = clientX
      point.y = clientY

      // Get the current transformation matrix
      const screenCTM = svg.getScreenCTM()
      if (!screenCTM) return null

      // Transform the point from screen coordinates to SVG coordinates
      const svgPoint = point.matrixTransform(screenCTM.inverse())

      return { x: svgPoint.x, y: svgPoint.y }
    } catch (error) {
      console.error("Error getting SVG point:", error)
      return null
    }
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

    // Add the new path to the paths array
    setPaths((prev) => [
      ...prev,
      {
        path: currentPath,
        stroke: strokeColor,
        stitchType: stitchType,
      },
    ])

    // Clear the undo stack when a new path is added
    setUndoStack([])

    setIsDrawing(false)
    setCurrentPath("")
  }

  // Undo the last drawing
  const handleUndo = useCallback(() => {
    if (paths.length === 0) return

    // Remove the last path and add it to the undo stack
    const lastPath = paths[paths.length - 1]
    setPaths((prev) => prev.slice(0, -1))
    setUndoStack((prev) => [...prev, lastPath])
  }, [paths])

  // Redo the last undone drawing
  const handleRedo = useCallback(() => {
    if (undoStack.length === 0) return

    // Remove the last item from the undo stack and add it back to the paths
    const lastUndone = undoStack[undoStack.length - 1]
    setUndoStack((prev) => prev.slice(0, -1))
    setPaths((prev) => [...prev, lastUndone])
  }, [undoStack])

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

  // Position the overlay exactly over the main SVG
  useEffect(() => {
    if (!overlayRef.current || !svgRef.current || !canvasRef.current) return

    const positionOverlay = () => {
      try {
        // Get the main SVG's position and dimensions
        const mainSvgRect = svgRef.current.getBoundingClientRect()
        const parentRect = svgRef.current.parentElement?.getBoundingClientRect() || { left: 0, top: 0 }

        // Calculate the offset relative to the parent
        const offsetLeft = mainSvgRect.left - parentRect.left
        const offsetTop = mainSvgRect.top - parentRect.top

        // Position the canvas container exactly over the main SVG
        canvasRef.current.style.position = "absolute"
        canvasRef.current.style.left = `${offsetLeft}px`
        canvasRef.current.style.top = `${offsetTop}px`
        canvasRef.current.style.width = `${mainSvgRect.width}px`
        canvasRef.current.style.height = `${mainSvgRect.height}px`
        canvasRef.current.style.pointerEvents = isActive ? "auto" : "none"
        canvasRef.current.style.zIndex = isActive ? "20" : "-1" // Ensure higher z-index when active

        // Set the overlay SVG to the same dimensions
        overlayRef.current.setAttribute("width", `${mainSvgRect.width}`)
        overlayRef.current.setAttribute("height", `${mainSvgRect.height}`)

        // Ensure the viewBox is exactly the same
        overlayRef.current.setAttribute("viewBox", svgRef.current.getAttribute("viewBox") || viewBox)

        // Use the same preserveAspectRatio attribute
        overlayRef.current.setAttribute(
          "preserveAspectRatio",
          svgRef.current.getAttribute("preserveAspectRatio") || "xMidYMid meet",
        )
      } catch (error) {
        console.error("Error positioning overlay:", error)
      }
    }

    // Position initially and on resize
    positionOverlay()
    window.addEventListener("resize", positionOverlay)

    // Also reposition when active state changes
    const observer = new MutationObserver(positionOverlay)
    observer.observe(svgRef.current, { attributes: true, attributeFilter: ["transform"] })

    return () => {
      window.removeEventListener("resize", positionOverlay)
      observer.disconnect()
    }
  }, [svgRef, isActive, viewBox])

  // Update the selected cross stitch color combination when the stroke color changes
  useEffect(() => {
    const index = colorOptions.indexOf(strokeColor)
    if (index !== -1) {
      setSelectedCrossStitchIndex(index)
    }
  }, [strokeColor])

  // Add keyboard shortcuts for undo/redo
  useEffect(() => {
    if (!isActive) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if the drawing panel is active
      if (!isActive) return

      // Undo: Ctrl+Z or Command+Z
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault()
        handleUndo()
      }

      // Redo: Ctrl+Y or Command+Y or Ctrl+Shift+Z or Command+Shift+Z
      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault()
        handleRedo()
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "z") {
        e.preventDefault()
        handleRedo()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isActive, handleUndo, handleRedo])

  // Draggable menu handlers
  // Add a function to disable page scrolling during drag operations
  const disablePageScroll = () => {
    document.body.style.overflow = "hidden"
    document.documentElement.style.overflow = "hidden"
    document.body.style.position = "fixed"
    document.body.style.width = "100%"
    document.body.style.top = `-${window.scrollY}px`
    document.body.dataset.scrollY = window.scrollY.toString()
  }

  // Add a function to re-enable page scrolling after drag operations
  const enablePageScroll = () => {
    document.body.style.overflow = ""
    document.documentElement.style.overflow = ""
    document.body.style.position = ""
    document.body.style.width = ""
    const scrollY = document.body.dataset.scrollY || "0"
    window.scrollTo(0, Number.parseInt(scrollY))
    document.body.style.top = ""
    delete document.body.dataset.scrollY
  }

  // Update the handleDragStart function to disable scrolling
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Disable page scrolling
    disablePageScroll()

    let clientX, clientY
    if ("touches" in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    // Calculate the offset from the mouse position to the menu's top-left corner
    const menuRect = menuRef.current?.getBoundingClientRect()
    if (!menuRect) return

    setDragOffset({
      x: clientX - menuRect.left,
      y: clientY - menuRect.top,
    })

    setIsDragging(true)
  }

  // Update the handleDragEnd function to re-enable scrolling
  const handleDragEnd = () => {
    setIsDragging(false)
    setHasBeenDragged(true)

    // Re-enable page scrolling
    enablePageScroll()
  }

  // Update the handleDragMove function to prevent default behavior
  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return
    e.preventDefault()
    e.stopPropagation()

    let clientX, clientY
    if ("touches" in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    // Calculate new position based on mouse position and initial offset
    const newX = clientX - dragOffset.x
    const newY = clientY - dragOffset.y

    setMenuPosition({ x: newX, y: newY })
  }

  // Add and remove event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleDragMove)
      window.addEventListener("touchmove", handleDragMove)
      window.addEventListener("mouseup", handleDragEnd)
      window.addEventListener("touchend", handleDragEnd)
    } else {
      window.removeEventListener("mousemove", handleDragMove)
      window.removeEventListener("touchmove", handleDragMove)
      window.removeEventListener("mouseup", handleDragEnd)
      window.removeEventListener("touchend", handleDragEnd)
    }

    return () => {
      window.removeEventListener("mousemove", handleDragMove)
      window.removeEventListener("touchmove", handleDragMove)
      window.removeEventListener("mouseup", handleDragEnd)
      window.removeEventListener("touchend", handleDragEnd)

      // Ensure scrolling is re-enabled when component unmounts
      if (document.body.style.overflow === "hidden") {
        enablePageScroll()
      }
    }
  }, [isDragging])

  if (!isActive) return null

  return (
    <>
      {/* Draggable drawing tools panel */}
      <div
        ref={menuRef}
        className="fixed z-20 bg-white rounded-lg shadow-lg"
        style={{
          left: `${menuPosition.x}px`,
          top: `${menuPosition.y}px`,
          width: "120px",
          height: "auto", // Changed from fixed height to auto to accommodate all content
          overflowY: "auto",
        }}
      >
        {/* Simple header with title */}
        <div className="h-8 flex items-center justify-center bg-gray-100 rounded-t-lg">
          <h3 className="text-sm font-medium">Drawing Tools</h3>
        </div>

        <div className="p-3">
          {/* Color selector - as per the design */}
          <div className="mb-4">
            <h3 className="text-xl font-normal mb-2 text-center">Color:</h3>
            <div className="grid grid-cols-2 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  className={`w-10 h-10 rounded-full border ${strokeColor === color ? "ring-2 ring-blue-500" : ""}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setStrokeColor(color)}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Stitch style options */}
          <div className="mb-4">
            <h3 className="text-xl font-normal mb-2 text-center">Stitch:</h3>
            <div className="flex flex-col gap-2">
              {/* Running stitch */}
              <button
                className={`p-2 rounded-lg ${stitchType === "running" ? "bg-blue-100" : "bg-gray-100 hover:bg-gray-200"}`}
                onClick={() => setStitchType("running")}
                title="Running Stitch"
              >
                <div className="w-full h-2 flex items-center justify-center">
                  <div className="w-full h-1 bg-black rounded-full"></div>
                </div>
              </button>

              {/* Chain stitch */}
              <button
                className={`p-2 rounded-lg ${stitchType === "chain" ? "bg-blue-100" : "bg-gray-100 hover:bg-gray-200"}`}
                onClick={() => setStitchType("chain")}
                title="Chain Stitch"
              >
                <div className="w-full h-2 flex items-center justify-between">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 bg-black rounded-full"></div>
                  ))}
                </div>
              </button>

              {/* Cross stitch */}
              <button
                className={`p-2 rounded-lg ${stitchType === "cross" ? "bg-blue-100" : "bg-gray-100 hover:bg-gray-200"}`}
                onClick={() => setStitchType("cross")}
                title="Cross Stitch"
              >
                <div className="w-full h-2 flex items-center">
                  <div className="w-[20%] h-1.5 bg-black"></div>
                  <div className="w-[10%] h-1.5 bg-[#89a3cb]"></div>
                  <div className="w-[20%] h-1.5 bg-black"></div>
                  <div className="w-[10%] h-1.5 bg-[#89a3cb]"></div>
                  <div className="w-[20%] h-1.5 bg-black"></div>
                  <div className="w-[10%] h-1.5 bg-[#89a3cb]"></div>
                  <div className="w-[10%] h-1.5 bg-black"></div>
                </div>
              </button>
            </div>
          </div>

          {/* Stroke Width Control */}
          <div className="mb-4">
            <h3 className="text-xl font-normal mb-2 text-center">Width:</h3>
            <div className="flex flex-col items-center">
              <input
                type="range"
                min="1"
                max="10"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(e.target.value)}
                className="w-full mb-1"
              />
              <span className="text-sm">{strokeWidth}px</span>
            </div>
          </div>

          {/* Undo/Redo section */}
          <div className="mb-4">
            <h3 className="text-xl font-normal mb-2 text-center">Edit:</h3>
            <div className="flex justify-between">
              <button
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center justify-center w-[48%]"
                onClick={handleUndo}
                disabled={paths.length === 0}
                title="Undo (Ctrl+Z)"
              >
                <Undo2 size={16} className="mr-1" />
                <span className="text-sm">Undo</span>
              </button>
              <button
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center justify-center w-[48%]"
                onClick={handleRedo}
                disabled={undoStack.length === 0}
                title="Redo (Ctrl+Y)"
              >
                <Redo2 size={16} className="mr-1" />
                <span className="text-sm">Redo</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Drawing canvas overlay - positioned exactly over the SVG */}
      <div
        ref={canvasRef}
        className="absolute cursor-crosshair"
        style={{
          zIndex: 10,
        }}
      >
        {/* Overlay SVG for real-time drawing visualization */}
        <svg
          ref={overlayRef}
          viewBox={viewBox}
          preserveAspectRatio="xMidYMid meet"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: isActive ? "auto" : "none",
            zIndex: isActive ? 20 : -1, // Increase z-index to ensure visibility
            ...style,
          }}
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
                <path d={path.path} fill="none" stroke={path.stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
              )}
              {path.stitchType === "chain" && (
                <path
                  d={path.path}
                  fill="none"
                  stroke={path.stroke}
                  strokeWidth={strokeWidth}
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
                      colorIndex >= 0 ? crossStitchCombinations[colorIndex] : { main: path.stroke, accent: "#89a3cb" }

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
            </React.Fragment>
          ))}
        </svg>
      </div>
    </>
  )
}
