"use client"

import { useState, useRef, useEffect } from "react"
import { Camera, Scan, Shuffle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Import the fabric textures and names
import { FABRIC_TEXTURES, FABRIC_NAMES, FEATURED_FABRICS, ALL_FABRIC_KEYS } from "./fabric-constants"

export default function SVGLogCabinPattern() {
  // State for selected shapes and fabric images
  const [selectedShapes, setSelectedShapes] = useState<string[]>([])
  const [shapeImages, setShapeImages] = useState<Record<string, string>>({})
  const [showCamera, setShowCamera] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [recognizedFabric, setRecognizedFabric] = useState<string | null>(null)
  const [isRecognizing, setIsRecognizing] = useState(false)
  const [recognitionMessage, setRecognitionMessage] = useState("")
  const [svgContent, setSvgContent] = useState<string | null>(null)
  const [svgShapes, setSvgShapes] = useState<Element[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Model-related state
  const [model, setModel] = useState<any>(null)
  const [isModelLoading, setIsModelLoading] = useState(false)
  const [modelError, setModelError] = useState<string | null>(null)

  // Refs for video and canvas elements
  const videoRef = useRef<HTMLVideoElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const recognitionCanvasRef = useRef<HTMLCanvasElement>(null)

  // Load the SVG file
  useEffect(() => {
    const fetchSVG = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/patterns/log-cabin.svg")
        if (!response.ok) {
          throw new Error(`Failed to load SVG: ${response.status} ${response.statusText}`)
        }
        const svgText = await response.text()
        setSvgContent(svgText)

        // Parse the SVG to extract shapes
        const parser = new DOMParser()
        const svgDoc = parser.parseFromString(svgText, "image/svg+xml")
        const shapes = Array.from(svgDoc.querySelectorAll("rect"))
        setSvgShapes(shapes)

        setIsLoading(false)
      } catch (err) {
        console.error("Error loading SVG:", err)
        setError(`Failed to load pattern: ${err.message}`)
        setIsLoading(false)
      }
    }

    fetchSVG()
  }, [])

  // Handle shape selection
  const handleShapeClick = (index: number) => {
    const shapeId = `shape-${index}`
    setSelectedShapes((prev) => (prev.includes(shapeId) ? prev.filter((id) => id !== shapeId) : [...prev, shapeId]))
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

  // Fabric recognition function
  const recognizeFabric = async () => {
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

        try {
          // Simple color analysis for fabric recognition
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

          // Determine fabric type based on color analysis
          let fabricType = ""
          let confidence = 0

          // Use the existing fabric recognition logic
          // Predominantly dark (black/navy)
          if (brightness < 60) {
            if (variance > 70) {
              // Check for dark floral patterns
              if (avgRed > 80 && avgGreen > 70) {
                // Dark floral with colorful elements
                fabricType = "fabric15" // Dark floral
                confidence = 0.92
              } else if (variance > 100) {
                // Art deco pattern
                fabricType = "fabric7" // Art Deco pattern
                confidence = 0.89
              } else {
                fabricType = "fabric4" // Abstract shapes
                confidence = 0.85
              }
            } else {
              // Solid dark fabrics
              if (avgBlue > avgRed + 15) {
                fabricType = "fabric2" // Navy blue
                confidence = 0.94
              } else {
                fabricType = "fabric5" // Dark indigo
                confidence = 0.91
              }
            }
          }
          // Predominantly red/orange
          else if (avgRed > avgBlue + 50 && avgRed > avgGreen + 20) {
            if (variance > 50) {
              if (brightness > 150) {
                // Peach with floral pattern
                fabricType = "fabric13" // Peach floral
                confidence = 0.89
              } else {
                fabricType = "fabric7" // Art Deco pattern
                confidence = 0.85
              }
            } else {
              fabricType = "fabric6" // Rust orange
              confidence = 0.92
            }
          }
          // Predominantly blue/teal/mint
          else if (avgBlue > avgRed + 10 || avgGreen > avgRed + 10) {
            if (variance > 60) {
              if (brightness > 150) {
                fabricType = "fabric11" // Light blue dots
                confidence = 0.88
              } else {
                fabricType = "fabric3" // Turquoise dots
                confidence = 0.87
              }
            } else if (avgGreen > avgBlue) {
              fabricType = "fabric14" // Mint grid
              confidence = 0.9
            } else if (brightness < 80) {
              fabricType = "fabric10" // Teal green
              confidence = 0.9
            } else {
              fabricType = "fabric3" // Turquoise dots
              confidence = 0.82
            }
          }
          // Predominantly tan/brown with pattern
          else if (avgRed > 120 && avgGreen > 100 && avgBlue < 100) {
            if (variance > 40) {
              fabricType = "fabric12" // Orange dots
              confidence = 0.86
            } else {
              fabricType = "fabric9" // Golden cross-stitch
              confidence = 0.88
            }
          }
          // Gray/neutral fabrics
          else if (Math.abs(avgRed - avgBlue) < 20 && Math.abs(avgRed - avgGreen) < 20) {
            if (variance > 30) {
              fabricType = "fabric18" // Gray knit
              confidence = 0.91
            } else {
              fabricType = "fabric5" // Dark indigo
              confidence = 0.84
            }
          }
          // Colorful patterns with high variance
          else if (variance > 80) {
            if (avgRed > 100 && avgGreen > 100 && avgBlue > 100) {
              fabricType = "fabric17" // Colorful plaid
              confidence = 0.93
            } else if (avgRed > 120 && avgBlue > 100) {
              fabricType = "fabric4" // Abstract shapes
              confidence = 0.87
            } else {
              fabricType = "fabric1" // Floral pattern
              confidence = 0.85
            }
          }
          // Light backgrounds with patterns
          else if (brightness > 150) {
            if (variance > 60) {
              fabricType = "fabric13" // Peach floral
              confidence = 0.91
            } else {
              fabricType = "fabric14" // Mint grid
              confidence = 0.89
            }
          }
          // Default to fabric1 if no clear match
          else {
            fabricType = "fabric1" // Floral pattern
            confidence = 0.75
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
          }, 1000)
        } catch (error) {
          console.error("Error during fabric recognition:", error)
          setRecognitionMessage("Error recognizing fabric. Using fallback method.")

          // Use fallback method - select a random fabric
          const randomFabricKey = ALL_FABRIC_KEYS[Math.floor(Math.random() * ALL_FABRIC_KEYS.length)]
          const shapesToUpdate = [...selectedShapes]

          setTimeout(() => {
            setIsRecognizing(false)
            setRecognitionMessage(
              `Using a random fabric: ${FABRIC_NAMES[randomFabricKey as keyof typeof FABRIC_NAMES]}`,
            )

            // Apply the random fabric texture to selected shapes
            if (shapesToUpdate.length > 0) {
              const newShapeImages = { ...shapeImages }
              shapesToUpdate.forEach((shapeId) => {
                newShapeImages[shapeId] = FABRIC_TEXTURES[randomFabricKey as keyof typeof FABRIC_TEXTURES]
              })
              setShapeImages(newShapeImages)
              setSelectedShapes([])
            }

            stopCamera()
          }, 1000)
        }
      }
    }
  }

  // Random fill function
  const randomFill = () => {
    const newShapeImages = { ...shapeImages }

    // For each shape, assign a random fabric
    svgShapes.forEach((_, index) => {
      const shapeId = `shape-${index}`
      const randomIndex = Math.floor(Math.random() * ALL_FABRIC_KEYS.length)
      const randomFabricKey = ALL_FABRIC_KEYS[randomIndex]
      newShapeImages[shapeId] = FABRIC_TEXTURES[randomFabricKey as keyof typeof FABRIC_TEXTURES]
    })

    setShapeImages(newShapeImages)
    setSelectedShapes([]) // Clear any selections
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stream])

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading pattern...</div>
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        className="border border-gray-300 rounded-lg overflow-hidden relative"
        style={{ width: "600px", height: "600px" }}
      >
        {svgContent && (
          <div
            className="w-full h-full"
            dangerouslySetInnerHTML={{
              __html: svgContent.replace(/<svg/, '<svg ref="svgRef"').replace(/<rect/g, (match, index) => {
                const i = svgContent.substring(0, index).split("<rect").length - 1
                const isSelected = selectedShapes.includes(`shape-${i}`)
                const hasImage = `shape-${i}` in shapeImages

                return `<rect 
                    data-index="${i}" 
                    class="shape-item cursor-pointer transition-colors duration-200 hover:stroke-gray-400" 
                    stroke="${isSelected ? "#444" : "#C7C7C7"}" 
                    strokeWidth="${isSelected ? "5" : "1"}" 
                    fill="transparent"
                    onclick="window.handleShapeClick(${i})"
                  `
              }),
            }}
          />
        )}

        {/* Add fabric images as overlays */}
        {svgShapes.map((shape, index) => {
          const shapeId = `shape-${index}`
          if (shapeImages[shapeId]) {
            const rect = shape as SVGRectElement
            const x = Number.parseFloat(rect.getAttribute("x") || "0")
            const y = Number.parseFloat(rect.getAttribute("y") || "0")
            const width = Number.parseFloat(rect.getAttribute("width") || "0")
            const height = Number.parseFloat(rect.getAttribute("height") || "0")

            return (
              <div
                key={shapeId}
                className="absolute"
                style={{
                  left: `${(x / 1080) * 100}%`,
                  top: `${(y / 1080) * 100}%`,
                  width: `${(width / 1080) * 100}%`,
                  height: `${(height / 1080) * 100}%`,
                  backgroundImage: `url(${shapeImages[shapeId]})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  pointerEvents: "none",
                }}
              />
            )
          }
          return null
        })}
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
            <div
              className="bg-black text-white rounded-full flex items-center pr-6 pl-2 py-2 hover:opacity-90 transition-opacity cursor-pointer"
              onClick={startCamera}
            >
              <div className="bg-gray-200 rounded-full p-2 mr-3">
                <Camera size={16} className="text-black" />
              </div>
              <span className="text-lg font-serif font-bold">Scan Fabric</span>
            </div>

            <div
              className="bg-black text-white rounded-full flex items-center pr-6 pl-2 py-2 hover:opacity-90 transition-opacity cursor-pointer"
              onClick={randomFill}
            >
              <div className="bg-gray-200 rounded-full p-2 mr-3">
                <Shuffle size={16} className="text-black" />
              </div>
              <span className="text-lg font-serif font-bold">Random Fill</span>
            </div>
          </>
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
              <span className="text-lg font-serif font-bold">
                {isRecognizing ? "Analyzing..." : "Recognize Fabric"}
              </span>
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
      </div>

      {/* Fabric samples */}
      {!showCamera && (
        <div className="grid grid-cols-3 gap-4 mt-2">
          {FEATURED_FABRICS.map((fabricKey) => (
            <div key={fabricKey} className="flex flex-col items-center">
              <div className="w-20 h-20 border border-gray-300 overflow-hidden">
                <img
                  src={FABRIC_TEXTURES[fabricKey as keyof typeof FABRIC_TEXTURES] || "/placeholder.svg"}
                  alt={FABRIC_NAMES[fabricKey as keyof typeof FABRIC_NAMES]}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm mt-1">{FABRIC_NAMES[fabricKey as keyof typeof FABRIC_NAMES]}</span>
            </div>
          ))}
        </div>
      )}

      {/* Hidden video and canvas elements */}
      <div className={showCamera ? "block" : "hidden"}>
        <div className="relative border rounded-lg overflow-hidden">
          <video ref={videoRef} autoPlay playsInline muted className="w-[320px] h-[240px] object-cover" />
        </div>
      </div>
      <canvas ref={recognitionCanvasRef} className="hidden" />

      {/* Add global click handler for SVG shapes */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
          window.handleShapeClick = function(index) {
            const event = new CustomEvent('shapeclick', { detail: { index } });
            document.dispatchEvent(event);
          }
          
          document.addEventListener('shapeclick', function(e) {
            if (typeof window.reactShapeClickHandler === 'function') {
              window.reactShapeClickHandler(e.detail.index);
            }
          });
        `,
        }}
      />
    </div>
  )
}
