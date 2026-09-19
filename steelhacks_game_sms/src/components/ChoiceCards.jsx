export default function ChoiceCards({ choices, onChoose, multiplier = 1 }) {
  const scaled = (n) => Math.round(n * multiplier)

  return (
    <div className="choice-cards">
      {choices.map((c) => {
        const profit = scaled(c.effects.profit)
        const forest = scaled(c.effects.forest)
        const trust = c.effects.trust // trust/stress aren't tile-scaled
        return (
          <button key={c.id} className={`choice-card tier-${c.tier}`} onClick={() => onChoose(c.id)}>
            <p className="choice-text">{c.text}</p>
            <div className="choice-effects">
              {profit !== 0 && (
                <span className={profit > 0 ? 'pos' : 'neg'}>
                  Profit {profit > 0 ? '+' : ''}{profit}
                </span>
              )}
              {forest !== 0 && (
                <span className={forest > 0 ? 'pos' : 'neg'}>
                  Forest {forest > 0 ? '+' : ''}{forest}
                </span>
              )}
              {trust !== 0 && (
                <span className={trust > 0 ? 'pos' : 'neg'}>
                  Trust {trust > 0 ? '+' : ''}{trust}
                </span>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}