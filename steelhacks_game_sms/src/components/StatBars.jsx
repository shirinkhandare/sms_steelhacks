function Bar({ label, value, max = 100, colorClass }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className="stat-bar">
      <div className="stat-bar-label">
        <span>{label}</span>
        <span>{Math.round(value)}</span>
      </div>
      <div className="stat-bar-track">
        <div
          className={`stat-bar-fill ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default function StatBars({ player, forestHealth, presageConnected }) {
  return (
    <div className="stat-bars">
      <Bar label={`${player.name} — Profit`} value={player.profit} max={200} colorClass="fill-profit" />
      <Bar label="Public Trust" value={player.trust} colorClass="fill-trust" />
      <Bar
        label={`Stress ${presageConnected ? '(live)' : '(simulated)'}`}
        value={player.stress}
        colorClass="fill-stress"
      />
      <Bar label="Forest Health (shared)" value={forestHealth} colorClass="fill-forest" />
    </div>
  )
}