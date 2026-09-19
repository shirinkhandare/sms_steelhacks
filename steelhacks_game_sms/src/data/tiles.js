export function mulberry32(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const FLAVOR_TYPES = [
  { type: 'old-growth', weight: 5 },
  { type: 'indigenous-land', weight: 2 },
  { type: 'secondary-growth', weight: 4 },
]

export const TILE_TYPE_LABELS = {
  'old-growth': 'an old-growth stand',
  'river-adjacent': 'a river-adjacent plot',
  'indigenous-land': 'land under indigenous stewardship',
  'secondary-growth': 'a secondary-growth clearing',
}

export const SIZE_TIERS = [
  { size: 'small', weight: 6, multiplier: 0.7, colSpan: 1, rowSpan: 1 },
  { size: 'medium', weight: 3, multiplier: 1.1, colSpan: 2, rowSpan: 1 },
  { size: 'large', weight: 1, multiplier: 1.8, colSpan: 2, rowSpan: 2 },
]

function weightedPick(rand, options) {
  const total = options.reduce((sum, o) => sum + o.weight, 0)
  let roll = rand() * total
  for (const o of options) {
    if (roll < o.weight) return o
    roll -= o.weight
  }
  return options[0]
}

export function generateTiles(columns, rows, seed = 1) {
  const rand = mulberry32(seed)
  const total = columns * rows


  const riverCols = []
  let col = Math.floor(rand() * columns)
  for (let r = 0; r < rows; r++) {
    col += Math.round(rand() * 2 - 1) // -1, 0, or +1
    col = Math.max(0, Math.min(columns - 1, col))
    riverCols.push(col)
  }
  const riverIndexByRow = riverCols.map((c, r) => r * columns + c)
  const riverSet = new Set(riverIndexByRow)

  const tiles = Array.from({ length: total }, (_, index) => {
    const row = Math.floor(index / columns)
    const c = index % columns
    const isRiver = riverSet.has(index)

    const flavor = isRiver
      ? 'river-adjacent'
      : weightedPick(rand, FLAVOR_TYPES).type

   
    const sizeTier = isRiver ? SIZE_TIERS[0] : weightedPick(rand, SIZE_TIERS)

    return {
      index,
      row,
      col: c,
      type: flavor,
      size: sizeTier.size,
      valueMultiplier: sizeTier.multiplier,
      colSpan: sizeTier.colSpan,
      rowSpan: sizeTier.rowSpan,
      isRiver,
      pollution: 0,
      degraded: false,
      owner: null,
    }
  })

  return { tiles, riverOrder: riverIndexByRow }
}

export function neighborsOf(index, columns, rows) {
  const row = Math.floor(index / columns)
  const col = index % columns
  const out = []
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
      const r = row + dr
      const c = col + dc
      if (r >= 0 && r < rows && c >= 0 && c < columns) {
        out.push(r * columns + c)
      }
    }
  }
  return out
}

export function spreadPollution(tiles, riverOrder, sourceIndex, amount) {
  const next = tiles.map((t) => ({ ...t }))
  const riverPos = riverOrder.indexOf(sourceIndex)
  if (riverPos === -1) return next // not a river tile, nothing to spread along

  const decay = [1, 0.5, 0.25]
  decay.forEach((factor, step) => {
    const targetIndex = riverOrder[riverPos + step]
    if (targetIndex === undefined) return
    const tile = next[targetIndex]
    tile.pollution = Math.max(0, Math.min(100, tile.pollution + amount * factor))
  })
  return next
}