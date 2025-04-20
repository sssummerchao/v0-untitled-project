"use client"

import { useState, useRef } from "react"
import { Shuffle } from "lucide-react"
import FabricSelector, { FABRIC_TEXTURES } from "./fabric-selector"

export default function BearPawsPatternEditor() {
  // State for selected shapes and fabric images
  const [selectedShapes, setSelectedShapes] = useState<string[]>([])
  const [shapeImages, setShapeImages] = useState<Record<string, string>>({})
  const svgRef = useRef<SVGSVGElement>(null)

  // Define the shapes for the bear paws pattern based on the SVG
  const shapes = [
    // Center square
    { id: "center-square", type: "rect", x: 175.445, y: 176.531, width: 60, height: 59 },

    // Corner squares
    { id: "bottom-left-square", type: "rect", x: 3.44531, y: 352.531, width: 56, height: 57 },
    { id: "bottom-right-square", type: "rect", x: 351.445, y: 352.531, width: 58, height: 57 },
    { id: "top-right-square", type: "rect", x: 351.445, y: 3.53125, width: 58, height: 57 },
    { id: "top-left-square", type: "rect", x: 2.44531, y: 3.53125, width: 58, height: 57 },

    // Triangular paths - top left paw
    { id: "top-left-1", type: "path", d: "M117.945 60.0312L59.9453 60.0313L59.9453 2.03125L117.945 60.0312Z" },
    { id: "top-left-2", type: "path", d: "M60.9453 119.031L2.94532 119.031L2.94531 61.0312L60.9453 119.031Z" },
    { id: "top-left-3", type: "path", d: "M60.9453 3.04297L118.945 3.04297L118.945 61.043L60.9453 3.04297Z" },
    { id: "top-left-4", type: "path", d: "M1.94531 60.0312L59.9453 60.0313L59.9453 118.031L1.94531 60.0312Z" },
    { id: "top-left-5", type: "path", d: "M1.94531 118.031L59.9453 118.031L59.9453 176.031L1.94531 118.031Z" },
    { id: "top-left-6", type: "path", d: "M175.945 60.0312L117.945 60.0313L117.945 2.03125L175.945 60.0312Z" },
    { id: "top-left-rect", type: "rect", x: 60.4453, y: 60.5312, width: 115, height: 116 },

    // Triangular paths - top right paw
    { id: "top-right-1", type: "path", d: "M409.945 60.043L409.945 118.043L351.945 118.043L409.945 60.043Z" },
    { id: "top-right-2", type: "path", d: "M293.945 61V3.00001H351.945L293.945 61Z" },
    { id: "top-right-3", type: "path", d: "M351.945 118.531L351.945 60.5313L409.945 60.5313L351.945 118.531Z" },
    { id: "top-right-4", type: "path", d: "M351.945 2.53125L351.945 60.5313L293.945 60.5312L351.945 2.53125Z" },
    { id: "top-right-5", type: "path", d: "M293.945 2.53125L293.945 60.5313L235.945 60.5312L293.945 2.53125Z" },
    { id: "top-right-6", type: "path", d: "M351.945 176.531L351.945 118.531L409.945 118.531L351.945 176.531Z" },
    {
      id: "top-right-rect",
      type: "rect",
      x: 351.445,
      y: 61.0312,
      width: 115,
      height: 116,
      transform: "rotate(90 351.445 61.0312)",
    },

    // Triangular paths - bottom right paw
    { id: "bottom-right-1", type: "path", d: "M350.945 294L408.945 294L408.945 352L350.945 294Z" },
    { id: "bottom-right-2", type: "path", d: "M351.945 410L293.945 410L293.945 352L351.945 410Z" },
    { id: "bottom-right-3", type: "path", d: "M293.445 352.031L351.445 352.031L351.445 410.031L293.445 352.031Z" },
    { id: "bottom-right-4", type: "path", d: "M409.445 352.031L351.445 352.031L351.445 294.031L409.445 352.031Z" },
    { id: "bottom-right-5", type: "path", d: "M409.445 294.031L351.445 294.031L351.445 236.031L409.445 294.031Z" },
    { id: "bottom-right-6", type: "path", d: "M235.445 352.031L293.445 352.031L293.445 410.031L235.445 352.031Z" },
    {
      id: "bottom-right-rect",
      type: "rect",
      x: 350.945,
      y: 351.531,
      width: 115,
      height: 116,
      transform: "rotate(-180 350.945 351.531)",
    },

    // Triangular paths - bottom left paw
    { id: "bottom-left-1", type: "path", d: "M116.945 352L116.945 410L58.9453 410L116.945 352Z" },
    { id: "bottom-left-2", type: "path", d: "M2 352L2 294H60L2 352Z" },
    {
      id: "bottom-left-3",
      type: "path",
      d: "M59.4453 294.031L59.4453 352.031L1.44531 352.031L59.4453 294.031Z",
    },
    { id: "bottom-left-4", type: "path", d: "M59.4453 410.031V352.031H117.445L59.4453 410.031Z" },
    { id: "bottom-left-5", type: "path", d: "M117.445 410.031V352.031H175.445L117.445 410.031Z" },
    { id: "bottom-left-6", type: "path", d: "M59.4453 236.031L59.4453 294.031L1.44531 294.031L59.4453 236.031Z" },
    {
      id: "bottom-left-rect",
      type: "rect",
      x: 59.9453,
      y: 351.531,
      width: 115,
      height: 116,
      transform: "rotate(-90 59.9453 351.531)",
    },

    // Large connecting paths
    { id: "left-connect", type: "path", d: "M3 292V118.5L60 176.5H175V236H60L3 292Z" },
    {
      id: "bottom-connect",
      type: "path",
      d: "M291 409L118 409L175.833 351.669L175.833 236L235.161 236L235.161 351.669L291 409Z",
    },
    { id: "right-connect", type: "path", d: "M408 120L408 293.5L351 235.5L236 235.5L236 176L351 176L408 120Z" },
    {
      id: "top-connect",
      type: "path",
      d: "M120 2.99999L294 3L235.833 60.3314L235.833 176L176.161 176L176.161 60.3314L120 2.99999Z",
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

  // Helper function to create SVG elements based on shape type
  const renderShape = (shape: any) => {
    if (shape.type === "rect") {
      return (
        <rect
          x={shape.x}
          y={shape.y}
          width={shape.width}
          height={shape.height}
          transform={shape.transform}
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
      )
    } else if (shape.type === "path") {
      return (
        <path
          d={shape.d}
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
      )
    }
    return null
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start">
      <div className="flex flex-col items-center gap-6">
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <svg
            ref={svgRef}
            width="412"
            height="412"
            viewBox="0 0 412 412"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ background: "white" }}
          >
            <rect
              x="0"
              y="0"
              width="412"
              height="412"
              rx="4.28915"
              fill="white"
              stroke="#C7C7C7"
              strokeWidth="1.51382"
            />

            {/* Define clip paths for each shape */}
            <defs>
              {shapes.map((shape) => {
                if (shape.type === "rect") {
                  return (
                    <clipPath key={`clip-${shape.id}`} id={`clip-${shape.id}`}>
                      <rect
                        x={shape.x}
                        y={shape.y}
                        width={shape.width}
                        height={shape.height}
                        transform={shape.transform}
                      />
                    </clipPath>
                  )
                } else if (shape.type === "path") {
                  return (
                    <clipPath key={`clip-${shape.id}`} id={`clip-${shape.id}`}>
                      <path d={shape.d} />
                    </clipPath>
                  )
                }
                return null
              })}
            </defs>

            {/* Render shapes with images if available */}
            {shapes.map((shape) => (
              <g key={shape.id}>
                {/* If this shape has an image, show it clipped to the shape */}
                {shape.id in shapeImages && (
                  <image
                    href={shapeImages[shape.id]}
                    width="412"
                    height="412"
                    preserveAspectRatio="xMidYMid slice"
                    clipPath={`url(#clip-${shape.id})`}
                  />
                )}

                {/* Selection overlay - show when shape is selected */}
                {selectedShapes.includes(shape.id) && (
                  <>
                    {shape.type === "rect" ? (
                      <rect
                        x={shape.x}
                        y={shape.y}
                        width={shape.width}
                        height={shape.height}
                        transform={shape.transform}
                        fill="white"
                        opacity="0.5"
                      />
                    ) : (
                      <path d={shape.d} fill="white" opacity="0.5" />
                    )}
                  </>
                )}

                {/* Shape outline and click area */}
                {renderShape(shape)}
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
