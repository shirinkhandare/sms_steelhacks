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

function latestValue(samples) {
  const value = samples?.at(-1)?.value;
  return Number.isFinite(value) ? value : null;
}

function toGameStress(pulseRate, breathingRate) {
  // SmartSpectra provides vitals, not a clinical stress diagnosis. This is
  // deliberately a game-only 0–100 tension signal derived from those vitals.
  const pulseContribution = pulseRate == null ? 0 : (pulseRate - 70) * 1.2;
  const breathingContribution = breathingRate == null ? 0 : (breathingRate - 14) * 2;
  return Math.round(Math.max(0, Math.min(100, 35 + pulseContribution + breathingContribution)));

}
  


sdk.on('metrics', (buf, timestampUs) => {
  const metrics = decodeMetrics(buf);
  if (Buffer.isBuffer(metrics)) return; // undecodable frame, skip

  const breathingRate = latestValue(metrics.breathing?.rate);
  const pulseRate = latestValue(metrics.cardio?.pulseRate);

  console.log('breathing:', breathingRate, ' pulse:', pulseRate);

  if (breathingRate == null && pulseRate == null) return;

  broadcast({
    stress: toGameStress(pulseRate, breathingRate),
    breathingRate,
    pulseRate,
    timestampUs,
  });
});



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
  await sdk.stopAsync();
  await sdk.destroy();
  wss.close();
}

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
