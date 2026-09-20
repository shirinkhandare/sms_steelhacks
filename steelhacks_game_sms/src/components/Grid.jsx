import { useState } from 'react'
import tile5Copy5 from '../assets/Untitled 5 copy 5.png'
import tile5Copy6 from '../assets/Untitled 5 copy 6.png'
import tile5Copy7 from '../assets/Untitled 5 copy 7.png'
import tile5Copy8 from '../assets/Untitled 5 copy 8.png'
import tile6 from '../assets/Untitled 6.png'
import tile8Copy5 from '../assets/Untitled 8 copy 5.png'
import tile8Copy6 from '../assets/Untitled 8 copy 6.png'
import tile8Copy7 from '../assets/Untitled 8 copy 7.png'
import tile8Copy8 from '../assets/Untitled 8 copy 8.png'
import tile9 from '../assets/Untitled 9.png'
import greyTile from '../assets/Grey.png'

// Every tile gets a random image from this pool, at a random 90° rotation.
// Repeats are expected — this is not a one-image-per-tile assignment.
const OVERLAY_TILE_IMAGES = [
  tile5Copy5,
  tile5Copy6,
  tile5Copy7,
  tile5Copy8,
  tile6,
  tile8Copy5,
  tile8Copy6,
  tile8Copy7,
  tile8Copy8,
  tile9,
]

const ROTATIONS = [0, 90, 180, 270]

function createTileOverlay(tiles) {
  // A shuffled damage order keeps the affected locations random, while making
  // the same cells turn grey/recover predictably as forest health changes.
  const damageOrder = tiles.map((tile) => tile.index)
  for (let index = damageOrder.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    const currentValue = damageOrder[index]
    damageOrder[index] = damageOrder[swapIndex]
    damageOrder[swapIndex] = currentValue
  }
  const damageRankByIndex = new Map(
    damageOrder.map((tileIndex, rank) => [tileIndex, rank])
  )

  return new Map(
    tiles.map((tile) => [
      tile.index,
      {
        src: OVERLAY_TILE_IMAGES[Math.floor(Math.random() * OVERLAY_TILE_IMAGES.length)],
        rotation: ROTATIONS[Math.floor(Math.random() * ROTATIONS.length)],
        damageRank: damageRankByIndex.get(tile.index),
      },
    ])
  )
}

export default function Grid({
  columns,
  tiles = [],
  forestHealth = 100,
  activeTileIndex = null,
  onTileClick = null,
}) {
  const [tileOverlay] = useState(() => createTileOverlay(tiles))
  const healthyForest = Math.max(0, Math.min(100, forestHealth))
  const greyTileCount = Math.round(((100 - healthyForest) / 100) * tiles.length)

  return (
    <section
      className="game-grid"
      style={{ '--grid-columns': columns }}
      aria-label="Forest map"
    >
      {tiles.map((tile) => {
        const overlay = tileOverlay.get(tile.index)
        const isDeforested = overlay?.damageRank < greyTileCount

        return (
          <button
            key={tile.index}
            type="button"
            className={[
              'game-grid-cell',
              `tile-${tile.type}`,
              `tile-size-${tile.size}`,
              tile.degraded ? 'tile-degraded' : '',
              tile.owner ? `tile-owner-${tile.owner}` : '',
              tile.index === activeTileIndex ? 'tile-active' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{
              gridColumn: `span ${tile.colSpan}`,
              gridRow: `span ${tile.rowSpan}`,
              ...(tile.isRiver
                ? { '--pollution': Math.min(1, tile.pollution / 100) }
                : {}),
            }}
            title={[
              tile.type,
              tile.degraded ? 'degraded' : null,
              tile.owner ? `claimed by ${tile.owner}` : null,
              tile.isRiver && tile.pollution > 0
                ? `pollution ${Math.round(tile.pollution)}%`
                : null,
            ]
              .filter(Boolean)
              .join(' — ')}
            aria-label={`Plot ${tile.index + 1}: ${tile.type}`}
            onClick={onTileClick ? () => onTileClick(tile.index, tile) : undefined}
            disabled={!onTileClick}
          >
            {overlay && (
              <img
                className="grid-tile-overlay"
                src={isDeforested ? greyTile : overlay.src}
                alt=""
                aria-hidden="true"
                draggable="false"
                style={{ transform: `rotate(${overlay.rotation}deg)` }}
              />
            )}
          </button>
        )
      })}
    </section>
  )
}
