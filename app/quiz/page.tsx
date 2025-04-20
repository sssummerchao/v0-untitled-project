"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, RotateCcw } from "lucide-react"

type PersonalityTrait = "nurturing" | "open" | "adventurous" | "driven"
type StoryType = "drama" | "origin" | "epic" | "coming-of-age"
type WeekendActivity = "hike" | "no-plans" | "stay-home" | "meet-up"
type PatternType = "north-star" | "log-cabin" | "bear-paws" | "crossroads"

// Pattern mapping
const PATTERN_MAPPING = {
  // Personality traits
  driven: "north-star",
  nurturing: "log-cabin",
  adventurous: "bear-paws",
  open: "crossroads",

  // Story types
  "coming-of-age": "crossroads",
  drama: "log-cabin",
  epic: "bear-paws",
  origin: "north-star",

  // Weekend activities
  "meet-up": "bear-paws",
  "stay-home": "log-cabin",
  hike: "north-star",
  "no-plans": "crossroads",
}

// Pattern descriptions
const PATTERN_DESCRIPTIONS = {
  "north-star": {
    title: "You got North Star!",
    image: "/north-star.png",
    description: [
      "The North Star has been used for centuries by sailors, explorers, and travelers as a reliable way to find true North.",
      "Quilts with the North Star told freedom-seekers that they were on the correct path to Canada.",
    ],
  },
  "log-cabin": {
    title: "You got Log Cabin!",
    image: "/log-cabin.png",
    description: [
      "Log cabins are a symbol of hearth and home.",
      "Quilts displaying log cabins were safe houses, indicating that freedom-seekers could find safety and shelter.",
    ],
  },
  "bear-paws": {
    title: "You got Bear Paw!",
    image: "/bear-paws.png",
    description: [
      "The bear paw pattern symbolized wild animals and their paths.",
      "Quilts featuring a bear paw told freedom-seekers that they should avoid roads and travel along animal trails to avoid slave catchers.",
    ],
  },
  crossroads: {
    title: "You got Crossroads!",
    image: "/squares.png",
    description: [
      "Crossroads are critical moments where a decision must be made.",
      "Quilts with the crossroads pattern directed freedom-seekers toward Cleveland, Ohio, where they could take multiple major routes to freedom.",
    ],
  },
}

const personalityTraits = [
  {
    id: "nurturing",
    name: "Nurturing",
    image: "/nurturing.png",
    description: "You're caring and supportive, always looking out for others.",
    rotation: "10.11deg",
  },
  {
    id: "open",
    name: "Open",
    image: "/open.png",
    description: "You're receptive to new ideas and experiences, with a curious mind.",
    rotation: "7.9deg",
  },
  {
    id: "adventurous",
    name: "Adventurous",
    image: "/adventurous.png",
    description: "You're bold and daring, always seeking new challenges.",
    rotation: "-7.41deg",
  },
  {
    id: "driven",
    name: "Driven",
    image: "/driven.png",
    description: "You're determined and focused, with clear goals in mind.",
    rotation: "-7.2deg",
  },
]

const storyTypes = [
  {
    id: "drama",
    name: "Drama",
    image: "/drama.png",
    description: "You enjoy emotional stories with complex characters and relationships.",
    rotation: "-5.2deg",
  },
  {
    id: "origin",
    name: "Origin Story",
    image: "/origin-story.png",
    description: "You're fascinated by how things began and the journeys that shaped them.",
    rotation: "3.9deg",
  },
  {
    id: "epic",
    name: "Epic Tale",
    image: "/epic-tale.png",
    description: "You love grand adventures with high stakes and heroic journeys.",
    rotation: "-4.1deg",
  },
  {
    id: "coming-of-age",
    name: "Coming of Age",
    image: "/coming-of-age.png",
    description: "You connect with stories about growth, self-discovery, and transformation.",
    rotation: "6.2deg",
  },
]

const weekendActivities = [
  {
    id: "hike",
    name: "Hike and explore nature",
    image: "/hike.png",
    description: "You enjoy being active and connecting with the natural world.",
    rotation: "-4.3deg",
  },
  {
    id: "no-plans",
    name: "I would have no plans",
    image: "/no-plans.png",
    description: "You prefer to go with the flow and see where the day takes you.",
    rotation: "5.7deg",
  },
  {
    id: "stay-home",
    name: "Stay home and read or watch a movie",
    image: "/stay-home.png",
    description: "You value quiet time for reflection and entertainment.",
    rotation: "-3.8deg",
  },
  {
    id: "meet-up",
    name: "Meet up with close friends or family",
    image: "/meet-up.png",
    description: "You prioritize relationships and social connections.",
    rotation: "4.5deg",
  },
]

