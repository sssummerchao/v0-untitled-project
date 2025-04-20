"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

type StoryType = "drama" | "origin" | "epic" | "coming-of-age"

const storyTypes = [
  {
    id: "drama",
    name: "Drama",
    image: "/drama.png",
    matchedPattern: "log-cabin",
    description: "You enjoy emotional stories with complex characters and relationships.",
    rotation: "-5.2deg",
    position: { top: "25%", left: "10%" },
  },
  {
    id: "origin",
    name: "Origin Story",
    image: "/origin-story.png",
    matchedPattern: "bear-paws",
    description: "You're fascinated by how things began and the journeys that shaped them.",
    rotation: "3.9deg",
    position: { bottom: "20%", left: "30%" },
  },
  {
    id: "epic",
    name: "Epic Tale",
    image: "/epic-tale.png",
    matchedPattern: "north-star",
    description: "You love grand adventures with high stakes and heroic journeys.",
    rotation: "-4.1deg",
    position: { top: "15%", right: "15%" },
  },
  {
    id: "coming-of-age",
    name: "Coming of Age",
    image: "/coming-of-age.png",
    matchedPattern: "crossroads",
    description: "You connect with stories about growth, self-discovery, and transformation.",
    rotation: "6.2deg",
    position: { bottom: "15%", right: "10%" },
  },
]

export default function StoryQuizPage() {
  const [selectedStory, setSelectedStory] = useState<StoryType | null>(null)
  const [showResult, setShowResult] = useState(false)
  const router = useRouter()

  const handleStorySelect = (story: StoryType) => {
    setSelectedStory(story)
  }

  const handleSubmit = () => {
    if (selectedStory) {
      setShowResult(true)
    }
  }

  const handleViewPattern = () => {
    if (selectedStory) {
      const matchedPattern = storyTypes.find((story) => story.id === selectedStory)?.matchedPattern
      router.push(`/patterns/${matchedPattern}`)
    }
  }

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
            <Link href="/patterns">
              <Image src="/back-button.png" alt="Back" width={60} height={60} />
            </Link>
          </div>

          {!showResult ? (
            <>
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-6">
                  What type of story would you most likely watch?
                </h1>
              </div>

              <div className="relative w-full h-[700px] mb-12">
                {storyTypes.map((story) => (
                  <div
                    key={story.id}
                    className={`absolute cursor-pointer transition-all duration-300 transform ${
                      selectedStory === story.id ? "scale-105 z-10" : "hover:scale-102"
                    }`}
                    style={{
                      ...story.position,
                    }}
                    onClick={() => handleStorySelect(story.id as StoryType)}
                  >
                    <div
                      className={`border-4 rounded-lg overflow-hidden ${
                        selectedStory === story.id ? "border-black" : "border-transparent"
                      }`}
                    >
                      <div
                        style={{
                          padding: "20px",
                          width: "300px",
                          height: "300px",
                          position: "relative",
                        }}
                      >
                        <div
                          style={{
                            width: "260px",
                            height: "260px",
                            position: "relative",
                            transform: `rotate(${story.rotation})`,
                            margin: "0 auto",
                          }}
                        >
                          <Image
                            src={story.image || "/placeholder.svg"}
                            alt={story.name}
                            width={260}
                            height={260}
                            style={{
                              objectFit: "cover",
                            }}
                            className="rounded-lg shadow-md"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <button
                  onClick={handleSubmit}
                  disabled={!selectedStory}
                  className={`bg-black text-white rounded-full flex items-center pr-6 pl-2 py-2 hover:opacity-90 transition-opacity mx-auto ${
                    !selectedStory ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
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
                  <span className="text-lg font-serif font-bold">Find My Pattern</span>
                </button>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-6">Your Perfect Match</h2>

              {selectedStory && (
                <>
                  <div className="flex flex-col items-center mb-6">
                    <div className="relative w-48 h-48 mb-4">
                      <Image
                        src={storyTypes.find((story) => story.id === selectedStory)?.image || ""}
                        alt={storyTypes.find((story) => story.id === selectedStory)?.name || ""}
                        fill
                        style={{ objectFit: "cover" }}
                        className="rounded-lg"
                      />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">
                      {storyTypes.find((story) => story.id === selectedStory)?.name}
                    </h3>
                    <p className="text-gray-700 text-center mb-4">
                      {storyTypes.find((story) => story.id === selectedStory)?.description}
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-xl mb-6">
                      Based on your story preference, we recommend the{" "}
                      <span className="font-bold">
                        {storyTypes.find((story) => story.id === selectedStory)?.matchedPattern.replace(/-/g, " ")}
                      </span>{" "}
                      quilt pattern.
                    </p>

                    <button
                      onClick={handleViewPattern}
                      className="bg-black text-white rounded-full flex items-center pr-6 pl-2 py-2 hover:opacity-90 transition-opacity mx-auto"
                    >
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
                      <span className="text-lg font-serif font-bold">View My Pattern</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
