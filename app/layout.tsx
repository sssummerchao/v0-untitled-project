import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Noto_Serif, Instrument_Sans } from "next/font/google"

const notoSerif = Noto_Serif({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-noto-serif",
})

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-instrument-sans",
})

export const metadata: Metadata = {
  title: "Community Threads - Quilt Patterns",
  description: "Explore the hidden meanings behind historical quilt patterns",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${notoSerif.variable} ${instrumentSans.variable} font-sans`}>{children}</body>
    </html>
  )
}
