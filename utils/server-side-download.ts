/**
 * Utility function to download an SVG element as a PNG image using server-side rendering
 */
export const downloadPatternServerSide = async (svgElement: SVGSVGElement, fileName = "quilt-pattern") => {
  if (!svgElement) return false

  try {
    // Show loading state in the UI
    const loadingToast = document.createElement("div")
    loadingToast.className = "fixed top-4 right-4 bg-black text-white p-4 rounded-lg shadow-lg z-50"
    loadingToast.textContent = "Generating PNG image..."
    document.body.appendChild(loadingToast)

    // Get the SVG content
    const svgContent = svgElement.outerHTML
    const width = svgElement.clientWidth
    const height = svgElement.clientHeight

    // Call our API endpoint
    const response = await fetch("/api/convert-pattern", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        svgContent,
        width,
        height,
      }),
    })

    // Remove loading toast
    document.body.removeChild(loadingToast)

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`)
    }

    // Get the blob from the response
    const blob = await response.blob()

    // Create a download link
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${fileName}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    return true
  } catch (error) {
    console.error("Error downloading pattern:", error)
    alert("Failed to download pattern. Please try again.")
    return false
  }
}
