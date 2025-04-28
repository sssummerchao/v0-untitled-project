/**
 * Utility to dynamically load html2canvas
 */

let html2canvasPromise: Promise<any> | null = null

export function loadHtml2Canvas(): Promise<any> {
  if (!html2canvasPromise) {
    html2canvasPromise = new Promise((resolve, reject) => {
      // Check if already loaded
      if (typeof window !== "undefined" && (window as any).html2canvas) {
        resolve((window as any).html2canvas)
        return
      }

      // Create script element
      const script = document.createElement("script")
      script.src = "https://html2canvas.hertzen.com/dist/html2canvas.min.js"
      script.async = true

      script.onload = () => {
        if (typeof window !== "undefined" && (window as any).html2canvas) {
          resolve((window as any).html2canvas)
        } else {
          reject(new Error("html2canvas failed to load"))
        }
      }

      script.onerror = () => {
        reject(new Error("Failed to load html2canvas"))
      }

      document.body.appendChild(script)
    })
  }

  return html2canvasPromise
}
