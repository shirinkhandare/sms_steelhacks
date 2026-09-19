import { useEffect, useReducer } from 'react'
import { gameReducer, createInitialState } from './gameReducer.js'
import { usePresageSocket } from './hooks/usePresageSocket.js'
import StatBars from './components/StatBars.jsx'
import TurnTimer from './components/TurnTimer.jsx'
import ChoiceCards from './components/ChoiceCards.jsx'
import EventScreen from './components/EventScreen.jsx'
import StoryScreen from './components/StoryScreen.jsx'
import EndingScreen from './components/EndingScreen.jsx'
import './index.css'

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState)
  const { connected: presageConnected, stress: liveStress } = usePresageSocket()

  // Feed live (or simulated) stress into the active player continuously
  // while it's their turn to decide, so the choice pool + timer both react.
  useEffect(() => {
    if (state.phase !== 'playing') return
    dispatch({ type: 'EXTERNAL_STRESS_UPDATE', stress: liveStress })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveStress, state.phase])

  const activePlayer = state.players[state.activePlayer]

  if (state.phase === 'intro') {
    return (
      <div className="app-shell">
        <StoryScreen act={1} onBegin={() => dispatch({ type: 'BEGIN' })} />
      </div>
    )
  }

  if (state.phase === 'ending') {
    return (
      <div className="app-shell">
        <EndingScreen
          players={state.players}
          forestHealth={state.forestHealth}
          log={state.log}
          onRestart={() => dispatch({ type: 'RESET' })}
        />
      </div>
    )
  }

  if (state.phase === 'event' && state.lastEvent) {
    return (
      <div className="app-shell">
        <EventScreen
          event={state.lastEvent}
          onAcknowledge={() => dispatch({ type: 'ACKNOWLEDGE_EVENT' })}
        />
      </div>
    )
  }

  // first turn of a new act gets a story beat (shown once per act)
  const showActIntro = (state.turnNumber - 1) % 6 === 0
  if (showActIntro && state.log.length === (state.act - 1) * 6) {
    return (
      <div className="app-shell">
        <StoryScreen act={state.act} onBegin={() => dispatch({ type: 'BEGIN' })} />
      </div>
    )
  }

  return (
    <div className="app-shell">
      <header className="game-header">
        <h1>Canopy Co.</h1>
        <p className="turn-indicator">
          Turn {state.turnNumber} — Act {state.act} — {activePlayer.name}'s move
        </p>
      </header>

      <StatBars
        player={activePlayer}
        forestHealth={state.forestHealth}
        presageConnected={presageConnected}
      />

      <TurnTimer
        timeLimitMs={state.timeLimitMs}
        turnKey={state.turnNumber}
        onTimeout={() => dispatch({ type: 'TIMEOUT' })}
      />

      <ChoiceCards
        choices={state.currentChoices}
        onChoose={(choiceId) => dispatch({ type: 'CHOOSE', choiceId })}
      />
    </div>
  )
}
