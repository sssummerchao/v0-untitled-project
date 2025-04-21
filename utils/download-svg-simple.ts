/**
 * Simple utility function to download an SVG element as an image
 * This uses the browser's built-in canvas capabilities
 */
export const downloadSVGSimple = (svgElement: SVGSVGElement, fileName = "quilt-pattern") => {
  if (!svgElement) return

  try {
    // Create a canvas element
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      throw new Error("Could not get canvas context")
    }

    // Set canvas dimensions to match SVG
    const svgRect = svgElement.getBoundingClientRect()
    canvas.width = svgRect.width * 2 // Higher resolution
    canvas.height = svgRect.height * 2 // Higher resolution

    // Scale for higher resolution
    ctx.scale(2, 2)

    // Set white background
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Convert SVG to data URL
    const svgData = new XMLSerializer().serializeToString(svgElement)
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
    const URL = window.URL || window.webkitURL || window
    const svgUrl = URL.createObjectURL(svgBlob)

    // Create image from SVG
    const img = new Image()
    img.onload = () => {
      // Draw image to canvas
      ctx.drawImage(img, 0, 0, svgRect.width, svgRect.height)

      // Convert canvas to data URL
      const imgUrl = canvas.toDataURL("image/png")

      // Create download link
      const downloadLink = document.createElement("a")
      downloadLink.href = imgUrl
      downloadLink.download = `${fileName}.png`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)

      // Clean up
      URL.revokeObjectURL(svgUrl)
    }

    // Handle errors
    img.onerror = () => {
      console.error("Error loading SVG as image")
      // Fall back to SVG download
      downloadSVGDirect(svgElement, fileName)
    }

    // Set image source to SVG URL
    img.src = svgUrl
  } catch (error) {
    console.error("Error downloading SVG as image:", error)
    alert("Failed to download as PNG. Trying SVG download instead.")
    // Fall back to SVG download
    downloadSVGDirect(svgElement, fileName)
  }
}

/**
 * Simple utility function to download an SVG element directly as an SVG file
 */
export const downloadSVGDirect = (svgElement: SVGSVGElement, fileName = "quilt-pattern") => {
  if (!svgElement) return

  try {
    // Get the SVG data as an XML string
    const svgData = new XMLSerializer().serializeToString(svgElement)

    // Create a blob with the SVG data
    const svgBlob = new Blob([svgData], { type: "image/svg+xml" })

    // Create a URL for the blob
    const url = URL.createObjectURL(svgBlob)

    // Create a download link
    const downloadLink = document.createElement("a")
    downloadLink.href = url
    downloadLink.download = `${fileName}.svg`

    // Trigger the download
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)

    // Clean up
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error("Error downloading SVG:", error)
    alert("Failed to download SVG. Please try again.")
  }
}
