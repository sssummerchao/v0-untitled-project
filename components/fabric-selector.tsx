"use client"

import { useState } from "react"
import Image from "next/image"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Check } from "lucide-react"

// Fabric textures with the new high-quality images
export const FABRIC_TEXTURES = {
  fabric1: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Fabric1.png-ZNcmVREQ8bxizsJC1q0xchNOuuKvAm.jpeg",
  fabric2: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Fabric2.png-8nM2qplr09FvYV38rNodFeZHwJjDvc.jpeg",
  fabric3: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Fabric3.png-kzn4OrPqcR9YyBTDpV4nNn8N3XOUDj.jpeg",
  fabric4: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Fabric4.png-JyNNmurHklmaqe6b6PCbcxJC3G3pR7.jpeg",
  fabric5: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Fabric5.png-ihqMmCuYirDnEdpHOfmSXwHJw7r08K.jpeg",
  fabric6: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Fabric6.png-gLcC3fLGTp3QjawGiSP5KerPfR9Xr7.jpeg",
  fabric7: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Fabric7.png-qOduL2gzzKZgkWUUWv7wy7wTw3FsTw.jpeg",
  fabric8: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Fabric8.png-XAGb6jqUi8BVoZBReVKvYgTNU3cCEK.jpeg",
  fabric9: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Fabric9.png-gM8RTXDe97QNPi6Ro95QDfKYlSMf3Y.jpeg",
  fabric10: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Fabric10.png-oSyOV6qSlEBjBpqLNfiZ9375pQl4yW.jpeg",
  fabric11: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Fabric11.png-lGJa8wq9wyELKii5WVmbgQ5wL1fE7J.jpeg",
  fabric12: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Fabric12.png-T21O5mxQT2kIhYsxL3yGC8p72raQff.jpeg",
  fabric13: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Fabric13.png-IAJWVjIZtJzqUn5b5MoxOjrtFzDxlU.jpeg",
  fabric14: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Fabric14.png-ubT5rCy5GySce06pX5o0CZdserwKxg.jpeg",
  fabric15: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Fabric15.png-9rYtEa2c0Y5aZAElbu7QZWZfRh6rqF.jpeg",
  fabric16: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Fabric16.png-lUhff3AOngdrrqRbR9CJZJJbL8RfhG.jpeg",
  fabric17: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Fabric17.png-xVZI5s6inKdM75uJL6Z8aKCf2Z7bqm.jpeg",
  fabric18: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Fabric18.png-bs59qXGLprm3cyCQPKYITlDpyyWoWc.jpeg",
}

// Fabric names for display
export const FABRIC_NAMES = {
  fabric1: "Dark Floral",
  fabric2: "Navy Blue",
  fabric3: "Teal Dots",
  fabric4: "Terracotta Shapes",
  fabric5: "Navy Solid",
  fabric6: "Rust Orange",
  fabric7: "Art Deco Pattern",
  fabric8: "Burgundy",
  fabric9: "Golden Cross-Stitch",
  fabric10: "Teal Green",
  fabric11: "Light Blue Dots",
  fabric12: "Orange Dots",
  fabric13: "Peach Floral",
  fabric14: "Mint Grid",
  fabric15: "Colorful Floral",
  fabric16: "Bright Orange",
  fabric17: "Colorful Plaid",
  fabric18: "Gray Knit",
}

interface FabricSelectorProps {
  selectedShapes: string[]
  onApplyFabric: (fabricKey: string) => void
  className?: string
}

export default function FabricSelector({ selectedShapes, onApplyFabric, className = "" }: FabricSelectorProps) {
  const [selectedFabric, setSelectedFabric] = useState<string | null>(null)

  const handleFabricSelect = (fabricKey: string) => {
    setSelectedFabric(fabricKey)
    // Apply fabric immediately when selected
    if (selectedShapes.length > 0) {
      onApplyFabric(fabricKey)
    }
  }

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Fixed height alert container to prevent layout shifts */}
      <div className="h-[80px] mb-4">
        {selectedShapes.length === 0 ? (
          <Alert>
            <AlertTitle>No shapes selected</AlertTitle>
            <AlertDescription>
              Please select one or more shapes in the pattern before choosing a fabric.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <AlertTitle>Shapes selected</AlertTitle>
            <AlertDescription>
              {selectedShapes.length} shape{selectedShapes.length > 1 ? "s" : ""} selected. Choose a fabric to apply.
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {Object.entries(FABRIC_TEXTURES).map(([key, src]) => (
          <div
            key={key}
            className={`relative cursor-pointer transition-all duration-200 ${
              selectedFabric === key
                ? "ring-4 ring-black scale-105 z-10"
                : "hover:scale-105 ring-2 ring-transparent hover:ring-gray-300"
            } ${selectedShapes.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={() => selectedShapes.length > 0 && handleFabricSelect(key)}
          >
            <div className="w-16 h-16 md:w-20 md:h-20 overflow-hidden rounded-md">
              <Image
                src={src || "/placeholder.svg"}
                alt={FABRIC_NAMES[key as keyof typeof FABRIC_NAMES] || key}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>
            {selectedFabric === key && (
              <div className="absolute -top-2 -right-2 bg-black rounded-full p-1">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
