import { Link } from '@tanstack/react-router'
import ThemeToggle from './ThemeToggle'
import { Club } from 'lucide-react'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur-lg">
      <nav className="page-wrap flex flex-wrap items-center gap-x-3 gap-y-2 py-3 sm:py-4">
        <h2 className="m-0 flex-shrink-0 text-base font-semibold tracking-tight">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1.5 text-sm text-[var(--sea-ink)] no-underline shadow-[0_8px_24px_rgba(30,90,72,0.08)] sm:px-4 sm:py-2 hover:scale-105 transition-transform"
          >
            <Club className="h-4 w-4 text-[var(--lagoon-deep)]" />
            <span className="font-display font-bold">Rummy Score</span>
          </Link>
        </h2>

        <div className="ml-auto flex items-center gap-1.5 sm:ml-0 sm:gap-2">
          <ThemeToggle />
        </div>

        <div className="order-3 hidden w-full flex-wrap items-center gap-x-4 gap-y-1 pb-1 text-sm font-semibold sm:flex sm:order-2 sm:w-auto sm:flex-nowrap sm:pb-0">
          <Link
            to="/users"
            className="nav-link"
            activeProps={{ className: 'nav-link is-active' }}
          >
            Players
          </Link>
          <Link
            to="/scores"
            className="nav-link"
            activeProps={{ className: 'nav-link is-active' }}
          >
            Scores
          </Link>
          <Link
            to="/total"
            className="nav-link"
            activeProps={{ className: 'nav-link is-active' }}
          >
            Today's Total
          </Link>
          <Link
            to="/leaderboard"
            className="nav-link"
            activeProps={{ className: 'nav-link is-active' }}
          >
            Leaderboard
          </Link>
        </div>
      </nav>
    </header>
  )
}
