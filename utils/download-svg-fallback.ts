/**
 * Fallback utility function to download an SVG element as a PNG image
 * This uses a simpler approach that might work better in some browsers
 */
export const downloadSVGAsFallback = async (svgElement: SVGSVGElement, fileName = "quilt-pattern") => {
  if (!svgElement) return

  try {
    // Get the SVG data as an XML string
    const svgData = new XMLSerializer().serializeToString(svgElement)

    // Add XML declaration and doctype if missing
    const svgBlob = new Blob(
      [
        '<?xml version="1.0" standalone="no"?>',
        '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">',
        svgData,
      ],
      { type: "image/svg+xml" },
    )

    // Create a URL for the SVG blob
    const url = URL.createObjectURL(svgBlob)

    // Create a download link
    const downloadLink = document.createElement("a")
    downloadLink.href = url
    downloadLink.download = `${fileName}.svg`

    // Trigger download
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
