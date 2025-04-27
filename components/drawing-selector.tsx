"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Pencil, X } from "lucide-react"
import ShapeDrawing from "./shape-drawing"

interface DrawingSelectorProps {
  svgRef: React.RefObject<SVGSVGElement>
  viewBox: string
}

export default function DrawingSelector({ svgRef, viewBox }: DrawingSelectorProps) {
  const [isSelectingShape, setIsSelectingShape] = useState(false)
  const [selectedShape, setSelectedShape] = useState<string | null>(null)
  const [isDrawingMode, setIsDrawingMode] = useState(false)
  const [shapesWithIds, setShapesWithIds] = useState<string[]>([])

  // Find all shapes with IDs when component mounts
  useEffect(() => {
    if (!svgRef.current) return

    // Find all elements with IDs or data-shape-id attributes
    const shapes = svgRef.current.querySelectorAll("[id], [data-shape-id]")
    const shapeIds: string[] = []

    shapes.forEach((shape) => {
      const id = shape.id || shape.getAttribute("data-shape-id")
      if (id && !id.startsWith("clip-") && !id.startsWith("defs-")) {
        shapeIds.push(id)
      }
    })

    setShapesWithIds(shapeIds)
  }, [svgRef])

  // Add click event listeners to shapes when in selection mode
  useEffect(() => {
    if (!svgRef.current || !isSelectingShape) return

    const handleShapeClick = (e: Event) => {
      e.stopPropagation()
      const target = e.target as SVGElement

      // Get the shape ID from data-shape-id attribute or id
      const shapeId = target.getAttribute("data-shape-id") || target.id

      if (shapeId) {
        setSelectedShape(shapeId)
        setIsDrawingMode(true)
        setIsSelectingShape(false)
      }
    }

    // Find all shapes in the SVG
    const shapes = svgRef.current.querySelectorAll("path, rect, circle, ellipse, polygon, polyline")

    // Add click event listeners
    shapes.forEach((shape) => {
      // Only add listeners to shapes that have IDs
      if (shape.id || shape.getAttribute("data-shape-id")) {
        shape.addEventListener("click", handleShapeClick)

        // Add a highlight class to indicate shapes are selectable
        shape.classList.add("shape-selectable")
      }
    })

    // Add a class to the SVG to indicate selection mode
    svgRef.current.classList.add("selecting-shapes")

    return () => {
      // Remove event listeners and classes when component unmounts or selection mode ends
      shapes.forEach((shape) => {
        if (shape.id || shape.getAttribute("data-shape-id")) {
          shape.removeEventListener("click", handleShapeClick)
          shape.classList.remove("shape-selectable")
        }
      })

      if (svgRef.current) {
        svgRef.current.classList.remove("selecting-shapes")
      }
    }
  }, [isSelectingShape, svgRef])

  return (
    <>
      <div className="fixed bottom-8 left-8 z-10">
        <button
          onClick={() => setIsSelectingShape(true)}
          className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          title="Draw on shapes"
        >
          <Pencil size={24} />
        </button>
      </div>

      {isSelectingShape && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-40 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Select a Shape to Draw On</h3>
              <button onClick={() => setIsSelectingShape(false)} className="p-1 rounded-full hover:bg-gray-200">
                <X size={24} />
              </button>
            </div>
            <p className="mb-4">Click on any shape in the pattern to start drawing on it.</p>

            {shapesWithIds.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Or select from the list:</p>
                <div className="grid grid-cols-2 gap-2">
                  {shapesWithIds.map((id) => (
                    <button
                      key={id}
                      className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 text-left text-sm"
                      onClick={() => {
                        setSelectedShape(id)
                        setIsDrawingMode(true)
                        setIsSelectingShape(false)
                      }}
                    >
                      Shape: {id}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {isDrawingMode && selectedShape && (
        <ShapeDrawing
          selectedShape={selectedShape}
          svgRef={svgRef}
          viewBox={viewBox}
          onClose={() => {
            setIsDrawingMode(false)
            setSelectedShape(null)
          }}
        />
      )}

      <style jsx global>{`
        .shape-selectable {
          cursor: pointer !important;
          transition: fill 0.2s ease, stroke 0.2s ease;
        }
        .shape-selectable:hover {
          fill: rgba(59, 130, 246, 0.3) !important;
          stroke: rgba(59, 130, 246, 0.8) !important;
          stroke-width: 2px !important;
        }
        .selecting-shapes {
          cursor: crosshair !important;
        }
      `}</style>
    </>
  )
}
