"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Camera, Scan, Shuffle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  FABRIC_TEXTURES,
  FABRIC_NAMES,
  TEACHABLE_MACHINE_URL,
  FABRIC_CLASS_MAPPING,
  STORAGE_KEYS,
} from "./fabric-constants"
import DrawingModeToggle from "./drawing-mode-toggle"

// Featured fabrics to display in the samples section
const FEATURED_FABRICS = ["fabric13", "fabric1", "fabric3"]

// Filter to only include fabric1 through fabric18 for high-quality fabrics
const HIGH_QUALITY_FABRIC_KEYS = Array.from({ length: 18 }, (_, i) => `fabric${i + 1}`)

// Add this to the interface
interface FabricRecognitionProps {
  onFabricSelect: (shape: string, fabricPath: string) => void
  svgRef?: React.RefObject<SVGSVGElement>
  isDrawingMode?: boolean
}

// Update the component to use the prop
export default function FabricRecognition({
  onFabricSelect,
  svgRef: externalSvgRef,
  isDrawingMode = false,
}: FabricRecognitionProps) {
  // Use the external svgRef if provided, otherwise use the internal one
  const internalSvgRef = useRef<SVGSVGElement>(null)
  const svgRef = externalSvgRef || internalSvgRef

  // State for selected shapes and fabric images
  const [selectedShapes, setSelectedShapes] = useState<string[]>(["0-1-top", "1-0-top", "2-3-bottom", "0-0"])
  const [shapeImages, setShapeImages] = useState<Record<string, string>>({})
  const [showCamera, setShowCamera] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [recognizedFabric, setRecognizedFabric] = useState<string | null>(null)
  const [isRecognizing, setIsRecognizing] = useState(false)
  const [recognitionMessage, setRecognitionMessage] = useState("")
  // const [isDrawingMode, setIsDrawingMode] = useState(false)

  // Model-related state
  const [model, setModel] = useState<any>(null)
  const [isModelLoading, setIsModelLoading] = useState(false)
  const [modelError, setModelError] = useState<string | null>(null)

  // Refs for video and canvas elements
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const recognitionCanvasRef = useRef<HTMLCanvasElement>(null)
  // const svgRef = useRef<SVGSVGElement>(null)

  // Grid size
  const gridSize = 4
  const cellSize = 125
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

  // Add this function to save fabric selections
  const saveFabricSelections = (pattern, selections) => {
    localStorage.setItem(STORAGE_KEYS[pattern], JSON.stringify(selections))
  }

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

  // Update the handleShapeClick function to check isDrawingMode
  const handleShapeClick = (id: string) => {
    // Only allow shape selection when not in drawing mode
    if (isDrawingMode) return

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
      console.log("Requesting camera access...")

      // First check if the browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Your browser doesn't support camera access")
      }

      // Try with more specific constraints to ensure we get a working stream
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      })

      console.log("Camera access granted, stream obtained:", mediaStream)
      setStream(mediaStream)

      // Ensure the video element exists before setting srcObject
      console.log("Video ref status:", videoRef.current ? "exists" : "null")

      // Set a small timeout to ensure DOM is ready
      setTimeout(() => {
        if (videoRef.current) {
          console.log("Setting video source after delay...")
          videoRef.current.srcObject = mediaStream

          // Add event listeners to debug video element
          videoRef.current.onloadedmetadata = () => {
            console.log("Video metadata loaded")
            videoRef.current?.play().catch((e) => console.error("Error playing video:", e))
          }

          videoRef.current.onplay = () => console.log("Video started playing")
          videoRef.current.onerror = (e) => console.error("Video element error:", e)
        } else {
          console.error("Video ref is still null after delay")
        }
      }, 100) // Small delay to ensure DOM is ready

      setShowCamera(true)
      setRecognizedFabric(null)
      setRecognitionMessage("")
    } catch (err) {
      console.error("Error accessing webcam:", err)
      alert(`Camera access error: ${err.message}. Please check your camera permissions and try again.`)
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

  // Add this function to load the Teachable Machine model
  const loadModel = async () => {
    try {
      setIsModelLoading(true)
      setModelError(null)

      // Check if TensorFlow.js is loaded
      if (typeof window === "undefined" || !window.tf) {
        console.error("TensorFlow.js is not loaded")
        throw new Error("TensorFlow.js is not loaded")
      }

      // Check if Teachable Machine is loaded
      if (!window.tmImage) {
        console.error("Teachable Machine library is not loaded")
        throw new Error("Teachable Machine library is not loaded")
      }

      console.log("Libraries loaded, attempting to load model...")

      // Try loading the model directly from Teachable Machine
      try {
        console.log("Attempting to load model from Teachable Machine URL...")

        // Use the constant from fabric-constants.ts
        const teachableMachineURL = TEACHABLE_MACHINE_URL

        // Use a more direct approach to load the model
        const modelURL = `${teachableMachineURL}model.json`
        const metadataURL = `${teachableMachineURL}metadata.json`

        console.log(`Loading model from: ${modelURL}`)
        console.log(`Loading metadata from: ${metadataURL}`)

        // Make sure tmImage is properly initialized
        if (typeof window.tmImage.load !== "function") {
          console.error("tmImage.load is not a function")
          throw new Error("Teachable Machine library not properly initialized")
        }

        // Add a timeout to prevent hanging
        const modelPromise = window.tmImage.load(modelURL, metadataURL)
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Model loading timed out")), 15000),
        )

        const loadedModel = await Promise.race([modelPromise, timeoutPromise])
        console.log("Teachable Machine model loaded successfully")

        setModel(loadedModel)
        setIsModelLoading(false)
        return loadedModel
      } catch (tmError) {
        console.error("Error loading model from Teachable Machine:", tmError)
        throw new Error(`Failed to load model from Teachable Machine: ${tmError.message}`)
      }
    } catch (error) {
      console.error("Error loading model:", error)
      setModelError(`Failed to load fabric recognition model: ${error.message}. Using fallback method.`)
      setIsModelLoading(false)
      return null
    }
  }

  // Add this useEffect to load the model when the component mounts
  useEffect(() => {
    // Check if we're in the browser
    if (typeof window !== "undefined" && window.document) {
      let loadAttempted = false
      let modelLoadTimeout: NodeJS.Timeout | null = null

      // Function to load model when TensorFlow.js is ready
      const loadTM = () => {
        console.log("Loading Teachable Machine library...")
        const tmScript = document.createElement("script")
        tmScript.src = "https://cdn.jsdelivr.net/npm/@teachablemachine/image@0.8.5/dist/teachablemachine-image.min.js"
        tmScript.async = true
        tmScript.onload = () => {
          console.log("Teachable Machine library loaded")
          modelLoadTimeout = setTimeout(() => {
            if (!loadAttempted) {
              loadAttempted = true
              loadModel()
            }
          }, 1000)
        }
        tmScript.onerror = (e) => {
          console.error("Error loading Teachable Machine library:", e)
          setModelError("Failed to load Teachable Machine library. Using fallback method.")
        }
        document.body.appendChild(tmScript)
      }

      // First load TensorFlow.js - use browser-specific version
      console.log("Loading TensorFlow.js...")
      const tfScript = document.createElement("script")
      tfScript.src = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.18.0/dist/tf.min.js"
      tfScript.async = true
      tfScript.onload = () => {
        console.log("TensorFlow.js loaded")
        // Only load TM after TF is fully loaded
        setTimeout(loadTM, 1000)
      }
      tfScript.onerror = (e) => {
        console.error("Error loading TensorFlow.js:", e)
        setModelError("Failed to load TensorFlow.js library. Using fallback method.")
      }
      document.body.appendChild(tfScript)

      // Set a timeout to check if scripts loaded
      const timeout = setTimeout(() => {
        if (!loadAttempted) {
          console.error("Script loading timed out")
          setModelError("Script loading timed out. Using fallback method.")
        }
      }, 15000) // 15 second timeout

      return () => {
        // Clean up when component unmounts
        clearTimeout(timeout)
        if (modelLoadTimeout) clearTimeout(modelLoadTimeout)

        // Clean up scripts
        const scripts = document.querySelectorAll("script[src*='tensorflow'], script[src*='teachablemachine']")
        scripts.forEach((script) => {
          if (document.body.contains(script)) {
            document.body.removeChild(script)
          }
        })

        // Clean up TensorFlow memory if available
        if (window.tf && typeof window.tf.disposeVariables === "function") {
          try {
            window.tf.disposeVariables()
            console.log("TensorFlow variables disposed")
          } catch (e) {
            console.error("Error disposing TensorFlow variables:", e)
          }
        }
      }
    }
  }, [])

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
          let fabricType = ""
          let confidence = 0

          // Use Teachable Machine model if available
          if (model) {
            try {
              // Predict using the Teachable Machine model
              const prediction = await model.predict(canvas)

              // Find the prediction with the highest probability
              let highestProbability = 0
              let highestClass = ""

              for (let i = 0; i < prediction.length; i++) {
                if (prediction[i].probability > highestProbability) {
                  highestProbability = prediction[i].probability
                  highestClass = prediction[i].className
                }
              }

              // Map the Teachable Machine class to our fabric types
              const fabricMapping = FABRIC_CLASS_MAPPING

              fabricType = fabricMapping[highestClass] || "fabric1" // Default to fabric1 if no mapping
              confidence = highestProbability

              console.log(`Teachable Machine prediction: ${highestClass} (${(highestProbability * 100).toFixed(2)}%)`)
            } catch (predictionError) {
              console.error("Error during model prediction:", predictionError)
              throw new Error("Model prediction failed, using fallback method")
            }
          } else {
            // Fallback to the original algorithm if model is not available
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

                // Call onFabricSelect to notify parent component
                if (onFabricSelect) {
                  onFabricSelect(shapeId, FABRIC_TEXTURES[fabricType as keyof typeof FABRIC_TEXTURES])
                }
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

          // Use fallback method - select a random fabric from high-quality fabrics
          const randomFabricKey = HIGH_QUALITY_FABRIC_KEYS[Math.floor(Math.random() * HIGH_QUALITY_FABRIC_KEYS.length)]
          const shapesToUpdateFallback = [...selectedShapes]

          setTimeout(() => {
            setIsRecognizing(false)
            setRecognitionMessage(
              `Using a random fabric: ${FABRIC_NAMES[randomFabricKey as keyof typeof FABRIC_NAMES]}`,
            )

            // Apply the random fabric texture to selected shapes
            if (shapesToUpdateFallback.length > 0) {
              const newShapeImages = { ...shapeImages }
              shapesToUpdateFallback.forEach((shapeId) => {
                newShapeImages[shapeId] = FABRIC_TEXTURES[randomFabricKey as keyof typeof FABRIC_TEXTURES]

                // Call onFabricSelect to notify parent component
                if (onFabricSelect) {
                  onFabricSelect(shapeId, FABRIC_TEXTURES[randomFabricKey as keyof typeof FABRIC_TEXTURES])
                }
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

  // Random fill function
  const randomFill = () => {
    const newShapeImages = { ...shapeImages }

    // Get all shape IDs
    const allShapeIds = shapes.map((shape) => shape.id)

    // For each shape, assign a random fabric from high-quality fabrics only
    allShapeIds.forEach((shapeId) => {
      const randomIndex = Math.floor(Math.random() * HIGH_QUALITY_FABRIC_KEYS.length)
      const randomFabricKey = HIGH_QUALITY_FABRIC_KEYS[randomIndex]
      newShapeImages[shapeId] = FABRIC_TEXTURES[randomFabricKey as keyof typeof FABRIC_TEXTURES]

      // Call onFabricSelect to notify parent component
      if (onFabricSelect) {
        onFabricSelect(shapeId, FABRIC_TEXTURES[randomFabricKey as keyof typeof FABRIC_TEXTURES])
      }
    })

    setShapeImages(newShapeImages)
    setSelectedShapes([]) // Clear any selections
  }

  // Handle mode change
  const [isDrawingModeInternal, setIsDrawingModeInternal] = useState(isDrawingMode)

  const handleModeChange = (drawingMode: boolean) => {
    setIsDrawingModeInternal(drawingMode)
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
    <div className="flex flex-row items-start gap-8">
      {/* Left side: Pattern grid */}
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <svg ref={svgRef} width={totalSize} height={totalSize} viewBox={`0 0 ${totalSize} ${totalSize}`}>
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
              stroke="#C7C7C7"
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
              stroke="#C7C7C7"
              strokeWidth="1"
            />
          ))}

          {/* Shapes */}
          {shapes.map((shape) => (
            <g key={shape.id}>
              {/* Base shape outline - always visible and behind everything */}
              {shape.type === "triangle" ? (
                <polygon
                  points={shape.points}
                  fill="transparent"
                  stroke="#C7C7C7"
                  strokeWidth="2"
                  strokeDasharray="none"
                />
              ) : (
                <rect
                  x={shape.x}
                  y={shape.y}
                  width={shape.width}
                  height={shape.height}
                  fill="transparent"
                  stroke="#C7C7C7"
                  strokeWidth="2"
                  strokeDasharray="none"
                />
              )}

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

              {/* Selection overlay for shapes with images */}
              {shape.isSelected &&
                shape.hasImage &&
                (shape.type === "triangle" ? (
                  <polygon
                    points={shape.points}
                    fill="#ffffff"
                    fillOpacity="0.5"
                    stroke="none"
                    onClick={() => handleShapeClick(shape.id)}
                    className="cursor-pointer"
                  />
                ) : (
                  <rect
                    x={shape.x}
                    y={shape.y}
                    width={shape.width}
                    height={shape.height}
                    fill="#ffffff"
                    fillOpacity="0.5"
                    stroke="none"
                    onClick={() => handleShapeClick(shape.id)}
                    className="cursor-pointer"
                  />
                ))}

              {/* Selection overlay for shapes without images */}
              {shape.isSelected &&
                !shape.hasImage &&
                (shape.type === "triangle" ? (
                  <polygon
                    points={shape.points}
                    fill="#666666"
                    fillOpacity="0.2"
                    stroke="none"
                    onClick={() => handleShapeClick(shape.id)}
                    className="cursor-pointer"
                  />
                ) : (
                  <rect
                    x={shape.x}
                    y={shape.y}
                    width={shape.width}
                    height={shape.height}
                    fill="#666666"
                    fillOpacity="0.2"
                    stroke="none"
                    onClick={() => handleShapeClick(shape.id)}
                    className="cursor-pointer"
                  />
                ))}

              {/* Clickable area (transparent) */}
              {shape.type === "triangle" ? (
                <polygon
                  points={shape.points}
                  fill="transparent"
                  stroke="transparent"
                  onClick={() => handleShapeClick(shape.id)}
                  className={`${isDrawingMode ? "" : "cursor-pointer"}`}
                />
              ) : (
                <rect
                  x={shape.x}
                  y={shape.y}
                  width={shape.width}
                  height={shape.height}
                  fill="transparent"
                  stroke="transparent"
                  onClick={() => handleShapeClick(shape.id)}
                  className={`${isDrawingMode ? "" : "cursor-pointer"}`}
                />
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* Right side: Controls and info */}
      <div className="flex flex-col gap-6 w-80">
        {/* Selection info */}
        <div className="text-sm text-gray-500">
          {isDrawingMode
            ? "Drawing mode active - click the pencil icon to exit"
            : selectedShapes.length === 0
              ? "No shapes selected"
              : `${selectedShapes.length} shape${selectedShapes.length > 1 ? "s" : ""} selected`}
        </div>

        {isModelLoading && (
          <Alert className="w-full">
            <AlertTitle>Loading Fabric Recognition Model</AlertTitle>
            <AlertDescription>Please wait while the AI model is being loaded...</AlertDescription>
          </Alert>
        )}

        {modelError && (
          <Alert className="w-full" variant="destructive">
            <AlertTitle>Model Loading Error</AlertTitle>
            <AlertDescription>{modelError}</AlertDescription>
          </Alert>
        )}

        {/* Fabric recognition result */}
        {recognitionMessage && (
          <Alert className="w-full">
            <Scan className="h-4 w-4" />
            <AlertTitle>Fabric Recognition</AlertTitle>
            <AlertDescription>{recognitionMessage}</AlertDescription>
          </Alert>
        )}

        {/* Camera and image controls - only show when not in drawing mode */}
        {!isDrawingMode && (
          <div className="flex flex-col gap-3">
            {!showCamera ? (
              <div className="flex flex-row gap-3">
                <div
                  className="flex-1 bg-black text-white rounded-full flex items-center pr-6 pl-2 py-2 hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap"
                  onClick={startCamera}
                >
                  <div className="bg-gray-200 rounded-full p-2 mr-3">
                    <Camera size={16} className="text-black" />
                  </div>
                  <span className="text-lg font-serif font-bold whitespace-nowrap">Scan Fabric</span>
                </div>

                <div
                  className="flex-1 bg-white text-black border border-black rounded-full flex items-center pr-6 pl-2 py-2 hover:bg-gray-100 transition-opacity cursor-pointer whitespace-nowrap"
                  onClick={randomFill}
                >
                  <div className="bg-gray-200 rounded-full p-2 mr-3">
                    <Shuffle size={16} className="text-black" />
                  </div>
                  <span className="text-lg font-serif font-bold whitespace-nowrap">Random Fill</span>
                </div>
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
        )}

        {/* Video and canvas elements */}
        {showCamera && (
          <div className="mt-4 rounded-lg overflow-hidden bg-gray-900" style={{ width: "100%" }}>
            <div className="p-2 bg-black text-white text-xs">Camera Preview</div>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-[240px] object-contain bg-black"
              style={{ display: "block" }}
              onCanPlay={() => console.log("Video can play now")}
            />
            <div className="p-2 bg-black text-white text-xs text-center">
              If camera is black, check browser permissions
            </div>
          </div>
        )}
        <canvas ref={recognitionCanvasRef} width="640" height="480" className="hidden" />
      </div>

      {/* Drawing mode toggle */}
      <DrawingModeToggle svgRef={svgRef} viewBox={`0 0 ${totalSize} ${totalSize}`} onModeChange={handleModeChange} />
    </div>
  )
}
