/**
 * A utility for capturing and downloading quilt patterns using html-to-image
 */
import { loadHtmlToImage } from "./html-to-image-loader"

// Main function to download the pattern
export async function downloadPattern(svgElement: SVGElement, filename: string): Promise<void> {
  try {
    // Show loading notification
    const notification = createNotification("Preparing download...")

    // Prepare SVG for capture
    const preparedSvg = await prepareSvgForCapture(svgElement)

    // Load html-to-image library
    const htmlToImage = await loadHtmlToImage()

    try {
      // Use toPng from html-to-image
      const dataUrl = await htmlToImage.toPng(preparedSvg, {
        backgroundColor: "white",
        pixelRatio: 2, // Higher quality
        skipFonts: false,
        cacheBust: true,
        fetchRequestInit: { mode: "cors" },
      })

      // Download the image
      const link = document.createElement("a")
      link.download = filename
      link.href = dataUrl
      link.click()

      // Clean up
      document.body.removeChild(notification)
      if (preparedSvg !== svgElement) {
        document.body.removeChild(preparedSvg.parentElement as Node)
      }
    } catch (error) {
      console.error("Error creating PNG:", error)
      document.body.removeChild(notification)

      // Try fallback method
      await fallbackDownload(svgElement, filename)
    }
  } catch (error) {
    console.error("Error downloading pattern:", error)
    alert("Failed to download pattern. Please try again.")
  }
}

// Update the prepareSvgForCapture function to ensure drawing layers are visible
async function prepareSvgForCapture(svgElement: SVGElement): Promise<SVGElement> {
  // Clone the SVG to avoid modifying the original
  const svgClone = svgElement.cloneNode(true) as SVGElement

  // Get dimensions from the original SVG
  const width = svgElement.clientWidth || 1080
  const height = svgElement.clientHeight || 1080

  // Set explicit dimensions
  svgClone.setAttribute("width", width.toString())
  svgClone.setAttribute("height", height.toString())
  svgClone.style.width = `${width}px`
  svgClone.style.height = `${height}px`

  // Make sure drawing layers are visible in the clone
  const drawingGroups = svgClone.querySelectorAll("[data-drawing-group]")
  drawingGroups.forEach((group) => {
    if (group instanceof SVGElement || group instanceof HTMLElement) {
      group.style.display = "block"
      group.style.visibility = "visible"
      group.style.opacity = "1"
    }
  })

  // Create a container with white background
  const container = document.createElement("div")
  container.style.position = "fixed"
  container.style.left = "-9999px"
  container.style.top = "-9999px"
  container.style.background = "white"
  container.style.width = `${width}px`
  container.style.height = `${height}px`
  container.style.padding = "0"
  container.style.margin = "0"
  container.style.overflow = "hidden"

  // Add white background to SVG
  const bgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
  bgRect.setAttribute("width", "100%")
  bgRect.setAttribute("height", "100%")
  bgRect.setAttribute("fill", "white")
  svgClone.insertBefore(bgRect, svgClone.firstChild)

  // Append to container
  container.appendChild(svgClone)
  document.body.appendChild(container)

  // Wait for images to load
  await waitForImages(svgClone)

  return svgClone
}

// Wait for all images in the SVG to load
function waitForImages(svgElement: SVGElement): Promise<void> {
  return new Promise((resolve) => {
    const images = Array.from(svgElement.querySelectorAll("image"))

    if (images.length === 0) {
      resolve()
      return
    }

    let loadedCount = 0
    const checkAllLoaded = () => {
      loadedCount++
      if (loadedCount === images.length) {
        resolve()
      }
    }

    images.forEach((img) => {
      const href = img.getAttribute("href") || img.getAttribute("xlink:href")
      if (href) {
        const testImg = new Image()
        testImg.onload = checkAllLoaded
        testImg.onerror = checkAllLoaded
        testImg.src = href
      } else {
        checkAllLoaded()
      }
    })
  })
}

// Also update the fallbackDownload function to ensure drawing layers are visible
async function fallbackDownload(svgElement: SVGElement, filename: string): Promise<void> {
  try {
    const notification = createNotification("Trying alternative download method...")

    // Clone the SVG
    const svgClone = svgElement.cloneNode(true) as SVGElement

    // Get dimensions
    const width = svgElement.clientWidth || 1080
    const height = svgElement.clientHeight || 1080

    // Set explicit dimensions
    svgClone.setAttribute("width", width.toString())
    svgClone.setAttribute("height", height.toString())

    // Make sure drawing layers are visible in the clone
    const drawingGroups = svgClone.querySelectorAll("[data-drawing-group]")
    drawingGroups.forEach((group) => {
      if (group instanceof SVGElement || group instanceof HTMLElement) {
        group.style.display = "block"
        group.style.visibility = "visible"
        group.style.opacity = "1"
      }
    })

    // Add white background
    const bgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
    bgRect.setAttribute("width", "100%")
    bgRect.setAttribute("height", "100%")
    bgRect.setAttribute("fill", "white")
    svgClone.insertBefore(bgRect, svgClone.firstChild)

    // Convert SVG to a data URL
    const serializer = new XMLSerializer()
    const svgString = serializer.serializeToString(svgClone)
    const svgBlob = new Blob([svgString], { type: "image/svg+xml" })
    const svgUrl = URL.createObjectURL(svgBlob)

    // Create an image from the SVG
    const img = new Image()
    img.crossOrigin = "anonymous"

    // Create a promise to handle the image loading
    await new Promise<void>((resolve, reject) => {
      img.onload = () => {
        try {
          // Create a canvas
          const canvas = document.createElement("canvas")
          canvas.width = width
          canvas.height = height

          // Get canvas context and draw
          const ctx = canvas.getContext("2d")
          if (!ctx) {
            throw new Error("Could not get canvas context")
          }

          // Fill with white background
          ctx.fillStyle = "white"
          ctx.fillRect(0, 0, width, height)

          // Draw the SVG image
          ctx.drawImage(img, 0, 0, width, height)

          // Convert to PNG and download
          const pngUrl = canvas.toDataURL("image/png")
          const link = document.createElement("a")
          link.download = filename
          link.href = pngUrl
          link.click()

          // Clean up
          URL.revokeObjectURL(svgUrl)
          document.body.removeChild(notification)
          resolve()
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = (error) => {
        reject(error)
      }

      // Set the source to start loading
      img.src = svgUrl
    })
  } catch (error) {
    console.error("Fallback download failed:", error)
    alert("Failed to download pattern. Please try again.")
  }
}

// Create a notification element
function createNotification(message: string): HTMLDivElement {
  const notification = document.createElement("div")
  notification.textContent = message
  notification.style.position = "fixed"
  notification.style.top = "20px"
  notification.style.right = "20px"
  notification.style.padding = "10px 20px"
  notification.style.background = "black"
  notification.style.color = "white"
  notification.style.borderRadius = "5px"
  notification.style.zIndex = "9999"
  document.body.appendChild(notification)
  return notification
}
