/**
 * Downloads a pattern as a PNG image with all textures properly rendered
 */
export function downloadPattern(svgElement: SVGElement, fileName: string) {
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

  try {
    // Create a container for the SVG
    const container = document.createElement("div")
    container.style.position = "fixed"
    container.style.top = "0"
    container.style.left = "0"
    container.style.width = "100%"
    container.style.height = "100%"
    container.style.zIndex = "-9999"
    container.style.visibility = "hidden"
    container.style.pointerEvents = "none"
    container.style.background = "white"
    document.body.appendChild(container)

    // Clone the SVG to avoid modifying the original
    const svgClone = svgElement.cloneNode(true) as SVGElement

    // Make sure the SVG is visible and has dimensions
    svgClone.style.width = "800px"
    svgClone.style.height = "800px"
    svgClone.style.display = "block"

    // Add the SVG to the container
    container.appendChild(svgClone)

    // Use html2canvas to capture the SVG with all its textures
    setTimeout(() => {
      // Create a canvas
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        throw new Error("Could not get canvas context")
      }

      // Set canvas dimensions
      canvas.width = 800
      canvas.height = 800

      // Fill with white background
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Get all image elements in the SVG
      const images = Array.from(svgClone.querySelectorAll("image"))
      let loadedImages = 0
      const totalImages = images.length

      // If there are no images, render immediately
      if (totalImages === 0) {
        renderSVG()
      } else {
        // Ensure all images are loaded before rendering
        images.forEach((img) => {
          const imgElement = new Image()
          imgElement.crossOrigin = "anonymous"
          imgElement.onload = () => {
            loadedImages++
            if (loadedImages === totalImages) {
              renderSVG()
            }
          }
          imgElement.onerror = () => {
            loadedImages++
            if (loadedImages === totalImages) {
              renderSVG()
            }
          }

          // Get the href attribute (which contains the image URL)
          const href = img.getAttribute("href") || img.getAttribute("xlink:href")
          if (href) {
            imgElement.src = href
          } else {
            loadedImages++
            if (loadedImages === totalImages) {
              renderSVG()
            }
          }
        })
      }

      function renderSVG() {
        try {
          // Convert SVG to a data URL
          const serializer = new XMLSerializer()
          const svgString = serializer.serializeToString(svgClone)
          const svgBlob = new Blob([svgString], { type: "image/svg+xml" })
          const url = URL.createObjectURL(svgBlob)

          // Create an image from the SVG
          const img = new Image()
          img.crossOrigin = "anonymous"

          img.onload = () => {
            // Draw the image on the canvas
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

            // Convert to PNG and download
            try {
              const dataUrl = canvas.toDataURL("image/png")
              const link = document.createElement("a")
              link.download = fileName
              link.href = dataUrl
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)

              // Clean up
              URL.revokeObjectURL(url)
              document.body.removeChild(container)
              document.body.removeChild(notification)
            } catch (error) {
              console.error("Error creating PNG:", error)
              document.body.removeChild(container)
              document.body.removeChild(notification)
              alert("Failed to create PNG. Please try again.")
            }
          }

          img.onerror = (error) => {
            console.error("Error loading SVG as image:", error)
            document.body.removeChild(container)
            document.body.removeChild(notification)
            alert("Failed to create PNG. Please try again.")
          }

          img.src = url
        } catch (error) {
          console.error("Error rendering SVG:", error)
          document.body.removeChild(container)
          document.body.removeChild(notification)
          alert("Failed to create PNG. Please try again.")
        }
      }
    }, 100)
  } catch (error) {
    console.error("Error downloading pattern:", error)
    document.body.removeChild(notification)
    alert("Failed to download pattern. Please try again.")
  }
}
