const FIRST_VISIT_KEY = "cat_feeder_first_visit";
const LAST_FEED_KEY = "cat_feeder_last_feed";
const LAST_PLATE_CLEAN_KEY = "cat_feeder_last_plate_clean";

export const FIRST_VISIT_COOLDOWN_MS = 60_000;
export const LAST_FEED_COOLDOWN_MS = 5 * 60_000;
export const PLATE_CLEAN_COOLDOWN_MS = 40 * 60_000;

export type CooldownKind = "first_visit" | "last_feed";

export type CooldownState = {
  remainingMs: number;
  kind: CooldownKind | null;
};

function readTimestamp(key: string) {
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;

  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) return null;
  return value;
}

export function ensureFirstVisitTimestamp(now = Date.now()) {
  const existing = readTimestamp(FIRST_VISIT_KEY);
  if (existing) return existing;

  window.localStorage.setItem(FIRST_VISIT_KEY, String(now));
  return now;
}

export function saveLastFeedTimestamp(now = Date.now()) {
  window.localStorage.setItem(LAST_FEED_KEY, String(now));
}

export function getCooldownState(now = Date.now()): CooldownState {
  const lastFeed = readTimestamp(LAST_FEED_KEY);
  if (lastFeed) {
    const remainingMs = Math.max(0, lastFeed + LAST_FEED_COOLDOWN_MS - now);
    return {
      remainingMs,
      kind: remainingMs > 0 ? "last_feed" : null,
    };
  }

  const firstVisit = ensureFirstVisitTimestamp(now);
  const remainingMs = Math.max(0, firstVisit + FIRST_VISIT_COOLDOWN_MS - now);
  return {
    remainingMs,
    kind: remainingMs > 0 ? "first_visit" : null,
  };
}

export function formatCountdown(remainingMs: number) {
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function cooldownMessage(state: CooldownState) {
  if (state.remainingMs <= 0 || !state.kind) return null;

  const time = formatCountdown(state.remainingMs);
  if (state.kind === "first_visit") {
    return `Podrás alimentar al gato en ${time}`;
  }

  return `Próxima alimentación disponible en ${time}`;
}

export function saveLastPlateCleanTimestamp(now = Date.now()) {
  window.localStorage.setItem(LAST_PLATE_CLEAN_KEY, String(now));
}

export function getPlateCleanRemainingMs(now = Date.now()) {
  const lastClean = readTimestamp(LAST_PLATE_CLEAN_KEY);
  if (!lastClean) return 0;
  return Math.max(0, lastClean + PLATE_CLEAN_COOLDOWN_MS - now);
}

export function plateCleanCooldownMessage(remainingMs: number) {
  if (remainingMs <= 0) return null;
  return `Próxima limpieza en ${formatCountdown(remainingMs)}`;
}
