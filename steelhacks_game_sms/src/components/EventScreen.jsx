import Box from './Box'

export default function EventScreen({ event, onAcknowledge }) {
  return (
    <div className="event-screen">
      <Box>
        <h2>Meanwhile...</h2>
        <p>{event.text}</p>
        <button onClick={onAcknowledge}>Continue</button>
      </Box>
    </div>
  )
}