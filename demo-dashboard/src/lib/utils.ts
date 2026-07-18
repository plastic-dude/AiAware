/**
 * AiAware Dashboard — Utility Functions
 */

export function formatBytes(bytes: number): string {
  const gb = bytes / 1024 / 1024 / 1024;
  return `${gb.toFixed(1)} GB`;
}
