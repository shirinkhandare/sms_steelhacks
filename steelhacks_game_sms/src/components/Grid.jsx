export default function Grid({ columns = 12, rows = 8 }) {
  const cells = Array.from({ length: columns * rows }, (_, index) => index)

  return (
    <section
      className="game-grid"
      style={{ '--grid-columns': columns }}
      aria-label="Forest map"
    >
      {cells.map((cell) => (
        <span className="game-grid-cell" key={cell} aria-hidden="true" />
      ))}
    </section>
  )
}
