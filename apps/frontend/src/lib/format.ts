/**
 * Lightweight formatting utilities — no external date library needed.
 */

/**
 * Format a duration in milliseconds to a human-readable string.
 * e.g. 142 → "142 ms"  |  3210 → "3.21 s"
 */
export function formatDuration(ms: number | null | undefined): string {
  if (ms == null) return '—';
  if (ms < 1_000) return `${ms} ms`;
  return `${(ms / 1_000).toFixed(2)} s`;
}

/**
 * Format an ISO timestamp to a relative "time ago" string.
 * Falls back to locale date string for anything older than 24 h.
 */
export function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const seconds = Math.floor(diff / 1_000);

  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  return new Date(iso).toLocaleDateString();
}

/**
 * Format an ISO timestamp to a full locale datetime string for tooltips.
 */
export function formatFull(iso: string): string {
  return new Date(iso).toLocaleString();
}
