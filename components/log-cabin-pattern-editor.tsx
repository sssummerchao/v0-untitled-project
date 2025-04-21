"use client"

import { useState, useRef } from "react"
import { Shuffle, Download } from "lucide-react"
import FabricSelector, { FABRIC_TEXTURES } from "./fabric-selector"
// Import the working download function
import { downloadWithHtmlToImage } from "@/utils/html-to-image-download"

export default function LogCabinPatternEditor() {
  // State for selected shapes and fabric images
  const [selectedShapes, setSelectedShapes] = useState<string[]>([])
  const [shapeImages, setShapeImages] = useState<Record<string, string>>({})
  const svgRef = useRef<SVGSVGElement>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  // Define the shapes for the log cabin pattern based on the new SVG
  const shapes = [
    { id: "top-outer", type: "rect", x: 0, y: 0, width: 946, height: 135 },
    { id: "right-outer", type: "rect", x: 946, y: 0, width: 134, height: 1080 },
    { id: "left-outer", type: "rect", x: 0, y: 135, width: 136, height: 945 },
    { id: "bottom-outer", type: "rect", x: 136, y: 945, width: 810, height: 135 },
    { id: "top-inner", type: "rect", x: 136, y: 135, width: 675, height: 135 },
    { id: "right-inner", type: "rect", x: 811, y: 135, width: 135, height: 810 },
    { id: "left-inner", type: "rect", x: 136, y: 270, width: 135, height: 675 },
    { id: "bottom-inner", type: "rect", x: 271, y: 810, width: 540, height: 135 },
    { id: "left-inner-2", type: "rect", x: 271, y: 405, width: 135, height: 405 },
    { id: "top-inner-2", type: "rect", x: 271, y: 270, width: 405, height: 135 },
    { id: "right-inner-2", type: "rect", x: 676, y: 270, width: 135, height: 540 },
    { id: "bottom-inner-2", type: "rect", x: 406, y: 675, width: 270, height: 135 },
    { id: "center", type: "rect", x: 406, y: 405, width: 270, height: 270 },
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

  // Download the current pattern
  const handleDownload = async () => {
    if (!svgRef.current) return

    setIsDownloading(true)
    try {
      await downloadWithHtmlToImage(svgRef.current, "log-cabin-quilt")
    } catch (error) {
      console.error("Error downloading pattern:", error)
      alert("Failed to download pattern. Please try again.")
    } finally {
      setTimeout(() => {
        setIsDownloading(false)
      }, 1000) // Add a small delay to prevent rapid clicking
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start">
      <div className="flex flex-col items-center gap-6">
        {/* Random Fill button moved to the top */}
        <div className="w-full flex justify-center mb-2">
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

        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <svg
            ref={svgRef}
            width="408"
            height="408"
            viewBox="0 0 1080 1080"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ background: "white" }}
          >
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
                    width="1080"
                    height="1080"
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
                  strokeLinejoin="miter"
                  paintOrder="stroke fill"
                  onClick={() => handleShapeClick(shape.id)}
                  className="cursor-pointer hover:stroke-gray-400 transition-colors duration-200"
                />
              </g>
            ))}
          </svg>
        </div>

        {/* Fixed height selection info to prevent layout shifts */}
        <div className="text-sm text-gray-500 h-6">
          {selectedShapes.length === 0
            ? "No shapes selected"
            : `${selectedShapes.length} shape${selectedShapes.length > 1 ? "s" : ""} selected`}
        </div>

        {/* Controls with fixed minimum height - Clear Selected button removed */}
        <div className="flex gap-4 flex-wrap justify-center min-h-[60px]">
          <button
            onClick={handleDownload}
            className="bg-black text-white rounded-full flex items-center pr-6 pl-2 py-2 hover:opacity-90 transition-opacity"
          >
            <div className="bg-gray-200 rounded-full p-2 mr-3">
              <Download size={16} className="text-black" />
            </div>
            <span className="text-lg font-serif font-bold">{isDownloading ? "Generating..." : "Download PNG"}</span>
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