export default function QuizPage() {
  const [quizStep, setQuizStep] = useState<number>(1)
  const [selectedTrait, setSelectedTrait] = useState<PersonalityTrait | null>(null)
  const [selectedStory, setSelectedStory] = useState<StoryType | null>(null)
  const [selectedWeekend, setSelectedWeekend] = useState<WeekendActivity | null>(null)
  const [showResult, setShowResult] = useState(false)
  const router = useRouter()

  const handleTraitSelect = (trait: PersonalityTrait) => {
    setSelectedTrait(trait)
    // Auto-advance to next question after selection
    setTimeout(() => {
      setQuizStep(2)
    }, 500)
  }

  const handleStorySelect = (story: StoryType) => {
    setSelectedStory(story)
    // Auto-advance to next question after selection
    setTimeout(() => {
      setQuizStep(3)
    }, 500)
  }

  const handleWeekendSelect = (activity: WeekendActivity) => {
    setSelectedWeekend(activity)
    // Show results after selection
    setTimeout(() => {
      setShowResult(true)
    }, 500)
  }

  const handleRestart = () => {
    setSelectedTrait(null)
    setSelectedStory(null)
    setSelectedWeekend(null)
    setQuizStep(1)
    setShowResult(false)
  }

  const determinePattern = (): PatternType => {
    // Count the occurrences of each pattern
    const patternCounts: Record<string, number> = {
      "north-star": 0,
      "log-cabin": 0,
      "bear-paws": 0,
      crossroads: 0,
    }

    // Add to counts based on selections
    if (selectedTrait) {
      patternCounts[PATTERN_MAPPING[selectedTrait]]++
    }

    if (selectedStory) {
      patternCounts[PATTERN_MAPPING[selectedStory]]++
    }

    if (selectedWeekend) {
      patternCounts[PATTERN_MAPPING[selectedWeekend]]++
    }

    // Find the pattern with the highest count
    let maxCount = 0
    let maxPattern = "north-star" as PatternType // Default

    for (const [pattern, count] of Object.entries(patternCounts)) {
      if (count > maxCount) {
        maxCount = count
        maxPattern = pattern as PatternType
      }
    }

    return maxPattern
  }

  const renderQuizStep = () => {
    switch (quizStep) {
      case 1:
        return (
          <>
            <div className="text-center mb-8 relative">
              <Link href="/patterns" className="absolute left-0 top-1/2 -translate-y-1/2">
                <div className="bg-gray-200 rounded-full p-3 hover:bg-gray-300 transition-colors">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/exit-5rgbGMmUFAqmIPd07pwCxFfxOaHQ74.png"
                    alt="Exit"
                    width={40}
                    height={40}
                  />
                </div>
              </Link>
              <h1 className="text-4xl font-semibold text-gray-900 mb-6">Which quality best describes you?</h1>
            </div>

            <div className="relative w-full h-[600px] mb-12 flex items-center justify-center">
              {/* Horizontal layout with uneven Y positions */}
              <div className="flex justify-between w-full max-w-5xl mx-auto">
                {/* Driven */}
                <div
                  className={`relative top-[-80px] cursor-pointer transition-all duration-300 transform ${
                    selectedTrait === "driven" ? "scale-105 z-10" : "hover:scale-102"
                  }`}
                  style={{ opacity: selectedTrait && selectedTrait !== "driven" ? 0.5 : 1 }}
                  onClick={() => handleTraitSelect("driven")}
                >
                  <div className="overflow-hidden">
                    <div
                      style={{
                        padding: "20px",
                        width: "260px",
                        height: "260px",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          width: "220px",
                          height: "220px",
                          position: "relative",
                          transform: `rotate(-7.2deg)`,
                          margin: "0 auto",
                        }}
                      >
                        <Image
                          src="/driven.png"
                          alt="Driven"
                          width={220}
                          height={220}
                          style={{
                            objectFit: "cover",
                          }}
                          className="rounded-lg shadow-md"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Nurturing */}
                <div
                  className={`relative top-[80px] cursor-pointer transition-all duration-300 transform ${
                    selectedTrait === "nurturing" ? "scale-105 z-10" : "hover:scale-102"
                  }`}
                  style={{ opacity: selectedTrait && selectedTrait !== "nurturing" ? 0.5 : 1 }}
                  onClick={() => handleTraitSelect("nurturing")}
                >
                  <div className="overflow-hidden">
                    <div
                      style={{
                        padding: "20px",
                        width: "260px",
                        height: "260px",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          width: "220px",
                          height: "220px",
                          position: "relative",
                          transform: `rotate(10.11deg)`,
                          margin: "0 auto",
                        }}
                      >
                        <Image
                          src="/nurturing.png"
                          alt="Nurturing"
                          width={220}
                          height={220}
                          style={{
                            objectFit: "cover",
                          }}
                          className="rounded-lg shadow-md"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Adventurous */}
                <div
                  className={`relative top-[-40px] cursor-pointer transition-all duration-300 transform ${
                    selectedTrait === "adventurous" ? "scale-105 z-10" : "hover:scale-102"
                  }`}
                  style={{ opacity: selectedTrait && selectedTrait !== "adventurous" ? 0.5 : 1 }}
                  onClick={() => handleTraitSelect("adventurous")}
                >
                  <div className="overflow-hidden">
                    <div
                      style={{
                        padding: "20px",
                        width: "260px",
                        height: "260px",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          width: "220px",
                          height: "220px",
                          position: "relative",
                          transform: `rotate(-7.41deg)`,
                          margin: "0 auto",
                        }}
                      >
                        <Image
                          src="/adventurous.png"
                          alt="Adventurous"
                          width={220}
                          height={220}
                          style={{
                            objectFit: "cover",
                          }}
                          className="rounded-lg shadow-md"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Open */}
                <div
                  className={`relative top-[60px] cursor-pointer transition-all duration-300 transform ${
                    selectedTrait === "open" ? "scale-105 z-10" : "hover:scale-102"
                  }`}
                  style={{ opacity: selectedTrait && selectedTrait !== "open" ? 0.5 : 1 }}
                  onClick={() => handleTraitSelect("open")}
                >
                  <div className="overflow-hidden">
                    <div
                      style={{
                        padding: "20px",
                        width: "260px",
                        height: "260px",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          width: "220px",
                          height: "220px",
                          position: "relative",
                          transform: `rotate(7.9deg)`,
                          margin: "0 auto",
                        }}
                      >
                        <Image
                          src="/open.png"
                          alt="Open"
                          width={220}
                          height={220}
                          style={{
                            objectFit: "cover",
                          }}
                          className="rounded-lg shadow-md"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )
      case 2:
        return (
          <>
            <div className="text-center mb-8 relative">
              <Link href="/patterns" className="absolute left-0 top-1/2 -translate-y-1/2">
                <div className="bg-gray-200 rounded-full p-3 hover:bg-gray-300 transition-colors">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/exit-5rgbGMmUFAqmIPd07pwCxFfxOaHQ74.png"
                    alt="Exit"
                    width={40}
                    height={40}
                  />
                </div>
              </Link>
              <h1 className="text-4xl font-semibold text-gray-900 mb-6">
                What type of story would you most likely watch?
              </h1>
            </div>

            <div className="relative w-full h-[600px] mb-12 flex items-center justify-center">
              {/* Horizontal layout with uneven Y positions */}
              <div className="flex justify-between w-full max-w-5xl mx-auto">
                {/* Drama */}
                <div
                  className={`relative top-[70px] cursor-pointer transition-all duration-300 transform ${
                    selectedStory === "drama" ? "scale-105 z-10" : "hover:scale-102"
                  }`}
                  style={{ opacity: selectedStory && selectedStory !== "drama" ? 0.5 : 1 }}
                  onClick={() => handleStorySelect("drama")}
                >
                  <div className="overflow-hidden">
                    <div
                      style={{
                        padding: "20px",
                        width: "260px",
                        height: "260px",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          width: "220px",
                          height: "220px",
                          position: "relative",
                          transform: `rotate(-5.2deg)`,
                          margin: "0 auto",
                        }}
                      >
                        <Image
                          src="/drama.png"
                          alt="Drama"
                          width={220}
                          height={220}
                          style={{
                            objectFit: "cover",
                          }}
                          className="rounded-lg shadow-md"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Origin Story */}
                <div
                  className={`relative top-[-60px] cursor-pointer transition-all duration-300 transform ${
                    selectedStory === "origin" ? "scale-105 z-10" : "hover:scale-102"
                  }`}
                  style={{ opacity: selectedStory && selectedStory !== "origin" ? 0.5 : 1 }}
                  onClick={() => handleStorySelect("origin")}
                >
                  <div className="overflow-hidden">
                    <div
                      style={{
                        padding: "20px",
                        width: "260px",
                        height: "260px",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          width: "220px",
                          height: "220px",
                          position: "relative",
                          transform: `rotate(3.9deg)`,
                          margin: "0 auto",
                        }}
                      >
                        <Image
                          src="/origin-story.png"
                          alt="Origin Story"
                          width={220}
                          height={220}
                          style={{
                            objectFit: "cover",
                          }}
                          className="rounded-lg shadow-md"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Epic Tale */}
                <div
                  className={`relative top-[30px] cursor-pointer transition-all duration-300 transform ${
                    selectedStory === "epic" ? "scale-105 z-10" : "hover:scale-102"
                  }`}
                  style={{ opacity: selectedStory && selectedStory !== "epic" ? 0.5 : 1 }}
                  onClick={() => handleStorySelect("epic")}
                >
                  <div className="overflow-hidden">
                    <div
                      style={{
                        padding: "20px",
                        width: "260px",
                        height: "260px",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          width: "220px",
                          height: "220px",
                          position: "relative",
                          transform: `rotate(-4.1deg)`,
                          margin: "0 auto",
                        }}
                      >
                        <Image
                          src="/epic-tale.png"
                          alt="Epic Tale"
                          width={220}
                          height={220}
                          style={{
                            objectFit: "cover",
                          }}
                          className="rounded-lg shadow-md"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coming of Age */}
                <div
                  className={`relative top-[-90px] cursor-pointer transition-all duration-300 transform ${
                    selectedStory === "coming-of-age" ? "scale-105 z-10" : "hover:scale-102"
                  }`}
                  style={{ opacity: selectedStory && selectedStory !== "coming-of-age" ? 0.5 : 1 }}
                  onClick={() => handleStorySelect("coming-of-age")}
                >
                  <div className="overflow-hidden">
                    <div
                      style={{
                        padding: "20px",
                        width: "260px",
                        height: "260px",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          width: "220px",
                          height: "220px",
                          position: "relative",
                          transform: `rotate(6.2deg)`,
                          margin: "0 auto",
                        }}
                      >
                        <Image
                          src="/coming-of-age.png"
                          alt="Coming of Age"
                          width={220}
                          height={220}
                          style={{
                            objectFit: "cover",
                          }}
                          className="rounded-lg shadow-md"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )
      case 3:
        return (
          <>
            <div className="text-center mb-8 relative">
              <Link href="/patterns" className="absolute left-0 top-1/2 -translate-y-1/2">
                <div className="bg-gray-200 rounded-full p-3 hover:bg-gray-300 transition-colors">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/exit-5rgbGMmUFAqmIPd07pwCxFfxOaHQ74.png"
                    alt="Exit"
                    width={40}
                    height={40}
                  />
                </div>
              </Link>
              <h1 className="text-4xl font-semibold text-gray-900 mb-6">How would you ideally spend your weekend?</h1>
            </div>

            <div className="relative w-full h-[600px] mb-12 flex items-center justify-center">
              {/* Horizontal layout with uneven Y positions */}
              <div className="flex justify-between w-full max-w-5xl mx-auto">
                {/* Hike */}
                <div
                  className={`relative top-[-50px] cursor-pointer transition-all duration-300 transform ${
                    selectedWeekend === "hike" ? "scale-105 z-10" : "hover:scale-102"
                  }`}
                  style={{ opacity: selectedWeekend && selectedWeekend !== "hike" ? 0.5 : 1 }}
                  onClick={() => handleWeekendSelect("hike")}
                >
                  <div className="overflow-hidden">
                    <div
                      style={{
                        padding: "20px",
                        width: "260px",
                        height: "260px",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          width: "220px",
                          height: "220px",
                          position: "relative",
                          transform: `rotate(-4.3deg)`,
                          margin: "0 auto",
                        }}
                      >
                        <Image
                          src="/hike.png"
                          alt="Hike and explore nature"
                          width={220}
                          height={220}
                          style={{
                            objectFit: "cover",
                          }}
                          className="rounded-lg shadow-md"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* No Plans */}
                <div
                  className={`relative top-[80px] cursor-pointer transition-all duration-300 transform ${
                    selectedWeekend === "no-plans" ? "scale-105 z-10" : "hover:scale-102"
                  }`}
                  style={{ opacity: selectedWeekend && selectedWeekend !== "no-plans" ? 0.5 : 1 }}
                  onClick={() => handleWeekendSelect("no-plans")}
                >
                  <div className="overflow-hidden">
                    <div
                      style={{
                        padding: "20px",
                        width: "260px",
                        height: "260px",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          width: "220px",
                          height: "220px",
                          position: "relative",
                          transform: `rotate(5.7deg)`,
                          margin: "0 auto",
                        }}
                      >
                        <Image
                          src="/no-plans.png"
                          alt="I would have no plans"
                          width={220}
                          height={220}
                          style={{
                            objectFit: "cover",
                          }}
                          className="rounded-lg shadow-md"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stay Home */}
                <div
                  className={`relative top-[-70px] cursor-pointer transition-all duration-300 transform ${
                    selectedWeekend === "stay-home" ? "scale-105 z-10" : "hover:scale-102"
                  }`}
                  style={{ opacity: selectedWeekend && selectedWeekend !== "stay-home" ? 0.5 : 1 }}
                  onClick={() => handleWeekendSelect("stay-home")}
                >
                  <div className="overflow-hidden">
                    <div
                      style={{
                        padding: "20px",
                        width: "260px",
                        height: "260px",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          width: "220px",
                          height: "220px",
                          position: "relative",
                          transform: `rotate(-3.8deg)`,
                          margin: "0 auto",
                        }}
                      >
                        <Image
                          src="/stay-home.png"
                          alt="Stay home and read or watch a movie"
                          width={220}
                          height={220}
                          style={{
                            objectFit: "cover",
                          }}
                          className="rounded-lg shadow-md"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Meet Up */}
                <div
                  className={`relative top-[40px] cursor-pointer transition-all duration-300 transform ${
                    selectedWeekend === "meet-up" ? "scale-105 z-10" : "hover:scale-102"
                  }`}
                  style={{ opacity: selectedWeekend && selectedWeekend !== "meet-up" ? 0.5 : 1 }}
                  onClick={() => handleWeekendSelect("meet-up")}
                >
                  <div className="overflow-hidden">
                    <div
                      style={{
                        padding: "20px",
                        width: "260px",
                        height: "260px",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          width: "220px",
                          height: "220px",
                          position: "relative",
                          transform: `rotate(4.5deg)`,
                          margin: "0 auto",
                        }}
                      >
                        <Image
                          src="/meet-up.png"
                          alt="Meet up with close friends or family"
                          width={220}
                          height={220}
                          style={{
                            objectFit: "cover",
                          }}
                          className="rounded-lg shadow-md"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )
      default:
        return null
    }
  }

  const renderResultPage = () => {
    const pattern = determinePattern()
    const patternInfo = PATTERN_DESCRIPTIONS[pattern]

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
        <div className="flex justify-center">
          <div className="relative w-[400px] h-[400px]">
            <Image
              src={patternInfo.image || "/placeholder.svg"}
              alt={pattern.replace(/-/g, " ")}
              fill
              style={{ objectFit: "contain" }}
              className="rounded-lg"
            />
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <h2 className="text-5xl font-bold mb-8">{patternInfo.title}</h2>

          {patternInfo.description.map((paragraph, index) => (
            <p key={index} className="text-xl mb-6">
              {paragraph}
            </p>
          ))}

          <div className="flex justify-between mt-8">
            <button
              onClick={handleRestart}
              className="flex items-center justify-center bg-white border border-gray-300 rounded-lg p-6 hover:bg-gray-50 transition-colors transform rotate-[-12deg]"
            >
              <div className="flex items-center">
                <RotateCcw className="mr-2 h-6 w-6" />
                <span className="text-lg font-medium">Do it again</span>
              </div>
            </button>

            <Link href={`/patterns/${pattern}`}>
              <div className="flex items-center justify-center bg-gray-200 rounded-full p-6 hover:bg-gray-300 transition-colors">
                <div className="flex items-center">
                  <span className="text-lg font-medium mr-2">Let's make this</span>
                  <ArrowRight className="h-6 w-6" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    )
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
        <div className="max-w-6xl mx-auto">
          {!showResult ? (
            <>
              {renderQuizStep()}

              <div className="flex justify-center mt-8">
                <div className="flex space-x-2">
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`w-3 h-3 rounded-full ${step === quizStep ? "bg-black" : "bg-gray-300"}`}
                    ></div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            renderResultPage()
          )}
        </div>
      </div>
    </main>
  )
}
