import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import {
  subscribeGamesByDate,
  addGameScore,
  subscribeUsers,
  type Game,
  type User,
} from '../lib/db'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Plus, Calendar as CalendarIcon, Filter, Layers } from 'lucide-react'
import { Button } from '../components/ui/button'
import { format } from 'date-fns'
import { Calendar } from '../components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../components/ui/popover'
import { cn } from '../lib/utils'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
} from '../components/ui/drawer'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Checkbox } from '../components/ui/checkbox'
import { toast } from 'sonner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import SuitLoader from '#/components/ui/loader'

export const Route = createFileRoute('/scores')({
  component: ScoresRoute,
})

const scoreSchema = z
  .record(z.string(), z.coerce.number().min(0, 'Min 0').max(80, 'Max 80'))
  .refine(
    (data) => {
      const values = Object.values(data)
      return values.some((v) => v === 0)
    },
    {
      message: 'At least one player must have 0 points (the winner)',
      path: ['root'],
    },
  )

function ScoresRoute() {
  const [date, setDate] = useState<Date>(new Date())
  const [games, setGames] = useState<Game[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Record<string, number>>({
    // @ts-expect-error Zod config
    resolver: zodResolver(scoreSchema),
    defaultValues: {},
  })

  // Load setup data
  useEffect(() => {
    const unsubscribe = subscribeUsers((usersInfo) => {
      setAllUsers(usersInfo)
      setSelectedUserIds((prev) => {
        if (prev.length === 0) return usersInfo.map((u) => u.id)
        return prev
      })
    })
    return () => unsubscribe()
  }, [])

  // Load games when date changes
  useEffect(() => {
    setIsLoading(true)
    const unsubscribe = subscribeGamesByDate(date, (gamesInfo) => {
      setGames(gamesInfo)
      setIsLoading(false)
    })
    return () => unsubscribe()
  }, [date])

  const selectedUsers = allUsers.filter((u) => selectedUserIds.includes(u.id))

  const toggleUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    )
  }

  async function onSubmit(data: Record<string, number>) {
    if (selectedUserIds.length < 2) {
      toast.error('Please select at least 2 players in the filter first.')
      return
    }

    try {
      const scores = Object.entries(data).map(([userId, points]) => ({
        userId,
        points,
      }))

      await addGameScore(date, scores)
      toast.success('Game recorded successfully')
      setIsDrawerOpen(false)
      reset()
    } catch (error) {
      toast.error('Failed to save score')
    }
  }

  return (
    <div className="page-wrap py-8 pb-32 rise-in">
      <div className="flex flex-col gap-6 mb-8">
        <h1 className="text-4xl font-display font-black text-[var(--sea-ink)] flex items-center gap-3">
          <Layers className="w-8 h-8 text-[var(--lagoon-deep)]" />
          Game Scores
        </h1>

        <div className="flex flex-wrap items-center gap-4 bg-white/40 p-3 rounded-2xl border border-[rgba(23,58,64,0.1)] backdrop-blur-md">
          {/* Date Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'w-[240px] justify-start text-left font-normal rounded-xl bg-white',
                  !date && 'text-muted-foreground',
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-[var(--palm)]" />
                {date ? format(date, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 rounded-2xl overflow-hidden"
              align="start"
            >
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* User Filter Dropdown */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="rounded-xl bg-white">
                <Filter className="mr-2 h-4 w-4" /> Players (
                {selectedUserIds.length})
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-4 rounded-2xl" align="start">
              <div className="space-y-4">
                <h4 className="font-medium leading-none mb-3">
                  Filter Players in Game
                </h4>
                <div className="grid gap-3">
                  {allUsers.map((user) => (
                    <div className="flex items-center space-x-2" key={user.id}>
                      <Checkbox
                        id={`filter-${user.id}`}
                        checked={selectedUserIds.includes(user.id)}
                        onCheckedChange={() => toggleUser(user.id)}
                      />
                      <Label htmlFor={`filter-${user.id}`}>{user.name}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Add Score Drawer Trigger */}
          <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <div className="ml-auto hidden md:block">
              <DrawerTrigger asChild>
                <Button className="rounded-full px-6 bg-[var(--palm)] hover:bg-[var(--lagoon)] transition-all">
                  <Plus className="mr-2 h-4 w-4" /> Add Score
                </Button>
              </DrawerTrigger>
            </div>

            <DrawerTrigger asChild>
              <Button
                size="icon"
                className="fixed bottom-6 right-6 z-20 h-14 w-14 rounded-full bg-[var(--palm)] shadow-lg hover:bg-[var(--lagoon)] transition-all md:hidden"
                aria-label="Add Score"
              >
                <Plus className="h-6 w-6" />
              </Button>
            </DrawerTrigger>

            <DrawerContent>
              <div className="mx-auto w-full max-w-sm">
                <DrawerHeader>
                  <DrawerTitle className="font-display text-2xl">
                    Record Game {games.length + 1}
                  </DrawerTitle>
                </DrawerHeader>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="p-4 pb-0 space-y-4"
                >
                  {errors.root && (
                    <p className="text-red-500 text-sm font-bold">
                      {errors.root.message}
                    </p>
                  )}

                  {selectedUsers.length < 2 && (
                    <p className="text-amber-600 bg-amber-50 p-3 rounded-lg text-sm font-semibold">
                      Please select at least 2 players from the filter before
                      adding a score.
                    </p>
                  )}

                  {selectedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between border-b pb-4"
                    >
                      <Label
                        htmlFor={`score-${user.id}`}
                        className="text-lg flex items-center gap-2"
                      >
                        {user.imageUrl ? (
                          <img
                            src={user.imageUrl}
                            className="w-8 h-8 rounded-full border border-gray-200"
                            alt={user.name}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[var(--line)] flex items-center justify-center font-bold">
                            {user.name.charAt(0)}
                          </div>
                        )}
                        {user.name}
                      </Label>
                      <div className="w-24">
                        <Input
                          id={`score-${user.id}`}
                          type="number"
                          min="0"
                          max="80"
                          className="text-center font-bold text-lg rounded-xl focus-visible:ring-[var(--palm)]"
                          {...register(user.id, { valueAsNumber: true })}
                        />
                      </div>
                    </div>
                  ))}

                  <DrawerFooter>
                    <Button
                      type="submit"
                      className="rounded-full py-6 text-lg tracking-wide"
                      disabled={isSubmitting || selectedUsers.length < 2}
                    >
                      {isSubmitting ? 'Saving...' : 'Save Game Scores'}
                    </Button>
                  </DrawerFooter>
                </form>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>

      {isLoading ? (
        <div className="page-wrap py-20 min-h-[50vh] flex justify-center">
          <SuitLoader />
        </div>
      ) : games.length === 0 ? (
        <div className="island-shell p-16 text-center rounded-[3rem]">
          <h3 className="text-2xl font-display font-semibold mb-2 text-[var(--sea-ink)]">
            No Games Found
          </h3>
          <p className="text-[var(--sea-ink-soft)] text-lg">
            No games were recorded on {format(date, 'MMMM do, yyyy')}.
          </p>
        </div>
      ) : (
        <div className="island-shell rounded-[2rem] overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-bold whitespace-nowrap">
                    Game #
                  </TableHead>
                  {selectedUsers.map((user) => (
                    <TableHead
                      key={user.id}
                      className="font-bold text-center min-w-[100px]"
                    >
                      {user.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {games.map((game) => (
                  <TableRow key={game.id}>
                    <TableCell className="font-bold text-[var(--sea-ink-soft)]">
                      Game {game.gameNumber}
                    </TableCell>
                    {selectedUsers.map((user) => {
                      const userScore = game.scores.find(
                        (s) => s.userId === user.id,
                      )
                      const isWinner = userScore?.points === 0
                      return (
                        <TableCell
                          key={user.id}
                          className="text-center font-medium"
                        >
                          {userScore ? (
                            <span
                              className={cn(
                                'inline-block px-3 py-1 rounded-full',
                                isWinner
                                  ? 'bg-yellow-100 text-yellow-800 font-bold'
                                  : 'bg-transparent text-[var(--sea-ink)]',
                              )}
                            >
                              {userScore.points}
                            </span>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
}
