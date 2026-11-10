import express from 'express';
import cors from 'cors';
import { getSystemSnapshot } from './lib/system-info';
import { getAllReports, saveUserReport } from './lib/data-store';
import { randomUUID } from 'crypto';

const app = express();
const port = Number(process.env.AIAWARE_BRIDGE_PORT) || 3001;
// Loopback only: the bridge exposes hostname, IPs, MAC addresses and processes.
const host = '127.0.0.1';

const allowedOrigins = new Set(
  (process.env.AIAWARE_ALLOWED_ORIGINS ??
    'http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
);
const allowedHosts = new Set([`localhost:${port}`, `127.0.0.1:${port}`]);

// Block DNS-rebinding: only accept requests addressed to the loopback host.
app.use((req, res, next) => {
  if (!allowedHosts.has(req.headers.host ?? '')) {
    res.status(403).json({ error: 'Forbidden host' });
    return;
  }
  next();
});

// CORS headers alone don't stop a cross-site POST from landing, so reject
// any request that carries a browser Origin we don't trust.
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && !allowedOrigins.has(origin)) {
    res.status(403).json({ error: 'Forbidden origin' });
    return;
  }
  next();
});

app.use(
  cors({
    origin: (origin, cb) => cb(null, !origin || allowedOrigins.has(origin)),
    methods: ['GET', 'POST'],
  }),
);
app.use(express.json({ limit: '16kb' }));

const STATE_TYPES = new Set([
  'network_performance', 'thermal_issue', 'memory_pressure', 'disk_pressure', 'power_issue',
  'display_issue', 'audio_issue', 'peripheral_issue', 'environmental', 'availability_constraint', 'other',
]);
const DURATIONS = new Set(['temporary', 'unknown', 'persistent']);
const SEVERITIES = new Set(['low', 'medium', 'high', 'critical']);

app.get('/api/snapshot', async (req, res) => {
  try {
    const snapshot = await getSystemSnapshot();
    res.json(snapshot);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get('/api/reports', (req, res) => {
  try {
    const reports = getAllReports();
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/api/reports', async (req, res) => {
  try {
    const { stateType, description, severity, expectedDuration } = req.body ?? {};
    if (
      typeof stateType !== 'string' || !STATE_TYPES.has(stateType) ||
      typeof description !== 'string' || description.trim() === '' || description.length > 1000 ||
      typeof severity !== 'string' || !SEVERITIES.has(severity) ||
      typeof expectedDuration !== 'string' || !DURATIONS.has(expectedDuration)
    ) {
      res.status(400).json({ error: 'Invalid report' });
      return;
    }
    const snapshot = await getSystemSnapshot();
    
    const report = {
      reportId: randomUUID(),
      timestamp: new Date().toISOString(),
      stateType,
      userDescription: description, // Match server type
      severity,
      expectedDuration,
      autoDetectSnapshot: snapshot,
      verification: {
        status: 'pending',
        confidence: 0,
        evidence: [],
        verifiedAt: null,
      },
      temporal: {
        flag: 'temporary',
        recurrenceCount: 1,
        firstReported: new Date().toISOString(),
        lastReported: new Date().toISOString(),
        decaySchedule: new Date(Date.now() + 3600000).toISOString(),
      }
    };
    
    saveUserReport(report as any);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.listen(port, host, () => {
  console.log(`Bridge server running at http://${host}:${port}`);
});
