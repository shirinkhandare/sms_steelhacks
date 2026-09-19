import { useEffect, useRef, useState } from 'react'

// Expects a local bridge (Python/Node) that reads webcam vitals via the
// SmartSpectra SDK and pushes JSON like: { "stress": 42 } (0-100)
// over a WebSocket at this URL. See /bridge.mjs.
const BRIDGE_URL =
  import.meta.env.VITE_PRESAGE_BRIDGE_URL || 'ws://localhost:8765'
const RECONNECT_DELAY_MS = 2_000

// If no bridge is connected, stress climbs slowly on its own so the
// "choices get worse over time" mechanic still functions during dev/demo
// without a webcam hooked up.
function useSimulatedStress(active) {
  const [stress, setStress] = useState(20)
  useEffect(() => {
    if (!active) return
    const id = setInterval(() => {
      setStress((s) => Math.min(100, s + (Math.random() * 6 - 1)))
    }, 2500)
    return () => clearInterval(id)
  }, [active])
  return stress
}

export function usePresageSocket() {
  const [connected, setConnected] = useState(false)
  const [liveStress, setLiveStress] = useState(null)
  const wsRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    let reconnectTimer

    const connect = () => {
      if (cancelled) return

      let ws
      try {
        ws = new WebSocket(BRIDGE_URL)
      } catch {
        setConnected(false)
        reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS)
        return
      }
      wsRef.current = ws

      ws.onopen = () => {
        if (!cancelled) setConnected(true)
      }
      ws.onclose = () => {
        if (!cancelled) {
          setConnected(false)
          reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS)
        }
      }
      ws.onerror = () => {
        if (!cancelled) setConnected(false)
      }
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (typeof data.stress === 'number' && !cancelled) {
            setLiveStress(Math.max(0, Math.min(100, data.stress)))
          }
        } catch {
          // ignore malformed frames
        }
      }
    }

    connect()

    return () => {
      cancelled = true
      clearTimeout(reconnectTimer)
      wsRef.current?.close()
    }
  }, [])

  const simulatedStress = useSimulatedStress(!connected)

  return {
    connected,
    // Prefer real Presage data; fall back to the simulated ramp for dev/demo.
    stress: connected && liveStress !== null ? liveStress : simulatedStress,
  }
}
