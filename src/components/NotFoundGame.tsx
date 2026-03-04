import { Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'

type CardResult = 'hidden' | 'miss' | 'jackpot'

const CARD_COUNT = 12

const decoyCards = [
  { face: 'A', suit: '♠', color: '#171717' },
  { face: 'K', suit: '♠', color: '#171717' },
  { face: 'Q', suit: '♠', color: '#171717' },
  { face: 'J', suit: '♦', color: '#ef4444' },
  { face: 'A', suit: '♥', color: '#ef4444' },
  { face: '10', suit: '♣', color: '#171717' },
]

const jokerCard = { face: '★', suit: '🃏', color: '#10b981' }

export default function NotFoundGame() {
  const [round, setRound] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [foundJoker, setFoundJoker] = useState(false)
  const [revealed, setRevealed] = useState<Partial<Record<number, CardResult>>>(
    {},
  )

  const jokerIndex = useMemo(
    () => Math.floor(Math.random() * CARD_COUNT),
    [round],
  )

  const handleCardPick = (index: number) => {
    if (foundJoker || revealed[index]) return

    setAttempts((value) => value + 1)

    if (index === jokerIndex) {
      setFoundJoker(true)
      setRevealed((prev) => ({ ...prev, [index]: 'jackpot' }))
      return
    }

    setRevealed((prev) => ({ ...prev, [index]: 'miss' }))
  }

  const startNextRound = () => {
    setRound((value) => value + 1)
    setAttempts(0)
    setFoundJoker(false)
    setRevealed({})
  }

  return (
    <section className="page-wrap px-4 pb-10 pt-12 sm:pt-16">
      <div className="island-shell relative overflow-hidden rounded-4xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="pointer-events-none absolute -right-20 -top-16 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(79,184,178,0.24),transparent_70%)]" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(47,106,74,0.18),transparent_70%)]" />

        <p className="island-kicker mb-3">Lost at Sea</p>
        <h1 className="display-title text-4xl leading-tight font-bold sm:text-5xl">
          404 · Find the Joker to escape
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-(--sea-ink-soft) sm:text-base">
          Oops, this table does not exist. Pick cards to find the hidden joker.
          Every miss reveals a decoy card. Hit the joker and we&apos;ll deal you
          back to safety.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
          <span className="rounded-full border border-(--line) bg-(--surface) px-4 py-2 font-semibold">
            Attempts: {attempts}
          </span>
          <span className="rounded-full border border-(--line) bg-(--surface) px-4 py-2 font-semibold">
            Round: {round + 1}
          </span>
          {foundJoker ? (
            <span className="rounded-full border border-emerald-400/40 bg-emerald-100/70 px-4 py-2 font-semibold text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-100">
              Jackpot! You found the joker 🎉
            </span>
          ) : (
            <span className="rounded-full border border-amber-400/40 bg-amber-100/80 px-4 py-2 font-semibold text-amber-800 dark:bg-amber-500/20 dark:text-amber-100">
              One of these cards is the joker 🃏
            </span>
          )}
        </div>

        <div className="mt-7 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:max-w-3xl">
          {Array.from({ length: CARD_COUNT }, (_, index) => {
            const state = revealed[index] ?? 'hidden'
            const isHidden = state === 'hidden'
            const cardData =
              state === 'jackpot'
                ? jokerCard
                : decoyCards[(index + round) % decoyCards.length]

            return (
              <button
                key={`card-${round}-${index}`}
                type="button"
                onClick={() => handleCardPick(index)}
                className="group aspect-3/4 rounded-[10px] bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lagoon)] disabled:cursor-default perspective-[1000px]"
                disabled={!isHidden || foundJoker}
                aria-label={
                  isHidden
                    ? `Pick card ${index + 1}`
                    : `Revealed ${cardData.face} of ${cardData.suit}`
                }
              >
                <div
                  className={`card-inner relative h-full w-full transition-transform duration-500 transform-3d ${isHidden ? 'transform-[rotateY(180deg)]' : ''}`}
                >
                  {/* Front */}
                  <div
                    className="absolute flex h-full w-full flex-col justify-between rounded-[10px] bg-white p-2 text-center shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_10px_rgba(255,255,0,0.8)] backface-hidden"
                    style={{ color: cardData.color }}
                  >
                    <div className="self-start text-lg leading-none font-bold">
                      {cardData.face}
                      <br />
                      {cardData.suit}
                    </div>
                    <div className="flex grow items-center justify-center text-4xl">
                      {cardData.suit}
                    </div>
                    <div className="rotate-180 self-end text-lg leading-none font-bold">
                      {cardData.face}
                      <br />
                      {cardData.suit}
                    </div>
                  </div>
                  {/* Back */}
                  <div
                    className="absolute h-full w-full rounded-[10px] shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-shadow hover:shadow-[0_0_10px_rgba(255,255,0,0.8)] backface-hidden transform-[rotateY(180deg)]"
                    style={{
                      background:
                        'repeating-linear-gradient(45deg, #555, #555 10px, #333 10px, #333 20px)',
                    }}
                  />
                </div>
              </button>
            )
          })}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={startNextRound}
            className="rounded-full border border-[rgba(50,143,151,0.35)] bg-[rgba(79,184,178,0.2)] px-5 py-2.5 text-sm font-semibold text-[var(--lagoon-deep)] transition hover:-translate-y-0.5 hover:bg-[rgba(79,184,178,0.3)]"
          >
            Shuffle & Play Again
          </button>
          <Link
            to="/"
            className="rounded-full border border-[rgba(23,58,64,0.2)] bg-white/60 px-5 py-2.5 text-sm font-semibold text-[var(--sea-ink)] no-underline transition hover:-translate-y-0.5 hover:border-[rgba(23,58,64,0.35)]"
          >
            Back Home
          </Link>
          <Link
            to="/scores"
            className="rounded-full border border-[rgba(23,58,64,0.2)] bg-white/60 px-5 py-2.5 text-sm font-semibold text-[var(--sea-ink)] no-underline transition hover:-translate-y-0.5 hover:border-[rgba(23,58,64,0.35)]"
          >
            Start a Game
          </Link>
        </div>
      </div>
    </section>
  )
}
