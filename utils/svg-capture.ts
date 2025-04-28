/**
 * A utility for capturing SVG patterns with fabric textures
 */
import { loadHtml2Canvas } from "./html2canvas-loader"

export async function captureSvgWithFabrics(svgElement: SVGElement, filename: string): Promise<void> {
  try {
    // Create notification
    const notification = document.createElement("div")
    notification.textContent = "Preparing download..."
    notification.style.position = "fixed"
    notification.style.top = "20px"
    notification.style.right = "20px"
    notification.style.padding = "10px 20px"
    notification.style.background = "black"
    notification.style.color = "white"
    notification.style.borderRadius = "5px"
    notification.style.zIndex = "9999"
    document.body.appendChild(notification)

    // Load html2canvas
    const html2canvas = await loadHtml2Canvas()

    // Create a container with white background
    const container = document.createElement("div")
    container.style.position = "absolute"
    container.style.left = "-9999px"
    container.style.top = "-9999px"
    container.style.background = "white"
    container.style.width = "1080px"
    container.style.height = "1080px"
    container.style.padding = "0"
    container.style.margin = "0"
    container.style.overflow = "hidden"

    // Clone the SVG to avoid modifying the original
    const svgClone = svgElement.cloneNode(true) as SVGElement

    // Make sure SVG has explicit dimensions
    svgClone.setAttribute("width", "1080")
    svgClone.setAttribute("height", "1080")

    // Append to container
    container.appendChild(svgClone)
    document.body.appendChild(container)

    // Use html2canvas to capture the SVG with all its styles
    const canvas = await html2canvas(container, {
      backgroundColor: "white",
      scale: 1,
      logging: false,
      useCORS: true,
      allowTaint: true,
      foreignObjectRendering: true,
    })

    // Remove the container
    document.body.removeChild(container)

    try {
      // Convert to PNG and download
      const pngUrl = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.download = filename
      link.href = pngUrl
      link.click()

      // Clean up
      document.body.removeChild(notification)
    } catch (error) {
      console.error("Error creating PNG:", error)
      document.body.removeChild(notification)
      alert("Failed to download pattern. Please try again.")
    }
  } catch (error) {
    console.error("Error capturing SVG:", error)
    alert("Failed to download pattern. Please try again.")
  }
}

// Fallback function that uses a more direct approach
export function downloadSvgAsPng(svgElement: SVGElement, filename: string): void {
  try {
    // Create notification
    const notification = document.createElement("div")
    notification.textContent = "Preparing download..."
    notification.style.position = "fixed"
    notification.style.top = "20px"
    notification.style.right = "20px"
    notification.style.padding = "10px 20px"
    notification.style.background = "black"
    notification.style.color = "white"
    notification.style.borderRadius = "5px"
    notification.style.zIndex = "9999"
    document.body.appendChild(notification)

    // Clone the SVG to avoid modifying the original
    const svgClone = svgElement.cloneNode(true) as SVGElement

    // Make sure SVG has explicit dimensions
    const width = 1080
    const height = 1080
    svgClone.setAttribute("width", width.toString())
    svgClone.setAttribute("height", height.toString())

    // Add white background
    const bgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
    bgRect.setAttribute("width", "100%")
    bgRect.setAttribute("height", "100%")
    bgRect.setAttribute("fill", "white")
    svgClone.insertBefore(bgRect, svgClone.firstChild)

    // Convert SVG to a data URL
    const serializer = new XMLSerializer()
    const svgString = serializer.serializeToString(svgClone)
    const svgBlob = new Blob([svgString], { type: "image/svg+xml" })
    const svgUrl = URL.createObjectURL(svgBlob)

    // Create an image from the SVG
    const img = new Image()
    img.crossOrigin = "anonymous"

    img.onload = () => {
      // Create a canvas with the same dimensions
      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height

      // Get canvas context and draw the image
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        throw new Error("Could not get canvas context")
      }

      // Fill with white background first
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, width, height)

      // Draw the SVG image
      ctx.drawImage(img, 0, 0, width, height)

      try {
        // Convert to PNG and download
        const pngUrl = canvas.toDataURL("image/png")
        const link = document.createElement("a")
        link.download = filename
        link.href = pngUrl
        link.click()

        // Clean up
        URL.revokeObjectURL(svgUrl)
        document.body.removeChild(notification)
      } catch (error) {
        console.error("Error creating PNG:", error)
        document.body.removeChild(notification)
        alert("Failed to download pattern. Please try again.")
      }
    }

    img.onerror = (error) => {
      console.error("Error loading SVG as image:", error)
      document.body.removeChild(notification)
      alert("Failed to download pattern. Please try again.")
    }

    // Set the source to start loading
    img.src = svgUrl
  } catch (error) {
    console.error("Error downloading pattern:", error)
    alert("Failed to download pattern. Please try again.")
  }
}

// Main function that tries both methods
export async function downloadPattern(svgElement: SVGElement, filename: string): Promise<void> {
  try {
    // First try the html2canvas method
    await captureSvgWithFabrics(svgElement, filename)
  } catch (error) {
    console.error("Primary download method failed, trying fallback:", error)
    // If that fails, try the direct method
    downloadSvgAsPng(svgElement, filename)
  }
}
