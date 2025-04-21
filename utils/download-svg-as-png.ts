/**
 * Utility function to download an SVG element as a PNG image
 * This uses a more reliable canvas-based approach
 */
export const downloadSVGAsPNG = (svgElement: SVGSVGElement, fileName = "quilt-pattern") => {
  if (!svgElement) return false

  try {
    // Create a canvas element
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      throw new Error("Could not get canvas context")
    }

    // Set canvas dimensions to match SVG with higher resolution
    const scale = 2 // Higher resolution
    canvas.width = svgElement.clientWidth * scale
    canvas.height = svgElement.clientHeight * scale

    // Create a blob from the SVG
    const svgData = new XMLSerializer().serializeToString(svgElement)
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(svgBlob)

    // Create an image to draw to canvas
    const img = new Image()
    img.crossOrigin = "anonymous" // Handle CORS issues

    // Set up image load handler
    img.onload = () => {
      // Fill with white background
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Scale for higher resolution
      ctx.scale(scale, scale)

      // Draw the image
      ctx.drawImage(img, 0, 0, svgElement.clientWidth, svgElement.clientHeight)

      // Convert to PNG and download
      try {
        // Use toBlob for better browser compatibility
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              throw new Error("Could not create PNG blob")
            }

            // Create download link
            const downloadUrl = URL.createObjectURL(blob)
            const downloadLink = document.createElement("a")
            downloadLink.href = downloadUrl
            downloadLink.download = `${fileName}.png`

            // Trigger download
            document.body.appendChild(downloadLink)
            downloadLink.click()
            document.body.removeChild(downloadLink)

            // Clean up
            URL.revokeObjectURL(downloadUrl)
          },
          "image/png",
          1.0,
        )
      } catch (canvasError) {
        console.error("Error creating PNG:", canvasError)
        alert("Failed to create PNG. Please try again in a different browser.")
      }

      // Clean up the SVG URL
      URL.revokeObjectURL(url)
    }

    // Handle image loading errors
    img.onerror = (error) => {
      console.error("Error loading SVG as image:", error)
      URL.revokeObjectURL(url)
      alert("Failed to convert to PNG. Please try again.")
    }

    // Set the image source to the SVG URL
    img.src = url

    return true
  } catch (error) {
    console.error("Error in download process:", error)
    alert("Failed to download pattern. Please try again.")
    return false
  }
}
