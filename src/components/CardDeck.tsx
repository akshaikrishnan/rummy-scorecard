import { useState, useRef, useEffect } from 'react'
import gsap from 'gsap'
import { Draggable } from 'gsap/all'
import { useCountdown } from 'hooks/useCountdown'

// Register GSAP Plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(Draggable)
}
// --- Interactive Deck Component ---
const faces = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
const symbols = ['♠', '♥', '♣', '♦']
const total = faces.length
const angleSpread = 90
const startAngle = -angleSpread / 2

function InteractiveDeck({ randomize }: { randomize: boolean }) {
  const [size, setSize] = useState(100)
  const [suit, setSuit] = useState(
    symbols[Math.floor(Math.random() * symbols.length)],
  )
  const deckRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const { seconds, formattedTime, isRunning, start, pause, restart } =
    useCountdown(2)

  const color = suit === '♥' || suit === '♦' ? '#ef4444' : '#171717'

  useEffect(() => {
    // gsap.context handles safe cleanup for React StrictMode
    const ctx = gsap.context(() => {
      cardRefs.current.forEach((card, i) => {
        if (!card) return
        const angle = startAngle + (angleSpread / (total - 1)) * i

        // Initial spread
        gsap.set(card, { x: 0, y: 0, rotation: angle })

        // Initialize Draggable
        Draggable.create(card, {
          type: 'x,y',
          edgeResistance: 0.65,
          bounds: deckRef.current,
          onDragStart: () => restart(2),
        })
      })
    }, deckRef)

    return () => ctx.revert() // Cleanup animations/draggables on unmount or state change
  }, [size, suit])

  const handleRandomize = () => {
    cardRefs.current.forEach((card, index) => {
      if (!card) return
      const randX = Math.random() * 300 - 150
      const randY = Math.random() * 200 - 100
      const randRotation = Math.random() * 360 - 180
      gsap.to(card, {
        x: randX,
        y: randY,
        rotation: randRotation,
        duration: 0.5,
        ease: 'power2.inOut',
      })
      card.style.zIndex = index.toString()
    })
  }

  const handleReset = () => {
    cardRefs.current.forEach((card, index) => {
      if (!card) return
      const angle = startAngle + (angleSpread / (total - 1)) * index
      gsap.to(card, {
        x: 0,
        y: 0,
        rotation: angle,
        duration: 0.5,
        ease: 'power2.out',
      })
      card.style.zIndex = index.toString()
    })
  }

  useEffect(() => {
    if (!isRunning) {
      handleReset()
    }
  }, [isRunning])

  useEffect(() => {
    if (randomize) {
      handleRandomize()
      restart(2)
    }
  }, [randomize])
  return (
    <div className="flex h-full w-full overflow-hidden rounded-2xl bg-[#2e2e2e] font-sans shadow-inner">
      {/* Deck Area */}
      {/* <span className="text-white">
        {seconds}
        {isRunning ? 'Running' : 'Paused'}
      </span> */}
      <div
        ref={deckRef}
        className="relative flex h-full flex-1 items-center justify-center"
      >
        {faces.map((face, i) => (
          <div
            key={face}
            ref={(el) => {
              cardRefs.current[i] = el
            }}
            className="absolute origin-bottom cursor-grab transition-transform duration-75 active:cursor-grabbing [&.flipped_.card-inner]:[transform:rotateY(180deg)]"
            style={{ width: size, height: size * 1.4, perspective: '1000px' }}
            onDoubleClick={(e) => e.currentTarget.classList.toggle('flipped')}
          >
            <div className="card-inner relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d]">
              {/* Front */}
              <div
                className="absolute flex h-full w-full flex-col justify-between rounded-[10px] bg-white p-2 text-center shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_10px_rgba(255,255,0,0.8)] [backface-visibility:hidden]"
                style={{ color }}
              >
                <div className="self-start text-lg leading-none">
                  {face}
                  <br />
                  {suit}
                </div>
                <div className="flex flex-grow items-center justify-center text-4xl">
                  {suit}
                </div>
                <div className="rotate-180 self-end text-lg leading-none">
                  {face}
                  <br />
                  {suit}
                </div>
              </div>
              {/* Back */}
              <div
                className="absolute h-full w-full rounded-[10px] shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-shadow hover:shadow-[0_0_10px_rgba(255,255,0,0.8)] [backface-visibility:hidden] [transform:rotateY(180deg)]"
                style={{
                  background:
                    'repeating-linear-gradient(45deg, #555, #555 10px, #333 10px, #333 20px)',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Control Panel */}
      {/* <div className="flex w-[140px] flex-col border-l-2 border-[#444] bg-[#1a1a1a] p-4 text-xs text-white sm:w-[180px] sm:text-sm z-10">
        <h2 className="mb-2 text-base font-bold sm:text-lg">Controls</h2>
        <p className="mb-4 text-gray-400">
          <strong>Tip:</strong> Hold to drag. Double-click to flip.
        </p>

        <label htmlFor="sizeSlider" className="mb-1 block">
          Card Size
        </label>
        <input
          type="range"
          id="sizeSlider"
          min="80"
          max="160"
          value={size}
          onChange={(e) => setSize(parseInt(e.target.value))}
          className="mb-4 w-full cursor-pointer"
        />

        <label htmlFor="suitSelect" className="mb-1 block">
          Card Suit
        </label>
        <select
          id="suitSelect"
          value={suit}
          onChange={(e) => setSuit(e.target.value)}
          className="mb-6 w-full rounded bg-[#333] p-1.5 text-white outline-none"
        >
          <option value="♠">Spade</option>
          <option value="♥">Heart</option>
          <option value="♣">Club</option>
          <option value="♦">Diamond</option>
        </select>

        <button
          onClick={handleRandomize}
          className="mb-2 rounded bg-gray-700 p-2 transition hover:bg-gray-600 active:scale-95"
        >
          Randomize
        </button>
        <button
          onClick={handleReset}
          className="rounded bg-red-900/60 p-2 transition hover:bg-red-800/80 active:scale-95"
        >
          Reset
        </button>
      </div> */}
    </div>
  )
}

export default InteractiveDeck
