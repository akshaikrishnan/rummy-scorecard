import { Link } from '@tanstack/react-router'
import { Users, ClipboardList, Coins, Trophy } from 'lucide-react'

function DockLink({
  to,
  icon: Icon,
  label,
}: {
  to: string
  icon: React.ElementType
  label: string
}) {
  return (
    <Link
      to={to}
      className="group flex flex-1 flex-col items-center justify-center gap-1 py-3 text-[var(--sea-ink-soft)] transition-colors active:scale-95"
      activeProps={{ className: 'text-[var(--lagoon-deep)]! is-active' }}
    >
      <div className="relative flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 group-[.is-active]:bg-[var(--lagoon-deep)]/15 group-[.is-active]:scale-110">
        <Icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110 group-[.is-active]:scale-100" />
      </div>
      <span className="text-[10px] font-semibold transition-all group-[.is-active]:font-bold group-[.is-active]:text-[var(--sea-ink)]">
        {label}
      </span>
    </Link>
  )
}

export default function MobileDock() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden">
      <nav className="flex items-center justify-around border-t border-[var(--line)] bg-[var(--header-bg)]/90 px-2 pb-safe backdrop-blur-lg shadow-[0_-8px_32px_rgba(30,90,72,0.06)]">
        <DockLink to="/users" icon={Users} label="Users" />
        <DockLink to="/scores" icon={ClipboardList} label="Scores" />
        <DockLink to="/total" icon={Coins} label="Total" />
        <DockLink to="/leaderboard" icon={Trophy} label="Board" />
      </nav>
    </div>
  )
}
