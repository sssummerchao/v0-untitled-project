/**
 * Utility function to download an SVG element as a PNG image using the server API
 */
export const downloadSVGViaAPI = async (svgElement: SVGSVGElement, fileName = "quilt-pattern") => {
  if (!svgElement) return

  try {
    // Get the SVG as a string
    const svgString = new XMLSerializer().serializeToString(svgElement)

    // Call our API endpoint
    const response = await fetch("/api/convert-svg", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ svgString }),
    })

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data = await response.json()

    if (!data.imageData) {
      throw new Error("No image data returned from API")
    }

    // Create a download link for the base64 image
    const downloadLink = document.createElement("a")
    downloadLink.href = data.imageData
    downloadLink.download = `${fileName}.png`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
  } catch (error) {
    console.error("Error downloading SVG as image:", error)
    alert("Failed to download image. Please try again.")

    // Fallback to direct SVG download
    try {
      const svgData = new XMLSerializer().serializeToString(svgElement)
      const svgBlob = new Blob([svgData], { type: "image/svg+xml" })
      const url = URL.createObjectURL(svgBlob)

      const downloadLink = document.createElement("a")
      downloadLink.href = url
      downloadLink.download = `${fileName}.svg`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
      URL.revokeObjectURL(url)
    } catch (fallbackError) {
      console.error("Error with fallback download method:", fallbackError)
    }
  }
}
