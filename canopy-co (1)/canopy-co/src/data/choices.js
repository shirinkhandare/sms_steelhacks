// Each choice: id, text, act it can appear in ('any' = all acts),
// tier = which stress band favors it ('calm' | 'mid' | 'high'),
// effects = deltas applied to the ACTIVE player + shared forest health.
// profit: player's money. forest: shared Forest Health (both players draw from it).
// trust: player's public trust. stress: player's own stress (this game's "HP for panic").

export const CHOICE_POOL = [
  // ---------- ACT 1: "The Pitch" — gentle, low damage, low profit ----------
  {
    id: 'a1_survey',
    text: 'Survey the plot with local guides before doing anything.',
    act: 1, tier: 'calm',
    effects: { profit: 2, forest: 0, trust: 3, stress: -5 },
  },
  {
    id: 'a1_partner',
    text: 'Sign a co-management agreement with the local community.',
    act: 1, tier: 'calm',
    effects: { profit: 3, forest: 1, trust: 5, stress: -3 },
  },
  {
    id: 'a1_ecotour',
    text: 'Pilot a small eco-tourism trail.',
    act: 1, tier: 'mid',
    effects: { profit: 5, forest: -2, trust: 2, stress: 2 },
  },
  {
    id: 'a1_selective',
    text: 'Selectively harvest a few mature trees, certified sustainable.',
    act: 1, tier: 'mid',
    effects: { profit: 8, forest: -5, trust: 0, stress: 4 },
  },
  {
    id: 'a1_landgrab',
    text: 'Quietly file claim on an adjacent unmapped plot.',
    act: 1, tier: 'high',
    effects: { profit: 12, forest: -8, trust: -4, stress: 8 },
  },

  // ---------- ACT 2: "The Quarter" — investor pressure, costs rise ----------
  {
    id: 'a2_offset',
    text: 'Buy a carbon offset instead of expanding operations.',
    act: 2, tier: 'calm',
    effects: { profit: -2, forest: 2, trust: 4, stress: -4 },
  },
  {
    id: 'a2_report',
    text: 'Publish an honest impact report, flaws included.',
    act: 2, tier: 'calm',
    effects: { profit: -3, forest: 0, trust: 6, stress: -2 },
  },
  {
    id: 'a2_expand',
    text: 'Expand the "sustainable" harvest zone to hit quarterly targets.',
    act: 2, tier: 'mid',
    effects: { profit: 10, forest: -10, trust: -2, stress: 5 },
  },
  {
    id: 'a2_road',
    text: 'Cut an access road through untouched canopy for logistics.',
    act: 2, tier: 'mid',
    effects: { profit: 9, forest: -14, trust: -3, stress: 6 },
  },
  {
    id: 'a2_lobby',
    text: 'Lobby against a proposed protected-area designation.',
    act: 2, tier: 'high',
    effects: { profit: 15, forest: -6, trust: -8, stress: 10 },
  },
  {
    id: 'a2_bribe',
    text: 'Pay off a local inspector to skip the compliance review.',
    act: 2, tier: 'high',
    effects: { profit: 18, forest: -12, trust: -10, stress: 12 },
  },

  // ---------- ACT 3: "The Reckoning" — extraction race, big swings ----------
  {
    id: 'a3_restore',
    text: 'Divert this quarter\'s budget into emergency reforestation.',
    act: 3, tier: 'calm',
    effects: { profit: -10, forest: 8, trust: 8, stress: -6 },
  },
  {
    id: 'a3_hold',
    text: 'Freeze operations on this plot, wait out the scrutiny.',
    act: 3, tier: 'calm',
    effects: { profit: -1, forest: 1, trust: 2, stress: -3 },
  },
  {
    id: 'a3_clearcut',
    text: 'Clear-cut the remaining plot before the season ends.',
    act: 3, tier: 'high',
    effects: { profit: 22, forest: -20, trust: -6, stress: 9 },
  },
  {
    id: 'a3_sell',
    text: 'Sell the land rights outright to the highest bidder.',
    act: 3, tier: 'high',
    effects: { profit: 28, forest: -18, trust: -12, stress: 10 },
  },
  {
    id: 'a3_burn',
    text: 'Authorize a controlled burn to clear for cattle grazing.',
    act: 3, tier: 'high',
    effects: { profit: 20, forest: -22, trust: -10, stress: 11 },
  },
  {
    id: 'a3_diversify',
    text: 'Pivot to a Brazil-nut / açaí supply chain instead.',
    act: 3, tier: 'mid',
    effects: { profit: 12, forest: -3, trust: 5, stress: 1 },
  },
]

export function choicesForAct(act) {
  return CHOICE_POOL.filter((c) => c.act === act)
}
