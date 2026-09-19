# Canopy Co.

Two-player, turn-based game. Each player runs a company entering the Amazon
promising sustainable development. Every turn offers 3 choices, drawn from
a pool that skews more extractive/damaging as the active player's stress
rises. A shared Forest Health bar drains from both players' actions. The
game ends on a turn limit or forest collapse. The scoreboard shows who
"won" on profit — then reveals what that actually cost.

## Run it

```bash
npm install
npm run dev
```

Open the printed local URL. The game plays fully standalone — if no
Presage bridge is connected, stress ramps on a simulated timer instead
(see `src/hooks/usePresageSocket.js`), so you can build/demo without a
webcam or the SDK wired up yet.

## Presage integration

`src/hooks/usePresageSocket.js` connects to `ws://localhost:8765` and
expects JSON messages shaped `{ "stress": 0-100 }`. `bridge-example/bridge.py`
is a stub that sends fake drifting values — swap `read_stress()` for a real
SmartSpectra read (derive a 0-100 score from heart rate variability +
breathing regularity; lower HRV / more irregular breathing = higher stress).

```bash
cd bridge-example
pip install websockets
python bridge.py
```

Run the bridge, then reload the React app — the "(simulated)" stress label
in the UI switches to "(live)" once it connects.

## What to tune first

- `src/gameReducer.js` — `TURNS_PER_ACT`, `BASE_TIME_MS`, `RANDOM_EVENT_CHANCE`
- `src/data/choices.js` — the actual choice text + stat deltas per act/tier
- `src/data/events.js` — random interrupt events
- `src/components/EndingScreen.jsx` — the final "real cost" stats shown

## Build for judging

```bash
npm run build
npm run preview   # sanity-check the production build locally
```

Deploy the `dist/` folder to Vercel/Netlify/GitHub Pages for a link judges
can open instantly. Note: if you're leaning on the live Presage bridge for
the demo, that only works on the machine actually running `bridge.py` —
plan to demo live rather than relying on a hosted link picking up webcam
data, unless you build a public bridge relay.
