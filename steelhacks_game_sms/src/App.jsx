import { useEffect, useReducer } from 'react'
import { gameReducer, createInitialState } from './gameReducer.js'
import { usePresageSocket } from './hooks/usePresageSocket.js'
import StatBars from './components/StatBars.jsx'
import TurnTimer from './components/TurnTimer.jsx'
import ChoiceCards from './components/ChoiceCards.jsx'
import EventScreen from './components/EventScreen.jsx'
import StoryScreen from './components/StoryScreen.jsx'
import EndingScreen from './components/EndingScreen.jsx'
import Grid from './components/Grid.jsx'
import './index.css'

export default function App() {
  // ---- all hooks first ----
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState)
  const { connected: presageConnected, stress: liveStress } = usePresageSocket()

  useEffect(() => {
    if (state.phase !== 'playing') return
    dispatch({ type: 'EXTERNAL_STRESS_UPDATE', stress: liveStress })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveStress, state.phase])

  // ---- then the screens ----
  const activePlayer = state.players[state.activePlayer]

  if (state.phase === 'intro') {
    return (
      <div className="app-shell title-screen-shell">
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

  if (state.actIntroSeen < state.act) {
    return (
      <div className="app-shell">
        <StoryScreen act={state.act} onBegin={() => dispatch({ type: 'BEGIN' })} />
      </div>
    )
  }

  return (
    <div className="app-shell">
      <div className="game-layout">
        <aside className="game-hud">
          <header className="game-header">
            <h1>Canopy Co.</h1>
            <p className="turn-indicator">
              Turn {state.turnNumber}
              <br></br>
              {activePlayer.name}'s move
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
        </aside>

        <Grid
          columns={12}
          tiles={Array.from({ length: 120 }, (_, index) => ({
            index,
            type: 'forest',
            size: 'medium',
            colSpan: 1,
            rowSpan: 1,
            degraded: false,
            owner: null,
            isRiver: false,
            pollution: 0,
          }))}
        />
      </div>
      <ChoiceCards
        choices={state.currentChoices}
        onChoose={(choiceId) => dispatch({ type: 'CHOOSE', choiceId })}
      />
    </div>
  )
}