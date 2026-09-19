import { choicesForAct } from './data/choices.js'
import { eventsForAct } from './data/events.js'

// --- tunable constants: adjust these first if playtesting feels off ---
export const TURNS_PER_ACT = 6
export const MAX_TURNS = TURNS_PER_ACT * 3
export const BASE_TIME_MS = { 1: 14000, 2: 10000, 3: 7000 } // by act
export const RANDOM_EVENT_CHANCE = 0.3 // chance an event fires before a turn (act 2+)

export const initialPlayer = (name) => ({
  name,
  profit: 0,
  trust: 50,
  stress: 20,
})

export function createInitialState() {
  return {
    phase: 'intro', // 'intro' | 'playing' | 'event' | 'ending'
    actIntroSeen: 0,
    turnNumber: 1,
    act: 1,
    activePlayer: 'A',
    players: {
      A: initialPlayer('Company A'),
      B: initialPlayer('Company B'),
    },
    forestHealth: 100,
    timeLimitMs: BASE_TIME_MS[1],
    currentChoices: drawChoices(1, initialPlayer('A').stress),
    lastEvent: null,
    log: [],
  }
}

function actForTurn(turnNumber) {
  if (turnNumber <= TURNS_PER_ACT) return 1
  if (turnNumber <= TURNS_PER_ACT * 2) return 2
  return 3
}

// Picks 3 non-repeating cards from the act's pool, biased by stress toward
// riskier tiers. This is the "your options get worse when you're panicked" mechanic.
export function drawChoices(act, stress) {
  const pool = choicesForAct(act)
  const tierWeight = (tier) => {
    if (stress >= 66) return { calm: 1, mid: 2, high: 4 }[tier]
    if (stress >= 33) return { calm: 2, mid: 3, high: 2 }[tier]
    return { calm: 4, mid: 2, high: 1 }[tier]
  }
  const weighted = pool.flatMap((c) => Array(tierWeight(c.tier)).fill(c))
  const picked = []
  const usedIds = new Set()
  let guard = 0
  while (picked.length < 3 && guard < 200) {
    guard++
    const card = weighted[Math.floor(Math.random() * weighted.length)]
    if (!usedIds.has(card.id)) {
      usedIds.add(card.id)
      picked.push(card)
    }
  }
  // fallback if pool too small
  while (picked.length < 3 && pool.length) {
    const card = pool[picked.length % pool.length]
    if (!usedIds.has(card.id)) {
      usedIds.add(card.id)
      picked.push(card)
    } else break
  }
  return picked
}

function clamp(n, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n))
}

function applyEffects(player, forestHealth, effects) {
  return {
    player: {
      ...player,
      profit: player.profit + (effects.profit || 0),
      trust: clamp(player.trust + (effects.trust || 0)),
      stress: clamp(player.stress + (effects.stress || 0)),
    },
    forestHealth: clamp(forestHealth + (effects.forest || 0)),
  }
}

function nextActivePlayer(p) {
  return p === 'A' ? 'B' : 'A'
}

export function gameReducer(state, action) {
  switch (action.type) {
    case 'BEGIN':
      return { ...state, phase: 'playing', actIntroSeen: state.act }

    case 'ACKNOWLEDGE_EVENT': {
      // move on to the actual turn after showing a random event
      const activePlayer = state.players[state.activePlayer]
      return {
        ...state,
        phase: 'playing',
        lastEvent: null,
        currentChoices: drawChoices(state.act, activePlayer.stress),
      }
    }

    case 'CHOOSE':
    case 'TIMEOUT': {
      const choice =
        action.type === 'TIMEOUT'
          ? pickPanicDefault(state.currentChoices)
          : state.currentChoices.find((c) => c.id === action.choiceId)
      if (!choice) return state

      const activeKey = state.activePlayer
      const activePlayerState = state.players[activeKey]
      const { player: updatedPlayer, forestHealth } = applyEffects(
        activePlayerState,
        state.forestHealth,
        choice.effects
      )

      const logEntry = {
        turn: state.turnNumber,
        player: activeKey,
        choiceId: choice.id,
        text: choice.text,
        timedOut: action.type === 'TIMEOUT',
      }

      const nextTurnNumber = state.turnNumber + 1
      const nextPlayers = { ...state.players, [activeKey]: updatedPlayer }

      // end conditions
      if (nextTurnNumber > MAX_TURNS || forestHealth <= 0) {
        return {
          ...state,
          players: nextPlayers,
          forestHealth,
          phase: 'ending',
          log: [...state.log, logEntry],
        }
      }

      const nextAct = actForTurn(nextTurnNumber)
      const nextActiveKey = nextActivePlayer(activeKey)
      const nextActivePlayerState = nextPlayers[nextActiveKey]

      // maybe trigger a random event for the upcoming player (acts 2+)
      const maybeEvent =
        nextAct >= 2 && Math.random() < RANDOM_EVENT_CHANCE
          ? pickRandomEvent(nextAct)
          : null

      if (maybeEvent) {
        const { player: eventedPlayer, forestHealth: eventedForest } =
          applyEffects(nextActivePlayerState, forestHealth, maybeEvent.effects)
        return {
          ...state,
          turnNumber: nextTurnNumber,
          act: nextAct,
          activePlayer: nextActiveKey,
          players: { ...nextPlayers, [nextActiveKey]: eventedPlayer },
          forestHealth: eventedForest,
          timeLimitMs: BASE_TIME_MS[nextAct],
          phase: 'event',
          lastEvent: maybeEvent,
          log: [...state.log, logEntry],
        }
      }

      return {
        ...state,
        turnNumber: nextTurnNumber,
        act: nextAct,
        activePlayer: nextActiveKey,
        players: nextPlayers,
        forestHealth,
        timeLimitMs: BASE_TIME_MS[nextAct],
        currentChoices: drawChoices(nextAct, nextActivePlayerState.stress),
        phase: 'playing',
        log: [...state.log, logEntry],
      }
    }

    // Presage (or any external) stress feed nudges the ACTIVE player's stress
    // in real time, between choices. Re-draws choices so the option pool
    // reflects the live stress level.
    case 'EXTERNAL_STRESS_UPDATE': {
      if (state.phase !== 'playing') return state
      const activeKey = state.activePlayer
      const player = state.players[activeKey]
      const newStress = clamp(action.stress)
      const updatedPlayer = { ...player, stress: newStress }
      return {
        ...state,
        players: { ...state.players, [activeKey]: updatedPlayer },
      }
    }

    case 'RESET':
      const fresh = createInitialState()
      const zeroedPlayers = Object.fromEntries(
        Object.entries(fresh.players).map(([key, p]) => [key, { ...p, stress: 0 }])
      )
      return {
        ...fresh,
        players: zeroedPlayers,
        currentChoices: drawChoices(1, 0),
      }

    default:
      return state
  }
}

function pickPanicDefault(choices) {
  // Simulates "ran out of time" — the mind defaults to whichever option
  // looks most immediately rewarding (highest profit), which is usually
  // also the most damaging. This is the point.
  return choices.reduce((best, c) =>
    c.effects.profit > best.effects.profit ? c : best
  )
}

function pickRandomEvent(act) {
  const pool = eventsForAct(act)
  return pool[Math.floor(Math.random() * pool.length)]
}