/**
 * A very simple utility to download the SVG as a PNG using a data URL approach
 */
export const downloadSimplePNG = (svgElement: SVGSVGElement, fileName = "quilt-pattern") => {
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

    // Create an image element to load the SVG
    const img = new Image()
    img.crossOrigin = "anonymous"

    // Convert SVG to data URL
    const svgData = new XMLSerializer().serializeToString(svgElement)
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(svgBlob)

    // When the image loads, draw it to the canvas and download
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
        // Create a link to download the image
        const a = document.createElement("a")
        a.download = `${fileName}.png`

        // Use toBlob for better browser compatibility
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              throw new Error("Could not create PNG blob")
            }

            const url = URL.createObjectURL(blob)
            a.href = url
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
          },
          "image/png",
          1.0,
        )
      } catch (error) {
        console.error("Error creating PNG:", error)
        alert("Failed to create PNG. Please try again.")
      }

      // Clean up
      URL.revokeObjectURL(url)
    }

    // Handle errors
    img.onerror = (error) => {
      console.error("Error loading SVG as image:", error)
      URL.revokeObjectURL(url)
      alert("Failed to load SVG. Please try again.")
    }

    // Set the source to the SVG URL
    img.src = url

    return true
  } catch (error) {
    console.error("Error in download process:", error)
    alert("Failed to download pattern. Please try again.")
    return false
  }
}
