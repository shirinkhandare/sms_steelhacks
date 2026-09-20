import { useState } from 'react'
import Box from './Box'

export default function EndingScreen({ players, forestHealth, log, onRestart }) {
  const [revealed, setRevealed] = useState(false)

  const winner =
    players.A.profit === players.B.profit
      ? null
      : players.A.profit > players.B.profit
      ? 'A'
      : 'B'

  const damagingMoves = log.filter((l) => l.choiceId && !l.timedOutOnly)
  const timeoutCount = log.filter((l) => l.timedOut).length
  const hectaresLost = Math.round((100 - forestHealth) * 12.4) // flavor stat, tune freely

  if (!revealed) {
    return (
      <div className="ending-screen">
        <Box>
          <h1>Final Quarter</h1>
          {winner ? (
            <p className="winner-line">
              {players[winner].name} wins with ${players[winner].profit}M in profit.
            </p>
          ) : (
            <p className="winner-line">It's a tie. Both companies hit the same number.</p>
          )}
          <button onClick={() => setRevealed(true)}>See what that actually cost</button>
        </Box>
      </div>
    )
  }

  return (
    <div className="ending-screen reveal">
      <Box>
        <h1>The Real Number</h1>
        <p className="forest-remaining">Forest Health remaining: {Math.round(forestHealth)}%</p>
        <div className="cost-list">
          <p>Estimated hectares degraded: {hectaresLost.toLocaleString()}</p>
          <p>Total turns played under real time pressure: {log.length}</p>
          <p>Decisions made in a full panic (timed out): {timeoutCount}</p>
          <p>Company A final trust: {Math.round(players.A.trust)} / 100</p>
          <p>Company B final trust: {Math.round(players.B.trust)} / 100</p>
          <br />
          <p>
            The Amazon has lost roughly 20% of its original forest cover since 1970 — much of it
            to decisions that looked, in the moment, like this one.
          </p>
        </div>
        <button onClick={onRestart}>Play again</button>
      </Box>
    </div>
  )
}