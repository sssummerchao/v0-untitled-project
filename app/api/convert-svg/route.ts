import { type NextRequest, NextResponse } from "next/server"
import sharp from "sharp"
import { JSDOM } from "jsdom"

export async function POST(req: NextRequest) {
  try {
    const { svgString } = await req.json()

    if (!svgString) {
      return NextResponse.json({ error: "SVG string is required" }, { status: 400 })
    }

    // Parse the SVG to get dimensions
    const dom = new JSDOM(`<!DOCTYPE html><body>${svgString}</body>`)
    const svgElement = dom.window.document.querySelector("svg")

    if (!svgElement) {
      return NextResponse.json({ error: "Invalid SVG" }, { status: 400 })
    }

    // Convert SVG to PNG using sharp
    const pngBuffer = await sharp(Buffer.from(svgString))
      .resize(1200, 1200, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png()
      .toBuffer()

    // Return the PNG as a base64 string
    const base64Image = `data:image/png;base64,${pngBuffer.toString("base64")}`

    return NextResponse.json({ imageData: base64Image })
  } catch (error) {
    console.error("Error converting SVG to PNG:", error)
    return NextResponse.json({ error: "Failed to convert SVG to PNG" }, { status: 500 })
  }
}
