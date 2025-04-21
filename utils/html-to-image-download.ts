/**
 * A direct approach to download SVG as PNG using html-to-image library
 */
export const downloadWithHtmlToImage = async (svgElement: SVGSVGElement, fileName = "quilt-pattern") => {
  try {
    // Dynamically import html-to-image
    const htmlToImage = await import("html-to-image")

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

    // Convert SVG to PNG
    const dataUrl = await htmlToImage.toPng(svgElement, {
      backgroundColor: "white",
      pixelRatio: 2, // Higher quality
    })

    // Create download link
    const link = document.createElement("a")
    link.download = `${fileName}.png`
    link.href = dataUrl
    link.click()

    // Remove notification
    document.body.removeChild(notification)

    return true
  } catch (error) {
    console.error("Error converting SVG to PNG:", error)
    alert("Failed to download as PNG. Please try again.")
    return false
  }
}
