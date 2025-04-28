"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Camera, Scan, Shuffle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Import the fabric textures and names from the main component
import {
  FABRIC_TEXTURES,
  FABRIC_NAMES,
  ALL_FABRIC_KEYS,
  FABRIC_CLASS_MAPPING,
  TEACHABLE_MACHINE_URL,
} from "./fabric-constants"

// Add isDrawingMode prop to the component props
interface CrossroadsSvgPatternProps {
  onFabricSelect?: (shape: string, fabricPath: string) => void
  svgRef?: React.RefObject<SVGSVGElement>
  isDrawingMode?: boolean
}

// Update the component to accept isDrawingMode prop
export default function CrossroadsSvgPattern({
  onFabricSelect,
  svgRef,
  isDrawingMode = false,
}: CrossroadsSvgPatternProps) {
  // State for selected shapes and fabric images
  const [selectedShapes, setSelectedShapes] = useState<string[]>([])
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
  const modelLoadedRef = useRef(false)

  // Refs for video and canvas elements
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const recognitionCanvasRef = useRef<HTMLCanvasElement>(null)

  // Define the shapes for the Crossroads pattern
  const shapes = [
    // Center square
    {
      id: "center-square",
      type: "rect",
      clipPath: "clip-center-square",
      x: 349.08,
      y: 349.08,
      width: 381.84,
      height: 381.84,
      transform: "rotate(-45 540 540)",
    },
    // Top-left square
    {
      id: "top-left-square",
      type: "rect",
      clipPath: "clip-top-left-square",
      x: 79.08,
      y: 79.08,
      width: 381.84,
      height: 381.84,
      transform: "rotate(-45 270 270)",
    },
    // Top-right square
    {
      id: "top-right-square",
      type: "rect",
      clipPath: "clip-top-right-square",
      x: 619.08,
      y: 79.08,
      width: 381.84,
      height: 381.84,
      transform: "rotate(-45 810 270)",
    },
    // Bottom-left square
    {
      id: "bottom-left-square",
      type: "rect",
      clipPath: "clip-bottom-left-square",
      x: 79.08,
      y: 619.08,
      width: 381.84,
      height: 381.84,
      transform: "rotate(-45 270 810)",
    },
    // Bottom-right square
    {
      id: "bottom-right-square",
      type: "rect",
      clipPath: "clip-bottom-right-square",
      x: 619.08,
      y: 619.08,
      width: 381.84,
      height: 381.84,
      transform: "rotate(-45 810 810)",
    },
    // Top triangle
    {
      id: "top-triangle",
      type: "polygon",
      clipPath: "clip-top-triangle",
      points: "540,270 810,0 270,0",
    },
    // Top-right triangle
    {
      id: "top-right-triangle",
      type: "polygon",
      clipPath: "clip-top-right-triangle",
      points: "810,0 1080,0 1080,270",
    },
    // Top-left triangle
    {
      id: "top-left-triangle",
      type: "polygon",
      clipPath: "clip-top-left-triangle",
      points: "0,270 0,0 270,0",
    },
    // Bottom triangle
    {
      id: "bottom-triangle",
      type: "polygon",
      clipPath: "clip-bottom-triangle",
      points: "540,810 270,1080 810,1080",
    },
    // Left triangle
    {
      id: "left-triangle",
      type: "polygon",
      clipPath: "clip-left-triangle",
      points: "270,540 0,270 0,810",
    },
    // Right triangle
    {
      id: "right-triangle",
      type: "polygon",
      clipPath: "clip-right-triangle",
      points: "810,540 1080,810 1080,270",
    },
    // Bottom-left triangle
    {
      id: "bottom-left-triangle",
      type: "polygon",
      clipPath: "clip-bottom-left-triangle",
      points: "270,1080 0,1080 0,810",
    },
    // Bottom-right triangle
    {
      id: "bottom-right-triangle",
      type: "polygon",
      clipPath: "clip-bottom-right-triangle",
      points: "1080,810 1080,1080 810,1080",
    },
  ]

  // Handle shape selection
  const handleShapeClick = (id: string) => {
    if (isDrawingMode) return // Don't select shapes in drawing mode

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

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream

        // Add event listeners to debug video element
        videoRef.current.onloadedmetadata = () => {
          console.log("Video metadata loaded")
          videoRef.current?.play().catch((e) => console.error("Error playing video:", e))
        }

        videoRef.current.onplay = () => console.log("Video started playing")
        videoRef.current.onerror = (e) => console.error("Video element error:", e)
      } else {
        console.error("Video ref is null")
        throw new Error("Video element not found")
      }

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
      modelLoadedRef.current = false

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

        // Clean up any existing TensorFlow variables to prevent conflicts
        if (window.tf && typeof window.tf.disposeVariables === "function") {
          try {
            window.tf.disposeVariables()
            console.log("TensorFlow variables disposed before loading model")
          } catch (e) {
            console.error("Error disposing TensorFlow variables:", e)
          }
        }

        // Add a timeout to prevent hanging
        const modelPromise = window.tmImage.load(modelURL, metadataURL)
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Model loading timed out")), 15000),
        )

        const loadedModel = await Promise.race([modelPromise, timeoutPromise])
        console.log("Teachable Machine model loaded successfully")

        // Test the model with a simple prediction to ensure it's working
        try {
          const testCanvas = document.createElement("canvas")
          testCanvas.width = 200
          testCanvas.height = 200
          const testCtx = testCanvas.getContext("2d")
          if (testCtx) {
            testCtx.fillStyle = "rgb(200, 0, 0)"
            testCtx.fillRect(0, 0, 200, 200)
            const testPrediction = await loadedModel.predict(testCanvas)
            console.log("Test prediction successful:", testPrediction)
          }
        } catch (testError) {
          console.error("Test prediction failed:", testError)
        }

        setModel(loadedModel)
        modelLoadedRef.current = true
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
      const modelLoadTimeout: NodeJS.Timeout | null = null

      const loadScriptsAndModel = async () => {
        try {
          // First load TensorFlow.js
          console.log("Loading TensorFlow.js...")
          await new Promise<void>((resolve, reject) => {
            const tfScript = document.createElement("script")
            tfScript.src = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.18.0/dist/tf.min.js"
            tfScript.async = true
            tfScript.onload = () => {
              console.log("TensorFlow.js loaded successfully")
              resolve()
            }
            tfScript.onerror = (e) => {
              console.error("Error loading TensorFlow.js:", e)
              reject(new Error("Failed to load TensorFlow.js"))
            }
            document.body.appendChild(tfScript)
          })

          // Wait a moment to ensure TensorFlow is initialized
          await new Promise((resolve) => setTimeout(resolve, 1000))

          // Then load Teachable Machine
          console.log("Loading Teachable Machine library...")
          await new Promise<void>((resolve, reject) => {
            const tmScript = document.createElement("script")
            tmScript.src =
              "https://cdn.jsdelivr.net/npm/@teachablemachine/image@0.8.5/dist/teachablemachine-image.min.js"
            tmScript.async = true
            tmScript.onload = () => {
              console.log("Teachable Machine library loaded successfully")
              resolve()
            }
            tmScript.onerror = (e) => {
              console.error("Error loading Teachable Machine library:", e)
              reject(new Error("Failed to load Teachable Machine library"))
            }
            document.body.appendChild(tmScript)
          })

          // Wait a moment to ensure Teachable Machine is initialized
          await new Promise((resolve) => setTimeout(resolve, 1000))

          // Now load the model
          console.log("Loading model...")
          await loadModel()
          console.log("Model loading process completed")
        } catch (error) {
          console.error("Error in script loading sequence:", error)
          setModelError(`Failed to initialize: ${error.message}. Using fallback method.`)
        }
      }

      // Start the loading process
      loadScriptsAndModel()

      // Set a timeout to check if scripts loaded
      const timeout = setTimeout(() => {
        if (!modelLoadedRef.current) {
          console.error("Script loading timed out")
          setModelError("Script loading timed out. Using fallback method.")
        }
      }, 20000) // 20 second timeout

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
              console.log("Using Teachable Machine model for prediction")

              // Ensure the canvas has content
              const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
              const hasContent = Array.from(imageData.data).some((val) => val !== 0)

              if (!hasContent) {
                console.error("Canvas appears to be empty")
                throw new Error("Canvas is empty, cannot perform prediction")
              }

              // Predict using the Teachable Machine model
              console.log("Starting prediction...")
              const prediction = await model.predict(canvas)
              console.log("Raw prediction results:", prediction)

              // Find the prediction with the highest probability
              let highestProbability = 0
              let highestClass = ""

              for (let i = 0; i < prediction.length; i++) {
                console.log(`Class: ${prediction[i].className}, Probability: ${prediction[i].probability.toFixed(4)}`)
                if (prediction[i].probability > highestProbability) {
                  highestProbability = prediction[i].probability
                  highestClass = prediction[i].className
                }
              }

              console.log(`Highest prediction: ${highestClass} (${(highestProbability * 100).toFixed(2)}%)`)

              // Map the Teachable Machine class to our fabric types
              const fabricMapping = FABRIC_CLASS_MAPPING

              if (highestClass in fabricMapping) {
                fabricType = fabricMapping[highestClass]
                confidence = highestProbability
                console.log(`Mapped to fabric type: ${fabricType}`)
              } else {
                console.warn(`Unknown class: ${highestClass}, using default fabric`)
                fabricType = "fabric1" // Default to fabric1 if no mapping
                confidence = highestProbability
              }
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
              })
              setShapeImages(newShapeImages)

              // Clear the selection after applying images
              setSelectedShapes([])

              // Add code to call onFabricSelect when a fabric is selected
              // For example, when a user selects a fabric for a shape:
              if (onFabricSelect) {
                shapesToUpdate.forEach((shapeId) => {
                  onFabricSelect(
                    FABRIC_NAMES[fabricType as keyof typeof FABRIC_NAMES],
                    FABRIC_TEXTURES[fabricType as keyof typeof FABRIC_TEXTURES],
                  )
                })
              }
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

              // Add code to call onFabricSelect when a fabric is selected
              // For example, when a user selects a fabric for a shape:
              if (onFabricSelect) {
                shapesToUpdate.forEach((shapeId) => {
                  onFabricSelect(
                    FABRIC_NAMES[randomFabricKey as keyof typeof FABRIC_NAMES],
                    FABRIC_TEXTURES[randomFabricKey as keyof typeof FABRIC_TEXTURES],
                  )
                })
              }
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
    allShapeIds.forEach((shapeId) => {
      const randomIndex = Math.floor(Math.random() * highQualityFabrics.length)
      const randomFabricKey = highQualityFabrics[randomIndex]
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      <div className="flex justify-center">
        {/* SVG Pattern on the left - removed extra container div */}
        <svg ref={svgRef} width="500" height="500" viewBox="0 0 1080 1080" preserveAspectRatio="xMidYMid meet">
          {/* White background */}
          <rect x="0" y="0" width="1080" height="1080" fill="white" />
          {/* Define clip paths for each shape */}
          <defs>
            {/* Center square */}
            <clipPath id="clip-center-square">
              <rect x={349.08} y={349.08} width={381.84} height={381.84} transform="rotate(-45 540 540)" />
            </clipPath>
            {/* Top-left square */}
            <clipPath id="clip-top-left-square">
              <rect x={79.08} y={79.08} width={381.84} height={381.84} transform="rotate(-45 270 270)" />
            </clipPath>
            {/* Top-right square */}
            <clipPath id="clip-top-right-square">
              <rect x={619.08} y={79.08} width={381.84} height={381.84} transform="rotate(-45 810 270)" />
            </clipPath>
            {/* Bottom-left square */}
            <clipPath id="clip-bottom-left-square">
              <rect x={79.08} y={619.08} width={381.84} height={381.84} transform="rotate(-45 270 810)" />
            </clipPath>
            {/* Bottom-right square */}
            <clipPath id="clip-bottom-right-square">
              <rect x={619.08} y={619.08} width={381.84} height={381.84} transform="rotate(-45 810 810)" />
            </clipPath>
            {/* Top triangle */}
            <clipPath id="clip-top-triangle">
              <polygon points="540,270 810,0 270,0" />
            </clipPath>
            {/* Top-right triangle */}
            <clipPath id="clip-top-right-triangle">
              <polygon points="810,0 1080,0 1080,270" />
            </clipPath>
            {/* Top-left triangle */}
            <clipPath id="clip-top-left-triangle">
              <polygon points="0,270 0,0 270,0" />
            </clipPath>
            {/* Bottom triangle */}
            <clipPath id="clip-bottom-triangle">
              <polygon points="540,810 270,1080 810,1080" />
            </clipPath>
            {/* Left triangle */}
            <clipPath id="clip-left-triangle">
              <polygon points="270,540 0,270 0,810" />
            </clipPath>
            {/* Right triangle */}
            <clipPath id="clip-right-triangle">
              <polygon points="810,540 1080,810 1080,270" />
            </clipPath>
            {/* Bottom-left triangle */}
            <clipPath id="clip-bottom-left-triangle">
              <polygon points="270,1080 0,1080 0,810" />
            </clipPath>
            {/* Bottom-right triangle */}
            <clipPath id="clip-bottom-right-triangle">
              <polygon points="1080,810 1080,1080 810,1080" />
            </clipPath>
          </defs>

          {/* Shapes */}
          {shapes.map((shape) => {
            const isSelected = selectedShapes.includes(shape.id)
            const hasImage = shape.id in shapeImages

            return (
              <g key={shape.id} onClick={() => handleShapeClick(shape.id)}>
                {/* If this shape has an image, show it clipped to the shape */}
                {hasImage && (
                  <image
                    href={shapeImages[shape.id]}
                    width={1080}
                    height={1080}
                    preserveAspectRatio="xMidYMid slice"
                    clipPath={`url(#${shape.clipPath})`}
                  />
                )}

                {/* Shape outline and click area */}
                {shape.type === "polygon" ? (
                  <polygon
                    points={shape.points}
                    fill={isSelected ? (hasImage ? "#ffffff" : "#666666") : "transparent"}
                    stroke={hasImage ? "none" : "#CFCECE"}
                    strokeWidth="1"
                    className="cursor-pointer hover:stroke-gray-400 transition-colors duration-200"
                    style={{ fillOpacity: isSelected ? (hasImage ? 0.5 : 0.2) : 0 }}
                  />
                ) : (
                  <rect
                    x={shape.x}
                    y={shape.y}
                    width={shape.width}
                    height={shape.height}
                    transform={shape.transform}
                    fill={isSelected ? (hasImage ? "#ffffff" : "#666666") : "transparent"}
                    fillOpacity={isSelected ? (hasImage ? 0.5 : 0.2) : 0}
                    stroke={hasImage ? "none" : "#CFCECE"}
                    strokeWidth="1"
                    className="cursor-pointer hover:stroke-gray-400 transition-colors duration-200"
                  />
                )}
              </g>
            )
          })}
        </svg>
      </div>

      <div>
        {/* Fabric Recognition controls on the right */}
        <div className="flex flex-col items-start gap-6">
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
          <div className="flex flex-row gap-3 w-full">
            {!showCamera ? (
              <>
                <div
                  className="bg-black text-white rounded-full flex items-center pr-6 pl-2 py-2 hover:opacity-90 transition-opacity cursor-pointer flex-1 whitespace-nowrap"
                  onClick={startCamera}
                >
                  <div className="bg-gray-200 rounded-full p-2 mr-3">
                    <Camera size={16} className="text-black" />
                  </div>
                  <span className="text-lg font-serif font-bold whitespace-nowrap">Scan Fabric</span>
                </div>

                <div
                  className="bg-white text-black border border-black rounded-full flex items-center pr-6 pl-2 py-2 hover:bg-gray-100 transition-colors cursor-pointer flex-1 whitespace-nowrap"
                  onClick={randomFill}
                >
                  <div className="bg-gray-200 rounded-full p-2 mr-3">
                    <Shuffle size={16} className="text-black" />
                  </div>
                  <span className="text-lg font-serif font-bold whitespace-nowrap">Random Fill</span>
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
            <div className="relative rounded-lg overflow-hidden">
              <video ref={videoRef} autoPlay playsInline muted className="w-[320px] h-[240px] object-cover" />
            </div>
          </div>
          <canvas ref={recognitionCanvasRef} className="hidden" />
        </div>
      </div>
    </div>
  )
}
