import { html2canvas } from "./html2canvas"

export async function downloadPattern(svgElement: SVGElement, filename: string): Promise<void> {
  try {
    // Show notification
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

    // Create a clone of the SVG element
    const svgClone = svgElement.cloneNode(true) as SVGElement

    // Add a white background rectangle
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
    rect.setAttribute("width", "100%")
    rect.setAttribute("height", "100%")
    rect.setAttribute("fill", "white")
    svgClone.insertBefore(rect, svgClone.firstChild)

    // Temporarily add the clone to the document to ensure proper rendering
    svgClone.style.position = "absolute"
    svgClone.style.top = "-9999px"
    svgClone.style.left = "-9999px"
    document.body.appendChild(svgClone)

    // Use html2canvas to capture the SVG
    const canvas = await html2canvas(svgClone, {
      width: 800,
      height: 800,
      scale: 2, // Higher resolution
    })

    // Remove the temporary SVG
    document.body.removeChild(svgClone)

    // Convert canvas to data URL
    const dataUrl = canvas.toDataURL("image/png")

    // Create download link
    const link = document.createElement("a")
    link.href = dataUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Remove notification
    document.body.removeChild(notification)
  } catch (error) {
    console.error("Error downloading pattern:", error)
    alert("Failed to download pattern. Please try again.")
  }
}
