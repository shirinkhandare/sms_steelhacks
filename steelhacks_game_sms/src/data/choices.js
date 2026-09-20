// Each choice: id, text, act it can appear in ('any' = all acts),
// tier = which stress band favors it ('calm' | 'mid' | 'high'),
// effects = deltas applied to the ACTIVE player + shared forest health.
// profit: player's money. forest: shared Forest Health (both players draw from it).
// trust: player's public trust. stress: player's own stress (this game's "HP for panic").

export const CHOICE_POOL = [
  // ---------- ACT 1: "The Pitch" ----------

  {
    id: 'a1_survey',
    text: 'Ask the locals first.',
    act: 1, tier: 'calm',
    effects: { profit: -2, forest: 0, trust: 3, stress: 0 },
  },

  {
    id: 'a1_partner',
    text: 'Share control with the community.',
    act: 1, tier: 'calm',
    effects: { profit: -5, forest: 1, trust: 5, stress: 0},
  },

  {
    id: 'a1_ecotour',
    text: 'Build an eco-tourism trail.',
    act: 1, tier: 'mid',
    effects: { profit: -10, forest: -2, trust: 2, stress: 0 },
  },

  {
    id: 'a1_selective',
    text: 'Harvest a few mature trees.',
    act: 1, tier: 'mid',
    effects: { profit: -8, forest: -5, trust: 0, stress: 0 },
  },

  {
    id: 'a1_landgrab',
    text: 'Claim the unmapped land.',
    act: 1, tier: 'high',
    effects: { profit: -12, forest: -8, trust: -4, stress: 0 },
  },


  // ---------- ACT 2: "The Quarter" ----------

  {
    id: 'a2_offset',
    text: 'Donate to a rainforest NGO to offset the damage.',
    act: 2, tier: 'calm',
    effects: { profit: -6, forest: 5, trust: 4, stress: 0 },
  },

  {
    id: 'a2_report',
    text: 'Tell the truth. Publish the report.',
    act: 2, tier: 'calm',
    effects: { profit: -3, forest: 0, trust: 6, stress: 0 },
  },

  {
    id: 'a2_expand',
    text: 'Expand the harvest zone.',
    act: 2, tier: 'mid',
    effects: { profit: -10, forest: -10, trust: -2, stress: 0 },
  },

  {
    id: 'a2_road',
    text: 'Build the road through the canopy.',
    act: 2, tier: 'mid',
    effects: { profit: 9, forest: -14, trust: -3, stress: 0 },
  },

  {
    id: 'a2_lobby',
    text: 'Fight the protected-area plan.',
    act: 2, tier: 'high',
    effects: { profit: -15, forest: -6, trust: -8, stress: 0 },
  },

  {
    id: 'a2_bribe',
    text: 'Make the inspector look away.',
    act: 2, tier: 'high',
    effects: { profit: 15, forest: -12, trust: -10, stress: 0 },
  },


  // ---------- ACT 3: "The Reckoning" ----------

  {
    id: 'a3_restore',
    text: 'Spend big on reforestation.',
    act: 3, tier: 'calm',
    effects: { profit: -10, forest: 8, trust: 8, stress: 0 },
  },

  {
    id: 'a3_hold',
    text: 'Shut down. Wait it out.',
    act: 3, tier: 'calm',
    effects: { profit: -1, forest: 1, trust: 2, stress: 0 },
  },

  {
    id: 'a3_clearcut',
    text: 'Clear-cut the rest.',
    act: 3, tier: 'high',
    effects: { profit: 22, forest: -20, trust: -6, stress: 0 },
  },

  {
    id: 'a3_sell',
    text: 'Sell the land to the highest bidder.',
    act: 3, tier: 'high',
    effects: { profit: 28, forest: -18, trust: -12, stress: 0 },
  },

  {
    id: 'a3_burn',
    text: 'Burn it. Make room for cattle.',
    act: 3, tier: 'high',
    effects: { profit: 20, forest: -22, trust: -10, stress: 0 },
  },

  {
    id: 'a3_diversify',
    text: 'Switch to Brazil nuts and açaí.',
    act: 3, tier: 'mid',
    effects: { profit: 12, forest: -3, trust: 5, stress: 0 },
  },
]

export function choicesForAct(act) {
  return CHOICE_POOL.filter((c) => c.act === act)
}