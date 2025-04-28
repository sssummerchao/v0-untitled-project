/**
 * A utility for capturing SVG elements with their styles
 */

export function captureSvg(svgElement: SVGElement, filename: string): void {
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
    // Create a deep clone of the SVG
    const svgClone = svgElement.cloneNode(true) as SVGElement

    // Add a white background rectangle
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
    rect.setAttribute("width", "100%")
    rect.setAttribute("height", "100%")
    rect.setAttribute("fill", "white")
    svgClone.insertBefore(rect, svgClone.firstChild)

    // Get the SVG data with proper XML declaration
    const svgData = new XMLSerializer().serializeToString(svgClone)
    const svgBlob = new Blob([svgData], { type: "image/svg+xml" })
    const svgUrl = URL.createObjectURL(svgBlob)

    // Create an image to load the SVG
    const img = new Image()
    img.onload = () => {
      // Create a canvas to draw the image
      const canvas = document.createElement("canvas")

      // Set canvas dimensions to match the SVG
      canvas.width = img.width
      canvas.height = img.height

      // Get the canvas context
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        throw new Error("Could not get canvas context")
      }

      // Draw the image on the canvas
      ctx.drawImage(img, 0, 0)

      try {
        // Convert to PNG and download
        const pngUrl = canvas.toDataURL("image/png")
        const link = document.createElement("a")
        link.download = filename
        link.href = pngUrl
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // Clean up
        URL.revokeObjectURL(svgUrl)
        document.body.removeChild(notification)
      } catch (error) {
        console.error("Error creating PNG:", error)

        // Fallback to SVG download
        const link = document.createElement("a")
        link.download = filename.replace(".png", ".svg")
        link.href = svgUrl
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        document.body.removeChild(notification)
        alert("Downloaded as SVG instead of PNG due to browser limitations.")
      }
    }

    img.onerror = () => {
      console.error("Error loading SVG as image")

      // Fallback to SVG download
      const link = document.createElement("a")
      link.download = filename.replace(".png", ".svg")
      link.href = svgUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      URL.revokeObjectURL(svgUrl)
      document.body.removeChild(notification)
      alert("Downloaded as SVG instead of PNG due to browser limitations.")
    }

    // Set the source to start loading
    img.src = svgUrl
  } catch (error) {
    console.error("Error capturing SVG:", error)
    document.body.removeChild(notification)
    alert("Failed to capture SVG. Please try again.")
  }
}
