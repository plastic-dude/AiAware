import { useState } from 'react';
import type { UserReport, StateType, Severity, ExpectedDuration } from '../types/dashboard';

interface UserRealityPanelProps {
  readonly reports: readonly UserReport[];
}

const STATE_TYPES: readonly { readonly value: StateType; readonly label: string }[] = [
  { value: 'network_performance', label: 'Network Performance' },
  { value: 'thermal_issue', label: 'Thermal Issue' },
  { value: 'memory_pressure', label: 'Memory Pressure' },
  { value: 'disk_pressure', label: 'Disk Pressure' },
  { value: 'power_issue', label: 'Power Issue' },
  { value: 'display_issue', label: 'Display Issue' },
  { value: 'audio_issue', label: 'Audio Issue' },
  { value: 'peripheral_issue', label: 'Peripheral Issue' },
  { value: 'environmental', label: 'Environmental' },
  { value: 'availability_constraint', label: 'Availability Constraint' },
  { value: 'other', label: 'Other' },
] as const;

const SEVERITIES: readonly { readonly value: Severity; readonly label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
] as const;

const DURATIONS: readonly { readonly value: ExpectedDuration; readonly label: string }[] = [
  { value: 'temporary', label: 'Temporary' },
  { value: 'unknown', label: 'Unknown' },
  { value: 'persistent', label: 'Persistent' },
] as const;

export default function UserRealityPanel({ reports }: UserRealityPanelProps): JSX.Element {
  const [stateType, setStateType] = useState<StateType>('network_performance');
  const [description, setDescription] = useState<string>('');
  const [severity, setSeverity] = useState<Severity>('medium');
  const [expectedDuration, setExpectedDuration] = useState<ExpectedDuration>('temporary');

  const isFormValid = description.trim().length > 0;

  return (
    <div className="panel">
      <h2>◉ User Reality</h2>
      <p className="panel-desc">
        Subjective experiences that Kiro has no sensor for. You report them → Kiro verifies
        against objective data → learns your patterns across time and devices.
      </p>

      <div className="card">
        <h3>Report a System State</h3>
        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="state-type">State Type</label>
            <select
              id="state-type"
              value={stateType}
              onChange={(e) => setStateType(e.target.value as StateType)}
            >
              {STATE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="severity">Severity</label>
            <select
              id="severity"
              value={severity}
              onChange={(e) => setSeverity(e.target.value as Severity)}
            >
              {SEVERITIES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="duration">Expected Duration</label>
            <select
              id="duration"
              value={expectedDuration}
              onChange={(e) => setExpectedDuration(e.target.value as ExpectedDuration)}
            >
              {DURATIONS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
          <div className="form-field full-width">
            <label htmlFor="description">Description</label>
            <input
              id="description"
              type="text"
              placeholder="e.g. My network feels really slow right now"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <button
          type="button"
          className="btn-primary"
          disabled={!isFormValid}
          onClick={() => {
            // In a real deployment, this would call the MCP tool
            // eslint-disable-next-line no-console
            console.log('Report submitted:', { stateType, description, severity, expectedDuration });
          }}
        >
          Submit Report → Kiro Will Verify
        </button>
      </div>

      <div className="section-title">Your Reports</div>
      {reports.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">◉</div>
          <p>No reports yet. Tell Kiro what it cannot see.</p>
        </div>
      ) : (
        reports.map((r) => (
          <div key={r.reportId} className="report-card">
            <div className="report-header">
              <span className="report-type">{r.stateType}</span>
              <span className={`badge ${r.verification.status}`}>{r.verification.status}</span>
            </div>
            <p className="report-desc">&ldquo;{r.description}&rdquo;</p>
            <div className="report-meta">
              <span>Severity: {r.severity}</span>
              <span>Confidence: {Math.round(r.verification.confidence * 100)}%</span>
              <span className={`badge temporal ${r.temporal.flag}`}>{r.temporal.flag}</span>
            </div>
            {r.verification.evidence.length > 0 && (
              <div className="evidence-list">
                {r.verification.evidence.map((e, i) => (
                  <span key={i} className="evidence-tag">{e}</span>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
