export default function Grid({
  columns,
  tiles,
  activeTileIndex = null,
  onTileClick = null,
}) {
  return (
    <section
      className="game-grid"
      style={{ '--grid-columns': columns }}
      aria-label="Forest map"
    >
      {tiles.map((tile) => (
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
        />
      ))}
    </section>
  )
}