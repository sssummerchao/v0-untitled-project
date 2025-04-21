/**
 * A simple and reliable utility to download SVG patterns as PNG images
 */
export const downloadPattern = (svgElement: SVGSVGElement, fileName = "quilt-pattern") => {
  if (!svgElement) return false

  try {
    // Get the SVG data
    const svgData = new XMLSerializer().serializeToString(svgElement)
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
    const svgUrl = URL.createObjectURL(svgBlob)

    // Create an Image object to load the SVG
    const img = new Image()
    img.crossOrigin = "anonymous"

    // Set up what happens when the image loads
    img.onload = () => {
      // Create a canvas to draw the image
      const canvas = document.createElement("canvas")
      const scale = 2 // Higher resolution
      canvas.width = svgElement.clientWidth * scale
      canvas.height = svgElement.clientHeight * scale

      // Get the canvas context and draw the image
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        console.error("Could not get canvas context")
        downloadSVGDirectly(svgElement, fileName)
        return
      }

      // Fill with white background
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Scale for higher resolution
      ctx.scale(scale, scale)

      // Draw the image
      ctx.drawImage(img, 0, 0, svgElement.clientWidth, svgElement.clientHeight)

      // Try to get the data URL and download
      try {
        const imgUrl = canvas.toDataURL("image/png")

        // Create and trigger download link
        const downloadLink = document.createElement("a")
        downloadLink.href = imgUrl
        downloadLink.download = `${fileName}.png`
        document.body.appendChild(downloadLink)
        downloadLink.click()
        document.body.removeChild(downloadLink)
      } catch (canvasError) {
        console.error("Error creating PNG from canvas:", canvasError)
        // Fall back to direct SVG download
        downloadSVGDirectly(svgElement, fileName)
      }

      // Clean up
      URL.revokeObjectURL(svgUrl)
    }

    // Handle image loading errors
    img.onerror = () => {
      console.error("Error loading SVG as image")
      downloadSVGDirectly(svgElement, fileName)
    }

    // Set the image source to the SVG URL
    img.src = svgUrl

    return true
  } catch (error) {
    console.error("Error in download process:", error)
    // Try direct SVG download as fallback
    return downloadSVGDirectly(svgElement, fileName)
  }
}

/**
 * Fallback function to download SVG directly
 */
const downloadSVGDirectly = (svgElement: SVGSVGElement, fileName = "quilt-pattern") => {
  try {
    // Get the SVG data
    const svgData = new XMLSerializer().serializeToString(svgElement)

    // Create a blob with the SVG data
    const svgBlob = new Blob([svgData], { type: "image/svg+xml" })

    // Create a URL for the blob
    const url = URL.createObjectURL(svgBlob)

    // Create and trigger download link
    const downloadLink = document.createElement("a")
    downloadLink.href = url
    downloadLink.download = `${fileName}.svg`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)

    // Clean up
    URL.revokeObjectURL(url)

    return true
  } catch (error) {
    console.error("Error downloading SVG directly:", error)
    alert("Failed to download pattern. Please try again in a different browser.")
    return false
  }
}
