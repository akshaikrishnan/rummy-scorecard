import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { subscribeUsers, addUser, type User } from '../lib/db'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Plus, Users } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog'
import { Input } from '../components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../components/ui/form'
import { toast } from 'sonner'

export const Route = createFileRoute('/users')({
  component: UsersRoute,
})

const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  imageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
})

function UsersRoute() {
  const [users, setUsers] = useState<User[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      imageUrl: '',
    },
  })

  useEffect(() => {
    setIsLoading(true)
    const unsubscribe = subscribeUsers((fetchedUsers) => {
      setUsers(fetchedUsers)
      setIsLoading(false)
    })
    return () => unsubscribe()
  }, [])

  async function onSubmit(values: z.infer<typeof userSchema>) {
    try {
      await addUser(values.name, values.imageUrl)
      toast.success('Player added successfully')
      setIsOpen(false)
      form.reset()
    } catch (error) {
      toast.error('Failed to add player')
    }
  }

  return (
    <div className="page-wrap py-8 pb-20 rise-in">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-4xl font-display font-bold flex items-center gap-3 text-[var(--sea-ink)]">
          <Users className="w-8 h-8 text-[var(--palm)]" />
          Players
        </h1>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full gap-2 px-6 shadow-md transition-transform hover:-translate-y-1">
              <Plus className="w-5 h-5" /> Add Player
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">
                Add New Player
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5 pt-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Player name"
                          className="rounded-xl"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Avatar URL (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://..."
                          className="rounded-xl"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end pt-6">
                  <Button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className="rounded-full px-8"
                  >
                    {form.formState.isSubmitting ? 'Adding...' : 'Save Player'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[var(--lagoon-deep)]"></div>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20 island-shell rounded-[2rem]">
          <div className="w-20 h-20 bg-[var(--line)] rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-[var(--sea-ink-soft)]" />
          </div>
          <h3 className="text-2xl font-display font-semibold mb-2 text-[var(--sea-ink)]">
            No players found
          </h3>
          <p className="text-[var(--sea-ink-soft)] text-lg">
            Add your family members to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {users.map((user) => (
            <Card
              key={user.id}
              className="island-shell hover:-translate-y-2 transition-transform duration-300 border-none shadow-sm hover:shadow-xl rounded-[2rem] overflow-hidden"
            >
              <CardContent className="p-6">
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="h-24 w-24 rounded-full overflow-hidden bg-gradient-to-br from-[var(--lagoon)] to-[var(--lagoon-deep)] flex items-center justify-center shadow-inner border-4 border-white">
                    {user.imageUrl ? (
                      <img
                        src={user.imageUrl}
                        alt={user.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl font-display font-bold text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-2xl text-[var(--sea-ink)]">
                      {user.name}
                    </h3>
                    <div className="mt-4 flex gap-2 justify-center">
                      <div className="bg-white/60 px-4 py-2 rounded-xl text-sm font-semibold tracking-wide text-[var(--sea-ink-soft)]">
                        <span className="text-lg text-[var(--sea-ink)] block">
                          {user.gamesPlayed}
                        </span>{' '}
                        Games
                      </div>
                      <div className="bg-white/60 px-4 py-2 rounded-xl text-sm font-semibold tracking-wide text-[var(--sea-ink-soft)]">
                        <span className="text-lg text-[var(--palm)] block">
                          {user.totalPoints}
                        </span>{' '}
                        Pts
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
