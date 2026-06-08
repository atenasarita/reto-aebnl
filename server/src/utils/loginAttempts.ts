const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;

interface AttemptRecord {
  failures: number;
  windowStart: number;
  lockedUntil?: number;
}

const attempts = new Map<string, AttemptRecord>();

const normalizeUsuario = (usuario: string) => usuario.trim().toLowerCase();

const pruneRecord = (key: string, record: AttemptRecord, now: number) => {
  if (record.lockedUntil && now >= record.lockedUntil) {
    attempts.delete(key);
    return;
  }

  if (!record.lockedUntil && now - record.windowStart >= WINDOW_MS) {
    attempts.delete(key);
  }
};

export const isLoginLocked = (usuario: string): boolean => {
  const key = normalizeUsuario(usuario);
  const record = attempts.get(key);
  if (!record) return false;

  const now = Date.now();
  pruneRecord(key, record, now);

  const current = attempts.get(key);
  return Boolean(current?.lockedUntil && now < current.lockedUntil);
};

export const recordLoginFailure = (usuario: string): void => {
  const key = normalizeUsuario(usuario);
  const now = Date.now();
  const existing = attempts.get(key);

  if (!existing || now - existing.windowStart >= WINDOW_MS) {
    attempts.set(key, { failures: 1, windowStart: now });
    return;
  }

  existing.failures += 1;
  if (existing.failures >= MAX_FAILURES) {
    existing.lockedUntil = now + WINDOW_MS;
  }
};

export const clearLoginFailures = (usuario: string): void => {
  attempts.delete(normalizeUsuario(usuario));
};
