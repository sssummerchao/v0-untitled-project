"use client"

import { useState, useRef } from "react"
import { Shuffle } from "lucide-react"
import FabricSelector, { FABRIC_TEXTURES } from "./fabric-selector"

export default function LogCabinPatternEditor() {
  // State for selected shapes and fabric images
  const [selectedShapes, setSelectedShapes] = useState<string[]>([])
  const [shapeImages, setShapeImages] = useState<Record<string, string>>({})
  const svgRef = useRef<SVGSVGElement>(null)

  // Define the shapes for the log cabin pattern based on the SVG
  const shapes = [
    // Top horizontal rectangles
    { id: "top-outer", x: 0.5, y: 0.5, width: 327, height: 79 },
    { id: "top-inner", x: 80.5, y: 80.5, width: 167, height: 79 },

    // Right vertical rectangles
    { id: "right-inner", x: 248.5, y: 80.5, width: 79, height: 166 },
    { id: "right-outer", x: 328.5, y: 0.5, width: 79, height: 325 },

    // Bottom horizontal rectangles
    { id: "bottom-inner", x: 160.5, y: 246.5, width: 167, height: 79 },
    { id: "bottom-outer", x: 80.5, y: 326.5, width: 327, height: 79 },

    // Left vertical rectangles
    { id: "left-inner", x: 80.5, y: 160.5, width: 79, height: 166 },
    { id: "left-outer", x: 0.5, y: 80.5, width: 79, height: 325 },

    // Center square (not explicitly shown in SVG but implied)
    { id: "center", x: 160.5, y: 160.5, width: 87, height: 85 },
  ]

  // Handle shape selection
  const handleShapeClick = (id: string) => {
    setSelectedShapes((prev) => (prev.includes(id) ? prev.filter((shapeId) => shapeId !== id) : [...prev, id]))
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
            width="408"
            height="408"
            viewBox="0 0 408 408"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ background: "white" }}
          >
            <rect
              x="0.756909"
              y="0.756909"
              width="406.486"
              height="406.486"
              rx="4.28915"
              fill="white"
              stroke="#C7C7C7"
              strokeWidth="1.51382"
            />

            {/* Define clip paths for each shape */}
            <defs>
              {shapes.map((shape) => (
                <clipPath key={`clip-${shape.id}`} id={`clip-${shape.id}`}>
                  <rect x={shape.x} y={shape.y} width={shape.width} height={shape.height} />
                </clipPath>
              ))}
            </defs>

            {/* Shapes */}
            {shapes.map((shape) => (
              <g key={shape.id}>
                {/* If this shape has an image, show it clipped to the shape */}
                {shape.id in shapeImages && (
                  <image
                    href={shapeImages[shape.id]}
                    width="408"
                    height="408"
                    preserveAspectRatio="xMidYMid slice"
                    clipPath={`url(#clip-${shape.id})`}
                  />
                )}

                {/* Selection overlay - show when shape is selected */}
                {selectedShapes.includes(shape.id) && (
                  <rect x={shape.x} y={shape.y} width={shape.width} height={shape.height} fill="white" opacity="0.5" />
                )}

                {/* Shape outline and click area */}
                <rect
                  x={shape.x}
                  y={shape.y}
                  width={shape.width}
                  height={shape.height}
                  fill={
                    selectedShapes.includes(shape.id)
                      ? shape.id in shapeImages
                        ? "transparent"
                        : "rgba(0,0,0,0.1)"
                      : "transparent"
                  }
                  stroke={shape.id in shapeImages ? "none" : selectedShapes.includes(shape.id) ? "#000000" : "#D0D0D0"}
                  strokeWidth={selectedShapes.includes(shape.id) ? "2" : "1"}
                  onClick={() => handleShapeClick(shape.id)}
                  className="cursor-pointer hover:stroke-gray-400 transition-colors duration-200"
                />
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
