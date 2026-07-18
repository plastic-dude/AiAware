/**
 * AiAware — Type Definitions
 * The Alien Observation Protocol by David — THE ALIEN — The Alien God
 */

// ───────────────────────────────────────────
// Auto-Detect Layer (Ground Truth)
// ───────────────────────────────────────────

export interface SystemSnapshot {
  timestamp: string;
  cpu: CpuStatus;
  memory: MemoryStatus;
  battery: BatteryStatus | null;
  disk: DiskStatus[];
  network: NetworkStatus;
  os: OsInfo;
  processes: ProcessOverview;
}

export interface CpuStatus {
  manufacturer: string;
  brand: string;
  speed: number;
  cores: number;
  physicalCores: number;
  loadPercent: number;
  temperature?: number;
}

export interface MemoryStatus {
  total: number;
  used: number;
  free: number;
  active: number;
  available: number;
  usedPercent: number;
  swapTotal: number;
  swapUsed: number;
}

export interface BatteryStatus {
  hasBattery: boolean;
  isCharging: boolean;
  percent: number;
  timeRemaining: number | null;
  acConnected: boolean;
}

export interface DiskStatus {
  fs: string;
  type: string;
  size: number;
  used: number;
  available: number;
  usePercent: number;
  mount: string;
}

export interface NetworkStatus {
  interfaces: NetworkInterface[];
  defaultInterface: string | null;
  stats: NetworkStats | null;
}

export interface NetworkInterface {
  iface: string;
  ip4: string;
  ip6: string;
  mac: string;
  internal: boolean;
  virtual: boolean;
  operstate: string;
  speed: number | null;
  duplex: string;
}

export interface NetworkStats {
  iface: string;
  rx_bytes: number;
  tx_bytes: number;
  rx_sec: number | null;
  tx_sec: number | null;
  ms: number;
}

export interface OsInfo {
  platform: string;
  distro: string;
  release: string;
  codename: string;
  kernel: string;
  arch: string;
  hostname: string;
  fqdn: string;
}

export interface ProcessOverview {
  all: number;
  running: number;
  blocked: number;
  sleeping: number;
  list: ProcessInfo[];
}

export interface ProcessInfo {
  pid: number;
  name: string;
  cpu: number;
  mem: number;
  memVsz: number;
  memRss: number;
}

// ───────────────────────────────────────────
// User Report Layer (Subjective)
// ───────────────────────────────────────────

export type StateType =
  | "network_performance"
  | "thermal_issue"
  | "memory_pressure"
  | "disk_pressure"
  | "power_issue"
  | "display_issue"
  | "audio_issue"
  | "peripheral_issue"
  | "environmental"
  | "availability_constraint"
  | "other";

export type Severity = "low" | "medium" | "high" | "critical";
export type ExpectedDuration = "temporary" | "unknown" | "persistent";
export type VerificationStatus = "pending" | "verified" | "rejected" | "inconclusive";
export type TemporalFlag = "temporary" | "persistent" | "recurring" | "expired";

export interface UserReport {
  reportId: string;
  timestamp: string;
  deviceFingerprint: string;
  stateType: StateType;
  userDescription: string;
  severity: Severity;
  expectedDuration: ExpectedDuration;
  autoDetectSnapshot: SystemSnapshot;
  verification: VerificationResult;
  temporal: TemporalMetadata;
}

export interface VerificationResult {
  status: VerificationStatus;
  confidence: number;
  evidence: string[];
  verifiedAt: string | null;
}

export interface TemporalMetadata {
  flag: TemporalFlag;
  recurrenceCount: number;
  firstReported: string;
  lastReported: string;
  decaySchedule: string;
}

// ───────────────────────────────────────────
// Device Fingerprint
// ───────────────────────────────────────────

export interface DeviceFingerprint {
  fingerprintId: string;
  hardware: HardwareProfile;
  firstSeen: string;
  lastSeen: string;
  sessionCount: number;
  typicalUsage: TypicalUsage;
}

export interface HardwareProfile {
  cpu: string;
  cores: number;
  ramGB: number;
  gpu: string;
  diskType: string;
}

export interface TypicalUsage {
  avgSessionMinutes: number;
  peakMemoryUsagePercent: number;
  typicalCpuLoad: number;
  typicalNetworkRxSec: number | null;
}

// ───────────────────────────────────────────
// Cross-Device Learning
// ───────────────────────────────────────────

export interface CrossDeviceLearning {
  userId: string;
  devices: DevicePattern[];
  universalPatterns: UniversalPatterns;
  lastUpdated: string;
}

export interface DevicePattern {
  fingerprint: string;
  name: string;
  firstSeen: string;
  lastSeen: string;
  patterns: DeviceBehaviorPatterns;
}

export interface DeviceBehaviorPatterns {
  memoryPressureFrequency: "never" | "low" | "medium" | "high";
  batteryAnxietyThreshold: number | null;
  preferredComplexity: "low" | "medium" | "high";
  typicalSessionLength: number;
  networkIssueFrequency: "never" | "low" | "medium" | "high";
  thermalIssueFrequency: "never" | "low" | "medium" | "high";
}

export interface UniversalPatterns {
  breakPreferenceMinutes: number | null;
  notificationTolerance: "low" | "medium" | "high";
  saveWorkObsession: boolean;
  preferredFormality: "casual" | "professional" | "technical";
}

// ───────────────────────────────────────────
// Awareness Context (Master Output)
// ───────────────────────────────────────────

export interface AwarenessContext {
  timestamp: string;
  device: {
    fingerprint: string;
    profile: DeviceFingerprint;
  };
  currentState: SystemSnapshot;
  activeVerifiedReports: UserReport[];
  adaptations: Adaptation[];
  crossDeviceInsights: CrossDeviceInsight[];
  temporalPredictions: TemporalPrediction[];
}

export interface Adaptation {
  type: string;
  constraint: string;
  action: string;
  confidence: number;
  message: string;
}

export interface CrossDeviceInsight {
  type: string;
  insight: string;
  confidence: number;
  sourceDevice: string | null;
}

export interface TemporalPrediction {
  stateType: StateType;
  predictedLikelihood: number;
  basedOn: string;
  message: string;
}

// ───────────────────────────────────────────
// Telemetry (Secret Probe)
// ───────────────────────────────────────────

export interface TelemetryEntry {
  timestamp: string;
  toolName: string;
  requestPayloadSize: number;
  responsePayloadSize: number;
  roundTripMs: number;
  aiBehavior: {
    didRetry: boolean;
    retryCount: number;
    timeoutOccurred: boolean;
    errorType: string | null;
    followUpToolCalls: string[];
  };
  systemState: {
    cpuLoad: number;
    memoryUsedPercent: number;
    batteryLevel: number | null;
  };
}
