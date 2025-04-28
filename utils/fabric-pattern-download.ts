/**
 * A utility for downloading SVG patterns with fabric textures
 */

export function downloadFabricPattern(svgElement: SVGElement, filename: string): void {
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

  try {
    // Get all pattern elements with fabric backgrounds
    const patternElements = svgElement.querySelectorAll('[style*="url(#pattern"]')
    const defs = svgElement.querySelector("defs")

    if (!defs) {
      throw new Error("SVG does not contain defs element")
    }

    // Clone the SVG to avoid modifying the original
    const svgClone = svgElement.cloneNode(true) as SVGElement

    // Add white background
    const bgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
    bgRect.setAttribute("width", "100%")
    bgRect.setAttribute("height", "100%")
    bgRect.setAttribute("fill", "white")
    svgClone.insertBefore(bgRect, svgClone.firstChild)

    // Get SVG dimensions
    const svgWidth = svgClone.getAttribute("width") || "800"
    const svgHeight = svgClone.getAttribute("height") || "800"
    const viewBox = svgClone.getAttribute("viewBox") || `0 0 ${svgWidth} ${svgHeight}`

    // Ensure SVG has explicit dimensions
    if (!svgClone.hasAttribute("width")) {
      svgClone.setAttribute("width", svgWidth)
    }
    if (!svgClone.hasAttribute("height")) {
      svgClone.setAttribute("height", svgHeight)
    }
    if (!svgClone.hasAttribute("viewBox")) {
      svgClone.setAttribute("viewBox", viewBox)
    }

    // Convert SVG to a data URL
    const serializer = new XMLSerializer()
    const svgString = serializer.serializeToString(svgClone)
    const svgBlob = new Blob([svgString], { type: "image/svg+xml" })
    const svgUrl = URL.createObjectURL(svgBlob)

    // Create an image from the SVG
    const img = new Image()
    img.onload = () => {
      // Create a canvas with the same dimensions
      const canvas = document.createElement("canvas")
      const width = Number.parseInt(svgWidth)
      const height = Number.parseInt(svgHeight)
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

        // Fallback to SVG download
        const link = document.createElement("a")
        link.download = filename.replace(".png", ".svg")
        link.href = svgUrl
        link.click()

        document.body.removeChild(notification)
        alert("Downloaded as SVG instead of PNG due to browser limitations.")
      }
    }

    img.onerror = (error) => {
      console.error("Error loading SVG as image:", error)

      // Fallback to direct SVG download
      const link = document.createElement("a")
      link.download = filename.replace(".png", ".svg")
      link.href = svgUrl
      link.click()

      URL.revokeObjectURL(svgUrl)
      document.body.removeChild(notification)
      alert("Downloaded as SVG instead of PNG due to browser limitations.")
    }

    // Set the source to start loading
    img.src = svgUrl
  } catch (error) {
    console.error("Error downloading pattern:", error)
    document.body.removeChild(notification)
    alert("Failed to download pattern. Please try again.")
  }
}
