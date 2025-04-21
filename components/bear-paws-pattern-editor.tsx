"use client"

import { useState, useRef } from "react"
import { Shuffle, Download } from "lucide-react"
import FabricSelector, { FABRIC_TEXTURES } from "./fabric-selector"

// Import the working download function
import { downloadWithHtmlToImage } from "@/utils/html-to-image-download"

export default function BearPawsPatternEditor() {
  // State for selected shapes and fabric images
  const [selectedShapes, setSelectedShapes] = useState<string[]>([])
  const [shapeImages, setShapeImages] = useState<Record<string, string>>({})
  const [isDownloading, setIsDownloading] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)

  // Define the shapes for the bear paws pattern based on the new SVG
  const shapes = [
    // Center square
    { id: "center-square", type: "rect", x: 462.86, y: 462.86, width: 154.29, height: 154.29 },

    // Four paw squares
    { id: "top-left-paw", type: "rect", x: 154.29, y: 154.29, width: 308.57, height: 308.57 },
    { id: "bottom-left-paw", type: "rect", x: 154.29, y: 617.14, width: 308.57, height: 308.57 },
    { id: "top-right-paw", type: "rect", x: 617.14, y: 154.29, width: 308.57, height: 308.57 },
    { id: "bottom-right-paw", type: "rect", x: 617.14, y: 617.14, width: 308.57, height: 308.57 },

    // Top-left paw triangles
    { id: "tl-triangle-1", type: "polygon", points: "308.57,154.29 154.29,154.29 154.29,0 308.57,154.29" },
    { id: "tl-triangle-2", type: "polygon", points: "154.29,0 308.57,0 308.57,154.29 154.29,0" },
    { id: "tl-triangle-3", type: "polygon", points: "308.57,0 462.86,0 462.86,154.29 308.57,0" },
    { id: "tl-triangle-4", type: "polygon", points: "462.86,154.29 308.57,154.29 308.57,0 462.86,154.29" },
    { id: "tl-triangle-5", type: "polygon", points: "0,154.29 154.29,154.29 154.29,308.57 0,154.29" },
    { id: "tl-triangle-6", type: "polygon", points: "0,308.57 154.29,308.57 154.29,462.86 0,308.57" },

    // Top-right paw triangles
    { id: "tr-triangle-1", type: "polygon", points: "925.71,308.57 925.71,154.29 1080,154.29 925.71,308.57" },
    { id: "tr-triangle-2", type: "polygon", points: "925.71,462.86 925.71,308.57 1080,308.57 925.71,462.86" },
    { id: "tr-triangle-3", type: "polygon", points: "925.71,0 925.71,154.29 771.43,154.29 925.71,0" },
    { id: "tr-triangle-4", type: "polygon", points: "771.43,0 771.43,154.29 617.14,154.29 771.43,0" },
    { id: "tr-triangle-5", type: "polygon", points: "617.14,154.29 617.14,0 771.43,0 617.14,154.29" },
    { id: "tr-triangle-6", type: "polygon", points: "771.43,154.29 771.43,0 925.71,0 771.43,154.29" },

    // Bottom-right paw triangles
    { id: "br-triangle-1", type: "polygon", points: "771.43,925.71 925.71,925.71 925.71,1080 771.43,925.71" },
    { id: "br-triangle-2", type: "polygon", points: "617.14,925.71 771.43,925.71 771.43,1080 617.14,925.71" },
    { id: "br-triangle-3", type: "polygon", points: "1080,925.71 925.71,925.71 925.71,771.43 1080,925.71" },
    { id: "br-triangle-4", type: "polygon", points: "1080,771.43 925.71,771.43 925.71,617.14 1080,771.43" },
    { id: "br-triangle-5", type: "polygon", points: "925.71,1080 771.43,1080 771.43,925.71 925.71,1080" },
    { id: "br-triangle-6", type: "polygon", points: "771.43,1080 617.14,1080 617.14,925.71 771.43,1080" },

    // Bottom-left paw triangles
    { id: "bl-triangle-1", type: "polygon", points: "154.29,771.43 154.29,925.71 0,925.71 154.29,771.43" },
    { id: "bl-triangle-2", type: "polygon", points: "154.29,617.14 154.29,771.43 0,771.43 154.29,617.14" },
    { id: "bl-triangle-3", type: "polygon", points: "154.29,1080 154.29,925.71 308.57,925.71 154.29,1080" },
    { id: "bl-triangle-4", type: "polygon", points: "308.57,1080 308.57,925.71 462.86,925.71 308.57,1080" },
    { id: "bl-triangle-5", type: "polygon", points: "462.86,925.71 462.86,1080 308.57,1080 462.86,925.71" },
    { id: "bl-triangle-6", type: "polygon", points: "308.57,925.71 308.57,1080 154.29,1080 308.57,925.71" },

    // Corner squares
    { id: "top-left-corner", type: "rect", x: 0, y: 0, width: 154.29, height: 154.29 },
    { id: "top-right-corner", type: "rect", x: 925.71, y: 0, width: 154.29, height: 154.29 },
    { id: "bottom-right-corner", type: "rect", x: 925.71, y: 925.71, width: 154.29, height: 154.29 },
    { id: "bottom-left-corner", type: "rect", x: 0, y: 925.71, width: 154.29, height: 154.29 },

    // Connecting rectangles
    { id: "top-connect", type: "rect", x: 462.86, y: 0, width: 154.29, height: 462.86 },
    { id: "right-connect", type: "rect", x: 617.14, y: 462.86, width: 462.86, height: 154.29 },
    { id: "bottom-connect", type: "rect", x: 462.86, y: 617.14, width: 154.29, height: 462.86 },
    { id: "left-connect", type: "rect", x: 0, y: 462.86, width: 462.86, height: 154.29 },

    // Additional triangles for connecting areas
    { id: "left-connect-1", type: "polygon", points: "0,925.71 0,771.43 154.29,771.43 0,925.71" },
    { id: "left-connect-2", type: "polygon", points: "0,771.43 0,617.14 154.29,617.14 0,771.43" },
    { id: "left-connect-3", type: "polygon", points: "154.29,462.86 0,462.86 0,308.57 154.29,462.86" },
    { id: "left-connect-4", type: "polygon", points: "154.29,308.57 0,308.57 0,154.29 154.29,308.57" },

    // Right connect triangles
    { id: "right-connect-1", type: "polygon", points: "1080,154.29 1080,308.57 925.71,308.57 1080,154.29" },
    { id: "right-connect-2", type: "polygon", points: "1080,308.57 1080,462.86 925.71,462.86 1080,308.57" },
    { id: "right-connect-3", type: "polygon", points: "925.71,617.14 1080,617.14 1080,771.43 925.71,617.14" },
    { id: "right-connect-4", type: "polygon", points: "925.71,771.43 1080,771.43 1080,925.71 925.71,771.43" },
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
      await downloadWithHtmlToImage(svgRef.current, "bear-paws-quilt")
    } catch (error) {
      console.error("Error downloading pattern:", error)
      alert("Failed to download pattern. Please try again.")
    } finally {
      setTimeout(() => {
        setIsDownloading(false)
      }, 1000) // Add a small delay to prevent rapid clicking
    }
  }

  // Helper function to render the appropriate shape
  const renderShape = (shape: any) => {
    if (shape.type === "rect") {
      return (
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
      )
    } else if (shape.type === "polygon") {
      return (
        <polygon
          points={shape.points}
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
            width="408"
            height="408"
            viewBox="0 0 1080 1080"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ background: "white" }}
          >
            {/* Define clip paths for each shape */}
            <defs>
              {shapes.map((shape) => {
                if (shape.type === "rect") {
                  return (
                    <clipPath key={`clip-${shape.id}`} id={`clip-${shape.id}`}>
                      <rect x={shape.x} y={shape.y} width={shape.width} height={shape.height} />
                    </clipPath>
                  )
                } else if (shape.type === "polygon") {
                  return (
                    <clipPath key={`clip-${shape.id}`} id={`clip-${shape.id}`}>
                      <polygon points={shape.points} />
                    </clipPath>
                  )
                }
                return null
              })}
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
                    crossOrigin="anonymous"
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
                        fill="white"
                        opacity="0.5"
                      />
                    ) : (
                      <polygon points={shape.points} fill="white" opacity="0.5" />
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

          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="bg-black text-white rounded-full flex items-center pr-6 pl-2 py-2 hover:opacity-90 transition-opacity disabled:opacity-50"
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
