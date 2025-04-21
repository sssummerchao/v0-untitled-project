/**
 * Utility function to take a screenshot of an element
 */
export const takeScreenshot = (element: HTMLElement, fileName = "screenshot") => {
  if (!element) return

  try {
    // Create a canvas element
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      throw new Error("Could not get canvas context")
    }

    // Set canvas dimensions to match element
    const rect = element.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    // Create a new Image
    const img = new Image()

    // Convert element to data URL using html2canvas
    const html2canvas = window.html2canvas
    if (!html2canvas) {
      throw new Error("html2canvas not found")
    }

    html2canvas(element, {
      allowTaint: true,
      useCORS: true,
      backgroundColor: "white",
    }).then((canvas) => {
      // Convert canvas to data URL
      const imgUrl = canvas.toDataURL("image/png")

      // Create download link
      const downloadLink = document.createElement("a")
      downloadLink.href = imgUrl
      downloadLink.download = `${fileName}.png`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    })
  } catch (error) {
    console.error("Error taking screenshot:", error)
    alert("Failed to take screenshot. Please try again.")
  }
}
