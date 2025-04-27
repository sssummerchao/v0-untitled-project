"use client"

import { useState } from "react"

interface ShapeSelectorProps {
  onShapeSelect: (shapeId: string) => void
  onCancel: () => void
  patternType: "north-star" | "crossroads" | "bear-paws" | "log-cabin"
}

export default function ShapeSelector({ onShapeSelect, onCancel, patternType }: ShapeSelectorProps) {
  const [selectedShape, setSelectedShape] = useState<string | null>(null)

  // Get shapes based on pattern type
  const getShapes = () => {
    switch (patternType) {
      case "north-star":
        return [
          { id: "center", name: "Center Square" },
          { id: "top", name: "Top Square" },
          { id: "right", name: "Right Square" },
          { id: "bottom", name: "Bottom Square" },
          { id: "left", name: "Left Square" },
          { id: "top-left", name: "Top Left Square" },
          { id: "top-right", name: "Top Right Square" },
          { id: "bottom-right", name: "Bottom Right Square" },
          { id: "bottom-left", name: "Bottom Left Square" },
        ]
      case "crossroads":
        return [
          { id: "center-square", name: "Center Square" },
          { id: "top-left-square", name: "Top Left Square" },
          { id: "top-right-square", name: "Top Right Square" },
          { id: "bottom-left-square", name: "Bottom Left Square" },
          { id: "bottom-right-square", name: "Bottom Right Square" },
          { id: "top-triangle", name: "Top Triangle" },
          { id: "right-triangle", name: "Right Triangle" },
          { id: "bottom-triangle", name: "Bottom Triangle" },
          { id: "left-triangle", name: "Left Triangle" },
        ]
      case "bear-paws":
        return [
          { id: "center-square", name: "Center Square" },
          { id: "top-left-square", name: "Top Left Square" },
          { id: "bottom-left-square", name: "Bottom Left Square" },
          { id: "top-right-square", name: "Top Right Square" },
          { id: "bottom-right-square", name: "Bottom Right Square" },
          { id: "tl-paw-1", name: "Top Left Paw 1" },
          { id: "tl-paw-2", name: "Top Left Paw 2" },
          { id: "tr-paw-1", name: "Top Right Paw 1" },
          { id: "tr-paw-2", name: "Top Right Paw 2" },
        ]
      case "log-cabin":
        return [
          { id: "shape-0", name: "Shape 1" },
          { id: "shape-1", name: "Shape 2" },
          { id: "shape-2", name: "Shape 3" },
          { id: "shape-3", name: "Shape 4" },
          { id: "shape-4", name: "Shape 5" },
          { id: "shape-5", name: "Shape 6" },
          { id: "shape-6", name: "Shape 7" },
          { id: "shape-7", name: "Shape 8" },
          { id: "shape-8", name: "Shape 9" },
          { id: "shape-9", name: "Shape 10" },
          { id: "shape-10", name: "Shape 11" },
          { id: "shape-11", name: "Shape 12" },
          { id: "shape-12", name: "Center Square" },
        ]
      default:
        return []
    }
  }

  const shapes = getShapes()

  const handleSelect = () => {
    if (selectedShape) {
      onShapeSelect(selectedShape)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">Select a Shape to Draw On</h3>

        <div className="grid grid-cols-2 gap-2 mb-4 max-h-[60vh] overflow-y-auto">
          {shapes.map((shape) => (
            <button
              key={shape.id}
              className={`p-2 text-left rounded ${
                selectedShape === shape.id ? "bg-blue-100 border border-blue-300" : "hover:bg-gray-100"
              }`}
              onClick={() => setSelectedShape(shape.id)}
            >
              {shape.name}
            </button>
          ))}
        </div>

        <div className="flex justify-end space-x-2">
          <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100" onClick={onCancel}>
            Cancel
          </button>
          <button
            className={`px-4 py-2 bg-blue-500 text-white rounded ${
              !selectedShape ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
            }`}
            onClick={handleSelect}
            disabled={!selectedShape}
          >
            Select
          </button>
        </div>
      </div>
    </div>
  )
}
