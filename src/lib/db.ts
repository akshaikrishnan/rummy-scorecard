import { db } from './firebase'
import {
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
  where,
  doc,
  runTransaction,
  increment,
} from 'firebase/firestore'

export type User = {
  id: string
  name: string
  imageUrl?: string
  totalPoints: number
  gamesPlayed: number
}

export type GameScore = {
  userId: string
  points: number
}

export type Game = {
  id: string
  date: string
  gameNumber: number
  scores: GameScore[]
}

const USERS_COLLECTION = 'users'
const GAMES_COLLECTION = 'games'

export async function getUsers(): Promise<User[]> {
  const usersRef = collection(db, USERS_COLLECTION)
  const q = query(usersRef, orderBy('name', 'asc'))
  const snapshot = await getDocs(q)

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as User[]
}

export async function addUser(
  name: string,
  imageUrl?: string,
): Promise<string> {
  const usersRef = collection(db, USERS_COLLECTION)
  const docRef = await addDoc(usersRef, {
    name,
    imageUrl: imageUrl || '',
    totalPoints: 0,
    gamesPlayed: 0,
  })
  return docRef.id
}

export async function getGamesByDate(date: Date): Promise<Game[]> {
  const dateString = date.toISOString().split('T')[0]
  const gamesRef = collection(db, GAMES_COLLECTION)
  const q = query(
    gamesRef,
    where('date', '==', dateString),
    orderBy('gameNumber', 'asc'),
  )
  const snapshot = await getDocs(q)

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Game[]
}

export async function addGameScore(
  date: Date,
  scores: GameScore[],
): Promise<void> {
  const dateString = date.toISOString().split('T')[0]

  await runTransaction(db, async (transaction) => {
    // 1. Get the current game count for today to set gameNumber
    const gamesRef = collection(db, GAMES_COLLECTION)
    const q = query(gamesRef, where('date', '==', dateString))
    const snapshot = await getDocs(q)
    const nextGameNumber = snapshot.size + 1

    // 2. Add the game
    const newGameRef = doc(gamesRef)
    transaction.set(newGameRef, {
      date: dateString,
      gameNumber: nextGameNumber,
      scores,
    })

    // 3. Update each user's total points and games played
    for (const score of scores) {
      const userRef = doc(db, USERS_COLLECTION, score.userId)
      transaction.update(userRef, {
        totalPoints: increment(score.points),
        gamesPlayed: increment(1),
      })
    }
  })
}

export async function getTodayTotalPoints(
  date: Date,
): Promise<{ user: User; points: number }[]> {
  const dateString = date.toISOString().split('T')[0]
  const gamesRef = collection(db, GAMES_COLLECTION)
  const q = query(gamesRef, where('date', '==', dateString))
  const gamesSnapshot = await getDocs(q)

  const userPoints: Record<string, number> = {}

  gamesSnapshot.forEach((doc) => {
    const game = doc.data() as Game
    game.scores.forEach((score) => {
      userPoints[score.userId] = (userPoints[score.userId] || 0) + score.points
    })
  })

  const users = await getUsers()
  const result: { user: User; points: number }[] = []

  for (const [userId, points] of Object.entries(userPoints)) {
    const user = users.find((u) => u.id === userId)
    if (user) {
      result.push({ user, points })
    }
  }

  return result.sort((a, b) => a.points - b.points)
}

export async function getAllTimeLeaderboard(): Promise<User[]> {
  const users = await getUsers()
  return users.sort((a, b) => {
    if (a.totalPoints === b.totalPoints) {
      return a.gamesPlayed - b.gamesPlayed
    }
    return a.totalPoints - b.totalPoints
  })
}
