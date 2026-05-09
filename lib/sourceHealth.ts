/**
 * Source Health Monitor
 *
 * In-memory (server-side) health tracking per source.
 * Circuit breaker: skip source after 3 consecutive failures, retry after 5 min.
 * Tracks rolling average latency.
 */

import type { SourceId } from '../types/source.types';

interface SourceHealthState {
  consecutiveFailures: number;
  disabledUntil: number;
  /** Last 10 response times in ms */
  latencyWindow: number[];
  lastChecked: number;
  isHealthy: boolean;
}

// Global state (persists for the lifetime of the server process)
const health: Record<SourceId, SourceHealthState> = {
  komiku: { consecutiveFailures: 0, disabledUntil: 0, latencyWindow: [], lastChecked: 0, isHealthy: true },
  asura: { consecutiveFailures: 0, disabledUntil: 0, latencyWindow: [], lastChecked: 0, isHealthy: true },
  kiryuu: { consecutiveFailures: 0, disabledUntil: 0, latencyWindow: [], lastChecked: 0, isHealthy: true },
  mangamint: { consecutiveFailures: 0, disabledUntil: 0, latencyWindow: [], lastChecked: 0, isHealthy: true },
};

const MAX_FAILURES = 3;
const RETRY_AFTER_MS = 5 * 60 * 1000; // 5 min
const LATENCY_WINDOW_SIZE = 10;

// ─── Public API ───────────────────────────────────────────────────────────────

export function isSourceHealthy(sourceId: SourceId): boolean {
  const h = health[sourceId];
  if (Date.now() < h.disabledUntil) return false;
  if (h.disabledUntil > 0 && Date.now() >= h.disabledUntil) {
    // Auto-reset after retry window
    h.consecutiveFailures = 0;
    h.disabledUntil = 0;
    h.isHealthy = true;
  }
  return h.isHealthy;
}

export function recordSourceSuccess(sourceId: SourceId, latencyMs: number) {
  const h = health[sourceId];
  h.consecutiveFailures = 0;
  h.disabledUntil = 0;
  h.isHealthy = true;
  h.lastChecked = Date.now();
  h.latencyWindow = [...h.latencyWindow.slice(-(LATENCY_WINDOW_SIZE - 1)), latencyMs];
}

export function recordSourceFailure(sourceId: SourceId) {
  const h = health[sourceId];
  h.consecutiveFailures++;
  h.lastChecked = Date.now();

  if (h.consecutiveFailures >= MAX_FAILURES) {
    h.disabledUntil = Date.now() + RETRY_AFTER_MS;
    h.isHealthy = false;
    console.warn(
      `[SourceHealth] ${sourceId} circuit opened after ${h.consecutiveFailures} failures. ` +
      `Retry at ${new Date(h.disabledUntil).toISOString()}`
    );
  }
}

export function getAvgLatency(sourceId: SourceId): number {
  const { latencyWindow } = health[sourceId];
  if (!latencyWindow.length) return 0;
  return Math.round(latencyWindow.reduce((a, b) => a + b, 0) / latencyWindow.length);
}

export function getHealthSnapshot(): Record<SourceId, {
  isHealthy: boolean;
  consecutiveFailures: number;
  avgLatencyMs: number;
  disabledUntil: string | null;
}> {
  return (Object.keys(health) as SourceId[]).reduce((acc, id) => {
    const h = health[id];
    acc[id] = {
      isHealthy: isSourceHealthy(id),
      consecutiveFailures: h.consecutiveFailures,
      avgLatencyMs: getAvgLatency(id),
      disabledUntil: h.disabledUntil > 0 ? new Date(h.disabledUntil).toISOString() : null,
    };
    return acc;
  }, {} as ReturnType<typeof getHealthSnapshot>);
}
