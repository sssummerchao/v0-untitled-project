// Utility to load TensorFlow.js and Teachable Machine libraries
export async function loadTensorFlowAndTeachableMachine(): Promise<boolean> {
  try {
    // First load TensorFlow.js
    console.log("Loading TensorFlow.js...")
    await new Promise<void>((resolve, reject) => {
      // Check if TensorFlow is already loaded
      if (typeof window !== "undefined" && window.tf) {
        console.log("TensorFlow.js already loaded")
        resolve()
        return
      }

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
      // Check if Teachable Machine is already loaded
      if (typeof window !== "undefined" && window.tmImage) {
        console.log("Teachable Machine library already loaded")
        resolve()
        return
      }

      const tmScript = document.createElement("script")
      tmScript.src = "https://cdn.jsdelivr.net/npm/@teachablemachine/image@0.8.5/dist/teachablemachine-image.min.js"
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

    return true
  } catch (error) {
    console.error("Error loading libraries:", error)
    return false
  }
}

// Utility to load the Teachable Machine model
export async function loadTeachableMachineModel(modelURL: string, metadataURL: string): Promise<any> {
  try {
    // Make sure tmImage is properly initialized
    if (typeof window === "undefined" || !window.tmImage || typeof window.tmImage.load !== "function") {
      console.error("Teachable Machine library not properly initialized")
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

    return loadedModel
  } catch (error) {
    console.error("Error loading Teachable Machine model:", error)
    throw error
  }
}
