import { useEffect, useReducer } from 'react'
import { gameReducer, createInitialState } from './gameReducer.js'
import { usePresageSocket } from './hooks/usePresageSocket.js'
import { chooseBotCard, botThinkDelay } from './bots.js'
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

  // ---- bot turns ----
  const activePlayer = state.players[state.activePlayer]
  const botTurn = activePlayer.isBot
  const botCanMove =
    botTurn &&
    state.phase === 'playing' &&
    state.actIntroSeen >= state.act &&
    state.currentChoices.length > 0

  const choicesKey = state.currentChoices.map((c) => c.id).join(',')

  useEffect(() => {
    if (!botCanMove) return

    const id = setTimeout(() => {
      const rivalKey = state.activePlayer === 'A' ? 'B' : 'A'
      let choice = null
      try {
        choice = chooseBotCard(state.currentChoices, {
          bot: state.players[state.activePlayer],
          rival: state.players[rivalKey],
          forestHealth: state.forestHealth,
        })
      } catch (err) {
        console.error('bot decision failed', err)
      }
      // never leave the bot stuck: fall back to a random card
      if (!choice && state.currentChoices.length) {
        choice =
          state.currentChoices[
            Math.floor(Math.random() * state.currentChoices.length)
          ]
      }
      if (choice) dispatch({ type: 'CHOOSE', choiceId: choice.id })
      else console.warn('bot has no choices to pick from')
    }, botThinkDelay(state.act))

    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [botCanMove, state.turnNumber, state.activePlayer, choicesKey, state.act])

  // ---- then the screens ----
  // Always show the human's stats, even while the bot is moving.
  const humanKey =
    Object.keys(state.players).find((k) => !state.players[k].isBot) ??
    state.activePlayer
  const viewedPlayer = botTurn ? state.players[humanKey] : activePlayer
  const lastMove = state.log[state.log.length - 1]

  if (state.phase === 'intro') {
    return (
      <div className="app-shell title-screen-shell">
        <StoryScreen act={state.storyPage} onBegin={() => dispatch({ type: 'BEGIN' })} />
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
        <StoryScreen act={state.storyPage} onBegin={() => dispatch({ type: 'BEGIN' })} />
      </div>
    )
  }

  return (
    <div className="app-shell">
      <div className="game-layout">
        <aside className="game-hud">
          <header className="game-header">
            <h1>Amazon Under Pressure</h1>
            <p className="turn-indicator">
              Turn {state.turnNumber}
              <br></br>
              {activePlayer.name}'s move
            </p>
          </header>

          <StatBars
            player={viewedPlayer}
            forestHealth={state.forestHealth}
            presageConnected={presageConnected}
          />

          {!botTurn && (
            <TurnTimer
              timeLimitMs={state.timeLimitMs}
              turnKey={state.turnNumber}
              onTimeout={() => dispatch({ type: 'TIMEOUT' })}
            />
          )}

          <ul className="scoreboard">
            {Object.entries(state.players).map(([key, p]) => (
              <li key={key}>
                <span>{p.name}</span>
                <span>${p.profit}M</span>
              </li>
            ))}
          </ul>

          {lastMove && (
            <p className="last-move">
              {state.players[lastMove.player].name} chose: &ldquo;{lastMove.text}&rdquo;
            </p>
          )}
        </aside>

        <Grid
          columns={12}
          forestHealth={state.forestHealth}
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
      {botTurn ? (
        <div className="bot-turn" role="status" aria-live="polite">
          {activePlayer.name} is deciding&hellip;
        </div>
      ) : (
        <ChoiceCards
          choices={state.currentChoices}
          onChoose={(choiceId) => dispatch({ type: 'CHOOSE', choiceId })}
        />
      )}
    </div>
    )
}
