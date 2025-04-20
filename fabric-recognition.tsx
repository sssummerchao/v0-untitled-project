"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Camera, Scan, Trash2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Fabric textures
const FABRIC_TEXTURES = {
  lace: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/lace.jpg-f43TKSRiELQYJouY0PhgLAuspVe2Qr.jpeg",
  denim:
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Shimmer%20Indigo%20Velvet%20Upholstery%20Fabric.jpg-g1pGBWbqERa2vAaIbixScY8QCciWZB.jpeg",
  linen:
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Linen%20Beauty%20Image.jpg-K9xZrQxtESiIHxYNKAHswiX8B1UCnG.jpeg",
}

export default function FabricRecognition() {
  // State for selected shapes and fabric images
  const [selectedShapes, setSelectedShapes] = useState<string[]>(["0-1-top", "1-0-top", "2-3-bottom", "0-0"])
  const [shapeImages, setShapeImages] = useState<Record<string, string>>({})
  const [showCamera, setShowCamera] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [recognizedFabric, setRecognizedFabric] = useState<string | null>(null)
  const [isRecognizing, setIsRecognizing] = useState(false)
  const [recognitionMessage, setRecognitionMessage] = useState("")

  // Refs for video and canvas elements
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const recognitionCanvasRef = useRef<HTMLCanvasElement>(null)

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
      setRecognizedFabric(null)
      setRecognitionMessage("")
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
    setIsRecognizing(false)
  }

  // Recognize fabric from webcam
  const recognizeFabric = () => {
    if (videoRef.current && recognitionCanvasRef.current) {
      // Check if any shapes are selected
      if (selectedShapes.length === 0) {
        setRecognitionMessage("Please select at least one shape first")
        return
      }

      setIsRecognizing(true)
      setRecognitionMessage("Analyzing fabric...")

      const canvas = recognitionCanvasRef.current
      const context = canvas.getContext("2d", { willReadFrequently: true })

      if (context) {
        // Set canvas dimensions to match video
        canvas.width = videoRef.current.videoWidth
        canvas.height = videoRef.current.videoHeight

        // Draw the current video frame to the canvas
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)

        // Get image data for analysis
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        // Simple color analysis for fabric recognition
        // This is a simplified simulation of fabric recognition
        let redTotal = 0
        let greenTotal = 0
        let blueTotal = 0
        let pixelCount = 0

        // Sample pixels (every 10th pixel to save computation)
        for (let i = 0; i < data.length; i += 40) {
          redTotal += data[i]
          greenTotal += data[i + 1]
          blueTotal += data[i + 2]
          pixelCount++
        }

        // Calculate average color
        const avgRed = redTotal / pixelCount
        const avgGreen = greenTotal / pixelCount
        const avgBlue = blueTotal / pixelCount

        // Calculate brightness and color variance
        const brightness = (avgRed + avgGreen + avgBlue) / 3

        // Calculate texture variance (simplified)
        let variance = 0
        for (let i = 0; i < data.length; i += 40) {
          const r = data[i] - avgRed
          const g = data[i + 1] - avgGreen
          const b = data[i + 2] - avgBlue
          variance += r * r + g * g + b * b
        }
        variance = Math.sqrt(variance / pixelCount)

        // Simulate fabric recognition based on color and texture
        let fabricType = ""
        let confidence = 0

        // Very simplified fabric recognition logic
        // In a real app, this would use a trained ML model

        // Check for lace (typically white/light with high variance)
        if (brightness > 180 && variance > 50) {
          fabricType = "lace"
          confidence = 0.8
        }
        // Check for denim (typically blue with medium variance)
        else if (avgBlue > avgRed + 20 && avgBlue > avgGreen + 10) {
          fabricType = "denim"
          confidence = 0.85
        }
        // Check for linen (typically beige/tan with low-medium variance)
        else if (brightness > 150 && brightness < 220 && avgRed > avgBlue && variance < 50) {
          fabricType = "linen"
          confidence = 0.75
        } else {
          // Default if no clear match
          // Choose randomly for demo purposes
          const fabrics = ["lace", "denim", "linen"]
          fabricType = fabrics[Math.floor(Math.random() * fabrics.length)]
          confidence = 0.6
        }

        // Store the currently selected shapes to apply images to
        const shapesToUpdate = [...selectedShapes]

        // Simulate processing time
        setTimeout(() => {
          setRecognizedFabric(fabricType)
          setRecognitionMessage(`Recognized as ${fabricType} (${Math.round(confidence * 100)}% confidence)`)
          setIsRecognizing(false)

          // Apply the fabric texture to selected shapes
          if (shapesToUpdate.length > 0) {
            const newShapeImages = { ...shapeImages }
            shapesToUpdate.forEach((shapeId) => {
              newShapeImages[shapeId] = FABRIC_TEXTURES[fabricType as keyof typeof FABRIC_TEXTURES]
            })
            setShapeImages(newShapeImages)

            // Clear the selection after applying images
            setSelectedShapes([])
          }

          // Stop the camera after processing
          stopCamera()
        }, 1500)
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

    // Clear the selection after removing images
    setSelectedShapes([])
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

      {/* Fabric recognition result */}
      {recognitionMessage && (
        <Alert className="max-w-md">
          <Scan className="h-4 w-4" />
          <AlertTitle>Fabric Recognition</AlertTitle>
          <AlertDescription>{recognitionMessage}</AlertDescription>
        </Alert>
      )}

      {/* Camera and image controls */}
      <div className="flex gap-4 flex-wrap justify-center">
        {!showCamera ? (
          <>
            <Button onClick={startCamera} className="flex items-center gap-2">
              <Camera size={16} />
              Scan Fabric
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
            <Button onClick={recognizeFabric} variant="default" disabled={isRecognizing}>
              {isRecognizing ? "Analyzing..." : "Recognize Fabric"}
            </Button>
            <Button onClick={stopCamera} variant="outline">
              Cancel
            </Button>
          </>
        )}
      </div>

      {/* Fabric samples */}
      {!showCamera && (
        <div className="grid grid-cols-3 gap-4 mt-2">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 border border-gray-300 overflow-hidden">
              <img src={FABRIC_TEXTURES.lace || "/placeholder.svg"} alt="Lace" className="w-full h-full object-cover" />
            </div>
            <span className="text-sm mt-1">Lace</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 border border-gray-300 overflow-hidden">
              <img
                src={FABRIC_TEXTURES.denim || "/placeholder.svg"}
                alt="Denim"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-sm mt-1">Denim</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 border border-gray-300 overflow-hidden">
              <img
                src={FABRIC_TEXTURES.linen || "/placeholder.svg"}
                alt="Linen"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-sm mt-1">Linen</span>
          </div>
        </div>
      )}

      {/* Hidden video and canvas elements */}
      <div className={showCamera ? "block" : "hidden"}>
        <div className="relative border rounded-lg overflow-hidden">
          <video ref={videoRef} autoPlay playsInline muted className="w-[320px] h-[240px] object-cover" />
        </div>
      </div>
      <canvas ref={recognitionCanvasRef} className="hidden" />
    </div>
  )
}
