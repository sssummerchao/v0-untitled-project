/**
 * A simplified utility to convert DOM nodes to images
 */
export const domToImage = {
  toPng: (node: HTMLElement | SVGElement, options: any = {}): Promise<string> =>
    new Promise((resolve, reject) => {
      try {
        const width = options.width || node.clientWidth || 800
        const height = options.height || node.clientHeight || 800

        // Create a canvas
        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          reject(new Error("Could not get canvas context"))
          return
        }

        // Fill with white background
        ctx.fillStyle = "white"
        ctx.fillRect(0, 0, width, height)

        // Convert node to an image
        const svgData = new XMLSerializer().serializeToString(node)
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
        const DOMURL = window.URL || window.webkitURL || window
        const url = DOMURL.createObjectURL(svgBlob)

        const img = new Image()
        img.crossOrigin = "Anonymous"

        img.onload = () => {
          ctx.drawImage(img, 0, 0, width, height)
          DOMURL.revokeObjectURL(url)

          try {
            const dataUrl = canvas.toDataURL("image/png")
            resolve(dataUrl)
          } catch (e) {
            reject(e)
          }
        }

        img.onerror = () => {
          DOMURL.revokeObjectURL(url)
          reject(new Error("Image loading error"))
        }

        img.src = url
      } catch (e) {
        reject(e)
      }
    }),
}
