"use client"

import type React from "react"

import { Camera } from "lucide-react"
import { useState } from "react"

interface ScreenshotButtonProps {
  targetRef: React.RefObject<HTMLElement>
  fileName?: string
}

export default function ScreenshotButton({ targetRef, fileName = "screenshot" }: ScreenshotButtonProps) {
  const [isTaking, setIsTaking] = useState(false)

  const takeScreenshot = async () => {
    if (!targetRef.current) return

    setIsTaking(true)
    try {
      // Dynamically import html2canvas
      const html2canvasModule = await import("html2canvas")
      const html2canvas = html2canvasModule.default

      // Take screenshot
      const canvas = await html2canvas(targetRef.current, {
        allowTaint: true,
        useCORS: true,
        backgroundColor: "white",
        scale: 2, // Higher resolution
      })

      // Convert canvas to data URL
      const imgUrl = canvas.toDataURL("image/png")

      // Create download link
      const downloadLink = document.createElement("a")
      downloadLink.href = imgUrl
      downloadLink.download = `${fileName}.png`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    } catch (error) {
      console.error("Error taking screenshot:", error)
      alert("Failed to take screenshot. Please try again.")
    } finally {
      setIsTaking(false)
    }
  }

  return (
    <button
      onClick={takeScreenshot}
      disabled={isTaking}
      className="bg-white border border-black text-black rounded-full flex items-center pr-6 pl-2 py-2 hover:bg-gray-50 transition-colors disabled:opacity-50"
    >
      <div className="bg-gray-200 rounded-full p-2 mr-3">
        <Camera size={16} className="text-black" />
      </div>
      <span className="text-lg font-serif font-bold">{isTaking ? "Taking Screenshot..." : "Take Screenshot"}</span>
    </button>
  )
}
