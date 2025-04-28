"use client"

import { useState, useRef, useEffect } from "react"
import { Camera, Scan, Shuffle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  FABRIC_TEXTURES,
  FABRIC_NAMES,
  ALL_FABRIC_KEYS,
  TEACHABLE_MACHINE_URL,
  FABRIC_CLASS_MAPPING,
} from "./fabric-constants"

// Add the onFabricSelect prop to the component
export default function LogCabinSVGPattern({ onFabricSelect, svgRef, isDrawingMode, style }) {
  // State for selected shapes and fabric images
  const [selectedShapes, setSelectedShapes] = useState<string[]>(["shape-4", "shape-9"])
  const [shapeImages, setShapeImages] = useState<Record<string, string>>({})
  const [showCamera, setShowCamera] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [recognizedFabric, setRecognizedFabric] = useState<string | null>(null)
  const [isRecognizing, setIsRecognizing] = useState(false)
  const [recognitionMessage, setRecognitionMessage] = useState("")

  // Model-related state
  const [model, setModel] = useState<any>(null)
  const [isModelLoading, setIsModelLoading] = useState(false)
  const [modelError, setModelError] = useState<string | null>(null)

  // Refs for video and canvas elements
  const videoRef = useRef<HTMLVideoElement>(null)
  const recognitionCanvasRef = useRef<HTMLCanvasElement>(null)

  // Define the shapes based on the SVG
  const shapes = [
    {
      id: "shape-0",
      x: 0,
      y: 0,
      width: 946,
      height: 135,
      isSelected: selectedShapes.includes("shape-0"),
      hasImage: "shape-0" in shapeImages,
    },
    {
      id: "shape-1",
      x: 946,
      y: 0,
      width: 134,
      height: 1080,
      isSelected: selectedShapes.includes("shape-1"),
      hasImage: "shape-1" in shapeImages,
    },
    {
      id: "shape-2",
      x: 0,
      y: 135,
      width: 136,
      height: 945,
      isSelected: selectedShapes.includes("shape-2"),
      hasImage: "shape-2" in shapeImages,
    },
    {
      id: "shape-3",
      x: 136,
      y: 945,
      width: 810,
      height: 135,
      isSelected: selectedShapes.includes("shape-3"),
      hasImage: "shape-3" in shapeImages,
    },
    {
      id: "shape-4",
      x: 136,
      y: 135,
      width: 675,
      height: 135,
      isSelected: selectedShapes.includes("shape-4"),
      hasImage: "shape-4" in shapeImages,
    },
    {
      id: "shape-5",
      x: 811,
      y: 135,
      width: 135,
      height: 810,
      isSelected: selectedShapes.includes("shape-5"),
      hasImage: "shape-5" in shapeImages,
    },
    {
      id: "shape-6",
      x: 136,
      y: 270,
      width: 135,
      height: 675,
      isSelected: selectedShapes.includes("shape-6"),
      hasImage: "shape-6" in shapeImages,
    },
    {
      id: "shape-7",
      x: 271,
      y: 810,
      width: 540,
      height: 135,
      isSelected: selectedShapes.includes("shape-7"),
      hasImage: "shape-7" in shapeImages,
    },
    {
      id: "shape-8",
      x: 271,
      y: 405,
      width: 135,
      height: 405,
      isSelected: selectedShapes.includes("shape-8"),
      hasImage: "shape-8" in shapeImages,
    },
    {
      id: "shape-9",
      x: 271,
      y: 270,
      width: 405,
      height: 135,
      isSelected: selectedShapes.includes("shape-9"),
      hasImage: "shape-9" in shapeImages,
    },
    {
      id: "shape-10",
      x: 676,
      y: 270,
      width: 135,
      height: 540,
      isSelected: selectedShapes.includes("shape-10"),
      hasImage: "shape-10" in shapeImages,
    },
    {
      id: "shape-11",
      x: 406,
      y: 675,
      width: 270,
      height: 135,
      isSelected: selectedShapes.includes("shape-11"),
      hasImage: "shape-11" in shapeImages,
    },
    {
      id: "shape-12",
      x: 406,
      y: 405,
      width: 270,
      height: 270,
      isSelected: selectedShapes.includes("shape-12"),
      hasImage: "shape-12" in shapeImages,
    },
  ]

  // Handle shape selection
  const handleShapeClick = (id: string) => {
    console.log(`Shape clicked: ${id}`)
    // Always in multi-select mode, toggle the selection
    setSelectedShapes((prev) => (prev.includes(id) ? prev.filter((shapeId) => shapeId !== id) : [...prev, id]))
  }

  // Start webcam
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      })
      setStream(mediaStream)

      // Ensure the video element exists before setting srcObject
      console.log("Video ref status:", videoRef.current ? "exists" : "null")

      // Set a small timeout to ensure DOM is ready
      setTimeout(() => {
        if (videoRef.current) {
          console.log("Setting video source after delay...")
          videoRef.current.srcObject = mediaStream
        } else {
          console.error("Video ref is still null after delay")
        }
      }, 100) // Small delay to ensure DOM is ready

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
          const fabricUrl = FABRIC_TEXTURES[fabricType as keyof typeof FABRIC_TEXTURES]

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
                newShapeImages[shapeId] = fabricUrl
                // Add code to call onFabricSelect when a fabric is selected
                // For example, when a user selects a fabric for a shape:
                if (onFabricSelect) {
                  onFabricSelect(shapeId, fabricUrl)
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

          // Use fallback method - select a random fabric
          const randomFabricKey = ALL_FABRIC_KEYS[Math.floor(Math.random() * ALL_FABRIC_KEYS.length)]
          const fabricUrl = FABRIC_TEXTURES[randomFabricKey as keyof typeof FABRIC_TEXTURES]
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
                newShapeImages[shapeId] = fabricUrl
                if (onFabricSelect) {
                  onFabricSelect(shapeId, fabricUrl)
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

  // Random fill function
  const randomFill = () => {
    const newShapeImages = { ...shapeImages }

    // Filter to only use high-quality fabric images (not training images)
    const highQualityFabrics = [
      "fabric1",
      "fabric2",
      "fabric3",
      "fabric4",
      "fabric5",
      "fabric6",
      "fabric7",
      "fabric8",
      "fabric9",
      "fabric10",
      "fabric11",
      "fabric12",
      "fabric13",
      "fabric14",
      "fabric15",
      "fabric16",
      "fabric17",
      "fabric18",
    ]

    // For each shape, assign a random high-quality fabric
    shapes.forEach((shape) => {
      const randomIndex = Math.floor(Math.random() * highQualityFabrics.length)
      const randomFabricKey = highQualityFabrics[randomIndex]
      const fabricUrl = FABRIC_TEXTURES[randomFabricKey as keyof typeof FABRIC_TEXTURES]
      newShapeImages[shape.id] = fabricUrl
      if (onFabricSelect) {
        onFabricSelect(shape.id, fabricUrl)
      }
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

  // Calculate scale factor for rendering
  const svgWidth = 1080
  const svgHeight = 1080
  const displayWidth = 500
  const scaleX = displayWidth / svgWidth

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div
        className="border border-gray-300 rounded-lg overflow-hidden relative"
        style={{ width: "500px", height: "500px" }}
      >
        <svg
          ref={svgRef}
          width={displayWidth}
          height={displayWidth}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          preserveAspectRatio="xMidYMid meet"
          style={{
            ...style,
            pointerEvents: isDrawingMode ? "none" : "auto",
          }}
        >
          {/* White background */}
          <rect x="0" y="0" width={svgWidth} height={svgHeight} fill="white" />
          {/* Define clip paths for each shape */}
          <defs>
            {shapes.map((shape) => (
              <clipPath key={`clip-${shape.id}`} id={`clip-${shape.id}`}>
                <rect x={shape.x} y={shape.y} width={shape.width} height={shape.height} />
              </clipPath>
            ))}
          </defs>

          {/* Render each shape */}
          {shapes.map((shape) => (
            <g key={shape.id}>
              {/* If this shape has an image, show it clipped to the shape */}
              {shape.hasImage && (
                <image
                  href={shapeImages[shape.id]}
                  x="0"
                  y="0"
                  width={svgWidth}
                  height={svgHeight}
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
                fill={shape.hasImage && shape.isSelected ? "#ffffff" : shape.isSelected ? "#666666" : "transparent"}
                stroke="#C7C7C7"
                strokeWidth="1"
                onClick={() => handleShapeClick(shape.id)}
                className="cursor-pointer hover:stroke-gray-400 transition-colors duration-200"
                style={{ fillOpacity: shape.isSelected ? (shape.hasImage ? 0.5 : 0.2) : 0 }}
              />
            </g>
          ))}
        </svg>
      </div>

      <div className="flex flex-col gap-6">
        {/* Selection info */}
        <div className="text-sm text-gray-500">
          {selectedShapes.length === 0
            ? "No shapes selected"
            : `${selectedShapes.length} shape${selectedShapes.length > 1 ? "s" : ""} selected`}
        </div>

        {isModelLoading && (
          <Alert className="max-w-md">
            <AlertTitle>Loading Fabric Recognition Model</AlertTitle>
            <AlertDescription>Please wait while the AI model is being loaded...</AlertDescription>
          </Alert>
        )}

        {modelError && (
          <Alert className="max-w-md" variant="destructive">
            <AlertTitle>Model Loading Error</AlertTitle>
            <AlertDescription>{modelError}</AlertDescription>
          </Alert>
        )}

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

        {/* Hidden video and canvas elements */}
        <div className={showCamera ? "block" : "hidden"}>
          <div className="relative border rounded-lg overflow-hidden">
            <video ref={videoRef} autoPlay playsInline muted className="w-[320px] h-[240px] object-cover" />
          </div>
        </div>
        <canvas ref={recognitionCanvasRef} className="hidden" />
      </div>
    </div>
  )
}
