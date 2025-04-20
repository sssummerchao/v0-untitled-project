import Link from "next/link"
import Image from "next/image"
import NorthStarPatternEditor from "@/components/north-star-pattern-editor"

export default function CreateNorthStarPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center"
      style={{
        background: `
          linear-gradient(to right, #f0f0f0 1px, transparent 1px),
          linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
        backgroundColor: "white",
      }}
    >
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="fixed bottom-8 left-8 z-10">
            <Link href="/">
              <Image src="/back-button.png" alt="Back" width={60} height={60} />
            </Link>
          </div>

          <h1 className="text-4xl font-bold text-center text-gray-900 mb-4">Create Your North Star Quilt</h1>
          <p className="text-xl text-center text-gray-700 mb-12">
            Select shapes in the pattern, then choose a fabric to create your own unique quilt.
          </p>

          <NorthStarPatternEditor />
        </div>
      </div>
    </main>
  )
}
