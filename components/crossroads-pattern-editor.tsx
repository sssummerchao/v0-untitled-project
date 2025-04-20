"use client"

import { useState, useRef } from "react"
import { Shuffle } from "lucide-react"
import FabricSelector, { FABRIC_TEXTURES } from "./fabric-selector"

export default function CrossroadsPatternEditor() {
  // State for selected shapes and fabric images
  const [selectedShapes, setSelectedShapes] = useState<string[]>([])
  const [shapeImages, setShapeImages] = useState<Record<string, string>>({})
  const svgRef = useRef<SVGSVGElement>(null)

  // Define all shapes based on the SVG
  const shapes = [
    // Five main diamonds (rotated rectangles) - including the center one
    {
      id: "top-left",
      type: "polygon",
      points: "101.676,201.414 202.749,100.234 304.514,202.749 202.749,302.255",
    },
    {
      id: "top-right",
      type: "polygon",
      points: "303.906,202.406 404.75,102.512 506.238,202.02 406.001,304.534",
    },
    {
      id: "bottom-left",
      type: "polygon",
      points: "102.668,403.641 202.749,302.255 305.236,405.021 205,505.257",
    },
    {
      id: "bottom-right",
      type: "polygon",
      points: "305.891,405.625 406.001,304.534 506.238,404.77 407.75,507.535",
    },
    {
      id: "center",
      type: "polygon",
      points: "203.707,303.391 304.514,202.749 406.001,304.534 305.236,405.021",
    },

    // Four triangles between diamonds
    {
      id: "left",
      type: "polygon",
      points: "100.234,404.77 202.749,302.255 102.512,202.019",
    },
    {
      id: "bottom",
      type: "polygon",
      points: "407.75,507.535 305.236,405.021 205,505.257",
    },
    {
      id: "right",
      type: "polygon",
      points: "508.516,202.02 406.001,304.534 506.238,404.77",
    },
    {
      id: "top",
      type: "polygon",
      points: "202,100.234 304.514,202.749 404.75,102.512",
    },

    // Four corner triangles
    {
      id: "top-left-corner",
      type: "polygon",
      points: "203,100 101,100 101,201",
    },
    {
      id: "bottom-left-corner",
      type: "polygon",
      points: "103,404 103,506 204,506",
    },
    {
      id: "bottom-right-corner",
      type: "polygon",
      points: "405,508 507,508 507,407",
    },
    {
      id: "top-right-corner",
      type: "polygon",
      points: "507,203 507,101 406,101",
    },
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

  // Scale the SVG coordinates to fit within 408x408
  const scaleCoordinates = (points: string) => {
    // Original SVG is 609x608 with content centered at 101.726,100.78 with width/height 406.486
    // We need to scale and center this to fit in 408x408

    // Parse the points
    const pointPairs = points.split(" ").map((pair) => {
      const [x, y] = pair.split(",").map(Number)

      // Scale the coordinates to fit in 408x408
      // First shift to origin (subtract the top-left corner coordinates)
      const shiftedX = x - 101.726
      const shiftedY = y - 100.78

      // Then scale to fit in 408x408
      const scaledX = (shiftedX / 406.486) * 408
      const scaledY = (shiftedY / 406.486) * 408

      return `${scaledX.toFixed(2)},${scaledY.toFixed(2)}`
    })

    return pointPairs.join(" ")
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
              x="0"
              y="0"
              width="408"
              height="408"
              rx="4.28915"
              fill="white"
              stroke="#C7C7C7"
              strokeWidth="1.51382"
            />

            {/* Define clip paths for each shape */}
            <defs>
              {shapes.map((shape) => (
                <clipPath key={`clip-${shape.id}`} id={`clip-${shape.id}`}>
                  <polygon points={scaleCoordinates(shape.points)} />
                </clipPath>
              ))}
            </defs>

            {/* Render shapes with images if available */}
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
                  <polygon
                    points={scaleCoordinates(shape.points)}
                    fill="white"
                    opacity="0.5"
                    clipPath={`url(#clip-${shape.id})`}
                  />
                )}

                {/* Shape outline and click area */}
                <polygon
                  points={scaleCoordinates(shape.points)}
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
