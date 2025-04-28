/**
 * Takes a screenshot of an element and downloads it as a PNG
 */
export function takeScreenshot(element: HTMLElement | SVGElement, fileName: string) {
  // Show notification
  const notification = document.createElement("div")
  notification.textContent = "Taking screenshot..."
  notification.style.position = "fixed"
  notification.style.top = "20px"
  notification.style.right = "20px"
  notification.style.padding = "10px 20px"
  notification.style.background = "black"
  notification.style.color = "white"
  notification.style.borderRadius = "5px"
  notification.style.zIndex = "9999"
  document.body.appendChild(notification)

  try {
    // Get the dimensions of the element
    const rect = element.getBoundingClientRect()
    const width = rect.width
    const height = rect.height

    // Create a canvas element
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      throw new Error("Could not get canvas context")
    }

    // Fill with white background
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, width, height)

    // Create an image from the SVG
    const img = new Image()
    img.crossOrigin = "anonymous" // This helps with CORS issues

    // When the image loads, draw it on the canvas and download
    img.onload = () => {
      // Draw the image on the canvas
      ctx.drawImage(img, 0, 0)

      // Convert to PNG and download
      try {
        const dataUrl = canvas.toDataURL("image/png")
        const link = document.createElement("a")
        link.download = fileName
        link.href = dataUrl
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // Clean up
        document.body.removeChild(notification)
      } catch (error) {
        console.error("Error creating PNG:", error)
        document.body.removeChild(notification)
        alert("Failed to create PNG. Please try again.")
      }
    }

    // Handle errors
    img.onerror = () => {
      console.error("Error loading image")
      document.body.removeChild(notification)
      alert("Failed to create screenshot. Please try again.")
    }

    // Convert SVG to a data URL
    const svgData = new XMLSerializer().serializeToString(element as SVGElement)
    const svgBlob = new Blob([svgData], { type: "image/svg+xml" })
    const url = URL.createObjectURL(svgBlob)

    // Set the source to start loading
    img.src = url
  } catch (error) {
    console.error("Error taking screenshot:", error)
    document.body.removeChild(notification)
    alert("Failed to take screenshot. Please try again.")
  }
}
