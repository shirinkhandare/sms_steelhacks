import { SmartSpectraSDK, breathingMetrics, cardioMetrics, decodeMetrics } from '@smartspectra/node-sdk';
import { WebSocketServer } from 'ws';

const PORT = 8765;
const apiKey = process.env.SMARTSPECTRA_API_KEY;

if (!apiKey) {
  console.error('SMARTSPECTRA_API_KEY is required. Set it before running the bridge.');
  process.exit(1);
}

const wss = new WebSocketServer({ port: PORT });
console.log(`Bridge listening on ws://localhost:${PORT}`);

wss.on('connection', () => console.log('Game client connected'));

const sdk = new SmartSpectraSDK({
  apiKey,
  requestedMetrics: [...breathingMetrics, ...cardioMetrics],
});

function broadcast(data) {
  const msg = JSON.stringify(data);
  for (const client of wss.clients) {
    if (client.readyState === client.OPEN) client.send(msg);
  }
}

// Returns the newest finite number in a sample array, or null if there isn't one.
function latestValue(samples) {
  const value = samples?.at(-1)?.value;
  return Number.isFinite(value) ? value : null;
}

// SmartSpectra provides vitals, not a clinical stress diagnosis. This is
// deliberately a game-only 0-100 tension signal derived from those vitals.
function toGameStress(pulseRate, breathingRate) {
  const pulseContribution = pulseRate == null ? 0 : (pulseRate - 70) * 1.2;
  const breathingContribution = breathingRate == null ? 0 : (breathingRate - 14) * 2;
  return Math.round(Math.max(0, Math.min(100, 35 + pulseContribution + breathingContribution)));
}

// Last known good readings. Metrics messages arrive constantly and many of them
// have empty windows or only some fields, so we never overwrite a good value with null.
const last = { breathingRate: null, pulseRate: null };

// Debug: print the first few raw decoded messages so you can confirm the real
// property names (optional chaining hides wrong paths by returning undefined).
// Set to 0 once everything works.
let rawDumpsLeft = 3;

sdk.on('metrics', (buf, timestampUs) => {
  const metrics = decodeMetrics(buf);
  if (Buffer.isBuffer(metrics)) return; // undecodable frame, skip

  if (rawDumpsLeft > 0) {
    rawDumpsLeft--;
    console.log(
      'RAW METRICS:',
      JSON.stringify(metrics, (_, v) => (typeof v === 'bigint' ? v.toString() : v)).slice(0, 2000)
    );
  }

  const breathingRate = latestValue(metrics.breathing?.rate);
  const pulseRate = latestValue(metrics.cardio?.pulseRate);
  if (breathingRate != null) last.breathingRate = breathingRate;
  if (pulseRate != null) last.pulseRate = pulseRate;

  console.log('breathing:', last.breathingRate, ' pulse:', last.pulseRate);

  // Nothing usable yet (warm-up, face not found, etc.)
  if (last.breathingRate == null && last.pulseRate == null) return;

  broadcast({
    stress: toGameStress(last.pulseRate, last.breathingRate),
    breathingRate: last.breathingRate,
    pulseRate: last.pulseRate,
    timestampUs: String(timestampUs), // String() avoids a BigInt JSON.stringify crash
  });
});

// If values stay null, these warnings tell you why (lighting, face position, movement).
sdk.on('validationStatus', (code, timestampUs, hint) => {
  if (code !== 0) console.warn('SmartSpectra input needs attention:', hint || `validation code ${code}`);
});

sdk.on('error', (code, message, retryable) =>
  console.error('SmartSpectra error:', code, message, `(retryable: ${retryable})`)
);

try {
  sdk.useCamera();
  sdk.start();
} catch (error) {
  console.error('Could not start SmartSpectra:', error.message);
  wss.close();
  process.exit(1);
}

console.log('Measuring from the default camera. Press Ctrl+C to stop.');

async function shutdown() {
  try {
    await sdk.stopAsync();
    await sdk.destroy();
  } catch (error) {
    console.error('Error during shutdown:', error.message);
  } finally {
    wss.close();
    process.exit(0);
  }
}

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);