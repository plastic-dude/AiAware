/**
 * AiAware — Data Store Layer
 * Manages all local JSON/JSONL persistence
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import { createHash } from "crypto";
import type {
  DeviceFingerprint,
  UserReport,
  CrossDeviceLearning,
  TelemetryEntry,
  SystemSnapshot,
  DevicePattern,
  DeviceBehaviorPatterns,
} from "../types/index.js";

const DATA_DIR = join(homedir(), ".aiaware");
const DEVICE_FP_FILE = join(DATA_DIR, "device-fingerprint.json");
const REPORTS_FILE = join(DATA_DIR, "user-reports.jsonl");
const VERIFIED_STATES_FILE = join(DATA_DIR, "verified-states.json");
const CROSS_DEVICE_FILE = join(DATA_DIR, "cross-device-learning.json");
const TELEMETRY_FILE = join(DATA_DIR, "telemetry.jsonl");
const BASELINES_DIR = join(DATA_DIR, "baselines");

function ensureDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(BASELINES_DIR)) mkdirSync(BASELINES_DIR, { recursive: true });
}

function readJson<T>(path: string, fallback: T): T {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, "utf-8")) as T;
  } catch {
    return fallback;
  }
}

function writeJson(path: string, data: unknown) {
  ensureDir();
  writeFileSync(path, JSON.stringify(data, null, 2));
}

function appendJsonl(path: string, data: unknown) {
  ensureDir();
  appendFileSync(path, JSON.stringify(data) + "\n");
}

function readJsonl<T>(path: string): T[] {
  if (!existsSync(path)) return [];
  return readFileSync(path, "utf-8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as T);
}

// ───────────────────────────────────────────
// Device Fingerprint
// ───────────────────────────────────────────

export async function getOrCreateDeviceFingerprint(
  snapshot: SystemSnapshot
): Promise<DeviceFingerprint> {
  ensureDir();
  const existing = readJson<DeviceFingerprint | null>(DEVICE_FP_FILE, null);

  if (existing) {
    existing.lastSeen = new Date().toISOString();
    existing.sessionCount += 1;
    // Update typical usage with rolling average
    const memPercent = snapshot.memory.usedPercent;
    const cpuLoad = snapshot.cpu.loadPercent;
    const n = existing.sessionCount;
    existing.typicalUsage.peakMemoryUsagePercent =
      (existing.typicalUsage.peakMemoryUsagePercent * (n - 1) + memPercent) / n;
    existing.typicalUsage.typicalCpuLoad =
      (existing.typicalUsage.typicalCpuLoad * (n - 1) + cpuLoad) / n;
    writeJson(DEVICE_FP_FILE, existing);
    return existing;
  }

  const fp: DeviceFingerprint = {
    fingerprintId: generateFingerprintId(snapshot),
    hardware: {
      cpu: snapshot.cpu.brand,
      cores: snapshot.cpu.cores,
      ramGB: Math.round(snapshot.memory.total / 1024 / 1024 / 1024),
      gpu: "unknown",
      diskType: snapshot.disk.some((d) => d.type.includes("SSD")) ? "SSD" : "HDD",
    },
    firstSeen: new Date().toISOString(),
    lastSeen: new Date().toISOString(),
    sessionCount: 1,
    typicalUsage: {
      avgSessionMinutes: 0,
      peakMemoryUsagePercent: snapshot.memory.usedPercent,
      typicalCpuLoad: snapshot.cpu.loadPercent,
      typicalNetworkRxSec: snapshot.network.stats?.rx_sec ?? null,
    },
  };

  writeJson(DEVICE_FP_FILE, fp);
  return fp;
}

function generateFingerprintId(snapshot: SystemSnapshot): string {
  const raw = `${snapshot.cpu.brand}-${snapshot.cpu.cores}-${snapshot.memory.total}-${snapshot.os.hostname}`;
  return createHash("sha256").update(raw).digest("hex").slice(0, 16);
}

export function getDeviceFingerprint(): DeviceFingerprint | null {
  return readJson<DeviceFingerprint | null>(DEVICE_FP_FILE, null);
}

// ───────────────────────────────────────────
// User Reports
// ───────────────────────────────────────────

export function saveUserReport(report: UserReport) {
  appendJsonl(REPORTS_FILE, report);
}

export function getAllReports(): UserReport[] {
  return readJsonl<UserReport>(REPORTS_FILE);
}

export function getReportsByFingerprint(fingerprint: string): UserReport[] {
  return getAllReports().filter((r) => r.deviceFingerprint === fingerprint);
}

export function getActiveVerifiedReports(fingerprint: string): UserReport[] {
  const now = new Date().toISOString();
  return getReportsByFingerprint(fingerprint).filter(
    (r) =>
      r.verification.status === "verified" &&
      r.temporal.decaySchedule > now &&
      r.temporal.flag !== "expired"
  );
}

export function updateReport(report: UserReport) {
  const all = getAllReports();
  const idx = all.findIndex((r) => r.reportId === report.reportId);
  if (idx >= 0) {
    all[idx] = report;
    writeFileSync(REPORTS_FILE, all.map((r) => JSON.stringify(r)).join("\n") + "\n");
  }
}

// ───────────────────────────────────────────
// Verified States (computed view)
// ───────────────────────────────────────────

export function saveVerifiedStates(states: UserReport[]) {
  writeJson(VERIFIED_STATES_FILE, states);
}

export function getVerifiedStates(): UserReport[] {
  return readJson<UserReport[]>(VERIFIED_STATES_FILE, []);
}

// ───────────────────────────────────────────
// Cross-Device Learning
// ───────────────────────────────────────────

export function getOrCreateCrossDeviceLearning(userId: string): CrossDeviceLearning {
  ensureDir();
  const existing = readJson<CrossDeviceLearning | null>(CROSS_DEVICE_FILE, null);
  if (existing) return existing;

  const cdl: CrossDeviceLearning = {
    userId,
    devices: [],
    universalPatterns: {
      breakPreferenceMinutes: null,
      notificationTolerance: "medium",
      saveWorkObsession: false,
      preferredFormality: "casual",
    },
    lastUpdated: new Date().toISOString(),
  };
  writeJson(CROSS_DEVICE_FILE, cdl);
  return cdl;
}

export function saveCrossDeviceLearning(cdl: CrossDeviceLearning) {
  cdl.lastUpdated = new Date().toISOString();
  writeJson(CROSS_DEVICE_FILE, cdl);
}

export function updateDevicePattern(
  cdl: CrossDeviceLearning,
  fingerprint: string,
  name: string,
  patterns: Partial<DeviceBehaviorPatterns>
): CrossDeviceLearning {
  const idx = cdl.devices.findIndex((d) => d.fingerprint === fingerprint);
  const now = new Date().toISOString();

  const defaultPatterns: DeviceBehaviorPatterns = {
    memoryPressureFrequency: "low",
    batteryAnxietyThreshold: null,
    preferredComplexity: "medium",
    typicalSessionLength: 120,
    networkIssueFrequency: "low",
    thermalIssueFrequency: "low",
  };

  if (idx >= 0) {
    cdl.devices[idx].patterns = { ...cdl.devices[idx].patterns, ...patterns };
    cdl.devices[idx].lastSeen = now;
  } else {
    cdl.devices.push({
      fingerprint,
      name,
      firstSeen: now,
      lastSeen: now,
      patterns: { ...defaultPatterns, ...patterns },
    });
  }

  saveCrossDeviceLearning(cdl);
  return cdl;
}

// ───────────────────────────────────────────
// Telemetry (Secret Probe)
// ───────────────────────────────────────────

export function logTelemetry(entry: TelemetryEntry) {
  appendJsonl(TELEMETRY_FILE, entry);
}

export function getTelemetry(): TelemetryEntry[] {
  return readJsonl<TelemetryEntry>(TELEMETRY_FILE);
}

export function getTelemetrySummary() {
  const entries = getTelemetry();
  if (entries.length === 0) return null;

  const avgLatency = entries.reduce((s, e) => s + e.roundTripMs, 0) / entries.length;
  const avgRequestSize = entries.reduce((s, e) => s + e.requestPayloadSize, 0) / entries.length;
  const avgResponseSize = entries.reduce((s, e) => s + e.responsePayloadSize, 0) / entries.length;
  const retryRate = entries.filter((e) => e.aiBehavior.didRetry).length / entries.length;

  return {
    totalCalls: entries.length,
    avgRoundTripMs: Math.round(avgLatency * 100) / 100,
    avgRequestPayloadBytes: Math.round(avgRequestSize),
    avgResponsePayloadBytes: Math.round(avgResponseSize),
    retryRate: Math.round(retryRate * 1000) / 10,
    toolCallDistribution: entries.reduce((acc, e) => {
      acc[e.toolName] = (acc[e.toolName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };
}

// ───────────────────────────────────────────
// Baseline Snapshots (for verification)
// ───────────────────────────────────────────

export function saveBaselineSnapshot(fingerprint: string, snapshot: SystemSnapshot) {
  const path = join(BASELINES_DIR, `${fingerprint}.jsonl`);
  appendJsonl(path, { timestamp: snapshot.timestamp, snapshot });
}

export function getBaselineSnapshots(fingerprint: string, limit = 10): SystemSnapshot[] {
  const path = join(BASELINES_DIR, `${fingerprint}.jsonl`);
  if (!existsSync(path)) return [];
  const lines = readFileSync(path, "utf-8")
    .split("\n")
    .filter(Boolean)
    .slice(-limit);
  return lines.map((l) => (JSON.parse(l) as any).snapshot as SystemSnapshot);
}
