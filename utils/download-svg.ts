/**
 * Utility function to download an SVG element as a PNG image
 */
export const downloadSVGAsImage = async (svgElement: SVGSVGElement, fileName = "quilt-pattern") => {
  if (!svgElement) return

  try {
    // First, we need to load the html2canvas library dynamically
    const html2canvasModule = await import("html2canvas")
    const html2canvas = html2canvasModule.default

    // Create a container for the SVG to ensure proper rendering
    const container = document.createElement("div")
    container.style.position = "fixed"
    container.style.top = "0"
    container.style.left = "0"
    container.style.width = `${svgElement.clientWidth}px`
    container.style.height = `${svgElement.clientHeight}px`
    container.style.zIndex = "-9999"
    container.style.background = "white"
    container.style.pointerEvents = "none"

    // Clone the SVG to avoid modifying the original
    const svgClone = svgElement.cloneNode(true) as SVGSVGElement

    // Make sure all images are loaded
    const images = Array.from(svgClone.querySelectorAll("image"))

    // Wait for all images to load
    await Promise.all(
      images.map(
        (img) =>
          new Promise((resolve) => {
            if (img.getAttribute("href")) {
              const imgElement = new Image()
              imgElement.crossOrigin = "anonymous"
              imgElement.onload = resolve
              imgElement.onerror = resolve // Continue even if an image fails to load
              imgElement.src = img.getAttribute("href") || ""
            } else {
              resolve(null)
            }
          }),
      ),
    )

    container.appendChild(svgClone)
    document.body.appendChild(container)

    // Use html2canvas to capture the SVG
    const canvas = await html2canvas(container, {
      useCORS: true,
      allowTaint: true,
      backgroundColor: "white",
      scale: 2, // Higher quality
    })

    // Remove the temporary container
    document.body.removeChild(container)

    // Convert canvas to blob
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png", 1.0))

    if (!blob) throw new Error("Could not create image blob")

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
  } catch (error) {
    console.error("Error downloading SVG as image:", error)
    alert("Failed to download image. Please try again.")
  }
}
