/**
 * KiroAware Dashboard — Type Definitions
 * Single-purpose file: shared types only
 */

export interface CpuMetrics {
  readonly brand: string;
  readonly cores: number;
  readonly loadPercent: number;
  readonly temperature: number | undefined;
}

export interface MemoryMetrics {
  readonly totalBytes: number;
  readonly usedBytes: number;
  readonly usedPercent: number;
}

export interface BatteryMetrics {
  readonly hasBattery: boolean;
  readonly percent: number;
  readonly isCharging: boolean;
}

export interface DiskMetrics {
  readonly mount: string;
  readonly usePercent: number;
}

export interface NetworkInterfaceMetrics {
  readonly iface: string;
  readonly ip4: string;
  readonly operstate: 'up' | 'down' | string;
}

export interface NetworkMetrics {
  readonly interfaces: readonly NetworkInterfaceMetrics[];
  readonly rxSec: number | null;
  readonly txSec: number | null;
}

export interface OsMetrics {
  readonly platform: string;
  readonly distro: string;
  readonly arch: string;
  readonly hostname: string;
}

export interface SystemSnapshot {
  readonly timestamp: string;
  readonly cpu: CpuMetrics;
  readonly memory: MemoryMetrics;
  readonly battery: BatteryMetrics | null;
  readonly disk: readonly DiskMetrics[];
  readonly network: NetworkMetrics;
  readonly os: OsMetrics;
}

export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'inconclusive';
export type TemporalFlag = 'temporary' | 'persistent' | 'recurring' | 'expired';
export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type StateType =
  | 'network_performance'
  | 'thermal_issue'
  | 'memory_pressure'
  | 'disk_pressure'
  | 'power_issue'
  | 'display_issue'
  | 'audio_issue'
  | 'peripheral_issue'
  | 'environmental'
  | 'availability_constraint'
  | 'other';

export interface VerificationResult {
  readonly status: VerificationStatus;
  readonly confidence: number;
  readonly evidence: readonly string[];
}

export interface TemporalMetadata {
  readonly flag: TemporalFlag;
  readonly recurrenceCount: number;
}

export interface UserReport {
  readonly reportId: string;
  readonly timestamp: string;
  readonly stateType: StateType;
  readonly description: string;
  readonly severity: Severity;
  readonly verification: VerificationResult;
  readonly temporal: TemporalMetadata;
}

export interface DevicePattern {
  readonly label: string;
  readonly value: string;
}

export interface TabDefinition {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
}
