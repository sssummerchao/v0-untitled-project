"use client"

import { useState, useRef } from "react"
import { Shuffle } from "lucide-react"
import FabricSelector, { FABRIC_TEXTURES } from "./fabric-selector"

export default function NorthStarPatternEditor() {
  // State for selected shapes and fabric images
  const [selectedShapes, setSelectedShapes] = useState<string[]>([])
  const [shapeImages, setShapeImages] = useState<Record<string, string>>({})
  const svgRef = useRef<SVGSVGElement>(null)

  // Grid size
  const gridSize = 4
  const cellSize = 100
  const totalSize = gridSize * cellSize

  // Define the specific pattern layout
  const patternLayout = [
    ["empty", "\\", "/", "empty"],
    ["\\", "empty", "empty", "/"],
    ["/", "empty", "empty", "\\"],
    ["empty", "/", "\\", "empty"],
  ]

  // Generate shapes for the pattern
  const shapes = []

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      // Get the diagonal type from the layout
      const diagonalType = patternLayout[row][col]

      // Calculate coordinates
      const x = col * cellSize
      const y = row * cellSize

      // Each cell has a unique ID
      const cellId = `${row}-${col}`

      if (diagonalType === "\\") {
        // Top-left to bottom-right diagonal (\)
        const topTriangleId = `${row}-${col}-top`
        const bottomTriangleId = `${row}-${col}-bottom`

        shapes.push({
          id: topTriangleId,
          type: "triangle",
          points: `${x},${y} ${x + cellSize},${y} ${x + cellSize},${y + cellSize}`,
          isSelected: selectedShapes.includes(topTriangleId),
          hasImage: topTriangleId in shapeImages,
        })
        shapes.push({
          id: bottomTriangleId,
          type: "triangle",
          points: `${x},${y} ${x},${y + cellSize} ${x + cellSize},${y + cellSize}`,
          isSelected: selectedShapes.includes(bottomTriangleId),
          hasImage: bottomTriangleId in shapeImages,
        })
      } else if (diagonalType === "/") {
        // Top-right to bottom-left diagonal (/)
        const topTriangleId = `${row}-${col}-top`
        const bottomTriangleId = `${row}-${col}-bottom`

        shapes.push({
          id: topTriangleId,
          type: "triangle",
          points: `${x},${y} ${x + cellSize},${y} ${x},${y + cellSize}`,
          isSelected: selectedShapes.includes(topTriangleId),
          hasImage: topTriangleId in shapeImages,
        })
        shapes.push({
          id: bottomTriangleId,
          type: "triangle",
          points: `${x + cellSize},${y} ${x + cellSize},${y + cellSize} ${x},${y + cellSize}`,
          isSelected: selectedShapes.includes(bottomTriangleId),
          hasImage: bottomTriangleId in shapeImages,
        })
      } else {
        // Empty cell - add as a square shape
        shapes.push({
          id: cellId,
          type: "square",
          x: x,
          y: y,
          width: cellSize,
          height: cellSize,
          isSelected: selectedShapes.includes(cellId),
          hasImage: cellId in shapeImages,
        })
      }
    }
  }

  // Sort shapes to bring selected ones to the front
  const sortedShapes = [...shapes].sort((a, b) => {
    if (a.isSelected && !b.isSelected) return 1 // Selected shapes go last (rendered on top)
    if (!a.isSelected && b.isSelected) return -1 // Non-selected shapes go first
    return 0 // Keep original order for shapes with same selection state
  })

  // Handle shape selection
  const handleShapeClick = (id: string) => {
    // Always in multi-select mode, toggle the selection
    setSelectedShapes((prev) => (prev.includes(id) ? prev.filter((shapeId) => shapeId !== id) : [...prev, id]))
  }

  // Clear all selections
  const clearSelections = () => {
    setSelectedShapes([])
  }

  // Apply fabric to selected shapes
  const handleApplyFabric = (fabricKey: string) => {
    if (selectedShapes.length > 0) {
      const newShapeImages = { ...shapeImages }
      selectedShapes.forEach((shapeId) => {
        newShapeImages[shapeId] = FABRIC_TEXTURES[fabricKey as keyof typeof FABRIC_TEXTURES]
      })
      setShapeImages(newShapeImages)

      // Clear the selection after applying images
      setSelectedShapes([])
    }
  }

  // Clear images from selected shapes
  const clearSelectedImages = () => {
    if (selectedShapes.length === 0) return

    const newShapeImages = { ...shapeImages }
    selectedShapes.forEach((shapeId) => {
      delete newShapeImages[shapeId]
    })

    setShapeImages(newShapeImages)

    // Clear the selection after removing images
    setSelectedShapes([])
  }

  // Fill all shapes with random fabrics
  const fillRandomFabrics = () => {
    const fabricKeys = Object.keys(FABRIC_TEXTURES)
    const newShapeImages = { ...shapeImages }

    shapes.forEach((shape) => {
      // Select a random fabric
      const randomFabricKey = fabricKeys[Math.floor(Math.random() * fabricKeys.length)]
      newShapeImages[shape.id] = FABRIC_TEXTURES[randomFabricKey as keyof typeof FABRIC_TEXTURES]
    })

    setShapeImages(newShapeImages)
    setSelectedShapes([])
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start">
      <div className="flex flex-col items-center gap-6">
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <svg
            ref={svgRef}
            width={totalSize}
            height={totalSize}
            viewBox={`0 0 ${totalSize} ${totalSize}`}
            style={{ background: "white" }}
          >
            {/* Define clip paths for each shape */}
            <defs>
              {shapes.map((shape) => (
                <clipPath key={`clip-${shape.id}`} id={`clip-${shape.id}`}>
                  {shape.type === "triangle" ? (
                    <polygon points={shape.points} />
                  ) : (
                    <rect x={shape.x} y={shape.y} width={shape.width} height={shape.height} />
                  )}
                </clipPath>
              ))}
            </defs>

            {/* Grid lines */}
            {Array.from({ length: gridSize + 1 }).map((_, index) => (
              <line
                key={`vertical-${index}`}
                x1={index * cellSize}
                y1={0}
                x2={index * cellSize}
                y2={totalSize}
                stroke="#D0D0D0"
                strokeWidth="1"
              />
            ))}
            {Array.from({ length: gridSize + 1 }).map((_, index) => (
              <line
                key={`horizontal-${index}`}
                x1={0}
                y1={index * cellSize}
                x2={totalSize}
                y2={index * cellSize}
                stroke="#D0D0D0"
                strokeWidth="1"
              />
            ))}

            {/* Shapes */}
            {sortedShapes.map((shape) => (
              <g key={shape.id}>
                {/* If this shape has an image, show it clipped to the shape */}
                {shape.hasImage && (
                  <image
                    href={shapeImages[shape.id]}
                    width={totalSize}
                    height={totalSize}
                    preserveAspectRatio="xMidYMid slice"
                    clipPath={`url(#clip-${shape.id})`}
                  />
                )}

                {/* Selection overlay - show when shape is selected */}
                {shape.isSelected && (
                  <>
                    {shape.type === "triangle" ? (
                      <polygon points={shape.points} fill="white" opacity="0.5" clipPath={`url(#clip-${shape.id})`} />
                    ) : (
                      <rect
                        x={shape.x}
                        y={shape.y}
                        width={shape.width}
                        height={shape.height}
                        fill="white"
                        opacity="0.5"
                      />
                    )}
                  </>
                )}

                {/* Shape outline and click area */}
                {shape.type === "triangle" ? (
                  <polygon
                    points={shape.points}
                    fill={shape.isSelected && !shape.hasImage ? "#666" : "transparent"}
                    stroke={shape.isSelected ? "#000000" : "#D0D0D0"}
                    strokeWidth={shape.isSelected ? "2" : "1"}
                    onClick={() => handleShapeClick(shape.id)}
                    className="cursor-pointer hover:stroke-gray-400 transition-colors duration-200"
                    style={{ fillOpacity: shape.isSelected && !shape.hasImage ? 0.5 : 0 }}
                  />
                ) : (
                  <rect
                    x={shape.x}
                    y={shape.y}
                    width={shape.width}
                    height={shape.height}
                    fill={shape.isSelected && !shape.hasImage ? "#666" : "transparent"}
                    stroke={shape.isSelected ? "#000000" : "#D0D0D0"}
                    strokeWidth={shape.isSelected ? "2" : "1"}
                    onClick={() => handleShapeClick(shape.id)}
                    className="cursor-pointer hover:stroke-gray-400 transition-colors duration-200"
                    style={{ fillOpacity: shape.isSelected && !shape.hasImage ? 0.3 : 0 }}
                  />
                )}
              </g>
            ))}
          </svg>
        </div>

        {/* Selection info */}
        <div className="text-sm text-gray-500">
          {selectedShapes.length === 0
            ? "No shapes selected"
            : `${selectedShapes.length} shape${selectedShapes.length > 1 ? "s" : ""} selected`}
        </div>

        {/* Controls */}
        <div className="flex gap-4 flex-wrap justify-center">
          {selectedShapes.length > 0 && (
            <button
              onClick={clearSelectedImages}
              className="bg-white border border-gray-300 text-gray-700 rounded-full flex items-center pr-6 pl-2 py-2 hover:bg-gray-50 transition-colors"
            >
              <div className="bg-gray-200 rounded-full p-2 mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-black"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="text-lg font-serif font-bold">Clear Selected</span>
            </button>
          )}

          <button
            onClick={fillRandomFabrics}
            className="bg-black text-white rounded-full flex items-center pr-6 pl-2 py-2 hover:opacity-90 transition-opacity"
          >
            <div className="bg-gray-200 rounded-full p-2 mr-3">
              <Shuffle size={16} className="text-black" />
            </div>
            <span className="text-lg font-serif font-bold">Random Fill</span>
          </button>
        </div>
      </div>

      {/* Fabric selector - now side by side */}
      <div className="w-full md:w-auto md:flex-1">
        <FabricSelector selectedShapes={selectedShapes} onApplyFabric={handleApplyFabric} />
      </div>
    </div>
  )
}
