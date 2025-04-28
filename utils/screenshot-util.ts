/**
 * A simple utility for taking screenshots of elements
 */

export function takeScreenshot(element: HTMLElement | SVGElement, filename: string): void {
  // Show notification
  const notification = document.createElement("div")
  notification.textContent = "Generating PNG..."
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
    // Create a canvas element
    const canvas = document.createElement("canvas")
    const rect = element.getBoundingClientRect()

    // Set canvas dimensions to match the element
    canvas.width = rect.width
    canvas.height = rect.height

    // Get the canvas context
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      throw new Error("Could not get canvas context")
    }

    // Fill with white background
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Create an image from the SVG
    const img = new Image()
    img.crossOrigin = "anonymous"

    // Convert SVG to data URL
    const svgData = new XMLSerializer().serializeToString(element as SVGElement)
    const svgBlob = new Blob([svgData], { type: "image/svg+xml" })
    const url = URL.createObjectURL(svgBlob)

    // When the image loads, draw it on the canvas and download
    img.onload = () => {
      // Draw the image on the canvas
      ctx.drawImage(img, 0, 0)

      // Convert to PNG and download
      try {
        const dataUrl = canvas.toDataURL("image/png")
        const link = document.createElement("a")
        link.download = filename
        link.href = dataUrl
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (error) {
        console.error("Error creating PNG:", error)
        alert("Failed to create PNG. Please try again.")
      }

      // Clean up
      URL.revokeObjectURL(url)
      document.body.removeChild(notification)
    }

    // Handle errors
    img.onerror = () => {
      console.error("Error loading SVG as image")
      URL.revokeObjectURL(url)
      document.body.removeChild(notification)

      // Fallback: try to download as SVG
      try {
        const link = document.createElement("a")
        link.download = filename.replace(".png", ".svg")
        link.href = url
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        alert("Downloaded as SVG instead of PNG due to browser limitations.")
      } catch (error) {
        console.error("Error downloading SVG:", error)
        alert("Failed to download the pattern. Please try again.")
      }
    }

    // Set the source to start loading
    img.src = url
  } catch (error) {
    console.error("Error taking screenshot:", error)
    document.body.removeChild(notification)
    alert("Failed to take screenshot. Please try again.")
  }
}
