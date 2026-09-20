import forestBar from '../assets/Forest.png'
import profitBar from '../assets/Profit.png'
import stressBar from '../assets/Stress.png'

function Bar({ label, value, max = 100, image, colorClass }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))

  return (
    <div className="stat-bar">
      <div className="stat-bar-label">
        <span>{label}</span>
        <span>{Math.round(value)}</span>
      </div>

      {/* Pixel art bar container — scales responsively, frame + fill
          track are both percentage-based so they never outgrow their
          column the way a fixed-px bar would */}
      <div className="pixel-bar">
        <img src={image} className="pixel-bar-image" alt="" />
        <div className="pixel-bar-track">
          <div className={`pixel-bar-fill ${colorClass}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  )
}

export default function StatBars({ player, forestHealth, presageConnected }) {
  return (
    <div className="stat-bars">
      <Bar
        label={`${player.name} — Profit`}
        value={player.profit}
        max={200}
        image={profitBar}
        colorClass="fill-profit"
      />

      <Bar
        label="Public Trust"
        value={player.trust}
        image={forestBar}
        colorClass="fill-trust"
      />

      <Bar
        label={`Stress ${presageConnected ? '(live)' : '(simulated)'}`}
        value={player.stress}
        image={stressBar}
        colorClass="fill-stress"
      />

      <Bar
        label="Forest Health (shared)"
        value={forestHealth}
        image={forestBar}
        colorClass="fill-forest"
      />
    </div>
  )
}