import Image from "next/image"
import Link from "next/link"

const patterns = [
  {
    id: "north-star",
    name: "North Star",
    image: "/north-star-quilt.png",
    rotation: "7.37deg",
  },
  {
    id: "log-cabin",
    name: "Log Cabin",
    image: "/log-cabin-quilt.png",
    rotation: "-8deg",
  },
  {
    id: "crossroads",
    name: "Crossroads",
    image: "/crossroads-quilt.png",
    rotation: "3.17deg",
  },
  {
    id: "bear-paws",
    name: "Bear Paws",
    image: "/bear-paws-quilt.png",
    rotation: "6.48deg",
  },
]

export default function PatternsPage() {
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
            <Link href="/" draggable="false" style={{ pointerEvents: "auto" }}>
              <Image src="/back-button.png" alt="Back" width={60} height={60} draggable="false" />
            </Link>
          </div>

          <h1 className="text-5xl font-bold text-center text-gray-900 mb-4">Uncover Hidden Stories</h1>
          <p className="text-xl text-center text-gray-700 mb-12">Select a quilt to learn more.</p>

          <div className="grid grid-cols-4 gap-8 mb-16">
            {patterns.map((pattern, index) => (
              <Link
                key={pattern.id}
                href={`/patterns/${pattern.id}`}
                className="flex flex-col items-center group"
                draggable="false"
                style={{ pointerEvents: "auto" }}
              >
                <div className="mb-4 transition-transform duration-300 group-hover:scale-105">
                  <div
                    style={{
                      width: "220px",
                      height: "220px",
                      position: "relative",
                      transform: `rotate(${pattern.rotation})`,
                      transformOrigin: "center center",
                    }}
                  >
                    <Image
                      src={pattern.image || "/placeholder.svg"}
                      alt={pattern.name}
                      fill
                      style={{ objectFit: "cover" }}
                      className="rounded-lg shadow-md"
                      draggable="false"
                    />
                  </div>
                </div>
                <h2
                  className="text-2xl font-bold text-gray-900 text-center"
                  style={{ transform: `rotate(${index === 1 ? "-8deg" : "0deg"})` }}
                >
                  {pattern.name}
                </h2>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link href="/quiz" draggable="false" style={{ pointerEvents: "auto" }}>
              <div className="bg-black text-white rounded-full inline-flex items-center px-8 py-4 hover:opacity-90 transition-opacity">
                <span className="text-lg">Or take a quiz to find your pattern</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
