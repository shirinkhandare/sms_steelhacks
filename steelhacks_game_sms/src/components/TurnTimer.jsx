import { useEffect, useRef, useState } from 'react'

export default function TurnTimer({ timeLimitMs, turnKey, onTimeout }) {
  const [msLeft, setMsLeft] = useState(timeLimitMs)
  const startRef = useRef(Date.now())

  useEffect(() => {
    startRef.current = Date.now()
    setMsLeft(timeLimitMs)
    const id = setInterval(() => {
      const elapsed = Date.now() - startRef.current
      const remaining = timeLimitMs - elapsed
      if (remaining <= 0) {
        setMsLeft(0)
        clearInterval(id)
        onTimeout()
      } else {
        setMsLeft(remaining)
      }
    }, 100)
    return () => clearInterval(id)
    // turnKey forces a reset whenever a new turn starts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turnKey, timeLimitMs])

  const pct = Math.max(0, (msLeft / timeLimitMs) * 100)
  const urgent = pct < 30

  return (
    <div className="turn-timer">
      <div
        className={`turn-timer-fill ${urgent ? 'urgent' : ''}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}