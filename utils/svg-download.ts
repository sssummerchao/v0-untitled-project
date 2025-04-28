/**
 * A function to download the pattern as a PNG using a screenshot-like approach
 */
export const downloadSvgAsPng = async (svgElement: SVGSVGElement, fileName = "quilt-pattern") => {
  try {
    // Create a notification
    const notification = document.createElement("div")
    notification.textContent = "Generating PNG..."
    notification.style.position = "fixed"
    notification.style.top = "20px"
    notification.style.right = "20px"
    notification.style.padding = "10px 20px"
    notification.style.background = "black"
    notification.style.color = "white"
    notification.style.borderRadius = "5px"
    notification.style.zIndex = "9999"
    document.body.appendChild(notification)

    // Get the dimensions of the SVG
    const bbox = svgElement.getBoundingClientRect()
    const width = bbox.width
    const height = bbox.height

    // Create a canvas with the same dimensions
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      throw new Error("Could not get canvas context")
    }

    // Fill with white background
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Get the SVG as a string
    const svgString = new XMLSerializer().serializeToString(svgElement)

    // Create a data URL from the SVG string
    const svgBlob = new Blob([svgString], { type: "image/svg+xml" })
    const url = URL.createObjectURL(svgBlob)

    // Create an image element
    const img = new Image()

    // Set up a promise to wait for the image to load
    const imageLoaded = new Promise<void>((resolve, reject) => {
      img.onload = () => {
        try {
          // Draw the image on the canvas
          ctx.drawImage(img, 0, 0, width, height)
          resolve()
        } catch (err) {
          reject(err)
        }
      }
      img.onerror = (err) => reject(err)
    })

    // Set the source of the image
    img.src = url

    // Wait for the image to load
    await imageLoaded

    // Convert the canvas to a data URL
    const dataUrl = canvas.toDataURL("image/png")

    // Create a link element
    const link = document.createElement("a")
    link.download = `${fileName}.png`
    link.href = dataUrl

    // Click the link to download the image
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Clean up
    URL.revokeObjectURL(url)
    document.body.removeChild(notification)

    return true
  } catch (error) {
    console.error("Error converting SVG to PNG:", error)
    alert("Failed to download as PNG. Please try again.")
    return false
  }
}
