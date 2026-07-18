/**
 * 登入節流:同一來源連錯 MAX_FAILS 次,鎖定 LOCK_MS。
 * 存在記憶體中——serverless 環境下每個執行個體各自計數、冷啟動會歸零,
 * 屬於盡力而為的保護;Phase 3 接上 Redis 後可改為集中式計數。
 */
type Entry = { fails: number; lockedUntil: number };

const globalStore = globalThis as unknown as { __venewsLoginThrottle?: Map<string, Entry> };
const store: Map<string, Entry> = (globalStore.__venewsLoginThrottle ??= new Map());

const MAX_FAILS = 5;
const LOCK_MS = 5 * 60 * 1000;

function prune(now: number) {
  if (store.size < 1000) return;
  for (const [key, entry] of store) {
    if (entry.lockedUntil < now && entry.fails === 0) store.delete(key);
  }
}

export function isLocked(key: string): boolean {
  const entry = store.get(key);
  if (!entry) return false;
  if (entry.lockedUntil > Date.now()) return true;
  if (entry.lockedUntil !== 0) store.set(key, { fails: 0, lockedUntil: 0 });
  return false;
}

export function recordFailure(key: string): void {
  const now = Date.now();
  prune(now);
  const entry = store.get(key) ?? { fails: 0, lockedUntil: 0 };
  entry.fails += 1;
  if (entry.fails >= MAX_FAILS) {
    entry.fails = 0;
    entry.lockedUntil = now + LOCK_MS;
  }
  store.set(key, entry);
}

export function clearFailures(key: string): void {
  store.delete(key);
}
