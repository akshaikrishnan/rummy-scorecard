import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { getAllTimeLeaderboard, type User } from '../lib/db'
import { Medal, Star, Gamepad2, TrendingUp } from 'lucide-react'

export const Route = createFileRoute('/leaderboard')({
  component: LeaderboardRoute,
})

function LeaderboardRoute() {
  const [leaderboard, setLeaderboard] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchLeaderboard() {
      setIsLoading(true)
      const data = await getAllTimeLeaderboard()
      setLeaderboard(data)
      setIsLoading(false)
    }
    fetchLeaderboard()
  }, [])

  if (isLoading) {
    return (
      <div className="page-wrap py-20 flex justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[var(--lagoon-deep)]"></div>
      </div>
    )
  }

  return (
    <div className="page-wrap py-12 pb-32 rise-in relative">
      <div className="absolute top-0 right-10 w-64 h-64 bg-[var(--lagoon)] rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-[var(--palm)] rounded-full blur-[150px] opacity-10 pointer-events-none"></div>

      <div className="flex flex-col items-center mb-16 text-center">
        <div className="inline-flex items-center justify-center p-4 rounded-[2rem] bg-white/40 shadow-sm border border-[rgba(255,255,255,0.6)] mb-6 backdrop-blur-md">
          <Medal className="w-10 h-10 text-yellow-500 mb-1" />
        </div>
        <h1 className="text-5xl font-display font-black text-[var(--sea-ink)]">
          Hall of Fame
        </h1>
        <p className="text-xl text-[var(--sea-ink-soft)] mt-4 max-w-lg font-medium">
          The ultimate ranking of all players. Lower points mean better rummy
          skills!
        </p>
      </div>

      {leaderboard.length === 0 ? (
        <div className="island-shell p-12 rounded-[3rem] text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-display font-bold mb-4">No Stats Yet</h2>
          <p className="text-lg text-[var(--sea-ink-soft)]">
            Play some games to start building the Hall of Fame.
          </p>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex justify-end gap-6 px-6 pb-2 text-sm font-bold text-[var(--sea-ink-soft)] uppercase tracking-wider">
            <span className="hidden sm:inline-flex items-center gap-1">
              <Gamepad2 className="w-4 h-4" /> Games
            </span>
            <span className="inline-flex items-center gap-1">
              <Star className="w-4 h-4" /> Points
            </span>
            <span className="hidden md:inline-flex items-center gap-1">
              <TrendingUp className="w-4 h-4" /> Avg
            </span>
          </div>

          {leaderboard.map((user, index) => {
            const avgPoints =
              user.gamesPlayed > 0
                ? (user.totalPoints / user.gamesPlayed).toFixed(1)
                : '0.0'

            return (
              <div
                key={user.id}
                className={`island-shell flex items-center p-4 sm:p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
                  index === 0
                    ? 'rounded-[3rem] border-4 border-yellow-400 bg-gradient-to-r from-[rgba(255,255,255,0.9)] to-[rgba(250,230,150,0.3)]'
                    : index === 1
                      ? 'rounded-3xl border-2 border-slate-300 bg-gradient-to-r from-[rgba(255,255,255,0.8)] to-[rgba(226,232,240,0.4)]'
                      : index === 2
                        ? 'rounded-3xl border-2 border-amber-600 bg-gradient-to-r from-[rgba(255,255,255,0.8)] to-[rgba(217,119,6,0.1)]'
                        : 'rounded-3xl hover:bg-white/80'
                }`}
              >
                <div
                  className={`w-12 h-12 flex-shrink-0 flex items-center justify-center font-black text-2xl ${
                    index === 0
                      ? 'text-yellow-600'
                      : index === 1
                        ? 'text-slate-500'
                        : index === 2
                          ? 'text-amber-700'
                          : 'text-[var(--sea-ink-soft)] opacity-50'
                  }`}
                >
                  #{index + 1}
                </div>

                <div
                  className={`mx-4 sm:mx-6 flex-shrink-0 overflow-hidden rounded-full border-2 border-white shadow-md ${
                    index === 0
                      ? 'w-20 h-20 border-4 border-yellow-200'
                      : 'w-14 h-14'
                  }`}
                >
                  {user.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[var(--lagoon)] to-[var(--lagoon-deep)] flex items-center justify-center text-white font-display font-bold text-xl">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3
                    className={`font-display font-bold truncate ${
                      index === 0
                        ? 'text-3xl text-[var(--sea-ink)]'
                        : 'text-xl text-[var(--sea-ink)]'
                    }`}
                  >
                    {user.name}
                  </h3>
                  {index === 0 && (
                    <span className="text-sm font-bold text-yellow-600 uppercase tracking-widest mt-1 block">
                      Reigning Champion
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-6 sm:gap-10 text-right shrink-0">
                  <div className="hidden sm:block">
                    <p
                      className={`font-black ${index === 0 ? 'text-2xl' : 'text-xl'}`}
                    >
                      {user.gamesPlayed}
                    </p>
                  </div>

                  <div className="bg-[var(--line)] px-4 py-2 sm:px-6 sm:py-3 rounded-2xl">
                    <p
                      className={`font-black text-[var(--palm)] ${index === 0 ? 'text-3xl' : 'text-2xl'}`}
                    >
                      {user.totalPoints}
                    </p>
                  </div>

                  <div className="hidden md:block w-16">
                    <p className="font-bold text-lg text-[var(--sea-ink-soft)]">
                      {avgPoints}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
