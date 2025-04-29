"use client"

import type React from "react"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { useState, useRef, useEffect } from "react"

// Define a type for the draggable quilt images
type QuiltImage = {
  id: number
  src: string
  alt: string
  width: number
  height: number
  initialPosition: { x: number; y: number }
  rotation: number
}

export default function Home() {
  // Define the quilt images with their initial positions
  // These positions are now the "remembered" positions from the previous state
  const initialQuilts: QuiltImage[] = [
    // Corner quilts
    {
      id: 1,
      src: "/north-star-quilt.png",
      alt: "North Star quilt pattern",
      width: 300,
      height: 300,
      initialPosition: { x: -30, y: -30 },
      rotation: 7.37,
    },
    {
      id: 2,
      src: "/crossroads-quilt.png",
      alt: "Crossroads quilt pattern",
      width: 300,
      height: 300,
      initialPosition: { x: 30, y: -30 },
      rotation: 3.17,
    },
    {
      id: 3,
      src: "/log-cabin-quilt.png",
      alt: "Log Cabin quilt pattern",
      width: 300,
      height: 300,
      initialPosition: { x: -30, y: 30 },
      rotation: -8.09,
    },
    {
      id: 4,
      src: "/bear-paws-quilt.png",
      alt: "Bear Paw quilt pattern",
      width: 300,
      height: 300,
      initialPosition: { x: 30, y: 30 },
      rotation: 6.48,
    },
    // Additional quilts - center-top and center-bottom
    {
      id: 5,
      src: "/northstar-special.png",
      alt: "North Star special quilt pattern",
      width: 250,
      height: 250,
      initialPosition: { x: 0, y: -200 }, // Center-top position
      rotation: 15,
    },
    {
      id: 6,
      src: "/bear-paws-special.png",
      alt: "Bear Paw special quilt pattern",
      width: 250,
      height: 250,
      initialPosition: { x: 0, y: 200 }, // Center-bottom position, same distance as North Star
      rotation: -12,
    },
  ]

  // State to track the current position of each quilt
  const [quilts, setQuilts] = useState(initialQuilts)

  // State to track which quilt is being dragged
  const [activeDragId, setActiveDragId] = useState<number | null>(null)

  // Ref to store the initial mouse position when dragging starts
  const dragStartRef = useRef({ x: 0, y: 0 })

  // Ref to store the container dimensions
  const containerRef = useRef<HTMLDivElement>(null)

  // Function to reset quilts to their initial positions
  const resetQuiltPositions = () => {
    setQuilts(initialQuilts)
  }

  // Function to handle the start of dragging
  const handleDragStart = (e: React.MouseEvent, id: number) => {
    e.preventDefault()
    setActiveDragId(id)
    dragStartRef.current = { x: e.clientX, y: e.clientY }
  }

  // Function to handle dragging
  const handleDrag = (e: MouseEvent) => {
    if (activeDragId === null) return

    const deltaX = e.clientX - dragStartRef.current.x
    const deltaY = e.clientY - dragStartRef.current.y

    setQuilts((prevQuilts) =>
      prevQuilts.map((quilt) =>
        quilt.id === activeDragId
          ? {
              ...quilt,
              initialPosition: {
                x: quilt.initialPosition.x + deltaX / 10, // Divide by 10 to make movement less sensitive
                y: quilt.initialPosition.y + deltaY / 10,
              },
            }
          : quilt,
      ),
    )

    dragStartRef.current = { x: e.clientX, y: e.clientY }
  }

  // Function to handle the end of dragging
  const handleDragEnd = () => {
    setActiveDragId(null)
  }

  // Add and remove event listeners for mouse movement and mouse up
  useEffect(() => {
    if (activeDragId !== null) {
      window.addEventListener("mousemove", handleDrag)
      window.addEventListener("mouseup", handleDragEnd)
    }

    return () => {
      window.removeEventListener("mousemove", handleDrag)
      window.removeEventListener("mouseup", handleDragEnd)
    }
  }, [activeDragId])

  return (
    <main
      className="min-h-screen flex items-center justify-center overflow-hidden relative"
      style={{
        background: `
          linear-gradient(to right, #f0f0f0 1px, transparent 1px),
          linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
        backgroundColor: "white",
      }}
      ref={containerRef}
    >
      {/* Render all quilt images */}
      {quilts.map((quilt, index) => {
        // Determine position class based on index for the corner quilts (first 4)
        let positionClass = "absolute"
        let positionStyle = {}

        if (index < 4) {
          // Corner quilts
          positionClass +=
            index === 0
              ? " top-0 left-0"
              : index === 1
                ? " top-0 right-0"
                : index === 2
                  ? " bottom-0 left-0"
                  : " bottom-0 right-0"

          positionStyle = {
            transform: `translate(${quilt.initialPosition.x}%, ${quilt.initialPosition.y}%)`,
          }
        } else {
          // Middle quilts (the new ones)
          positionStyle = {
            top: `calc(50% + ${quilt.initialPosition.y}px)`,
            left: `calc(50% + ${quilt.initialPosition.x}px)`,
            transform: `translate(-50%, -50%)`,
          }
        }

        return (
          <div
            key={quilt.id}
            className={`${positionClass} cursor-grab ${activeDragId === quilt.id ? "cursor-grabbing z-20" : "z-10"}`}
            style={{
              ...positionStyle,
              width: `${quilt.width}px`,
              height: `${quilt.height}px`,
              transition: activeDragId === quilt.id ? "none" : "all 0.3s ease-out",
            }}
            onMouseDown={(e) => handleDragStart(e, quilt.id)}
          >
            <Image
              src={quilt.src || "/placeholder.svg"}
              alt={quilt.alt}
              width={quilt.width}
              height={quilt.height}
              style={{
                objectFit: "contain",
                transform: `rotate(${quilt.rotation}deg)`,
                opacity: 0.8,
                pointerEvents: "none", // Prevent image from interfering with drag events
              }}
              draggable="false"
            />
          </div>
        )
      })}

      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-screen">
        <div className="max-w-4xl w-full text-center relative">
          {/* White card with 60% opacity for the main content */}
          <div
            className="py-16 px-8 relative z-30 rounded-2xl shadow-lg"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.6)",
              backdropFilter: "blur(5px)",
              pointerEvents: "auto",
            }}
          >
            <h1 className="text-6xl font-bold text-gray-900 mb-6">Community Threads</h1>

            <p className="text-xl text-gray-700 mb-4">For the Underground Railroad, quilts held hidden meanings.</p>

            <p className="text-xl text-gray-700 mb-12">
              Uncover the stories of each design by selecting a pattern and customizing its colors and stitches.
            </p>

            <div className="flex justify-center">
              <Link
                href="/patterns"
                className="inline-block"
                draggable="false"
                style={{ pointerEvents: "auto", position: "relative", zIndex: 50 }}
              >
                <div className="bg-black text-white rounded-full flex items-center px-6 py-3 hover:opacity-90 transition-opacity">
                  <span className="text-lg font-medium mr-2">Start Making</span>
                  <ArrowRight className="h-5 w-5" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Reset button */}
      <button
        onClick={resetQuiltPositions}
        className="fixed bottom-4 right-4 bg-white bg-opacity-80 text-black px-4 py-2 rounded-full shadow-md hover:bg-opacity-100 transition-all z-40"
      >
        Reset Quilts
      </button>
    </main>
  )
}
