//useTimer

import { useState, useEffect, useRef } from 'react'

export function useTimer(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (isRunning && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev - 1)
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
      setIsRunning(false)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, seconds])

  const start = () => setIsRunning(true)
  const pause = () => setIsRunning(false)
  const reset = (seconds?: number) => {
    setIsRunning(false)
    setSeconds(seconds || initialSeconds)
  }

  const formattedTime = `${Math.floor(seconds / 60)}:${(seconds % 60)
    .toString()
    .padStart(2, '0')}`

  return {
    seconds,
    formattedTime,
    isRunning,
    start,
    pause,
    reset,
  }
}
