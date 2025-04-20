import Link from "next/link"
import Image from "next/image"

export default function Home() {
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
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-screen">
        <div className="max-w-4xl w-full text-center">
          <div className="py-16 px-4 relative z-10">
            <h1 className="text-6xl font-bold text-gray-900 mb-6">Community Threads</h1>

            <p className="text-xl text-gray-700 mb-4">For the Underground Railroad, quilts held hidden meanings.</p>

            <p className="text-xl text-gray-700 mb-12">
              Uncover the stories of each design by selecting a pattern and customizing its colors and fabrics.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              {[
                { id: "north-star", name: "North Star", rotation: "7.37deg" },
                { id: "log-cabin", name: "Log Cabin", rotation: "-8deg" },
                { id: "crossroads", name: "Crossroads", rotation: "3.17deg" },
                { id: "bear-paws", name: "Bear Paws", rotation: "6.48deg" },
              ].map((pattern) => (
                <Link key={pattern.id} href={`/create/${pattern.id}`} className="flex flex-col items-center group">
                  <div className="mb-4 transition-transform duration-300 group-hover:scale-105">
                    <div
                      style={{
                        width: "180px",
                        height: "180px",
                        position: "relative",
                        transform: `rotate(${pattern.rotation})`,
                        transformOrigin: "center center",
                      }}
                    >
                      <Image
                        src={`/${pattern.id === "crossroads" ? "squares" : pattern.id}.png`}
                        alt={pattern.name}
                        fill
                        style={{ objectFit: "cover" }}
                        className="rounded-lg shadow-md"
                      />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 text-center">{pattern.name}</h2>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
