import Box from './Box'

const ACT_COPY = {
  1: {
    title: 'Amazon Under Pressure',
    body: 'Amazon Under Pressure is a single-player strategy game about running a company that enters the Amazon rainforest promising sustainable development, and watching that promise erode as your own real stress level starts making decisions for you.',
  },
  2: {
    title: 'How to Play',
    body: "Each turn, click a choice to increase or decrease the forest cover, profit, stress, and, public trust.\nYour real stress level drives the game, read live through your webcam. Stay calm and your options stay balanced. Get stressed and your choices skew toward fast, greedy, high-damage decisions, with less time on the clock to decide.\nProfit is your score. Trust and Stress are yours alone. Forest Health is shared.\nBut, watch out if your profit hits 0 then you have lost.\nAt the end, you'll see your final Profit, make the most profit to beat the bot.",
  },
  3: {
    title: 'The forest looks a little different',
    body: 'But thats alright...',
  },
  4: {
    title: 'Your stress is looking a little high...',
    body: "Don't let Company B win.",
  },
}

export default function StoryScreen({ act, onBegin }) {
  const copy = ACT_COPY[act] ?? { title: `Act ${act}`, body: '' }
  return (
    <div className="story-screen">
      <Box>
        <h1>{copy.title}</h1>
        <p>{copy.body}</p>
        <button onClick={onBegin}>Continue</button>
      </Box>
    </div>
  )
}