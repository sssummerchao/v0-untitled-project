"use client"

import { useState, useRef, useEffect } from "react"
import { Camera, Scan } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Fabric textures with new uploaded fabrics
// Replace the existing FABRIC_TEXTURES object with this expanded version:

const FABRIC_TEXTURES = {
  fabric1: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Fabric1.png-eA43GaL1h4FWRfdpJgYoTmux7i2pD2.jpeg", // Floral pattern
  fabric2: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Fabric2.png-lUZBylugZCU3mIUEcHYiff9Bop1MYe.jpeg", // Dark navy
  fabric3: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Fabric3.png-AEi7cZpbItvFSw9G7rlq1mV6g1fwKU.jpeg", // Turquoise dots
  fabric4: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Fabric4.png-OXLI4U2Xtv3nV0Tvz5WZ5Ik3pIPv8k.jpeg", // Abstract shapes
  fabric5: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Fabric5.png-VU7EeEqphml1Q1pFFQAddEuwoHxaZ1.jpeg", // Navy blue
  fabric6: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Fabric6.png-RBUlhhgBdbtQDsR8JmiqgblyuicloE.jpeg", // Orange/rust
  fabric7: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Fabric7.png-dZ9TpymE4ERnvpxE4MhXrYj8oe0P24.jpeg", // Art Deco pattern
  fabric8: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Fabric8.png-fMN8cPA43m9mtCaCKtN4A1NS7Xmnlh.jpeg", // Burgundy
  fabric9: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Fabric9.png-JvOT8otoJo74EP0pHU8EgEd05K1oSh.jpeg", // Golden cross-stitch
  fabric10: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Fabric10.png-Sg9O2fOCJv8jfbQFSjE1eojRt9V6Lk.jpeg", // Teal green
  fabric11: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Fabric11.png-Mp0IernC2BIoVcU1QdfpzeUAakXhYP.jpeg", // Light blue dots
  fabric12: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Fabric12.png-fZXAO3B6z8coBzlg64zaDqchKqxQAy.jpeg", // Orange dots
  fabric13: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Fabric13.png-xbMCpPQx7Mm0hjhRY5nVxHFrDk7tpc.jpeg", // Peach floral
  fabric14: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Fabric14.png-aFtyfelJsMVfDxmImcL08EuUbq8pnb.jpeg", // Mint grid
  fabric15: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Fabric15.png-kS0MpfYqzwWvo7imLFLVCluQLcQV56.jpeg", // Dark floral
  fabric16: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Fabric16.png-TvB3uh5aXoUeqWbbIWHs7bkOEgPOug.jpeg", // Solid orange
  fabric17: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Fabric17.png-pQKEFm3tHQY2QgDAVuNEvXkK6sxVs3.jpeg", // Colorful plaid
  fabric18: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Fabric18.png-34j12aNudMfZG7Ylt3tmTJtny2Rz5a.jpeg", // Gray knit
  // Add new fabric textures
  navy_blue:
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Navy%20blue.JPG-NzrgmnijpyLfx2d6AbscPbfCHu7ujW.jpeg",
  floral_pattern2:
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Floral%20pattern2.JPG-ZYDSiU1zIQpBPHEfQlQoaSE8n5ff21.jpeg",
  orange_rust:
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Orange%3Arust.JPG-FdNDGEfrkxnoM0X1XmpcCqK6qvsBHc.jpeg",
  floral_pattern:
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Floral%20pattern.JPG-PdgDuB0Tdoc1yOrrCLo0wmGJwItkjg.jpeg",
  orange_dots:
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Orange%20dots.JPG-v8uLTGtq7JFLVfYFXIXxT5RgMWSOoQ.jpeg",
  teal_green:
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Teal%20green.JPG-k8PtGwSwqsnDCf3UpW8Fma2y6vfFhL.jpeg",
  peach_floral2:
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Peach%20floral2.JPG-Was0jqy1lnvEcRyslXmlbAi6aPKwxf.jpeg",
  peach_floral1:
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Peach%20floral1.JPG-kzI8R30U9DQgYjkAivgYetiHkdx6yi.jpeg",
  turquoise_dots:
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Turquoise%20dots.JPG-v04VzO1avKomW4krRUZBZWAgOM2rd6.jpeg",
  golden_cross_stitch:
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Golden%20cross-stitch.JPG-rduxpTFBI5OSjOnkOZk1ab6LdI6oTw.jpeg",
}

// Fabric names for display
// Replace the existing FABRIC_NAMES object with this expanded version:

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
  fabric11: "Light Blue Dots",
  fabric12: "Orange Dots",
  fabric13: "Peach Floral",
  fabric14: "Mint Grid",
  fabric15: "Dark Floral",
  fabric16: "Solid Orange",
  fabric17: "Colorful Plaid",
  fabric18: "Gray Knit",
  // Add names for new fabrics
  navy_blue: "Navy Blue Solid",
  floral_pattern2: "Dark Floral Pattern",
  orange_rust: "Rust Orange Solid",
  floral_pattern: "Dark Floral with Red Accent",
  orange_dots: "Tan with White Dots",
  teal_green: "Deep Teal Texture",
  peach_floral2: "Peach with Orange Roses",
  peach_floral1: "Peach Floral Pattern",
  turquoise_dots: "Turquoise Dotted Pattern",
  golden_cross_stitch: "Golden Cross-Stitch",
}

