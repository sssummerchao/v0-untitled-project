/**
 * A function to take a screenshot of an element and download it as a PNG
 */
export const downloadElementAsScreenshot = async (element: HTMLElement | SVGElement, fileName = "quilt-pattern") => {
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

    // Get the position and dimensions of the element
    const rect = element.getBoundingClientRect()

    // Create a canvas element
    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d")

    if (!context) {
      throw new Error("Could not get canvas context")
    }

    // Set canvas dimensions to match the element
    canvas.width = rect.width
    canvas.height = rect.height

    // Draw a white background
    context.fillStyle = "white"
    context.fillRect(0, 0, canvas.width, canvas.height)

    // Create an image from the element using html2canvas approach
    const svgData = new XMLSerializer().serializeToString(element as SVGElement)
    const img = new Image()

    // Create a data URL from the SVG
    const svgBlob = new Blob([svgData], { type: "image/svg+xml" })
    const url = URL.createObjectURL(svgBlob)

    // Return a promise that resolves when the image is loaded and processed
    return new Promise<void>((resolve, reject) => {
      img.onload = () => {
        try {
          // Draw the image onto the canvas
          context.drawImage(img, 0, 0)

          // Convert the canvas to a data URL and download it
          const dataUrl = canvas.toDataURL("image/png")

          // Create a download link
          const link = document.createElement("a")
          link.href = dataUrl
          link.download = `${fileName}.png`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)

          // Clean up
          URL.revokeObjectURL(url)
          document.body.removeChild(notification)
          resolve()
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = (error) => {
        URL.revokeObjectURL(url)
        document.body.removeChild(notification)
        reject(error)
      }

      // Set the image source to the SVG data URL
      img.src = url
    })
  } catch (error) {
    console.error("Error taking screenshot:", error)
    alert("Failed to download as PNG. Please try again.")
    return Promise.reject(error)
  }
}
