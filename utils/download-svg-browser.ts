/**
 * A browser-friendly utility to download SVG patterns
 * This uses the most direct approach possible with browser APIs
 */
export const downloadSVG = (svgElement: SVGSVGElement, fileName = "quilt-pattern") => {
  if (!svgElement) return false

  try {
    // Clone the SVG to avoid modifying the original
    const svgClone = svgElement.cloneNode(true) as SVGSVGElement

    // Set a white background
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
    rect.setAttribute("width", "100%")
    rect.setAttribute("height", "100%")
    rect.setAttribute("fill", "white")
    svgClone.insertBefore(rect, svgClone.firstChild)

    // Get the SVG as a string with XML declaration
    const svgData = new XMLSerializer().serializeToString(svgClone)
    const svgBlob = new Blob(
      [
        '<?xml version="1.0" standalone="no"?>',
        '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">',
        svgData,
      ],
      { type: "image/svg+xml" },
    )

    // Create a download link for the SVG
    const svgUrl = URL.createObjectURL(svgBlob)
    const downloadLink = document.createElement("a")
    downloadLink.href = svgUrl
    downloadLink.download = `${fileName}.svg`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)

    // Clean up
    URL.revokeObjectURL(svgUrl)

    return true
  } catch (error) {
    console.error("Error downloading SVG:", error)
    alert("Failed to download pattern. Please try again.")
    return false
  }
}