// Featured fabrics to display in the samples section
const FEATURED_FABRICS = []

// Add new training images to the public directory
// These are only used for recognition training, not for filling shapes
const TRAINING_IMAGES = {
  mint_grid:
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Mint%20grid.JPG-5N9Y1CG8pzYyr8U7l8HBtYIUDWTDSS.jpeg",
  dark_navy2:
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Dark%20navy2.JPG-yGPfWZDqLcbslNmEP0a60GLVdoBEdv.jpeg",
  abstract_shapes:
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Abstract%20shapes.JPG-VPeCPCUO93PrvvFEeI2QJySBuvD4Au.jpeg",
  colorful_plaid:
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Colorful%20plaid.JPG-YqdX6BZf3w2il6f1Pw7QtffXZcTiLc.jpeg",
  dark_navy:
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Dark%20navy.JPG-hm2dDpXr6ndEGzm8vmHDPPgtPcsAn0.jpeg",
  dark_floral:
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Dark%20floral.JPG-fHZY8H1JkuyhFDVNNy8wktb1vdZAKG.jpeg",
  light_blue_dots:
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Light%20blue%20dots.JPG-EPHHixLw9XQ8BdI3H8ob3KKBqv4yBI.jpeg",
  art_deco:
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Art%20Deco.JPG-6Fl5EXj24fcPedfrXfrjxW3uj1bg6B.jpeg",
  gray_knit:
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gray%20knit.JPG-ZfIIS1lmzD5XuzSnwGgtWlkTzdcZsC.jpeg",
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

  // Model-related state
  const [model, setModel] = useState<any>(null)
  const [isModelLoading, setIsModelLoading] = useState(false)
  const [modelError, setModelError] = useState<string | null>(null)

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

  // Sort shapes to bring selected ones to the front
  const sortedShapes = [...shapes].sort((a, b) => {
    if (a.isSelected && !b.isSelected) return 1 // Selected shapes go last (rendered on top)
    if (!a.isSelected && b.isSelected) return -1 // Non-selected shapes go first
    return 0 // Keep original order for shapes with same selection state
  })

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

        // Try loading from local files as a fallback
        try {
          console.log("Attempting to load model from local files...")
          const modelURL = "/models/fabric-model/model.json"
          const metadataURL = "/models/fabric-model/metadata.json"

          console.log(`Loading model from: ${modelURL}`)
          console.log(`Loading metadata from: ${metadataURL}`)

          const loadedModel = await window.tmImage.load(modelURL, metadataURL)
          setModel(loadedModel)
          setIsModelLoading(false)
          console.log("Teachable Machine model loaded successfully from local files")
          return
        } catch (localError) {
          console.error("Error loading model from local files:", localError)
          throw new Error("All model loading attempts failed")
        }
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

      // Function to load model when TensorFlow.js is ready
      const loadTM = () => {
        console.log("Loading Teachable Machine library...")
        const tmScript = document.createElement("script")
        tmScript.src = "https://cdn.jsdelivr.net/npm/@teachablemachine/image@0.8.5/dist/teachablemachine-image.min.js"
        tmScript.async = true
        tmScript.onload = () => {
          console.log("Teachable Machine library loaded")
          setTimeout(() => {
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
        const scripts = document.querySelectorAll("script[src*='tensorflow'], script[src*='teachablemachine']")
        scripts.forEach((script) => {
          if (document.body.contains(script)) {
            document.body.removeChild(script)
          }
        })
      }
    }
  }, [])

  // Replace the recognizeFabric function with this updated version
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
            // This mapping should be adjusted based on your Teachable Machine classes
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
            }

            // Stop the camera after processing
            stopCamera()
          }, 1000)
        } catch (error) {
          console.error("Error during fabric recognition:", error)
          setRecognitionMessage("Error recognizing fabric. Please try again.")
          setIsRecognizing(false)
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

          {/* Grid lines - moved to the back */}
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

          {/* Non-selected shapes first, then selected shapes */}
          {sortedShapes.map((shape) => (
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
                  fill={shape.isSelected ? (shape.hasImage ? "transparent" : "#666") : "transparent"}
                  stroke={shape.isSelected ? "#000000" : "#D0D0D0"}
                  strokeWidth={shape.isSelected ? "5" : "1"}
                  strokeDasharray={shape.isSelected && shape.hasImage ? "5,3" : "none"}
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
                  fill={shape.isSelected ? (shape.hasImage ? "transparent" : "#666") : "transparent"}
                  stroke={shape.isSelected ? "#000000" : "#D0D0D0"}
                  strokeWidth={shape.isSelected ? "5" : "1"}
                  strokeDasharray={shape.isSelected && shape.hasImage ? "5,3" : "none"}
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
