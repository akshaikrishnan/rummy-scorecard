import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { subscribeTodayTotalPoints, type User } from '../lib/db'
import { Trophy, Crown, PartyPopper } from 'lucide-react'
import { Button } from '../components/ui/button'
import ReactCanvasConfetti from 'react-canvas-confetti'

export const Route = createFileRoute('/total')({
  component: TotalRoute,
})

function TotalRoute() {
  const [standings, setStandings] = useState<{ user: User; points: number }[]>(
    [],
  )
  const [isLoading, setIsLoading] = useState(true)
  const [winnerDeclared, setWinnerDeclared] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    const unsubscribe = subscribeTodayTotalPoints(new Date(), (data) => {
      setStandings(data)
      setIsLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const handleDeclareWinner = () => {
    setWinnerDeclared(true)
  }

  const fireConfetti = () => {
    return {
      particleCount: 250,
      spread: 120,
      origin: { y: 0.6 },
      colors: ['#2f6a4a', '#4fb8b2', '#facc15', '#f87171', '#c084fc'],
    }
  }

  if (isLoading) {
    return (
      <div className="page-wrap py-20 flex justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[var(--lagoon-deep)]"></div>
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
    <div className="page-wrap py-12 pb-32 min-h-[85vh] flex flex-col items-center rise-in relative">
      {winnerDeclared && (
        <ReactCanvasConfetti
          {...fireConfetti()}
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
      )}

      <h1 className="text-5xl md:text-6xl font-display font-black mb-12 text-[var(--sea-ink)] drop-shadow-sm flex items-center gap-4 text-center">
        <Trophy className="w-12 h-12 text-[var(--palm)]" />
        Today's Standings
      </h1>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
        {/* LEADER SECTION (Highlighted Bigger) */}
        <div className="md:col-span-12 mb-8 animate-in zoom-in duration-500">
          <div className="flex flex-col items-center">
            {winnerDeclared && (
              <h2 className="text-4xl font-display font-black text-[var(--palm)] mb-6 animate-pulse">
                {isTie ? "IT'S A TIE!" : 'WE HAVE A WINNER!'}
              </h2>
            )}

            <div
              className={`flex flex-wrap justify-center gap-6 ${winnerDeclared ? 'scale-110 transition-transform duration-700' : ''}`}
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
            </div>
          </div>
        </div>

        {/* REST OF THE PLAYERS */}
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
