import { type NextRequest, NextResponse } from "next/server"
import puppeteer from "puppeteer"

export async function POST(req: NextRequest) {
  try {
    const { svgContent, width, height } = await req.json()

    if (!svgContent) {
      return NextResponse.json({ error: "SVG content is required" }, { status: 400 })
    }

    // Create a simple HTML page with the SVG
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { margin: 0; background: white; }
            svg { display: block; }
          </style>
        </head>
        <body>
          ${svgContent}
        </body>
      </html>
    `

    // Launch a headless browser
    const browser = await puppeteer.launch({
      headless: "new",
    })

    try {
      const page = await browser.newPage()

      // Set viewport to match SVG dimensions
      await page.setViewport({
        width: width || 1080,
        height: height || 1080,
        deviceScaleFactor: 2, // Higher resolution
      })

      // Set content and wait for it to load
      await page.setContent(html, { waitUntil: "networkidle0" })

      // Take a screenshot
      const screenshot = await page.screenshot({
        type: "png",
        omitBackground: false,
      })

      // Return the PNG image
      return new NextResponse(screenshot, {
        headers: {
          "Content-Type": "image/png",
          "Content-Disposition": "attachment; filename=quilt-pattern.png",
        },
      })
    } finally {
      await browser.close()
    }
  } catch (error) {
    console.error("Error converting SVG to PNG:", error)
    return NextResponse.json({ error: "Failed to convert SVG to PNG" }, { status: 500 })
  }
}
