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
