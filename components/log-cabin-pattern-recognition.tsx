"use client"

import { useState, useRef, useEffect } from "react"
import { Camera, Scan } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Import fabric textures from the fabric-recognition component
const FABRIC_TEXTURES = {
  fabric1: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Fabric1.png-eA43GaL1h4FWRfdpJgYoTmux7i2pD2.jpeg",
  fabric2: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Fabric2.png-lUZBylugZCU3mIUEcHYiff9Bop1MYe.jpeg",
  fabric3: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Fabric3.png-AEi7cZpbItvFSw9G7rlq1mV6g1fwKU.jpeg",
  fabric4: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Fabric4.png-OXLI4U2Xtv3nV0Tvz5WZ5Ik3pIPv8k.jpeg",
  fabric5: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Fabric5.png-VU7EeEqphml1Q1pFFQAddEuwoHxaZ1.jpeg",
  fabric6: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Fabric6.png-RBUlhhgBdbtQDsR8JmiqgblyuicloE.jpeg",
  fabric7: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Fabric7.png-dZ9TpymE4ERnvpxE4MhXrYj8oe0P24.jpeg",
  fabric8: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Fabric8.png-fMN8cPA43m9mtCaCKtN4A1NS7Xmnlh.jpeg",
  fabric9: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Fabric9.png-JvOT8otoJo74EP0pHU8EgEd05K1oSh.jpeg",
  fabric10: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Fabric10.png-Sg9O2fOCJv8jfbQFSjE1eojRt9V6Lk.jpeg",
}

// Fabric names for display
const FABRIC_NAMES = {
  fabric1: "Floral Pattern",
  fabric2: "Navy Blue",
  fabric3: "Turquoise Dots",
  fabric4: "Abstract Shapes",
  fabric5: "Dark Indigo",
  fabric6: "Rust Orange",
  fabric7: "Art Deco Pattern",
  fabric8: "Burgundy",
  fabric9: "Golden Cross-Stitch",
  fabric10: "Teal Green",
}

export default function LogCabinPatternRecognition() {
  // State for selected shapes and fabric images
  const [selectedShapes, setSelectedShapes] = useState<string[]>([])
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
          fabricType = "fabric1"
          confidence = 0.8
        }
        // Check for denim (typically blue with medium variance)
        else if (avgBlue > avgRed + 20 && avgBlue > avgGreen + 10) {
          fabricType = "fabric2"
          confidence = 0.85
        }
        // Check for linen (typically beige/tan with low-medium variance)
        else if (brightness > 150 && brightness < 220 && avgRed > avgBlue && variance < 50) {
          fabricType = "fabric3"
          confidence = 0.75
        } else {
          // Default if no clear match
          // Choose randomly for demo purposes
          const fabrics = ["fabric4", "fabric5", "fabric6", "fabric7", "fabric8", "fabric9", "fabric10"]
          fabricType = fabrics[Math.floor(Math.random() * fabrics.length)]
          confidence = 0.6
        }

        // Store the currently selected shapes to apply images to
        const shapesToUpdate = [...selectedShapes]

        // Simulate processing time
        setTimeout(() => {
          setRecognizedFabric(fabricType)
          setRecognitionMessage(
            `Recognized as ${FABRIC_NAMES[fabricType as keyof typeof FABRIC_NAMES]} (${Math.round(confidence * 100)}% confidence)`,
          )
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
        <svg width="408" height="408" viewBox="0 0 408 408" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                stroke="black"
                strokeWidth={selectedShapes.includes(shape.id) ? "5" : "1"}
                strokeDasharray={selectedShapes.includes(shape.id) && shape.id in shapeImages ? "5,3" : "none"}
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

      {/* Fabric recognition result */}
      {recognitionMessage && (
        <Alert className="max-w-md">
          <Scan className="h-4 w-4" />
          <AlertTitle>Fabric Recognition</AlertTitle>
          <AlertDescription>{recognitionMessage}</AlertDescription>
        </Alert>
      )}

      {/* Camera and image controls */}
      {!showCamera ? (
        <div
          className="bg-black text-white rounded-full flex items-center pr-6 pl-2 py-2 hover:opacity-90 transition-opacity cursor-pointer"
          onClick={startCamera}
        >
          <div className="bg-gray-200 rounded-full p-2 mr-3">
            <Camera size={16} className="text-black" />
          </div>
          <span className="text-lg font-serif font-bold">Scan Fabric</span>
        </div>
      ) : (
        <>
          <div
            className="bg-black text-white rounded-full flex items-center pr-6 pl-2 py-2 hover:opacity-90 transition-opacity cursor-pointer"
            onClick={recognizeFabric}
            style={{ opacity: isRecognizing ? 0.7 : 1 }}
          >
            <div className="bg-gray-200 rounded-full p-2 mr-3">
              <Scan size={16} className="text-black" />
            </div>
            <span className="text-lg font-serif font-bold">{isRecognizing ? "Analyzing..." : "Recognize Fabric"}</span>
          </div>

          <div
            className="bg-black text-white rounded-full flex items-center pr-6 pl-2 py-2 hover:opacity-90 transition-opacity cursor-pointer"
            onClick={stopCamera}
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
            <span className="text-lg font-serif font-bold">Cancel</span>
          </div>
        </>
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
