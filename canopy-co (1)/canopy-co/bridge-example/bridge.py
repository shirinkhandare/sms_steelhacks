"""
Minimal WebSocket bridge stub for Canopy Co.

This is the piece that turns real Presage/SmartSpectra vitals into the
JSON messages the React app listens for: {"stress": <0-100 float>}

Right now it just sends a slowly-drifting fake value so you can build/test
the React side without the SDK wired up yet. Replace `read_stress()` with
a real call into the SmartSpectra C++/Python bindings (heart rate
variability + breathing rate are good raw inputs to derive a 0-100 stress
score from — e.g. normalize HRV inversely, blend with breathing rate
irregularity).

Install deps:
    pip install websockets

Run:
    python bridge.py
"""

import asyncio
import json
import random

import websockets

_fake_stress = 20.0


def read_stress() -> float:
    """Replace this with a real SmartSpectra read. Must return 0-100."""
    global _fake_stress
    _fake_stress += random.uniform(-3, 5)
    _fake_stress = max(0.0, min(100.0, _fake_stress))
    return _fake_stress


async def handler(websocket):
    print("Client connected.")
    try:
        while True:
            stress = read_stress()
            await websocket.send(json.dumps({"stress": stress}))
            await asyncio.sleep(1.0)
    except websockets.exceptions.ConnectionClosed:
        print("Client disconnected.")


async def main():
    async with websockets.serve(handler, "localhost", 8765):
        print("Presage bridge stub running at ws://localhost:8765")
        await asyncio.Future()  # run forever


if __name__ == "__main__":
    asyncio.run(main())
