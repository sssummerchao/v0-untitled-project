"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Camera, Trash2 } from "lucide-react"

export default function GeometricPattern() {
  // State for selected shapes and captured images
  const [selectedShapes, setSelectedShapes] = useState<string[]>(["0-1-top", "1-0-top", "2-3-bottom", "0-0"])
  const [shapeImages, setShapeImages] = useState<Record<string, string>>({})
  const [showCamera, setShowCamera] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)

  // Refs for video and canvas elements
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

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

  // Handle shape selection
  const handleShapeClick = (id: string) => {
    // Always in multi-select mode, toggle the selection
    setSelectedShapes((prev) => (prev.includes(id) ? prev.filter((shapeId) => shapeId !== id) : [...prev, id]))
  }

  // Clear all selections
  const clearSelections = () => {
    setSelectedShapes([])
  }

  // Start webcam
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      })
      setStream(mediaStream)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }

      setShowCamera(true)
    } catch (err) {
      console.error("Error accessing webcam:", err)
      alert("Unable to access webcam. Please make sure you've granted permission.")
    }
  }

  // Stop webcam
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setShowCamera(false)
  }

  // Capture image from webcam and apply to all selected shapes
  const captureImage = () => {
    if (videoRef.current && canvasRef.current && selectedShapes.length > 0) {
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      if (context) {
        // Set canvas dimensions to match video
        canvas.width = videoRef.current.videoWidth
        canvas.height = videoRef.current.videoHeight

        // Draw the current video frame to the canvas
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)

        // Convert canvas to data URL
        const imageDataUrl = canvas.toDataURL("image/png")

        // Apply the image to all selected shapes
        const newShapeImages = { ...shapeImages }
        selectedShapes.forEach((shapeId) => {
          newShapeImages[shapeId] = imageDataUrl
        })

        setShapeImages(newShapeImages)

        // Stop the camera after capturing
        stopCamera()
      }
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
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stream])

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <svg width={totalSize} height={totalSize} viewBox={`0 0 ${totalSize} ${totalSize}`}>
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
          {shapes.map((shape) => (
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

              {/* Shape outline and click area */}
              {shape.type === "triangle" ? (
                <polygon
                  points={shape.points}
                  fill={shape.isSelected && !shape.hasImage ? "#666" : "transparent"}
                  stroke={shape.isSelected ? "#444" : "#D0D0D0"}
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
                  stroke={shape.isSelected ? "#444" : "#D0D0D0"}
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

      {/* Camera and image controls */}
      <div className="flex gap-4 flex-wrap justify-center">
        {!showCamera ? (
          <>
            <Button onClick={startCamera} className="flex items-center gap-2">
              <Camera size={16} />
              Capture Image
            </Button>
            {selectedShapes.length > 0 && (
              <Button onClick={clearSelectedImages} variant="outline" className="flex items-center gap-2">
                <Trash2 size={16} />
                Clear Selected Images
              </Button>
            )}
            {selectedShapes.length > 0 && (
              <Button onClick={clearSelections} variant="outline">
                Clear Selection
              </Button>
            )}
          </>
        ) : (
          <>
            <Button onClick={captureImage} variant="default">
              Capture
            </Button>
            <Button onClick={stopCamera} variant="outline">
              Cancel
            </Button>
          </>
        )}
      </div>

      {/* Hidden video and canvas elements */}
      <div className={showCamera ? "block" : "hidden"}>
        <div className="relative border rounded-lg overflow-hidden">
          <video ref={videoRef} autoPlay playsInline muted className="w-[320px] h-[240px] object-cover" />
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
