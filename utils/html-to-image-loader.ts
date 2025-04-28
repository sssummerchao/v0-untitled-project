/**
 * Utility to dynamically load html-to-image library
 */

let htmlToImagePromise: Promise<any> | null = null

export function loadHtmlToImage(): Promise<any> {
  if (!htmlToImagePromise) {
    htmlToImagePromise = new Promise((resolve, reject) => {
      // Check if already loaded
      if (typeof window !== "undefined" && (window as any).htmlToImage) {
        resolve((window as any).htmlToImage)
        return
      }

      // Create script element
      const script = document.createElement("script")
      script.src = "https://unpkg.com/html-to-image@1.11.11/dist/html-to-image.js"
      script.async = true

      script.onload = () => {
        if (typeof window !== "undefined" && (window as any).htmlToImage) {
          resolve((window as any).htmlToImage)
        } else {
          reject(new Error("html-to-image failed to load"))
        }
      }

      script.onerror = () => {
        reject(new Error("Failed to load html-to-image"))
      }

      document.body.appendChild(script)
    })
  }

  return htmlToImagePromise
}
