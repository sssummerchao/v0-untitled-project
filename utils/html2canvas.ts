/**
 * A simplified version of html2canvas for capturing SVG elements
 */

// Define the html2canvas function
export function html2canvas(element: HTMLElement | SVGElement, options: any = {}): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    try {
      // Get dimensions
      const width = options.width || element.clientWidth || 800
      const height = options.height || element.clientHeight || 800

      // Create canvas
      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        throw new Error("Could not get canvas context")
      }

      // Fill with white background
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, width, height)

      // For SVG elements, we need to convert to an image first
      if (element instanceof SVGElement) {
        const svgData = new XMLSerializer().serializeToString(element)
        const img = new Image()
        img.crossOrigin = "Anonymous"

        // Create a data URL from the SVG
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
        const url = URL.createObjectURL(svgBlob)

        img.onload = () => {
          // Draw the image onto the canvas
          ctx.drawImage(img, 0, 0, width, height)
          URL.revokeObjectURL(url)
          resolve(canvas)
        }

        img.onerror = (e) => {
          URL.revokeObjectURL(url)
          reject(new Error("Failed to load SVG as image"))
        }

        img.src = url
      } else {
        // For regular HTML elements (not implemented here)
        reject(new Error("Only SVG elements are supported"))
      }
    } catch (error) {
      reject(error)
    }
  })
}
