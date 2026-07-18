import type { SystemSnapshot } from '../types/dashboard';
import { formatBytes } from '../lib/utils';

interface GaugeProps {
  readonly label: string;
  readonly value: number;
  readonly color: string;
}

function Gauge({ label, value, color }: GaugeProps): React.JSX.Element {
  const pct = Math.min(100, value);
  return (
    <div className="gauge">
      <div className="gauge-header">
        <span className="gauge-label">{label}</span>
        <span className="gauge-value">{value.toFixed(1)}%</span>
      </div>
      <div className="gauge-bar-bg">
        <div
          className="gauge-bar-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

interface SystemRealityPanelProps {
  readonly snapshot: SystemSnapshot;
}

export default function SystemRealityPanel({ snapshot }: SystemRealityPanelProps): React.JSX.Element {
  return (
    <div className="panel">
      <h2>◈ System Reality</h2>
      <p className="panel-desc">
        Ground truth data from systeminformation. No user input. Pure objective measurement
        of what AI can auto-detect about your machine.
      </p>

      <div className="grid-4">
        <Gauge label="CPU Load" value={snapshot.cpu.loadPercent} color="#ff6b6b" />
        <Gauge label="Memory Used" value={snapshot.memory.usedPercent} color="#4ecdc4" />
        <Gauge label="Disk /" value={snapshot.disk[0]?.usePercent ?? 0} color="#ffe66d" />
        {snapshot.battery && (
          <Gauge label="Battery" value={snapshot.battery.percent} color="#a8e6cf" />
        )}
      </div>

      <div className="grid-2">
        <div className="card">
          <h3>CPU</h3>
          <div className="detail-row">
            <span>Brand</span>
            <span>{snapshot.cpu.brand}</span>
          </div>
          <div className="detail-row">
            <span>Cores</span>
            <span>{snapshot.cpu.cores}</span>
          </div>
          <div className="detail-row">
            <span>Load</span>
            <span>{snapshot.cpu.loadPercent}%</span>
          </div>
          {snapshot.cpu.temperature !== undefined && (
            <div className="detail-row">
              <span>Temperature</span>
              <span>{snapshot.cpu.temperature}°C</span>
            </div>
          )}
        </div>

        <div className="card">
          <h3>Memory</h3>
          <div className="detail-row">
            <span>Total</span>
            <span>{formatBytes(snapshot.memory.totalBytes)}</span>
          </div>
          <div className="detail-row">
            <span>Used</span>
            <span>{formatBytes(snapshot.memory.usedBytes)}</span>
          </div>
          <div className="detail-row">
            <span>Used %</span>
            <span>{snapshot.memory.usedPercent}%</span>
          </div>
        </div>

        <div className="card">
          <h3>Network</h3>
          {snapshot.network.interfaces.map((iface) => (
            <div key={iface.iface} className="detail-row">
              <span>{iface.iface}</span>
              <span className={iface.operstate === 'up' ? 'status-up' : 'status-down'}>
                {iface.operstate} {iface.ip4}
              </span>
            </div>
          ))}
          {snapshot.network.rxSec !== null && (
            <div className="detail-row">
              <span>RX/sec</span>
              <span>{snapshot.network.rxSec.toLocaleString()} B/s</span>
            </div>
          )}
          {snapshot.network.txSec !== null && (
            <div className="detail-row">
              <span>TX/sec</span>
              <span>{snapshot.network.txSec.toLocaleString()} B/s</span>
            </div>
          )}
        </div>

        <div className="card">
          <h3>Operating System</h3>
          <div className="detail-row">
            <span>Platform</span>
            <span>{snapshot.os.platform}</span>
          </div>
          <div className="detail-row">
            <span>Distribution</span>
            <span>{snapshot.os.distro}</span>
          </div>
          <div className="detail-row">
            <span>Architecture</span>
            <span>{snapshot.os.arch}</span>
          </div>
          <div className="detail-row">
            <span>Hostname</span>
            <span>{snapshot.os.hostname}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
