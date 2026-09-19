export default function ChoiceCards({ choices, onChoose }) {
  return (
    <div className="choice-cards">
      {choices.map((c) => (
        <button key={c.id} className={`choice-card tier-${c.tier}`} onClick={() => onChoose(c.id)}>
          <p className="choice-text">{c.text}</p>
          <div className="choice-effects">
            {c.effects.profit !== 0 && (
              <span className={c.effects.profit > 0 ? 'pos' : 'neg'}>
                Profit {c.effects.profit > 0 ? '+' : ''}{c.effects.profit}
              </span>
            )}
            {c.effects.forest !== 0 && (
              <span className={c.effects.forest > 0 ? 'pos' : 'neg'}>
                Forest {c.effects.forest > 0 ? '+' : ''}{c.effects.forest}
              </span>
            )}
            {c.effects.trust !== 0 && (
              <span className={c.effects.trust > 0 ? 'pos' : 'neg'}>
                Trust {c.effects.trust > 0 ? '+' : ''}{c.effects.trust}
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}
