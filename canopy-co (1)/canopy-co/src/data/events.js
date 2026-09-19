// Random events fire between turns with some probability (see reducer).
// They apply to the player whose turn is COMING UP, and sometimes to forest health globally.
export const EVENT_POOL = [
  {
    id: 'ev_protest',
    text: 'Indigenous land rights protest halts your operations for a turn.',
    effects: { trust: -3, stress: 10 },
    minAct: 1,
  },
  {
    id: 'ev_wildfire',
    text: "A wildfire spreads from a neighboring cleared plot — nobody's, or everybody's, fault.",
    effects: { forest: -8, stress: 8 },
    minAct: 2,
  },
  {
    id: 'ev_journalist',
    text: 'A journalist publishes an investigation into your last decision.',
    effects: { trust: -6, stress: 6 },
    minAct: 2,
  },
  {
    id: 'ev_price_spike',
    text: 'Commodity prices spike — every extractive option just got more tempting.',
    effects: { stress: 4 },
    minAct: 1,
  },
  {
    id: 'ev_storm',
    text: 'A storm damages your equipment. Repairs eat into this quarter.',
    effects: { profit: -4, stress: 5 },
    minAct: 1,
  },
  {
    id: 'ev_rival_scandal',
    text: 'Your rival got caught. Public trust in "green" companies drops for everyone.',
    effects: { trust: -3, stress: 3 },
    minAct: 2,
  },
]

export function eventsForAct(act) {
  return EVENT_POOL.filter((e) => e.minAct <= act)
}
