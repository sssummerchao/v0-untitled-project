import Image from "next/image"
import Link from "next/link"

const otherPatterns = [
  {
    id: "north-star",
    image: "/north-star-quilt.png",
    rotation: "7.37deg",
  },
  {
    id: "log-cabin",
    image: "/log-cabin-quilt.png",
    rotation: "-8deg",
  },
  {
    id: "bear-paws",
    image: "/bear-paws-quilt.png",
    rotation: "6.48deg",
  },
]

export default function CrossroadsPage() {
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
        <div className="max-w-6xl mx-auto">
          <div className="fixed bottom-8 left-8 z-10">
            <Link href="/patterns" draggable="false" style={{ pointerEvents: "auto" }}>
              <Image src="/back-button.png" alt="Back" width={60} height={60} draggable="false" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 flex items-center">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="flex justify-center">
                  <div style={{ width: "400px", height: "400px", position: "relative" }}>
                    <Image
                      src="/crossroads-quilt.png"
                      alt="Crossroads quilt pattern"
                      width={400}
                      height={400}
                      style={{ objectFit: "contain" }}
                      className="rounded-lg shadow-lg"
                      draggable="false"
                    />
                  </div>
                </div>

                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-6">Crossroads</h1>

                  <p className="text-lg text-gray-700 mb-6">
                    Crossroads are critical moments where a decision must be made.
                  </p>

                  <p className="text-lg text-gray-700 mb-8">
                    Quilts with the crossroads pattern directed freedom-seekers toward Cleveland, Ohio, where they could
                    take multiple major routes to freedom.
                  </p>

                  <div style={{ transform: "rotate(-4.49deg)", transformOrigin: "center left" }}>
                    <Link href="/create/crossroads" draggable="false" style={{ pointerEvents: "auto" }}>
                      <div className="bg-black text-white rounded-full inline-flex items-center pr-6 pl-2 py-2 hover:opacity-90 transition-opacity">
                        <div className="bg-gray-200 rounded-full p-2 mr-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-black"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span className="text-lg font-serif font-bold">Make this!</span>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Other patterns navigation - positioned at the right edge */}
            <div className="md:col-span-1 fixed right-0 top-1/2 transform -translate-y-1/2 pr-4">
              <div className="sr-only">Other Patterns</div>
              <div className="space-y-6 flex flex-col items-center">
                {otherPatterns.map((pattern) => (
                  <Link
                    key={pattern.id}
                    href={`/patterns/${pattern.id}`}
                    className="block group"
                    draggable="false"
                    style={{ pointerEvents: "auto" }}
                  >
                    <div className="flex items-center justify-center p-3 rounded-lg transition-transform duration-300 group-hover:scale-110">
                      <div style={{ transform: `rotate(${pattern.rotation})` }}>
                        <Image
                          src={pattern.image || "/placeholder.svg"}
                          alt={`${pattern.id} pattern`}
                          width={80}
                          height={80}
                          className="rounded-md"
                          draggable="false"
                        />
                      </div>
                      <span className="sr-only">{pattern.id}</span>
                    </div>
                  </Link>
                ))}

                {/* Quiz button at the bottom of navigation */}
                <Link href="/quiz" className="mt-8 block group" draggable="false" style={{ pointerEvents: "auto" }}>
                  <div className="flex items-center justify-center p-3 rounded-lg transition-transform duration-300 group-hover:scale-110">
                    <Image
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/quiz%20button-M1c5VAHv3O2ga5abuyswEav5yuYLYT.png"
                      alt="Take the quiz"
                      width={100}
                      height={100}
                      className="rounded-md"
                      style={{ transform: "rotate(-5deg)" }}
                      draggable="false"
                    />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
