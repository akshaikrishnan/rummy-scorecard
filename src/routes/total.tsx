import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { subscribeTodayTotalPoints, type User } from '../lib/db'
import { Trophy, Crown, PartyPopper, Sparkles } from 'lucide-react'
import { Button } from '../components/ui/button'
import ReactCanvasConfetti from 'react-canvas-confetti'
import { AnimatePresence, motion } from 'framer-motion'
import SuitLoader from '#/components/ui/loader'

export const Route = createFileRoute('/total')({
  component: TotalRoute,
})

function TotalRoute() {
  const [standings, setStandings] = useState<{ user: User; points: number }[]>(
    [],
  )
  const [isLoading, setIsLoading] = useState(true)
  const [winnerDeclared, setWinnerDeclared] = useState(false)
  const confettiRef = useRef<
    ((options: Record<string, unknown>) => void) | null
  >(null)

  useEffect(() => {
    setIsLoading(true)
    const unsubscribe = subscribeTodayTotalPoints(new Date(), (data) => {
      setStandings(data)
      setIsLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const handleDeclareWinner = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    window.setTimeout(() => {
      setWinnerDeclared(true)
    }, 450)
  }

  useEffect(() => {
    if (!winnerDeclared || !confettiRef.current) return

    const shoot = (
      particleRatio: number,
      options: Record<string, unknown> = {},
    ) => {
      confettiRef.current?.({
        origin: { y: 0.55 },
        colors: ['#4fb8b2', '#facc15', '#f87171', '#c084fc', '#22c55e'],
        ...options,
        particleCount: Math.floor(300 * particleRatio),
      })
    }

    shoot(0.3, { spread: 35, startVelocity: 60 })
    shoot(0.25, { spread: 80, decay: 0.92, scalar: 0.9 })
    shoot(0.25, { spread: 120, startVelocity: 48 })
    shoot(0.2, { spread: 150, decay: 0.9, scalar: 1.2 })

    const interval = window.setInterval(() => {
      confettiRef.current?.({
        particleCount: 55,
        spread: 100,
        startVelocity: 40,
        origin: { x: Math.random(), y: Math.random() * 0.25 + 0.15 },
        colors: ['#4fb8b2', '#facc15', '#f87171', '#c084fc', '#22c55e'],
      })
    }, 220)

    const stopTimer = window.setTimeout(() => {
      window.clearInterval(interval)
    }, 3200)

    return () => {
      window.clearInterval(interval)
      window.clearTimeout(stopTimer)
    }
  }, [winnerDeclared])

  if (isLoading) {
    return (
      <div className="page-wrap py-20 min-h-[50vh] flex justify-center">
        <SuitLoader />
      </div>
    )
  }

  if (standings.length === 0) {
    return (
      <div className="page-wrap py-20 flex flex-col items-center text-center rise-in">
        <div className="w-24 h-24 bg-[var(--line)] rounded-full flex items-center justify-center mb-6">
          <Trophy className="w-12 h-12 text-[var(--sea-ink-soft)]" />
        </div>
        <h1 className="text-4xl font-display font-bold mb-4">
          No Games Today!
        </h1>
        <p className="text-xl text-[var(--sea-ink-soft)] max-w-md">
          Head over to the Scores tab to start recording games for today's
          standings.
        </p>
      </div>
    )
  }

  const bestScore = standings[0].points
  const winners = standings.filter((s) => s.points === bestScore)
  const isTie = winners.length > 1

  return (
    <div className="page-wrap py-12 pb-32 min-h-[85vh] flex flex-col items-center rise-in relative overflow-hidden">
      <ReactCanvasConfetti
        onInit={({ confetti }) => {
          confettiRef.current = confetti
        }}
        style={{
          position: 'fixed',
          pointerEvents: 'none',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          zIndex: 100,
        }}
      />

      <AnimatePresence>
        {winnerDeclared && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed inset-0 z-40"
          >
            <motion.div
              className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(250,204,21,0.24),transparent_52%)]"
              animate={{ opacity: [0.2, 0.75, 0.25] }}
              transition={{ duration: 1.1, repeat: 3 }}
            />
            {[...Array(20)].map((_, idx) => (
              <motion.div
                key={`spark-${idx}`}
                className="absolute text-3xl"
                style={{
                  left: `${(idx * 37) % 100}%`,
                  top: `${(idx * 53) % 70}%`,
                }}
                initial={{ y: -30, opacity: 0 }}
                animate={{
                  y: [0, -20, 25],
                  opacity: [0, 1, 0],
                  rotate: [0, 20, -20],
                }}
                transition={{
                  duration: 1.8,
                  repeat: 2,
                  delay: (idx % 5) * 0.08,
                }}
              >
                {idx % 2 === 0 ? '✨' : '🎉'}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <h1 className="text-5xl md:text-6xl font-display font-black mb-12 text-[var(--sea-ink)] drop-shadow-sm flex items-center gap-4 text-center z-10">
        <Trophy className="w-12 h-12 text-[var(--palm)]" />
        Today's Standings
      </h1>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
        <div className="md:col-span-12 mb-8 animate-in zoom-in duration-500">
          <div className="flex flex-col items-center">
            <AnimatePresence>
              {winnerDeclared && (
                <motion.h2
                  initial={{ opacity: 0, scale: 0.8, y: 14 }}
                  animate={{ opacity: 1, scale: [1, 1.08, 1], y: 0 }}
                  transition={{ duration: 0.65 }}
                  className="text-4xl font-display font-black text-[var(--palm)] mb-6 flex items-center gap-2"
                >
                  <Sparkles className="w-9 h-9" />
                  {isTie ? "IT'S A TIE!" : 'WE HAVE A WINNER!'}
                  <Sparkles className="w-9 h-9" />
                </motion.h2>
              )}
            </AnimatePresence>

            <motion.div
              animate={winnerDeclared ? { scale: [1, 1.12, 1.08] } : undefined}
              transition={{ duration: 0.8 }}
              className="flex flex-wrap justify-center gap-6"
            >
              {winners.map((winner) => (
                <div
                  key={winner.user.id}
                  className="island-shell relative rounded-[3rem] p-8 md:p-12 text-center flex flex-col items-center min-w-[300px] border-4 border-[var(--lagoon)] shadow-[0_20px_50px_rgba(79,184,178,0.3)]"
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center border-4 border-white shadow-lg z-10">
                    <Crown className="w-8 h-8 text-yellow-900" />
                  </div>

                  <div className="w-32 h-32 rounded-full overflow-hidden mb-6 border-4 border-white shadow-xl mt-4">
                    {winner.user.imageUrl ? (
                      <img
                        src={winner.user.imageUrl}
                        alt={winner.user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[var(--lagoon)] to-[var(--lagoon-deep)] flex items-center justify-center text-white text-5xl font-display font-bold">
                        {winner.user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <h3 className="text-3xl font-display font-black text-[var(--sea-ink)] mb-1">
                    {winner.user.name}
                  </h3>
                  <p className="text-[var(--sea-ink-soft)] uppercase tracking-widest font-bold text-sm mb-4">
                    Current Leader
                  </p>

                  <div className="bg-[var(--palm)] text-white px-8 py-3 rounded-full font-black text-3xl shadow-inner">
                    {winner.points}{' '}
                    <span className="text-lg font-normal opacity-80">pts</span>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {standings.length > winners.length && (
          <div className="md:col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {standings.slice(winners.length).map((standing, index) => (
              <div
                key={standing.user.id}
                className="island-shell rounded-3xl p-4 flex items-center gap-4 transition-transform hover:scale-105"
              >
                <div className="w-10 h-10 rounded-full bg-[rgba(23,58,64,0.05)] border border-[rgba(23,58,64,0.1)] flex items-center justify-center font-bold text-[var(--sea-ink)]">
                  #{index + winners.length + 1}
                </div>

                <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-sm">
                  {standing.user.imageUrl ? (
                    <img
                      src={standing.user.imageUrl}
                      alt={standing.user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[var(--lagoon)] to-[var(--lagoon-deep)] flex items-center justify-center text-white text-xl font-display font-bold">
                      {standing.user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h4 className="font-display font-bold text-lg leading-tight text-[var(--sea-ink)]">
                    {standing.user.name}
                  </h4>
                </div>

                <div className="bg-[var(--line)] px-4 py-2 rounded-xl font-bold text-lg text-[var(--sea-ink)]">
                  {standing.points}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!winnerDeclared && (
        <div className="mt-20">
          <Button
            onClick={handleDeclareWinner}
            className="rounded-full px-8 py-6 h-auto text-xl font-bold gap-3 shadow-[0_10px_30px_rgba(47,106,74,0.3)] bg-[var(--palm)] hover:bg-[var(--lagoon-deep)] hover:-translate-y-1 transition-all"
          >
            <PartyPopper className="w-6 h-6" />
            Declare Winner!
          </Button>
        </div>
      )}
    </div>
  )
}
