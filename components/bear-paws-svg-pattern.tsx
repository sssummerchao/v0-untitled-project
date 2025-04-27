"use client"

import { useState, useRef, useEffect } from "react"
import { Camera, Scan, Shuffle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { FABRIC_TEXTURES, FABRIC_NAMES, ALL_FABRIC_KEYS } from "./fabric-constants"

// Add the onFabricSelect prop to the component
export default function BearPawsSVGPattern({
  onFabricSelect,
}: { onFabricSelect?: (shapeId: string, fabricUrl: string) => void }) {
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

  // Refs for video and canvas elements
  const videoRef = useRef<HTMLVideoElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const recognitionCanvasRef = useRef<HTMLCanvasElement>(null)

  // SVG container size
  const svgSize = 500

  // Define the shapes for the Bear Paws pattern exactly matching the SVG
  const shapes = [
    // Center square
    {
      id: "center-square",
      type: "square",
      x: 462.86,
      y: 462.86,
      width: 154.29,
      height: 154.29,
      isSelected: selectedShapes.includes("center-square"),
      hasImage: "center-square" in shapeImages,
    },
    // Four large squares
    {
      id: "top-left-square",
      type: "square",
      x: 154.29,
      y: 154.29,
      width: 308.57,
      height: 308.57,
      isSelected: selectedShapes.includes("top-left-square"),
      hasImage: "top-left-square" in shapeImages,
    },
    {
      id: "bottom-left-square",
      type: "square",
      x: 154.29,
      y: 617.14,
      width: 308.57,
      height: 308.57,
      isSelected: selectedShapes.includes("bottom-left-square"),
      hasImage: "bottom-left-square" in shapeImages,
    },
    {
      id: "top-right-square",
      type: "square",
      x: 617.14,
      y: 154.29,
      width: 308.57,
      height: 308.57,
      isSelected: selectedShapes.includes("top-right-square"),
      hasImage: "top-right-square" in shapeImages,
    },
    {
      id: "bottom-right-square",
      type: "square",
      x: 617.14,
      y: 617.14,
      width: 308.57,
      height: 308.57,
      isSelected: selectedShapes.includes("bottom-right-square"),
      hasImage: "bottom-right-square" in shapeImages,
    },
    // Top left paw triangles
    {
      id: "tl-paw-1",
      type: "triangle",
      points: "308.57 154.29 154.29 154.29 154.29 0 308.57 154.29",
      isSelected: selectedShapes.includes("tl-paw-1"),
      hasImage: "tl-paw-1" in shapeImages,
    },
    {
      id: "tl-paw-2",
      type: "triangle",
      points: "154.29 0 308.57 0 308.57 154.29 154.29 0",
      isSelected: selectedShapes.includes("tl-paw-2"),
      hasImage: "tl-paw-2" in shapeImages,
    },
    {
      id: "tl-paw-3",
      type: "triangle",
      points: "308.57 0 462.86 0 462.86 154.29 308.57 0",
      isSelected: selectedShapes.includes("tl-paw-3"),
      hasImage: "tl-paw-3" in shapeImages,
    },
    {
      id: "tl-paw-4",
      type: "triangle",
      points: "462.86 154.29 308.57 154.29 308.57 0 462.86 154.29",
      isSelected: selectedShapes.includes("tl-paw-4"),
      hasImage: "tl-paw-4" in shapeImages,
    },
    // Left paw triangles
    {
      id: "left-paw-1",
      type: "triangle",
      points: "0 154.29 154.29 154.29 154.29 308.57 0 154.29",
      isSelected: selectedShapes.includes("left-paw-1"),
      hasImage: "left-paw-1" in shapeImages,
    },
    {
      id: "left-paw-2",
      type: "triangle",
      points: "0 308.57 154.29 308.57 154.29 462.86 0 308.57",
      isSelected: selectedShapes.includes("left-paw-2"),
      hasImage: "left-paw-2" in shapeImages,
    },
    // Right paw triangles
    {
      id: "right-paw-1",
      type: "triangle",
      points: "925.71 308.57 925.71 154.29 1080 154.29 925.71 308.57",
      isSelected: selectedShapes.includes("right-paw-1"),
      hasImage: "right-paw-1" in shapeImages,
    },
    {
      id: "right-paw-2",
      type: "triangle",
      points: "925.71 462.86 925.71 308.57 1080 308.57 925.71 462.86",
      isSelected: selectedShapes.includes("right-paw-2"),
      hasImage: "right-paw-2" in shapeImages,
    },
    // Top right paw triangles
    {
      id: "tr-paw-1",
      type: "triangle",
      points: "925.71 0 925.71 154.29 771.43 154.29 925.71 0",
      isSelected: selectedShapes.includes("tr-paw-1"),
      hasImage: "tr-paw-1" in shapeImages,
    },
    {
      id: "tr-paw-2",
      type: "triangle",
      points: "771.43 0 771.43 154.29 617.14 154.29 771.43 0",
      isSelected: selectedShapes.includes("tr-paw-2"),
      hasImage: "tr-paw-2" in shapeImages,
    },
    {
      id: "tr-paw-3",
      type: "triangle",
      points: "617.14 154.29 617.14 0 771.43 0 617.14 154.29",
      isSelected: selectedShapes.includes("tr-paw-3"),
      hasImage: "tr-paw-3" in shapeImages,
    },
    {
      id: "tr-paw-4",
      type: "triangle",
      points: "771.43 154.29 771.43 0 925.71 0 771.43 154.29",
      isSelected: selectedShapes.includes("tr-paw-4"),
      hasImage: "tr-paw-4" in shapeImages,
    },
    // Bottom right paw triangles
    {
      id: "br-paw-1",
      type: "triangle",
      points: "771.43 925.71 925.71 925.71 925.71 1080 771.43 925.71",
      isSelected: selectedShapes.includes("br-paw-1"),
      hasImage: "br-paw-1" in shapeImages,
    },
    {
      id: "br-paw-2",
      type: "triangle",
      points: "617.14 925.71 771.43 925.71 771.43 1080 617.14 925.71",
      isSelected: selectedShapes.includes("br-paw-2"),
      hasImage: "br-paw-2" in shapeImages,
    },
    // Additional triangles from the SVG
    {
      id: "right-paw-3",
      type: "triangle",
      points: "1080 925.71 925.71 925.71 925.71 771.43 1080 925.71",
      isSelected: selectedShapes.includes("right-paw-3"),
      hasImage: "right-paw-3" in shapeImages,
    },
    {
      id: "right-paw-4",
      type: "triangle",
      points: "1080 771.43 925.71 771.43 925.71 617.14 1080 771.43",
      isSelected: selectedShapes.includes("right-paw-4"),
      hasImage: "right-paw-4" in shapeImages,
    },
    {
      id: "left-paw-3",
      type: "triangle",
      points: "154.29 771.43 154.29 925.71 0 925.71 154.29 771.43",
      isSelected: selectedShapes.includes("left-paw-3"),
      hasImage: "left-paw-3" in shapeImages,
    },
    {
      id: "left-paw-4",
      type: "triangle",
      points: "154.29 617.14 154.29 771.43 0 771.43 154.29 617.14",
      isSelected: selectedShapes.includes("left-paw-4"),
      hasImage: "left-paw-4" in shapeImages,
    },
    // Bottom left paw triangles
    {
      id: "bl-paw-1",
      type: "triangle",
      points: "154.29 1080 154.29 925.71 308.57 925.71 154.29 1080",
      isSelected: selectedShapes.includes("bl-paw-1"),
      hasImage: "bl-paw-1" in shapeImages,
    },
    {
      id: "bl-paw-2",
      type: "triangle",
      points: "308.57 1080 308.57 925.71 462.86 925.71 308.57 1080",
      isSelected: selectedShapes.includes("bl-paw-2"),
      hasImage: "bl-paw-2" in shapeImages,
    },
    // Corner squares
    {
      id: "top-left-corner",
      type: "square",
      x: 0,
      y: 0,
      width: 154.29,
      height: 154.29,
      isSelected: selectedShapes.includes("top-left-corner"),
      hasImage: "top-left-corner" in shapeImages,
    },
    {
      id: "top-right-corner",
      type: "square",
      x: 925.71,
      y: 0,
      width: 154.29,
      height: 154.29,
      isSelected: selectedShapes.includes("top-right-corner"),
      hasImage: "top-right-corner" in shapeImages,
    },
    // Middle vertical rectangles
    {
      id: "top-middle-rect",
      type: "square",
      x: 462.86,
      y: 0,
      width: 154.29,
      height: 462.86,
      isSelected: selectedShapes.includes("top-middle-rect"),
      hasImage: "top-middle-rect" in shapeImages,
    },
    // Additional bottom right paw triangles
    {
      id: "br-paw-3",
      type: "triangle",
      points: "771.43 925.71 925.71 925.71 925.71 1080 771.43 925.71",
      isSelected: selectedShapes.includes("br-paw-3"),
      hasImage: "br-paw-3" in shapeImages,
    },
    {
      id: "br-paw-4",
      type: "triangle",
      points: "925.71 1080 771.43 1080 771.43 925.71 925.71 1080",
      isSelected: selectedShapes.includes("br-paw-4"),
      hasImage: "br-paw-4" in shapeImages,
    },
    {
      id: "br-paw-5",
      type: "triangle",
      points: "771.43 1080 617.14 1080 617.14 925.71 771.43 1080",
      isSelected: selectedShapes.includes("br-paw-5"),
      hasImage: "br-paw-5" in shapeImages,
    },
    {
      id: "br-paw-6",
      type: "triangle",
      points: "617.14 925.71 771.43 925.71 771.43 1080 617.14 925.71",
      isSelected: selectedShapes.includes("br-paw-6"),
      hasImage: "br-paw-6" in shapeImages,
    },
    // Additional bottom left paw triangles
    {
      id: "bl-paw-3",
      type: "triangle",
      points: "154.29 1080 154.29 925.71 308.57 925.71 154.29 1080",
      isSelected: selectedShapes.includes("bl-paw-3"),
      hasImage: "bl-paw-3" in shapeImages,
    },
    {
      id: "bl-paw-4",
      type: "triangle",
      points: "308.57 1080 308.57 925.71 462.86 925.71 308.57 1080",
      isSelected: selectedShapes.includes("bl-paw-4"),
      hasImage: "bl-paw-4" in shapeImages,
    },
    {
      id: "bl-paw-5",
      type: "triangle",
      points: "462.86 925.71 462.86 1080 308.57 1080 462.86 925.71",
      isSelected: selectedShapes.includes("bl-paw-5"),
      hasImage: "bl-paw-5" in shapeImages,
    },
    {
      id: "bl-paw-6",
      type: "triangle",
      points: "308.57 925.71 308.57 1080 154.29 1080 308.57 925.71",
      isSelected: selectedShapes.includes("bl-paw-6"),
      hasImage: "bl-paw-6" in shapeImages,
    },
    // Bottom corner squares
    {
      id: "bottom-right-corner",
      type: "square",
      x: 925.71,
      y: 925.71,
      width: 154.29,
      height: 154.29,
      isSelected: selectedShapes.includes("bottom-right-corner"),
      hasImage: "bottom-right-corner" in shapeImages,
    },
    {
      id: "bottom-left-corner",
      type: "square",
      x: 0,
      y: 925.71,
      width: 154.29,
      height: 154.29,
      isSelected: selectedShapes.includes("bottom-left-corner"),
      hasImage: "bottom-left-corner" in shapeImages,
    },
    // Bottom middle rectangle
    {
      id: "bottom-middle-rect",
      type: "square",
      x: 462.86,
      y: 617.14,
      width: 154.29,
      height: 462.86,
      isSelected: selectedShapes.includes("bottom-middle-rect"),
      hasImage: "bottom-middle-rect" in shapeImages,
    },
    // Additional left side triangles
    {
      id: "left-paw-5",
      type: "triangle",
      points: "0 925.71 0 771.43 154.29 771.43 0 925.71",
      isSelected: selectedShapes.includes("left-paw-5"),
      hasImage: "left-paw-5" in shapeImages,
    },
    {
      id: "left-paw-6",
      type: "triangle",
      points: "0 771.43 0 617.14 154.29 617.14 0 771.43",
      isSelected: selectedShapes.includes("left-paw-6"),
      hasImage: "left-paw-6" in shapeImages,
    },
    {
      id: "left-paw-7",
      type: "triangle",
      points: "154.29 462.86 0 462.86 0 308.57 154.29 462.86",
      isSelected: selectedShapes.includes("left-paw-7"),
      hasImage: "left-paw-7" in shapeImages,
    },
    {
      id: "left-paw-8",
      type: "triangle",
      points: "154.29 308.57 0 308.57 0 154.29 154.29 308.57",
      isSelected: selectedShapes.includes("left-paw-8"),
      hasImage: "left-paw-8" in shapeImages,
    },
    // Middle horizontal rectangle - left
    {
      id: "middle-left-rect",
      type: "square",
      x: 0,
      y: 462.86,
      width: 462.86,
      height: 154.29,
      isSelected: selectedShapes.includes("middle-left-rect"),
      hasImage: "middle-left-rect" in shapeImages,
    },
    // Additional right side triangles
    {
      id: "right-paw-5",
      type: "triangle",
      points: "1080 154.29 1080 308.57 925.71 308.57 1080 154.29",
      isSelected: selectedShapes.includes("right-paw-5"),
      hasImage: "right-paw-5" in shapeImages,
    },
    {
      id: "right-paw-6",
      type: "triangle",
      points: "1080 308.57 1080 462.86 925.71 462.86 1080 308.57",
      isSelected: selectedShapes.includes("right-paw-6"),
      hasImage: "right-paw-6" in shapeImages,
    },
    {
      id: "right-paw-7",
      type: "triangle",
      points: "925.71 617.14 1080 617.14 1080 771.43 925.71 617.14",
      isSelected: selectedShapes.includes("right-paw-7"),
      hasImage: "right-paw-7" in shapeImages,
    },
    {
      id: "right-paw-8",
      type: "triangle",
      points: "925.71 771.43 1080 771.43 1080 925.71 925.71 771.43",
      isSelected: selectedShapes.includes("right-paw-8"),
      hasImage: "right-paw-8" in shapeImages,
    },
    // Middle horizontal rectangle - right
    {
      id: "middle-right-rect",
      type: "square",
      x: 617.14,
      y: 462.86,
      width: 462.86,
      height: 154.29,
      isSelected: selectedShapes.includes("middle-right-rect"),
      hasImage: "middle-right-rect" in shapeImages,
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
        const teachableMachineURL = "https://teachablemachine.withgoogle.com/models/zQHyr94Fi/"

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

        const loadedModel = await window.tmImage.load(modelURL, metadataURL)
        setModel(loadedModel)
        setIsModelLoading(false)
        console.log("Teachable Machine model loaded successfully from Teachable Machine URL")
        return
      } catch (tmError) {
        console.error("Error loading model from Teachable Machine:", tmError)
        throw new Error(`Failed to load model from Teachable Machine: ${tmError.message}`)
      }
    } catch (error) {
      console.error("Error loading model:", error)
      setModelError(`Failed to load fabric recognition model: ${error.message}. Using fallback method.`)
      setIsModelLoading(false)
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
              const fabricMapping: Record<string, string> = {
                "Floral pattern": "fabric1",
                "Dark navy": "fabric2",
                "Turquoise dots": "fabric3",
                "Abstract shapes": "fabric4",
                "Navy blue": "fabric5",
                "Orange/rust": "fabric6",
                "Art Deco": "fabric7",
                "Burgundy/purple": "fabric8",
                "Golden cross-stitch": "fabric9",
                "Teal green": "fabric10",
                "Light blue dots": "fabric11",
                "Orange dots": "fabric12",
                "Peach floral": "fabric13",
                "Mint grid": "fabric14",
                "Dark floral": "fabric15",
                "Solid orange": "fabric16",
                "Colorful plaid": "fabric17",
                "Gray knit": "fabric18",
              }

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
                // Add code to call onFabricSelect when a fabric is selected
                // For example, when a user selects a fabric for a shape:
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
      const fabricUrl = FABRIC_TEXTURES[randomFabricKey as keyof typeof FABRIC_TEXTURES]
      newShapeImages[shapeId] = fabricUrl
      // Add code to call onFabricSelect when a fabric is selected
      // For example, when a user selects a fabric for a shape:
      if (onFabricSelect) {
        onFabricSelect(shapeId, fabricUrl)
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

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <svg width={svgSize} height={svgSize} viewBox="0 0 1080 1080" preserveAspectRatio="xMidYMid meet">
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

          {/* Shapes */}
          {shapes.map((shape) => (
            <g key={shape.id}>
              {/* If this shape has an image, show it clipped to the shape */}
              {shape.hasImage && (
                <image
                  href={shapeImages[shape.id]}
                  width={svgSize * 2.16}
                  height={svgSize * 2.16}
                  preserveAspectRatio="xMidYMid slice"
                  clipPath={`url(#clip-${shape.id})`}
                />
              )}

              {/* Shape outline and click area */}
              {shape.type === "triangle" ? (
                <polygon
                  points={shape.points}
                  fill={shape.hasImage && shape.isSelected ? "#ffffff" : shape.isSelected ? "#666666" : "transparent"}
                  stroke="#C7C7C7"
                  strokeWidth="4"
                  strokeDasharray="none"
                  onClick={() => handleShapeClick(shape.id)}
                  className="cursor-pointer hover:stroke-gray-400 transition-colors duration-200"
                  style={{ fillOpacity: shape.isSelected ? (shape.hasImage ? 0.5 : 0.2) : 0 }}
                />
              ) : (
                <rect
                  x={shape.x}
                  y={shape.y}
                  width={shape.width}
                  height={shape.height}
                  fill={shape.hasImage && shape.isSelected ? "#ffffff" : shape.isSelected ? "#666666" : "transparent"}
                  stroke="#C7C7C7"
                  strokeWidth="4"
                  strokeDasharray="none"
                  onClick={() => handleShapeClick(shape.id)}
                  className="cursor-pointer hover:stroke-gray-400 transition-colors duration-200"
                  style={{ fillOpacity: shape.isSelected ? (shape.hasImage ? 0.5 : 0.2) : 0 }}
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
  )
}
