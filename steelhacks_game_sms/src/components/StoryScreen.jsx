import Box from './Box'

const ACT_COPY = {
  1: {
    title: 'Act I — The Pitch',
    body: 'Two companies enter the Amazon with the same promise: sustainable development, done right. Shareholders are patient. For now.',
  },
  2: {
    title: 'Act II — The Quarter',
    body: 'The first earnings call is coming. The easy, gentle choices are starting to look expensive.',
  },
  3: {
    title: 'Act III — The Reckoning',
    body: "What's left of the forest is what's left to take. Everyone can see it now.",
  },
  4: {
    title: 'Act IV — The Ledger',
    body: 'The last quarter closes. Whatever is standing when the numbers are counted is all anyone will remember.',
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